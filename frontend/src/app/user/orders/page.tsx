"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, CalendarDays, Download, Eye, PackageCheck, ReceiptText, RotateCcw, Star, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { PageShell, StatusBadge } from "@/src/app/home/_components/dashboard-primitives";
import { FilterBar, type FilterOption } from "@/src/app/home/_components/filter-bar";
import { TableView } from "@/src/app/home/_components/table-view";
import { Toolbar } from "@/src/app/home/_components/toolbar";
import { HistoryModal } from "@/src/app/home/_components/history-modal";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import { formatRange, normalizeRange } from "@/src/utils/dashboard-time";
import type { DashboardTableColumn } from "@/src/components/common/dashboard-data-table";
import { defaultColumns, initialOrders } from "./data";
import type { Order } from "./types";

type OrderTone = "default" | "success" | "danger" | "warning";

interface OrderItem {
  name: string;
  qty: string;
  price: string;
}

interface TimelineEvent {
  stage: string;
  time: string;
  status: string;
  desc: string;
}

interface OrderDetail {
  code: string;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: string;
  notes: string;
  total: string;
  status: string;
  status_display?: string;
  tone: OrderTone;
  items: OrderItem[];
  timeline: TimelineEvent[];
}

const checkboxClass =
  "relative size-4 appearance-none rounded-[5px] border border-slate-300 bg-white transition-all checked:border-emerald-300 checked:bg-emerald-300 after:absolute after:left-1/2 after:top-1/2 after:hidden after:h-[9px] after:w-[5px] after:-translate-x-1/2 after:-translate-y-[58%] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:content-[''] checked:after:block";

const statusStyle: Record<string, { color: string; bg: string; tone: OrderTone }> = {
  "Tiếp nhận": { color: "#3b82f6", bg: "rgba(59,130,246,0.08)", tone: "default" },
  "Đang giặt": { color: "#8b5cf6", bg: "rgba(139,92,246,0.08)", tone: "default" },
  "Kiểm tra": { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", tone: "warning" },
  "Chờ thanh toán": { color: "#ec4899", bg: "rgba(236,72,153,0.08)", tone: "warning" },
  "Hoàn thành": { color: "#10b981", bg: "rgba(16,185,129,0.08)", tone: "success" },
  "Đã hủy": { color: "#ef4444", bg: "rgba(239,68,68,0.08)", tone: "danger" },
};

const statusOptions: FilterOption[] = [
  { id: "Tất cả", label: "Tất cả", color: "#64748b", bgColor: "rgba(100,116,139,0.09)" },
  ...Object.entries(statusStyle).map(([status, style]) => ({
    id: status,
    label: status,
    color: style.color,
    bgColor: style.bg,
  })),
];

function parseOrderDate(dateStr: string) {
  if (!dateStr) return new Date();
  if (dateStr.includes("-")) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day);
}

const statuses = ["Tiếp nhận", "Đang giặt", "Kiểm tra", "Chờ thanh toán", "Hoàn thành", "Đã hủy"];

const statusDotColor: Record<string, string> = {
  "Tiếp nhận": "#3b82f6",
  "Đang giặt": "#8b5cf6",
  "Kiểm tra": "#f59e0b",
  "Chờ thanh toán": "#ec4899",
  "Hoàn thành": "#10b981",
  "Đã hủy": "#ef4444",
};

const statusBgColor: Record<string, string> = {
  "Tiếp nhận": "rgba(59,130,246,0.08)",
  "Đang giặt": "rgba(139,92,246,0.08)",
  "Kiểm tra": "rgba(245,158,11,0.08)",
  "Chờ thanh toán": "rgba(236,72,153,0.08)",
  "Hoàn thành": "rgba(16,185,129,0.08)",
  "Đã hủy": "rgba(239,68,68,0.08)",
};

const getStatusTime = (
  order: Order,
  statusIndex: number,
  isCurrentStatus: boolean,
) => {
  if (statusIndex === 0)
    return `${order.createdAt} · Tiếp nhận`;

  const baseDate = parseOrderDate(order.createdAt);
  if (Number.isNaN(baseDate.getTime()))
    return `${order.createdAt} · Chưa ghi giờ`;

  baseDate.setHours(baseDate.getHours() + statusIndex * 2);
  return baseDate.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};


function getOrderTimeline(order: Order): TimelineEvent[] {
  const dateStr = order.createdAt;
  if (order.status === "Đang giặt") {
    return [
      { stage: "Đã nhận đồ", time: `${dateStr} 08:00`, status: "completed", desc: "Nhân viên đã nhận túi đồ từ khách hàng." },
      { stage: "Phân loại", time: `${dateStr} 09:15`, status: "completed", desc: "Đồ giặt đã được phân loại theo chất liệu và màu sắc." },
      { stage: "Đang giặt", time: `${dateStr} 10:30`, status: "current", desc: "Đồ đang được giặt bằng nước giặt sinh học." },
      { stage: "Sấy & gấp", time: "--:--", status: "pending", desc: "Sấy khô và xếp gọn vào túi." },
      { stage: "Giao lại", time: "--:--", status: "pending", desc: "Giao đồ sạch tận tay khách hàng." },
    ];
  }

  if (order.status === "Đã hủy") {
    return [
      { stage: "Đã nhận yêu cầu", time: `${dateStr} 09:00`, status: "completed", desc: "Hệ thống ghi nhận yêu cầu đặt dịch vụ." },
      { stage: "Đã hủy đơn", time: `${dateStr} 10:15`, status: "cancelled", desc: "Khách hàng yêu cầu hủy đơn hàng." },
    ];
  }

  return [
    { stage: "Đã nhận đồ", time: `${dateStr} 08:30`, status: "completed", desc: "Nhân viên đã nhận túi đồ từ khách hàng." },
    { stage: "Phân loại", time: `${dateStr} 09:40`, status: "completed", desc: "Đồ giặt đã được phân loại." },
    { stage: "Đang giặt", time: `${dateStr} 11:00`, status: "completed", desc: "Đồ đã được giặt sạch." },
    { stage: "Sấy & gấp", time: `${dateStr} 14:30`, status: "completed", desc: "Đồ đã được sấy khô và đóng gói." },
    { stage: order.status === "Hoàn thành" ? "Giao lại hoàn tất" : "Chờ giao lại", time: `${dateStr} 16:30`, status: order.status === "Hoàn thành" ? "completed" : "current", desc: order.status === "Hoàn thành" ? "Đã giao túi đồ sạch cho khách hàng." : "Đang chờ tài xế giao lại." },
  ];
}

function getLocalDetail(order: Order): OrderDetail {
  const tone = statusStyle[order.status]?.tone || "default";
  const amountStr = order.amount.toLocaleString("vi-VN") + "đ";
  return {
    code: order.id,
    customerName: "Nguyễn Thị Hương",
    phone: order.phone || "0901 234 567",
    address: order.address || "12 Nguyễn Trãi, Quận 1, TP.HCM",
    paymentMethod: "Thanh toán khi nhận đồ",
    notes: order.note || "Giặt riêng đồ sáng màu, dùng nước xả thơm nhẹ.",
    total: amountStr,
    status: order.status,
    status_display: order.status,
    tone,
    items: [
      { name: order.service, qty: order.quantity || "1", price: amountStr },
      { name: "Đóng gói sạch", qty: "1", price: "0đ" },
    ],
    timeline: getOrderTimeline(order),
  };
}

function numericTotal(order: Order) {
  return order.amount;
}

function exportOrders(format: "pdf" | "excel" | "csv", fileName: string, columns: DashboardTableColumn[], rows: Order[]) {
  const exportColumns = columns.filter((column) => column.visible !== false && column.id !== "actions");
  const headers = exportColumns.map((column) => column.label);
  const values = rows.map((row) => exportColumns.map((column) => String(row[column.id as keyof Order] ?? "")));

  if (format === "csv") {
    const csv = "\uFEFF" + [headers, ...values].map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    return;
  }

  const head = headers.map((header) => `<th>${header}</th>`).join("");
  const body = values.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("");
  if (format === "excel") {
    const url = URL.createObjectURL(new Blob([`<html><meta charset="utf-8" /><body><table border="1"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`], { type: "application/vnd.ms-excel" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.xls`;
    link.click();
    URL.revokeObjectURL(url);
    return;
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write(`<html><body><h2>Đơn của tôi</h2><table border="1"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`);
  printWindow.document.close();
  printWindow.print();
}

function KpiCard({
  title,
  value,
  hint,
  change,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  hint: string;
  change: string;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg" style={{ color, backgroundColor: `${color}14` }}>
            <Icon className="size-3.5" />
          </span>
          <p className="text-xs font-semibold text-slate-900">{title}</p>
        </div>
        <ArrowUpRight className="size-3.5 text-slate-400" />
      </div>
      <p className="mt-3 text-xl font-semibold tracking-tight text-slate-950">{value}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="truncate text-xs text-slate-400">{hint}</span>
        <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium" style={{ color, backgroundColor: `${color}12` }}>
          {change}
        </span>
      </div>
    </div>
  );
}

export default function UserOrdersPage() {
  const router = useRouter();
  const range = useDashboardTimeRangeStore((state) => state.range);
  const rangeLabel = formatRange(normalizeRange(range));

  const [columns, setColumns] = useState<DashboardTableColumn[]>(defaultColumns);
  const [orderList, setOrderList] = useState<Order[]>(initialOrders as unknown as Order[]);
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [tableResizeMode, setTableResizeMode] = useState<"fit" | "custom">("fit");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [customPageSize, setCustomPageSize] = useState("");
  const [openPageSizeMenu, setOpenPageSizeMenu] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<OrderDetail | null>(null);
  const [deleteOrderCode, setDeleteOrderCode] = useState<string | null>(null);
  const [purgeOrderId, setPurgeOrderId] = useState<string | null>(null);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reorderOpen, setReorderOpen] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [activeHistoryOrderId, setActiveHistoryOrderId] = useState<string | null>(null);

  const selectedOrders = useMemo(() => {
    const selected = orderList.filter((order) => selectedIds.has(order.id));
    return selected.length > 0 ? selected : orderList;
  }, [orderList, selectedIds]);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return orderList.filter((order) => {
      const matchesStatus = selectedStatus === "Tất cả" || order.status === selectedStatus;
      const matchesQuery =
        !normalizedQuery ||
        [order.id, order.createdAt, order.service, order.quantity, order.status, order.staff]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery));

      return matchesStatus && matchesQuery;
    });
  }, [orderList, query, selectedStatus]);

  const totalOrders = filteredOrders.length;
  const completedOrders = filteredOrders.filter((order) => order.status === "Hoàn thành").length;
  const inProgressOrders = filteredOrders.filter((order) => order.status !== "Hoàn thành" && order.status !== "Đã hủy").length;
  const totalSpent = filteredOrders.reduce((sum, order) => sum + numericTotal(order), 0);
  const latestOrder = orderList.find((order) => order.status !== "Đã hủy");
  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const paginatedOrders = filteredOrders.slice((safePage - 1) * pageSize, safePage * pageSize);
  const visibleIds = filteredOrders.map((order) => order.id);
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.has(id)).length;
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const totalVisibleWidth = columns.filter((column) => column.visible !== false).reduce((sum, column) => sum + (column.width || 150), 0);

  const toggleOrder = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const applyCustomPageSize = () => {
    const parsed = Number(customPageSize);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    setPageSize(Math.floor(parsed));
    setPage(1);
    setOpenPageSizeMenu(false);
  };

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setSelectedDetail(getLocalDetail(order));
  };

  const handleCancelOrder = () => {
    if (!deleteOrderCode) return;
    setOrderList((prev) =>
      prev.map((order) =>
        order.id === deleteOrderCode
          ? { ...order, status: "Đã hủy" }
          : order,
      ),
    );
    toast.success(`Đã chuyển ${deleteOrderCode} sang trạng thái đã hủy trong dữ liệu demo.`);
    setDeleteOrderCode(null);
  };

  const handlePurgeOrder = () => {
    if (!purgeOrderId) return;
    setOrderList((prev) => prev.filter((order) => order.id !== purgeOrderId));
    toast.success(`Đã xóa dữ liệu đơn hàng ${purgeOrderId} thành công.`);
    setPurgeOrderId(null);
  };

  const renderCell = (order: Order, column: DashboardTableColumn) => {
    if (column.id === "id") {
      return (
        <TableCell key={column.id} className="pl-4 font-semibold text-slate-900">
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={selectedIds.has(order.id)} onChange={() => toggleOrder(order.id)} onClick={(event) => event.stopPropagation()} className={checkboxClass} aria-label={`Chọn ${order.id}`} />
            {order.id}
          </div>
        </TableCell>
      );
    }
    if (column.id === "customer") {
      return (
        <TableCell key={column.id}>
          <div className="flex min-w-0 items-center gap-2">
            <Image src="https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif" alt={order.customer} width={24} height={24} className="size-6 shrink-0 rounded-full object-cover" />
            <span className="truncate font-semibold text-slate-800">{order.customer}</span>
          </div>
        </TableCell>
      );
    }
    if (column.id === "staff") {
      return (
        <TableCell key={column.id}>
          <div className="flex min-w-0 items-center gap-2">
            <Image src="https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif" alt={order.staff} width={24} height={24} className="size-6 shrink-0 rounded-full object-cover" />
            <span className="truncate font-medium text-slate-700">{order.staff}</span>
          </div>
        </TableCell>
      );
    }
    if (column.id === "status") {
      const style = statusStyle[order.status] || { color: "#64748b", bg: "rgba(100,116,139,0.09)" };
      return (
        <TableCell key={column.id} className="truncate overflow-hidden max-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium truncate max-w-full" style={{ color: style.color, backgroundColor: style.bg }}>
            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: style.color }} />
            <span className="truncate">{order.status}</span>
          </span>
        </TableCell>
      );
    }
    if (column.id === "amount") {
      return (
        <TableCell key={column.id} className="font-semibold text-slate-900">
          {order.amount.toLocaleString("vi-VN") + "đ"}
        </TableCell>
      );
    }
    if (column.id === "actions") {
      const canCancel = order.status === "Tiếp nhận";
      const canDelete = order.status === "Hoàn thành" || order.status === "Đã hủy";

      return (
        <TableCell key={column.id} className="px-4" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-center gap-1.5">
            <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 hover:bg-slate-50" onClick={() => openOrderDetail(order)}>
              <Eye className="size-3" />
              Xem
            </button>
            {canCancel && (
              <button type="button" className="inline-flex size-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-red-50 hover:text-red-600" onClick={() => setDeleteOrderCode(order.id)} title="Yêu cầu hủy">
                <Trash2 className="size-3.5" />
              </button>
            )}
            {canDelete && (
              <button type="button" className="inline-flex size-7 items-center justify-center rounded-md border border-slate-200 bg-white text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => setPurgeOrderId(order.id)} title="Xóa dữ liệu">
                <Trash2 className="size-3.5 text-red-500" />
              </button>
            )}
          </div>
        </TableCell>
      );
    }
    return <TableCell key={column.id} className="font-medium text-slate-700">{String(order[column.id as keyof Order] ?? "")}</TableCell>;
  };

  return (
    <PageShell fullHeight>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <div className="flex min-h-0 flex-1 flex-col gap-4 px-5 pt-5 pb-0">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Đơn gần nhất"
              value={latestOrder ? latestOrder.id : "--"}
              hint={latestOrder ? latestOrder.createdAt : "Chưa có đơn"}
              change={latestOrder ? latestOrder.status : "Trống"}
              icon={ReceiptText}
              color={latestOrder ? (statusStyle[latestOrder.status]?.color || "#06b6d4") : "#06b6d4"}
            />
            <KpiCard
              title="Đang xử lý"
              value={String(inProgressOrders)}
              hint="Đang giặt hoặc chờ xử lý"
              change={inProgressOrders > 0 ? `${inProgressOrders} đơn` : "Không có"}
              icon={RotateCcw}
              color="#f59e0b"
            />
            <KpiCard
              title="Đã hoàn tất"
              value={String(completedOrders)}
              hint="Không có khiếu nại"
              change="Ổn định"
              icon={PackageCheck}
              color="#10b981"
            />
            <KpiCard
              title="Tổng chi tiêu"
              value={totalSpent.toLocaleString("vi-VN") + "đ"}
              hint="Tổng tích lũy"
              change="Đã gồm ưu đãi"
              icon={Star}
              color="#3b82f6"
            />
          </div>

          <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-white">
            <Toolbar
              leftContent={
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-900">Bảng đơn hàng</h2>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">{filteredOrders.length}</span>
                  </div>
                </div>
              }
              query={query}
              onQueryChange={(value) => { setQuery(value); setPage(1); }}
              columns={columns}
              onColumnsChange={setColumns}
              tableResizeMode={tableResizeMode}
              onTableResizeModeChange={setTableResizeMode}
              selectedCount={selectedIds.size}
              onOpenAddColumn={() => toast.info("Bảng đơn của tôi dùng bộ cột cố định.")}
              onOpenHistory={() => setOpenHistory(true)}
              onExport={(format, fileName) => {
                const selectedRows = filteredOrders.filter((order) => selectedIds.has(order.id));
                exportOrders(format, fileName, columns, selectedRows.length > 0 ? selectedRows : filteredOrders);
              }}
              defaultExportFileName={`don-cua-toi-${new Date().toISOString().slice(0, 10)}`}
              onCreateClick={() => router.push("/user/bookings")}
              createLabel="Đặt lịch"
              defaultColumnIds={defaultColumns.map((column) => column.id)}
              searchPlaceholder="Tìm mã đơn, dịch vụ, trạng thái..."
              showHistoryButton={true}
              showAddColumnButton={false}
            />
            <FilterBar
              rangeLabel={rangeLabel}
              selectedValue={selectedStatus}
              onValueChange={(value) => { setSelectedStatus(value); setPage(1); }}
              filterOptions={statusOptions}
              filterLabel="Trạng thái đơn"
              allSelected={allVisibleSelected}
              disabled={visibleIds.length === 0}
              selectedCount={selectedVisibleCount}
              totalCount={visibleIds.length}
              itemLabel="đơn"
              checkboxClass={checkboxClass}
              onToggleAll={toggleAll}
            />
            <TableView
              columns={columns}
              rows={paginatedOrders}
              pageSize={pageSize}
              emptyMessage="Không tìm thấy đơn hàng phù hợp."
              tableResizeMode={tableResizeMode}
              totalVisibleWidth={totalVisibleWidth}
              renderCell={renderCell}
              page={safePage}
              pageCount={pageCount}
              totalRows={filteredOrders.length}
              customPageSize={customPageSize}
              openPageSizeMenu={openPageSizeMenu}
              onOpenPageSizeMenuChange={setOpenPageSizeMenu}
              onCustomPageSizeChange={setCustomPageSize}
              onApplyCustomPageSize={applyCustomPageSize}
              onUpdatePageSize={(size) => { setPageSize(size); setPage(1); }}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>

      <Dialog open={ratingOpen} onOpenChange={setRatingOpen}>
        <DialogContent className="max-w-[480px] gap-0 rounded-xl border border-slate-200 bg-white p-0 shadow-lg" showCloseButton={false}>
          <DialogHeader className="gap-3 px-5 pb-4 pt-5">
            <DialogTitle className="text-base font-semibold text-slate-900">Đánh giá dịch vụ</DialogTitle>
            <DialogDescription className="text-sm text-slate-500">Ý kiến của bạn giúp chúng tôi cải thiện chất lượng dịch vụ tốt hơn.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-5 pb-5">
            <div className="flex justify-center gap-1.5 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRatingValue(star)} className="focus:outline-none">
                  <Star className={`size-8 transition-colors ${star <= ratingValue ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                </button>
              ))}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="review-comment" className="text-xs font-semibold text-slate-700">Ý kiến phản hồi (nếu có)</label>
              <Textarea id="review-comment" placeholder="Nhập cảm nhận của bạn về chất lượng dịch vụ..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} className="min-h-[90px] border-slate-200 text-xs focus-visible:border-slate-300 focus-visible:ring-0" />
            </div>
          </div>
          <DialogFooter className="m-0 flex-row justify-end gap-2 rounded-b-xl border-t border-slate-100 bg-slate-50 px-4 py-3">
            <DialogClose asChild><Button variant="outline" className="h-8 border-slate-200 text-xs">Hủy</Button></DialogClose>
            <Button className="h-8 bg-slate-950 text-xs text-white hover:bg-slate-800" onClick={() => { toast.success(`Cảm ơn bạn đã đánh giá ${ratingValue} sao.`); setRatingOpen(false); }}>Gửi đánh giá</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reorderOpen} onOpenChange={setReorderOpen}>
        <DialogContent className="max-w-[400px] gap-0 rounded-xl border border-slate-200 bg-white p-0 shadow-lg" showCloseButton={false}>
          <DialogHeader className="gap-3 px-5 pb-4 pt-5">
            <DialogTitle className="text-base font-semibold text-slate-900">Đặt lại đơn hàng?</DialogTitle>
            <DialogDescription className="text-sm text-slate-500">Các dịch vụ từ đơn hàng sẽ được dùng làm mẫu cho lịch đặt mới.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="m-0 flex-row justify-end gap-2 rounded-b-xl border-t border-slate-100 bg-slate-50 px-4 py-3">
            <DialogClose asChild><Button variant="outline" className="h-8 border-slate-200 text-xs">Hủy</Button></DialogClose>
            <Button className="h-8 bg-slate-950 text-xs text-white hover:bg-slate-800" onClick={() => { toast.success("Đã tạo mẫu đặt lại."); setReorderOpen(false); }}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteOrderCode} onOpenChange={(open) => !open && setDeleteOrderCode(null)}>
        <DialogContent className="max-w-[400px] gap-0 rounded-xl border border-slate-200 bg-white p-0 shadow-lg" showCloseButton={false}>
          <DialogHeader className="gap-3 px-5 pb-4 pt-5">
            <DialogTitle className="text-base font-semibold text-slate-900">Yêu cầu hủy đơn?</DialogTitle>
            <DialogDescription className="text-sm text-slate-500">Bạn có chắc chắn muốn yêu cầu hủy đơn {deleteOrderCode} không?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="m-0 flex-row justify-end gap-2 rounded-b-xl border-t border-slate-100 bg-slate-50 px-4 py-3">
            <DialogClose asChild><Button variant="outline" className="h-8 border-slate-200 text-xs">Đóng</Button></DialogClose>
            <Button className="h-8 bg-red-600 text-xs text-white hover:bg-red-700" onClick={handleCancelOrder}>Hủy đơn</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!purgeOrderId} onOpenChange={(open) => !open && setPurgeOrderId(null)}>
        <DialogContent className="max-w-[400px] gap-0 rounded-xl border border-slate-200 bg-white p-0 shadow-lg" showCloseButton={false}>
          <DialogHeader className="gap-3 px-5 pb-4 pt-5">
            <DialogTitle className="text-base font-semibold text-slate-900">Xóa dữ liệu đơn hàng?</DialogTitle>
            <DialogDescription className="text-sm text-slate-500">Bạn có chắc chắn muốn xóa dữ liệu lần giặt {purgeOrderId} không? Thao tác này không thể hoàn tác.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="m-0 flex-row justify-end gap-2 rounded-b-xl border-t border-slate-100 bg-slate-50 px-4 py-3">
            <DialogClose asChild><Button variant="outline" className="h-8 border-slate-200 text-xs">Đóng</Button></DialogClose>
            <Button className="h-8 bg-red-600 text-xs text-white hover:bg-red-700" onClick={handlePurgeOrder}>Xóa dữ liệu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="flex max-h-[86vh] w-[95vw] max-w-[820px] flex-col gap-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-0 shadow-lg" showCloseButton={false}>
          <DialogHeader className="border-b border-slate-100 px-5 pb-3 pt-4">
            <DialogTitle className="flex items-center justify-between text-base font-semibold text-slate-900">
              <span>Chi tiết tiến trình đơn hàng</span>
              {selectedOrder && <span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-600">{selectedOrder.id}</span>}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">Thông tin giao nhận, dịch vụ và các mốc trạng thái.</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            {!selectedDetail ? (
              <div className="grid min-h-[240px] place-items-center text-sm text-slate-400">Không tìm thấy thông tin đơn hàng.</div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">Thông tin giao nhận</h3>
                    <div className="mt-3 space-y-2 text-sm">
                      <p><span className="text-slate-400">Khách hàng:</span> <span className="font-semibold text-slate-900">{selectedDetail.customerName}</span></p>
                      <p><span className="text-slate-400">Điện thoại:</span> <span className="font-medium text-slate-700">{selectedDetail.phone}</span></p>
                      <p><span className="text-slate-400">Địa chỉ:</span> <span className="font-medium text-slate-700">{selectedDetail.address}</span></p>
                      <p className="rounded-md border border-slate-200 bg-white p-2 text-xs italic text-slate-500">{selectedDetail.notes}</p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">Chi tiết dịch vụ</h3>
                    <div className="mt-3 space-y-2">
                      {selectedDetail.items.map((item) => (
                        <div key={`${item.name}-${item.qty}`} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 text-sm last:border-0">
                          <span className="min-w-0 truncate font-medium text-slate-700">{item.name} <span className="text-xs text-slate-400">({item.qty})</span></span>
                          <span className="shrink-0 font-semibold text-slate-900">{item.price}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
                      <span className="text-slate-500">{selectedDetail.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="w-[56px] text-center text-xs">STT</TableHead>
                        <TableHead className="text-xs">Giai đoạn</TableHead>
                        <TableHead className="text-xs">Trạng thái</TableHead>
                        <TableHead className="text-xs">Thời gian</TableHead>
                        <TableHead className="text-xs">Mô tả</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedDetail.timeline.map((event, index) => (
                        <TableRow key={`${event.stage}-${index}`} className="text-xs">
                          <TableCell className="text-center">
                            <span className={`inline-grid size-5 place-items-center rounded-full text-[10px] font-bold ${event.status === "pending" ? "bg-slate-100 text-slate-400" : event.status === "cancelled" ? "bg-red-500 text-white" : "bg-slate-950 text-white"}`}>{index + 1}</span>
                          </TableCell>
                          <TableCell className="font-semibold text-slate-800">{event.stage}</TableCell>
                          <TableCell>
                            <StatusBadge tone={event.status === "completed" ? "success" : event.status === "current" ? "warning" : event.status === "cancelled" ? "danger" : "default"}>
                              {event.status === "completed" ? "Đã xong" : event.status === "current" ? "Đang xử lý" : event.status === "cancelled" ? "Đã hủy" : "Chờ xử lý"}
                            </StatusBadge>
                          </TableCell>
                          <TableCell className="font-mono text-slate-600">{event.time}</TableCell>
                          <TableCell className="text-slate-500">{event.desc}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="m-0 flex-row justify-end gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3">
            <DialogClose asChild><Button className="h-8 bg-slate-950 text-xs text-white hover:bg-slate-800">Đóng</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <HistoryModal
        open={openHistory}
        onClose={() => setOpenHistory(false)}
        title="Lịch sử đơn hàng"
        items={selectedOrders}
        activeItemId={activeHistoryOrderId || selectedOrders[0]?.id || null}
        onActiveItemChange={setActiveHistoryOrderId}
        itemLabel="đơn"
        renderSidebarItem={(order, active) => (
          <div className="flex min-w-0 items-start gap-2">
            <Image
              src="https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif"
              alt={order.customer}
              width={28}
              height={28}
              className="size-7 shrink-0 rounded-full object-cover ring-1 ring-background"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-semibold text-foreground">{order.id}</span>
                <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ color: statusDotColor[order.status], backgroundColor: statusBgColor[order.status] }}>
                  {order.status}
                </span>
              </div>
              <p className="mt-1.5 truncate text-xs font-medium text-foreground/80">{order.customer}</p>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{order.service} · {order.quantity}</p>
            </div>
          </div>
        )}
        renderDetail={(order) => {
          const currentStatusIndex = statuses.indexOf(order.status);
          return (
            <div>
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-3">
                <div className="flex min-w-0 items-start gap-3">
                  <Image
                    src="https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif"
                    alt={order.customer}
                    width={40}
                    height={40}
                    className="size-10 shrink-0 rounded-full object-cover ring-1 ring-border"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {order.id} · {order.customer}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {order.phone} · {order.address}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {order.service} · {order.quantity} · {order.staff}
                    </p>
                  </div>
                </div>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{
                    color: statusDotColor[order.status],
                    backgroundColor: statusBgColor[order.status],
                  }}
                >
                  <span className="size-2 rounded-full" style={{ backgroundColor: statusDotColor[order.status] }} />
                  {order.status}
                </span>
              </div>

              <div className="space-y-0 text-sm">
                {statuses.map((status, idx) => {
                  const reached = idx <= currentStatusIndex;
                  const isCurrentStatus = status === order.status;
                  const statusColor = statusDotColor[status];
                  const statusBg = statusBgColor[status];

                  return (
                    <div key={status} className="flex gap-2.5">
                      <div className="flex flex-col items-center">
                        <span
                          className="mt-1 size-3 rounded-full border-2 bg-white"
                          style={reached ? { borderColor: statusColor, backgroundColor: statusColor } : undefined}
                        />
                        {idx < statuses.length - 1 && (
                          <span
                            className="mt-1 h-9 w-0.5 bg-border/60"
                            style={reached ? { backgroundColor: statusColor, opacity: 0.35 } : undefined}
                          />
                        )}
                      </div>
                      <div className="min-w-0 pb-3">
                        <p
                          className={`inline-flex rounded-md px-1.5 py-0.5 text-xs font-medium ${reached ? "" : "text-muted-foreground"}`}
                          style={reached ? { color: statusColor, backgroundColor: statusBg } : undefined}
                        >
                          {status}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {reached
                            ? getStatusTime(order, idx, isCurrentStatus)
                            : "Chưa cập nhật"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }}
      />
    </PageShell>
  );
}
