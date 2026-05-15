"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Package,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* --------------------------------------------------------------------------
  DỮ LIỆU GIẢ (sẽ thay bằng API thật sau)
----------------------------------------------------------------------------*/
const metrics = [
  { id: "customers", label: "Khách hàng", value: 1289, change: 5.8, positive: true, icon: Users },
  { id: "orders", label: "Đơn giặt", value: 235, change: 3.2, positive: false, icon: ShoppingBag },
  { id: "revenue", label: "Doanh thu (K)", value: 8600, change: 12.4, positive: true, icon: DollarSign },
  { id: "alerts", label: "Cảnh báo", value: 6, change: 2.1, positive: false, icon: AlertTriangle },
];

const salesMonthly = [
  { month: "Th1", sales: 320 },
  { month: "Th2", sales: 480 },
  { month: "Th3", sales: 410 },
  { month: "Th4", sales: 530 },
  { month: "Th5", sales: 460 },
  { month: "Th6", sales: 380 },
  { month: "Th7", sales: 495 },
  { month: "Th8", sales: 620 },
  { month: "Th9", sales: 540 },
  { month: "Th10", sales: 690 },
  { month: "Th11", sales: 610 },
  { month: "Th12", sales: 420 },
];

const statisticSeries = [
  { month: "Th3", chỉ_tiêu: 160, thực_tế: 50 },
  { month: "Th4", chỉ_tiêu: 155, thực_tế: 40 },
  { month: "Th5", chỉ_tiêu: 170, thực_tế: 52 },
  { month: "Th6", chỉ_tiêu: 165, thực_tế: 42 },
  { month: "Th7", chỉ_tiêu: 166, thực_tế: 65 },
  { month: "Th8", chỉ_tiêu: 200, thực_tế: 135 },
  { month: "Th9", chỉ_tiêu: 225, thực_tế: 110 },
];

const countryData = [
  { country: "Việt Nam", percent: 82 },
  { country: "Hoa Kỳ", percent: 10 },
  { country: "Khác", percent: 8 },
];

const recentOrders = [
  { name: "Áo sơ mi nam", category: "Sơ mi", price: 35000, status: "Hoàn thành" },
  { name: "Áo khoác da", category: "Áo khoác", price: 80000, status: "Đang xử lý" },
  { name: "Chăn lông", category: "Chăn", price: 120000, status: "Đang giao" },
  { name: "Đầm dạ hội", category: "Đầm", price: 100000, status: "Đã hủy" },
  { name: "Giày thể thao", category: "Giày", price: 70000, status: "Hoàn thành" },
];

/* -------------------------------------------------------------------------- */
export default function DashboardOverview() {
  const [gauge] = useState(75.55);

  return (
    <div className="space-y-10 p-6 lg:p-10">
      {/* TIÊU ĐỀ */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Tổng quan tiệm giặt</h1>
        <p className="text-slate-500">
          Theo dõi hoạt động kinh doanh và số liệu quan trọng trong ngày
        </p>
      </header>

      {/* THẺ METRIC */}
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <MetricCard key={m.id} {...m} />
        ))}
      </section>

      {/* DOANH SỐ + TARGET */}
      <section className="grid gap-6 xl:grid-cols-[2.5fr_1fr]">
        {/* BAR MONTHLY */}
        <Card className="rounded-[24px] p-6">
          <h3 className="mb-6 text-lg font-semibold text-slate-800">
            Doanh số theo tháng (Đơn)
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={salesMonthly} radius={[8, 8, 0, 0]} maxBarSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip formatter={(v: number) => v} />
              <Bar dataKey="sales" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* TARGET GAUGE */}
        <Card className="flex flex-col justify-between rounded-[24px] p-6">
          <div>
            <h3 className="font-semibold text-slate-800">Mục tiêu tháng</h3>
            <p className="mt-1 text-sm text-slate-500">
              Tỷ lệ đạt so với kế hoạch
            </p>
          </div>
          <div className="mx-auto my-8 h-44 w-44">
            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
              <path d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0-32" fill="none" stroke="#e5e7eb" strokeWidth="4" />
              <path d="M18 2a16 16 0 0 1 0 32" fill="none" stroke="#4f46e5" strokeWidth="4" strokeDasharray={`${gauge},100`} strokeLinecap="round" />
              <text x="18" y="20" textAnchor="middle" className="rotate-90 fill-slate-900 text-[8px] font-bold">
                {gauge}%
              </text>
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-500">Doanh thu hôm nay cao hơn tháng trước</p>
            <p className="mt-2 text-xs font-medium text-green-600">+10%</p>
          </div>
        </Card>
      </section>

      {/* STATISTIC LINE & MAP + ORDERS */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* STATISTIC LINE */}
        <Card className="rounded-[24px] p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">
            Chỉ tiêu & Thực tế
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={statisticSeries}>
              <defs>
                <linearGradient id="colorTarget" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="chỉ_tiêu"
                stroke="#6366f1"
                fillOpacity={1}
                fill="url(#colorTarget)"
              />
              <Area
                type="monotone"
                dataKey="thực_tế"
                stroke="#22c55e"
                fillOpacity={0.15}
                fill="#22c55e"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* MAP & ORDERS STACK */}
        <div className="space-y-6">
          

          {/* RECENT ORDERS */}
          <Card className="rounded-[24px] p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
              <Package className="h-5 w-5" /> Đơn gần đây
            </h3>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
              {recentOrders.map((o, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4 text-sm">
                  <div className="flex min-w-0 flex-col">
                    <span className="font-medium text-slate-800">{o.name}</span>
                    <span className="text-slate-500">{o.category}</span>
                  </div>
                  <span className="whitespace-nowrap font-medium text-slate-800">
                    {o.price.toLocaleString()}đ
                  </span>
                  <Badge
                    className={`shrink-0 rounded-full px-3 py-1 text-xs ${
                      o.status === "Hoàn thành"
                        ? "bg-green-100 text-green-700"
                        : o.status === "Đang xử lý"
                        ? "bg-yellow-100 text-yellow-700"
                        : o.status === "Đang giao"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {o.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

/* ------------------ MetricCard ------------------ */
function MetricCard({
  label,
  value,
  change,
  positive,
  icon: Icon,
}: {
  label: string;
  value: number;
  change: number;
  positive: boolean;
  icon: React.ComponentType<any>;
}) {
  return (
    <Card className="flex items-center gap-5 rounded-[24px] border px-6 py-5">
      {/* icon */}
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
        <Icon className="h-6 w-6 text-slate-600" />
      </div>
      <CardContent className="p-0">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">
          {value.toLocaleString()}
        </p>
        <div className="mt-1 flex items-center gap-1 text-xs font-medium">
          {positive ? (
            <ArrowUpRight className="h-3 w-3 text-green-600" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-red-600" />
          )}
          <span className={positive ? "text-green-600" : "text-red-600"}>
            {change}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}