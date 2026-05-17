"use client";

import React, { useState } from "react";
import { Bike, CalendarDays, MapPinned, Route, Truck } from "lucide-react";
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

const initialDeliveries = [
  ["GN-210", "Lấy đồ", "Nguyễn Minh Anh", "08:30", "Quận 1", "Tài xế Bình", "Đang đi"],
  ["GN-211", "Trả đồ", "Trần Hoàng Nam", "10:00", "Quận 3", "Tài xế An", "Đã nhận"],
  ["GN-212", "Lấy đồ", "Lê Thu Hà", "14:30", "Bình Thạnh", "Tài xế Bình", "Chờ phân công"],
  ["GN-213", "Trả đồ", "Phạm Gia Hân", "18:00", "Phú Nhuận", "Tài xế Khoa", "Đang giao"],
];

export default function DeliveryPage() {
  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    type: "",
    customer: "",
    time: "",
    area: "",
    driver: "",
  });

  const addDelivery = () => {
    if (!form.type.trim() || !form.customer.trim() || !form.time.trim()) {
      setMessage("Vui lòng nhập loại lịch, khách hàng và giờ giao nhận trước khi lưu.");
      return;
    }

    const nextIndex = deliveries.length + 1;
    setDeliveries((current) => [
      [`GN-${210 + nextIndex}`, form.type.trim(), form.customer.trim(), form.time.trim(), form.area.trim() || "Chưa cập nhật", form.driver.trim() || "Chưa phân công", "Chờ phân công"],
      ...current,
    ]);
    setForm({ type: "", customer: "", time: "", area: "", driver: "" });
    setMessage("Đã lưu lịch giao nhận mới vào bảng.");
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 pb-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 relative overflow-hidden rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,_#ffffff_0%,_#f8fbff_55%,_#eff6ff_100%)] p-6 shadow-sm ring-1 ring-white/70 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge className="mb-3 rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 ring-1 ring-blue-100 hover:bg-blue-50">
            Điều phối giao nhận
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Quản lý giao nhận</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Lên lịch lấy đồ và trả đồ, phân công tài xế, theo dõi trạng thái
            giao nhận và tuyến đường trong ngày.
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-blue-600 text-white shadow-sm hover:bg-blue-700" onClick={addDelivery}>
            <CalendarDays className="mr-2 size-4" />
            Tạo và lưu lịch
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
          <CardTitle>Nhập lịch giao nhận</CardTitle>
          <p className="text-sm text-slate-500">
            Thông tin sau khi lưu sẽ xuất hiện trong bảng lịch lấy và trả đồ.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Input value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))} placeholder="Loại: lấy đồ / trả đồ" />
          <Input value={form.customer} onChange={(event) => setForm((current) => ({ ...current, customer: event.target.value }))} placeholder="Khách hàng" />
          <Input value={form.time} onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))} placeholder="Giờ" />
          <Input value={form.area} onChange={(event) => setForm((current) => ({ ...current, area: event.target.value }))} placeholder="Khu vực" />
          <Input value={form.driver} onChange={(event) => setForm((current) => ({ ...current, driver: event.target.value }))} placeholder="Tài xế" />
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["18", "Lịch hôm nay", CalendarDays],
          ["7", "Đang lấy đồ", Bike],
          ["9", "Đang trả đồ", Truck],
          ["3", "Tuyến cần tối ưu", Route],
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

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card className="overflow-hidden rounded-[22px] border-slate-200 bg-white/95 shadow-sm ring-1 ring-white/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <CardHeader className="border-b border-slate-100 bg-white">
            <CardTitle>Lịch lấy và trả đồ</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="pl-4">Mã lịch</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Giờ</TableHead>
                  <TableHead>Khu vực</TableHead>
                  <TableHead>Tài xế</TableHead>
                  <TableHead className="pr-4">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.map((item) => (
                  <TableRow key={item[0]}>
                    <TableCell className="pl-4 font-semibold text-slate-900">{item[0]}</TableCell>
                    <TableCell>{item[1]}</TableCell>
                    <TableCell>{item[2]}</TableCell>
                    <TableCell>{item[3]}</TableCell>
                    <TableCell>{item[4]}</TableCell>
                    <TableCell>{item[5]}</TableCell>
                    <TableCell className="pr-4">
                      <Badge variant="secondary" className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 ring-1 ring-blue-100">{item[6]}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-[22px] border-slate-200 bg-white/95 shadow-sm ring-1 ring-white/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <CardHeader>
            <CardTitle>Bản đồ tuyến đường</CardTitle>
            <p className="text-sm text-slate-500">Mô phỏng tuyến giao nhận theo cụm khu vực.</p>
          </CardHeader>
          <CardContent>
            <div className="relative min-h-80 rounded-lg border border-slate-200 bg-blue-50/60 p-4">
              <div className="absolute left-8 top-8 rounded-full bg-blue-600 px-3 py-1 text-xs text-white">Kho</div>
              <div className="absolute right-8 top-16 rounded-full bg-white px-3 py-1 text-xs shadow-sm">Q.1</div>
              <div className="absolute left-16 bottom-20 rounded-full bg-white px-3 py-1 text-xs shadow-sm">Q.3</div>
              <div className="absolute right-14 bottom-10 rounded-full bg-white px-3 py-1 text-xs shadow-sm">B.Thạnh</div>
              <MapPinned className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 text-blue-600" />
              <div className="absolute inset-x-10 top-1/2 h-px bg-blue-200" />
              <div className="absolute bottom-20 left-1/2 h-28 w-px bg-blue-200" />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
