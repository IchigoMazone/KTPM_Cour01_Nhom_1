<<<<<<< HEAD
// import React from "react";

// export default function Bundles() {
//   return (
//     <section
//       id="bundles"
//       className="min-h-screen flex items-center justify-center bg-gray-100"
//     >
//       Bundles
//     </section>
//   );
// }

"use client";

import React from "react";
import { Shirt, Home, Crown, CheckCircle2 } from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";

const bundlesData = {
  title: "Combo tiết kiệm",
  subtitle:
    "Chọn gói phù hợp để tối ưu chi phí giặt là cho cá nhân, gia đình và nhu cầu cao cấp.",

  bundles: [
    {
      icon: Shirt,
      name: "Combo Cá Nhân",
      price: "199.000đ",
      desc: "Phù hợp sinh viên, người đi làm.",
      features: ["5kg giặt sấy", "Gấp đồ miễn phí", "Hoàn thành trong ngày"],
      highlight: false,
    },
    {
      icon: Home,
      name: "Combo Gia Đình",
      price: "399.000đ",
      desc: "Lựa chọn tiết kiệm nhất.",
      features: ["12kg giặt sấy", "Miễn phí giao nhận", "Ưu tiên xử lý nhanh"],
      highlight: true,
    },
    {
      icon: Crown,
      name: "Combo Premium",
      price: "699.000đ",
      desc: "Dành cho nhu cầu cao cấp.",
      features: ["20kg giặt cao cấp", "Giặt hấp + đồ da", "Chăm sóc ưu tiên"],
      highlight: false,
    },
  ],
=======
"use client";

import React, { useState } from "react";
import { Package, Check } from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";

const bundles = [
  {
    name: "Gói Cơ Bản",
    price: 99000,
    originalPrice: 120000,
    services: ["Giặt thường 3kg", "Sấy khô", "Giao trong 48h"],
    popular: false,
    color: "blue",
  },
  {
    name: "Gói Tiết Kiệm",
    price: 189000,
    originalPrice: 250000,
    services: ["Giặt thường 5kg", "Sấy khô", "Ủi cơ bản", "Giao trong 24h"],
    popular: true,
    color: "purple",
  },
  {
    name: "Gói Premium",
    price: 349000,
    originalPrice: 450000,
    services: [
      "Giặt 10kg",
      "Sấy cao cấp",
      "Ủi chuyên nghiệp",
      "Giặt hấp 2 món",
      "Giao hỏa tốc 4h",
    ],
    popular: false,
    color: "amber",
  },
];

const colorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-100", text: "text-blue-600" },
  purple: { bg: "bg-purple-100", text: "text-purple-600" },
  amber: { bg: "bg-amber-100", text: "text-amber-600" },
>>>>>>> dev
};

export default function Bundles() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <section
      id="bundles"
<<<<<<< HEAD
      className="min-h-screen overflow-hidden px-4 bg-gradient-to-b from-slate-50 via-white to-blue-50 scroll-mt-24 flex items-center"
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-20">
          <GradientText className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3">
            {bundlesData.title}
          </GradientText>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
            {bundlesData.subtitle}
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {bundlesData.bundles.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className={`rounded-3xl border p-6 shadow-xl bg-white relative ${
                  item.highlight
                    ? "border-blue-500 scale-105"
                    : "border-blue-100"
                }`}
              >
                {/* Badge */}
                {item.highlight && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-blue-600 text-white text-sm font-medium">
                    Phổ biến nhất
                  </div>
                )}

                <div className="flex h-[50px] mb-5 gap-2 items-center">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center ">
                    <Icon className="w-6 h-6 text-sky-500" />
                  </div>

                  <GradientText className="flex-1 text-2xl font-bold text-slate-900">
                    {item.name}
                  </GradientText>
                </div>

                <p className="text-slate-500 text-sm mb-4">{item.desc}</p>

                <div className="text-4xl font-bold text-blue-600 mb-6">
                  {item.price}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {item.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                      <span className="text-slate-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Button */}
                <button
                  className={`w-full py-3 rounded-2xl font-medium transition ${
                    item.highlight
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                  }`}
                >
                  Chọn gói
=======
      className="min-h-screen flex items-center justify-center bg-white"
    >
      <div className="w-full max-w-6xl mx-auto px-6 pt-20 pb-20">
        <div className="text-center mb-12 pt-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            <GradientText>Combo Tiết Kiệm</GradientText>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Chọn gói dịch vụ phù hợp, tiết kiệm đến 30%
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bundles.map((bundle, index) => {
            const colors = colorMap[bundle.color];
            return (
              <div
                key={bundle.name}
                className={`flex flex-col h-full p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl ${
                  bundle.popular
                    ? "border-purple-300 bg-purple-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="flex-1">
                  {bundle.popular && (
                    <div className="inline-block mb-3 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      PHỔ BIẾN NHẤT
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`p-4 ${colors.bg} rounded-2xl flex-shrink-0`}
                    >
                      <Package
                        className={`w-8 h-8 ${colors.text}`}
                        strokeWidth={1.5}
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {bundle.name}
                      </h3>
                      <p
                        className={`text-2xl font-bold ${bundle.popular ? "text-purple-600" : "text-gray-900"}`}
                      >
                        {bundle.price.toLocaleString()}đ
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-gray-400 line-through">
                      {bundle.originalPrice.toLocaleString()}đ
                    </span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs font-medium rounded-full">
                      -
                      {Math.round(
                        (1 - bundle.price / bundle.originalPrice) * 100,
                      )}
                      %
                    </span>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {bundle.services.map((service) => (
                      <li
                        key={service}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <span
                          className={`w-5 h-5 ${colors.bg} rounded-full flex items-center justify-center flex-shrink-0`}
                        >
                          <Check className={`w-3 h-3 ${colors.text}`} />
                        </span>
                        {service}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => setSelected(selected === index ? null : index)}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    selected === index
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-purple-600 hover:text-white"
                  }`}
                >
                  {selected === index ? "Đã chọn" : "Chọn gói này"}
>>>>>>> dev
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
