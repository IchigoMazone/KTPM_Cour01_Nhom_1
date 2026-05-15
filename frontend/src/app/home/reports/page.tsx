"use client";

/*
  Report & Statistics Dashboard
  - Order & revenue summary charts (Recharts)
  - Most-used services table
  - Frequent customers table
  - Export CSV / Print PDF stubs
  Note: install recharts: `npm i recharts`
*/

import React, { useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { FileDown, Printer } from "lucide-react";

// ---------- Seed data ----------
const orderDaily = [
  { date: "2024-05-10", orders: 120, revenue: 3500000 },
  { date: "2024-05-11", orders: 140, revenue: 4200000 },
  { date: "2024-05-12", orders: 128, revenue: 3800000 },
  { date: "2024-05-13", orders: 156, revenue: 4500000 },
  { date: "2024-05-14", orders: 172, revenue: 5200000 },
  { date: "2024-05-15", orders: 160, revenue: 4800000 },
  { date: "2024-05-16", orders: 185, revenue: 6100000 },
];

const servicesUsage = [
  { service: "Giặt thường", count: 340 },
  { service: "Giặt khô", count: 180 },
  { service: "Giặt hấp", count: 95 },
  { service: "Giặt đồ da", count: 40 },
];

const frequentCustomers = [
  { customer: "Nguyễn Văn A", orders: 45 },
  { customer: "Công ty ABC", orders: 38 },
  { customer: "Shop XYZ", orders: 30 },
  { customer: "Trần Thị B", orders: 28 },
];

// ---------- Helpers ----------
function downloadCSV(filename: string, rows: string[][]) {
  const csvContent = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.click();
}

// ---------- Component ----------
export default function ReportStatistics() {
  const totalOrders = useMemo(() => orderDaily.reduce((s, d) => s + d.orders, 0), []);
  const totalRevenue = useMemo(() => orderDaily.reduce((s, d) => s + d.revenue, 0), []);

  const exportOrdersCSV = () => {
    const rows = [["Date", "Orders", "Revenue"]].concat(
      orderDaily.map((o) => [o.date, String(o.orders), String(o.revenue)])
    );
    downloadCSV("orders_report.csv", rows);
  };

  const exportServicesCSV = () => {
    const rows = [["Service", "Count"]].concat(
      servicesUsage.map((s) => [s.service, String(s.count)])
    );
    downloadCSV("services_report.csv", rows);
  };

  const handlePrint = () => {
    window.print(); // simple print PDF
  };

  return (
    <div className="flex flex-col gap-8 p-6 w-full">
      <div className="flex items-center justify-between flex-wrap gap-4 print:hidden">
        <h2 className="text-2xl font-semibold">Báo cáo & Thống kê</h2>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={exportOrdersCSV}>
            <FileDown className="h-4 w-4" /> Xuất CSV
          </Button>
          <Button className="gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" /> In / PDF
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid md:grid-cols-2 gap-4 print:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tổng đơn hàng (7 ngày)</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {totalOrders}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu (7 ngày)</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-green-700">
            {totalRevenue.toLocaleString("vi-VN")} đ
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Đơn hàng & Doanh thu theo ngày</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={orderDaily} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value: number, name) => (name === "revenue" ? `${value.toLocaleString("vi-VN")} đ` : value)} />
              <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Đơn" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} dot={false} name="Doanh thu" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top services */}
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>Dịch vụ được dùng nhiều nhất</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="min-w-[400px]">
              <TableHeader>
                <TableRow className="bg-muted/50 text-left">
                  <TableHead>Dịch vụ</TableHead>
                  <TableHead>Số lần</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {servicesUsage.map((s) => (
                  <TableRow key={s.service} className="border-b">
                    <TableCell>{s.service}</TableCell>
                    <TableCell>{s.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="print:hidden">
            <Button variant="outline" size="sm" onClick={exportServicesCSV}>
              <FileDown className="h-4 w-4" /> CSV Dịch vụ
            </Button>
          </CardFooter>
        </Card>

        {/* Frequent customers */}
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>Khách hàng thường xuyên</CardTitle>
          </CardHeader>
          <CardContent className="p-0 max-h-64 overflow-y-auto">
            <Table className="min-w-[400px]">
              <TableHeader>
                <TableRow className="bg-muted/50 text-left">
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Đơn</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {frequentCustomers.map((c) => (
                  <TableRow key={c.customer} className="border-b">
                    <TableCell>{c.customer}</TableCell>
                    <TableCell>{c.orders}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}