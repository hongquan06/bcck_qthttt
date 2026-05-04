import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const user = await prisma.users.findUnique({
    where: { email },
  });

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  const isMatch = await bcrypt.compare(password, user.password!);

  if (!isMatch) {
    return new Response("Wrong password", { status: 400 });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" }
  );

  // ✅ Set cookie "session" để các API route đọc được (capture-order, v.v.)
  const response = Response.json({ token });
  response.headers.set(
    "Set-Cookie",
    `session=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`
  );

  return response;
}