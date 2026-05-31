"use client";

import React, { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlarmCheck,
  BarChart3,
  Blocks,
  Calendar,
  ChevronDown,
  CircleCheckBig,
  Gift,
  HeartHandshake,
  Image,
  LayoutDashboard,
  ListChecks,
  LogIn,
  MapPinSearch,
  Medal,
  MessageCircleQuestionMark,
  Package,
  PackageOpen,
  Panda,
  PanelLeft,
  Phone,
  PiggyBank,
  Target,
  Ticket,
  UserPlus,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GradientText } from "../ui/gradient-text";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type NavGroup = {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: "Giới thiệu",
    icon: LayoutDashboard,
    items: [
      { label: "Tổng quan", href: "/#overview", icon: LayoutDashboard },
      { label: "Sứ mệnh", href: "/#mission", icon: Target },
      { label: "Số liệu", href: "/#stats", icon: BarChart3 },
      { label: "Hình ảnh", href: "/#gallery", icon: Image },
    ],
  },
  {
    label: "Dịch vụ",
    icon: Blocks,
    items: [
      { label: "Danh mục", href: "/services#catalog", icon: Blocks },
      { label: "Bảng giá", href: "/services#rates", icon: PiggyBank },
      {
        label: "Thời gian xử lý",
        href: "/services#turnaround",
        icon: AlarmCheck,
      },
      { label: "Cam kết", href: "/services#assurance", icon: Medal },
    ],
  },
  {
    label: "Quy trình",
    icon: Workflow,
    items: [
      { label: "Quy trình", href: "/process#workflow", icon: Workflow },
      { label: "Các bước", href: "/process#stages", icon: ListChecks },
      { label: "Giao nhận", href: "/process#pickup", icon: Package },
      { label: "Theo dõi", href: "/process#tracking", icon: CircleCheckBig },
    ],
  },
  {
    label: "Ưu đãi",
    icon: Gift,
    items: [
      { label: "Ưu đãi", href: "/promotions#offers", icon: Gift },
      { label: "Mã giảm giá", href: "/promotions#coupons", icon: Ticket },
      { label: "Gói ưu đãi", href: "/promotions#bundles", icon: PackageOpen },
      {
        label: "Giới thiệu",
        href: "/promotions#referrals",
        icon: HeartHandshake,
      },
    ],
  },
  {
    label: "Liên hệ",
    icon: Phone,
    items: [
      { label: "Liên hệ", href: "/contact#reach", icon: Phone },
      { label: "Địa điểm", href: "/contact#location", icon: MapPinSearch },
      { label: "Giờ hoạt động", href: "/contact#hours", icon: Calendar },
      {
        label: "Hỗ trợ",
        href: "/contact#support",
        icon: MessageCircleQuestionMark,
      },
    ],
  },
];

export default function SidebarMobile({ onClick }: { onClick: () => void }) {
  const [openGroup, setOpenGroup] = useState(navGroups[0].label);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [accountRole, setAccountRole] = useState("");
  const [accountImageUrl, setAccountImageUrl] = useState("https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif");

  const isLoggedIn = Boolean(accountRole);
  const startPath = accountRole === "admin" ? "/home" : "/user";

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = window.setTimeout(() => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      if (token && role) {
        setAccountName(localStorage.getItem("accountName") || localStorage.getItem("username") || "Tài khoản");
        setAccountRole(role);
        setAccountImageUrl(localStorage.getItem("accountImageUrl") || "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif");
      }

      setIsSessionReady(true);
    }, 0);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[1px]"
      onClick={onClick}
    >
      <aside
        className="absolute inset-y-0 left-0 flex w-[86vw] max-w-[360px] flex-col border-r border-blue-100 bg-white shadow-2xl sm:w-[380px]"
        onClick={(event) => event.stopPropagation()}
        aria-label="Menu điều hướng"
      >
        <div className="flex h-16 items-center justify-between border-b border-blue-100 px-4">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 rounded-lg no-underline outline-none focus-visible:ring-3 focus-visible:ring-blue-500/30"
            onClick={onClick}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-200">
              <Panda className="size-6" />
            </span>
            <GradientText className="truncate text-base font-bold select-none">
              BegauShop
            </GradientText>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            onClick={onClick}
            aria-label="Đóng menu"
          >
            <PanelLeft className="size-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-2">
            {navGroups.map((group) => {
              const GroupIcon = group.icon;
              const isOpen = openGroup === group.label;

              return (
                <li
                  key={group.label}
                  className="rounded-lg border border-blue-100 bg-card"
                >
                  <button
                    type="button"
                    className="flex h-12 w-full items-center justify-between gap-3 rounded-lg px-3 text-left text-sm font-medium text-foreground/85 transition-colors hover:bg-blue-50 hover:text-blue-700"
                    onClick={() =>
                      setOpenGroup(isOpen ? "" : group.label)
                    }
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600 ring-1 ring-blue-200">
                        <GroupIcon className="size-4" />
                      </span>
                      <span className="truncate">{group.label}</span>
                    </span>
                    <ChevronDown
                      className={`size-4 shrink-0 text-blue-600 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t border-blue-100 bg-muted/20 px-3 py-2">
                      <ul className="space-y-1">
                        {group.items.map((item) => {
                          const ItemIcon = item.icon;

                          return (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground no-underline transition-colors hover:bg-blue-50 hover:text-blue-700"
                                onClick={onClick}
                              >
                                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                                  <ItemIcon className="size-4" />
                                </span>
                                <span>{item.label}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-blue-100 p-3">
          {!isSessionReady ? (
            <div className="h-10" aria-hidden="true" />
          ) : isLoggedIn ? (
            <div className="space-y-2">
              <Link
                href={startPath}
                onClick={onClick}
                className="flex min-w-0 items-center gap-2 rounded-lg px-1.5 py-1 text-sm font-medium text-slate-800 no-underline hover:text-blue-700"
              >
                <img
                  src={accountImageUrl}
                  alt=""
                  className="size-8 shrink-0 rounded-full object-cover"
                />
                <span className="truncate">{accountName}</span>
              </Link>
              {accountRole === "admin" && (
                <div className="grid grid-cols-1 gap-2">
                  <Button variant="secondary" className="h-10 bg-blue-50 text-blue-700 hover:bg-blue-100" asChild>
                    <Link href="/home" onClick={onClick}>
                      Admin
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                className="h-10 bg-blue-50 text-blue-700 hover:bg-blue-100"
                asChild
              >
                <Link href="/login" onClick={onClick}>
                  <LogIn className="size-4" />
                  Đăng nhập
                </Link>
              </Button>
              <Button className="h-10 bg-blue-600 text-white hover:bg-blue-700" asChild>
                <Link href="/register" onClick={onClick}>
                  <UserPlus className="size-4" />
                  Đăng kí
                </Link>
              </Button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
