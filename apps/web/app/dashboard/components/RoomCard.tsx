"use client";
import { useState } from "react";
import { ACCENT } from "../../components/canvas/types";

export interface Room {
  id: number;
  slug: string;
  createdAt: string;
  adminId: string;
}

const CARD_COLORS = ["#B8DDC4", "#A9C8F5", "#F1B8C2", "#F2C97A", "#D4C8F0"];
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
        background: "var(--paper-3, #FBF8F1)",
        border: "1.5px solid var(--ink, #15130F)",
        borderRadius: 14, padding: 24, cursor: "pointer",
        boxShadow: hovered ? "8px 8px 0 var(--ink, #15130F)" : "4px 4px 0 var(--ink, #15130F)",
        transform: hovered ? "translate(-2px, -2px)" : "none",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 10,
        background: CARD_COLORS[idx],
        border: "1.5px solid var(--ink, #15130F)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 18, fontSize: 22,
        boxShadow: "2px 2px 0 var(--ink, #15130F)",
      }}>
        {CARD_ICONS[idx]}
      </div>
      <h3 style={{
        margin: "0 0 8px", fontSize: 18, fontWeight: 700,
        color: "var(--ink, #15130F)", letterSpacing: "-0.02em",
        fontFamily: "'Fraunces', serif",
      }}>
        {room.slug}
      </h3>
      <p style={{
        margin: 0, fontSize: 10, color: "var(--muted, #7A7264)",
        fontWeight: 500, fontFamily: "'JetBrains Mono', monospace",
        textTransform: "uppercase", letterSpacing: "0.1em",
      }}>
        {new Date(room.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </p>
      {hovered && (
        <div style={{
          marginTop: 18, paddingTop: 14,
          borderTop: "1px solid var(--rule, #E8E0D0)",
        }}>
          <span style={{
            fontSize: 13, color: ACCENT, fontWeight: 700,
            fontFamily: "'Inter Tight', sans-serif",
          }}>Open board →</span>
        </div>
      )}
    </div>
  );
}
