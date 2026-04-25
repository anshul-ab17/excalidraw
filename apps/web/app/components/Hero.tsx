"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ACCENT } from "./canvas/types";

export default function Hero() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  return (
    <div style={{ background: "#fff", color: "#1e1e1e", fontFamily: "Inter, -apple-system, sans-serif", minHeight: "100vh" }}>
      {/* Navbar */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 40px", position: "sticky", top: 0, background: "#fff", zIndex: 100
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <span onClick={() => router.push("/")} style={{ fontSize: 24, fontWeight: 900, color: "#000", cursor: "pointer", letterSpacing: "-0.5px" }}>Canvas</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {isLoggedIn ? (
             <button onClick={() => router.push("/dashboard")} style={{ fontSize: 14, fontWeight: 600, color: "#1e1e1e", cursor: "pointer", background: "none", border: "none" }}>Dashboard</button>
          ) : (
             <button onClick={() => router.push("/signin")} style={{ fontSize: 14, fontWeight: 600, color: "#1e1e1e", cursor: "pointer", background: "none", border: "none" }}>Sign In</button>
          )}
          <button onClick={() => router.push("/canvas")} style={{
            background: ACCENT, color: "#000", border: "none", borderRadius: 8,
            padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer"
          }}>
            Go to Canvas
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <section style={{ padding: "120px 40px", textAlign: "center", maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: 80, fontWeight: 950, letterSpacing: "-4px", lineHeight: 0.9, margin: "0 0 32px", color: "#000" }}>
           Virtual whiteboard for sketching and collaborating.
        </h1>
        <p style={{ fontSize: 24, color: "#6c757d", lineHeight: 1.4, margin: "0 0 56px", fontWeight: 500 }}>
          Canvas is an open sourced virtual whiteboard for sketching hand-drawn like diagrams.
        </p>
        
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <button onClick={() => router.push("/canvas")} style={{
            background: ACCENT, color: "#000", border: "none",
            borderRadius: 12, padding: "18px 40px", fontSize: 18, fontWeight: 800, cursor: "pointer",
            boxShadow: `0 10px 30px ${ACCENT}55`
          }}>
            Start Drawing
          </button>
        </div>

        {/* Simple Screenshot/Preview */}
        <div style={{ marginTop: 100, border: "1px solid #e9ecef", borderRadius: 24, overflow: "hidden", boxShadow: "0 40px 100px rgba(0,0,0,0.05)" }}>
            <div style={{ padding: "12px 20px", background: "#f8f9fa", borderBottom: "1px solid #e9ecef", display: "flex", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#dee2e6" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#dee2e6" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#dee2e6" }} />
            </div>
            <div style={{ height: 500, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60, opacity: 0.1 }}>
               🖊
            </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer style={{ padding: "80px 40px", color: "#adb5bd", fontSize: 13, textAlign: "center", background: "#fff", borderTop: "1px solid #f1f3f5", marginTop: 100 }}>
         <p>© 2026 Canvas — Shared with the world.</p>
      </footer>
    </div>
  );
}
