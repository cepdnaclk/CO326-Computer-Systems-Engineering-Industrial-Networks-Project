import { useRef, useEffect } from "react";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const SCALE_MIN = 0;
const SCALE_MAX = 100;
const TEMP_WARN = 36;
const TEMP_CRIT = 45;
const HUM_WARN = 71;

export default function LineChart({ tempHistory, humHistory }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    const W = canvas.width;
    const H = canvas.height; // This is now 320 instead of 180
    
    // Increased top/bottom padding for the taller layout
    const pad = { top: 40, right: 70, bottom: 40, left: 50 };
    const iW = W - pad.left - pad.right;
    const iH = H - pad.top - pad.bottom;
    const n = Math.max(tempHistory.length, humHistory.length);
    
    ctx.clearRect(0, 0, W, H);

    // Draw Unified Grid (Still steps of 25, but spaced further apart now)
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (i / 4) * iH;
      ctx.beginPath(); 
      ctx.moveTo(pad.left, y); 
      ctx.lineTo(W - pad.right, y); 
      ctx.stroke();
      
      ctx.fillStyle = "#64748b"; // Slightly lighter for the dark theme
      ctx.font = "12px 'DM Mono', monospace"; // Larger font for larger chart
      ctx.textAlign = "right";
      ctx.fillText(100 - i * 25, pad.left - 12, y + 4);
    }

    // Normalized Draw Function
    const drawLine = (history, color) => {
      if (history.length < 2) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = 3; // Thicker line looks better on a larger chart
      ctx.lineJoin = "round";
      ctx.beginPath();
      history.forEach((v, i) => {
        const x = pad.left + (i / (n - 1)) * iW;
        const y = pad.top + iH - ((clamp(v, 0, 100) - 0) / 100) * iH;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
    };

    // Unified Threshold Function
    const drawThresh = (val, color, label) => {
      const y = pad.top + iH - ((clamp(val, 0, 100) - 0) / 100) * iH;
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); 
      ctx.moveTo(pad.left, y); 
      ctx.lineTo(W - pad.right, y); 
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = color;
      ctx.textAlign = "left";
      ctx.font = "bold 11px 'DM Mono', monospace";
      ctx.fillText(label, W - pad.right + 8, y + 4);
    };

    drawLine(humHistory, "#38bdf8");  // Humidity
    drawLine(tempHistory, "#f97316"); // Temperature

    drawThresh(TEMP_WARN, "rgba(249, 115, 22, 0.5)", `T-LIM ${TEMP_WARN}`);
    drawThresh(HUM_WARN, "rgba(56, 189, 248, 0.5)", `H-LIM ${HUM_WARN}`);
    drawThresh(TEMP_CRIT, "#ef4444", `C ${TEMP_CRIT}`);

  }, [tempHistory, humHistory]);

  return (
    <div style={{ padding: "20px", background: "#0f172a", borderRadius: "12px" }}>
      <canvas 
        ref={canvasRef} 
        width={680} 
        height={320} 
        style={{ width: "100%", height: 320, display: "block" }} // CSS display increased
      />
    </div>
  );
}