import { useState } from "react";
import { ExcaliElement, Tool, AiMode } from "../types";
import { genId, genSeed } from "../canvasUtils";

interface Deps {
  elementsRef: React.RefObject<ExcaliElement[]>;
  pushHistory: (els: ExcaliElement[]) => void;
  setElements: React.Dispatch<React.SetStateAction<ExcaliElement[]>>;
}

export function useAiDiagram({ elementsRef, pushHistory, setElements }: Deps) {
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiMode, setAiMode] = useState<AiMode>("diagram");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [userApiKey, setUserApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  async function generateDiagram() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError("");
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "";
      const res = await fetch("/api/ai-diagram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token,
        },
        body: JSON.stringify({ prompt: aiPrompt, mode: aiMode, userApiKey: userApiKey.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setAiError(data.error || "Failed"); return; }
      const aiEls = convertAiElements(data.elements);
      const next = [...(elementsRef.current ?? []), ...aiEls];
      setElements(next);
      pushHistory(next);
      setShowAiModal(false);
      setAiPrompt("");
    } catch {
      setAiError("Failed to connect. Check your API key or try again.");
    } finally {
      setAiLoading(false);
    }
  }

  function convertAiElements(raw: Record<string, unknown>[]): ExcaliElement[] {
    const result: ExcaliElement[] = [];
    for (const el of raw) {
      const type = (el.type as Tool) || "rectangle";
      result.push({
        id: genId(), type, x: (el.x as number) ?? 100, y: (el.y as number) ?? 100,
        width: (el.width as number) ?? 120, height: (el.height as number) ?? 60,
        strokeColor: (el.strokeColor as string) ?? "#1e1e1e",
        backgroundColor: (el.backgroundColor as string) ?? "transparent",
        strokeWidth: 2, roughness: 1, opacity: 100, seed: genSeed(),
        points: el.points as Array<[number, number]> | undefined,
        text: el.text as string | undefined,
      });
      if (el.label && type !== "text") {
        const label = el.label as string;
        result.push({
          id: genId(), type: "text",
          x: ((el.x as number) ?? 100) + ((el.width as number) ?? 120) / 2 - label.length * 4,
          y: ((el.y as number) ?? 100) + ((el.height as number) ?? 60) / 2 - 16,
          width: label.length * 8, height: 20,
          strokeColor: "#1e1e1e", backgroundColor: "transparent",
          strokeWidth: 1, roughness: 0, opacity: 100, seed: genSeed(), text: label,
        });
      }
    }
    return result;
  }

  return {
    showAiModal, setShowAiModal,
    aiPrompt, setAiPrompt,
    aiMode, setAiMode,
    aiLoading, aiError,
    userApiKey, setUserApiKey,
    showApiKey, setShowApiKey,
    generateDiagram,
  };
}
