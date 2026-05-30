"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  CalendarClock,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  EyeOff,
  FileText,
  Kanban,
  List,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Table2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PageShell,
} from "../_components/dashboard-primitives";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import {
  formatRange,
  fromOrderDate,
  normalizeRange,
  startOfDay,
} from "@/src/utils/dashboard-time";

type OrderStatus =
  | "Tiếp nhận"
  | "Đã xác nhận lịch"
  | "Đang giặt"
  | "Kiểm tra"
  | "Chờ thanh toán"
  | "Hoàn thành";

type Order = {
  id: string;
  customer: string;
  phone: string;
  address: string;
  service: string;
  quantity: string;
  amount: number;
  status: OrderStatus;
  appointment: string;
  deliveryDate: string;
  deliveryTime: string;
  staff: string;
  createdAt: string;
  note: string;
};

const statuses: OrderStatus[] = [
  "Tiếp nhận",
  "Đã xác nhận lịch",
  "Đang giặt",
  "Kiểm tra",
  "Chờ thanh toán",
  "Hoàn thành",
];

const seedOrders: Order[] = [
  { id: "DH-1048", customer: "Nguyễn Thị Hương", phone: "0903123456", address: "12 Trần Phú, Q.1", service: "Giặt", quantity: "6 kg", amount: 180000, status: "Kiểm tra", appointment: "10:30", deliveryDate: "2026-05-29", deliveryTime: "18:00", staff: "Anh Minh", createdAt: "2026-05-29", note: "Không dùng nước xả" },
  { id: "DH-1052", customer: "Trần Minh", phone: "0912456789", address: "90 Lý Thường Kiệt, Q.3", service: "Giặt sấy", quantity: "8 kg", amount: 240000, status: "Chờ thanh toán", appointment: "11:15", deliveryDate: "2026-05-29", deliveryTime: "19:00", staff: "Chị Lan", createdAt: "2026-05-29", note: "Ưu tiên đồ trắng riêng" },
  { id: "DH-1055", customer: "Phạm Lan", phone: "0938123456", address: "18 Nguyễn Du, Q.1", service: "Giặt thường", quantity: "5 kg", amount: 125000, status: "Hoàn thành", appointment: "12:00", deliveryDate: "2026-05-29", deliveryTime: "17:30", staff: "Anh Tuấn", createdAt: "2026-05-29", note: "Khách tự kiểm lại" },
  { id: "DH-1057", customer: "Công ty ABC", phone: "0283812345", address: "55 Pasteur, Q.1", service: "Chăn màn", quantity: "8 kg", amount: 320000, status: "Đang giặt", appointment: "12:30", deliveryDate: "2026-05-28", deliveryTime: "20:00", staff: "Anh Minh", createdAt: "2026-05-28", note: "Xuất hóa đơn cuối tháng" },
  { id: "DH-1061", customer: "Shop Linen", phone: "0283999888", address: "22 Mạc Đĩnh Chi, Q.1", service: "Giặt sấy", quantity: "12 kg", amount: 300000, status: "Tiếp nhận", appointment: "15:00", deliveryDate: "2026-05-27", deliveryTime: "21:00", staff: "Chưa gán", createdAt: "2026-05-27", note: "Khách doanh nghiệp" },
  { id: "DH-1062", customer: "Lê Mai", phone: "0977000111", address: "4 Võ Văn Tần, Q.3", service: "Vệ sinh rèm", quantity: "4 bộ", amount: 180000, status: "Hoàn thành", appointment: "16:30", deliveryDate: "2026-05-26", deliveryTime: "18:30", staff: "Chị Lan", createdAt: "2026-05-26", note: "Đã thu tiền mặt" },
  { id: "DH-1063", customer: "Nguyễn Văn Phúc", phone: "0901234567", address: "88 Nguyễn Huệ, Q.1", service: "Giặt", quantity: "4 kg", amount: 120000, status: "Đã xác nhận lịch", appointment: "09:00", deliveryDate: "2026-05-28", deliveryTime: "16:00", staff: "Anh Tuấn", createdAt: "2026-05-28", note: "" },
  { id: "DH-1064", customer: "Trương Thị Bích", phone: "0987654321", address: "45 Hai Bà Trưng, Q.3", service: "Giặt khô", quantity: "3 kg", amount: 150000, status: "Hoàn thành", appointment: "08:30", deliveryDate: "2026-05-27", deliveryTime: "15:00", staff: "Chị Lan", createdAt: "2026-05-27", note: "Đồ lụa" },
  { id: "DH-1065", customer: "Café Sương Mai", phone: "0281234567", address: "12 Lê Lợi, Q.1", service: "Giặt sấy", quantity: "15 kg", amount: 375000, status: "Tiếp nhận", appointment: "14:00", deliveryDate: "2026-05-29", deliveryTime: "20:00", staff: "Chưa gán", createdAt: "2026-05-29", note: "Khăn bàn, rèm cửa" },
  { id: "DH-1066", customer: "Lý Minh Châu", phone: "0909876543", address: "33 Điện Biên Phủ, Bình Thạnh", service: "Giặt hấp", quantity: "2 kg", amount: 100000, status: "Đang giặt", appointment: "11:00", deliveryDate: "2026-05-29", deliveryTime: "17:00", staff: "Anh Minh", createdAt: "2026-05-29", note: "Vest + sơ mi" },
  { id: "DH-1067", customer: "Hotel Majestic", phone: "0283456789", address: "1 Đồng Khởi, Q.1", service: "Chăn màn", quantity: "25 kg", amount: 750000, status: "Kiểm tra", appointment: "07:00", deliveryDate: "2026-05-28", deliveryTime: "19:00", staff: "Anh Tuấn", createdAt: "2026-05-28", note: "Đơn doanh nghiệp lớn" },
  { id: "DH-1068", customer: "Đặng Hoàng", phone: "0976543210", address: "67 Cách Mạng Tháng 8, Q.10", service: "Giặt thường", quantity: "7 kg", amount: 175000, status: "Chờ thanh toán", appointment: "13:30", deliveryDate: "2026-05-29", deliveryTime: "18:30", staff: "Chị Lan", createdAt: "2026-05-29", note: "" },
];

const pageSize = 10;

const emptyForm = {
  customer: "",
  phone: "",
  address: "",
  service: "Giặt",
  quantity: "",
  amount: "0",
  appointment: "",
  deliveryDate: "",
  deliveryTime: "",
  staff: "Chưa gán",
  status: "Tiếp nhận" as OrderStatus,
  createdAt: "",
  payment: "Tiền mặt",
  discount: "",
  note: "",
};



/* ── status dot color map ── */
const statusDotColor: Record<OrderStatus, string> = {
  "Tiếp nhận": "#6366f1",
  "Đã xác nhận lịch": "#3b82f6",
  "Đang giặt": "#f59e0b",
  "Kiểm tra": "#8b5cf6",
  "Chờ thanh toán": "#ef4444",
  "Hoàn thành": "#10b981",
};

const statusBgColor: Record<OrderStatus, string> = {
  "Tiếp nhận": "rgba(99,102,241,0.08)",
  "Đã xác nhận lịch": "rgba(59,130,246,0.08)",
  "Đang giặt": "rgba(245,158,11,0.08)",
  "Kiểm tra": "rgba(139,92,246,0.08)",
  "Chờ thanh toán": "rgba(239,68,68,0.08)",
  "Hoàn thành": "rgba(16,185,129,0.08)",
};

const allStatusColor = "#0f766e";
const allStatusBgColor = "rgba(15,118,110,0.09)";

export default function OrdersPage() {
  const [orders, setOrders] = useState(seedOrders);
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "Tất cả">("Tất cả");
  const range = useDashboardTimeRangeStore((state) => state.range);
  const [page, setPage] = useState(1);
  const [openForm, setOpenForm] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const normalizedRange = normalizeRange(range);
  const rangeLabel = formatRange(normalizedRange);
  const emptyMessage =
    normalizedRange.end < startOfDay(new Date())
      ? "Không có đơn hàng"
      : "Chưa có đơn hàng";

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const source = `${order.id} ${order.customer} ${order.phone} ${order.address} ${order.service} ${order.staff}`;
      const matchQuery = source.toLowerCase().includes(query.toLowerCase());
      const matchStatus = selectedStatus === "Tất cả" || order.status === selectedStatus;
      const createdAt = fromOrderDate(order.createdAt);
      const matchRange = createdAt >= normalizedRange.start && createdAt <= normalizedRange.end;
      return matchQuery && matchStatus && matchRange;
    });
  }, [normalizedRange.end, normalizedRange.start, orders, query, selectedStatus]);

  const pageCount = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);
  const totalAmount = filteredOrders.reduce((sum, order) => sum + order.amount, 0);



  const openCreateForm = () => {
    setEditingOrderId(null);
    setForm({ ...emptyForm, createdAt: new Date().toISOString().slice(0, 10) });
    setOpenForm(true);
  };

  const openEditForm = (order: Order) => {
    setEditingOrderId(order.id);
    setForm({
      customer: order.customer,
      phone: order.phone,
      address: order.address,
      service: order.service,
      quantity: order.quantity,
      amount: String(order.amount),
      appointment: order.appointment,
      deliveryDate: order.deliveryDate,
      deliveryTime: order.deliveryTime,
      staff: order.staff,
      status: order.status,
      createdAt: order.createdAt,
      payment: "Tiền mặt",
      discount: "",
      note: order.note,
    });
    setOpenForm(true);
  };

  const closeForm = () => {
    setOpenForm(false);
    setEditingOrderId(null);
    setForm(emptyForm);
  };

  const saveOrder = () => {
    if (!form.customer.trim() || !form.quantity.trim()) return;
    const amount = Number(form.amount) || 0;
    const payload: Omit<Order, "id"> = {
      customer: form.customer,
      phone: form.phone,
      address: form.address,
      service: form.service,
      quantity: form.quantity,
      amount,
      status: form.status,
      appointment: form.appointment || "Chưa hẹn",
      deliveryDate: form.deliveryDate || form.createdAt || new Date().toISOString().slice(0, 10),
      deliveryTime: form.deliveryTime || "Chưa hẹn",
      staff: form.staff || "Chưa gán",
      createdAt: form.createdAt || new Date().toISOString().slice(0, 10),
      note: `${form.note}${form.discount ? ` · Mã ${form.discount}` : ""}`,
    };

    if (editingOrderId) {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === editingOrderId ? { ...order, ...payload } : order,
        ),
      );
    } else {
      setOrders((prev) => [
        { id: `DH-${Date.now().toString().slice(-4)}`, ...payload },
        ...prev,
      ]);
    }

    setPage(1);
    closeForm();
  };

  return (
    <PageShell fullHeight>
      <div className="flex min-h-0 flex-1 flex-col">
        {/* ════════════ MAIN TABLE CONTAINER ════════════ */}
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-white">
          {/* ── Top toolbar ── */}
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
            {/* Left: view tabs */}
            <div className="flex items-center gap-1">
              {([
                ["Bảng", Table2],
                ["Bảng kéo", Kanban],
                ["Danh sách", List],
              ] as const).map(([label, Icon]) => (
                <button
                  key={label}
                  type="button"
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    label === "Bảng"
                      ? "text-slate-800"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Right: search + actions */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[220px] flex-1 xl:w-64 xl:flex-none">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
                <Input
                  className="h-8 rounded-md border-transparent bg-white pl-8 text-xs text-slate-700 shadow-none placeholder:text-slate-500 focus-visible:ring-slate-200"
                  placeholder="Tìm mã đơn, khách, SĐT..."
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs text-slate-700 transition-colors hover:bg-slate-50">
                <EyeOff className="size-3.5" />
                Ẩn cột
              </button>
              <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs text-slate-700 transition-colors hover:bg-slate-50">
                <Settings className="size-3.5" />
                Tùy chỉnh
              </button>
              <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50">
                <MoreHorizontal className="size-3.5" />
                Lịch sử
              </button>
              <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-slate-50">
                Xuất file
              </button>
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                onClick={openCreateForm}
              >
                Thêm đơn
                <ChevronDown className="size-3.5" />
              </button>
            </div>
          </div>

          {/* ── Filter pills ── */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-5 py-3">
            <button type="button" className="inline-flex h-7 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 text-xs text-slate-700 transition-colors hover:bg-slate-50">
              <CalendarClock className="size-3.5" />
              {rangeLabel}
              <ChevronDown className="size-3.5" />
            </button>
            <button type="button" className="inline-flex h-7 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 text-xs text-slate-700 transition-colors hover:bg-slate-50">
              <SlidersHorizontal className="size-3.5" />
              {selectedStatus}
              <ChevronDown className="size-3.5" />
            </button>
            <button type="button" className="inline-flex h-7 items-center gap-1.5 px-2 text-xs text-slate-500 transition-colors hover:text-slate-700">
              <Plus className="size-3.5" />
              Thêm bộ lọc
            </button>

            <div className="ml-auto hidden flex-wrap gap-1.5 2xl:flex">
              {(["Tất cả", ...statuses] as const).map((status) => {
                const active = selectedStatus === status;
                const isAll = status === "Tất cả";
                const activeColor = isAll ? allStatusColor : statusDotColor[status];
                const activeBgColor = isAll ? allStatusBgColor : statusBgColor[status];

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => {
                      setSelectedStatus(status);
                      setPage(1);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-all hover:bg-slate-50"
                    style={
                      active
                        ? { color: activeColor, backgroundColor: activeBgColor }
                        : { color: "#64748b", backgroundColor: "transparent" }
                    }
                  >
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: active ? activeColor : "#cbd5e1" }}
                    />
                    {status}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Table ── */}
          <div className="flex-1 overflow-auto">
            <Table className="w-full table-fixed text-xs [&_td:not(:first-child)]:border-l [&_td:not(:first-child)]:border-slate-100">
              <TableHeader>
                <TableRow className="h-9 border-b border-slate-100 bg-slate-50 hover:bg-slate-50">
                  <TableHead className="w-[126px] pl-4 text-xs font-medium text-slate-600">
                    <span className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        aria-label="Chọn tất cả đơn hàng"
                        className="relative size-4 appearance-none rounded-[5px] border border-slate-300 bg-white transition-all duration-150 checked:border-slate-900 checked:bg-slate-900 after:absolute after:left-[4.5px] after:top-[1px] after:hidden after:h-[9px] after:w-[5px] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:content-[''] checked:after:block"
                      />
                      Mã đơn
                    </span>
                  </TableHead>
                  <TableHead className="w-[168px] border-l border-slate-100 text-xs font-medium text-slate-600">
                    Khách hàng
                  </TableHead>
                  <TableHead className="w-[112px] border-l border-slate-100 text-xs font-medium text-slate-600">
                    Số điện thoại
                  </TableHead>
                  <TableHead className="w-[96px] border-l border-slate-100 text-xs font-medium text-slate-600">
                    Dịch vụ
                  </TableHead>
                  <TableHead className="w-[78px] border-l border-slate-100 text-xs font-medium text-slate-600">
                    Khối lượng
                  </TableHead>
                  <TableHead className="w-[100px] border-l border-slate-100 text-xs font-medium text-slate-600">
                    Giá
                  </TableHead>
                  <TableHead className="w-[76px] border-l border-slate-100 text-xs font-medium text-slate-600">
                    Giờ giao
                  </TableHead>
                  <TableHead className="w-[112px] border-l border-slate-100 text-xs font-medium text-slate-600">
                    Nhân viên
                  </TableHead>
                  <TableHead className="w-[132px] border-l border-slate-100 text-xs font-medium text-slate-600">
                    Trạng thái
                  </TableHead>
                  <TableHead className="w-[102px] border-l border-slate-100 text-xs font-medium text-slate-600">
                    Lịch sử
                  </TableHead>
                  <TableHead className="w-[168px] border-l border-slate-100 px-4 text-left text-xs font-medium text-slate-600">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11}>
                      <div className="grid min-h-[360px] place-items-center text-sm text-slate-400">
                        {emptyMessage}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="group h-9 border-b border-slate-100 text-slate-700 transition-colors hover:bg-slate-50/60"
                    >
                      {/* Mã đơn */}
                      <TableCell className="pl-4 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          aria-label={`Chọn đơn ${order.id}`}
                          className="relative size-4 appearance-none rounded-[5px] border border-slate-300 bg-white transition-all duration-150 checked:border-slate-900 checked:bg-slate-900 after:absolute after:left-[4.5px] after:top-[1px] after:hidden after:h-[9px] after:w-[5px] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:content-[''] checked:after:block"
                        />
                          <span>{order.id}</span>
                        </div>
                      </TableCell>

                      {/* Khách hàng */}
                      <TableCell>
                        <div className="flex min-w-0 items-center gap-2">
                          <Image
                            src="/default_avatar.jfif"
                            alt={order.customer}
                            width={28}
                            height={28}
                            className="size-6 shrink-0 rounded-full object-cover"
                          />
                          <span className="whitespace-nowrap font-medium text-slate-900">
                            {order.customer}
                          </span>
                        </div>
                      </TableCell>

                      {/* SĐT */}
                      <TableCell>
                        <a
                          href={`tel:${order.phone}`}
                          className="text-slate-500 transition-colors hover:text-slate-800"
                        >
                          {order.phone}
                        </a>
                      </TableCell>

                      {/* Dịch vụ */}
                      <TableCell className="text-slate-600">
                        {order.service}
                      </TableCell>

                      {/* Khối lượng */}
                      <TableCell className="text-slate-600">
                        {order.quantity}
                      </TableCell>

                      {/* Giá */}
                      <TableCell className="font-medium text-slate-900">
                        {order.amount.toLocaleString("vi-VN")}đ
                      </TableCell>

                      {/* Giờ giao */}
                      <TableCell className="text-slate-500">
                        {order.deliveryTime}
                      </TableCell>

                      {/* Nhân viên */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {order.staff === "Chưa gán" ? (
                            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-400 border border-slate-200/60 shadow-sm">
                              ?
                            </div>
                          ) : (
                            <Image
                              src="/default_avatar.jfif"
                              alt={order.staff}
                              width={24}
                              height={24}
                              className="size-6 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
                            />
                          )}
                          <span className={order.staff === "Chưa gán" ? "text-slate-400" : "text-slate-600"}>
                            {order.staff}
                          </span>
                        </div>
                      </TableCell>

                      {/* Trạng thái – dot style like reference */}
                      <TableCell>
                        <span
                          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium"
                          style={{
                            color: statusDotColor[order.status],
                            backgroundColor: statusBgColor[order.status],
                          }}
                        >
                          <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: statusDotColor[order.status] }}
                          />
                          {order.status}
                        </span>
                      </TableCell>

                      {/* Lịch sử */}
                      <TableCell>
                        <div className="flex items-center gap-2 text-slate-500">
                          <Clock className="size-3.5 text-slate-400" />
                          <span className="text-xs">{order.createdAt}</span>
                        </div>
                      </TableCell>

                      {/* Thao tác */}
                      <TableCell className="px-4">
                        <div className="flex items-center justify-start gap-1.5">
                          <button
                            type="button"
                            className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50"
                            onClick={() => openEditForm(order)}
                            title="Xem chi tiết"
                          >
                            <Pencil className="size-3.5" />
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50"
                            onClick={() => setInvoiceOrder(order)}
                            title="Hóa đơn"
                          >
                            <FileText className="size-3.5" />
                            Hóa đơn
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {/* ── Empty filler rows to fill viewport ── */}
                {paginatedOrders.length > 0 && paginatedOrders.length < pageSize &&
                  Array.from({ length: pageSize - paginatedOrders.length }).map((_, i) => (
                    <TableRow key={`empty-${i}`} className="border-b border-slate-100">
                      <TableCell className="pl-4">
                        <input type="checkbox" disabled className="size-4 rounded border-slate-200 opacity-0" />
                      </TableCell>
                      {Array.from({ length: 10 }).map((_, j) => (
                        <TableCell key={j}>&nbsp;</TableCell>
                      ))}
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </div>

          {/* ── Pagination footer ── */}
          <div className="border-t border-slate-200 px-5 py-4">
            <div className="flex flex-col gap-3 text-xs text-slate-700 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <span>Số dòng mỗi trang</span>
                <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 px-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50">
                  {pageSize}
                  <ChevronDown className="size-3.5" />
                </button>
                <span className="text-slate-400">
                  {filteredOrders.length === 0 ? 0 : (page - 1) * pageSize + 1}–
                  {Math.min(page * pageSize, filteredOrders.length)} trong {filteredOrders.length} dòng
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  Tổng {totalAmount.toLocaleString("vi-VN")}đ
                </span>
              </div>

              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 disabled:opacity-40"
                  disabled={page <= 1}
                  onClick={() => setPage(1)}
                >
                  <ChevronsLeft className="size-4" />
                </button>
                <button
                  type="button"
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 disabled:opacity-40"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(current - 1, 1))}
                >
                  <ChevronDown className="size-4 rotate-90" />
                </button>
                <span className="px-3 text-sm font-medium text-slate-700">
                  {page} / {pageCount || 1}
                </span>
                <button
                  type="button"
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 disabled:opacity-40"
                  disabled={page >= pageCount}
                  onClick={() => setPage((current) => Math.min(current + 1, pageCount))}
                >
                  <ChevronDown className="size-4 -rotate-90" />
                </button>
                <button
                  type="button"
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 disabled:opacity-40"
                  disabled={page >= pageCount}
                  onClick={() => setPage(pageCount || 1)}
                >
                  <ChevronsRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════ MODAL: Create / Edit ════════════ */}
      {openForm && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <Card className="max-h-[90dvh] w-full max-w-5xl overflow-y-auto rounded-2xl border-0 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 px-6 py-4">
              <CardTitle className="text-lg font-semibold">
                {editingOrderId ? `Chi tiết đơn ${editingOrderId}` : "Tạo đơn giặt mới"}
              </CardTitle>
              <button
                type="button"
                className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                onClick={closeForm}
              >
                <X className="size-5" />
              </button>
            </CardHeader>
            <CardContent className="grid gap-5 p-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Khách hàng</Label>
                  <Input value={form.customer} onChange={(event) => setForm({ ...form, customer: event.target.value })} placeholder="Tên khách" />
                </div>
                <div className="space-y-2">
                  <Label>Số điện thoại</Label>
                  <Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="090..." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Địa chỉ</Label>
                  <Input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="Số nhà, đường, phường/quận trong khu vực phục vụ" />
                </div>
                <div className="space-y-2">
                  <Label>Dịch vụ</Label>
                  <Input value={form.service} onChange={(event) => setForm({ ...form, service: event.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Số lượng</Label>
                  <Input value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} placeholder="5 kg / 3 món" />
                </div>
                <div className="space-y-2">
                  <Label>Lịch hẹn</Label>
                  <Input value={form.appointment} onChange={(event) => setForm({ ...form, appointment: event.target.value })} placeholder="14:30 hôm nay" />
                </div>
                <div className="space-y-2">
                  <Label>Ngày giao</Label>
                  <Input type="date" value={form.deliveryDate} onChange={(event) => setForm({ ...form, deliveryDate: event.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Giờ giao</Label>
                  <Input type="time" value={form.deliveryTime} onChange={(event) => setForm({ ...form, deliveryTime: event.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Nhân viên xử lý</Label>
                  <Input value={form.staff} onChange={(event) => setForm({ ...form, staff: event.target.value })} placeholder="Chưa gán" />
                </div>
                <div className="space-y-2">
                  <Label>Tạm tính</Label>
                  <Input type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Ngày tạo</Label>
                  <Input type="date" value={form.createdAt} onChange={(event) => setForm({ ...form, createdAt: event.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Thanh toán</Label>
                  <Input value={form.payment} onChange={(event) => setForm({ ...form, payment: event.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Mã giảm giá / điểm</Label>
                  <Input value={form.discount} onChange={(event) => setForm({ ...form, discount: event.target.value })} placeholder="BIRTHDAY15" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Cập nhật trạng thái</Label>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setForm({ ...form, status })}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-all ${
                          form.status === status
                            ? "bg-slate-900 text-white shadow-sm"
                            : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: form.status === status ? "#fff" : statusDotColor[status] }}
                        />
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Ghi chú đặc biệt</Label>
                  <Textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Dị ứng hóa chất, đồ nhạy cảm, vị trí đặt máy giặt..." />
                </div>
                <div className="md:col-span-2">
                  <Button className="w-full bg-slate-900 text-white hover:bg-slate-800" onClick={saveOrder}>
                    {editingOrderId ? "Lưu thay đổi" : "Lưu đơn và đưa vào tiếp nhận"}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">Lịch sử cập nhật</p>
                      <p className="text-xs text-slate-400">
                        {editingOrderId ?? "Đơn mới"}
                      </p>
                    </div>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                      style={{
                        color: statusDotColor[form.status],
                        backgroundColor: statusBgColor[form.status],
                      }}
                    >
                      <span className="size-2 rounded-full" style={{ backgroundColor: statusDotColor[form.status] }} />
                      {form.status}
                    </span>
                  </div>
                  <div className="space-y-4 text-sm">
                    {statuses.map((status, idx) => {
                      const active = statuses.indexOf(status) <= statuses.indexOf(form.status);

                      return (
                        <div key={status} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <span
                              className={`mt-1 size-3 rounded-full border-2 ${
                                active
                                  ? "border-slate-900 bg-slate-900"
                                  : "border-slate-200 bg-white"
                              }`}
                            />
                            {idx < statuses.length - 1 && (
                              <span className={`mt-1 w-0.5 flex-1 ${active ? "bg-slate-900" : "bg-slate-100"}`} />
                            )}
                          </div>
                          <div className="min-w-0 pb-4">
                            <p className={active ? "font-medium text-slate-900" : "text-slate-400"}>{status}</p>
                            <p className="text-xs text-slate-400">
                              {active
                                ? `${form.createdAt || "Hôm nay"} · ${form.deliveryTime || form.appointment || "Chưa hẹn"}`
                                : "Chưa cập nhật"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ════════════ MODAL: Invoice ════════════ */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-lg rounded-2xl border-0 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 px-6 py-4">
              <CardTitle className="text-lg font-semibold">Hóa đơn {invoiceOrder.id}</CardTitle>
              <button
                type="button"
                className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setInvoiceOrder(null)}
              >
                <X className="size-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4 p-6 text-sm">
              <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4">
                <div>
                  <p className="font-semibold text-slate-900">{invoiceOrder.customer}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {invoiceOrder.deliveryTime} · {invoiceOrder.deliveryDate}
                  </p>
                </div>
                <div className="grid size-20 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-[10px] font-medium text-slate-400">
                  QR PAY
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <span className="text-slate-400">Dịch vụ</span>
                <span className="text-right text-slate-700">{invoiceOrder.service}</span>
                <span className="text-slate-400">Khối lượng</span>
                <span className="text-right text-slate-700">{invoiceOrder.quantity}</span>
                <span className="text-slate-400">Thanh toán</span>
                <span className="text-right text-slate-700">Tiền mặt / QR</span>
                <span className="text-slate-400">Trạng thái</span>
                <span className="text-right">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      color: statusDotColor[invoiceOrder.status],
                      backgroundColor: statusBgColor[invoiceOrder.status],
                    }}
                  >
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: statusDotColor[invoiceOrder.status] }} />
                    {invoiceOrder.status}
                  </span>
                </span>
              </div>

              <div className="border-t border-slate-200 pt-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tạm tính</span>
                  <span className="text-slate-700">{invoiceOrder.amount.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="mt-1 flex justify-between">
                  <span className="text-slate-400">Mã / điểm</span>
                  <span className="text-slate-400">Không áp dụng</span>
                </div>
                <div className="mt-3 flex justify-between text-base font-bold">
                  <span className="text-slate-900">Cần thanh toán</span>
                  <span className="text-slate-900">{invoiceOrder.amount.toLocaleString("vi-VN")}đ</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageShell>
  );
}
