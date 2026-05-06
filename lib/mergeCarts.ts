import { prisma } from "@/lib/prisma";
import { getOrCreateCart } from "@/lib/cart";

export async function mergeGuestCart(userId: number, sessionId: string) {
  const guestCart = await prisma.carts.findFirst({
    where: { session_id: sessionId },
    include: { cart_items: true },
  });

  if (!guestCart) return;

  const userCart = await getOrCreateCart(userId);

  for (const item of guestCart.cart_items) {
    const existing = await prisma.cart_items.findFirst({
      where: { cart_id: userCart.id, product_id: item.product_id },
    });

    if (existing) {
      await prisma.cart_items.update({
        where: { id: existing.id },
        data: { quantity: (existing.quantity ?? 0) + (item.quantity ?? 0) },
      });
    } else {
      await prisma.cart_items.create({
        data: {
          cart_id: userCart.id,
          product_id: item.product_id,
          quantity: item.quantity ?? 1,
        },
      });
    }
  }

  await prisma.carts.delete({ where: { id: guestCart.id } });
}