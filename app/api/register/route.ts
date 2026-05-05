import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    // đọc body an toàn (tránh lỗi JSON crash)
    const body = await req.json().catch(() => null);

    const email = body?.email;
    const password = body?.password;

    // validate input
    if (!email || !password) {
      return new Response("Missing email or password", {
        status: 400,
      });
    }

    // check user tồn tại
    const existing = await prisma.users.findUnique({
      where: { email },
    });

    if (existing) {
      return new Response("Email already exists", {
        status: 400,
      });
    }

    // hash password
    const hash = await bcrypt.hash(password, 10);

    // tạo user
    const user = await prisma.users.create({
      data: {
        email,
        password: hash,
      },
    });

    // remove password trước khi trả về
    const { password: _, ...safeUser } = user;

    return Response.json(safeUser);
  } catch (err: unknown) {
    console.log("REGISTER ERROR:", err);

    const message =
      err instanceof Error ? err.message : "Internal Server Error";

    return new Response(message, {
      status: 500,
    });
  }
}