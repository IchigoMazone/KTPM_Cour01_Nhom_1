"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Menu,
  MessageCircle,
  PackagePlus,
  RotateCcw,
  X,
} from "lucide-react";
import { vi } from "date-fns/locale";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { GlobalOrderCreateDialog } from "./global-order-create-dialog";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import { useNavbarStore } from "@/src/context/useNavbarStore";
import { homeApi } from "@/src/lib/home-api";
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

const pageTitles: Record<string, string> = {
  "/home": "Tổng quan",
  "/home/orders": "Đơn hàng",
  "/home/delivery": "Giao nhận",
  "/home/customers": "Khách hàng",
  "/home/services": "Dịch vụ & Tài chính",
  "/home/staff": "Vận hành nội bộ",
  "/home/support": "Hỗ trợ",
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
          className="flex h-8 min-w-[250px] shrink-0 gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-600 shadow-none transition-colors hover:bg-slate-50 hover:text-slate-800"
        >
          <CalendarDays className="size-4" />
          <span className="hidden whitespace-nowrap sm:inline">
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

export default function Search() {
  const { toggle } = useNavbarStore();
  const router = useRouter();
  const pathname = usePathname();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  const loadMessageCount = useCallback(() => {
    Promise.allSettled([
      homeApi<Array<{ status?: string }>>("/support-tickets/full", { cache: "no-store" }),
      homeApi<{ appointments?: unknown[] }>("/dashboard/overview", { cache: "no-store" }),
    ]).then(([ticketResult, overviewResult]) => {
      const openTickets = ticketResult.status === "fulfilled"
        ? ticketResult.value.filter((ticket) => ticket.status !== "Đã giải quyết").length
        : 0;
      const appointments = overviewResult.status === "fulfilled"
        ? overviewResult.value.appointments?.length || 0
        : 0;
      setMessageCount(openTickets);
      setNotificationCount(openTickets + appointments);
    });
  }, []);

  useEffect(() => {
    loadMessageCount();
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") loadMessageCount();
    };
    const handleRefreshEvents = () => {
      loadMessageCount();
    };
    window.addEventListener("focus", loadMessageCount);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("orders:created", handleRefreshEvents);
    window.addEventListener("booking-request:created", handleRefreshEvents);
    window.addEventListener("booking-requests-changed", handleRefreshEvents);
    window.addEventListener("home-orders-changed", handleRefreshEvents);
    return () => {
      window.removeEventListener("focus", loadMessageCount);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("orders:created", handleRefreshEvents);
      window.removeEventListener("booking-request:created", handleRefreshEvents);
      window.removeEventListener("booking-requests-changed", handleRefreshEvents);
      window.removeEventListener("home-orders-changed", handleRefreshEvents);
    };
  }, [loadMessageCount]);

  const title = pageTitles[pathname] ?? "Dashboard";
  const openCreateOrder = () => {
    if (pathname === "/home/orders") {
      window.dispatchEvent(new Event("orders:create"));
      return;
    }
    setCreateOrderOpen(true);
  };

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
          <span className="text-slate-800 font-semibold">{title}</span>
        </div>

        <div className="ml-auto" />

        <DashboardTimeRangeControl />
        <Button
          variant="ghost"
          className="hidden h-8 shrink-0 gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-600 shadow-none transition-colors hover:bg-slate-50 hover:text-slate-800 md:flex"
          onClick={() => {
            setNotificationsOpen(false);
            setMessagesOpen(true);
          }}
        >
          <MessageCircle className="size-4" />
          <span>{messageCount}</span>
        </Button>
        <Button
          variant="ghost"
          className="hidden h-8 shrink-0 gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-600 shadow-none transition-colors hover:bg-slate-50 hover:text-slate-800 md:flex"
          onClick={() => {
            setMessagesOpen(false);
            setNotificationsOpen(true);
          }}
        >
          <Bell className="size-4" />
          <span>{notificationCount}</span>
        </Button>
        <MemoPopover className="hidden h-8 shrink-0 gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-600 shadow-none transition-colors hover:bg-slate-50 hover:text-slate-800 lg:flex" />
        <Button
          className="hidden h-8 shrink-0 gap-1.5 rounded-md bg-slate-900 px-3 text-xs font-medium text-white transition-colors hover:bg-slate-800 sm:flex"
          onClick={openCreateOrder}
        >
          <PackagePlus className="size-4" />
          Tạo đơn
        </Button>
      </div>
      </div>
      <NotificationsDialog
        isUserArea={false}
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
      <NotificationsDialog
        isUserArea={false}
        mode="messages"
        open={messagesOpen}
        onOpenChange={setMessagesOpen}
      />
      <GlobalOrderCreateDialog open={createOrderOpen} onOpenChange={setCreateOrderOpen} />
    </>
  );
}
