import { useEffect, useRef, useState } from "react";

export function useZoomPan(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  onResize: () => void,
) {
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);

  const panOffsetRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const mousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => { panOffsetRef.current = panOffset; }, [panOffset]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  // Track mouse position in screen space
  useEffect(() => {
    function onMove(e: MouseEvent) {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Resize canvas
  useEffect(() => {
    function resize() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      onResize();
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Scroll to zoom
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

  return {
    panOffset, setPanOffset, panOffsetRef,
    zoom, zoomRef,
    isPanning, setIsPanning, isPanningRef, panStartRef,
    mousePosRef,
    doZoom,
  };
}
