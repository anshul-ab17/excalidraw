"use client";
import { useState } from "react";
import { ACCENT as CANV_ACCENT } from "../canvas/types";

export const INK = "#15130F";
export const PAPER = "#F4EFE6";
export const PAPER3 = "#FBF8F1";
export const INK_SOFT = "#3A352C";
export const AMBER = "#F2B84B";
export const BLUE = "#A9C8F5";
export const GREEN = "#B8DDC4";
export const PINK = "#F1B8C2";
export const ACCENT3 = "#3D6BE5";
export const ACCENT4 = "#2E8A6A";
export const ACCENT = CANV_ACCENT;

export function NavBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="nav-link" style={{ background: "none", border: "none", cursor: "pointer", textTransform: "uppercase" as const, fontSize: 12, fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.04em", padding: 0 }}>
      {label}
    </button>
  );
}

export function HardButton({ onClick, children, primary, ghost }: { onClick: () => void; children: React.ReactNode; primary?: boolean; ghost?: boolean }) {
  const [hov, setHov] = useState(false);
  const base: React.CSSProperties = {
    border: `1.5px solid ${INK}`, padding: "15px 26px",
    fontFamily: "'Inter Tight',sans-serif", fontWeight: 600, fontSize: 15,
    cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 12,
    transition: "transform 0.25s, box-shadow 0.25s, background 0.2s",
    transform: hov ? "translate(-2px,-2px)" : "translate(0,0)",
  };
  if (ghost) return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ ...base, background: hov ? INK : "transparent", color: hov ? PAPER : INK, boxShadow: "none" }}>
      {children}
    </button>
  );
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ ...base, background: primary ? ACCENT : INK, color: "#fff", borderColor: primary ? ACCENT : INK, boxShadow: hov ? `8px 8px 0 ${INK}` : `6px 6px 0 ${INK}` }}>
      {children}
    </button>
  );
}

export function SectionTag({ num, label, addReveal }: { num: string; label: string; addReveal?: (el: Element | null) => void }) {
  return (
    <div ref={addReveal} className="reveal" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: INK_SOFT, display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
      <span style={{ background: INK, color: PAPER, padding: "3px 8px", fontSize: 11 }}>{num}</span>
      <span>{label}</span>
      <span style={{ flex: 1, height: 1, background: "var(--rule, #1B1814)", opacity: 0.4 }} />
    </div>
  );
}
