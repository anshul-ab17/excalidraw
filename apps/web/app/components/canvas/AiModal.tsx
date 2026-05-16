"use client";
import { AiMode, ACCENT } from "./types";

interface Props {
  aiMode: AiMode;
  aiPrompt: string;
  aiLoading: boolean;
  aiError: string;
  userApiKey: string;
  showApiKey: boolean;
  onModeChange: (m: AiMode) => void;
  onPromptChange: (v: string) => void;
  onGenerate: () => void;
  onClose: () => void;
  onApiKeyChange: (k: string) => void;
  onToggleShowApiKey: () => void;
  onClearApiKey: () => void;
}

export default function AiModal({
  aiMode, aiPrompt, aiLoading, aiError, userApiKey, showApiKey,
  onModeChange, onPromptChange, onGenerate, onClose, onApiKeyChange, onToggleShowApiKey, onClearApiKey,
}: Props) {
  const disabled = aiLoading || !aiPrompt.trim();

  const card: React.CSSProperties = {
    background: "var(--paper-3)",
    color: "var(--ink)",
    padding: 32,
    borderRadius: 16,
    width: 480,
    maxWidth: "calc(100vw - 32px)",
    border: "1.5px solid var(--border)",
    boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
    position: "relative",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid var(--border)",
    fontSize: 12,
    outline: "none",
    fontFamily: "monospace",
    background: "var(--paper-2)",
    color: "var(--ink)",
    boxSizing: "border-box",
  };

  const ghostBtn: React.CSSProperties = {
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--paper-2)",
    color: "var(--ink)",
    cursor: "pointer",
    fontSize: 13,
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={card}>
        {/* Header row with close button */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--ink)" }}>
            {aiMode === "flowchart" ? "Text to Flowchart" : "Text to Diagram"}
          </h2>
          <button
            onClick={onClose}
            style={{
              ...ghostBtn,
              padding: "4px 8px",
              fontSize: 16,
              lineHeight: 1,
              border: "1.5px solid var(--border)",
              marginLeft: 12,
              flexShrink: 0,
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p style={{ margin: "0 0 20px", color: "var(--muted)", fontSize: 13 }}>
          {aiMode === "flowchart"
            ? "Describe a process or workflow. AI generates a flowchart."
            : "Describe any diagram — architecture, mind map, org chart, network, etc."}
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {(["diagram", "flowchart"] as AiMode[]).map(m => (
            <button key={m} onClick={() => onModeChange(m)} style={{
              flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 13, fontWeight: 500,
              background: aiMode === m ? ACCENT : "var(--paper-2)",
              color: aiMode === m ? "#fff" : "var(--ink-soft)",
              border: `1px solid ${aiMode === m ? ACCENT : "var(--border)"}`,
              cursor: "pointer", transition: "all 0.15s",
            }}>
              {m === "diagram" ? "✦ Diagram" : "⬡ Flowchart"}
            </button>
          ))}
        </div>

        <textarea
          value={aiPrompt}
          onChange={e => onPromptChange(e.target.value)}
          placeholder={aiMode === "flowchart"
            ? "e.g. User login: start → enter credentials → validate → if valid show dashboard, else show error → end"
            : "e.g. Microservices with API gateway, auth service, user service and PostgreSQL"}
          rows={4}
          onKeyDown={e => e.key === "Enter" && e.ctrlKey && onGenerate()}
          style={{
            ...inputStyle,
            fontSize: 13,
            resize: "vertical",
            fontFamily: "inherit",
            padding: "10px 12px",
          }}
        />
        {aiError && <p style={{ color: ACCENT, fontSize: 13, margin: "8px 0 0" }}>{aiError}</p>}

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button onClick={onGenerate} disabled={disabled} style={{
            flex: 1, padding: "10px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600,
            background: disabled ? "var(--paper-2)" : ACCENT,
            color: disabled ? "var(--muted)" : "#fff",
            border: `1px solid ${disabled ? "var(--border)" : ACCENT}`,
            cursor: disabled ? "not-allowed" : "pointer",
          }}>
            {aiLoading ? "Generating…" : "Generate (Ctrl+Enter)"}
          </button>
          <button onClick={onClose} style={{ ...ghostBtn, padding: "10px 16px", fontSize: 14 }}>
            Cancel
          </button>
        </div>

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)" }}>OpenRouter API Key</label>
            <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" style={{ fontSize: 11, color: ACCENT, textDecoration: "none" }}>
              Get a free key →
            </a>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              type={showApiKey ? "text" : "password"}
              value={userApiKey}
              onChange={e => onApiKeyChange(e.target.value)}
              placeholder="sk-or-v1-…  (optional — uses server key if blank)"
              style={inputStyle}
            />
            <button type="button" onClick={onToggleShowApiKey} style={ghostBtn}>
              {showApiKey ? "xx" : "👁"}
            </button>
            {userApiKey && (
              <button type="button" onClick={onClearApiKey}
                style={{ ...ghostBtn, color: ACCENT }}>
                ✕
              </button>
            )}
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--muted)" }}>
            Saved in your browser only. Sent directly to OpenRouter, nowhere else.
          </p>
        </div>
      </div>
    </div>
  );
}
