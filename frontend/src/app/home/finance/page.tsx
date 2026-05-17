"use client";

import React, { useState } from "react";
import { Banknote, CreditCard, ReceiptText, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const initialCashflow = [
  ["PT-1204", "Thu đơn DH-1062", "Tiền mặt", "+120.000đ", "Đã thu"],
  ["PT-1205", "Thu đơn DH-1061", "VNPay", "+210.000đ", "Đã thu"],
  ["PC-044", "Mua nước tẩy oxy", "Chuyển khoản", "-680.000đ", "Đã chi"],
  ["PC-045", "Xăng giao nhận", "Tiền mặt", "-220.000đ", "Chờ duyệt"],
];

export default function FinancePage() {
  const [cashflow, setCashflow] = useState(initialCashflow);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ content: "", method: "", amount: "" });

  const addCashflow = () => {
    if (!form.content.trim() || !form.amount.trim()) {
      setMessage("Vui lòng nhập nội dung và số tiền trước khi lưu thu chi.");
      return;
    }

    const nextIndex = cashflow.length + 1;
    setCashflow((current) => [
      [`PT-${1205 + nextIndex}`, form.content.trim(), form.method.trim() || "Tiền mặt", form.amount.trim(), "Đã lưu"],
      ...current,
    ]);
    setForm({ content: "", method: "", amount: "" });
    setMessage("Đã lưu khoản thu chi mới vào sổ.");
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 pb-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 relative overflow-hidden rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,_#ffffff_0%,_#f8fbff_55%,_#eff6ff_100%)] p-6 shadow-sm ring-1 ring-white/70 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge className="mb-3 rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 ring-1 ring-blue-100 hover:bg-blue-50">
            Tài chính vận hành
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Tài chính</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Theo dõi doanh thu theo ngày/tháng, công nợ khách hàng, chi phí vận
            hành, lợi nhuận và quản lý thu chi.
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-blue-600 text-white shadow-sm hover:bg-blue-700" onClick={addCashflow}>
            <ReceiptText className="mr-2 size-4" />
            Ghi nhận và lưu
          </Button>
        </div>
      </header>

      {message ? (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">{message}</div>
      ) : null}

      <Card className="rounded-[22px] border-slate-200 bg-white/95 shadow-sm ring-1 ring-white/70">
        <CardHeader>
          <CardTitle>Nhập khoản thu chi</CardTitle>
          <p className="text-sm text-slate-500">Khoản mới sẽ hiện ngay trong sổ thu chi.</p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Input value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} placeholder="Nội dung" />
          <Input value={form.method} onChange={(event) => setForm((current) => ({ ...current, method: event.target.value }))} placeholder="Phương thức" />
          <Input value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} placeholder="Số tiền" />
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["8,6 triệu", "Doanh thu hôm nay", Banknote],
          ["154 triệu", "Doanh thu tháng", TrendingUp],
          ["12,4 triệu", "Công nợ", CreditCard],
          ["38 triệu", "Lợi nhuận tạm tính", ReceiptText],
        ].map(([value, label, Icon]) => (
          <Card key={label as string} className="rounded-[22px] border-slate-200 bg-white/95 shadow-sm ring-1 ring-white/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-slate-500">{label as string}</CardTitle>
              {React.createElement(Icon as React.ElementType, { className: "size-5 text-blue-600" })}
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight">{value as string}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
        <Card className="rounded-[22px] border-slate-200 bg-white/95 shadow-sm ring-1 ring-white/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <CardHeader>
            <CardTitle>Cơ cấu vận hành tháng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              ["Doanh thu dịch vụ", "154 triệu", "bg-blue-600", "100%"],
              ["Chi phí nhân sự", "46 triệu", "bg-blue-400", "30%"],
              ["Vật tư & hóa chất", "22 triệu", "bg-blue-300", "14%"],
              ["Giao nhận", "11 triệu", "bg-blue-200", "7%"],
            ].map((item) => (
              <div key={item[0]} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{item[0]}</span>
                  <span className="text-slate-500">{item[1]}</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className={`h-2 rounded-full ${item[2]}`} style={{ width: item[3] }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[22px] border-slate-200 bg-white/95 shadow-sm ring-1 ring-white/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <CardHeader className="border-b border-slate-100 bg-white">
            <CardTitle>Sổ thu chi</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="pl-4">Mã phiếu</TableHead>
                  <TableHead>Nội dung</TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead className="pr-4">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cashflow.map((item) => (
                  <TableRow key={item[0]}>
                    <TableCell className="pl-4 font-semibold text-slate-900">{item[0]}</TableCell>
                    <TableCell>{item[1]}</TableCell>
                    <TableCell>{item[2]}</TableCell>
                    <TableCell className={item[3].startsWith("+") ? "text-blue-700" : "text-red-600"}>{item[3]}</TableCell>
                    <TableCell className="pr-4">
                      <Badge variant="secondary" className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 ring-1 ring-blue-100">{item[4]}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
