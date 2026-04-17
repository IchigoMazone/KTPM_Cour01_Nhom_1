import { GradientText } from "@/src/components/ui/gradient-text";
import React from "react";
export const timeBackground = {
  image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=2000&q=80",
};

export const timeServices = [
  { service: "Là phẳng", duration: "2–4 giờ" },
  { service: "Giặt thường", duration: "4–6 giờ" },
  { service: "Giặt hấp", duration: "6–8 giờ" },
  { service: "Chăn màn", duration: "8–12 giờ" },
  { service: "Giặt khô", duration: "24 giờ" },
  { service: "Giặt đồ da", duration: "48 giờ" },
];

export default function Time() {
  return (
    <section
      id="time"
      className="min-h-screen relative flex items-center justify-center border-b border-[var(--color-divider)]"
    >
      {/* BACKGROUND IMAGE (HTTP LINK) */}
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{
          backgroundImage: `url('${timeBackground.image}')`,
        }}
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 " />

      {/* CONTENT */}
      <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-24">

        {/* TITLE */}
        <div className="text-center mb-14">
          <h2 className="font-serif text-4xl md:text-6xl text-white">
            Bao lâu thì nhận được đồ?
          </h2>
        </div>

        {/* MOBILE */}
        <div className="grid grid-cols-2 gap-4 md:hidden">
          {timeServices.map(({ service, duration }) => (
            <div
              key={service}
              className="w-36 h-36 mx-auto rounded-full bg-white/20 border border-white/30 flex flex-col items-center justify-center text-center backdrop-blur-sm"
            >
              <span className="text-xs text-white font-medium px-2">
                {service}
              </span>
              <span className="text-[16px] text-blue-100 mt-1">
                {duration}
              </span>
            </div>
          ))}
        </div>

        {/* TABLET */}
        <div className="hidden md:grid lg:hidden grid-cols-3 gap-6 max-w-3xl mx-auto">
          {timeServices.map(({ service, duration }) => (
            <div
              key={service}
              className="w-50 h-50 mx-auto rounded-full bg-white/20 border border-white/30 flex flex-col items-center justify-center text-center backdrop-blur-sm"
            >
              <span className="text-xl text-white font-medium px-2">
                {service}
              </span>
              <span className="text-2xl text-blue-100 mt-1">
                {duration}
              </span>
            </div>
          ))}
        </div>

        {/* DESKTOP */}
        <div className="hidden lg:grid grid-cols-3 gap-10 max-w-4xl mx-auto">
          {timeServices.map(({ service, duration }) => (
            <div
              key={service}
              className="w-40 h-40 mx-auto rounded-full bg-white/20 border border-white/30 flex flex-col items-center justify-center text-center backdrop-blur-sm hover:scale-105 transition-transform"
            >
              <span className="text-base text-white font-medium px-3">
                {service}
              </span>
              <span className="text-[18px] font-semibold text-blue-100 mt-1">
                {duration}
              </span>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
}