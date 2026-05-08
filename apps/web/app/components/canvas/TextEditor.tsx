"use client";
import { ACCENT, TextInputState } from "./types";

interface Props {
  textInput: TextInputState;
  textScreenX: number;
  textScreenY: number;
  strokeWidth: number;
  strokeColor: string;
  fontSize: number;
  fontFamily: string;
  onChange: (value: string) => void;
  onCommit: () => void;
  onCancel: () => void;
  onDragStart: (e: React.MouseEvent) => void;
}

export default function TextEditor({
  textInput, textScreenX, textScreenY, strokeWidth, strokeColor,
  fontSize, fontFamily,
  onChange, onCommit, onCancel, onDragStart,
}: Props) {
  return (
    <div style={{
      position: "fixed", left: textScreenX, top: textScreenY,
      zIndex: 200, minWidth: 160, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", borderRadius: 12, overflow: "hidden",
      border: "1.5px solid rgba(232, 74, 63, 0.2)", background: "white",
    }}>
      <div
        onMouseDown={onDragStart}
        style={{
          background: ACCENT, padding: "6px 12px", cursor: "move",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontSize: 10, color: "white", userSelect: "none", textTransform: "uppercase", letterSpacing: "0.05em",
        }}
      >
        <span>Text Editor</span>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={onCommit} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontSize: 11 }}>Save</button>
          <button onClick={onCancel} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontSize: 11 }}>✕</button>
        </div>
      </div>
      <textarea
        autoFocus
        value={textInput.value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Escape") onCancel();
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onCommit(); }
        }}
        placeholder="Type here..."
        style={{
          display: "block", width: "100%", minWidth: 200, minHeight: 60,
          padding: "12px", border: "none",
          background: "transparent", resize: "both", outline: "none",
          fontSize: `${fontSize}px`, color: strokeColor,
          fontFamily: fontFamily, boxSizing: "border-box",
          lineHeight: 1.4,
        }}
      />
    </div>
  );
}
