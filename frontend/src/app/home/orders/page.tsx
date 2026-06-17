"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  CalendarDays,
  Clock,
  FileSpreadsheet,
  FileText,
  History,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PageShell,
  type DashboardViewMode,
} from "../_components/dashboard-primitives";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import {
  formatRange,
  fromOrderDate,
  normalizeRange,
  startOfDay,
  toInputDate,
} from "@/src/utils/dashboard-time";
import { Order, OrderStatus, ColumnDef } from "./types";
import {
  statuses,
  emptyForm,
  defaultColumns,
  checkboxClass,
  statusDotColor,
  statusBgColor,
} from "./data";
import {
  handleExport as doExport,
  getDefaultExportFileName,
  type ExportFormat,
} from "./orders-helpers";
import { buildOrderFormFields } from "./order-form-fields";
import {
  calculateOrderPromotion,
  findApplicablePromotion,
  type OrderPromotion,
} from "./order-promotions";

import { MetricCard } from "../_components/metric-card";
import { Toolbar } from "../_components/toolbar";
import { FilterBar } from "../_components/filter-bar";
import { TableView } from "../_components/table-view";
import { KanbanView } from "../_components/kanban-view";
import { ListView } from "../_components/list-view";
import { FormDialog, type FormField } from "../_components/form-dialog";
import { InvoiceModal } from "./_components/invoice-modal";
import { AddColumnDialog } from "../_components/add-column-dialog";
import { DeleteConfirmDialog } from "@/src/components/common/delete-confirm-dialog";
import { homeApi, listHomeResource, mapHomeOrderStatus, mapOrderStatusToApi } from "@/src/lib/home-api";
import { API_BASE_URL } from "@/src/lib/config";
import { HomeTableContentSkeleton } from "@/src/components/common/auth-guard";
import { DashboardTableFooter } from "@/src/components/common/dashboard-data-table";

type OrderCustomer = {
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

type OrderService = {
  service_id: string;
  service_code: string;
  name: string;
  price: number;
  unit: "kg" | "item" | "combo";
  status: "active" | "inactive";
  inventory_items?: string[];
};

type OrderInventoryItem = {
  item_code: string;
  name: string;
  unit?: string;
  status?: string;
  quantity?: number;
};

type OrderMachine = {
  machine_id: string;
  machine_code: string;
  name: string;
  machine_type: "Máy giặt" | "Máy sấy" | "Máy giặt sấy" | "Bàn hấp" | "Bàn ủi";
  status: "Sẵn sàng" | "Đang chạy" | "Bảo trì";
};

type StaffOverview = {
  machines: OrderMachine[];
  inventory: OrderInventoryItem[];
};

type HomeListResponse<T> = {
  items: T[];
};

function formatMachineCode(code?: string) {
  if (!code) return "";
  return code.startsWith("TB-") ? code : `TB-${code}`;
}

function cleanMachineCode(code?: string) {
  return code?.startsWith("TB-") ? code.slice(3) : code;
}

function formatServiceUnit(unit?: string) {
  if (unit === "item") return "món";
  if (unit === "combo") return "bộ";
  return unit || "kg";
}

const customerAvatarColors = ["#0f766e", "#2563eb", "#7c3aed", "#be123c", "#c2410c", "#047857"];

function getCustomerInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  return `${words[0][0]}${words.length > 1 ? words[words.length - 1][0] : ""}`.toUpperCase();
}

function getCustomerAvatarColor(name: string) {
  const hash = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return customerAvatarColors[hash % customerAvatarColors.length];
}

function OrderCustomerAvatar({ customer, size = 28 }: { customer?: OrderCustomer; size?: number }) {
  const name = customer?.full_name || "?";
  return (
    <Avatar className="shrink-0 after:border-slate-200" style={{ width: size, height: size }}>
      {customer?.image_url ? <AvatarImage src={customer.image_url} alt={name} /> : null}
      <AvatarFallback
        className="font-semibold leading-none text-white"
        style={{ backgroundColor: getCustomerAvatarColor(name), fontSize: Math.max(10, size * 0.34) }}
      >
        <span className="block translate-y-px leading-none">{getCustomerInitials(name)}</span>
      </AvatarFallback>
    </Avatar>
  );
}

type HomeOrderRow = {
  order_id: string;
  order_code: string;
  customer_id?: string;
  customer_code?: string;
  customer_name: string;
  customer_phone?: string;
  pickup_address?: string;
  delivery_address?: string;
  status?: string;
  total_amount?: number;
  wash_date?: string;
  due_at?: string;
  created_at?: string;
  note?: string;
  service_name?: string;
  service_id?: string;
  service_code?: string;
  quantity?: string;
  appointment_time?: string;
  washer_code?: string;
  dryer_code?: string;
  assigned_staff?: string;
  payment_method?: string;
  discount_code?: string;
  extra_fields?: Record<string, string>;
};

type HomeOrderStatusHistoryRow = {
  history_id: string;
  previous_status: string | null;
  status: string;
  changed_at: string;
  changed_by_name?: string | null;
};

function mapHomeOrder(row: HomeOrderRow): Order {
  const dueAt = row.due_at ? new Date(row.due_at) : null;
  const createdAt = row.created_at ? row.created_at.slice(0, 10) : "";
  const quantity = Number(row.quantity || 0);
  const totalAmount = Number(row.total_amount || 0);
  const savedUnitPrice = Number(row.extra_fields?.unitPrice || 0);
  const discountAmount = Number(row.extra_fields?.discountAmount || 0);
  return {
    ...(row.extra_fields || {}),
    id: row.order_code,
    customerCode: row.customer_code || "",
    customerDbId: row.customer_id || "",
    customer: row.customer_name,
    phone: row.customer_phone || "",
    address: row.delivery_address || row.pickup_address || "",
    serviceCode: row.service_code || "",
    serviceDbId: row.service_id || "",
    service: row.service_name || "",
    serviceUnit: row.extra_fields?.serviceUnit || "",
    unitPrice: savedUnitPrice || (quantity > 0 ? totalAmount / quantity : 0),
    originalAmount: Number(row.extra_fields?.originalAmount || totalAmount + discountAmount),
    discountAmount,
    discountValue: row.extra_fields?.discountValue || "",
    quantity: row.quantity || "",
    amount: totalAmount,
    status: mapHomeOrderStatus(row.status) as OrderStatus,
    appointment: row.appointment_time || "",
    deliveryDate: row.wash_date || createdAt,
    deliveryTime: dueAt ? dueAt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "",
    washer: formatMachineCode(row.washer_code),
    dryer: formatMachineCode(row.dryer_code),
    staff: row.assigned_staff || "Chưa gán",
    createdAt,
    note: row.note || "",
    payment: row.payment_method || "",
    discount: row.discount_code || "",
    dbId: row.order_id,
  };
}

function normalizeOrderColumns(columns: ColumnDef[]) {
  const existingIds = new Set(columns.map((column) => column.id));
  const defaultColumnById = new Map(defaultColumns.map((column) => [column.id, column]));
  const next = columns.map((column) => ({
    ...column,
    label: defaultColumnById.get(column.id)?.label || column.label,
  }));
  defaultColumns.forEach((column) => {
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

export default function OrdersPage() {
  /* ─── State ─── */
  const [orders, setOrders] = useState<Order[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [columns, setColumns] = useState<ColumnDef[]>(() => {
    if (typeof window === "undefined") return defaultColumns;
    try {
      return normalizeOrderColumns(JSON.parse(localStorage.getItem("home_orders_columns") || "") || defaultColumns);
    } catch {
      return defaultColumns;
    }
  });
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "Tất cả">("Tất cả");
  const range = useDashboardTimeRangeStore((state) => state.range);
  const [page, setPage] = useState(1);
  const [openForm, setOpenForm] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [openHistory, setOpenHistory] = useState(false);
  const [activeHistoryOrderId, setActiveHistoryOrderId] = useState<string | null>(null);
  const [orderHistoryById, setOrderHistoryById] = useState<Record<string, HomeOrderStatusHistoryRow[]>>({});
  const [loadingHistoryOrderId, setLoadingHistoryOrderId] = useState<string | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof emptyForm & Record<string, string>>(emptyForm);
  const [openAddColumn, setOpenAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<DashboardViewMode>("Bảng");
  const [tableResizeMode, setTableResizeMode] = useState<"fit" | "custom">("fit");
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<OrderStatus | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [customPageSize, setCustomPageSize] = useState("");
  const [openPageSizeMenu, setOpenPageSizeMenu] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [isLayoutLoaded, setIsLayoutLoaded] = useState(false);
  const accountColumnsConfigRef = useRef<Record<string, unknown>>({});
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);
  const [customers, setCustomers] = useState<OrderCustomer[]>([]);
  const [profileCustomer, setProfileCustomer] = useState<OrderCustomer | null>(null);
  const [services, setServices] = useState<OrderService[]>([]);
  const [machines, setMachines] = useState<OrderMachine[]>([]);
  const [inventoryItems, setInventoryItems] = useState<OrderInventoryItem[]>([]);
  const [promotions, setPromotions] = useState<OrderPromotion[]>([]);
  const [currentStaffName] = useState(() => {
    if (typeof window === "undefined") return "Chưa gán";
    const username = localStorage.getItem("username");
    const displayName = localStorage.getItem("fullName") || localStorage.getItem("fullname") || localStorage.getItem("accountName");
    return displayName && displayName !== username ? displayName : "Chưa gán";
  });

  useEffect(() => {
    let alive = true;
    const loadOrders = () =>
      listHomeResource<HomeOrderRow>("orders", { limit: 500 })
        .then((response) => {
          if (!alive) return;
          setOrders(response.items.map(mapHomeOrder));
        })
        .catch(() => {
          if (alive) setOrders([]);
        })
        .finally(() => {
          if (alive) setIsDataLoading(false);
        });
    void loadOrders();
    const handleOrdersChanged = () => {
      void loadOrders();
    };
    window.addEventListener("home-orders-changed", handleOrdersChanged);
    return () => {
      alive = false;
      window.removeEventListener("home-orders-changed", handleOrdersChanged);
    };
  }, []);

  useEffect(() => {
    const handleCreatedOrder = (event: Event) => {
      const savedRow = (event as CustomEvent<HomeOrderRow>).detail;
      if (!savedRow?.order_id) return;
      const savedOrder = mapHomeOrder(savedRow);
      setOrders((current) => [
        savedOrder,
        ...current.filter((order) => order.dbId !== savedOrder.dbId && order.id !== savedOrder.id),
      ]);
      setPage(1);
    };
    window.addEventListener("orders:created", handleCreatedOrder);
    return () => window.removeEventListener("orders:created", handleCreatedOrder);
  }, []);

  const loadServices = useCallback(async () => {
    try {
      const response = await homeApi<HomeListResponse<OrderService>>(
        "/services?limit=500&include_count=false",
        { cache: "no-store" },
      );
      setServices(response.items.filter((service) => service.status === "active"));
    } catch {
      setServices([]);
    }
  }, []);

  const loadMachines = useCallback(async () => {
    try {
      const response = await homeApi<StaffOverview>("/staff/overview?limit=500", { cache: "no-store" });
      setMachines((response.machines || []).filter((machine) => machine.status !== "Bảo trì"));
      setInventoryItems(response.inventory || []);
    } catch {
      setMachines([]);
      setInventoryItems([]);
    }
  }, []);

  const loadCustomers = useCallback(async () => {
    try {
      const response = await listHomeResource<OrderCustomer>("customers", { limit: 500 });
      setCustomers(response.items);
      setProfileCustomer((current) =>
        current
          ? response.items.find((customer) => customer.customer_id === current.customer_id) || current
          : null,
      );
    } catch {
      setCustomers([]);
    }
  }, []);

  const loadPromotions = useCallback(async () => {
    try {
      const response = await listHomeResource<OrderPromotion>("promotions", { limit: 500 });
      setPromotions(response.items);
    } catch {
      setPromotions([]);
    }
  }, []);

  useEffect(() => {
    void loadServices();
    void loadMachines();
    void loadCustomers();
    void loadPromotions();
  }, [loadCustomers, loadMachines, loadPromotions, loadServices]);

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
        const layout = (parsed.ordersLayout || {}) as {
          columns?: ColumnDef[];
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
    localStorage.setItem("home_orders_columns", JSON.stringify(columns));
    if (!isLayoutLoaded) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    const timeoutId = window.setTimeout(() => {
      const nextConfig = {
        ...accountColumnsConfigRef.current,
        ordersLayout: { columns, tableResizeMode, pageSize },
      };
      accountColumnsConfigRef.current = nextConfig;
      fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ columns_config: JSON.stringify(nextConfig) }),
      }).catch((error) => console.error("Error saving orders layout:", error));
    }, 250);
    return () => window.clearTimeout(timeoutId);
  }, [columns, isLayoutLoaded, pageSize, tableResizeMode]);

  /* ─── Derived values ─── */
  const normalizedRange = normalizeRange(range);
  const rangeLabel = formatRange(normalizedRange);
  const emptyMessage =
    normalizedRange.end < startOfDay(new Date())
      ? "Không có đơn hàng"
      : "Chưa có đơn hàng";

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const source = `${order.id} ${order.customer} ${order.phone} ${order.address} ${order.service} ${order.staff} ${order.washer || ""} ${order.dryer || ""}`;
      const matchQuery = source.toLowerCase().includes(query.toLowerCase());
      const matchStatus = selectedStatus === "Tất cả" || order.status === selectedStatus;
      const createdAt = fromOrderDate(order.createdAt);
      const matchRange = createdAt >= normalizedRange.start && createdAt <= normalizedRange.end;
      return matchQuery && matchStatus && matchRange;
    });
  }, [normalizedRange.end, normalizedRange.start, orders, query, selectedStatus]);

  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);
  const totalAmount = filteredOrders.reduce((sum, order) => sum + order.amount, 0);
  const completedOrders = filteredOrders.filter((order) => order.status === "Hoàn thành").length;
  const todayStart = startOfDay(new Date());
  const overdueOrders = filteredOrders.filter((order) => {
    const deliveryDate = fromOrderDate(order.deliveryDate);
    return order.status !== "Hoàn thành" && deliveryDate < todayStart;
  }).length;
  const inProgressOrders = filteredOrders.filter((order) =>
    ["Đang giặt", "Kiểm tra", "Chờ thanh toán"].includes(order.status),
  ).length;
  const averageAmount =
    filteredOrders.length > 0 ? Math.round(totalAmount / filteredOrders.length) : 0;

  const visibleOrderIds = useMemo(() => paginatedOrders.map((o) => o.id), [paginatedOrders]);
  const kanbanOrderIds = useMemo(() => filteredOrders.map((o) => o.id), [filteredOrders]);
  const selectedOrders = useMemo(
    () => orders.filter((o) => selectedOrderIds.has(o.id)),
    [orders, selectedOrderIds],
  );
  const getOrderServiceUnit = useCallback(
    (order: Order) => {
      if (order.serviceUnit) return order.serviceUnit;
      const normalizedCode = order.serviceCode?.replace(/^DV-/, "");
      const service = services.find(
        (item) =>
          item.service_id === order.serviceDbId
          || item.service_code.replace(/^DV-/, "") === normalizedCode
          || item.name === order.service,
      );
      return service ? formatServiceUnit(service.unit) : "";
    },
    [services],
  );
  const formatOrderQuantity = useCallback(
    (order: Order) => {
      if (!order.quantity) return "-";
      const unit = getOrderServiceUnit(order);
      return unit ? `${order.quantity} ${unit}` : order.quantity;
    },
    [getOrderServiceUnit],
  );
  const canShowInvoice = useCallback(
    (order: Order) => order.status === "Chờ thanh toán",
    [],
  );
  const canOpenInvoice = useCallback(
    (order: Order) => canShowInvoice(order) && Number(order.quantity) > 0,
    [canShowInvoice],
  );
  const canDeleteOrder = useCallback(
    (order: Order) => order.status !== "Chờ thanh toán",
    [],
  );
  const openInvoice = useCallback(
    (order: Order) => {
      if (!canShowInvoice(order)) {
        toast.error("Chỉ có thể xem hóa đơn khi đơn chờ thanh toán hoặc đã hoàn thành.");
        return;
      }
      if (Number(order.quantity) <= 0) {
        toast.error("Không thể mở hóa đơn khi số lượng bằng 0.");
        return;
      }
      setInvoiceOrder(order);
    },
    [canShowInvoice],
  );
  const activeHistoryOrder = useMemo(
    () => selectedOrders.find((order) => order.id === activeHistoryOrderId) || selectedOrders[0] || null,
    [selectedOrders, activeHistoryOrderId],
  );
  useEffect(() => {
    if (!openHistory || !activeHistoryOrder) return;
    let alive = true;
    setLoadingHistoryOrderId(activeHistoryOrder.id);
    homeApi<HomeOrderStatusHistoryRow[]>(
      `/orders/${String(activeHistoryOrder.dbId || activeHistoryOrder.id)}/history`,
      { cache: "no-store" },
    )
      .then((rows) => {
        if (!alive) return;
        setOrderHistoryById((prev) => ({ ...prev, [activeHistoryOrder.id]: rows }));
      })
      .catch((error) => {
        if (!alive) return;
        setOrderHistoryById((prev) => ({ ...prev, [activeHistoryOrder.id]: [] }));
        toast.error(error instanceof Error ? error.message : "Không tải được lịch sử đơn hàng.");
      })
      .finally(() => {
        if (alive) setLoadingHistoryOrderId(null);
      });
    return () => {
      alive = false;
    };
  }, [activeHistoryOrder, openHistory]);
  const customColumns = useMemo(
    () => columns.filter((c) => !defaultColumns.some((dc) => dc.id === c.id)),
    [columns],
  );
  const exportColumns = useMemo(
    () => columns.filter((c) => c.visible && c.id !== "actions"),
    [columns],
  );
  const totalVisibleWidth = useMemo(
    () => columns.filter((c) => c.visible).reduce((sum, c) => sum + (c.width || 150), 0),
    [columns],
  );
  const formatDisplayDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split("-");
    if (!year || !month || !day) return dateStr;
    return `${day}/${month}/${year}`;
  };

  const formatHistoryTimestamp = (value?: string) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return {
      time: date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      date: date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    };
  };

  const allVisibleSelected =
    visibleOrderIds.length > 0 && visibleOrderIds.every((id) => selectedOrderIds.has(id));
  const allKanbanOrdersSelected =
    kanbanOrderIds.length > 0 && kanbanOrderIds.every((id) => selectedOrderIds.has(id));
  const selectedVisibleOrderCount = visibleOrderIds.filter((id) => selectedOrderIds.has(id)).length;
  const selectedKanbanOrderCount = kanbanOrderIds.filter((id) => selectedOrderIds.has(id)).length;

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  /* ─── Handlers ─── */
  const toggleVisibleOrders = () => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleOrderIds.forEach((id) => next.delete(id));
      } else {
        visibleOrderIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleKanbanOrders = () => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      if (allKanbanOrdersSelected) {
        kanbanOrderIds.forEach((id) => next.delete(id));
      } else {
        kanbanOrderIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleOrder = (id: string) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updatePageSize = (size: number) => {
    const nextSize = Math.max(1, Math.min(500, Math.floor(size)));
    setPageSize(nextSize);
    setPage(1);
    setOpenPageSizeMenu(false);
  };

  const applyCustomPageSize = () => {
    const nextSize = Number(customPageSize);
    if (!Number.isFinite(nextSize) || nextSize <= 0) return;
    updatePageSize(nextSize);
    setCustomPageSize("");
  };

  const getCustomFields = useCallback(
    (source: Record<string, unknown> = {}) =>
      Object.fromEntries(customColumns.map((c) => [c.id, String(source?.[c.id] ?? "")])),
    [customColumns],
  );

  const getServiceInventoryCodes = useCallback((service?: OrderService) => {
    if (!service) return [];
    const availableInventoryCodes = new Set(
      inventoryItems
        .filter((item) => item.status !== "Cần mua" && Number(item.quantity || 0) > 0)
        .map((item) => item.item_code.startsWith("VT-") ? item.item_code : `VT-${item.item_code}`),
    );
    if (service.inventory_items?.includes("Tất cả vật tư")) {
      return Array.from(availableInventoryCodes);
    }
    return (service.inventory_items || [])
      .map((item) => item.split(" · ")[0])
      .filter((code) => availableInventoryCodes.has(code));
  }, [inventoryItems]);

  const getInventoryConsumption = useCallback(
    (source: Record<string, unknown>, service?: OrderService) => {
      const availableCodes = new Set(getServiceInventoryCodes(service));
      const savedCodes = Object.keys(source)
        .filter((key) => key.startsWith("consumption_"))
        .map((key) => key.replace(/^consumption_/, ""))
        .filter((code) => availableCodes.has(code));
      const codes = Array.from(new Set([...getServiceInventoryCodes(service), ...savedCodes]));
      return Object.fromEntries(
        codes.map((code) => [
          `consumption_${code}`,
          String(source[`consumption_${code}`] ?? "").trim() || "0",
        ]),
      );
    },
    [getServiceInventoryCodes],
  );

  const addCustomColumn = () => {
    const label = newColumnName.trim();
    if (!label) return;
    const newColumn: ColumnDef = { id: `custom_${Date.now()}`, label, width: 150, visible: true };
    setColumns((prev) => {
      const next = [...prev];
      const noteIndex = next.findIndex((c) => c.id === "note");
      const actionIndex = next.findIndex((c) => c.id === "actions");
      next.splice(noteIndex !== -1 ? noteIndex : actionIndex === -1 ? next.length : actionIndex, 0, newColumn);
      return next;
    });
    setForm((prev) => ({ ...prev, [newColumn.id]: "" }));
    setNewColumnName("");
    setOpenAddColumn(false);
  };

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

  /* Form CRUD */
  const openCreateForm = useCallback(() => {
    void loadServices();
    void loadMachines();
    setEditingOrderId(null);
    const today = toInputDate(new Date());
    setForm({
      ...emptyForm,
      ...getCustomFields(),
      staff: currentStaffName,
      createdAt: today,
      deliveryDate: today,
    });
    setOpenForm(true);
  }, [currentStaffName, getCustomFields, loadMachines, loadServices]);

  const openEditForm = useCallback((order: Order) => {
    void loadServices();
    void loadMachines();
    const currentCustomer = customers.find((customer) => customer.customer_code === order.customerCode);
    const currentService = services.find(
      (service) =>
        service.service_code.replace(/^DV-/, "") === order.serviceCode?.replace(/^DV-/, "") ||
        service.name === order.service,
    );
    const currentWasher = machines.find(
      (machine) => cleanMachineCode(machine.machine_code) === cleanMachineCode(order.washer),
    );
    const currentDryer = machines.find(
      (machine) => cleanMachineCode(machine.machine_code) === cleanMachineCode(order.dryer),
    );
    setEditingOrderId(order.id);
    setForm({
      customerCode: order.customerCode || "",
      customer: currentCustomer?.full_name || order.customer,
      phone: currentCustomer?.phone || order.phone,
      address: currentCustomer?.address || order.address,
      service: currentService
        ? `${currentService.service_code.startsWith("DV-") ? currentService.service_code : `DV-${currentService.service_code}`} · ${currentService.name}`
        : order.service,
      serviceUnit: currentService ? formatServiceUnit(currentService.unit) : order.serviceUnit || "",
      unitPrice: String(order.unitPrice || currentService?.price || 0),
      quantity: order.quantity,
      amount: String(order.amount),
      appointment: order.appointment,
      deliveryDate: order.deliveryDate,
      deliveryTime: order.deliveryTime,
      washer: currentWasher ? `${formatMachineCode(currentWasher.machine_code)} · ${currentWasher.name}` : order.washer || "",
      dryer: currentDryer ? `${formatMachineCode(currentDryer.machine_code)} · ${currentDryer.name}` : order.dryer || "",
      staff: order.staff,
      status: order.status,
      createdAt: order.createdAt,
      payment: String(order.payment || "Tiền mặt"),
      discount: String(order.discount || ""),
      discountValue: String(order.discountValue || ""),
      discountAmount: String(order.discountAmount || 0),
      originalAmount: String(order.originalAmount || order.amount),
      note: order.note,
      ...getInventoryConsumption(order, currentService),
      ...getCustomFields(order),
    });
    setOpenForm(true);
  }, [customers, getCustomFields, getInventoryConsumption, loadMachines, loadServices, machines, services]);

  const closeForm = () => {
    setOpenForm(false);
    setEditingOrderId(null);
    setForm(emptyForm);
  };

  const handleOrderFormChange = useCallback((nextForm: Record<string, string>) => {
    const rawCustomerCode = nextForm.customerCode.trim().toUpperCase();
    const normalizedCustomerCode = rawCustomerCode && !rawCustomerCode.startsWith("KH-")
      ? `KH-${rawCustomerCode.replace(/\D/g, "").slice(0, 4)}`
      : rawCustomerCode;
    const selectedCustomer = customers.find(
      (customer) => customer.customer_code.toUpperCase() === normalizedCustomerCode,
    );
    const normalizedForm: Record<string, string> = {
      ...nextForm,
      customerCode: normalizedCustomerCode,
      customer: selectedCustomer?.full_name || "",
      phone: selectedCustomer?.phone || "",
      address: selectedCustomer?.address || "",
      discount: (nextForm.discount || "").toUpperCase(),
    };
    const selectedService = services.find((service) => {
      const code = service.service_code.startsWith("DV-") ? service.service_code : `DV-${service.service_code}`;
      return `${code} · ${service.name}` === normalizedForm.service || service.name === normalizedForm.service;
    });
    if (!selectedService) {
      setForm({
        ...emptyForm,
        ...normalizedForm,
        serviceUnit: "",
        unitPrice: "0",
        originalAmount: "0",
        discountValue: "",
        discountAmount: "0",
        amount: "0",
      });
      return;
    }
    const quantity = Number(normalizedForm.quantity);
    const originalAmount = Number.isFinite(quantity) && quantity > 0
      ? Math.round(quantity * Number(selectedService.price || 0))
      : 0;
    const promotion = findApplicablePromotion(promotions, normalizedForm.discount, selectedService);
    const promotionResult = calculateOrderPromotion(originalAmount, promotion);
    const consumptionValues = Object.fromEntries(
      getServiceInventoryCodes(selectedService).map((code) => {
        const key = `consumption_${code}`;
        return [key, String(normalizedForm[key] ?? "").trim() || "0"];
      }),
    );
    setForm({
      ...emptyForm,
      ...normalizedForm,
      ...consumptionValues,
      serviceUnit: formatServiceUnit(selectedService.unit),
      unitPrice: String(Number(selectedService.price || 0)),
      originalAmount: String(promotionResult.originalAmount),
      discountValue: promotionResult.discountValue,
      discountAmount: String(promotionResult.discountAmount),
      amount: String(promotionResult.finalAmount),
    });
  }, [customers, getServiceInventoryCodes, promotions, services]);

  useEffect(() => {
    const handleCreateOrder = () => openCreateForm();
    window.addEventListener("orders:create", handleCreateOrder);

    const params = new URLSearchParams(window.location.search);
    const action = params.get("action");
    const orderId = params.get("id");
    const matchedOrder = orderId ? orders.find((order) => order.id === orderId) : null;

    if (params.get("create") === "1" || action === "create") {
      handleCreateOrder();
      window.history.replaceState(null, "", window.location.pathname);
    } else if (matchedOrder && action === "invoice") {
      queueMicrotask(() => {
        openInvoice(matchedOrder);
        setQuery(matchedOrder.id);
        setPage(1);
      });
      window.history.replaceState(null, "", window.location.pathname);
    } else if (matchedOrder && action === "edit") {
      queueMicrotask(() => {
        openEditForm(matchedOrder);
        setQuery(matchedOrder.id);
        setPage(1);
      });
      window.history.replaceState(null, "", window.location.pathname);
    }

    return () => window.removeEventListener("orders:create", handleCreateOrder);
  }, [openCreateForm, openEditForm, openInvoice, orders]);

  const validateOrderForm = (
    selectedCustomer: OrderCustomer | undefined,
    selectedService: OrderService | undefined,
  ) => {
    if (!form.customerCode.trim() || !form.service.trim()) {
      toast.error("Vui lòng nhập đầy đủ các trường bắt buộc.");
      return false;
    }
    const errors: string[] = [];
    if (!/^KH-\d{4}$/.test(form.customerCode.trim())) {
      errors.push("Mã khách hàng đủ 4 số");
    } else if (!selectedCustomer) {
      errors.push("Mã khách hàng hợp lệ");
    }
    if (!selectedService) {
      errors.push("Dịch vụ đang hoạt động");
    }
    if (form.quantity.trim() && (!Number.isFinite(Number(form.quantity)) || Number(form.quantity) < 0)) {
      errors.push("Số lượng hợp lệ");
    }
    if (form.discount.trim() && !findApplicablePromotion(promotions, form.discount, selectedService)) {
      errors.push("Mã giảm giá hợp lệ và còn hiệu lực");
    }
    if (errors.length === 0) return true;
    toast.error(`Vui lòng nhập: ${errors.join(", ")}.`);
    return false;
  };

  const saveOrder = async () => {
    const selectedCustomer = customers.find((customer) => customer.customer_code === form.customerCode);
    const selectedService = services.find((service) => {
      const displayCode = service.service_code.startsWith("DV-") ? service.service_code : `DV-${service.service_code}`;
      return `${displayCode} · ${service.name}` === form.service;
    });
    if (!validateOrderForm(selectedCustomer, selectedService) || !selectedCustomer || !selectedService) return;
    const selectedWasher = machines.find(
      (machine) => `${formatMachineCode(machine.machine_code)} · ${machine.name}` === form.washer,
    );
    const selectedDryer = machines.find(
      (machine) => `${formatMachineCode(machine.machine_code)} · ${machine.name}` === form.dryer,
    );
    const washerCode = selectedWasher?.machine_code || (form.washer && !form.washer.includes(" · ") ? cleanMachineCode(form.washer) : null);
    const dryerCode = selectedDryer?.machine_code || (form.dryer && !form.dryer.includes(" · ") ? cleanMachineCode(form.dryer) : null);
    const deliveryDate = form.deliveryDate || form.createdAt || new Date().toISOString().slice(0, 10);
    const deliveryTime = form.deliveryTime && form.deliveryTime !== "Chưa hẹn" ? form.deliveryTime : "";
    const apiPayload = {
      customer_id: selectedCustomer?.customer_id || null,
      customer_code: selectedCustomer?.customer_code || null,
      customer_name: selectedCustomer.full_name,
      customer_phone: selectedCustomer.phone || null,
      pickup_address: selectedCustomer.address || null,
      delivery_address: selectedCustomer.address || null,
      service_id: selectedService.service_id,
      service_code: selectedService.service_code,
      service_name: selectedService.name,
      quantity: form.quantity.trim() || "0",
      total_amount: Number(form.amount) || 0,
      status: mapOrderStatusToApi(form.status),
      appointment_time: form.appointment || null,
      wash_date: deliveryDate,
      due_at: deliveryTime ? `${deliveryDate}T${deliveryTime}:00` : null,
      washer_code: washerCode,
      dryer_code: dryerCode,
      assigned_staff: currentStaffName || form.staff || "Chưa gán",
      payment_method: form.payment || null,
      discount_code: form.discount.trim().toUpperCase() || null,
      payment_status: form.status === "Hoàn thành" ? "Đã thanh toán" : "Chưa thanh toán",
      note: form.note || null,
      extra_fields: {
        ...getCustomFields(form),
        ...Object.fromEntries(
          Object.entries(getInventoryConsumption(form, selectedService)).map(([key, value]) => [
            key,
            value === "" ? "0" : value,
          ]),
        ),
        serviceUnit: formatServiceUnit(selectedService.unit),
        unitPrice: String(Number(selectedService.price || 0)),
        originalAmount: String(Number(form.originalAmount || 0)),
        discountValue: form.discountValue || "",
        discountAmount: String(Number(form.discountAmount || 0)),
      },
    };

    try {
      const editingOrder = orders.find((order) => order.id === editingOrderId);
      const savedRow = editingOrder
        ? await homeApi<HomeOrderRow>(`/orders/${String(editingOrder.dbId || editingOrder.id)}`, {
            method: "PUT",
            body: JSON.stringify(apiPayload),
          })
        : await homeApi<HomeOrderRow>("/orders", {
            method: "POST",
            body: JSON.stringify(apiPayload),
          });
      const savedOrder = mapHomeOrder(savedRow);
      setOrders((prev) =>
        editingOrder
          ? prev.map((order) => order.id === editingOrder.id ? savedOrder : order)
          : [savedOrder, ...prev],
      );
      window.dispatchEvent(new Event("home-orders-changed"));
      await loadCustomers();
      setPage(1);
      closeForm();
      toast.success(editingOrder ? "Đã cập nhật đơn hàng." : "Đã thêm đơn hàng.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu đơn hàng.");
    }
  };

  const onExport = (format: ExportFormat, fileName: string) => {
    const rows = selectedOrderIds.size > 0 ? selectedOrders : orders;
    doExport(format, fileName, {
      rows,
      exportColumns,
      selectedCount: selectedOrderIds.size,
      normalizedRange,
    });
  };

  const orderFormFields = useMemo<FormField[]>(() => {
    const selectedService = services.find((service) => {
      const code = service.service_code.startsWith("DV-") ? service.service_code : `DV-${service.service_code}`;
      return `${code} · ${service.name}` === form.service || service.name === form.service;
    });
    const savedConsumptionCodes = Object.keys(form)
      .filter((key) => key.startsWith("consumption_"))
      .map((key) => key.replace(/^consumption_/, ""))
      .filter((code) => getServiceInventoryCodes(selectedService).includes(code));
    const consumptionCodes = Array.from(new Set([
      ...getServiceInventoryCodes(selectedService),
      ...savedConsumptionCodes,
    ]));
    return buildOrderFormFields({
      columns,
      editing: Boolean(editingOrderId),
      services,
      machines,
      inventoryItems,
      inventoryCodes: consumptionCodes,
      showDiscountDetails: Boolean(form.discountValue),
    });
  }, [columns, editingOrderId, form, getServiceInventoryCodes, inventoryItems, machines, services]);

  const orderFilterOptions = useMemo(() => {
    return (["Tất cả", ...statuses] as const).map((status) => {
      const isAll = status === "Tất cả";
      return {
        id: status,
        label: status,
        color: isAll ? "#6366f1" : statusDotColor[status],
        bgColor: isAll ? "rgba(99,102,241,0.09)" : statusBgColor[status],
      };
    });
  }, []);

  const orderKanbanColumns = useMemo(() => {
    return statuses.map((status) => ({
      id: status,
      label: status,
      color: { text: statusDotColor[status], bg: statusBgColor[status] },
    }));
  }, []);
  const isOrderStatus = (value: string): value is OrderStatus => statuses.includes(value as OrderStatus);

  const updateOrderStatus = async (orderId: string, nextStatus: OrderStatus) => {
    const order = orders.find((item) => item.id === orderId);
    if (!order || order.status === nextStatus) return;
    try {
      const savedRow = await homeApi<HomeOrderRow>(`/orders/${String(order.dbId || order.id)}`, {
        method: "PUT",
        body: JSON.stringify({
          status: mapOrderStatusToApi(nextStatus),
          payment_status: nextStatus === "Hoàn thành" ? "Đã thanh toán" : "Chưa thanh toán",
        }),
      });
      const savedOrder = mapHomeOrder(savedRow);
      setOrders((prev) => prev.map((item) => item.id === orderId ? savedOrder : item));
      window.dispatchEvent(new Event("home-orders-changed"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật trạng thái đơn hàng.");
    }
  };

  const confirmDeleteOrder = async () => {
    if (!deleteTarget) return;
    setIsDeletingOrder(true);
    try {
      await homeApi(`/orders/${String(deleteTarget.dbId || deleteTarget.id)}`, { method: "DELETE" });
      setOrders((prev) => prev.filter((order) => order.id !== deleteTarget.id));
      window.dispatchEvent(new Event("home-orders-changed"));
      setSelectedOrderIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
      setDeleteTarget(null);
      toast.success("Đã xóa đơn hàng.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xóa đơn hàng.");
    } finally {
      setIsDeletingOrder(false);
    }
  };

  const renderOrderCell = (order: Order, col: { id: string }) => {
    const customer = customers.find((item) => item.customer_code === order.customerCode);
    if (col.id === "id") return (
      <TableCell key={col.id} className="font-medium text-slate-900 truncate overflow-hidden max-w-0" title={order.id}>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            aria-label={`Chọn đơn ${order.id}`}
            checked={selectedOrderIds.has(order.id)}
            onChange={() => toggleOrder(order.id)}
            className={`shrink-0 ${checkboxClass}`}
          />
          <span className="truncate">{order.id}</span>
        </div>
      </TableCell>
    );
    if (col.id === "customerCode") return (
      <TableCell key={col.id} className="font-medium text-slate-700">
        {order.customerCode || "-"}
      </TableCell>
    );
    if (col.id === "customer") return (
      <TableCell key={col.id} className="truncate overflow-hidden max-w-0" title={order.customer}>
        <div className="flex min-w-0 items-center gap-2">
          <OrderCustomerAvatar customer={customer} size={24} />
          <button
            type="button"
            className="truncate text-left font-medium text-slate-900 hover:text-emerald-700"
            onClick={() => customer && setProfileCustomer(customer)}
          >
            {order.customer}
          </button>
        </div>
      </TableCell>
    );
    if (col.id === "phone") return (
      <TableCell key={col.id} className="truncate overflow-hidden max-w-0" title={order.phone || "-"}>
        {order.phone ? <a href={`tel:${order.phone}`} className="text-slate-500 transition-colors hover:text-slate-800">{order.phone}</a> : <span className="text-slate-400 italic">-</span>}
      </TableCell>
    );
    if (col.id === "service") return (
      <TableCell key={col.id} className={`truncate overflow-hidden max-w-0 ${order.service ? "text-slate-600" : "text-slate-400 italic"}`} title={order.service || "-"}>
        {order.service || "-"}
      </TableCell>
    );
    if (col.id === "quantity") return (
      <TableCell key={col.id} className={`truncate overflow-hidden max-w-0 ${order.quantity ? "text-slate-500" : "text-slate-400 italic"}`} title={formatOrderQuantity(order)}>
        {formatOrderQuantity(order)}
      </TableCell>
    );
    if (col.id === "amount") return (
      <TableCell key={col.id} className="font-medium text-slate-900 truncate overflow-hidden max-w-0" title={`${order.amount.toLocaleString("vi-VN")}đ`}>
        {order.amount.toLocaleString("vi-VN")}đ
      </TableCell>
    );
    if (col.id === "originalAmount") {
      const value = Number(order.originalAmount || order.amount || 0);
      return (
        <TableCell key={col.id} className="truncate overflow-hidden max-w-0 text-slate-500" title={`${value.toLocaleString("vi-VN")}đ`}>
          {value.toLocaleString("vi-VN")}đ
        </TableCell>
      );
    }
    if (col.id === "discountValue") {
      const value = String(order.discountValue || "");
      return (
        <TableCell key={col.id} className={`truncate overflow-hidden max-w-0 ${value ? "font-medium text-emerald-700" : "text-slate-400 italic"}`} title={value || "-"}>
          {value || "-"}
        </TableCell>
      );
    }
    if (col.id === "unitPrice") return (
      <TableCell key={col.id} className="truncate overflow-hidden max-w-0 text-slate-500" title={`${Number(order.unitPrice || 0).toLocaleString("vi-VN")}đ`}>
        {Number(order.unitPrice || 0).toLocaleString("vi-VN")}đ
      </TableCell>
    );
    if (col.id === "washer" || col.id === "dryer") {
      const value = order[col.id];
      const displayValue = value ? String(value) : "-";
      return (
        <TableCell key={col.id} className={`truncate overflow-hidden max-w-0 ${value ? "text-slate-600" : "text-slate-400 italic"}`} title={displayValue}>
          {displayValue}
        </TableCell>
      );
    }
    if (col.id === "deliveryDate") return (
      <TableCell key={col.id} className="text-slate-500 truncate overflow-hidden max-w-0" title={formatDisplayDate(order.deliveryDate)}>
        {formatDisplayDate(order.deliveryDate)}
      </TableCell>
    );
    if (col.id === "deliveryTime") return (
      <TableCell key={col.id} className={`truncate overflow-hidden max-w-0 ${order.deliveryTime ? "text-slate-500" : "text-slate-400 italic"}`} title={order.deliveryTime || "-"}>
        {order.deliveryTime || "-"}
      </TableCell>
    );
    if (col.id === "staff") return (
      <TableCell key={col.id} className="truncate overflow-hidden max-w-0" title={order.staff}>
        <div className="flex items-center">
          <span className={`truncate ${order.staff === "Chưa gán" ? "text-slate-400" : "text-slate-600"}`}>{order.staff}</span>
        </div>
      </TableCell>
    );
    if (col.id === "status") return (
      <TableCell key={col.id} className="truncate overflow-hidden max-w-0">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium truncate max-w-full" style={{ color: statusDotColor[order.status], backgroundColor: statusBgColor[order.status] }}>
          <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: statusDotColor[order.status] }} />
          <span className="truncate">{order.status}</span>
        </span>
      </TableCell>
    );
    if (col.id === "createdAt") return (
      <TableCell key={col.id} className="truncate overflow-hidden max-w-0" title={formatDisplayDate(order.createdAt)}>
        <div className="flex items-center gap-2 text-slate-500">
          <span className="text-xs truncate">{formatDisplayDate(order.createdAt)}</span>
        </div>
      </TableCell>
    );
    if (col.id === "actions") return (
      <TableCell key={col.id} className="px-4 overflow-hidden max-w-0">
        <div className="flex items-center justify-start gap-1.5">
          <button type="button" className="inline-flex shrink-0 h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50" onClick={() => openEditForm(order)} title="Xem chi tiết">
            Sửa
          </button>
          {canShowInvoice(order) && (
            <button
              type="button"
              className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              onClick={() => openInvoice(order)}
              disabled={!canOpenInvoice(order)}
              title={canOpenInvoice(order) ? "Hóa đơn" : "Số lượng phải lớn hơn 0"}
            >
              Hóa đơn
            </button>
          )}
          {canDeleteOrder(order) && (
            <button type="button" className="inline-flex shrink-0 h-7 items-center rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-600" onClick={() => setDeleteTarget(order)} title="Xóa">
              Xóa
            </button>
          )}
        </div>
      </TableCell>
    );

    const val = order[col.id];
    const hasValue = val !== undefined && val !== null && val !== "";
    const displayValue = hasValue ? String(val) : "-";
    return (
      <TableCell key={col.id} className={`truncate overflow-hidden max-w-0 ${!hasValue ? "text-slate-400 italic" : "text-slate-600"}`} title={displayValue}>
        {displayValue}
      </TableCell>
    );
  };

  const renderOrderKanbanCard = (order: Order) => {
    const customer = customers.find((item) => item.customer_code === order.customerCode);
    return (
      <div
        key={order.id}
        draggable
        onDragStart={(event) => {
          setDraggedOrderId(order.id);
          event.dataTransfer.effectAllowed = "move";
        }}
        onDragEnd={() => {
          setDraggedOrderId(null);
          setDragOverStatus(null);
        }}
        className={`cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-slate-300 hover:shadow-md active:cursor-grabbing ${draggedOrderId === order.id ? "opacity-50 ring-2 ring-slate-400" : ""}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <input
              type="checkbox"
              aria-label={`Chọn đơn ${order.id}`}
              checked={selectedOrderIds.has(order.id)}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              onChange={() => toggleOrder(order.id)}
              className={`shrink-0 ${checkboxClass}`}
            />
            <OrderCustomerAvatar customer={customer} size={32} />
            <div className="min-w-0">
              <button
                type="button"
                className="block max-w-full truncate text-left text-sm font-medium text-slate-700 hover:text-emerald-700"
                onClick={(event) => {
                  event.stopPropagation();
                  if (customer) setProfileCustomer(customer);
                }}
              >
                {order.customer}
              </button>
              <p className="truncate text-[11px] text-slate-400">{order.phone}</p>
            </div>
          </div>
          <span className="shrink-0 text-[11px] font-semibold text-slate-400">{order.id}</span>
        </div>
        <p className="mt-2 truncate text-xs text-slate-500">{order.service} · {formatOrderQuantity(order)}</p>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
          <span className="truncate text-[11px] text-slate-500">{formatDisplayDate(order.deliveryDate)} · {order.deliveryTime}</span>
          <span className="text-[13px] font-bold text-slate-900">{order.amount.toLocaleString("vi-VN")}đ</span>
        </div>
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => openEditForm(order)}
            className="inline-flex h-6 items-center rounded-md bg-slate-100 px-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
          >
            Chi tiết
          </button>
        </div>
      </div>
    );
  };

  const renderOrderListRow = (order: Order) => {
    const customer = customers.find((item) => item.customer_code === order.customerCode);
    return (
      <div key={order.id} className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <input
              type="checkbox"
              aria-label={`Chọn đơn ${order.id}`}
              checked={selectedOrderIds.has(order.id)}
              onChange={() => toggleOrder(order.id)}
              className={`mt-1 shrink-0 ${checkboxClass}`}
            />
            <OrderCustomerAvatar customer={customer} size={40} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-950">{order.id}</span>
                <span className="text-xs font-medium text-slate-400">·</span>
                <button
                  type="button"
                  className="text-xs font-semibold text-slate-700 hover:text-emerald-700"
                  onClick={() => customer && setProfileCustomer(customer)}
                >
                  {order.customer}
                </button>
                <span
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium"
                  style={{
                    color: statusDotColor[order.status],
                    backgroundColor: statusBgColor[order.status],
                  }}
                >
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: statusDotColor[order.status] }} />
                  {order.status}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>{order.phone}</span>
                <span>{order.service} · {formatOrderQuantity(order)}</span>
                <span>Hẹn giao: {formatDisplayDate(order.deliveryDate)} · {order.deliveryTime}</span>
                {(order.washer || order.dryer) && <span>{order.washer || "Chưa có máy giặt"} · {order.dryer || "Chưa có máy sấy"}</span>}
              </div>
              {order.note && <p className="mt-2 text-xs text-slate-400">{order.note}</p>}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              {order.amount.toLocaleString("vi-VN")}đ
            </span>
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-slate-50"
              onClick={() => openEditForm(order)}
            >
              Sửa
            </button>
            {canShowInvoice(order) && (
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                onClick={() => openInvoice(order)}
                disabled={!canOpenInvoice(order)}
                title={canOpenInvoice(order) ? "Hóa đơn" : "Số lượng phải lớn hơn 0"}
              >
                Hóa đơn
              </button>
            )}
            {canDeleteOrder(order) && (
              <button
                type="button"
                className="inline-flex h-8 items-center rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-600"
                onClick={() => setDeleteTarget(order)}
              >
                Xóa
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ─── Render ─── */

  if (isDataLoading) {
    return <HomeTableContentSkeleton />;
  }

  return (
    <PageShell fullHeight>
      <div className="grid shrink-0 gap-3 md:grid-cols-4">
        <MetricCard title="Đơn trong kỳ" value={`${filteredOrders.length} đơn`} hint={`${selectedStatus} · ${rangeLabel}`} icon={FileText} color="#2563eb" />
        <MetricCard title="Đang xử lý" value={`${inProgressOrders} đơn`} hint="Đang giặt, kiểm tra, chờ thanh toán" icon={Clock} color="#f59e0b" />
        <MetricCard title="Hoàn thành" value={`${completedOrders} đơn`} hint={overdueOrders > 0 ? `${overdueOrders} đơn quá hạn cần xử lý` : "Không có đơn quá hạn"} icon={History} color={overdueOrders > 0 ? "#ef4444" : "#10b981"} />
        <MetricCard title="Doanh thu" value={`${totalAmount.toLocaleString("vi-VN")}đ`} hint={`Trung bình ${averageAmount.toLocaleString("vi-VN")}đ/đơn`} icon={FileSpreadsheet} color="#7c3aed" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-white">
          <Toolbar
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            query={query}
            onQueryChange={(q) => { setQuery(q); setPage(1); }}
            columns={columns}
            onColumnsChange={setColumns}
            tableResizeMode={tableResizeMode}
            onTableResizeModeChange={setTableResizeMode}
            selectedCount={selectedOrderIds.size}
            onOpenAddColumn={() => setOpenAddColumn(true)}
            onOpenHistory={() => {
              setActiveHistoryOrderId(selectedOrders[0]?.id ?? null);
              setOpenHistory(true);
            }}
            onExport={onExport}
            defaultExportFileName={getDefaultExportFileName(selectedOrderIds.size)}
            onCreateClick={openCreateForm}
            createLabel="Thêm đơn"
            defaultColumnIds={defaultColumns.map((c) => c.id)}
            searchPlaceholder="Tìm mã đơn, khách, SĐT..."
          />
          <FilterBar
            rangeLabel={rangeLabel}
            selectedValue={selectedStatus}
            onValueChange={(status) => {
              setSelectedStatus(status === "Tất cả" || isOrderStatus(status) ? status : "Tất cả");
              setPage(1);
            }}
            filterOptions={orderFilterOptions}
            filterLabel="Trạng thái đơn"
            allSelected={viewMode === "Bảng kéo" ? allKanbanOrdersSelected : allVisibleSelected}
            disabled={viewMode === "Bảng kéo" ? kanbanOrderIds.length === 0 : visibleOrderIds.length === 0}
            selectedCount={viewMode === "Bảng kéo" ? selectedKanbanOrderCount : selectedVisibleOrderCount}
            totalCount={viewMode === "Bảng kéo" ? kanbanOrderIds.length : visibleOrderIds.length}
            itemLabel="đơn"
            checkboxClass={checkboxClass}
            onToggleAll={viewMode === "Bảng kéo" ? toggleKanbanOrders : toggleVisibleOrders}
          />

          {filteredOrders.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-8 text-center">
              <p className="text-sm text-slate-400">{emptyMessage}</p>
            </div>
          ) : viewMode === "Bảng" ? (
            <TableView
              columns={columns}
              rows={paginatedOrders}
              pageSize={pageSize}
              emptyMessage={emptyMessage}
              tableResizeMode={tableResizeMode}
              totalVisibleWidth={totalVisibleWidth}
              renderCell={renderOrderCell}
              columnDrag={{
                draggedColumnId,
                dragOverColumnId,
                onDragStart: handleDragStart,
                onDragOver: handleDragOver,
                onDragLeave: handleDragLeave,
                onDrop: handleDrop,
                onDragEnd: handleDragEnd,
              }}
              page={page}
              pageCount={pageCount}
              totalRows={filteredOrders.length}
              customPageSize={customPageSize}
              openPageSizeMenu={openPageSizeMenu}
              onOpenPageSizeMenuChange={setOpenPageSizeMenu}
              onCustomPageSizeChange={setCustomPageSize}
              onApplyCustomPageSize={applyCustomPageSize}
              onUpdatePageSize={updatePageSize}
              onPageChange={setPage}
            />
          ) : viewMode === "Bảng kéo" ? (
            <KanbanView
              columns={orderKanbanColumns}
              rows={filteredOrders}
              groupByKey="status"
              draggedItemId={draggedOrderId}
              onDraggedItemIdChange={setDraggedOrderId}
              dragOverColumnId={dragOverStatus}
              onDragOverColumnIdChange={(status) => setDragOverStatus(status && isOrderStatus(status) ? status : null)}
              onDropItem={(orderId, status) => {
                if (isOrderStatus(status)) void updateOrderStatus(orderId, status);
              }}
              renderCard={renderOrderKanbanCard}
              tableResizeMode={tableResizeMode}
            />
          ) : (
            <div className="flex min-h-0 flex-1 flex-col">
              <ListView
                paginatedRows={paginatedOrders}
                emptyMessage={emptyMessage}
                renderRow={renderOrderListRow}
              />
              <DashboardTableFooter
                page={page}
                pageCount={pageCount}
                pageSize={pageSize}
                totalRows={filteredOrders.length}
                customPageSize={customPageSize}
                openPageSizeMenu={openPageSizeMenu}
                onOpenPageSizeMenuChange={setOpenPageSizeMenu}
                onCustomPageSizeChange={setCustomPageSize}
                onApplyCustomPageSize={applyCustomPageSize}
                onUpdatePageSize={updatePageSize}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>

      <FormDialog
        open={openForm}
        onClose={closeForm}
        title={editingOrderId ? `Chi tiết đơn ${editingOrderId}` : "Tạo đơn giặt mới"}
        fields={orderFormFields}
        form={form}
        onFormChange={handleOrderFormChange}
        onSave={saveOrder}
        currentStaffName={currentStaffName}
        statusOptions={statuses}
        statusDotColors={statusDotColor}
        showCloseButton={false}
        showCloseButtonAtBottom={true}
        gridClassName="grid gap-4 md:grid-cols-2"
      />

      <InvoiceModal
        order={invoiceOrder}
        quantityDisplay={invoiceOrder ? formatOrderQuantity(invoiceOrder) : undefined}
        customerImageUrl={
          invoiceOrder
            ? customers.find((customer) => customer.customer_code === invoiceOrder.customerCode)?.image_url
            : null
        }
        onClose={() => setInvoiceOrder(null)}
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

          <div className={`grid min-h-0 flex-1 grid-cols-1 overflow-hidden ${selectedOrders.length > 1 ? "md:grid-cols-[220px_1fr]" : ""}`}>
            {selectedOrders.length > 1 && (
              <div className="min-h-0 border-b border-slate-200 bg-white py-3 md:border-b-0 md:border-r">
                <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Đơn hàng ({selectedOrders.length})
                </p>
                <ScrollArea className="h-[calc(100%-28px)]">
                  <div className="space-y-0.5 px-2 pt-1">
                    {selectedOrders.map((order) => {
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
                </ScrollArea>
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

                  <div className="flex-1 overflow-y-auto p-5">
                    <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
                      <span className="text-xs text-slate-600">
                        Tiến trình xử lý:{" "}
                        <span className="font-semibold text-slate-900">
                          {statuses.indexOf(activeHistoryOrder.status) + 1}/{statuses.length} trạng thái
                        </span>
                      </span>
                    </div>
                    <div className="space-y-2">
                      {statuses.map((orderStatus) => {
                        const historyRows = orderHistoryById[activeHistoryOrder.id] || [];
                        const historyRecord = [...historyRows]
                          .reverse()
                          .find((row) => mapHomeOrderStatus(row.status) === orderStatus);
                        const reached = Boolean(historyRecord);
                        const color = statusDotColor[orderStatus];
                        const dateTime = formatHistoryTimestamp(historyRecord?.changed_at);
                        const isLoading = loadingHistoryOrderId === activeHistoryOrder.id;
                        return (
                          <div key={orderStatus} className="min-h-[74px] rounded-lg border border-slate-200 bg-white px-4 py-4">
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
                                  {isLoading
                                    ? "Đang tải..."
                                    : dateTime
                                      ? `${dateTime.time} ${dateTime.date}`
                                      : "Chưa cập nhật"}
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

      <Dialog open={Boolean(profileCustomer)} onOpenChange={(open) => {
        if (!open) setProfileCustomer(null);
      }}>
        <DialogContent
          showCloseButton={false}
          className="flex h-[min(86vh,680px)] w-[min(86vw,680px)] max-w-[min(86vw,680px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[680px]"
        >
          {profileCustomer && (
            <>
              <DialogHeader className="border-b border-slate-200 px-6 py-3">
                <div className="flex items-center gap-3">
                  <OrderCustomerAvatar customer={profileCustomer} size={40} />
                  <div className="min-w-0">
                    <DialogTitle className="truncate text-base font-semibold leading-6 text-slate-950">
                      {profileCustomer.full_name}
                    </DialogTitle>
                    <p className="text-sm text-slate-500">Khách hàng · {profileCustomer.customer_code}</p>
                    <p className="mt-1 text-xs text-slate-400">{profileCustomer.rank || "Thường"}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="min-h-0 flex-1 p-5">
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    [UserRound, "Họ tên", profileCustomer.full_name],
                    [ShieldCheck, "Tên đăng nhập", profileCustomer.account_username || "Chưa liên kết"],
                    [Mail, "Email", profileCustomer.email || "-"],
                    [Phone, "Số điện thoại", profileCustomer.phone || "-"],
                    [CalendarDays, "Ngày sinh", formatDisplayDate(profileCustomer.birthday?.slice(0, 10))],
                    [Sparkles, "Điểm / hạng", `${Number(profileCustomer.loyalty_points || 0).toLocaleString("vi-VN")} điểm · ${profileCustomer.rank || "Thường"}`],
                  ].map(([Icon, label, value]) => {
                    const FieldIcon = Icon as typeof UserRound;
                    return (
                      <div key={String(label)} className="space-y-2">
                        <Label>{String(label)}</Label>
                        <div className="relative">
                          <FieldIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            value={String(value)}
                            disabled
                            className="h-8 rounded-lg border-input bg-slate-50 px-2.5 py-1 pl-8 text-sm text-slate-500 shadow-none"
                          />
                        </div>
                      </div>
                    );
                  })}
                  <div className="space-y-2 md:col-span-2">
                    <Label>Địa chỉ mặc định</Label>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        value={profileCustomer.address || "-"}
                        disabled
                        className="h-8 rounded-lg border-input bg-slate-50 px-2.5 py-1 pl-8 text-sm text-slate-500 shadow-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Ghi chú</Label>
                    <Textarea
                      value={profileCustomer.note || "-"}
                      disabled
                      className="h-16 min-h-16 resize-none rounded-lg border-input bg-slate-50 px-2.5 py-2 text-sm text-slate-500 shadow-none"
                    />
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-sm font-medium text-slate-950">Trạng thái tài khoản</p>
                  <div className="mt-3 grid gap-2 md:grid-cols-3">
                    {[
                      profileCustomer.account_username ? "Đã liên kết" : "Chưa liên kết",
                      `${Number(profileCustomer.total_orders || 0).toLocaleString("vi-VN")} đơn hàng`,
                      `${Number(profileCustomer.total_spent || 0).toLocaleString("vi-VN")}đ chi tiêu`,
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
                  onClick={() => setProfileCustomer(null)}
                >
                  Đóng
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !isDeletingOrder) setDeleteTarget(null);
        }}
        onConfirm={confirmDeleteOrder}
        isLoading={isDeletingOrder}
      >
        Bạn có chắc chắn muốn xóa đơn hàng {deleteTarget ? `"${deleteTarget.id}"` : "này"} không?
        Hành động này không thể hoàn tác.
      </DeleteConfirmDialog>
    </PageShell>
  );
}
