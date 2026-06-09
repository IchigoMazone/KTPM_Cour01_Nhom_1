"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CalendarCheck,
  CalendarClock,
  Gift,
  Headset,
  PackageCheck,
  Shirt,
  Sparkles,
  Star,
  TicketCheck,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { toast } from "sonner";
import { TableCell } from "@/components/ui/table";
import { PageShell } from "@/src/app/home/_components/dashboard-primitives";
import { FilterBar, type FilterOption } from "@/src/app/home/_components/filter-bar";
import { TableView } from "@/src/app/home/_components/table-view";
import { Toolbar } from "@/src/app/home/_components/toolbar";
import type { DashboardTableColumn } from "@/src/components/common/dashboard-data-table";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import { addDays, formatRange, normalizeRange, shortDateFormatter } from "@/src/utils/dashboard-time";

type CustomerOrderStatus = "Đang giặt" | "Sẵn sàng giao" | "Hoàn tất" | "Chờ xác nhận" | "Đã hủy";

const checkboxClass =
  "relative size-4 appearance-none rounded-[5px] border border-slate-300 bg-white transition-all checked:border-emerald-300 checked:bg-emerald-300 after:absolute after:left-1/2 after:top-1/2 after:hidden after:h-[9px] after:w-[5px] after:-translate-x-1/2 after:-translate-y-[58%] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:content-[''] checked:after:block";

const statusStyle: Record<CustomerOrderStatus, { color: string; bg: string }> = {
  "Đang giặt": { color: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
  "Sẵn sàng giao": { color: "#10b981", bg: "rgba(16,185,129,0.08)" },
  "Hoàn tất": { color: "#10b981", bg: "rgba(16,185,129,0.08)" },
  "Chờ xác nhận": { color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  "Đã hủy": { color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
};

const statusOptions: FilterOption[] = [
  { id: "Tất cả", label: "Tất cả", color: "#64748b", bgColor: "rgba(100,116,139,0.09)" },
  ...Object.entries(statusStyle).map(([status, style]) => ({
    id: status,
    label: status,
    color: style.color,
    bgColor: style.bg,
  })),
];

const orderColumns: DashboardTableColumn[] = [
  { id: "code", label: "Mã đơn", width: 120, visible: true },
  { id: "service", label: "Dịch vụ", width: 150, visible: true },
  { id: "weight", label: "Khối lượng", width: 110, visible: true },
  { id: "status", label: "Trạng thái", width: 140, visible: true },
  { id: "appointment", label: "Lịch hẹn", width: 150, visible: true },
  { id: "eta", label: "Dự kiến", width: 130, visible: true },
  { id: "amount", label: "Tạm tính", width: 110, visible: true },
  { id: "actions", label: "Thao tác", width: 130, visible: true },
];

const latestOrders = [
  { code: "DH-1055", service: "Giặt thường", weight: "4.6 kg", status: "Đang giặt" as CustomerOrderStatus, appointment: "Hôm nay 08:30", eta: "16:30 hôm nay", amount: "92.000đ" },
  { code: "DH-1048", service: "Giặt hấp vest", weight: "3 món", status: "Sẵn sàng giao" as CustomerOrderStatus, appointment: "Hôm nay 10:30", eta: "10:30 ngày mai", amount: "180.000đ" },
  { code: "DH-1032", service: "Chăn màn", weight: "7 kg", status: "Hoàn tất" as CustomerOrderStatus, appointment: "12/05 09:00", eta: "Đã giao", amount: "240.000đ" },
  { code: "LH-208", service: "Giặt sấy theo kg", weight: "Ước tính 5 kg", status: "Chờ xác nhận" as CustomerOrderStatus, appointment: "Ngày mai 16:00", eta: "Chờ tiệm xác nhận", amount: "90.000đ" },
  { code: "DH-1019", service: "Giặt khô", weight: "1 món", status: "Đã hủy" as CustomerOrderStatus, appointment: "06/05 09:00", eta: "Đã hủy", amount: "135.000đ" },
];

const todayMix = [
  { name: "Đang xử lý", value: 2, color: "#3b82f6" },
  { name: "Sẵn sàng giao", value: 1, color: "#10b981" },
  { name: "Chờ xác nhận", value: 1, color: "#f59e0b" },
  { name: "Ưu đãi", value: 2, color: "#8b5cf6" },
];

const upcomingBookings = [
  { time: "16:00", task: "Shipper lấy đồ giặt sấy", type: "Lấy đồ", color: "#3b82f6", bg: "rgba(59,130,246,0.06)", border: "rgba(59,130,246,0.12)" },
  { time: "10:30", task: "Giao lại đơn DH-1048", type: "Giao đồ", color: "#10b981", bg: "rgba(16,185,129,0.06)", border: "rgba(16,185,129,0.12)" },
  { time: "19:00", task: "Nhắc xác nhận lịch LH-208", type: "Nhắc lịch", color: "#f59e0b", bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.12)" },
];

const progressSteps = [
  { label: "Đã nhận đồ", detail: "08:30 · Shipper nhận túi đồ", pct: 100, color: "#10b981", status: "Đã xong" },
  { label: "Phân loại", detail: "09:15 · Cân đồ và tách chất liệu", pct: 100, color: "#10b981", status: "Đã xong" },
  { label: "Đang giặt", detail: "Còn khoảng 42 phút", pct: 62, color: "#3b82f6", status: "Đang chạy" },
  { label: "Sấy & gấp", detail: "Dự kiến 16:30", pct: 0, color: "#cbd5e1", status: "Chờ" },
];

const vouchers = [
  { name: "PANDA20", detail: "Giảm 20% đơn từ 150.000đ", pct: 100, color: "#8b5cf6" },
  { name: "FREESHIP", detail: "Miễn phí giao 2 lượt/tháng", pct: 100, color: "#10b981" },
  { name: "HAP50", detail: "Cần nhận thêm trong ví", pct: 40, color: "#f59e0b" },
  { name: "Điểm lên hạng", detail: "1.250 / 1.500 điểm", pct: 83, color: "#3b82f6" },
];

const reminders = [
  { text: "Đơn DH-1055 đang dùng nước xả thơm nhẹ theo ghi chú của bạn", type: "Đơn hàng", color: "#3b82f6", bg: "rgba(59,130,246,0.06)" },
  { text: "Voucher PANDA20 hết hạn vào 31/05/2026", type: "Ưu đãi", color: "#8b5cf6", bg: "rgba(139,92,246,0.06)" },
  { text: "Bạn còn thiếu 250 điểm để lên hạng Vàng", type: "Loyalty", color: "#f59e0b", bg: "rgba(245,158,11,0.06)" },
  { text: "Ticket HT-309 đang được xử lý, dự kiến phản hồi trong hôm nay", type: "Hỗ trợ", color: "#10b981", bg: "rgba(16,185,129,0.06)" },
];

function formatCurrency(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}tr`;
  }

  return `${value.toLocaleString("vi-VN")}đ`;
}

function buildSpending7Days() {
  const today = new Date();
  const start = addDays(today, -6);

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index);
    const base = index % 3 === 0 ? 180000 : index % 2 === 0 ? 92000 : 0;

    return {
      day: shortDateFormatter.format(date),
      spending: base,
    };
  });
}

function KpiCard({
  title,
  value,
  hint,
  change,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  hint: string;
  change: string;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg" style={{ color, backgroundColor: `${color}14` }}>
            <Icon className="size-3.5" />
          </span>
          <p className="text-xs font-semibold text-slate-900">{title}</p>
        </div>
        <ArrowUpRight className="size-3.5 text-slate-400" />
      </div>
      <p className="mt-3 text-xl font-semibold tracking-tight text-slate-950">{value}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="truncate text-xs text-slate-400">{hint}</span>
        <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium" style={{ color, backgroundColor: `${color}12` }}>
          {change}
        </span>
      </div>
    </div>
  );
}

export default function UserOverviewPage() {
  const router = useRouter();
  const range = useDashboardTimeRangeStore((state) => state.range);
  const rangeLabel = formatRange(normalizeRange(range));
  const spending7Days = useMemo(() => buildSpending7Days(), []);
  const totalSpending = spending7Days.reduce((sum, item) => sum + item.spending, 0);
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<CustomerOrderStatus | "Tất cả">("Tất cả");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [columns, setColumns] = useState<DashboardTableColumn[]>(orderColumns);
  const [tableResizeMode, setTableResizeMode] = useState<"fit" | "custom">("fit");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(latestOrders.length);
  const [customPageSize, setCustomPageSize] = useState("");
  const [openPageSizeMenu, setOpenPageSizeMenu] = useState(false);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return latestOrders.filter((order) => {
      const matchesStatus = selectedStatus === "Tất cả" || order.status === selectedStatus;
      const matchesQuery =
        !normalizedQuery ||
        [order.code, order.service, order.weight, order.status, order.appointment, order.eta, order.amount]
          .some((value) => String(value).toLowerCase().includes(normalizedQuery));

      return matchesStatus && matchesQuery;
    });
  }, [query, selectedStatus]);

  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const paginatedOrders = filteredOrders.slice((safePage - 1) * pageSize, safePage * pageSize);
  const visibleIds = filteredOrders.map((order) => order.code);
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.has(id)).length;
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const totalVisibleWidth = columns.filter((column) => column.visible !== false).reduce((sum, column) => sum + (column.width || 150), 0);

  const toggleOrder = (code: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const applyCustomPageSize = () => {
    const parsed = Number(customPageSize);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    setPageSize(Math.floor(parsed));
    setPage(1);
    setOpenPageSizeMenu(false);
  };

  const handleExport = (format: "pdf" | "excel" | "csv", fileName: string) => {
    const exportColumns = columns.filter((column) => column.visible !== false && column.id !== "actions");
    const rows = filteredOrders.filter((order) => selectedIds.size === 0 || selectedIds.has(order.code));
    const headers = exportColumns.map((column) => column.label);
    const values = rows.map((row) => exportColumns.map((column) => String(row[column.id as keyof typeof row] ?? "")));

    if (format === "csv") {
      const csv = "\uFEFF" + [headers, ...values].map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }

    toast.success(format === "excel" ? "Đã chuẩn bị file Excel demo." : "Đã chuẩn bị bản in PDF demo.");
  };

  const renderCell = (order: (typeof latestOrders)[number], column: DashboardTableColumn) => {
    if (column.id === "code") {
      return (
        <TableCell key={column.id} className="pl-4 font-semibold text-slate-900">
          <div className="flex items-center gap-2">
            <input checked={selectedIds.has(order.code)} onChange={() => toggleOrder(order.code)} type="checkbox" className={checkboxClass} aria-label={`Chọn ${order.code}`} />
            {order.code}
          </div>
        </TableCell>
      );
    }

    if (column.id === "service") {
      return (
        <TableCell key={column.id}>
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid size-7 place-items-center rounded-md bg-slate-100 text-slate-600">
              <Shirt className="size-3.5" />
            </span>
            <span className="truncate font-semibold text-slate-800">{order.service}</span>
          </div>
        </TableCell>
      );
    }

    if (column.id === "status") {
      const style = statusStyle[order.status];
      return (
        <TableCell key={column.id}>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2 py-0.5 font-medium" style={{ color: style.color, backgroundColor: style.bg }}>
            <span className="size-1.5 rounded-full" style={{ backgroundColor: style.color }} />
            {order.status}
          </span>
        </TableCell>
      );
    }

    if (column.id === "actions") {
      return (
        <TableCell key={column.id} className="px-4">
          <div className="flex items-center gap-1.5">
            <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50" onClick={() => router.push("/user/orders")}>
              Chi tiết
            </button>
            <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50" onClick={() => router.push("/user/bookings")}>
              Đặt lại
            </button>
          </div>
        </TableCell>
      );
    }

    return <TableCell key={column.id} className="font-medium text-slate-700">{String(order[column.id as keyof typeof order] ?? "")}</TableCell>;
  };

  return (
    <PageShell fullHeight>
      <div className="min-h-0 flex-1 overflow-auto bg-white">
        <div className="flex min-h-full flex-col gap-4 p-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              <KpiCard title="Đơn đang xử lý" value="2" hint="1 đơn sẵn sàng giao" change="+1 đơn" icon={PackageCheck} color="#06b6d4" />
              <KpiCard title="Lịch lấy đồ" value="16:00" hint="Hôm nay tại nhà riêng" change="Đã xác nhận" icon={CalendarCheck} color="#f59e0b" />
              <KpiCard title="Điểm thưởng" value="1.250" hint="Còn 250 điểm lên Vàng" change="83%" icon={Gift} color="#10b981" />
              <KpiCard title="Chi tiêu 7 ngày" value={formatCurrency(totalSpending)} hint="Theo các đơn gần nhất" change="+2 đơn" icon={Wallet} color="#3b82f6" />
              <KpiCard title="Voucher khả dụng" value="2" hint="PANDA20, FREESHIP" change="Còn hạn" icon={Star} color="#8b5cf6" />
              <KpiCard title="Ticket hỗ trợ" value="1" hint="HT-309 đang xử lý" change="15 phút" icon={Headset} color="#ef4444" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-semibold text-slate-900">Cơ cấu tài khoản</h2>
                  <span className="text-xs font-medium text-slate-400">6 mục</span>
                </div>
                <div className="mt-2 grid grid-cols-[112px_1fr] items-center gap-3">
                  <div className="relative h-28">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={todayMix} dataKey="value" innerRadius={34} outerRadius={50} paddingAngle={4} cornerRadius={8}>
                          {todayMix.map((item) => (
                            <Cell key={item.name} fill={item.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            return (
                              <div className="rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium text-slate-900 shadow-lg">
                                {payload[0].name}: {payload[0].value}
                              </div>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 grid place-items-center">
                      <span className="text-lg font-semibold text-slate-950">6</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {todayMix.map((item) => (
                      <div key={item.name} className="flex items-center justify-between gap-2 text-xs">
                        <span className="inline-flex min-w-0 items-center gap-1.5 text-slate-500">
                          <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="truncate">{item.name}</span>
                        </span>
                        <span className="font-medium text-slate-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xs font-semibold text-slate-900">Chi tiêu 7 ngày</h2>
                    <p className="mt-0.5 text-[11px] text-slate-400">{rangeLabel}</p>
                  </div>
                  <span className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700">7 ngày</span>
                </div>
                <div className="mt-2 h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={spending7Days} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="userSpendingGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.24}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" tickLine={false} axisLine={false} dy={10} style={{ fontSize: 11, fill: "#64748b" }} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-lg">
                              <p className="font-medium text-slate-400">{payload[0].payload.day}</p>
                              <p className="mt-1 font-semibold text-slate-900">{Number(payload[0].value).toLocaleString("vi-VN")}đ</p>
                            </div>
                          );
                        }}
                      />
                      <Area type="monotone" dataKey="spending" stroke="#3b82f6" strokeWidth={2.4} fill="url(#userSpendingGradient)" dot={{ r: 3, fill: "#3b82f6" }} activeDot={{ r: 5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <CalendarClock className="size-4 text-slate-500" />
                  <h2 className="text-sm font-semibold text-slate-900">Lịch sắp tới</h2>
                </div>
                <span className="text-xs font-medium text-slate-400">3 lịch</span>
              </div>
              <div className="divide-y divide-slate-100">
                {upcomingBookings.map((item) => (
                  <button key={`${item.time}-${item.task}`} type="button" onClick={() => router.push("/user/bookings")} className="w-full px-4 py-3.5 text-left transition-colors hover:bg-slate-50/60">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider" style={{ color: item.color, backgroundColor: item.bg, borderColor: item.border }}>
                        {item.type}
                      </span>
                      <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-bold text-slate-900">
                        {item.time}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-slate-800">{item.task}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-slate-500" />
                  <h2 className="text-sm font-semibold text-slate-900">Tiến trình DH-1055</h2>
                </div>
                <span className="text-xs font-medium text-slate-400">52%</span>
              </div>
              <div className="divide-y divide-slate-100">
                {progressSteps.map((step) => (
                  <div key={step.label} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">{step.label}</p>
                        <p className="mt-0.5 text-xs text-slate-400">{step.detail}</p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium" style={{ color: step.color, backgroundColor: `${step.color}14` }}>
                        <span className="size-1.5 rounded-full" style={{ backgroundColor: step.color }} />
                        {step.status}
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full" style={{ width: `${step.pct}%`, backgroundColor: step.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Gift className="size-4 text-slate-500" />
                  <h2 className="text-sm font-semibold text-slate-900">Ưu đãi & điểm</h2>
                </div>
                <span className="text-xs font-medium text-slate-400">4 mục</span>
              </div>
              <div className="divide-y divide-slate-100">
                {vouchers.map((item) => (
                  <div key={item.name} className="px-4 py-3">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-700">{item.name}</span>
                      <span className="text-[11px] text-slate-400">{item.detail}</span>
                    </div>
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                      </div>
                      <span className="w-8 text-right text-[10px] font-bold text-slate-500">{item.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <TicketCheck className="size-4 text-slate-500" />
                  <h2 className="text-sm font-semibold text-slate-900">Nhắc nhở cá nhân</h2>
                </div>
                <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600">4 lưu ý</span>
              </div>
              <div className="space-y-3 p-4">
                {reminders.map((note) => (
                  <div key={note.text} className="space-y-1 rounded-lg border border-slate-100/80 p-3" style={{ backgroundColor: note.bg }}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: note.color }}>{note.type}</span>
                      <span className="size-1.5 rounded-full" style={{ backgroundColor: note.color }} />
                    </div>
                    <p className="text-xs font-semibold leading-relaxed text-slate-700">{note.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
            <Toolbar
              leftContent={
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-900">Bảng đơn & lịch gần nhất</h2>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">{filteredOrders.length}</span>
                </div>
              }
              query={query}
              onQueryChange={(value) => {
                setQuery(value);
                setPage(1);
              }}
              columns={columns}
              onColumnsChange={setColumns}
              tableResizeMode={tableResizeMode}
              onTableResizeModeChange={setTableResizeMode}
              selectedCount={selectedIds.size}
              onOpenAddColumn={() => toast.info("Bảng tổng quan dùng bộ cột cố định.")}
              onOpenHistory={() => {}}
              onExport={handleExport}
              defaultExportFileName={`tong-quan-user-${new Date().toISOString().slice(0, 10)}`}
              onCreateClick={() => router.push("/user/bookings")}
              createLabel="Đặt lịch"
              defaultColumnIds={orderColumns.map((column) => column.id)}
              searchPlaceholder="Tìm mã đơn, dịch vụ, lịch hẹn..."
              showHistoryButton={false}
            />

            <FilterBar
              rangeLabel={rangeLabel}
              selectedValue={selectedStatus}
              onValueChange={(value) => {
                setSelectedStatus(value as CustomerOrderStatus | "Tất cả");
                setPage(1);
              }}
              filterOptions={statusOptions}
              filterLabel="Trạng thái"
              allSelected={allVisibleSelected}
              disabled={visibleIds.length === 0}
              selectedCount={selectedVisibleCount}
              totalCount={visibleIds.length}
              itemLabel="dòng"
              checkboxClass={checkboxClass}
              onToggleAll={toggleAll}
            />

            <TableView
              columns={columns}
              rows={paginatedOrders}
              pageSize={pageSize}
              emptyMessage="Chưa có đơn hoặc lịch phù hợp."
              tableResizeMode={tableResizeMode}
              totalVisibleWidth={totalVisibleWidth}
              renderCell={renderCell}
              page={safePage}
              pageCount={pageCount}
              totalRows={filteredOrders.length}
              customPageSize={customPageSize}
              openPageSizeMenu={openPageSizeMenu}
              onOpenPageSizeMenuChange={setOpenPageSizeMenu}
              onCustomPageSizeChange={setCustomPageSize}
              onApplyCustomPageSize={applyCustomPageSize}
              onUpdatePageSize={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
