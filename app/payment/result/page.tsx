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
    <div className="flex min-h-screen items-center justify-center bg-brand-dark px-4">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-brand-dark-2 p-8 text-center">
        <div className="text-6xl mb-6">
          {isSuccess ? "✅" : "❌"}
        </div>

        <h1 className={`font-display text-2xl font-extrabold ${isSuccess ? "text-green-400" : "text-red-400"}`}>
          {isSuccess ? "Thanh toán thành công!" : "Thanh toán bị hủy"}
        </h1>

        <p className="mt-2 text-sm text-brand-muted">
          {isSuccess
            ? "Đơn hàng của bạn đã được xác nhận. Cảm ơn bạn đã mua sắm!"
            : "Giao dịch đã bị hủy hoặc có lỗi xảy ra."}
        </p>

        {orderID && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <p className="text-xs text-brand-muted">Mã đơn hàng</p>
            <code className="mt-1 block text-sm font-semibold text-white break-all">
              {orderID}
            </code>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3">
          {isSuccess ? (
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl bg-brand-orange px-6 py-3 text-sm font-bold text-black transition hover:opacity-90"
            >
              Về trang chủ
            </Link>
          ) : (
            <>
              <Link
                href="/cart"
                className="inline-flex items-center justify-center rounded-2xl bg-brand-orange px-6 py-3 text-sm font-bold text-black transition hover:opacity-90"
              >
                Quay lại giỏ hàng
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Về trang chủ
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-brand-dark text-white">
        Đang xử lý...
      </div>
    }>
      <PaymentResult />
    </Suspense>
  );
}