import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage, Server } from "http";
import { JWT_SECRET } from "@repo/jwt";
import jwt from "jsonwebtoken";
import { clients, rooms, broadcast } from "./state.js";
import { handleMessage } from "./handlers.js";

const PING_INTERVAL_MS = 30_000;
const MAX_MISSED_PINGS = 2;

export function initSocketServer(server: Server) {
  const wss = new WebSocketServer({ server, perMessageDeflate: false });

  // Heartbeat loop — terminates stale connections that miss pong responses
  const heartbeat = setInterval(() => {
    wss.clients.forEach((ws) => {
      const ext = ws as WebSocket & { _missedPings?: number; _isAlive?: boolean };
      if (ext._isAlive === false) {
        ext._missedPings = (ext._missedPings ?? 0) + 1;
        if (ext._missedPings >= MAX_MISSED_PINGS) {
          ws.terminate();
          return;
        }
      }
      ext._isAlive = false;
      ws.ping();
    });
  }, PING_INTERVAL_MS);

  wss.on("close", () => clearInterval(heartbeat));

  wss.on("connection", (ws: WebSocket, request: IncomingMessage) => {
    const ext = ws as WebSocket & { _missedPings?: number; _isAlive?: boolean };
    ext._isAlive = true;
    ext._missedPings = 0;

    ws.on("pong", () => {
      ext._isAlive = true;
      ext._missedPings = 0;
    });

    const url = request.url;
    if (!url) { ws.close(4001, "Unauthorized"); return; }

    const token = new URLSearchParams(url.split("?")[1]).get("token") || "";
    let decoded: { userId: string };
    try {
      const result = jwt.verify(token, JWT_SECRET);
      if (typeof result === "string" || !result?.userId) { ws.close(4001, "Unauthorized"); return; }
      decoded = result as { userId: string };
    } catch {
      ws.close(4001, "Unauthorized");
      return;
    }

    clients.set(ws, { userId: decoded.userId, lastCursor: 0, lastChat: 0, lastDrawLive: 0 });

    ws.on("message", async (data) => {
      try { await handleMessage(ws, data.toString()); }
      catch (e) { console.error("[Socket] error:", e); }
    });

    ws.on("close", () => {
      const client = clients.get(ws);
      if (client?.roomId) {
        broadcast(client.roomId, ws, { type: "user_left", userId: client.userId });
        const roomClients = rooms.get(client.roomId);
        if (roomClients) {
          roomClients.delete(ws);
          if (roomClients.size === 0) rooms.delete(client.roomId);
        }
      }
      clients.delete(ws);
    });
  });

  console.log("WebSocket server started.");
  return wss;
}
