"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import rough from "roughjs";
import { STORAGE_KEY, ACCENT } from "../types";
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
  const skipNextBcRef = useRef(false);

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
      skipNextBcRef.current = true; // held true until the save effect consumes it
      hist.setElements(e.data.elements);
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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hist.elements));
    } catch (err) {
      if (err instanceof DOMException && err.name === "QuotaExceededError") {
        console.warn("[Canvas] localStorage quota exceeded — auto-save skipped.");
        if (!document.getElementById("__canvas_quota_warn__")) {
          const el = document.createElement("div");
          el.id = "__canvas_quota_warn__";
          el.textContent = "⚠ Storage full — drawing not saved. Clear some elements or download to keep your work.";
          Object.assign(el.style, {
            position: "fixed", bottom: "16px", left: "50%", transform: "translateX(-50%)",
            background: "#E84A3F", color: "#fff", padding: "10px 18px", borderRadius: "8px",
            fontSize: "13px", zIndex: "9999", pointerEvents: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          });
          document.body.appendChild(el);
          setTimeout(() => el.remove(), 5000);
        }
      }
    }
    if (skipNextBcRef.current) {
      skipNextBcRef.current = false;
      return;
    }
    bcRef.current?.postMessage({ tabId: tabId.current, elements: hist.elements });
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
        const isDark = document.documentElement.classList.contains("dark") ||
          document.documentElement.getAttribute("data-theme") === "dark";
        ctx.fillStyle = isDark ? "#15130F" : "#FBF8F1";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

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
