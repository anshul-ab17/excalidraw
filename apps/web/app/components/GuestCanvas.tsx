"use client";
import { useState, useEffect } from "react";
import { Tool } from "./canvas/types";
import { useGuestCanvas } from "./canvas/hooks/useGuestCanvas";
import ToolBar from "./canvas/ToolBar";
import StylePanel from "./canvas/StylePanel";
import BottomBar from "./canvas/BottomBar";
import { 
  Hand, MousePointer2, Square, Diamond, Circle, Minus, MoveRight, 
  Pencil, Type, Eraser
} from "lucide-react";
import TextEditor from "./canvas/TextEditor";
import AiModal from "./canvas/AiModal";
import GuestBrand from "./canvas/GuestBrand";
import GuestAuthBar from "./canvas/GuestAuthBar";
import DeleteSelectedButton from "./canvas/DeleteSelectedButton";

const GUEST_TOOLS: { id: Tool; icon: React.ReactNode; label: string }[] = [
  { id: "hand", icon: <Hand size={18} />, label: "Pan" },
  { id: "selection", icon: <MousePointer2 size={18} />, label: "Select & Edit" },
  { id: "rectangle", icon: <Square size={18} />, label: "Rectangle" },
  { id: "diamond", icon: <Diamond size={18} />, label: "Diamond" },
  { id: "ellipse", icon: <Circle size={18} />, label: "Ellipse" },
  { id: "line", icon: <Minus size={18} style={{ transform: "rotate(-45deg)" }} />, label: "Line" },
  { id: "arrow", icon: <MoveRight size={18} style={{ transform: "rotate(-45deg)" }} />, label: "Arrow" },
  { id: "pencil", icon: <Pencil size={18} />, label: "Pencil" },
  { id: "text", icon: <Type size={18} />, label: "Text" },
  { id: "eraser", icon: <Eraser size={18} />, label: "Eraser" },
];

export default function GuestCanvas() {
  const c = useGuestCanvas();
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
          fontSize={c.fontSize}
          fontFamily={c.fontFamily}
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
        onAiOpen={() => c.setShowAiModal(true)}
        onClear={c.clearCanvas}
        onDownload={c.downloadCanvas}
        onCopyLink={c.copyLink}
        copied={c.copied}
        onChatToggle={() => alert("Global chat is coming soon to local rooms!")}
      />

      {["rectangle", "diamond", "ellipse", "line", "arrow", "pencil", "text"].includes(c.currentTool) && (
        <StylePanel
          currentTool={c.currentTool}
          strokeColor={c.strokeColor} bgColor={c.bgColor}
          strokeWidth={c.strokeWidth} roughness={c.roughness} opacity={c.opacity}
          fontSize={c.fontSize} fontFamily={c.fontFamily}
          onStrokeColorChange={c.setStrokeColor} onBgColorChange={c.setBgColor}
          onStrokeWidthChange={c.setStrokeWidth} onRoughnessChange={c.setRoughness}
          onOpacityChange={c.setOpacity}
          onFontSizeChange={c.setFontSize} onFontFamilyChange={c.setFontFamily}
        />
      )}

      <BottomBar
        historyIdx={c.historyIdx} historyLength={c.history.length}
        zoom={c.zoom}
        onUndo={c.undo} onRedo={c.redo}
        onZoomIn={() => c.doZoom(0.1)} onZoomOut={() => c.doZoom(-0.1)}
      />

      <GuestBrand />

      <GuestAuthBar
        isSignedIn={c.isSignedIn}
        onDashboard={c.goToDashboard}
        onSignIn={c.goToSignIn}
        darkMode={darkMode}
        onThemeToggle={toggleDark}
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
