import { useRef, useState } from "react";
import { ExcaliElement } from "../types";

export function useCanvasHistory() {
  const [elements, setElementsState] = useState<ExcaliElement[]>([]);
  const [history, setHistory] = useState<ExcaliElement[][]>([[]]);
  const [historyIdx, setHistoryIdx] = useState(0);

  const elementsRef = useRef<ExcaliElement[]>([]);
  const historyRef = useRef<ExcaliElement[][]>([[]]);
  const historyIdxRef = useRef(0);

  /** Always keeps elementsRef in sync synchronously — use instead of setElementsState directly */
  function setElements(value: ExcaliElement[] | ((prev: ExcaliElement[]) => ExcaliElement[])) {
    if (typeof value === "function") {
      setElementsState(prev => {
        const next = value(prev);
        elementsRef.current = next;
        return next;
      });
    } else {
      elementsRef.current = value;
      setElementsState(value);
    }
  }

  function pushHistory(els: ExcaliElement[]) {
    const next = historyRef.current.slice(0, historyIdxRef.current + 1);
    const newHistory = [...next, els];
    historyRef.current = newHistory;
    historyIdxRef.current = newHistory.length - 1;
    setHistory(newHistory);
    setHistoryIdx(historyIdxRef.current);
  }

  function undo() {
    if (historyIdxRef.current === 0) return;
    const idx = historyIdxRef.current - 1;
    historyIdxRef.current = idx;
    setHistoryIdx(idx);
    setElements(historyRef.current[idx] ?? []);
  }

  function redo() {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    const idx = historyIdxRef.current + 1;
    historyIdxRef.current = idx;
    setHistoryIdx(idx);
    setElements(historyRef.current[idx] ?? []);
  }

  return {
    elements, setElements, elementsRef,
    history, setHistory, historyIdx, setHistoryIdx,
    historyRef, historyIdxRef,
    pushHistory, undo, redo,
  };
}
