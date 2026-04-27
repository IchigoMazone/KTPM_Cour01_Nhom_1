// import React from "react";

// export default function Hours() {
//   return (
//     <section
//       id="hours"
//       className="min-h-screen flex items-center justify-center bg-gray-100"
//     >
//       Hours
//     </section>
//   );
// }

"use client";

import React from "react";
import { Clock3, Sun, Moon, Sparkles, CheckCircle2 } from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";

const hoursData = {
  title: "Giờ hoạt động",
  subtitle:
    "Luôn sẵn sàng phục vụ mỗi ngày với khung giờ linh hoạt để thuận tiện cho khách hàng.",

  mainHours: "08:00 - 22:00",
  support: "Hỗ trợ đặt lịch online 24/7",

  schedule: [
    {
      label: "Thứ 2 - Thứ 6",
      time: "08:00 - 22:00",
      icon: Sun,
    },
    {
      label: "Thứ 7 - Chủ nhật",
      time: "08:00 - 23:00",
      icon: Sparkles,
    },
    {
      label: "Lễ / Tết",
      time: "Theo thông báo",
      icon: Moon,
    },
  ],
};

export default function Hours() {
  return (
    <section
      id="hours"
      className="h-screen px-4 bg-gradient-to-b from-slate-50 via-white to-blue-50 flex items-center"
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-20">
          <GradientText className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3">
            {hoursData.title}
          </GradientText>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
            {hoursData.subtitle}
          </p>
        </div>

        {/* Main */}
        <div className="grid lg:grid-cols-2 gap-7 items-stretch">
          {/* Left Main Card */}
          <div className="bg-white rounded-[32px] shadow-2xl border border-blue-100 p-8">
            <div className="flex h-[50px] mb-5 gap-4 items-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center">
                <Clock3 className="w-6 h-6 text-white" />
              </div>

              <GradientText className="text-2xl font-bold text-slate-500">Khung giờ chính</GradientText>
            </div>

            <h2 className="text-5xl font-bold text-slate-600 mb-8">
              {hoursData.mainHours}
            </h2>

            <p className="text-slate-600 leading-relaxed mb-8">
              Tiếp nhận giặt là, giao nhận tận nơi và hỗ trợ khách hàng xuyên
              suốt trong giờ hoạt động.
            </p>

            <div className="rounded-2xl bg-blue-50 border border-blue-100 px-5 py-4">
              <p className="text-blue-700 font-medium">{hoursData.support}</p>
            </div>
          </div>

          {/* Right Schedule */}
          <div className="space-y-5">
            {hoursData.schedule.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={index}
                  className="bg-white rounded-3xl border border-blue-100 shadow-xl p-6 flex items-center gap-5"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-sky-500" />
                  </div>

                  <div className="flex-1">
                    <GradientText className="text-sm font-semibold text-slate-500 mb-1">{item.label}</GradientText>

                    <h3 className="text-xl font-bold text-slate-500">
                      {item.time}
                    </h3>
                  </div>

                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
