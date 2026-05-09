"use client";

import React from "react";
import { Clock, Calendar, Gift, Phone } from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";

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
        </div>
      </div>
    </section>
  );
}
