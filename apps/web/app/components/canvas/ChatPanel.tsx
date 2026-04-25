"use client";
import { useEffect, useRef, useState } from "react";

interface ChatMessage {
  id: string;
  userId: string;
  text: string;
  ts: number;
  self: boolean;
}

interface Props {
  open: boolean;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onClose: () => void;
}

function shortId(userId: string) {
  return "User " + String(userId).slice(-4);
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPanel({ open, messages, onSend, onClose }: Props) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  }

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", bottom: 80, right: 16, zIndex: 20,
      width: 300, height: 380, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)",
      borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.6)",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f3f5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#1e1e1e" }}>Room Chat</span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#adb5bd", lineHeight: 1 }}>✕</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 0", display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.length === 0 && (
          <div style={{ margin: "auto", textAlign: "center", color: "#adb5bd", fontSize: 13 }}>
            No messages yet.<br />Say hello!
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: m.self ? "flex-end" : "flex-start" }}>
            {!m.self && (
              <span style={{ fontSize: 11, color: "#adb5bd", marginBottom: 2, paddingLeft: 4 }}>{shortId(m.userId)}</span>
            )}
            <div style={{
              maxWidth: "80%", padding: "7px 11px", borderRadius: m.self ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              background: m.self ? "#e03131" : "#f1f3f5", color: m.self ? "white" : "#1e1e1e",
              fontSize: 13, lineHeight: 1.4, wordBreak: "break-word",
            }}>
              {m.text}
            </div>
            <span style={{ fontSize: 10, color: "#ced4da", marginTop: 2, paddingLeft: 4, paddingRight: 4 }}>{formatTime(m.ts)}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={submit} style={{ padding: "10px 12px", borderTop: "1px solid #f1f3f5", display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          autoFocus
          style={{
            flex: 1, padding: "8px 12px", borderRadius: 10, border: "1px solid #dee2e6",
            fontSize: 13, outline: "none", background: "#f8f9fa",
          }}
        />
        <button type="submit" disabled={!input.trim()} style={{
          width: 36, height: 36, borderRadius: 10, background: "#e03131", border: "none",
          color: "white", cursor: input.trim() ? "pointer" : "not-allowed", opacity: input.trim() ? 1 : 0.5,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  );
}
