"use client";
import { useRouter } from "next/navigation";
import { ACCENT, INK, PAPER3, AMBER, BLUE, GREEN, PINK, ACCENT3, ACCENT4, HardButton, SectionTag } from "./Common";

export default function PreviewSection({ addReveal }: { addReveal: (el: Element | null) => void }) {
  const router = useRouter();

  return (
    <section style={{ position: "relative", zIndex: 5, minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 56px" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <SectionTag num="002" label="A peek inside /canvas" addReveal={addReveal} />

        <div className="section-header-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "end" }}>
          <h2 ref={addReveal} className="reveal" style={{ fontFamily: "'Fraunces',serif", fontWeight: 500, lineHeight: 0.9, letterSpacing: "-0.035em", margin: 0, color: "var(--ink)", fontSize: "clamp(40px,5.5vw,84px)" }}>
            The whiteboard, <em style={{ fontStyle: "italic", fontWeight: 400 }}>unboxed.</em>
          </h2>
          <p ref={addReveal} className="reveal" style={{ maxWidth: 560, fontSize: 18, lineHeight: 1.5, color: "var(--ink-soft)", margin: "0 0 8px" }}>
            Twelve tools. Six fill styles. One{" "}
            <em style={{ fontFamily: "'Caveat',cursive", fontStyle: "normal", fontSize: "1.2em", color: ACCENT }}>delightful</em>{" "}
            roughness slider. Every shape is hand-drawn and the canvas stretches to forever.
          </p>
        </div>

        {/* Canvas preview mockup */}
        <div ref={addReveal} className="reveal canvas-preview-wrap">
          <div className="cp-brand"><span className="dot" />Canvas</div>

          <div className="cp-toolbar">
            {[
              <svg key="sel" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3 L5 19 L9 15 L12 21 L15 20 L12 14 L19 14 Z" /></svg>,
              <svg key="rect" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>,
              <svg key="dia" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M12 3 L21 12 L12 21 L3 12 Z" /></svg>,
              <svg key="cir" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="8" /></svg>,
              <svg key="lin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 19 L19 5" /></svg>,
              <svg key="arr" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12h14M14 6l6 6-6 6" /></svg>,
              <svg key="pen" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l3-1 12-12-2-2L4 18l-1 3z" /></svg>,
              <svg key="txt" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7V5h16v2M9 20h6M12 5v15" /></svg>,
            ].map((icon, i) => (
              <button key={i} className={`t${i === 1 ? " on" : ""}`}>{icon}</button>
            ))}
          </div>

          <div className="cp-actions">
            <div className="pill">↗ Sign in to collaborate</div>
            <div className="pill accent">Sign In</div>
          </div>

          <div className="cp-props">
            <h5>Stroke</h5>
            <div className="row">
              {[INK, ACCENT, ACCENT3, ACCENT4, AMBER].map((c, i) => (
                <div key={c} className={`sw${i === 0 ? " on" : ""}`} style={{ background: c }} />
              ))}
            </div>
            <h5>Fill</h5>
            <div className="row">
              {[null, PINK, BLUE, GREEN].map((c, i) => (
                <div key={i} className={`sw${i === 0 ? " on" : ""}`} style={{
                  background: !c ? "repeating-linear-gradient(45deg,transparent 0 3px,#7A7264 3px 4px),#FBF8F1" : c
                }} />
              ))}
            </div>
            <h5>Width</h5>
            <div className="seg"><div className="on"></div><div>━</div><div>█</div></div>
            <h5>Roughness</h5>
            <div style={{ height: 4, background: "rgba(21,19,15,0.2)", borderRadius: 2, position: "relative" }}>
              <div style={{ position: "absolute", left: "55%", top: "50%", transform: "translate(-50%,-50%)", width: 10, height: 10, borderRadius: "50%", background: ACCENT, border: `1.2px solid ${INK}` }} />
            </div>
          </div>

          <svg className="cp-art" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid meet">
            <defs>
              <pattern id="hatch2" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="8" stroke={ACCENT} strokeWidth="1.4" opacity=".5" />
              </pattern>
            </defs>
            <rect x="500" y="240" width="240" height="160" rx="10" fill="none" stroke={INK} strokeWidth="2.5" strokeDasharray="4 4" opacity=".5" />
            <rect x="500" y="240" width="240" height="160" rx="10" fill="none" stroke={INK} strokeWidth="2.5" />
            <rect x="500" y="240" width="240" height="160" rx="10" fill="url(#hatch2)" />
            <text x="620" y="328" textAnchor="middle" fontFamily="Caveat" fontSize="30" fontWeight="700" fill={INK}>my canvas</text>
            <circle cx="500" cy="240" r="5" fill={PAPER3} stroke={ACCENT} strokeWidth="1.5" />
            <circle cx="740" cy="240" r="5" fill={PAPER3} stroke={ACCENT} strokeWidth="1.5" />
            <circle cx="500" cy="400" r="5" fill={PAPER3} stroke={ACCENT} strokeWidth="1.5" />
            <circle cx="740" cy="400" r="5" fill={PAPER3} stroke={ACCENT} strokeWidth="1.5" />
          </svg>

          <div className="cp-dock">
            <button className="b"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14L4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-2" /></svg></button>
            <button className="b" style={{ opacity: 0.4 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14l5-5-5-5" /><path d="M20 9H9a5 5 0 0 0 0 10h2" /></svg></button>
            <button className="b">−</button>
            <span style={{ padding: "0 6px" }}>100%</span>
            <button className="b">+</button>
            <button className="b" style={{ color: ACCENT }}>⌫</button>
            <button className="b accent">↓</button>
            <button className="b">⌭</button>
          </div>
        </div>

        <div ref={addReveal} className="reveal" style={{ marginTop: 36, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <HardButton onClick={() => router.push("/canvas")} primary>Open the canvas →</HardButton>
          <span style={{ fontFamily: "'Caveat',cursive", color: ACCENT, fontSize: 22, transform: "rotate(-2deg)", display: "inline-block" }}>
            ↖ no signup, no template, just paper
          </span>
        </div>
      </div>
    </section>
  );
}
