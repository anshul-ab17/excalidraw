import type { CSSProperties } from "react";

export const INK = "var(--ink, #15130F)";
export const PAPER = "var(--paper-3, #FBF8F1)";
export const RULE = "var(--rule, #E8E0D0)";
export const MUTED = "var(--muted, #7A7264)";

export const panel: CSSProperties = {
  background: PAPER,
  border: `1.5px solid ${INK}`,
  borderRadius: 14,
  boxShadow: `4px 4px 0 ${INK}`,
};

export const cardShadow = `4px 4px 0 ${INK}`;
export const cardShadowHover = `8px 8px 0 ${INK}`;

export const iconBtn: CSSProperties = {
  background: PAPER,
  border: `1px solid ${INK}`,
  borderRadius: 6,
  cursor: "pointer",
  color: INK,
};

export const accentBtn = (accent: string): CSSProperties => ({
  background: accent,
  border: `1.5px solid ${accent}`,
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
  fontFamily: "'Inter Tight', sans-serif",
  boxShadow: `3px 3px 0 ${INK}`,
});

export const separator: CSSProperties = {
  width: 1,
  background: INK,
  opacity: 0.15,
};

export const monoLabel: CSSProperties = {
  fontSize: 9,
  fontWeight: 500,
  color: MUTED,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  fontFamily: "'JetBrains Mono', monospace",
  marginBottom: 6,
};

export const pill: CSSProperties = {
  background: PAPER,
  border: `1.5px solid ${INK}`,
  borderRadius: 999,
  padding: "4px 12px",
  boxShadow: `3px 3px 0 ${INK}`,
  display: "flex",
  alignItems: "center",
  gap: 8,
};

export const toolBar: CSSProperties = {
  ...panel,
  borderRadius: 16,
  padding: "8px 12px",
  display: "flex",
  alignItems: "center",
  gap: 8,
};

export const toolBtn = (active: boolean): CSSProperties => ({
  width: 32,
  height: 32,
  borderRadius: 8,
  display: "grid",
  placeItems: "center",
  border: active ? `1.5px solid ${INK}` : "1.5px solid transparent",
  background: active ? INK : "transparent",
  color: active ? PAPER : INK,
  cursor: "pointer",
  transition: "all 0.2s",
});

export const actionBtn: CSSProperties = {
  ...iconBtn,
  width: 30,
  height: 30,
  borderRadius: 6,
  display: "grid",
  placeItems: "center",
  transition: "all 0.2s",
};
