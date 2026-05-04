"use client";
import { useRouter } from "next/navigation";
import { ACCENT, ACCENT4, NavBtn } from "./Common";

interface NavbarProps {
  scrolled: boolean;
  isLoggedIn: boolean;
  darkMode: boolean;
  toggleDark: () => void;
  scrollTo: (id: string) => void;
}

export default function Navbar({ scrolled, isLoggedIn, darkMode, toggleDark, scrollTo }: NavbarProps) {
  const router = useRouter();

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "18px 36px",
      fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: "0.04em",
      background: `color-mix(in srgb, var(--paper) 88%, transparent)`,
      backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
      borderBottom: scrolled ? "1px solid var(--rule, #1B1814)" : "1px solid transparent",
      transition: "border-color 0.3s, background 0.3s",
    }}>
      <button onClick={() => router.push("/")}
        style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 22, color: "var(--ink)", background: "none", border: "none", cursor: "pointer", letterSpacing: "-0.01em" }}>
        <span style={{ width: 14, height: 14, borderRadius: "50%", background: ACCENT, boxShadow: "3px 3px 0 var(--ink)", display: "inline-block", transform: "translateY(-2px)" }} />
        Canvas
      </button>

      <nav style={{ display: "flex", gap: 28 }}>
        <NavBtn label="Canvas" onClick={() => router.push("/canvas")} />
        <NavBtn label="How it works" onClick={() => scrollTo("how-it-works")} />
        <NavBtn label="Dashboard" onClick={() => router.push("/dashboard")} />
      </nav>

      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 10px", border: "1px solid var(--ink)", borderRadius: 999, fontSize: 12, color: "var(--ink)" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: ACCENT4, display: "inline-block", animation: "pulse 1.8s infinite" }} />
        </span>
        
        <button
          title="Global Chat"
          onClick={() => router.push("/canvas/global")}
          style={{
            width: 36, height: 36, borderRadius: "50%",
            border: "1px solid var(--ink)", background: "transparent",
            display: "grid", placeItems: "center", cursor: "pointer",
            color: "var(--ink)", transition: "all 0.3s"
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </button>

        {isLoggedIn
          ? <NavBtn label="Dashboard →" onClick={() => router.push("/dashboard")} />
          : <NavBtn label="Sign in →" onClick={() => router.push("/signin")} />}

        <button
          className="theme-toggle"
          onClick={toggleDark}
          title="Toggle theme"
          aria-label="Toggle dark mode"
          style={{
            width: 36, height: 36, borderRadius: "50%",
            border: "1px solid var(--ink)", background: "transparent",
            display: "grid", placeItems: "center", cursor: "pointer",
            color: "var(--ink)", transition: "transform 0.3s, background 0.3s"
          }}
        >
          {darkMode
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>
          }
        </button>
      </div>
    </header>
  );
}
