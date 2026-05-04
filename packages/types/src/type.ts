import {z} from "zod"

export const CreateUserSchema = z.object({
  username: z.string().min(3).max(50).trim(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100).trim(),
});

export const SignInSchema = z.object({
  username: z.string().min(3).max(50).trim(),
  password: z.string().min(8).max(128),
});

export const CreateRoomSchema = z.object({
  name: z.string().min(1).max(60).trim(),
});

//  WebSocket message schemas 

const ExcaliElementSchema = z.object({
  id: z.string().max(64),
  type: z.enum(["selection", "hand", "rectangle", "diamond", "ellipse", "line", "arrow", "pencil", "text", "eraser", "image"]),
  x: z.number().finite(),
  y: z.number().finite(),
  width: z.number().finite(),
  height: z.number().finite(),
  strokeColor: z.string().max(32),
  backgroundColor: z.string().max(32),
  strokeWidth: z.number().finite(),
  roughness: z.number().finite(),
  opacity: z.number().min(0).max(100),
  seed: z.number().finite(),
  points: z.array(z.tuple([z.number(), z.number()])).max(10000).optional(),
  text: z.string().max(10000).optional(),
  fontSize: z.number().finite().optional(),
  fontFamily: z.string().max(128).optional(),
  imageData: z.string().max(5_000_000).optional(),
});

export const WsJoinRoomSchema = z.object({ type: z.literal("join_room"), roomId: z.string().max(32) });
export const WsDrawSchema = z.object({ type: z.literal("draw"), element: ExcaliElementSchema });
export const WsDrawLiveSchema = z.object({ type: z.literal("draw_live"), element: ExcaliElementSchema });
export const WsEraseSchema = z.object({ type: z.literal("erase"), elementIds: z.array(z.string().max(64)).max(500) });
export const WsCursorSchema = z.object({ type: z.literal("cursor"), x: z.number().finite(), y: z.number().finite() });
export const WsClearSchema = z.object({ type: z.literal("clear") });
export const WsChatSchema = z.object({ type: z.literal("chat"), text: z.string().min(1).max(500) });

//  Shared domain types 

export type Tool =
  | "selection" | "hand" | "rectangle" | "diamond" | "ellipse"
  | "line" | "arrow" | "pencil" | "text" | "eraser";

export type AiMode = "diagram" | "flowchart";

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
  points?: Array<[number, number]> | undefined;
  text?: string | undefined;
  fontSize?: number | undefined;
  fontFamily?: string | undefined;
  seed: number;
  imageData?: string | undefined;
}

export interface CursorPos {
  x: number;
  y: number;
  userId: string;
}
