import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

// ✅ Type cho JWT payload
type JwtPayload = {
  id: number;
  role: string;
};

// 🔑 Helper: verify token → trả về payload
function verifyToken(req: Request): JwtPayload {
  const auth = req.headers.get("authorization");
  if (!auth) throw new Error("No token");

  const token = auth.split(" ")[1];
  return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
}

// 🛡️ Helper: verify token + check admin
function requireAdmin(req: Request): JwtPayload {
  const decoded = verifyToken(req);
  if (decoded.role !== "admin") {
    throw new Error("Forbidden");
  }
  return decoded;
}

// =======================
// GET — user & admin đều dùng được
// =======================
export async function GET(req: Request) {
  try {

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // Lấy 1 sản phẩm theo id nếu có query ?id=
    if (id) {
      const product = await prisma.products.findUnique({
        where: { id: Number(id) },
      });

      if (!product) {
        return new Response("Product not found", { status: 404 });
      }

      return Response.json(product);
    }

    // Lấy toàn bộ sản phẩm
    const products = await prisma.products.findMany();
    return Response.json(products);

  } catch (error) {
    return new Response("Unauthorized", { status: 401 });
  }
}

// =======================
// POST — CHỈ ADMIN được thêm
// =======================
export async function POST(req: Request) {
  try {
    requireAdmin(req);

    const { name, description, price, stock, image_url } = await req.json();

    if (!name || price === undefined) {
      return new Response("Missing required fields: name, price", { status: 400 });
    }

    if (typeof price !== "number" || price < 0) {
      return new Response("Invalid price", { status: 400 });
    }

    const product = await prisma.products.create({
      data: { name, description, price, stock, image_url },
    });

    return Response.json(product, { status: 201 });

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Forbidden") {
        return new Response("Forbidden: Admins only", { status: 403 });
      }
    }
    return new Response("Unauthorized", { status: 401 });
  }
}

// =======================
// PUT — CHỈ ADMIN được sửa
// =======================
export async function PUT(req: Request) {
  try {
    requireAdmin(req);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response("Missing product id in query (?id=)", { status: 400 });
    }

    const body = await req.json();
    const { name, description, price, stock, image_url } = body;

    // Kiểm tra product tồn tại không
    const existing = await prisma.products.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return new Response("Product not found", { status: 404 });
    }

    // Validate price nếu có truyền vào
    if (price !== undefined && (typeof price !== "number" || price < 0)) {
      return new Response("Invalid price", { status: 400 });
    }

    const updated = await prisma.products.update({
      where: { id: Number(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(stock !== undefined && { stock }),
        ...(image_url !== undefined && { image_url }),
      },
    });

    return Response.json(updated);

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Forbidden") {
        return new Response("Forbidden: Admins only", { status: 403 });
      }
    }
    return new Response("Unauthorized", { status: 401 });
  }
}

// =======================
// DELETE — CHỈ ADMIN được xóa
// =======================
export async function DELETE(req: Request) {
  try {
    requireAdmin(req);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response("Missing product id in query (?id=)", { status: 400 });
    }

    // Kiểm tra product tồn tại không
    const existing = await prisma.products.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return new Response("Product not found", { status: 404 });
    }

    await prisma.products.delete({
      where: { id: Number(id) },
    });

    return Response.json({ message: `Product ${id} deleted successfully` });

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Forbidden") {
        return new Response("Forbidden: Admins only", { status: 403 });
      }
    }
    return new Response("Unauthorized", { status: 401 });
  }
}