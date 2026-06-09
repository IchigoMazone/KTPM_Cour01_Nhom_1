"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Menu,
  PackageSearch,
  RotateCcw,
  SearchIcon,
  X,
} from "lucide-react";
import { vi } from "date-fns/locale";
import { usePathname, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import MemoPopover from "./memo-popover";
import NotificationsDialog from "./notifications-dialog";
import { useNavbarStore } from "@/src/context/useNavbarStore";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import {
  addDays,
  createRange,
  DateRange,
  dateFormatter,
  differenceInDays,
  formatRange,
  normalizeRange,
  RangeMode,
  rangeModes,
  shiftRange,
  startOfDay,
} from "@/src/utils/dashboard-time";

const userCommands = [
  { label: "Đặt lịch lấy đồ mới", path: "/user/bookings", meta: "Đặt lịch" },
  { label: "Theo dõi đơn đang giặt", path: "/user/orders", meta: "Đơn hàng" },
  { label: "Dùng mã giảm giá", path: "/user/loyalty", meta: "Ưu đãi" },
  { label: "Gửi yêu cầu hỗ trợ", path: "/user/support", meta: "Hỗ trợ" },
  { label: "Xem tổng quan tài khoản", path: "/user", meta: "Tổng quan" },
];

const pageTitles: Record<string, string> = {
  "/user": "Tổng quan",
  "/user/bookings": "Đặt lịch",
  "/user/orders": "Đơn của tôi",
  "/user/loyalty": "Ưu đãi",
  "/user/support": "Hỗ trợ",
};

function UserTimeRangeControl() {
  const { range, setRange } = useDashboardTimeRangeStore();
  const normalizedRange = normalizeRange(range);
  const rangeLabel = formatRange(normalizedRange);
  const [open, setOpen] = useState(false);
  const [draftRange, setDraftRange] = useState<DateRange>(normalizedRange);
  const draftNormalizedRange = normalizeRange(draftRange);
  const draftRangeLabel = formatRange(draftNormalizedRange);
  const draftDayCount =
    differenceInDays(draftNormalizedRange.start, draftNormalizedRange.end) + 1;

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setDraftRange(normalizedRange);
    setOpen(nextOpen);
  };

  const handleModeChange = (mode: RangeMode) => {
    if (mode === "custom") {
      setDraftRange((current) => ({ ...current, mode: "custom" }));
      return;
    }

    setDraftRange(createRange(mode, draftNormalizedRange.start));
  };

  const setQuickRange = (days: number) => {
    const today = startOfDay(new Date());
    setDraftRange({
      mode: days === 1 ? "day" : "custom",
      start: addDays(today, 1 - days),
      end: today,
    });
  };

  const confirmRange = () => {
    setRange(draftNormalizedRange);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="flex h-8 min-w-0 shrink-0 gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-600 shadow-none transition-colors hover:bg-slate-50 hover:text-slate-800"
        >
          <CalendarDays className="size-4" />
          <span className="hidden max-w-[150px] truncate sm:inline">
            {rangeLabel}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="max-w-[min(92vw,560px)] gap-0 overflow-hidden rounded-2xl border-gray-200 bg-white p-0 shadow-2xl sm:max-w-[560px]"
      >
        <div className="flex items-start justify-between gap-3 border-b px-4 py-3">
          <div className="min-w-0">
            <DialogTitle className="text-base font-semibold">
              Bộ lọc thời gian
            </DialogTitle>
            <p className="truncate text-xs text-muted-foreground">
              Sẽ áp dụng {draftRangeLabel} · {draftDayCount} ngày dữ liệu
            </p>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setDraftRange(shiftRange(draftNormalizedRange, -1))}
              aria-label="Kỳ trước"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() =>
                setDraftRange(createRange(draftNormalizedRange.mode === "custom" ? "day" : draftNormalizedRange.mode))
              }
              aria-label="Hiện tại"
            >
              <RotateCcw className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setDraftRange(shiftRange(draftNormalizedRange, 1))}
              aria-label="Kỳ sau"
            >
              <ChevronRight className="size-4" />
            </Button>
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg border border-transparent text-muted-foreground hover:border-gray-200 hover:bg-gray-100 hover:text-black"
                aria-label="Đóng bộ lọc thời gian"
              >
                <X className="size-4" />
              </Button>
            </DialogClose>
          </div>
        </div>

        <div className="space-y-3 bg-gray-50/60 p-4">
          <div className="flex overflow-x-auto rounded-lg border bg-background p-1">
            {rangeModes.map((mode) => (
              <Button
                key={mode.value}
                type="button"
                variant={draftNormalizedRange.mode === mode.value ? "default" : "ghost"}
                size="sm"
                className={`shrink-0 ${draftNormalizedRange.mode === mode.value ? "bg-neutral-900 text-white" : ""}`}
                onClick={() => handleModeChange(mode.value)}
              >
                {mode.label}
              </Button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Từ ngày
              </span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full justify-start gap-2 rounded-lg bg-background px-3 text-left font-normal"
                  >
                    <CalendarDays className="size-4 text-muted-foreground" />
                    <span className="truncate">
                      {dateFormatter.format(draftNormalizedRange.start)}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="z-[2101] w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={draftNormalizedRange.start}
                    onSelect={(selected) => {
                      if (!selected) return;
                      setDraftRange((current) =>
                        normalizeRange({
                          ...current,
                          mode: "custom",
                          start: selected,
                        }),
                      );
                    }}
                    locale={vi}
                    className="[--cell-size:2.35rem]"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Đến ngày
              </span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full justify-start gap-2 rounded-lg bg-background px-3 text-left font-normal"
                  >
                    <CalendarDays className="size-4 text-muted-foreground" />
                    <span className="truncate">
                      {dateFormatter.format(draftNormalizedRange.end)}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="z-[2101] w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={draftNormalizedRange.end}
                    onSelect={(selected) => {
                      if (!selected) return;
                      setDraftRange((current) =>
                        normalizeRange({
                          ...current,
                          mode: "custom",
                          end: selected,
                        }),
                      );
                    }}
                    locale={vi}
                    className="[--cell-size:2.35rem]"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              ["Hôm nay", 1],
              ["7 ngày", 7],
              ["30 ngày", 30],
            ].map(([label, days]) => (
              <Button
                key={label}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickRange(Number(days))}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t bg-white px-4 py-3">
          <DialogClose asChild>
            <Button type="button" variant="outline" size="sm">
              Hủy
            </Button>
          </DialogClose>
          <Button
            type="button"
            size="sm"
            className="bg-neutral-900 text-white hover:bg-neutral-800"
            onClick={confirmRange}
          >
            Xác nhận
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function UserSearch() {
  const { toggle } = useNavbarStore();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return userCommands.slice(0, 5);
    return userCommands.filter((item) =>
      `${item.label} ${item.meta}`.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query]);

  const title = pageTitles[pathname] ?? "Khu vực khách hàng";

  return (
    <>
      <div className="relative z-[1000] min-h-12 border-b border-slate-200 bg-white px-5">
        <div className="flex min-h-12 min-w-0 items-center gap-2">
          <button
            type="button"
            aria-label="Mở menu"
            className="flex size-10 cursor-pointer items-center justify-center rounded-lg text-black transition-colors hover:bg-[#f3f3f3] xl:hidden"
            onClick={toggle}
          >
            <Menu size={24} strokeWidth={1.7} />
          </button>

          <div className="hidden items-center gap-1.5 text-sm font-medium text-slate-400 md:flex">
            <ChevronRight className="size-4 text-slate-400" />
            <span className="font-semibold text-slate-800">{title}</span>
          </div>

          <div className="ml-auto shrink-0">
            <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="size-8 rounded-md border border-slate-200 bg-white text-slate-600 shadow-none transition-colors hover:bg-slate-50 hover:text-slate-800"
                  aria-label="Tìm kiếm"
                >
                  <SearchIcon className="size-4" />
                </Button>
              </DialogTrigger>
              <DialogContent
                showCloseButton={false}
                className="max-w-[min(92vw,520px)] gap-0 overflow-hidden rounded-2xl border-gray-200 bg-white p-0 shadow-2xl sm:max-w-[520px]"
              >
                <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                  <div className="min-w-0">
                    <DialogTitle className="text-base font-semibold">
                      Tìm kiếm nhanh
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground">
                      Tìm lịch hẹn, đơn giặt, ưu đãi và hỗ trợ
                    </p>
                  </div>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 shrink-0 rounded-lg border border-transparent text-muted-foreground hover:border-gray-200 hover:bg-gray-100 hover:text-black"
                      aria-label="Đóng tìm kiếm"
                    >
                      <X className="size-4" />
                    </Button>
                  </DialogClose>
                </div>

                <div className="border-b bg-gray-50/60 p-4">
                  <div className="relative">
                    <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      className="h-11 min-w-0 rounded-lg border-gray-200 bg-white pl-9 text-sm shadow-sm focus-visible:border-gray-300 focus-visible:ring-gray-300/40"
                      placeholder="Tìm đơn, lịch hẹn, ưu đãi..."
                      autoFocus
                    />
                  </div>
                </div>
                <div className="border-b px-4 py-2 text-xs font-medium text-muted-foreground">
                  Gợi ý thao tác nhanh
                </div>
                <div className="max-h-72 overflow-y-auto p-2">
                  {results.length === 0 ? (
                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                      Không tìm thấy thao tác phù hợp.
                    </div>
                  ) : (
                    results.map((item) => (
                      <button
                        key={`${item.path}-${item.label}`}
                        type="button"
                        className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-[#f3f3f3]"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setQuery("");
                          setSearchOpen(false);
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
              </DialogContent>
            </Dialog>
          </div>

          <UserTimeRangeControl />
          <Button
            variant="ghost"
            className="hidden h-8 shrink-0 gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-600 shadow-none transition-colors hover:bg-slate-50 hover:text-slate-800 md:flex"
            onClick={() => setNotificationsOpen(true)}
          >
            <Bell className="size-4" />
            <span>2</span>
          </Button>
          <MemoPopover className="hidden h-8 shrink-0 gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-600 shadow-none transition-colors hover:bg-slate-50 hover:text-slate-800 lg:flex" />
          <Button
            className="hidden h-8 shrink-0 gap-1.5 rounded-md bg-slate-900 px-3 text-xs font-medium text-white transition-colors hover:bg-slate-800 sm:flex"
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
