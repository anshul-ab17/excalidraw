"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "../lib/config";
import DashboardNavbar from "./components/DashboardNavbar";
import DashboardHeader from "./components/DashboardHeader";
import RoomsGrid from "./components/RoomsGrid";
import CreateBoardModal from "./components/CreateBoardModal";
import { Room } from "./components/RoomCard";

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
      const res = await fetch(`${API_URL}/rooms`, {
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
      const res = await fetch(`${API_URL}/room`, {
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

  function closeModal() {
    setShowCreate(false);
    setNewRoomName("");
  }

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      position: "relative",
    }}>
      {/* Grain overlay */}
      <svg
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 3, mixBlendMode: "multiply", opacity: 0.12 } as React.CSSProperties}
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="n">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .6 0"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#n)"/>
      </svg>

      {/* Corner ticks */}
      <div style={{ position: "fixed", top: 40, left: 30, width: 12, height: 12, border: `1px solid var(--border)`, zIndex: 25 }} />
      <div style={{ position: "fixed", top: 40, right: 30, width: 12, height: 12, border: `1px solid var(--border)`, zIndex: 25 }} />
      <div style={{ position: "fixed", top: 46, left: 36, right: 36, height: 1, background: "var(--border)", opacity: 0.3, zIndex: 25 }} />
      <DashboardNavbar
        onLogoClick={() => router.push("/")}
        onOpenCanvas={() => router.push("/")}
        onLogout={logout}
      />

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "120px 48px 60px", position: "relative", zIndex: 5 }}>
        <DashboardHeader
          loading={loading}
          roomCount={rooms.length}
          onNewBoard={() => setShowCreate(true)}
        />
        <RoomsGrid
          loading={loading}
          rooms={rooms}
          onRoomClick={slug => router.push(`/room/${slug}`)}
          onNewBoard={() => setShowCreate(true)}
        />
      </div>

      {showCreate && (
        <CreateBoardModal
          newRoomName={newRoomName}
          creating={creating}
          onChange={setNewRoomName}
          onSubmit={createRoom}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
