import { prisma } from "@/lib/prisma";
import { getOrCreateCart } from "@/lib/cart";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// ✅ GET /api/carts — Lấy giỏ hàng (dùng cho trang payment)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = Number(session?.user?.id);

    if (!session?.user?.id || isNaN(userId)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cart = await prisma.carts.findFirst({
      where: { user_id: userId },
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
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/carts — Thêm sản phẩm vào giỏ hàng
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    let userId: number | null = null;
    try {
      const session = await getServerSession(authOptions);
      const id = Number(session?.user?.id);
      if (!isNaN(id) && id > 0) userId = id;
    } catch {
      userId = null;
    }

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

    const product = await prisma.products.findUnique({
      where: { id: product_id },
    });

    if (!product) {
      return new Response("Product not found", { status: 404 });
    }

    if ((product.stock ?? 0) < quantity) {
      return new Response("Không đủ hàng trong kho", { status: 400 });
    }

    const cart = await getOrCreateCart(userId ?? undefined, sessionId ?? undefined);

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
      const cartItem = await prisma.cart_items.create({
        data: { cart_id: cart.id, product_id, quantity },
      });

      responseBody = {
        message: "Đã thêm sản phẩm vào giỏ hàng",
        cart_item: cartItem,
      };
    }

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