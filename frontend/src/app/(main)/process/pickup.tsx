<<<<<<< HEAD
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
=======
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
>>>>>>> dev

  return (
    <section
      id="pickup"
<<<<<<< HEAD
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
=======
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
>>>>>>> dev
        </div>
      </div>
    </section>
  );
}
