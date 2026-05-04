"use client";
import { ACCENT } from "../../components/canvas/types";

interface Props {
  loading: boolean;
  roomCount: number;
  onNewBoard: () => void;
}

export default function DashboardHeader({ loading, roomCount, onNewBoard }: Props) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 500, color: "var(--text)", letterSpacing: "-0.03em", fontFamily: "'Fraunces', serif" }}>My Boards</h1>
        <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: 11, fontWeight: 500, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {loading ? "Loading…" : `${roomCount} board${roomCount !== 1 ? "s" : ""}`}
        </p>
      </div>
      <button onClick={onNewBoard} style={{
        background: ACCENT, color: "#fff", border: `1.5px solid ${ACCENT}`, borderRadius: 10,
        padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer",
        boxShadow: "3px 3px 0 var(--ink, #15130F)", fontFamily: "'Inter Tight', sans-serif"
      }}>
        + New Board
      </button>
    </div>
  );
}
