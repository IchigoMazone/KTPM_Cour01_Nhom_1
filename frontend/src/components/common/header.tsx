"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlarmCheck,
  BarChart3,
  Blocks,
  Calendar,
  CircleCheckBig,
  Gift,
  HeartHandshake,
  Image,
  LayoutDashboard,
  ListChecks,
  MapPinSearch,
  Medal,
  Menu,
  MessageCircleQuestionMark,
  Package,
  PackageOpen,
  Panda,
  Phone,
  PiggyBank,
  Target,
  Ticket,
  Workflow,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Dropdown from "../ui/dropdown";
import { GradientText } from "../ui/gradient-text";
import SidebarMobile from "./sidebar-mobile";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: "Giới thiệu",
    items: [
      { label: "Tổng quan", href: "/#overview", icon: LayoutDashboard },
      { label: "Sứ mệnh", href: "/#mission", icon: Target },
      { label: "Số liệu", href: "/#stats", icon: BarChart3 },
      { label: "Hình ảnh", href: "/#gallery", icon: Image },
    ],
  },
  {
    label: "Dịch vụ",
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
    items: [
      { label: "Quy trình", href: "/process#workflow", icon: Workflow },
      { label: "Các bước", href: "/process#stages", icon: ListChecks },
      { label: "Giao nhận", href: "/process#pickup", icon: Package },
      { label: "Theo dõi", href: "/process#tracking", icon: CircleCheckBig },
    ],
  },
  {
    label: "Ưu đãi",
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

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [openNav, setOpenNav] = useState(false);

  const scrollToHash = useCallback((hash: string, updateHistory?: string) => {
    const execute = (el: HTMLElement) => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      if (updateHistory) window.history.replaceState(null, "", updateHistory);
    };

    const el = document.getElementById(hash);
    if (el) {
      execute(el);
      return;
    }

    const observer = new MutationObserver((_, obs) => {
      const target = document.getElementById(hash);
      if (target) {
        obs.disconnect();
        execute(target);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }, []);

  useEffect(() => {
    if (!window.location.hash) return;
    scrollToHash(window.location.hash.slice(1));
  }, [pathname, scrollToHash]);

  const handleHashNav = useCallback(
    (close: () => void, href: string) => {
      close();
      const [path = "/", hash] = href.split("#");

      if (!hash) {
        router.push(path);
        return;
      }

      const historyUrl = `${pathname === path ? "" : path}#${hash}`;

      if (pathname === path || (path === "" && pathname === "/")) {
        scrollToHash(hash, historyUrl);
        return;
      }

      router.push(`${path}#${hash}`);
      scrollToHash(hash, historyUrl);
    },
    [pathname, router, scrollToHash],
  );

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-blue-100 bg-white/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 xl:hidden"
              onClick={() => setOpenNav(true)}
              aria-label="Mở menu"
            >
              <Menu className="size-5" />
            </Button>

            <button
              type="button"
              className="flex items-center gap-2 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-blue-500/30"
              onClick={() => router.push("/")}
            >
              <span className="hidden size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-200 sm:flex">
                <Panda className="size-6" />
              </span>
              <GradientText className="text-base font-bold select-none">
                BegauShop
              </GradientText>
            </button>
          </div>

          <nav className="hidden h-full flex-1 items-center justify-center xl:flex">
            <ul className="flex h-full items-center gap-1">
              {navGroups.map((group) => (
                <li key={group.label} className="flex h-full items-center">
                  <Dropdown
                    trigger={
                      <span className="flex h-9 items-center rounded-lg px-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-blue-50 hover:text-blue-700">
                        {group.label}
                      </span>
                    }
                    position="bottom-center"
                    className="min-w-[220px] border-blue-100 shadow-xl"
                  >
                    {({ close }) => (
                      <div className="space-y-1">
                        {group.items.map((item) => {
                          const Icon = item.icon;

                          return (
                            <button
                              key={item.href}
                              className="flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground/80 transition-colors hover:bg-blue-50 hover:text-blue-700"
                              onClick={() => handleHashNav(close, item.href)}
                            >
                              <span className="flex size-7 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                                <Icon className="size-4" />
                              </span>
                              <span>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </Dropdown>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              className="hidden bg-blue-50 text-blue-700 hover:bg-blue-100 sm:inline-flex"
              onClick={() => router.push("/login")}
            >
              Đăng nhập
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => router.push("/register")}
            >
              Đăng kí
            </Button>
          </div>
        </div>
      </header>

      {openNav && <SidebarMobile onClick={() => setOpenNav(false)} />}
    </>
  );
}
