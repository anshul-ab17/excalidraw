"use client";
import { ACCENT } from "./types";

interface Props {
  onDelete: () => void;
}

export default function DeleteSelectedButton({ onDelete }: Props) {
  return (
    <div style={{ position: "fixed", bottom: 80, right: 16, zIndex: 20 }}>
      <button onClick={onDelete} style={{
        background: ACCENT, color: "white", border: "none", borderRadius: 8,
        padding: "8px 14px", fontSize: 13, cursor: "pointer", fontWeight: 500,
      }}>
        🗑 Delete selected
      </button>
    </div>
  );
}
