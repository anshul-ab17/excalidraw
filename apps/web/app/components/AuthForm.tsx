"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
      const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";
      const res = await fetch(`${API}/${mode}`, {
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
    <div style={{ background: "white", padding: 40, borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.1)", width: 380 }}>
      <h1 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 700, color: "#e03131" }}>✏️ </h1>
      <p style={{ margin: "0 0 32px", color: "#6c757d", fontSize: 14 }}>Sign in to save boards and collaborate in real-time</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, background: "#f1f3f5", padding: 4, borderRadius: 8 }}>
        {(["signin", "signup"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} style={{
            flex: 1, padding: "8px 0", borderRadius: 6, fontSize: 14, fontWeight: 500,
            background: mode === m ? "white" : "transparent",
            color: mode === m ? "#1e1e1e" : "#6c757d",
            boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
            transition: "all 0.15s", border: "none", cursor: "pointer",
          }}>
            {m === "signin" ? "Sign In" : "Sign Up"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {mode === "signup" && (
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Display Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
          </div>
        )}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="min 8 characters" required minLength={8} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="min 8 characters" required minLength={8} />
        </div>
        {error && <p style={{ color: "#e03131", fontSize: 13, margin: 0 }}>{error}</p>}
        <button type="submit" disabled={loading} style={{
          marginTop: 8, padding: "10px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500,
          background: "#e03131", color: "white", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
        }}>
          {loading ? "Loading..." : mode === "signin" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <div style={{ marginTop: 20, textAlign: "center" }}>
        <button onClick={() => router.push("/")} style={{
          background: "none", border: "none", color: "#6c757d", fontSize: 13, cursor: "pointer", textDecoration: "underline"
        }}>
          Continue drawing without signing in
        </button>
      </div>
    </div>
  );
}
