
import React from "react";
import { Star, MapPin, Award, Users, Clock, Heart } from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";

export default function Overview() {
  const stats = [
    { icon: Award, value: "10+", label: "Năm kinh nghiệm" },
    { icon: Users, value: "15K+", label: "Khách hàng tin tưởng" },
    { icon: Heart, value: "98%", label: "Tỷ lệ hài lòng" },
    { icon: Clock, value: "24/7", label: "Phục vụ mọi lúc" },
  ];

  return (
    <section
      id="overview"

      className="min-h-screen flex items-center justify-center bg-white"
    >
      <div className="w-full max-w-6xl mx-auto px-6 pt-20 xl:pt-12">
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-16 items-center justify-center min-h-[calc(100vh-160px)]">
          {/* Left - Story */}
          <div className="w-full lg:w-1/2 space-y-8">
            <div>
              <h1 className="text-5xl font-bold tracking-tight mb-6">
                <GradientText>BegauShop</GradientText>
              </h1>
              <div className="space-y-4 text-gray-600">
                <p>
                  BegauShop được thành lập từ năm 2014 với mong muốn mang đến
                  dịch vụ giặt là chuyên nghiệp, tiện lợi và giá cả hợp lý cho
                  người dân Hà Nội.
                </p>
                <p>
                  Với hơn 10 năm hoạt động, chúng tôi tự hào là điểm đến tin cậy
                  của hàng nghìn gia đình và doanh nghiệp. Mỗi chiếc áo, mỗi bộ
                  quần áo đều được chúng tôi chăm sóc cẩn thận như đồ của chính
                  mình.
                </p>
                <p className="font-medium text-gray-900">
                  Sứ mệnh của chúng tôi: Đồ của bạn xứng đáng được chăm sóc tốt
                  nhất.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="p-4 sm:p-5 bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:border-gray-300 transition-all duration-300 group"
                >
                  <div className="p-2.5 bg-blue-50 rounded-xl w-fit mb-3 sm:mb-4 group-hover:bg-blue-100 transition-colors">
                    <stat.icon
                      className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500"
                      strokeWidth={1.5}
                    />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <div>
                <span className="font-semibold text-gray-900">4.9/5</span>
                <span className="text-gray-400 ml-2">(2,847 đánh giá)</span>
              </div>
            </div>
          </div>

          {/* Right - Images */}
          <div className="w-full lg:w-1/2 space-y-4">
            <div className="rounded-2xl overflow-hidden aspect-[4/3]">
              <img
                src="/washer(2).jfif"
                alt="BegauShop - Cơ sở giặt là"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden aspect-square">
                <img
                  src="/washer(1).jfif"
                  alt="Máy giặt công nghiệp"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-square">
                <img
                  src="/washer(4).jfif"
                  alt="Đồ giặt sạch bóng"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <MapPin className="w-4 h-4" />
              <span>Số 123 Đường Cầu Giấy, Hà Nội</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
