"use client";

import React, { useRef, useEffect } from "react";
import {
  BarChart3,
  LayoutDashboard,
  Menu as M,
  Panda,
  Target,
  Image,
  Blocks,
  Coins,
  PiggyBank,
  AlarmCheck,
  Medal,
  Workflow,
  ListChecks,
  Package,
  CircleCheckBig,
  Gift,
  Ticket,
  PackageOpen,
  HeartHandshake,
  Phone,
  MapPinSearch,
  Calendar,
  MessageCircle,
  MessageCircleQuestionMark,
} from "lucide-react";
import Dropdown from "../ui/dropdown";
import { useRouter, usePathname } from "next/navigation";
import { IconType } from "../../types/icon-interface";
import { GradientText } from "../ui/gradient-text";
import { Button } from "../ui/button";
import SidebarMobile from "./sidebar-mobile";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [openNav, setOpenNav] = React.useState(false);
  const icon = React.useRef<IconType>({ x: 32, y: 1.6 });

  const scrollToHash = (hash: string, updateHistory?: string) => {
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
      const el = document.getElementById(hash);
      if (el) {
        obs.disconnect();
        execute(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  };

  useEffect(() => {
    if (!window.location.hash) return;
    scrollToHash(window.location.hash.slice(1));
  }, [pathname]);

  const handleHashNav = (close: () => void, href: string) => {
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
  };

  return (
    <>
      <header className="w-full h-16 fixed top-0 left-0 right-0 bg-white border-b border-[var(--color-divider)] flex flex-cols px-4">
        <div className="flex-2 flex items-center gap-2">
          <Panda
            className="hidden xl:block"
            size={icon.current.x}
            strokeWidth={icon.current.y}
          />
          <M
            className="xl:hidden cursor-pointer"
            size={icon.current.x - 5}
            strokeWidth={icon.current.y}
            onClick={() => setOpenNav(true)}
          />
          <GradientText className="text-[16px] font-bold select-none">
            BegauShop
          </GradientText>
        </div>
        <div className="hidden xl:flex flex-6">
          <nav className="w-full h-full">
            <ul className="h-full flex items-center justify-evenly text-[16px] font-medium">
              <li className="h-full flex items-center">
                <Dropdown
                  trigger={
                    <span className="h-full flex items-center text-[14px] hover:text-blue-500 cursor-pointer select-none">
                      Giới thiệu
                    </span>
                  }
                  position="bottom-center"
                >
                  {({ close }) => (
                    <>
                      <button
                        className="w-full px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2 cursor-pointer select-none"
                        onClick={() => {
                          handleHashNav(close, "/#overview");
                        }}
                      >
                        <LayoutDashboard
                          size={icon.current.x - 14}
                          strokeWidth={icon.current.y}
                        />
                        <span>Tổng quan</span>
                      </button>
                      <button
                        className="w-full px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2 cursor-pointer select-none"
                        onClick={() => {
                          handleHashNav(close, "/#mission");
                        }}
                      >
                        <Target
                          size={icon.current.x - 14}
                          strokeWidth={icon.current.y}
                        />
                        <span>Sứ mệnh</span>
                      </button>
                      <button
                        className="w-full px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2 cursor-pointer select-none"
                        onClick={() => {
                          handleHashNav(close, "/#stats");
                        }}
                      >
                        <BarChart3
                          size={icon.current.x - 14}
                          strokeWidth={icon.current.y}
                        />
                        <span>Số liệu</span>
                      </button>
                      <button
                        className="w-full px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2 cursor-pointer select-none"
                        onClick={() => {
                          handleHashNav(close, "/#gallery");
                        }}
                      >
                        <Image
                          size={icon.current.x - 14}
                          strokeWidth={icon.current.y}
                        />
                        <span>Hình ảnh</span>
                      </button>
                    </>
                  )}
                </Dropdown>
              </li>
              <li className="h-full flex items-center">
                <Dropdown
                  trigger={
                    <span className="h-full flex items-center text-[14px] hover:text-blue-500 cursor-pointer select-none">
                      Dịch vụ
                    </span>
                  }
                  position="bottom-center"
                >
                  {({ close }) => (
                    <>
                      <button
                        className="w-full px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2 cursor-pointer select-none"
                        onClick={() => {
                          handleHashNav(close, "/services#catalog");
                        }}
                      >
                        <Blocks
                          size={icon.current.x - 14}
                          strokeWidth={icon.current.y}
                        />
                        <span>Danh mục</span>
                      </button>
                      <button
                        className="w-full px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2 cursor-pointer select-none"
                        onClick={() => {
                          handleHashNav(close, "/services#rates");
                        }}
                      >
                        <PiggyBank
                          size={icon.current.x - 14}
                          strokeWidth={icon.current.y}
                        />
                        <span>Bảng giá</span>
                      </button>
                      <button
                        className="w-full px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2 cursor-pointer select-none"
                        onClick={() => {
                          handleHashNav(close, "/services#turnaround");
                        }}
                      >
                        <AlarmCheck
                          size={icon.current.x - 14}
                          strokeWidth={icon.current.y}
                        />
                        <span>Thời gian xử lý</span>
                      </button>
                      <button
                        className="w-full px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2 cursor-pointer select-none"
                        onClick={() => {
                          handleHashNav(close, "/services#assurance");
                        }}
                      >
                        <Medal
                          size={icon.current.x - 14}
                          strokeWidth={icon.current.y}
                        />
                        <span>Cam kết</span>
                      </button>
                    </>
                  )}
                </Dropdown>
              </li>
              <li className="h-full flex items-center">
                <Dropdown
                  trigger={
                    <span className="h-full flex items-center text-[14px] hover:text-blue-500 cursor-pointer select-none">
                      Quy trình
                    </span>
                  }
                  position="bottom-center"
                >
                  {({ close }) => (
                    <>
                      <button
                        className="w-full px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2 cursor-pointer select-none"
                        onClick={() => {
                          handleHashNav(close, "/process#workflow");
                        }}
                      >
                        <Workflow
                          size={icon.current.x - 14}
                          strokeWidth={icon.current.y}
                        />
                        <span>Quy trình</span>
                      </button>
                      <button
                        className="w-full px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2 cursor-pointer select-none"
                        onClick={() => {
                          handleHashNav(close, "/process#stages");
                        }}
                      >
                        <ListChecks
                          size={icon.current.x - 14}
                          strokeWidth={icon.current.y}
                        />
                        <span>Các bước</span>
                      </button>
                      <button
                        className="w-full px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2 cursor-pointer select-none"
                        onClick={() => {
                          handleHashNav(close, "/process#pickup");
                        }}
                      >
                        <Package
                          size={icon.current.x - 14}
                          strokeWidth={icon.current.y}
                        />
                        <span>Giao nhận</span>
                      </button>
                      <button
                        className="w-full px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2 cursor-pointer select-none"
                        onClick={() => {
                          handleHashNav(close, "/process#tracking");
                        }}
                      >
                        <CircleCheckBig
                          size={icon.current.x - 14}
                          strokeWidth={icon.current.y}
                        />
                        <span>Theo dõi</span>
                      </button>
                    </>
                  )}
                </Dropdown>
              </li>
              <li className="h-full flex items-center">
                <Dropdown
                  trigger={
                    <span className="h-full flex items-center text-[14px] hover:text-blue-500 cursor-pointer select-none">
                      Ưu đãi
                    </span>
                  }
                  position="bottom-center"
                >
                  {({ close }) => (
                    <>
                      <button
                        className="w-full px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2 cursor-pointer select-none"
                        onClick={() => {
                          handleHashNav(close, "/promotions#offers");
                        }}
                      >
                        <Gift
                          size={icon.current.x - 14}
                          strokeWidth={icon.current.y}
                        />
                        <span>Ưu đãi</span>
                      </button>
                      <button
                        className="w-full px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2 cursor-pointer select-none"
                        onClick={() => {
                          handleHashNav(close, "/promotions#coupons");
                        }}
                      >
                        <Ticket
                          size={icon.current.x - 14}
                          strokeWidth={icon.current.y}
                        />
                        <span>Mã giảm giá</span>
                      </button>
                      <button
                        className="w-full px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2 cursor-pointer select-none"
                        onClick={() => {
                          handleHashNav(close, "/promotions#bundles");
                        }}
                      >
                        <PackageOpen
                          size={icon.current.x - 14}
                          strokeWidth={icon.current.y}
                        />
                        <span>Gói ưu đãi</span>
                      </button>
                      <button
                        className="w-full px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2 cursor-pointer select-none"
                        onClick={() => {
                          handleHashNav(close, "/promotions#referral");
                        }}
                      >
                        <HeartHandshake
                          size={icon.current.x - 14}
                          strokeWidth={icon.current.y}
                        />
                        <span>Giới thiệu</span>
                      </button>
                    </>
                  )}
                </Dropdown>
              </li>
              <li className="h-full flex items-center">
                <Dropdown
                  trigger={
                    <span className="h-full flex items-center text-[14px] hover:text-blue-500 cursor-pointer select-none">
                      Liên hệ
                    </span>
                  }
                  position="bottom-center"
                >
                  {({ close }) => (
                    <>
                      <button
                        className="w-full px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2 cursor-pointer select-none"
                        onClick={() => {
                          handleHashNav(close, "/contact#reach");
                        }}
                      >
                        <Phone
                          size={icon.current.x - 14}
                          strokeWidth={icon.current.y}
                        />
                        <span>Liên hệ</span>
                      </button>
                      <button
                        className="w-full px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2 cursor-pointer select-none"
                        onClick={() => {
                          handleHashNav(close, "/contact#location");
                        }}
                      >
                        <MapPinSearch
                          size={icon.current.x - 14}
                          strokeWidth={icon.current.y}
                        />
                        <span>Địa điểm</span>
                      </button>
                      <button
                        className="w-full px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2 cursor-pointer select-none"
                        onClick={() => {
                          handleHashNav(close, "/contact#hours");
                        }}
                      >
                        <Calendar
                          size={icon.current.x - 14}
                          strokeWidth={icon.current.y}
                        />
                        <span>Giờ hoạt động</span>
                      </button>
                      <button
                        className="w-full px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2 cursor-pointer select-none"
                        onClick={() => {
                          handleHashNav(close, "/contact#support");
                        }}
                      >
                        <MessageCircleQuestionMark
                          size={icon.current.x - 14}
                          strokeWidth={icon.current.y}
                        />
                        <span>Hỗ trợ</span>
                      </button>
                    </>
                  )}
                </Dropdown>
              </li>
            </ul>
          </nav>
        </div>
        <div className="flex-2 flex items-center justify-end gap-2">
          <Button
            className="cursor-pointer"
            onClick={() => router.push("/login")}
          >
            Đăng nhập
          </Button>
          <Button
            className="cursor-pointer"
            onClick={() => router.push("/register")}
          >
            Đăng kí
          </Button>
        </div>
      </header>
      {openNav && <SidebarMobile onClick={() => setOpenNav(false)} />}
    </>
  );
}
