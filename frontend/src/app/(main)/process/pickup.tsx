"use client";

import React from "react";
import { Home, Store, MapPin, Clock, HelpCircle } from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";

export default function Pickup() {
  const deliveryOptions = [
    {
      icon: Home,
      title: "Giao nhận tận nơi",
      price: "Miễn phí",
      description: "Nhân viên đến lấy đồ tại nhà và giao lại khi hoàn thành",
      conditions: [
        "Áp dụng trong phạm vi 5km từ tiệm",
        "Phí 5.000đ/km cho khoảng cách > 5km",
        "Đặt lịch trước tối thiểu 2 giờ",
      ],
      faq: "Tôi có thể hủy đơn sau khi đã đặt lịch không?",
      faqAnswer:
        "Có, bạn có thể hủy miễn phí trước 1 giờ so với giờ hẹn. Sau thời gian đó sẽ tính phí hủy 20.000đ.",
      bgColor: "blue",
      highlight: true,
    },
    {
      icon: Store,
      title: "Tự mang đến tiệm",
      price: "Không tính phí",
      description: "Bạn mang đồ trực tiếp đến tiệm theo giờ hoạt động",
      conditions: [
        "Tiết kiệm chi phí giao hàng",
        "Kiểm tra đồ trực tiếp tại tiệm",
        "Nhận hàng nhanh hơn 1-2 giờ",
      ],
      faq: "Tôi có thể mang đồ đến tiệm ngoài giờ làm việc không?",
      faqAnswer:
        "Không, bạn vui lòng đến trong giờ mở cửa 7:00-21:00 để được hỗ trợ tốt nhất.",
      bgColor: "green",
      highlight: false,
    },
  ];

  return (
    <section
      id="pickup"
      className="min-h-screen flex items-center justify-center bg-white"
    >
      <div className="w-full max-w-6xl mx-auto px-6 pt-20 pb-20">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            <GradientText>Tùy Chọn Giao Nhận</GradientText>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Linh hoạt với 2 hình thức: giao tận nơi hoặc tự mang đến tiệm
          </p>
        </div>

        {/* Delivery Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deliveryOptions.map((option, i) => (
            <div
              key={i}
              className={`group p-6 rounded-2xl transition-all duration-300 relative flex flex-col ${
                option.highlight
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 hover:border-blue-300 hover:shadow-xl"
              }`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`p-4 rounded-2xl flex-shrink-0 ${
                    option.highlight ? "bg-white/20" : "bg-blue-100"
                  }`}
                >
                  <option.icon
                    className={`w-8 h-8 ${
                      option.highlight ? "text-white" : "text-blue-600"
                    }`}
                    strokeWidth={1.5}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xl font-bold mb-1">{option.title}</h4>
                  <p
                    className={`font-semibold ${
                      option.highlight ? "text-blue-100" : "text-blue-600"
                    }`}
                  >
                    {option.price}
                  </p>
                </div>
              </div>
              <p
                className={`text-sm mb-4 ${
                  option.highlight ? "text-blue-100" : "text-gray-500"
                }`}
              >
                {option.description}
              </p>

              <div
                className={`pt-4 border-t ${
                  option.highlight ? "border-white/20" : "border-gray-100"
                }`}
              >
                <h5
                  className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                    option.highlight ? "text-blue-100" : "text-gray-700"
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  Điều kiện áp dụng
                </h5>
                <ul className="space-y-2">
                  {option.conditions.map((condition, j) => (
                    <li
                      key={j}
                      className={`flex items-start gap-3 text-sm ${
                        option.highlight ? "text-white" : "text-gray-600"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          option.highlight ? "bg-white/20" : "bg-blue-100"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                      </span>
                      {condition}
                    </li>
                  ))}
                </ul>
              </div>

              {/* FAQ tích hợp */}
              <div
                className={`mt-auto pt-4 border-t ${
                  option.highlight ? "border-white/20" : "border-gray-100"
                }`}
              >
                <h5
                  className={`text-sm font-semibold mb-2 flex items-center gap-2 ${
                    option.highlight ? "text-blue-100" : "text-gray-700"
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  {option.faq}
                </h5>
                <p
                  className={`text-sm ${
                    option.highlight ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {option.faqAnswer}
                </p>
              </div>

              {/* Popular badge */}
              {option.highlight && (
                <div className="absolute -top-3 left-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Phổ biến nhất
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Hours Note */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Giờ giao hàng
          </h3>
          <ul className="space-y-2 text-gray-700 text-sm pl-1">
            <li className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>
                Nhân viên giao nhận hoạt động từ <strong>7:00 - 20:00</strong>{" "}
                các ngày trong tuần
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>
                Cuối tuần và ngày lễ: <strong>8:00 - 18:00</strong>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>
                Đơn hàng ngoài giờ sẽ được xử lý vào ngày làm việc tiếp theo
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
