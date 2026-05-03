"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div>
      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        style={{
          padding: "10px 20px",
          backgroundColor: "#4285F4",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        🔵 Đăng nhập bằng Google
      </button>
    </div>
  );
}