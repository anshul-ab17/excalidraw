import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import roomRoutes from "./routes/room.routes.js";
import { initSocketServer } from "./socket/socket.js";
import { startFlushWorker } from "./socket/state.js";

const app = express();
const PORT = Number(process.env.PORT) || 3002;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json({ limit: "256kb" }));

app.use("/", authRoutes);
app.use("/", roomRoutes);

const server = http.createServer(app);
initSocketServer(server);
startFlushWorker();

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
