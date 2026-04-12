"use client";

import {
  Mail,
  MapPinCheck,
  MessageSquareText,
  Panda,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { GradientText } from "../ui/gradient-text";

const contacts = [
  {
    label: "0123 456 789",
    icon: <Phone size="16" strokeWidth="1.6" />,
  },
  {
    label: "Zalo: 0123 456 789",
    icon: <MessageSquareText size="16" strokeWidth="1.6" />,
  },
  {
    label: "begaushop123@gmail.com",
    icon: <Mail size="16" strokeWidth="1.6" />,
  },
  {
    label: "47 Ngõ 52 Tô Ngọc Vân, Tây Hồ, Hà Nội",
    icon: <MapPinCheck size="16" strokeWidth="1.6" />,
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

const navLinks = [
  { id: 1, category: "Giới thiệu", href: "/" },
  { id: 2, category: "Dịch vụ", href: "/services" },
  { id: 3, category: "Quy trình", href: "/process" },
  { id: 4, category: "Ưu đãi", href: "/promotions" },
  { id: 5, category: "Liên hệ", href: "/contact" },
];

const socials = [];

export default function Footer() {
  return (
    <footer className="bg-[#faf9f7] border-t border-[var(--color-divider)] text-stone-700">
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-14 pb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.4fr] gap-10 lg:gap-12">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-1">
            <div className="w-9 h-9 flex items-center justify-center shrink-0">
              <Panda />
            </div>
            <span className="text-lg font-semibold ">
              <GradientText>BegauShop</GradientText>
            </span>
          </div>
          <p className="text-sm text-stone-500 leading-relaxed max-w-[240px]">
            Giặt là chuyên nghiệp, giao nhận tận nơi — an tâm cho từng sợi vải.
          </p>
          <div className="inline-flex items-center gap-2 w-fit">
            <span className="text-xs text-stone-500">
              Mở cửa hằng ngày · 7:00 – 22:00
            </span>
          </div>
          <div className="flex gap-2">
            {socials.length > 0 &&
              socials.map(({ title, icon }) => (
                <Link
                  key={title}
                  title={title}
                  className="w-8 h-8 rounded-lg border border-stone-200 bg-white flex items-center justify-center text-stone-400 hover:text-stone-800 hover:border-stone-300 hover:bg-stone-50 transition-all"
                >
                  {icon}
                </Link>
              ))}
          </div>
        </div>
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
            <Link
              key={link.id}
              href={link.href}
              className="text-xs text-stone-400 hover:text-stone-700 transition-colors no-underline"
            >
              {link.category}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
