import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Admin routes: check cookie session
  if (pathname.startsWith("/admin")) {
    const session = req.cookies.get("session")?.value;

    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  }

  // ✅ API routes: check bearer token
  const token = req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token || token !== process.env.API_SECRET) {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/((?!auth|payment).*)", // bỏ qua /api/auth/* và /api/payment/*
    "/admin/:path*",
  ],
};