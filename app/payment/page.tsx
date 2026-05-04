"use client";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useRouter } from "next/navigation";

export default function PaymentPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">Thanh toán PayPal</h1>
      <p className="text-gray-500">Số tiền: $2.00 USD</p>

      <div className="w-full max-w-sm">
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
                body: JSON.stringify({ amount: "2.00" }),
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
              }
            }}
            onCancel={() => {
              router.push("/payment/result?status=cancel");
            }}
            onError={(err) => {
              console.error("PayPal error:", err);
              router.push("/payment/result?status=cancel");
            }}
          />
        </PayPalScriptProvider>
      </div>
    </div>
  );
}