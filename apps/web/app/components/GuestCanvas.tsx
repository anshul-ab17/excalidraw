"use client";
import { Tool } from "./canvas/types";
import { useGuestCanvas } from "./canvas/hooks/useGuestCanvas";
import ToolBar from "./canvas/ToolBar";
import StylePanel from "./canvas/StylePanel";
import BottomBar from "./canvas/BottomBar";
import TextEditor from "./canvas/TextEditor";
import AiModal from "./canvas/AiModal";
import GuestBrand from "./canvas/GuestBrand";
import GuestAuthBar from "./canvas/GuestAuthBar";
import DeleteSelectedButton from "./canvas/DeleteSelectedButton";

const GUEST_TOOLS: { id: Tool; icon: string; label: string }[] = [
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

export default function GuestCanvas() {
  const c = useGuestCanvas();

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden" }}>
      <input ref={c.fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={c.handleImageUpload} />

      <canvas
        ref={c.canvasRef}
        style={{ display: "block", cursor: c.cursor }}
        onMouseDown={c.onMouseDown}
        onMouseMove={c.onMouseMove}
        onMouseUp={c.onMouseUp}
        onMouseLeave={c.onMouseUp}
      />

      {c.textInput && (
        <TextEditor
          textInput={c.textInput}
          textScreenX={c.textScreenX}
          textScreenY={c.textScreenY}
          strokeWidth={c.strokeWidth}
          strokeColor={c.strokeColor}
          onChange={value => c.setTextInput(prev => prev ? { ...prev, value } : null)}
          onCommit={c.commitText}
          onCancel={() => c.setTextInput(null)}
          onDragStart={c.onTextBoxDragStart}
        />
      )}

      {c.selectedId && <DeleteSelectedButton onDelete={c.deleteSelected} />}

      <ToolBar
        tools={GUEST_TOOLS}
        currentTool={c.currentTool}
        onToolChange={c.handleToolChange}
        onImageInsert={() => c.fileInputRef.current?.click()}
      />

      <StylePanel
        strokeColor={c.strokeColor} bgColor={c.bgColor}
        strokeWidth={c.strokeWidth} roughness={c.roughness} opacity={c.opacity}
        onStrokeColorChange={c.setStrokeColor} onBgColorChange={c.setBgColor}
        onStrokeWidthChange={c.setStrokeWidth} onRoughnessChange={c.setRoughness}
        onOpacityChange={c.setOpacity}
      />

      <BottomBar
        historyIdx={c.historyIdx} historyLength={c.history.length}
        zoom={c.zoom} copied={c.copied}
        onUndo={c.undo} onRedo={c.redo}
        onZoomIn={() => c.doZoom(0.1)} onZoomOut={() => c.doZoom(-0.1)}
        onClear={c.clearCanvas} onDownload={c.downloadCanvas} onCopyLink={c.copyLink}
      />

      <GuestBrand />

      <GuestAuthBar
        isSignedIn={c.isSignedIn}
        onDashboard={c.goToDashboard}
        onSignIn={c.goToSignIn}
      />

      {c.showAiModal && (
        <AiModal
          aiMode={c.aiMode} aiPrompt={c.aiPrompt}
          aiLoading={c.aiLoading} aiError={c.aiError}
          userApiKey={c.userApiKey} showApiKey={c.showApiKey}
          onModeChange={c.setAiMode} onPromptChange={c.setAiPrompt}
          onGenerate={c.generateDiagram}
          onClose={() => { c.setShowAiModal(false); }}
          onApiKeyChange={k => { c.setUserApiKey(k); localStorage.setItem("canvas_api_key", k); }}
          onToggleShowApiKey={() => c.setShowApiKey(v => !v)}
          onClearApiKey={() => { c.setUserApiKey(""); localStorage.removeItem("canvas_api_key"); }}
        />
      )}
    </div>
  );
}
