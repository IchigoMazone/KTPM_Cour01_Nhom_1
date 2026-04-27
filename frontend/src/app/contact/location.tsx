// import React from "react";

// export default function Location() {
//   return (
//     <section
//       id="location"
//       className="min-h-screen flex items-center justify-center bg-gray-100"
//     >
//       Location
//     </section>
//   );
// }

"use client";

import React from "react";
import { MapPin, Navigation, Clock3, Phone, ArrowUpRight } from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";

const locationData = {
  title: "Địa chỉ cửa hàng",
  subtitle:
    "Ghé trực tiếp cửa hàng hoặc đặt lịch giao nhận tận nơi nhanh chóng.",

  name: "BeGauShop",
  address: "123 Phố Huế, Hai Bà Trưng, Hà Nội",
  phone: "0987 654 321",
  time: "08:00 - 22:00 mỗi ngày",

  mapUrl: "https://www.google.com/maps?q=123+Pho+Hue+Ha+Noi&output=embed",
};

export default function Location() {
  return (
    <section
      id="location"
      className="h-screen px-4 bg-gradient-to-b from-slate-50 via-white to-blue-50 flex items-center"
    >
      <div className="max-w-6xl mx-auto w-full pt-20">
        {/* Header */}
        <div className="text-center mb-20">
          <GradientText className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3">
            {locationData.title}
          </GradientText>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
            {locationData.subtitle}
          </p>
        </div>

        {/* Main */}
        <div className="relative grid lg:grid-cols-12 gap-0 shadow-2xl shadow-blue-200/50 rounded-[40px] overflow-hidden bg-white border border-white">
          
          {/* Left: Info Card (Chiếm 5 cột) */}
          <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-between z-10 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
            <div>
            

              <GradientText className="text-2xl lg:text-3xl font-bold text-slate-900 mb-6 leading-tight">
                {locationData.name}
              </GradientText>

              <div className="space-y-6 ">
                <div className="group flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 ">
                    <MapPin className="w-6 h-6 text-sky-500" />
                  </div>
                  <div>
                    <GradientText className="text-sm text-slate-400 font-bold uppercase mb-1">Địa chỉ</GradientText>
                    <p className="text-slate-700 font-medium">{locationData.address}</p>
                  </div>
                </div>

                <div className="group flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 ">
                    <Phone className="w-6 h-6 text-sky-600" />
                  </div>
                  <div>
                    <GradientText className="text-xs text-slate-400 font-bold uppercase mb-1">Điện thoại</GradientText>
                    <p className="text-slate-600 font-medium">{locationData.phone}</p>
                  </div>
                </div>

                <div className="group flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 ">
                    <Clock3 className="w-6 h-6 text-sky-500" />
                  </div>
                  <div>
                    <GradientText className="text-xs text-slate-400 font-bold uppercase mb-1">Giờ làm việc</GradientText>
                    <p className="text-slate-600 font-medium">{locationData.time}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <button className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center gap-3  active:bg-blue-500 transition-all  shadow-lg shadow-slate-200">
                <Navigation className="w-5 h-5" />
                Mở Google Maps
                <ArrowUpRight className="w-4 h-4 opacity-50" />
              </button>
            </div>
          </div>

          {/* Right: Map (Chiếm 7 cột) */}
          <div className="lg:col-span-7 h-[400px] lg:h-[400px] min-h-[300px] relative">
             {/* Overlay nhẹ để bản đồ tiệp màu với web */}
            <div className="absolute inset-0 bg-blue-600/5 pointer-events-none z-10" />
            <iframe
              src={locationData.mapUrl}
              width="100%"
              height="100%"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale-[0.2] contrast-[1.1] border-0"
            ></iframe>
          </div>
         </div> 
      </div>
    </section>
  );
}
