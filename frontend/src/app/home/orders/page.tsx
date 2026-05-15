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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  ChevronRight,
  Printer,
  X,
  ChevronLeft,
  MoreHorizontal,
} from "lucide-react";
import Dropdown from "@/src/components/ui/dropdown";

export type OrderStatus =
  | "tiếp nhận"
  | "đang giặt"
  | "phơi/sấy"
  | "gấp"
  | "giao trả";

interface Order {
  id: number;
  customerName: string;
  items: string;
  status: OrderStatus;
  createdAt: Date;
}

const STATUSES: OrderStatus[] = [
  "tiếp nhận",
  "đang giặt",
  "phơi/sấy",
  "gấp",
  "giao trả",
];

const STATUS_COLOR: Record<
  OrderStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  "tiếp nhận": "outline",
  "đang giặt": "secondary",
  "phơi/sấy": "secondary",
  gấp: "default",
  "giao trả": "destructive",
};

// Fake seed data for demo (15 orders to test pagination)
const seedOrders: Order[] = Array.from({ length: 15 }, (_, i) => ({
  id: 1001 + i,
  customerName: `Khách hàng ${i + 1}`,
  items: i % 2 === 0 ? "Áo sơ mi x3, Quần tây x2" : "Chăn lông x2",
  status: STATUSES[i % STATUSES.length],
  createdAt: new Date(Date.now() - i * 36_000_00), // trừ giờ cho khác nhau
}));

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>(seedOrders);
  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showInvoice, setShowInvoice] = useState<Order | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    if (!search.trim()) return orders;
    return orders.filter(
      (o) =>
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.items.toLowerCase().includes(search.toLowerCase()),
    );
  }, [orders, search]);

  const pageCount = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const createOrder = () => {
    if (!customerName.trim()) return;
    const newOrder: Order = {
      id: Date.now(),
      customerName,
      items,
      status: "tiếp nhận",
      createdAt: new Date(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    setCustomerName("");
    setItems("");
    setShowForm(false);
    setPage(1); // về trang đầu khi thêm mới
  };

  const nextStatus = (id: number) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status:
                STATUSES[
                  Math.min(STATUSES.indexOf(o.status) + 1, STATUSES.length - 1)
                ],
            }
          : o,
      ),
    );
  };

  const handlePrintInvoice = (order: Order) => {
    const printContent = document.getElementById("invoice-modal-content");
    if (!printContent) return;

    const pri = window.open("", "print", "width=600,height=800");
    if (!pri) return;
    pri.document.write(
      `<!DOCTYPE html><html><head><title>Phiếu đơn hàng #${order.id}</title></head><body>${printContent.innerHTML}</body></html>`,
    );
    pri.document.close();
    pri.focus();
    pri.onload = () => pri.print();
  };

  /** Page Layout **/
  return (
    <div className="flex flex-col gap-8 p-6 w-full">
      {/* Top bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Đơn hàng</h2>
          <p className="text-muted-foreground text-sm">
            Quản lý tiến trình giặt ủi & giao trả
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 h-10"
              placeholder="Tìm theo khách hàng hoặc mặt hàng..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2 h-10">
            <Plus className="h-4 w-4" />
            Thêm đơn
          </Button>
        </div>
      </div>

      {/* Table List */}
      <Card className="shadow-sm border-[1px] border-gray-200 overflow-x-auto">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-center">Mã đơn</TableHead>
                <TableHead className="text-center">Khách hàng</TableHead>
                <TableHead className="text-center">Mặt hàng</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-center">Ngày tạo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-6 text-muted-foreground"
                  >
                    Không tìm thấy đơn phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((order) => (
                  <TableRow
                    key={order.id}
                    className="border-b hover:bg-muted/50"
                  >
                    <TableCell className="text-center">#{order.id}</TableCell>
                    <TableCell className="text-center">{order.customerName}</TableCell>
                    <TableCell className="text-center">{order.items}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={STATUS_COLOR[order.status]}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {order.createdAt.toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="flex justify-center">
                      
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* ---- Pagination Footer ---- */}
        <CardFooter className="flex items-center justify-between py-3 px-4 text-sm text-muted-foreground">
          <span>
            Hiển thị {paginated.length} / {filtered.length} đơn
          </span>
          <div className="flex gap-2 items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>
              {page}/{pageCount || 1}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPage((p) => Math.min(p + 1, pageCount))}
              disabled={page === pageCount || pageCount === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* ===== Centered Add Order Modal ===== */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">
                Tạo đơn giặt mới
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowForm(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Khách hàng</Label>
                <Input
                  id="customer"
                  placeholder="Tên khách"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="items">Mặt hàng</Label>
                <Input
                  id="items"
                  placeholder="Áo sơ mi x3, Quần x2..."
                  value={items}
                  onChange={(e) => setItems(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={createOrder} className="w-full">
                Lưu đơn
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* ===== Centered Invoice Modal ===== */}
      {showInvoice && (
        <div
          className="fixed inset-0 bg bg-black/40 z-40 flex items-center justify-center p-4"
          role="dialog"
        >
          <Card
            id="invoice-modal-content"
            className="w-full max-w-md print:w-full print:max-w-none"
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">
                Phiếu đơn hàng #{showInvoice.id}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowInvoice(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <strong>Khách hàng:</strong> {showInvoice.customerName}
              </p>
              <p>
                <strong>Mặt hàng:</strong> {showInvoice.items}
              </p>
              <p>
                <strong>Trạng thái hiện tại:</strong> {showInvoice.status}
              </p>
              <p>
                <strong>Ngày tạo:</strong>{" "}
                {showInvoice.createdAt.toLocaleString("vi-VN")}
              </p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => handlePrintInvoice(showInvoice)}
              >
                In phiếu
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
