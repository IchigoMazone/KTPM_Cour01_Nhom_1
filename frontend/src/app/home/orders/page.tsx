"use client";

import React, { useState } from "react";
import { FileText, Plus, Shirt, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const stages = ["Tiếp nhận", "Đang giặt", "Phơi/sấy", "Gấp", "Giao trả"];
const initialOrders = [
  ["DH-1062", "Mai Thanh Tú", "Giặt thường 4kg", "Đang giặt", "120.000đ"],
  ["DH-1061", "Ngô Huyền", "Giặt khô váy", "Phơi/sấy", "210.000đ"],
  ["DH-1060", "Đỗ Quốc Bảo", "Chăn ga 6kg", "Gấp", "280.000đ"],
  ["DH-1059", "Vũ An", "Combo sơ mi", "Giao trả", "160.000đ"],
];

export default function OrdersPage() {
  const [orders, setOrders] = useState(initialOrders);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    customer: "",
    phone: "",
    service: "",
    amount: "",
  });

  const addOrder = () => {
    if (!form.customer.trim() || !form.service.trim()) {
      setMessage("Vui lòng nhập tên khách hàng và dịch vụ trước khi lưu đơn.");
      return;
    }

    const nextCode = `DH-${1062 + orders.length}`;
    const nextOrder = [
      nextCode,
      form.customer || "Khách mới",
      form.service || "Giặt thường",
      "Tiếp nhận",
      form.amount || "120.000đ",
    ];

    setOrders((current) => [nextOrder, ...current]);
    setForm({ customer: "", phone: "", service: "", amount: "" });
    setMessage(`Đã lưu đơn ${nextCode} vào danh sách đang xử lý.`);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 pb-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 relative overflow-hidden rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,_#ffffff_0%,_#f8fbff_55%,_#eff6ff_100%)] p-6 shadow-sm ring-1 ring-white/70 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge className="mb-3 rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 ring-1 ring-blue-100 hover:bg-blue-50">
            Quản lý vận hành
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Quản lý đơn hàng</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Tạo đơn giặt mới, theo dõi trạng thái từ tiếp nhận đến giao trả và
            in phiếu đơn hàng cho khách.
          </p>
        </div>
        <Button
          className="bg-blue-600 text-white shadow-sm hover:bg-blue-700"
          onClick={() => setMessage("Nhập thông tin ở phiếu nhận đồ rồi bấm lưu để thêm đơn vào bảng.")}
        >
          <Plus className="mr-2 size-4" />
          Tạo đơn mới
        </Button>
      </header>

      {message ? (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
          {message}
        </div>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <Card className="rounded-[22px] border-slate-200 bg-white/95 shadow-sm ring-1 ring-white/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <CardHeader>
            <CardTitle>Phiếu nhận đồ</CardTitle>
            <p className="text-sm text-slate-500">Nhập nhanh thông tin đơn mới.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tên khách hàng</Label>
              <Input value={form.customer} onChange={(event) => setForm((current) => ({ ...current, customer: event.target.value }))} className="focus-visible:border-blue-500 focus-visible:ring-blue-500/30" />
            </div>
            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} className="focus-visible:border-blue-500 focus-visible:ring-blue-500/30" />
            </div>
            <div className="space-y-2">
              <Label>Dịch vụ</Label>
              <Input value={form.service} onChange={(event) => setForm((current) => ({ ...current, service: event.target.value }))} className="focus-visible:border-blue-500 focus-visible:ring-blue-500/30" />
            </div>
            <div className="space-y-2">
              <Label>Tổng tiền</Label>
              <Input value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} className="focus-visible:border-blue-500 focus-visible:ring-blue-500/30" />
            </div>
            <Button
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
              onClick={addOrder}
            >
              <FileText className="mr-2 size-4" />
              Lưu đơn vào bảng
            </Button>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[22px] border-slate-200 bg-white/95 shadow-sm ring-1 ring-white/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <CardHeader className="border-b border-slate-100 bg-white">
            <CardTitle>Danh sách đơn đang xử lý</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="pl-4">Mã đơn</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Dịch vụ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead className="pr-4 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order[0]}>
                    <TableCell className="pl-4 font-semibold text-slate-900">{order[0]}</TableCell>
                    <TableCell>{order[1]}</TableCell>
                    <TableCell>{order[2]}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 ring-1 ring-blue-100">{order[3]}</Badge>
                    </TableCell>
                    <TableCell>{order[4]}</TableCell>
                    <TableCell className="pr-4 text-right text-slate-500">Đã lưu</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-[22px] border-slate-200 bg-white/95 shadow-sm ring-1 ring-white/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader>
          <CardTitle>Tiến trình xử lý chuẩn</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-5">
          {stages.map((stage, index) => (
            <div key={stage} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                {index === stages.length - 1 ? <Truck className="size-5" /> : <Shirt className="size-5" />}
              </div>
              <p className="font-medium">{stage}</p>
              <Progress value={(index + 1) * 20} className="mt-3 h-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
