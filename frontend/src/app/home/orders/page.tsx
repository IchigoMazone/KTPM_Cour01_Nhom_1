"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarClock,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Download,
  EyeOff,
  FileDown,
  FileSpreadsheet,
  FileText,
  FileType,
  History,
  Kanban,
  List,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  DialogClose,
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
  toInputDate,
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

type ExportFormat = "pdf" | "excel" | "csv";
type SaveFilePickerWindow = Window & {
  showSaveFilePicker?: (options: {
    suggestedName?: string;
    types?: Array<{
      description: string;
      accept: Record<string, string[]>;
    }>;
  }) => Promise<{
    createWritable: () => Promise<{
      write: (data: Blob) => Promise<void>;
      close: () => Promise<void>;
    }>;
  }>;
};

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
  const [currentStaffName] = useState(() => {
    if (typeof window === "undefined") return "Chưa gán";

    return (
      localStorage.getItem("accountName") ||
      localStorage.getItem("username") ||
      "Chưa gán"
    );
  });
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
  const exportColumns = useMemo(
    () => columns.filter((column) => column.visible && column.id !== "actions"),
    [columns],
  );
  const hourOptions = useMemo(
    () => Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, "0")),
    [],
  );
  const minuteOptions = useMemo(
    () => Array.from({ length: 60 }, (_, minute) => String(minute).padStart(2, "0")),
    [],
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

  const getDeliveryTimeParts = () => {
    if (!/^\d{2}:\d{2}$/.test(form.deliveryTime)) {
      return { hour: "", minute: "" };
    }

    const [hour, minute] = form.deliveryTime.split(":");
    return { hour, minute };
  };

  const updateDeliveryTimePart = (part: "hour" | "minute", value: string) => {
    const current = getDeliveryTimeParts();
    const nextHour = part === "hour" ? value : current.hour || "00";
    const nextMinute = part === "minute" ? value : current.minute || "00";

    setForm({ ...form, deliveryTime: `${nextHour}:${nextMinute}` });
  };

  const getCreatedAtDate = () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.createdAt)) return undefined;

    const date = fromOrderDate(form.createdAt);
    return Number.isNaN(date.getTime()) ? undefined : date;
  };

  const getExportRows = () => {
    return selectedOrderIds.size > 0 ? selectedOrders : orders;
  };

  const formatExportDate = (date: Date) =>
    date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const getExportValue = (order: Order, columnId: string) => {
    const value = order[columnId];

    if (columnId === "amount") {
      return `${order.amount.toLocaleString("vi-VN")}đ`;
    }

    return value === undefined || value === null || value === "" ? "Chưa có" : String(value);
  };

  const downloadBlob = async (
    content: BlobPart,
    fileName: string,
    type: string,
    extension: string,
    description: string,
  ) => {
    const blob = new Blob([content], { type });
    const savePicker = (window as SaveFilePickerWindow).showSaveFilePicker;

    if (savePicker) {
      try {
        const fileHandle = await savePicker({
          suggestedName: fileName,
          types: [
            {
              description,
              accept: {
                [type.split(";")[0]]: [extension],
              },
            },
          ],
        });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const sanitizeFileName = (value: string) =>
    value
      .trim()
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const getDefaultExportFileName = () => {
    const fileScope = selectedOrderIds.size > 0 ? "da-chon" : "tat-ca";
    const fileDate = new Date().toISOString().slice(0, 10);

    return `don-hang-${fileScope}-${fileDate}`;
  };

  const handleExport = async (format: ExportFormat, fileName: string) => {
    const rows = getExportRows();
    if (rows.length === 0) return;

    const fileScope = selectedOrderIds.size > 0 ? "da-chon" : "tat-ca";
    const fileDate = new Date().toISOString().slice(0, 10);
    const baseFileName = sanitizeFileName(fileName) || `don-hang-${fileScope}-${fileDate}`;
    const exportStartDate = formatExportDate(normalizedRange.start);
    const exportEndDate = formatExportDate(normalizedRange.end);
    const exportedAt = new Date().toLocaleString("vi-VN");
    const exportTotalAmount = rows.reduce((sum, order) => sum + order.amount, 0);
    const exportTotalLabel = `${exportTotalAmount.toLocaleString("vi-VN")}đ`;

    if (format === "csv") {
      const csvRows = [
        ["Từ ngày", exportStartDate],
        ["Đến ngày", exportEndDate],
        ["Thời điểm xuất file", exportedAt],
        ["Số đơn", String(rows.length)],
        ["Tổng doanh thu", exportTotalLabel],
        [],
        exportColumns.map((column) => column.label),
        ...rows.map((order) => exportColumns.map((column) => getExportValue(order, column.id))),
      ];
      const csv = csvRows
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");
      await downloadBlob(
        `\uFEFF${csv}`,
        `${baseFileName}.csv`,
        "text/csv;charset=utf-8",
        ".csv",
        "CSV",
      );
      return;
    }

    const tableHead = exportColumns
      .map((column) => `<th>${escapeHtml(column.label)}</th>`)
      .join("");
    const tableBody = rows
      .map(
        (order) =>
          `<tr>${exportColumns
            .map((column) => `<td>${escapeHtml(getExportValue(order, column.id))}</td>`)
            .join("")}</tr>`,
      )
      .join("");
    const htmlTable = `
      <table>
        <thead><tr>${tableHead}</tr></thead>
        <tbody>${tableBody}</tbody>
      </table>
    `;
    const exportSummary = `
      <div class="summary">
        <p><span>Thời gian:</span> từ ${escapeHtml(exportStartDate)} đến ${escapeHtml(exportEndDate)}</p>
        <p><span>Thời điểm xuất file:</span> ${escapeHtml(exportedAt)}</p>
        <p><span>Số đơn:</span> ${rows.length}</p>
        <p><span>Tổng doanh thu:</span> ${escapeHtml(exportTotalLabel)}</p>
      </div>
    `;

    if (format === "excel") {
      const workbook = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              h1 { font-size: 18px; }
              .summary { margin-bottom: 16px; }
              .summary p { margin: 0 0 4px; }
              .summary span { font-weight: 700; }
              table { border-collapse: collapse; }
              th, td { border: 1px solid #d9e2ec; padding: 8px; }
              th { background: #f8fafc; }
            </style>
          </head>
          <body>
            <h1>Danh sách đơn hàng</h1>
            ${exportSummary}
            ${htmlTable}
          </body>
        </html>
      `;
      await downloadBlob(
        workbook,
        `${baseFileName}.xls`,
        "application/vnd.ms-excel;charset=utf-8",
        ".xls",
        "Excel",
      );
      return;
    }

    const printWindow = window.open("", "_blank", "width=1200,height=800");
    if (!printWindow) return;

    printWindow.document.write(`
      <!doctype html>
      <html lang="vi">
        <head>
          <meta charset="utf-8" />
          <title>${escapeHtml(baseFileName)}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #0f172a; padding: 24px; }
            h1 { font-size: 20px; margin: 0 0 6px; }
            p { margin: 0 0 18px; color: #64748b; font-size: 12px; }
            .summary { margin-bottom: 18px; }
            .summary p { margin: 0 0 5px; color: #334155; font-size: 12px; }
            .summary span { font-weight: 700; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
            th { background: #f8fafc; font-weight: 700; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>Danh sách đơn hàng</h1>
          <p>${rows.length} đơn · ${selectedOrderIds.size > 0 ? "Đơn đã chọn" : "Tất cả đơn hàng"}</p>
          ${exportSummary}
          ${htmlTable}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
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
    setForm({ ...emptyForm, ...getCustomFields(), staff: currentStaffName, createdAt: new Date().toISOString().slice(0, 10) });
    setOpenForm(true);
  }, [currentStaffName, getCustomFields]);

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
      staff: currentStaffName || form.staff || "Chưa gán",
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
                <History className="size-3.5" />
                Lịch sử
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-slate-50">
                    <Download className="size-3.5" />
                    Xuất file
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Chọn định dạng xuất</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {[
                    { label: "PDF", hint: "Bản in, hóa đơn và báo cáo", icon: FileText, format: "pdf" },
                    { label: "Excel", hint: "Đối soát, lọc và xử lý dữ liệu", icon: FileSpreadsheet, format: "excel" },
                    { label: "CSV", hint: "Nhập dữ liệu sang hệ thống khác", icon: FileType, format: "csv" },
                  ].map(({ label, hint, icon: Icon, format }) => (
                    <DropdownMenuItem key={label} className="items-start gap-3 py-2.5" onClick={() => handleExport(format as ExportFormat, getDefaultExportFileName())}>
                      <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                        {label === "PDF" ? <FileDown className="size-4" /> : <Icon className="size-4" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-medium text-slate-800">Xuất {label}</span>
                        <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">{hint}</span>
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                onClick={openCreateForm}
              >
                <Plus className="size-3.5" />
                Thêm đơn
              </button>
            </div>
          </div>

          {/* ── Filter pills ── */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-5 py-3">
            <button type="button" className="inline-flex h-7 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 text-xs text-slate-700 transition-colors hover:bg-slate-50">
              <CalendarClock className="size-3.5" />
              {rangeLabel}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="inline-flex h-7 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 text-xs text-slate-700 transition-colors hover:bg-slate-50">
                  <SlidersHorizontal className="size-3.5" />
                  {selectedStatus}
                  <ChevronDown className="size-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuLabel>Trạng thái đơn</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(["Tất cả", ...statuses] as const).map((status) => {
                  const isAll = status === "Tất cả";
                  const statusColor = isAll ? allStatusColor : statusDotColor[status];

                  return (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => {
                        setSelectedStatus(status);
                        setPage(1);
                      }}
                    >
                      <span className="mr-2 size-2 rounded-full" style={{ backgroundColor: statusColor }} />
                      {status}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
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
                          <div className="mt-2 flex min-w-0 items-center gap-2">
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
                          <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500">
                            <List className="size-3" /> {order.service} · {order.quantity}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500">
                            <Clock className="size-3" /> Hẹn: {order.appointment} · Giao: {order.deliveryTime}
                          </p>
                          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
                            <div className="flex min-w-0 items-center gap-1.5">
                              {order.staff === "Chưa gán" ? (
                                <div className="flex size-5 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-[9px] font-bold text-slate-400">?</div>
                              ) : (
                                <Image
                                  src="https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif"
                                  alt={order.staff}
                                  width={20}
                                  height={20}
                                  className="size-5 shrink-0 rounded-full object-cover ring-1 ring-white"
                                />
                              )}
                              <span className="truncate text-[11px] text-slate-500">{order.staff}</span>
                            </div>
                            <span className="shrink-0 text-[13px] font-bold text-slate-900">
                              {order.amount.toLocaleString("vi-VN")}đ
                            </span>
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

      <Dialog open={openForm} onOpenChange={(open) => {
        if (!open) closeForm();
      }}>
        <DialogContent showCloseButton={false} className="flex h-[min(86vh,680px)] w-[min(86vw,680px)] max-w-[min(86vw,680px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[680px]">
          <DialogHeader className="flex-row items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
            <DialogTitle className="text-lg font-semibold">
              {editingOrderId ? `Chi tiết đơn ${editingOrderId}` : "Tạo đơn giặt mới"}
            </DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon-sm" className="shrink-0">
                <X className="size-4" />
                <span className="sr-only">Đóng</span>
              </Button>
            </DialogClose>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
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
                    <div className="grid grid-cols-[76px_76px_auto] items-center gap-2">
                      <Select value={getDeliveryTimeParts().hour} onValueChange={(value) => updateDeliveryTimePart("hour", value)}>
                        <SelectTrigger className="w-[76px]">
                          <SelectValue placeholder="Giờ" />
                        </SelectTrigger>
                        <SelectContent className="z-[2100]">
                          {hourOptions.map((hour) => (
                            <SelectItem key={hour} value={hour}>
                              {hour}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={getDeliveryTimeParts().minute} onValueChange={(value) => updateDeliveryTimePart("minute", value)}>
                        <SelectTrigger className="w-[76px]">
                          <SelectValue placeholder="Phút" />
                        </SelectTrigger>
                        <SelectContent className="z-[2100]">
                          {minuteOptions.map((minute) => (
                            <SelectItem key={minute} value={minute}>
                              {minute}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant={/^\d{2}:\d{2}$/.test(form.deliveryTime) ? "outline" : "default"}
                        onClick={() => setForm({ ...form, deliveryTime: "Chưa hẹn" })}
                      >
                        Chưa hẹn
                      </Button>
                    </div>
                  </div>
                )}
                {showField("createdAt") && (
                  <div className="space-y-2">
                    <Label>Thời gian</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarClock className="size-4 text-muted-foreground" />
                          {getCreatedAtDate() ? formatExportDate(getCreatedAtDate()!) : "Chọn ngày"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="z-[2100] w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={getCreatedAtDate()}
                          defaultMonth={getCreatedAtDate()}
                          onSelect={(date) => {
                            if (date) setForm({ ...form, createdAt: toInputDate(date) });
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
                {showField("staff") && (
                  <div className="space-y-2">
                    <Label>Nhân viên xử lý</Label>
                    <div className="flex h-8 items-center gap-2 rounded-lg border border-input bg-muted/30 px-2.5 text-sm text-slate-700">
                      <Image
                        src="https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif"
                        alt={currentStaffName}
                        width={24}
                        height={24}
                        className="size-6 shrink-0 rounded-full object-cover ring-1 ring-white"
                      />
                      <span className="truncate font-medium">{currentStaffName}</span>
                    </div>
                  </div>
                )}
                {showField("amount") && (
                  <div className="space-y-2">
                    <Label>Giá tiền</Label>
                    <div className="relative">
                      <Input
                        inputMode="numeric"
                        value={form.amount}
                        onChange={(event) => setForm({ ...form, amount: event.target.value.replace(/[^\d]/g, "") })}
                        className="pr-8"
                      />
                      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">VND</span>
                    </div>
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
                        <Button
                          key={status}
                          variant={form.status === status ? "default" : "outline"}
                          type="button"
                          onClick={() => setForm({ ...form, status })}
                          className="h-9 justify-center"
                        >
                          <span
                            className="size-2 rounded-full"
                            style={{
                              backgroundColor: form.status === status ? "currentColor" : statusDotColor[status],
                            }}
                          />
                          {status}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
          <DialogFooter className="m-0 border-t border-slate-200 bg-white px-6 py-4">
            <Button className="w-full justify-center bg-slate-900 text-center text-white hover:bg-slate-800 sm:w-auto" onClick={saveOrder}>
              {editingOrderId ? "Lưu thay đổi" : "Lưu đơn và đưa vào tiếp nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ════════════ MODAL: Invoice ════════════ */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-lg overflow-hidden rounded-xl border-border bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10">
            <CardHeader className="flex flex-row items-start justify-between border-b border-border bg-popover px-6 py-3">
              <CardTitle className="text-lg font-semibold">Hóa đơn {invoiceOrder.id}</CardTitle>
              <button
                type="button"
                className="inline-flex size-8 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"
                onClick={() => setInvoiceOrder(null)}
              >
                <X className="size-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4 px-6 py-3 text-sm">
              <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex min-w-0 items-start gap-3">
                  <Image
                    src="https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif"
                    alt={invoiceOrder.customer}
                    width={32}
                    height={32}
                    className="size-8 shrink-0 rounded-full object-cover ring-1 ring-border"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold leading-none text-foreground">{invoiceOrder.customer}</p>
                    {invoiceOrder.phone && (
                      <p className="mt-1.5 text-xs text-muted-foreground">{invoiceOrder.phone}</p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 justify-end">
                  <div
                    aria-label={`QR thanh toán hóa đơn ${invoiceOrder.id}`}
                    className="size-44 rounded-lg border border-border bg-background bg-[length:calc(100%-16px)_calc(100%-16px)] bg-center bg-no-repeat p-2 shadow-sm"
                    style={{
                      backgroundImage: `url("https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=1&data=${encodeURIComponent(`BEGAU PAY ${invoiceOrder.id} ${invoiceOrder.customer} ${invoiceOrder.amount} VND`)}")`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <span className="text-muted-foreground">Dịch vụ</span>
                <span className="text-right text-foreground">{invoiceOrder.service}</span>
                <span className="text-muted-foreground">Thời gian</span>
                <span className="text-right text-foreground">{invoiceOrder.deliveryTime} · {invoiceOrder.deliveryDate}</span>
                <span className="text-muted-foreground">Khối lượng</span>
                <span className="text-right text-foreground">{invoiceOrder.quantity}</span>
                <span className="text-muted-foreground">Thanh toán</span>
                <span className="text-right text-foreground">Tiền mặt / QR</span>
                <span className="text-muted-foreground">Trạng thái</span>
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

              <div className="border-t border-border pt-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Giá tiền</span>
                  <span className="text-foreground">{invoiceOrder.amount.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="mt-1 flex justify-between">
                  <span className="text-muted-foreground">Mã / điểm</span>
                  <span className="text-muted-foreground">Không áp dụng</span>
                </div>
                <div className="mt-3 flex justify-between text-base font-bold">
                  <span className="text-foreground">Cần thanh toán</span>
                  <span className="text-foreground">{invoiceOrder.amount.toLocaleString("vi-VN")}đ</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {openHistory && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <Card className="flex h-[620px] max-h-[86dvh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border-border bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10">
            <CardHeader className="flex flex-row items-start justify-between border-b border-border bg-popover px-4 py-3">
              <div>
                <CardTitle className="text-base font-semibold">Lịch sử đơn hàng</CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {selectedOrders.length} đơn đang được chọn
                </p>
              </div>
              <button
                type="button"
                className="inline-flex size-8 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"
                onClick={() => setOpenHistory(false)}
              >
                <X className="size-5" />
              </button>
            </CardHeader>
            <CardContent className="grid min-h-0 flex-1 overflow-hidden p-0 md:grid-cols-[230px_1fr]">
              <div className="flex min-h-0 flex-col border-b border-border bg-muted/30 p-2 md:border-b-0 md:border-r">
                <div className="flex min-h-0 flex-1 gap-1.5 overflow-x-auto [scrollbar-gutter:stable] md:flex-col md:overflow-x-hidden md:overflow-y-auto md:pr-1">
                  {selectedOrders.map((order) => {
                    const active = activeHistoryOrder?.id === order.id;

                    return (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => setActiveHistoryOrderId(order.id)}
                        className={`min-w-[220px] rounded-md border px-2.5 py-2 text-left transition-colors md:min-w-0 ${active
                          ? "border-border bg-popover shadow-sm"
                          : "border-transparent bg-transparent hover:border-border hover:bg-popover"
                          }`}
                      >
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
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="min-h-0 overflow-y-auto p-4 [scrollbar-gutter:stable]">
                {activeHistoryOrder && (() => {
                  const currentStatusIndex = statuses.indexOf(activeHistoryOrder.status);

                  return (
                    <div>
                      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <Image
                            src="https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif"
                            alt={activeHistoryOrder.customer}
                            width={40}
                            height={40}
                            className="size-10 shrink-0 rounded-full object-cover ring-1 ring-border"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {activeHistoryOrder.id} · {activeHistoryOrder.customer}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {activeHistoryOrder.phone} · {activeHistoryOrder.address}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {activeHistoryOrder.service} · {activeHistoryOrder.quantity} · {activeHistoryOrder.staff}
                            </p>
                          </div>
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
