"use client";
import { useRouter } from "next/navigation";
import { ACCENT, AMBER, PAPER } from "./Common";

export default function Footer() {
  const router = useRouter();

  return (
    <footer style={{ position: "relative", padding: "80px 56px 40px", background: "var(--ink)", color: "var(--paper)", overflow: "hidden", zIndex: 6 }}>
      <svg style={{ position: "absolute", inset: 0, opacity: 0.07, pointerEvents: "none", width: "100%", height: "100%" } as React.CSSProperties} viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
        <g stroke={PAPER} strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M50 80 C 100 60,160 100,220 80" /><path d="M850 120 L900 120 L900 170 L850 170 Z" />
          <circle cx="1050" cy="200" r="30" /><path d="M120 300 C 200 280,240 340,320 320 S 480 360,560 340" />
          <path d="M700 400 L740 400 M720 380 L720 420" /><path d="M950 450 C 1000 440,1040 470,1080 460" />
        </g>
      </svg>
      <div style={{ maxWidth: 1320, margin: "0 auto", position: "relative" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 48, alignItems: "center", paddingBottom: 60, borderBottom: "1px solid rgba(244,239,230,0.2)" }}>
          <h2 style={{ fontFamily: "'Fraunces',serif", fontWeight: 500, fontSize: "clamp(44px,6vw,88px)", lineHeight: 0.92, letterSpacing: "-0.035em", margin: 0, color: PAPER }}>
            Stop drawing in <em style={{ fontStyle: "italic", color: ACCENT, fontWeight: 400 }}>PowerPoint.</em>
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <button onClick={() => router.push("/canvas")} style={{ background: ACCENT, color: "#fff", border: `1.5px solid ${ACCENT}`, padding: "16px 26px", fontFamily: "'Inter Tight',sans-serif", fontWeight: 600, fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 12, boxShadow: `6px 6px 0 ${PAPER}`, width: "fit-content" }}>
              Open a blank canvas →
            </button>
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: 20, color: AMBER, transform: "rotate(-2deg)", display: "inline-block" }}>↖ no signup, no template, just paper</span>
          </div>
        </div>
        <div style={{ paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "rgba(244,239,230,0.5)" }}>
          <span>© 2026 Canvas · open source · MIT</span>
          <span>made with — and on — Canvas</span>
        </div>
      </div>
      <div style={{ position: "absolute", right: 0, bottom: -30, fontFamily: "'Fraunces',serif", fontStyle: "italic", fontWeight: 300, fontSize: "clamp(80px,14vw,200px)", lineHeight: 0.8, letterSpacing: "-0.05em", color: PAPER, opacity: 0.05, pointerEvents: "none", userSelect: "none" as const }}>canvas.</div>
    </footer>
  );
}
