import Link from "next/link";
import { ACCENT } from "./types";
import { Sun, Moon } from "lucide-react";

interface Props {
  slug: string;
  darkMode: boolean;
  onThemeToggle: () => void;
}

export default function RoomHeader({ slug, darkMode, onThemeToggle }: Props) {
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
    <div style={{ position: "fixed", top: 16, left: 16, zIndex: 10, display: "flex", gap: 12, alignItems: "center" }}>
      <Link href="/" style={{ textDecoration: "none" }}>
        <div style={{
          background: "var(--paper-3, #FBF8F1)",
          border: "1.5px solid var(--ink, #15130F)",
          borderRadius: 10,
          padding: "7px 14px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          boxShadow: "3px 3px 0 var(--ink, #15130F)",
          cursor: "pointer",
        }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: ACCENT, boxShadow: "1.5px 1.5px 0 var(--ink, #15130F)", display: "inline-block" }} />
          <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Fraunces', serif", color: "var(--ink, #15130F)", letterSpacing: "-0.01em" }}>
            Canvex
          </span>
        </div>
      </Link>
      
      <div style={{ 
        fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--ink-soft, #3A352C)", 
        background: "var(--paper-3, #FBF8F1)", padding: "6px 12px", borderRadius: 10,
        border: "1.5px solid var(--ink, #15130F)",
        boxShadow: "2px 2px 0 var(--ink, #15130F)",
      }}>
        {slug}
      </div>

      <button 
        onClick={onThemeToggle} 
        style={btnStyle}
        onMouseEnter={e => e.currentTarget.style.transform = "translate(-1px, -1px)"}
        onMouseLeave={e => e.currentTarget.style.transform = "none"}
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </div>
  );
}
