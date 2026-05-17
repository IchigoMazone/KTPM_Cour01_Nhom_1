"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { GradientText } from "@/src/components/ui/gradient-text";
import {
  LoginField,
  validateLoginField,
  validateLoginForm,
} from "@/src/lib/validators/auth";

const images = ["/summer (1).jfif", "/summer (2).jfif", "/summer (3).jfif"];

const emptyTouched = {
  email: false,
  password: false,
};

function ValidationMessage({ message }: { message: string }) {
  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-out ${
        message ? "mt-0.5 max-h-5 opacity-100" : "mt-0 max-h-0 opacity-0"
      }`}
      aria-live="polite"
    >
      <p className="text-[11px] leading-4 text-[#f59e0b]">{message}</p>
    </div>
  );
}

export default function Page() {
  const [showPassword, setShowPassword] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [prevImage, setPrevImage] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [touched, setTouched] = useState(emptyTouched);
  const [activeErrorField, setActiveErrorField] = useState<LoginField | null>(
    null,
  );

  const loginErrors = validateLoginForm({ email, password });
  const isFormValid = !loginErrors.email && !loginErrors.password;
  const activeError =
    activeErrorField && touched[activeErrorField]
      ? loginErrors[activeErrorField]
      : "";

  const updateField = (field: LoginField, value: string) => {
    if (field === "email") {
      setEmail(value);
    } else {
      setPassword(value);
    }

    setActiveErrorField(field);
  };

  const markFieldTouched = (field: LoginField, value: string) => {
    setTouched((currentTouched) => ({
      ...currentTouched,
      [field]: true,
    }));
    setActiveErrorField(validateLoginField(field, value) ? field : null);
  };

  /*
    Call API Login tai day
  */

  const handleLogin = () => {
    const nextErrors = validateLoginForm({ email, password });

    setTouched({
      email: true,
      password: true,
    });
    setActiveErrorField(
      nextErrors.email ? "email" : nextErrors.password ? "password" : null,
    );

    if (nextErrors.email || nextErrors.password) {
      toast.error("Đăng nhập chưa hợp lệ", {
        description: nextErrors.email || nextErrors.password,
      });
      return;
    }

    console.log("Call API LOGIN");
    toast.success("Đăng nhập thành công", {
      description: rememberMe
        ? "Tài khoản sẽ được ghi nhớ trên thiết bị này."
        : "Đang chuyển bạn vào hệ thống.",
    });
  };

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
      style={{ backgroundImage: "url('/summer (4).jfif')" }}
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

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10 z-10" />

          {/* Nội dung trái */}
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-10 text-white">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-amber-300 mb-3">
              Mùa hạ trở lại
            </p>
            <h1 className="text-4xl font-bold leading-tight mb-3">
              Mùa hạ ghé ngang
              <br />
              mang theo bình yên
            </h1>

            <p className="text-sm text-white/70 leading-relaxed mb-8 max-w-xs">
              Hãy bắt đầu ngày mới bằng những điều tươi sáng và đầy cảm hứng.
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

        {/* ── PHẢI: Form đăng nhập ── */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-10 bg-white">
          {/* Tiêu đề */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              <GradientText from="#f59e0b" to="#f97316">
                Đăng nhập
              </GradientText>
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Nhập thông tin tài khoản của bạn
            </p>
          </div>

          {/* Fields */}
          <div className="space-y-3 mb-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 tracking-wide">
                Email
              </label>
              <input
                type="email"
                placeholder="example@gmail.com"
                value={email}
                aria-invalid={activeErrorField === "email" && Boolean(activeError)}
                aria-describedby="email-error"
                onChange={(e) => {
                  updateField("email", e.target.value);
                }}
                onFocus={() => setActiveErrorField("email")}
                onBlur={(e) => markFieldTouched("email", e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
              />
              <div id="email-error">
                <ValidationMessage
                  message={activeErrorField === "email" ? activeError : ""}
                />
              </div>
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
                  aria-invalid={
                    activeErrorField === "password" && Boolean(activeError)
                  }
                  aria-describedby="password-error"
                  onChange={(e) => {
                    updateField("password", e.target.value);
                  }}
                  onFocus={() => setActiveErrorField("password")}
                  onBlur={(e) => markFieldTouched("password", e.target.value)}
                  className="w-full h-10 px-3 pr-10 rounded-md border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff size={16} strokeWidth={1.8} />
                  ) : (
                    <Eye size={16} strokeWidth={1.8} />
                  )}
                </button>
              </div>
              <div id="password-error">
                <ValidationMessage
                  message={activeErrorField === "password" ? activeError : ""}
                />
              </div>
            </div>
          </div>

          {/* Ghi nhớ & Quên mật khẩu */}
          <div className="flex items-center justify-between mb-5">
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <div
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-4 h-4 rounded flex items-center justify-center border transition-all duration-200 ${
                  rememberMe
                    ? "bg-amber-500 border-amber-500"
                    : "bg-white border-gray-300 group-hover:border-amber-400"
                }`}
              >
                {rememberMe && (
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
              </div>
              <span className="text-xs text-gray-600">Ghi nhớ tài khoản</span>
            </label>

            <Link
              href="/forgot-password"
              className="text-xs text-amber-600 hover:text-amber-700 transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* Nút đăng nhập */}
          <button
            type="button"
            className={`w-full h-10 rounded-md bg-amber-500 hover:bg-amber-600 ${isFormValid ? "active:scale-[0.98]" : "opacity-70"} cursor-pointer text-white text-sm font-semibold tracking-wide transition-all mb-4`}
            onClick={handleLogin}
          >
            Đăng nhập
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">hoặc</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Nút Google */}
          <button
            type="button"
            className="w-full h-10 rounded-md border border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.98] text-sm font-medium text-gray-700 flex items-center justify-center gap-2.5 transition-all mb-6"
            onClick={() => {
              toast.info("Đăng nhập Google", {
                description: "Chức năng đăng nhập Google sẽ được kết nối với API sau.",
              });
            }}
          >
            <img src="/google.png" alt="Google" className="w-[18px] h-[18px]" />
            Tiếp tục với Google
          </button>

          {/* Đăng ký */}
          <p className="text-center text-sm text-gray-500">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="text-amber-600 font-medium hover:text-amber-700 transition-colors"
            >
              Tạo tài khoản
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
