// import React from "react";

// export default function Assurance() {
//   return (
//     <section
//       id="assurance"
//       className="min-h-screen flex items-center justify-center bg-gray-100"
//     >
//       Assurance
//     </section>
//   );
// }

"use client";

import React from "react";
import { ShieldCheck, Leaf, Droplets, CheckCircle2 } from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";

/* DATA riêng trong cùng file */
const assuranceData = {
  title: "Cam kết chất lượng",
  subtitle:
    "Mỗi sản phẩm được xử lý cẩn thận với tiêu chuẩn an toàn cho vải vóc và thân thiện với môi trường.",

  badges: [
    {
      icon: "fabric",
      title: "An toàn vải vóc",
      desc: "Quy trình giặt phù hợp từng chất liệu, hạn chế co rút và phai màu.",
    },
    {
      icon: "eco",
      title: "Thân thiện môi trường",
      desc: "Sử dụng hóa chất đạt chuẩn và tối ưu lượng nước tiêu thụ.",
    },
    {
      icon: "clean",
      title: "Sạch khuẩn hiệu quả",
      desc: "Loại bỏ mùi hôi, vi khuẩn và bụi bẩn khó xử lý.",
    },
    {
      icon: "trusted",
      title: "Uy tín đúng hẹn",
      desc: "Cam kết giao đúng thời gian và giữ chất lượng ổn định.",
    },
  ],
};

export default function Assurance() {
  const iconMap = {
    fabric: ShieldCheck,
    eco: Leaf,
    clean: Droplets,
    trusted: CheckCircle2,
  };

  return (
    <section
      id="assurance"
      className="h-screen flex items-center bg-gradient-to-b from-slate-50 via-white to-blue-50"
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3">
            <GradientText >
              {assuranceData.title}
            </GradientText>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            {assuranceData.subtitle}
          </p>
        </div>

        {/* Badge Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {assuranceData.badges.map((item, index) => {
            const Icon = iconMap[item.icon];

            return (
              <div
                key={index}
                className="bg-white rounded-3xl border border-blue-100 shadow-xl p-6 text-center"
              >
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-sky-500" />
                  </div>

                  <GradientText className="text-xl font-bold mb-5 text-start flex-1">
                    {item.title}
                  </GradientText>
                </div>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
