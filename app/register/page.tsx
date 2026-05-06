"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("");

    if (!email || !password || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(msg || "Đăng ký thất bại");
        return;
      }

      router.push("/register-success");
    } catch {
      setError("Lỗi server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#0f0f0f] to-[#1a1a1a]">
      <div className="w-[380px] bg-[#111] border border-white/10 p-6 rounded-2xl shadow-2xl">

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-orange-500 mb-1">
          Đăng ký
        </h2>
        <p className="text-xs text-center text-gray-400 mb-5">
          Tạo tài khoản để mua sắm dễ dàng hơn
        </p>

        {/* Email */}
        <input
          type="text"
          placeholder="Email"
          className="w-full p-3 rounded-lg bg-[#1c1c1c] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Mật khẩu"
          className="w-full mt-3 p-3 rounded-lg bg-[#1c1c1c] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Confirm */}
        <input
          type="password"
          placeholder="Nhập lại mật khẩu"
          className="w-full mt-3 p-3 rounded-lg bg-[#1c1c1c] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm mt-3 text-center">{error}</p>
        )}

        {/* Button */}
        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full mt-5 bg-orange-500 hover:bg-orange-600 text-black font-semibold p-3 rounded-lg transition-all duration-200 shadow-md"
        >
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-2 my-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-gray-400">hoặc</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Login */}
        <p
          onClick={() => router.push("/auth/login")}
          className="text-sm text-center text-gray-400 hover:text-orange-500 cursor-pointer transition"
        >
          Đã có tài khoản? <span className="text-orange-500 font-medium">Đăng nhập</span>
        </p>
      </div>
    </div>
  );
}