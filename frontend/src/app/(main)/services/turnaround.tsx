// import React from "react";

// export default function Turnaround() {
//   return (
//     <section
//       id="turnaround"
//       className="min-h-screen flex items-center justify-center bg-gray-100"
//     >
//       Turnaround
//     </section>
//   );
// }

"use client";

import React from "react";
import { Shirt, Wind, Droplets, Briefcase } from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";

/* DATA riêng trong cùng file */
const turnaroundData = {
  title: "Thời gian hoàn thành",
  subtitle:
    "Cam kết xử lý nhanh chóng và đúng hẹn cho từng loại dịch vụ, giúp bạn tiết kiệm thời gian tối đa.",

  items: [
    {
      icon: "normal",
      service: "Giặt thường",
      time: "6 - 12 giờ",
      desc: "Xử lý nhanh cho quần áo mặc hằng ngày.",
    },
    {
      icon: "dry",
      service: "Giặt khô",
      time: "24 giờ",
      desc: "Dành cho vest, váy và đồ cao cấp.",
    },
    {
      icon: "steam",
      service: "Giặt hấp",
      time: "12 - 24 giờ",
      desc: "Khử mùi, làm mới và giữ phom trang phục.",
    },
    {
      icon: "leather",
      service: "Đồ da",
      time: "2 - 3 ngày",
      desc: "Làm sạch, dưỡng và phục hồi bề mặt da.",
    },
  ],
};

export default function Turnaround() {
  const iconMap = {
    normal: Shirt,
    dry: Wind,
    steam: Droplets,
    leather: Briefcase,
  };

  return (
    <section id="turnaround" className="h-screen flex items-center ">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl md:text-4xl font-bold mb-3">
            <GradientText className="">{turnaroundData.title}</GradientText>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            {turnaroundData.subtitle}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {turnaroundData.items.map((item, index) => {
            const Icon = iconMap[item.icon];

            return (
              <div
                key={index}
                className="bg-white rounded-3xl border border-blue-100 shadow-xl p-6 text-center"
              >
                <div className="flex h-[50px] gap-4 item-center mb-5">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center ">
                    <Icon className="w-6 h-6 text-sky-500" />
                  </div>

                  <GradientText className="text-2xl font-bold text-slate-100">
                    {item.service}
                  </GradientText>
                </div>

                <div className="text-3xl font-bold mb-3">{item.time}</div>

                <p className="text-sm leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
