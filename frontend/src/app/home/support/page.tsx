"use client";

import React, { useState } from "react";
import { AlertCircle, MessageSquare, Star, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const initialTickets = [
  ["HT-302", "Mất đồ", "Nguyễn Minh Anh", "Đang xác minh", "Cao"],
  ["HT-303", "Giao trễ", "Trần Hoàng Nam", "Đã phản hồi", "Trung bình"],
  ["HT-304", "Hỏng nút áo", "Lê Thu Hà", "Chờ xử lý", "Cao"],
  ["HT-305", "Đánh giá dịch vụ", "Phạm Gia Hân", "Hoàn tất", "Thấp"],
];

export default function SupportPage() {
  const [tickets, setTickets] = useState(initialTickets);
  const [notes, setNotes] = useState([
    "Đã gọi khách xác nhận tình trạng áo. Hẹn kiểm tra camera khu nhận đồ và phản hồi trước 17:00.",
  ]);

  const addTicket = () => {
    const nextIndex = tickets.length + 1;
    setTickets((current) => [
      [`HT-${302 + nextIndex}`, "Phiếu hỗ trợ mới", `Khách mới ${nextIndex}`, "Chờ xử lý", "Trung bình"],
      ...current,
    ]);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 pb-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 relative overflow-hidden rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,_#ffffff_0%,_#f8fbff_55%,_#eff6ff_100%)] p-6 shadow-sm ring-1 ring-white/70 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge className="mb-3 rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 ring-1 ring-blue-100 hover:bg-blue-50">
            Hỗ trợ & phản hồi
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Hỗ trợ & Phản hồi</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Tiếp nhận khiếu nại về mất đồ, hỏng đồ, giao trễ, đánh giá sao từ
            khách và lưu lịch sử xử lý sự cố.
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-blue-600 text-white shadow-sm hover:bg-blue-700" onClick={addTicket}>
            <MessageSquare className="mr-2 size-4" />
            Tạo và lưu phiếu
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["18", "Phiếu mở", MessageSquare],
          ["4", "Ưu tiên cao", AlertCircle],
          ["4,8/5", "Đánh giá trung bình", Star],
          ["92%", "Đã xử lý đúng hạn", Wrench],
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

      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className="overflow-hidden rounded-[22px] border-slate-200 bg-white/95 shadow-sm ring-1 ring-white/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <CardHeader className="border-b border-slate-100 bg-white">
            <CardTitle>Danh sách khiếu nại và phản hồi</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="pl-4">Mã phiếu</TableHead>
                  <TableHead>Vấn đề</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="pr-4">Mức độ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((item) => (
                  <TableRow key={item[0]}>
                    <TableCell className="pl-4 font-semibold text-slate-900">{item[0]}</TableCell>
                    <TableCell>{item[1]}</TableCell>
                    <TableCell>{item[2]}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 ring-1 ring-blue-100">{item[3]}</Badge>
                    </TableCell>
                    <TableCell className="pr-4">{item[4]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-[22px] border-slate-200 bg-white/95 shadow-sm ring-1 ring-white/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <CardHeader>
            <CardTitle>Lịch sử xử lý sự cố</CardTitle>
            <p className="text-sm text-slate-500">Ghi nhận hành động chăm sóc khách hàng.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea className="min-h-40 focus-visible:border-blue-500 focus-visible:ring-blue-500/30" defaultValue={notes[0]} />
            <div className="space-y-2">
              {notes.map((note) => (
                <div key={note} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  {note}
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full border-slate-200"
              onClick={() => setNotes((current) => [`Cập nhật xử lý mới lúc ${current.length + 1}: đã lưu vào lịch sử.`, ...current])}
            >
              Lưu cập nhật xử lý
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
