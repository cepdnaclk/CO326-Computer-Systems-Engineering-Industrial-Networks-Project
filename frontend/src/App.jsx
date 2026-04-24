import { useState, useEffect, useRef, useCallback} from 'react'

import './App.css'
import {io} from "socket.io-client";

import LineChart from './components/LineChart';
import Gauge from './components/Gauge';
import AnomalyFeed from './components/AnomalyFeed';
import StatCard from './components/StatCard';
import Sparkline from './components/Sparkline';

// create a socket to receive real time data
const socket = io("http://localhost:5000");


// define warning values
const MAX_POINTS = 60;

// Temperature Accepted Range: 19 - 36
const TEMP_MIN = 19;
const TEMP_WARN = 36; // normal warn
const TEMP_CRIT = 45; // extreme spike >> anomaly

// Humidity Accepted Range: 29 - 71
const HUM_MIN = 29;
const HUM_WARN = 71; // normal warning
const HUM_CRIT = 85; // extreme spike

// ── Tiny helpers 
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const fmt = (v, d = 1) => v == null ? "—" : Number(v).toFixed(d);
const now = () => new Date().toLocaleTimeString("en-US", { hour12: false });



export default function App() {
  const [tempH, setTempH] = useState([]);
  const [humH, setHumH] = useState([]);
  const [latest, setLatest] = useState({ temperature: null, humidity: null });
  const [anomalies, setAnomalies] = useState([]);
  const [status, setStatus] = useState("connecting");
  
  const [count, setCount] = useState(0);


  const ingest = useCallback((msg) => {
    const temp = parseFloat(msg.temperature);
    const hum = parseFloat(msg.humidity);
    if (isNaN(temp) || isNaN(hum)) return;

    setTempH(prev => [...prev.slice(-(MAX_POINTS - 1)), temp]);
    setHumH(prev => [...prev.slice(-(MAX_POINTS - 1)), hum]);
    setLatest(prev => ({ ...prev, temperature: temp, humidity: hum }));
    setCount(c => c + 1);

    // use AI feedback from backend
    if (msg.anomaly) {
      const entry = {
        level: "Warning", 
        sensor: "AI Prediction",
        msg: `AI detected anomalous pattern: Temp ${fmt(temp)}°C | Hum ${fmt(hum)}%`,
        time: now(),
      };
      setAnomalies(prev => [entry, ...prev].slice(0, 50));
    
    }
  }, []);

  useEffect(() => {
    socket.on("connect", () => setStatus("live"));
    socket.on("disconnect", () => setStatus("disconnected"));
    socket.on("sensor-data", ingest);
    return () => {
      socket.off("connect"); socket.off("disconnect"); socket.off("sensor-data");
    };
  }, [ingest]);



  const tempDelta = tempH.length >= 2 ? +(tempH[tempH.length-1] - tempH[tempH.length-2]).toFixed(2) : null;
  const humDelta = humH.length >= 2 ? +(humH[humH.length-1] - humH[humH.length-2]).toFixed(2) : null;
  const statusColor = { live:"#22c55e", connecting:"#f59e0b", disconnected:"#ef4444" }[status];

  return (
    <div className="dashboard-container">
      <header className="header">
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ fontSize:22 }}>⬡</div>
          <div>
            <div style={{ fontSize:17, fontWeight:800 }}>IOT Dashboard</div>
            <div className="stat-label" style={{ fontSize:10 }}>INDUSTRIAL SENSOR DASHBOARD</div>
          </div>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div className="mono-text" style={{ fontSize:11, color:"#6b7280" }}>{count.toLocaleString()} packets</div>
          <div className="mono-text" style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color: statusColor }}>
            <span className="live-dot" /> {status.toUpperCase()}
          </div>
        </div>
      </header>

      <div className="main-content">
        <div className="grid-stats">
          <StatCard label="Temperature" value={latest.temperature} unit="°C" delta={tempDelta} 
          color={latest.temperature > TEMP_WARN ? "#ef4444" : "#f97316"}
          history={tempH} 
          min={0} 
          max={60} />
          <StatCard label="Humidity" value={latest.humidity} unit="%" delta={humDelta} 
          color={latest.humidity > HUM_WARN ? "#ef4444" : "#38bdf8"}
           history={humH} min={0} max={100} />
          
          <div style={{ display:"grid", gridTemplateRows:"1fr 1fr", gap:16 }}>
            {[
              { label:"Avg Temp", v: (tempH.reduce((a,b)=>a+b,0)/tempH.length)||0, unit:"°C", color:"#fb923c" },
              { label:"Avg Humidity", v: (humH.reduce((a,b)=>a+b,0)/humH.length)||0, unit:"%", color:"#7dd3fc" },
            ].map(s=>(
              <div key={s.label} className="panel" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px" }}>
                <span style={{ fontSize:12, color:"#6b7280" }}>{s.label}</span>
                <span className="mono-text" style={{ fontSize:22, fontWeight:700, color:s.color }}>{fmt(s.v)}<small style={{ fontSize:13, color:"#6b7280" }}> {s.unit}</small></span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid-main">
          <div className="panel">
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:700 }}>Live Trend</div>
              <div className="mono-text" style={{ display:"flex", gap:16, fontSize:11 }}>
                <span style={{ color:"#f97316" }}>● Temp</span>
                <span style={{ color:"#38bdf8" }}>● Humidity</span>
              </div>
            </div>
            <LineChart tempHistory={tempH} humHistory={humH} />
          </div>

          <div className="panel" style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ fontSize:13, fontWeight:700 }}>Anomaly Feed</div>
            <AnomalyFeed anomalies={anomalies} />
          </div>
        </div>

        <div className="grid-gauges">
           <div className="panel" style={{ textAlign: 'center' }}>
              <div className="stat-label">Temp Gauge</div>
              <Gauge value={latest.temperature ?? 0} min={0} max={60} color="#f97316" unit="°C" />
           </div>
           <div className="panel" style={{ textAlign: 'center' }}>
              <div className="stat-label">Humidity Gauge</div>
              <Gauge value={latest.humidity ?? 0} min={0} max={100} color="#38bdf8" unit="%" />
           </div>
           <div className="panel">
              <div className="stat-label" style={{ marginBottom: 12 }}>Thresholds</div>
              {[
                { label:"Temp Warn", val:`≥ ${TEMP_WARN}°C`, color:"#f59e0b" },
            
              ].map(t => (
                <div key={t.label} className="threshold-row">
                  <span style={{ color:"#9ca3af" }}>{t.label}</span>
                  <span className="mono-text" style={{ color:t.color }}>{t.val}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}