"use client";
import { ACCENT } from "./types";

interface Props {
  historyIdx: number;
  historyLength: number;
  copied: boolean;
  connected: boolean;
  slug: string;
  chatOpen: boolean;
  unreadCount: number;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onDownload: () => void;
  onCopyLink: () => void;
  onChatToggle: () => void;
  onAiOpen: () => void;
}

export default function RoomBottomBar({
  historyIdx, historyLength, copied, connected, slug,
  chatOpen, unreadCount,
  onUndo, onRedo, onClear, onDownload, onCopyLink, onChatToggle, onAiOpen,
}: Props) {
  const sep = <div style={{ width: 1, height: 24, background: "#dee2e6" }} />;
  const btnBase: React.CSSProperties = {
    borderRadius: 6, border: "1px solid #dee2e6", background: "white",
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  };

  return (
    <div style={{
      position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)",
      background: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)",
      borderRadius: 14, padding: "8px 14px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.12)", display: "flex", gap: 8, zIndex: 10, alignItems: "center",
      border: "1px solid rgba(255,255,255,0.5)",
    }}>
      {/* Undo / Redo */}
      <button onClick={onUndo} disabled={historyIdx === 0} title="Undo (Ctrl+Z)"
        style={{ ...btnBase, width: 32, height: 32, fontSize: 14, opacity: historyIdx === 0 ? 0.4 : 1 }}>↩</button>
      <button onClick={onRedo} disabled={historyIdx >= historyLength - 1} title="Redo"
        style={{ ...btnBase, width: 32, height: 32, fontSize: 14, opacity: historyIdx >= historyLength - 1 ? 0.4 : 1 }}>↪</button>

      {sep}

      {/* Clear */}
      <button onClick={onClear} title="Clear canvas"
        style={{ ...btnBase, width: 32, height: 32, fontSize: 14, color: ACCENT }}>🗑</button>

      {sep}

      {/* Download */}
      <button onClick={onDownload} title="Download as PNG"
        style={{ ...btnBase, padding: "6px 12px", fontSize: 13, color: "#495057", height: 32 }}>⬇ Download</button>

      {/* Share */}
      <button onClick={onCopyLink}
        style={{ ...btnBase, padding: "6px 12px", fontSize: 13, height: 32, background: copied ? "#2f9e44" : "white", color: copied ? "white" : "#495057", transition: "all 0.2s" }}>
        {copied ? "✓ Copied!" : "🔗 Share"}
      </button>

      {sep}

      {/* AI button */}
      <button onClick={onAiOpen} title="AI Diagram Generator"
        style={{
          ...btnBase, width: 32, height: 32, fontSize: 15,
          background: "white", color: "#7950f2", borderColor: "#e5dbff",
        }}>
        ✦
      </button>

      {sep}

      {/* Chat toggle with unread badge */}
      <button onClick={onChatToggle} title="Room Chat"
        style={{
          ...btnBase, width: 32, height: 32, fontSize: 14, position: "relative",
          background: chatOpen ? ACCENT : "white",
          color: chatOpen ? "white" : "#495057",
          border: chatOpen ? `1px solid ${ACCENT}` : "1px solid #dee2e6",
          transition: "all 0.2s",
        }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        {unreadCount > 0 && !chatOpen && (
          <div style={{
            position: "absolute", top: -5, right: -5, width: 16, height: 16,
            borderRadius: "50%", background: ACCENT, color: "white",
            fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid white", lineHeight: 1,
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </div>
        )}
      </button>

      {sep}

      {/* Connection status */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: connected ? "#2f9e44" : ACCENT, userSelect: "none" }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: connected ? "#2f9e44" : ACCENT }} />
        {connected ? "Live" : "Offline"}
      </div>
    </div>
  );
}
