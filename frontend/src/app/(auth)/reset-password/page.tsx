"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";

const images = [
  "/download (5).jfif",
  "/download (6).jfif",
  "/download (7).jfif",
];

export default function Page() {
  const [currentImage, setCurrentImage] = useState(0);
  const [prevImage, setPrevImage] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;

  useEffect(() => {
    const timer = setInterval(() => {
      setPrevImage(currentImage);
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [currentImage]);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: "url('/download (8).jfif')" }}
    >
      <div className="w-full min-w-[330px] h-[540px] sm:w-[480px] sm:h-[620px] lg:w-[1000px] lg:h-[640px] bg-white rounded-2xl shadow-2xl flex overflow-hidden">
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

          {/* Overlay — tông xanh băng mùa đông */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-blue-900/30 to-cyan-900/20 z-10" />

          {/* Nội dung trái */}
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-10 text-white">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-cyan-300 mb-3">
              Đông giá lạnh
            </p>
            <h1 className="text-4xl font-bold leading-tight mb-3">
              Tuyết phủ trắng trời
              <br />
              lòng vẫn ấm áp
            </h1>
            <p className="text-sm text-cyan-100/70 leading-relaxed mb-8 max-w-xs">
              Dù trời có lạnh đến đâu, một khởi đầu mới luôn mang theo hơi ấm
              của hy vọng.
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
                    i === currentImage
                      ? "w-8 bg-cyan-300"
                      : "w-1.5 bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── PHẢI: Form reset mật khẩu ── */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-10 bg-slate-50">
          {/* Tiêu đề */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">
              <GradientText from="#0e7490" to="#1d4ed8">
                Đặt lại mật khẩu
              </GradientText>
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Nhập mật khẩu mới cho tài khoản của bạn
            </p>
          </div>

          {/* Fields */}
          <div className="space-y-4 mb-6">
            {/* Mật khẩu mới */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 tracking-wide">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-10 px-3 pr-10 rounded-md border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showNew ? (
                    <EyeOff size={16} strokeWidth={1.8} />
                  ) : (
                    <Eye size={16} strokeWidth={1.8} />
                  )}
                </button>
              </div>
            </div>

            {/* Xác nhận mật khẩu */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 tracking-wide">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full h-10 px-3 pr-10 rounded-md border bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    passwordMismatch
                      ? "border-red-300 focus:ring-red-300/50 focus:border-red-400"
                      : "border-slate-200 focus:ring-cyan-400/50 focus:border-cyan-400"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirm ? (
                    <EyeOff size={16} strokeWidth={1.8} />
                  ) : (
                    <Eye size={16} strokeWidth={1.8} />
                  )}
                </button>
              </div>
              {passwordMismatch && (
                <p className="text-xs text-red-400">
                  Mật khẩu xác nhận không khớp.
                </p>
              )}
            </div>
          </div>

          {/* Nút xác nhận */}
          <button
            disabled={passwordMismatch || !newPassword || !confirmPassword}
            className="w-full h-10 rounded-md bg-cyan-700 hover:bg-cyan-800 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] text-white text-sm font-semibold tracking-wide transition-all mb-4"
          >
            Xác nhận đổi mật khẩu
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">hoặc</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Quay lại */}
          <Link
            href="/login"
            className="w-full h-10 rounded-md border border-slate-200 bg-white hover:bg-slate-50 active:scale-[0.98] text-sm font-medium text-slate-600 flex items-center justify-center transition-all mb-6"
          >
            Quay lại đăng nhập
          </Link>

          <p className="text-center text-sm text-slate-500">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="text-cyan-700 font-medium hover:text-cyan-800 transition-colors"
            >
              Tạo tài khoản
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}