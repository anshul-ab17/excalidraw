// Shared domain types — sourced from the monorepo package so server and client stay in sync
export type { Tool, AiMode, ExcaliElement, CursorPos } from "@repo/types";

// UI-only types (not needed server-side)
export type HandlePos = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "p1" | "p2";

export interface TextInputState {
  x: number;
  y: number;
  value: string;
}

export interface SelDrag {
  mode: "move" | "resize";
  handle: HandlePos | null;
  mouseStartX: number;
  mouseStartY: number;
  originalEl: import("@repo/types").ExcaliElement;
}

// UI constants
export const ACCENT = "#E84A3F";
export const ACCENT_LIGHT = "#FBF8F1";
export const ACCENT_BORDER = "#F2B84B";
export const COLORS = ["#15130F", "#E84A3F", "#3D6BE5", "#2E8A6A", "#F2B84B", "#7950f2", "#F1B8C2", "#FBF8F1"];
export const BG_COLORS = ["transparent", "#B8DDC4", "#A9C8F5", "#F1B8C2", "#F2B84B", "#e5dbff", "#EDE6D8"];
export const STORAGE_KEY = "canvas_drawing";
export const HANDLE_CURSORS: Record<string, string> = {
  nw: "nw-resize", n: "n-resize", ne: "ne-resize",
  w: "w-resize", e: "e-resize",
  sw: "sw-resize", s: "s-resize", se: "se-resize",
  p1: "crosshair", p2: "crosshair",
};
