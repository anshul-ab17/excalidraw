import { WebSocket } from "ws";
import { ClientMap, RoomCache, RoomMap } from "./types.js";
import { upsertElement, softDeleteElements } from "../services/socket.service.js";

export const rooms: RoomMap = new Map();
export const clients: ClientMap = new Map();

// In-memory element store: roomId -> elementId -> {element, userId}
export const roomCache: RoomCache = new Map();
// Pending DB writes: roomId -> Set<elementId>
export const pendingUpserts = new Map<string, Set<string>>();
// Pending DB soft-deletes (elementIds, not roomId-scoped)
export const pendingDeletes = new Set<string>();

export function broadcast(roomId: string, sender: WebSocket, message: object) {
  const roomClients = rooms.get(roomId);
  if (!roomClients) return;
  const data = JSON.stringify(message);
  roomClients.forEach((client) => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

export function broadcastAll(roomId: string, message: object) {
  const roomClients = rooms.get(roomId);
  if (!roomClients) return;
  const data = JSON.stringify(message);
  roomClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(data);
  });
}

// Flush dirty elements to DB every 150ms — decouples persistence from broadcast latency
setInterval(async () => {
  for (const [roomId, ids] of pendingUpserts) {
    if (!ids.size) continue;
    const cache = roomCache.get(roomId);
    if (!cache) { ids.clear(); continue; }
    const batch = Array.from(ids);
    ids.clear();
    for (const id of batch) {
      const entry = cache.get(id);
      if (!entry) continue;
      upsertElement(id, parseInt(roomId), entry.element.type, JSON.stringify(entry.element), entry.userId)
        .catch((err) => console.error("[DB] upsert error:", err));
    }
  }
  if (pendingDeletes.size) {
    const batch = Array.from(pendingDeletes);
    pendingDeletes.clear();
    softDeleteElements(batch).catch((err) => console.error("[DB] delete error:", err));
  }
}, 150);
