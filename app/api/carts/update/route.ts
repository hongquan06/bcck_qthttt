import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// PUT /api/cart/update?cart_item_id=1 — Cập nhật số lượng sản phẩm trong giỏ
export async function PUT(req: Request) {
  try {
    const decoded = verifyToken(req);

    const { searchParams } = new URL(req.url);
    const cart_item_id = searchParams.get("cart_item_id");

    if (!cart_item_id) {
      return new Response("Missing cart_item_id in query (?cart_item_id=)", {
        status: 400,
      });
    }

    const { quantity } = await req.json();

    if (typeof quantity !== "number" || quantity < 1) {
      return new Response("quantity phải là số nguyên >= 1", { status: 400 });
    }

    // Kiểm tra cart_item tồn tại
    const cartItem = await prisma.cart_items.findUnique({
      where: { id: Number(cart_item_id) },
      include: { carts: true, products: true },
    });

    if (!cartItem) {
      return new Response("Cart item not found", { status: 404 });
    }

    // Chỉ được sửa giỏ của chính mình
    if (cartItem.carts?.user_id !== decoded.id) {
      return new Response("Forbidden", { status: 403 });
    }

    // Kiểm tra tồn kho
    if ((cartItem.products?.stock ?? 0) < quantity) {
      return new Response("Không đủ hàng trong kho", { status: 400 });
    }

    const updated = await prisma.cart_items.update({
      where: { id: Number(cart_item_id) },
      data: { quantity },
    });

    return Response.json({
      message: "Đã cập nhật số lượng",
      cart_item: updated,
    });
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }
}