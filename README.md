# AgriMind · Precision Agriculture AI Dashboard

> Built for **UMHackathon 2026**

---

## 🎥 Pitch Video (UMHackathon 2026)

> ### ▶️ **[Watch the AgriMind Pitch Video on Google Drive](https://drive.google.com/file/d/1wgbQi5LuKKTX2dGxpongu33BheLMkSU6/view?usp=drive_link)**
>
> **Link:** https://drive.google.com/file/d/1wgbQi5LuKKTX2dGxpongu33BheLMkSU6/view?usp=drive_link

This is the official recorded pitch video for our UMHackathon 2026 submission. Please click the link above to view it on Google Drive.

---

## About AgriMind

AgriMind is an AI-powered decision intelligence dashboard for urban vertical farming. It combines real-time sensor monitoring, weather context, and Google Gemini–based recommendations to help operators make smarter irrigation and fertilization decisions.

---

## Features

- **Live sensor monitoring** — temperature, humidity, soil moisture, and irrigation state streamed from an Arduino (or a built-in mock generator).
- **AI recommendations** — Google Gemini analyzes sensor + weather context and returns structured, prioritized actions with confidence scores.
- **Weather integration** — OpenWeather data is cached and fed into the AI for context-aware advice.
- **Scenario Lab** — explore preset farm states (Optimal, Under-watered, Over-irrigation, Over-fertilized).
- **Business impact view** — projected water/fertilizer savings and yield improvements.
- **Runtime logs** — backend keeps a rolling buffer of system, sensor, and AI events.
- **Synthetic data pipeline** — Python scripts to generate and preprocess training-ready farm datasets.

---

## Project Structure

```
UMHACK/
├── frontend/
│   ├── index.html          # Dashboard UI
│   ├── script.js           # Frontend logic
│   ├── style.css           # Styles
│   └── backend/
│       ├── server.js       # Express API (sensors, weather, AI, logs)
│       ├── package.json
│       └── .env            # API keys + config (not committed)
├── data_pipeline/
│   ├── farm_thingy.py          # Generates synthetic sensor data
│   └── data_preprocessor.py    # Cleans + normalizes data for ML
├── package.json
└── README.md
```

---

## Tech Stack

| Layer        | Tools                                                                  |
| ------------ | ---------------------------------------------------------------------- |
| Frontend     | HTML, CSS, vanilla JavaScript, Poppins/Inter fonts                     |
| Backend      | Node.js, Express 5, CORS, dotenv                                       |
| AI           | Google Gemini (`@google/genai`, model `gemini-2.5-flash`)              |
| Weather      | OpenWeather Current Weather API                                        |
| Hardware I/O | `serialport` + `@serialport/parser-readline` (Arduino over USB serial) |
| Data         | Python, NumPy, pandas, scikit-learn (`MinMaxScaler`)                   |

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (for the backend)
- **Python** 3.9+ (only if you want to run the data pipeline)
- A **Google Gemini API key** — [get one here](https://aistudio.google.com/app/apikey)
- An **OpenWeather API key** — [get one here](https://openweathermap.org/api)
- *(Optional)* An Arduino on a known COM/serial port emitting JSON lines

### 1. Clone and install

```bash
git clone https://github.com/WKLeng/UMHACK.git
cd UMHACK/frontend/backend
npm install
```

### 2. Configure environment

Create `frontend/backend/.env`:

```env
GEMINI_API_KEY=your_gemini_key_here
OPENWEATHER_API_KEY=your_openweather_key_here
PORT=3000

# Set to "false" to use a real Arduino over serial
# Set to your own port for the arduino if you have one
ARDUINO_MOCK=true
ARDUINO_PORT=COM7
ARDUINO_BAUD=9600

# Default location used by the weather endpoint
DEFAULT_LAT=3.1390
DEFAULT_LON=101.6869
DEFAULT_CITY=Kuala Lumpur
```

### 3. Start the backend

```bash
npm start
```

Backend will be running at `http://localhost:3000`.

### 4. Open the frontend

Open `frontend/index.html` directly in your browser, or serve the `frontend/` folder with any static file server (e.g. `npx serve frontend`).

---

## API Reference

All endpoints are served from the Express backend at `http://localhost:3000`.

| Method | Endpoint           | Description                                                          |
| ------ | ------------------ | -------------------------------------------------------------------- |
| `GET`  | `/api/health`      | Health check, reports which API keys are loaded and Arduino mode.    |
| `GET`  | `/api/sensor-data` | Latest Arduino reading (real or mock), normalized to a common shape. |
| `GET`  | `/api/weather`     | Current weather for `?lat=&lon=&city=` (or env defaults). Cached.    |
| `GET`  | `/api/logs`        | Rolling buffer of backend/sensor/AI logs (most recent first).        |
| `POST` | `/api/ai-insight`  | Generates an AI recommendation from `{ scenarioName, sensorData, weatherLocation }`. Falls back to a static insight if Gemini is unavailable. |

### Arduino JSON format

When `ARDUINO_MOCK=false`, the backend reads newline-delimited JSON from the configured serial port. Expected fields:

```json
{
  "temperature": 24.5,
  "humidity": 62,
  "soilRaw": 540,
  "irrigation": "OFF"
}
```

`soilRaw` is converted to a 0–100% moisture value using the calibration constants `SOIL_WET_RAW=350` and `SOIL_DRY_RAW=800` in `server.js`.

---

## Data Pipeline

The Python scripts in `data_pipeline/` create synthetic, scenario-labeled farm data for training/experimentation.

```bash
cd data_pipeline
pip install numpy pandas scikit-learn

python farm_thingy.py          # → farm_thingy_data.csv
python data_preprocessor.py    # → ai_ready_farm_data.csv (cleaned + normalized)
```

`farm_thingy.py` generates four scenarios (Optimal, Under-watered, Over-irrigation, Over-fertilized). `data_preprocessor.py` simulates sensor failures, interpolates missing values, and min-max scales the numeric columns.

---

## Configuration Notes

- The backend caches OpenWeather responses for 10 minutes to stay under free-tier quotas.
- Sensor logs are throttled (1 in every 5 readings) to keep the log buffer readable.
- If `GEMINI_API_KEY` is missing or Gemini returns invalid JSON, `/api/ai-insight` returns a sensible fallback recommendation so the dashboard always renders.

---

## Security

- **Never commit `.env`.** It's already listed in `.gitignore` (`frontend/backend/.env`). If you accidentally pushed real keys, rotate them immediately.
- API keys in this project should be treated as secrets and stored only in environment variables.

---

## License

ISC — see `package.json`.
