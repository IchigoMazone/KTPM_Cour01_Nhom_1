"use client";

import React from "react";

import {
  Users,
  Award,
  ThumbsUp,
  Clock,
  Heart,
  Star,
  TrendingUp,
} from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";

export default function Stats() {
  const stats = [
    {
      icon: Users,
      value: "15,000+",
      label: "Khách hàng tin tưởng",
      description:
        "Hơn 15 nghìn khách hàng đã sử dụng và đồng hành cùng BegauShop",
    },
    {
      icon: Award,
      value: "10+",
      label: "Năm kinh nghiệm",
      description:
        "Một thập kỷ chinh phục chất lượng dịch vụ giặt là chuyên nghiệp",
    },
    {
      icon: ThumbsUp,
      value: "98%",
      label: "Tỷ lệ hài lòng",
      description:
        "Gần như tuyệt đối, minh chứng cho chất lượng dịch vụ vượt kỳ vọng",
    },
    {
      icon: Clock,
      value: "24h",
      label: "Giao nhanh",
      description: "Thời gian giặt ủi nhanh chóng, lấy ngay trong ngày",
    },
  ];

  return (
    <section
      id="stats"
      className="min-h-screen flex items-center justify-center bg-white"
    >
      <div className="w-full max-w-6xl mx-auto px-6 pt-20 xl:pt-12 pb-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            <GradientText>Những Con Số Nói Lên Tất Cả</GradientText>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            BegauShop tự hào với những thành tựu đạt được trong suốt hành trình
            phục vụ khách hàng. Mỗi con số là minh chứng cho sự tin tưởng và yêu
            mến của quý khách.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="p-6 bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:border-gray-300 transition-all duration-300 group"
            >
              <div className="p-3 bg-blue-50 rounded-xl w-fit mb-5 group-hover:bg-blue-100 transition-colors">
                <stat.icon
                  className="w-6 h-6 text-blue-500"
                  strokeWidth={1.5}
                />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {stat.value}
              </p>
              <p className="text-lg font-bold text-gray-900 mb-2">
                {stat.label}
              </p>
              <p className="text-gray-500 text-sm leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom highlight */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 px-5 py-3 bg-red-50 rounded-full border border-red-100">
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span className="text-red-600 text-sm font-medium">Yêu thương từ khách hàng</span>
          </div>
          <div className="flex items-center gap-2 px-5 py-3 bg-yellow-50 rounded-full border border-yellow-100">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-yellow-600 text-sm font-medium">Được bình chọn 5 sao</span>
          </div>
          <div className="flex items-center gap-2 px-5 py-3 bg-green-50 rounded-full border border-green-100">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-600 text-sm font-medium">Phát triển liên tục</span>
          </div>
        </div>
      </div>
    </section>
  );
}
