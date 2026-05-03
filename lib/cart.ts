import { prisma } from "@/lib/prisma";

export async function getOrCreateCart(userId: number) {
  let cart = await prisma.carts.findFirst({
    where: { user_id: userId },
  });

  if (!cart) {
    cart = await prisma.carts.create({
      data: { user_id: userId },
    });
  }

  return cart;
}