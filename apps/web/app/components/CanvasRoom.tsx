"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getStroke } from "perfect-freehand";
import rough from "roughjs";

type Tool = "selection" | "rectangle" | "diamond" | "ellipse" | "line" | "arrow" | "pencil" | "text" | "eraser";

interface ExcaliElement {
  id: string;
  type: Tool;
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
}

interface CursorPos { x: number; y: number; userId: string; }

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

function renderElement(
  rc: ReturnType<typeof rough.canvas>,
  ctx: CanvasRenderingContext2D,
  el: ExcaliElement
) {
  ctx.save();
  ctx.globalAlpha = el.opacity / 100;

  const opts = {
    stroke: el.strokeColor,
    strokeWidth: el.strokeWidth,
    roughness: el.roughness,
    seed: el.seed,
    fill: el.backgroundColor !== "transparent" ? el.backgroundColor : undefined,
    fillStyle: "hachure" as const,
  };

  switch (el.type) {
    case "rectangle":
      rc.rectangle(el.x, el.y, el.width, el.height, opts);
      break;
    case "diamond": {
      const cx = el.x + el.width / 2, cy = el.y + el.height / 2;
      rc.polygon([[cx, el.y], [el.x + el.width, cy], [cx, el.y + el.height], [el.x, cy]], opts);
      break;
    }
    case "ellipse":
      rc.ellipse(el.x + el.width / 2, el.y + el.height / 2, Math.abs(el.width), Math.abs(el.height), opts);
      break;
    case "line":
      rc.line(el.x, el.y, el.x + el.width, el.y + el.height, opts);
      break;
    case "arrow": {
      rc.line(el.x, el.y, el.x + el.width, el.y + el.height, opts);
      // Arrow head
      const angle = Math.atan2(el.height, el.width);
      const headLen = 15;
      const x2 = el.x + el.width, y2 = el.y + el.height;
      rc.line(x2, y2, x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6), { ...opts, roughness: 0 });
      rc.line(x2, y2, x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6), { ...opts, roughness: 0 });
      break;
    }
    case "pencil": {
      if (!el.points || el.points.length < 2) break;
      const stroke = getStroke(el.points, { size: el.strokeWidth * 3, thinning: 0.5, smoothing: 0.5, streamline: 0.5 });
      const pathData = getSvgPathFromStroke(stroke);
      const path = new Path2D(pathData);
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

const COLORS = ["#1e1e1e","#e03131","#2f9e44","#1971c2","#f08c00","#7048e8","#c2255c","#ffffff"];
const BG_COLORS = ["transparent","#ffc9c9","#b2f2bb","#a5d8ff","#ffec99","#fca5a5","#fcc2d7"];

export default function CanvasRoom({ slug }: { slug: string }) {
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

  // Drawing state refs (avoid stale closures)
  const isDrawingRef = useRef(false);
  const drawingElementRef = useRef<ExcaliElement | null>(null);
  const elementsRef = useRef<ExcaliElement[]>([]);
  const toolRef = useRef<Tool>("rectangle");
  const strokeColorRef = useRef("#1e1e1e");
  const bgColorRef = useRef("transparent");
  const strokeWidthRef = useRef(2);
  const roughnessRef = useRef(1);
  const opacityRef = useRef(100);
  const historyRef = useRef<ExcaliElement[][]>([[]]);
  const historyIdxRef = useRef(0);

  useEffect(() => { elementsRef.current = elements; }, [elements]);
  useEffect(() => { toolRef.current = currentTool; }, [currentTool]);
  useEffect(() => { strokeColorRef.current = strokeColor; }, [strokeColor]);
  useEffect(() => { bgColorRef.current = bgColor; }, [bgColor]);
  useEffect(() => { strokeWidthRef.current = strokeWidth; }, [strokeWidth]);
  useEffect(() => { roughnessRef.current = roughness; }, [roughness]);
  useEffect(() => { opacityRef.current = opacity; }, [opacity]);
  useEffect(() => { historyRef.current = history; }, [history]);
  useEffect(() => { historyIdxRef.current = historyIdx; }, [historyIdx]);

  // Fetch room + connect WebSocket
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/signin"); return; }

    async function init() {
      const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";
      const WS = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3002";
      const res = await fetch(`${API}/room/${slug}`, {
        headers: { authorization: token! },
      });
      if (!res.ok) { router.push("/dashboard"); return; }
      const data = await res.json();

      const ws = new WebSocket(`${WS}?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        ws.send(JSON.stringify({ type: "join_room", roomId: String(data.room.id) }));
      };

      ws.onmessage = (evt) => {
        const msg = JSON.parse(evt.data);
        switch (msg.type) {
          case "init_room":
            setElements(msg.elements);
            setHistory([msg.elements]);
            setHistoryIdx(0);
            break;
          case "draw":
            setElements(prev => {
              const idx = prev.findIndex(e => e.id === msg.element.id);
              if (idx >= 0) { const next = [...prev]; next[idx] = msg.element; return next; }
              return [...prev, msg.element];
            });
            break;
          case "erase":
            setElements(prev => prev.filter(e => !msg.elementIds.includes(e.id)));
            break;
          case "clear":
            setElements([]);
            break;
          case "cursor":
            setCursors(prev => {
              const next = prev.filter(c => c.userId !== msg.userId);
              return [...next, { x: msg.x, y: msg.y, userId: msg.userId }];
            });
            break;
          case "user_left":
            setCursors(prev => prev.filter(c => c.userId !== msg.userId));
            break;
        }
      };

      ws.onclose = () => setConnected(false);
    }

    init();
    return () => { wsRef.current?.close(); };
  }, [slug, router]);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const rc = rough.canvas(canvas);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Background
    ctx.fillStyle = "#f8f9fa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Grid
    ctx.strokeStyle = "#e9ecef";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    elements.forEach(el => renderElement(rc, ctx, el));
    if (drawingElementRef.current) renderElement(rc, ctx, drawingElementRef.current);
  }, [elements]);

  // Resize canvas
  useEffect(() => {
    function resize() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Force redraw after resize
      setElements(prev => [...prev]);
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
      const hit = elementsRef.current.find(el => {
        const mx = Math.min(el.x, el.x + el.width), Mx = Math.max(el.x, el.x + el.width);
        const my = Math.min(el.y, el.y + el.height), My = Math.max(el.y, el.y + el.height);
        return x >= mx - 10 && x <= Mx + 10 && y >= my - 10 && y <= My + 10;
      });
      if (hit) {
        const newEls = elementsRef.current.filter(el => el.id !== hit.id);
        setElements(newEls);
        wsRef.current?.send(JSON.stringify({ type: "erase", elementIds: [hit.id] }));
      }
      return;
    }

    const newEl: ExcaliElement = {
      id: genId(), type: tool,
      x, y, width: 0, height: 0,
      strokeColor: strokeColorRef.current,
      backgroundColor: bgColorRef.current,
      strokeWidth: strokeWidthRef.current,
      roughness: roughnessRef.current,
      opacity: opacityRef.current,
      seed: genSeed(),
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
      setElements(prev => [...prev, finalEl]);
      wsRef.current?.send(JSON.stringify({ type: "draw", element: finalEl }));
      const newElements = [...elementsRef.current, finalEl];
      pushHistory(newElements);
      return;
    }

    drawingElementRef.current = newEl;
    isDrawingRef.current = true;
  }

  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const { x, y } = getCoords(e);
    wsRef.current?.send(JSON.stringify({ type: "cursor", x, y }));

    if (!isDrawingRef.current || !drawingElementRef.current) return;
    const el = drawingElementRef.current;

    if (el.type === "pencil") {
      drawingElementRef.current = { ...el, points: [...(el.points || []), [x, y]] };
    } else {
      drawingElementRef.current = { ...el, width: x - el.x, height: y - el.y };
    }

    // Trigger re-render
    setElements(prev => [...prev]);
  }

  function onMouseUp() {
    if (!isDrawingRef.current || !drawingElementRef.current) return;
    const finalEl = { ...drawingElementRef.current };
    isDrawingRef.current = false;
    drawingElementRef.current = null;

    if ((finalEl.type !== "pencil" && Math.abs(finalEl.width) < 2 && Math.abs(finalEl.height) < 2) ||
        (finalEl.type === "pencil" && (!finalEl.points || finalEl.points.length < 2))) {
      setElements(prev => [...prev]);
      return;
    }

    const newElements = [...elementsRef.current, finalEl];
    setElements(newElements);
    wsRef.current?.send(JSON.stringify({ type: "draw", element: finalEl }));
    pushHistory(newElements);
  }

  function pushHistory(els: ExcaliElement[]) {
    const currentIdx = historyIdxRef.current;
    const currentHistory = historyRef.current;
    const next = currentHistory.slice(0, currentIdx + 1);
    const newHistory = [...next, els];
    setHistory(newHistory);
    setHistoryIdx(currentIdx + 1);
  }

  function undo() {
    const currentIdx = historyIdxRef.current;
    if (currentIdx === 0) return;
    const newIdx = currentIdx - 1;
    const els = historyRef.current[newIdx] ?? [];
    setHistoryIdx(newIdx);
    setElements(els);
  }

  function redo() {
    const currentIdx = historyIdxRef.current;
    const currentHistory = historyRef.current;
    if (currentIdx >= currentHistory.length - 1) return;
    const newIdx = currentIdx + 1;
    const els = currentHistory[newIdx] ?? [];
    setHistoryIdx(newIdx);
    setElements(els);
  }

  function clearCanvas() {
    if (!confirm("Clear all elements?")) return;
    setElements([]);
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

  const tools: { id: Tool; icon: string; label: string }[] = [
    { id: "selection", icon: "↖", label: "Select" },
    { id: "rectangle", icon: "▭", label: "Rectangle" },
    { id: "diamond", icon: "◇", label: "Diamond" },
    { id: "ellipse", icon: "○", label: "Ellipse" },
    { id: "line", icon: "╱", label: "Line" },
    { id: "arrow", icon: "→", label: "Arrow" },
    { id: "pencil", icon: "✏", label: "Pencil" },
    { id: "text", icon: "T", label: "Text" },
    { id: "eraser", icon: "⌫", label: "Eraser" },
  ];

  const cursor =
    currentTool === "eraser" ? "cell" :
    currentTool === "text" ? "text" :
    currentTool === "selection" ? "default" : "crosshair";

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden" }}>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{ display: "block", cursor }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      />
 
      {cursors.map(c => (
        <div key={c.userId} style={{
          position: "fixed", left: c.x, top: c.y, pointerEvents: "none",
          transform: "translate(-2px, -2px)", zIndex: 50
        }}>
          <div style={{ fontSize: 18 }}>🖱</div>
          <div style={{ background: "#e03131", color: "white", padding: "2px 6px", borderRadius: 4, fontSize: 11, marginTop: -4 }}>
            {c.userId.slice(0, 6)}
          </div>
        </div>
      ))}
 
      <div style={{
        position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)",
        background: "white", borderRadius: 12, padding: "6px 8px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.15)", display: "flex", gap: 4, zIndex: 10
      }}>
        {tools.map(t => (
          <button key={t.id} onClick={() => setCurrentTool(t.id)} title={t.label}
            style={{
              width: 36, height: 36, borderRadius: 8, fontSize: 16,
              background: currentTool === t.id ? "#fff5f5" : "transparent",
              color: currentTool === t.id ? "#e03131" : "#495057",
              border: currentTool === t.id ? "1px solid #fca5a5" : "1px solid transparent",
              transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center"
            }}>
            {t.icon}
          </button>
        ))}
      </div>
 
      <div style={{
        position: "fixed", left: 12, top: "50%", transform: "translateY(-50%)",
        background: "white", borderRadius: 12, padding: 12,
        boxShadow: "0 2px 12px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", gap: 12, zIndex: 10, width: 160
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6c757d", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Stroke</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {COLORS.map(c => (
              <button key={c} onClick={() => setStrokeColor(c)}
                style={{
                  width: 22, height: 22, borderRadius: 4, background: c,
                  border: strokeColor === c ? "2px solid #e03131" : "1.5px solid #dee2e6",
                  cursor: "pointer"
                }} />
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6c757d", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Fill</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {BG_COLORS.map(c => (
              <button key={c} onClick={() => setBgColor(c)}
                style={{
                  width: 22, height: 22, borderRadius: 4,
                  background: c === "transparent" ? "white" : c,
                  border: bgColor === c ? "2px solid #e03131" : "1.5px solid #dee2e6",
                  cursor: "pointer",
                  backgroundImage: c === "transparent" ? "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)" : "none",
                  backgroundSize: c === "transparent" ? "8px 8px" : "auto",
                  backgroundPosition: c === "transparent" ? "0 0, 4px 4px" : "auto"
                }} />
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6c757d", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Stroke Width</div>
          <input type="range" min={1} max={8} value={strokeWidth} onChange={e => setStrokeWidth(+e.target.value)}
            style={{ width: "100%", accentColor: "#e03131" }} />
          <div style={{ fontSize: 11, color: "#6c757d", textAlign: "right" }}>{strokeWidth}px</div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6c757d", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Roughness</div>
          <input type="range" min={0} max={3} step={0.5} value={roughness} onChange={e => setRoughness(+e.target.value)}
            style={{ width: "100%", accentColor: "#e03131" }} />
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6c757d", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Opacity</div>
          <input type="range" min={10} max={100} value={opacity} onChange={e => setOpacity(+e.target.value)}
            style={{ width: "100%", accentColor: "#e03131" }} />
          <div style={{ fontSize: 11, color: "#6c757d", textAlign: "right" }}>{opacity}%</div>
        </div>
      </div>
 
      <div style={{
        position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)",
        background: "white", borderRadius: 12, padding: "8px 12px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.15)", display: "flex", gap: 8, zIndex: 10, alignItems: "center"
      }}>
        <button onClick={undo} disabled={historyIdx === 0} title="Undo (Ctrl+Z)"
          style={{ width: 32, height: 32, borderRadius: 6, fontSize: 14, border: "1px solid #dee2e6", background: "white", opacity: historyIdx === 0 ? 0.4 : 1 }}>↩</button>
        <button onClick={redo} disabled={historyIdx >= history.length - 1} title="Redo"
          style={{ width: 32, height: 32, borderRadius: 6, fontSize: 14, border: "1px solid #dee2e6", background: "white", opacity: historyIdx >= history.length - 1 ? 0.4 : 1 }}>↪</button>
        <div style={{ width: 1, height: 24, background: "#dee2e6" }} />
        <button onClick={clearCanvas} title="Clear canvas"
          style={{ width: 32, height: 32, borderRadius: 6, fontSize: 14, border: "1px solid #dee2e6", background: "white", color: "#e03131" }}>🗑</button>
        <div style={{ width: 1, height: 24, background: "#dee2e6" }} />
        <button onClick={downloadCanvas} title="Download as PNG"
          style={{ padding: "6px 12px", borderRadius: 6, fontSize: 13, border: "1px solid #dee2e6", background: "white", color: "#495057" }}>
          ⬇ Download
        </button>
        <div style={{ width: 1, height: 24, background: "#dee2e6" }} />
        <button onClick={copyLink}
          style={{ padding: "6px 12px", borderRadius: 6, fontSize: 13, border: "1px solid #dee2e6", background: copied ? "#2f9e44" : "white", color: copied ? "white" : "#495057", transition: "all 0.2s" }}>
          {copied ? "✓ Copied!" : "🔗 Share"}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: connected ? "#2f9e44" : "#e03131" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: connected ? "#2f9e44" : "#e03131" }} />
          {connected ? "Live" : "Offline"}
        </div>
      </div>
 
      <div style={{ position: "fixed", top: 16, left: 16, zIndex: 10 }}>
        <button onClick={() => router.push("/dashboard")}
          style={{ background: "white", border: "1px solid #dee2e6", borderRadius: 8, padding: "6px 12px", fontSize: 13, color: "#495057", cursor: "pointer" }}>
          ← {slug}
        </button>
      </div>
    </div>
  );
}
