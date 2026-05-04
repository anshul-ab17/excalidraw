import { prisma } from "@repo/db/client";
import bcrypt from "bcryptjs";

export async function createUser(username: string, password: string, name: string) {
  const hash = await bcrypt.hash(password, 12);
  return prisma.user.create({
    data: { email: username, password: hash, username },
  });
}

export async function findUserByCredentials(username: string, password: string) {
  const user = await prisma.user.findFirst({ where: { email: username } });
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.password);
  return valid ? user : null;
}
