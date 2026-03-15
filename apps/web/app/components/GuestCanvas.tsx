"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getStroke } from "perfect-freehand";
import rough from "roughjs";

type Tool = "selection" | "hand" | "rectangle" | "diamond" | "ellipse" | "line" | "arrow" | "pencil" | "text" | "eraser";
type AiMode = "diagram" | "flowchart";
type HandlePos = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "p1" | "p2";

interface ExcaliElement {
  id: string;
  type: Tool | "image";
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  backgroundColor: string;
  strokeWidth: number;
  roughness: number;
  opacity: number;
  points?: Array<[number, number]>;
  text?: string;
  seed: number;
  imageData?: string;
}

interface TextInputState { x: number; y: number; value: string; }
interface SelDrag {
  mode: "move" | "resize";
  handle: HandlePos | null;
  mouseStartX: number;
  mouseStartY: number;
  originalEl: ExcaliElement;
}

function genId() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
function genSeed() { return Math.floor(Math.random() * 100000); }

function getSvgPathFromStroke(stroke: number[][]): string {
  if (stroke.length < 2) return "";
  const parts: string[] = [];
  const f = stroke[0]!;
  parts.push(`M ${f[0]!} ${f[1]!} Q`);
  for (let i = 0; i < stroke.length; i++) {
    const a = stroke[i]!;
    const b = stroke[(i + 1) % stroke.length]!;
    const ax = a[0]!, ay = a[1]!, bx = b[0]!, by = b[1]!;
    parts.push(`${ax} ${ay} ${(ax + bx) / 2} ${(ay + by) / 2}`);
  }
  parts.push("Z");
  return parts.join(" ");
}

// Hit test: is canvas-coord point (cx,cy) on the element?
function hitTest(el: ExcaliElement, cx: number, cy: number, zoom: number): boolean {
  const tol = 8 / zoom;
  switch (el.type) {
    case "rectangle":
    case "image":
    case "text": {
      const minX = Math.min(el.x, el.x + el.width) - tol;
      const maxX = Math.max(el.x, el.x + el.width) + tol;
      const minY = Math.min(el.y, el.y + el.height) - tol;
      const maxY = Math.max(el.y, el.y + el.height) + el.height + tol;
      return cx >= minX && cx <= maxX && cy >= minY && cy <= maxY;
    }
    case "diamond": {
      const dcx = el.x + el.width / 2, dcy = el.y + el.height / 2;
      const hw = Math.abs(el.width) / 2 + tol, hh = Math.abs(el.height) / 2 + tol;
      return Math.abs(cx - dcx) / hw + Math.abs(cy - dcy) / hh <= 1;
    }
    case "ellipse": {
      const ecx = el.x + el.width / 2, ecy = el.y + el.height / 2;
      const rx = Math.abs(el.width) / 2 + tol, ry = Math.abs(el.height) / 2 + tol;
      return (cx - ecx) ** 2 / rx ** 2 + (cy - ecy) ** 2 / ry ** 2 <= 1;
    }
    case "line":
    case "arrow": {
      const x1 = el.x, y1 = el.y, x2 = el.x + el.width, y2 = el.y + el.height;
      const dx = x2 - x1, dy = y2 - y1;
      const len2 = dx * dx + dy * dy;
      if (len2 === 0) return Math.hypot(cx - x1, cy - y1) <= tol + 5;
      const t = Math.max(0, Math.min(1, ((cx - x1) * dx + (cy - y1) * dy) / len2));
      return Math.hypot(cx - (x1 + t * dx), cy - (y1 + t * dy)) <= tol + 5;
    }
    case "pencil": {
      if (!el.points || el.points.length < 2) return false;
      for (let i = 0; i < el.points.length - 1; i++) {
        const [x1, y1] = el.points[i]!, [x2, y2] = el.points[i + 1]!;
        const dx = x2 - x1, dy = y2 - y1, len2 = dx * dx + dy * dy;
        if (len2 === 0) continue;
        const t = Math.max(0, Math.min(1, ((cx - x1) * dx + (cy - y1) * dy) / len2));
        if (Math.hypot(cx - (x1 + t * dx), cy - (y1 + t * dy)) <= tol + el.strokeWidth) return true;
      }
      return false;
    }
  }
  return false;
}

// Get which resize handle is at screen point (sx, sy)
function getHandleAt(el: ExcaliElement, sx: number, sy: number, pan: { x: number; y: number }, zoom: number): HandlePos | null {
  const R = 7;
  const toS = (cx: number, cy: number) => ({ x: cx * zoom + pan.x, y: cy * zoom + pan.y });
  const hit = (hx: number, hy: number) => Math.abs(sx - hx) <= R && Math.abs(sy - hy) <= R;

  if (el.type === "line" || el.type === "arrow") {
    const { x: s1x, y: s1y } = toS(el.x, el.y);
    const { x: s2x, y: s2y } = toS(el.x + el.width, el.y + el.height);
    if (hit(s1x, s1y)) return "p1";
    if (hit(s2x, s2y)) return "p2";
    return null;
  }

  const minX = Math.min(el.x, el.x + el.width), maxX = Math.max(el.x, el.x + el.width);
  const minY = Math.min(el.y, el.y + el.height), maxY = Math.max(el.y, el.y + el.height);
  const midX = (minX + maxX) / 2, midY = (minY + maxY) / 2;
  const { x: l, y: t } = toS(minX, minY);
  const { x: r, y: b } = toS(maxX, maxY);
  const { x: mx } = toS(midX, midY);
  const { y: my } = toS(midX, midY);

  if (hit(l, t)) return "nw";
  if (hit(mx, t)) return "n";
  if (hit(r, t)) return "ne";
  if (hit(l, my)) return "w";
  if (hit(r, my)) return "e";
  if (hit(l, b)) return "sw";
  if (hit(mx, b)) return "s";
  if (hit(r, b)) return "se";
  return null;
}

function applyResize(orig: ExcaliElement, handle: HandlePos, dx: number, dy: number): ExcaliElement {
  if (handle === "p1") {
    return { ...orig, x: orig.x + dx, y: orig.y + dy, width: orig.width - dx, height: orig.height - dy };
  }
  if (handle === "p2") {
    return { ...orig, width: orig.width + dx, height: orig.height + dy };
  }
  let minX = Math.min(orig.x, orig.x + orig.width);
  let minY = Math.min(orig.y, orig.y + orig.height);
  let maxX = Math.max(orig.x, orig.x + orig.width);
  let maxY = Math.max(orig.y, orig.y + orig.height);

  if (handle === "nw" || handle === "w" || handle === "sw") minX += dx;
  if (handle === "ne" || handle === "e" || handle === "se") maxX += dx;
  if (handle === "nw" || handle === "n" || handle === "ne") minY += dy;
  if (handle === "sw" || handle === "s" || handle === "se") maxY += dy;

  return { ...orig, x: minX, y: minY, width: Math.max(4, maxX - minX), height: Math.max(4, maxY - minY) };
}

function drawSelectionOverlay(
  ctx: CanvasRenderingContext2D,
  el: ExcaliElement,
  pan: { x: number; y: number },
  zoom: number
) {
  const HS = 8;
  const toS = (cx: number, cy: number) => ({ x: cx * zoom + pan.x, y: cy * zoom + pan.y });

  ctx.save();
  ctx.strokeStyle = "#1971c2";
  ctx.fillStyle = "white";
  ctx.lineWidth = 1.5;

  function drawHandle(hx: number, hy: number) {
    ctx.beginPath();
    ctx.rect(hx - HS / 2, hy - HS / 2, HS, HS);
    ctx.fill();
    ctx.stroke();
  }

  if (el.type === "line" || el.type === "arrow") {
    const { x: s1x, y: s1y } = toS(el.x, el.y);
    const { x: s2x, y: s2y } = toS(el.x + el.width, el.y + el.height);
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(s1x, s1y);
    ctx.lineTo(s2x, s2y);
    ctx.stroke();
    ctx.setLineDash([]);
    drawHandle(s1x, s1y);
    drawHandle(s2x, s2y);
  } else {
    const minX = Math.min(el.x, el.x + el.width), maxX = Math.max(el.x, el.x + el.width);
    const minY = Math.min(el.y, el.y + el.height), maxY = Math.max(el.y, el.y + el.height);
    const midX = (minX + maxX) / 2, midY = (minY + maxY) / 2;
    const { x: sl, y: st } = toS(minX, minY);
    const { x: sr, y: sb } = toS(maxX, maxY);
    const smx = (sl + sr) / 2, smy = (st + sb) / 2;

    ctx.setLineDash([4, 3]);
    ctx.strokeRect(sl - 4, st - 4, sr - sl + 8, sb - st + 8);
    ctx.setLineDash([]);

    for (const [hx, hy] of [[sl, st], [smx, st], [sr, st], [sl, smy], [sr, smy], [sl, sb], [smx, sb], [sr, sb]]) {
      drawHandle(hx!, hy!);
    }
  }
  ctx.restore();
}

const ACCENT = "#e03131";
const ACCENT_LIGHT = "#fff5f5";
const ACCENT_BORDER = "#fca5a5";
const COLORS = ["#1e1e1e", "#e03131", "#2f9e44", "#1971c2", "#f08c00", "#7048e8", "#c2255c", "#ffffff"];
const BG_COLORS = ["transparent", "#ffc9c9", "#b2f2bb", "#a5d8ff", "#ffec99", "#d0bfff", "#fcc2d7"];
const STORAGE_KEY = "canvas_drawing";

const HANDLE_CURSORS: Record<string, string> = {
  nw: "nw-resize", n: "n-resize", ne: "ne-resize",
  w: "w-resize", e: "e-resize",
  sw: "sw-resize", s: "s-resize", se: "se-resize",
  p1: "crosshair", p2: "crosshair",
};

export default function GuestCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
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
  const [copied, setCopied] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [textInput, setTextInput] = useState<TextInputState | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canvasCursor, setCanvasCursor] = useState("crosshair");

  // AI state
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiMode, setAiMode] = useState<AiMode>("diagram");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [userApiKey, setUserApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  // Refs (avoid stale closures in event handlers)
  const elementsRef = useRef<ExcaliElement[]>([]);
  const toolRef = useRef<Tool>("rectangle");
  const strokeColorRef = useRef("#1e1e1e");
  const bgColorRef = useRef("transparent");
  const strokeWidthRef = useRef(2);
  const roughnessRef = useRef(1);
  const opacityRef = useRef(100);
  const historyRef = useRef<ExcaliElement[][]>([[]]);
  const historyIdxRef = useRef(0);
  const panOffsetRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const isDrawingRef = useRef(false);
  const drawingElementRef = useRef<ExcaliElement | null>(null);
  const selectedIdRef = useRef<string | null>(null);
  const selDragRef = useRef<SelDrag | null>(null);
  const textDragRef = useRef<{ startMouseX: number; startMouseY: number; startCanvasX: number; startCanvasY: number } | null>(null);

  useEffect(() => { elementsRef.current = elements; }, [elements]);
  useEffect(() => { toolRef.current = currentTool; }, [currentTool]);
  useEffect(() => { strokeColorRef.current = strokeColor; }, [strokeColor]);
  useEffect(() => { bgColorRef.current = bgColor; }, [bgColor]);
  useEffect(() => { strokeWidthRef.current = strokeWidth; }, [strokeWidth]);
  useEffect(() => { roughnessRef.current = roughness; }, [roughness]);
  useEffect(() => { opacityRef.current = opacity; }, [opacity]);
  useEffect(() => { historyRef.current = history; }, [history]);
  useEffect(() => { historyIdxRef.current = historyIdx; }, [historyIdx]);
  useEffect(() => { panOffsetRef.current = panOffset; }, [panOffset]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const els = JSON.parse(saved) as ExcaliElement[];
        if (els.length > 0) {
          setElements(els);
          setHistory([[], els]);
          setHistoryIdx(1);
        }
      }
    } catch {}
    setIsSignedIn(!!localStorage.getItem("token"));
    setUserApiKey(localStorage.getItem("canvas_api_key") ?? "");
    setLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(elements)); } catch {}
  }, [elements, loaded]);

  // ─── Render element ────────────────────────────────────────────────────────
  function renderElement(rc: ReturnType<typeof rough.canvas>, ctx: CanvasRenderingContext2D, el: ExcaliElement) {
    ctx.save();
    ctx.globalAlpha = el.opacity / 100;

    if (el.type === "image") {
      if (!el.imageData) { ctx.restore(); return; }
      let img = imageCacheRef.current.get(el.id);
      if (!img) {
        img = new Image();
        img.onload = () => setElements(prev => [...prev]);
        img.src = el.imageData;
        imageCacheRef.current.set(el.id, img);
      }
      if (img.complete && img.naturalWidth > 0) ctx.drawImage(img, el.x, el.y, el.width, el.height);
      ctx.restore();
      return;
    }

    const opts = {
      stroke: el.strokeColor, strokeWidth: el.strokeWidth,
      roughness: el.roughness, seed: el.seed,
      fill: el.backgroundColor !== "transparent" ? el.backgroundColor : undefined,
      fillStyle: "hachure" as const,
    };

    switch (el.type) {
      case "rectangle": rc.rectangle(el.x, el.y, el.width, el.height, opts); break;
      case "diamond": {
        const cx = el.x + el.width / 2, cy = el.y + el.height / 2;
        rc.polygon([[cx, el.y], [el.x + el.width, cy], [cx, el.y + el.height], [el.x, cy]], opts);
        break;
      }
      case "ellipse":
        rc.ellipse(el.x + el.width / 2, el.y + el.height / 2, Math.abs(el.width), Math.abs(el.height), opts);
        break;
      case "line": rc.line(el.x, el.y, el.x + el.width, el.y + el.height, opts); break;
      case "arrow": {
        rc.line(el.x, el.y, el.x + el.width, el.y + el.height, opts);
        const angle = Math.atan2(el.height, el.width), hl = 15;
        const x2 = el.x + el.width, y2 = el.y + el.height;
        rc.line(x2, y2, x2 - hl * Math.cos(angle - Math.PI / 6), y2 - hl * Math.sin(angle - Math.PI / 6), { ...opts, roughness: 0 });
        rc.line(x2, y2, x2 - hl * Math.cos(angle + Math.PI / 6), y2 - hl * Math.sin(angle + Math.PI / 6), { ...opts, roughness: 0 });
        break;
      }
      case "pencil": {
        if (!el.points || el.points.length < 2) break;
        const stroke = getStroke(el.points, { size: el.strokeWidth * 3, thinning: 0.5, smoothing: 0.5, streamline: 0.5 });
        const path = new Path2D(getSvgPathFromStroke(stroke));
        ctx.fillStyle = el.strokeColor;
        ctx.fill(path);
        break;
      }
      case "text":
        ctx.font = `${16 + el.strokeWidth * 2}px "Segoe UI", sans-serif`;
        ctx.fillStyle = el.strokeColor;
        ctx.fillText(el.text || "", el.x, el.y + 16);
        break;
    }
    ctx.restore();
  }

  // ─── Canvas render effect ──────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const rc = rough.canvas(canvas);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f8f9fa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gridSize = 40 * zoom;
    const ox = ((panOffset.x % gridSize) + gridSize) % gridSize;
    const oy = ((panOffset.y % gridSize) + gridSize) % gridSize;
    ctx.strokeStyle = "#e9ecef";
    ctx.lineWidth = 1;
    for (let x = ox - gridSize; x < canvas.width + gridSize; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = oy - gridSize; y < canvas.height + gridSize; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);
    elements.forEach(el => renderElement(rc, ctx, el));
    if (drawingElementRef.current) renderElement(rc, ctx, drawingElementRef.current);
    ctx.restore();

    // Selection handles drawn in screen space (fixed pixel size)
    if (selectedId) {
      const sel = elements.find(e => e.id === selectedId);
      if (sel) drawSelectionOverlay(ctx, sel, panOffset, zoom);
    }
  }, [elements, panOffset, zoom, selectedId]);

  // ─── Resize canvas ─────────────────────────────────────────────────────────
  useEffect(() => {
    function resize() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      setElements(prev => [...prev]);
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // ─── Scroll to zoom ────────────────────────────────────────────────────────
  useEffect(() => {
    function onWheel(e: WheelEvent) {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        doZoom(e.deltaY < 0 ? 0.1 : -0.1);
      }
    }
    const canvas = canvasRef.current;
    canvas?.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas?.removeEventListener("wheel", onWheel);
  }, []);

  // ─── Helpers ───────────────────────────────────────────────────────────────
  function getCanvasCoords(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - panOffsetRef.current.x) / zoomRef.current,
      y: (e.clientY - rect.top - panOffsetRef.current.y) / zoomRef.current,
    };
  }

  function getScreenCoords(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function doZoom(delta: number) {
    const canvas = canvasRef.current;
    const newZoom = Math.max(0.1, Math.min(5, zoomRef.current + delta));
    if (canvas) {
      const cx = canvas.width / 2, cy = canvas.height / 2;
      const newPanX = cx - (cx - panOffsetRef.current.x) * newZoom / zoomRef.current;
      const newPanY = cy - (cy - panOffsetRef.current.y) * newZoom / zoomRef.current;
      setPanOffset({ x: newPanX, y: newPanY });
    }
    setZoom(newZoom);
  }

  function pushHistory(els: ExcaliElement[]) {
    const next = historyRef.current.slice(0, historyIdxRef.current + 1);
    const newH = [...next, els];
    setHistory(newH);
    setHistoryIdx(historyIdxRef.current + 1);
  }

  function commitText() {
    if (!textInput || !textInput.value.trim()) { setTextInput(null); return; }
    const el: ExcaliElement = {
      id: genId(), type: "text",
      x: textInput.x, y: textInput.y,
      width: textInput.value.length * 10, height: 24,
      strokeColor: strokeColorRef.current, backgroundColor: "transparent",
      strokeWidth: strokeWidthRef.current, roughness: 0, opacity: opacityRef.current,
      seed: genSeed(), text: textInput.value,
    };
    const next = [...elementsRef.current, el];
    setElements(next);
    pushHistory(next);
    setTextInput(null);
  }

  // ─── Mouse down ────────────────────────────────────────────────────────────
  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (e.button !== 0) return;
    if (textInput) { commitText(); return; }

    const tool = toolRef.current;

    // ── Pan ──
    if (tool === "hand") {
      isPanningRef.current = true;
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - panOffsetRef.current.x, y: e.clientY - panOffsetRef.current.y };
      return;
    }

    const { x: cx, y: cy } = getCanvasCoords(e);
    const { x: sx, y: sy } = getScreenCoords(e);

    // ── Selection ──
    if (tool === "selection") {
      // Check handle on selected element first
      if (selectedIdRef.current) {
        const sel = elementsRef.current.find(el => el.id === selectedIdRef.current);
        if (sel) {
          const handle = getHandleAt(sel, sx, sy, panOffsetRef.current, zoomRef.current);
          if (handle) {
            selDragRef.current = { mode: "resize", handle, mouseStartX: cx, mouseStartY: cy, originalEl: { ...sel } };
            setCanvasCursor(HANDLE_CURSORS[handle] ?? "default");
            return;
          }
        }
      }
      // Hit test all elements (top first)
      const hit = [...elementsRef.current].reverse().find(el => hitTest(el, cx, cy, zoomRef.current));
      if (hit) {
        setSelectedId(hit.id);
        selDragRef.current = { mode: "move", handle: null, mouseStartX: cx, mouseStartY: cy, originalEl: { ...hit } };
        setCanvasCursor("move");
      } else {
        setSelectedId(null);
        setCanvasCursor("default");
      }
      return;
    }

    // ── Eraser ──
    if (tool === "eraser") {
      const hit = elementsRef.current.find(el => hitTest(el, cx, cy, zoomRef.current));
      if (hit) {
        const next = elementsRef.current.filter(el => el.id !== hit.id);
        if (hit.id === selectedIdRef.current) setSelectedId(null);
        setElements(next);
        pushHistory(next);
      }
      return;
    }

    // ── Text ──
    if (tool === "text") {
      setTextInput({ x: cx, y: cy, value: "" });
      return;
    }

    // ── Draw shape ──
    const newEl: ExcaliElement = {
      id: genId(), type: tool,
      x: cx, y: cy, width: 0, height: 0,
      strokeColor: strokeColorRef.current, backgroundColor: bgColorRef.current,
      strokeWidth: strokeWidthRef.current, roughness: roughnessRef.current,
      opacity: opacityRef.current, seed: genSeed(),
      points: tool === "pencil" ? [[cx, cy]] : undefined,
    };
    drawingElementRef.current = newEl;
    isDrawingRef.current = true;
  }

  // ─── Mouse move ────────────────────────────────────────────────────────────
  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    // Pan
    if (isPanningRef.current) {
      const newOff = { x: e.clientX - panStartRef.current.x, y: e.clientY - panStartRef.current.y };
      panOffsetRef.current = newOff;
      setPanOffset(newOff);
      return;
    }

    const { x: cx, y: cy } = getCanvasCoords(e);
    const { x: sx, y: sy } = getScreenCoords(e);

    // Selection drag/resize
    if (toolRef.current === "selection" && selDragRef.current) {
      const drag = selDragRef.current;
      const dx = cx - drag.mouseStartX, dy = cy - drag.mouseStartY;
      const orig = drag.originalEl;

      setElements(prev => prev.map(el => {
        if (el.id !== orig.id) return el;
        if (drag.mode === "move") {
          if (orig.type === "pencil" && orig.points) {
            return { ...orig, points: orig.points.map(([px, py]) => [px + dx, py + dy] as [number, number]) };
          }
          return { ...orig, x: orig.x + dx, y: orig.y + dy };
        }
        // resize
        return applyResize(orig, drag.handle!, dx, dy);
      }));
      return;
    }

    // Update cursor when hovering in selection mode
    if (toolRef.current === "selection" && !selDragRef.current) {
      if (selectedIdRef.current) {
        const sel = elementsRef.current.find(el => el.id === selectedIdRef.current);
        if (sel) {
          const handle = getHandleAt(sel, sx, sy, panOffsetRef.current, zoomRef.current);
          if (handle) { setCanvasCursor(HANDLE_CURSORS[handle] ?? "default"); return; }
          if (hitTest(sel, cx, cy, zoomRef.current)) { setCanvasCursor("move"); return; }
        }
      }
      setCanvasCursor("default");
      return;
    }

    // Drawing
    if (!isDrawingRef.current || !drawingElementRef.current) return;
    const el = drawingElementRef.current;
    drawingElementRef.current = el.type === "pencil"
      ? { ...el, points: [...(el.points || []), [cx, cy]] }
      : { ...el, width: cx - el.x, height: cy - el.y };
    setElements(prev => [...prev]);
  }

  // ─── Mouse up ──────────────────────────────────────────────────────────────
  function onMouseUp() {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      setIsPanning(false);
      return;
    }

    // Commit selection drag/resize to history
    if (selDragRef.current) {
      selDragRef.current = null;
      pushHistory([...elementsRef.current]);
      setCanvasCursor(toolRef.current === "selection" ? "default" : "crosshair");
      return;
    }

    if (!isDrawingRef.current || !drawingElementRef.current) return;
    const finalEl = { ...drawingElementRef.current };
    isDrawingRef.current = false;
    drawingElementRef.current = null;

    if ((finalEl.type !== "pencil" && Math.abs(finalEl.width) < 2 && Math.abs(finalEl.height) < 2) ||
      (finalEl.type === "pencil" && (!finalEl.points || finalEl.points.length < 2))) {
      setElements(prev => [...prev]);
      return;
    }

    const next = [...elementsRef.current, finalEl];
    setElements(next);
    pushHistory(next);
  }

  // ─── Actions ───────────────────────────────────────────────────────────────
  function undo() {
    if (historyIdxRef.current === 0) return;
    const idx = historyIdxRef.current - 1;
    setHistoryIdx(idx);
    setElements(historyRef.current[idx] ?? []);
  }

  function redo() {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    const idx = historyIdxRef.current + 1;
    setHistoryIdx(idx);
    setElements(historyRef.current[idx] ?? []);
  }

  function clearCanvas() {
    if (!confirm("Clear all elements?")) return;
    setElements([]); setSelectedId(null); pushHistory([]);
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

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxW = 400, maxH = 300;
        let w = img.width, h = img.height;
        if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
        if (h > maxH) { w = Math.round(w * maxH / h); h = maxH; }
        const canvas = canvasRef.current;
        const cx = canvas ? (canvas.width / 2 - panOffsetRef.current.x) / zoomRef.current - w / 2 : 100;
        const cy = canvas ? (canvas.height / 2 - panOffsetRef.current.y) / zoomRef.current - h / 2 : 100;
        const el: ExcaliElement = {
          id: genId(), type: "image", x: cx, y: cy, width: w, height: h,
          strokeColor: "transparent", backgroundColor: "transparent",
          strokeWidth: 1, roughness: 0, opacity: 100, seed: genSeed(), imageData: dataUrl,
        };
        const next = [...elementsRef.current, el];
        setElements(next); pushHistory(next);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  // ─── AI diagram ────────────────────────────────────────────────────────────
  async function generateDiagram() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true); setAiError("");
    try {
      const res = await fetch("/api/ai-diagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, mode: aiMode, userApiKey: userApiKey.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setAiError(data.error || "Failed"); return; }
      const aiEls = convertAiElements(data.elements);
      const next = [...elementsRef.current, ...aiEls];
      setElements(next); pushHistory(next);
      setShowAiModal(false); setAiPrompt("");
    } catch {
      setAiError("Failed to connect. Check your API key or try again.");
    } finally { setAiLoading(false); }
  }

  function convertAiElements(raw: any[]): ExcaliElement[] {
    const result: ExcaliElement[] = [];
    for (const el of raw) {
      const type = (el.type as Tool) || "rectangle";
      result.push({
        id: genId(), type, x: el.x ?? 100, y: el.y ?? 100,
        width: el.width ?? 120, height: el.height ?? 60,
        strokeColor: el.strokeColor ?? "#1e1e1e", backgroundColor: el.backgroundColor ?? "transparent",
        strokeWidth: 2, roughness: 1, opacity: 100, seed: genSeed(),
        points: el.points, text: el.text,
      });
      if (el.label && type !== "text") {
        result.push({
          id: genId(), type: "text",
          x: (el.x ?? 100) + (el.width ?? 120) / 2 - el.label.length * 4,
          y: (el.y ?? 100) + (el.height ?? 60) / 2 - 16,
          width: el.label.length * 8, height: 20,
          strokeColor: "#1e1e1e", backgroundColor: "transparent",
          strokeWidth: 1, roughness: 0, opacity: 100, seed: genSeed(), text: el.label,
        });
      }
    }
    return result;
  }

  // ─── Text box drag ─────────────────────────────────────────────────────────
  function onTextBoxDragStart(e: React.MouseEvent) {
    e.preventDefault();
    if (!textInput) return;
    textDragRef.current = { startMouseX: e.clientX, startMouseY: e.clientY, startCanvasX: textInput.x, startCanvasY: textInput.y };
    function onMove(ev: MouseEvent) {
      if (!textDragRef.current) return;
      const dx = (ev.clientX - textDragRef.current.startMouseX) / zoomRef.current;
      const dy = (ev.clientY - textDragRef.current.startMouseY) / zoomRef.current;
      setTextInput(prev => prev ? { ...prev, x: textDragRef.current!.startCanvasX + dx, y: textDragRef.current!.startCanvasY + dy } : null);
    }
    function onUp() { textDragRef.current = null; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  // ─── Derived values ────────────────────────────────────────────────────────
  const tools: { id: Tool; icon: string; label: string }[] = [
    { id: "hand", icon: " ", label: "Pan" },
    { id: "selection", icon: "↖", label: "Select & Edit" },
    { id: "rectangle", icon: "▭", label: "Rectangle" },
    { id: "diamond", icon: "◇", label: "Diamond" },
    { id: "ellipse", icon: "○", label: "Ellipse" },
    { id: "line", icon: "╱", label: "Line" },
    { id: "arrow", icon: "→", label: "Arrow" },
    { id: "pencil", icon: "✏", label: "Pencil" },
    { id: "text", icon: "A", label: "Text" },
    { id: "eraser", icon: "⌫", label: "Eraser" },
  ];

  const cursor =
    currentTool === "hand" ? (isPanning ? "grabbing" : "grab") :
    currentTool === "eraser" ? "cell" :
    currentTool === "text" ? "text" :
    currentTool === "selection" ? canvasCursor : "crosshair";

  const textScreenX = textInput ? textInput.x * zoom + panOffset.x : 0;
  const textScreenY = textInput ? textInput.y * zoom + panOffset.y : 0;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden" }}>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />

      <canvas
        ref={canvasRef}
        style={{ display: "block", cursor }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      />

      {/* Inline text editor */}
      {textInput && (
        <div style={{ position: "fixed", left: textScreenX, top: textScreenY, zIndex: 200, minWidth: 120, boxShadow: "0 4px 16px rgba(0,0,0,0.15)", borderRadius: 6, overflow: "hidden" }}>
          <div onMouseDown={onTextBoxDragStart}
            style={{ background: ACCENT, padding: "3px 8px", cursor: "move", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "white", userSelect: "none" }}>
            <span>drag to move</span>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={commitText} style={{ background: "rgba(255,255,255,0.25)", border: "none", color: "white", borderRadius: 3, padding: "1px 6px", cursor: "pointer", fontSize: 12 }}>✓</button>
              <button onClick={() => setTextInput(null)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", borderRadius: 3, padding: "1px 6px", cursor: "pointer", fontSize: 12 }}>✕</button>
            </div>
          </div>
          <textarea autoFocus value={textInput.value}
            onChange={e => setTextInput(prev => prev ? { ...prev, value: e.target.value } : null)}
            onKeyDown={e => { if (e.key === "Escape") setTextInput(null); if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitText(); } }}
            placeholder="Type… (Enter to place)"
            style={{ display: "block", width: "100%", minWidth: 160, minHeight: 48, padding: "8px 10px", border: "none", borderTop: "1px dashed #e9ecef", background: "white", resize: "both", outline: "none", fontSize: `${16 + strokeWidth * 2}px`, color: strokeColor, fontFamily: '"Segoe UI", sans-serif', boxSizing: "border-box" }}
          />
        </div>
      )}

      {/* Delete selected element button */}
      {selectedId && (
        <div style={{ position: "fixed", bottom: 80, right: 16, zIndex: 20 }}>
          <button onClick={() => {
            const next = elementsRef.current.filter(el => el.id !== selectedId);
            setElements(next); setSelectedId(null); pushHistory(next);
          }}
            style={{ background: ACCENT, color: "white", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
            🗑 Delete selected
          </button>
        </div>
      )}

      {/* Top toolbar */}
      <div style={{ position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)", background: "white", borderRadius: 12, padding: "6px 8px", boxShadow: "0 2px 12px rgba(0,0,0,0.15)", display: "flex", gap: 4, zIndex: 10 }}>
        {tools.map(t => (
          <button key={t.id} onClick={() => { setCurrentTool(t.id); if (t.id !== "selection") setSelectedId(null); setCanvasCursor(t.id === "selection" ? "default" : "crosshair"); }} title={t.label}
            style={{ width: 36, height: 36, borderRadius: 8, fontSize: 15, background: currentTool === t.id ? ACCENT_LIGHT : "transparent", color: currentTool === t.id ? ACCENT : "#495057", border: currentTool === t.id ? `1px solid ${ACCENT_BORDER}` : "1px solid transparent", transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            {t.icon}
          </button>
        ))}
        <div style={{ width: 1, background: "#dee2e6", margin: "4px 2px" }} />
        <button onClick={() => fileInputRef.current?.click()} title="Insert image"
          style={{ width: 36, height: 36, borderRadius: 8, fontSize: 15, background: "transparent", color: "#495057", border: "1px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          🖼
        </button>
      </div>

      {/* Style panel */}
      <div style={{ position: "fixed", left: 12, top: "50%", transform: "translateY(-50%)", background: "white", borderRadius: 12, padding: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", gap: 12, zIndex: 10, width: 160 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6c757d", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Stroke</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {COLORS.map(c => (<button key={c} onClick={() => setStrokeColor(c)} style={{ width: 22, height: 22, borderRadius: 4, background: c, border: strokeColor === c ? `2px solid ${ACCENT}` : "1.5px solid #dee2e6", cursor: "pointer" }} />))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6c757d", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Fill</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {BG_COLORS.map(c => (<button key={c} onClick={() => setBgColor(c)} style={{ width: 22, height: 22, borderRadius: 4, background: c === "transparent" ? "white" : c, border: bgColor === c ? `2px solid ${ACCENT}` : "1.5px solid #dee2e6", cursor: "pointer", backgroundImage: c === "transparent" ? "linear-gradient(45deg,#ccc 25%,transparent 25%,transparent 75%,#ccc 75%),linear-gradient(45deg,#ccc 25%,transparent 25%,transparent 75%,#ccc 75%)" : "none", backgroundSize: c === "transparent" ? "8px 8px" : "auto", backgroundPosition: c === "transparent" ? "0 0,4px 4px" : "auto" }} />))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6c757d", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Stroke Width</div>
          <input type="range" min={1} max={8} value={strokeWidth} onChange={e => setStrokeWidth(+e.target.value)} style={{ width: "100%", accentColor: ACCENT }} />
          <div style={{ fontSize: 11, color: "#6c757d", textAlign: "right" }}>{strokeWidth}px</div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6c757d", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Roughness</div>
          <input type="range" min={0} max={3} step={0.5} value={roughness} onChange={e => setRoughness(+e.target.value)} style={{ width: "100%", accentColor: ACCENT }} />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6c757d", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Opacity</div>
          <input type="range" min={10} max={100} value={opacity} onChange={e => setOpacity(+e.target.value)} style={{ width: "100%", accentColor: ACCENT }} />
          <div style={{ fontSize: 11, color: "#6c757d", textAlign: "right" }}>{opacity}%</div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)", background: "white", borderRadius: 12, padding: "8px 12px", boxShadow: "0 2px 12px rgba(0,0,0,0.15)", display: "flex", gap: 8, zIndex: 10, alignItems: "center" }}>
        <button onClick={undo} disabled={historyIdx === 0} title="Undo" style={{ width: 32, height: 32, borderRadius: 6, fontSize: 14, border: "1px solid #dee2e6", background: "white", opacity: historyIdx === 0 ? 0.4 : 1, cursor: "pointer" }}>↩</button>
        <button onClick={redo} disabled={historyIdx >= history.length - 1} title="Redo" style={{ width: 32, height: 32, borderRadius: 6, fontSize: 14, border: "1px solid #dee2e6", background: "white", opacity: historyIdx >= history.length - 1 ? 0.4 : 1, cursor: "pointer" }}>↪</button>
        <div style={{ width: 1, height: 24, background: "#dee2e6" }} />
        <button onClick={() => doZoom(-0.1)} title="Zoom out" style={{ width: 28, height: 28, borderRadius: 6, fontSize: 16, border: "1px solid #dee2e6", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
        <div style={{ fontSize: 12, color: "#495057", minWidth: 38, textAlign: "center", fontWeight: 500 }}>{Math.round(zoom * 100)}%</div>
        <button onClick={() => doZoom(0.1)} title="Zoom in" style={{ width: 28, height: 28, borderRadius: 6, fontSize: 16, border: "1px solid #dee2e6", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
        <div style={{ width: 1, height: 24, background: "#dee2e6" }} />
        <button onClick={clearCanvas} style={{ width: 32, height: 32, borderRadius: 6, fontSize: 14, border: "1px solid #dee2e6", background: "white", color: ACCENT, cursor: "pointer" }}>🗑</button>
        <div style={{ width: 1, height: 24, background: "#dee2e6" }} />
        <button onClick={downloadCanvas} style={{ padding: "6px 12px", borderRadius: 6, fontSize: 13, border: "1px solid #dee2e6", background: "white", color: "#495057", cursor: "pointer" }}>⬇ Download</button>
        <button onClick={copyLink} style={{ padding: "6px 12px", borderRadius: 6, fontSize: 13, border: "1px solid #dee2e6", background: copied ? "#2f9e44" : "white", color: copied ? "white" : "#495057", transition: "all 0.2s", cursor: "pointer" }}>{copied ? "✓ Copied!" : "🔗 Share"}</button>
        <div style={{ width: 1, height: 24, background: "#dee2e6" }} />
        {/* <button onClick={() => { setAiMode("diagram"); setShowAiModal(true); }} style={{ padding: "6px 12px", borderRadius: 6, fontSize: 13, border: `1px solid ${ACCENT_BORDER}`, background: ACCENT_LIGHT, color: ACCENT, cursor: "pointer", fontWeight: 500 }}> Diagram</button> */}
        {/* <button onClick={() => { setAiMode("flowchart"); setShowAiModal(true); }} style={{ padding: "6px 12px", borderRadius: 6, fontSize: 13, border: `1px solid ${ACCENT_BORDER}`, background: ACCENT_LIGHT, color: ACCENT, cursor: "pointer", fontWeight: 500 }}> Flowchart</button> */}
      </div>

      {/* Brand */}
      <div style={{ position: "fixed", top: 16, left: 16, zIndex: 10 }}>
        <div style={{ background: "white", border: "1px solid #dee2e6", borderRadius: 8, padding: "6px 14px", fontSize: 15, fontWeight: 700, color: ACCENT }}> Canvas</div>
      </div>

      {/* Auth */}
      <div style={{ position: "fixed", top: 16, right: 16, zIndex: 10, display: "flex", gap: 8, alignItems: "center" }}>
        {isSignedIn ? (
          <button onClick={() => router.push("/dashboard")} style={{ background: ACCENT, color: "white", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>My Boards</button>
        ) : (
          <>
            <div style={{ background: "white", border: "1px solid #dee2e6", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#6c757d" }}>Sign in to save &amp; collaborate</div>
            <button onClick={() => router.push("/signin")} style={{ background: ACCENT, color: "white", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Sign In</button>
          </>
        )}
      </div>

      {/* AI Modal */}
      {showAiModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "white", padding: 32, borderRadius: 16, width: 480, boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700 }}>{aiMode === "flowchart" ? " Text to Flowchart" : " Text to Diagram"}</h2>
            <p style={{ margin: "0 0 20px", color: "#6c757d", fontSize: 13 }}>{aiMode === "flowchart" ? "Describe a process or workflow. AI generates a flowchart." : "Describe any diagram — architecture, mind map, org chart, network, etc."}</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {(["diagram", "flowchart"] as AiMode[]).map(m => (
                <button key={m} onClick={() => setAiMode(m)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 13, fontWeight: 500, background: aiMode === m ? ACCENT : "white", color: aiMode === m ? "white" : "#495057", border: `1px solid ${aiMode === m ? ACCENT : "#dee2e6"}`, cursor: "pointer", transition: "all 0.15s" }}>
                  {m === "diagram" ? "✦ Diagram" : "⬡ Flowchart"}
                </button>
              ))}
            </div>
            <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
              placeholder={aiMode === "flowchart" ? "e.g. User login: start → enter credentials → validate → if valid show dashboard, else show error → end" : "e.g. Microservices with API gateway, auth service, user service and PostgreSQL"}
              rows={4}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #dee2e6", fontSize: 13, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", outline: "none" }}
              onKeyDown={e => e.key === "Enter" && e.ctrlKey && generateDiagram()}
            />
            {aiError && <p style={{ color: ACCENT, fontSize: 13, margin: "8px 0 0" }}>{aiError}</p>}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={generateDiagram} disabled={aiLoading || !aiPrompt.trim()}
                style={{ flex: 1, padding: "10px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600, background: aiLoading || !aiPrompt.trim() ? "#e9ecef" : ACCENT, color: aiLoading || !aiPrompt.trim() ? "#6c757d" : "white", border: "none", cursor: aiLoading || !aiPrompt.trim() ? "not-allowed" : "pointer" }}>
                {aiLoading ? "Generating…" : "Generate (Ctrl+Enter)"}
              </button>
              <button onClick={() => { setShowAiModal(false); setAiError(""); }} style={{ padding: "10px 16px", borderRadius: 8, fontSize: 14, border: "1px solid #dee2e6", background: "white", cursor: "pointer" }}>Cancel</button>
            </div>

            {/* API Key input */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f3f5" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#495057" }}>OpenRouter API Key</label>
                <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer"
                  style={{ fontSize: 11, color: ACCENT, textDecoration: "none" }}>
                  Get a free key →
                </a>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  type={showApiKey ? "text" : "password"}
                  value={userApiKey}
                  onChange={e => {
                    setUserApiKey(e.target.value);
                    localStorage.setItem("canvas_api_key", e.target.value);
                  }}
                  placeholder="sk-or-v1-…  (optional — uses server key if blank)"
                  style={{
                    flex: 1, padding: "8px 10px", borderRadius: 8,
                    border: "1px solid #dee2e6", fontSize: 12, outline: "none",
                    fontFamily: "monospace",
                  }}
                />
                <button type="button" onClick={() => setShowApiKey(v => !v)}
                  style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #dee2e6", background: "white", cursor: "pointer", fontSize: 13 }}>
                  {showApiKey ? "🙈" : "👁"}
                </button>
                {userApiKey && (
                  <button type="button" onClick={() => { setUserApiKey(""); localStorage.removeItem("canvas_api_key"); }}
                    style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #dee2e6", background: "white", cursor: "pointer", fontSize: 13, color: ACCENT }}>
                    ✕
                  </button>
                )}
              </div>
              <p style={{ margin: "6px 0 0", fontSize: 11, color: "#999" }}>
                Saved in your browser only. Sent directly to OpenRouter, nowhere else.
              </p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
