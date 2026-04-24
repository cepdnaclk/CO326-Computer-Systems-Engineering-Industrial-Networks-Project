
export default function AnomalyFeed({ anomalies }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto" }}>
      {}
      {anomalies.length === 0 && (
        <div style={{ color: "#22c55e", fontSize: 12, padding: "10px 0", textAlign: "center" }}>
          ✓ No anomalies detected
        </div>
      )}
      {anomalies.map((a, i) => (
        <div key={i} className="anomaly-item" style={{
          background: a.level === "critical" ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.10)",
          border: `1px solid ${a.level === "critical" ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.25)"}`
        }}>
          <span style={{ fontSize: 13, marginTop: 1 }}>{a.level === "critical" ? "🔴" : "🟡"}</span>
          <div>
            <div style={{ fontSize: 11, color: a.level === "critical" ? "#f87171" : "#fbbf24", fontWeight: 600 }}>
              {a.level.toUpperCase()} — {a.sensor}
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{a.msg} &middot; {a.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
