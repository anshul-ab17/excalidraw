import { WebSocket } from "ws";

export type ClientState = { userId: string; roomId?: string; lastCursor: number; lastChat: number };
export type CachedEntry = { element: any; userId: string };

export type RoomMap = Map<string, Set<WebSocket>>;
export type ClientMap = Map<WebSocket, ClientState>;
export type RoomCache = Map<string, Map<string, CachedEntry>>;
