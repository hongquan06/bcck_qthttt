import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // check user tồn tại
    const existing = await prisma.users.findUnique({
      where: { email },
    });

    if (existing) {
      return new Response("Email already exists", { status: 400 });
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

    // 🔥 loại bỏ password trước khi trả về
    const { password: _, ...safeUser } = user;

    return Response.json(safeUser);
  } catch (err) {
    console.log(err);
    return new Response("Error", { status: 500 });
  }
}