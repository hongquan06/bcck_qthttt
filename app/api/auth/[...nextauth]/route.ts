import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

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

        const user = await prisma.users.findUnique({
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
        let dbUser = await prisma.users.findUnique({
          where: { email: user.email! },
        });

        if (!dbUser) {
          dbUser = await prisma.users.create({
            data: {
              email: user.email!,
              role: "user",
            },
          });
        }

        user.id = dbUser.id.toString();
        user.role = dbUser.role ?? "user";
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