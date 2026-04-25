import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const ARDUINO_MOCK = String(process.env.ARDUINO_MOCK || "true").toLowerCase() === "true";
const SOIL_WET_RAW = 350;
const SOIL_DRY_RAW = 800;

app.use(cors());
app.use(express.json());

let latestArduinoReading = null;
let latestArduinoRawLine = null;
let arduinoConnected = false;
let arduinoError = null;

let mockStateIndex = 0;
let mockCounter = 0;
const mockStates = ["normal", "dry", "critical-dry"];

let cachedWeather = null;
let cachedWeatherTime = 0;
const WEATHER_CACHE_MS = 10 * 60 * 1000;

const runtimeLogs = [];
const SENSOR_LOG_THROTTLE = 5;
let mockSensorLogCounter = 0;
let realSensorLogCounter = 0;

function addLog(level, message, source = "backend") {
  runtimeLogs.unshift({
    timestamp: new Date().toLocaleTimeString("en-GB"),
    level,
    message,
    source,
  });
  if (runtimeLogs.length > 100) runtimeLogs.pop();
}

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

function computeSoilMoistureFromRaw(soilRaw) {
  const value = ((SOIL_DRY_RAW - Number(soilRaw)) / (SOIL_DRY_RAW - SOIL_WET_RAW)) * 100;
  return Math.round(clamp(value, 0, 100));
}

function getSoilStatus(soilMoisture) {
  if (soilMoisture < 20) return "CRITICAL_DRY";
  if (soilMoisture < 30) return "DRY";
  if (soilMoisture > 75) return "WATERLOGGED";
  return "NORMAL";
}

function normalizeArduinoReading(raw, source = "ARDUINO") {
  const temperature = Number(raw?.temperature ?? raw?.temp ?? 0);
  const humidity = Number(raw?.humidity ?? raw?.rh ?? 0);
  const soilRaw = Number(raw?.soilRaw ?? raw?.soil_raw ?? raw?.waterLevel ?? SOIL_DRY_RAW);
  const soilMoisture = Number.isFinite(Number(raw?.soilMoisture))
    ? Math.round(Number(raw.soilMoisture))
    : computeSoilMoistureFromRaw(soilRaw);
  const irrigation = String(raw?.irrigation ?? raw?.pump ?? "OFF").toUpperCase() === "ON" ? "ON" : "OFF";

  return {
    temperature: Math.round(temperature * 10) / 10,
    humidity: Math.round(humidity),
    soilRaw: Math.round(soilRaw),
    soilMoisture,
    soilStatus: raw?.soilStatus || getSoilStatus(soilMoisture),
    irrigation,
    source,
    receivedAt: new Date().toISOString(),
  };
}

function generateMockArduinoReading() {
  mockCounter += 1;
  if (mockCounter % 8 === 0) {
    mockStateIndex = (mockStateIndex + 1) % mockStates.length;
  }

  const state = mockStates[mockStateIndex];
  let payload;

  if (state === "normal") {
    payload = {
      temperature: 23 + Math.random() * 2,
      humidity: 64 + Math.random() * 6,
      soilRaw: 540 + Math.random() * 80,
      irrigation: "OFF",
    };
  } else if (state === "dry") {
    payload = {
      temperature: 27 + Math.random() * 3,
      humidity: 52 + Math.random() * 6,
      soilRaw: 690 + Math.random() * 45,
      irrigation: "ON",
    };
  } else {
    payload = {
      temperature: 30 + Math.random() * 3,
      humidity: 42 + Math.random() * 6,
      soilRaw: 760 + Math.random() * 30,
      irrigation: "ON",
    };
  }

  return normalizeArduinoReading(payload, "MOCK_ARDUINO");
}

function startArduinoSerial() {
  if (ARDUINO_MOCK) return;

  const portName = process.env.ARDUINO_PORT;
  const baudRate = Number(process.env.ARDUINO_BAUD || 9600);
  if (!portName) {
    arduinoError = "ARDUINO_PORT is not configured";
    return;
  }

  try {
    const port = new SerialPort({ path: portName, baudRate, autoOpen: true });
    const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

    port.on("open", () => {
      arduinoConnected = true;
      arduinoError = null;
      console.log(`Arduino connected on ${portName} @ ${baudRate}`);
      addLog("OK", `Arduino connected on ${portName} @ ${baudRate}`, "arduino-serial");
    });

    parser.on("data", (line) => {
      const cleanLine = String(line || "").trim();
      latestArduinoRawLine = cleanLine;
      if (!cleanLine) return;

      try {
        const parsed = JSON.parse(cleanLine);
        latestArduinoReading = normalizeArduinoReading(parsed, "REAL_ARDUINO");
        arduinoError = null;
        realSensorLogCounter += 1;
        if (realSensorLogCounter % SENSOR_LOG_THROTTLE === 1) {
          const r = latestArduinoReading;
          addLog(
            "SENSOR",
            `Real Arduino reading received: temp ${r.temperature}°C, humidity ${r.humidity}%, soil ${r.soilMoisture}% (${r.soilStatus})`,
            "arduino-serial"
          );
        }
      } catch (error) {
        arduinoError = `Invalid Arduino JSON line: ${cleanLine}`;
        addLog("ERROR", arduinoError, "arduino-serial");
      }
    });

    port.on("close", () => {
      arduinoConnected = false;
      arduinoError = "Serial port closed";
      addLog("WARN", "Arduino serial port closed", "arduino-serial");
    });

    port.on("error", (error) => {
      arduinoConnected = false;
      arduinoError = error?.message || "Unknown serial error";
      addLog("ERROR", arduinoError, "arduino-serial");
    });
  } catch (error) {
    arduinoConnected = false;
    arduinoError = error?.message || "Failed to initialize serial port";
    addLog("ERROR", arduinoError, "arduino-serial");
  }
}

async function getOpenWeather({ lat, lon, city } = {}) {
  if (!process.env.OPENWEATHER_API_KEY) return null;

  const now = Date.now();
  if (cachedWeather && now - cachedWeatherTime < WEATHER_CACHE_MS) {
    return cachedWeather;
  }

  const finalLat = lat || process.env.DEFAULT_LAT || "3.1390";
  const finalLon = lon || process.env.DEFAULT_LON || "101.6869";
  const finalCity = city || process.env.DEFAULT_CITY || "Kuala Lumpur";

  const url =
    `https://api.openweathermap.org/data/2.5/weather` +
    `?lat=${encodeURIComponent(finalLat)}` +
    `&lon=${encodeURIComponent(finalLon)}` +
    `&appid=${process.env.OPENWEATHER_API_KEY}` +
    `&units=metric`;

  const response = await fetch(url);
  if (!response.ok) return null;

  const raw = await response.json();
  const weatherData = {
    city: raw.name || finalCity,
    country: raw.sys?.country || "",
    temperature: raw.main?.temp ?? null,
    feelsLike: raw.main?.feels_like ?? null,
    humidity: raw.main?.humidity ?? null,
    condition: raw.weather?.[0]?.main || "Unknown",
    description: raw.weather?.[0]?.description || "",
    windSpeed: raw.wind?.speed ?? null,
    cloudiness: raw.clouds?.all ?? null,
    rainLastHour: raw.rain?.["1h"] || 0,
    timestamp: new Date().toISOString(),
  };

  cachedWeather = weatherData;
  cachedWeatherTime = now;
  console.log("OpenWeather fetched:", weatherData);
  addLog(
    "INFO",
    `OpenWeather fetched for ${weatherData.city}: ${weatherData.temperature}°C, ${weatherData.condition}`,
    "openweather"
  );
  return weatherData;
}

function fallbackInsight(weather = null) {
  return {
    recommendation: {
      title: "Short-Cycle Irrigation Recommended",
      action: "Start irrigation for a short duration and re-check soil moisture.",
      secondary: "Avoid full watering to prevent waste and root stress.",
      priority: "medium",
      priorityLabel: "PRIORITY: MEDIUM",
      confidence: 86,
    },
    explanation: {
      text: "Sensor and weather context indicate moderate plant stress risk. Controlled irrigation and monitoring are recommended to stabilize growth conditions.",
      factors: ["Soil Moisture", "Temperature", "Humidity", "Weather Condition", "Irrigation State"],
    },
    impact: {
      waterSavedPercent: 24,
      fertilizerReductionPercent: 14,
      yieldImprovementPercent: 9,
      riskReduction: "medium",
    },
    weather,
  };
}

function extractJsonFromText(text) {
  const cleaned = String(text || "").replace(/```json/gi, "").replace(/```/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON block found");
  return JSON.parse(match[0]);
}

function getResponseText(result) {
  if (!result) return "";
  if (typeof result === "string") return result;
  if (typeof result.text === "string") return result.text;
  if (typeof result.text === "function") return result.text();
  if (typeof result.outputText === "string") return result.outputText;
  return "";
}

startArduinoSerial();

app.get("/api/health", (_req, res) => {
  res.json({
    status: "Backend online",
    geminiKeyLoaded: Boolean(process.env.GEMINI_API_KEY),
    openWeatherKeyLoaded: Boolean(process.env.OPENWEATHER_API_KEY),
    arduinoMock: ARDUINO_MOCK,
  });
});

app.get("/api/sensor-data", (_req, res) => {
  let latest = null;
  if (ARDUINO_MOCK) {
    latest = generateMockArduinoReading();
    mockSensorLogCounter += 1;
    if (mockSensorLogCounter % SENSOR_LOG_THROTTLE === 1) {
      addLog(
        "SENSOR",
        `Mock Arduino reading served: temp ${latest.temperature}°C, humidity ${latest.humidity}%, soil ${latest.soilMoisture}% (${latest.soilStatus})`,
        "mock-arduino"
      );
    }
  } else if (latestArduinoReading) {
    latest = latestArduinoReading;
  }

  if (!latest) {
    latest = normalizeArduinoReading({}, ARDUINO_MOCK ? "MOCK_ARDUINO" : "REAL_ARDUINO");
  }

  res.json({
    connected: ARDUINO_MOCK ? true : arduinoConnected,
    mock: ARDUINO_MOCK,
    latest,
    rawLine: latestArduinoRawLine,
    error: arduinoError,
  });
});

app.get("/api/logs", (_req, res) => {
  res.json({ logs: runtimeLogs });
});

app.get("/api/weather", async (req, res) => {
  try {
    const weather = await getOpenWeather({
      lat: req.query.lat,
      lon: req.query.lon,
      city: req.query.city,
    });
    if (!weather) {
      addLog("ERROR", "Weather data unavailable. Check OPENWEATHER_API_KEY.", "openweather");
      return res.status(500).json({ error: "Weather data unavailable. Check OPENWEATHER_API_KEY." });
    }
    return res.json(weather);
  } catch (error) {
    addLog("ERROR", `Failed to fetch weather data: ${error?.message || "unknown"}`, "openweather");
    return res.status(500).json({ error: "Failed to fetch weather data." });
  }
});

app.post("/api/ai-insight", async (req, res) => {
  try {
    const { scenarioName = "unknown", sensorData = {}, weatherLocation = {} } = req.body || {};
    const weather = await getOpenWeather(weatherLocation);
    console.log("Weather passed to Gemini:", weather);

    if (!ai || !process.env.GEMINI_API_KEY) {
      addLog("WARN", `Gemini key missing. fallbackInsight used for scenario: ${scenarioName}`, "gemini");
      return res.json(fallbackInsight(weather));
    }

    const prompt = `
You are an AI decision engine for a precision agriculture dashboard.
Return ONLY valid JSON with this exact shape:
{
  "recommendation": {
    "title": "",
    "action": "",
    "secondary": "",
    "priority": "low | medium | high",
    "priorityLabel": "PRIORITY: LOW | PRIORITY: MEDIUM | PRIORITY: HIGH",
    "confidence": 0
  },
  "explanation": {
    "text": "",
    "factors": ["", "", "", "", ""]
  },
  "impact": {
    "waterSavedPercent": 0,
    "fertilizerReductionPercent": 0,
    "yieldImprovementPercent": 0,
    "riskReduction": "low | medium | high"
  }
}

Scenario: ${scenarioName}
Sensor data: ${JSON.stringify(sensorData)}
Weather context: ${JSON.stringify(weather)}
`;

    try {
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = await getResponseText(result);
      const parsed = extractJsonFromText(text);
      addLog("AI", `Gemini AI insight generated for scenario: ${scenarioName}`, "gemini");
      return res.json({ ...parsed, weather });
    } catch (error) {
      addLog("WARN", `Gemini failed or returned invalid JSON. fallbackInsight used. (${error?.message || "unknown"})`, "gemini");
      return res.json(fallbackInsight(weather));
    }
  } catch (error) {
    addLog("ERROR", `ai-insight handler error: ${error?.message || "unknown"}`, "backend");
    return res.json(fallbackInsight(null));
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  addLog("INFO", `Backend server started on port ${PORT}`, "server");
  addLog(
    "INFO",
    ARDUINO_MOCK ? "Arduino mode: MOCK" : `Arduino mode: REAL (port ${process.env.ARDUINO_PORT || "unset"})`,
    "server"
  );
});