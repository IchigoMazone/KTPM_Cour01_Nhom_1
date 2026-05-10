<<<<<<< HEAD
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
=======
"use client";

import React from "react";
import { Clock, Calendar, Gift, Phone } from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";
>>>>>>> dev

export default function Hours() {
  const hours = [
    {
      icon: Clock,
      label: "Thứ 2 - Thứ 6",
      detail: "7:00 - 21:00",
      subtext: "Ca sáng: 7:00 - 12:00 | Ca chiều: 12:00 - 21:00",
      status: "Hoạt động",
      statusColor: "green",
      faq: "Tôi có thể đặt lịch trước không?",
      faqAnswer: "Có, bạn có thể đặt lịch qua hotline hoặc Zalo.",
    },
    {
      icon: Calendar,
      label: "Thứ 7 - Chủ nhật",
      detail: "8:00 - 20:00",
      subtext: "Ca sáng: 8:00 - 12:00 | Ca chiều: 12:00 - 20:00",
      status: "Hoạt động",
      statusColor: "green",
      faq: "Cuối tuần có phụ thu thêm không?",
      faqAnswer: "Không, giá cả không thay đổi vào cuối tuần.",
    },
    {
      icon: Gift,
      label: "Ngày lễ",
      detail: "9:00 - 17:00",
      subtext: "Giờ hoạt động có thể thay đổi vào ngày lễ",
      status: "Có thay đổi",
      statusColor: "yellow",
      faq: "Ngày lễ có mở cửa không?",
      faqAnswer: "Có nhưng giờ hoạt động rút ngắn. Vui lòng gọi xác nhận.",
    },
    {
      icon: Phone,
      label: "Hỗ trợ khẩn cấp",
      detail: "0901 234 567",
      subtext: "Luôn sẵn sàng 24/7 ngoài giờ hành chính",
      status: "Luôn sẵn sàng",
      statusColor: "blue",
      faq: "Khi nào nên gọi hotline?",
      faqAnswer: "Gọi khi cần hỗ trợ ngoài giờ hoặc cần giặt gấp.",
    },
  ];

  return (
    <section
      id="hours"
<<<<<<< HEAD
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
=======
      className="min-h-screen flex items-center justify-center bg-white"
    >
      <div className="w-full max-w-6xl mx-auto px-6 pt-20 pb-20">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            <GradientText>Giờ Hoạt Động</GradientText>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            BegauShop phục vụ quý khách suốt tuần với khung giờ linh hoạt
          </p>
        </div>

        {/* Hours Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {hours.map((item, i) => (
            <div
              key={i}
              className="group p-6 bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-blue-100 rounded-2xl flex-shrink-0">
                  <item.icon
                    className="w-8 h-8 text-blue-600"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xl font-bold text-gray-900 mb-1">
                    {item.label}
                  </h4>
                  <p className="text-gray-600 font-semibold">{item.detail}</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-3">{item.subtext}</p>
              <span
                className={`inline-block px-3 py-1 text-sm font-medium rounded-full mb-4 ${
                  item.statusColor === "green"
                    ? "bg-green-100 text-green-600"
                    : item.statusColor === "yellow"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {item.status}
              </span>

              {/* FAQ tích hợp */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  {item.faq}
                </p>
                <p className="text-sm text-gray-500">{item.faqAnswer}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <div className="mt-12 p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
          <p className="text-amber-700 text-sm">
            Lưu ý: Giờ hoạt động có thể thay đổi vào các dịp lễ Tết. Vui lòng
            liên hệ trước để xác nhận.
          </p>
>>>>>>> dev
        </div>
      </div>
    </section>
  );
}
