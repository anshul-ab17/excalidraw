"use client";
import { ACCENT } from "./types";

interface Props {
  isSignedIn: boolean;
  onDashboard: () => void;
  onSignIn: () => void;
}

export default function GuestAuthBar({ isSignedIn, onDashboard, onSignIn }: Props) {
  return (
    <div style={{
      position: "fixed", top: 16, right: 16, zIndex: 10, display: "flex", gap: 12, alignItems: "center"
    }}>
      {isSignedIn ? (
        <button onClick={onDashboard} style={{
          background: ACCENT, color: "white", border: "none", borderRadius: 8,
          padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer",
          boxShadow: "0 4px 12px rgba(224, 49, 49, 0.2)"
        }}>
          My Boards
        </button>
      ) : (
        <>
          <div style={{
            background: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(24px)",
            borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#6c757d",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)", border: "1px solid rgba(255,255,255,0.4)"
          }}>
            Sign in to collaborate
          </div>
          <button onClick={onSignIn} style={{
            background: ACCENT, color: "white", border: "none", borderRadius: 8,
            padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer",
            boxShadow: "0 4px 12px rgba(224, 49, 49, 0.2)"
          }}>
            Sign In
          </button>
        </>
      )}
    </div>
  );
}
