"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

function PaymentResult() {
  const params = useSearchParams();
  const status = params.get("status");
  const orderID = params.get("orderID");
  const isSuccess = status === "success";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">
          {isSuccess ? "✅" : "❌"}
        </div>
        <h1 className={`text-2xl font-bold mb-2 ${isSuccess ? "text-green-600" : "text-red-500"}`}>
          {isSuccess ? "Thanh toán thành công!" : "Thanh toán bị hủy"}
        </h1>
        {orderID && (
          <p className="text-gray-400 text-sm mb-6">
            Order ID: <code className="bg-gray-100 px-2 py-0.5 rounded">{orderID}</code>
          </p>
        )}
        <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Đang xử lý...</div>}>
      <PaymentResult />
    </Suspense>
  );
}