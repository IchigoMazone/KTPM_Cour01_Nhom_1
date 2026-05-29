"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GradientText } from "@/src/components/ui/gradient-text";
import {
  ForgotPasswordField,
  validateForgotPasswordForm,
} from "@/src/lib/validators/auth";

const images = [
  "/download (1).jfif",
  "/download (2).jfif",
  "/download (3).jfif",
];

const emptyTouched = {
  account: false,
  email: false,
};

function ValidationMessage({ message }: { message: string }) {
  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-out ${
        message ? "mt-0.5 max-h-5 opacity-100" : "mt-0 max-h-0 opacity-0"
      }`}
      aria-live="polite"
    >
      <p className="text-[11px] leading-4 text-orange-600">{message}</p>
    </div>
  );
}

export default function Page() {
  const [currentImage, setCurrentImage] = useState(0);
  const [prevImage, setPrevImage] = useState<number | null>(null);
  const [account, setAccount] = useState("");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(emptyTouched);
  const [activeErrorField, setActiveErrorField] =
    useState<ForgotPasswordField | null>(null);

  const formErrors = validateForgotPasswordForm({ account, email });
  const isFormValid = !formErrors.account && !formErrors.email;
  const activeError =
    activeErrorField && touched[activeErrorField]
      ? formErrors[activeErrorField]
      : "";

  const updateField = (field: ForgotPasswordField, value: string) => {
    if (field === "account") {
      setAccount(value);
    } else {
      setEmail(value);
    }
    setActiveErrorField(field);
  };

  const markFieldTouched = (field: ForgotPasswordField) => {
    setTouched((currentTouched) => ({
      ...currentTouched,
      [field]: true,
    }));
    setActiveErrorField(formErrors[field] ? field : null);
  };

  const handleSubmit = () => {
    setTouched({
      account: true,
      email: true,
    });
    setActiveErrorField(
      formErrors.account ? "account" : formErrors.email ? "email" : null,
    );

    if (!isFormValid) return;

    console.log("Call API FORGOT PASSWORD");
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
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-10 bg-stone-50">
          {/* Tiêu đề */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">
              <GradientText from="#c2410c" to="#b45309">
                Quên mật khẩu
              </GradientText>
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Nhập tài khoản và mã kích hoạt để xác minh
            </p>
          </div>

          {/* Fields */}
          <div className="space-y-4 mb-6">
            {/* Tài khoản */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-600 tracking-wide">
                Tài khoản
              </label>
              <input
                type="text"
                placeholder="ichigomazone"
                value={account}
                aria-invalid={
                  activeErrorField === "account" && Boolean(activeError)
                }
                aria-describedby="account-error"
                onChange={(e) => updateField("account", e.target.value)}
                onFocus={() => setActiveErrorField("account")}
                onBlur={() => markFieldTouched("account")}
                className="w-full h-10 px-3 rounded-md border border-stone-200 bg-white text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all"
              />
              <div id="account-error">
                <ValidationMessage
                  message={activeErrorField === "account" ? activeError : ""}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-600 tracking-wide">
                Email
              </label>
              <input
                type="email"
                placeholder="example@gmail.com"
                value={email}
                aria-invalid={
                  activeErrorField === "email" && Boolean(activeError)
                }
                aria-describedby="email-error"
                onChange={(e) => updateField("email", e.target.value)}
                onFocus={() => setActiveErrorField("email")}
                onBlur={() => markFieldTouched("email")}
                className="w-full h-10 px-3 rounded-md border border-stone-200 bg-white text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all"
              />
              <div id="email-error">
                <ValidationMessage
                  message={activeErrorField === "email" ? activeError : ""}
                />
              </div>
            </div>
          </div>

          {/* Nút xác nhận */}
          <button
            disabled={!isFormValid}
            onClick={handleSubmit}
            className="w-full h-10 rounded-md bg-orange-700 hover:bg-orange-800 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] text-white text-sm font-semibold tracking-wide transition-all mb-4"
          >
            Xác nhận
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
        </div>
      </div>
    </div>
  );
}
