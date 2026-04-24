import Sparkline from "./Sparkline";

const fmt = (v, d = 1) => v == null ? "—" : Number(v).toFixed(d);

export default function StatCard({ label, value, unit, delta, color, history, min, max }) {
  const up = delta >= 0;
  return (
    <div className="card">
      <div className="stat-label">{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span className="mono-text" style={{ fontSize: 36, fontWeight: 700, color, lineHeight: 1 }}>{fmt(value)}</span>
        <span style={{ fontSize: 15, color: "#9ca3af" }}>{unit}</span>
        
        {/* Percentage Display */}
        {delta != null && (
          <span style={{ fontSize: 11, color: up ? "#4ade80" : "#f87171", marginLeft: "auto" }}>
            {up ? "▲" : "▼"} {fmt(Math.abs(delta))}
          </span>
        )}
      </div>
      <div style={{ marginTop: 4 }}>
        <Sparkline data={history} color={color} min={min} max={max} />
      </div>
    </div>
  );
}
