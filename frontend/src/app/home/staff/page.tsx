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
import { Badge } from "@/components/ui/badge";
import { Plus, X, ClipboardEdit, Clock, TrendingUp } from "lucide-react";

interface Employee {
  id: number;
  name: string;
  role: string;
  shift: string; // "Sáng" | "Chiều" | "Tối" | "-"
  productivity: number; // đơn hoàn thành / ngày
}

const SHIFT_OPTS = ["Sáng", "Chiều", "Tối"];

const seedEmployees: Employee[] = [
  { id: 1, name: "Nguyễn Văn A", role: "Thợ giặt", shift: "Sáng", productivity: 30 },
  { id: 2, name: "Trần Thị B", role: "Gấp đồ", shift: "Chiều", productivity: 25 },
  { id: 3, name: "Lê Hoàng C", role: "Giao nhận", shift: "Tối", productivity: 18 },
  { id: 4, name: "Phạm Duy D", role: "Thu ngân", shift: "-", productivity: 0 },
];

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>(seedEmployees);

  // add / edit modal
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [empName, setEmpName] = useState("");
  const [empRole, setEmpRole] = useState("");

  // shift modal
  const [showShift, setShowShift] = useState(false);
  const [shiftEmp, setShiftEmp] = useState<Employee | null>(null);
  const [newShift, setNewShift] = useState<string>(SHIFT_OPTS[0]);

  // productivity modal
  const [showProd, setShowProd] = useState(false);
  const [prodEmp, setProdEmp] = useState<Employee | null>(null);
  const [prodNumber, setProdNumber] = useState("0");

  const openNew = () => {
    setEditing(null);
    setEmpName("");
    setEmpRole("");
    setShowForm(true);
  };

  const openEdit = (e: Employee) => {
    setEditing(e);
    setEmpName(e.name);
    setEmpRole(e.role);
    setShowForm(true);
  };

  const saveEmp = () => {
    if (!empName.trim() || !empRole.trim()) return;
    const emp: Employee = {
      id: editing ? editing.id : Date.now(),
      name: empName,
      role: empRole,
      shift: editing ? editing.shift : "-",
      productivity: editing ? editing.productivity : 0,
    };
    setEmployees((prev) =>
      editing ? prev.map((x) => (x.id === emp.id ? emp : x)) : [...prev, emp]
    );
    setShowForm(false);
  };

  const openShiftModal = (e: Employee) => {
    setShiftEmp(e);
    setNewShift(e.shift === "-" ? SHIFT_OPTS[0] : e.shift);
    setShowShift(true);
  };

  const assignShift = () => {
    if (!shiftEmp) return;
    setEmployees((prev) =>
      prev.map((x) => (x.id === shiftEmp.id ? { ...x, shift: newShift } : x))
    );
    setShowShift(false);
  };

  const openProdModal = (e: Employee) => {
    setProdEmp(e);
    setProdNumber(String(e.productivity));
    setShowProd(true);
  };

  const saveProd = () => {
    if (!prodEmp) return;
    const num = parseInt(prodNumber, 10);
    if (isNaN(num) || num < 0) return;
    setEmployees((prev) =>
      prev.map((x) => (x.id === prodEmp.id ? { ...x, productivity: num } : x))
    );
    setShowProd(false);
  };

  return (
    <div className="flex flex-col gap-8 p-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Nhân viên</h2>
          <p className="text-muted-foreground text-sm">Danh sách, phân ca & năng suất</p>
        </div>
        <Button className="gap-2" onClick={openNew}>
          <Plus className="h-4 w-4" /> Thêm nhân viên
        </Button>
      </div>

      {/* Table */}
      <Card className="shadow-sm border overflow-x-auto">
        <CardContent className="p-0">
          <Table className="min-w-[800px]">
            <colgroup>
              <col className="w-56" />
              <col className="w-40" />
              <col className="w-28" />
              <col className="w-28" />
              <col className="w-28" />
            </colgroup>
            <TableHeader>
              <TableRow className="bg-muted/50 text-left">
                <TableHead>Họ tên</TableHead>
                <TableHead>Chức vụ</TableHead>
                <TableHead>Ca hiện tại</TableHead>
                <TableHead>Năng suất</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((e) => (
                <TableRow key={e.id} className="border-b hover:bg-muted/50">
                  <TableCell className="font-medium cursor-pointer" onClick={() => openEdit(e)}>
                    {e.name}
                  </TableCell>
                  <TableCell>{e.role}</TableCell>
                  <TableCell>
                    {e.shift === "-" ? (
                      <Badge variant="outline">Chưa phân</Badge>
                    ) : (
                      <Badge variant="secondary">{e.shift}</Badge>
                    )}
                  </TableCell>
                  <TableCell>{e.productivity}</TableCell>
                  <TableCell className="flex gap-2 justify-end">
                    <Button variant="outline" size="icon" title="Phân ca" onClick={() => openShiftModal(e)}>
                      <Clock className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" title="Năng suất" onClick={() => openProdModal(e)}>
                      <TrendingUp className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">
                {editing ? "Cập nhật nhân viên" : "Thêm nhân viên"}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Họ tên</Label>
                <Input value={empName} onChange={(e) => setEmpName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Chức vụ</Label>
                <Input value={empRole} onChange={(e) => setEmpRole(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={saveEmp}>
                {editing ? "Lưu" : "Thêm"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Shift modal */}
      {showShift && shiftEmp && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">Phân ca cho {shiftEmp.name}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowShift(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={newShift} onValueChange={setNewShift}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn ca" />
                </SelectTrigger>
                <SelectContent>
                  {SHIFT_OPTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={assignShift}>
                Lưu
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Productivity modal */}
      {showProd && prodEmp && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">Năng suất {prodEmp.name}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowProd(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label>Số đơn hoàn thành hôm nay</Label>
              <Input type="number" value={prodNumber} onChange={(e) => setProdNumber(e.target.value)} />
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={saveProd}>
                Lưu
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
