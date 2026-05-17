"use client";

import React, { useState } from "react";
import { AlertTriangle, Boxes, ClipboardList, PackagePlus } from "lucide-react";
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

const initialSupplies = [
  ["Nước giặt dịu nhẹ", "Hóa chất", "24 lít", 72, "Ổn định"],
  ["Nước tẩy oxy", "Hóa chất", "5 lít", 18, "Sắp hết"],
  ["Túi đựng đồ", "Đóng gói", "120 túi", 60, "Ổn định"],
  ["Móc áo nhựa", "Phụ kiện", "36 cái", 24, "Cần nhập"],
];

const initialImports = [
  ["PN-088", "Nước giặt dịu nhẹ", "20 lít", "16/05/2026"],
  ["PN-087", "Túi đựng đồ", "100 túi", "15/05/2026"],
  ["PN-086", "Móc áo nhựa", "50 cái", "13/05/2026"],
];

export default function InventoryPage() {
  const [supplies, setSupplies] = useState(initialSupplies);
  const [imports, setImports] = useState(initialImports);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    group: "",
    quantity: "",
  });

  const addSupply = () => {
    const name = form.name.trim();
    const quantity = form.quantity.trim();

    if (!name || !quantity) {
      setMessage("Vui lòng nhập tên vật tư và số lượng trước khi lưu.");
      return;
    }

    const nextIndex = supplies.length + 1;
    const item = [name, form.group.trim() || "Vật tư", quantity, 55, "Mới nhập"];

    setSupplies((current) => [item, ...current]);
    setImports((current) => [
      [`PN-${String(90 + nextIndex).padStart(3, "0")}`, String(item[0]), String(item[2]), "17/05/2026"],
      ...current,
    ]);
    setForm({ name: "", group: "", quantity: "" });
    setMessage(`Đã nhập kho ${name} với số lượng ${quantity}.`);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 pb-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 relative overflow-hidden rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,_#ffffff_0%,_#f8fbff_55%,_#eff6ff_100%)] p-6 shadow-sm ring-1 ring-white/70 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge className="mb-3 rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 ring-1 ring-blue-100 hover:bg-blue-50">
            Kho vận tư
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Kho & Vật tư</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Quản lý hóa chất giặt tẩy, túi đựng, móc áo, cảnh báo vật tư sắp
            hết và lịch sử nhập kho.
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-blue-600 text-white shadow-sm hover:bg-blue-700" onClick={addSupply}>
            <PackagePlus className="mr-2 size-4" />
            Lưu nhập kho
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
          <CardTitle>Nhập vật tư mới</CardTitle>
          <p className="text-sm text-slate-500">
            Admin nhập thông tin rồi lưu, vật tư sẽ hiện ngay trong tồn kho và lịch sử nhập kho.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Tên vật tư" />
          <Input value={form.group} onChange={(event) => setForm((current) => ({ ...current, group: event.target.value }))} placeholder="Nhóm vật tư" />
          <Input value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))} placeholder="Số lượng nhập" />
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["42", "Mã vật tư", Boxes],
          ["6", "Sắp hết", AlertTriangle],
          ["18", "Phiếu nhập tháng này", ClipboardList],
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
        <Card className="rounded-[22px] border-slate-200 bg-white/95 shadow-sm ring-1 ring-white/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <CardHeader>
            <CardTitle>Tồn kho vật tư</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {supplies.map((item) => (
              <div key={item[0] as string} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{item[0] as string}</p>
                    <p className="text-sm text-slate-500">{item[1] as string} · {item[2] as string}</p>
                  </div>
                  <Badge variant="secondary" className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 ring-1 ring-blue-100">{item[4] as string}</Badge>
                </div>
                <Progress value={item[3] as number} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[22px] border-slate-200 bg-white/95 shadow-sm ring-1 ring-white/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <CardHeader className="border-b border-slate-100 bg-white">
            <CardTitle>Lịch sử nhập kho</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="pl-4">Phiếu</TableHead>
                  <TableHead>Vật tư</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead className="pr-4">Ngày</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {imports.map((item) => (
                  <TableRow key={item[0]}>
                    <TableCell className="pl-4 font-semibold text-slate-900">{item[0]}</TableCell>
                    <TableCell>{item[1]}</TableCell>
                    <TableCell>{item[2]}</TableCell>
                    <TableCell className="pr-4">{item[3]}</TableCell>
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
