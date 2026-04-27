// import React from "react";

// export default function Reach() {
//   return (
//     <section
//       id="reach"
//       className="min-h-screen flex items-center justify-center bg-gray-100"
//     >
//       Reach
//     </section>
//   );
// }

"use client";

import React from "react";
import {
  PhoneCall,
  MessageCircleMore,
  Headset,
  Clock3,
  MapPin,
  ArrowUpRight,
} from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";

const reachData = {
  title: "Liên hệ với chúng tôi",
  subtitle:
    "Đặt lịch nhanh, hỏi giá tức thì hoặc nhận hỗ trợ trực tiếp chỉ với một chạm.",

  phone: "0987 654 321",
  zalo: "BeGauShop Official",
  time: "08:00 - 22:00 mỗi ngày",
  area: "Phục vụ nội thành Hà Nội",
};

export default function Reach() {
  return (
    <section
      id="reach"
      className="h-screen px-4 bg-gradient-to-b from-slate-50 via-white to-blue-50 flex items-center"
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-20">
          <GradientText className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3">
            {reachData.title}
          </GradientText>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
            {reachData.subtitle}
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-2 gap-7 items-stretch">
          {/* Left Big Card */}
          <div className="bg-white rounded-[32px] shadow-2xl border border-blue-100 p-8">
            <div className="flex items-center gap-4 h-[50px] mb-5">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center ">
                <PhoneCall className="w-7 h-7 text-white" />
              </div>

              <GradientText className="text-3xl font-bold text-slate-500">
                Hotline hỗ trợ
              </GradientText>
            </div>

            <h2 className="text-4xl font-bold text-slate-600 mb-4">
              {reachData.phone}
            </h2>

            <p className="text-slate-600 leading-relaxed mb-16">
              Gọi ngay để được báo giá nhanh, đặt lịch lấy đồ tận nơi hoặc hỗ
              trợ khẩn cấp.
            </p>

            <button className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
              Gọi ngay
            </button>
          </div>

          {/* Right Cards */}
          <div className="space-y-5">
            {/* Zalo */}
            <div className="bg-white rounded-3xl border border-blue-100 shadow-xl p-6 flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <MessageCircleMore className="w-6 h-6 text-sky-500" />
              </div>

              <div className="flex-1">
                <GradientText className="text-base font-semibold text-slate-500 mb-1">Zalo</GradientText>
                <h3 className="text-xl font-bold text-slate-600">
                  {reachData.zalo}
                </h3>
              </div>

              <ArrowUpRight className="w-5 h-5 text-slate-400" />
            </div>

            {/* Time */}
            <div className="bg-white rounded-3xl border border-blue-100 shadow-xl p-6 flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Clock3 className="w-6 h-6 text-sky-500" />
              </div>

              <div>
                <GradientText className="text-base font-semibold text-slate-500 mb-1">Giờ hoạt động</GradientText>
                <h3 className="text-xl font-bold text-slate-600">
                  {reachData.time}
                </h3>
              </div>
            </div>

            {/* Area */}
            <div className="bg-white rounded-3xl border border-blue-100 shadow-xl p-6 flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-sky-500" />
              </div>

              <div>
                <GradientText className="text-base font-semibold text-slate-500 mb-1">Khu vực phục vụ</GradientText>
                <h3 className="text-xl font-bold text-slate-600">
                  {reachData.area}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
