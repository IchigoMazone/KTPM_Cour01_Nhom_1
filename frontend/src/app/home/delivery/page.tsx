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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, MapPin } from "lucide-react";

export type DeliveryStatus =
  | "chờ lấy"
  | "đang lấy"
  | "đang giao"
  | "hoàn thành";

interface Delivery {
  id: number;
  customerName: string;
  address: string;
  pickupAt: string;
  returnAt: string;
  driver: string;
  status: DeliveryStatus;
}

const DRIVERS = ["Anh Minh", "Chị Lan", "Anh Tuấn"];
const STATUSES: DeliveryStatus[] = [
  "chờ lấy",
  "đang lấy",
  "đang giao",
  "hoàn thành",
];

const STATUS_COLOR: Record<DeliveryStatus, "outline" | "secondary" | "default"> = {
  "chờ lấy": "outline",
  "đang lấy": "secondary",
  "đang giao": "secondary",
  "hoàn thành": "default",
};

const seedDeliveries: Delivery[] = [
  {
    id: 1,
    customerName: "Nguyễn Văn A",
    address: "12 Trần Phú, Hà Nội",
    pickupAt: "2024-05-12T08:30",
    returnAt: "2024-05-12T17:00",
    driver: "Anh Minh",
    status: "đang giao",
  },
  {
    id: 2,
    customerName: "Trần Thị B",
    address: "90 Lý Thường Kiệt, Hà Nội",
    pickupAt: "2024-05-12T09:00",
    returnAt: "2024-05-13T10:00",
    driver: "Chị Lan",
    status: "chờ lấy",
  },
];

export default function DeliveryManagement() {
  const [deliveries, setDeliveries] = useState<Delivery[]>(seedDeliveries);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Delivery | null>(null);

  const [customer, setCustomer] = useState("");
  const [address, setAddress] = useState("");
  const [pickupAt, setPickupAt] = useState("");
  const [returnAt, setReturnAt] = useState("");
  const [driver, setDriver] = useState(DRIVERS[0]);
  const [status, setStatus] = useState<DeliveryStatus>("chờ lấy");

  const resetForm = () => {
    setCustomer("");
    setAddress("");
    setPickupAt("");
    setReturnAt("");
    setDriver(DRIVERS[0]);
    setStatus("chờ lấy");
    setEditing(null);
  };

  const openNew = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (d: Delivery) => {
    setEditing(d);
    setCustomer(d.customerName);
    setAddress(d.address);
    setPickupAt(d.pickupAt);
    setReturnAt(d.returnAt);
    setDriver(d.driver);
    setStatus(d.status);
    setShowForm(true);
  };

  const saveDelivery = () => {
    if (!customer || !address || !pickupAt) return;
    const newDelivery: Delivery = {
      id: editing ? editing.id : Date.now(),
      customerName: customer,
      address,
      pickupAt,
      returnAt,
      driver,
      status,
    };
    setDeliveries((prev) =>
      editing ? prev.map((x) => (x.id === editing.id ? newDelivery : x)) : [...prev, newDelivery]
    );
    setShowForm(false);
    resetForm();
  };

  return (
    <div className="flex flex-col gap-8 p-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Quản lý giao nhận</h2>
          <p className="text-muted-foreground text-sm">
            Lịch lấy & trả, phân công tài xế, trạng thái giao nhận
          </p>
        </div>
        <Button className="gap-2" onClick={openNew}>
          <Plus className="h-4 w-4" /> Thêm lịch
        </Button>
      </div>

      {/* Table */}
      <Card className="shadow-sm border overflow-x-auto">
        <CardContent className="p-0">
          <Table className="min-w-[900px]">
            <colgroup>
              <col className="w-56" />
              <col />
              <col className="w-40" />
              <col className="w-40" />
              <col className="w-32" />
              <col className="w-28" />
            </colgroup>
            <TableHeader>
              <TableRow className="bg-muted/50 text-left">
                <TableHead>Khách hàng</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead>Lấy lúc</TableHead>
                <TableHead>Trả lúc</TableHead>
                <TableHead>Tài xế</TableHead>
                <TableHead className="text-right">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.map((d) => (
                <TableRow
                  key={d.id}
                  className="border-b hover:bg-muted/50 cursor-pointer"
                  onClick={() => openEdit(d)}
                >
                  <TableCell className="font-medium whitespace-nowrap">
                    {d.customerName}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{d.address}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {d.pickupAt.replace("T", " ")}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {d.returnAt ? d.returnAt.replace("T", " ") : "-"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{d.driver}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={STATUS_COLOR[d.status]}>{d.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal add/edit */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">
                {editing ? "Cập nhật lịch" : "Thêm lịch giao nhận"}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Khách hàng</Label>
                <Input value={customer} onChange={(e) => setCustomer(e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Địa chỉ</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Lấy lúc</Label>
                <Input type="datetime-local" value={pickupAt} onChange={(e) => setPickupAt(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Trả lúc</Label>
                <Input type="datetime-local" value={returnAt} onChange={(e) => setReturnAt(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tài x xế</Label>
                <Select value={driver} onValueChange={setDriver}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn tài xế" />
                  </SelectTrigger>
                  <SelectContent>
                    {DRIVERS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as DeliveryStatus)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={saveDelivery}>
                {editing ? "Lưu thay đổi" : "Thêm"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}