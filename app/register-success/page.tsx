"use client";

import { useRouter } from "next/navigation";

export default function RegisterSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow text-center w-[400px]">

        <h1 className="text-2xl font-bold text-green-500">
          Đăng ký thành công 🎉
        </h1>

        <p className="text-gray-600 mt-2">
          Bạn có thể đăng nhập ngay bây giờ
        </p>

        <button
          onClick={() => router.push("/auth/login")}
          className="mt-6 w-full bg-orange-500 text-white p-3 rounded hover:bg-orange-600"
        >
          Quay lại đăng nhập
        </button>

      </div>
    </div>
  );
}