"use client";

import React, { useState } from "react";
import { Star, Percent, Clock, Gift, Zap, Award, TrendingDown, Sparkles } from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";

const offers = [
  {
    id: 1,
    title: "Ưu đãi mùa hè",
    subtitle: "Giặt hấp chỉ 79.000đ/kg",
    description: "Dịch vụ giặt hấp cao cấp với công nghệ hiện đại, phù hợp cho vest, comple, đồ cưới",
    originalPrice: 120000,
    salePrice: 79000,
    unit: "kg",
    badge: "GIẢM 35%",
    badgeColor: "from-red-500 to-pink-500",
    deadline: "Có hiệu lực đến 30/06/2026",
    features: ["Máy giặt hấp công nghệ mới", "Bảo hành vải 100%", "Giao hàng miễn phí"],
    icon: Sparkles,
    highlight: true,
  },
  {
    id: 2,
    title: "Thứ 3 & Thứ 5",
    subtitle: "Giảm 25% dịch vụ ủi",
    description: "Áp dụng cho tất cả các loại ủi: ủi thường, ủi cao cấp, ủi đồ cưới",
    originalPrice: 0,
    salePrice: 25,
    unit: "%",
    badge: "THỨ 3 & THỨ 5",
    badgeColor: "from-blue-500 to-cyan-500",
    deadline: "Mỗi tuần, vô thời hạn",
    features: ["Chỉ áp dụng thứ 3 và thứ 5", "Không giới hạn số lượng", "Kết hợp được với mã khác"],
    icon: Percent,
    highlight: false,
  },
  {
    id: 3,
    title: "Khách hàng mới",
    subtitle: "Giảm 50% đơn đầu tiên",
    description: "Dành riêng cho khách hàng lần đầu sử dụng dịch vụ BegauShop",
    originalPrice: 0,
    salePrice: 50,
    unit: "%",
    badge: "CHỈ 99K",
    badgeColor: "from-green-500 to-emerald-500",
    deadline: "Sử dụng trong 30 ngày từ khi đăng ký",
    features: ["Tối đa giảm 100.000đ", "Áp dụng đơn từ 200.000đ", "Mỗi khách hàng 1 lần"],
    icon: Gift,
    highlight: false,
  },
  {
    id: 4,
    title: "Đơn hàng lớn",
    subtitle: "Tặng voucher 50.000đ",
    description: "Khi đơn hàng từ 500.000đ trở lên, tặng ngay voucher 50.000đ cho đơn kế tiếp",
    originalPrice: 0,
    salePrice: 50,
    unit: "K",
    badge: "TẶNG VOUCHER",
    badgeColor: "from-amber-500 to-orange-500",
    deadline: "Áp dụng quanh năm",
    features: ["Đơn từ 500.000đ", "Voucher có hiệu lực 60 ngày", "Không giới hạn số lượng"],
    icon: TrendingDown,
    highlight: false,
  },
  {
    id: 5,
    title: "Khách hàng thân thiết",
    subtitle: "Tích lũy điểm hoàn tiền",
    description: "Mỗi 100.000đ chi tiêu = 1 điểm. 10 điểm = 10.000đ hoàn tiền",
    originalPrice: 0,
    salePrice: 0,
    unit: "",
    badge: "HOÀN TIỀN 10%",
    badgeColor: "from-purple-500 to-pink-500",
    deadline: "Chương trình thường trực",
    features: ["Không giới hạn tích điểm", "Điểm không có hạn sử dụng", "Đổi quà VIP"],
    icon: Award,
    highlight: false,
  },
  {
    id: 6,
    title: "Giặt nhanh 4H",
    subtitle: "Chỉ cộng thêm 30.000đ",
    description: "Dịch vụ giặt và giao trong 4 giờ, áp dụng cho đơn dưới 5kg",
    originalPrice: 50000,
    salePrice: 30000,
    unit: "đ",
    badge: "NHANH HƠN",
    badgeColor: "from-indigo-500 to-blue-500",
    deadline: "Áp dụng 7h-17h, thứ 2-7",
    features: ["Giao trong 4 giờ", "Chỉ đơn dưới 5kg", "Cộng thêm 30.000đ"],
    icon: Zap,
    highlight: false,
  },
];


export default function Offers() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <section
      id="offers"
      className="min-h-screen flex items-center justify-center bg-white"
    >
      <div className="w-full max-w-6xl mx-auto px-6 pt-20 pb-20">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            <GradientText>Ưu Đãi Đặc Biệt</GradientText>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Những ưu đãi hấp dẫn được cập nhật liên tục mỗi tháng
          </p>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((offer) => {
            const Icon = offer.icon;
            const isExpanded = expanded === offer.id;

            return (
              <div
                key={offer.id}
                className={`group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  offer.highlight
                    ? "border-2 border-red-300"
                    : "border border-gray-200 hover:border-blue-300"
                }`}
              >
                {/* Badge */}
                <div
                  className={`absolute top-4 right-4 bg-gradient-to-r ${offer.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10 flex items-center gap-1`}
                >
                  {offer.badge === "GIẢM 35%" && <Sparkles className="w-3 h-3" />}
                  {offer.badge === "THỨ 3 & THỨ 5" && <Clock className="w-3 h-3" />}
                  {offer.badge === "CHỈ 99K" && <Gift className="w-3 h-3" />}
                  {offer.badge === "TẶNG VOUCHER" && <Gift className="w-3 h-3" />}
                  {offer.badge === "HOÀN TIỀN 10%" && <Star className="w-3 h-3" />}
                  {offer.badge === "NHANH HƠN" && <Zap className="w-3 h-3" />}
                  {offer.badge}
                </div>

                {/* Popular Badge */}
                {offer.highlight && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-500 to-pink-500 text-white text-center py-2 text-sm font-bold">
                    ƯU ĐÃI HOT NHẤT THÁNG
                  </div>
                )}

                <div className={`p-6 ${offer.highlight ? "pt-14" : "pt-6"}`}>
                  {/* Icon */}
                  <div
                    className={`inline-flex p-4 rounded-2xl mb-4 bg-gradient-to-r ${offer.badgeColor} text-white`}
                  >
                    <Icon className="w-8 h-8" strokeWidth={1.5} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {offer.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">{offer.description}</p>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-4">
                    {offer.salePrice > 0 && offer.originalPrice > 0 && (
                      <span className="text-2xl font-bold text-red-500">
                        {offer.salePrice.toLocaleString()}{offer.unit}
                      </span>
                    )}
                    {offer.salePrice > 0 && offer.originalPrice > 0 && (
                      <span className="text-lg text-gray-400 line-through">
                        {offer.originalPrice.toLocaleString()}{offer.unit}
                      </span>
                    )}
                    {offer.salePrice > 0 && offer.originalPrice === 0 && offer.unit === "%" && (
                      <span className="text-2xl font-bold text-green-600">
                        Giảm {offer.salePrice}%
                      </span>
                    )}
                    {offer.salePrice > 0 && offer.originalPrice === 0 && offer.unit === "K" && (
                      <span className="text-2xl font-bold text-amber-600">
                        Tặng {offer.salePrice}.000đ
                      </span>
                    )}
                    {offer.salePrice === 0 && (
                      <span className="text-2xl font-bold text-purple-600">
                        {offer.subtitle}
                      </span>
                    )}
                  </div>

                  {/* Expand Button */}
                  <button
                    onClick={() => setExpanded(isExpanded ? null : offer.id)}
                    className="w-full py-2 text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2 transition-colors"
                  >
                    {isExpanded ? "Ẩn bớt" : "Xem chi tiết"}
                    <span className={`transform transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                      ▼
                    </span>
                  </button>

                  {/* Expanded Content */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500 mb-3">{offer.deadline}</p>
                      <ul className="space-y-2">
                        {offer.features.map((feature, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-gray-600"
                          >
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
