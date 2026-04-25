"use client";
import { CursorPos } from "./types";

interface Props {
  cursors: CursorPos[];
}

export default function CursorOverlay({ cursors }: Props) {
  return (
    <>
      {cursors.map(c => (
        <div key={c.userId} style={{
          position: "fixed", left: c.x, top: c.y, pointerEvents: "none",
          transform: "translate(-2px, -2px)", zIndex: 50,
        }}>
          <div style={{ fontSize: 18 }}>🖱</div>
          <div style={{
            background: "#e03131", color: "white", padding: "2px 6px",
            borderRadius: 4, fontSize: 11, marginTop: -4,
          }}>
            {c.userId.slice(0, 6)}
          </div>
        </div>
      ))}
    </>
  );
}
