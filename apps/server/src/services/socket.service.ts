import { prisma } from "@repo/db/client";
import { ExcaliElement } from "@repo/types";

export async function getRoomElements(roomId: number) {
  return prisma.element.findMany({
    where: { roomId, isDeleted: false },
  });
}

export async function upsertElement(
  id: string,
  roomId: number,
  type: string,
  data: ExcaliElement,
  userId: string
) {
  const json = data as any;
  return prisma.element.upsert({
    where: { id },
    create: { id, roomId, type, data: json, userId },
    update: { data: json },
  });
}

export async function softDeleteElements(elementIds: string[]) {
  return prisma.element.updateMany({
    where: { id: { in: elementIds } },
    data: { isDeleted: true },
  });
}

export async function clearRoomElements(roomId: number) {
  return prisma.element.updateMany({
    where: { roomId },
    data: { isDeleted: true },
  });
}
