"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
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

import { ResizableTableHead } from "@/src/components/ui/resizable-table-head";
import { Order, OrderStatus } from "./types";
import {
  statuses,
  seedOrders,
  emptyForm,
  statusDotColor,
  statusBgColor,
  allStatusColor,
  allStatusBgColor,
  defaultColumns,
} from "./data";

export default function OrdersPage() {
  const [orders, setOrders] = useState(seedOrders);
  const [columns, setColumns] = useState(defaultColumns);
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
  const [viewMode, setViewMode] = useState<"Bảng" | "Bảng kéo">("Bảng");
  const [tableResizeMode, setTableResizeMode] = useState<"fit" | "custom">("fit");
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<OrderStatus | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [customPageSize, setCustomPageSize] = useState("");
  const [openPageSizeMenu, setOpenPageSizeMenu] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
  const normalizedRange = normalizeRange(range);
  const rangeLabel = formatRange(normalizedRange);
  const checkboxClass =
    "relative size-4 appearance-none rounded-[5px] border border-slate-300 bg-white transition-all duration-150 checked:border-emerald-300 checked:bg-emerald-300 after:absolute after:left-1/2 after:top-1/2 after:hidden after:h-[9px] after:w-[5px] after:-translate-x-1/2 after:-translate-y-[58%] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:content-[''] checked:after:block";
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
  const visibleOrderIds = useMemo(
    () => paginatedOrders.map((order) => order.id),
    [paginatedOrders],
  );
  const selectedOrders = useMemo(
    () => orders.filter((order) => selectedOrderIds.has(order.id)),
    [orders, selectedOrderIds],
  );
  const customColumns = useMemo(
    () => columns.filter((column) => !defaultColumns.some((defaultColumn) => defaultColumn.id === column.id)),
    [columns],
  );
  const visibleColumnIds = useMemo(
    () => new Set(columns.filter((column) => column.visible).map((column) => column.id)),
    [columns],
  );
  const totalVisibleWidth = useMemo(
    () => columns.filter((col) => col.visible).reduce((sum, col) => sum + (col.width || 150), 0),
    [columns],
  );
  const showField = (id: string) => visibleColumnIds.has(id);
  const activeHistoryOrder =
    selectedOrders.find((order) => order.id === activeHistoryOrderId) ?? selectedOrders[0] ?? null;
  const allVisibleSelected =
    visibleOrderIds.length > 0 && visibleOrderIds.every((id) => selectedOrderIds.has(id));
  const someVisibleSelected =
    visibleOrderIds.some((id) => selectedOrderIds.has(id)) && !allVisibleSelected;

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = someVisibleSelected;
    }
  }, [someVisibleSelected]);


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

  const toggleOrder = (id: string) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const getStatusTime = (order: Order, statusIndex: number, isCurrentStatus: boolean) => {
    if (statusIndex === 0) return `${order.createdAt} · ${order.appointment || "Tiếp nhận"}`;
    if (isCurrentStatus && order.deliveryTime !== "Chưa hẹn") {
      return `${order.deliveryDate} · ${order.deliveryTime}`;
    }

    const baseDate = new Date(`${order.createdAt}T08:00:00`);
    if (Number.isNaN(baseDate.getTime())) return `${order.createdAt} · Chưa ghi giờ`;

    baseDate.setHours(baseDate.getHours() + statusIndex * 2);
    return baseDate.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const colorWithAlpha = (hex: string, alpha: number) => {
    const value = hex.replace("#", "");
    const red = parseInt(value.slice(0, 2), 16);
    const green = parseInt(value.slice(2, 4), 16);
    const blue = parseInt(value.slice(4, 6), 16);
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
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
      Object.fromEntries(customColumns.map((column) => [column.id, String(source?.[column.id] ?? "")])),
    [customColumns],
  );

  const addCustomColumn = () => {
    const label = newColumnName.trim();
    if (!label) return;

    const newColumn = {
      id: `custom_${Date.now()}`,
      label,
      width: 150,
      visible: true,
    };

    setColumns((prev) => {
      const next = [...prev];
      const actionIndex = next.findIndex((column) => column.id === "actions");
      next.splice(actionIndex === -1 ? next.length : actionIndex, 0, newColumn);
      return next;
    });
    setForm((prev) => ({ ...prev, [newColumn.id]: "" }));
    setNewColumnName("");
    setOpenAddColumn(false);
  };

  const handleDragStart = (e: React.DragEvent<HTMLTableCellElement>, id: string) => {
    setDraggedColumnId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableCellElement>, id: string) => {
    e.preventDefault();
    if (id !== draggedColumnId) {
      setDragOverColumnId(id);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumnId(null);
  };

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

  const openCreateForm = useCallback(() => {
    setEditingOrderId(null);
    setForm({ ...emptyForm, ...getCustomFields(), createdAt: new Date().toISOString().slice(0, 10) });
    setOpenForm(true);
  }, [getCustomFields]);

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
      ...getCustomFields(order),
    });
    setOpenForm(true);
  };

  const closeForm = () => {
    setOpenForm(false);
    setEditingOrderId(null);
    setForm(emptyForm);
  };

  useEffect(() => {
    const handleCreateOrder = () => openCreateForm();
    window.addEventListener("orders:create", handleCreateOrder);

    if (new URLSearchParams(window.location.search).get("create") === "1") {
      handleCreateOrder();
      window.history.replaceState(null, "", window.location.pathname);
    }

    return () => window.removeEventListener("orders:create", handleCreateOrder);
  }, [openCreateForm]);

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
      ...getCustomFields(form),
    };

    if (editingOrderId) {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === editingOrderId ? { ...order, ...payload } as Order : order,
        ),
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

  return (
    <PageShell fullHeight>
      <div className="flex min-h-0 flex-1 flex-col">
        {/* ════════════ MAIN TABLE CONTAINER ════════════ */}
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-white">
          {/* ── Top toolbar ── */}
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 pt-1 pb-3 xl:flex-row xl:items-center xl:justify-between">
            {/* Left: view tabs */}
            <div className="flex items-center gap-1">
              {([
                ["Bảng", Table2],
                ["Bảng kéo", Kanban],
              ] as const).map(([label, Icon]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setViewMode(label)}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all ${viewMode === label
                    ? "border-slate-300 bg-slate-50 text-slate-800 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800"
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
                  className="h-8 rounded-md border-slate-200 bg-white pl-8 text-xs text-slate-700 shadow-none placeholder:text-slate-500 focus-visible:ring-slate-200"
                  placeholder="Tìm mã đơn, khách, SĐT..."
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs text-slate-700 transition-colors hover:bg-slate-50">
                    <EyeOff className="size-3.5" />
                    Ẩn cột
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Hiển thị cột</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {columns.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.visible}
                      onCheckedChange={(value) => {
                        setColumns((prev) =>
                          prev.map((c) =>
                            c.id === column.id ? { ...c, visible: !!value } : c
                          )
                        );
                      }}
                    >
                      {column.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs text-slate-700 transition-colors hover:bg-slate-50">
                    <Settings className="size-3.5" />
                    Tùy chỉnh
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setOpenAddColumn(true)}>
                    <Plus className="size-3.5 mr-2" />
                    Thêm cột mới
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Co giãn dữ liệu bảng</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={tableResizeMode === "fit"}
                    onCheckedChange={(checked) => {
                      if (checked) setTableResizeMode("fit");
                    }}
                  >
                    Tự động vừa thiết bị
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={tableResizeMode === "custom"}
                    onCheckedChange={(checked) => {
                      if (checked) setTableResizeMode("custom");
                    }}
                  >
                    Kéo giãn nâng cao
                  </DropdownMenuCheckboxItem>
                  {customColumns.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Xóa cột tùy chỉnh</DropdownMenuLabel>
                      {customColumns.map((col) => (
                        <DropdownMenuItem
                          key={col.id}
                          className="text-red-600 focus:text-red-600"
                          onClick={() => {
                            setColumns((prev) => prev.filter((c) => c.id !== col.id));
                          }}
                        >
                          <X className="size-3.5 mr-2" />
                          Xóa &quot;{col.label}&quot;
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50 disabled:text-slate-300 disabled:hover:bg-transparent"
                disabled={selectedOrderIds.size === 0}
                onClick={() => {
                  setActiveHistoryOrderId(selectedOrders[0]?.id ?? null);
                  setOpenHistory(true);
                }}
              >
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

          {viewMode === "Bảng" ? (
            <>
              {/* ── Table ── */}
              <div className="flex-1 overflow-auto [&_div[data-slot=table-container]]:overflow-visible">
                <Table className={`${tableResizeMode === "fit" ? "w-full table-fixed" : "w-max table-fixed"} text-xs`}>
              <TableHeader>
                <TableRow className="h-9 border-b border-slate-100 bg-slate-50 hover:bg-slate-50">
                  {columns.filter(c => c.visible).map(col => (
                    <ResizableTableHead
                      key={col.id}
                      width={tableResizeMode === "fit" ? undefined : col.width}
                      autoWidth={tableResizeMode === "fit"}
                      style={tableResizeMode === "fit" ? { width: `${((col.width || 120) / totalVisibleWidth) * 100}%` } : undefined}
                      className={`text-xs font-medium text-slate-600 ${col.id === 'actions' ? 'text-left' : ''} ${dragOverColumnId === col.id ? 'bg-slate-200/50' : ''} ${draggedColumnId === col.id ? 'opacity-50' : ''}`}
                      draggable={tableResizeMode === "custom"}
                      onDragStart={(e) => handleDragStart(e, col.id)}
                      onDragOver={(e) => handleDragOver(e, col.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, col.id)}
                      onDragEnd={handleDragEnd}
                    >
                      {col.id === "id" ? (
                        <span className="inline-flex items-center gap-2">
                          <input
                            ref={selectAllCheckboxRef}
                            type="checkbox"
                            aria-label="Chọn tất cả đơn hàng"
                            checked={allVisibleSelected}
                            disabled={visibleOrderIds.length === 0}
                            onChange={toggleVisibleOrders}
                            className={checkboxClass}
                          />
                          {col.label}
                        </span>
                      ) : (
                        col.label
                      )}
                    </ResizableTableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.filter(c => c.visible).length}>
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
                      {columns.filter(c => c.visible).map(col => {
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
                              {/* <Clock className="size-3.5 shrink-0 text-slate-400" /> */}
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

                        // Default fallback for custom columns
                        const val = order[col.id];
                        return (
                          <TableCell key={col.id} className={`truncate overflow-hidden max-w-0 ${!val ? "text-slate-400 italic" : "text-slate-600"}`} title={val || "Chưa có"}>
                            {val || "Chưa có"}
                          </TableCell>
                        );
                      })}
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
                      {Array.from({ length: columns.filter(c => c.visible).length - 1 }).map((_, j) => (
                        <TableCell key={j}>&nbsp;</TableCell>
                      ))}
                    </TableRow>
                  ))
                }
              </TableBody>
                </Table>
              </div>

              {/* ── Pagination footer ── */}
              <div className="border-t border-slate-200 px-5 pt-3 pb-1">
                <div className="flex flex-col gap-3 text-xs text-slate-700 sm:flex-row sm:items-center sm:justify-between">
	                  <div className="flex flex-wrap items-center gap-3">
	                    <span>Số dòng mỗi trang</span>
                      <DropdownMenu open={openPageSizeMenu} onOpenChange={setOpenPageSizeMenu}>
                        <DropdownMenuTrigger asChild>
                          <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 px-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50">
                            {pageSize}
                            <ChevronDown className="size-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-44">
                          {[5, 10, 20, 50].map((size) => (
                            <DropdownMenuItem key={size} onClick={() => updatePageSize(size)}>
                              {size} dòng
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <div className="p-2">
                            <Label htmlFor="customPageSize" className="text-xs text-slate-500">
                              Tự nhập
                            </Label>
                            <div className="mt-1 flex gap-1.5">
                              <Input
                                id="customPageSize"
                                type="number"
                                min={1}
                                max={500}
                                value={customPageSize}
                                onChange={(event) => setCustomPageSize(event.target.value)}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter") applyCustomPageSize();
                                }}
                                className="h-8 text-xs"
                                placeholder="VD: 15"
                              />
                              <Button type="button" size="sm" className="h-8 px-2 text-xs" onClick={applyCustomPageSize}>
                                OK
                              </Button>
                            </div>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
            </>
          ) : (
            <div className={`flex-1 p-5 bg-slate-50/30 min-h-0 ${
              tableResizeMode === "fit"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-y-auto"
                : "flex gap-4 overflow-x-auto"
            }`}>
              {statuses.map((status) => {
                const colOrders = filteredOrders.filter((order) => order.status === status);

                return (
                  <div
                    key={status}
                    className={`flex flex-col rounded-xl border border-slate-200 bg-slate-100/50 p-3 transition-colors ${
                      tableResizeMode === "fit" ? "w-full min-h-[300px]" : "min-w-[300px] max-w-[300px]"
                    } ${dragOverStatus === status ? "border-slate-400 bg-slate-200/50" : ""}`}
                    onDragOver={(event) => {
                      event.preventDefault();
                      if (dragOverStatus !== status) setDragOverStatus(status);
                    }}
                    onDragLeave={() => setDragOverStatus(null)}
                    onDrop={(event) => {
                      event.preventDefault();
                      if (draggedOrderId) {
                        setOrders((prev) =>
                          prev.map((order) =>
                            order.id === draggedOrderId ? { ...order, status } : order,
                          ),
                        );
                      }
                      setDraggedOrderId(null);
                      setDragOverStatus(null);
                    }}
                  >
                    <div className="mb-3 flex items-center justify-between px-1">
                      <span className="font-semibold text-slate-800">{status}</span>
                      <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-500">
                        {colOrders.length}
                      </span>
                    </div>

                    <div className="flex h-full min-h-[100px] flex-col gap-3 overflow-y-auto px-1 pb-2">
                      {colOrders.map((order) => (
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
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-900">{order.id}</span>
                            <span className="rounded-sm bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                              {order.deliveryDate}
                            </span>
                          </div>
                          <p className="mt-2 text-sm font-medium text-slate-700">{order.customer}</p>
                          <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500">
                            <List className="size-3" /> {order.service} · {order.quantity}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500">
                            <Clock className="size-3" /> Hẹn: {order.appointment} · Giao: {order.deliveryTime}
                          </p>
                          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
                            <span className="text-[13px] font-bold text-slate-900">
                              {order.amount.toLocaleString("vi-VN")}đ
                            </span>
                            <button
                              type="button"
                              onClick={() => openEditForm(order)}
                              className="inline-flex h-6 items-center rounded-md bg-slate-100 px-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
                            >
                              Chi tiết
                            </button>
                          </div>
                        </div>
                      ))}

                      {colOrders.length === 0 && (
                        <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
                          Kéo thả vào đây
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ════════════ MODAL: Create / Edit ════════════ */}
      {openForm && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <Card className="h-[min(86vh,680px)] w-[min(86vw,680px)] overflow-hidden rounded-xl border-2 border-slate-300 shadow-2xl">
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
            <CardContent className="h-[calc(100%-73px)] overflow-y-auto p-6">
              <div className="grid gap-4">
                {showField("customer") && (
                  <div className="space-y-2">
                    <Label>Khách hàng</Label>
                    <Input value={form.customer} onChange={(event) => setForm({ ...form, customer: event.target.value })} placeholder="Tên khách" />
                  </div>
                )}
                {showField("phone") && (
                  <div className="space-y-2">
                    <Label>Số điện thoại</Label>
                    <Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="090..." />
                  </div>
                )}
                {showField("service") && (
                  <div className="space-y-2">
                    <Label>Dịch vụ</Label>
                    <Input value={form.service} onChange={(event) => setForm({ ...form, service: event.target.value })} />
                  </div>
                )}
                {showField("quantity") && (
                  <div className="space-y-2">
                    <Label>Số lượng</Label>
                    <Input value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} placeholder="5 kg / 3 món" />
                  </div>
                )}
                {showField("deliveryTime") && (
                  <div className="space-y-2">
                    <Label>Giờ giao</Label>
                    <Input type="time" value={form.deliveryTime} onChange={(event) => setForm({ ...form, deliveryTime: event.target.value })} />
                  </div>
                )}
                {showField("createdAt") && (
                  <div className="space-y-2">
                    <Label>Thời gian</Label>
                    <Input type="date" value={form.createdAt} onChange={(event) => setForm({ ...form, createdAt: event.target.value })} />
                  </div>
                )}
                {showField("staff") && (
                  <div className="space-y-2">
                    <Label>Nhân viên xử lý</Label>
                    <Input value={form.staff} onChange={(event) => setForm({ ...form, staff: event.target.value })} placeholder="Chưa gán" />
                  </div>
                )}
                {showField("amount") && (
                  <div className="space-y-2">
                    <Label>Tạm tính</Label>
                    <Input type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
                  </div>
                )}
                {customColumns.filter((column) => column.visible).map((column) => (
                  <div key={column.id} className="space-y-2">
                    <Label>{column.label}</Label>
                    <Input
                      value={form[column.id] ?? ""}
                      onChange={(event) => setForm({ ...form, [column.id]: event.target.value })}
                      placeholder={`Nhập ${column.label.toLowerCase()}`}
                    />
                  </div>
                ))}
                {showField("status") && (
                  <div className="space-y-2 md:col-span-2">
                    <Label>Cập nhật trạng thái</Label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {statuses.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setForm({ ...form, status })}
                          className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-all hover:shadow-sm ${form.status === status ? "shadow-sm ring-2 ring-offset-1" : ""}`}
                          style={{
                            color: form.status === status ? statusDotColor[status] : "#475569",
                            backgroundColor: form.status === status ? colorWithAlpha(statusDotColor[status], 0.12) : "#fff",
                            borderColor: form.status === status ? colorWithAlpha(statusDotColor[status], 0.35) : "#e2e8f0",
                            ["--tw-ring-color" as string]: colorWithAlpha(statusDotColor[status], 0.16),
                          }}
                        >
                          <span
                            className="size-2 rounded-full ring-2"
                            style={{
                              backgroundColor: statusDotColor[status],
                              ["--tw-ring-color" as string]: colorWithAlpha(statusDotColor[status], 0.16),
                            }}
                          />
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="md:col-span-2">
                  <Button className="w-full bg-slate-900 text-white hover:bg-slate-800" onClick={saveOrder}>
                    {editingOrderId ? "Lưu thay đổi" : "Lưu đơn và đưa vào tiếp nhận"}
                  </Button>
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

      {openHistory && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <Card className="max-h-[86dvh] w-full max-w-3xl overflow-hidden border-blue-100 bg-card shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between border-b border-blue-100 bg-card px-4 py-3">
              <div>
                <CardTitle className="text-base font-semibold">Lịch sử đơn hàng</CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {selectedOrders.length} đơn đang được chọn
                </p>
              </div>
              <button
                type="button"
                className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setOpenHistory(false)}
              >
                <X className="size-5" />
              </button>
            </CardHeader>
            <CardContent className="grid max-h-[calc(86dvh-73px)] min-h-[420px] overflow-hidden p-0 md:grid-cols-[230px_1fr]">
              <div className="border-b border-blue-100 bg-muted/30 p-2 md:border-b-0 md:border-r">
                <div className="flex max-h-44 gap-1.5 overflow-x-auto md:max-h-[calc(86dvh-90px)] md:flex-col md:overflow-x-hidden md:overflow-y-auto">
                  {selectedOrders.map((order) => {
                    const active = activeHistoryOrder?.id === order.id;

                    return (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => setActiveHistoryOrderId(order.id)}
                        className={`min-w-[200px] rounded-md border px-2.5 py-2 text-left transition-colors md:min-w-0 ${active
                          ? "border-blue-100 bg-card shadow-sm"
                          : "border-transparent bg-transparent hover:border-blue-100 hover:bg-card"
                          }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-xs font-semibold text-foreground">{order.id}</span>
                          <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ color: statusDotColor[order.status], backgroundColor: statusBgColor[order.status] }}>
                            {order.status}
                          </span>
                        </div>
                        <p className="mt-1.5 truncate text-xs font-medium text-foreground/80">{order.customer}</p>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{order.service} · {order.quantity}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="overflow-y-auto p-4">
                {activeHistoryOrder && (() => {
                  const currentStatusIndex = statuses.indexOf(activeHistoryOrder.status);

                  return (
                    <div>
                      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {activeHistoryOrder.id} · {activeHistoryOrder.customer}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {activeHistoryOrder.phone} · {activeHistoryOrder.address}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {activeHistoryOrder.service} · {activeHistoryOrder.quantity} · {activeHistoryOrder.staff}
                          </p>
                        </div>
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                          style={{
                            color: statusDotColor[activeHistoryOrder.status],
                            backgroundColor: statusBgColor[activeHistoryOrder.status],
                          }}
                        >
                          <span className="size-2 rounded-full" style={{ backgroundColor: statusDotColor[activeHistoryOrder.status] }} />
                          {activeHistoryOrder.status}
                        </span>
                      </div>

                      <div className="space-y-0 text-sm">
                        {statuses.map((status, idx) => {
                          const reached = idx <= currentStatusIndex;
                          const isCurrentStatus = status === activeHistoryOrder.status;
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
                                    ? getStatusTime(activeHistoryOrder, idx, isCurrentStatus)
                                    : "Chưa cập nhật"}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={openAddColumn} onOpenChange={setOpenAddColumn}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Thêm cột tùy chỉnh</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="columnName" className="text-sm font-medium">Tên cột mới</Label>
              <Input
                id="columnName"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="VD: Ghi chú thêm, Kênh đặt..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") addCustomColumn();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAddColumn(false)}>Hủy</Button>
            <Button onClick={addCustomColumn}>Thêm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
