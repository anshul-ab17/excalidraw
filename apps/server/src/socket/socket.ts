import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage, Server } from "http";
import { JWT_SECRET } from "@repo/jwt";
import jwt from "jsonwebtoken";
import { clients, rooms, broadcast } from "./state.js";
import { handleMessage } from "./handlers.js";

export function initSocketServer(server: Server) {
  // perMessageDeflate: false — skip compression for minimum latency on small messages
  const wss = new WebSocketServer({ server, perMessageDeflate: false });

  wss.on("connection", (ws: WebSocket, request: IncomingMessage) => {
    const url = request.url;
    if (!url) { ws.close(); return; }

    const token = new URLSearchParams(url.split("?")[1]).get("token") || "";
    let decoded: { userId: string };
    try {
      const result = jwt.verify(token, JWT_SECRET);
      if (typeof result === "string" || !result?.userId) { ws.close(); return; }
      decoded = result as { userId: string };
    } catch {
      ws.close();
      return;
    }

    clients.set(ws, { userId: decoded.userId, lastCursor: 0, lastChat: 0 });

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
