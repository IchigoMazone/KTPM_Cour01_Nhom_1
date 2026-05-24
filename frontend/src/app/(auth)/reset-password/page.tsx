"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { SpokeSpinner } from "@/src/components/ui/spoke-spinner";
import { GradientText } from "@/src/components/ui/gradient-text";
import { validatePassword } from "@/src/lib/validators/auth";
import { toast } from "sonner";
import { API_BASE_URL } from "@/src/lib/config";

const images = [
  "/download (5).jfif",
  "/download (6).jfif",
  "/download (7).jfif",
];

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const [currentImage, setCurrentImage] = useState(0);
  const [prevImage, setPrevImage] = useState<number | null>(null);
  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    token: "",
    password: "",
  });

  useEffect(() => {
    // Tự động đồng bộ token từ url nếu có thay đổi
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  useEffect(() => {
    const timer = setInterval(() => {
      setPrevImage(currentImage);
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [currentImage]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ token: "", password: "" });

    if (!token.trim()) {
      setErrors((prev) => ({ ...prev, token: "Vui lòng nhập token xác thực." }));
      return;
    }

    const passError = validatePassword(newPassword);
    if (passError) {
      setErrors((prev) => ({ ...prev, password: passError }));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token.trim(),
          password: newPassword,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(data.message || "Đặt lại mật khẩu thành công!");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        toast.error(data.message || "Đổi mật khẩu thất bại. Mã xác thực không hợp lệ hoặc đã hết hạn.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể kết nối đến máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordMismatch = newPassword && confirmPassword && newPassword !== confirmPassword;

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: "url('/download (8).jfif')" }}
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
              Dù trời có lạnh đến đâu, một khởi đầu mới luôn mang theo hơi ấm của hy vọng.
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
                    i === currentImage ? "w-8 bg-cyan-300" : "w-1.5 bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── PHẢI: Form reset mật khẩu ── */}
        <form onSubmit={handleReset} className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-6 bg-slate-50 overflow-y-auto">
          {/* Tiêu đề */}
          <div className="mb-6">
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
          <div className="space-y-3 mb-5">
            {/* Token xác thực (chỉ hiện nếu không có trong URL) */}
            {!tokenFromUrl && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600 tracking-wide">
                  Mã token xác thực
                </label>
                <input
                  type="text"
                  placeholder="Dán mã reset token của bạn vào đây"
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value);
                    setErrors((prev) => ({ ...prev, token: "" }));
                  }}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition-all"
                />
                {errors.token && (
                  <p className="text-xs text-red-500">{errors.token}</p>
                )}
              </div>
            )}

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
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  className="w-full h-10 px-3 pr-10 rounded-md border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showNew ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
              )}
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
                  className="w-full h-10 px-3 pr-10 rounded-md border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirm ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
                </button>
              </div>
              {passwordMismatch && (
                <p className="text-xs text-red-400">Mật khẩu xác nhận không khớp.</p>
              )}
            </div>
          </div>

          {/* Nút xác nhận */}
          <button
            type="submit"
            disabled={isLoading || passwordMismatch || !newPassword || !confirmPassword}
            className="w-full h-10 rounded-md bg-cyan-700 hover:bg-cyan-800 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] text-white text-sm font-semibold tracking-wide transition-all mb-4"
          >
            {isLoading ? (
              <SpokeSpinner />
            ) : (
              "Xác nhận đổi mật khẩu"
            )}
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
        </form>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 rounded-full border-4 border-slate-300 border-t-cyan-700 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Đang tải...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
