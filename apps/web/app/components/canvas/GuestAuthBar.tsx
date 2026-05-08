import { ACCENT, INK } from "./types";
import { Sun, Moon } from "lucide-react";

interface Props {
  isSignedIn: boolean;
  onDashboard: () => void;
  onSignIn: () => void;
  darkMode: boolean;
  onThemeToggle: () => void;
}

export default function GuestAuthBar({ isSignedIn, onDashboard, onSignIn, darkMode, onThemeToggle }: Props) {
  const btnStyle = {
    background: "var(--paper-3, #FBF8F1)",
    border: "1.5px solid var(--ink, #15130F)",
    borderRadius: 10, padding: "8px",
    cursor: "pointer",
    boxShadow: "3px 3px 0 var(--ink, #15130F)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "var(--ink, #15130F)",
    transition: "transform 0.1s",
  };

  return (
    <div style={{ position: "fixed", top: 16, right: 16, zIndex: 10, display: "flex", gap: 12, alignItems: "center" }}>
      <button 
        onClick={onThemeToggle} 
        style={btnStyle}
        onMouseEnter={e => e.currentTarget.style.transform = "translate(-1px, -1px)"}
        onMouseLeave={e => e.currentTarget.style.transform = "none"}
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {isSignedIn ? (
        <button onClick={onDashboard} style={{
          background: ACCENT, color: "#fff",
          border: `1.5px solid ${ACCENT}`,
          borderRadius: 10,
          padding: "8px 18px", fontSize: 13, fontWeight: 700,
          fontFamily: "'Inter Tight', sans-serif",
          cursor: "pointer",
          boxShadow: "3px 3px 0 var(--ink, #15130F)",
        }}>
          My Boards
        </button>
      ) : (
        <>
          <div style={{
            background: "var(--paper-3, #FBF8F1)",
            border: "1.5px solid var(--ink, #15130F)",
            borderRadius: 10, padding: "7px 12px",
            fontSize: 12, color: "var(--ink-soft, #3A352C)",
            fontFamily: "'JetBrains Mono', monospace",
            boxShadow: "3px 3px 0 var(--ink, #15130F)",
            display: "none" // Hide text on small screens if needed, or keep for now
          }}>
            Sign in to collaborate
          </div>
          <button onClick={onSignIn} style={{
            background: ACCENT, color: "#fff",
            border: `1.5px solid ${ACCENT}`,
            borderRadius: 10,
            padding: "8px 18px", fontSize: 13, fontWeight: 700,
            fontFamily: "'Inter Tight', sans-serif",
            cursor: "pointer",
            boxShadow: "3px 3px 0 var(--ink, #15130F)",
          }}>
            Sign In
          </button>
        </>
      )}
    </div>
  );
}
