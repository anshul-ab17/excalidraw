import { useRef, useState } from "react";
import { ExcaliElement, Tool, TextInputState, SelDrag, HANDLE_CURSORS } from "../types";
import { genId, genSeed, hitTest, getHandleAt, applyResize } from "../canvasUtils";

interface Deps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  elementsRef: React.RefObject<ExcaliElement[]>;
  setElements: React.Dispatch<React.SetStateAction<ExcaliElement[]>>;
  pushHistory: (els: ExcaliElement[]) => void;
  panOffsetRef: React.RefObject<{ x: number; y: number }>;
  zoomRef: React.RefObject<number>;
  isPanningRef: React.MutableRefObject<boolean>;
  panStartRef: React.MutableRefObject<{ x: number; y: number }>;
  setPanOffset: (v: { x: number; y: number }) => void;
  setIsPanning: (v: boolean) => void;
  strokeColorRef: React.RefObject<string>;
  bgColorRef: React.RefObject<string>;
  strokeWidthRef: React.RefObject<number>;
  roughnessRef: React.RefObject<number>;
  opacityRef: React.RefObject<number>;
  fontSizeRef: React.RefObject<number>;
  fontFamilyRef: React.RefObject<string>;
}

export function useGuestDrawing({
  canvasRef, elementsRef, setElements, pushHistory,
  panOffsetRef, zoomRef, isPanningRef, panStartRef, setPanOffset, setIsPanning,
  strokeColorRef, bgColorRef, strokeWidthRef, roughnessRef, opacityRef,
  fontSizeRef, fontFamilyRef,
}: Deps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentTool, setCurrentTool] = useState<Tool>("rectangle");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canvasCursor, setCanvasCursor] = useState("crosshair");
  const [textInput, setTextInput] = useState<TextInputState | null>(null);

  const toolRef = useRef<Tool>("rectangle");
  const selectedIdRef = useRef<string | null>(null);
  const selDragRef = useRef<SelDrag | null>(null);
  const isDrawingRef = useRef(false);
  const drawingElementRef = useRef<ExcaliElement | null>(null);
  const textDragRef = useRef<{ startMouseX: number; startMouseY: number; startCanvasX: number; startCanvasY: number } | null>(null);

  // Keep tool + selectedId refs in sync
  // (These are updated inline via handleToolChange / setSelectedId wrappers)

  function getCanvasCoords(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - panOffsetRef.current!.x) / zoomRef.current!,
      y: (e.clientY - rect.top - panOffsetRef.current!.y) / zoomRef.current!,
    };
  }

  function getScreenCoords(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function commitText() {
    if (!textInput || !textInput.value.trim()) { setTextInput(null); return; }
    const el: ExcaliElement = {
      id: genId(), type: "text",
      x: textInput.x, y: textInput.y,
      width: textInput.value.length * (fontSizeRef.current! / 2), height: fontSizeRef.current! + 8,
      strokeColor: strokeColorRef.current!, backgroundColor: "transparent",
      strokeWidth: strokeWidthRef.current!, roughness: 0, opacity: opacityRef.current!,
      fontSize: fontSizeRef.current!, fontFamily: fontFamilyRef.current!,
      seed: genSeed(), text: textInput.value,
    };
    const next = [...(elementsRef.current ?? []), el];
    setElements(next);
    pushHistory(next);
    setTextInput(null);
  }

  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (e.button !== 0) return;
    if (textInput) { commitText(); return; }

    const tool = toolRef.current;

    if (tool === "hand") {
      isPanningRef.current = true;
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - panOffsetRef.current!.x, y: e.clientY - panOffsetRef.current!.y };
      return;
    }

    const { x: cx, y: cy } = getCanvasCoords(e);
    const { x: sx, y: sy } = getScreenCoords(e);

    if (tool === "selection") {
      if (selectedIdRef.current) {
        const sel = (elementsRef.current ?? []).find(el => el.id === selectedIdRef.current);
        if (sel) {
          const handle = getHandleAt(sel, sx, sy, panOffsetRef.current!, zoomRef.current!);
          if (handle) {
            selDragRef.current = { mode: "resize", handle, mouseStartX: cx, mouseStartY: cy, originalEl: { ...sel } };
            setCanvasCursor(HANDLE_CURSORS[handle] ?? "default");
            return;
          }
        }
      }
      const hit = [...(elementsRef.current ?? [])].reverse().find(el => hitTest(el, cx, cy, zoomRef.current!));
      if (hit) {
        selectedIdRef.current = hit.id;
        setSelectedId(hit.id);
        selDragRef.current = { mode: "move", handle: null, mouseStartX: cx, mouseStartY: cy, originalEl: { ...hit } };
        setCanvasCursor("move");
      } else {
        selectedIdRef.current = null;
        setSelectedId(null);
        setCanvasCursor("default");
      }
      return;
    }

    if (tool === "eraser") {
      const hit = (elementsRef.current ?? []).find(el => hitTest(el, cx, cy, zoomRef.current!));
      if (hit) {
        const next = (elementsRef.current ?? []).filter(el => el.id !== hit.id);
        if (hit.id === selectedIdRef.current) { selectedIdRef.current = null; setSelectedId(null); }
        setElements(next);
        pushHistory(next);
      }
      return;
    }

    if (tool === "text") {
      setTextInput({ x: cx, y: cy, value: "" });
      return;
    }

    const newEl: ExcaliElement = {
      id: genId(), type: tool,
      x: cx, y: cy, width: 0, height: 0,
      strokeColor: strokeColorRef.current!, backgroundColor: bgColorRef.current!,
      strokeWidth: strokeWidthRef.current!, roughness: roughnessRef.current!,
      opacity: opacityRef.current!, seed: genSeed(),
      fontSize: fontSizeRef.current!, fontFamily: fontFamilyRef.current!,
      points: tool === "pencil" ? [[cx, cy]] : undefined,
    };
    drawingElementRef.current = newEl;
    isDrawingRef.current = true;
  }

  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (isPanningRef.current) {
      const newOff = { x: e.clientX - panStartRef.current.x, y: e.clientY - panStartRef.current.y };
      panOffsetRef.current!.x = newOff.x;
      panOffsetRef.current!.y = newOff.y;
      setPanOffset(newOff);
      return;
    }

    const { x: cx, y: cy } = getCanvasCoords(e);
    const { x: sx, y: sy } = getScreenCoords(e);

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
        return applyResize(orig, drag.handle!, dx, dy);
      }));
      return;
    }

    if (toolRef.current === "selection" && !selDragRef.current) {
      if (selectedIdRef.current) {
        const sel = (elementsRef.current ?? []).find(el => el.id === selectedIdRef.current);
        if (sel) {
          const handle = getHandleAt(sel, sx, sy, panOffsetRef.current!, zoomRef.current!);
          if (handle) { setCanvasCursor(HANDLE_CURSORS[handle] ?? "default"); return; }
          if (hitTest(sel, cx, cy, zoomRef.current!)) { setCanvasCursor("move"); return; }
        }
      }
      setCanvasCursor("default");
      return;
    }

    if (!isDrawingRef.current || !drawingElementRef.current) return;
    const el = drawingElementRef.current;
    drawingElementRef.current = el.type === "pencil"
      ? { ...el, points: [...(el.points || []), [cx, cy]] }
      : { ...el, width: cx - el.x, height: cy - el.y };
    // RAF loop reads drawingElementRef.current directly — no state update needed here
  }

  function onMouseUp() {
    if (isPanningRef.current) { isPanningRef.current = false; setIsPanning(false); return; }

    if (selDragRef.current) {
      selDragRef.current = null;
      pushHistory([...(elementsRef.current ?? [])]);
      setCanvasCursor(toolRef.current === "selection" ? "default" : "crosshair");
      return;
    }

    if (!isDrawingRef.current || !drawingElementRef.current) return;
    const finalEl = { ...drawingElementRef.current };
    isDrawingRef.current = false;
    drawingElementRef.current = null;

    if ((finalEl.type !== "pencil" && Math.abs(finalEl.width) < 2 && Math.abs(finalEl.height) < 2) ||
      (finalEl.type === "pencil" && (!finalEl.points || finalEl.points.length < 2))) {
      return;
    }

    const next = [...(elementsRef.current ?? []), finalEl];
    setElements(next);
    pushHistory(next);
  }

  function deleteSelected() {
    const next = (elementsRef.current ?? []).filter(el => el.id !== selectedIdRef.current);
    setElements(next);
    selectedIdRef.current = null;
    setSelectedId(null);
    pushHistory(next);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Only image files are supported.");
      e.target.value = "";
      return;
    }
    const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_BYTES) {
      alert("Image must be smaller than 5 MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => { alert("Failed to read the selected file."); e.target.value = ""; };
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const img = new Image();
      img.onerror = () => { alert("Failed to load the selected image. The file may be corrupt."); };
      img.onload = () => {
        const maxW = 400, maxH = 300;
        let w = img.width, h = img.height;
        if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
        if (h > maxH) { w = Math.round(w * maxH / h); h = maxH; }
        const canvas = canvasRef.current;
        const cx = canvas ? (canvas.width / 2 - panOffsetRef.current!.x) / zoomRef.current! - w / 2 : 100;
        const cy = canvas ? (canvas.height / 2 - panOffsetRef.current!.y) / zoomRef.current! - h / 2 : 100;
        const el: ExcaliElement = {
          id: genId(), type: "image", x: cx, y: cy, width: w, height: h,
          strokeColor: "transparent", backgroundColor: "transparent",
          strokeWidth: 1, roughness: 0, opacity: 100, seed: genSeed(), imageData: dataUrl,
        };
        const next = [...(elementsRef.current ?? []), el];
        setElements(next);
        pushHistory(next);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function onTextBoxDragStart(e: React.MouseEvent) {
    e.preventDefault();
    if (!textInput) return;
    textDragRef.current = { startMouseX: e.clientX, startMouseY: e.clientY, startCanvasX: textInput.x, startCanvasY: textInput.y };
    function onMove(ev: MouseEvent) {
      if (!textDragRef.current) return;
      const dx = (ev.clientX - textDragRef.current.startMouseX) / zoomRef.current!;
      const dy = (ev.clientY - textDragRef.current.startMouseY) / zoomRef.current!;
      setTextInput(prev => prev ? { ...prev, x: textDragRef.current!.startCanvasX + dx, y: textDragRef.current!.startCanvasY + dy } : null);
    }
    function onUp() { textDragRef.current = null; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function handleToolChange(t: Tool) {
    toolRef.current = t;
    setCurrentTool(t);
    if (t !== "selection") { selectedIdRef.current = null; setSelectedId(null); }
    setCanvasCursor(t === "selection" ? "default" : "crosshair");
  }

  return {
    fileInputRef,
    currentTool, handleToolChange,
    selectedId, setSelectedId, selectedIdRef,
    canvasCursor,
    textInput, setTextInput,
    drawingElementRef,
    onMouseDown, onMouseMove, onMouseUp,
    commitText, onTextBoxDragStart,
    deleteSelected, handleImageUpload,
  };
}
