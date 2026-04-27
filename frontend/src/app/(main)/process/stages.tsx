// import React from "react";

// export default function Stages() {
//   return (
//     <section
//       id="stages"
//       className="min-h-screen flex items-center justify-center bg-gray-100"
//     >
//       Stages
//     </section>
//   );
// }

"use client";

import React from "react";
import {
  Clock3,
  CalendarCheck2,
  PackageCheck,
  WashingMachine,
  Truck,
  Sparkles,
} from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";

/* DATA riêng trong cùng file */
const stagesData = {
  title: "Thời gian từng giai đoạn",
  subtitle:
    "Ước tính thời gian xử lý cho mỗi bước để khách hàng dễ dàng theo dõi tiến độ đơn hàng.",

  steps: [
    {
      icon: "booking",
      title: "Đặt lịch xác nhận",
      time: "5 - 10 phút",
      desc: "Tiếp nhận thông tin và xác nhận lịch hẹn nhanh chóng.",
    },
    {
      icon: "pickup",
      title: "Nhận đồ tận nơi",
      time: "30 - 60 phút",
      desc: "Nhân viên đến lấy đồ tùy khu vực và thời điểm đặt lịch.",
    },
    {
      icon: "washing",
      title: "Giặt & xử lý",
      time: "6 - 24 giờ",
      desc: "Tùy loại dịch vụ: giặt thường, giặt khô, hấp hoặc đồ da.",
    },
    {
      icon: "delivery",
      title: "Giao trả hoàn tất",
      time: "30 - 60 phút",
      desc: "Đóng gói cẩn thận và giao đúng hẹn cho khách hàng.",
    },
  ],
};

export default function Stages() {
  const iconMap = {
    booking: CalendarCheck2,
    pickup: PackageCheck,
    washing: WashingMachine,
    delivery: Truck,
  };

  return (
    <section
      id="stages"
      className="h-screen px-4 bg-gradient-to-b from-white via-slate-50 to-blue-50 flex items-center"
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3">
            <GradientText>{stagesData.title}</GradientText>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            {stagesData.subtitle}
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stagesData.steps.map((item, index) => {
            const Icon = iconMap[item.icon];

            return (
              <div
                key={index}
                className="bg-white rounded-3xl border border-blue-100 shadow-xl p-6 text-center"
              >
                <div className="flex h-[50px] gap-2 mb-5 items-start">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center ">
                    <Icon className="w-6 h-6 text-sky-500" />
                  </div>

                  <GradientText className="flex-1 text-2xl font-bold">
                    {item.title}
                  </GradientText>
                </div>

                <div className="text-2xl font-bold text-blue-600 mb-3">
                  {item.time}
                </div>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
