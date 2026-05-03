import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const auth = req.headers.get("authorization");

  if (!auth) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/((?!auth/).*)",  // protect /api/* nhưng bỏ qua /api/auth/*
    "/admin/:path*",
  ],
};