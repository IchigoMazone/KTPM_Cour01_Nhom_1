// import React from "react";

// export default function Workflow() {
//   return (
//     <section
//       id="workflow"
//       className="min-h-screen flex items-center justify-center bg-gray-100"
//     >
//       Workflow
//     </section>
//   );
// }

"use client";

import React from "react";
import {
  CalendarCheck2,
  PackageCheck,
  WashingMachine,
  Truck,
  Sparkles,
} from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";

/* DATA riêng trong cùng file */
const workflowData = {
  title: "Quy trình dịch vụ",
  subtitle:
    "Đơn giản, nhanh chóng và minh bạch từ lúc đặt lịch đến khi nhận lại quần áo sạch sẽ.",

  steps: [
    {
      icon: "booking",
      step: "01",
      title: "Đặt lịch",
      desc: "Khách hàng liên hệ hoặc đặt lịch online theo thời gian mong muốn.",
    },
    {
      icon: "pickup",
      step: "02",
      title: "Lấy đồ",
      desc: "Nhân viên đến tận nơi nhận đồ đúng hẹn, kiểm tra và xác nhận đơn.",
    },
    {
      icon: "washing",
      step: "03",
      title: "Giặt xử lý",
      desc: "Phân loại chất liệu, giặt sạch và chăm sóc đúng quy trình.",
    },
    {
      icon: "delivery",
      step: "04",
      title: "Giao trả",
      desc: "Đóng gói gọn gàng và giao lại tận nơi đúng thời gian cam kết.",
    },
  ],
};

export default function Workflow() {
  const iconMap = {
    booking: CalendarCheck2,
    pickup: PackageCheck,
    washing: WashingMachine,
    delivery: Truck,
  };

  return (
    <section
      id="workflow"
      className="h-screen flex items-center bg-gradient-to-b from-slate-50 via-white to-blue-50 "
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3">
            <GradientText>{workflowData.title}</GradientText>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            {workflowData.subtitle}
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowData.steps.map((item, index) => {
            const Icon = iconMap[item.icon];

            return (
              <div
                key={index}
                className="relative bg-white rounded-3xl border border-blue-100 shadow-xl p-6 text-center"
              >
                {/* Step Number */}
                <div className="absolute top-4 right-4 text-sm font-bold text-blue-200">
                  {item.step}
                </div>
                <div className="flex gap-4 mb-5 items-center">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center ">
                    <Icon className="w-6 h-6 text-sky-500" />
                  </div>

                  <GradientText className="text-2xl font-bold">
                    {item.title}
                  </GradientText>
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
