"use client";
import { ACCENT, COLORS, BG_COLORS } from "./types";
import { panel, monoLabel } from "./styles";

interface Props {
  strokeColor: string; bgColor: string; strokeWidth: number; roughness: number; opacity: number;
  onStrokeColorChange: (c: string) => void; onBgColorChange: (c: string) => void;
  onStrokeWidthChange: (v: number) => void; onRoughnessChange: (v: number) => void;
  onOpacityChange: (v: number) => void;
}

export default function StylePanel({
  strokeColor, bgColor, strokeWidth, roughness, opacity,
  onStrokeColorChange, onBgColorChange, onStrokeWidthChange, onRoughnessChange, onOpacityChange,
}: Props) {
  return (
    <div style={{
      ...panel,
      position: "fixed", left: 12, top: "50%", transform: "translateY(-50%)",
      padding: 14,
      display: "flex", flexDirection: "column", gap: 14, zIndex: 10, width: 178,
    }}>
      <div>
        <div style={monoLabel}>Stroke</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
          {COLORS.map(c => (
            <button key={c} onClick={() => onStrokeColorChange(c)} style={{
              width: 22, height: 22, borderRadius: 4, background: c,
              border: strokeColor === c ? `2px solid ${ACCENT}` : "1.5px solid var(--ink, #15130F)", cursor: "pointer",
            }} />
          ))}
          <input type="color" value={strokeColor} onChange={e => onStrokeColorChange(e.target.value)} style={{ width: 22, height: 22, padding: 0, border: "1.5px solid var(--ink, #15130F)", background: "none", cursor: "pointer", borderRadius: 4 }} />
        </div>
      </div>

      <div>
        <div style={monoLabel}>Fill</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
          {BG_COLORS.map(c => (
            <button key={c} onClick={() => onBgColorChange(c)} style={{
              width: 22, height: 22, borderRadius: 4,
              background: c === "transparent" ? "white" : c,
              border: bgColor === c ? `2px solid ${ACCENT}` : "1.5px solid var(--ink, #15130F)",
              cursor: "pointer",
              backgroundImage: c === "transparent" ? "linear-gradient(45deg,#ccc 25%,transparent 25%,transparent 75%,#ccc 75%),linear-gradient(45deg,#ccc 25%,transparent 25%,transparent 75%,#ccc 75%)" : "none",
              backgroundSize: c === "transparent" ? "8px 8px" : "auto",
              backgroundPosition: c === "transparent" ? "0 0,4px 4px" : "auto",
            }} />
          ))}
          <input type="color" value={bgColor === "transparent" ? "#ffffff" : bgColor} onChange={e => onBgColorChange(e.target.value)} style={{ width: 22, height: 22, padding: 0, border: "1.5px solid var(--ink, #15130F)", background: "none", cursor: "pointer", borderRadius: 4 }} />
        </div>
      </div>

      <div>
        <div style={monoLabel}>Stroke Width</div>
        <input type="range" min={1} max={8} value={strokeWidth} onChange={e => onStrokeWidthChange(+e.target.value)} style={{ width: "100%", accentColor: ACCENT }} />
        <div style={{ fontSize: 10, color: "var(--muted, #7A7264)", textAlign: "right", fontFamily: "'JetBrains Mono',monospace" }}>{strokeWidth}px</div>
      </div>

      <div>
        <div style={monoLabel}>Roughness</div>
        <input type="range" min={0} max={3} step={0.5} value={roughness} onChange={e => onRoughnessChange(+e.target.value)} style={{ width: "100%", accentColor: ACCENT }} />
      </div>

      <div>
        <div style={monoLabel}>Opacity</div>
        <input type="range" min={10} max={100} value={opacity} onChange={e => onOpacityChange(+e.target.value)} style={{ width: "100%", accentColor: ACCENT }} />
        <div style={{ fontSize: 10, color: "var(--muted, #7A7264)", textAlign: "right", fontFamily: "'JetBrains Mono',monospace" }}>{opacity}%</div>
      </div>
    </div>
  );
}
