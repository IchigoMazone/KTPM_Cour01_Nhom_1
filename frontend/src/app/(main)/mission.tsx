"use client";

import React from "react";
import { Shield, Leaf, Heart, Award } from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";

export default function Mission() {
  const values = [
    {
      icon: Shield,
      title: "An Toàn Tuyệt Đối",
      description:
        "Mỗi loại vải được xử lý riêng biệt theo công thức chuyên biệt. Chúng tôi phân loại kỹ lưỡng trước khi giặt, sử dụng nhiệt độ và chế độ phù hợp để đảm bảo không gây co rút, lem màu hay hư hại nào cho trang phục của bạn.",
    },
    {
      icon: Leaf,
      title: "Thân Thiện Môi Trường",
      description:
        "Chúng tôi sử dụng 100% sản phẩm giặt là sinh học, không chứa hoá chất độc hại. Quy trình xử lý nước thải đạt chuẩn, góp phần bảo vệ môi trường và đảm bảo an toàn tối đa cho sức khoẻ của khách hàng.",
    },
    {
      icon: Heart,
      title: "Tận Tâm Phục Vụ",
      description:
        "Đội ngũ nhân viên được tuyển chọn kỹ lưỡng và đào tạo chuyên nghiệp. Chúng tôi lắng nghe mọi yêu cầu của khách hàng, tư vấn tận tình và luôn sẵn sàng hỗ trợ 24/7 qua điện thoại, Zalo hay trực tiếp tại cửa hàng.",
    },
    {
      icon: Award,
      title: "Chất Lượng Cam Kết",
      description:
        "Chúng tôi cam kết chất lượng đầu ra của từng sản phẩm. Nếu bạn không hài lòng với kết quả, chúng tôi sẽ giặt lại miễn phí hoặc hoàn tiền 100%. Sự tin tưởng của khách hàng là thước đo thành công duy nhất của BegauShop.",
    },
  ];

  return (
    <section
      id="mission"
      className="min-h-screen flex items-center justify-center bg-white"
    >
      <div className="w-full max-w-6xl mx-auto px-6 pt-20 xl:pt-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <GradientText>
              Đồ của bạn xứng đáng được chăm sóc tốt nhất
            </GradientText>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Với hơn 10 năm kinh nghiệm, BegauShop tự hào là điểm đến tin cậy của
            hàng nghìn gia đình Hà Nội. Mỗi chiếc áo, mỗi bộ quần áo đều được
            chúng tôi chăm sóc cẩn thận như đồ của chính mình.
          </p>
        </div>

        {/* Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, i) => (
            <div
              key={i}
              className="p-6 bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:border-gray-300 transition-all duration-300 group"
            >
              <div className="p-3 bg-blue-50 rounded-xl w-fit mb-5 group-hover:bg-blue-100 transition-colors">
                <value.icon
                  className="w-6 h-6 text-blue-500"
                  strokeWidth={1.5}
                />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-3">
                {value.title}
              </h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
