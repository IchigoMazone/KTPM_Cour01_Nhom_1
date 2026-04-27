// import React from "react";

// export default function Referrals() {
//   return (
//     <section
//       id="referrals"
//       className="min-h-screen flex items-center justify-center bg-gray-100"
//     >
//       Referrals
//     </section>
//   );
// }

"use client";

import React from "react";
import {
  Users,
  Gift,
  Crown,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Grab,
} from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";

const referralData = {
  title: "Ưu đãi khách hàng thân thiết",
  subtitle:
    "Nhận quà hấp dẫn khi quay lại sử dụng dịch vụ hoặc giới thiệu bạn bè đến BeGauShop.",

  cards: [
    {
      icon: Crown,
      title: "Khách hàng thân thiết",
      reward: "Giảm đến 20%",
      desc: "Tích lũy đơn hàng để nâng hạng thành viên và nhận ưu đãi định kỳ.",
      color: "blue",
      features: ["Ưu đãi sinh nhật", "Ưu tiên xử lý đơn", "Voucher hàng tháng"],
    },
    {
      icon: Users,
      title: "Giới thiệu bạn bè",
      reward: "Nhận 50.000đ",
      desc: "Mỗi người bạn đăng ký và hoàn tất đơn đầu tiên, bạn nhận thưởng.",
      color: "cyan",
      features: [
        "Không giới hạn lượt mời",
        "Bạn bè cũng có ưu đãi",
        "Nhận thưởng tự động",
      ],
    },
  ],
};

export default function Referrals() {
  return (
    <section
      id="referrals"
      className="h-screen overflow-hidden px-4 bg-gradient-to-b from-slate-50 via-white to-blue-50 scroll-mt-24 flex items-center"
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-20">
          <GradientText className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3">
            {referralData.title}
          </GradientText>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
            {referralData.subtitle}
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-7">
          {referralData.cards.map((item, index) => {
            const Icon = item.icon;

            const theme =
              item.color === "cyan"
                ? {
                    bg: "from-cyan-500 to-blue-500",
                    light: "bg-cyan-50",
                    text: "text-cyan-600",
                    border: "border-cyan-100",
                  }
                : {
                    bg: "from-blue-600 to-indigo-500",
                    light: "bg-blue-50",
                    text: "text-blue-600",
                    border: "border-blue-100",
                  };

            return (
              <div
                key={index}
                className={`bg-white rounded-3xl border ${theme.border} shadow-xl overflow-hidden`}
              >
                {/* Top */}
                <div className={`bg-gradient-to-r ${theme.bg} p-6 text-white`}>
                  <div className="flex gap-4 mb-4 items-center">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center ">
                      <Icon className="w-6 h-6" />
                    </div>

                    <h2 className="text-3xl font-bold">{item.title}</h2>
                  </div>

                  <p className="text-white/90 text-sm mb-4">{item.desc}</p>

                  <div className="text-4xl font-bold">{item.reward}</div>
                </div>

                {/* Bottom */}
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    {item.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle2
                          className={`w-5 h-5 shrink-0 ${theme.text}`}
                        />
                        <span className="text-slate-700 text-sm">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    className={`w-full rounded-2xl py-3 font-medium flex items-center justify-center gap-2 ${theme.light} ${theme.text} hover:opacity-90 transition`}
                  >
                    Tham gia ngay
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
