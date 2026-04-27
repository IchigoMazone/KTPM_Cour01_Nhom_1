// import React from "react";

// export default function Coupons() {
//   return (
//     <section
//       id="coupons"
//       className="min-h-screen flex items-center justify-center bg-gray-100"
//     >
//       Coupons
//     </section>
//   );
// }

"use client";
import { GradientText } from "@/src/components/ui/gradient-text";
import React from "react";
import { Gift, Coins, Star, Trophy, ChevronRight } from "lucide-react";

const couponsData = {
  title: "Tích điểm đổi quà",
  subtitle:
    "Mỗi đơn hàng đều được cộng điểm để đổi ưu đãi hấp dẫn dành riêng cho khách hàng thân thiết.",

  earn: "50.000đ = 1 điểm",

  rewards: [
    {
      icon: Gift,
      points: "50 điểm",
      reward: "Voucher 30.000đ",
    },
    {
      icon: Star,
      points: "100 điểm",
      reward: "Miễn phí giao nhận",
    },
    {
      icon: Trophy,
      points: "200 điểm",
      reward: "Voucher 100.000đ",
    },
  ],
};

export default function Coupons() {
  return (
    <section
      id="coupons"
      className="h-screen overflow-hidden px-4 bg-gradient-to-b from-slate-50 via-white to-blue-50 scroll-mt-24 flex items-center"
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="mb-20 text-center">
          <GradientText className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3">
            {couponsData.title}
          </GradientText>

          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            {couponsData.subtitle}
          </p>
        </div>

        {/* Layout */}
        <div className="grid lg:grid-cols-2 gap-8 items-strecth">
          {/* Left Main Card */}
          <div className="bg-white rounded-[32px] border border-blue-100 shadow-2xl p-8">
            <div className="flex h-[50px] mb-10 gap-4 items-center">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center ">
                <Coins className="w-7 h-7 text-white" />
              </div>

              <GradientText className="text-3xl font-bold">
                Quy đổi điểm thưởng
              </GradientText>
            </div>

            <h2 className="text-4xl font-bold text-slate-600 mb-4">
              {couponsData.earn}
            </h2>

            <p className="text-slate-600 text-xl leading-relaxed mb-16">
              Tự động cộng điểm sau mỗi đơn hàng hoàn tất. Điểm tích lũy không
              giới hạn trong thời gian ưu đãi.
            </p>

            <button className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-medium flex items-center gap-2 hover:bg-blue-700 transition">
              Xem lịch sử điểm
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Right Reward List */}
          <div className="space-y-5">
            {couponsData.rewards.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={index}
                  className="bg-white rounded-3xl border border-blue-100 shadow-xl p-5 flex items-center gap-5"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-sky-500" />
                  </div>

                  <div className="flex-1">
                    <GradientText className="text-sm text-slate-500 mb-1">
                      Mốc đổi quà
                    </GradientText>

                    <h3 className="text-xl font-bold text-slate-600">
                      {item.points}
                    </h3>

                    <p className="text-slate-600 text-sm">{item.reward}</p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
