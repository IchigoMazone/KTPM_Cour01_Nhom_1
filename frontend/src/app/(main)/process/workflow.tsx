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

  return (
    <section
      id="workflow"
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
        </div>
      </div>
    </section>
  );
}
