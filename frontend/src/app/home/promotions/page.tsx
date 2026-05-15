"use client";

/*
  Promotion & Loyalty Management
  - Discount codes (percent / fixed / combo)
  - Loyalty customers (points, tier)
  - Simple combo services list
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
import { Plus, X, Gift, Users } from "lucide-react";

// ---------- Types ----------
export type CodeType = "percent" | "fixed" | "combo";

interface DiscountCode {
  id: number;
  code: string;
  type: CodeType;
  value: number; // percent or amount hoặc số combo item
  expires: string; // YYYY-MM-DD
}

interface LoyaltyCustomer {
  id: number;
  name: string;
  points: number;
  tier: "Silver" | "Gold" | "Platinum";
}

// ---------- Seed ----------
const seedCodes: DiscountCode[] = [
  { id: 1, code: "WELCOME10", type: "percent", value: 10, expires: "2024-12-31" },
  { id: 2, code: "SAVE50", type: "fixed", value: 50000, expires: "2024-08-31" },
  { id: 3, code: "COMBO3", type: "combo", value: 3, expires: "2024-09-30" },
];

const seedCustomers: LoyaltyCustomer[] = [
  { id: 1, name: "Nguyễn Văn A", points: 1200, tier: "Gold" },
  { id: 2, name: "Trần Thị B", points: 450, tier: "Silver" },
  { id: 3, name: "Lê Hoàng C", points: 2500, tier: "Platinum" },
];

// ---------- Main component ----------
export default function PromotionLoyaltyManagement() {
  // state
  const [codes, setCodes] = useState<DiscountCode[]>(seedCodes);
  const [customers, setCustomers] = useState<LoyaltyCustomer[]>(seedCustomers);

  // modals
  const [showCode, setShowCode] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
  const [codeStr, setCodeStr] = useState("");
  const [codeType, setCodeType] = useState<CodeType>("percent");
  const [codeValue, setCodeValue] = useState("0");
  const [codeExp, setCodeExp] = useState<string>(() => new Date().toISOString().slice(0, 10));

  const [showPoints, setShowPoints] = useState(false);
  const [pointCust, setPointCust] = useState<LoyaltyCustomer | null>(null);
  const [pointVal, setPointVal] = useState("0");

  // ----- handlers -----
  const openNewCode = () => {
    setEditingCode(null);
    setCodeStr("");
    setCodeType("percent");
    setCodeValue("0");
    setCodeExp(new Date().toISOString().slice(0, 10));
    setShowCode(true);
  };
  const openEditCode = (c: DiscountCode) => {
    setEditingCode(c);
    setCodeStr(c.code);
    setCodeType(c.type);
    setCodeValue(String(c.value));
    setCodeExp(c.expires);
    setShowCode(true);
  };
  const saveCode = () => {
    if (!codeStr.trim()) return;
    const val = parseFloat(codeValue);
    if (isNaN(val) || val <= 0) return;
    const rec: DiscountCode = {
      id: editingCode ? editingCode.id : Date.now(),
      code: codeStr.toUpperCase(),
      type: codeType,
      value: val,
      expires: codeExp,
    };
    setCodes((prev) =>
      editingCode ? prev.map((x) => (x.id === rec.id ? rec : x)) : [...prev, rec]
    );
    setShowCode(false);
  };

  const openPointModal = (cust: LoyaltyCustomer) => {
    setPointCust(cust);
    setPointVal(String(cust.points));
    setShowPoints(true);
  };
  const savePoints = () => {
    if (!pointCust) return;
    const pts = parseInt(pointVal, 10);
    if (isNaN(pts) || pts < 0) return;
    let tier: LoyaltyCustomer["tier"] = "Silver";
    if (pts >= 2000) tier = "Platinum";
    else if (pts >= 1000) tier = "Gold";
    setCustomers((prev) =>
      prev.map((x) => (x.id === pointCust.id ? { ...x, points: pts, tier } : x))
    );
    setShowPoints(false);
  };

  // ---------- UI ----------
  return (
    <div className="flex flex-col gap-8 p-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Khuyến mãi & Loyalty</h2>
          <p className="text-muted-foreground text-sm">Mã giảm giá, tích điểm & combo dịch vụ</p>
        </div>
        <Button className="gap-2" onClick={openNewCode}>
          <Plus className="h-4 w-4" /> Tạo mã KM
        </Button>
      </div>

      {/* Discount Codes */}
      <Card className="border shadow-sm overflow-x-auto">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <Gift className="h-4 w-4" /> Mã giảm giá / Combo
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="min-w-[700px]">
            <colgroup>
              <col className="w-40" />
              <col className="w-32" />
              <col className="w-32" />
              <col className="w-40" />
              <col className="w-28" />
            </colgroup>
            <TableHeader>
              <TableRow className="bg-muted/50 text-left">
                <TableHead>Mã</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Giá trị</TableHead>
                <TableHead>Hết hạn</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes.map((c) => (
                <TableRow key={c.id} className="border-b hover:bg-muted/50">
                  <TableCell className="font-medium cursor-pointer" onClick={() => openEditCode(c)}>
                    {c.code}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{c.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {c.type === "percent"
                      ? `${c.value}%`
                      : c.type === "fixed"
                      ? `${c.value.toLocaleString("vi-VN")} đ`
                      : `Mua ${c.value}`}
                  </TableCell>
                  <TableCell>{c.expires}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditCode(c)}>
                      ✎
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Loyalty customers */}
      <Card className="border shadow-sm overflow-x-auto">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <Users className="h-4 w-4" /> Khách hàng thân thiết
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="min-w-[700px]">
            <colgroup>
              <col />
              <col className="w-32" />
              <col className="w-32" />
              <col className="w-28" />
            </colgroup>
            <TableHeader>
              <TableRow className="bg-muted/50 text-left">
                <TableHead>Khách hàng</TableHead>
                <TableHead>Điểm</TableHead>
                <TableHead>Hạng</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id} className="border-b hover:bg-muted/50">
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.points}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{c.tier}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openPointModal(c)}>
                      ✎
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Code modal */}
      {showCode && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">
                {editingCode ? "Cập nhật mã" : "Tạo mã khuyến mãi"}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowCode(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Mã</Label>
                <Input value={codeStr} onChange={(e) => setCodeStr(e.target.value.toUpperCase())} placeholder="SUMMER50" />
              </div>
              <div className="space-y-2">
                <Label>Loại</Label>
                <Select value={codeType} onValueChange={(v) => setCodeType(v as CodeType)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">% Giảm</SelectItem>
                    <SelectItem value="fixed">Giảm tiền (đ)</SelectItem>
                    <SelectItem value="combo">Combo dịch vụ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Giá trị</Label>
                <Input type="number" value={codeValue} onChange={(e) => setCodeValue(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Ngày hết hạn</Label>
                <Input type="date" value={codeExp} onChange={(e) => setCodeExp(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={saveCode}>
                {editingCode ? "Lưu" : "Thêm"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Points modal */}
      {showPoints && pointCust && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">Điểm {pointCust.name}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowPoints(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label>Điểm hiện tại</Label>
              <Input type="number" value={pointVal} onChange={(e) => setPointVal(e.target.value)} />
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={savePoints}>Lưu</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
