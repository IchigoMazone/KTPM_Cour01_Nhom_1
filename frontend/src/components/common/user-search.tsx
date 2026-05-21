"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  CalendarPlus,
  Gift,
  Headset,
  Menu,
  PackageSearch,
  SearchIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NotificationsDialog from "./notifications-dialog";
import { useNavbarStore } from "@/src/context/useNavbarStore";

const userCommands = [
  { label: "Đặt lịch lấy đồ mới", path: "/user/bookings", meta: "Đặt lịch" },
  { label: "Theo dõi đơn đang giặt", path: "/user/orders", meta: "Đơn hàng" },
  { label: "Dùng mã giảm giá", path: "/user/loyalty", meta: "Ưu đãi" },
  { label: "Gửi yêu cầu hỗ trợ", path: "/user/support", meta: "Hỗ trợ" },
];

const pageTitles: Record<string, string> = {
  "/user": "Tổng Quan Cá Nhân",
  "/user/bookings": "Đặt Lịch",
  "/user/orders": "Đơn Của Tôi",
  "/user/loyalty": "Ưu Đãi",
  "/user/support": "Hỗ Trợ",
};

const userLinks = [
  { label: "Tổng quan", path: "/user" },
  { label: "Đặt lịch", path: "/user/bookings" },
  { label: "Đơn của tôi", path: "/user/orders" },
  { label: "Ưu đãi", path: "/user/loyalty" },
  { label: "Hỗ trợ", path: "/user/support" },
];

export default function UserSearch() {
  const { toggle } = useNavbarStore();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return userCommands;
    return userCommands.filter((item) =>
      `${item.label} ${item.meta}`.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query]);

  const title = pageTitles[pathname] ?? "Khu vực khách hàng";

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

        <div className="hidden min-w-[150px] shrink-0 md:block lg:min-w-[180px]">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">Tiệm giặt Panda</p>
        </div>

        <div className="hidden shrink-0 items-center gap-1 xl:flex">
          {userLinks.map((link) => (
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
            placeholder="Tìm lịch hẹn, đơn giặt, ưu đãi..."
          />
          {focused && (
            <div className="absolute left-0 right-0 top-12 z-[1100] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
              <div className="border-b px-3 py-2 text-xs font-medium text-muted-foreground">
                Thao tác nhanh
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
          <span>2</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="hidden shrink-0 gap-2 lg:flex"
          onClick={() => router.push("/user/loyalty")}
        >
          <Gift className="size-4" />
          Ưu đãi
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="hidden shrink-0 gap-2 lg:flex"
          onClick={() => router.push("/user/support")}
        >
          <Headset className="size-4" />
          Hỗ trợ
        </Button>
        <Button
          size="sm"
          className="hidden shrink-0 gap-2 bg-neutral-900 text-white hover:bg-neutral-800 sm:flex"
          onClick={() => router.push("/user/bookings")}
        >
          <CalendarPlus className="size-4" />
          Đặt lịch
        </Button>
      </div>
      </div>
      <NotificationsDialog
        isUserArea
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
    </>
  );
}
