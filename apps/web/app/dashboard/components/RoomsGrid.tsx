"use client";
import RoomCard, { Room } from "./RoomCard";

const ACCENT = "#e03131";

interface Props {
  loading: boolean;
  rooms: Room[];
  onRoomClick: (slug: string) => void;
  onNewBoard: () => void;
}

export default function RoomsGrid({ loading, rooms, onRoomClick, onNewBoard }: Props) {
  const grid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 24,
  };

  if (loading) {
    return (
      <div style={grid}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 18, padding: 24, height: 180, opacity: 0.5 }} />
        ))}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div style={{
        background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 18,
        padding: "100px 24px", textAlign: "center", boxShadow: "var(--shadow)",
      }}>
        <p style={{ fontSize: 28, fontWeight: 500, margin: "0 0 8px", color: "var(--text)", fontFamily: "'Fraunces', serif" }}>No boards yet</p>
        <p style={{ fontSize: 15, margin: "0 0 32px", color: "var(--text-muted)", fontFamily: "'Inter Tight', sans-serif" }}>
          Create a board to start collaborating in real-time
        </p>
        <button onClick={onNewBoard} style={{
          background: "var(--primary)", color: "white", border: "1.5px solid var(--ink)", borderRadius: 12,
          padding: "12px 32px", fontSize: 13, fontWeight: 700, cursor: "pointer",
          boxShadow: "var(--shadow-sm)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.05em"
        }}>
          + Create your first board
        </button>
      </div>
    );
  }

  return (
    <div style={grid}>
      {rooms.map(room => (
        <RoomCard key={room.id} room={room} onClick={() => onRoomClick(room.slug)} />
      ))}
    </div>
  );
}
