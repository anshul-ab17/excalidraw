"use client";
import { useEffect, useRef, useState } from "react";
import { ACCENT, INK, PAPER3, AMBER, BLUE, GREEN, ACCENT4, SectionTag } from "./Common";

export default function HowItWorks({ addReveal }: { addReveal: (el: Element | null) => void }) {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        const i = parseInt((e.target as HTMLElement).dataset.stepIdx ?? "0");
        setVisibleSteps(prev => {
          if (e.isIntersecting) return prev.includes(i) ? prev : [...prev, i];
          return prev.filter(x => x !== i);
        });
      }),
      { threshold: 0.15 }
    );
    stepRefs.current.forEach(el => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="how-it-works" style={{ position: "relative", zIndex: 5, minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 56px", background: "var(--paper-2)" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <SectionTag num="003" label="How it works" addReveal={addReveal} />
        <div className="section-header-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "end", marginBottom: 60 }}>
          <h2 ref={addReveal} className="reveal" style={{ fontFamily: "'Fraunces',serif", fontWeight: 500, lineHeight: 0.9, letterSpacing: "-0.035em", margin: 0, color: "var(--ink)", fontSize: "clamp(40px,5.5vw,84px)" }}>
            From blank page to <em style={{ fontStyle: "italic", fontWeight: 400 }}>shipped diagram</em> in four steps.
          </h2>
          <p ref={addReveal} className="reveal" style={{ maxWidth: 560, fontSize: 18, lineHeight: 1.5, color: "var(--ink-soft)", margin: "0 0 8px" }}>
            Built around the rhythm of a real workshop:{" "}
            {(["open", "sketch", "discuss", "archive"] as const).map((w, i) => (
              <span key={w}><em style={{ fontFamily: "'Caveat',cursive", fontStyle: "normal", fontSize: "1.15em", color: ACCENT }}>{w}</em>{i < 3 ? ", " : "."}</span>
            ))}
          </p>
        </div>

        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "20vh",
          paddingBottom: "10vh",
          maxWidth: 900,
          margin: "0 auto"
        }}>
          {[
            { n: "01", title: "Open a blank canvas.", body: "One click — no project, no folder, no setup. The URL is the document. Share it and you're collaborating.", visual: <svg width="120" height="80" viewBox="0 0 120 80"><rect x="10" y="14" width="100" height="56" rx="6" fill={PAPER3} stroke={INK} strokeWidth="2" /><line x1="20" y1="6" x2="20" y2="20" stroke={INK} strokeWidth="2.5" strokeLinecap="round" /><line x1="100" y1="6" x2="100" y2="20" stroke={INK} strokeWidth="2.5" strokeLinecap="round" /></svg> },
            { n: "02", title: "Sketch with intent.", body: "Twelve tools, keyboard shortcuts for everything. Hand-drawn aesthetic, but the snapping is exact.", visual: <svg width="140" height="80" viewBox="0 0 140 80"><rect x="20" y="14" width="50" height="40" rx="4" fill={BLUE} stroke={INK} strokeWidth="2" /><circle cx="100" cy="34" r="20" fill={AMBER} stroke={INK} strokeWidth="2" /><path d="M70 34 C 80 30,85 38,80 34" stroke={ACCENT} strokeWidth="2" fill="none" strokeLinecap="round" /></svg> },
            { n: "03", title: "Discuss, live.", body: "Cursors and shared state — all on the canvas. No 'let me share my screen' ever again.", visual: <svg width="140" height="80" viewBox="0 0 140 80"><circle cx="40" cy="40" r="14" fill={AMBER} stroke={INK} strokeWidth="2" /><circle cx="68" cy="40" r="14" fill={BLUE} stroke={INK} strokeWidth="2" /><circle cx="96" cy="40" r="14" fill={GREEN} stroke={INK} strokeWidth="2" /><text x="40" y="44" textAnchor="middle" fontFamily="Inter Tight" fontSize="11" fontWeight="700" fill={INK}>M</text><text x="68" y="44" textAnchor="middle" fontFamily="Inter Tight" fontSize="11" fontWeight="700" fill={INK}>J</text><text x="96" y="44" textAnchor="middle" fontFamily="Inter Tight" fontSize="11" fontWeight="700" fill={INK}>T</text></svg> },
            { n: "04", title: "Ship & archive.", body: "Export to PNG or SVG. Self-host for complete control. The board lives at a URL forever.", visual: <svg width="120" height="80" viewBox="0 0 120 80"><rect x="20" y="14" width="80" height="50" rx="4" fill={PAPER3} stroke={INK} strokeWidth="2" /><path d="M30 30 L60 50 L90 22" stroke={ACCENT4} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> },
          ].map((s, i) => (
            <div key={s.n}
              ref={el => { stepRefs.current[i] = el; }}
              data-step-idx={String(i)}
              style={{
                position: "sticky", top: 140 + (i * 32),
                border: "1.5px solid var(--ink)", background: "var(--paper-3)",
                borderRadius: 16, padding: "32px 32px 32px",
                boxShadow: "8px 8px 0 var(--ink)",
                display: "flex", flexDirection: "row", gap: 32, alignItems: "center",
                minHeight: 280,
                opacity: visibleSteps.includes(i) ? 1 : 0,
                transform: visibleSteps.includes(i) ? "translateY(0) scale(1)" : "translateY(100px) scale(0.95)",
                transition: `all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)`,
                zIndex: i,
              }}>
              <div style={{ position: "absolute", top: -22, right: -12, fontFamily: "'Fraunces',serif", fontWeight: 600, fontStyle: "italic", fontSize: 84, lineHeight: 1, color: ACCENT, textShadow: `2px 2px 0 ${INK}` }}>{s.n}</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 32, lineHeight: 1.05, margin: "0 0 16px", letterSpacing: "-0.02em", color: "var(--ink)" }}>{s.title}</h3>
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "var(--ink-soft)" }}>{s.body}</p>
              </div>
              <div style={{ width: 240, height: 160, border: "1.2px solid var(--ink)", borderRadius: 12, background: "var(--paper)", backgroundImage: "linear-gradient(rgba(21,19,15,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(21,19,15,.06) 1px,transparent 1px)", backgroundSize: "18px 18px", display: "grid", placeItems: "center", flexShrink: 0 }}>
                {s.visual}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
