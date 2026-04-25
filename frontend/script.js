/* ═══════════════════════════════════════════
   Scenario Data Store
═══════════════════════════════════════════ */
const SCENARIOS = {
  'normal': {
    label: 'Normal Condition', zoneStatus: 'Stable', zoneBadgeClass: 'ok',
    sensors: {
      temperature:  { value:22,    unit:'°C',    name:'Temperature',    range:'18–26',     status:'ok',     trend:'stable', pct:56 },
      humidity:     { value:65,    unit:'%',     name:'Humidity',       range:'60–80',     status:'ok',     trend:'stable', pct:65 },
      light:        { value:800,   unit:'μmol',  name:'Light Intensity',range:'600–1000',  status:'ok',     trend:'stable', pct:70 },
      soilMoisture: { value:35,    unit:'%',     name:'Soil Moisture',  range:'30–60',     status:'ok',     trend:'stable', pct:35 },
      ph:           { value:6.2,   unit:'',      name:'pH Level',       range:'5.5–7.0',   status:'ok',     trend:'stable', pct:58 },
      ec:           { value:1.8,   unit:'mS/cm', name:'EC Level',       range:'1.5–2.5',   status:'ok',     trend:'stable', pct:52 },
      npk:          { N:120, P:45, K:180,         name:'NPK Nutrients',  status:'ok' },
    },
    recommendation: { title:'Maintain Current Parameters', action:'Check nutrient levels in 4 hours', secondary:'Monitor next 12-hour growth cycle for consistency', priority:'low', priorityLabel:'PRIORITY: LOW', confidence:98 },
    explanation: { text:'All sensor readings are within optimal ranges for Lettuce Zone A. AI predicts stable growth for the next 12-hour cycle. No immediate intervention required. Recommend maintaining current parameters to ensure yield consistency.', factors:['Soil Moisture','EC Level','Ambient Temp','Light Intensity','pH Balance'] },
    impact: { waterSavedPercent:15, fertilizerReductionPercent:10, yieldImprovementPercent:5, riskReduction:'low' },
  },
  'over-irrigation': {
    label: 'Over-Irrigation', zoneStatus: 'Attention Required', zoneBadgeClass: 'warn',
    sensors: {
      temperature:  { value:21,    unit:'°C',    name:'Temperature',    range:'18–26',     status:'ok',     trend:'stable', pct:53 },
      humidity:     { value:92,    unit:'%',     name:'Humidity',       range:'60–80',     status:'warn',   trend:'up',     pct:92 },
      light:        { value:820,   unit:'μmol',  name:'Light Intensity',range:'600–1000',  status:'ok',     trend:'stable', pct:73 },
      soilMoisture: { value:85,    unit:'%',     name:'Soil Moisture',  range:'30–60',     status:'danger', trend:'up',     pct:85 },
      ph:           { value:5.9,   unit:'',      name:'pH Level',       range:'5.5–7.0',   status:'ok',     trend:'down',   pct:50 },
      ec:           { value:1.2,   unit:'mS/cm', name:'EC Level',       range:'1.5–2.5',   status:'warn',   trend:'down',   pct:25 },
      npk:          { N:80, P:30, K:110,          name:'NPK Nutrients',  status:'warn' },
    },
    recommendation: { title:'Stop Irrigation Immediately', action:'Reduce watering to once daily — monitor for 24h', secondary:'Check drainage system for blockages to prevent root rot', priority:'high', priorityLabel:'PRIORITY: HIGH', confidence:94 },
    explanation: { text:'Soil Moisture has reached 85%, well above the safe threshold of 30–60%. Over-irrigation is increasing the risk of root hypoxia. The low EC value indicates the nutrient solution has become diluted. Halt irrigation immediately and inspect drainage pathways.', factors:['Soil Moisture','Root Hypoxia Risk','EC Dilution','High Humidity','Drainage Blockage'] },
    impact: { waterSavedPercent:32, fertilizerReductionPercent:18, yieldImprovementPercent:-8, riskReduction:'high' },
  },
  'nutrient-overload': {
    label: 'Nutrient Overload', zoneStatus: 'Alert Active', zoneBadgeClass: 'danger',
    sensors: {
      temperature:  { value:23,    unit:'°C',    name:'Temperature',    range:'18–26',     status:'ok',     trend:'stable', pct:60 },
      humidity:     { value:68,    unit:'%',     name:'Humidity',       range:'60–80',     status:'ok',     trend:'stable', pct:68 },
      light:        { value:780,   unit:'μmol',  name:'Light Intensity',range:'600–1000',  status:'ok',     trend:'stable', pct:65 },
      soilMoisture: { value:42,    unit:'%',     name:'Soil Moisture',  range:'30–60',     status:'ok',     trend:'stable', pct:42 },
      ph:           { value:4.8,   unit:'',      name:'pH Level',       range:'5.5–7.0',   status:'danger', trend:'down',   pct:20 },
      ec:           { value:3.8,   unit:'mS/cm', name:'EC Level',       range:'1.5–2.5',   status:'danger', trend:'up',     pct:95 },
      npk:          { N:280, P:160, K:350,        name:'NPK Nutrients',  status:'danger' },
    },
    recommendation: { title:'Emergency Nutrient Flush', action:'Flush substrate 2–3x with clean water, then adjust pH to 6.0', secondary:'Reduce fertilizer to 40% of standard dose — observe for 48h', priority:'high', priorityLabel:'PRIORITY: HIGH', confidence:96 },
    explanation: { text:'EC value (3.8 mS/cm) is critically above safe range. pH (4.8) is dangerously low. High salt concentration is causing osmotic imbalance, which will manifest as nutrient burn on leaves. Immediate flushing and nutrient formula recalibration are required.', factors:['EC Concentration','pH Level','Salt Toxicity','NPK Imbalance','Osmotic Pressure'] },
    impact: { waterSavedPercent:-5, fertilizerReductionPercent:45, yieldImprovementPercent:-15, riskReduction:'high' },
  },
  'low-light': {
    label: 'Low Light', zoneStatus: 'Intervention Needed', zoneBadgeClass: 'warn',
    sensors: {
      temperature:  { value:20,    unit:'°C',    name:'Temperature',    range:'18–26',     status:'ok',     trend:'down',   pct:45 },
      humidity:     { value:70,    unit:'%',     name:'Humidity',       range:'60–80',     status:'ok',     trend:'stable', pct:70 },
      light:        { value:180,   unit:'μmol',  name:'Light Intensity',range:'600–1000',  status:'danger', trend:'down',   pct:12 },
      soilMoisture: { value:38,    unit:'%',     name:'Soil Moisture',  range:'30–60',     status:'ok',     trend:'stable', pct:38 },
      ph:           { value:6.1,   unit:'',      name:'pH Level',       range:'5.5–7.0',   status:'ok',     trend:'stable', pct:53 },
      ec:           { value:1.7,   unit:'mS/cm', name:'EC Level',       range:'1.5–2.5',   status:'ok',     trend:'stable', pct:46 },
      npk:          { N:115, P:44, K:175,         name:'NPK Nutrients',  status:'ok' },
    },
    recommendation: { title:'Activate Supplemental Lighting', action:'Enable LED grow lights to 600 μmol, extend photoperiod +4h', secondary:'Check shading infrastructure for anomalies; reduce nutrient supply frequency', priority:'medium', priorityLabel:'PRIORITY: MEDIUM', confidence:89 },
    explanation: { text:'Current light intensity at only 180 μmol is far below the minimum for lettuce photosynthesis (600 μmol). Prolonged light deficiency will significantly slow the photosynthesis rate, leading to 20–30% yield reduction. Supplemental artificial lighting must be activated immediately.', factors:['Light Intensity','Photosynthesis Rate','Chlorophyll Synthesis','DLI Deficit','Growth Delay'] },
    impact: { waterSavedPercent:8, fertilizerReductionPercent:5, yieldImprovementPercent:22, riskReduction:'medium' },
  },
  'heat-stress': {
    label: 'Heat Stress', zoneStatus: 'Emergency Alert', zoneBadgeClass: 'danger',
    sensors: {
      temperature:  { value:38,    unit:'°C',    name:'Temperature',    range:'18–26',     status:'danger', trend:'up',     pct:95 },
      humidity:     { value:30,    unit:'%',     name:'Humidity',       range:'60–80',     status:'warn',   trend:'down',   pct:30 },
      light:        { value:1200,  unit:'μmol',  name:'Light Intensity',range:'600–1000',  status:'warn',   trend:'up',     pct:95 },
      soilMoisture: { value:18,    unit:'%',     name:'Soil Moisture',  range:'30–60',     status:'danger', trend:'down',   pct:18 },
      ph:           { value:7.4,   unit:'',      name:'pH Level',       range:'5.5–7.0',   status:'warn',   trend:'up',     pct:92 },
      ec:           { value:2.9,   unit:'mS/cm', name:'EC Level',       range:'1.5–2.5',   status:'warn',   trend:'up',     pct:76 },
      npk:          { N:140, P:55, K:200,         name:'NPK Nutrients',  status:'warn' },
    },
    recommendation: { title:'Activate Emergency Cooling', action:'Enable cooling system — bring temperature below 24°C immediately', secondary:'Increase mist humidification to 65% RH and shade excess light', priority:'high', priorityLabel:'PRIORITY: HIGH', confidence:97 },
    explanation: { text:'Temperature at 38°C has hit the heat stress critical threshold. Stomatal closure has halted transpiration. Soil Moisture at just 18% means the plant is rapidly wilting. Without intervention within 30 minutes, an estimated 40% yield loss will occur for this batch.', factors:['Heat Stress','Stomatal Closure','Transpiration Halt','Soil Drought','Wilting Risk'] },
    impact: { waterSavedPercent:-12, fertilizerReductionPercent:6, yieldImprovementPercent:35, riskReduction:'high' },
  },
};

/* ═══════════════════════════════════════════
   SVG Icons & Colors
═══════════════════════════════════════════ */
const SENSOR_ICONS = {
  temperature:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>`,
  humidity:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
  light:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>`,
  soilMoisture: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8C8 10 5.9 16.17 3.82 19.17A6.006 6.006 0 0 0 9 22c3 0 5.14-1.33 7-4"/><path d="M8.09 13.91A10.003 10.003 0 0 1 14 10c3 0 5.33 1.34 6.73 3.5"/><path d="M12 22v-4"/></svg>`,
  ph:           `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9h14M3 15h14"/><path d="M7 9v6M17 3v18"/></svg>`,
  ec:           `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  npk:          `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
};
const ICON_COLORS = {
  temperature:  { bg:'rgba(239,68,68,0.1)',   color:'#F87171', accent:'#EF4444' },
  humidity:     { bg:'rgba(59,130,246,0.1)',  color:'#60A5FA', accent:'#3B82F6' },
  light:        { bg:'rgba(251,191,36,0.1)',  color:'#FBBF24', accent:'#F59E0B' },
  soilMoisture: { bg:'rgba(34,197,94,0.1)',   color:'#4ADE80', accent:'#22C55E' },
  ph:           { bg:'rgba(168,85,247,0.1)',  color:'#C084FC', accent:'#A855F7' },
  ec:           { bg:'rgba(20,184,166,0.1)',  color:'#2DD4BF', accent:'#14B8A6' },
  npk:          { bg:'rgba(251,146,60,0.1)',  color:'#FB923C', accent:'#F97316' },
};

/* ═══════════════════════════════════════════
   State
═══════════════════════════════════════════ */
let currentScenario = 'normal';
let currentView = 'view-scenario';
let demoMode = false;
let demoTimer = null;
let lastUpdateTime = Date.now();

const VIEW_TITLES = {
  'view-overview': 'Farm Overview',
  'view-sensors':  'Live Sensor Telemetry',
  'view-scenario': 'Scenario Lab',
  'view-ai':       'AI Recommendations',
  'view-impact':   'Business Impact',
  'view-logs':     'System Logs',
};

/* ═══════════════════════════════════════════
   Navigation
═══════════════════════════════════════════ */
function navigateTo(viewId) {
  // Hide all views
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  // Show target
  document.getElementById(viewId).classList.add('active');
  // Update nav items
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.view === viewId);
  });
  // Update topbar title
  document.getElementById('topbarTitle').textContent = VIEW_TITLES[viewId] || 'AgriMind';
  currentView = viewId;
}

/* ═══════════════════════════════════════════
   Render: Sensors
═══════════════════════════════════════════ */
function getStatusLabel(s) { return {ok:'NORMAL',warn:'HIGH',danger:'ALERT',high:'OVER',optimal:'OPTIMAL'}[s]||'NORMAL'; }

function getTrendArrow(t) {
  if(t==='up')   return `<span class="trend-arrow up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg> Rising</span>`;
  if(t==='down') return `<span class="trend-arrow down"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg> Falling</span>`;
  return `<span class="trend-arrow stable"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg> Stable</span>`;
}

function renderSensors(data) {
  const grid = document.getElementById('sensorGrid');
  const keys = ['temperature','humidity','light','soilMoisture','ph','ec','npk'];
  let html = '';
  keys.forEach(key => {
    const s = data[key];
    const ic = ICON_COLORS[key];
    if(key==='npk') {
      const nc = {ok:'#4ADE80',warn:'#FBBF24',danger:'#F87171'}[s.status];
      html += `<div class="sensor-card animate-in" role="listitem" style="--accent-color:${ic.accent}">
        <div class="sensor-card-top"><div class="sensor-icon-wrap" style="background:${ic.bg};color:${ic.color}">${SENSOR_ICONS[key]}</div><div class="sensor-status-dot ${s.status}"></div></div>
        <div class="sensor-name">${s.name}</div>
        <div class="npk-row">
          <div class="npk-pill"><div class="npk-label">N</div><div class="npk-val" style="color:${nc}">${s.N}</div></div>
          <div class="npk-pill"><div class="npk-label">P</div><div class="npk-val" style="color:${nc}">${s.P}</div></div>
          <div class="npk-pill"><div class="npk-label">K</div><div class="npk-val" style="color:${nc}">${s.K}</div></div>
        </div>
        <div style="margin-top:8px"><span class="status-chip ${s.status}">${getStatusLabel(s.status)}</span></div>
      </div>`;
      return;
    }
    const vc = s.status==='danger'?'danger':s.status==='warn'?'warn':(key==='soilMoisture'&&s.pct>70?'high':'');
    const showProg = key==='soilMoisture';
    html += `<div class="sensor-card animate-in" role="listitem" style="--accent-color:${ic.accent}">
      <div class="sensor-card-top"><div class="sensor-icon-wrap" style="background:${ic.bg};color:${ic.color}">${SENSOR_ICONS[key]}</div><div class="sensor-status-dot ${s.status}"></div></div>
      <div class="sensor-name">${s.name}</div>
      <div><span class="sensor-value ${vc}">${s.value}</span><span class="sensor-unit">${s.unit}</span></div>
      ${s.range?`<div class="sensor-range">Ideal <span>${s.range}</span></div>`:''}
      ${showProg?`<div class="progress-wrap"><div class="progress-bg"><div class="progress-fill ${s.status}" style="width:${s.pct}%"></div></div></div>`:''}
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px">
        <span class="status-chip ${s.status}">${getStatusLabel(s.status)}</span>
        ${getTrendArrow(s.trend)}
      </div>
    </div>`;
  });
  grid.innerHTML = html;
}

function renderAI(rec) {
  document.getElementById('aiTitle').textContent = rec.title;
  document.querySelector('#aiAction span').textContent = rec.action;
  document.querySelector('#aiSecondary span').textContent = rec.secondary;
  const badge = document.getElementById('priorityBadge');
  badge.textContent = rec.priorityLabel;
  badge.className = 'priority-badge priority-'+rec.priority;
  document.getElementById('confidencePct').textContent = rec.confidence+'%';
  document.getElementById('confidenceSubLabel').textContent = 'Confidence '+rec.confidence+'%';
  document.getElementById('confidenceFill').style.width = rec.confidence+'%';
}

function renderExplanation(exp) {
  document.getElementById('explainText').textContent = exp.text;
  document.getElementById('factorsList').innerHTML = exp.factors.map(f=>`
    <span class="factor-tag">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      ${f}
    </span>`).join('');
}

function renderImpact(imp) {
  const fmt = v => (v>=0?'+':'')+v+'%';
  document.getElementById('waterVal').textContent  = fmt(-(imp.waterSavedPercent));
  document.getElementById('fertVal').textContent   = fmt(-(imp.fertilizerReductionPercent));
  document.getElementById('yieldVal').textContent  = fmt(imp.yieldImprovementPercent);
  document.getElementById('waterCaption').textContent = imp.waterSavedPercent>=0 ? `Est. ${imp.waterSavedPercent}% water savings vs. no-AI baseline` : `Scenario requires ${Math.abs(imp.waterSavedPercent)}% more water`;
  document.getElementById('fertCaption').textContent  = imp.fertilizerReductionPercent>=0 ? `${imp.fertilizerReductionPercent}% reduction in fertilizer waste` : `Requires ${Math.abs(imp.fertilizerReductionPercent)}% more fertilizer input`;
  document.getElementById('yieldCaption').textContent = imp.yieldImprovementPercent>=0 ? `Est. ${imp.yieldImprovementPercent}% yield improvement expected` : `${Math.abs(imp.yieldImprovementPercent)}% yield risk — immediate action needed`;
  document.getElementById('waterFill').style.width  = Math.min(Math.abs(imp.waterSavedPercent)*2,100)+'%';
  document.getElementById('fertFill').style.width   = Math.min(Math.abs(imp.fertilizerReductionPercent)*2,100)+'%';
  document.getElementById('yieldFill').style.width  = Math.min(Math.abs(imp.yieldImprovementPercent)*2,100)+'%';
  document.getElementById('waterVal').className  = 'impact-row-val '+(imp.waterSavedPercent>=0?'neg':'pos');
  document.getElementById('fertVal').className   = 'impact-row-val '+(imp.fertilizerReductionPercent>=0?'neg':'pos');
  document.getElementById('yieldVal').className  = 'impact-row-val '+(imp.yieldImprovementPercent>=0?'pos':'neg');
  const riskMap = {low:['LOW','low'],medium:['MEDIUM','medium'],high:['HIGH','high']};
  const rc = document.getElementById('riskChip');
  rc.textContent = riskMap[imp.riskReduction][0];
  rc.className   = 'risk-chip '+riskMap[imp.riskReduction][1];
}

function renderZone(scenario) {
  const s = SCENARIOS[scenario];
  document.getElementById('zoneStatus').textContent = s.zoneStatus;
  const badge = document.getElementById('zoneBadge');
  badge.className = 'zone-badge '+s.zoneBadgeClass;
}

/* ═══════════════════════════════════════════
   Scenario Switch
═══════════════════════════════════════════ */
function switchScenario(name) {
  if(name===currentScenario) return;
  currentScenario = name;
  const mask = document.getElementById('loadingMask');
  mask.classList.add('show');
  setTimeout(()=>{
    const d = SCENARIOS[name];
    renderSensors(d.sensors);
    renderAI(d.recommendation);
    renderExplanation(d.explanation);
    renderImpact(d.impact);
    renderZone(name);
    lastUpdateTime = Date.now();
    document.getElementById('lastUpdateText').textContent = 'Just updated';
    mask.classList.remove('show');
  }, 320);
  document.querySelectorAll('.scenario-btn').forEach(btn=>{
    const a = btn.dataset.scenario===name;
    btn.classList.toggle('active',a);
    btn.setAttribute('aria-pressed',a?'true':'false');
  });
}

/* ═══════════════════════════════════════════
   Demo Mode
═══════════════════════════════════════════ */
const SCENARIO_KEYS = ['normal','over-irrigation','nutrient-overload','low-light','heat-stress'];

function startDemo() {
  demoMode = true;
  document.getElementById('demoBtnText').textContent = 'Stop Demo';
  document.getElementById('demoBtnIcon').innerHTML = `<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>`;
  document.getElementById('demoBtn').classList.add('active');
  // Navigate to scenario lab if not already there
  if(currentView!=='view-scenario') navigateTo('view-scenario');
  function cycle() {
    const idx = SCENARIO_KEYS.indexOf(currentScenario);
    switchScenario(SCENARIO_KEYS[(idx+1)%SCENARIO_KEYS.length]);
    demoTimer = setTimeout(cycle, 3000);
  }
  demoTimer = setTimeout(cycle, 3000);
}

function stopDemo() {
  demoMode = false;
  clearTimeout(demoTimer);
  document.getElementById('demoBtnText').textContent = 'Auto Demo';
  document.getElementById('demoBtnIcon').innerHTML = `<polygon points="5 3 19 12 5 21 5 3"/>`;
  document.getElementById('demoBtn').classList.remove('active');
}

/* ═══════════════════════════════════════════
   Highlight Keywords
═══════════════════════════════════════════ */
function highlightKeywords() {
  const factors = SCENARIOS[currentScenario].explanation.factors;
  const textEl  = document.getElementById('explainText');
  let html = SCENARIOS[currentScenario].explanation.text;
  factors.forEach(f=>{
    const re = new RegExp(f.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi');
    html = html.replace(re, m=>`<mark class="highlight-kw">${m}</mark>`);
  });
  textEl.innerHTML = html;
  setTimeout(()=>{ textEl.textContent = SCENARIOS[currentScenario].explanation.text; }, 2500);
}

/* ═══════════════════════════════════════════
   Timestamp
═══════════════════════════════════════════ */
function updateTimestamp() {
  const sec = Math.floor((Date.now()-lastUpdateTime)/1000);
  let t = sec<10?'Just updated':sec<60?`${sec}s ago`:`${Math.floor(sec/60)}m ago`;
  document.getElementById('lastUpdateText').textContent = t;
}

/* ═══════════════════════════════════════════
   Log Filter Buttons — with actual filtering
═══════════════════════════════════════════ */
function initLogFilters() {
  // Map button text → data-level keyword to match
  const FILTER_MAP = {
    'All':        null,
    'Errors':     'error',
    'Warnings':   'warn',
    'AI Events':  'ai',
    'Sensor':     'sensor',
  };

  document.querySelectorAll('.log-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active state
      document.querySelectorAll('.log-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const key = FILTER_MAP[btn.textContent.trim()];
      const entries = document.querySelectorAll('.log-entry:not(.header)');

      entries.forEach(entry => {
        if (!key) {
          // 'All' — show everything
          entry.style.display = '';
        } else {
          const levels = (entry.dataset.level || '').split(' ');
          entry.style.display = levels.includes(key) ? '' : 'none';
        }
      });
    });
  });
}

/* ═══════════════════════════════════════════
   Light / Dark Theme Toggle
═══════════════════════════════════════════ */
function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  // Restore saved preference
  if (localStorage.getItem('agrimind-theme') === 'light') {
    document.documentElement.classList.add('light');
  }
  btn.addEventListener('click', () => {
    const isLight = document.documentElement.classList.toggle('light');
    localStorage.setItem('agrimind-theme', isLight ? 'light' : 'dark');
  });
}

/* ═══════════════════════════════════════════
   Init
═══════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', ()=>{
  // Initial scenario render
  const init = SCENARIOS['normal'];
  renderSensors(init.sensors);
  renderAI(init.recommendation);
  renderExplanation(init.explanation);
  renderImpact(init.impact);
  renderZone('normal');

  // Navigation wiring
  document.querySelectorAll('.nav-item[data-view]').forEach(item=>{
    item.addEventListener('click',()=>{
      if(demoMode) stopDemo();
      navigateTo(item.dataset.view);
    });
  });

  // Scenario buttons
  document.querySelectorAll('.scenario-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      if(demoMode) stopDemo();
      switchScenario(btn.dataset.scenario);
    });
  });

  // Demo button
  document.getElementById('demoBtn').addEventListener('click',()=>{
    demoMode ? stopDemo() : startDemo();
  });

  // Why button
  document.getElementById('whyBtn').addEventListener('click', highlightKeywords);

  // Log filters
  initLogFilters();

  // Theme toggle
  initThemeToggle();

  // Timestamp
  setInterval(updateTimestamp, 5000);
  lastUpdateTime = Date.now();
});
