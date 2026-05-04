"use client";
import { useState } from "react";

const ACCENT = "#991b1b";
const ACCENT_BORDER = "#fca5a5";

export interface Room {
  id: number;
  slug: string;
  createdAt: string;
  adminId: string;
}

const CARD_COLORS = ["#defcf0", "#f0fff4", "#eff6ff", "#fefce8", "#faf5ff"];
const CARD_ICONS = ["✏️", "🎨", "📐", "🖊️", "🗂️"];

interface Props {
  room: Room;
  onClick: () => void;
}

export default function RoomCard({ room, onClick }: Props) {
  const [hovered, setHovered] = useState(false);
  const idx = room.id % 5;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--surface)",
        border: `1px solid ${hovered ? "var(--primary)" : "var(--border)"}`,
        borderRadius: 16, padding: 24, cursor: "pointer", transition: "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        boxShadow: hovered ? "0 20px 40px rgba(153, 27, 27, 0.12)" : "var(--shadow-sm)",
        transform: hovered ? "translateY(-4px)" : "none",
      }}
    >
      <div style={{
        width: 54, height: 54, borderRadius: 12,
        background: idx === 0 ? "var(--primary-glow)" : CARD_COLORS[idx], border: `1px solid ${hovered ? "var(--primary)" : "var(--border)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 20, fontSize: 24, transition: "all 0.2s",
      }}>
        {CARD_ICONS[idx]}
      </div>
      <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px" }}>
        {room.slug}
      </h3>
      <p style={{ margin: 0, fontSize: 13, color: "#adb5bd", fontWeight: 500 }}>
        {new Date(room.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </p>
      {hovered && (
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          <span style={{ fontSize: 13, color: "var(--primary)", fontWeight: 800 }}>Open board →</span>
        </div>
      )}
    </div>
  );
}
