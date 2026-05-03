import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// GET /api/cart — Xem giỏ hàng của user
export async function GET(req: Request) {
  try {
    const decoded = verifyToken(req);

    const cart = await prisma.carts.findFirst({
      where: { user_id: decoded.id },
      include: {
        cart_items: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                price: true,
                image_url: true,
                stock: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return Response.json({ cart_id: null, items: [], total: 0 });
    }

    const total = cart.cart_items.reduce((sum, item) => {
      const price = Number(item.products?.price ?? 0);
      const quantity = item.quantity ?? 0;
      return sum + price * quantity;
    }, 0);

    return Response.json({
      cart_id: cart.id,
      items: cart.cart_items.map((item) => ({
        cart_item_id: item.id,
        quantity: item.quantity,
        product: item.products,
        subtotal: Number(item.products?.price ?? 0) * (item.quantity ?? 0),
      })),
      total,
    });
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }
}