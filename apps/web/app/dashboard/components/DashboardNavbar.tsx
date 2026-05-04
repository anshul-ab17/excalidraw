"use client";
import { ACCENT } from "../../components/canvas/types";

interface Props {
  onLogoClick: () => void;
  onOpenCanvas: () => void;
  onLogout: () => void;
}

export default function DashboardNavbar({ onLogoClick, onOpenCanvas, onLogout }: Props) {
  return (
    <div style={{
      position: "fixed", top: 12, left: 12, right: 12, zIndex: 20,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 16px", pointerEvents: "none",
    }}>
      <div style={{ pointerEvents: "auto" }}>
        <button onClick={onLogoClick} style={{
          background: "var(--paper-3, #FBF8F1)",
          border: "1.5px solid var(--ink, #15130F)",
          borderRadius: 10, padding: "7px 14px",
          display: "flex", alignItems: "center", gap: 8,
          boxShadow: "3px 3px 0 var(--ink, #15130F)",
          cursor: "pointer",
        }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: ACCENT, boxShadow: "1.5px 1.5px 0 var(--ink, #15130F)", display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Fraunces', serif", color: "var(--ink, #15130F)", letterSpacing: "-0.01em" }}>Canvas</span>
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, pointerEvents: "auto" }}>
        <button onClick={onOpenCanvas} style={{
          background: "var(--paper-3, #FBF8F1)",
          border: "1.5px solid var(--ink, #15130F)",
          borderRadius: 10, padding: "8px 16px",
          fontSize: 13, color: "var(--ink, #15130F)", cursor: "pointer",
          fontWeight: 600, fontFamily: "'Inter Tight', sans-serif",
          boxShadow: "3px 3px 0 var(--ink, #15130F)",
        }}>
          ← Open Canvas
        </button>
        <button onClick={onLogout} style={{
          background: ACCENT, border: `1.5px solid ${ACCENT}`,
          borderRadius: 10, padding: "8px 16px",
          fontSize: 13, color: "#fff", cursor: "pointer",
          fontWeight: 600, fontFamily: "'Inter Tight', sans-serif",
          boxShadow: "3px 3px 0 var(--ink, #15130F)",
        }}>
          Sign out
        </button>
      </div>
    </div>
  );
}
