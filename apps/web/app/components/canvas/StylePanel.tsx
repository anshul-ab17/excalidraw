"use client";
import { ACCENT, COLORS, BG_COLORS } from "./types";

interface Props {
  strokeColor: string;
  bgColor: string;
  strokeWidth: number;
  roughness: number;
  opacity: number;
  onStrokeColorChange: (c: string) => void;
  onBgColorChange: (c: string) => void;
  onStrokeWidthChange: (v: number) => void;
  onRoughnessChange: (v: number) => void;
  onOpacityChange: (v: number) => void;
}

export default function StylePanel({
  strokeColor, bgColor, strokeWidth, roughness, opacity,
  onStrokeColorChange, onBgColorChange, onStrokeWidthChange, onRoughnessChange, onOpacityChange,
}: Props) {
  const label = (text: string) => (
    <div style={{ fontSize: 11, fontWeight: 600, color: "#6c757d", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
      {text}
    </div>
  );

  return (
    <div style={{
      position: "fixed", left: 12, top: "50%", transform: "translateY(-50%)",
      background: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(24px)",
      borderRadius: 16, padding: 16,
      boxShadow: "0 10px 30px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: 16, zIndex: 10, width: 180,
      border: "1px solid rgba(255,255,255,0.4)"
    }}>
      <div>
        {label("Stroke")}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
          {COLORS.map(c => (
            <button key={c} onClick={() => onStrokeColorChange(c)} style={{
              width: 22, height: 22, borderRadius: 4, background: c,
              border: strokeColor === c ? `2px solid ${ACCENT}` : "1.5px solid #dee2e6", cursor: "pointer",
            }} />
          ))}
          <input type="color" value={strokeColor} onChange={e => onStrokeColorChange(e.target.value)} style={{ width: 22, height: 22, padding: 0, border: "1.5px solid #dee2e6", background: "none", cursor: "pointer", borderRadius: 4 }} />
        </div>
      </div>

      <div>
        {label("Fill (Solid)")}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
          {BG_COLORS.map(c => (
            <button key={c} onClick={() => onBgColorChange(c)} style={{
              width: 22, height: 22, borderRadius: 4,
              background: c === "transparent" ? "white" : c,
              border: bgColor === c ? `2px solid ${ACCENT}` : "1.5px solid #dee2e6",
              cursor: "pointer",
              backgroundImage: c === "transparent"
                ? "linear-gradient(45deg,#ccc 25%,transparent 25%,transparent 75%,#ccc 75%),linear-gradient(45deg,#ccc 25%,transparent 25%,transparent 75%,#ccc 75%)"
                : "none",
              backgroundSize: c === "transparent" ? "8px 8px" : "auto",
              backgroundPosition: c === "transparent" ? "0 0,4px 4px" : "auto",
            }} />
          ))}
          <input type="color" value={bgColor === "transparent" ? "#ffffff" : bgColor} onChange={e => onBgColorChange(e.target.value)} style={{ width: 22, height: 22, padding: 0, border: "1.5px solid #dee2e6", background: "none", cursor: "pointer", borderRadius: 4 }} />
        </div>
      </div>

      <div>
        {label("Stroke Width")}
        <input type="range" min={1} max={8} value={strokeWidth}
          onChange={e => onStrokeWidthChange(+e.target.value)}
          style={{ width: "100%", accentColor: ACCENT }} />
        <div style={{ fontSize: 11, color: "#6c757d", textAlign: "right" }}>{strokeWidth}px</div>
      </div>

      <div>
        {label("Roughness")}
        <input type="range" min={0} max={3} step={0.5} value={roughness}
          onChange={e => onRoughnessChange(+e.target.value)}
          style={{ width: "100%", accentColor: ACCENT }} />
      </div>

      <div>
        {label("Opacity")}
        <input type="range" min={10} max={100} value={opacity}
          onChange={e => onOpacityChange(+e.target.value)}
          style={{ width: "100%", accentColor: ACCENT }} />
        <div style={{ fontSize: 11, color: "#6c757d", textAlign: "right" }}>{opacity}%</div>
      </div>
    </div>
  );
}
