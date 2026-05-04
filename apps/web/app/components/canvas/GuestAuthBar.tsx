"use client";
import { ACCENT } from "./types";

interface Props {
  isSignedIn: boolean;
  onDashboard: () => void;
  onSignIn: () => void;
}

export default function GuestAuthBar({ isSignedIn, onDashboard, onSignIn }: Props) {
  return (
    <div style={{ position: "fixed", top: 16, right: 16, zIndex: 10, display: "flex", gap: 10, alignItems: "center" }}>
      {isSignedIn ? (
        <button onClick={onDashboard} style={{
          background: ACCENT, color: "#fff",
          border: `1.5px solid ${ACCENT}`,
          padding: "8px 18px", fontSize: 13, fontWeight: 600,
          fontFamily: "'Inter Tight', sans-serif",
          cursor: "pointer",
          boxShadow: "4px 4px 0 var(--ink, #15130F)",
        }}>
          My Boards
        </button>
      ) : (
        <>
          <div style={{
            background: "var(--paper-3, #FBF8F1)",
            border: "1.5px solid var(--ink, #15130F)",
            borderRadius: 10, padding: "7px 12px",
            fontSize: 12, color: "var(--ink-soft, #3A352C)",
            fontFamily: "'JetBrains Mono', monospace",
            boxShadow: "3px 3px 0 var(--ink, #15130F)",
          }}>
            Sign in to collaborate
          </div>
          <button onClick={onSignIn} style={{
            background: ACCENT, color: "#fff",
            border: `1.5px solid ${ACCENT}`,
            padding: "8px 18px", fontSize: 13, fontWeight: 600,
            fontFamily: "'Inter Tight', sans-serif",
            cursor: "pointer",
            boxShadow: "4px 4px 0 var(--ink, #15130F)",
          }}>
            Sign In
          </button>
        </>
      )}
    </div>
  );
}
