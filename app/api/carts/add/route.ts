import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { getOrCreateCart } from "@/lib/cart";

// POST /api/cart/add — Thêm sản phẩm vào giỏ hàng
export async function POST(req: Request) {
  try {
    const decoded = verifyToken(req);

    const { product_id, quantity = 1 } = await req.json();

    if (!product_id) {
      return new Response("Missing product_id", { status: 400 });
    }

    if (typeof quantity !== "number" || quantity < 1) {
      return new Response("quantity phải là số nguyên >= 1", { status: 400 });
    }

    // Kiểm tra sản phẩm tồn tại
    const product = await prisma.products.findUnique({
      where: { id: product_id },
    });

    if (!product) {
      return new Response("Product not found", { status: 404 });
    }

    // Kiểm tra tồn kho
    if ((product.stock ?? 0) < quantity) {
      return new Response("Không đủ hàng trong kho", { status: 400 });
    }

    // Lấy hoặc tạo giỏ hàng
    const cart = await getOrCreateCart(decoded.id);

    // Nếu sản phẩm đã có trong giỏ → cộng thêm số lượng
    const existingItem = await prisma.cart_items.findFirst({
      where: { cart_id: cart.id, product_id },
    });

    if (existingItem) {
      const newQuantity = (existingItem.quantity ?? 0) + quantity;

      if ((product.stock ?? 0) < newQuantity) {
        return new Response("Không đủ hàng trong kho", { status: 400 });
      }

      const updated = await prisma.cart_items.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });

      return Response.json({
        message: "Đã cập nhật số lượng sản phẩm trong giỏ",
        cart_item: updated,
      });
    }

    // Chưa có → thêm mới
    const cartItem = await prisma.cart_items.create({
      data: { cart_id: cart.id, product_id, quantity },
    });

    return Response.json(
      { message: "Đã thêm sản phẩm vào giỏ hàng", cart_item: cartItem },
      { status: 201 }
    );
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }
}