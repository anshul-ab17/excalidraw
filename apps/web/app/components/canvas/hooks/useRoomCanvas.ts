"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import rough from "roughjs";
import { ExcaliElement, Tool, CursorPos } from "../types";
import { genId, genSeed } from "../canvasUtils";
import { renderElement, RoughCache, PencilCache } from "../renderElement";
import { API_URL, WS_URL } from "../../../lib/config";

export function useRoomCanvas(slug: string) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const router = useRouter();

  const [elements, setElements] = useState<ExcaliElement[]>([]);
  const [currentTool, setCurrentTool] = useState<Tool>("rectangle");
  const [strokeColor, setStrokeColor] = useState("#1e1e1e");
  const [bgColor, setBgColor] = useState("transparent");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [roughness, setRoughness] = useState(1);
  const [opacity, setOpacity] = useState(100);
  const [history, setHistory] = useState<ExcaliElement[][]>([[]]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const [cursors, setCursors] = useState<CursorPos[]>([]);
  const [connected, setConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ id: string; userId: string; text: string; ts: number; self: boolean }[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const myUserIdRef = useRef<string>("");

  const isDrawingRef = useRef(false);
  const drawingElementRef = useRef<ExcaliElement | null>(null);
  // Authoritative element list — always up to date, no React render cycle lag
  const elementsRef = useRef<ExcaliElement[]>([]);
  // In-progress strokes from remote users (userId -> element); updated via draw_live
  const liveRemoteRef = useRef<Map<string, ExcaliElement>>(new Map());
  const toolRef = useRef<Tool>("rectangle");
  const strokeColorRef = useRef("#1e1e1e");
  const bgColorRef = useRef("transparent");
  const strokeWidthRef = useRef(2);
  const roughnessRef = useRef(1);
  const opacityRef = useRef(100);
  const historyRef = useRef<ExcaliElement[][]>([[]]);
  const historyIdxRef = useRef(0);
  // Throttle timestamps for WS sends
  const lastCursorSendRef = useRef(0);
  const lastLiveSendRef = useRef(0);
  // RoughCanvas instance — created once, reset on resize
  const rcRef = useRef<ReturnType<typeof rough.canvas> | null>(null);
  const rafRef = useRef(0);
  const roughCacheRef = useRef<RoughCache>(new Map());
  const pencilCacheRef = useRef<PencilCache>(new Map());

  // Sync style refs to state (for event handlers that close over the ref)
  useEffect(() => { toolRef.current = currentTool; }, [currentTool]);
  useEffect(() => { strokeColorRef.current = strokeColor; }, [strokeColor]);
  useEffect(() => { bgColorRef.current = bgColor; }, [bgColor]);
  useEffect(() => { strokeWidthRef.current = strokeWidth; }, [strokeWidth]);
  useEffect(() => { roughnessRef.current = roughness; }, [roughness]);
  useEffect(() => { opacityRef.current = opacity; }, [opacity]);

  // Update both the ref (for immediate reads) and state (for React consumers) atomically
  function applyElements(els: ExcaliElement[]) {
    elementsRef.current = els;
    setElements(els);
  }

  // RAF render loop — runs once, reads exclusively from refs so no React re-render is needed
  // for canvas updates. Committed elements + remote live strokes + local in-progress stroke
  // are all picked up every frame with zero state pressure.
  useEffect(() => {
    function loop() {
      const canvas = canvasRef.current;
      if (canvas) {
        if (!rcRef.current) rcRef.current = rough.canvas(canvas);
        const rc = rcRef.current;
        const ctx = canvas.getContext("2d")!;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#f8f9fa";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Batched grid — single path instead of one stroke call per line
        ctx.strokeStyle = "#e9ecef";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 40) {
          ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
        }
        for (let y = 0; y < canvas.height; y += 40) {
          ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
        }
        ctx.stroke();

        elementsRef.current.forEach((el) => renderElement(rc, ctx, el, undefined, undefined, roughCacheRef.current, pencilCacheRef.current));
        liveRemoteRef.current.forEach((el) => renderElement(rc, ctx, el, undefined, undefined, undefined, pencilCacheRef.current));
        if (drawingElementRef.current) renderElement(rc, ctx, drawingElementRef.current, undefined, undefined, undefined, pencilCacheRef.current);
      }
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Resize canvas
  useEffect(() => {
    function resize() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      rcRef.current = null; // recreate RoughCanvas after dimension change
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // WebSocket + room init
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/signin"); return; }
    try {
      myUserIdRef.current = JSON.parse(atob(token.split(".")[1])).userId ?? "";
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
            historyRef.current = [msg.elements];
            historyIdxRef.current = 0;
            setHistory([msg.elements]);
            setHistoryIdx(0);
            break;
          }
          case "draw": {
            // Remove live preview for this user — final element replaces it
            liveRemoteRef.current.delete(msg.userId);
            const idx = elementsRef.current.findIndex((e) => e.id === msg.element.id);
            let next: ExcaliElement[];
            if (idx >= 0) {
              next = [...elementsRef.current];
              next[idx] = msg.element;
            } else {
              next = [...elementsRef.current, msg.element];
            }
            applyElements(next);
            break;
          }
          case "draw_live": {
            // Store in ref — RAF renders it without any React state update
            liveRemoteRef.current.set(msg.userId, msg.element);
            break;
          }
          case "erase": {
            applyElements(elementsRef.current.filter((e) => !msg.elementIds.includes(e.id)));
            break;
          }
          case "clear": {
            liveRemoteRef.current.clear();
            applyElements([]);
            break;
          }
          case "cursor": {
            setCursors((prev) => [
              ...prev.filter((c) => c.userId !== msg.userId),
              { x: msg.x, y: msg.y, userId: msg.userId },
            ]);
            break;
          }
          case "user_left": {
            liveRemoteRef.current.delete(msg.userId);
            setCursors((prev) => prev.filter((c) => c.userId !== msg.userId));
            break;
          }
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

  function getCoords(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function pushHistory(els: ExcaliElement[]) {
    const next = historyRef.current.slice(0, historyIdxRef.current + 1);
    const newHistory = [...next, els];
    historyRef.current = newHistory;
    historyIdxRef.current = newHistory.length - 1;
    setHistory(newHistory);
    setHistoryIdx(historyIdxRef.current);
  }

  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (e.button !== 0) return;
    const { x, y } = getCoords(e);
    const tool = toolRef.current;

    if (tool === "eraser") {
      const hit = elementsRef.current.find((el) => {
        const mx = Math.min(el.x, el.x + el.width), Mx = Math.max(el.x, el.x + el.width);
        const my = Math.min(el.y, el.y + el.height), My = Math.max(el.y, el.y + el.height);
        return x >= mx - 10 && x <= Mx + 10 && y >= my - 10 && y <= My + 10;
      });
      if (hit) {
        applyElements(elementsRef.current.filter((el) => el.id !== hit.id));
        wsRef.current?.send(JSON.stringify({ type: "erase", elementIds: [hit.id] }));
      }
      return;
    }

    const newEl: ExcaliElement = {
      id: genId(), type: tool,
      x, y, width: 0, height: 0,
      strokeColor: strokeColorRef.current, backgroundColor: bgColorRef.current,
      strokeWidth: strokeWidthRef.current, roughness: roughnessRef.current,
      opacity: opacityRef.current, seed: genSeed(),
      points: tool === "pencil" ? [[x, y]] : undefined,
      text: tool === "text" ? "" : undefined,
    };

    if (tool === "text") {
      const text = prompt("Enter text:") || "";
      if (!text) return;
      newEl.text = text;
      newEl.width = text.length * 10;
      newEl.height = 24;
      const finalEl = { ...newEl };
      const newEls = [...elementsRef.current, finalEl];
      applyElements(newEls);
      wsRef.current?.send(JSON.stringify({ type: "draw", element: finalEl }));
      pushHistory(newEls);
      return;
    }

    drawingElementRef.current = newEl;
    isDrawingRef.current = true;
  }

  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const { x, y } = getCoords(e);
    const now = Date.now();

    // Throttled cursor broadcast — max ~30 fps
    if (now - lastCursorSendRef.current >= 33) {
      wsRef.current?.send(JSON.stringify({ type: "cursor", x, y }));
      lastCursorSendRef.current = now;
    }

    if (!isDrawingRef.current || !drawingElementRef.current) return;

    const el = drawingElementRef.current;
    drawingElementRef.current = el.type === "pencil"
      ? { ...el, points: [...(el.points || []), [x, y]] }
      : { ...el, width: x - el.x, height: y - el.y };

    // Throttled live draw broadcast — others see stroke in real time at ~60 fps
    if (now - lastLiveSendRef.current >= 16) {
      wsRef.current?.send(JSON.stringify({ type: "draw_live", element: drawingElementRef.current }));
      lastLiveSendRef.current = now;
    }
    // No setElements call here — RAF loop reads drawingElementRef.current directly
  }

  function onMouseUp() {
    if (!isDrawingRef.current || !drawingElementRef.current) return;
    const finalEl = { ...drawingElementRef.current };
    isDrawingRef.current = false;
    drawingElementRef.current = null;

    if (
      (finalEl.type !== "pencil" && Math.abs(finalEl.width) < 2 && Math.abs(finalEl.height) < 2) ||
      (finalEl.type === "pencil" && (!finalEl.points || finalEl.points.length < 2))
    ) return;

    const newEls = [...elementsRef.current, finalEl];
    applyElements(newEls);
    wsRef.current?.send(JSON.stringify({ type: "draw", element: finalEl }));
    pushHistory(newEls);
  }

  function undo() {
    if (historyIdxRef.current === 0) return;
    const idx = historyIdxRef.current - 1;
    historyIdxRef.current = idx;
    setHistoryIdx(idx);
    applyElements(historyRef.current[idx] ?? []);
  }

  function redo() {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    const idx = historyIdxRef.current + 1;
    historyIdxRef.current = idx;
    setHistoryIdx(idx);
    applyElements(historyRef.current[idx] ?? []);
  }

  function clearCanvas() {
    if (!confirm("Clear all elements?")) return;
    liveRemoteRef.current.clear();
    roughCacheRef.current.clear();
    pencilCacheRef.current.clear();
    applyElements([]);
    pushHistory([]);
    wsRef.current?.send(JSON.stringify({ type: "clear" }));
  }

  function downloadCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${slug}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function sendChat(text: string) {
    if (!text.trim() || !wsRef.current) return;
    wsRef.current.send(JSON.stringify({ type: "chat", text: text.trim() }));
  }

  function clearUnread() {
    setUnreadCount(0);
  }

  const cursor =
    currentTool === "eraser" ? "cell" :
    currentTool === "text" ? "text" :
    currentTool === "selection" ? "default" : "crosshair";

  return {
    canvasRef,
    currentTool, setCurrentTool,
    strokeColor, setStrokeColor,
    bgColor, setBgColor,
    strokeWidth, setStrokeWidth,
    roughness, setRoughness,
    opacity, setOpacity,
    history, historyIdx,
    cursors, connected, copied,
    chatMessages, unreadCount, sendChat, clearUnread,
    onMouseDown, onMouseMove, onMouseUp,
    undo, redo, clearCanvas, downloadCanvas, copyLink,
    cursor,
  };
}
