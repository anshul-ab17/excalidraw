"use client";
import { Tool, ACCENT } from "./types";
import { toolBar, toolBtn, actionBtn, separator, INK } from "./styles";

interface ToolDef { id: Tool; icon: React.ReactNode; label: string; }

interface Props {
  tools: ToolDef[];
  currentTool: Tool;
  onToolChange: (t: Tool) => void;
  onImageInsert?: () => void;
  onAiOpen?: () => void;
  onClear?: () => void;
  onDownload?: () => void;
  onCopyLink?: () => void;
  copied?: boolean;
  onChatToggle?: () => void;
  chatOpen?: boolean;
  unreadCount?: number;
  darkMode?: boolean;
  onThemeToggle?: () => void;
}

export default function ToolBar({ 
  tools, currentTool, onToolChange, onImageInsert, onAiOpen, 
  onClear, onDownload, onCopyLink, copied,
  onChatToggle, chatOpen, unreadCount, darkMode, onThemeToggle
}: Props) {
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      ...toolBar,
      zIndex: 100,
    }}>
      {tools.map(t => (
        <button
          key={t.id}
          onClick={() => onToolChange(t.id)}
          title={t.label}
          style={toolBtn(currentTool === t.id)}
        >
          {t.icon}
        </button>
      ))}

      {onImageInsert && (
        <>
          <div style={separator} />
          <button onClick={onImageInsert} title="Insert image" style={toolBtn(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
          </button>
        </>
      )}

      {onAiOpen && (
        <>
          <div style={separator} />
          <button onClick={onAiOpen} title="Open AI" style={toolBtn(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
          </button>
        </>
      )}

      {(onClear || onDownload || onCopyLink || onChatToggle || onThemeToggle) && (
        <>
          <div style={separator} />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {onClear && (
              <button onClick={onClear} title="Clear canvas" style={{ ...actionBtn, color: "#E84A3F" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            )}
            {onDownload && (
              <button onClick={onDownload} title="Download" style={actionBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </button>
            )}
            {onCopyLink && (
              <button onClick={onCopyLink} title="Share" style={{ ...actionBtn, color: copied ? "#2E8A6A" : ACCENT }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </button>
            )}
            
            {onThemeToggle && (
              <button onClick={onThemeToggle} title="Toggle Theme" style={actionBtn}>
                {darkMode 
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
                }
              </button>
            )}

            {onChatToggle && (
              <button onClick={onChatToggle} title="Room Chat" style={{ ...actionBtn, position: "relative", color: chatOpen ? ACCENT : INK }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                {unreadCount && unreadCount > 0 && !chatOpen && (
                  <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: "#E84A3F", border: `1.5px solid ${INK}` }} />
                )}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
