import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const prismaClient = new PrismaClient();

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

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

        const user = await prismaClient.users.findUnique({
          where: { email: credentials.email },
        });

        if (!user) throw new Error("User not found");
        if (!user.password) throw new Error("Tài khoản này đăng nhập bằng Google");

        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isMatch) throw new Error("Sai mật khẩu");

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
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        let dbUser = await prismaClient.users.findUnique({
          where: { email: user.email! },
        });

        if (!dbUser) {
          dbUser = await prismaClient.users.create({
            data: {
              email: user.email!,
              role: "user",
            },
          });
        }

        user.id = dbUser.id.toString();
        user.role = dbUser.role ?? "user";
      }

      // ✅ Merge cart guest vào cart user sau khi đăng nhập
      try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get("session_id")?.value;
        const userId = Number(user.id);

        if (sessionId && userId) {
          const guestCart = await prisma.carts.findFirst({
            where: { session_id: sessionId },
            include: { cart_items: true },
          });

          if (guestCart && guestCart.cart_items.length > 0) {
            let userCart = await prisma.carts.findFirst({
              where: { user_id: userId },
            });

            if (!userCart) {
              // Chuyển cart guest thành cart user
              userCart = await prisma.carts.update({
                where: { id: guestCart.id },
                data: { user_id: userId, session_id: null },
              });
            } else {
              // Merge từng item từ guest cart vào user cart
              for (const item of guestCart.cart_items) {
                const existing = await prisma.cart_items.findFirst({
                  where: {
                    cart_id: userCart.id,
                    product_id: item.product_id,
                  },
                });

                if (existing) {
                  await prisma.cart_items.update({
                    where: { id: existing.id },
                    data: { quantity: (existing.quantity ?? 0) + (item.quantity ?? 0) },
                  });
                } else {
                  await prisma.cart_items.create({
                    data: {
                      cart_id: userCart.id,
                      product_id: item.product_id,
                      quantity: item.quantity,
                    },
                  });
                }
              }

              // Xóa guest cart sau khi merge
              await prisma.cart_items.deleteMany({
                where: { cart_id: guestCart.id },
              });
              await prisma.carts.delete({
                where: { id: guestCart.id },
              });
            }
          }
        }
      } catch {
        // Không block đăng nhập nếu merge lỗi
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };