import { WebSocket } from "ws";
import {
  WsJoinRoomSchema, WsDrawSchema, WsDrawLiveSchema,
  WsEraseSchema, WsCursorSchema, WsClearSchema, WsChatSchema,
} from "@repo/types";
import { getRoomElements, clearRoomElements } from "../services/socket.service.js";
import { CachedEntry } from "./types.js";
import { rooms, clients, roomCache, pendingUpserts, pendingDeletes, broadcast, broadcastAll } from "./state.js";

export async function handleMessage(ws: WebSocket, raw: string) {
  if (raw.length > 512_000) return; // 512 KB hard cap on any single message

  let msg: unknown;
  try { msg = JSON.parse(raw); } catch { return; }

  const client = clients.get(ws);
  if (!client) return;

  const type = (msg as Record<string, unknown>).type;

  switch (type) {
    case "join_room": {
      const parsed = WsJoinRoomSchema.safeParse(msg);
      if (!parsed.success) return;
      const { roomId } = parsed.data;
      client.roomId = roomId;
      if (!rooms.has(roomId)) rooms.set(roomId, new Set());
      rooms.get(roomId)!.add(ws);

      if (!roomCache.has(roomId)) {
        const rows = await getRoomElements(parseInt(roomId));
        const cache = new Map<string, CachedEntry>();
        rows.forEach((r) =>
          cache.set(r.id, { element: JSON.parse(r.data), userId: r.userId ?? "unknown" })
        );
        roomCache.set(roomId, cache);
      }

      const elements = Array.from(roomCache.get(roomId)!.values()).map((e) => e.element);
      ws.send(JSON.stringify({ type: "init_room", elements }));
      broadcast(roomId, ws, { type: "user_joined", userId: client.userId });
      break;
    }

    case "draw": {
      const parsed = WsDrawSchema.safeParse(msg);
      if (!parsed.success) return;
      const { element } = parsed.data;
      const { roomId } = client;
      if (!roomId) return;
      if (!roomCache.has(roomId)) roomCache.set(roomId, new Map());
      roomCache.get(roomId)!.set(element.id, { element, userId: client.userId });
      if (!pendingUpserts.has(roomId)) pendingUpserts.set(roomId, new Set());
      pendingUpserts.get(roomId)!.add(element.id);
      broadcast(roomId, ws, { type: "draw", element, userId: client.userId });
      break;
    }

    case "draw_live": {
      const parsed = WsDrawLiveSchema.safeParse(msg);
      if (!parsed.success) return;
      const { roomId } = client;
      if (!roomId) return;
      broadcast(roomId, ws, { type: "draw_live", element: parsed.data.element, userId: client.userId });
      break;
    }

    case "erase": {
      const parsed = WsEraseSchema.safeParse(msg);
      if (!parsed.success) return;
      const { elementIds } = parsed.data;
      const { roomId } = client;
      if (!roomId) return;
      const cache = roomCache.get(roomId);
      if (cache) elementIds.forEach((id: string) => cache.delete(id));
      elementIds.forEach((id: string) => pendingDeletes.add(id));
      broadcast(roomId, ws, { type: "erase", elementIds, userId: client.userId });
      break;
    }

    case "cursor": {
      const parsed = WsCursorSchema.safeParse(msg);
      if (!parsed.success) return;
      const { roomId } = client;
      if (!roomId) return;
      const now = Date.now();
      if (now - client.lastCursor < 33) return;
      client.lastCursor = now;
      broadcast(roomId, ws, { type: "cursor", x: parsed.data.x, y: parsed.data.y, userId: client.userId });
      break;
    }

    case "clear": {
      const parsed = WsClearSchema.safeParse(msg);
      if (!parsed.success) return;
      const { roomId } = client;
      if (!roomId) return;
      roomCache.set(roomId, new Map());
      pendingUpserts.get(roomId)?.clear();
      clearRoomElements(parseInt(roomId)).catch((err) => console.error("[DB] clear error:", err));
      broadcast(roomId, ws, { type: "clear", userId: client.userId });
      break;
    }

    case "chat": {
      const parsed = WsChatSchema.safeParse(msg);
      if (!parsed.success) return;
      const { roomId } = client;
      if (!roomId) return;
      const now = Date.now();
      if (now - client.lastChat < 500) return;
      client.lastChat = now;
      broadcastAll(roomId, { type: "chat", text: parsed.data.text, userId: client.userId, ts: now });
      break;
    }
  }
}
