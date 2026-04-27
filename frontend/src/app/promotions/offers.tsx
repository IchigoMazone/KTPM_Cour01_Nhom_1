// import React from "react";

// export default function Offers() {
//   return (
//     <section
//       id="offers"
//       className="min-h-screen flex items-center justify-center bg-gray-100"
//     >
//       Offers
//     </section>
//   );
// }

"use client";

import React from "react";
import { TicketPercent, Clock3, Copy } from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";

/* DATA riêng trong cùng file */
const offersData = {
  title: "Mã giảm giá hiện hành",
  subtitle:
    "Ưu đãi hấp dẫn dành cho khách hàng mới và khách hàng thân thiết trong thời gian này.",

  offers: [
    {
      code: "BEGAU10",
      value: "Giảm 10%",
      desc: "Áp dụng cho đơn hàng đầu tiên.",
      expire: "Hết hạn: 30/04/2026",
      badge: "Mới",
    },
    {
      code: "FREESHIP",
      value: "Miễn phí giao nhận",
      desc: "Áp dụng đơn từ 5kg trở lên.",
      expire: "Hết hạn: 15/05/2026",
      badge: "Hot",
    },
    {
      code: "VIP20",
      value: "Giảm 20%",
      desc: "Dành cho khách hàng thân thiết.",
      expire: "Hết hạn: 31/05/2026",
      badge: "VIP",
    },
  ],
};

export default function Offers() {
  return (
    <section
      id="offers"
      className="min-h-screen overflow-hidden px-4 bg-gradient-to-b from-white via-slate-50 to-blue-50 scroll-mt-24 flex items-center"
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3">
            <GradientText>{offersData.title}</GradientText>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            {offersData.subtitle}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offersData.offers.map((item, index) => (
            <div
              key={index}
              className="relative bg-white rounded-3xl border border-blue-100 shadow-xl p-6 overflow-hidden"
            >
              {/* Badge */}
              <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                {item.badge}
              </div>

              {/* Icon */}
              <div className="flex h-[50px] mb-7 gap-2 items-center">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center ">
                  <TicketPercent className="w-6 h-6 text-sky-500" />
                </div>
                <GradientText className="text-2xl font-bold text-blue-600 ">
                  {item.value}
                </GradientText>
              </div>

              {/* Code */}
              <div className="mb-4">
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                  <span className="font-bold text-slate-900 text-lg">
                    {item.code}
                  </span>

                  <Copy className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Info */}

              <p className="text-slate-600 text-sm sm:text-base mb-4 leading-relaxed">
                {item.desc}
              </p>

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock3 className="w-4 h-4" />
                <span>{item.expire}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
