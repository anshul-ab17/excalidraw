"use client";
import { ACCENT, PAPER, SectionTag } from "./Common";

export default function Features({ addReveal }: { addReveal: (el: Element | null) => void }) {
  return (
    <section style={{ position: "relative", zIndex: 5, minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 56px" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <SectionTag num="004" label="Features" addReveal={addReveal} />
        <div className="section-header-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "end", marginBottom: 60 }}>
          <h2 ref={addReveal} className="reveal" style={{ fontFamily: "'Fraunces',serif", fontWeight: 500, lineHeight: 0.9, letterSpacing: "-0.035em", margin: 0, color: "var(--ink)", fontSize: "clamp(40px,5.5vw,84px)" }}>
            Built for the way <em style={{ fontStyle: "italic", fontWeight: 400 }}>teams really think.</em>
          </h2>
          <p ref={addReveal} className="reveal" style={{ maxWidth: 560, fontSize: 18, lineHeight: 1.5, color: "var(--ink-soft)", margin: "0 0 8px" }}>
            Every feature earns its place. The primitives a sharp team needs to think out loud, together.
          </p>
        </div>
        <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 20 }}>
          {[
            { num: "F.01", title: "Real-time collaboration", body: "Live cursors and shared state. Multiple editors on the same board feel instant.", wide: true, dark: false, accent: false },
            { num: "F.02", title: "The roughness slider.", body: "Pick the exact level of 'I drew this in a meeting' — from architect to napkin.", wide: false, dark: true, accent: false },
            { num: "F.03", title: "AI diagram generation.", body: "Describe a flow in plain text. Get a ready-to-edit diagram on the canvas.", wide: false, dark: false, accent: true },
            { num: "F.04", title: "Guest canvas.", body: "No signup required. Open a blank canvas, share the URL, start drawing.", wide: false, dark: false, accent: false },
            { num: "F.05", title: "Infinite zoom.", body: "No fps drop at 10,000 shapes. The canvas stretches to forever.", wide: false, dark: false, accent: false },
          ].map((f) => (
            <div key={f.num} ref={addReveal} className={`reveal${f.wide ? " feature-wide" : ""}`} style={{
              border: "1.5px solid var(--ink)",
              background: f.accent ? ACCENT : f.dark ? "var(--ink)" : "var(--paper-3)",
              borderRadius: 14, padding: 28, boxShadow: "6px 6px 0 var(--ink)",
              display: "flex", flexDirection: "column", gap: 14, minHeight: 220,
              gridColumn: f.wide ? "span 2" : "span 1",
            }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: f.accent || f.dark ? "rgba(244,239,230,.6)" : "var(--ink-soft)" }}>{f.num}</div>
              <h3 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 28, lineHeight: 1.05, margin: 0, letterSpacing: "-0.02em", color: f.accent || f.dark ? PAPER : "var(--ink)" }}>{f.title}</h3>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.5, color: f.accent ? "rgba(255,255,255,.85)" : f.dark ? "rgba(244,239,230,.65)" : "var(--ink-soft)" }}>{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
