"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarCheck, CheckCircle2, Clock, Wallet, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import AccountAvatar from "@/src/components/common/account-avatar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageShell } from "@/src/app/home/_components/dashboard-primitives";
import { FilterBar, type FilterOption } from "@/src/app/home/_components/filter-bar";
import { MetricCard } from "@/src/app/home/_components/metric-card";
import { TableView } from "@/src/app/home/_components/table-view";
import { Toolbar } from "@/src/app/home/_components/toolbar";
import { DeleteConfirmDialog } from "@/src/components/common/delete-confirm-dialog";
import { GlobalOrderCreateDialog } from "@/src/components/common/global-order-create-dialog";
import type { DashboardTableColumn } from "@/src/components/common/dashboard-data-table";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import { formatRange, normalizeRange } from "@/src/utils/dashboard-time";
import { homeApi } from "@/src/lib/home-api";
import { API_BASE_URL } from "@/src/lib/config";

type UserOrderStatus =
  | "Chờ xử lý"
  | "Đã được duyệt"
  | "Không được duyệt"
  | "Quá hạn";

type MyOrderRow = {
  id: string;
  booking_code?: string;
  customer_code?: string;
  customer: string;
  service: string;
  quantity?: string;
  delivery_date?: string;
  delivery_time?: string;
  appointment?: string;
  amount: number;
  status: string;
  note?: string;
  phone?: string;
  address?: string;
  created_at?: string;
  payment?: string;
  discount?: string;
  service_unit?: string;
  unit_price?: string | number;
  original_amount?: string | number;
  discount_value?: string;
  discount_amount?: string | number;
  extra_fields?: Record<string, string | number>;
  reviewed_at?: string;
  updated_at?: string;
  order_id?: string;
  order_code?: string;
};

type UserOrder = {
  id: string;
  displayId?: string;
  customerCode: string;
  customer: string;
  phone: string;
  address: string;
  service: string;
  serviceUnit: string;
  unitPrice: number;
  originalAmount: number;
  amount: number;
  status: UserOrderStatus;
  rawStatus?: string;
  appointment: string;
  deliveryDate: string;
  deliveryTime: string;
  createdAt: string;
  payment: string;
  discount: string;
  discountValue: string;
  note: string;
  reviewedAt?: string;
  updatedAt?: string;
  orderId?: string;
  orderCode?: string;
  [key: string]: string | number | undefined;
};
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

const BOOKING_BLOCKED_COLUMN_IDS = new Set([
  "quantity",
  "washer",
  "dryer",
  "staff",
  "amount",
  "originalAmount",
  "payment",
  "unitPrice",
]);


const orderColumns: DashboardTableColumn[] = [
  { id: "id", label: "Mã đơn", width: 130, visible: true },
  { id: "customerCode", label: "Mã KH", width: 110, visible: true },
  { id: "customer", label: "Khách hàng", width: 180, visible: true },
  { id: "phone", label: "Số điện thoại", width: 120, visible: true },
  { id: "address", label: "Địa chỉ", width: 180, visible: false },
  { id: "service", label: "Dịch vụ", width: 130, visible: true },
  { id: "serviceUnit", label: "Đơn vị", width: 90, visible: true },
  { id: "deliveryDate", label: "Ngày giao", width: 110, visible: true },
  { id: "deliveryTime", label: "Giờ giao", width: 100, visible: true },
  { id: "status", label: "Trạng thái", width: 150, visible: true },
  { id: "createdAt", label: "Ngày tạo đơn", width: 120, visible: true },
  { id: "discount", label: "Mã giảm giá", width: 120, visible: true },
  { id: "discountValue", label: "Ưu đãi", width: 120, visible: true },
  { id: "note", label: "Ghi chú", width: 180, visible: true },
  { id: "actions", label: "Thao tác", width: 140, visible: true },
];


function normalizeOrderColumns(columns: DashboardTableColumn[]) {
  const sanitizedColumns = columns.filter((column) => column?.id && !BOOKING_BLOCKED_COLUMN_IDS.has(column.id));
  let customCols: DashboardTableColumn[] = [];
  if (typeof window !== "undefined") {
    try {
      const saved = JSON.parse(localStorage.getItem("user_bookings_columns") || localStorage.getItem("home_orders_columns") || "[]");
      if (Array.isArray(saved)) {
        const defaultIds = new Set(orderColumns.map(c => c.id));
        customCols = saved.filter((c: any) => c && c.id && !defaultIds.has(c.id) && !BOOKING_BLOCKED_COLUMN_IDS.has(c.id));
      }
    } catch {}
  }
  const existingIds = new Set(sanitizedColumns.map((column) => column.id));
  const defaultColumnById = new Map(orderColumns.map((column) => [column.id, column]));
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


  orderColumns.forEach((column) => {
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


const statusDotColor: Record<UserOrderStatus, string> = {
  "Chờ xử lý": "#f59e0b",
  "Đã được duyệt": "#10b981",
  "Không được duyệt": "#ef4444",
  "Quá hạn": "#64748b",
};


const statusBgColor: Record<UserOrderStatus, string> = {
  "Chờ xử lý": "rgba(245,158,11,0.08)",
  "Đã được duyệt": "rgba(16,185,129,0.08)",
  "Không được duyệt": "rgba(239,68,68,0.08)",
  "Quá hạn": "rgba(100,116,139,0.09)",
};


const statusOptions: FilterOption[] = [
  { id: "Tất cả", label: "Tất cả", color: "#64748b", bgColor: "rgba(100,116,139,0.09)" },
  ...Object.entries(statusDotColor).map(([status, color]) => ({
    id: status,
    label: status,
    color,
    bgColor: statusBgColor[status as UserOrderStatus],
  })),
];



const historyStatuses: UserOrderStatus[] = [
  "Chờ xử lý",
  "Đã được duyệt",
  "Không được duyệt",
  "Quá hạn",
];


function normalizeStatus(status?: string, deliveryDate?: string): UserOrderStatus {
  const rawStatus = String(status || "").trim();
  if (rawStatus === "Đã được duyệt") return "Đã được duyệt";
  if (rawStatus === "Không được duyệt") return "Không được duyệt";
  if (rawStatus === "Quá hạn") return "Quá hạn";
  const date = parseDate(deliveryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date.getTime() > 0 && date < today) return "Quá hạn";
  return "Chờ xử lý";
}
function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function parseDate(dateStr?: string) {
  if (!dateStr) return new Date(0);
  const date = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

function formatCurrency(value?: number) {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

function formatEmpty(value?: string | number) {
  if (value === undefined || value === null || value === "") return "-";
  return String(value);
}

function formatHistoryTimestamp(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return {
    time: date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    date: date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }),
  };
}

function mapMyOrder(row: MyOrderRow): UserOrder {
  const unitPrice = Number(row.unit_price || 0);
  const originalAmount = Number(row.original_amount || 0);
  return {
    ...(row.extra_fields || {}),
    id: row.id,
    displayId: row.booking_code || row.id,
    customerCode: row.customer_code || "-",
    customer: row.customer || "-",
    phone: row.phone || "-",
    address: row.address || "-",
    service: row.service || "-",
    serviceUnit: row.service_unit || "-",
    unitPrice,
    originalAmount,
    amount: Number(row.amount || 0),
    status: normalizeStatus(row.status, row.delivery_date),
    rawStatus: row.status,
    appointment: row.appointment || "-",
    deliveryDate: row.delivery_date || "",
    deliveryTime: row.delivery_time || "-",
    createdAt: row.created_at || "",
    payment: row.payment || "-",
    discount: row.discount || "-",
    discountValue: row.discount_value || "-",
    note: row.note || "-",
    reviewedAt: row.reviewed_at || "",
    updatedAt: row.updated_at || "",
    orderId: row.order_id || "",
    orderCode: row.order_code || "",
  };
}

function getBookingStatusTimestamp(order: UserOrder, status: UserOrderStatus) {
  if (status === "Chờ xử lý") return order.createdAt;
  if (status === "Đã được duyệt" && order.status === "Đã được duyệt") return order.reviewedAt || order.updatedAt || "";
  if (status === "Không được duyệt" && order.status === "Không được duyệt") return order.reviewedAt || order.updatedAt || "";
  if (status === "Quá hạn" && order.status === "Quá hạn") return order.updatedAt || order.deliveryDate || "";
  return "";
}

export default function UserBookingsPage() {
  const range = useDashboardTimeRangeStore((state) => state.range);
  const normalizedRange = normalizeRange(range);
  const rangeLabel = formatRange(normalizedRange);
  const [formOpen, setFormOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState<UserOrder | null>(null);
  const [cancelOrderTarget, setCancelOrderTarget] = useState<UserOrder | null>(null);
  const [deleteOrderTarget, setDeleteOrderTarget] = useState<UserOrder | null>(null);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<UserOrderStatus | "Tất cả">("Tất cả");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [columns, setColumns] = useState<DashboardTableColumn[]>(() => {
    if (typeof window === "undefined") return orderColumns;
    try {
      return normalizeOrderColumns(JSON.parse(localStorage.getItem("user_bookings_columns") || localStorage.getItem("home_orders_columns") || "") || orderColumns);
    } catch {
      return orderColumns;
    }
  });
  const [tableResizeMode, setTableResizeMode] = useState<"fit" | "custom">("fit");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [customPageSize, setCustomPageSize] = useState("");
  const [openPageSizeMenu, setOpenPageSizeMenu] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [activeHistoryOrderId, setActiveHistoryOrderId] = useState<string | null>(null);
  const [isLayoutLoaded, setIsLayoutLoaded] = useState(false);
  const accountColumnsConfigRef = useRef<Record<string, unknown>>({});

  const loadBookings = useMemo(
    () => () =>
      homeApi<MyOrderRow[]>("/my-bookings", { cache: "no-store" }).then((rows) => {
        setOrders(rows.map(mapMyOrder));
      }),
    [],
  );

  const ordersWithDisplayId = useMemo(() => {
    const sortedAsc = [...orders].sort((a, b) => {
      const t1 = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const t2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return t1 - t2;
    });

    return orders.map((order): UserOrder => ({
      ...order,
      displayId: order.displayId || `DL-${String(sortedAsc.findIndex((item) => item.id === order.id) + 1).padStart(4, "0")}`,
    }));
  }, [orders]);

  useEffect(() => {
    let alive = true;
    loadBookings()
      .then(() => {
        if (!alive) return;
      })
      .catch((error) => {
        if (!alive) return;
        setOrders([]);
        toast.error(error instanceof Error ? error.message : "Không tải được danh sách lịch đặt.");
      });
    const handleChanged = () => {
      void loadBookings().catch(() => undefined);
    };
    window.addEventListener("booking-requests-changed", handleChanged);
    return () => {
      alive = false;
      window.removeEventListener("booking-requests-changed", handleChanged);
    };
  }, [loadBookings]);

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
        const layout = (parsed.userBookingsLayout || {}) as {
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
    localStorage.setItem("user_bookings_columns", JSON.stringify(columns));
    if (!isLayoutLoaded) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    const timeoutId = window.setTimeout(() => {
      const nextConfig = {
        ...accountColumnsConfigRef.current,
        userBookingsLayout: { columns, tableResizeMode, pageSize },
      };
      accountColumnsConfigRef.current = nextConfig;
      fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ columns_config: JSON.stringify(nextConfig) }),
      }).catch((error) => console.error("Error saving user bookings layout:", error));
    }, 250);
    return () => window.clearTimeout(timeoutId);
  }, [columns, isLayoutLoaded, pageSize, tableResizeMode]);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return ordersWithDisplayId.filter((order) => {
      const source = [
        order.id,
        order.displayId || "",
        order.customerCode,
        order.customer,
        order.phone,
        order.address,
        order.service,
        order.status,
        order.note,
      ].join(" ").toLowerCase();
      const matchesQuery = !normalizedQuery || source.includes(normalizedQuery);
      const matchesStatus = selectedStatus === "Tất cả" || order.status === selectedStatus;
      const createdAt = parseDate(order.createdAt);
      const matchesRange = createdAt >= normalizedRange.start && createdAt <= normalizedRange.end;
      return matchesQuery && matchesStatus && matchesRange;
    });
  }, [normalizedRange.end, normalizedRange.start, ordersWithDisplayId, query, selectedStatus]);

  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const paginatedOrders = filteredOrders.slice((safePage - 1) * pageSize, safePage * pageSize);
  const visibleIds = paginatedOrders.map((order) => order.id);
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.has(id)).length;
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const totalVisibleWidth = columns.filter((column) => column.visible !== false).reduce((sum, column) => sum + (column.width || 150), 0);
  const selectedOrders = filteredOrders.filter((order) => selectedIds.has(order.id));
  const historyOrders = selectedOrders.length > 0 ? selectedOrders : filteredOrders;
  const activeHistoryOrder = historyOrders.find((order) => order.id === activeHistoryOrderId) || historyOrders[0] || null;
  const exportRows = selectedOrders.length > 0 ? selectedOrders : filteredOrders;
  const totalAmount = filteredOrders.reduce((sum, order) => sum + order.amount, 0);
  const nextOrder = filteredOrders.find((order) => !["Không được duyệt", "Quá hạn"].includes(order.status));
  const pendingCount = filteredOrders.filter((order) => order.status === "Chờ xử lý").length;
  const approvedCount = filteredOrders.filter((order) => order.status === "Đã được duyệt").length;

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

  const exportOrders = (format: "pdf" | "excel" | "csv", fileName: string) => {
    const exportColumns = columns.filter((column) => column.visible !== false && column.id !== "actions");
    const headers = exportColumns.map((column) => column.label);
    const values = exportRows.map((row) =>
      exportColumns.map((column) => {
        const value = column.id === "id" ? (row.displayId || row.id) : row[column.id as keyof UserOrder];
        if (["amount", "unitPrice", "originalAmount"].includes(column.id)) return formatCurrency(Number(value || 0));
        if (["deliveryDate", "createdAt"].includes(column.id)) return formatDate(String(value || ""));
        return formatEmpty(value);
      }),
    );

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

    toast.success(format === "excel" ? "Đã chuẩn bị Excel." : "Đã chuẩn bị bản in PDF.");
  };

  const cancelOrder = async () => {
    if (!cancelOrderTarget) return;
    try {
      await homeApi(`/booking-requests/${cancelOrderTarget.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "Không được duyệt" }),
      });
      setOrders((prev) => prev.map((order) => order.id === cancelOrderTarget.id ? { ...order, status: "Không được duyệt" } : order));
      window.dispatchEvent(new Event("booking-requests-changed"));
      toast.success(`Đã hủy lịch ${cancelOrderTarget.displayId || cancelOrderTarget.id}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể hủy lịch.");
    } finally {
      setCancelOrderTarget(null);
    }
  };

  const deleteOrder = async () => {
    if (!deleteOrderTarget) return;
    try {
      await homeApi(`/booking-requests/${deleteOrderTarget.id}`, {
        method: "DELETE",
      });
      setOrders((prev) => prev.filter((order) => order.id !== deleteOrderTarget.id));
      window.dispatchEvent(new Event("booking-requests-changed"));
      toast.success(`Đã xóa lịch ${deleteOrderTarget.displayId || deleteOrderTarget.id}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xóa lịch.");
    } finally {
      setDeleteOrderTarget(null);
    }
  };

  const renderCell = (order: UserOrder, column: DashboardTableColumn) => {
    if (column.id === "id") {
      return (
        <TableCell key={column.id} className="pl-4 font-semibold text-slate-900">
          <div className="flex items-center gap-2">
            <input
              checked={selectedIds.has(order.id)}
              onChange={() => toggleOrder(order.id)}
              type="checkbox"
              className={checkboxClass}
              aria-label={`Chọn ${order.id}`}
            />
            {order.displayId || order.id}
          </div>
        </TableCell>
      );
    }

    if (column.id === "customer") {
      return (
        <TableCell key={column.id}>
          <button type="button" className="flex min-w-0 items-center gap-2 text-left" onClick={() => setProfileOpen(true)}>
            <AccountAvatar
              name={order.customer}
              imageUrl={customerProfile?.image_url || ""}
              size={24}
              className="shrink-0 after:border-slate-200"
            />
            <span className="truncate font-semibold text-slate-800 hover:text-slate-950">{order.customer}</span>
          </button>
        </TableCell>
      );
    }

    if (column.id === "service") {
      return <TableCell key={column.id} className="text-slate-500">{order.service}</TableCell>;
    }

    if (column.id === "serviceUnit") {
      return <TableCell key={column.id} className="text-slate-500">{formatEmpty(order.serviceUnit)}</TableCell>;
    }

    if (column.id === "status") {
      const color = statusDotColor[order.status];
      return (
        <TableCell key={column.id}>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2 py-0.5 font-medium" style={{ color, backgroundColor: statusBgColor[order.status] }}>
            <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
            {order.status}
          </span>
        </TableCell>
      );
    }

    if (["amount", "unitPrice", "originalAmount"].includes(column.id)) {
      return <TableCell key={column.id} className="font-semibold text-slate-900">{formatCurrency(Number(order[column.id as keyof UserOrder] || 0))}</TableCell>;
    }

    if (column.id === "deliveryDate" || column.id === "createdAt") {
      return <TableCell key={column.id} className="text-slate-500">{formatDate(String(order[column.id as keyof UserOrder] || ""))}</TableCell>;
    }

    if (column.id === "deliveryTime") {
      return <TableCell key={column.id} className="text-slate-500">{formatEmpty(order[column.id as keyof UserOrder])}</TableCell>;
    }

    if (["phone", "discount", "discountValue"].includes(column.id)) {
      return <TableCell key={column.id} className="text-slate-500">{formatEmpty(order[column.id as keyof UserOrder])}</TableCell>;
    }

    if (column.id === "actions") {
      const canCancel = order.status === "Chờ xử lý";
      const canDelete = ["Đã được duyệt", "Không được duyệt", "Quá hạn"].includes(order.status);
      return (
        <TableCell key={column.id} className="px-4">
          <div className="flex items-center gap-1.5">
            <button type="button" className="inline-flex h-7 items-center rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50" onClick={() => setDetailOrder(order)}>
              Chi tiết
            </button>
            {canCancel && (
              <button type="button" className="inline-flex h-7 items-center rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600" onClick={() => setCancelOrderTarget(order)}>
                Hủy
              </button>
            )}
            {canDelete && (
              <button type="button" className="inline-flex h-7 items-center rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600" onClick={() => setDeleteOrderTarget(order)}>
                Xóa
              </button>
            )}
          </div>
        </TableCell>
      );
    }

    return <TableCell key={column.id} className="font-medium text-slate-700">{formatEmpty(order[column.id as keyof UserOrder])}</TableCell>;
  };

  return (
    <PageShell fullHeight>
      <div className="grid shrink-0 gap-3 md:grid-cols-4">
        <MetricCard
          title="Lịch sắp tới"
          value={nextOrder ? formatEmpty(nextOrder.deliveryTime) : "--"}
          hint={nextOrder ? formatDate(nextOrder.deliveryDate) : "Chưa có lịch"}
          icon={CalendarCheck}
          color="#06b6d4"
        />
        <MetricCard
          title="Chờ xác nhận"
          value={String(pendingCount)}
          hint="Đơn đang chờ tiệm xử lý"
          icon={Clock}
          color="#f59e0b"
        />
        <MetricCard
          title="Đã được duyệt"
          value={String(approvedCount)}
          hint="Lịch đã được xác nhận"
          icon={CheckCircle2}
          color="#10b981"
        />
        <MetricCard
          title="Tổng tạm tính"
          value={formatCurrency(totalAmount)}
          hint="Theo đơn trong kỳ"
          icon={Wallet}
          color="#3b82f6"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-white">
          <Toolbar
            leftContent={<div className="flex items-center gap-2"><h2 className="text-sm font-semibold text-slate-900">Bảng yêu cầu đặt lịch</h2><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">{filteredOrders.length}</span></div>}
            query={query}
            onQueryChange={(value) => { setQuery(value); setPage(1); }}
            columns={columns}
            onColumnsChange={setColumns}
            tableResizeMode={tableResizeMode}
            onTableResizeModeChange={setTableResizeMode}
            selectedCount={selectedIds.size}
            onOpenAddColumn={() => toast.info("Bảng đặt lịch dùng bộ cột đồng bộ với đơn hàng.")}
            onOpenHistory={() => {
              setActiveHistoryOrderId((selectedOrders[0] || filteredOrders[0])?.id ?? null);
              setOpenHistory(true);
            }}
            onExport={exportOrders}
            defaultExportFileName={`dat-lich-${new Date().toISOString().slice(0, 10)}`}
            onCreateClick={() => setFormOpen(true)}
            createLabel="Tạo lịch"
            defaultColumnIds={orderColumns.map((column) => column.id)}
            searchPlaceholder="Tìm mã đơn, khách, SĐT, dịch vụ..."
            showHistoryButton={true}
            showAddColumnButton={false}
          />
          <FilterBar
            rangeLabel={rangeLabel}
            selectedValue={selectedStatus}
            onValueChange={(value) => { setSelectedStatus(value as UserOrderStatus | "Tất cả"); setPage(1); }}
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
          {filteredOrders.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-8 text-center">
              <p className="text-sm text-slate-400">Chưa có yêu cầu đặt lịch</p>
            </div>
          ) : (
            <TableView
              columns={columns}
              rows={paginatedOrders}
              pageSize={pageSize}
              emptyMessage="Bạn chưa có yêu cầu đặt lịch nào."
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
          )}
        </div>
      </div>

      <GlobalOrderCreateDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        hiddenFieldIds={[
          "customerCode",
          "washer",
          "dryer",
          "quantity",
          "staff",
          "status",
          "consumption_*",
        ]}
        autoCustomerFromAccount
        defaultStatus="Chờ xử lý"
        submitPath="/booking-requests"
        dialogTitle="Tạo lịch đặt mới"
        successMessage="Đã gửi yêu cầu đặt lịch."
      />

      <Dialog open={openHistory} onOpenChange={setOpenHistory}>
        <DialogContent
          showCloseButton={false}
          onOpenAutoFocus={(event) => event.preventDefault()}
          className="flex h-[min(86vh,680px)] w-[min(86vw,680px)] max-w-[min(86vw,680px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[680px]"
        >
          <DialogHeader className="min-h-[61px] flex-row items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
            <DialogTitle className="text-lg font-semibold leading-7 text-slate-950">Lịch sử đặt lịch</DialogTitle>
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
                  Yêu cầu ({historyOrders.length})
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
                              <p className="truncate text-sm font-medium text-slate-900">{order.displayId || order.id}</p>
                              <span className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium" style={{ color: statusDotColor[order.status], backgroundColor: statusBgColor[order.status] }}>
                                {order.status}
                              </span>
                            </div>
                            <p className="mt-0.5 truncate text-xs text-slate-500">{order.customer}</p>
                            <p className="mt-0.5 truncate text-[10px] text-slate-400">{order.service} · {order.serviceUnit}</p>
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
                          {activeHistoryOrder.displayId || activeHistoryOrder.id} · {activeHistoryOrder.customer}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {activeHistoryOrder.phone || "-"} · {activeHistoryOrder.address || "-"}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {activeHistoryOrder.service} · {activeHistoryOrder.serviceUnit}
                        </p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-200 px-2 py-0.5 text-xs font-medium" style={{ color: statusDotColor[activeHistoryOrder.status], backgroundColor: statusBgColor[activeHistoryOrder.status] }}>
                        <span className="size-1.5 rounded-full" style={{ backgroundColor: statusDotColor[activeHistoryOrder.status] }} />
                        {activeHistoryOrder.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5">
                    <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
                      <span className="text-xs text-slate-600">
                        Tiến trình xử lý:{" "}
                        <span className="font-semibold text-slate-900">
                          {Math.max(historyStatuses.indexOf(activeHistoryOrder.status) + 1, 0)}/{historyStatuses.length} trạng thái
                        </span>
                      </span>
                    </div>
                    <div className="space-y-2">
                      {historyStatuses.map((orderStatus) => {
                        const historyTime = getBookingStatusTimestamp(activeHistoryOrder, orderStatus);
                        const reached = Boolean(historyTime);
                        const color = statusDotColor[orderStatus];
                        const dateTime = formatHistoryTimestamp(historyTime);
                        return (
                          <div key={orderStatus} className="min-h-[74px] rounded-lg border border-slate-200 bg-white px-4 py-4">
                            <div className="flex items-start gap-3">
                              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-slate-300" style={reached ? { backgroundColor: color } : undefined} />
                              <div className="min-w-0 flex-1">
                                <p className={`text-sm font-semibold ${reached ? "text-slate-800" : "text-slate-400"}`}>{orderStatus}</p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {dateTime ? `${dateTime.time} ${dateTime.date}` : "Chưa cập nhật"}
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
                <div className="flex flex-1 items-center justify-center text-sm text-slate-400">Chưa có yêu cầu đặt lịch.</div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailOrder} onOpenChange={(open) => !open && setDetailOrder(null)}>
        <DialogContent className="flex h-[min(86vh,680px)] w-[min(86vw,680px)] max-w-[min(86vw,680px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[680px]" showCloseButton={false}>
          <DialogHeader className="min-h-[61px] border-b border-slate-200 px-6 py-4">
            <DialogTitle className="text-lg font-semibold leading-7 text-slate-950">Chi tiết {detailOrder?.displayId || detailOrder?.id}</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">Thông tin yêu cầu đặt lịch theo dữ liệu hệ thống.</DialogDescription>
          </DialogHeader>
          {detailOrder && (
            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              <div className="grid gap-4 md:grid-cols-2">
                {columns
                  .filter((column) => column.id !== "actions" && column.visible !== false)
                  .map((column) => {
                    const value = column.id === "id" ? (detailOrder.displayId || detailOrder.id) : detailOrder[column.id as keyof UserOrder];
                    const displayValue = ["amount", "unitPrice", "originalAmount"].includes(column.id)
                      ? formatCurrency(Number(value || 0))
                      : ["deliveryDate", "createdAt"].includes(column.id)
                        ? formatDate(String(value || ""))
                        : formatEmpty(value);
                    return (
                      <div key={column.id} className={column.id === "note" ? "space-y-2 md:col-span-2" : "space-y-2"}>
                        <Label>{column.label}</Label>
                        <div className={`${column.id === "note" ? "min-h-24 items-start py-2" : "h-9 items-center"} flex rounded-lg border border-input bg-slate-50 px-3 text-sm font-medium text-slate-700`}>
                          {displayValue}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
          <DialogFooter className="m-0 flex-row justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4">
            <DialogClose asChild><Button className="h-9 bg-slate-950 text-sm text-white hover:bg-slate-800">Đóng</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      <DeleteConfirmDialog
        open={Boolean(cancelOrderTarget)}
        onOpenChange={(open) => {
          if (!open) setCancelOrderTarget(null);
        }}
        title="Xác nhận hủy lịch"
        confirmLabel="Xác nhận hủy"
        onConfirm={cancelOrder}
      >
        {cancelOrderTarget
          ? `Bạn có chắc muốn hủy lịch ${cancelOrderTarget.displayId || cancelOrderTarget.id}?`
          : "Bạn có chắc muốn hủy lịch này?"}
      </DeleteConfirmDialog>

      <DeleteConfirmDialog
        open={Boolean(deleteOrderTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteOrderTarget(null);
        }}
        title="Xác nhận xóa lịch"
        confirmLabel="Xác nhận xóa"
        onConfirm={deleteOrder}
      >
        {deleteOrderTarget
          ? `Bạn có chắc muốn xóa lịch ${deleteOrderTarget.displayId || deleteOrderTarget.id}?`
          : "Bạn có chắc muốn xóa lịch này?"}
      </DeleteConfirmDialog>
    </PageShell>
  );
}
