import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    // 🔵 Google login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // 🔐 Email + Password login
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Thiếu email hoặc mật khẩu");
        }

        const user = await prisma.users.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("User not found");
        }

        // user đăng ký bằng Google sẽ không có password
        if (!user.password) {
          throw new Error("Tài khoản này đăng nhập bằng Google");
        }

        const isMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isMatch) {
          throw new Error("Sai mật khẩu");
        }

        return {
          id: user.id.toString(),
          email: user.email,
          role: user.role ?? "user",
        };
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },

  callbacks: {
    // 👉 chạy khi login thành công (Google)
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existingUser = await prisma.users.findUnique({
          where: { email: user.email! },
        });

        if (!existingUser) {
          await prisma.users.create({
            data: {
              email: user.email!,
              role: "user",
            },
          });
        }
      }

      return true;
    },

    // 👉 lưu thêm data vào token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    // 👉 trả về session cho FE
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };