import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
    // ✅ Dùng getServerSession thay vì jwt.verify
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const { orderID } = await req.json();

    if (!orderID) {
      return NextResponse.json({ error: "Missing orderID" }, { status: 400 });
    }

    // ✅ Capture order từ PayPal
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

    // ✅ Nếu PayPal COMPLETED → lưu order vào database + xóa cart
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

      // ✅ Xóa giỏ hàng sau khi thanh toán thành công
      const cart = await prisma.carts.findFirst({
        where: { user_id: userId },
      });

      if (cart) {
        await prisma.cart_items.deleteMany({
          where: { cart_id: cart.id },
        });
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Capture order error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}