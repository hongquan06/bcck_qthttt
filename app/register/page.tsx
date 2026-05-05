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
      const text = await res.text();
      setError(text || "Đăng ký thất bại");
      setLoading(false);
      return;
    }

    router.push("/login");
  } catch (err) {
    setError("Lỗi server");
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-[400px] bg-white p-6 rounded-xl shadow">

        <h2 className="text-2xl font-bold text-center text-orange-500">
          Đăng ký
        </h2>

        {/* Email */}
        <input
          type="text"
          placeholder="Email"
          className="w-full mt-4 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Mật khẩu"
          className="w-full mt-3 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Confirm password */}
        <input
          type="password"
          placeholder="Nhập lại mật khẩu"
          className="w-full mt-3 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}

        {/* Button */}
        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full mt-4 bg-orange-500 text-white p-3 rounded font-semibold hover:bg-orange-600"
        >
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>

        {/* Back to login */}
        <p
          onClick={() => router.push("/login")}
          className="text-sm text-center mt-4 text-blue-500 cursor-pointer"
        >
          Đã có tài khoản? Đăng nhập
        </p>
      </div>
    </div>
  );
}