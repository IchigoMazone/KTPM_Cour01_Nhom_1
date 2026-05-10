<<<<<<< HEAD
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
=======
"use client";

import React from "react";
import { Clock, Droplets, Wind, Shirt, Sparkles } from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";

export default function Workflow() {
  const services = [
    {
      icon: Shirt,
      name: "Giặt thường",
      time: "24 giờ",
      description: "Phù hợp đồng everyday, đồ cotton, vải thường",
      badge: "Phổ biến",
      badgeColor: "green",
      faq: "Giặt thường có an toàn cho đồ không?",
      faqAnswer:
        "Có, chúng tôi sử dụng bột giặt chuyên dụng, phù hợp với mọi loại vải cotton và vải thường.",
    },
    {
      icon: Wind,
      name: "Giặt khô",
      time: "48 giờ",
      description: "Cho đồ mỏng, vest, áo sơ mi cần giữ form",
      badge: null,
      badgeColor: null,
      faq: "Giặt khô khác gì giặt nước?",
      faqAnswer:
        "Giặt khô dùng dung môi đặc biệt, không dùng nước nên không co vải, giữ form tốt hơn.",
    },
    {
      icon: Droplets,
      name: "Giặt hấp",
      time: "36 giờ",
      description: "Đồ cần làm sạch sâu, khử trùng, khử mùi",
      badge: "VIP",
      badgeColor: "amber",
      faq: "Giặt hấp có tốt hơn giặt thường không?",
      faqAnswer:
        "Giặt hấp dùng hơi nước nóng, khử khuẩn tốt hơn, phù hợp đồ cần vệ sinh sâu.",
    },
    {
      icon: Sparkles,
      name: "Đồ da",
      time: "72 giờ",
      description: "Giày, túi da, áo da - cần xử lý đặc biệt",
      badge: "Cẩn thận",
      badgeColor: "purple",
      faq: "Đồ da có bảo hành không?",
      faqAnswer:
        "Có, chúng tôi cam kết xử lý cẩn thận. Nếu có vấn đề, hoàn tiền 100%.",
    },
  ];
>>>>>>> dev

  return (
    <section
      id="workflow"
<<<<<<< HEAD
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
=======
      className="min-h-screen flex items-center justify-center bg-white"
    >
      <div className="w-full max-w-6xl mx-auto px-6 pt-20 pb-20">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            <GradientText>Thời Gian Hoàn Thành</GradientText>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Tùy theo loại dịch vụ, thời gian hoàn thành từ 24h đến 72h
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((service, i) => (
            <div
              key={i}
              className="group p-6 bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-xl transition-all duration-300 relative"
            >
              {service.badge && (
                <span
                  className={`absolute -top-3 left-4 px-3 py-1 text-xs font-medium rounded-full ${
                    service.badgeColor === "green"
                      ? "bg-green-100 text-green-600"
                      : service.badgeColor === "amber"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-purple-100 text-purple-600"
                  }`}
                >
                  {service.badge}
                </span>
              )}

              <div className="flex items-center gap-4 mb-4 mt-2">
                <div className="p-4 bg-blue-100 rounded-2xl flex-shrink-0">
                  <service.icon
                    className="w-8 h-8 text-blue-600"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xl font-bold text-gray-900 mb-1">
                    {service.name}
                  </h4>
                  <div className="flex items-center gap-2 text-blue-600 font-semibold">
                    <Clock className="w-4 h-4" />
                    {service.time}
                  </div>
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-4">
                {service.description}
              </p>

              {/* FAQ tích hợp */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  {service.faq}
                </p>
                <p className="text-sm text-gray-500">{service.faqAnswer}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Lưu ý về thời gian
          </h3>
          <ul className="space-y-3 text-gray-700 text-sm pl-1">
            <li className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>
                Thời gian tính từ khi tiệm nhận được đồ (không tính ngày nhận)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>Đơn gấp có thể hoàn thành sớm hơn với phí thêm 30%</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>Ngày lễ, Tết thời gian có thể kéo dài thêm 12-24h</span>
            </li>
          </ul>
>>>>>>> dev
        </div>
      </div>
    </section>
  );
}
