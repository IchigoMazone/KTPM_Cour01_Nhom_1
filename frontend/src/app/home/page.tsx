"use client";

import { useMemo } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  Clock,
  Package,
  Shirt,
  ShoppingBag,
  Truck,
  Wallet,
  TrendingUp,
  Calendar,
  CheckCircle2,
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
  YAxis,
} from "recharts";
import {
  PageShell,
} from "./_components/dashboard-primitives";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import {
  addDays,
  DateRange,
  differenceInDays,
  formatRange,
  normalizeRange,
  shortDateFormatter,
} from "@/src/utils/dashboard-time";

function formatCurrency(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toLocaleString("vi-VN", {
      maximumFractionDigits: 1,
    })}tr`;
  }

  return value.toLocaleString("vi-VN");
}

function buildRevenueData(range: DateRange) {
  const days = differenceInDays(range.start, range.end) + 1;
  const points = Math.min(Math.max(days, 1), 14);
  const step = Math.max(1, Math.floor(days / points));

  return Array.from({ length: points }, (_, index) => {
    const date = addDays(range.start, index * step);
    const base = 5200000 + ((index + days) % 6) * 680000;
    const weekendBoost = [0, 6].includes(date.getDay()) ? 900000 : 0;

    return {
      day: days <= 1 ? "Hôm nay" : shortDateFormatter.format(date),
      value: base + weekendBoost + Math.min(days, 30) * 45000,
    };
  });
}

const serviceShare = [
  { name: "Giặt thường", value: 46, color: "#111827" },
  { name: "Giặt khô", value: 22, color: "#6b7280" },
  { name: "Giặt hấp", value: 19, color: "#9ca3af" },
  { name: "Đồ da", value: 13, color: "#d1d5db" },
];

const urgentOrders = [
  ["DH-1048", "Nguyễn Thị Hương", "Giặt hấp", "Phơi/Sấy", "10:30"],
  ["DH-1052", "Trần Minh", "Giặt khô", "Gấp/Là", "11:15"],
  ["DH-1055", "Phạm Lan", "Giặt thường", "Sẵn sàng giao", "12:00"],
  ["DH-1057", "Công ty ABC", "Chăn màn", "Đang giặt", "12:30"],
];

const alerts = [
  ["Nước xả vải", "Còn 6 lít, thấp hơn ngưỡng 8 lít", "danger"],
  ["Nhân viên vắng", "1 nhân viên ca chiều đã báo nghỉ", "warning"],
  ["Khiếu nại mở", "2 phản hồi giao trễ chưa xử lý", "warning"],
];

/* ── Status badges configuration for table ── */
const urgentStatusColor: Record<string, string> = {
  "Phơi/Sấy": "#f59e0b",
  "Gấp/Là": "#8b5cf6",
  "Sẵn sàng giao": "#10b981",
  "Đang giặt": "#3b82f6",
};

const urgentStatusBg: Record<string, string> = {
  "Phơi/Sấy": "rgba(245,158,11,0.08)",
  "Gấp/Là": "rgba(139,92,246,0.08)",
  "Sẵn sàng giao": "rgba(16,185,129,0.08)",
  "Đang giặt": "rgba(59,130,246,0.08)",
};

/* ── Modern components locally designed for absolute visual fidelity ── */
function DashboardStatCard({
  label,
  value,
  hint,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-300 flex items-center gap-4 group">
      <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor} transition-transform group-hover:scale-105 duration-200 shadow-sm border border-slate-100`}>
        <Icon className="size-5.5" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{label}</span>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 leading-none">{value}</h2>
        <span className="mt-1.5 text-xs text-slate-500 truncate block font-medium">{hint}</span>
      </div>
    </div>
  );
}

function DashboardSectionCard({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col ${className}`}>
      <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 shrink-0 bg-slate-50/30">
        <div className="space-y-0.5">
          <h3 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight">{title}</h3>
          {description && <p className="text-xs text-slate-400 font-medium">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="flex-1 min-h-0 overflow-auto">{children}</div>
    </div>
  );
}

export default function HomeOverview() {
  const range = useDashboardTimeRangeStore((state) => state.range);
  const normalizedRange = normalizeRange(range);
  const rangeLabel = formatRange(normalizedRange);
  const dayCount = differenceInDays(normalizedRange.start, normalizedRange.end) + 1;

  const revenueData = useMemo(
    () =>
      buildRevenueData({
        mode: normalizedRange.mode,
        start: normalizedRange.start,
        end: normalizedRange.end,
      }),
    [normalizedRange.end, normalizedRange.mode, normalizedRange.start],
  );

  const summary = useMemo(() => {
    const orders = 48 + dayCount * 6 + (normalizedRange.mode === "month" ? 34 : 0);
    const revenue = revenueData.reduce((total, item) => total + item.value, 0);
    const processing = Math.max(12, Math.round(orders * 0.36));
    const overdue = Math.max(1, Math.round(dayCount / 3));

    return { orders, revenue, processing, overdue };
  }, [dayCount, normalizedRange.mode, revenueData]);

  const dynamicServiceShare = useMemo(
    () =>
      serviceShare.map((item, index) => ({
        ...item,
        value: Math.max(8, item.value + ((dayCount + index) % 5) - 2),
      })),
    [dayCount],
  );

  const dynamicServiceColors = ["#0f172a", "#475569", "#94a3b8", "#cbd5e1"];

  const alertToneConfig: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    danger: {
      bg: "bg-rose-50/50",
      border: "border-rose-100",
      text: "text-rose-700",
      dot: "#f43f5e",
    },
    warning: {
      bg: "bg-amber-50/50",
      border: "border-amber-100",
      text: "text-amber-700",
      dot: "#f59e0b",
    },
  };

  const machineConfig: Record<string, { dot: string; bg: string; text: string; border: string }> = {
    "Đang chạy": { dot: "#3b82f6", bg: "bg-blue-50/70", border: "border-blue-100", text: "text-blue-700" },
    "Rảnh": { dot: "#10b981", bg: "bg-emerald-50/70", border: "border-emerald-100", text: "text-emerald-700" },
    "Bảo trì": { dot: "#f59e0b", bg: "bg-amber-50/70", border: "border-amber-100", text: "text-amber-700" },
  };

  return (
    <PageShell
      title="Tổng quan"
      description={`Theo dõi đơn hàng, doanh thu, vận hành và cảnh báo trong khoảng ${rangeLabel}.`}
      fullHeight={true}
    >
      {/* ── Sub-viewport scroll locking container ── */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-6 pr-1">
        
        {/* ── Section 1: Stat Cards ── */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DashboardStatCard
            label="Tổng đơn"
            value={summary.orders.toLocaleString("vi-VN")}
            hint={`Trong ${dayCount} ngày đã chọn`}
            icon={ShoppingBag}
            iconBg="bg-indigo-50/80"
            iconColor="text-indigo-600"
          />
          <DashboardStatCard
            label="Doanh thu"
            value={formatCurrency(summary.revenue)}
            hint={`Trung bình ${formatCurrency(Math.round(summary.revenue / dayCount))}/ngày`}
            icon={Wallet}
            iconBg="bg-emerald-50/80"
            iconColor="text-emerald-600"
          />
          <DashboardStatCard
            label="Đang xử lý"
            value={summary.processing.toLocaleString("vi-VN")}
            hint="Giặt · Sấy · Gấp đang vận hành"
            icon={Shirt}
            iconBg="bg-amber-50/80"
            iconColor="text-amber-600"
          />
          <DashboardStatCard
            label="Đơn trễ hạn"
            value={summary.overdue.toLocaleString("vi-VN")}
            hint="Cần ưu tiên xử lý trong kỳ"
            icon={AlertTriangle}
            iconBg="bg-rose-50/80"
            iconColor="text-rose-600"
          />
        </div>

        {/* ── Section 2: Table and System Alerts ── */}
        <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
          
          {/* Urgent Orders Card */}
          <DashboardSectionCard
            title="Đơn cần xử lý ngay"
            description={`Các đơn có deadline trong khoảng ${rangeLabel}.`}
          >
            <div className="overflow-x-auto">
              <Table className="w-full table-fixed min-w-[500px]">
                <TableHeader>
                  <TableRow className="border-b border-slate-200 bg-slate-50/70 hover:bg-slate-50/70">
                    <TableHead className="w-10 pl-4">
                      <input
                        type="checkbox"
                        aria-label="Chọn tất cả đơn"
                        className="size-4 appearance-none rounded-[5px] border border-slate-300 bg-white checked:bg-slate-900 checked:border-slate-900 relative cursor-pointer after:content-[''] after:absolute after:hidden checked:after:block after:left-[4.5px] after:top-[1px] after:w-[5px] after:h-[9px] after:border-white after:border-b-2 after:border-r-2 after:rotate-45 transition-all duration-150"
                      />
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 w-[90px]">Mã đơn</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 w-[180px]">Khách</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 w-[100px]">Dịch vụ</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 w-[140px]">Trạng thái</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 pr-4 text-right w-[80px]">Deadline</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {urgentOrders.map(([id, customer, service, status, deadline]) => (
                    <TableRow
                      key={id}
                      className="group border-b border-slate-100 transition-colors hover:bg-slate-50/60"
                    >
                      <TableCell className="pl-4">
                        <input
                          type="checkbox"
                          aria-label={`Chọn đơn ${id}`}
                          className="size-4 appearance-none rounded-[5px] border border-slate-300 bg-white checked:bg-slate-900 checked:border-slate-900 relative cursor-pointer after:content-[''] after:absolute after:hidden checked:after:block after:left-[4.5px] after:top-[1px] after:w-[5px] after:h-[9px] after:border-white after:border-b-2 after:border-r-2 after:rotate-45 transition-all duration-150"
                        />
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900 text-sm">
                        {id}
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-0 items-center gap-2.5">
                          <Image
                            src="/default_avatar.jfif"
                            alt={customer}
                            width={24}
                            height={24}
                            className="size-6 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
                          />
                          <span className="font-semibold text-slate-800 whitespace-nowrap">
                            {customer}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm font-medium">
                        {service}
                      </TableCell>
                      <TableCell>
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold"
                          style={{
                            color: urgentStatusColor[status] || "#64748b",
                            backgroundColor: urgentStatusBg[status] || "rgba(100,116,139,0.08)",
                          }}
                        >
                          <span
                            className="size-1.5 rounded-full"
                            style={{ backgroundColor: urgentStatusColor[status] || "#64748b" }}
                          />
                          {status}
                        </span>
                      </TableCell>
                      <TableCell className="pr-4 text-right font-bold text-slate-500 text-sm">
                        {deadline}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DashboardSectionCard>

          {/* System Alerts Card */}
          <DashboardSectionCard title="Cảnh báo hệ thống">
            <div className="divide-y divide-slate-100">
              {alerts.map(([title, desc, tone]) => {
                const config = alertToneConfig[tone] || alertToneConfig.warning;
                return (
                  <div key={title} className="flex items-start gap-4 p-4 transition-colors hover:bg-slate-50/50">
                    <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 border border-slate-200/60 shadow-sm">
                      {title === "Nước xả vải" ? (
                        <Package className="size-4.5" />
                      ) : title === "Nhân viên vắng" ? (
                        <Clock className="size-4.5" />
                      ) : (
                        <Truck className="size-4.5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 text-sm">{title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-normal">{desc}</p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 ${config.bg} ${config.text} border ${config.border}`}
                    >
                      <span className="size-1.5 rounded-full" style={{ backgroundColor: config.dot }} />
                      Mở
                    </span>
                  </div>
                );
              })}
            </div>
          </DashboardSectionCard>

        </div>

        {/* ── Section 3: Recharts (Area and Pie) ── */}
        <div className="grid gap-5 lg:grid-cols-2">
          
          {/* Revenue Chart */}
          <DashboardSectionCard title="Doanh thu theo thời gian" description={rangeLabel}>
            <div className="h-[280px] p-5 flex flex-col justify-end">
              <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f172a" stopOpacity={0.08} />
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                    style={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
                  />
                  <YAxis
                    tickFormatter={(value) => `${Number(value) / 1000000}tr`}
                    tickLine={false}
                    axisLine={false}
                    dx={-5}
                    style={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {payload[0].payload.day}
                            </p>
                            <p className="mt-1 text-sm font-bold text-slate-800">
                              {Number(payload[0].value).toLocaleString("vi-VN")}đ
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    dataKey="value"
                    stroke="#0f172a"
                    fill="url(#revenueGradient)"
                    strokeWidth={2}
                    type="monotone"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </DashboardSectionCard>

          {/* Service Share Pie Chart */}
          <DashboardSectionCard title="Tỷ lệ dịch vụ" description={rangeLabel}>
            <div className="grid gap-5 p-5 md:grid-cols-[1.2fr_1fr]">
              <div className="h-[220px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dynamicServiceShare}
                      dataKey="value"
                      innerRadius={65}
                      outerRadius={88}
                      paddingAngle={3}
                      cx="50%"
                      cy="50%"
                    >
                      {dynamicServiceShare.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={dynamicServiceColors[index % dynamicServiceColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-800 shadow-lg">
                              {payload[0].name}: {payload[0].value}%
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col justify-center gap-3 pr-2">
                {dynamicServiceShare.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2.5 text-slate-500 font-medium">
                      <span
                        className="size-2.5 rounded-full shrink-0 border border-white shadow-sm"
                        style={{ backgroundColor: dynamicServiceColors[index % dynamicServiceColors.length] }}
                      />
                      {item.name}
                    </span>
                    <span className="font-bold text-slate-900 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </DashboardSectionCard>

        </div>

        {/* ── Section 4: Upcoming, Capacity and Sources ── */}
        <div className="grid gap-5 xl:grid-cols-3">
          
          {/* Upcoming Appointments */}
          <DashboardSectionCard title="Lịch hẹn sắp tới">
            <div className="space-y-3 p-5">
              {[
                ["09:00", "Lấy đồ", "Trần Minh"],
                ["10:30", "Giao DH-1048", "Nguyễn Thị Hương"],
                ["13:00", "Lấy chăn màn", "Công ty ABC"],
              ].map(([time, task, customer]) => (
                <div
                  key={`${time}-${task}`}
                  className="group rounded-xl border border-slate-200 bg-white p-3.5 transition-all hover:border-slate-300 hover:shadow-sm flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">
                      {task}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 text-slate-500">
                      <Image
                        src="/default_avatar.jfif"
                        alt={customer}
                        width={18}
                        height={18}
                        className="size-4.5 rounded-full object-cover shadow-sm ring-1 ring-slate-100"
                      />
                      <span className="text-xs font-medium text-slate-500">{customer}</span>
                    </div>
                  </div>
                  <span className="shrink-0 bg-slate-900 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm border border-slate-800">
                    {time}
                  </span>
                </div>
              ))}
            </div>
          </DashboardSectionCard>

          {/* Machine Capacity */}
          <DashboardSectionCard title="Năng lực máy hôm nay">
            <div className="space-y-3 p-5">
              {[
                ["Máy giặt 01", "Đang chạy", "42 phút"],
                ["Máy sấy 02", "Rảnh", "Sẵn sàng"],
                ["Máy hấp 01", "Bảo trì", "16:00 xong"],
              ].map(([machine, status, eta]) => {
                const cfg = machineConfig[status] || machineConfig["Rảnh"];
                return (
                  <div
                    key={machine}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 transition-all hover:border-slate-300 hover:shadow-sm"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{machine}</p>
                      <p className="text-xs text-slate-400 font-semibold mt-1">{eta}</p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                    >
                      <span className="size-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
          </DashboardSectionCard>

          {/* Order Sources (with visual horizontal bars) */}
          <DashboardSectionCard title="Nguồn đơn">
            <div className="space-y-4 p-5 text-sm">
              {[
                ["Website đặt lịch", 31],
                ["Zalo / Điện thoại", 24],
                ["Khách tại cửa hàng", 21],
                ["Khách doanh nghiệp", 10],
              ].map(([source, count]) => {
                const maxCount = 31;
                const percent = (Number(count) / maxCount) * 100;
                return (
                  <div key={String(source)} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600">{String(source)}</span>
                      <span className="font-bold text-slate-900 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-md">
                        {count} đơn
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-slate-900 transition-all duration-500 ease-out"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </DashboardSectionCard>

        </div>

      </div>
    </PageShell>
  );
}
