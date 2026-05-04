"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PaymentResultContent() {
  const params = useSearchParams();
  const responseCode = params.get("vnp_ResponseCode");
  const amount = params.get("vnp_Amount");
  const txnRef = params.get("vnp_TxnRef");
  const bankCode = params.get("vnp_BankCode");

  const isSuccess = responseCode === "00";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className={`p-8 rounded-xl shadow-lg ${isSuccess ? "bg-green-50" : "bg-red-50"}`}>
        <h1 className={`text-2xl font-bold ${isSuccess ? "text-green-600" : "text-red-600"}`}>
          {isSuccess ? "✅ Thanh toán thành công!" : "❌ Thanh toán thất bại!"}
        </h1>
        <div className="mt-4 space-y-2 text-gray-600">
          <p>Mã đơn hàng: <strong>{txnRef}</strong></p>
          <p>Số tiền: <strong>{Number(amount) / 100} VNĐ</strong></p>
          <p>Ngân hàng: <strong>{bankCode}</strong></p>
          <p>Mã phản hồi: <strong>{responseCode}</strong></p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentResult() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Đang tải...</div>}>
      <PaymentResultContent />
    </Suspense>
  );
}