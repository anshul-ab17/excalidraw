"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "../lib/config";

export default function AuthForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("token")) router.push("/dashboard");
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body = mode === "signup" ? { username, password, name } : { username, password };
      const res = await fetch(`${API_URL}/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      background: "var(--surface)",
      padding: 32, borderRadius: 16, boxShadow: "var(--shadow-lg)", width: 400,
      border: "1px solid var(--border)"
    }}>
      <h1 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px" }}>Canvas</h1>
      <p style={{ margin: "0 0 24px", color: "var(--text-muted)", fontSize: 14 }}>Sign in to collaborate in real-time</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, background: "var(--bg)", padding: 4, borderRadius: 10, border: "1px solid var(--border)" }}>
        {(["signin", "signup"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} style={{
            flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 13, fontWeight: 700,
            background: mode === m ? "var(--surface)" : "transparent",
            color: mode === m ? "var(--text)" : "var(--text-muted)",
            boxShadow: mode === m ? "var(--shadow-sm)" : "none",
            transition: "all 0.15s", border: "none", cursor: "pointer",
          }}>
            {m === "signin" ? "Sign In" : "Sign Up"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {mode === "signup" && (
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>Display Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required 
              style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "2px solid var(--border)", background: "var(--bg)", color: "var(--text)", outline: "none", transition: "border-color 0.2s" }} />
          </div>
        )}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="min 8 characters" required minLength={8}
            style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "2px solid var(--border)", background: "var(--bg)", color: "var(--text)", outline: "none" }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="min 8 characters" required minLength={8}
            style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "2px solid var(--border)", background: "var(--bg)", color: "var(--text)", outline: "none" }} />
        </div>
        {error && <p style={{ color: "#ff5f56", fontSize: 13, fontWeight: 600, margin: 0 }}>{error}</p>}
        <button type="submit" disabled={loading} style={{
          marginTop: 12, padding: "16px", borderRadius: 12, fontSize: 15, fontWeight: 900,
          background: "var(--primary)", color: "#ffffff", border: "none", cursor: loading ? "not-allowed" : "pointer", 
          opacity: loading ? 0.7 : 1, transition: "transform 0.2s",
          boxShadow: "0 10px 30px rgba(153, 27, 27, 0.3)"
        }}>
          {loading ? "Loading..." : mode === "signin" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <div style={{ marginTop: 32, textAlign: "center" }}>
        <button onClick={() => router.push("/")} style={{
          background: "none", border: "none", color: "#adb5bd", fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "underline"
        }}>
          Continue drawing as guest
        </button>
      </div>
    </div>
  );
}
