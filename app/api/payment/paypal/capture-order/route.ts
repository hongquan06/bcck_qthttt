import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

async function getAccessToken() {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const { orderID } = await req.json();

    // ── 1. Lấy user_id từ cookie "session" ──────────────────────────
    const token = req.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      role: string;
    };
    const userId = decoded.id;

    // ── 2. Capture order từ PayPal ───────────────────────────────────
    const accessToken = await getAccessToken();

    const res = await fetch(
      `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    // ── 3. Nếu PayPal COMPLETED → lưu vào database ──────────────────
    if (data.status === "COMPLETED") {
      const totalPrice =
        data.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value ?? "0";

      await prisma.orders.create({
        data: {
          user_id: userId,
          total_price: parseFloat(totalPrice),
          status: "paid",
        },
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Capture order error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}