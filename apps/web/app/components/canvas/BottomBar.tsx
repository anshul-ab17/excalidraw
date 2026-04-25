"use client";
import { ACCENT } from "./types";

interface Props {
  historyIdx: number;
  historyLength: number;
  zoom: number;
  copied: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onClear: () => void;
  onDownload: () => void;
  onCopyLink: () => void;
}

export default function BottomBar({
  historyIdx, historyLength, zoom, copied,
  onUndo, onRedo, onZoomIn, onZoomOut, onClear, onDownload, onCopyLink,
}: Props) {
  const sep = <div style={{ width: 1, height: 24, background: "#dee2e6" }} />;
  const btnBase: React.CSSProperties = { borderRadius: 6, border: "1px solid #dee2e6", background: "white", cursor: "pointer" };

  return (
    <div style={{
      position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)",
      background: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(24px)",
      borderRadius: 16, padding: "10px 16px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.08)", display: "flex", gap: 8, zIndex: 10, alignItems: "center",
      border: "1px solid rgba(255,255,255,0.4)"
    }}>
      <button onClick={onUndo} disabled={historyIdx === 0} title="Undo"
        style={{ ...btnBase, width: 32, height: 32, fontSize: 14, opacity: historyIdx === 0 ? 0.4 : 1 }}>↩</button>
      <button onClick={onRedo} disabled={historyIdx >= historyLength - 1} title="Redo"
        style={{ ...btnBase, width: 32, height: 32, fontSize: 14, opacity: historyIdx >= historyLength - 1 ? 0.4 : 1 }}>↪</button>
      {sep}
      <button onClick={onZoomOut} title="Zoom out"
        style={{ ...btnBase, width: 28, height: 28, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
      <div style={{ fontSize: 12, color: "#495057", minWidth: 38, textAlign: "center", fontWeight: 500 }}>
        {Math.round(zoom * 100)}%
      </div>
      <button onClick={onZoomIn} title="Zoom in"
        style={{ ...btnBase, width: 28, height: 28, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
      {sep}
      <button onClick={onClear} style={{ ...btnBase, width: 32, height: 32, fontSize: 14, color: ACCENT }}>🗑</button>
      {sep}
      <button onClick={onDownload} title="Download"
        style={{ 
          ...btnBase, width: 36, height: 36, fontSize: 16, color: "white", 
          background: ACCENT, border: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(224, 49, 49, 0.2)"
        }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>
      <button onClick={onCopyLink} title="Copy Link"
        style={{
          ...btnBase, width: 36, height: 36, fontSize: 18,
          background: copied ? "#2f9e44" : "white", color: copied ? "white" : "#495057",
          transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center"
        }}>
        {copied ? "✓" : "🔗"}
      </button>

    </div>
  );
}
