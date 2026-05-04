"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ACCENT } from "./canvas/types";

const INK = "#15130F";
const PAPER = "#F4EFE6";
const PAPER3 = "#FBF8F1";
const INK_SOFT = "#3A352C";
const AMBER = "#F2B84B";
const BLUE = "#A9C8F5";
const GREEN = "#B8DDC4";
const PINK = "#F1B8C2";

export default function Hero() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ background: PAPER, color: INK, fontFamily: "'Inter Tight', system-ui, sans-serif", minHeight: "100vh", position: "relative" }}>

      {/* Grain overlay */}
      <svg
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 3, mixBlendMode: "multiply", opacity: 0.18 } as React.CSSProperties}
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="n">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .6 0"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#n)"/>
      </svg>

      {/* Corner ticks */}
      <div style={{ position: "fixed", top: 58, left: 30, width: 12, height: 12, border: `1px solid ${INK}`, zIndex: 25 }} />
      <div style={{ position: "fixed", top: 58, right: 30, width: 12, height: 12, border: `1px solid ${INK}`, zIndex: 25 }} />
      <div style={{ position: "fixed", top: 64, left: 36, right: 36, height: 1, background: INK, opacity: 0.7, zIndex: 25 }} />

      {/* ── Navbar ── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 36px",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12, letterSpacing: "0.04em",
        background: `rgba(244,239,230,${scrolled ? "0.94" : "0.84"})`,
        backdropFilter: "blur(10px)",
        borderBottom: scrolled ? `1px solid ${INK}` : "1px solid transparent",
        transition: "border-color 0.3s, background 0.3s",
      }}>
        <button
          onClick={() => router.push("/")}
          style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 22, color: INK, background: "none", border: "none", cursor: "pointer", letterSpacing: "-0.01em" }}
        >
          <span style={{ width: 14, height: 14, borderRadius: "50%", background: ACCENT, boxShadow: `3px 3px 0 ${INK}`, display: "inline-block", transform: "translateY(-2px)" }} />
          Canvas
        </button>

        <nav style={{ display: "flex", gap: 28 }}>
          <NavBtn label="Canvas" onClick={() => router.push("/canvas")} />
          <NavBtn label="Dashboard" onClick={() => router.push("/dashboard")} />
        </nav>

        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 10px", border: `1px solid ${INK}`, borderRadius: 999, fontSize: 12, color: INK }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#2E8A6A", display: "inline-block", animation: "pulse 1.8s infinite" }} />

          </span>
          {isLoggedIn ? (
            <NavBtn label="Dashboard →" onClick={() => router.push("/dashboard")} />
          ) : (
            <NavBtn label="Sign in →" onClick={() => router.push("/signin")} />
          )}
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ position: "relative", minHeight: "100vh", paddingTop: 100, overflow: "hidden" }}>
        <div style={{
          position: "relative",
          height: "calc(100vh - 100px)",
          display: "grid",
          gridTemplateColumns: "1.05fr 1fr",
          alignItems: "center",
          padding: "20px 56px 80px",
          gap: 32,
          zIndex: 5,
        }}>
          {/* Left copy */}
          <div style={{ position: "relative", zIndex: 6 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: INK_SOFT, display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
              <span style={{ background: INK, color: PAPER, padding: "3px 8px", letterSpacing: "0.05em", fontSize: 11 }}>001</span>
              <span>An infinite canvas, made tangible</span>
            </div>

            <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, lineHeight: 0.9, letterSpacing: "-0.035em", margin: 0, color: INK, fontSize: "clamp(52px, 7.5vw, 118px)" }}>
              Draw<span style={{ color: ACCENT }}>.</span>{" "}
              <em style={{ fontStyle: "italic", fontWeight: 400 }}>Think</em>
              <span style={{ color: ACCENT }}>.</span><br />
              <span style={{ position: "relative", display: "inline-block" }}>
                Ship
                <svg style={{ position: "absolute", left: "-6%", bottom: "-8%", width: "112%", height: "38%", pointerEvents: "none" }} viewBox="0 0 200 30" preserveAspectRatio="none">
                  <path d="M3 22 C 40 6, 90 8, 140 14 S 195 22, 197 18" stroke={ACCENT} strokeWidth="6" fill="none" strokeLinecap="round" opacity=".5"/>
                </svg>
              </span>{" "}
              <span style={{ color: INK_SOFT }}>together.</span>
            </h1>

            <p style={{ maxWidth: 520, fontSize: 18, lineHeight: 1.55, color: INK_SOFT, marginTop: 30, marginBottom: 0 }}>
              Canvas is the hand-drawn whiteboard for serious teams. Sketch wireframes,
              diagram systems, and run live workshops on a canvas that feels like{" "}
              <em style={{ fontFamily: "'Caveat', cursive", fontStyle: "normal", fontSize: "1.2em", color: ACCENT }}>real paper</em>
              {" "}— except it never runs out.
            </p>

            <div style={{ marginTop: 38, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
              <HardButton onClick={() => router.push("/canvas")} primary>
                Open a blank canvas →
              </HardButton>
              <HardButton onClick={() => router.push("/signin")} ghost>
                Sign in
              </HardButton>
            </div>

            <div style={{ marginTop: 28, fontFamily: "'Caveat', cursive", color: ACCENT, fontSize: 22, display: "flex", alignItems: "center", gap: 10, transform: "rotate(-2deg)", width: "fit-content" }}>
              <svg width="44" height="32" viewBox="0 0 44 32" fill="none">
                <path d="M2 14 C 12 4, 24 26, 38 14" stroke={ACCENT} strokeWidth="2" strokeLinecap="round"/>
                <path d="M34 9 L 38 14 L 33 18" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              drag the canvas — it&rsquo;s alive
            </div>
          </div>

          {/* Right: canvas mockup */}
          <div style={{ position: "relative", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: 520, background: PAPER3, border: `1.5px solid ${INK}`, boxShadow: `12px 12px 0 ${INK}`, borderRadius: 18, overflow: "hidden", aspectRatio: "16/10", position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(21,19,15,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(21,19,15,.06) 1px, transparent 1px)`, backgroundSize: "22px 22px" }} />
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 24, borderBottom: `1px solid rgba(21,19,15,.18)`, display: "flex", alignItems: "center", padding: "0 8px", gap: 5, background: "rgba(251,248,241,0.95)", zIndex: 2 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: ACCENT, border: `1px solid ${INK}`, display: "inline-block" }} />
                <span style={{ width: 7, height: 7, borderRadius: "50%", border: `1px solid ${INK}`, display: "inline-block" }} />
                <span style={{ width: 7, height: 7, borderRadius: "50%", border: `1px solid ${INK}`, display: "inline-block" }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, marginLeft: 8, color: INK_SOFT }}>untitled-canvas.cnvx</span>
              </div>
              <svg viewBox="0 0 520 296" style={{ position: "absolute", top: 24, left: 0, width: "100%", height: "calc(100% - 24px)" }}>
                <rect x="60" y="70" width="120" height="60" rx="6" fill={PAPER3} stroke={INK} strokeWidth="2"/>
                <rect x="220" y="30" width="120" height="60" rx="6" fill={BLUE} stroke={INK} strokeWidth="2"/>
                <rect x="220" y="150" width="120" height="60" rx="6" fill={GREEN} stroke={INK} strokeWidth="2"/>
                <rect x="375" y="90" width="110" height="60" rx="6" fill={PINK} stroke={INK} strokeWidth="2"/>
                <path d="M180 100 C200 95,210 68,220 65" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M214 65 L220 65 L218 60" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M180 106 C200 122,210 168,220 178" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M214 178 L220 178 L218 173" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M340 60 C360 72,368 90,376 108" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M372 103 L376 108 L371 109" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M340 180 C360 166,368 146,376 130" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M372 135 L376 130 L371 129" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round"/>
                <text x="120" y="106" textAnchor="middle" fontFamily="Caveat" fontSize="22" fontWeight="700" fill={INK}>Idea</text>
                <text x="280" y="66" textAnchor="middle" fontFamily="Caveat" fontSize="20" fontWeight="700" fill={INK}>Sketch</text>
                <text x="280" y="186" textAnchor="middle" fontFamily="Caveat" fontSize="20" fontWeight="700" fill={INK}>Specs</text>
                <text x="430" y="126" textAnchor="middle" fontFamily="Caveat" fontSize="22" fontWeight="700" fill={INK}>Ship it</text>
                <text x="50" y="258" fontFamily="Caveat" fontSize="21" fill={ACCENT} fontWeight="700">flow looks good?</text>
                <path d="M180 252 C210 246,220 238,232 224" stroke={ACCENT} strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M226 223 L232 224 L229 219" stroke={ACCENT} strokeWidth="2" fill="none" strokeLinecap="round"/>
                <circle cx="456" cy="26" r="13" fill={AMBER} stroke={INK} strokeWidth="1.5"/>
                <circle cx="473" cy="26" r="13" fill={BLUE} stroke={INK} strokeWidth="1.5"/>
                <text x="456" y="30" textAnchor="middle" fontFamily="Inter Tight" fontSize="10" fontWeight="700" fill={INK}>MA</text>
                <text x="473" y="30" textAnchor="middle" fontFamily="Inter Tight" fontSize="10" fontWeight="700" fill={INK}>JS</text>
              </svg>
            </div>
          </div>
        </div>


      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ position: "relative", zIndex: 5, padding: "120px 56px", background: "#EDE6D8" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <SectionTag num="002" label="How it works" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "end", marginBottom: 60 }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, lineHeight: 0.9, letterSpacing: "-0.035em", margin: 0, color: INK, fontSize: "clamp(40px, 5.5vw, 84px)" }}>
              From blank page to{" "}
              <em style={{ fontStyle: "italic", fontWeight: 400 }}>shipped diagram</em>{" "}
              in four steps.
            </h2>
            <p style={{ maxWidth: 560, fontSize: 18, lineHeight: 1.5, color: INK_SOFT, margin: "0 0 8px" }}>
              Built around the rhythm of a real workshop:{" "}
              {(["open", "sketch", "discuss", "archive"] as const).map((w, i) => (
                <span key={w}>
                  <em style={{ fontFamily: "'Caveat', cursive", fontStyle: "normal", fontSize: "1.15em", color: ACCENT }}>{w}</em>
                  {i < 3 ? ", " : "."}
                </span>
              ))}
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
            {[
              { n: "01", title: "Open a blank canvas.", body: "One click — no project, no folder, no setup. The URL is the document." },
              { n: "02", title: "Sketch with intent.", body: "Twelve tools, keyboard shortcuts for everything. Hand-drawn aesthetic, exact snapping." },
              { n: "03", title: "Discuss, live.", body: "Live cursors and chat on the canvas. No 'let me share my screen' ever again." },
              { n: "04", title: "Ship & archive.", body: "Export to PNG or SVG. Self-host for complete control." },
            ].map((s) => (
              <div key={s.n} style={{ position: "relative", border: `1.5px solid ${INK}`, background: PAPER3, borderRadius: 14, padding: "28px 24px 24px", boxShadow: `6px 6px 0 ${INK}`, display: "flex", flexDirection: "column", gap: 16, minHeight: 260 }}>
                <div style={{ position: "absolute", top: -22, right: -12, fontFamily: "'Fraunces', serif", fontWeight: 600, fontStyle: "italic", fontSize: 84, lineHeight: 1, color: ACCENT, textShadow: `2px 2px 0 ${INK}` }}>{s.n}</div>
                <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 24, lineHeight: 1.05, margin: 0, letterSpacing: "-0.02em", color: INK }}>{s.title}</h3>
                <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.5, color: INK_SOFT }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ position: "relative", zIndex: 5, padding: "120px 56px" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <SectionTag num="003" label="Features" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "end", marginBottom: 60 }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, lineHeight: 0.9, letterSpacing: "-0.035em", margin: 0, color: INK, fontSize: "clamp(40px, 5.5vw, 84px)" }}>
              Built for the way{" "}
              <em style={{ fontStyle: "italic", fontWeight: 400 }}>teams really think.</em>
            </h2>
            <p style={{ maxWidth: 560, fontSize: 18, lineHeight: 1.5, color: INK_SOFT, margin: "0 0 8px" }}>
              Every feature earns its place. The primitives a sharp team needs to think out loud, together.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 20 }}>
            {[
              { num: "F.01", title: "Real-time collaboration", body: "Live cursors and shared state. Multiple editors on the same board feel instant.", wide: true, accent: false, dark: false },
              { num: "F.02", title: "The roughness slider.", body: "Pick the exact level of 'I drew this in a meeting' — from architect to napkin.", wide: false, accent: false, dark: true },
              { num: "F.03", title: "AI diagram generation.", body: "Describe a flow in plain text. Get a ready-to-edit diagram on the canvas.", wide: false, accent: true, dark: false },
              { num: "F.04", title: "Guest canvas.", body: "No signup required. Open a blank canvas, share the URL, start drawing.", wide: false, accent: false, dark: false },
              { num: "F.05", title: "Infinite zoom.", body: "No fps drop at 10,000 shapes. The canvas stretches to forever.", wide: false, accent: false, dark: false },
            ].map((f) => (
              <div
                key={f.num}
                style={{
                  border: `1.5px solid ${INK}`,
                  background: f.accent ? ACCENT : f.dark ? INK : PAPER3,
                  borderRadius: 14,
                  padding: 28,
                  boxShadow: `6px 6px 0 ${INK}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  minHeight: 220,
                  gridColumn: f.wide ? "span 2" : "span 1",
                }}
              >
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: f.accent || f.dark ? "rgba(244,239,230,0.6)" : INK_SOFT }}>{f.num}</div>
                <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 28, lineHeight: 1.05, margin: 0, letterSpacing: "-0.02em", color: f.accent || f.dark ? PAPER : INK }}>{f.title}</h3>
                <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.5, color: f.accent ? "rgba(255,255,255,0.85)" : f.dark ? "rgba(244,239,230,0.65)" : INK_SOFT }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ position: "relative", padding: "80px 56px 40px", background: INK, color: PAPER, overflow: "hidden", zIndex: 6 }}>
        <svg style={{ position: "absolute", inset: 0, opacity: 0.07, pointerEvents: "none", width: "100%", height: "100%" } as React.CSSProperties} viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
          <g stroke={PAPER} strokeWidth="2" fill="none" strokeLinecap="round">
            <path d="M50 80 C 100 60, 160 100, 220 80"/>
            <path d="M850 120 L900 120 L900 170 L850 170 Z"/>
            <circle cx="1050" cy="200" r="30"/>
            <path d="M120 300 C 200 280, 240 340, 320 320 S 480 360, 560 340"/>
            <path d="M700 400 L740 400 M720 380 L720 420"/>
            <path d="M950 450 C 1000 440, 1040 470, 1080 460"/>
          </g>
        </svg>

        <div style={{ maxWidth: 1320, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 48, alignItems: "center", paddingBottom: 60, borderBottom: "1px solid rgba(244,239,230,0.2)" }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: "clamp(44px, 6vw, 88px)", lineHeight: 0.92, letterSpacing: "-0.035em", margin: 0, color: PAPER }}>
              Stop drawing in{" "}
              <em style={{ fontStyle: "italic", color: ACCENT, fontWeight: 400 }}>PowerPoint.</em>
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <button
                onClick={() => router.push("/canvas")}
                style={{ background: ACCENT, color: "#fff", border: `1.5px solid ${ACCENT}`, padding: "16px 26px", fontFamily: "'Inter Tight', sans-serif", fontWeight: 600, fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 12, boxShadow: `6px 6px 0 ${PAPER}`, width: "fit-content" }}
              >
                Open a blank canvas →
              </button>
              <span style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: AMBER, transform: "rotate(-2deg)", display: "inline-block" }}>
                ↖ no signup, no template, just paper
              </span>
            </div>
          </div>

          <div style={{ paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "rgba(244,239,230,0.5)" }}>
            <span>© 2026 Canvas · open source · MIT</span>
            <span>made with — and on — Canvas</span>
          </div>
        </div>

        <div style={{ position: "absolute", right: 0, bottom: -30, fontFamily: "'Fraunces', serif", fontStyle: "italic", fontWeight: 300, fontSize: "clamp(80px, 14vw, 200px)", lineHeight: 0.8, letterSpacing: "-0.05em", color: PAPER, opacity: 0.05, pointerEvents: "none", userSelect: "none" as const }}>
          canvas.
        </div>
      </footer>
    </div>
  );
}

/* ── Helpers ── */

function NavBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ color: INK, background: "none", border: "none", cursor: "pointer", textTransform: "uppercase" as const, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em" }}
    >
      {label}
    </button>
  );
}

function HardButton({ onClick, children, primary, ghost }: { onClick: () => void; children: React.ReactNode; primary?: boolean; ghost?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const base: React.CSSProperties = {
    border: `1.5px solid ${INK}`,
    padding: "15px 26px",
    fontFamily: "'Inter Tight', sans-serif",
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    transition: "transform 0.25s, box-shadow 0.25s, background 0.2s",
    transform: hovered ? "translate(-2px,-2px)" : "translate(0,0)",
  };
  if (ghost) {
    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ ...base, background: hovered ? INK : "transparent", color: hovered ? PAPER : INK, boxShadow: "none" }}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ ...base, background: primary ? ACCENT : INK, color: "#fff", borderColor: primary ? ACCENT : INK, boxShadow: hovered ? `8px 8px 0 ${INK}` : `6px 6px 0 ${INK}` }}
    >
      {children}
    </button>
  );
}

function SectionTag({ num, label }: { num: string; label: string }) {
  return (
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: INK_SOFT, display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
      <span style={{ background: INK, color: PAPER, padding: "3px 8px", letterSpacing: "0.05em", fontSize: 11 }}>{num}</span>
      <span>{label}</span>
      <span style={{ flex: 1, height: 1, background: INK, opacity: 0.35 }} />
    </div>
  );
}
