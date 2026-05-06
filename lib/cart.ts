import { prisma } from "@/lib/prisma";

export async function getOrCreateCart(userId?: number, sessionId?: string) {
  if (userId) {
    const existing = await prisma.carts.findFirst({
      where: { user_id: userId },
    });
    if (existing) return existing;

    return prisma.carts.create({
      data: { user_id: userId },
    });
  }

  if (sessionId) {
    const existing = await prisma.carts.findFirst({
      where: { session_id: sessionId },
    });
    if (existing) return existing;

    return prisma.carts.create({
      data: { session_id: sessionId },
    });
  }

  throw new Error("Cần userId hoặc sessionId");
}