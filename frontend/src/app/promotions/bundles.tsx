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
};

export default function Bundles() {
  return (
    <section
      id="bundles"
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
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
