"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Clock,
  FileSpreadsheet,
  FileText,
  History,
  Pencil,
} from "lucide-react";
import { TableCell } from "@/components/ui/table";
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
} from "@/src/utils/dashboard-time";
import { Order, OrderStatus, ColumnDef } from "./types";
import {
  statuses,
  seedOrders,
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
  getStatusTime,
} from "./orders-helpers";

import { MetricCard } from "../_components/metric-card";
import { Toolbar } from "../_components/toolbar";
import { FilterBar } from "../_components/filter-bar";
import { TableView } from "../_components/table-view";
import { KanbanView } from "../_components/kanban-view";
import { ListView } from "../_components/list-view";
import { FormDialog, type FormField } from "../_components/form-dialog";
import { InvoiceModal } from "./_components/invoice-modal";
import { HistoryModal } from "../_components/history-modal";
import { AddColumnDialog } from "../_components/add-column-dialog";

export default function OrdersPage() {
  /* ─── State ─── */
  const [orders, setOrders] = useState(seedOrders);
  const [columns, setColumns] = useState<ColumnDef[]>(defaultColumns);
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "Tất cả">("Tất cả");
  const range = useDashboardTimeRangeStore((state) => state.range);
  const [page, setPage] = useState(1);
  const [openForm, setOpenForm] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [openHistory, setOpenHistory] = useState(false);
  const [activeHistoryOrderId, setActiveHistoryOrderId] = useState<string | null>(null);
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
  const [currentStaffName] = useState(() => {
    if (typeof window === "undefined") return "Chưa gán";
    return (
      localStorage.getItem("accountName") ||
      localStorage.getItem("username") ||
      "Chưa gán"
    );
  });

  /* ─── Derived values ─── */
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
  const customColumns = useMemo(
    () => columns.filter((c) => !defaultColumns.some((dc) => dc.id === c.id)),
    [columns],
  );
  const exportColumns = useMemo(
    () => columns.filter((c) => c.visible && c.id !== "actions"),
    [columns],
  );
  const hourOptions = useMemo(
    () => Array.from({ length: 24 }, (_, h) => String(h).padStart(2, "0")),
    [],
  );
  const minuteOptions = useMemo(
    () => Array.from({ length: 60 }, (_, m) => String(m).padStart(2, "0")),
    [],
  );
  const visibleColumnIds = useMemo(
    () => new Set(columns.filter((c) => c.visible).map((c) => c.id)),
    [columns],
  );
  const totalVisibleWidth = useMemo(
    () => columns.filter((c) => c.visible).reduce((sum, c) => sum + (c.width || 150), 0),
    [columns],
  );

  const activeHistoryOrder =
    selectedOrders.find((o) => o.id === activeHistoryOrderId) ?? selectedOrders[0] ?? null;
  const allVisibleSelected =
    visibleOrderIds.length > 0 && visibleOrderIds.every((id) => selectedOrderIds.has(id));
  const allKanbanOrdersSelected =
    kanbanOrderIds.length > 0 && kanbanOrderIds.every((id) => selectedOrderIds.has(id));
  const selectedVisibleOrderCount = visibleOrderIds.filter((id) => selectedOrderIds.has(id)).length;
  const selectedKanbanOrderCount = kanbanOrderIds.filter((id) => selectedOrderIds.has(id)).length;

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

  const addCustomColumn = () => {
    const label = newColumnName.trim();
    if (!label) return;
    const newColumn: ColumnDef = { id: `custom_${Date.now()}`, label, width: 150, visible: true };
    setColumns((prev) => {
      const next = [...prev];
      const actionIndex = next.findIndex((c) => c.id === "actions");
      next.splice(actionIndex === -1 ? next.length : actionIndex, 0, newColumn);
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
      const temp = newCols[draggedIdx];
      newCols[draggedIdx] = newCols[dropIdx];
      newCols[dropIdx] = temp;
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
    setEditingOrderId(null);
    setForm({
      ...emptyForm,
      ...getCustomFields(),
      staff: currentStaffName,
      createdAt: new Date().toISOString().slice(0, 10),
    });
    setOpenForm(true);
  }, [currentStaffName, getCustomFields]);

  const openEditForm = useCallback((order: Order) => {
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
      ...getCustomFields(order),
    });
    setOpenForm(true);
  }, [getCustomFields]);

  const closeForm = () => {
    setOpenForm(false);
    setEditingOrderId(null);
    setForm(emptyForm);
  };

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
      setInvoiceOrder(matchedOrder);
      setQuery(matchedOrder.id);
      setPage(1);
      window.history.replaceState(null, "", window.location.pathname);
    } else if (matchedOrder && action === "edit") {
      openEditForm(matchedOrder);
      setQuery(matchedOrder.id);
      setPage(1);
      window.history.replaceState(null, "", window.location.pathname);
    }

    return () => window.removeEventListener("orders:create", handleCreateOrder);
  }, [openCreateForm, openEditForm, orders]);

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
      staff: currentStaffName || form.staff || "Chưa gán",
      createdAt: form.createdAt || new Date().toISOString().slice(0, 10),
      note: `${form.note}${form.discount ? ` · Mã ${form.discount}` : ""}`,
      ...getCustomFields(form),
    };

    if (editingOrderId) {
      setOrders((prev) =>
        prev.map((o) => (o.id === editingOrderId ? { ...o, ...payload } as Order : o)),
      );
    } else {
      setOrders((prev) => [
        { id: `DH-${Date.now().toString().slice(-4)}`, ...payload } as Order,
        ...prev,
      ]);
    }
    setPage(1);
    closeForm();
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
    const baseFields: FormField[] = [
      { id: "customer", label: "Khách hàng", type: "text", placeholder: "Tên khách" },
      { id: "phone", label: "Số điện thoại", type: "text", placeholder: "090..." },
      { id: "service", label: "Dịch vụ", type: "text" },
      { id: "quantity", label: "Số lượng", type: "text", placeholder: "5 kg / 3 món" },
      { id: "deliveryTime", label: "Giờ giao", type: "time" },
      { id: "createdAt", label: "Thời gian", type: "date" },
      { id: "staff", label: "Nhân viên xử lý", type: "custom_staff" },
      { id: "amount", label: "Giá tiền", type: "number" },
      { id: "status", label: "Cập nhật trạng thái", type: "custom_status" },
    ];
    return baseFields.filter((f) => visibleColumnIds.has(f.id));
  }, [visibleColumnIds]);

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

  const renderOrderCell = (order: Order, col: { id: string }) => {
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
    if (col.id === "customer") return (
      <TableCell key={col.id} className="truncate overflow-hidden max-w-0" title={order.customer}>
        <div className="flex min-w-0 items-center gap-2">
          <Image src="https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif" alt={order.customer} width={28} height={28} className="size-6 shrink-0 rounded-full object-cover" />
          <span className="truncate font-medium text-slate-900">{order.customer}</span>
        </div>
      </TableCell>
    );
    if (col.id === "phone") return (
      <TableCell key={col.id} className="truncate overflow-hidden max-w-0" title={order.phone}>
        <a href={`tel:${order.phone}`} className="text-slate-500 transition-colors hover:text-slate-800">{order.phone}</a>
      </TableCell>
    );
    if (col.id === "service") return (
      <TableCell key={col.id} className="text-slate-600 truncate overflow-hidden max-w-0" title={order.service}>{order.service}</TableCell>
    );
    if (col.id === "quantity") return (
      <TableCell key={col.id} className="text-slate-600 truncate overflow-hidden max-w-0" title={order.quantity}>{order.quantity}</TableCell>
    );
    if (col.id === "amount") return (
      <TableCell key={col.id} className="font-medium text-slate-900 truncate overflow-hidden max-w-0" title={`${order.amount.toLocaleString("vi-VN")}đ`}>
        {order.amount.toLocaleString("vi-VN")}đ
      </TableCell>
    );
    if (col.id === "deliveryTime") return (
      <TableCell key={col.id} className="text-slate-500 truncate overflow-hidden max-w-0" title={order.deliveryTime}>{order.deliveryTime}</TableCell>
    );
    if (col.id === "staff") return (
      <TableCell key={col.id} className="truncate overflow-hidden max-w-0" title={order.staff}>
        <div className="flex items-center gap-2">
          {order.staff === "Chưa gán" ? (
            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-400 border border-slate-200/60 shadow-sm">?</div>
          ) : (
            <Image src="https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif" alt={order.staff} width={24} height={24} className="size-6 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm" />
          )}
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
      <TableCell key={col.id} className="truncate overflow-hidden max-w-0" title={order.createdAt}>
        <div className="flex items-center gap-2 text-slate-500">
          <span className="text-xs truncate">{order.createdAt}</span>
        </div>
      </TableCell>
    );
    if (col.id === "actions") return (
      <TableCell key={col.id} className="px-4 overflow-hidden max-w-0">
        <div className="flex items-center justify-start gap-1.5">
          <button type="button" className="inline-flex shrink-0 h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50" onClick={() => openEditForm(order)} title="Xem chi tiết">
            <Pencil className="size-3.5" />Sửa
          </button>
          <button type="button" className="inline-flex shrink-0 h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50" onClick={() => setInvoiceOrder(order)} title="Hóa đơn">
            <FileText className="size-3.5" />Hóa đơn
          </button>
        </div>
      </TableCell>
    );

    const val = order[col.id];
    const displayValue = val ? String(val) : "Chưa có";
    return (
      <TableCell key={col.id} className={`truncate overflow-hidden max-w-0 ${!val ? "text-slate-400 italic" : "text-slate-600"}`} title={displayValue}>
        {displayValue}
      </TableCell>
    );
  };

  const renderOrderKanbanCard = (order: Order) => {
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
            <Image
              src="https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif"
              alt={order.customer}
              width={32}
              height={32}
              className="size-8 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-700">{order.customer}</p>
              <p className="truncate text-[11px] text-slate-400">{order.phone}</p>
            </div>
          </div>
          <span className="shrink-0 text-[11px] font-semibold text-slate-400">{order.id}</span>
        </div>
        <p className="mt-2 truncate text-xs text-slate-500">{order.service} · {order.quantity}</p>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
          <span className="truncate text-[11px] text-slate-500">{order.deliveryTime}</span>
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
            <Image
              src="https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif"
              alt={order.customer}
              width={40}
              height={40}
              className="size-10 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-950">{order.id}</span>
                <span className="text-xs font-medium text-slate-400">·</span>
                <span className="text-xs font-semibold text-slate-700">{order.customer}</span>
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
                <span>{order.service} · {order.quantity}</span>
                <span>Hẹn giao: {order.deliveryDate} · {order.deliveryTime}</span>
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
              <Pencil className="size-3.5" />
              Sửa
            </button>
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-slate-50"
              onClick={() => setInvoiceOrder(order)}
            >
              <FileText className="size-3.5" />
              Hóa đơn
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ─── Render ─── */
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
            onValueChange={(status) => { setSelectedStatus(status as any); setPage(1); }}
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

          {viewMode === "Bảng" ? (
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
              onDragOverColumnIdChange={(status) => setDragOverStatus(status as any)}
              onDropItem={(orderId, status) => {
                setOrders((prev) =>
                  prev.map((o) => (o.id === orderId ? { ...o, status: status as any } : o)),
                );
              }}
              renderCard={renderOrderKanbanCard}
              tableResizeMode={tableResizeMode}
            />
          ) : (
            <ListView
              paginatedRows={paginatedOrders}
              emptyMessage={emptyMessage}
              renderRow={renderOrderListRow}
            />
          )}
        </div>
      </div>

      <FormDialog
        open={openForm}
        onClose={closeForm}
        title={editingOrderId ? `Chi tiết đơn ${editingOrderId}` : "Tạo đơn giặt mới"}
        fields={orderFormFields}
        form={form}
        onFormChange={(newForm) => setForm(newForm as any)}
        onSave={saveOrder}
        customColumns={customColumns}
        currentStaffName={currentStaffName}
        statusOptions={statuses}
        statusDotColors={statusDotColor}
      />

      <InvoiceModal
        order={invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
      />

      <HistoryModal
        open={openHistory}
        onClose={() => setOpenHistory(false)}
        title="Lịch sử đơn hàng"
        items={selectedOrders}
        activeItemId={activeHistoryOrderId}
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
