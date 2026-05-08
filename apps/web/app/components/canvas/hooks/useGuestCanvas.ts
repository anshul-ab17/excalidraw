"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import rough from "roughjs";
import { STORAGE_KEY } from "../types";
import { drawSelectionOverlay } from "../canvasUtils";
import { renderElement, RoughCache, PencilCache } from "../renderElement";
import { useCanvasStyle } from "./useCanvasStyle";
import { useCanvasHistory } from "./useCanvasHistory";
import { useZoomPan } from "./useZoomPan";
import { useAiDiagram } from "./useAiDiagram";
import { useGuestDrawing } from "./useGuestDrawing";

export function useGuestCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const rcRef = useRef<ReturnType<typeof rough.canvas> | null>(null);
  const rafRef = useRef(0);
  const roughCacheRef = useRef<RoughCache>(new Map());
  const pencilCacheRef = useRef<PencilCache>(new Map());
  const router = useRouter();

  // BroadcastChannel — syncs elements across tabs/windows in the same browser
  const bcRef = useRef<BroadcastChannel | null>(null);
  const tabId = useRef(Math.random().toString(36).slice(2));
  const isBcReceivingRef = useRef(false);

  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  const style = useCanvasStyle();
  const hist = useCanvasHistory();
  const zoom = useZoomPan(canvasRef, () => { rcRef.current = null; });
  const ai = useAiDiagram({ elementsRef: hist.elementsRef, pushHistory: hist.pushHistory, setElements: hist.setElements });
  const draw = useGuestDrawing({
    canvasRef,
    elementsRef: hist.elementsRef,
    setElements: hist.setElements,
    pushHistory: hist.pushHistory,
    panOffsetRef: zoom.panOffsetRef,
    zoomRef: zoom.zoomRef,
    isPanningRef: zoom.isPanningRef,
    panStartRef: zoom.panStartRef,
    setPanOffset: zoom.setPanOffset,
    setIsPanning: zoom.setIsPanning,
    strokeColorRef: style.strokeColorRef,
    bgColorRef: style.bgColorRef,
    strokeWidthRef: style.strokeWidthRef,
    roughnessRef: style.roughnessRef,
    opacityRef: style.opacityRef,
    fontSizeRef: style.fontSizeRef,
    fontFamilyRef: style.fontFamilyRef,
  });

  // BroadcastChannel setup — receive elements from other tabs
  useEffect(() => {
    if (typeof window === "undefined") return;
    const bc = new BroadcastChannel("Canvas_guest_sync");
    bcRef.current = bc;
    bc.onmessage = (e) => {
      if (e.data?.tabId === tabId.current) return; // ignore own echoes
      isBcReceivingRef.current = true;
      hist.setElements(e.data.elements);
      isBcReceivingRef.current = false;
    };
    return () => bc.close();
  }, []);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const els = JSON.parse(saved);
        if (els.length > 0) {
          hist.setElements(els);
          hist.setHistory([[], els]);
          hist.setHistoryIdx(1);
        }
      }
    } catch { }
    setIsSignedIn(!!localStorage.getItem("token"));
    ai.setUserApiKey(localStorage.getItem("canvas_api_key") ?? "");
    setLoaded(true);
  }, []);

  // Save to localStorage + broadcast to other tabs
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(hist.elements)); } catch { }
    // Don't re-broadcast what we just received from another tab
    if (!isBcReceivingRef.current) {
      bcRef.current?.postMessage({ tabId: tabId.current, elements: hist.elements });
    }
  }, [hist.elements, loaded]);

  // RAF render loop — reads exclusively from refs, zero React re-render pressure
  useEffect(() => {
    function loop() {
      const canvas = canvasRef.current;
      if (canvas) {
        if (!rcRef.current) rcRef.current = rough.canvas(canvas);
        const rc = rcRef.current;
        const ctx = canvas.getContext("2d")!;
        const pan = zoom.panOffsetRef.current!;
        const z = zoom.zoomRef.current!;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#FBF8F1";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Batched grid — single beginPath/stroke instead of one per line
        const gridSize = 40 * z;
        const ox = ((pan.x % gridSize) + gridSize) % gridSize;
        const oy = ((pan.y % gridSize) + gridSize) % gridSize;
        ctx.strokeStyle = "#e9ecef";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = ox - gridSize; x < canvas.width + gridSize; x += gridSize) {
          ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
        }
        for (let y = oy - gridSize; y < canvas.height + gridSize; y += gridSize) {
          ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
        }
        ctx.stroke();

        ctx.save();
        ctx.translate(pan.x, pan.y);
        ctx.scale(z, z);
        hist.elementsRef.current.forEach(el =>
          renderElement(rc, ctx, el, imageCacheRef.current,
            () => { /* image loaded — RAF picking it up */ },
            roughCacheRef.current, pencilCacheRef.current)
        );
        if (draw.drawingElementRef.current) {
          // Draw the active element with slightly more stable parameters if needed
          renderElement(rc, ctx, draw.drawingElementRef.current, imageCacheRef.current,
            undefined, roughCacheRef.current, pencilCacheRef.current);
        }
        ctx.restore();

        // Eraser/Hand/Selection previews in screen space
        const { x: mx, y: my } = zoom.mousePosRef.current;
        if (draw.currentTool === "eraser") {
          ctx.beginPath();
          ctx.arc(mx, my, 10, 0, Math.PI * 2);
          ctx.strokeStyle = ACCENT;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Selection overlay (drawn in screen space)
        const selId = draw.selectedIdRef.current;
        if (selId) {
          const sel = hist.elementsRef.current.find(e => e.id === selId);
          if (sel) drawSelectionOverlay(ctx, sel, pan, z);
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  function clearCanvas() {
    if (!confirm("Clear all elements?")) return;
    hist.setElements([]);
    draw.setSelectedId(null);
    hist.pushHistory([]);
  }

  function downloadCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "canvas.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const cursor =
    draw.currentTool === "hand" ? (zoom.isPanning ? "grabbing" : "grab") :
      draw.currentTool === "eraser" ? "cell" :
        draw.currentTool === "text" ? "text" :
          draw.currentTool === "selection" ? draw.canvasCursor : "crosshair";

  const textScreenX = draw.textInput ? draw.textInput.x * zoom.zoom + zoom.panOffset.x : 0;
  const textScreenY = draw.textInput ? draw.textInput.y * zoom.zoom + zoom.panOffset.y : 0;

  return {
    canvasRef,
    fileInputRef: draw.fileInputRef,
    // style
    strokeColor: style.strokeColor, setStrokeColor: style.setStrokeColor,
    bgColor: style.bgColor, setBgColor: style.setBgColor,
    strokeWidth: style.strokeWidth, setStrokeWidth: style.setStrokeWidth,
    roughness: style.roughness, setRoughness: style.setRoughness,
    opacity: style.opacity, setOpacity: style.setOpacity,
    fontSize: style.fontSize, setFontSize: style.setFontSize,
    fontFamily: style.fontFamily, setFontFamily: style.setFontFamily,
    // history
    history: hist.history, historyIdx: hist.historyIdx,
    undo: hist.undo, redo: hist.redo,
    // zoom
    zoom: zoom.zoom, isPanning: zoom.isPanning,
    doZoom: zoom.doZoom,
    // drawing
    currentTool: draw.currentTool, handleToolChange: draw.handleToolChange,
    selectedId: draw.selectedId,
    textInput: draw.textInput, setTextInput: draw.setTextInput,
    onMouseDown: draw.onMouseDown, onMouseMove: draw.onMouseMove, onMouseUp: draw.onMouseUp,
    commitText: draw.commitText, onTextBoxDragStart: draw.onTextBoxDragStart,
    deleteSelected: draw.deleteSelected, handleImageUpload: draw.handleImageUpload,
    // ai
    showAiModal: ai.showAiModal, setShowAiModal: ai.setShowAiModal,
    aiPrompt: ai.aiPrompt, setAiPrompt: ai.setAiPrompt,
    aiMode: ai.aiMode, setAiMode: ai.setAiMode,
    aiLoading: ai.aiLoading, aiError: ai.aiError,
    userApiKey: ai.userApiKey, setUserApiKey: ai.setUserApiKey,
    showApiKey: ai.showApiKey, setShowApiKey: ai.setShowApiKey,
    generateDiagram: ai.generateDiagram,
    // misc
    isSignedIn, copied,
    clearCanvas, downloadCanvas, copyLink,
    cursor, textScreenX, textScreenY,
    goToDashboard: () => router.push("/dashboard"),
    goToSignIn: () => router.push("/signin"),
  };
}
