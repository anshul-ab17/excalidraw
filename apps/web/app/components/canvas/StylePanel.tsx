"use client";
import { ACCENT, COLORS, BG_COLORS } from "./types";
import { panel, monoLabel, INK } from "./styles";
import { Type, MousePointer2, Eraser, MoveRight, Square, Circle, Pencil } from "lucide-react";

interface Props {
  currentTool: string;
  strokeColor: string; bgColor: string; strokeWidth: number; roughness: number; opacity: number;
  fontSize: number; fontFamily: string;
  onStrokeColorChange: (c: string) => void; onBgColorChange: (c: string) => void;
  onStrokeWidthChange: (v: number) => void; onRoughnessChange: (v: number) => void;
  onOpacityChange: (v: number) => void;
  onFontSizeChange: (v: number) => void; onFontFamilyChange: (v: string) => void;
}

const FONTS = [
  { id: '"Segoe UI", sans-serif', label: "System" },
  { id: 'Georgia, serif', label: "Serif" },
  { id: '"JetBrains Mono", monospace', label: "Mono" },
  { id: 'Fraunces, serif', label: "Artisanal" },
];

export default function StylePanel({
  currentTool,
  strokeColor, bgColor, strokeWidth, roughness, opacity,
  fontSize, fontFamily,
  onStrokeColorChange, onBgColorChange, onStrokeWidthChange, onRoughnessChange, onOpacityChange,
  onFontSizeChange, onFontFamilyChange,
}: Props) {
  const isText = currentTool === "text";
  const isEraser = currentTool === "eraser";

  return (
    <div style={{
      ...panel,
      position: "fixed", left: 24, top: "50%", transform: "translateY(-50%)",
      padding: 20,
      display: "flex", flexDirection: "column", gap: 20, zIndex: 10, width: 220,
      maxHeight: "80vh", overflowY: "auto",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <div style={{ padding: 6, borderRadius: 8, background: "rgba(232, 74, 63, 0.1)", color: ACCENT }}>
          {currentTool === "pencil" && <Pencil size={16} />}
          {currentTool === "rectangle" && <Square size={16} />}
          {currentTool === "ellipse" && <Circle size={16} />}
          {currentTool === "text" && <Type size={16} />}
          {currentTool === "eraser" && <Eraser size={16} />}
          {currentTool === "selection" && <MousePointer2 size={16} />}
        </div>
        <div style={{ ...monoLabel, margin: 0, textTransform: "uppercase", fontSize: 11, letterSpacing: "0.1em" }}>{currentTool} Properties</div>
      </div>

      {!isEraser && (
        <>
          {isText && (
            <>
              <div>
                <div style={monoLabel}>Font Family</div>
                <select 
                  value={fontFamily} 
                  onChange={e => onFontFamilyChange(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: 8, background: "var(--bg)", border: `1.5px solid ${INK}33`, color: INK, fontSize: 12, cursor: "pointer" }}
                >
                  {FONTS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <div style={{ ...monoLabel, display: "flex", justifyContent: "space-between" }}>
                  <span>Font Size</span>
                  <span style={{ opacity: 0.5 }}>{fontSize}px</span>
                </div>
                <input type="range" min={12} max={120} value={fontSize} onChange={e => onFontSizeChange(+e.target.value)} style={{ width: "100%", accentColor: ACCENT, cursor: "ew-resize" }} />
              </div>
            </>
          )}

          <div>
            <div style={monoLabel}>Stroke Color</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
              {COLORS.map(c => (
                <button key={c} onClick={() => onStrokeColorChange(c)} style={{
                  width: 24, height: 24, borderRadius: 6, background: c,
                  border: strokeColor === c ? `2.5px solid ${ACCENT}` : `1.5px solid ${INK}33`, cursor: "pointer",
                  transition: "transform 0.1s",
                }} 
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                />
              ))}
              <div style={{ position: "relative", width: 24, height: 24, overflow: "hidden", borderRadius: 6, border: `1.5px solid ${INK}33` }}>
                <input type="color" value={strokeColor} onChange={e => onStrokeColorChange(e.target.value)} style={{ position: "absolute", inset: -5, width: 40, height: 40, cursor: "pointer", border: "none" }} />
              </div>
            </div>
          </div>

          {!isText && (
            <div>
              <div style={monoLabel}>Fill Color</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                {BG_COLORS.map(c => (
                  <button key={c} onClick={() => onBgColorChange(c)} style={{
                    width: 24, height: 24, borderRadius: 6,
                    background: c === "transparent" ? "white" : c,
                    border: bgColor === c ? `2.5px solid ${ACCENT}` : `1.5px solid ${INK}33`,
                    cursor: "pointer",
                    backgroundImage: c === "transparent" ? "linear-gradient(45deg,#eee 25%,transparent 25%,transparent 75%,#eee 75%),linear-gradient(45deg,#eee 25%,transparent 25%,transparent 75%,#eee 75%)" : "none",
                    backgroundSize: c === "transparent" ? "8px 8px" : "auto",
                    backgroundPosition: c === "transparent" ? "0 0,4px 4px" : "auto",
                  }} />
                ))}
              </div>
            </div>
          )}

          <div>
            <div style={{ ...monoLabel, display: "flex", justifyContent: "space-between" }}>
              <span>{isText ? "Stroke Weight" : "Stroke Size"}</span>
              <span style={{ opacity: 0.5 }}>{strokeWidth}px</span>
            </div>
            <input type="range" min={1} max={12} value={strokeWidth} onChange={e => onStrokeWidthChange(+e.target.value)} style={{ width: "100%", accentColor: ACCENT, cursor: "ew-resize" }} />
          </div>

          {!isText && (
            <div>
              <div style={{ ...monoLabel, display: "flex", justifyContent: "space-between" }}>
                <span>Roughness</span>
                <span style={{ opacity: 0.5 }}>{roughness}</span>
              </div>
              <input type="range" min={0} max={3} step={0.1} value={roughness} onChange={e => onRoughnessChange(+e.target.value)} style={{ width: "100%", accentColor: ACCENT, cursor: "ew-resize" }} />
            </div>
          )}

          <div>
            <div style={{ ...monoLabel, display: "flex", justifyContent: "space-between" }}>
              <span>Opacity</span>
              <span style={{ opacity: 0.5 }}>{opacity}%</span>
            </div>
            <input type="range" min={10} max={100} value={opacity} onChange={e => onOpacityChange(+e.target.value)} style={{ width: "100%", accentColor: ACCENT, cursor: "ew-resize" }} />
          </div>
        </>
      )}

      {isEraser && (
        <div style={{ padding: "10px 0", textAlign: "center", color: "var(--muted)" }}>
          <p style={{ fontSize: 11, marginBottom: 8 }}>Click elements to erase them</p>
          <div style={{ height: 1, background: "var(--border)", opacity: 0.3 }} />
        </div>
      )}
    </div>
  );
}
