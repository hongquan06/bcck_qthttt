import { NextRequest, NextResponse } from "next/server";
import { sortObject, createVnpaySignature, formatDate } from "@/lib/vnpay";

export async function POST(req: NextRequest) {
  const { amount, orderInfo } = await req.json();

  const tmnCode   = process.env.VNPAY_TMN_CODE!;
  const secretKey = process.env.VNPAY_HASH_SECRET!;
  const vnpUrl    = process.env.VNPAY_URL!;
  const returnUrl = process.env.VNPAY_RETURN_URL!;

  const now        = new Date();
  const createDate = formatDate(now);
  const txnRef     = Date.now().toString();

  const params: Record<string, string> = {
    vnp_Version:    "2.1.0",
    vnp_Command:    "pay",
    vnp_TmnCode:    tmnCode,
    vnp_Amount:     (amount * 100).toString(),
    vnp_CreateDate: createDate,
    vnp_CurrCode:   "VND",
    vnp_IpAddr:     "127.0.0.1",
    vnp_Locale:     "vn",
    vnp_OrderInfo:  orderInfo,
    vnp_OrderType:  "other",
    vnp_ReturnUrl:  returnUrl,
    vnp_TxnRef:     txnRef,
  };

  const sortedParams = sortObject(params);

  // ✅ Ký trên giá trị gốc KHÔNG encode
  const signature = createVnpaySignature(sortedParams, secretKey);

  // ✅ Encode khi tạo URL
  const queryString = Object.keys(sortedParams)
    .map((key) => `${key}=${encodeURIComponent(sortedParams[key])}`)
    .join("&");

  const paymentUrl = `${vnpUrl}?${queryString}&vnp_SecureHash=${signature}`;

  console.log("=== VNPAY DEBUG ===");
  console.log("TmnCode:", tmnCode);
  console.log("SecretKey:", secretKey ? "OK" : "MISSING");
  console.log("CreateDate:", createDate);
  console.log("PaymentUrl:", paymentUrl);
  console.log("===================");

  return NextResponse.json({ paymentUrl });
}