// import React from "react";

// export default function Catalog() {
//   return (
//     <section
//       id="catalog"
//       className="min-h-screen flex items-center justify-center bg-gray-100"
//     >
//       Catalog
//     </section>
//   );
// }

"use client";

import React from "react";
import { Shirt, Wind, Droplets, Briefcase } from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";

/* DATA riêng trong cùng file */
const catalogData = {
  title: "Danh mục dịch vụ",
  subtitle:
    "Đa dạng các loại hình giặt là chuyên nghiệp, phù hợp với từng chất liệu và nhu cầu sử dụng.",

  services: [
    {
      icon: "normal",
      title: "Giặt thường",
      desc: "Phù hợp quần áo mặc hằng ngày, xử lý sạch bụi bẩn và mùi khó chịu.",
      price: "Nhanh chóng - Tiết kiệm",
    },
    {
      icon: "dry",
      title: "Giặt khô",
      desc: "Dành cho vest, váy cao cấp và chất liệu cần bảo quản đặc biệt.",
      price: "An toàn - Cao cấp",
    },
    {
      icon: "steam",
      title: "Giặt hấp",
      desc: "Khử mùi, làm mới trang phục bằng công nghệ hơi nước hiện đại.",
      price: "Sạch khuẩn - Thơm lâu",
    },
    {
      icon: "leather",
      title: "Đồ da",
      desc: "Làm sạch và dưỡng bề mặt cho áo da, túi xách, giày da.",
      price: "Chuyên sâu - Tỉ mỉ",
    },
  ],
};

export default function Catalog() {
  const iconMap = {
    normal: Shirt,
    dry: Wind,
    steam: Droplets,
    leather: Briefcase,
  };

  return (
    <section
      id="catalog"
      className="h-screen overflow-hidden px-4 bg-gradient-to-b from-slate-50 via-white to-blue-50 scroll-mt-24 flex items-center"
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3">
            <GradientText >
              {catalogData.title}
            </GradientText>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            {catalogData.subtitle}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {catalogData.services.map((item, index) => {
            const Icon = iconMap[item.icon];

            return (
              <div
                key={index}
                className="bg-white rounded-3xl border border-blue-100 shadow-xl p-6 text-center"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center  mb-5">
                    <Icon className="w-6 h-6 text-sky-500" />
                  </div>

                  <GradientText className="text-xl font-bold text-slate-900 mb-3">
                    {item.title}
                  </GradientText>
                </div>

                <p className="text-slate-600 text-base leading-relaxed mb-4 min-h-[72px]">
                  {item.desc}
                </p>

                <GradientText className="inline-block bg-blue-50 text-sm font-medium px-4 py-2 rounded-full">
                  {item.price}
                </GradientText>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
