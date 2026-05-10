<<<<<<< HEAD
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
=======
"use client";

import React from "react";
import { CheckCircle2, Package, Sparkles, Truck } from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";

export default function Stages() {
  const steps = [
    {
      icon: Package,
      title: "Đặt lịch",
      description:
        "Chọn ngày giờ, loại dịch vụ và địa chỉ lấy đồ qua website hoặc Zalo",
      time: "2 phút",
      color: "blue",
      faq: "Tôi có thể đặt lịch vào giờ nào?",
      faqAnswer:
        "Bạn có thể đặt lịch 24/7 qua website. Nhân viên sẽ liên hệ xác nhận trong 30 phút.",
    },
    {
      icon: Truck,
      title: "Lấy đồ",
      description:
        "Nhân viên đến tận nhà hoặc bạn mang đồ đến tiệm theo lịch đã đặt",
      time: "30 phút - 2 giờ",
      color: "green",
      faq: "Phí ship có bao gồm trong giá không?",
      faqAnswer: "Miễn phí ship trong bán kính 5km. Ngoài ra chỉ 10.000đ/km.",
    },
    {
      icon: Sparkles,
      title: "Giặt & Xử lý",
      description:
        "Đồ được phân loại, giặt theo đúng quy trình và tiêu chuẩn của từng loại",
      time: "Theo gói dịch vụ",
      color: "purple",
      faq: "Đồ của tôi có bị lẫn với đồ người khác không?",
      faqAnswer:
        "Không, mỗi đơn hàng được đóng túi riêng, có mã vạch theo dõi.",
    },
    {
      icon: CheckCircle2,
      title: "Giao trả",
      description: "Đồ sạch sẽ, gấp gọn được giao tận nơi hoặc nhận tại tiệm",
      time: "Theo gói dịch vụ",
      color: "amber",
      faq: "Tôi có thể yêu cầu giao lại đồ không?",
      faqAnswer:
        "Có, bạn có thể thay đổi lịch giao trong 24h qua Zalo hoặc hotline.",
    },
  ];
>>>>>>> dev

  return (
    <section
      id="stages"
<<<<<<< HEAD
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
=======
      className="min-h-screen flex items-center justify-center bg-white"
    >
      <div className="w-full max-w-6xl mx-auto px-6 pt-20 pb-20">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            <GradientText>Quy Trình Dịch Vụ</GradientText>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Chỉ 4 bước đơn giản để có đồ sạch sẽ, thơm tho mà không cần di
            chuyển
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <div
              key={i}
              className="group p-6 bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-xl transition-all duration-300 relative flex flex-col"
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`p-4 rounded-2xl flex-shrink-0 ${
                    step.color === "blue"
                      ? "bg-blue-100"
                      : step.color === "green"
                        ? "bg-green-100"
                        : step.color === "purple"
                          ? "bg-purple-100"
                          : "bg-amber-100"
                  }`}
                >
                  <step.icon
                    className={`w-8 h-8 ${
                      step.color === "blue"
                        ? "text-blue-600"
                        : step.color === "green"
                          ? "text-green-600"
                          : step.color === "purple"
                            ? "text-purple-600"
                            : "text-amber-600"
                    }`}
                    strokeWidth={1.5}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xl font-bold text-gray-900 mb-1">
                    {step.title}
                  </h4>
                  <p
                    className={`font-semibold ${
                      step.color === "blue"
                        ? "text-blue-600"
                        : step.color === "green"
                          ? "text-green-600"
                          : step.color === "purple"
                            ? "text-purple-600"
                            : "text-amber-600"
                    }`}
                  >
                    {step.time}
                  </p>
                </div>
              </div>
              <p className="text-gray-500 text-sm min-h-[40px]">
                {step.description}
              </p>

              {/* FAQ tích hợp */}
              <div className="mt-auto pt-4 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  {step.faq}
                </p>
                <p className="text-sm text-gray-500">{step.faqAnswer}</p>
              </div>

              {/* Step number indicator */}
              <div
                className={`absolute -top-3 -left-3 w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-sm ${
                  step.color === "blue"
                    ? "bg-blue-600"
                    : step.color === "green"
                      ? "bg-green-600"
                      : step.color === "purple"
                        ? "bg-purple-600"
                        : "bg-amber-600"
                }`}
              >
                {i + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-amber-600">✦</span>
            Lưu ý về quy trình
          </h3>
          <ul className="space-y-3 text-gray-700 text-sm pl-1">
            <li className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>
                Bạn luôn có thể theo dõi trạng thái đơn hàng qua mã vạch hoặc
                Zalo
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>
                Nếu cần thay đổi lịch, liên hệ ngay qua hotline hoặc Zalo
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>
                Đồ không nhận được trong 72h sẽ được bồi thường theo quy định
              </span>
            </li>
          </ul>
>>>>>>> dev
        </div>
      </div>
    </section>
  );
}
