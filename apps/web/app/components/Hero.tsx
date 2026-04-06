"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Hero() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "#1e1e1e", fontFamily: "Inter, -apple-system, sans-serif" }}>
      {/* Navigation */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 40px", position: "sticky", top: 0, background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(10px)", zIndex: 100
      }}>
        <div style={{ fontSize: "24px", fontWeight: 900, cursor: "pointer", color: "#e03131", fontFamily: "'Comic Sans MS', cursive, sans-serif" }} onClick={() => router.push("/")}>
          Canvax
        </div>
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <a href="/" style={{ textDecoration: "none", color: "#6c757d", fontSize: "14px", fontWeight: 500 }}>Home</a>
          <a href="#how-it-works" style={{ textDecoration: "none", color: "#6c757d", fontSize: "14px", fontWeight: 500 }}>How it works</a>
          <div style={{ width: "1px", height: "20px", background: "#dee2e6" }} />
          {isLoggedIn ? (
            <button onClick={() => router.push("/dashboard")} style={{ color: "#e03131", fontWeight: 600 }}>Dashboard</button>
          ) : (
            <button onClick={() => router.push("/signin")} style={{ color: "#1e1e1e", fontWeight: 500 }}>Sign In</button>
          )}
          <button 
            onClick={() => router.push("/canvas")}
            style={{
              background: "#e03131", color: "white", padding: "8px 16px",
              borderRadius: "8px", fontWeight: 600, transition: "background 0.2s"
            }}
            onMouseOver={e => e.currentTarget.style.background = "#c92a2a"}
            onMouseOut={e => e.currentTarget.style.background = "#e03131"}
          >
            Canvas
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: "100px 40px", textAlign: "center", background: "linear-gradient(180deg, #fff5f5 0%, #ffffff 100%)",
        position: "relative", overflow: "hidden"
      }}>
        <div style={{ 
          position: "absolute", top: "10%", right: "10%", width: "300px", height: "300px",
          background: "#e0313110", borderRadius: "40px", transform: "rotate(15deg)", zIndex: 0
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ color: "#e03131", fontSize: "14px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>
            The Virtual Whiteboard
          </p>
          <h1 style={{ fontSize: "72px", fontWeight: 900, letterSpacing: "-2px", marginBottom: "20px", lineHeight: 1 }}>
            CANVAX
          </h1>
          <p style={{ fontSize: "20px", color: "#6c757d", maxWidth: "600px", margin: "0 auto 40px" }}>
            Sketched with soul. Shared with the world.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <button 
              onClick={() => router.push("/canvas")}
              style={{
                background: "#e03131", color: "white", padding: "16px 32px",
                borderRadius: "12px", fontSize: "18px", fontWeight: 700, boxShadow: "0 10px 20px rgba(224, 49, 49, 0.2)"
              }}
            >
              Start Drawing ↗
            </button>
            <a 
              href="#how-it-works"
              style={{
                background: "white", border: "2px solid #e9ecef", padding: "16px 32px",
                borderRadius: "12px", fontSize: "18px", fontWeight: 700, color: "#1e1e1e", textDecoration: "none"
              }}
            >
              How it works
            </a>
          </div>
        </div>
      </section>

      {/* Workspace Preview */}
      <section style={{ padding: "80px 40px", background: "#f8f9fa", borderTop: "1px solid #e9ecef" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "16px" }}>The Workspace</h2>
          <p style={{ color: "#6c757d", marginBottom: "48px" }}>The precision of a tool with the freedom of a sketchpad. Built for collaboration.</p>
          
          <div style={{
            background: "#ffffff", borderRadius: "24px", height: "500px", 
            boxShadow: "0 40px 100px rgba(0,0,0,0.1)", position: "relative",
            overflow: "hidden", border: "1px solid #e9ecef"
          }}>
             {/* Styled Fake Canvas */}
             <div style={{
               position: "absolute", inset: 0, 
               backgroundImage: "radial-gradient(#dee2e6 1px, transparent 1px)", 
               backgroundSize: "20px 20px"
             }} />
             
             {/* Fake Toolbar */}
             <div style={{
               position: "absolute", top: "12px", left: "50%", transform: "translateX(-50%)",
               background: "white", borderRadius: "12px", padding: "8px",
               boxShadow: "0 2px 12px rgba(0,0,0,0.15)", display: "flex", gap: "8px"
             }}>
               {["↖", "▭", "◇", "○", "→", "pencil", "A"].map((icon, i) => (
                 <div key={i} style={{
                   width: "36px", height: "36px", borderRadius: "8px",
                   display: "flex", alignItems: "center", justifyContent: "center",
                   background: i === 5 ? "#fff5f5" : "transparent",
                   color: i === 5 ? "#e03131" : "#495057",
                   border: i === 5 ? "1px solid #fca5a5" : "none"
                 }}>{icon === "pencil" ? "✏" : icon}</div>
               ))}
             </div>

             {/* Fake Sidebar */}
             <div style={{
               position: "absolute", top: "80px", left: "20px", width: "240px",
               background: "white", borderRadius: "16px", padding: "16px",
               boxShadow: "0 10px 30px rgba(0,0,0,0.05)", textAlign: "left",
               border: "1px solid #e9ecef"
             }}>
               <p style={{ fontSize: "11px", fontWeight: 700, color: "#868e96", textTransform: "uppercase", marginBottom: "12px" }}>Stroke Style</p>
               <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
                 <div style={{ flex: 1, height: "32px", borderRadius: "6px", border: "1px solid #e03131", background: "#fff5f5" }} />
                 <div style={{ flex: 1, height: "32px", borderRadius: "6px", background: "#f1f3f5" }} />
               </div>
               <p style={{ fontSize: "11px", fontWeight: 700, color: "#868e96", textTransform: "uppercase", marginBottom: "12px" }}>Fill Style</p>
               <div style={{ display: "flex", gap: "8px" }}>
                 {["#1e1e1e", "#e03131", "#2f9e44", "#1971c2"].map(color => (
                   <div key={color} style={{ width: "24px", height: "24px", borderRadius: "4px", background: color }} />
                 ))}
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" style={{ padding: "100px 40px", background: "#ffffff" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "48px", fontWeight: 900, marginBottom: "20px", letterSpacing: "-1px" }}>How it works</h2>
          <p style={{ fontSize: "18px", color: "#6c757d", marginBottom: "64px" }}>From a blank slate to a shared masterpiece in four simple steps.</p>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
            {[
              { num: "01", icon: "✨", title: "Start with a Spark", desc: "Enter the canvas directly. No registration required. Just start drawing." },
              { num: "02", icon: "🛠", title: "Create with Precision", desc: "Use intuitive shapes, arrows, and freehand pencils to bring diagrams to life." },
              { num: "03", icon: "🤝", title: "Collaborate in Real-time", desc: "Share your screen's unique link with anyone to build together instantly." },
              { num: "04", icon: "💾", title: "Save and Export", desc: "Export as high-quality SVG or PNG, or sign in to save your boards forever." }
            ].map((step, i) => (
              <div key={i} style={{ 
                background: "#f8f9fa", padding: "40px", borderRadius: "24px", textAlign: "left",
                border: "1px solid #e9ecef", transition: "transform 0.2s"
              }} className="step-card">
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#fff5f5", color: "#e03131", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 900, marginBottom: "20px" }}>{step.num}</div>
                <div style={{ fontSize: "32px", marginBottom: "16px" }}>{step.icon}</div>
                <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "12px" }}>{step.title}</h3>
                <p style={{ color: "#6c757d", fontSize: "15px", lineHeight: 1.5 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer style={{ padding: "40px", borderTop: "1px solid #e9ecef", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "#adb5bd" }}>
        <div>Canvax</div>
        <div style={{ display: "flex", gap: "24px" }}>
          <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Twitter</a>
          <a href="#" style={{ color: "inherit", textDecoration: "none" }}>GitHub</a>
          <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Discord</a>
        </div>
        <div>© 2026 CANVAX, SKETCHED WITH SOUL.</div>
      </footer>

      <style jsx>{`
        button { border: none; cursor: pointer; font-family: inherit; transition: opacity 0.2s; }
        button:hover { opacity: 0.9; }
      `}</style>
    </div>
  );
}
