"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";
import { validateEmail, validatePassword, validateUsername } from "@/src/lib/validators/auth";
import { toast } from "sonner";

const images = [
  "/tải xuống (15).jfif",
  "/tải xuống (16).jfif",
  "/tải xuống (17).jfif",
];

export default function Page() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [prevImage, setPrevImage] = useState<number | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    password: "",
    email: "",
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setPrevImage(currentImage);
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [currentImage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrors({ username: "", password: "", email: "" });

    // Validate inputs locally
    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);
    const emailError = validateEmail(email);

    if (usernameError || passwordError || emailError) {
      setErrors({
        username: usernameError,
        password: passwordError,
        email: emailError,
      });
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Vui lòng nhập đầy đủ Họ và Tên.");
      return;
    }

    if (password !== confirm) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (!agreed) {
      toast.error("Bạn phải đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone: "",
          address: "",
        }),
      });

      const responseText = await response.text();
      let data: { success?: boolean; message?: string } = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        toast.error(data.message || "Máy chủ đang lỗi. Vui lòng thử lại.");
        return;
      }

      if (data.success) {
        toast.success(data.message || "Đăng ký thành công!");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        toast.error(data.message || "Đăng ký thất bại.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể kết nối đến máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: "url('/tải xuống (14).jfif')" }}
    >
      <div className="w-full min-w-[330px] h-[650px] sm:w-[480px] sm:h-[620px] lg:w-[1000px] lg:h-[640px] bg-white rounded-2xl shadow-2xl flex overflow-hidden">
        {/* ── TRÁI: Slider ── */}
        <div className="hidden lg:block lg:w-[52%] relative overflow-hidden rounded-l-2xl">
          {images.map((img, index) => {
            const isActive = index === currentImage;
            const isPrev = index === prevImage;
            return (
              <img
                key={index}
                src={img}
                alt="ảnh nền"
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  opacity: isActive ? 1 : 0,
                  transform: isActive
                    ? "scale(1.08)"
                    : isPrev
                      ? "scale(1.13)"
                      : "scale(1)",
                  transition: "opacity 1.4s ease, transform 11s ease",
                  zIndex: isActive ? 2 : isPrev ? 1 : 0,
                }}
              />
            );
          })}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-pink-200/10 z-10" />

          {/* Nội dung trái */}
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-10 text-white">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-pink-300 mb-3">
              ✦ Mùa xuân về rồi
            </p>
            <h1 className="text-4xl font-bold leading-tight mb-3">
              Vạn vật đâm chồi
              <br />
              nảy lộc mỗi ngày
            </h1>
            <p className="text-sm text-white/70 leading-relaxed mb-8 max-w-xs">
              Tạo tài khoản để bắt đầu hành trình của bạn — tươi mới như buổi
              sáng mùa xuân.
            </p>

            {/* Chấm chỉ báo */}
            <div className="flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setPrevImage(currentImage);
                    setCurrentImage(i);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === currentImage ? "w-8 bg-white" : "w-1.5 bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── PHẢI: Form đăng ký ── */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-4 bg-white overflow-y-auto">
          {/* Fields */}
          <div className="space-y-3 mb-4">
            {/* Họ & Tên */}
            <div className="flex gap-3">
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-medium text-gray-700 tracking-wide">
                  Họ
                </label>
                <input
                  type="text"
                  placeholder="Nguyễn"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300/50 focus:border-pink-300 transition-all"
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-medium text-gray-700 tracking-wide">
                  Tên
                </label>
                <input
                  type="text"
                  placeholder="Văn A"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300/50 focus:border-pink-300 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 tracking-wide">
                Email
              </label>
              <input
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300/50 focus:border-pink-300 transition-all"
              />
              {errors.email && (
                <p className="text-xs text-pink-500">{errors.email}</p>
              )}
            </div>

            {/* Tên đăng nhập */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 tracking-wide">
                Tên đăng nhập
              </label>
              <input
                type="text"
                placeholder="ichigomazone1"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300/50 focus:border-pink-300 transition-all"
              />
              {errors.username && (
                <p className="text-xs text-pink-500">{errors.username}</p>
              )}
            </div>

            {/* Mật khẩu */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 tracking-wide">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 px-3 pr-10 rounded-md border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300/50 focus:border-pink-300 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff size={16} strokeWidth={1.8} />
                  ) : (
                    <Eye size={16} strokeWidth={1.8} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-pink-500">{errors.password}</p>
              )}
            </div>

            {/* Xác nhận mật khẩu */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 tracking-wide">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full h-10 px-3 pr-10 rounded-md border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300/50 focus:border-pink-300 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirm ? (
                    <EyeOff size={16} strokeWidth={1.8} />
                  ) : (
                    <Eye size={16} strokeWidth={1.8} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Điều khoản */}
          <div className="flex items-start gap-2 cursor-pointer select-none group mb-5">
            <button
              type="button"
              onClick={() => setAgreed(!agreed)}
              className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border transition-all duration-200 shrink-0 ${
                agreed
                  ? "bg-pink-400 border-pink-400"
                  : "bg-white border-gray-300 group-hover:border-pink-300"
              }`}
            >
              {agreed && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path
                    d="M1 4L3.5 6.5L9 1"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
            <span className="text-xs text-gray-600 leading-relaxed">
              Tôi đồng ý với{" "}
              <Link
                href="/dieu-khoan"
                className="text-pink-500 hover:text-orange-500 transition-colors"
              >
                Điều khoản dịch vụ
              </Link>{" "}
              và{" "}
              <Link
                href="/bao-mat"
                className="text-pink-500 hover:text-orange-500 transition-colors"
              >
                Chính sách bảo mật
              </Link>
            </span>
          </div>

          {/* Nút đăng ký */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full h-10 rounded-md bg-gradient-to-r from-pink-400 to-orange-400 hover:from-pink-500 hover:to-orange-500 text-white text-sm font-semibold tracking-wide transition-all mb-4 ${
              isLoading ? "opacity-70 cursor-not-allowed" : "active:scale-[0.98]"
            }`}
          >
            {isLoading ? "Đang xử lý..." : "Đăng ký ngay"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">hoặc</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Nút Google */}
          <button type="button" className="w-full h-10 rounded-md border border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.98] text-sm font-medium text-gray-700 flex items-center justify-center gap-2.5 transition-all mb-6">
            <img src="/google.png" alt="Google" className="w-[18px] h-[18px]" />
            Tiếp tục với Google
          </button>

          {/* Đăng nhập */}
          <p className="text-center text-sm text-gray-500">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="text-pink-500 font-medium hover:text-orange-500 transition-colors"
            >
              Đăng nhập
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
