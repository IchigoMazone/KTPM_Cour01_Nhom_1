"use client";

/*
  Module: Finance Management
  - Daily & monthly revenue charts (Recharts)
  - Customer receivables (debts)
  - Operating expenses
  - Profit summary (Revenue - Expense)
  - Add income / expense records
*/

import React, { useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Plus, X } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueRecord {
  date: string; // YYYY-MM-DD
  amount: number;
}

interface ExpenseRecord {
  id: number;
  category: string;
  amount: number;
  date: string; // YYYY-MM-DD
}

interface Receivable {
  id: number;
  customer: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
}

const seedRevenue: RevenueRecord[] = [
  { date: "2024-05-10", amount: 3500000 },
  { date: "2024-05-11", amount: 4200000 },
  { date: "2024-05-12", amount: 3800000 },
  { date: "2024-05-13", amount: 4500000 },
  { date: "2024-05-14", amount: 5200000 },
  { date: "2024-05-15", amount: 4800000 },
  { date: "2024-05-16", amount: 6100000 },
];

const seedExpenses: ExpenseRecord[] = [
  { id: 1, category: "Tiền điện", amount: 1500000, date: "2024-05-12" },
  { id: 2, category: "Lương tài xế", amount: 3000000, date: "2024-05-13" },
  { id: 3, category: "Bảo trì máy giặt", amount: 1200000, date: "2024-05-14" },
];

const seedReceivables: Receivable[] = [
  { id: 1, customer: "Công ty ABC", amount: 2500000, dueDate: "2024-05-20" },
  { id: 2, customer: "Shop XYZ", amount: 1800000, dueDate: "2024-05-18" },
];

export default function FinanceManagement() {
  const [revenue] = useState<RevenueRecord[]>(seedRevenue);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(seedExpenses);
  const [receivables, setReceivables] = useState<Receivable[]>(seedReceivables);

  // modal add expense / income
  const [showExpense, setShowExpense] = useState(false);
  const [exCategory, setExCategory] = useState("");
  const [exAmount, setExAmount] = useState("0");
  const [exDate, setExDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  const openExpense = () => {
    setExCategory("");
    setExAmount("0");
    setExDate(new Date().toISOString().slice(0, 10));
    setShowExpense(true);
  };

  const saveExpense = () => {
    const amt = parseFloat(exAmount);
    if (!exCategory.trim() || isNaN(amt) || amt <= 0) return;
    const newRec: ExpenseRecord = {
      id: Date.now(),
      category: exCategory,
      amount: amt,
      date: exDate,
    };
    setExpenses((prev) => [...prev, newRec]);
    setShowExpense(false);
  };

  const totalRevenue = useMemo(
    () => revenue.reduce((sum, r) => sum + r.amount, 0),
    [revenue]
  );
  const totalExpense = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );
  const profit = totalRevenue - totalExpense;

  // Group monthly revenue
  const monthlyRevenue = useMemo(() => {
    const map: Record<string, number> = {};
    revenue.forEach((r) => {
      const month = r.date.slice(0, 7); // YYYY-MM
      map[month] = (map[month] || 0) + r.amount;
    });
    return Object.entries(map).map(([month, amount]) => ({ month, amount }));
  }, [revenue]);

  return (
    <div className="flex flex-col gap-8 p-6 w-full">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Tài chính</h2>
          <p className="text-muted-foreground text-sm">
            Doanh thu, chi phí & lợi nhuận
          </p>
        </div>
        <Button className="gap-2" onClick={openExpense}>
          <Plus className="h-4 w-4" /> Ghi chi phí
        </Button>
      </div>

      {/* KPI Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-green-600">
            {totalRevenue.toLocaleString("vi-VN")} đ
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Chi phí</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-red-600">
            {totalExpense.toLocaleString("vi-VN")} đ
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lợi nhuận</CardTitle>
          </CardHeader>
          <CardContent
            className={`text-2xl font-semibold ${profit >= 0 ? "text-green-700" : "text-red-700"}`}
          >
            {profit.toLocaleString("vi-VN")} đ
          </CardContent>
        </Card>
      </div>

      {/* Revenue Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>Doanh thu theo ngày</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenue} margin={{ left: 0, right: 16, top: 16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value ?? 0).toLocaleString("vi-VN")} đ`} />
                <Line type="monotone" dataKey="amount" stroke="#16a34a" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>Doanh thu theo tháng</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenue} margin={{ left: 0, right: 16, top: 16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value ?? 0).toLocaleString("vi-VN")} đ`} />
                <Line type="monotone" dataKey="amount" stroke="#0ea5e9" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Receivables */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Công nợ khách hàng</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="min-w-[600px]">
            <colgroup>
              <col />
              <col className="w-40" />
              <col className="w-40" />
            </colgroup>
            <TableHeader>
              <TableRow className="bg-muted/50 text-left">
                <TableHead>Khách hàng</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Hạn</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receivables.map((r) => (
                <TableRow key={r.id} className="border-b">
                  <TableCell>{r.customer}</TableCell>
                  <TableCell>{r.amount.toLocaleString("vi-VN")} đ</TableCell>
                  <TableCell>{r.dueDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Expenses */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Chi phí vận hành</CardTitle>
        </CardHeader>
        <CardContent className="p-0 max-h-64 overflow-y-auto">
          <Table className="min-w-[600px]">
            <colgroup>
              <col />
              <col className="w-40" />
              <col className="w-40" />
            </colgroup>
            <TableHeader>
              <TableRow className="bg-muted/50 text-left">
                <TableHead>Hạng mục</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Ngày</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((e) => (
                <TableRow key={e.id} className="border-b">
                  <TableCell>{e.category}</TableCell>
                  <TableCell>{e.amount.toLocaleString("vi-VN")} đ</TableCell>
                  <TableCell>{e.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Expense modal */}
      {showExpense && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">Ghi chi phí</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowExpense(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Hạng mục</Label>
                <Input value={exCategory} onChange={(e) => setExCategory(e.target.value)} placeholder="Tiền điện" />
              </div>
              <div className="space-y-2">
                <Label>Số tiền (đ)</Label>
                <Input type="number" value={exAmount} onChange={(e) => setExAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Ngày</Label>
                <Input type="date" value={exDate} onChange={(e) => setExDate(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={saveExpense}>
                Lưu
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
