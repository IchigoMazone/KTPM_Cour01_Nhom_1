"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Menu,
  PackageSearch,
  RotateCcw,
  SearchIcon,
  Sparkles,
  X,
} from "lucide-react";
import { vi } from "date-fns/locale";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import MemoPopover from "./memo-popover";
import NotificationsDialog from "./notifications-dialog";
import { useDashboardSettingsStore } from "@/src/context/useDashboardSettingsStore";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import { useNavbarStore } from "@/src/context/useNavbarStore";
import {
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
  addDays,
} from "@/src/utils/dashboard-time";

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

const pageTitles: Record<string, string> = {
  "/home": "Tổng quan",
  "/home/orders": "Đơn hàng",
  "/home/delivery": "Giao nhận",
  "/home/customers": "Khách hàng",
  "/home/services": "Dịch vụ & Tài chính",
  "/home/staff": "Vận hành nội bộ",
  "/home/reports": "Báo cáo & Cài đặt",
};

function DashboardTimeRangeControl() {
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
          className="flex h-9 min-w-0 shrink-0 gap-2 rounded-lg border border-slate-200 bg-white px-3 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-none"
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
                <PopoverContent align="start" className="w-auto p-0">
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
                <PopoverContent align="start" className="w-auto p-0">
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

export default function Search() {
  const { toggle } = useNavbarStore();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const deliveryEnabled = useDashboardSettingsStore((state) => state.deliveryEnabled);

  const results = useMemo(() => {
    const commands = dashboardCommands.filter(
      (item) => deliveryEnabled || item.path !== "/home/delivery",
    );

    if (!query.trim()) return commands.slice(0, 5);
    return commands.filter((item) =>
      `${item.label} ${item.meta}`.toLowerCase().includes(query.toLowerCase()),
    );
  }, [deliveryEnabled, query]);

  const title = pageTitles[pathname] ?? "Dashboard";

  return (
    <>
      <div className="relative z-[1000] min-h-16 border-b border-slate-200 bg-white px-3 sm:px-4">
      <div className="flex min-h-16 min-w-0 items-center gap-2 sm:gap-3">
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
          <span className="text-slate-800 font-semibold">{title}</span>
        </div>

        <div className="ml-auto shrink-0">
          <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="size-10 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-none"
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
                    Tìm đơn hàng, khách hàng và thao tác quản trị
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
                    placeholder="Tìm đơn, khách, giao nhận..."
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

        <DashboardTimeRangeControl />
        <Button
          variant="ghost"
          className="hidden h-9 shrink-0 gap-2 md:flex rounded-lg border border-slate-200 bg-white px-3 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-none"
          onClick={() => setNotificationsOpen(true)}
        >
          <Bell className="size-4" />
          <span>5</span>
        </Button>
        <MemoPopover className="hidden h-9 shrink-0 gap-2 lg:flex rounded-lg border border-slate-200 bg-white px-3 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-none" />
        <Button
          className="hidden h-9 shrink-0 gap-2 bg-slate-900 text-white hover:bg-slate-800 sm:flex rounded-lg px-4 font-medium transition-colors"
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
