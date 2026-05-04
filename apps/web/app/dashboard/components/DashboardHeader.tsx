"use client";

const ACCENT = "#991b1b";

interface Props {
  loading: boolean;
  roomCount: number;
  onNewBoard: () => void;
}

export default function DashboardHeader({ loading, roomCount, onNewBoard }: Props) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px" }}>My Boards</h1>
        <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: 13, fontWeight: 500 }}>
          {loading ? "Loading…" : `${roomCount} board${roomCount !== 1 ? "s" : ""}`}
        </p>
      </div>
      <button onClick={onNewBoard} style={{
        background: "var(--primary)", color: "#ffffff", border: "none", borderRadius: 8,
        padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer",
        boxShadow: "var(--shadow-sm)",
      }}>
        + New Board
      </button>
    </div>
  );
}
