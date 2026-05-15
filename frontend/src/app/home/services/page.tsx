"use client";

import React, { useState } from "react";
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
import { Plus, X, Pencil } from "lucide-react";

export type Unit = "kg" | "món";

interface Service {
  id: number;
  name: string;
  unit: Unit;
  price: number; // giá trên đơn vị
}

const seedServices: Service[] = [
  { id: 1, name: "Giặt thường", unit: "kg", price: 15000 },
  { id: 2, name: "Giặt khô", unit: "kg", price: 30000 },
  { id: 3, name: "Giặt hấp", unit: "món", price: 40000 },
  { id: 4, name: "Giặt đồ da", unit: "món", price: 80000 },
];

export default function ServiceManagement() {
  const [services, setServices] = useState<Service[]>(seedServices);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);

  // form fields
  const [name, setName] = useState("Giặt thường");
  const [unit, setUnit] = useState<Unit>("kg");
  const [price, setPrice] = useState<string>("15000");

  const resetForm = () => {
    setName("");
    setUnit("kg");
    setPrice("");
    setEditing(null);
  };

  const openNewForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (srv: Service) => {
    setEditing(srv);
    setName(srv.name);
    setUnit(srv.unit);
    setPrice(String(srv.price));
    setShowForm(true);
  };

  const saveService = () => {
    if (!name.trim() || !price) return;
    const numericPrice = parseInt(price, 10);
    if (isNaN(numericPrice)) return;

    if (editing) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === editing.id ? { ...editing, name, unit, price: numericPrice } : s
        )
      );
    } else {
      const newService: Service = {
        id: Date.now(),
        name,
        unit,
        price: numericPrice,
      };
      setServices((prev) => [...prev, newService]);
    }
    setShowForm(false);
    resetForm();
  };

  return (
    <div className="flex flex-col gap-8 p-6 w-full">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Dịch vụ & Bảng giá</h2>
          <p className="text-muted-foreground text-sm">
            Quản lý các loại dịch vụ và giá theo kg hoặc theo món
          </p>
        </div>
        <Button className="gap-2" onClick={openNewForm}>
          <Plus className="h-4 w-4" /> Thêm dịch vụ
        </Button>
      </div>

      <Card className="shadow-sm border max-w-full overflow-x-auto">
        <CardContent className="p-0">
          <Table className="min-w-[600px]">
            <colgroup>
              <col className="w-56" />
              <col className="w-24" />
              <col className="w-32" />
              <col className="w-24" />
            </colgroup>
            <TableHeader>
              <TableRow className="bg-muted/50 text-left">
                <TableHead>Tên dịch vụ</TableHead>
                <TableHead>Đơn vị</TableHead>
                <TableHead>Giá (đ)</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((srv) => (
                <TableRow key={srv.id} className="border-b hover:bg-muted/50">
                  <TableCell className="whitespace-nowrap font-medium">
                    {srv.name}
                  </TableCell>
                  <TableCell className="whitespace-nowrap uppercase">{srv.unit}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {srv.price.toLocaleString("vi-VN")}
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Sửa"
                      onClick={() => openEditForm(srv)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4" role="dialog">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">
                {editing ? "Cập nhật dịch vụ" : "Thêm dịch vụ"}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên dịch vụ</Label>
                <Input
                  id="name"
                  placeholder="Giặt khô..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Đơn vị</Label>
                <Select value={unit} onValueChange={(v) => setUnit(v as Unit)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn đơn vị" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="món">món</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Giá (đ)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="30000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={saveService}>
                {editing ? "Lưu thay đổi" : "Thêm"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}