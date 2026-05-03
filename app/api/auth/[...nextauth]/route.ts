import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  callbacks: {
    async signIn({ user }) {
      try {
        // Kiểm tra user đã tồn tại chưa
        const existingUser = await prisma.users.findUnique({
          where: { email: user.email! },
        });

        // Nếu chưa có thì tạo mới
        if (!existingUser) {
          await prisma.users.create({
            data: {
              email: user.email!,
              // password null vì login bằng Google
              // role mặc định là "user"
            },
          });
        }

        return true; // ✅ cho phép đăng nhập
      } catch (error) {
        console.error("Lỗi lưu user vào DB:", error);
        return false; // ❌ chặn đăng nhập nếu lỗi
      }
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
});

export { handler as GET, handler as POST };