"use client";

import React, { useState } from "react";
import { BadgeCheck, Plus, Shirt, Sparkles } from "lucide-react";
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

const initialServices = [
  ["Giặt thường", "Theo kg", "25.000đ/kg", "Quần áo hằng ngày", "Đang bán"],
  ["Giặt khô", "Theo món", "80.000đ/món", "Vest, áo khoác, váy", "Đang bán"],
  ["Giặt hấp", "Theo món", "120.000đ/món", "Đồ cao cấp cần giữ form", "Đang bán"],
  ["Giặt đồ da", "Theo món", "180.000đ/món", "Áo da, túi da", "Cần xác nhận"],
];

export default function ServicesPage() {
  const [services, setServices] = useState(initialServices);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    pricing: "",
    price: "",
    scope: "",
  });

  const addService = () => {
    if (!form.name.trim() || !form.price.trim()) {
      setMessage("Vui lòng nhập tên dịch vụ và đơn giá trước khi lưu.");
      return;
    }

    setServices((current) => [
      [
        form.name.trim(),
        form.pricing.trim() || "Theo kg",
        form.price.trim(),
        form.scope.trim() || "Dịch vụ mới thêm",
        "Đang bán",
      ],
      ...current,
    ]);
    setMessage(`Đã thêm dịch vụ ${form.name.trim()} vào bảng giá.`);
    setForm({ name: "", pricing: "", price: "", scope: "" });
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 pb-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 relative overflow-hidden rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,_#ffffff_0%,_#f8fbff_55%,_#eff6ff_100%)] p-6 shadow-sm ring-1 ring-white/70 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge className="mb-3 rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 ring-1 ring-blue-100 hover:bg-blue-50">
            Dịch vụ & bảng giá
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dịch vụ & Bảng giá</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Quản lý các loại dịch vụ giặt thường, giặt khô, giặt hấp, giặt đồ
            da và thiết lập giá theo kg hoặc theo món đồ.
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-blue-600 text-white shadow-sm hover:bg-blue-700" onClick={addService}>
            <Plus className="mr-2 size-4" />
            Lưu dịch vụ
          </Button>
        </div>
      </header>

      {message ? (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
          {message}
        </div>
      ) : null}

      <Card className="rounded-[22px] border-slate-200 bg-white/95 shadow-sm ring-1 ring-white/70">
        <CardHeader>
          <CardTitle>Nhập dịch vụ mới</CardTitle>
          <p className="text-sm text-slate-500">
            Dữ liệu sau khi lưu sẽ xuất hiện ngay trong bảng giá dịch vụ.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Tên dịch vụ" />
          <Input value={form.pricing} onChange={(event) => setForm((current) => ({ ...current, pricing: event.target.value }))} placeholder="Cách tính: theo kg / theo món" />
          <Input value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} placeholder="Đơn giá" />
          <Input value={form.scope} onChange={(event) => setForm((current) => ({ ...current, scope: event.target.value }))} placeholder="Áp dụng cho" />
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["14", "Dịch vụ đang bán", BadgeCheck],
          ["8", "Giá theo kg", Shirt],
          ["6", "Giá theo món", Sparkles],
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

      <Card className="overflow-hidden rounded-[22px] border-slate-200 bg-white/95 shadow-sm ring-1 ring-white/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader className="border-b border-slate-100 bg-white">
          <CardTitle>Bảng giá dịch vụ</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="pl-4">Dịch vụ</TableHead>
                <TableHead>Cách tính</TableHead>
                <TableHead>Đơn giá</TableHead>
                <TableHead>Áp dụng cho</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="pr-4 text-right">Sửa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((item) => (
                <TableRow key={item[0]}>
                  <TableCell className="pl-4 font-semibold text-slate-900">{item[0]}</TableCell>
                  <TableCell>{item[1]}</TableCell>
                  <TableCell>{item[2]}</TableCell>
                  <TableCell>{item[3]}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 ring-1 ring-blue-100">{item[4]}</Badge>
                  </TableCell>
                  <TableCell className="pr-4 text-right text-slate-500">Đã lưu</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
