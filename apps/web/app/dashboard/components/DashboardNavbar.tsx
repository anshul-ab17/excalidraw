"use client";

const ACCENT = "#991b1b";
const ACCENT_BORDER = "#fca5a5";

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
          background: "var(--glass)", backdropFilter: "blur(24px)",
          border: "1px solid var(--border)", borderRadius: 12,
          padding: "8px 16px", fontSize: 18, fontWeight: 900, color: "var(--text)", cursor: "pointer",
          boxShadow: "var(--shadow-sm)", fontFamily: "Inter, sans-serif"
        }}>
          Canvax
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, pointerEvents: "auto" }}>
        <button onClick={onOpenCanvas} style={{
          background: "var(--glass)", backdropFilter: "blur(24px)",
          border: "1px solid var(--border)", borderRadius: 12,
          padding: "8px 16px", fontSize: 13, color: "var(--text)", cursor: "pointer",
          fontWeight: 600, boxShadow: "var(--shadow-sm)"
        }}>
          ← Open Canvas
        </button>
        <button onClick={onLogout} style={{
          background: "var(--primary)", borderRadius: 12, border: "none",
          padding: "8px 16px", fontSize: 13, color: "#ffffff", cursor: "pointer",
          fontWeight: 800, boxShadow: "0 4px 12px rgba(153, 27, 27, 0.2)"
        }}>
          Sign out
        </button>
      </div>
    </div>
  );
}
