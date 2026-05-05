"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
            email: email,
            password: password,
            redirect: false,
          });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      // login thành công
      window.location.href = "/";
    } catch (err) {
      setError("Lỗi server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-[400px] bg-white p-6 rounded-xl shadow">

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-orange-500">
          Đăng nhập
        </h2>

        {/* Email */}
        <input
          type="text"
          placeholder="Email hoặc số điện thoại"
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

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}

        {/* Login button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full mt-4 bg-orange-500 text-white p-3 rounded font-semibold hover:bg-orange-600"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-1 h-[1px] bg-gray-300"></div>
          <span className="mx-2 text-sm text-gray-500">Hoặc</span>
          <div className="flex-1 h-[1px] bg-gray-300"></div>
        </div>

        {/* Google login */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-2 border p-3 rounded hover:bg-gray-50"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 h-5"
          />
          Đăng nhập bằng Google
        </button>

        {/* Extra */}
        <div className="flex justify-between text-sm mt-4">
          <span className="text-blue-500 cursor-pointer">
            Quên mật khẩu?
          </span>
          <span className="text-blue-500 cursor-pointer">
            Đăng ký
          </span>
        </div>
      </div>
    </div>
  );
}