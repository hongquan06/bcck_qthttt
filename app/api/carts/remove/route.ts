import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// DELETE /api/cart/remove?cart_item_id=1 — Xóa 1 sản phẩm
// DELETE /api/cart/remove                 — Xóa toàn bộ giỏ hàng
export async function DELETE(req: Request) {
  try {
    const decoded = verifyToken(req);

    const { searchParams } = new URL(req.url);
    const cart_item_id = searchParams.get("cart_item_id");

    // Không truyền id → xóa toàn bộ giỏ hàng
    if (!cart_item_id) {
      const cart = await prisma.carts.findFirst({
        where: { user_id: decoded.id },
      });

      if (!cart) {
        return new Response("Giỏ hàng không tồn tại", { status: 404 });
      }

      await prisma.cart_items.deleteMany({
        where: { cart_id: cart.id },
      });

      return Response.json({ message: "Đã xóa toàn bộ giỏ hàng" });
    }

    // Kiểm tra cart_item tồn tại
    const cartItem = await prisma.cart_items.findUnique({
      where: { id: Number(cart_item_id) },
      include: { carts: true },
    });

    if (!cartItem) {
      return new Response("Cart item not found", { status: 404 });
    }

    // Chỉ được xóa giỏ của chính mình
    if (cartItem.carts?.user_id !== decoded.id) {
      return new Response("Forbidden", { status: 403 });
    }

    await prisma.cart_items.delete({
      where: { id: Number(cart_item_id) },
    });

    return Response.json({ message: "Đã xóa sản phẩm khỏi giỏ hàng" });
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }
}