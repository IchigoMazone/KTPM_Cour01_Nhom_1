"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Package, CircleDollarSign, WashingMachine } from "lucide-react";
import { toast } from "sonner";
import { TableCell } from "@/components/ui/table";
import { ViewModeTabs } from "../../_components/dashboard-primitives";
import { MetricCard } from "../../_components/metric-card";
import { Toolbar } from "../../_components/toolbar";
import { FilterBar } from "../../_components/filter-bar";
import { TableView } from "../../_components/table-view";
import { FormDialog, type FormField } from "../../_components/form-dialog";
import { AddColumnDialog } from "../../_components/add-column-dialog";
import { KanbanView } from "../../_components/kanban-view";
import { ListView } from "../../_components/list-view";
import { DeleteConfirmDialog } from "@/src/components/common/delete-confirm-dialog";
import { DashboardTableFooter } from "@/src/components/common/dashboard-data-table";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import { formatRange, normalizeRange } from "@/src/utils/dashboard-time";

import {
  Supply,
  SupplyStatus,
  Tab,
  ColumnItem,
  HomeInventoryRow,
} from "@/src/types/staff";

import {
  defaultSupplyColumns,
  emptySupplyForm,
  statusColor,
  statusDotColors,
} from "@/src/constants/staff";

import {
  formatCurrency,
  formatReadableDate,
  displayValue,
  numericValue,
  nullableDate,
  mapHomeSupply,
} from "@/src/utils/staff";

import { homeApi } from "@/src/lib/home-api";

interface SupplyTabProps {
  supplies: Supply[];
  setSupplies: React.Dispatch<React.SetStateAction<Supply[]>>;
  columnsSupply: ColumnItem[];
  setColumnsSupply: React.Dispatch<React.SetStateAction<ColumnItem[]>>;
  viewMode: "Bảng" | "Bảng kéo" | "Danh sách";
  setViewMode: (mode: "Bảng" | "Bảng kéo" | "Danh sách") => void;
  tableResizeMode: "fit" | "custom";
  setTableResizeMode: (mode: "fit" | "custom") => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  tab: Tab;
  setTab: (t: Tab) => void;
}

const displaySupplyStatus = (status: SupplyStatus) => (status === "Cần mua" ? "Hết" : status);

export function SupplyTab({
  supplies,
  setSupplies,
  columnsSupply,
  setColumnsSupply,
  viewMode,
  setViewMode,
  tableResizeMode,
  setTableResizeMode,
  pageSize,
  setPageSize,
  tab,
  setTab,
}: SupplyTabProps) {
  const [query, setQuery] = useState("");
  const [selectedSupplyStatus, setSelectedSupplyStatus] = useState<string>("Tất cả");
  const [selectedSupplyIds, setSelectedSupplyIds] = useState<Set<string>>(new Set());

  const [page, setPage] = useState(1);
  const [customPageSize, setCustomPageSize] = useState("");
  const [openPageSizeMenu, setOpenPageSizeMenu] = useState(false);

  // Custom column dialog
  const [openAddColumn, setOpenAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  // CRUD Dialog states
  const [openSupplyForm, setOpenSupplyForm] = useState(false);
  const [editingSupplyId, setEditingSupplyId] = useState<string | null>(null);
  const [supplyForm, setSupplyForm] = useState<Record<string, string>>(emptySupplyForm);
  const [isSavingSupply, setIsSavingSupply] = useState(false);

  // Delete Confirm Dialog states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingSupplyId, setDeletingSupplyId] = useState<string | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  // Kanban view states
  const [draggedSupplyId, setDraggedSupplyId] = useState<string | null>(null);
  const [dragOverSupplyStatus, setDragOverSupplyStatus] = useState<string | null>(null);

  // Column drag and drop
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  const customColumnsSupply = useMemo(
    () => columnsSupply.filter((col) => !defaultSupplyColumns.some((dc) => dc.id === col.id)),
    [columnsSupply],
  );

  const range = useDashboardTimeRangeStore((state) => state.range);
  const rangeLabel = formatRange(normalizeRange(range));

  const filteredSupplies = useMemo(() => {
    return supplies.filter((item) => {
      const source = `${item.id} ${item.name} ${item.category} ${item.inventoryType} ${item.supplier} ${item.note}`;
      const matchQuery = source.toLowerCase().includes(query.toLowerCase());
      const matchStatus = selectedSupplyStatus === "Tất cả" || item.status === selectedSupplyStatus;
      return matchQuery && matchStatus;
    });
  }, [query, selectedSupplyStatus, supplies]);

  const pageCount = Math.max(1, Math.ceil(filteredSupplies.length / pageSize));

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const paginatedSupplies = useMemo(() => {
    const offset = (page - 1) * pageSize;
    return filteredSupplies.slice(offset, offset + pageSize);
  }, [filteredSupplies, page, pageSize]);

  const totalVisibleWidth = useMemo(
    () => columnsSupply.filter((c) => c.visible).reduce((sum, column) => sum + (column.width || 150), 0),
    [columnsSupply],
  );

  const visibleSupplyIds = useMemo(() => paginatedSupplies.map((s) => s.id), [paginatedSupplies]);
  const kanbanSupplyIds = useMemo(() => filteredSupplies.map((s) => s.id), [filteredSupplies]);

  const allVisibleSuppliesSelected = visibleSupplyIds.length > 0 && visibleSupplyIds.every((id) => selectedSupplyIds.has(id));
  const allKanbanSuppliesSelected = kanbanSupplyIds.length > 0 && kanbanSupplyIds.every((id) => selectedSupplyIds.has(id));
  const selectedVisibleSupplyCount = visibleSupplyIds.filter((id) => selectedSupplyIds.has(id)).length;
  const selectedKanbanSupplyCount = kanbanSupplyIds.filter((id) => selectedSupplyIds.has(id)).length;

  const toggleVisibleSupplies = () => {
    setSelectedSupplyIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSuppliesSelected) {
        visibleSupplyIds.forEach((id) => next.delete(id));
      } else {
        visibleSupplyIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleKanbanSupplies = () => {
    setSelectedSupplyIds((prev) => {
      const next = new Set(prev);
      if (allKanbanSuppliesSelected) {
        kanbanSupplyIds.forEach((id) => next.delete(id));
      } else {
        kanbanSupplyIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleSupplyOne = (id: string) => {
    setSelectedSupplyIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalCost = useMemo(
    () => supplies.filter((item) => selectedSupplyIds.has(item.id)).reduce((sum, item) => sum + item.cost, 0),
    [supplies, selectedSupplyIds],
  );

  const lowStock = supplies.filter((item) => item.status !== "Ổn định").length;
  const purchaseCost = supplies.reduce((sum, item) => sum + item.cost, 0);

  const checkboxClass =
    "relative size-4 appearance-none rounded-[5px] border border-slate-300 bg-white transition-all duration-150 checked:border-emerald-300 checked:bg-emerald-300 after:absolute after:left-1/2 after:top-1/2 after:hidden after:h-[9px] after:w-[5px] after:-translate-x-1/2 after:-translate-y-[58%] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:content-[''] checked:after:block";

  const handleDragStart = (event: React.DragEvent<HTMLTableCellElement>, id: string) => {
    setDraggedColumnId(id);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (event: React.DragEvent<HTMLTableCellElement>, id: string) => {
    event.preventDefault();
    if (id !== draggedColumnId) setDragOverColumnId(id);
  };

  const handleDragLeave = () => setDragOverColumnId(null);

  const handleDrop = (event: React.DragEvent<HTMLTableCellElement>, id: string) => {
    event.preventDefault();
    if (!draggedColumnId || draggedColumnId === id) {
      setDragOverColumnId(null);
      return;
    }

    setColumnsSupply((prev: ColumnItem[]) => {
      const draggedIndex = prev.findIndex((column) => column.id === draggedColumnId);
      const dropIndex = prev.findIndex((column) => column.id === id);
      if (draggedIndex === -1 || dropIndex === -1) return prev;

      const next = [...prev];
      const [draggedColumn] = next.splice(draggedIndex, 1);
      next.splice(dropIndex, 0, draggedColumn);
      return next;
    });

    setDraggedColumnId(null);
    setDragOverColumnId(null);
  };

  const handleDragEnd = () => {
    setDraggedColumnId(null);
    setDragOverColumnId(null);
  };

  const orderedSupplyFormFields = useMemo<FormField[]>(() => {
    const fieldByColumnId: Record<string, FormField> = {
      name: { id: "name", label: "Tên vật tư", type: "text", placeholder: "Nước xả", required: true },
      category: { id: "category", label: "Nhóm", type: "select", options: ["Hóa chất", "Bao bì", "Phụ kiện", "Thiết bị"], placeholder: "Chọn nhóm vật tư..." },
      inventoryType: {
        id: "inventoryType",
        label: "Loại vật tư",
        type: "select",
        options: ["Vật tư tiêu hao", "Vật tư tái sử dụng"],
        placeholder: "Chọn loại vật tư...",
        allowCustom: false,
      },
      unit: { id: "unit", label: "Đơn vị", type: "select", options: ["cái", "lít", "kg", "chai", "can", "túi", "cuộn", "thùng"], placeholder: "Chọn đơn vị...", required: true },
      initialStock: { id: "initialStock", label: "Số lượng ban đầu", type: "number", placeholder: "0" },
      currentStock: { id: "currentStock", label: "Số lượng hiện tại", type: "number", placeholder: "Tự lấy số lượng ban đầu" },
      supplier: { id: "supplier", label: "Nhà cung cấp", type: "select", options: ["Omo", "Ariel", "Downy"], placeholder: "Chọn nhà cung cấp..." },
      lastImport: { id: "lastImport", label: "Ngày nhập", type: "date" },
      cost: { id: "cost", label: "Chi phí nhập", type: "number" },
      status: { id: "status", label: "Cảnh báo", type: "custom_status" },
      note: { id: "note", label: "Ghi chú", type: "textarea", placeholder: "Kế hoạch mua, khu vực lưu kho..." },
    };

    const sortedColumns = [...columnsSupply].filter((column) => column.id !== "id" && column.id !== "actions");
    const noteIndex = sortedColumns.findIndex((c) => c.id === "note");
    if (noteIndex !== -1) {
      const [noteCol] = sortedColumns.splice(noteIndex, 1);
      sortedColumns.push(noteCol);
    }

    return sortedColumns.map((column) => {
      return (
        fieldByColumnId[column.id] ||
        ({
          id: column.id,
          label: column.label,
          type: "text",
          placeholder: `Nhập ${column.label.toLowerCase()}`,
        } satisfies FormField)
      );
    });
  }, [columnsSupply]);

  const openCreateSupply = () => {
    setEditingSupplyId(null);
    const customFieldsDefaults = Object.fromEntries(customColumnsSupply.map((col) => [col.id, ""]));
    setSupplyForm({
      ...emptySupplyForm,
      lastImport: new Date().toLocaleDateString("en-CA"),
      ...customFieldsDefaults,
    });
    setOpenSupplyForm(true);
  };

  const openEditSupply = (item: Supply) => {
    setEditingSupplyId(item.id);
    const customFieldsDefaults = Object.fromEntries(customColumnsSupply.map((col) => [col.id, item[col.id] || ""]));
    setSupplyForm({
      ...item,
      cost: String(item.cost),
      ...customFieldsDefaults,
    });
    setOpenSupplyForm(true);
  };

  const saveSupply = async () => {
    if (!supplyForm.name.trim() || !supplyForm.unit.trim()) {
      toast.error("Vui lòng nhập đầy đủ các trường bắt buộc.");
      return;
    }

    const editingSupply = supplies.find((item) => item.id === editingSupplyId);
    const rawId = editingSupply?.id || "";
    const cleanItemCode = rawId.startsWith("VT-") ? rawId.substring(3) : rawId;
    const payload = {
      item_code: cleanItemCode || undefined,
      name: supplyForm.name.trim(),
      category: supplyForm.category || null,
      inventory_type: supplyForm.inventoryType || "Vật tư tiêu hao",
      unit: supplyForm.unit.trim(),
      initial_quantity: numericValue(supplyForm.initialStock),
      quantity: numericValue(supplyForm.currentStock || supplyForm.initialStock),
      supplier: supplyForm.supplier?.trim() || null,
      last_restocked_at: nullableDate(supplyForm.lastImport),
      cost: numericValue(supplyForm.cost),
      status: supplyForm.status as SupplyStatus,
      note: supplyForm.note?.trim() || null,
    };

    setIsSavingSupply(true);
    try {
      const saved = editingSupplyId
        ? await homeApi<HomeInventoryRow>(`/staff/inventory/${editingSupply?.dbId || editingSupplyId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          })
        : await homeApi<HomeInventoryRow>("/staff/inventory", {
            method: "POST",
            body: JSON.stringify(payload),
          });

      // Map dynamic / custom values
      const mapped = mapHomeSupply(saved);

      const nextSupply = {
        ...mapped,
        ...Object.fromEntries(customColumnsSupply.map((col) => [col.id, supplyForm[col.id] || ""])),
      };

      setSupplies((prev) => (editingSupplyId ? prev.map((item) => (item.id === editingSupplyId ? nextSupply : item)) : [nextSupply, ...prev]));
      if (!editingSupplyId) setPage(1);
      setOpenSupplyForm(false);
      toast.success(editingSupplyId ? "Đã cập nhật vật tư." : "Đã thêm vật tư.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không lưu được vật tư.");
    } finally {
      setIsSavingSupply(false);
    }
  };

  const startDeleteSupply = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingSupplyId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSupplyId || isDeletingItem) return;
    setIsDeletingItem(true);
    const supply = supplies.find((item) => item.id === deletingSupplyId);

    try {
      await homeApi(`/staff/inventory/${supply?.dbId || deletingSupplyId}`, {
        method: "DELETE",
      });
      setSupplies((prev) => prev.filter((item) => item.id !== deletingSupplyId));
      setSelectedSupplyIds((prev) => {
        const next = new Set(prev);
        next.delete(deletingSupplyId);
        return next;
      });
      setDeletingSupplyId(null);
      setDeleteConfirmOpen(false);
      toast.success("Đã xóa vật tư.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không xóa được vật tư.");
    } finally {
      setIsDeletingItem(false);
    }
  };

  const handleExport = (format: "pdf" | "excel" | "csv", fileName: string) => {
    const rows = filteredSupplies;
    if (rows.length === 0) return;
    const baseFileName = fileName || `kho-vat-tu-${new Date().toISOString().slice(0, 10)}`;
    const headers = columnsSupply.filter((c) => c.id !== "actions" && c.visible).map((c) => c.label);

    if (format === "csv") {
      const csvData = rows.map((row) =>
        columnsSupply
          .filter((c) => c.id !== "actions" && c.visible)
          .map((c) => {
            let val = (row as Record<string, unknown>)[c.id] ?? "";
            if (c.id === "cost") val = formatCurrency(Number(val));
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(","),
      );
      const csvContent = "\uFEFF" + [headers.join(","), ...csvData].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${baseFileName}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "excel") {
      const tableHead = headers.map((h) => `<th>${h}</th>`).join("");
      const tableBody = rows
        .map(
          (row) =>
            `<tr>${columnsSupply
              .filter((c) => c.id !== "actions" && c.visible)
              .map((c) => {
                let val = (row as Record<string, unknown>)[c.id] ?? "";
                if (c.id === "cost") val = formatCurrency(Number(val));
                return `<td>${val}</td>`;
              })
              .join("")}</tr>`,
        )
        .join("");
      const excelContent = `
        <html>
          <head><meta charset="utf-8" /></head>
          <body>
            <table border="1">
              <thead><tr>${tableHead}</tr></thead>
              <tbody>${tableBody}</tbody>
            </table>
          </body>
        </html>
      `;
      const blob = new Blob([excelContent], { type: "application/vnd.ms-excel" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${baseFileName}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;
      const tableHead = headers.map((h) => `<th>${h}</th>`).join("");
      const tableBody = rows
        .map(
          (row) =>
            `<tr>${columnsSupply
              .filter((c) => c.id !== "actions" && c.visible)
              .map((c) => {
                let val = (row as Record<string, unknown>)[c.id] ?? "";
                if (c.id === "cost") val = formatCurrency(Number(val));
                return `<td>${val}</td>`;
              })
              .join("")}</tr>`,
        )
        .join("");
      printWindow.document.write(`
        <html>
          <head>
            <style>
              table { width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 12px; }
              th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
              th { background-color: #f1f5f9; }
            </style>
          </head>
          <body>
            <h2>Danh sách Vật tư</h2>
            <table>
              <thead><tr>${tableHead}</tr></thead>
              <tbody>${tableBody}</tbody>
            </table>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const addCustomColumn = () => {
    const label = newColumnName.trim();
    if (!label) return;
    const newColumn = {
      id: `custom_${Date.now()}`,
      label,
      width: 150,
      visible: true,
    };
    setColumnsSupply((prev: ColumnItem[]) => {
      const next = [...prev];
      const actionIndex = next.findIndex((c) => c.id === "actions");
      next.splice(actionIndex === -1 ? next.length : actionIndex, 0, newColumn);
      return next;
    });
    setSupplyForm((prev) => ({ ...prev, [newColumn.id]: "" }));
    setNewColumnName("");
    setOpenAddColumn(false);
  };

  const renderSupplyCell = (item: Supply, column: ColumnItem) => {
    if (column.id === "id")
      return (
        <TableCell key={column.id} className="pl-4 font-medium text-slate-900">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              aria-label={`Chọn vật tư ${item.id}`}
              checked={selectedSupplyIds.has(item.id)}
              onChange={() => toggleSupplyOne(item.id)}
              className={`shrink-0 ${checkboxClass}`}
            />
            <span>{item.id}</span>
          </div>
        </TableCell>
      );
    if (column.id === "name") return <TableCell key={column.id} className="font-medium text-slate-900">{item.name}</TableCell>;
    if (column.id === "unit") return <TableCell key={column.id} className="text-slate-600">{item.unit || "-"}</TableCell>;
    if (column.id === "initialStock") return <TableCell key={column.id} className="text-slate-600">{item.initialStock}</TableCell>;
    if (column.id === "currentStock") return <TableCell key={column.id} className="text-slate-600">{item.currentStock}</TableCell>;
    if (column.id === "category") return <TableCell key={column.id} className="text-slate-600">{item.category}</TableCell>;
    if (column.id === "inventoryType") return <TableCell key={column.id} className="text-slate-600">{item.inventoryType}</TableCell>;
    if (column.id === "cost") return <TableCell key={column.id} className="font-medium text-slate-900">{formatCurrency(item.cost)}</TableCell>;
    if (column.id === "lastImport") return <TableCell key={column.id} className="text-slate-600">{formatReadableDate(item.lastImport)}</TableCell>;
    if (column.id === "supplier") {
      const supplier = item.supplier?.trim();
      return (
        <TableCell key={column.id} className={supplier && supplier !== "Chưa có" && supplier !== "-" ? "text-slate-600" : "text-slate-400"}>
          {supplier && supplier !== "Chưa có" && supplier !== "-" ? supplier : "-"}
        </TableCell>
      );
    }
    if (column.id === "status") {
      const color = statusColor[item.status];
      return (
        <TableCell key={column.id}>
          <span
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium"
            style={{ color: color.text, backgroundColor: color.bg }}
          >
            <span className="size-2 rounded-full" style={{ backgroundColor: color.text }} />
            {displaySupplyStatus(item.status)}
          </span>
        </TableCell>
      );
    }
    if (column.id === "note")
      return (
        <TableCell key={column.id} className="truncate text-slate-500" title={displayValue(item.note)}>
          {displayValue(item.note)}
        </TableCell>
      );
    if (column.id === "actions") {
      return (
        <TableCell key={column.id} className="px-4">
          <div className="flex items-center justify-start gap-1.5">
            <button
              type="button"
              className="inline-flex h-7 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer"
              onClick={() => openEditSupply(item)}
            >
              Sửa
            </button>
            <button
              type="button"
              className="inline-flex h-7 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-100 cursor-pointer"
              onClick={(e) => startDeleteSupply(item.id, e)}
            >
              Xóa
            </button>
          </div>
        </TableCell>
      );
    }
    const customValue = item[column.id];
    return (
      <TableCell key={column.id} className={customValue ? "text-slate-600" : "text-slate-400"}>
        {customValue || "-"}
      </TableCell>
    );
  };

  const supplyKanbanColumns = [
    { id: "Ổn định", label: "Ổn định", color: statusColor["Ổn định"] },
    { id: "Sắp hết", label: "Sắp hết", color: statusColor["Sắp hết"] },
    { id: "Cần mua", label: "Hết", color: statusColor["Cần mua"] },
  ];

  const renderSupplyKanbanCard = (item: Supply) => {
    return (
      <div
        key={item.id}
        draggable
        onDragStart={(event) => {
          setDraggedSupplyId(item.id);
          event.dataTransfer.effectAllowed = "move";
        }}
        onDragEnd={() => {
          setDraggedSupplyId(null);
          setDragOverSupplyStatus(null);
        }}
        className={`cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-slate-300 hover:shadow-md active:cursor-grabbing ${draggedSupplyId === item.id ? "opacity-50 ring-2 ring-slate-400" : ""}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <input
              type="checkbox"
              aria-label={`Chọn ${item.name}`}
              checked={selectedSupplyIds.has(item.id)}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              onChange={() => toggleSupplyOne(item.id)}
              className={`shrink-0 ${checkboxClass}`}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-700">{item.name}</p>
              <p className="truncate text-[11px] text-slate-400">{item.category}</p>
            </div>
          </div>
          <span className="shrink-0 text-[11px] font-semibold text-slate-400">{item.id}</span>
        </div>
        <p className="mt-2 text-xs text-slate-500 font-medium">
          Ban đầu: {item.initialStock} / Hiện tại: {item.currentStock}
        </p>
        <p className="mt-1 text-xs text-slate-500">Chi phí: {formatCurrency(item.cost)}</p>
        <p className="mt-1 line-clamp-2 text-xs text-slate-400">{displayValue(item.note)}</p>
        <div className="mt-3 flex justify-end gap-1.5 border-t border-slate-100 pt-2">
          <button
            type="button"
            onClick={() => openEditSupply(item)}
            className="inline-flex h-6 items-center rounded-md bg-slate-100 px-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200 cursor-pointer"
          >
            Chi tiết
          </button>
          <button
            type="button"
            onClick={(e) => startDeleteSupply(item.id, e)}
            className="inline-flex h-6 items-center rounded-md bg-red-50 px-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-100/70 cursor-pointer"
          >
            Xóa
          </button>
        </div>
      </div>
    );
  };

  const renderSupplyListRow = (item: Supply) => {
    return (
      <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <input
              type="checkbox"
              aria-label={`Chọn ${item.name}`}
              checked={selectedSupplyIds.has(item.id)}
              onChange={() => toggleSupplyOne(item.id)}
              className={`mt-1 shrink-0 ${checkboxClass}`}
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-950">{item.name}</p>
                <span className="text-xs font-medium text-slate-400">{item.id}</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  {item.category}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500">
                  {item.inventoryType}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium"
                  style={{
                    color: statusColor[item.status].text,
                    backgroundColor: statusColor[item.status].bg,
                  }}
                >
                  <span className="size-2 rounded-full" style={{ backgroundColor: statusColor[item.status].text }} />
                  {displaySupplyStatus(item.status)}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>
                  Ban đầu: {item.initialStock} · Hiện tại: {item.currentStock}
                </span>
                <span>Nhà cung cấp: {item.supplier && item.supplier !== "Chưa có" && item.supplier !== "-" ? item.supplier : "-"}</span>
                <span>Ngày nhập gần nhất: {formatReadableDate(item.lastImport)}</span>
                <span>Chi phí: {formatCurrency(item.cost)}</span>
              </div>
              <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">{displayValue(item.note)}</p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
            <button
              type="button"
              className="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer"
              onClick={() => openEditSupply(item)}
            >
              Sửa
            </button>
            <button
              type="button"
              className="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-100 cursor-pointer"
              onClick={(e) => startDeleteSupply(item.id, e)}
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    );
  };

  const leftContent = (
    <div className="flex flex-wrap items-center gap-1">
      {(
        [
          ["Kho vật tư", Package],
          ["Thiết bị giặt sấy", WashingMachine],
        ] as const
      ).map(([item, Icon]) => (
        <button
          key={item}
          type="button"
          onClick={() => {
            setTab(item);
            setQuery("");
            setSelectedSupplyIds(new Set());
          }}
          className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors cursor-pointer ${
            tab === item ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Icon className="size-3.5" />
          {item}
        </button>
      ))}
      <span className="mx-2 hidden h-4 w-px bg-slate-200 sm:block" />
      <ViewModeTabs value={viewMode} onChange={setViewMode} />
    </div>
  );

  const filterOptions = [
    { id: "Tất cả", label: "Tất cả", color: "#64748b", bgColor: "rgba(100,116,139,0.09)" },
    { id: "Ổn định", label: "Ổn định", color: "#059669", bgColor: "rgba(5,150,105,0.09)" },
    { id: "Sắp hết", label: "Sắp hết", color: "#d97706", bgColor: "rgba(217,119,6,0.09)" },
    { id: "Cần mua", label: "Hết", color: "#dc2626", bgColor: "rgba(220,38,38,0.09)" },
  ];

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

  return (
    <>
      <div className="grid shrink-0 gap-3 md:grid-cols-4">
        <MetricCard title="Tổng loại vật tư" value={`${supplies.length}`} hint="Hóa chất, bao bì, phụ kiện..." icon={Package} color="#2563eb" />
        <MetricCard title="Vật tư ổn định" value={`${supplies.filter((item) => item.status === "Ổn định").length}`} hint="Trạng thái bình thường" icon={Package} color="#059669" />
        <MetricCard title="Vật tư cảnh báo" value={`${lowStock}`} hint="Sắp hết hoặc đã hết" icon={Package} color="#dc2626" />
        <MetricCard title="Chi phí nhập vật tư" value={formatCurrency(purchaseCost)} hint="Tổng ngân sách đã chi" icon={CircleDollarSign} color="#d97706" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <Toolbar
          leftContent={leftContent}
          query={query}
          onQueryChange={(q) => {
            setQuery(q);
            setPage(1);
          }}
          columns={columnsSupply}
          onColumnsChange={setColumnsSupply as any}
          tableResizeMode={tableResizeMode}
          onTableResizeModeChange={setTableResizeMode}
          selectedCount={selectedSupplyIds.size}
          onOpenAddColumn={() => setOpenAddColumn(true)}
          showHistoryButton={false}
          onExport={handleExport}
          defaultExportFileName={`kho-vat-tu-${new Date().toISOString().slice(0, 10)}`}
          onCreateClick={openCreateSupply}
          createLabel="Thêm vật tư"
          defaultColumnIds={defaultSupplyColumns.map((c) => c.id)}
          searchPlaceholder="Tìm vật tư, nhà cung cấp..."
        />

        <FilterBar
          rangeLabel={rangeLabel}
          selectedValue={selectedSupplyStatus}
          onValueChange={(val: string) => {
            setSelectedSupplyStatus(val);
            setPage(1);
          }}
          filterOptions={filterOptions}
          filterLabel="Trạng thái vật tư"
          showSelectionBar={true}
          allSelected={viewMode === "Bảng kéo" ? allKanbanSuppliesSelected : allVisibleSuppliesSelected}
          disabled={viewMode === "Bảng kéo" ? kanbanSupplyIds.length === 0 : visibleSupplyIds.length === 0}
          selectedCount={viewMode === "Bảng kéo" ? selectedKanbanSupplyCount : selectedVisibleSupplyCount}
          totalCount={viewMode === "Bảng kéo" ? kanbanSupplyIds.length : visibleSupplyIds.length}
          itemLabel="vật tư"
          checkboxClass={checkboxClass}
          onToggleAll={viewMode === "Bảng kéo" ? toggleKanbanSupplies : toggleVisibleSupplies}
        />

        {filteredSupplies.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
            <p className="text-sm text-slate-400">Không tìm thấy vật tư nào phù hợp.</p>
          </div>
        ) : viewMode === "Bảng kéo" ? (
          <KanbanView<Supply>
            columns={supplyKanbanColumns}
            rows={filteredSupplies}
            groupByKey="status"
            draggedItemId={draggedSupplyId}
            onDraggedItemIdChange={setDraggedSupplyId}
            dragOverColumnId={dragOverSupplyStatus}
            onDragOverColumnIdChange={setDragOverSupplyStatus}
            onDropItem={async (supplyId, status) => {
              const currentSupply = supplies.find((item) => item.id === supplyId);
              if (!currentSupply || currentSupply.status === status) return;
              setSupplies((prev) => prev.map((s) => (s.id === supplyId ? ({ ...s, status: status as SupplyStatus } as Supply) : s)));
              try {
                const saved = await homeApi<HomeInventoryRow>(`/staff/inventory/${currentSupply.dbId || supplyId}`, {
                  method: "PUT",
                  body: JSON.stringify({ status }),
                });
                const nextSupply = mapHomeSupply(saved);
                setSupplies((prev) => prev.map((s) => (s.id === supplyId ? nextSupply : s)));
              } catch (error) {
                setSupplies((prev) => prev.map((s) => (s.id === supplyId ? currentSupply : s)));
                toast.error(error instanceof Error ? error.message : "Không cập nhật được trạng thái vật tư.");
              }
            }}
            renderCard={renderSupplyKanbanCard}
            tableResizeMode={tableResizeMode}
          />
        ) : viewMode === "Danh sách" ? (
          <div className="flex-1 flex flex-col min-h-0">
            <ListView paginatedRows={paginatedSupplies} emptyMessage="Không tìm thấy vật tư phù hợp." renderRow={renderSupplyListRow} />
            <DashboardTableFooter
              page={page}
              pageCount={pageCount}
              pageSize={pageSize}
              totalRows={filteredSupplies.length}
              customPageSize={customPageSize}
              openPageSizeMenu={openPageSizeMenu}
              onOpenPageSizeMenuChange={setOpenPageSizeMenu}
              onCustomPageSizeChange={setCustomPageSize}
              onApplyCustomPageSize={applyCustomPageSize}
              onUpdatePageSize={updatePageSize}
              onPageChange={setPage}
            />
          </div>
        ) : (
          <TableView<Supply>
            columns={columnsSupply}
            onColumnsChange={setColumnsSupply as any}
            rows={paginatedSupplies}
            columnDrag={{
              draggedColumnId,
              dragOverColumnId,
              onDragStart: handleDragStart,
              onDragOver: handleDragOver,
              onDragLeave: handleDragLeave,
              onDrop: handleDrop,
              onDragEnd: handleDragEnd,
            }}
            pageSize={pageSize}
            emptyMessage="Không tìm thấy vật tư phù hợp."
            tableResizeMode={tableResizeMode}
            totalVisibleWidth={totalVisibleWidth}
            renderCell={renderSupplyCell as any}
            page={page}
            pageCount={pageCount}
            totalRows={filteredSupplies.length}
            totalLabel={`Tổng chi phí: ${totalCost.toLocaleString("vi-VN")}đ`}
            customPageSize={customPageSize}
            openPageSizeMenu={openPageSizeMenu}
            onOpenPageSizeMenuChange={setOpenPageSizeMenu}
            onCustomPageSizeChange={setCustomPageSize}
            onApplyCustomPageSize={applyCustomPageSize}
            onUpdatePageSize={updatePageSize}
            onPageChange={setPage}
          />
        )}
      </div>

      <FormDialog
        open={openSupplyForm}
        onClose={() => setOpenSupplyForm(false)}
        title={editingSupplyId ? `Chỉnh sửa ${editingSupplyId}` : "Thêm vật tư mới"}
        fields={orderedSupplyFormFields}
        form={supplyForm}
        onFormChange={setSupplyForm}
        onSave={saveSupply}
        isSaving={isSavingSupply}
        statusOptions={["Ổn định", "Sắp hết", "Cần mua"]}
        statusDotColors={statusDotColors}
        showCloseButton={false}
        showCloseButtonAtBottom={true}
      />

      <AddColumnDialog
        open={openAddColumn}
        onOpenChange={setOpenAddColumn}
        newColumnName={newColumnName}
        onNewColumnNameChange={setNewColumnName}
        onAddColumn={addCustomColumn}
      />

      <DeleteConfirmDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen} onConfirm={handleDeleteConfirm} isLoading={isDeletingItem}>
        Xóa vật tư sẽ xóa cả giao dịch tài chính liên kết. Hành động này không thể hoàn tác.
      </DeleteConfirmDialog>
    </>
  );
}
