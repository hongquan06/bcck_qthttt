"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Sai email hoặc mật khẩu");
        return;
      }

      // ✅ Lấy session để kiểm tra role
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      if (session?.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch {
      setError("Lỗi server");
    } finally {
      setLoading(false);
    }
};
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f0f0",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Segoe UI', Arial, sans-serif",
      }}
    >
      {/* Header giống FPT Shop */}
      <header
        style={{
          background: "#003580",
          padding: "10px 0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          {/* Logo FPT Tech style */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
            }}
            onClick={() => router.push("/")}
          >
            <div
              style={{
                background: "#e53935",
                borderRadius: 4,
                padding: "3px 8px",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span
                style={{
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: 18,
                  letterSpacing: 1,
                }}
              >
                FPT
              </span>
            </div>
            <span
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: 0.5,
              }}
            >
              Shop
            </span>
          </div>

          {/* Search bar */}
          <div
            style={{
              flex: 1,
              maxWidth: 480,
              display: "flex",
              borderRadius: 4,
              overflow: "hidden",
              border: "2px solid #fff",
              background: "#fff",
            }}
          >
            <input
              placeholder="Bạn tìm gì hôm nay?"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                padding: "8px 12px",
                fontSize: 13,
                color: "#333",
              }}
            />
            <button
              style={{
                background: "#e53935",
                border: "none",
                padding: "0 14px",
                cursor: "pointer",
                color: "#fff",
                fontSize: 16,
              }}
            >
              🔍
            </button>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 20 }}>
            <div style={{ color: "#fff", fontSize: 12, textAlign: "center", cursor: "pointer" }}>
              <div style={{ fontSize: 20 }}>🛒</div>
              Giỏ hàng
            </div>
            <div style={{ color: "#fff", fontSize: 12, textAlign: "center", cursor: "pointer" }}>
              <div style={{ fontSize: 20 }}>👤</div>
              Tài khoản
            </div>
          </div>
        </div>

        {/* Sub nav */}
        <div
          style={{
            background: "#002a6e",
            marginTop: 8,
            padding: "6px 0",
          }}
        >
          <div
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              padding: "0 16px",
              display: "flex",
              gap: 24,
            }}
          >
            {["Điện thoại", "Laptop", "Máy tính bảng", "Phụ kiện", "Đồng hồ", "Gaming"].map(
              (item) => (
                <span
                  key={item}
                  style={{
                    color: "#cce0ff",
                    fontSize: 12,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item}
                </span>
              )
            )}
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div style={{ maxWidth: 1100, margin: "12px auto", padding: "0 16px", width: "100%" }}>
        <span style={{ fontSize: 12, color: "#666" }}>
          <span style={{ color: "#003580", cursor: "pointer" }}>Trang chủ</span>
          {" > "}
          <span style={{ color: "#333" }}>Đăng nhập</span>
        </span>
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "0 16px 40px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 24,
            maxWidth: 900,
            width: "100%",
            alignItems: "flex-start",
          }}
        >
          {/* Left promo panel */}
          <div
            style={{
              flex: 1,
              background: "linear-gradient(135deg, #003580 0%, #0055cc 60%, #1a6fd4 100%)",
              borderRadius: 8,
              padding: 32,
              color: "#fff",
              minHeight: 440,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 4px 18px rgba(0,53,128,0.18)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative circles */}
            <div
              style={{
                position: "absolute",
                top: -40,
                right: -40,
                width: 180,
                height: 180,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.07)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -30,
                left: -30,
                width: 140,
                height: 140,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.05)",
              }}
            />

            <div>
              <div
                style={{
                  background: "#e53935",
                  display: "inline-block",
                  borderRadius: 4,
                  padding: "3px 10px",
                  marginBottom: 16,
                }}
              >
                <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: 1 }}>FPT</span>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 10px", lineHeight: 1.3 }}>
                Chào mừng bạn đến với FPT Shop
              </h2>
              <p style={{ fontSize: 13, color: "#b3ccff", lineHeight: 1.6, margin: 0 }}>
                Mua sắm công nghệ chính hãng – Dễ dàng · Nhanh chóng · An toàn
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
              {[
                { icon: "✅", text: "Hàng chính hãng 100%" },
                { icon: "🚚", text: "Giao hàng trong 2 giờ" },
                { icon: "🔄", text: "Đổi trả trong 30 ngày" },
                { icon: "💳", text: "Trả góp 0% lãi suất" },
              ].map((item) => (
                <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, color: "#cce0ff" }}>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Product images row */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 28,
                justifyContent: "center",
              }}
            >
              {["📱", "💻", "⌚", "🎧"].map((emoji, i) => (
                <div
                  key={i}
                  style={{
                    width: 52,
                    height: 52,
                    background: "rgba(255,255,255,0.12)",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  {emoji}
                </div>
              ))}
            </div>
          </div>

          {/* Right login form */}
          <div
            style={{
              width: 360,
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 4px 18px rgba(0,0,0,0.10)",
              padding: 28,
              flexShrink: 0,
            }}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#003580",
                margin: "0 0 4px",
                textAlign: "center",
              }}
            >
              Đăng nhập
            </h2>
            <p
              style={{
                fontSize: 12,
                color: "#888",
                textAlign: "center",
                margin: "0 0 20px",
              }}
            >
              Chưa có tài khoản?{" "}
              <span
                onClick={() => router.push("/register")}
                style={{ color: "#e53935", fontWeight: 600, cursor: "pointer" }}
              >
                Đăng ký ngay
              </span>
            </p>

            {/* Email input */}
            <label style={{ fontSize: 12, color: "#555", fontWeight: 600, display: "block", marginBottom: 4 }}>
              Email hoặc số điện thoại
            </label>
            <input
              type="text"
              placeholder="Nhập email hoặc số điện thoại"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 12px",
                border: "1.5px solid #d0d8e8",
                borderRadius: 6,
                fontSize: 13,
                outline: "none",
                marginBottom: 14,
                color: "#333",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#003580")}
              onBlur={(e) => (e.target.style.borderColor = "#d0d8e8")}
            />

            {/* Password input */}
            <label style={{ fontSize: 12, color: "#555", fontWeight: 600, display: "block", marginBottom: 4 }}>
              Mật khẩu
            </label>
            <input
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 12px",
                border: "1.5px solid #d0d8e8",
                borderRadius: 6,
                fontSize: 13,
                outline: "none",
                marginBottom: 6,
                color: "#333",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#003580")}
              onBlur={(e) => (e.target.style.borderColor = "#d0d8e8")}
            />

            <div style={{ textAlign: "right", marginBottom: 14 }}>
              <span style={{ fontSize: 12, color: "#003580", cursor: "pointer", fontWeight: 500 }}>
                Quên mật khẩu?
              </span>
            </div>

            {error && (
              <div
                style={{
                  background: "#fff5f5",
                  border: "1px solid #ffcccc",
                  borderRadius: 6,
                  padding: "8px 12px",
                  marginBottom: 12,
                  fontSize: 13,
                  color: "#e53935",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* Login button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? "#f4a29f" : "#e53935",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "12px 0",
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: 0.5,
                transition: "background 0.2s",
                boxShadow: "0 2px 8px rgba(229,57,53,0.25)",
              }}
              onMouseEnter={(e) => { if (!loading) (e.target as HTMLButtonElement).style.background = "#c62828"; }}
              onMouseLeave={(e) => { if (!loading) (e.target as HTMLButtonElement).style.background = "#e53935"; }}
            >
              {loading ? "Đang đăng nhập..." : "ĐĂNG NHẬP"}
            </button>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                margin: "18px 0",
                gap: 10,
              }}
            >
              <div style={{ flex: 1, height: 1, background: "#e8e8e8" }} />
              <span style={{ fontSize: 11, color: "#aaa", whiteSpace: "nowrap" }}>Hoặc đăng nhập bằng</span>
              <div style={{ flex: 1, height: 1, background: "#e8e8e8" }} />
            </div>

            {/* Social buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => signIn("google", { callbackUrl: "/" })}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  border: "1.5px solid #e0e0e0",
                  borderRadius: 6,
                  padding: "9px 0",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#444",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#4285f4";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 6px rgba(66,133,244,0.12)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#e0e0e0";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                }}
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  style={{ width: 18, height: 18 }}
                  alt="Google"
                />
                Google
              </button>

              <button
                onClick={() => signIn("facebook", { callbackUrl: "/" })}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  border: "1.5px solid #e0e0e0",
                  borderRadius: 6,
                  padding: "9px 0",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#1877f2",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#1877f2";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 6px rgba(24,119,242,0.12)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#e0e0e0";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877f2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>

            {/* Trust badges */}
            <div
              style={{
                marginTop: 20,
                padding: "12px 0 0",
                borderTop: "1px solid #f0f0f0",
                display: "flex",
                justifyContent: "space-around",
              }}
            >
              {[
                { icon: "🔒", label: "Bảo mật SSL" },
                { icon: "✅", label: "Chính hãng" },
                { icon: "🛡️", label: "An toàn" },
              ].map((badge) => (
                <div key={badge.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18 }}>{badge.icon}</div>
                  <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>{badge.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: "#003580", color: "#cce0ff", padding: "14px 0", marginTop: "auto" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 16px",
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
          }}
        >
          <span>© 2024 FPT Shop. Tất cả quyền được bảo lưu.</span>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ cursor: "pointer" }}>Chính sách bảo mật</span>
            <span style={{ cursor: "pointer" }}>Điều khoản sử dụng</span>
            <span style={{ cursor: "pointer" }}>Hỗ trợ khách hàng</span>
          </div>
        </div>
      </footer>
    </div>
  );
}