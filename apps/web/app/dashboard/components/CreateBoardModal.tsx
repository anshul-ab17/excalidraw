"use client";

const ACCENT = "#e03131";
const ACCENT_BORDER = "#fca5a5";

interface Props {
  newRoomName: string;
  creating: boolean;
  onChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function CreateBoardModal({ newRoomName, creating, onChange, onSubmit, onClose }: Props) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(21,19,15,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
      backdropFilter: "blur(4px)",
    }}>
      <div style={{ background: "var(--surface)", padding: 40, borderRadius: 18, width: 440, boxShadow: "var(--shadow-lg)", border: "1.5px solid var(--border)" }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 500, fontFamily: "'Fraunces', serif", color: "var(--text)" }}>New Board</h2>
        <p style={{ margin: "0 0 32px", fontSize: 14, color: "var(--text-muted)", fontFamily: "'Inter Tight', sans-serif" }}>
          Give your board a unique name to share with collaborators.
        </p>
        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input
            type="text"
            value={newRoomName}
            onChange={e => onChange(e.target.value)}
            placeholder="e.g. product-roadmap"
            autoFocus
            required
            style={{
              padding: "14px 16px", borderRadius: 12, border: "1.5px solid var(--border)",
              fontSize: 15, outline: "none", width: "100%", boxSizing: "border-box",
              background: "var(--bg)", color: "var(--text)", fontFamily: "'Inter Tight', sans-serif",
              transition: "border-color 0.2s"
            }}
          />
          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <button type="submit" disabled={creating} style={{
              flex: 1, padding: "14px 16px", borderRadius: 12, fontSize: 13, fontWeight: 700,
              background: creating ? "var(--bg)" : "var(--primary)",
              color: creating ? "var(--text-muted)" : "white",
              border: "1.5px solid var(--ink)", cursor: creating ? "not-allowed" : "pointer",
              boxShadow: "var(--shadow-sm)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.05em"
            }}>
              {creating ? "Creating…" : "Create Board →"}
            </button>
            <button type="button" onClick={onClose} style={{
              padding: "14px 20px", borderRadius: 12, fontSize: 13, fontWeight: 700,
              border: "1.5px solid var(--border)", background: "var(--surface)", cursor: "pointer",
              color: "var(--text)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.05em"
            }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
