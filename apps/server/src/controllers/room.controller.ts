import { Request, Response } from "express";
import { CreateRoomSchema } from "@repo/types";
import { createRoom, getAllRooms, getRoomBySlug } from "../services/room.service.js";

export async function postRoom(req: Request, res: Response) {
  const parsed = CreateRoomSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
    return;
  }
  try {
    const room = await createRoom(parsed.data.name, req.userId);
    res.status(201).json({ roomId: room.id });
  } catch {
    res.status(409).json({ message: "Room name already taken" });
  }
}

export async function getRooms(_req: Request, res: Response) {
  const rooms = await getAllRooms();
  res.json({ rooms });
}

export async function getRoom(req: Request, res: Response) {
  const room = await getRoomBySlug(req.params.slug as string);
  if (!room) {
    res.status(404).json({ message: "Room not found" });
    return;
  }
  res.json({ room });
}
