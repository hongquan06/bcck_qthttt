import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { getOrCreateCart } from "@/lib/cart";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

// POST /api/cart/add — Thêm sản phẩm vào giỏ hàng (hỗ trợ cả guest)
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    // Thử lấy user từ token (không throw nếu chưa login)
    let userId: number | null = null;
    try {
      const decoded = verifyToken(req);
      userId = decoded.id;
    } catch {
      userId = null; // Guest
    }

    // Lấy hoặc tạo sessionId cho guest
    let sessionId = cookieStore.get("session_id")?.value ?? null;
    if (!userId && !sessionId) {
      sessionId = uuidv4();
    }

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

    // Lấy hoặc tạo giỏ hàng (theo userId hoặc sessionId)
    const cart = await getOrCreateCart(userId ?? undefined, sessionId ?? undefined);

    // Nếu sản phẩm đã có trong giỏ → cộng thêm số lượng
    const existingItem = await prisma.cart_items.findFirst({
      where: { cart_id: cart.id, product_id },
    });

    let responseBody;

    if (existingItem) {
      const newQuantity = (existingItem.quantity ?? 0) + quantity;

      if ((product.stock ?? 0) < newQuantity) {
        return new Response("Không đủ hàng trong kho", { status: 400 });
      }

      const updated = await prisma.cart_items.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });

      responseBody = {
        message: "Đã cập nhật số lượng sản phẩm trong giỏ",
        cart_item: updated,
      };
    } else {
      // Chưa có → thêm mới
      const cartItem = await prisma.cart_items.create({
        data: { cart_id: cart.id, product_id, quantity },
      });

      responseBody = {
        message: "Đã thêm sản phẩm vào giỏ hàng",
        cart_item: cartItem,
      };
    }

    // Gắn cookie session_id cho guest
    const res = Response.json(responseBody, {
      status: existingItem ? 200 : 201,
    });

    if (!userId && sessionId) {
      res.headers.set(
        "Set-Cookie",
        `session_id=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`
      );
    }

    return res;
  } catch {
    return new Response("Internal Server Error", { status: 500 });
  }
}