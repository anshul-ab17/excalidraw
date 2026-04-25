export type Tool =
  | "selection"
  | "hand"
  | "rectangle"
  | "diamond"
  | "ellipse"
  | "line"
  | "arrow"
  | "pencil"
  | "text"
  | "eraser";

export type AiMode = "diagram" | "flowchart";
export type HandlePos = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "p1" | "p2";

export interface ExcaliElement {
  id: string;
  type: Tool | "image";
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  backgroundColor: string;
  strokeWidth: number;
  roughness: number;
  opacity: number;
  points?: Array<[number, number]>;
  text?: string;
  seed: number;
  imageData?: string;
}

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
  originalEl: ExcaliElement;
}

export interface CursorPos {
  x: number;
  y: number;
  userId: string;
}

export const ACCENT = "#28d08b";
export const ACCENT_LIGHT = "#defcf0";
export const ACCENT_BORDER = "#96f2d7";
export const COLORS = ["#1e1e1e", "#28d08b", "#ff922b", "#339af0", "#ffc008", "#7950f2", "#e64980", "#ffffff"];
export const BG_COLORS = ["transparent", "#defcf0", "#ffec99", "#d0ebff", "#fff3bf", "#e5dbff", "#ffdeeb"];
export const STORAGE_KEY = "canvas_drawing";
export const HANDLE_CURSORS: Record<string, string> = {
  nw: "nw-resize",
  n: "n-resize",
  ne: "ne-resize",
  w: "w-resize",
  e: "e-resize",
  sw: "sw-resize",
  s: "s-resize",
  se: "se-resize",
  p1: "crosshair",
  p2: "crosshair",
};
