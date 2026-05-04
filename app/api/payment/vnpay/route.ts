// Cài trước: npm install vnpay
// Xóa file lib/vnpay.ts đi, không cần nữa

import { NextRequest, NextResponse } from "next/server";
import { VNPay, ProductCode, VnpLocale, ignoreLogger, HashAlgorithm } from "vnpay";

const vnpay = new VNPay({
  tmnCode: process.env.VNPAY_TMN_CODE!,
  secureSecret: process.env.VNPAY_HASH_SECRET!,
  vnpayHost: "https://sandbox.vnpayment.vn",
  testMode: true,
  hashAlgorithm: HashAlgorithm.SHA512,
  enableLog: false,
  loggerFn: ignoreLogger,
});

export async function POST(req: NextRequest) {
  const { amount, orderInfo } = await req.json();

  const returnUrl = process.env.VNPAY_RETURN_URL!.trim();

  const paymentUrl = vnpay.buildPaymentUrl({
    vnp_Amount: amount,           // Thư viện tự nhân 100, KHÔNG truyền amount * 100
    vnp_IpAddr: "127.0.0.1",
    vnp_ReturnUrl: returnUrl,
    vnp_TxnRef: Date.now().toString(),
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: ProductCode.Other,
    vnp_Locale: VnpLocale.VN,
  });

  return NextResponse.json({ paymentUrl });
}