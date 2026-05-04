import Link from "next/link";
import { ACCENT } from "./types";

interface Props {
  slug: string;
}

export default function RoomHeader({ slug }: Props) {
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
            Canvas
          </span>
        </div>
      </Link>
      
      <div style={{ 
        fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--ink-soft)", 
        background: "rgba(0,0,0,0.05)", padding: "4px 10px", borderRadius: 6,
        border: "1px solid rgba(0,0,0,0.1)"
      }}>
        {slug}
      </div>
    </div>
  );
}
