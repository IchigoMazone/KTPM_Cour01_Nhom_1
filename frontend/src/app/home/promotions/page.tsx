"use client";

import React, { useState } from "react";
import { Gift, Medal, Percent, Plus, Ticket } from "lucide-react";
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

const initialCampaigns = [
  ["GIAT10", "Giảm 10% đơn đầu", "Mã giảm giá", "126 lượt", "Đang chạy"],
  ["LOYALTY5", "Đổi 500 điểm lấy 50.000đ", "Tích điểm", "42 lượt", "Đang chạy"],
  ["COMBO3KG", "Combo giặt sấy 3kg", "Combo dịch vụ", "88 lượt", "Đang chạy"],
  ["VIP20", "Ưu đãi khách thân thiết", "Loyalty", "31 lượt", "Lên lịch"],
];

export default function PromotionsPage() {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ code: "", content: "", type: "" });

  const addCampaign = () => {
    if (!form.code.trim() || !form.content.trim()) {
      setMessage("Vui lòng nhập mã và nội dung chương trình trước khi lưu.");
      return;
    }

    setCampaigns((current) => [
      [form.code.trim(), form.content.trim(), form.type.trim() || "Mã giảm giá", "0 lượt", "Đang chạy"],
      ...current,
    ]);
    setForm({ code: "", content: "", type: "" });
    setMessage("Đã lưu chương trình khuyến mãi mới.");
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 pb-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 relative overflow-hidden rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,_#ffffff_0%,_#f8fbff_55%,_#eff6ff_100%)] p-6 shadow-sm ring-1 ring-white/70 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge className="mb-3 rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 ring-1 ring-blue-100 hover:bg-blue-50">
            Khuyến mãi & loyalty
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Khuyến mãi & Loyalty</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Tạo mã giảm giá, chương trình tích điểm đổi quà, ưu đãi khách hàng
            thân thiết và combo dịch vụ.
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-blue-600 text-white shadow-sm hover:bg-blue-700" onClick={addCampaign}>
            <Plus className="mr-2 size-4" />
            Tạo và lưu chương trình
          </Button>
        </div>
      </header>

      {message ? (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">{message}</div>
      ) : null}

      <Card className="rounded-[22px] border-slate-200 bg-white/95 shadow-sm ring-1 ring-white/70">
        <CardHeader>
          <CardTitle>Nhập chương trình khuyến mãi</CardTitle>
          <p className="text-sm text-slate-500">Chương trình sẽ hiện ngay trong bảng quản lý.</p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Input value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} placeholder="Mã / chương trình" />
          <Input value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} placeholder="Nội dung ưu đãi" />
          <Input value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))} placeholder="Loại" />
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["12", "Mã đang chạy", Ticket],
          ["326", "Khách loyalty", Medal],
          ["18%", "Tỷ lệ dùng mã", Percent],
          ["84", "Quà đã đổi", Gift],
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
          <CardTitle>Chương trình đang quản lý</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="pl-4">Mã / chương trình</TableHead>
                <TableHead>Nội dung</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Lượt dùng</TableHead>
                <TableHead className="pr-4">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((item) => (
                <TableRow key={item[0]}>
                  <TableCell className="pl-4 font-semibold text-slate-900">{item[0]}</TableCell>
                  <TableCell>{item[1]}</TableCell>
                  <TableCell>{item[2]}</TableCell>
                  <TableCell>{item[3]}</TableCell>
                  <TableCell className="pr-4">
                    <Badge variant="secondary" className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 ring-1 ring-blue-100">{item[4]}</Badge>
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
