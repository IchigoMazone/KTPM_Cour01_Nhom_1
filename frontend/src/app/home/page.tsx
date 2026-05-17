"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Banknote,
  Clock3,
  PackageCheck,
  Shirt,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Metric = {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
};

const metrics: Metric[] = [
  {
    label: "Tổng đơn hôm nay",
    value: "42",
    note: "Đơn đã tiếp nhận trong ngày",
    icon: PackageCheck,
  },
  {
    label: "Doanh thu ngày",
    value: "8,6 triệu",
    note: "Tính đến hiện tại",
    icon: Banknote,
  },
  {
    label: "Doanh thu tuần",
    value: "54,2 triệu",
    note: "Tổng 7 ngày gần nhất",
    icon: Banknote,
  },
  {
    label: "Doanh thu tháng",
    value: "154 triệu",
    note: "Tổng trong tháng hiện tại",
    icon: Banknote,
  },
  {
    label: "Đơn đang xử lý",
    value: "18",
    note: "Chưa hoàn tất giao trả",
    icon: Shirt,
  },
  {
    label: "Cảnh báo trễ hạn",
    value: "3",
    note: "Cần xử lý ưu tiên",
    icon: AlertTriangle,
  },
];

type RevenuePeriod = "day" | "month" | "year";

const revenuePeriods: Array<{
  id: RevenuePeriod;
  label: string;
  total: string;
  data: Array<{ label: string; value: number }>;
}> = [
  {
    id: "day",
    label: "Ngày",
    total: "8,6 triệu",
    data: [
      { label: "08:00", value: 1.1 },
      { label: "10:00", value: 2.0 },
      { label: "12:00", value: 1.7 },
      { label: "14:00", value: 2.8 },
      { label: "16:00", value: 3.9 },
      { label: "18:00", value: 5.0 },
      { label: "20:00", value: 8.6 },
    ],
  },
  {
    id: "month",
    label: "Tháng",
    total: "154 triệu",
    data: [
      { label: "Tuần 1", value: 31 },
      { label: "Tuần 2", value: 42 },
      { label: "Tuần 3", value: 49 },
      { label: "Tuần 4", value: 32 },
    ],
  },
  {
    id: "year",
    label: "Năm",
    total: "1,72 tỷ",
    data: [
      { label: "T1", value: 120 },
      { label: "T2", value: 132 },
      { label: "T3", value: 148 },
      { label: "T4", value: 141 },
      { label: "T5", value: 164 },
      { label: "T6", value: 176 },
      { label: "T7", value: 188 },
      { label: "T8", value: 205 },
    ],
  },
];

const processingOrders = [
  { label: "Tiếp nhận", value: 12 },
  { label: "Đang giặt", value: 9 },
  { label: "Phơi/sấy", value: 6 },
  { label: "Gấp", value: 4 },
  { label: "Chờ giao", value: 7 },
];

const lateOrders = [
  ["DH-1048", "Nguyễn Minh Anh", "Chăn ga 5kg", "Đang sấy", "Trễ 45 phút"],
  ["DH-1051", "Trần Hoàng Nam", "Giặt khô áo vest", "Đang giặt", "Trễ 1 giờ"],
  ["DH-1057", "Lê Thu Hà", "Combo sơ mi", "Chờ giao", "Trễ 2 giờ"],
];

function StatCard({ label, value, note, icon: Icon }: Metric) {
  return (
    <Card className="rounded-[22px] border-slate-200 bg-white/95 shadow-sm ring-1 ring-white/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">
          {label}
        </CardTitle>
        <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
          <Icon className="size-5" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        <p className="mt-1 text-xs text-slate-500">{note}</p>
      </CardContent>
    </Card>
  );
}

function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-[22px] border-slate-200 bg-white/95 shadow-sm ring-1 ring-white/70">
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-slate-100">
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description ? (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          ) : null}
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function formatRevenue(value: number) {
  if (value >= 100) return `${value.toLocaleString("vi-VN")}tr`;
  return `${value.toLocaleString("vi-VN")}tr`;
}

export default function DashboardOverview() {
  const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>("day");
  const activeRevenue =
    revenuePeriods.find((item) => item.id === revenuePeriod) ?? revenuePeriods[0];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 pb-10 text-slate-900 sm:px-6 lg:px-8">
      <header className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,_#ffffff_0%,_#f8fbff_55%,_#eff6ff_100%)] p-6 shadow-sm ring-1 ring-white/70">
        <Badge className="mb-3 rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 ring-1 ring-blue-100 hover:bg-blue-50">
          Trang chủ / Tổng quan
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Tổng quan tiệm giặt
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          Hiển thị tổng đơn hàng hôm nay, doanh thu ngày/tháng/năm, số đơn
          đang xử lý và cảnh báo đơn trễ hạn.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel
          title="Biểu đồ doanh thu"
          description="Chuyển đổi giữa doanh thu theo ngày, tháng và năm."
          action={
            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
              {revenuePeriods.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setRevenuePeriod(item.id)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    revenuePeriod === item.id
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          }
        >
          <div className="space-y-6">
            <div>
              <p className="text-sm text-slate-500">Tổng doanh thu</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
                {activeRevenue.total}
              </p>
            </div>

            <div className="h-80 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeRevenue.data} margin={{ left: 0, right: 12, top: 12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.24} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickFormatter={(value) => formatRevenue(Number(value))}
                    width={46}
                  />
                  <Tooltip
                    cursor={{ stroke: "#93c5fd", strokeWidth: 1 }}
                    contentStyle={{
                      borderRadius: 14,
                      border: "1px solid #dbeafe",
                      boxShadow: "0 12px 30px rgba(15,23,42,0.12)",
                    }}
                    formatter={(value) => [formatRevenue(Number(value)), "Doanh thu"]}
                    labelStyle={{ color: "#0f172a", fontWeight: 600 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fill="url(#revenueFill)"
                    dot={{ r: 4, fill: "#ffffff", stroke: "#2563eb", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "#2563eb", stroke: "#ffffff", strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Panel>

        <Panel
          title="Số đơn đang xử lý"
          description="18 đơn đang nằm trong các bước xử lý."
        >
          <div className="space-y-5">
            {processingOrders.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    {item.label}
                  </span>
                  <span className="text-slate-500">{item.value} đơn</span>
                </div>
                <Progress value={item.value * 8} className="h-2" />
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <Panel
        title="Cảnh báo đơn trễ hạn"
        description="Các đơn cần điều phối trước khi ảnh hưởng cam kết giao trả."
        action={
          <Badge className="rounded-full bg-red-50 px-2.5 py-1 text-red-700 ring-1 ring-red-100 hover:bg-red-50">
            3 đơn trễ
          </Badge>
        }
      >
        <div className="-mx-4 -mb-4">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="pl-4">Mã đơn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Dịch vụ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="pr-4 text-right">Thời gian trễ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lateOrders.map((order) => (
                <TableRow key={order[0]}>
                  <TableCell className="pl-4 font-semibold text-slate-900">
                    {order[0]}
                  </TableCell>
                  <TableCell>{order[1]}</TableCell>
                  <TableCell>{order[2]}</TableCell>
                  <TableCell>{order[3]}</TableCell>
                  <TableCell className="pr-4 text-right">
                    <span className="inline-flex items-center gap-1 text-red-600">
                      <Clock3 className="size-3.5" />
                      {order[4]}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Panel>
    </div>
  );
}
