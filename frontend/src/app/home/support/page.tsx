"use client";

/*
  Support & Feedback Module
  - Handle complaints (lost item, damaged item, delayed delivery)
  - Manage star ratings & customer comments
  - Track resolution status
*/

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
import { Badge } from "@/components/ui/badge";
import { Plus, X, CheckCircle2 } from "lucide-react";

// ---------------- Types ----------------
export type ComplaintType = "Mất đồ" | "Hỏng đồ" | "Giao trễ";
export type ComplaintStatus = "Mới" | "Đang xử lý" | "Đã giải quyết";

interface Complaint {
  id: number;
  customer: string;
  type: ComplaintType;
  message: string;
  status: ComplaintStatus;
  createdAt: string; // ISO
}

interface Feedback {
  id: number;
  customer: string;
  stars: number;
  comment: string;
  date: string; // ISO
}

// ---------------- Seed ----------------
const seedComplaints: Complaint[] = [
  {
    id: 1,
    customer: "Nguyễn Văn A",
    type: "Mất đồ",
    message: "Thiếu 1 chiếc tất màu đen trong đơn #1234",
    status: "Đang xử lý",
    createdAt: "2024-05-15T09:00:00",
  },
  {
    id: 2,
    customer: "Trần Thị B",
    type: "Giao trễ",
    message: "Đơn #1238 giao muộn 2 giờ",
    status: "Mới",
    createdAt: "2024-05-16T11:30:00",
  },
];

const seedFeedback: Feedback[] = [
  { id: 1, customer: "Công ty ABC", stars: 5, comment: "Dịch vụ tuyệt vời!", date: "2024-05-14" },
  { id: 2, customer: "Shop XYZ", stars: 4, comment: "Giao hàng nhanh, đồ sạch", date: "2024-05-15" },
  { id: 3, customer: "Nguyễn Văn A", stars: 2, comment: "Bị mất đồ", date: "2024-05-15" },
];

export default function SupportFeedbackManagement() {
  const [complaints, setComplaints] = useState<Complaint[]>(seedComplaints);
  const [feedbacks] = useState<Feedback[]>(seedFeedback);

  // complaint modal
  const [showForm, setShowForm] = useState(false);
  const [cCustomer, setCCustomer] = useState("");
  const [cType, setCType] = useState<ComplaintType>("Mất đồ");
  const [cMsg, setCMsg] = useState("");

  const [editing, setEditing] = useState<Complaint | null>(null);

  const openNew = () => {
    setEditing(null);
    setCCustomer("");
    setCType("Mất đồ");
    setCMsg("");
    setShowForm(true);
  };

  const openResolve = (c: Complaint) => {
    setComplaints((prev) =>
      prev.map((x) => (x.id === c.id ? { ...x, status: "Đã giải quyết" } : x))
    );
  };

  const saveComplaint = () => {
    if (!cCustomer.trim() || !cMsg.trim()) return;
    const rec: Complaint = {
      id: editing ? editing.id : Date.now(),
      customer: cCustomer,
      type: cType,
      message: cMsg,
      status: editing ? editing.status : "Mới",
      createdAt: editing ? editing.createdAt : new Date().toISOString(),
    };
    setComplaints((prev) =>
      editing ? prev.map((x) => (x.id === rec.id ? rec : x)) : [...prev, rec]
    );
    setShowForm(false);
  };

  return (
    <div className="flex flex-col gap-8 p-6 w-full">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Hỗ trợ & Phản hồi</h2>
          <p className="text-muted-foreground text-sm">Khiếu nại, đánh giá & lịch sử xử lý</p>
        </div>
        <Button className="gap-2" onClick={openNew}>
          <Plus className="h-4 w-4" /> Tiếp nhận khiếu nại
        </Button>
      </div>

      {/* Complaints table */}
      <Card className="border shadow-sm overflow-x-auto">
        <CardHeader>
          <CardTitle>Khiếu nại</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="min-w-[800px]">
            <colgroup>
              <col className="w-40" />
              <col className="w-32" />
              <col />
              <col className="w-32" />
              <col className="w-28" />
            </colgroup>
            <TableHeader>
              <TableRow className="bg-muted/50 text-left">
                <TableHead>Khách</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Nội dung</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.map((c) => (
                <TableRow key={c.id} className="border-b hover:bg-muted/50">
                  <TableCell>{c.customer}</TableCell>
                  <TableCell>{c.type}</TableCell>
                  <TableCell>{c.message}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === "Đã giải quyết" ? "default" : c.status === "Đang xử lý" ? "secondary" : "outline"}>{c.status}</Badge>
                  </TableCell>
                  <TableCell className="flex gap-2 justify-end">
                    {c.status !== "Đã giải quyết" && (
                      <Button variant="outline" size="icon" title="Đánh dấu đã giải quyết" onClick={() => openResolve(c)}>
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Feedback table */}
      <Card className="border shadow-sm overflow-x-auto">
        <CardHeader>
          <CardTitle>Đánh giá sao</CardTitle>
        </CardHeader>
        <CardContent className="p-0 max-h-64 overflow-y-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow className="bg-muted/50 text-left">
                <TableHead>Khách hàng</TableHead>
                <TableHead>Đánh giá</TableHead>
                <TableHead>Bình luận</TableHead>
                <TableHead>Ngày</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedbacks.map((f) => (
                <TableRow key={f.id} className="border-b">
                  <TableCell>{f.customer}</TableCell>
                  <TableCell>{"★".repeat(f.stars)}</TableCell>
                  <TableCell>{f.comment}</TableCell>
                  <TableCell>{f.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Complaint modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">Tiếp nhận khiếu nại</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Khách hàng</Label>
                <Input value={cCustomer} onChange={(e) => setCCustomer(e.target.value)} placeholder="Tên khách" />
              </div>
              <div className="space-y-2">
                <Label>Loại</Label>
                <Select value={cType} onValueChange={(v) => setCType(v as ComplaintType)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mất đồ">Mất đồ</SelectItem>
                    <SelectItem value="Hỏng đồ">Hỏng đồ</SelectItem>
                    <SelectItem value="Giao trễ">Giao trễ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nội dung</Label>
                <textarea className="w-full border rounded-md p-2 h-28" value={cMsg} onChange={(e) => setCMsg(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={saveComplaint}>Lưu</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}