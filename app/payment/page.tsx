"use client";
import { useState } from "react";

export default function PaymentPage() {
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    setLoading(true);
    const res = await fetch("/api/payment/vnpay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 50000,
        orderInfo: "Thanhtoandonhangtest",
      }),
    });

    const data = await res.json();

    if (data.paymentUrl) {
      window.location.href = data.paymentUrl;
    } else {
      alert("Tạo thanh toán thất bại");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">Thanh toán VNPAY</h1>
      <p className="text-gray-500">Số tiền: 50,000 VNĐ</p>
      <button
        onClick={handlePay}
        disabled={loading}
        className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
      >
        {loading ? "Đang xử lý..." : "Thanh toán với VNPAY"}
      </button>
    </div>
  );
}