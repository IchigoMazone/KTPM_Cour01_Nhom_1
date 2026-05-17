"use client";

import React, { useState } from "react";
import { CalendarClock, ClipboardCheck, UserPlus, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const initialStaff = [
  ["NV-01", "Nguyễn Văn Bình", "Giặt/sấy", "Ca sáng", "32 đơn", 88],
  ["NV-02", "Lê Thị An", "Gấp/đóng gói", "Ca chiều", "26 đơn", 79],
  ["NV-03", "Phạm Quốc Khoa", "Giao nhận", "Ca tối", "18 chuyến", 72],
  ["NV-04", "Trần Mỹ Linh", "Thu ngân", "Ca sáng", "45 phiếu", 91],
];

export default function StaffPage() {
  const [staff, setStaff] = useState(initialStaff);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ name: "", task: "", shift: "" });

  const addStaff = () => {
    if (!form.name.trim() || !form.task.trim()) {
      setMessage("Vui lòng nhập tên nhân viên và công việc trước khi lưu.");
      return;
    }

    const nextIndex = staff.length + 1;
    setStaff((current) => [
      [`NV-${String(nextIndex).padStart(2, "0")}`, form.name.trim(), form.task.trim(), form.shift.trim() || "Ca mới", "0 đơn", 0],
      ...current,
    ]);
    setForm({ name: "", task: "", shift: "" });
    setMessage("Đã lưu nhân viên mới vào danh sách.");
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 pb-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 relative overflow-hidden rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,_#ffffff_0%,_#f8fbff_55%,_#eff6ff_100%)] p-6 shadow-sm ring-1 ring-white/70 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge className="mb-3 rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 ring-1 ring-blue-100 hover:bg-blue-50">
            Nhân sự
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Nhân viên</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Quản lý danh sách nhân viên, ca làm việc, phân công theo ca và theo
            dõi năng suất từng người.
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-blue-600 text-white shadow-sm hover:bg-blue-700" onClick={addStaff}>
            <UserPlus className="mr-2 size-4" />
            Thêm và lưu nhân viên
          </Button>
        </div>
      </header>

      {message ? (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">{message}</div>
      ) : null}

      <Card className="rounded-[22px] border-slate-200 bg-white/95 shadow-sm ring-1 ring-white/70">
        <CardHeader>
          <CardTitle>Nhập nhân viên mới</CardTitle>
          <p className="text-sm text-slate-500">Nhân viên mới sẽ hiện ngay trong bảng phân công.</p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Tên nhân viên" />
          <Input value={form.task} onChange={(event) => setForm((current) => ({ ...current, task: event.target.value }))} placeholder="Công việc" />
          <Input value={form.shift} onChange={(event) => setForm((current) => ({ ...current, shift: event.target.value }))} placeholder="Ca làm" />
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["18", "Nhân viên hoạt động", UsersRound],
          ["6", "Ca làm hôm nay", CalendarClock],
          ["94%", "Hoàn thành phân công", ClipboardCheck],
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
          <CardTitle>Phân công và năng suất</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="pl-4">Mã NV</TableHead>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Công việc</TableHead>
                <TableHead>Ca</TableHead>
                <TableHead>Sản lượng</TableHead>
                <TableHead className="w-56 pr-4">Năng suất</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((item) => (
                <TableRow key={item[0] as string}>
                  <TableCell className="pl-4 font-semibold text-slate-900">{item[0] as string}</TableCell>
                  <TableCell>{item[1] as string}</TableCell>
                  <TableCell>{item[2] as string}</TableCell>
                  <TableCell>{item[3] as string}</TableCell>
                  <TableCell>{item[4] as string}</TableCell>
                  <TableCell className="pr-4">
                    <div className="flex items-center gap-3">
                      <Progress value={item[5] as number} className="h-2" />
                      <span className="w-10 text-right text-sm text-slate-500">{item[5] as number}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
