"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ExcaliElement, CursorPos } from "../types";
import { API_URL, WS_URL } from "../../../lib/config";

interface UseRoomSocketOptions {
  slug: string;
  elementsRef: React.MutableRefObject<ExcaliElement[]>;
  setElements: (els: ExcaliElement[]) => void;
  pushHistory: (els: ExcaliElement[]) => void;
}

export function useRoomSocket({ slug, elementsRef, setElements, pushHistory }: UseRoomSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const liveRemoteRef = useRef<Map<string, ExcaliElement>>(new Map());
  const myUserIdRef = useRef<string>("");
  const lastCursorSendRef = useRef(0);
  const lastLiveSendRef = useRef(0);
  const router = useRouter();

  const [connected, setConnected] = useState(false);
  const [cursors, setCursors] = useState<CursorPos[]>([]);
  const [chatMessages, setChatMessages] = useState<
    { id: string; userId: string; text: string; ts: number; self: boolean }[]
  >([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);

  function applyElements(els: ExcaliElement[]) {
    elementsRef.current = els;
    setElements(els);
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/signin"); return; }
    try {
      myUserIdRef.current = JSON.parse(atob(token.split(".")[1] ?? "")).userId ?? "";
    } catch { /* ignore */ }

    async function init() {
      const res = await fetch(`${API_URL}/room/${slug}`, { headers: { authorization: token! } });
      if (!res.ok) { router.push("/dashboard"); return; }
      const data = await res.json();

      const ws = new WebSocket(`${WS_URL}?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        ws.send(JSON.stringify({ type: "join_room", roomId: String(data.room.id) }));
      };

      ws.onmessage = (evt) => {
        const msg = JSON.parse(evt.data);
        switch (msg.type) {
          case "init_room": {
            liveRemoteRef.current.clear();
            applyElements(msg.elements);
            pushHistory(msg.elements);
            break;
          }
          case "draw": {
            liveRemoteRef.current.delete(msg.userId);
            const idx = elementsRef.current.findIndex((e) => e.id === msg.element.id);
            const next = idx >= 0
              ? elementsRef.current.map((e, i) => i === idx ? msg.element : e)
              : [...elementsRef.current, msg.element];
            applyElements(next);
            break;
          }
          case "draw_live":
            liveRemoteRef.current.set(msg.userId, msg.element);
            break;
          case "erase":
            applyElements(elementsRef.current.filter((e) => !msg.elementIds.includes(e.id)));
            break;
          case "clear":
            liveRemoteRef.current.clear();
            applyElements([]);
            break;
          case "cursor":
            setCursors((prev) => [
              ...prev.filter((c) => c.userId !== msg.userId),
              { x: msg.x, y: msg.y, userId: msg.userId },
            ]);
            break;
          case "user_left":
            liveRemoteRef.current.delete(msg.userId);
            setCursors((prev) => prev.filter((c) => c.userId !== msg.userId));
            break;
          case "chat": {
            const isSelf = msg.userId === myUserIdRef.current;
            setChatMessages((prev) => [
              ...prev,
              { id: `${msg.userId}-${msg.ts}`, userId: msg.userId, text: msg.text, ts: msg.ts, self: isSelf },
            ]);
            if (!isSelf) setUnreadCount((n) => n + 1);
            break;
          }
        }
      };

      ws.onclose = () => setConnected(false);
    }

    init();
    return () => { wsRef.current?.close(); };
  }, [slug, router]);

  function sendCursor(x: number, y: number) {
    const now = Date.now();
    if (now - lastCursorSendRef.current < 33) return;
    lastCursorSendRef.current = now;
    wsRef.current?.send(JSON.stringify({ type: "cursor", x, y }));
  }

  function sendDrawLive(element: ExcaliElement) {
    const now = Date.now();
    if (now - lastLiveSendRef.current < 16) return;
    lastLiveSendRef.current = now;
    wsRef.current?.send(JSON.stringify({ type: "draw_live", element }));
  }

  function sendDraw(element: ExcaliElement) {
    wsRef.current?.send(JSON.stringify({ type: "draw", element }));
  }

  function sendErase(elementIds: string[]) {
    wsRef.current?.send(JSON.stringify({ type: "erase", elementIds }));
  }

  function sendClear() {
    wsRef.current?.send(JSON.stringify({ type: "clear" }));
  }

  function sendChat(text: string) {
    if (!text.trim() || !wsRef.current) return;
    wsRef.current.send(JSON.stringify({ type: "chat", text: text.trim() }));
  }

  function toggleChat() {
    setChatOpen((v) => {
      if (!v) setUnreadCount(0);
      return !v;
    });
  }

  return {
    wsRef,
    liveRemoteRef,
    connected,
    cursors,
    chatMessages, unreadCount, chatOpen,
    toggleChat, sendChat,
    sendCursor, sendDrawLive, sendDraw, sendErase, sendClear,
  };
}
