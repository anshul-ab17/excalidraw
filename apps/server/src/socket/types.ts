import { WebSocket } from "ws";
import { ExcaliElement } from "@repo/types";

export type { ExcaliElement };

export type ClientState = {
  userId: string;
  roomId?: string;
  lastCursor: number;
  lastChat: number;
  lastDrawLive: number;
};

export type CachedEntry = {
  element: ExcaliElement;
  userId: string;
};

export type RoomMap = Map<string, Set<WebSocket>>;
export type ClientMap = Map<WebSocket, ClientState>;
export type RoomCache = Map<string, Map<string, CachedEntry>>;
