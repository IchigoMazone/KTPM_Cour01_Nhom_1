"use client";
import { Panda } from "lucide-react";

const contacts = [
  {
    label: "0123 456 789",
    icon: (
      <svg className="w-4 h-4 shrink-0 mt-0.5 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
      </svg>
    ),
  },
  {
    label: "Zalo: 0123 456 789",
    icon: (
      <svg className="w-4 h-4 shrink-0 mt-0.5 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    label: "begaushop123@gmail.com",
    icon: (
      <svg className="w-4 h-4 shrink-0 mt-0.5 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    label: "47 Ngõ 52 Tô Ngọc Vân, Tây Hồ, Hà Nội",
    icon: (
      <svg className="w-4 h-4 shrink-0 mt-0.5 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
];

const services = [
  "Giặt khô",
  "Giặt sấy",
  "Giặt là",
  "Giặt rèm cửa",
  "Giặt chăn ga gối đệm",
  "Giặt thảm",
];

const promotions = [
  "Giảm giá đơn đầu",
  "Miễn phí giao nhận",
  "Combo tiết kiệm",
  "Khách hàng thân thiết",
];

const navLinks = ["Giới thiệu", "Dịch vụ", "Quy trình", "Ưu đãi", "Chính sách", "Liên hệ"];

const socials = [
  {
    title: "Facebook",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    ),
  },
  {
    title: "TikTok",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.25 8.25 0 004.83 1.54V6.8a4.85 4.85 0 01-1.06-.11z" />
      </svg>
    ),
  },
  {
    title: "Zalo",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2zm-2 10H6v-2h12v2zm0-4H6V6h12v2z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#faf9f7] border-t border-stone-200 text-stone-700">

      {/* ── MAIN GRID ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-14 pb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.4fr] gap-10 lg:gap-12">

        {/* Cột 1 — Brand */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 flex items-center justify-center shrink-0">
              <Panda/>
            </div>
            <span className="text-lg font-semibold ">
              Tiệm giặt Bé Gấu
            </span>
          </div>

          <p className="text-sm text-stone-500 leading-relaxed max-w-[240px]">
            Giặt là chuyên nghiệp, giao nhận tận nơi — an tâm cho từng sợi vải.
          </p>

          <div className="inline-flex items-center gap-2 w-fit">
            <span className="text-xs text-stone-500">Mở cửa hằng ngày · 7:00 – 22:00</span>
          </div>


          <div className="flex gap-2">
            {socials.map(({ title, icon }) => (
              <a
                key={title}
                title={title}
                className="w-8 h-8 rounded-lg border border-stone-200 bg-white flex items-center justify-center text-stone-400 hover:text-stone-800 hover:border-stone-300 hover:bg-stone-50 transition-all"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Cột 2 — Dịch vụ */}
        <div>
          <h3 className="text-[13px] font-medium tracking-[1.4px] uppercase mb-4">
            Dịch vụ
          </h3>
          <div className="flex flex-col gap-2.5">
            {services.map((s) => (
              <span key={s} className="text-sm">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Cột 3 — Ưu đãi */}
        <div>
          <h3 className="text-[13px] font-medium tracking-[1.4px] uppercase mb-4">
            Ưu đãi
          </h3>
          <div className="flex flex-col gap-2.5">
            {promotions.map((p) => (
              <span key={p} className="text-sm ">
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Cột 4 — Liên hệ */}
        <div>
          <h3 className="text-[13px] font-medium tracking-[1.4px] uppercase mb-4">
            Liên hệ
          </h3>
          <div className="flex flex-col gap-3">
            {contacts.map(({ label, icon }) => (
              <div key={label} className="flex items-start gap-2.5 text-sm">
                {icon}
                <span className="leading-snug">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="border-t border-stone-200 max-w-7xl mx-auto px-6 md:px-12 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <span className="text-xs text-stone-400">
          © 2026 Tiệm giặt Bé Gấu. All rights reserved.
        </span>
        <nav className="flex flex-wrap justify-center gap-5">
          {navLinks.map((link) => (
            <a key={link} href="#" className="text-xs text-stone-400 hover:text-stone-700 transition-colors no-underline">
              {link}
            </a>
          ))}
        </nav>
      </div>

    </footer>
  );
}