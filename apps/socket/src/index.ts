import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3000 });
const rooms = new Map(); //-> Set<ws>

wss.on("connection", (ws) => {
  let boardId = null;

  ws.on("message", (data) => {
    // join room
    // leave room
    // broadcast to room
  });

  ws.on("close", () => {
    // cleanup room
  });
});

console.log("WS server running on ws://localhost:3000");
