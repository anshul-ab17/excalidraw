import { WebSocket } from "ws";
import { getRoomElements, clearRoomElements } from "../services/socket.service.js";
import { CachedEntry } from "./types.js";
import {
  rooms, clients, roomCache,
  pendingUpserts, pendingDeletes,
  broadcast, broadcastAll,
} from "./state.js";

export async function handleMessage(ws: WebSocket, raw: string) {
  const msg = JSON.parse(raw);
  const client = clients.get(ws);
  if (!client) return;

  switch (msg.type) {
    case "join_room": {
      const roomId = String(msg.roomId);
      client.roomId = roomId;
      if (!rooms.has(roomId)) rooms.set(roomId, new Set());
      rooms.get(roomId)!.add(ws);

      // Cold-start: load from DB only if room not already in memory
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
      const { element } = msg;
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
      const { element } = msg;
      const { roomId } = client;
      if (!roomId) return;
      broadcast(roomId, ws, { type: "draw_live", element, userId: client.userId });
      break;
    }

    case "erase": {
      const { elementIds } = msg;
      const { roomId } = client;
      if (!roomId) return;
      const cache = roomCache.get(roomId);
      if (cache) elementIds.forEach((id: string) => cache.delete(id));
      elementIds.forEach((id: string) => pendingDeletes.add(id));
      broadcast(roomId, ws, { type: "erase", elementIds, userId: client.userId });
      break;
    }

    case "cursor": {
      const { x, y } = msg;
      const { roomId } = client;
      if (!roomId) return;
      const now = Date.now();
      if (now - client.lastCursor < 33) return;
      client.lastCursor = now;
      broadcast(roomId, ws, { type: "cursor", x, y, userId: client.userId });
      break;
    }

    case "clear": {
      const { roomId } = client;
      if (!roomId) return;
      roomCache.set(roomId, new Map());
      pendingUpserts.get(roomId)?.clear();
      clearRoomElements(parseInt(roomId)).catch((err) => console.error("[DB] clear error:", err));
      broadcast(roomId, ws, { type: "clear", userId: client.userId });
      break;
    }

    case "chat": {
      const { text } = msg;
      const { roomId } = client;
      if (!roomId || !text?.trim()) return;
      const now = Date.now();
      if (now - client.lastChat < 500) return; // rate limit: 1 msg per 500ms
      client.lastChat = now;
      broadcastAll(roomId, { type: "chat", text: text.trim(), userId: client.userId, ts: now });
      break;
    }
  }
}
