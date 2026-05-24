"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarPlus,
  Menu,
  PackageSearch,
  SearchIcon,
  Sparkles,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import NotificationsDialog from "./notifications-dialog";
import { useNavbarStore } from "@/src/context/useNavbarStore";
import { useSettingsStore } from "@/src/context/useSettingsStore";

const dashboardCommands = [
  { label: "Tạo đơn giặt mới", path: "/home/orders", meta: "Đơn hàng" },
  { label: "Lịch giao nhận hôm nay", path: "/home/delivery", meta: "Giao nhận" },
  { label: "Tìm khách hàng thân thiết", path: "/home/customers", meta: "Khách hàng" },
  { label: "Cấu hình bảng giá", path: "/home/services", meta: "Dịch vụ" },
  { label: "Mã giảm giá & loyalty", path: "/home/services", meta: "Ưu đãi" },
  { label: "Kho vật tư sắp hết", path: "/home/staff", meta: "Vận hành" },
  { label: "Phân quyền nhân viên", path: "/home/reports", meta: "Cài đặt" },
  { label: "Template SMS/Zalo", path: "/home/reports", meta: "Thông báo" },
];

const landingLinks = [
  { label: "Giới thiệu", path: "/" },
  { label: "Dịch vụ", path: "/services" },
  { label: "Quy trình", path: "/process" },
  { label: "Ưu đãi", path: "/promotions" },
  { label: "Liên hệ", path: "/contact" },
];

const pageTitles: Record<string, string> = {
  "/home": "Tổng quan",
  "/home/orders": "Quản lý Đơn Hàng",
  "/home/delivery": "Quản lý Giao Nhận",
  "/home/customers": "Khách Hàng",
  "/home/services": "Dịch Vụ & Tài Chính",
  "/home/staff": "Vận Hành Nội Bộ",
  "/home/reports": "Báo Cáo & Cài Đặt",
};

export default function Search() {
  const { toggle } = useNavbarStore();
  const router = useRouter();
  const pathname = usePathname();
  const { deliveryEnabled } = useSettingsStore();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const results = useMemo(() => {
    const commands = dashboardCommands.filter((item) => {
      if (item.path === "/home/delivery" && mounted && !deliveryEnabled) {
        return false;
      }
      return true;
    });

    if (!query.trim()) return commands.slice(0, 5);
    return commands.filter((item) =>
      `${item.label} ${item.meta}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, deliveryEnabled, mounted]);

  const title = pageTitles[pathname] ?? "Dashboard";

  return (
    <>
      <div className="relative z-[1000] min-h-16 border-b border-gray-200 bg-white/95 px-3 backdrop-blur sm:px-4">
      <div className="flex min-h-16 min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          aria-label="Mở menu"
          className="flex size-10 cursor-pointer items-center justify-center rounded-lg text-black transition-colors hover:bg-[#f3f3f3] xl:hidden"
          onClick={toggle}
        >
          <Menu size={24} strokeWidth={1.7} />
        </button>

        <div className="hidden min-w-[150px] shrink-0 md:block lg:min-w-[170px]">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">Điều phối tiệm giặt</p>
        </div>

        <div className="hidden shrink-0 items-center gap-1 xl:flex">
          {landingLinks.map((link) => (
            <Button
              key={link.path}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:bg-[#f3f3f3] hover:text-black"
              onClick={() => router.push(link.path)}
            >
              {link.label}
            </Button>
          ))}
        </div>

        <div className="relative z-[1001] ml-auto min-w-0 flex-1 lg:max-w-md xl:max-w-lg">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => window.setTimeout(() => setFocused(false), 140)}
            className="h-10 min-w-0 rounded-lg border-gray-200 bg-[#f7f7f7] pl-9 text-sm focus-visible:border-gray-300 focus-visible:ring-gray-300/40"
            placeholder="Tìm đơn, khách, giao nhận..."
          />
          {focused && (
            <div className="absolute left-0 right-0 top-12 z-[1100] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
              <div className="border-b px-3 py-2 text-xs font-medium text-muted-foreground">
                Gợi ý thao tác nhanh
              </div>
              <div className="max-h-72 overflow-y-auto p-1">
                {results.length === 0 ? (
                  <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                    Không tìm thấy thao tác phù hợp.
                  </div>
                ) : (
                  results.map((item) => (
                    <button
                      key={`${item.path}-${item.label}`}
                      type="button"
                      className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-[#f3f3f3]"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setQuery("");
                        setFocused(false);
                        router.push(item.path);
                      }}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <PackageSearch className="size-4 shrink-0 text-muted-foreground" />
                        <span className="truncate">{item.label}</span>
                      </span>
                      <Badge variant="secondary" className="shrink-0 rounded-full bg-[#f3f3f3]">
                        {item.meta}
                      </Badge>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="hidden shrink-0 gap-2 md:flex"
          onClick={() => setNotificationsOpen(true)}
        >
          <Bell className="size-4" />
          <span>5</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="hidden shrink-0 gap-2 lg:flex"
          onClick={() => router.push("/home/orders")}
        >
          <CalendarPlus className="size-4" />
          Đặt lịch
        </Button>
        <Button
          size="sm"
          className="hidden shrink-0 gap-2 bg-neutral-900 text-white hover:bg-neutral-800 sm:flex"
          onClick={() => router.push("/home/orders")}
        >
          <Sparkles className="size-4" />
          Tạo đơn
        </Button>
      </div>
      </div>
      <NotificationsDialog
        isUserArea={false}
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
    </>
  );
}
