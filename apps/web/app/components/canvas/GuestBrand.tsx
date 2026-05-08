import Link from "next/link";
import { ACCENT } from "./types";

export default function GuestBrand() {
  return (
    <Link href="/" style={{ position: "fixed", top: 16, left: 16, zIndex: 10, textDecoration: "none" }}>
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
        transition: "transform 0.2s"
      }}>
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: ACCENT, boxShadow: "1.5px 1.5px 0 var(--ink, #15130F)", display: "inline-block", flexShrink: 0 }} />
        <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Fraunces', serif", color: "var(--ink, #15130F)", letterSpacing: "-0.01em" }}>
          Canvex
        </span>
      </div>
    </Link>
  );
}
