"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Room { id: number; slug: string; createdAt: string; adminId: string; }

const ACCENT = "#e03131";
const ACCENT_LIGHT = "#fff5f5";
const ACCENT_BORDER = "#fca5a5";

export default function Dashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/signin"); return; }
    fetchRooms();
  }, [router]);

  async function fetchRooms() {
    setLoading(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";
      const res = await fetch(`${API}/rooms`, {
        headers: { authorization: localStorage.getItem("token") || "" },
      });
      const data = await res.json();
      if (data.rooms) setRooms(data.rooms);
    } finally {
      setLoading(false);
    }
  }

  async function createRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    setCreating(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";
      const res = await fetch(`${API}/room`, {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: localStorage.getItem("token") || "" },
        body: JSON.stringify({ name: newRoomName.trim() }),
      });
      const data = await res.json();
      if (!data.message) {
        setNewRoomName("");
        setShowCreate(false);
        fetchRooms();
      }
    } finally {
      setCreating(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    router.push("/");
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8f9fa",
      backgroundImage: "linear-gradient(#e9ecef 1px, transparent 1px), linear-gradient(90deg, #e9ecef 1px, transparent 1px)",
      backgroundSize: "40px 40px",
    }}>

      {/* Top navbar — matches homepage */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 20,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 20px",
        pointerEvents: "none",
      }}>
        {/* Brand */}
        <div style={{ pointerEvents: "auto" }}>
          <button onClick={() => router.push("/")} style={{
            background: "white", border: "1px solid #dee2e6", borderRadius: 8,
            padding: "6px 14px", fontSize: 15, fontWeight: 700, color: ACCENT,
            cursor: "pointer",
          }}>
            ✏️ Canvas
          </button>
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", gap: 8, pointerEvents: "auto" }}>
          <button onClick={() => router.push("/")} style={{
            background: "white", border: "1px solid #dee2e6", borderRadius: 8,
            padding: "7px 14px", fontSize: 13, color: "#495057", cursor: "pointer",
          }}>
            ← Open Canvas
          </button>
          <button onClick={logout} style={{
            background: "white", border: `1px solid ${ACCENT_BORDER}`, borderRadius: 8,
            padding: "7px 14px", fontSize: 13, color: ACCENT, cursor: "pointer",
          }}>
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "100px 24px 60px" }}>

        {/* Page header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#1e1e1e" }}>My Boards</h1>
            <p style={{ margin: "4px 0 0", color: "#6c757d", fontSize: 14 }}>
              {loading ? "Loading…" : `${rooms.length} board${rooms.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button onClick={() => setShowCreate(true)} style={{
            background: ACCENT, color: "white", border: "none", borderRadius: 8,
            padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer",
            boxShadow: "0 2px 8px rgba(224,49,49,0.3)",
          }}>
            + New Board
          </button>
        </div>

        {/* Rooms grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: "white", border: "1px solid #e9ecef", borderRadius: 12, padding: 24, height: 120, opacity: 0.5 }} />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div style={{
            background: "white", border: "1px solid #e9ecef", borderRadius: 16,
            padding: "80px 24px", textAlign: "center",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}>
            <p style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px", color: "#1e1e1e" }}>No boards yet</p>
            <p style={{ fontSize: 14, margin: "0 0 28px", color: "#6c757d" }}>
              Create a board to start collaborating in real-time
            </p>
            <button onClick={() => setShowCreate(true)} style={{
              background: ACCENT, color: "white", border: "none", borderRadius: 8,
              padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>
              + Create your first board
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
            {rooms.map(room => (
              <RoomCard key={room.id} room={room} onClick={() => router.push(`/room/${room.slug}`)} />
            ))}
          </div>
        )}
      </div>

      {/* Create board modal */}
      {showCreate && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
        }}>
          <div style={{
            background: "white", padding: 32, borderRadius: 16, width: 420,
            boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
          }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700 }}>New Board</h2>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: "#6c757d" }}>
              Give your board a unique name to share with collaborators.
            </p>
            <form onSubmit={createRoom} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input
                type="text"
                value={newRoomName}
                onChange={e => setNewRoomName(e.target.value)}
                placeholder="e.g. product-roadmap"
                autoFocus
                required
                style={{
                  padding: "10px 12px", borderRadius: 8, border: "1px solid #dee2e6",
                  fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box",
                }}
                onFocus={e => (e.target.style.borderColor = ACCENT_BORDER)}
                onBlur={e => (e.target.style.borderColor = "#dee2e6")}
              />
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" disabled={creating} style={{
                  flex: 1, padding: "10px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600,
                  background: creating ? "#e9ecef" : ACCENT,
                  color: creating ? "#6c757d" : "white",
                  border: "none", cursor: creating ? "not-allowed" : "pointer",
                }}>
                  {creating ? "Creating…" : "Create Board"}
                </button>
                <button type="button" onClick={() => { setShowCreate(false); setNewRoomName(""); }} style={{
                  padding: "10px 16px", borderRadius: 8, fontSize: 14,
                  border: "1px solid #dee2e6", background: "white", cursor: "pointer",
                }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function RoomCard({ room, onClick }: { room: Room; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  const colors = ["#fff5f5", "#f0fff4", "#eff6ff", "#fefce8", "#faf5ff"];
  const icons = ["✏️", "🎨", "📐", "🖊️", "🗂️"];
  const idx = room.id % 5;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "white",
        border: `1px solid ${hovered ? ACCENT_BORDER : "#e9ecef"}`,
        borderRadius: 12,
        padding: 24,
        cursor: "pointer",
        transition: "all 0.15s",
        boxShadow: hovered ? "0 4px 20px rgba(224,49,49,0.12)" : "0 1px 4px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-2px)" : "none",
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: colors[idx], border: `1px solid ${hovered ? ACCENT_BORDER : "#e9ecef"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 14, fontSize: 22, transition: "all 0.15s",
      }}>
        {icons[idx]}
      </div>
      <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, color: "#1e1e1e" }}>
        {room.slug}
      </h3>
      <p style={{ margin: 0, fontSize: 12, color: "#adb5bd" }}>
        {new Date(room.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </p>
      {hovered && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f1f3f5" }}>
          <span style={{ fontSize: 12, color: ACCENT, fontWeight: 500 }}>Open board →</span>
        </div>
      )}
    </div>
  );
}
