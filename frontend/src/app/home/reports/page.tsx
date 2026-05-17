"use client";

import React, { useState } from "react";
import { BarChart3, FileText, Plus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const initialReports = [
  ["Báo cáo đơn hàng", "Ngày / tuần / tháng", "142 đơn", "Đã lưu"],
  ["Báo cáo doanh thu", "Theo kênh thanh toán", "154 triệu", "Đã lưu"],
  ["Dịch vụ dùng nhiều", "Top dịch vụ", "Giặt thường", "Đã lưu"],
  ["Khách hàng thường xuyên", "Top loyalty", "326 khách", "Đã lưu"],
];

export default function ReportsPage() {
  const [reports, setReports] = useState(initialReports);

  const addReport = () => {
    const nextIndex = reports.length + 1;
    setReports((current) => [
      [`Báo cáo mới ${nextIndex}`, "Tùy chọn", "Đang tổng hợp", "Lưu trong hệ thống"],
      ...current,
    ]);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 pb-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 relative overflow-hidden rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,_#ffffff_0%,_#f8fbff_55%,_#eff6ff_100%)] p-6 shadow-sm ring-1 ring-white/70 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge className="mb-3 rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 ring-1 ring-blue-100 hover:bg-blue-50">
            Báo cáo & thống kê
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Báo cáo & Thống kê</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Tổng hợp báo cáo đơn hàng, doanh thu, dịch vụ được dùng nhiều nhất,
            khách hàng thường xuyên và lưu báo cáo ngay trong hệ thống.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-blue-600 text-white shadow-sm hover:bg-blue-700"
            onClick={addReport}
          >
            <Plus className="mr-2 size-4" />
            Tạo và lưu báo cáo
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["142", "Đơn trong tháng", BarChart3],
          ["154 triệu", "Doanh thu tháng", FileText],
          ["326", "Khách thường xuyên", Users],
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
          <CardTitle>Danh mục báo cáo</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="pl-4">Báo cáo</TableHead>
                <TableHead>Phạm vi</TableHead>
                <TableHead>Số liệu nổi bật</TableHead>
                <TableHead>Trạng thái lưu</TableHead>
                <TableHead className="pr-4 text-right">Tác vụ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((item) => (
                <TableRow key={item[0]}>
                  <TableCell className="pl-4 font-semibold text-slate-900">{item[0]}</TableCell>
                  <TableCell>{item[1]}</TableCell>
                  <TableCell>{item[2]}</TableCell>
                  <TableCell>{item[3]}</TableCell>
                  <TableCell className="pr-4 text-right">
                    <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                      <FileText className="size-4" />
                      Đã lưu
                    </span>
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
