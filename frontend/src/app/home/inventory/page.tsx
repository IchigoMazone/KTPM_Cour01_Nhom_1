"use client";

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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, PackagePlus, History } from "lucide-react";

export interface Supply {
  id: number;
  name: string;
  unit: string;
  quantity: number;
  minThreshold: number;
  updatedAt: Date;
}

interface HistoryRecord {
  id: number;
  supplyId: number;
  change: number; // + nhập, - xuất/tiêu hao
  note: string;
  date: Date;
}

const seedSupplies: Supply[] = [
  {
    id: 1,
    name: "Bột giặt", // detergent powder
    unit: "kg",
    quantity: 25,
    minThreshold: 10,
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: "Nước xả vải", // fabric softener
    unit: "lít",
    quantity: 15,
    minThreshold: 8,
    updatedAt: new Date(),
  },
  {
    id: 3,
    name: "Túi nilon đựng đồ", // laundry bags
    unit: "cái",
    quantity: 120,
    minThreshold: 50,
    updatedAt: new Date(),
  },
  {
    id: 4,
    name: "Móc áo", // hangers
    unit: "cái",
    quantity: 300,
    minThreshold: 100,
    updatedAt: new Date(),
  },
];

export default function InventoryManagement() {
  const [supplies, setSupplies] = useState<Supply[]>(seedSupplies);
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  // modal state
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Supply | null>(null);

  // form fields
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [minThreshold, setMinThreshold] = useState("0");

  // import stock modal
  const [showImport, setShowImport] = useState(false);
  const [importSupplyId, setImportSupplyId] = useState<number | null>(null);
  const [importQty, setImportQty] = useState("0");
  const [importNote, setImportNote] = useState("");

  // low stock filter
  const lowStockCount = useMemo(
    () => supplies.filter((s) => s.quantity <= s.minThreshold).length,
    [supplies]
  );

  const openNew = () => {
    setEditing(null);
    setName("");
    setUnit("");
    setQuantity("0");
    setMinThreshold("0");
    setShowForm(true);
  };

  const openEdit = (s: Supply) => {
    setEditing(s);
    setName(s.name);
    setUnit(s.unit);
    setQuantity(String(s.quantity));
    setMinThreshold(String(s.minThreshold));
    setShowForm(true);
  };

  const saveSupply = () => {
    if (!name.trim() || !unit.trim()) return;
    const qty = parseFloat(quantity);
    const minT = parseFloat(minThreshold);
    if (isNaN(qty) || isNaN(minT)) return;

    const newSupply: Supply = {
      id: editing ? editing.id : Date.now(),
      name,
      unit,
      quantity: qty,
      minThreshold: minT,
      updatedAt: new Date(),
    };

    setSupplies((prev) =>
      editing ? prev.map((x) => (x.id === editing.id ? newSupply : x)) : [...prev, newSupply]
    );
    setShowForm(false);
  };

  const openImport = (id: number) => {
    setImportSupplyId(id);
    setImportQty("0");
    setImportNote("");
    setShowImport(true);
  };

  const doImport = () => {
    if (!importSupplyId) return;
    const qty = parseFloat(importQty);
    if (isNaN(qty) || qty <= 0) return;

    setSupplies((prev) =>
      prev.map((s) =>
        s.id === importSupplyId
          ? { ...s, quantity: s.quantity + qty, updatedAt: new Date() }
          : s
      )
    );
    setHistory((prev) => [
      {
        id: Date.now(),
        supplyId: importSupplyId,
        change: qty,
        note: importNote || "Nhập kho",
        date: new Date(),
      },
      ...prev,
    ]);
    setShowImport(false);
  };

  return (
    <div className="flex flex-col gap-8 p-6 w-full">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Kho & Vật tư</h2>
          <p className="text-muted-foreground text-sm">
            Quản lý hóa chất, vật tư tiêu hao & cảnh báo tồn kho thấp
          </p>
        </div>
        <div className="flex gap-3">
          <Button className="gap-2" onClick={openNew}>
            <Plus className="h-4 w-4" /> Thêm vật tư
          </Button>
          {lowStockCount > 0 && (
            <Badge variant="destructive">{lowStockCount} sắp hết</Badge>
          )}
        </div>
      </div>

      {/* Supplies Table */}
      <Card className="shadow-sm border overflow-x-auto">
        <CardContent className="p-0">
          <Table className="min-w-[700px]">
            <colgroup>
              <col />
              <col className="w-24" />
              <col className="w-32" />
              <col className="w-32" />
              <col className="w-28" />
            </colgroup>
            <TableHeader>
              <TableRow className="bg-muted/50 text-left">
                <TableHead>Tên vật tư</TableHead>
                <TableHead>Đơn vị</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead>Tối thiểu</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplies.map((s) => {
                const low = s.quantity <= s.minThreshold;
                return (
                  <TableRow
                    key={s.id}
                    className={`border-b hover:bg-muted/50 ${low ? "bg-red-50/60" : ""}`}
                  >
                    <TableCell className="font-medium cursor-pointer" onClick={() => openEdit(s)}>
                      {s.name}
                    </TableCell>
                    <TableCell className="uppercase">{s.unit}</TableCell>
                    <TableCell>{s.quantity}</TableCell>
                    <TableCell>{s.minThreshold}</TableCell>
                    <TableCell className="flex gap-2 justify-end">
                      <Button variant="outline" size="icon" title="Nhập kho" onClick={() => openImport(s.id)}>
                        <PackagePlus className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* History */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center text-lg">
            <History className="h-4 w-4" /> Lịch sử nhập kho
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 max-h-64 overflow-y-auto">
          {history.length === 0 ? (
            <p className="p-6 text-muted-foreground text-sm">Chưa có giao dịch.</p>
          ) : (
            <Table className="min-w-[600px]">
              <colgroup>
                <col />
                <col className="w-28" />
                <col className="w-32" />
                <col />
              </colgroup>
              <TableHeader>
                <TableRow className="bg-muted/50 text-left">
                  <TableHead>Vật tư</TableHead>
                  <TableHead>Thay đổi</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h) => {
                  const supply = supplies.find((s) => s.id === h.supplyId);
                  return (
                    <TableRow key={h.id} className="border-b">
                      <TableCell>{supply ? supply.name : "--"}</TableCell>
                      <TableCell>{h.change > 0 ? `+${h.change}` : h.change}</TableCell>
                      <TableCell>{h.date.toLocaleString("vi-VN")}</TableCell>
                      <TableCell>{h.note}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Supply Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">
                {editing ? "Cập nhật vật tư" : "Thêm vật tư"}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tên vật tư</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Bột giặt" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Đơn vị</Label>
                  <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="kg / lít / cái" />
                </div>
                <div className="space-y-2">
                  <Label>Số lượng ban đầu</Label>
                  <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Ngưỡng cảnh báo (tối thiểu)</Label>
                <Input type="number" value={minThreshold} onChange={(e) => setMinThreshold(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={saveSupply}>
                {editing ? "Lưu thay đổi" : "Thêm"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">Nhập kho</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowImport(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Số lượng</Label>
                <Input type="number" value={importQty} onChange={(e) => setImportQty(e.target.value)} />
              </div>
              <div>
                <Label>Ghi chú</Label>
                <Input value={importNote} onChange={(e) => setImportNote(e.target.value)} placeholder="Hóa đơn #123" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={doImport}>Nhập</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}