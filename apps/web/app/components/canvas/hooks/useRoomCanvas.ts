"use client";
import { useEffect, useRef, useState } from "react";
import rough from "roughjs";
import { ExcaliElement, Tool } from "../types";
import { genId, genSeed } from "../canvasUtils";
import { renderElement, RoughCache, PencilCache } from "../renderElement";
import { useCanvasStyle } from "./useCanvasStyle";
import { useCanvasHistory } from "./useCanvasHistory";
import { useAiDiagram } from "./useAiDiagram";
import { useRoomSocket } from "./useRoomSocket";

export function useRoomCanvas(slug: string) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rcRef = useRef<ReturnType<typeof rough.canvas> | null>(null);
  const rafRef = useRef(0);
  const roughCacheRef = useRef<RoughCache>(new Map());
  const pencilCacheRef = useRef<PencilCache>(new Map());

  const [currentTool, setCurrentTool] = useState<Tool>("rectangle");
  const [copied, setCopied] = useState(false);
  const toolRef = useRef<Tool>("rectangle");
  const isDrawingRef = useRef(false);
  const drawingElementRef = useRef<ExcaliElement | null>(null);

  useEffect(() => { toolRef.current = currentTool; }, [currentTool]);

  const style = useCanvasStyle();
  const hist = useCanvasHistory();
  const ai = useAiDiagram({
    elementsRef: hist.elementsRef,
    pushHistory: hist.pushHistory,
    setElements: hist.setElements,
  });
  const socket = useRoomSocket({
    slug,
    elementsRef: hist.elementsRef,
    setElements: hist.setElements,
    pushHistory: hist.pushHistory,
  });

  // RAF render loop
  useEffect(() => {
    function loop() {
      const canvas = canvasRef.current;
      if (canvas) {
        if (!rcRef.current) rcRef.current = rough.canvas(canvas);
        const rc = rcRef.current;
        const ctx = canvas.getContext("2d")!;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#FBF8F1";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "#E8E0D0";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 40) { ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); }
        for (let y = 0; y < canvas.height; y += 40) { ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); }
        ctx.stroke();

        hist.elementsRef.current.forEach((el) =>
          renderElement(rc, ctx, el, undefined, undefined, roughCacheRef.current, pencilCacheRef.current)
        );
        socket.liveRemoteRef.current.forEach((el) =>
          renderElement(rc, ctx, el, undefined, undefined, undefined, pencilCacheRef.current)
        );
        if (drawingElementRef.current)
          renderElement(rc, ctx, drawingElementRef.current, undefined, undefined, roughCacheRef.current, pencilCacheRef.current);
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
      rcRef.current = null;
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  function getCoords(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (e.button !== 0) return;
    const { x, y } = getCoords(e);
    const tool = toolRef.current;

    if (tool === "eraser") {
      const hit = hist.elementsRef.current.find((el) => {
        const mx = Math.min(el.x, el.x + el.width), Mx = Math.max(el.x, el.x + el.width);
        const my = Math.min(el.y, el.y + el.height), My = Math.max(el.y, el.y + el.height);
        return x >= mx - 10 && x <= Mx + 10 && y >= my - 10 && y <= My + 10;
      });
      if (hit) {
        const next = hist.elementsRef.current.filter((el) => el.id !== hit.id);
        hist.elementsRef.current = next;
        hist.setElements(next);
        socket.sendErase([hit.id]);
      }
      return;
    }

    const newEl: ExcaliElement = {
      id: genId(), type: tool,
      x, y, width: 0, height: 0,
      strokeColor: style.strokeColorRef.current, backgroundColor: style.bgColorRef.current,
      strokeWidth: style.strokeWidthRef.current, roughness: style.roughnessRef.current,
      opacity: style.opacityRef.current, seed: genSeed(),
      points: tool === "pencil" ? [[x, y]] : undefined,
    };

    if (tool === "text") {
      const text = prompt("Enter text:") || "";
      if (!text) return;
      const finalEl = { ...newEl, text, width: text.length * 10, height: 24 };
      const newEls = [...hist.elementsRef.current, finalEl];
      hist.elementsRef.current = newEls;
      hist.setElements(newEls);
      socket.sendDraw(finalEl);
      hist.pushHistory(newEls);
      return;
    }

    drawingElementRef.current = newEl;
    isDrawingRef.current = true;
  }

  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const { x, y } = getCoords(e);
    socket.sendCursor(x, y);
    if (!isDrawingRef.current || !drawingElementRef.current) return;
    const el = drawingElementRef.current;
    drawingElementRef.current = el.type === "pencil"
      ? { ...el, points: [...(el.points ?? []), [x, y]] }
      : { ...el, width: x - el.x, height: y - el.y };
    socket.sendDrawLive(drawingElementRef.current);
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
    const newEls = [...hist.elementsRef.current, finalEl];
    hist.elementsRef.current = newEls;
    hist.setElements(newEls);
    socket.sendDraw(finalEl);
    hist.pushHistory(newEls);
  }

  function clearCanvas() {
    if (!confirm("Clear all elements?")) return;
    socket.liveRemoteRef.current.clear();
    roughCacheRef.current.clear();
    pencilCacheRef.current.clear();
    hist.elementsRef.current = [];
    hist.setElements([]);
    hist.pushHistory([]);
    socket.sendClear();
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

  const cursor = currentTool === "eraser" ? "cell" :
    currentTool === "text" ? "text" :
    currentTool === "selection" ? "default" : "crosshair";

  return {
    canvasRef,
    currentTool, setCurrentTool,
    strokeColor: style.strokeColor, setStrokeColor: style.setStrokeColor,
    bgColor: style.bgColor, setBgColor: style.setBgColor,
    strokeWidth: style.strokeWidth, setStrokeWidth: style.setStrokeWidth,
    roughness: style.roughness, setRoughness: style.setRoughness,
    opacity: style.opacity, setOpacity: style.setOpacity,
    history: hist.history, historyIdx: hist.historyIdx,
    undo: hist.undo, redo: hist.redo,
    cursors: socket.cursors, connected: socket.connected, copied,
    chatMessages: socket.chatMessages, unreadCount: socket.unreadCount,
    chatOpen: socket.chatOpen, toggleChat: socket.toggleChat, sendChat: socket.sendChat,
    showAiModal: ai.showAiModal, setShowAiModal: ai.setShowAiModal,
    aiPrompt: ai.aiPrompt, setAiPrompt: ai.setAiPrompt,
    aiMode: ai.aiMode, setAiMode: ai.setAiMode,
    aiLoading: ai.aiLoading, aiError: ai.aiError,
    userApiKey: ai.userApiKey, setUserApiKey: ai.setUserApiKey,
    showApiKey: ai.showApiKey, setShowApiKey: ai.setShowApiKey,
    generateDiagram: ai.generateDiagram,
    onMouseDown, onMouseMove, onMouseUp,
    clearCanvas, downloadCanvas, copyLink,
    cursor,
  };
}
