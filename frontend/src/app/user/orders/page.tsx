"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CalendarDays, Download, PackageCheck, ReceiptText, RotateCcw, Star, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import AccountAvatar from "@/src/components/common/account-avatar";
import { PageShell, StatusBadge } from "@/src/app/home/_components/dashboard-primitives";
import { FilterBar, type FilterOption } from "@/src/app/home/_components/filter-bar";
import { MetricCard } from "@/src/app/home/_components/metric-card";
import { TableView } from "@/src/app/home/_components/table-view";
import { Toolbar } from "@/src/app/home/_components/toolbar";
import { AddColumnDialog } from "@/src/app/home/_components/add-column-dialog";
import { FormDialog, type FormField } from "@/src/app/home/_components/form-dialog";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import { formatRange, normalizeRange } from "@/src/utils/dashboard-time";
import type { DashboardTableColumn } from "@/src/components/common/dashboard-data-table";
import { homeApi, mapHomeOrderStatus } from "@/src/lib/home-api";
import { InvoiceModal } from "@/src/app/home/orders/_components/invoice-modal";
import { API_BASE_URL } from "@/src/lib/config";
import { defaultColumns } from "./data";
import type { Order, OrderStatus } from "./types";

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

type CustomerProfile = {
  customer_id: string;
  customer_code: string;
  full_name: string;
  phone?: string;
  address?: string;
  email?: string;
  birthday?: string;
  image_url?: string;
  rank?: string;
  loyalty_points?: number;
  total_orders?: number;
  total_spent?: number;
  note?: string;
  account_username?: string;
};

const checkboxClass =
  "relative size-4 appearance-none rounded-[5px] border border-slate-300 bg-white transition-all checked:border-emerald-300 checked:bg-emerald-300 after:absolute after:left-1/2 after:top-1/2 after:hidden after:h-[9px] after:w-[5px] after:-translate-x-1/2 after:-translate-y-[58%] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:content-[''] checked:after:block";

const USER_ORDER_BLOCKED_COLUMN_IDS = new Set(["washer", "dryer"]);

type MyOrderRow = {
  id: string;
  customer: string;
  service: string;
  quantity: string;
  delivery_date: string;
  delivery_time: string;
  staff: string;
  amount: number;
  status: string;
  note: string;
  phone: string;
  address: string;
  created_at: string;
  customer_code?: string;
  appointment?: string;
  payment?: string;
  discount?: string;
  washer?: string;
  dryer?: string;
  customer_image_url?: string;
  service_unit?: string;
  unit_price?: string | number;
  original_amount?: string | number;
  discount_value?: string;
  discount_amount?: string | number;
  extra_fields?: Record<string, string | number>;
};

function normalizeOrderColumns(columns: DashboardTableColumn[]) {
  const sanitizedColumns = columns.filter((column) => column?.id && !USER_ORDER_BLOCKED_COLUMN_IDS.has(column.id));
  let customCols: DashboardTableColumn[] = [];
  if (typeof window !== "undefined") {
    try {
      const saved = JSON.parse(localStorage.getItem("home_orders_columns") || "[]");
      if (Array.isArray(saved)) {
        const defaultIds = new Set(defaultColumns.map(c => c.id));
        customCols = saved.filter((c: any) => c && c.id && !defaultIds.has(c.id) && !USER_ORDER_BLOCKED_COLUMN_IDS.has(c.id));
      }
    } catch {}
  }

  const existingIds = new Set(sanitizedColumns.map((column) => column.id));
  const defaultColumnById = new Map(defaultColumns.map((column) => [column.id, column]));
  const next = sanitizedColumns.map((column) => ({
    ...column,
    label: defaultColumnById.get(column.id)?.label || column.label,
  }));

  customCols.forEach((column) => {
    if (existingIds.has(column.id)) return;
    const noteIndex = next.findIndex((item) => item.id === "note");
    const actionIndex = next.findIndex((item) => item.id === "actions");
    const insertIndex = noteIndex !== -1 ? noteIndex : actionIndex !== -1 ? actionIndex : next.length;
    next.splice(insertIndex === -1 ? next.length : insertIndex, 0, column);
    existingIds.add(column.id);
  });

  defaultColumns
    .filter((column) => !USER_ORDER_BLOCKED_COLUMN_IDS.has(column.id))
    .forEach((column) => {
    if (existingIds.has(column.id)) return;
    const noteIndex = next.findIndex((item) => item.id === "note");
    const actionIndex = next.findIndex((item) => item.id === "actions");
    const insertIndex = column.id === "note"
      ? actionIndex
      : noteIndex !== -1 ? noteIndex : actionIndex !== -1 ? actionIndex : next.length;
    next.splice(insertIndex === -1 ? next.length : insertIndex, 0, column);
  });

  const unitPriceIndex = next.findIndex((column) => column.id === "unitPrice");
  const quantityIndex = next.findIndex((column) => column.id === "quantity");
  if (unitPriceIndex !== -1 && quantityIndex !== -1 && unitPriceIndex !== quantityIndex + 1) {
    const [unitPriceColumn] = next.splice(unitPriceIndex, 1);
    const updatedQuantityIndex = next.findIndex((column) => column.id === "quantity");
    next.splice(updatedQuantityIndex + 1, 0, unitPriceColumn);
  }
  return next;
}

function parseOrderDate(dateStr: string) {
  if (!dateStr) return new Date();
  if (dateStr.includes("-")) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day);
}

type UserOrderStatus =
  | "Tiếp nhận"
  | "Đã xác nhận lịch"
  | "Đang giặt"
  | "Kiểm tra"
  | "Chờ thanh toán"
  | "Hoàn thành";

function normalizeStatus(status?: string, deliveryDate?: string): UserOrderStatus {
  const rawStatus = String(status || "").trim();
  return mapHomeOrderStatus(rawStatus) as UserOrderStatus;
}

function mapMyOrder(row: MyOrderRow): Order {
  return {
    ...(row.extra_fields || {}),
    id: row.id,
    customer: row.customer,
    service: row.service,
    quantity: row.quantity,
    deliveryDate: row.delivery_date || "",
    deliveryTime: row.delivery_time || "",
    staff: row.staff,
    amount: Number(row.amount || 0),
    status: normalizeStatus(row.status, row.delivery_date) as any,
    rawStatus: row.status,
    note: row.note || "",
    phone: row.phone || "",
    address: row.address || "",
    createdAt: row.created_at || "",
    customerCode: row.customer_code || "",
    appointment: row.appointment || "",
    payment: row.payment || "-",
    discount: row.discount || "",
    washer: row.washer || "-",
    dryer: row.dryer || "-",
    customerImageUrl: row.customer_image_url || "",
    serviceUnit: row.service_unit || "",
    unitPrice: Number(row.unit_price || 0),
    originalAmount: Number(row.original_amount || 0),
    discountValue: row.discount_value || "",
    discountAmount: Number(row.discount_amount || 0),
  };
}

const statusStyle: Record<string, { color: string; bg: string; tone: OrderTone }> = {
  "Tiếp nhận": { color: "#6366f1", bg: "rgba(99,102,241,0.08)", tone: "default" },
  "Đã xác nhận lịch": { color: "#3b82f6", bg: "rgba(59,130,246,0.08)", tone: "default" },
  "Đang giặt": { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", tone: "warning" },
  "Kiểm tra": { color: "#8b5cf6", bg: "rgba(139,92,246,0.08)", tone: "default" },
  "Chờ thanh toán": { color: "#ef4444", bg: "rgba(239,68,68,0.08)", tone: "danger" },
  "Hoàn thành": { color: "#10b981", bg: "rgba(16,185,129,0.08)", tone: "success" },
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

const statuses: UserOrderStatus[] = ["Tiếp nhận", "Đã xác nhận lịch", "Đang giặt", "Kiểm tra", "Chờ thanh toán", "Hoàn thành"];

const statusDotColor: Record<string, string> = {
  "Tiếp nhận": "#6366f1",
  "Đã xác nhận lịch": "#3b82f6",
  "Đang giặt": "#f59e0b",
  "Kiểm tra": "#8b5cf6",
  "Chờ thanh toán": "#ef4444",
  "Hoàn thành": "#10b981",
};

const statusBgColor: Record<string, string> = {
  "Tiếp nhận": "rgba(99,102,241,0.08)",
  "Đã xác nhận lịch": "rgba(59,130,246,0.08)",
  "Đang giặt": "rgba(245,158,11,0.08)",
  "Kiểm tra": "rgba(139,92,246,0.08)",
  "Chờ thanh toán": "rgba(239,68,68,0.08)",
  "Hoàn thành": "rgba(16,185,129,0.08)",
};

const getStatusTime = (
  order: Order,
  statusIndex: number,
  isCurrentStatus: boolean,
) => {
  const baseDate = parseOrderDate(order.createdAt);
  if (Number.isNaN(baseDate.getTime()))
    return "Chưa cập nhật";

  const minuteOffsets = [50, 54, 57, 60, 64, 68];
  const minuteValue = minuteOffsets[statusIndex] ?? (68 + Math.max(statusIndex - 5, 0) * 4);
  baseDate.setHours(0, minuteValue, 0, 0);

  const time = baseDate.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const date = baseDate.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return `${time} ${date}`;
};




function numericTotal(order: Order) {
  return order.amount;
}

function parseQuantityValue(quantity?: string | number) {
  if (typeof quantity === "number") return quantity;
  const normalized = String(quantity || "")
    .replace(",", ".")
    .match(/-?\d+(\.\d+)?/);
  return normalized ? Number(normalized[0]) : 0;
}

function formatOrderQuantity(order: Pick<Order, "quantity" | "serviceUnit">) {
  if (!order.quantity) return "-";
  return order.serviceUnit ? `${order.quantity} ${order.serviceUnit}` : String(order.quantity);
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

export default function UserOrdersPage() {
  const router = useRouter();
  const range = useDashboardTimeRangeStore((state) => state.range);
  const rangeLabel = formatRange(normalizeRange(range));

  const [columns, setColumns] = useState<DashboardTableColumn[]>(() => {
    if (typeof window === "undefined") return defaultColumns;
    try {
      return normalizeOrderColumns(JSON.parse(localStorage.getItem("home_orders_columns") || localStorage.getItem("user_orders_columns") || "") || defaultColumns);
    } catch {
      return defaultColumns;
    }
  });
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [tableResizeMode, setTableResizeMode] = useState<"fit" | "custom">("fit");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [customPageSize, setCustomPageSize] = useState("");
  const [openPageSizeMenu, setOpenPageSizeMenu] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [deleteOrderCode, setDeleteOrderCode] = useState<string | null>(null);
  const [purgeOrderId, setPurgeOrderId] = useState<string | null>(null);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reorderOpen, setReorderOpen] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [activeHistoryOrderId, setActiveHistoryOrderId] = useState<string | null>(null);

  const [openAddColumn, setOpenAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [isLayoutLoaded, setIsLayoutLoaded] = useState(false);
  const accountColumnsConfigRef = useRef<Record<string, unknown>>({});
  useEffect(() => {
    let alive = true;
    const loadOrders = () => homeApi<MyOrderRow[]>("/my-orders", { cache: "no-store" });
    loadOrders()
      .then((rows) => {
        if (alive) setOrderList(rows.map(mapMyOrder));
      })
      .catch(() => {
        if (alive) setOrderList([]);
      });
    const handleChanged = () => {
      void loadOrders()
        .then((rows) => {
          if (alive) setOrderList(rows.map(mapMyOrder));
        })
        .catch(() => undefined);
    };
    window.addEventListener("home-orders-changed", handleChanged);
    return () => {
      alive = false;
      window.removeEventListener("home-orders-changed", handleChanged);
    };
  }, []);

  useEffect(() => {
    let alive = true;
    homeApi<CustomerProfile>("/my-customer", { cache: "no-store" })
      .then((profile) => {
        if (alive) setCustomerProfile(profile);
      })
      .catch(() => {
        if (alive) setCustomerProfile(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLayoutLoaded(true);
      return;
    }
    fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((data) => {
        if (!data?.columns_config) return;
        const parsed = JSON.parse(data.columns_config) as Record<string, unknown>;
        accountColumnsConfigRef.current = parsed;
        const layout = (parsed.userOrdersLayout || {}) as {
          columns?: DashboardTableColumn[];
          tableResizeMode?: "fit" | "custom";
          pageSize?: number;
        };
        if (layout.columns) setColumns(normalizeOrderColumns(layout.columns));
        if (layout.tableResizeMode) setTableResizeMode(layout.tableResizeMode);
        if (layout.pageSize) setPageSize(layout.pageSize);
      })
      .catch(() => undefined)
      .finally(() => setIsLayoutLoaded(true));
  }, []);

  useEffect(() => {
    localStorage.setItem("user_orders_columns", JSON.stringify(columns));
    if (!isLayoutLoaded) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    const timeoutId = window.setTimeout(() => {
      const nextConfig = {
        ...accountColumnsConfigRef.current,
        userOrdersLayout: { columns, tableResizeMode, pageSize },
      };
      accountColumnsConfigRef.current = nextConfig;
      fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ columns_config: JSON.stringify(nextConfig) }),
      }).catch((error) => console.error("Error saving user orders layout:", error));
    }, 250);
    return () => window.clearTimeout(timeoutId);
  }, [columns, isLayoutLoaded, pageSize, tableResizeMode]);

  /* Column drag */
  const handleDragStart = (e: React.DragEvent<HTMLTableCellElement>, id: string) => {
    setDraggedColumnId(id);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e: React.DragEvent<HTMLTableCellElement>, id: string) => {
    e.preventDefault();
    if (id !== draggedColumnId) setDragOverColumnId(id);
  };
  const handleDragLeave = () => setDragOverColumnId(null);
  const handleDrop = (e: React.DragEvent<HTMLTableCellElement>, id: string) => {
    e.preventDefault();
    if (!draggedColumnId || draggedColumnId === id) {
      setDragOverColumnId(null);
      return;
    }
    setColumns((prev) => {
      const draggedIdx = prev.findIndex((c) => c.id === draggedColumnId);
      const dropIdx = prev.findIndex((c) => c.id === id);
      if (draggedIdx === -1 || dropIdx === -1) return prev;
      const newCols = [...prev];
      const [draggedColumn] = newCols.splice(draggedIdx, 1);
      newCols.splice(dropIdx, 0, draggedColumn);
      return newCols;
    });
    setDraggedColumnId(null);
    setDragOverColumnId(null);
  };
  const handleDragEnd = () => {
    setDraggedColumnId(null);
    setDragOverColumnId(null);
  };

  const addCustomColumn = () => {
    const label = newColumnName.trim();
    if (!label) return;
    const newColumn: DashboardTableColumn = { id: `custom_${Date.now()}`, label, width: 150, visible: true };
    setColumns((prev) => {
      const next = [...prev];
      const noteIndex = next.findIndex((c) => c.id === "note");
      const actionIndex = next.findIndex((c) => c.id === "actions");
      next.splice(noteIndex !== -1 ? noteIndex : actionIndex === -1 ? next.length : actionIndex, 0, newColumn);
      return next;
    });
    setNewColumnName("");
    setOpenAddColumn(false);
  };

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
  const completedOrders = filteredOrders.filter((order) => order.rawStatus === "Hoàn thành").length;
  const inProgressOrders = filteredOrders.filter((order) => order.rawStatus !== "Hoàn thành" && order.rawStatus !== "Đã hủy").length;
  const totalSpent = filteredOrders.reduce((sum, order) => sum + numericTotal(order), 0);
  const latestOrder = orderList.find((order) => order.rawStatus !== "Đã hủy");
  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const paginatedOrders = filteredOrders.slice((safePage - 1) * pageSize, safePage * pageSize);
  const visibleIds = paginatedOrders.map((order) => order.id);
  const filteredIds = filteredOrders.map((order) => order.id);
  const selectedFilteredCount = filteredIds.filter((id) => selectedIds.has(id)).length;
  const allFilteredSelected = filteredIds.length > 0 && selectedFilteredCount === filteredIds.length;
  const totalVisibleWidth = columns.filter((column) => column.visible !== false).reduce((sum, column) => sum + (column.width || 150), 0);
  const selectedOrders = filteredOrders.filter((order) => selectedIds.has(order.id));
  const historyOrders = selectedOrders.length > 0 ? selectedOrders : filteredOrders;
  const activeHistoryOrder = historyOrders.find((order) => order.id === activeHistoryOrderId) || historyOrders[0] || null;

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
      if (allFilteredSelected) filteredIds.forEach((id) => next.delete(id));
      else filteredIds.forEach((id) => next.add(id));
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
  };

  const handleCancelOrder = async () => {
    if (!deleteOrderCode) return;
    try {
      await homeApi(`/orders/${deleteOrderCode}`, {
        method: "PUT",
        body: JSON.stringify({ status: "Đã hủy" }),
      });
      setOrderList((prev) => prev.filter((order) => order.id !== deleteOrderCode));
      toast.success(`Đã hủy đơn hàng ${deleteOrderCode} thành công.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể hủy đơn hàng.");
    } finally {
      setDeleteOrderCode(null);
    }
  };

  const handlePurgeOrder = async () => {
    if (!purgeOrderId) return;
    try {
      await homeApi(`/orders/${purgeOrderId}`, {
        method: "DELETE",
      });
      setOrderList((prev) => prev.filter((order) => order.id !== purgeOrderId));
      toast.success(`Đã xóa dữ liệu đơn hàng ${purgeOrderId} thành công.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xóa đơn hàng.");
    } finally {
      setPurgeOrderId(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const formatCurrency = (value?: number) => {
    return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
  };

  const renderCell = (order: Order, column: DashboardTableColumn) => {
    if (column.id === "id") {
      return (
        <TableCell key={column.id} className="pl-4 font-semibold text-slate-900 truncate overflow-hidden max-w-0" title={order.id}>
          <div className="flex items-center gap-2">
            <input
              checked={selectedIds.has(order.id)}
              onChange={() => toggleOrder(order.id)}
              type="checkbox"
              className={checkboxClass}
              aria-label={`Chọn ${order.id}`}
            />
            <span className="truncate">{order.id}</span>
          </div>
        </TableCell>
      );
    }
    if (column.id === "customerCode") {
      return (
        <TableCell key={column.id} className="font-medium text-slate-700">
          {order.customerCode || "-"}
        </TableCell>
      );
    }
    if (column.id === "customer") {
      const profileData = customerProfile || {
        customer_id: order.customerCode || order.id,
        customer_code: order.customerCode || "-",
        full_name: order.customer || "-",
        phone: order.phone || "-",
        address: order.address || "-",
        image_url: order.customerImageUrl || "",
        total_orders: orderList.filter((item) => item.customerCode === order.customerCode).length,
        total_spent: orderList
          .filter((item) => item.customerCode === order.customerCode)
          .reduce((sum, item) => sum + numericTotal(item), 0),
      };
      return (
        <TableCell key={column.id} className="truncate overflow-hidden max-w-0" title={order.customer}>
          <button
            type="button"
            className="flex min-w-0 items-center gap-2 text-left"
            onClick={() => {
              setCustomerProfile(profileData);
              setProfileOpen(true);
            }}
          >
            <AccountAvatar
              name={order.customer}
              imageUrl={customerProfile?.image_url || order.customerImageUrl}
              size={24}
              className="shrink-0 after:border-slate-200"
            />
            <span className="truncate font-semibold text-slate-800 hover:text-slate-950">{order.customer}</span>
          </button>
        </TableCell>
      );
    }
    if (column.id === "phone") {
      return (
        <TableCell key={column.id} className="truncate overflow-hidden max-w-0" title={order.phone || "-"}>
          {order.phone ? <a href={`tel:${order.phone}`} className="text-slate-500 transition-colors hover:text-slate-800">{order.phone}</a> : <span className="text-slate-400 italic">-</span>}
        </TableCell>
      );
    }
    if (column.id === "service") {
      return (
        <TableCell key={column.id} className="truncate overflow-hidden max-w-0 text-slate-500" title={order.service || "-"}>
          {order.service || "-"}
        </TableCell>
      );
    }
    if (column.id === "quantity") {
      return (
        <TableCell key={column.id} className="truncate overflow-hidden max-w-0 text-slate-500" title={formatOrderQuantity(order)}>
          {formatOrderQuantity(order)}
        </TableCell>
      );
    }
    if (column.id === "staff") {
      return (
        <TableCell key={column.id} className="truncate overflow-hidden max-w-0" title={order.staff}>
          <span className={`truncate font-medium ${order.staff === "Chưa gán" ? "text-slate-400" : "text-slate-700"}`}>{order.staff}</span>
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
        <TableCell key={column.id} className="font-semibold text-slate-900 truncate overflow-hidden max-w-0" title={formatCurrency(order.amount)}>
          {formatCurrency(order.amount)}
        </TableCell>
      );
    }
    if (column.id === "originalAmount") {
      const value = Number(order.originalAmount || order.amount || 0);
      return (
        <TableCell key={column.id} className="truncate overflow-hidden max-w-0 text-slate-500" title={formatCurrency(value)}>
          {formatCurrency(value)}
        </TableCell>
      );
    }
    if (column.id === "unitPrice") {
      return (
        <TableCell key={column.id} className="truncate overflow-hidden max-w-0 text-slate-500" title={formatCurrency(Number(order.unitPrice || 0))}>
          {formatCurrency(Number(order.unitPrice || 0))}
        </TableCell>
      );
    }
    if (column.id === "discountValue") {
      const value = String(order.discountValue || "");
      return (
        <TableCell key={column.id} className="truncate overflow-hidden max-w-0 text-slate-500" title={value || "-"}>
          {value || "-"}
        </TableCell>
      );
    }
    if (column.id === "discount") {
      return (
        <TableCell key={column.id} className="truncate overflow-hidden max-w-0 text-slate-500" title={String(order.discount || "-")}>
          {order.discount || "-"}
        </TableCell>
      );
    }
    if (column.id === "deliveryDate" || column.id === "createdAt") {
      const val = order[column.id as keyof Order];
      return (
        <TableCell key={column.id} className="text-slate-500 truncate overflow-hidden max-w-0" title={formatDate(String(val || ""))}>
          {formatDate(String(val || ""))}
        </TableCell>
      );
    }
    if (column.id === "deliveryTime") {
      return (
        <TableCell key={column.id} className="text-slate-500 truncate overflow-hidden max-w-0" title={String(order.deliveryTime || "-")}>
          {order.deliveryTime || "-"}
        </TableCell>
      );
    }
    if (column.id === "actions") {
      const canInvoice = order.status === "Chờ thanh toán";
      const canDelete = order.status === "Hoàn thành";
      const invoiceDisabled = parseQuantityValue(order.quantity) <= 0;

      return (
        <TableCell key={column.id} className="px-4" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-center gap-1.5">
            <button type="button" className="inline-flex h-7 items-center rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 hover:bg-slate-50" onClick={() => openOrderDetail(order)}>
              Xem
            </button>
            {canInvoice ? (
              <button
                type="button"
                className="inline-flex h-7 items-center rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                onClick={() => setInvoiceOrder(order)}
                disabled={invoiceDisabled}
                title={invoiceDisabled ? "Đơn chưa có số lượng để mở hóa đơn" : "Xem hóa đơn"}
              >
                Hóa đơn
              </button>
            ) : canDelete ? (
              <button type="button" className="inline-flex h-7 items-center rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 hover:bg-red-50 hover:text-red-600" onClick={() => setPurgeOrderId(order.id)} title="Xóa dữ liệu">
                Xóa
              </button>
            ) : null}
          </div>
        </TableCell>
      );
    }

    const val = order[column.id as keyof Order];
    const hasValue = val !== undefined && val !== null && val !== "";
    const displayValue = hasValue ? String(val) : "-";
    return (
      <TableCell key={column.id} className={`truncate overflow-hidden max-w-0 ${!hasValue ? "text-slate-400 italic" : "text-slate-600 font-medium"}`} title={displayValue}>
        {displayValue}
      </TableCell>
    );
  };

  const formValues = useMemo(() => {
    if (!selectedOrder) return {};
    return {
      customerCode: selectedOrder.customerCode || "",
      customer: selectedOrder.customer || "",
      phone: selectedOrder.phone || "",
      address: selectedOrder.address || "",
      service: selectedOrder.serviceCode ? `${selectedOrder.serviceCode} · ${selectedOrder.service}` : selectedOrder.service,
      serviceUnit: selectedOrder.serviceUnit || "",
      quantity: formatOrderQuantity(selectedOrder),
      unitPrice: String(selectedOrder.unitPrice || "0"),
      originalAmount: String(selectedOrder.originalAmount || "0"),
      washer: selectedOrder.washer || "",
      dryer: selectedOrder.dryer || "",
      deliveryDate: selectedOrder.deliveryDate || "",
      deliveryTime: selectedOrder.deliveryTime || "",
      createdAt: selectedOrder.createdAt || "",
      staff: selectedOrder.staff || "Chưa gán",
      amount: String(selectedOrder.amount || "0"),
      status: selectedOrder.status || "",
      payment: selectedOrder.payment || "Tiền mặt",
      discount: selectedOrder.discount || "",
      discountValue: selectedOrder.discountValue || "",
      note: selectedOrder.note || "",
      ...Object.fromEntries(
        columns
          .filter(c => !defaultColumns.some(dc => dc.id === c.id))
          .map(c => [c.id, String(selectedOrder[c.id] ?? "")])
      )
    };
  }, [selectedOrder, columns]);

  const userOrderFields = useMemo(() => {
    if (!selectedOrder) return [];

    const fieldByColumnId: Record<string, FormField> = {
      customerCode: { id: "customerCode", label: "Mã khách hàng", type: "text", readOnly: true },
      customer: { id: "customer", label: "Tên khách hàng", type: "text", readOnly: true },
      phone: { id: "phone", label: "Số điện thoại", type: "text", readOnly: true },
      address: { id: "address", label: "Địa chỉ", type: "text", readOnly: true },
      service: { id: "service", label: "Dịch vụ", type: "text", readOnly: true },
      serviceUnit: { id: "serviceUnit", label: "Đơn vị", type: "text", readOnly: true },
      quantity: { id: "quantity", label: "Số lượng", type: "text", readOnly: true },
      unitPrice: { id: "unitPrice", label: "Đơn giá", type: "number", readOnly: true },
      originalAmount: { id: "originalAmount", label: "Giá gốc", type: "number", readOnly: true },
      washer: { id: "washer", label: "Máy giặt", type: "text", readOnly: true },
      dryer: { id: "dryer", label: "Máy sấy", type: "text", readOnly: true },
      deliveryDate: { id: "deliveryDate", label: "Ngày giao", type: "text", readOnly: true },
      deliveryTime: { id: "deliveryTime", label: "Giờ giao", type: "text", readOnly: true },
      createdAt: { id: "createdAt", label: "Ngày tạo đơn", type: "text", readOnly: true },
      staff: { id: "staff", label: "Nhân viên xử lý", type: "custom_staff", readOnly: true },
      amount: { id: "amount", label: "Thành tiền", type: "number", readOnly: true },
      status: { id: "status", label: "Cập nhật trạng thái", type: "custom_status", readOnly: true },
      payment: { id: "payment", label: "Thanh toán", type: "text", readOnly: true },
      discount: { id: "discount", label: "Mã giảm giá", type: "text", readOnly: true },
      discountValue: { id: "discountValue", label: "Giá trị ưu đãi", type: "text", readOnly: true },
      note: { id: "note", label: "Ghi chú", type: "textarea", readOnly: true },
    };

    const requiredFieldOrder = ["customerCode", "service"];
    const columnById = new Map(columns.map((column) => [column.id, column]));
    const sortedColumns = [
      ...requiredFieldOrder.map((id) => columnById.get(id) || defaultColumns.find((column) => column.id === id)),
      ...columns.filter(
        (column) =>
          column.id !== "id"
          && column.id !== "actions"
          && !requiredFieldOrder.includes(column.id)
      ),
    ].filter((column): column is DashboardTableColumn => Boolean(column));

    const noteIndex = sortedColumns.findIndex((column) => column.id === "note");
    if (noteIndex !== -1) {
      const [noteColumn] = sortedColumns.splice(noteIndex, 1);
      sortedColumns.push(noteColumn);
    }

    const fields = sortedColumns.map((column) =>
      fieldByColumnId[column.id] || {
        id: column.id,
        label: column.label,
        type: "text" as const,
        readOnly: true,
      }
    );

    const discountValueIndex = fields.findIndex((field) => field.id === "discountValue");
    if (!selectedOrder.discountValue && discountValueIndex !== -1) {
      fields.splice(discountValueIndex, 1);
    }
    return fields;
  }, [selectedOrder, columns]);

  return (
    <PageShell fullHeight>
      <div className="grid shrink-0 gap-3 md:grid-cols-4">
        <MetricCard
          title="Đơn gần nhất"
          value={latestOrder ? latestOrder.id : "--"}
          hint={latestOrder ? latestOrder.createdAt : "Chưa có đơn"}
          icon={ReceiptText}
          color={latestOrder ? (statusStyle[latestOrder.status]?.color || "#06b6d4") : "#06b6d4"}
        />
        <MetricCard
          title="Đang xử lý"
          value={String(inProgressOrders)}
          hint="Đang giặt hoặc chờ xử lý"
          icon={RotateCcw}
          color="#f59e0b"
        />
        <MetricCard
          title="Đã hoàn tất"
          value={String(completedOrders)}
          hint="Không có khiếu nại"
          icon={PackageCheck}
          color="#10b981"
        />
        <MetricCard
          title="Tổng chi tiêu"
          value={totalSpent.toLocaleString("vi-VN") + "đ"}
          hint="Tổng tích lũy"
          icon={Star}
          color="#3b82f6"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
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
              onOpenAddColumn={() => setOpenAddColumn(true)}
              onOpenHistory={() => {
                setActiveHistoryOrderId((selectedOrders[0] || filteredOrders[0])?.id || null);
                setOpenHistory(true);
              }}
              onExport={(format, fileName) => {
                exportOrders(format, fileName, columns, selectedOrders.length > 0 ? selectedOrders : filteredOrders);
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
              allSelected={allFilteredSelected}
              disabled={filteredIds.length === 0}
              selectedCount={selectedFilteredCount}
              totalCount={filteredIds.length}
              itemLabel="đơn"
              checkboxClass={checkboxClass}
              onToggleAll={toggleAll}
            />
            {filteredOrders.length === 0 ? (
              <div className="flex flex-1 items-center justify-center p-8 text-center">
                <p className="text-sm text-slate-400">Không tìm thấy đơn hàng phù hợp.</p>
              </div>
            ) : (
              <TableView
                columns={columns}
                rows={paginatedOrders}
                pageSize={pageSize}
                emptyMessage="Không tìm thấy đơn hàng phù hợp."
                tableResizeMode={tableResizeMode}
                totalVisibleWidth={totalVisibleWidth}
                renderCell={renderCell}
                columnDrag={{
                  draggedColumnId,
                  dragOverColumnId,
                  onDragStart: handleDragStart,
                  onDragOver: handleDragOver,
                  onDragLeave: handleDragLeave,
                  onDrop: handleDrop,
                  onDragEnd: handleDragEnd,
                }}
                onColumnsChange={setColumns}
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
            )}
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

      <InvoiceModal
        order={invoiceOrder as any}
        quantityDisplay={
          invoiceOrder
            ? invoiceOrder.serviceUnit
              ? `${invoiceOrder.quantity} ${invoiceOrder.serviceUnit}`
              : `${invoiceOrder.quantity} kg`
            : undefined
        }
        customerImageUrl={customerProfile?.image_url || invoiceOrder?.customerImageUrl || null}
        onClose={() => setInvoiceOrder(null)}
      />

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent
          showCloseButton={false}
          className="flex h-[min(86vh,680px)] w-[min(86vw,680px)] max-w-[min(86vw,680px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[680px]"
        >
          {customerProfile && (
            <>
              <DialogHeader className="border-b border-slate-200 px-6 py-3">
                <div className="flex items-center gap-3">
                  <AccountAvatar
                    name={customerProfile.full_name}
                    imageUrl={customerProfile.image_url || ""}
                    size={40}
                    className="shrink-0 after:border-slate-200"
                  />
                  <div className="min-w-0">
                    <DialogTitle className="truncate text-base font-semibold leading-6 text-slate-950">
                      {customerProfile.full_name}
                    </DialogTitle>
                    <p className="text-sm text-slate-500">Khách hàng · {customerProfile.customer_code}</p>
                    <p className="mt-1 text-xs text-slate-400">{customerProfile.rank || "Thường"}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="min-h-0 flex-1 p-5">
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    ["Họ tên", customerProfile.full_name],
                    ["Tên đăng nhập", customerProfile.account_username || "Chưa liên kết"],
                    ["Email", customerProfile.email || "-"],
                    ["Số điện thoại", customerProfile.phone || "-"],
                    ["Ngày sinh", customerProfile.birthday || "-"],
                    ["Điểm / hạng", `${Number(customerProfile.loyalty_points || 0).toLocaleString("vi-VN")} điểm · ${customerProfile.rank || "Thường"}`],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="space-y-2">
                      <Label>{String(label)}</Label>
                      <Input
                        value={String(value)}
                        disabled
                        className="h-8 rounded-lg border-input bg-slate-50 px-2.5 py-1 text-sm text-slate-500 shadow-none"
                      />
                    </div>
                  ))}
                  <div className="space-y-2 md:col-span-2">
                    <Label>Địa chỉ mặc định</Label>
                    <Input
                      value={customerProfile.address || "-"}
                      disabled
                      className="h-8 rounded-lg border-input bg-slate-50 px-2.5 py-1 text-sm text-slate-500 shadow-none"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Ghi chú</Label>
                    <Textarea
                      value={customerProfile.note || "-"}
                      disabled
                      className="h-16 min-h-16 resize-none rounded-lg border-input bg-slate-50 px-2.5 py-2 text-sm text-slate-500 shadow-none"
                    />
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-sm font-medium text-slate-950">Trạng thái tài khoản</p>
                  <div className="mt-3 grid gap-2 md:grid-cols-3">
                    {[
                      customerProfile.account_username ? "Đã liên kết" : "Chưa liên kết",
                      `${Number(customerProfile.total_orders || 0).toLocaleString("vi-VN")} đơn hàng`,
                      `${Number(customerProfile.total_spent || 0).toLocaleString("vi-VN")}đ chi tiêu`,
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex h-8 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="m-0 flex-row justify-end gap-2 border-t border-slate-200 bg-white px-6 py-3">
                <button
                  type="button"
                  className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-none hover:bg-slate-50 cursor-pointer"
                  onClick={() => setProfileOpen(false)}
                >
                  Đóng
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <FormDialog
        open={!!selectedOrder && !invoiceOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Chi tiết đơn ${selectedOrder?.id || ""}`}
        fields={userOrderFields}
        form={formValues}
        onFormChange={() => {}}
        statusOptions={statuses}
        statusDotColors={statusDotColor}
        showSaveButton={false}
        showCloseButton={false}
        showCloseButtonAtBottom={true}
        gridClassName="grid gap-4 md:grid-cols-2"
        extraAction={
          selectedOrder && selectedOrder.status === "Chờ thanh toán" && parseQuantityValue(selectedOrder.quantity) > 0 ? (
            <Button
              className="w-full justify-center bg-slate-900 text-center text-white hover:bg-slate-800 sm:w-auto text-xs h-9 font-semibold"
              onClick={() => setInvoiceOrder(selectedOrder)}
            >
              Xem hóa đơn
            </Button>
          ) : undefined
        }
      />

      <Dialog open={openHistory} onOpenChange={setOpenHistory}>
        <DialogContent
          showCloseButton={false}
          onOpenAutoFocus={(event) => event.preventDefault()}
          className="flex h-[min(86vh,680px)] w-[min(86vw,680px)] max-w-[min(86vw,680px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[680px]"
        >
          <DialogHeader className="min-h-[61px] flex-row items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
            <DialogTitle className="text-lg font-semibold leading-7 text-slate-950">
              Lịch sử đơn hàng
            </DialogTitle>
            <button
              type="button"
              aria-label="Đóng lịch sử đơn hàng"
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
              onClick={() => setOpenHistory(false)}
            >
              <X className="size-4" />
            </button>
          </DialogHeader>

          <div className={`grid min-h-0 flex-1 grid-cols-1 overflow-hidden ${historyOrders.length > 1 ? "md:grid-cols-[220px_1fr]" : ""}`}>
            {historyOrders.length > 1 && (
              <div className="min-h-0 border-b border-slate-200 bg-white py-3 md:border-b-0 md:border-r">
                <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Đơn hàng ({historyOrders.length})
                </p>
                <div className="h-[calc(100%-28px)] overflow-y-auto">
                  <div className="space-y-0.5 px-2 pt-1">
                    {historyOrders.map((order) => {
                      const isActive = order.id === activeHistoryOrder?.id;
                      return (
                        <button
                          key={order.id}
                          type="button"
                          className={`flex w-full cursor-pointer items-center rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50 ${isActive ? "bg-white ring-1 ring-slate-200" : ""}`}
                          onClick={() => setActiveHistoryOrderId(order.id)}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-sm font-medium text-slate-900">{order.id}</p>
                              <span
                                className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                                style={{ color: statusDotColor[order.status], backgroundColor: statusBgColor[order.status] }}
                              >
                                {order.status}
                              </span>
                            </div>
                            <p className="mt-0.5 truncate text-xs text-slate-500">{order.customer}</p>
                            <p className="mt-0.5 truncate text-[10px] text-slate-400">{order.service} · {formatOrderQuantity(order)}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="flex min-h-0 flex-col overflow-hidden">
              {activeHistoryOrder ? (
                <>
                  <div className="shrink-0 border-b border-slate-100 bg-white px-5 py-3.5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-900">
                          {activeHistoryOrder.id} · {activeHistoryOrder.customer}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {activeHistoryOrder.phone || "-"} · {activeHistoryOrder.address || "-"}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {activeHistoryOrder.service} · {formatOrderQuantity(activeHistoryOrder)} · {activeHistoryOrder.staff || "-"}
                        </p>
                      </div>
                      <span
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-200 px-2 py-0.5 text-xs font-medium"
                        style={{ color: statusDotColor[activeHistoryOrder.status], backgroundColor: statusBgColor[activeHistoryOrder.status] }}
                      >
                        <span className="size-1.5 rounded-full" style={{ backgroundColor: statusDotColor[activeHistoryOrder.status] }} />
                        {activeHistoryOrder.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 pb-5 pt-4">
                    <div className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-3">
                      <span className="text-xs text-slate-600">
                        Tiến trình xử lý:{" "}
                        <span className="font-semibold text-slate-900">
                          {statuses.indexOf(activeHistoryOrder.status) + 1}/{statuses.length} trạng thái
                        </span>
                      </span>
                    </div>
                    <div className="space-y-3">
                      {statuses.map((orderStatus) => {
                        const idx = statuses.indexOf(orderStatus);
                        const reached = idx <= statuses.indexOf(activeHistoryOrder.status);
                        const color = statusDotColor[orderStatus];
                        return (
                          <div key={orderStatus} className="min-h-[74px] rounded-xl border border-slate-200 bg-white px-4 py-4">
                            <div className="flex items-start gap-3">
                              <span
                                className="mt-1.5 size-2 shrink-0 rounded-full bg-slate-300"
                                style={reached ? { backgroundColor: color } : undefined}
                              />
                              <div className="min-w-0 flex-1">
                                <p className={`text-sm font-semibold ${reached ? "text-slate-800" : "text-slate-400"}`}>
                                  {orderStatus}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {reached ? getStatusTime(activeHistoryOrder, idx, orderStatus === activeHistoryOrder.status) : "Chưa cập nhật"}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
                  Chưa chọn đơn hàng.
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AddColumnDialog
        open={openAddColumn}
        onOpenChange={setOpenAddColumn}
        newColumnName={newColumnName}
        onNewColumnNameChange={setNewColumnName}
        onAddColumn={addCustomColumn}
      />
    </PageShell>
  );
}
