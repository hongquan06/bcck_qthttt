import { NextRequest, NextResponse } from "next/server";
import { sortObject, formatDate } from "@/lib/vnpay";
import crypto from "crypto";

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

  // ✅ Ký trên dữ liệu KHÔNG encode
  const signData = Object.keys(sortedParams)
    .map((key) => `${key}=${sortedParams[key]}`)
    .join("&");

  const signature = crypto
    .createHmac("sha512", secretKey)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");

  // ✅ Build URL dùng URLSearchParams (tự handle encode đúng chuẩn)
  const urlParams = new URLSearchParams(sortedParams);
  urlParams.append("vnp_SecureHash", signature);

  const paymentUrl = `${vnpUrl}?${urlParams.toString()}`;

  console.log("SignData:", signData);
  console.log("Signature:", signature);
  console.log("PaymentUrl:", paymentUrl);

  return NextResponse.json({ paymentUrl });
}