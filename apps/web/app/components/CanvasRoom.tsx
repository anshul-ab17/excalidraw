"use client";
import { useRouter } from "next/navigation";
import { Tool } from "./canvas/types";
import { useRoomCanvas } from "./canvas/hooks/useRoomCanvas";
import ToolBar from "./canvas/ToolBar";
import StylePanel from "./canvas/StylePanel";
import RoomBottomBar from "./canvas/RoomBottomBar";
import CursorOverlay from "./canvas/CursorOverlay";
import RoomHeader from "./canvas/RoomHeader";
import ChatPanel from "./canvas/ChatPanel";
import AiModal from "./canvas/AiModal";

const ROOM_TOOLS: { id: Tool; icon: string; label: string }[] = [
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

export default function CanvasRoom({ slug }: { slug: string }) {
  const router = useRouter();
  const c = useRoomCanvas(slug);

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden" }}>
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
      />

      <StylePanel
        strokeColor={c.strokeColor} bgColor={c.bgColor}
        strokeWidth={c.strokeWidth} roughness={c.roughness} opacity={c.opacity}
        onStrokeColorChange={c.setStrokeColor} onBgColorChange={c.setBgColor}
        onStrokeWidthChange={c.setStrokeWidth} onRoughnessChange={c.setRoughness}
        onOpacityChange={c.setOpacity}
      />

      <RoomBottomBar
        historyIdx={c.historyIdx} historyLength={c.history.length}
        copied={c.copied} connected={c.connected} slug={slug}
        chatOpen={c.chatOpen} unreadCount={c.unreadCount}
        onUndo={c.undo} onRedo={c.redo} onClear={c.clearCanvas}
        onDownload={c.downloadCanvas} onCopyLink={c.copyLink}
        onChatToggle={c.toggleChat} onAiOpen={() => c.setShowAiModal(true)}
      />

      <RoomHeader slug={slug} onBack={() => router.push("/dashboard")} />

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
