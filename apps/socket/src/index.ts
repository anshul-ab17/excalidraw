import "dotenv/config";
import { WebSocketServer } from "ws";
import { JWT_SECRET } from "@repo/common-in-backend";
import jwt from "jsonwebtoken";

const PORT = Number(process.env.PORT) || 3001;
const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws, request) => {
  const url = request.url;
  if (!url) {
    ws.close();
    return;
  }

  const queryParam = new URLSearchParams(url.split("?")[1]);
  const token = queryParam.get("token") || "";

  let decode: any;
  try {
    decode = jwt.verify(token, JWT_SECRET);
  } catch {
    ws.close();
    return;
  }

  if (typeof decode === "string" || !decode?.userId) {
    ws.close();
    return;
  }

  ws.on("message", () => {
    ws.send("pong");
  });
});

console.log(PORT);
