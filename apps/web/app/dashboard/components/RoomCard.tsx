"use client";
import { useState } from "react";

const ACCENT = "#28d08b";
const ACCENT_BORDER = "#96f2d7";

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
        background: "white",
        border: `1px solid ${hovered ? ACCENT : "#e9ecef"}`,
        borderRadius: 16, padding: 24, cursor: "pointer", transition: "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        boxShadow: hovered ? "0 20px 40px rgba(40, 208, 139, 0.12)" : "0 1px 4px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-4px)" : "none",
      }}
    >
      <div style={{
        width: 54, height: 54, borderRadius: 12,
        background: CARD_COLORS[idx], border: `1px solid ${hovered ? ACCENT_BORDER : "#e9ecef"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 20, fontSize: 24, transition: "all 0.2s",
      }}>
        {CARD_ICONS[idx]}
      </div>
      <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: "#1e1e1e", letterSpacing: "-0.5px" }}>
        {room.slug}
      </h3>
      <p style={{ margin: 0, fontSize: 13, color: "#adb5bd", fontWeight: 500 }}>
        {new Date(room.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </p>
      {hovered && (
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f3f5" }}>
          <span style={{ fontSize: 13, color: ACCENT, fontWeight: 800 }}>Open board →</span>
        </div>
      )}
    </div>
  );
}
