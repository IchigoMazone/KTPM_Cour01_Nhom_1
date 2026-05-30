"use client";

import Image from "next/image";
import { useMemo } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  EyeOff,
  CheckCircle2,
  PackageCheck,
  Search,
  Settings2,
  Wallet,
  WashingMachine,
  FlaskConical,
  StickyNote,
  Pencil,
  FileText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Area,
  AreaChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageShell } from "./_components/dashboard-primitives";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import { addDays, formatRange, normalizeRange, shortDateFormatter } from "@/src/utils/dashboard-time";

type OrderStatus = "Tiếp nhận" | "Đang giặt" | "Kiểm tra" | "Chờ thanh toán" | "Hoàn thành" | "Quá hạn";

const statusStyle: Record<OrderStatus, { color: string; bg: string }> = {
  "Tiếp nhận": { color: "#6366f1", bg: "rgba(99,102,241,0.08)" },
  "Đang giặt": { color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  "Kiểm tra": { color: "#8b5cf6", bg: "rgba(139,92,246,0.08)" },
  "Chờ thanh toán": { color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
  "Hoàn thành": { color: "#10b981", bg: "rgba(16,185,129,0.08)" },
  "Quá hạn": { color: "#dc2626", bg: "rgba(220,38,38,0.08)" },
};

const latestOrders: Array<{
  id: string;
  customerName: string;
  customerType: "Mới" | "Cũ";
  service: string;
  weight: string;
  status: OrderStatus;
  deliveryDate: string;
  deliveryTime: string;
  washer: string | null;
  dryer: string | null;
  staff: string;
}> = [
  {
    id: "DH-1078",
    customerName: "Nguyễn Thị Hương",
    customerType: "Cũ",
    service: "Giặt sấy",
    weight: "6 kg",
    status: "Đang giặt",
    deliveryDate: "30/05",
    deliveryTime: "18:00",
    washer: "Máy giặt 01",
    dryer: null,
    staff: "Anh Minh",
  },
  {
    id: "DH-1077",
    customerName: "Trần Minh",
    customerType: "Mới",
    service: "Giặt khô",
    weight: "3 kg",
    status: "Kiểm tra",
    deliveryDate: "30/05",
    deliveryTime: "17:30",
    washer: "Máy giặt 02",
    dryer: null,
    staff: "Chị Lan",
  },
  {
    id: "DH-1076",
    customerName: "Công ty ABC",
    customerType: "Cũ",
    service: "Chăn màn",
    weight: "8 kg",
    status: "Tiếp nhận",
    deliveryDate: "30/05",
    deliveryTime: "20:00",
    washer: null,
    dryer: null,
    staff: "Anh Tuấn",
  },
  {
    id: "DH-1075",
    customerName: "Shop Linen",
    customerType: "Cũ",
    service: "Giặt sấy",
    weight: "12 kg",
    status: "Chờ thanh toán",
    deliveryDate: "31/05",
    deliveryTime: "19:00",
    washer: "Máy giặt 01",
    dryer: "Máy sấy 01",
    staff: "Chị Lan",
  },
  {
    id: "DH-1074",
    customerName: "Hotel Majestic",
    customerType: "Cũ",
    service: "Chăn màn",
    weight: "25 kg",
    status: "Quá hạn",
    deliveryDate: "30/05",
    deliveryTime: "16:30",
    washer: "Máy giặt 02",
    dryer: null,
    staff: "Anh Minh",
  },
  {
    id: "DH-1073",
    customerName: "Lê Mai",
    customerType: "Mới",
    service: "Vệ sinh rèm",
    weight: "4 kg",
    status: "Hoàn thành",
    deliveryDate: "30/05",
    deliveryTime: "15:00",
    washer: "Máy giặt 02",
    dryer: "Máy sấy 02",
    staff: "Anh Tuấn",
  },
];

const machines = [
  { name: "Máy giặt 01", type: "Máy giặt", status: "Đang chạy", detail: "Còn 42 phút", progress: 68, color: "#3b82f6", customer: "Chị Hương (DH-1078)" },
  { name: "Máy giặt 02", type: "Máy giặt", status: "Rảnh", detail: "Sẵn sàng nhận mẻ", progress: 0, color: "#10b981", customer: null },
  { name: "Máy sấy 01", type: "Máy sấy", status: "Đang chạy", detail: "Còn 18 phút", progress: 82, color: "#f59e0b", customer: "Anh Minh (DH-1077)" },
  { name: "Máy sấy 02", type: "Máy sấy", status: "Bảo trì", detail: "Kiểm tra nhiệt", progress: 35, color: "#ef4444", customer: null },
];

const todayMix = [
  { name: "Hoàn thành", value: 22, color: "#10b981" },
  { name: "Đang xử lý", value: 18, color: "#f59e0b" },
  { name: "Quá hạn", value: 4, color: "#ef4444" },
  { name: "Mới", value: 4, color: "#6366f1" },
];

function formatCurrency(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}tr`;
  }

  return value.toLocaleString("vi-VN");
}

function buildRevenue7Days() {
  const today = new Date();
  const start = addDays(today, -6);

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index);
    const base = 5200000 + ((index + 3) % 5) * 720000;
    const weekend = [0, 6].includes(date.getDay()) ? 960000 : 0;

    return {
      day: shortDateFormatter.format(date),
      revenue: base + weekend,
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

export default function HomeOverview() {
  const range = useDashboardTimeRangeStore((state) => state.range);
  const rangeLabel = formatRange(normalizeRange(range));
  const revenue7Days = useMemo(() => buildRevenue7Days(), []);
  const todayRevenue = revenue7Days[revenue7Days.length - 1]?.revenue ?? 0;

  const activeMachinesCount = useMemo(() => machines.filter((m) => m.status === "Đang chạy").length, []);
  const totalMachines = machines.length;
  const machineEfficiency = useMemo(() => {
    if (totalMachines === 0) return 0;
    return Math.round((activeMachinesCount / totalMachines) * 100);
  }, [activeMachinesCount, totalMachines]);

  return (
    <PageShell fullHeight>
      <div className="min-h-0 flex-1 overflow-auto bg-white">
        <div className="flex min-h-full flex-col gap-4 p-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              <KpiCard
                title="Tổng đơn hôm nay"
                value="48"
                hint="12 đơn mới trong 2 giờ gần nhất"
                change="+8.4%"
                icon={PackageCheck}
                color="#06b6d4"
              />
              <KpiCard
                title="Doanh thu hôm nay"
                value={formatCurrency(todayRevenue)}
                hint="Đã thu và chờ thanh toán"
                change="+12.1%"
                icon={Wallet}
                color="#10b981"
              />
              <KpiCard
                title="Đơn đang xử lý"
                value="18"
                hint="Giặt, sấy, kiểm tra"
                change="+3 đơn"
                icon={WashingMachine}
                color="#f59e0b"
              />
              <KpiCard
                title="Đơn quá hạn"
                value="4"
                hint="Cần ưu tiên trong hôm nay"
                change="-1 đơn"
                icon={AlertTriangle}
                color="#ef4444"
              />
              <KpiCard
                title="Đơn hoàn thành"
                value="22"
                hint="Đã giao và tất toán"
                change="+6 đơn"
                icon={CheckCircle2}
                color="#10b981"
              />
              <KpiCard
                title="Máy đang hoạt động"
                value={`${activeMachinesCount}/${totalMachines}`}
                hint="Đang xử lý đơn hàng"
                change={`Hiệu suất ${machineEfficiency}%`}
                icon={WashingMachine}
                color="#3b82f6"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-semibold text-slate-900">Cơ cấu hôm nay</h2>
                  <span className="text-xs font-medium text-slate-400">48 đơn</span>
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
                      <span className="text-lg font-semibold text-slate-950">48</span>
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
                    <h2 className="text-xs font-semibold text-slate-900">Doanh thu 7 ngày</h2>
                    <p className="mt-0.5 text-[11px] text-slate-400">{rangeLabel}</p>
                  </div>
                  <span className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700">7 ngày</span>
                </div>
                <div className="mt-2 h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenue7Days} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.24}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
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
                              <p className="mt-1 font-semibold text-slate-900">
                                {Number(payload[0].value).toLocaleString("vi-VN")}đ
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.4} fill="url(#revenueGradient)" dot={{ r: 3, fill: "#10b981" }} activeDot={{ r: 5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-4">
            {/* Đơn sắp tới hẹn (Ngoài cùng bên trái) */}
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <CalendarClock className="size-4 text-slate-500" />
                  <h2 className="text-sm font-semibold text-slate-900">Đơn sắp tới hẹn</h2>
                </div>
                <span className="text-xs font-medium text-slate-400">3 lịch hẹn</span>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { time: "09:00", task: "Lấy đồ giặt sấy", customer: "Trần Minh", avatar: "/default_avatar.jfif", type: "Lấy đồ", color: "#3b82f6", bg: "rgba(59,130,246,0.06)", border: "rgba(59,130,246,0.12)" },
                  { time: "10:30", task: "Giao đơn DH-1048", customer: "Nguyễn Thị Hương", avatar: "/default_avatar.jfif", type: "Giao đồ", color: "#10b981", bg: "rgba(16,185,129,0.06)", border: "rgba(16,185,129,0.12)" },
                  { time: "13:00", task: "Lấy đồ chăn màn", customer: "Công ty ABC", avatar: "/default_avatar.jfif", type: "Lấy đồ", color: "#6366f1", bg: "rgba(99,102,241,0.06)", border: "rgba(99,102,241,0.12)" },
                ].map((item, index) => (
                  <div key={index} className="px-4 py-3.5 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border" style={{ color: item.color, backgroundColor: item.bg, borderColor: item.border }}>
                            {item.type}
                          </span>
                          <span className="text-[11px] font-bold text-slate-900 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                            {item.time}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-800 text-xs mt-2">
                          {item.task}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Image
                            src={item.avatar}
                            alt={item.customer}
                            width={16}
                            height={16}
                            className="size-4 rounded-full object-cover shadow-sm ring-1 ring-slate-100"
                          />
                          <span className="text-[11px] font-semibold text-slate-500">{item.customer}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tình trạng máy giặt/máy sấy (Ở giữa bên trái) */}
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <WashingMachine className="size-4 text-slate-500" />
                  <h2 className="text-sm font-semibold text-slate-900">Tình trạng máy giặt/máy sấy</h2>
                </div>
                <span className="text-xs font-medium text-slate-400">{machines.length} máy</span>
              </div>
              <div className="divide-y divide-slate-100">
                {machines.map((machine) => (
                  <div key={machine.name} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">{machine.name}</p>
                        <p className="mt-0.5 text-xs text-slate-400">{machine.type} · {machine.detail}</p>
                        {machine.customer && (
                          <div className="mt-1 flex items-center gap-1">
                            <span className="text-[10px] font-medium text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                              Đồ của: <span className="font-semibold text-slate-700">{machine.customer}</span>
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium" style={{ color: machine.color, backgroundColor: `${machine.color}14` }}>
                        <span className="size-1.5 rounded-full" style={{ backgroundColor: machine.color }} />
                        {machine.status}
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full" style={{ width: `${machine.progress}%`, backgroundColor: machine.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Thống kê tài nguyên (Ở giữa bên phải) */}
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <FlaskConical className="size-4 text-slate-500" />
                  <h2 className="text-sm font-semibold text-slate-900">Thống kê tài nguyên</h2>
                </div>
                <span className="text-xs font-medium text-slate-400">5 danh mục</span>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { name: "Nước giặt chính", current: "45L", total: "50L", pct: 90, color: "#3b82f6" },
                  { name: "Nước xả thơm", current: "32L", total: "50L", pct: 64, color: "#10b981" },
                  { name: "Nước tẩy chuyên dụng", current: "8L", total: "20L", pct: 40, color: "#f59e0b" },
                  { name: "Móc treo quần áo", current: "180 chiếc", total: "200 chiếc", pct: 90, color: "#8b5cf6" },
                  { name: "Túi đóng gói", current: "250 chiếc", total: "500 chiếc", pct: 50, color: "#06b6d4" },
                ].map((item, index) => (
                  <div key={index} className="px-4 py-3">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-700">{item.name}</span>
                      <span className="text-slate-450 text-[11px]">
                        <strong className="text-slate-900 font-semibold">{item.current}</strong> / {item.total}
                      </span>
                    </div>
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 w-8 text-right">{item.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ghi chú & Nhắc nhở (Ngoài cùng bên phải) */}
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <StickyNote className="size-4 text-slate-500" />
                  <h2 className="text-sm font-semibold text-slate-900">Ghi chú & Nhắc nhở</h2>
                </div>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 border border-indigo-100">4 lưu ý</span>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { text: "Kiểm tra khuy áo dạ của anh Trần Minh trước khi giặt", type: "Quan trọng", color: "#ef4444", bg: "rgba(239,68,68,0.06)" },
                  { text: "Đơn DH-1075 yêu cầu sấy nhẹ nhiệt độ thấp", type: "Lưu ý", color: "#f59e0b", bg: "rgba(245,158,11,0.06)" },
                  { text: "Nhắc nhân viên ca sau bàn giao tiền mặt đối soát", type: "Nhắc nhở", color: "#3b82f6", bg: "rgba(59,130,246,0.06)" },
                  { text: "Máy sấy 02 bảo trì dự kiến xong lúc 18:30 hôm nay", type: "Thông tin", color: "#10b981", bg: "rgba(16,185,129,0.06)" },
                ].map((note, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-100/80 space-y-1" style={{ backgroundColor: note.bg }}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: note.color }}>
                        {note.type}
                      </span>
                      <span className="size-1.5 rounded-full" style={{ backgroundColor: note.color }} />
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                      {note.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-900">Bảng đơn hàng mới nhất</h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">{latestOrders.length}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full min-w-[180px] flex-1 lg:w-56 lg:flex-none">
                  <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
                  <Input className="h-8 rounded-md border-transparent bg-white pl-8 text-xs shadow-none focus-visible:ring-slate-200" placeholder="Tìm đơn hàng" />
                </div>
                <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs text-slate-700 hover:bg-slate-50">
                  <EyeOff className="size-3.5" />
                  Ẩn
                </button>
                <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs text-slate-700 hover:bg-slate-50">
                  <Settings2 className="size-3.5" />
                  Tùy chỉnh
                </button>
                <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 px-3 text-xs font-medium text-slate-800 hover:bg-slate-50">
                  Xuất file
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table className="w-[1410px] xl:w-full table-fixed text-xs [&_td:not(:first-child)]:border-l [&_td:not(:first-child)]:border-slate-100">
                <TableHeader>
                  <TableRow className="h-9 border-b border-slate-100 bg-slate-50 hover:bg-slate-50">
                    <TableHead className="w-[110px] pl-4 text-xs font-medium text-slate-600">
                      <span className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          aria-label="Chọn tất cả đơn mới"
                          className="relative size-4 appearance-none rounded-[5px] border border-slate-300 bg-white transition-all duration-150 checked:border-slate-900 checked:bg-slate-900 after:absolute after:left-[4.5px] after:top-[1px] after:hidden after:h-[9px] after:w-[5px] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:content-[''] checked:after:block"
                        />
                        Mã đơn
                      </span>
                    </TableHead>
                    <TableHead className="w-[170px] border-l border-slate-100 text-xs font-medium text-slate-600">Khách hàng</TableHead>
                    <TableHead className="w-[100px] border-l border-slate-100 text-xs font-medium text-slate-600">Loại khách</TableHead>
                    <TableHead className="w-[100px] border-l border-slate-100 text-xs font-medium text-slate-600">Dịch vụ</TableHead>
                    <TableHead className="w-[100px] border-l border-slate-100 text-xs font-medium text-slate-600">Khối lượng</TableHead>
                    <TableHead className="w-[130px] border-l border-slate-100 text-xs font-medium text-slate-600">Trạng thái</TableHead>
                    <TableHead className="w-[100px] border-l border-slate-100 text-xs font-medium text-slate-600">Ngày giao</TableHead>
                    <TableHead className="w-[90px] border-l border-slate-100 text-xs font-medium text-slate-600">Giờ giao</TableHead>
                    <TableHead className="w-[125px] border-l border-slate-100 text-xs font-medium text-slate-600">Máy giặt</TableHead>
                    <TableHead className="w-[125px] border-l border-slate-100 text-xs font-medium text-slate-600">Máy sấy</TableHead>
                    <TableHead className="w-[110px] border-l border-slate-100 text-xs font-medium text-slate-600">Nhân viên</TableHead>
                    <TableHead className="w-[150px] border-l border-slate-100 px-4 text-left text-xs font-medium text-slate-600">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestOrders.map((order) => {
                    const style = statusStyle[order.status];

                    return (
                      <TableRow key={order.id} className="h-11 border-b border-slate-100 text-slate-700 hover:bg-slate-50/60">
                        <TableCell className="pl-4 font-medium text-slate-900">
                          <span className="inline-flex items-center gap-2">
                            <input
                              type="checkbox"
                              aria-label={`Chọn đơn ${order.id}`}
                              className="relative size-4 appearance-none rounded-[5px] border border-slate-300 bg-white transition-all duration-150 checked:border-slate-900 checked:bg-slate-900 after:absolute after:left-[4.5px] after:top-[1px] after:hidden after:h-[9px] after:w-[5px] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:content-[''] checked:after:block"
                            />
                            {order.id}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex min-w-0 items-center gap-2">
                            <Image src="/default_avatar.jfif" alt={order.customerName} width={24} height={24} className="size-6 shrink-0 rounded-full object-cover" />
                            <span className="truncate font-semibold text-slate-800">{order.customerName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
                            order.customerType === "Mới"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}>
                            Khách {order.customerType}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-600 font-medium">{order.service}</TableCell>
                        <TableCell className="text-slate-600 font-semibold">{order.weight}</TableCell>
                        <TableCell>
                          <span
                            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2 py-0.5 font-medium"
                            style={{ color: style.color, backgroundColor: style.bg }}
                          >
                            <span className="size-1.5 rounded-full" style={{ backgroundColor: style.color }} />
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell className="font-semibold text-slate-700">{order.deliveryDate}</TableCell>
                        <TableCell className="font-semibold text-slate-900">{order.deliveryTime}</TableCell>
                        <TableCell>
                          {order.washer ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-50/50 border border-blue-105 px-2 py-0.5 rounded-md">
                              <span className="size-1.5 rounded-full bg-blue-500" />
                              {order.washer}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Chưa dùng</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {order.dryer ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50/50 border border-amber-105 px-2 py-0.5 rounded-md">
                              <span className="size-1.5 rounded-full bg-amber-500" />
                              {order.dryer}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Chưa dùng</span>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-600 font-medium">{order.staff}</TableCell>
                        <TableCell className="px-4">
                          <div className="flex items-center justify-start gap-1.5">
                            <button
                              type="button"
                              className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50"
                              onClick={() => {
                                window.location.href = `/home/orders?id=${order.id}&action=edit`;
                              }}
                              title="Sửa đơn hàng"
                            >
                              <Pencil className="size-3" />
                              Sửa
                            </button>
                            <button
                              type="button"
                              className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50"
                              onClick={() => {
                                window.location.href = `/home/orders?id=${order.id}&action=invoice`;
                              }}
                              title="Xem hóa đơn"
                            >
                              <FileText className="size-3" />
                              Hóa đơn
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
