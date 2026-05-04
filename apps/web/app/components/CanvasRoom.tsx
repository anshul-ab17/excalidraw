import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tool } from "./canvas/types";
import { useRoomCanvas } from "./canvas/hooks/useRoomCanvas";
import ToolBar from "./canvas/ToolBar";
import StylePanel from "./canvas/StylePanel";
import RoomBottomBar from "./canvas/RoomBottomBar";
import CursorOverlay from "./canvas/CursorOverlay";
import RoomHeader from "./canvas/RoomHeader";
import ChatPanel from "./canvas/ChatPanel";
import { 
  MousePointer2, Square, Diamond, Circle, Minus, MoveRight, 
  Pencil, Type, Eraser
} from "lucide-react";
import AiModal from "./canvas/AiModal";

const ROOM_TOOLS: { id: Tool; icon: React.ReactNode; label: string }[] = [
  { id: "selection", icon: <MousePointer2 size={18} />, label: "Select" },
  { id: "rectangle", icon: <Square size={18} />, label: "Rectangle" },
  { id: "diamond", icon: <Diamond size={18} />, label: "Diamond" },
  { id: "ellipse", icon: <Circle size={18} />, label: "Ellipse" },
  { id: "line", icon: <Minus size={18} style={{ transform: "rotate(-45deg)" }} />, label: "Line" },
  { id: "arrow", icon: <MoveRight size={18} style={{ transform: "rotate(-45deg)" }} />, label: "Arrow" },
  { id: "pencil", icon: <Pencil size={18} />, label: "Pencil" },
  { id: "text", icon: <Type size={18} />, label: "Text" },
  { id: "eraser", icon: <Eraser size={18} />, label: "Eraser" },
];

export default function CanvasRoom({ slug }: { slug: string }) {
  const router = useRouter();
  const c = useRoomCanvas(slug);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div style={{ 
      position: "fixed", inset: 0, overflow: "hidden", 
      background: darkMode ? "#15130F" : "#FBF8F1",
      transition: "background 0.3s ease"
    }}>
      <canvas
        ref={c.canvasRef}
        style={{ display: "block", cursor: c.cursor }}
        onMouseDown={c.onMouseDown}
        onMouseMove={c.onMouseMove}
        onMouseUp={c.onMouseUp}
      />

      <CursorOverlay cursors={c.cursors} />

      <ToolBar
        tools={ROOM_TOOLS}
        currentTool={c.currentTool}
        onToolChange={c.setCurrentTool}
        onAiOpen={() => c.setShowAiModal(true)}
        onClear={c.clearCanvas}
        onDownload={c.downloadCanvas}
        onCopyLink={c.copyLink}
        copied={c.copied}
        onChatToggle={c.toggleChat}
        chatOpen={c.chatOpen}
        unreadCount={c.unreadCount}
        darkMode={darkMode}
        onThemeToggle={toggleDark}
      />

      {["rectangle", "diamond", "ellipse", "line", "arrow", "pencil", "text"].includes(c.currentTool) && (
        <StylePanel
          strokeColor={c.strokeColor} bgColor={c.bgColor}
          strokeWidth={c.strokeWidth} roughness={c.roughness} opacity={c.opacity}
          onStrokeColorChange={c.setStrokeColor} onBgColorChange={c.setBgColor}
          onStrokeWidthChange={c.setStrokeWidth} onRoughnessChange={c.setRoughness}
          onOpacityChange={c.setOpacity}
        />
      )}

      <RoomBottomBar
        historyIdx={c.historyIdx} historyLength={c.history.length}
        connected={c.connected}
        onUndo={c.undo} onRedo={c.redo}
      />

      <RoomHeader slug={slug} />

      <ChatPanel
        open={c.chatOpen}
        messages={c.chatMessages}
        onSend={c.sendChat}
        onClose={c.toggleChat}
      />

      {c.showAiModal && (
        <AiModal
          aiMode={c.aiMode} aiPrompt={c.aiPrompt}
          aiLoading={c.aiLoading} aiError={c.aiError}
          userApiKey={c.userApiKey} showApiKey={c.showApiKey}
          onModeChange={c.setAiMode} onPromptChange={c.setAiPrompt}
          onGenerate={c.generateDiagram}
          onClose={() => c.setShowAiModal(false)}
          onApiKeyChange={(k) => { c.setUserApiKey(k); localStorage.setItem("canvas_api_key", k); }}
          onToggleShowApiKey={() => c.setShowApiKey((v) => !v)}
          onClearApiKey={() => { c.setUserApiKey(""); localStorage.removeItem("canvas_api_key"); }}
        />
      )}
    </div>
  );
}
    </div>
  );
}
