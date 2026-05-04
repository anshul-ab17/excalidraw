"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ACCENT, INK, PAPER, INK_SOFT, AMBER, BLUE, GREEN, PINK, ACCENT3, ACCENT4, HardButton } from "./Common";

const LAYERS = [
  { depth: -180, ml: -260, mt: -180, orig: "translate3d(-30px,30px,-180px) rotateX(6deg) rotateY(-14deg) rotateZ(-3deg)" },
  { depth: -40, ml: -340, mt: -160, orig: "translate3d(0,0,-40px) rotateY(8deg)" },
  { depth: 40, ml: -200, mt: -130, orig: "translate3d(40px,-10px,40px) rotateX(-4deg) rotateY(10deg) rotateZ(2deg)" },
  { depth: 100, ml: 120, mt: -220, orig: "translate3d(120px,-100px,100px) rotate(7deg)" },
  { depth: 80, ml: -360, mt: 60, orig: "translate3d(-80px,80px,80px) rotate(-6deg)" },
  { depth: 140, ml: 140, mt: 80, orig: "translate3d(140px,80px,140px) rotate(-4deg)" },
  { depth: 160, ml: -340, mt: -220, orig: "translate3d(-40px,-120px,160px)" },
  { depth: 200, ml: -40, mt: -40, orig: "translate3d(-20px,-30px,200px)" },
  { depth: 220, ml: 120, mt: 0, orig: "translate3d(160px,40px,220px)" },
  { depth: 60, ml: -300, mt: -30, orig: "translate3d(-180px,-20px,60px) rotate(45deg)" },
  { depth: 120, ml: 300, mt: 120, orig: "translate3d(220px,140px,120px)" },
  { depth: 180, ml: -260, mt: 140, orig: "translate3d(-160px,160px,180px) rotate(-6deg)" },
  { depth: 160, ml: 50, mt: -260, orig: "translate3d(60px,-180px,160px) rotate(4deg)" },
] as const;

function L(i: number) { return LAYERS[i]!; }

export default function HeroSection({ scrollTo }: { scrollTo: (id: string) => void }) {
  const router = useRouter();
  const stageRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<Array<HTMLDivElement | null>>([]);

  const layerRef = (i: number) => (el: HTMLDivElement | null) => { layerRefs.current[i] = el; };

  useEffect(() => {
    const stage = stageRef.current;
    const scene = sceneRef.current;
    if (!stage || !scene) return;

    const p = {
      targetRX: -4, targetRY: 8, curRX: -4, curRY: 8,
      dragging: false,
      dragStart: { x: 0, y: 0 }, dragBase: { rx: -4, ry: 8 },
      mouseNX: 0, mouseNY: 0, raf: 0,
    };

    const onStageMM = (e: MouseEvent) => {
      const r = stage.getBoundingClientRect();
      p.mouseNX = ((e.clientX - r.left) / r.width - 0.5) * 2;
      p.mouseNY = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!p.dragging) {
        p.targetRY = 8 + p.mouseNX * 14;
        p.targetRX = -4 - p.mouseNY * 10;
      }
    };
    const onStageMD = (e: MouseEvent) => {
      p.dragging = true;
      p.dragStart = { x: e.clientX, y: e.clientY };
      p.dragBase = { rx: p.curRX, ry: p.curRY };
      scene.style.transition = "none";
    };
    const onWinMU = () => { p.dragging = false; scene.style.transition = ""; };
    const onWinMM = (e: MouseEvent) => {
      if (!p.dragging) return;
      p.targetRY = p.dragBase.ry + (e.clientX - p.dragStart.x) * 0.25;
      p.targetRX = p.dragBase.rx - (e.clientY - p.dragStart.y) * 0.18;
    };

    const tick = () => {
      p.curRX += (p.targetRX - p.curRX) * 0.08;
      p.curRY += (p.targetRY - p.curRY) * 0.08;
      scene.style.transform = `rotateX(${p.curRX}deg) rotateY(${p.curRY}deg)`;
      const t = performance.now() * 0.001;
      layerRefs.current.forEach((el, i) => {
        if (!el) return;
        const { depth, orig } = LAYERS[i] ?? {};
        if (depth === undefined) return;
        const bob = Math.sin(t * 0.8 + i * 0.7) * (depth > 0 ? 4 : 2);
        const px = p.mouseNX * depth * 0.05;
        const py = p.mouseNY * depth * 0.05;
        el.style.transform = `${orig} translate3d(${px}px,${py + bob}px,0)`;
      });
      p.raf = requestAnimationFrame(tick);
    };

    stage.addEventListener("mousemove", onStageMM);
    stage.addEventListener("mousedown", onStageMD);
    window.addEventListener("mouseup", onWinMU);
    window.addEventListener("mousemove", onWinMM);
    p.raf = requestAnimationFrame(tick);
    return () => {
      stage.removeEventListener("mousemove", onStageMM);
      stage.removeEventListener("mousedown", onStageMD);
      window.removeEventListener("mouseup", onWinMU);
      window.removeEventListener("mousemove", onWinMM);
      cancelAnimationFrame(p.raf);
    };
  }, []);

  return (
    <section style={{ position: "relative", minHeight: "100vh", paddingTop: 100, overflow: "hidden" }}>
      <div style={{ position: "relative", height: "calc(100vh - 100px)", display: "grid", gridTemplateColumns: "1.05fr 1fr", alignItems: "center", padding: "20px 56px 80px", gap: 32, zIndex: 5 }}>

        {/* Left copy */}
        <div style={{ position: "relative", zIndex: 6 }}>
          <div className="rise" style={{ animationDelay: "0.05s", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "var(--ink-soft)", display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
            <span style={{ background: "var(--ink)", color: "var(--paper)", padding: "3px 8px", fontSize: 11 }}>001</span>
            <span>An infinite canvas, made tangible</span>
          </div>

          <h1 className="rise" style={{ animationDelay: "0.15s", fontFamily: "'Fraunces',serif", fontWeight: 500, lineHeight: 0.9, letterSpacing: "-0.035em", margin: 0, color: "var(--ink)", fontSize: "clamp(52px,7.5vw,118px)" }}>
            Draw<span style={{ color: ACCENT }}>.</span>{" "}
            <em style={{ fontStyle: "italic", fontWeight: 400 }}>Think</em><span style={{ color: ACCENT }}>.</span><br />
            <span style={{ position: "relative", display: "inline-block" }}>
              Ship
              <svg style={{ position: "absolute", left: "-6%", bottom: "-8%", width: "112%", height: "38%", pointerEvents: "none" }} viewBox="0 0 200 30" preserveAspectRatio="none">
                <path d="M3 22 C 40 6, 90 8, 140 14 S 195 22, 197 18" stroke={ACCENT} strokeWidth="6" fill="none" strokeLinecap="round" opacity=".5" />
              </svg>
            </span>{" "}
            <span style={{ color: "var(--ink-soft)" }}>together.</span>
          </h1>

          <p className="rise" style={{ animationDelay: "0.3s", maxWidth: 520, fontSize: 18, lineHeight: 1.55, color: "var(--ink-soft)", marginTop: 30, marginBottom: 0 }}>
            Canvas is the hand-drawn whiteboard for serious teams. Sketch wireframes,
            diagram systems, and run live workshops on a canvas that feels like{" "}
            <em style={{ fontFamily: "'Caveat',cursive", fontStyle: "normal", fontSize: "1.2em", color: ACCENT }}>real paper</em>
            {" "}— except it never runs out.
          </p>

          <div className="rise" style={{ animationDelay: "0.45s", marginTop: 38, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
            <HardButton onClick={() => router.push("/canvas")} primary>Open a blank canvas →</HardButton>
            <HardButton onClick={() => scrollTo("how-it-works")} ghost>How it works</HardButton>
          </div>

          <div className="rise" style={{ animationDelay: "0.6s", marginTop: 28, fontFamily: "'Caveat',cursive", color: ACCENT, fontSize: 22, display: "flex", alignItems: "center", gap: 10, transform: "rotate(-2deg)", width: "fit-content" }}>
            <svg width="44" height="32" viewBox="0 0 44 32" fill="none">
              <path d="M2 14 C 12 4, 24 26, 38 14" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" />
              <path d="M34 9 L 38 14 L 33 18" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            drag the canvas — it&rsquo;s alive
          </div>
        </div>

        {/* Right: 3D scene */}
        <section ref={stageRef} className="hero-stage" style={{ cursor: "grab", userSelect: "none" }}>
          <div ref={sceneRef} className="hero-scene">

            {/* L0 — main canvas card (depth -180) */}
            <div ref={layerRef(0)} className="hero-layer canvas-card"
              style={{ width: 520, height: 360, left: "50%", top: "50%", marginLeft: -260, marginTop: -180, transform: L(0).orig }}>
              <div className="grid-bg" />
              <div className="card-head">
                <span className="b" style={{ background: ACCENT }} /><span className="b" /><span className="b" />
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, marginLeft: 8, color: INK_SOFT }}>untitled-canvas.cnvx</span>
              </div>
              <svg viewBox="0 0 520 360" style={{ position: "absolute", top: 24, left: 0, width: "100%", height: "calc(100% - 24px)" }}>
                <rect x="60" y="80" width="120" height="60" rx="6" fill="var(--paper-3, #FBF8F1)" stroke={INK} strokeWidth="2" />
                <rect x="220" y="40" width="120" height="60" rx="6" fill={BLUE} stroke={INK} strokeWidth="2" />
                <rect x="220" y="160" width="120" height="60" rx="6" fill={GREEN} stroke={INK} strokeWidth="2" />
                <rect x="380" y="100" width="110" height="60" rx="6" fill={PINK} stroke={INK} strokeWidth="2" />
                <path d="M180 110 C 200 105,210 80,220 75" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M214 75 L220 75 L218 70" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M180 115 C 200 130,210 180,220 188" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M214 188 L220 188 L218 183" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M340 70 C 360 80,370 100,380 118" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M376 113 L380 118 L375 119" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M340 190 C 360 175,370 150,380 138" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M376 143 L380 138 L375 137" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
                <text x="120" y="115" textAnchor="middle" fontFamily="Caveat" fontSize="22" fontWeight="700" fill={INK}>Idea</text>
                <text x="280" y="76" textAnchor="middle" fontFamily="Caveat" fontSize="20" fontWeight="700" fill={INK}>Sketch</text>
                <text x="280" y="196" textAnchor="middle" fontFamily="Caveat" fontSize="20" fontWeight="700" fill={INK}>Specs</text>
                <text x="435" y="135" textAnchor="middle" fontFamily="Caveat" fontSize="22" fontWeight="700" fill={INK}>Ship it</text>
                <text x="60" y="280" fontFamily="Caveat" fontSize="22" fill={ACCENT} fontWeight="700">flow looks good?</text>
                <path d="M180 274 C 210 268,220 260,232 245" stroke={ACCENT} strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M226 244 L232 245 L229 240" stroke={ACCENT} strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
            </div>

            {/* L1 — palette (depth -40) */}
            <div ref={layerRef(1)} className="hero-layer"
              style={{ left: "50%", top: "50%", marginLeft: -340, marginTop: -160, transform: L(1).orig }}>
              <div className="palette-panel">
                {[
                  <svg key="a" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l3-1 12-12-2-2L4 18l-1 3z" /></svg>,
                  <svg key="b" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>,
                  <svg key="c" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="8" /></svg>,
                  <svg key="d" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12h14M14 6l6 6-6 6" /></svg>,
                  <svg key="e" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 7h14M5 12h14M5 17h8" /></svg>,
                ].map((icon, i) => (
                  <button key={i} className={`tool-btn${i === 1 ? " on" : ""}`}>{icon}</button>
                ))}
              </div>
            </div>

            {/* L2 — second canvas card (depth 40) */}
            <div ref={layerRef(2)} className="hero-layer canvas-card"
              style={{ width: 480, height: 330, left: "50%", top: "50%", marginLeft: -200, marginTop: -130, transform: L(2).orig }}>
              <div className="grid-bg" style={{ opacity: 0.7 }} />
              <div className="card-head" style={{ background: "rgba(232,74,63,.08)" }}>
                <span className="b" style={{ background: ACCENT }} /><span className="b" /><span className="b" />
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, marginLeft: 8, color: INK_SOFT }}>untitled-canvas.cnvx</span>
              </div>
              <svg viewBox="0 0 480 330" style={{ position: "absolute", top: 24, left: 0, width: "100%", height: "calc(100% - 24px)" }}>
                <circle cx="120" cy="150" r="58" fill="var(--paper-3, #FBF8F1)" stroke={INK} strokeWidth="2.5" />
                <text x="120" y="156" textAnchor="middle" fontFamily="Caveat" fontSize="26" fontWeight="700" fill={INK}>user</text>
                <path d="M180 150 C 230 130,260 170,310 150" stroke={ACCENT} strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="160" strokeDashoffset="160">
                  <animate attributeName="stroke-dashoffset" from="160" to="0" dur="2.4s" begin="0.6s" fill="freeze" />
                </path>
                <path d="M304 146 L312 150 L304 156" stroke={ACCENT} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0">
                  <animate attributeName="opacity" from="0" to="1" dur=".2s" begin="3s" fill="freeze" />
                </path>
                <rect x="320" y="110" width="120" height="80" rx="8" fill={BLUE} stroke={INK} strokeWidth="2.5" />
                <text x="380" y="148" textAnchor="middle" fontFamily="Caveat" fontSize="22" fontWeight="700" fill={INK}>canvas</text>
                <text x="380" y="172" textAnchor="middle" fontFamily="Caveat" fontSize="16" fontWeight="500" fill={INK_SOFT}>collab board</text>
                <path d="M40 270 C 100 260,220 280,380 268" stroke={AMBER} strokeWidth="10" fill="none" strokeLinecap="round" opacity=".7" />
                <text x="60" y="266" fontFamily="Caveat" fontSize="20" fontWeight="700" fill={INK}>single source of truth</text>
              </svg>
            </div>

            {/* L3 — yellow sticky */}
            <div ref={layerRef(3)} className="hero-layer"
              style={{ left: "50%", top: "50%", marginLeft: 120, marginTop: -220, transform: L(3).orig }}>
              <div className="sticky-note" style={{ width: 170, transform: "rotate(7deg)" }}>ship by<br />friday ✱</div>
            </div>

            {/* L4 — blue sticky */}
            <div ref={layerRef(4)} className="hero-layer"
              style={{ left: "50%", top: "50%", marginLeft: -360, marginTop: 60, transform: L(4).orig }}>
              <div className="sticky-note blue" style={{ width: 180, transform: "rotate(-6deg)" }}>who owns<br />onboarding?</div>
            </div>

            {/* L5 — green sticky */}
            <div ref={layerRef(5)} className="hero-layer"
              style={{ left: "50%", top: "50%", marginLeft: 140, marginTop: 80, transform: L(5).orig }}>
              <div className="sticky-note green" style={{ width: 130, fontSize: 18, transform: "rotate(-4deg)" }}>✓ shipped</div>
            </div>

            {/* L6 — avatars */}
            <div ref={layerRef(6)} className="hero-layer"
              style={{ left: "50%", top: "50%", marginLeft: -340, marginTop: -220, transform: L(6).orig }}>
              <div style={{ display: "flex" }}>
                {[{ bg: AMBER, l: "AB" }, { bg: BLUE, l: "SM" }, { bg: GREEN, l: "IR" }, { bg: PAPER, l: "+11", c: INK_SOFT }].map((a, i) => (
                  <div key={i} className="avatar-chip" style={{ background: a.bg, marginLeft: i > 0 ? -12 : 0, color: a.c || INK }}>{a.l}</div>
                ))}
              </div>
            </div>

            {/* L7 — cursor Marta */}
            <div ref={layerRef(7)} className="hero-layer"
              style={{ left: "50%", top: "50%", marginLeft: -40, marginTop: -40, transform: L(7).orig }}>
              <div className="cursor-flag">
                <svg width="22" height="24" viewBox="0 0 22 24" fill={ACCENT3} stroke={INK} strokeWidth="1.5"><path d="M2 2 L2 20 L7 16 L10 22 L13 20 L10 14 L18 14 Z" strokeLinejoin="round" /></svg>
                <div className="flag-tag" style={{ background: ACCENT3 }}>Marta</div>
              </div>
            </div>

            {/* L8 — cursor Jules */}
            <div ref={layerRef(8)} className="hero-layer"
              style={{ left: "50%", top: "50%", marginLeft: 120, marginTop: 0, transform: L(8).orig }}>
              <div className="cursor-flag">
                <svg width="22" height="24" viewBox="0 0 22 24" fill={ACCENT4} stroke={INK} strokeWidth="1.5"><path d="M2 2 L2 20 L7 16 L10 22 L13 20 L10 14 L18 14 Z" strokeLinejoin="round" /></svg>
                <div className="flag-tag" style={{ background: ACCENT4 }}>Jules</div>
              </div>
            </div>

            {/* L9 — red shape */}
            <div ref={layerRef(9)} className="hero-layer"
              style={{ left: "50%", top: "50%", marginLeft: -300, marginTop: -30, transform: L(9).orig }}>
              <div style={{ width: 54, height: 54, background: ACCENT, border: `1.5px solid ${INK}`, boxShadow: `4px 4px 0 rgba(21,19,15,.6)` }} />
            </div>

            {/* L10 — amber circle */}
            <div ref={layerRef(10)} className="hero-layer"
              style={{ left: "50%", top: "50%", marginLeft: 300, marginTop: 120, transform: L(10).orig }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: AMBER, border: `1.5px solid ${INK}`, boxShadow: `4px 4px 0 rgba(21,19,15,.6)` }} />
            </div>

            {/* L11 — hand label bottom */}
            <div ref={layerRef(11)} className="hero-layer"
              style={{ left: "50%", top: "50%", marginLeft: -260, marginTop: 140, transform: L(11).orig }}>
              <div className="hand-label">↳ infinite zoom, no fps drop</div>
            </div>

            {/* L12 — hand label top */}
            <div ref={layerRef(12)} className="hero-layer"
              style={{ left: "50%", top: "50%", marginLeft: 50, marginTop: -260, transform: L(12).orig }}>
              <div className="hand-label blue">live cursors ↘</div>
            </div>
          </div>
        </section>
      </div>

      {/* Hero rail */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 24, zIndex: 6, display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 36px", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--ink-soft)", pointerEvents: "none" }}>
        <div><div>Lat. 37.77 / Lon. -122.42</div><div><b style={{ color: "var(--ink)", fontWeight: 500 }}>Built in the open.</b> Self-host or cloud.</div></div>
        <div style={{ fontFamily: "'Fraunces',serif", fontStyle: "italic", fontWeight: 300, fontSize: 120, lineHeight: 0.85, color: "var(--ink)", letterSpacing: "-0.04em", opacity: 0.07, userSelect: "none" }}>canvas</div>
        <div style={{ textAlign: "right" }}><div>No. 001 — May &rsquo;26</div><div><b style={{ color: "var(--ink)", fontWeight: 500 }}>14,302 boards opened today</b></div></div>
      </div>
    </section>
  );
}
