<<<<<<< HEAD
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
=======
"use client";

import React from "react";
import { MapPin, Navigation, Phone, Truck, Clock } from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";
>>>>>>> dev

export default function Location() {
  return (
    <section
      id="location"
<<<<<<< HEAD
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
=======
      className="min-h-screen flex items-center justify-center bg-white"
    >
      <div className="w-full max-w-6xl mx-auto px-6 pt-20 pb-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            <GradientText>Địa Chỉ Cửa Hàng</GradientText>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Tìm đường đến BegauShop dễ dàng với các phương tiện khác nhau
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map */}
          <div className="bg-gray-200 rounded-2xl overflow-hidden h-[400px] lg:h-auto shadow-lg border border-gray-200 order-2 lg:order-1">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.0969462837!2d105.81761!3d21.02889!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDAxJzQ3LjQiTiAxMDXCsDQ5JzAyLjUiRQ!5e0!3m2!1svi!2s!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="BegauShop Location"
              className="rounded-2xl"
            />
          </div>

          {/* Info Cards */}
          <div className="space-y-4 order-1 lg:order-2">
            {/* Main Address */}
            <div className="group p-5 sm:p-6 bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
                <div className="p-4 bg-blue-100 rounded-2xl flex-shrink-0 w-fit">
                  <MapPin className="w-8 h-8 text-blue-600" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                    Cửa hàng chính
                  </h4>
                  <p className="text-gray-500 text-sm">
                    123 Đường Nguyễn Trãi, Quận Thanh Xuân, Hà Nội
                  </p>
                </div>
                <a
                  href="https://maps.google.com/?q=123+Nguyen+Trai+Thanh+Xuan+Hanoi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 hover:shadow-lg transition-all w-fit"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Chỉ đường</span>
                </a>
              </div>
            </div>

            {/* Hotline */}
            <div className="group p-5 sm:p-6 bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
                <div className="p-4 bg-blue-100 rounded-2xl flex-shrink-0 w-fit">
                  <Phone className="w-8 h-8 text-blue-600" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                    Hotline 24/7
                  </h4>
                  <p className="text-gray-500 text-sm">
                    0901 234 567 - Hỗ trợ đặt lịch & tư vấn dịch vụ
                  </p>
                </div>
                <a
                  href="tel:0901234567"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 hover:shadow-lg transition-all w-fit"
                >
                  <Phone className="w-4 h-4" />
                  <span>Gọi ngay</span>
                </a>
              </div>
            </div>

            {/* Delivery Service */}
            <div className="group p-5 sm:p-6 bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-blue-100 rounded-2xl flex-shrink-0">
                  <Truck className="w-8 h-8 text-blue-600" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                    Dịch vụ giao nhận
                  </h4>
                  <p className="text-gray-500 text-sm">
                    Miễn phí giao nhận trong bán kính 5km
                  </p>
>>>>>>> dev
                </div>
              </div>
            </div>

<<<<<<< HEAD
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
=======
            {/* Opening Hours */}
            <div className="group p-5 sm:p-6 bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-blue-100 rounded-2xl flex-shrink-0">
                  <Clock className="w-8 h-8 text-blue-600" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                    Giờ hoạt động
                  </h4>
                  <p className="text-gray-500 text-sm">
                    Thứ 2 - Thứ 6: 7:00 - 21:00 | Thứ 7 - CN: 8:00 - 20:00
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
>>>>>>> dev
      </div>
    </section>
  );
}
