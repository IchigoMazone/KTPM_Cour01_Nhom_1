"use client";

import {
  Clock,
  Mail,
  MapPinCheck,
  MessageSquareText,
  Panda,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { GradientText } from "../ui/gradient-text";

const contacts = [
  {
    label: "0123 456 789",
    href: "tel:0123456789",
    icon: Phone,
  },
  {
    label: "Zalo: 0123 456 789",
    href: "https://zalo.me/begausop",
    icon: MessageSquareText,
  },
  {
    label: "begaushop123@gmail.com",
    href: "mailto:begaushop123@gmail.com",
    icon: Mail,
  },
  {
    label: "47 Ngõ 52 Tô Ngọc Vân, Tây Hồ, Hà Nội",
    href: "/contact#location",
    icon: MapPinCheck,
  },
];

const linkGroups = [
  {
    title: "Dịch vụ",
    links: [
      { label: "Danh mục dịch vụ", href: "/services#catalog" },
      { label: "Bảng giá", href: "/services#rates" },
      { label: "Thời gian xử lý", href: "/services#turnaround" },
      { label: "Cam kết chất lượng", href: "/services#assurance" },
    ],
  },
  {
    title: "Ưu đãi",
    links: [
      { label: "Ưu đãi đặc biệt", href: "/promotions#offers" },
      { label: "Mã giảm giá", href: "/promotions#coupons" },
      { label: "Combo tiết kiệm", href: "/promotions#bundles" },
      { label: "Giới thiệu bạn bè", href: "/promotions#referrals" },
    ],
  },
];

const navLinks = [
  { label: "Giới thiệu", href: "/" },
  { label: "Dịch vụ", href: "/services" },
  { label: "Quy trình", href: "/process" },
  { label: "Ưu đãi", href: "/promotions" },
  { label: "Liên hệ", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-blue-100 bg-white">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.35fr_0.85fr_0.85fr_1.25fr] lg:px-8">
        <div className="space-y-5">
          <Link href="/" className="inline-flex items-center gap-2 no-underline">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-200">
              <Panda className="size-6" />
            </div>
            <span className="text-lg font-semibold">
              <GradientText className="select-none">BegauShop</GradientText>
            </span>
          </Link>

          <p className="max-w-xs text-sm leading-6 text-muted-foreground">
            Giặt là chuyên nghiệp, giao nhận tận nơi và chăm sóc từng chất liệu
            đúng tiêu chuẩn.
          </p>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className="rounded-full bg-blue-50 text-blue-700"
            >
              <Clock className="size-3" />
              7:00 - 22:00
            </Badge>
            <Badge
              variant="secondary"
              className="rounded-full bg-blue-50 text-blue-700"
            >
              Free 5km
            </Badge>
          </div>
        </div>

        {linkGroups.map((group) => (
          <div key={group.title}>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[1.4px] text-foreground">
              {group.title}
            </h3>
            <nav className="flex flex-col gap-2.5">
              {group.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground no-underline transition-colors hover:text-blue-600"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        ))}

        <div>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[1.4px] text-foreground">
            Liên hệ
          </h3>
          <div className="flex flex-col gap-3">
            {contacts.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group flex items-start gap-3 rounded-lg p-1.5 no-underline transition-colors hover:bg-blue-50"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-200 group-hover:bg-white">
                    <Icon className="size-4" />
                  </span>
                  <span className="pt-1 text-sm leading-5 text-muted-foreground group-hover:text-blue-700">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-blue-100">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 sm:px-6 md:flex-row lg:px-8">
          <span className="text-xs text-muted-foreground">
            © 2026 Tiệm giặt Bé Gấu. All rights reserved.
          </span>

          <nav className="flex flex-wrap justify-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-muted-foreground no-underline transition-colors hover:text-blue-600"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
