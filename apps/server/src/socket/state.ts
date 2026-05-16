import { WebSocket } from "ws";
import { ClientMap, RoomCache, RoomMap } from "./types.js";
import { upsertElement, softDeleteElements } from "../services/socket.service.js";

export const rooms: RoomMap = new Map();
export const clients: ClientMap = new Map();

export const roomCache: RoomCache = new Map();
export const pendingUpserts = new Map<string, Set<string>>();
export const pendingDeletes = new Set<string>();

type RetryUpsert = { roomId: string; id: string; attempts: number; nextRetryAt: number };
type RetryDelete = { ids: string[]; attempts: number; nextRetryAt: number };
const retryUpserts: RetryUpsert[] = [];
const retryDeletes: RetryDelete[] = [];

const MAX_RETRY_ATTEMPTS = 3;
function backoffMs(attempt: number) { return Math.min(500 * 2 ** attempt, 10_000); }

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

export function startFlushWorker(intervalMs = 150) {
  return setInterval(async () => {
    const now = Date.now();

    // Primary flush — pending upserts
    for (const [roomId, ids] of pendingUpserts) {
      if (!ids.size) continue;
      const cache = roomCache.get(roomId);
      if (!cache) { ids.clear(); continue; }
      const batch = Array.from(ids);
      ids.clear();
      for (const id of batch) {
        const entry = cache.get(id);
        if (!entry) continue;
        upsertElement(id, parseInt(roomId), entry.element.type, entry.element, entry.userId)
          .catch(() => {
            retryUpserts.push({ roomId, id, attempts: 1, nextRetryAt: now + backoffMs(1) });
          });
      }
    }

    // Primary flush — pending deletes
    if (pendingDeletes.size) {
      const batch = Array.from(pendingDeletes);
      pendingDeletes.clear();
      softDeleteElements(batch).catch(() => {
        retryDeletes.push({ ids: batch, attempts: 1, nextRetryAt: now + backoffMs(1) });
      });
    }

    // Retry upserts
    const upsertsDue = retryUpserts.filter((r) => r.nextRetryAt <= now);
    for (const item of upsertsDue) {
      retryUpserts.splice(retryUpserts.indexOf(item), 1);
      if (item.attempts >= MAX_RETRY_ATTEMPTS) {
        console.error(`[DB] upsert permanently failed after ${MAX_RETRY_ATTEMPTS} attempts: element ${item.id}`);
        continue;
      }
      const cache = roomCache.get(item.roomId);
      const entry = cache?.get(item.id);
      if (!entry) continue;
      upsertElement(item.id, parseInt(item.roomId), entry.element.type, entry.element, entry.userId)
        .catch(() => {
          const next = item.attempts + 1;
          retryUpserts.push({ ...item, attempts: next, nextRetryAt: now + backoffMs(next) });
        });
    }

    // Retry deletes
    const deletesDue = retryDeletes.filter((r) => r.nextRetryAt <= now);
    for (const item of deletesDue) {
      retryDeletes.splice(retryDeletes.indexOf(item), 1);
      if (item.attempts >= MAX_RETRY_ATTEMPTS) {
        console.error(`[DB] delete permanently failed after ${MAX_RETRY_ATTEMPTS} attempts: ids ${item.ids.join(",")}`);
        continue;
      }
      softDeleteElements(item.ids).catch(() => {
        const next = item.attempts + 1;
        retryDeletes.push({ ...item, attempts: next, nextRetryAt: now + backoffMs(next) });
      });
    }
  }, intervalMs);
}
