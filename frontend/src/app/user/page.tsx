"use client";

import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Gift,
  PackageCheck,
  Settings,
  Sparkles,
  Star,
  StickyNote,
  Wallet,
  WashingMachine,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageShell } from "@/src/app/home/_components/dashboard-primitives";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import { homeApi, mapHomeOrderStatus } from "@/src/lib/home-api";
import { formatRange, normalizeRange, toInputDate } from "@/src/utils/dashboard-time";
import { formatPromotionValue } from "@/src/utils/services";
import type { PromotionType } from "@/src/types/services";

type MyOrderRow = {
  id: string;
  booking_code?: string;
  service?: string;
  quantity?: string;
  delivery_date?: string;
  delivery_time?: string;
  appointment?: string;
  status?: string;
  created_at?: string;
  amount?: number;
  payment?: string;
};

type CustomerProfile = {
  loyalty_points?: number;
  rank?: string;
};

type PromotionClaim = {
  claim_id: string;
  code: string;
  name?: string;
  type?: string;
  value?: string;
  claim_status?: "Đã nhận" | "Đã sử dụng";
  end_date?: string | null;
  status?: string;
};

type SupportTicketRow = {
  id?: string;
  ticket_id?: string;
  status?: string;
  created_at?: string;
};

const chartColors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#06b6d4", "#f43f5e"];

const orderStatusColors: Record<string, string> = {
  "Tiếp nhận": "#6366f1",
  "Đã xác nhận lịch": "#0ea5e9",
  "Đang giặt": "#3b82f6",
  "Kiểm tra": "#8b5cf6",
  "Chờ thanh toán": "#ef4444",
  "Sẵn sàng giao": "#10b981",
  "Đang giao": "#14b8a6",
  "Chờ xác nhận": "#f59e0b",
  "Hoàn thành": "#94a3b8",
  "Đã hủy": "#ef4444",
};

const orderStatusProgress: Record<string, number> = {
  "Tiếp nhận": 14,
  "Chờ xác nhận": 18,
  "Đã xác nhận lịch": 30,
  "Đang giặt": 58,
  "Kiểm tra": 72,
  "Chờ thanh toán": 84,
  "Sẵn sàng giao": 90,
  "Đang giao": 94,
  "Đã hủy": 100,
  "Hoàn thành": 100,
};

const reminderItems = [
  { text: "Đơn DH-1055 đang dùng nước xả thơm nhẹ theo ghi chú.", type: "Đơn hàng", color: "#3b82f6" },
  { text: "Voucher PANDA20 còn hạn đến 30/06/2026.", type: "Ưu đãi", color: "#8b5cf6" },
  { text: "Còn 250 điểm nữa để nâng hạng Vàng.", type: "Điểm thưởng", color: "#f59e0b" },
  { text: "Ticket HT-0309 đang được nhân viên kiểm tra.", type: "Hỗ trợ", color: "#10b981" },
];

const reminderTypeColors: Record<string, string> = {
  "Đơn hàng": "#3b82f6",
  "Ưu đãi": "#8b5cf6",
  "Điểm thưởng": "#f59e0b",
  "Hỗ trợ": "#10b981",
};

function getReminderTypeColor(type: string) {
  return reminderTypeColors[type] || "#0ea5e9";
}

function formatOrderDate(value?: string) {
  if (!value) return "";
  const parsed = value.includes("-")
    ? new Date(`${value}T00:00:00`)
    : (() => {
      const [day, month, year] = value.split("/").map(Number);
      return new Date(year, month - 1, day);
    })();
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

function parseOrderDateValue(value?: string) {
  if (!value) return null;
  const parsed = value.includes("-")
    ? new Date(`${value}T00:00:00`)
    : (() => {
      const [day, month, year] = value.split("/").map(Number);
      return new Date(year, month - 1, day);
    })();
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatUpcomingDateLabel(value?: string) {
  const date = parseOrderDateValue(value);
  if (!date) return "Chưa hẹn";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "Ngày mai";
  return target.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

function getUpcomingDateTime(row: MyOrderRow) {
  const date = parseOrderDateValue(row.delivery_date);
  const time = row.appointment || (row.delivery_time && row.delivery_time !== "-" ? row.delivery_time : "--:--");
  return {
    date,
    time,
    sortValue: date ? `${date.toISOString().slice(0, 10)} ${time}` : `9999-12-31 ${time}`,
  };
}

function getOrderActivityDate(row: MyOrderRow) {
  return row.created_at || row.delivery_date || "";
}

function isDateInRange(value: string | undefined, startDate: string, endDate: string) {
  if (!value) return false;
  const dateKey = value.slice(0, 10);
  return dateKey >= startDate && dateKey <= endDate;
}

function formatVoucherDate(value?: string | null) {
  if (!value) return "Không giới hạn";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleDateString("vi-VN");
}

function isPromotionExpired(claim: PromotionClaim) {
  if (claim.status === "Đã kết thúc") return true;
  if (!claim.end_date) return false;
  const end = new Date(`${claim.end_date}T23:59:59`);
  return !Number.isNaN(end.getTime()) && end.getTime() < Date.now();
}

function getClaimUsageStatus(claim: PromotionClaim) {
  if (isPromotionExpired(claim)) return "Hết hạn";
  return claim.claim_status === "Đã sử dụng" ? "Đã sử dụng" : "Chưa sử dụng";
}

function normalizeOrderStatus(status?: string) {
  return mapHomeOrderStatus(String(status || "").trim() || "Tiếp nhận");
}

function mapOrderProgressItem(row: MyOrderRow) {
  const status = normalizeOrderStatus(row.status);
  const service = [row.service || "Dịch vụ", row.quantity || ""].filter(Boolean).join(" · ");
  const dateLabel = formatOrderDate(row.delivery_date);
  const timeLabel = row.delivery_time && row.delivery_time !== "-"
    ? `${dateLabel ? `${dateLabel} · ` : ""}${row.delivery_time}`
    : dateLabel;
  return {
    code: row.id,
    service,
    time: status === "Chờ thanh toán"
      ? "Chờ khách thanh toán"
      : timeLabel || row.appointment || "Đang cập nhật lịch hẹn",
    status,
    pct: orderStatusProgress[status] ?? 35,
  };
}

function mapUpcomingOrderItem(row: MyOrderRow, source: "order" | "booking") {
  const normalizedStatus = normalizeOrderStatus(row.status);
  const { date, time, sortValue } = getUpcomingDateTime(row);
  const isDelivery = source === "order" && ["Sẵn sàng giao", "Đang giao", "Hoàn thành"].includes(normalizedStatus);
  const type = source === "booking" ? "Lấy đồ" : isDelivery ? "Giao đồ" : "Theo dõi";
  const color = source === "booking"
    ? "#3b82f6"
    : isDelivery
      ? "#10b981"
      : orderStatusColors[normalizedStatus] || "#f59e0b";
  return {
    code: row.booking_code || row.id,
    time,
    date: formatUpcomingDateLabel(row.delivery_date),
    title: row.service || "Dịch vụ",
    subtitle: [row.quantity, normalizedStatus].filter(Boolean).join(" · "),
    type,
    color,
    sortValue,
    isUpcoming: date ? date >= new Date(new Date().setHours(0, 0, 0, 0)) : false,
  };
}

function formatCurrency(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}tr`;
  }
  return value.toLocaleString("vi-VN");
}

function addCalendarDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toInputDate(date);
}

function inclusiveDaysBetween(start: string, end: string) {
  const startTime = new Date(`${start}T00:00:00`).getTime();
  const endTime = new Date(`${end}T00:00:00`).getTime();
  return Math.floor((endTime - startTime) / 86_400_000) + 1;
}

function formatChartDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}

function buildSpendingChartData(orders: MyOrderRow[], startDate: string, endDate: string, groupDays: number) {
  const spendingByDate = new Map<string, number>();
  orders.forEach((order) => {
    const dateKey = getOrderActivityDate(order).slice(0, 10);
    if (!dateKey) return;
    spendingByDate.set(dateKey, (spendingByDate.get(dateKey) || 0) + Number(order.amount || 0));
  });
  const rangeDays = inclusiveDaysBetween(startDate, endDate);
  const bucketCount = Math.ceil(rangeDays / groupDays);

  return Array.from({ length: bucketCount }, (_, index) => {
    const bucketStart = addCalendarDays(startDate, index * groupDays);
    const bucketEnd = addCalendarDays(
      bucketStart,
      Math.min(groupDays, inclusiveDaysBetween(bucketStart, endDate)) - 1,
    );
    let spending = 0;
    for (let current = bucketStart; current <= bucketEnd; current = addCalendarDays(current, 1)) {
      spending += spendingByDate.get(current) || 0;
    }
    return {
      day: bucketStart === bucketEnd ? formatChartDate(bucketStart) : `${formatChartDate(bucketStart)}–${formatChartDate(bucketEnd)}`,
      fullRange: bucketStart === bucketEnd
        ? new Date(`${bucketStart}T00:00:00`).toLocaleDateString("vi-VN")
        : `${new Date(`${bucketStart}T00:00:00`).toLocaleDateString("vi-VN")} - ${new Date(`${bucketEnd}T00:00:00`).toLocaleDateString("vi-VN")}`,
      spending,
    };
  });
}

function KpiCard({
  title,
  value,
  hint,
  detail,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  hint: string;
  detail: string;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="flex h-full flex-col justify-between rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:border-slate-300">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-900">{title}</p>
          <p className="mt-1 truncate text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
        </div>
        <span
          className="grid size-10 shrink-0 place-items-center rounded-xl"
          style={{ color, backgroundColor: `${color}12` }}
        >
          <Icon className="size-4.5" />
        </span>
      </div>
      <div className="mt-2 flex min-w-0 items-end justify-between gap-2 border-t border-slate-200 pt-2">
        <p className="min-w-0 truncate text-[11px] text-slate-400">{hint}</p>
        <span
          className="shrink-0 rounded-md px-1.5 py-1 text-[10px] font-semibold"
          style={{ color, backgroundColor: `${color}10` }}
        >
          {detail}
        </span>
      </div>
    </div>
  );
}

function DonutCard({
  title,
  totalLabel,
  data,
  unit,
}: {
  title: string;
  totalLabel: string;
  data: Array<{ name: string; value: number; color: string }>;
  unit: string;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col justify-between overflow-hidden rounded-lg border border-slate-200 bg-white px-3 py-2.5">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 pb-1.5">
        <span className="text-sm font-bold text-slate-800">{title}</span>
        <span className="text-xs font-semibold text-slate-500">{totalLabel}</span>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-[120px_1fr] items-center gap-4 pt-1.5">
        <div className="relative h-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={40} outerRadius={56} paddingAngle={2.5} cornerRadius={4}>
                {data.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded border border-slate-200 bg-white p-1.5 text-xs font-semibold text-slate-900">
                      {payload[0].name}: {payload[0].value} {unit}
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="text-base font-extrabold leading-none text-slate-900">{total}</span>
          </div>
        </div>
        <div className="flex flex-col justify-center space-y-1.5 text-xs">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-1">
              <span className="inline-flex min-w-0 items-center gap-1.5 text-slate-500">
                <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.name}</span>
              </span>
              <span className="font-bold text-slate-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function UserOverviewPage() {
  const range = useDashboardTimeRangeStore((state) => state.range);
  const normalizedRange = normalizeRange(range);
  const rangeLabel = formatRange(normalizedRange);
  const selectedSpendingStartDate = toInputDate(normalizedRange.start);
  const spendingEndDate = toInputDate(normalizedRange.end);
  const selectedSpendingDays = inclusiveDaysBetween(selectedSpendingStartDate, spendingEndDate);
  const spendingStartDate = selectedSpendingDays < 7
    ? addCalendarDays(spendingEndDate, -6)
    : selectedSpendingStartDate;
  const spendingRangeDays = inclusiveDaysBetween(spendingStartDate, spendingEndDate);
  const [spendingGroupDays, setSpendingGroupDays] = useState(1);
  const [spendingGroupDaysInput, setSpendingGroupDaysInput] = useState("1");
  const [spendingSettingsLoaded, setSpendingSettingsLoaded] = useState(false);
  const [visibleReminderKeys, setVisibleReminderKeys] = useState<string[] | null>(null);
  const [maxDisplayedReminders, setMaxDisplayedReminders] = useState(4);
  const [maxDisplayedRemindersInput, setMaxDisplayedRemindersInput] = useState("4");
  const [reminderSettingsLoaded, setReminderSettingsLoaded] = useState(false);
  const [myOrders, setMyOrders] = useState<MyOrderRow[]>([]);
  const [myBookings, setMyBookings] = useState<MyOrderRow[]>([]);
  const [isOrderProgressLoading, setIsOrderProgressLoading] = useState(true);
  const [isUpcomingLoading, setIsUpcomingLoading] = useState(true);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [promotionClaims, setPromotionClaims] = useState<PromotionClaim[]>([]);
  const [isLoyaltyLoading, setIsLoyaltyLoading] = useState(true);
  const [supportTickets, setSupportTickets] = useState<SupportTicketRow[]>([]);
  const displayedSpendingGroupDays = spendingRangeDays <= 7
    ? 1
    : Math.min(spendingRangeDays, spendingGroupDays);
  const ordersInDashboardRange = useMemo(
    () => myOrders.filter((order) => isDateInRange(getOrderActivityDate(order), selectedSpendingStartDate, spendingEndDate)),
    [myOrders, selectedSpendingStartDate, spendingEndDate],
  );
  const spendingChartData = useMemo(
    () => buildSpendingChartData(myOrders, spendingStartDate, spendingEndDate, displayedSpendingGroupDays),
    [displayedSpendingGroupDays, myOrders, spendingEndDate, spendingStartDate],
  );
  const totalSpending = spendingChartData.reduce((sum, item) => sum + item.spending, 0);
  const totalOrders = ordersInDashboardRange.length;
  const completedOrders = ordersInDashboardRange.filter((order) => normalizeOrderStatus(order.status) === "Hoàn thành").length;
  const activeOrders = ordersInDashboardRange.filter((order) => {
    const status = normalizeOrderStatus(order.status);
    return status !== "Hoàn thành" && status !== "Đã hủy";
  }).length;
  const supportRequestCount = supportTickets.filter((ticket) => ticket.status !== "Đã giải quyết").length;
  const completionRate = totalOrders ? Math.round((completedOrders / totalOrders) * 100) : 0;
  const activeOrderRate = totalOrders ? Math.round((activeOrders / totalOrders) * 100) : 0;
  const loyaltyPoints = Number(customerProfile?.loyalty_points || 0);
  const nextLoyaltyTarget = loyaltyPoints < 1500 ? 1500 : Math.ceil((loyaltyPoints + 1) / 500) * 500;
  const loyaltyRate = nextLoyaltyTarget ? Math.min(100, Math.round((loyaltyPoints / nextLoyaltyTarget) * 100)) : 0;
  const usedServiceNames = new Set(ordersInDashboardRange.map((order) => order.service).filter(Boolean));
  const statusMix = useMemo(() => {
    const counts = new Map<string, number>();
    ordersInDashboardRange.forEach((order) => {
      const status = normalizeOrderStatus(order.status);
      counts.set(status, (counts.get(status) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value, color: orderStatusColors[name] || "#64748b" }))
      .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
  }, [ordersInDashboardRange]);
  const serviceMix = useMemo(() => {
    const counts = new Map<string, number>();
    ordersInDashboardRange.forEach((order) => {
      const serviceName = String(order.service || "Dịch vụ").trim() || "Dịch vụ";
      counts.set(serviceName, (counts.get(serviceName) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([name, value], index) => ({ name, value, color: chartColors[index % chartColors.length] }))
      .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
  }, [ordersInDashboardRange]);
  const reminders = useMemo(
    () => reminderItems.map((note) => ({
      ...note,
      key: `${note.type}:${note.text}`,
    })),
    [],
  );
  const visibleReminders = useMemo(() => {
    const visibleKeySet = visibleReminderKeys ? new Set(visibleReminderKeys) : null;
    return reminders.filter((note) => !visibleKeySet || visibleKeySet.has(note.key));
  }, [reminders, visibleReminderKeys]);
  const displayedReminders = useMemo(
    () => visibleReminders.slice(0, maxDisplayedReminders),
    [maxDisplayedReminders, visibleReminders],
  );
  const visibleOrderProgressItems = useMemo(
    () => myOrders
      .map(mapOrderProgressItem)
      .filter((item) => item.status !== "Hoàn thành"),
    [myOrders],
  );
  const upcomingAppointmentItems = useMemo(
    () => [
      ...myBookings.map((row) => mapUpcomingOrderItem(row, "booking")),
      ...myOrders
        .filter((row) => normalizeOrderStatus(row.status) !== "Hoàn thành")
        .map((row) => mapUpcomingOrderItem(row, "order")),
    ]
      .filter((item) => item.isUpcoming)
      .sort((a, b) => a.sortValue.localeCompare(b.sortValue))
      .slice(0, 6),
    [myBookings, myOrders],
  );
  const loyaltyItems = useMemo(() => {
    const points = Number(customerProfile?.loyalty_points || 0);
    const targetPoints = points < 1500 ? 1500 : Math.ceil((points + 1) / 500) * 500;
    const pointPct = targetPoints ? Math.min(100, Math.round((points / targetPoints) * 100)) : 0;
    const pointItem = {
      key: "loyalty-points",
      name: customerProfile?.rank ? `Hạng ${customerProfile.rank}` : "Điểm thưởng",
      detail: `${points.toLocaleString("vi-VN")} / ${targetPoints.toLocaleString("vi-VN")} điểm`,
      pct: pointPct,
      color: "#3b82f6",
      showProgress: true,
      discountLabel: "",
    };
    const claimItems = promotionClaims.filter((claim) => getClaimUsageStatus(claim) === "Chưa sử dụng").slice(0, 3).map((claim) => {
      const usageStatus = getClaimUsageStatus(claim);
      const color = "#10b981";
      return {
        key: claim.claim_id || claim.code,
        name: claim.code,
        detail: `${claim.name || claim.type || "Mã ưu đãi"} · HSD ${formatVoucherDate(claim.end_date)}`,
        pct: 100,
        color,
        showProgress: false,
        discountLabel: `Giảm ${formatPromotionValue(String(claim.value || ""), claim.type as PromotionType)}`,
      };
    });
    return [pointItem, ...claimItems];
  }, [customerProfile, promotionClaims]);

  useEffect(() => {
    let alive = true;
    setIsLoyaltyLoading(true);
    Promise.allSettled([
      homeApi<CustomerProfile>("/my-customer", { cache: "no-store" }),
      homeApi<PromotionClaim[]>("/my-promotion-claims", { cache: "no-store" }),
    ])
      .then(([customerResult, claimsResult]) => {
        if (!alive) return;
        setCustomerProfile(customerResult.status === "fulfilled" ? customerResult.value : null);
        setPromotionClaims(
          claimsResult.status === "fulfilled" && Array.isArray(claimsResult.value)
            ? claimsResult.value
            : [],
        );
      })
      .finally(() => {
        if (alive) setIsLoyaltyLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const loadSupportTickets = () => {
      homeApi<SupportTicketRow[]>("/support-tickets/full", { cache: "no-store" })
        .then((rows) => {
          if (!alive) return;
          setSupportTickets(Array.isArray(rows) ? rows : []);
        })
        .catch(() => {
          if (!alive) return;
          setSupportTickets([]);
        });
    };
    loadSupportTickets();
    window.addEventListener("focus", loadSupportTickets);
    return () => {
      alive = false;
      window.removeEventListener("focus", loadSupportTickets);
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const loadOrders = () => {
      setIsOrderProgressLoading(true);
      homeApi<MyOrderRow[]>("/my-orders", { cache: "no-store" })
        .then((rows) => {
          if (!alive) return;
          setMyOrders(Array.isArray(rows) ? rows : []);
        })
        .catch(() => {
          if (!alive) return;
          setMyOrders([]);
        })
        .finally(() => {
          if (alive) setIsOrderProgressLoading(false);
        });
    };
    loadOrders();
    window.addEventListener("home-orders-changed", loadOrders);
    window.addEventListener("focus", loadOrders);
    return () => {
      alive = false;
      window.removeEventListener("home-orders-changed", loadOrders);
      window.removeEventListener("focus", loadOrders);
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const loadBookings = () => {
      setIsUpcomingLoading(true);
      homeApi<MyOrderRow[]>("/my-bookings", { cache: "no-store" })
        .then((rows) => {
          if (!alive) return;
          setMyBookings(Array.isArray(rows) ? rows : []);
        })
        .catch(() => {
          if (!alive) return;
          setMyBookings([]);
        })
        .finally(() => {
          if (alive) setIsUpcomingLoading(false);
        });
    };
    loadBookings();
    window.addEventListener("booking-requests-changed", loadBookings);
    window.addEventListener("home-orders-changed", loadBookings);
    window.addEventListener("focus", loadBookings);
    return () => {
      alive = false;
      window.removeEventListener("booking-requests-changed", loadBookings);
      window.removeEventListener("home-orders-changed", loadBookings);
      window.removeEventListener("focus", loadBookings);
    };
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("user-overview-spending-setup");
      if (raw) {
        const parsed = JSON.parse(raw) as { groupDays?: number };
        if (Number.isInteger(parsed.groupDays) && Number(parsed.groupDays) >= 1) {
          const groupDays = Math.min(3651, Number(parsed.groupDays));
          setSpendingGroupDays(groupDays);
          setSpendingGroupDaysInput(String(groupDays));
        }
      }
    } catch {
      setSpendingGroupDays(1);
      setSpendingGroupDaysInput("1");
    } finally {
      setSpendingSettingsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!spendingSettingsLoaded) return;
    window.localStorage.setItem(
      "user-overview-spending-setup",
      JSON.stringify({ groupDays: spendingGroupDays }),
    );
  }, [spendingGroupDays, spendingSettingsLoaded]);

  const commitSpendingGroupDays = () => {
    const parsed = Number(spendingGroupDaysInput);
    const groupDays = Number.isFinite(parsed)
      ? Math.max(1, Math.min(spendingRangeDays, Math.floor(parsed)))
      : 1;
    setSpendingGroupDays(groupDays);
    setSpendingGroupDaysInput(String(groupDays));
  };

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("user-overview-reminder-setup");
      if (raw) {
        const parsed = JSON.parse(raw) as { visibleKeys?: string[] | null; maxItems?: number };
        setVisibleReminderKeys(Array.isArray(parsed.visibleKeys) ? parsed.visibleKeys : null);
        if (
          Number.isInteger(parsed.maxItems)
          && Number(parsed.maxItems) >= 1
          && Number(parsed.maxItems) <= 9
        ) {
          const maxItems = Number(parsed.maxItems);
          setMaxDisplayedReminders(maxItems);
          setMaxDisplayedRemindersInput(String(maxItems));
        }
      }
    } catch {
      setVisibleReminderKeys(null);
    } finally {
      setReminderSettingsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!reminderSettingsLoaded) return;
    window.localStorage.setItem(
      "user-overview-reminder-setup",
      JSON.stringify({ visibleKeys: visibleReminderKeys, maxItems: maxDisplayedReminders }),
    );
  }, [maxDisplayedReminders, reminderSettingsLoaded, visibleReminderKeys]);

  const commitMaxDisplayedReminders = () => {
    const parsed = Number(maxDisplayedRemindersInput);
    const nextValue = Number.isFinite(parsed)
      ? Math.max(1, Math.min(9, Math.floor(parsed)))
      : maxDisplayedReminders;
    setMaxDisplayedReminders(nextValue);
    setMaxDisplayedRemindersInput(String(nextValue));
  };

  const toggleReminder = (key: string, checked: boolean) => {
    setVisibleReminderKeys((prev) => {
      const current = new Set(prev ?? reminders.map((note) => note.key));
      if (checked) current.add(key);
      else current.delete(key);
      return Array.from(current);
    });
  };

  return (
    <PageShell fullHeight>
      <div className="h-full min-h-0 w-full flex-1 overflow-hidden bg-white">
        <div className="flex h-full min-h-0 w-full flex-col gap-3.5 p-0">
          <div className="grid min-h-0 flex-[1.1] grid-cols-1 items-stretch gap-3.5 lg:grid-cols-12">
            <div className="h-full lg:col-span-5">
              <div className="grid h-full grid-cols-2 auto-rows-fr gap-3">
                <KpiCard
                  title="Tổng đơn"
                  value={String(totalOrders)}
                  hint={`${rangeLabel} · ${usedServiceNames.size} dịch vụ đã dùng`}
                  detail={`${totalOrders} lượt`}
                  icon={PackageCheck}
                  color="#06b6d4"
                />
                <KpiCard
                  title="Chi tiêu"
                  value={`${formatCurrency(totalSpending)}đ`}
                  hint={`${rangeLabel} · Tổng giá trị đơn`}
                  detail="Đã ghi nhận"
                  icon={Wallet}
                  color="#10b981"
                />
                <KpiCard
                  title="Đơn đang xử lý"
                  value={String(activeOrders)}
                  hint={`${rangeLabel} · Giặt, sấy, giao`}
                  detail={`${activeOrderRate}% tổng đơn`}
                  icon={WashingMachine}
                  color="#f59e0b"
                />
                <KpiCard
                  title="Yêu cầu hỗ trợ"
                  value={String(supportRequestCount)}
                  hint={`${rangeLabel} · Đang theo dõi`}
                  detail={supportRequestCount ? `${supportRequestCount} yêu cầu` : "Chưa có"}
                  icon={AlertTriangle}
                  color="#ef4444"
                />
                <KpiCard
                  title="Đơn hoàn thành"
                  value={String(completedOrders)}
                  hint={`${rangeLabel} · Đã giao và tất toán`}
                  detail={`${completionRate}% tổng đơn`}
                  icon={CheckCircle2}
                  color="#10b981"
                />
                <KpiCard
                  title="Điểm thưởng"
                  value={loyaltyPoints.toLocaleString("vi-VN")}
                  hint={`Còn ${Math.max(0, nextLoyaltyTarget - loyaltyPoints).toLocaleString("vi-VN")} điểm tới mốc kế tiếp`}
                  detail={`${loyaltyRate}%`}
                  icon={Gift}
                  color="#3b82f6"
                />
              </div>
            </div>

            <div className="flex h-full flex-col gap-3 lg:col-span-3">
              <DonutCard title="Cơ cấu trạng thái đơn" totalLabel={`${totalOrders} đơn`} data={statusMix} unit="đơn" />
              <DonutCard
                title="Cơ cấu dịch vụ trong kỳ"
                totalLabel={`${serviceMix.reduce((sum, item) => sum + item.value, 0)} lượt`}
                data={serviceMix}
                unit="lượt"
              />
            </div>

            <div className="lg:col-span-4 overflow-hidden rounded-lg border border-slate-200 bg-white flex flex-col p-3 h-full min-h-0 justify-between">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 shrink-0">
                <span className="text-sm font-bold text-slate-800">Chi tiêu</span>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                    {spendingRangeDays} ngày - {displayedSpendingGroupDays} ngày - {spendingChartData.length} cột
                  </span>
                  {spendingRangeDays > 7 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex size-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                          aria-label="Thiết lập số ngày mỗi cột chi tiêu"
                        >
                          <Settings className="size-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64">
                        <DropdownMenuLabel>Thiết lập chi tiêu</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div
                          className="px-2 py-2"
                          onClick={(event) => event.stopPropagation()}
                          onKeyDown={(event) => event.stopPropagation()}
                        >
                          <label className="grid grid-cols-[1fr_100px] items-center gap-3 text-sm text-slate-700">
                            <span>Số ngày / cột</span>
                            <Input
                              type="text"
                              inputMode="numeric"
                              value={spendingGroupDaysInput}
                              onChange={(event) => setSpendingGroupDaysInput(event.target.value.replace(/\D/g, "").slice(0, 4))}
                              onBlur={commitSpendingGroupDays}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  commitSpendingGroupDays();
                                  event.currentTarget.blur();
                                }
                              }}
                              className="h-8 text-center text-xs"
                            />
                          </label>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
              <div className="flex-1 pt-3 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spendingChartData} margin={{ top: 10, right: 5, left: 5, bottom: 5 }}>
                    <defs>
                      <linearGradient id="userSpendingBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.85}/>
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.15}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} dy={8} style={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ fill: "#f0f9ff", fillOpacity: 0.7 }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="rounded border border-sky-100 bg-white/95 p-2 text-xs shadow-sm">
                            <p className="font-semibold text-slate-400">{payload[0].payload.fullRange}</p>
                            <p className="mt-0.5 font-bold text-slate-900">
                              {Number(payload[0].value).toLocaleString("vi-VN")}đ
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="spending" fill="url(#userSpendingBarGradient)" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid min-h-0 w-full flex-1 gap-3.5 xl:grid-cols-4">
            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors hover:border-slate-300">
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <CalendarClock className="size-4 text-slate-500" />
                  <h2 className="text-sm font-semibold text-slate-900">Đơn sắp tới hẹn</h2>
                </div>
                <span className="text-xs font-medium text-slate-400">
                  {upcomingAppointmentItems.length}/6 lịch hẹn
                </span>
              </div>
              <div className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto">
                {upcomingAppointmentItems.map((item) => (
                  <div key={item.code} className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-slate-50/70">
                    <div className="w-11 shrink-0 text-center">
                      <p className="text-xs font-semibold tabular-nums text-slate-900">{item.time}</p>
                      <p className="mt-0.5 text-[10px] text-slate-400">{item.date}</p>
                    </div>
                    <span className="h-9 w-px shrink-0 bg-slate-200" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-800">{item.code} · {item.title}</p>
                      <p className="mt-1 truncate text-[11px] text-slate-400">{item.subtitle}</p>
                    </div>
                    <span
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium"
                      style={{ color: item.color, backgroundColor: `${item.color}14` }}
                    >
                      <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.type}
                    </span>
                  </div>
                ))}
                {(isUpcomingLoading || isOrderProgressLoading) && (
                  <div className="flex h-full items-center justify-center p-6 text-xs text-slate-400">
                    Đang tải lịch hẹn.
                  </div>
                )}
                {!isUpcomingLoading && !isOrderProgressLoading && upcomingAppointmentItems.length === 0 && (
                  <div className="flex h-full items-center justify-center p-6 text-xs text-slate-400">
                    Chưa có đơn sắp tới hẹn.
                  </div>
                )}
              </div>
            </div>

            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors hover:border-slate-300">
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-slate-500" />
                  <h2 className="text-sm font-semibold text-slate-900">Tiến trình đơn</h2>
                </div>
                <span className="text-xs font-medium text-slate-400">
                  {visibleOrderProgressItems.length} đơn đang xử lý
                </span>
              </div>
              <div className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto">
                {visibleOrderProgressItems.map((order) => {
                  const color = orderStatusColors[order.status] || "#64748b";
                  return (
                  <div key={order.code} className="px-3 py-3 transition-colors hover:bg-slate-50/70">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-800">{order.code} · {order.service}</p>
                        <p className="mt-1 truncate text-[11px] text-slate-400">{order.time}</p>
                      </div>
                      <span
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium"
                        style={{ color, backgroundColor: `${color}14` }}
                      >
                        <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                        {order.status}
                      </span>
                    </div>
                    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full" style={{ width: `${order.pct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                  );
                })}
                {isOrderProgressLoading && (
                  <div className="flex h-full items-center justify-center p-6 text-xs text-slate-400">
                    Đang tải tiến trình đơn.
                  </div>
                )}
                {!isOrderProgressLoading && visibleOrderProgressItems.length === 0 && (
                  <div className="flex h-full items-center justify-center p-6 text-xs text-slate-400">
                    Chưa có đơn đang xử lý.
                  </div>
                )}
              </div>
            </div>

            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors hover:border-slate-300">
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <Star className="size-4 text-slate-500" />
                  <h2 className="text-sm font-semibold text-slate-900">Ưu đãi & điểm</h2>
                </div>
                <span className="text-xs font-medium text-slate-400">
                  {loyaltyItems.length} mục
                </span>
              </div>
              <div className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto">
                {loyaltyItems.map((item) => (
                  <div key={item.key} className="flex min-h-[64px] flex-col justify-center px-3 py-3 transition-colors hover:bg-slate-50/70">
                    {item.showProgress ? (
                      <>
                        <div className="flex items-center justify-between gap-3 text-xs font-medium">
                          <span className="truncate text-slate-800">{item.name}</span>
                          <span className="truncate text-[11px] text-slate-400">{item.detail}</span>
                        </div>
                        <div className="mt-2.5 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                          </div>
                          <span className="w-8 text-right text-[10px] font-bold text-slate-500">{item.pct}%</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex min-h-[40px] items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-slate-800">{item.name}</p>
                          <p className="mt-1 truncate text-[11px] font-medium text-slate-400">{item.detail}</p>
                        </div>
                        <span className="shrink-0 text-[11px] font-medium leading-none text-slate-400">
                          {item.discountLabel}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                {isLoyaltyLoading && (
                  <div className="flex h-full items-center justify-center p-6 text-xs text-slate-400">
                    Đang tải ưu đãi và điểm.
                  </div>
                )}
                {!isLoyaltyLoading && loyaltyItems.length === 0 && (
                  <div className="flex h-full items-center justify-center p-6 text-xs text-slate-400">
                    Chưa có ưu đãi hoặc điểm thưởng.
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col h-full min-h-0">
              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5 shrink-0">
                <div className="flex items-center gap-2">
                  <StickyNote className="size-4 text-slate-500" />
                  <h2 className="text-sm font-semibold text-slate-900">Ghi chú & Nhắc nhở</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-400">
                    {displayedReminders.length}/{maxDisplayedReminders} ghi chú
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex size-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                        aria-label="Thiết lập ghi chú hiển thị"
                      >
                        <Settings className="size-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-72">
                      <DropdownMenuLabel>Thiết lập ghi chú</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div
                        className="flex items-center justify-between gap-3 px-2 py-1.5"
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                      >
                        <span className="text-sm text-slate-700">Số ô tối đa</span>
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={maxDisplayedRemindersInput}
                          onChange={(event) => {
                            const value = event.target.value.replace(/\D/g, "").slice(0, 1);
                            setMaxDisplayedRemindersInput(value);
                            if (/^[1-9]$/.test(value)) setMaxDisplayedReminders(Number(value));
                          }}
                          onBlur={commitMaxDisplayedReminders}
                          onKeyDown={(event) => {
                            event.stopPropagation();
                            if (event.key === "Enter") {
                              commitMaxDisplayedReminders();
                              event.currentTarget.blur();
                            }
                          }}
                          className="h-7 w-16 appearance-none px-2 text-center text-xs"
                        />
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setVisibleReminderKeys(null)}>
                        Hiện tất cả ghi chú
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setVisibleReminderKeys([])}>
                        Ẩn tất cả ghi chú
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs text-slate-400">Chọn ghi chú hiển thị</DropdownMenuLabel>
                      <div className="max-h-56 overflow-y-auto">
                        {reminders.map((note, index) => {
                          const checked = visibleReminderKeys ? visibleReminderKeys.includes(note.key) : true;
                          return (
                            <DropdownMenuCheckboxItem
                              key={`${note.key}-${index}`}
                              checked={checked}
                              onCheckedChange={(nextChecked) => toggleReminder(note.key, Boolean(nextChecked))}
                            >
                              <span className="truncate">{note.type} · {note.text}</span>
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                        {reminders.length === 0 && (
                          <div className="px-2 py-2 text-xs text-slate-400">Chưa có ghi chú để thiết lập.</div>
                        )}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="space-y-3 p-3 flex-1 overflow-y-auto min-h-0">
                {displayedReminders.map((note, index) => (
                  <div
                    key={`${note.key}-${index}`}
                    className="space-y-2 rounded-lg border px-2.5 py-2"
                    style={{
                      borderColor: `${getReminderTypeColor(note.type)}55`,
                      backgroundColor: `${getReminderTypeColor(note.type)}1a`,
                    }}
                  >
                    <span
                      className="inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-xs font-medium"
                      style={{
                        color: getReminderTypeColor(note.type),
                        borderColor: `${getReminderTypeColor(note.type)}55`,
                        backgroundColor: `${getReminderTypeColor(note.type)}20`,
                      }}
                    >
                      <span className="size-2 rounded-full" style={{ backgroundColor: getReminderTypeColor(note.type) }} />
                      {note.type}
                    </span>
                    <p className="text-sm leading-relaxed text-slate-700">
                      {note.text}
                    </p>
                  </div>
                ))}
                {displayedReminders.length === 0 && (
                  <div className="flex h-full items-center justify-center p-6 text-xs text-slate-400">
                    {reminders.length === 0 ? "Chưa có ghi chú hoặc nhắc nhở." : "Không có ghi chú phù hợp thiết lập hiển thị."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
