"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GradientText } from "@/src/components/ui/gradient-text";
import { validateEmail } from "@/src/lib/validators/auth";
import { toast } from "sonner";
import { SpokeSpinner } from "@/src/components/ui/spoke-spinner";
import { API_BASE_URL } from "@/src/lib/config";

const images = [
  "/download (1).jfif",
  "/download (2).jfif",
  "/download (3).jfif",
];

export default function Page() {
  const router = useRouter();
  const [currentImage, setCurrentImage] = useState(0);
  const [prevImage, setPrevImage] = useState<number | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setPrevImage(currentImage);
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [currentImage]);

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError("");
    setEmailError("");

    if (!username.trim()) {
      setUsernameError("Tên đăng nhập không được để trống.");
      return;
    }

    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success("Mã xác thực đổi mật khẩu đã được tạo!");
        setTimeout(() => {
          router.push(`/reset-password?token=${data.reset_token}`);
        }, 1500);
      } else {
        toast.error(data.message || "Email không tồn tại trong hệ thống.");
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
      style={{ backgroundImage: "url('/download.jfif')" }}
    >
      <div className="w-full min-w-[330px] h-[540px] sm:w-[480px] sm:h-[620px] lg:w-[1000px] lg:h-[670px] bg-white rounded-2xl shadow-2xl flex overflow-hidden">
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

          {/* Overlay — tông nâu đỏ mùa thu */}
          <div className="absolute inset-0 bg-gradient-to-t from-orange-950/70 via-amber-900/25 to-red-900/20 z-10" />

          {/* Nội dung trái */}
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-10 text-white">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-orange-300 mb-3">
              Thu về rồi đó
            </p>
            <h1 className="text-4xl font-bold leading-tight mb-3">
              Lá vàng rơi nhẹ
              <br />
              lòng thêm bình yên
            </h1>
            <p className="text-sm text-orange-100/70 leading-relaxed mb-8 max-w-xs">
              Mùa thu mang theo hơi thở dịu dàng — hãy để mỗi ngày trôi qua thật chậm và ý nghĩa.
            </p>

            {/* Chấm chỉ báo */}
            <div className="flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
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

        {/* ── PHẢI: Form quên mật khẩu ── */}
        <form onSubmit={handleForgot} className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-10 bg-stone-50">
          {/* Tiêu đề */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">
              <GradientText from="#c2410c" to="#b45309">
                Quên mật khẩu
              </GradientText>
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Nhập email đăng ký tài khoản của bạn để khôi phục mật khẩu
            </p>
          </div>

          {/* Fields */}
          <div className="space-y-4 mb-6">
            {/* Tên đăng nhập */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-600 tracking-wide">
                Tên đăng nhập
              </label>
              <input
                type="text"
                placeholder="Nhập tên đăng nhập của bạn"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameError("");
                }}
                className="w-full h-10 px-3 rounded-md border border-stone-200 bg-white text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all"
              />
              {usernameError && (
                <p className="text-xs text-orange-600">{usernameError}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-600 tracking-wide">
                Email đăng ký
              </label>
              <input
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                className="w-full h-10 px-3 rounded-md border border-stone-200 bg-white text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all"
              />
              {emailError && (
                <p className="text-xs text-orange-600">{emailError}</p>
              )}
            </div>
          </div>

          {/* Nút xác nhận */}
          <button
            type="submit"
            disabled={isLoading || !email || !username}
            className={`w-full h-10 rounded-md bg-orange-700 hover:bg-orange-800 ${
              isLoading || !email || !username ? "opacity-70 cursor-not-allowed" : "active:scale-[0.98] cursor-pointer"
            } text-white text-sm font-semibold tracking-wide transition-all mb-4`}
          >
            {isLoading ? (
              <SpokeSpinner />
            ) : (
              "Xác nhận gửi yêu cầu"
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-xs text-stone-400">hoặc</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          {/* Quay lại đăng nhập */}
          <Link
            href="/login"
            className="w-full h-10 rounded-md border border-stone-200 bg-white hover:bg-stone-50 active:scale-[0.98] text-sm font-medium text-stone-600 flex items-center justify-center transition-all mb-6"
          >
            Quay lại đăng nhập
          </Link>

          {/* Đăng ký */}
          <p className="text-center text-sm text-stone-500">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="text-orange-700 font-medium hover:text-orange-800 transition-colors"
            >
              Tạo tài khoản
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
