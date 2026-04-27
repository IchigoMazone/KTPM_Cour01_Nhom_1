// import React from "react";

// export default function Pickup() {
//   return (
//     <section
//       id="pickup"
//       className="min-h-screen flex items-center justify-center bg-gray-100"
//     >
//       Pickup
//     </section>
//   );
// }

"use client";

import React from "react";
import {
  Truck,
  Store,
  Clock3,
  MapPin,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";

/* DATA riêng trong cùng file */
const pickupData = {
  title: "Tùy chọn giao nhận",
  subtitle:
    "Linh hoạt theo nhu cầu của bạn: giao nhận tận nơi hoặc tự mang đồ đến cửa hàng.",

  options: [
    {
      icon: "delivery",
      title: "Giao nhận tận nơi",
      desc: "Nhân viên đến lấy và giao trả tận nhà đúng khung giờ đã hẹn.",
      features: [
        "Tiết kiệm thời gian",
        "Phù hợp người bận rộn",
        "Đúng giờ - tiện lợi",
      ],
    },
    {
      icon: "store",
      title: "Tự mang đến cửa hàng",
      desc: "Bạn có thể mang đồ trực tiếp đến cửa hàng để xử lý nhanh chóng.",
      features: ["Chủ động thời gian", "Tiếp nhận ngay", "Tư vấn trực tiếp"],
    },
  ],

  note: "Hỗ trợ nhiều khu vực nội thành Hà Nội và nhận lịch linh hoạt mỗi ngày.",
};

export default function Pickup() {
  const iconMap = {
    delivery: Truck,
    store: Store,
  };

  return (
    <section
      id="pickup"
      className="h-screen flex items-center bg-gradient-to-b from-slate-50 via-white to-blue-50"
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3">
            <GradientText>{pickupData.title}</GradientText>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            {pickupData.subtitle}
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {pickupData.options.map((item, index) => {
            const Icon = iconMap[item.icon];

            return (
              <div
                key={index}
                className="bg-white rounded-3xl border border-blue-100 shadow-xl p-8"
              >
                <div className="flex gap-2 mb-5 items-center">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center ">
                    <Icon className="w-6 h-6 text-sky-500" />
                  </div>

                  <GradientText className="text-2xl font-bold">
                    {item.title}
                  </GradientText>
                </div>

                <p className="text-slate-600 leading-relaxed mb-5">
                  {item.desc}
                </p>

                <div className="space-y-3">
                  {item.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                      <span className="text-slate-700 text-sm sm:text-base">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
