"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentPage() {
  const router = useRouter();
  const [totalUSD, setTotalUSD] = useState<string | null>(null);
  const [loading, setLoading] = useState(true)

  // ✅ Lấy tổng tiền từ giỏ hàng
  useEffect(() => {
    fetch("/api/carts")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data || data.total == null) {
          router.push("/cart")
          return
        }

        // Chuyển VND sang USD (tỉ giá tạm tính 1 USD = 25,000 VND)
        const usd = (data.total / 25000).toFixed(2)
        setTotalUSD(usd)
      })
      .catch(() => router.push("/cart"))
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-dark text-white">
        <p>Đang tải thông tin thanh toán...</p>
      </div>
    )
  }

  if (!totalUSD) return null

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-brand-dark px-4 text-white">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-brand-dark-2 p-8">
        <h1 className="font-display text-2xl font-bold">Thanh toán PayPal</h1>
        <p className="mt-2 text-sm text-brand-muted">
          Số tiền cần thanh toán
        </p>
        <div className="mt-4 rounded-2xl border border-brand-orange/20 bg-brand-orange/10 px-5 py-4">
          <span className="text-2xl font-bold text-brand-orange">
            ${totalUSD} USD
          </span>
        </div>

        <div className="mt-6">
          <PayPalScriptProvider
            options={{
              clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
              currency: "USD",
            }}
          >
            <PayPalButtons
              style={{ layout: "vertical", color: "gold", shape: "rect" }}
              createOrder={async () => {
                const res = await fetch("/api/payment/paypal/create-order", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ amount: totalUSD }),
                });
                const order = await res.json();
                return order.orderID;
              }}
              onApprove={async (data) => {
                const res = await fetch("/api/payment/paypal/capture-order", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ orderID: data.orderID }),
                });
                const details = await res.json();
                if (details.status === "COMPLETED") {
                  router.push(`/payment/result?status=success&orderID=${data.orderID}`);
                } else {
                  router.push("/payment/result?status=cancel");
                }
              }}
              onCancel={() => router.push("/payment/result?status=cancel")}
              onError={(err) => {
                console.error("PayPal error:", err);
                router.push("/payment/result?status=cancel");
              }}
            />
          </PayPalScriptProvider>
        </div>
      </div>
    </div>
  );
}