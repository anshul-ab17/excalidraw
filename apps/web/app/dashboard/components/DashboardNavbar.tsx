"use client";

const ACCENT = "#28d08b";
const ACCENT_BORDER = "#96f2d7";

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
          background: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.4)", borderRadius: 12,
          padding: "8px 16px", fontSize: 18, fontWeight: 900, color: "#1e1e1e", cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)", fontFamily: "Inter, sans-serif"
        }}>
          Canvax
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, pointerEvents: "auto" }}>
        <button onClick={onOpenCanvas} style={{
          background: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.4)", borderRadius: 12,
          padding: "8px 16px", fontSize: 13, color: "#495057", cursor: "pointer",
          fontWeight: 600, boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
        }}>
          ← Open Canvas
        </button>
        <button onClick={onLogout} style={{
          background: ACCENT, borderRadius: 12, border: "none",
          padding: "8px 16px", fontSize: 13, color: "#000", cursor: "pointer",
          fontWeight: 800, boxShadow: "0 4px 12px rgba(40, 208, 139, 0.2)"
        }}>
          Sign out
        </button>
      </div>
    </div>
  );
}
