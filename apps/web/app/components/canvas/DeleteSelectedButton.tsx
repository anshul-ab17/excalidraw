"use client";
import { ACCENT } from "./types";

interface Props {
  onDelete: () => void;
}

export default function DeleteSelectedButton({ onDelete }: Props) {
  return (
    <div style={{ position: "fixed", bottom: 84, right: 24, zIndex: 100 }}>
      <button onClick={onDelete} style={{
        background: "#E84A3F", color: "white", border: "1.5px solid #15130F", borderRadius: 12,
        padding: "10px 18px", fontSize: 12, cursor: "pointer", fontWeight: 700,
        boxShadow: "var(--shadow-sm, 4px 4px 0 #15130F)", fontFamily: "'JetBrains Mono', monospace",
        textTransform: "uppercase", letterSpacing: "0.05em"
      }}>
        Delete Selected
      </button>
    </div>
  );
}
