import { NextRequest, NextResponse } from "next/server";
import { sortObject, createVnpaySignature, formatDate } from "@/lib/vnpay";

export async function POST(req: NextRequest) {
  const { amount, orderInfo } = await req.json();

  const tmnCode   = process.env.VNPAY_TMN_CODE!;
  const secretKey = process.env.VNPAY_HASH_SECRET!;
  const vnpUrl    = process.env.VNPAY_URL!;
  const returnUrl = process.env.VNPAY_RETURN_URL!.trim(); // trim phòng trailing space

  const createDate = formatDate(new Date());
  const txnRef     = Date.now().toString();

  const params = {
    vnp_Version:    "2.1.0",
    vnp_Command:    "pay",
    vnp_TmnCode:    tmnCode,
    vnp_Amount:     amount * 100,
    vnp_CreateDate: createDate,
    vnp_CurrCode:   "VND",
    vnp_IpAddr:     "127.0.0.1",
    vnp_Locale:     "vn",
    vnp_OrderInfo:  orderInfo,
    vnp_OrderType:  "other",
    vnp_ReturnUrl:  returnUrl,
    vnp_TxnRef:     txnRef,
  };

  // Bước 1: sort, giữ raw value → dùng để tạo chữ ký
  const sortedParams = sortObject(params);
  const signature = createVnpaySignature(sortedParams, secretKey);

  // Bước 2: encode value khi build URL (tách biệt với bước hash)
  const queryString = Object.keys(sortedParams)
    .map((key) => `${key}=${encodeURIComponent(sortedParams[key]).replace(/%20/g, "+")}`)
    .join("&");

  const paymentUrl = `${vnpUrl}?${queryString}&vnp_SecureHash=${signature}`;

  return NextResponse.json({ paymentUrl });
}