"use client";

import React, { useState, useMemo, useEffect } from "react";
import { WashingMachine, Package } from "lucide-react";
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
  WashingMachineItem,
  MachineStatus,
  Tab,
  ColumnItem,
  HomeMachineRow,
} from "@/src/types/staff";

import {
  defaultMachineColumns,
  emptyMachineForm,
  statusColor,
  statusDotColors,
} from "@/src/constants/staff";

import {
  formatReadableDate,
  displayValue,
  parseCapacityKg,
  nullableDate,
  mapHomeMachine,
} from "@/src/utils/staff";

import { homeApi } from "@/src/lib/home-api";
import { MaintenanceHistoryDialog } from "../maintenance-history-dialog";

interface MachineTabProps {
  machines: WashingMachineItem[];
  setMachines: React.Dispatch<React.SetStateAction<WashingMachineItem[]>>;
  columnsMachine: ColumnItem[];
  setColumnsMachine: React.Dispatch<React.SetStateAction<ColumnItem[]>>;
  viewMode: "Bảng" | "Bảng kéo" | "Danh sách";
  setViewMode: (mode: "Bảng" | "Bảng kéo" | "Danh sách") => void;
  tableResizeMode: "fit" | "custom";
  setTableResizeMode: (mode: "fit" | "custom") => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  tab: Tab;
  setTab: (t: Tab) => void;
}

export function MachineTab({
  machines,
  setMachines,
  columnsMachine,
  setColumnsMachine,
  viewMode,
  setViewMode,
  tableResizeMode,
  setTableResizeMode,
  pageSize,
  setPageSize,
  tab,
  setTab,
}: MachineTabProps) {
  const [query, setQuery] = useState("");
  const [selectedMachineStatus, setSelectedMachineStatus] = useState<string>("Tất cả");
  const [selectedMachineIds, setSelectedMachineIds] = useState<Set<string>>(new Set());

  const [page, setPage] = useState(1);
  const [customPageSize, setCustomPageSize] = useState("");
  const [openPageSizeMenu, setOpenPageSizeMenu] = useState(false);

  // Custom column dialog
  const [openAddColumn, setOpenAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  // CRUD Dialog states
  const [openMachineForm, setOpenMachineForm] = useState(false);
  const [editingMachineId, setEditingMachineId] = useState<string | null>(null);
  const [machineForm, setMachineForm] = useState<Record<string, string>>(emptyMachineForm);
  const [isSavingMachine, setIsSavingMachine] = useState(false);

  // Delete Confirm Dialog states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingMachineId, setDeletingMachineId] = useState<string | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  // Kanban view states
  const [draggedMachineId, setDraggedMachineId] = useState<string | null>(null);
  const [dragOverMachineStatus, setDragOverMachineStatus] = useState<string | null>(null);

  // Column drag and drop
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  // Maintenance history
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [historyMachines, setHistoryMachines] = useState<WashingMachineItem[]>([]);

  const customColumnsMachine = useMemo(
    () => columnsMachine.filter((col) => !defaultMachineColumns.some((dc) => dc.id === col.id)),
    [columnsMachine],
  );

  const range = useDashboardTimeRangeStore((state) => state.range);
  const rangeLabel = formatRange(normalizeRange(range));

  const filteredMachines = useMemo(() => {
    return machines.filter((item) => {
      const source = `${item.id} ${item.name} ${item.capacity} ${item.area} ${item.loadType} ${item.note}`;
      const matchQuery = source.toLowerCase().includes(query.toLowerCase());
      const matchStatus = selectedMachineStatus === "Tất cả" || item.status === selectedMachineStatus;
      return matchQuery && matchStatus;
    });
  }, [query, selectedMachineStatus, machines]);

  const pageCount = Math.max(1, Math.ceil(filteredMachines.length / pageSize));

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const paginatedMachines = useMemo(() => {
    const offset = (page - 1) * pageSize;
    return filteredMachines.slice(offset, offset + pageSize);
  }, [filteredMachines, page, pageSize]);

  const totalVisibleWidth = useMemo(
    () => columnsMachine.filter((c) => c.visible).reduce((sum, column) => sum + (column.width || 150), 0),
    [columnsMachine],
  );

  const visibleMachineIds = useMemo(() => paginatedMachines.map((m) => m.id), [paginatedMachines]);
  const kanbanMachineIds = useMemo(() => filteredMachines.map((m) => m.id), [filteredMachines]);

  const allVisibleMachinesSelected = visibleMachineIds.length > 0 && visibleMachineIds.every((id) => selectedMachineIds.has(id));
  const allKanbanMachinesSelected = kanbanMachineIds.length > 0 && kanbanMachineIds.every((id) => selectedMachineIds.has(id));
  const selectedVisibleMachineCount = visibleMachineIds.filter((id) => selectedMachineIds.has(id)).length;
  const selectedKanbanMachineCount = kanbanMachineIds.filter((id) => selectedMachineIds.has(id)).length;

  const toggleVisibleMachines = () => {
    setSelectedMachineIds((prev) => {
      const next = new Set(prev);
      if (allVisibleMachinesSelected) {
        visibleMachineIds.forEach((id) => next.delete(id));
      } else {
        visibleMachineIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleKanbanMachines = () => {
    setSelectedMachineIds((prev) => {
      const next = new Set(prev);
      if (allKanbanMachinesSelected) {
        kanbanMachineIds.forEach((id) => next.delete(id));
      } else {
        kanbanMachineIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleMachineOne = (id: string) => {
    setSelectedMachineIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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

    setColumnsMachine((prev: ColumnItem[]) => {
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

  const orderedMachineFormFields = useMemo<FormField[]>(() => {
    const fieldByColumnId: Record<string, FormField> = {
      name: { id: "name", label: "Tên thiết bị", type: "text", placeholder: "Máy giặt nhỏ A / Máy sấy công nghiệp A", required: true },
      capacity: { id: "capacity", label: "Công suất", type: "text", placeholder: "8 kg" },
      area: { id: "area", label: "Khu vực", type: "select", options: ["Khu giặt 1", "Khu giặt 2", "Khu sấy 1", "Khu sấy 2"], placeholder: "Chọn khu vực..." },
      loadType: { id: "loadType", label: "Nhóm thiết bị", type: "select", options: ["Máy giặt", "Máy sấy", "Máy giặt sấy"], placeholder: "Chọn nhóm thiết bị..." },
      lastMaintenance: { id: "lastMaintenance", label: "Bảo trì gần nhất", type: "date" },
      nextMaintenance: { id: "nextMaintenance", label: "Bảo trì kế tiếp", type: "date" },
      status: { id: "status", label: "Trạng thái", type: "custom_status" },
      note: { id: "note", label: "Ghi chú", type: "textarea", placeholder: "Đơn đang chạy, tình trạng kỹ thuật, nhân sự phụ trách..." },
    };

    const sortedColumns = [...columnsMachine].filter((column) => column.id !== "id" && column.id !== "actions");
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
  }, [columnsMachine]);

  const openCreateMachine = () => {
    setEditingMachineId(null);
    const customFieldsDefaults = Object.fromEntries(customColumnsMachine.map((col) => [col.id, ""]));
    setMachineForm({ ...emptyMachineForm, ...customFieldsDefaults });
    setOpenMachineForm(true);
  };

  const openEditMachine = (item: WashingMachineItem) => {
    setEditingMachineId(item.id);
    const customFieldsDefaults = Object.fromEntries(customColumnsMachine.map((col) => [col.id, item[col.id] || ""]));
    setMachineForm({
      ...item,
      ...customFieldsDefaults,
    });
    setOpenMachineForm(true);
  };

  const saveMachine = async () => {
    if (!machineForm.name.trim()) {
      toast.error("Vui lòng nhập đầy đủ các trường bắt buộc.");
      return;
    }

    const editingMachine = machines.find((item) => item.id === editingMachineId);
    const rawId = editingMachine?.id || "";
    const cleanMachineCode = rawId.startsWith("TB-") ? rawId.substring(3) : rawId;
    const payload = {
      machine_code: cleanMachineCode || undefined,
      name: machineForm.name.trim(),
      machine_type: machineForm.loadType,
      capacity_kg: parseCapacityKg(machineForm.capacity),
      status: machineForm.status as MachineStatus,
      location: machineForm.area?.trim() || null,
      note: machineForm.note?.trim() || null,
      last_maintenance_at: nullableDate(machineForm.lastMaintenance),
      next_maintenance_at: nullableDate(machineForm.nextMaintenance),
    };

    setIsSavingMachine(true);
    try {
      const saved = editingMachineId
        ? await homeApi<HomeMachineRow>(`/staff/machines/${editingMachine?.dbId || editingMachineId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          })
        : await homeApi<HomeMachineRow>("/staff/machines", {
            method: "POST",
            body: JSON.stringify(payload),
          });

      // Map dynamic / custom values
      const mapped = mapHomeMachine(saved);

      const nextMachine = {
        ...mapped,
        ...Object.fromEntries(customColumnsMachine.map((col) => [col.id, machineForm[col.id] || ""])),
      };

      setMachines((prev) => (editingMachineId ? prev.map((item) => (item.id === editingMachineId ? nextMachine : item)) : [nextMachine, ...prev]));
      if (!editingMachineId) setPage(1);
      setOpenMachineForm(false);
      toast.success(editingMachineId ? "Đã cập nhật thiết bị." : "Đã thêm thiết bị.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không lưu được thiết bị.");
    } finally {
      setIsSavingMachine(false);
    }
  };

  const updateMachineLastMaintenance = (machineId: string, date: string, nextDate?: string) => {
    setMachines((prev) =>
      prev.map((m) => {
        if (m.id !== machineId) return m;
        const lastM = m.lastMaintenance || "";
        return {
          ...m,
          lastMaintenance: date > lastM ? date : m.lastMaintenance,
          nextMaintenance: nextDate || m.nextMaintenance,
        };
      }),
    );
  };

  const startDeleteMachine = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingMachineId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingMachineId || isDeletingItem) return;
    setIsDeletingItem(true);
    const machine = machines.find((item) => item.id === deletingMachineId);

    try {
      await homeApi(`/staff/machines/${machine?.dbId || deletingMachineId}`, {
        method: "DELETE",
      });
      setMachines((prev) => prev.filter((item) => item.id !== deletingMachineId));
      setSelectedMachineIds((prev) => {
        const next = new Set(prev);
        next.delete(deletingMachineId);
        return next;
      });
      setDeletingMachineId(null);
      setDeleteConfirmOpen(false);
      toast.success("Đã xóa thiết bị.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không xóa được thiết bị.");
    } finally {
      setIsDeletingItem(false);
    }
  };

  const handleExport = (format: "pdf" | "excel" | "csv", fileName: string) => {
    const rows = filteredMachines;
    if (rows.length === 0) return;
    const baseFileName = fileName || `thiet-bi-${new Date().toISOString().slice(0, 10)}`;
    const headers = columnsMachine.filter((c) => c.id !== "actions" && c.visible).map((c) => c.label);

    if (format === "csv") {
      const csvData = rows.map((row) =>
        columnsMachine
          .filter((c) => c.id !== "actions" && c.visible)
          .map((c) => `"${String((row as Record<string, unknown>)[c.id] ?? "").replace(/"/g, '""')}"`)
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
            `<tr>${columnsMachine
              .filter((c) => c.id !== "actions" && c.visible)
              .map((c) => `<td>${(row as Record<string, unknown>)[c.id] ?? ""}</td>`)
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
            `<tr>${columnsMachine
              .filter((c) => c.id !== "actions" && c.visible)
              .map((c) => `<td>${(row as Record<string, unknown>)[c.id] ?? ""}</td>`)
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
            <h2>Danh sách Thiết bị</h2>
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
    setColumnsMachine((prev: ColumnItem[]) => {
      const next = [...prev];
      const actionIndex = next.findIndex((c) => c.id === "actions");
      next.splice(actionIndex === -1 ? next.length : actionIndex, 0, newColumn);
      return next;
    });
    setMachineForm((prev) => ({ ...prev, [newColumn.id]: "" }));
    setNewColumnName("");
    setOpenAddColumn(false);
  };

  const openMaintenanceHistoryMultiple = (items: WashingMachineItem[]) => {
    setHistoryMachines(items);
    setOpenHistoryDialog(true);
  };

  const renderMachineCell = (item: WashingMachineItem, column: ColumnItem) => {
    if (column.id === "id")
      return (
        <TableCell key={column.id} className="pl-4 font-medium text-slate-900">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              aria-label={`Chọn thiết bị ${item.id}`}
              checked={selectedMachineIds.has(item.id)}
              onChange={() => toggleMachineOne(item.id)}
              className={`shrink-0 ${checkboxClass}`}
            />
            <span>{item.id}</span>
          </div>
        </TableCell>
      );
    if (column.id === "name") return <TableCell key={column.id} className="font-medium text-slate-900">{item.name}</TableCell>;
    if (column.id === "capacity") return <TableCell key={column.id} className="text-slate-600">{item.capacity}</TableCell>;
    if (column.id === "area") return <TableCell key={column.id} className="text-slate-600">{item.area}</TableCell>;
    if (column.id === "loadType") return <TableCell key={column.id} className="text-slate-600">{item.loadType}</TableCell>;
    if (column.id === "lastMaintenance" || column.id === "nextMaintenance")
      return (
        <TableCell key={column.id} className="text-slate-600">
          {formatReadableDate(item[column.id])}
        </TableCell>
      );
    if (column.id === "status") {
      const color = statusColor[item.status];
      return (
        <TableCell key={column.id}>
          <span
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium"
            style={{ color: color.text, backgroundColor: color.bg }}
          >
            <span className="size-2 rounded-full" style={{ backgroundColor: color.text }} />
            {item.status}
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
              onClick={() => openEditMachine(item)}
            >
              Sửa
            </button>
            <button
              type="button"
              className="inline-flex h-7 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-100 cursor-pointer"
              onClick={(e) => startDeleteMachine(item.id, e)}
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

  const machineKanbanColumns = [
    { id: "Sẵn sàng", label: "Sẵn sàng", color: statusColor["Sẵn sàng"] },
    { id: "Đang chạy", label: "Đang chạy", color: statusColor["Đang chạy"] },
    { id: "Bảo trì", label: "Bảo trì", color: statusColor["Bảo trì"] },
  ];

  const renderMachineKanbanCard = (item: WashingMachineItem) => {
    return (
      <div
        key={item.id}
        draggable
        onDragStart={(event) => {
          setDraggedMachineId(item.id);
          event.dataTransfer.effectAllowed = "move";
        }}
        onDragEnd={() => {
          setDraggedMachineId(null);
          setDragOverMachineStatus(null);
        }}
        className={`cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-slate-300 hover:shadow-md active:cursor-grabbing ${draggedMachineId === item.id ? "opacity-50 ring-2 ring-slate-400" : ""}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <input
              type="checkbox"
              aria-label={`Chọn ${item.name}`}
              checked={selectedMachineIds.has(item.id)}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              onChange={() => toggleMachineOne(item.id)}
              className={`shrink-0 ${checkboxClass}`}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-700">{item.name}</p>
              <p className="truncate text-[11px] text-slate-400">{item.area}</p>
            </div>
          </div>
          <span className="shrink-0 text-[11px] font-semibold text-slate-400">{item.id}</span>
        </div>
        <p className="mt-2 text-xs text-slate-500 font-medium">
          Công suất: {item.capacity} · Nhóm: {item.loadType}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Bảo trì: {formatReadableDate(item.lastMaintenance)} đến {formatReadableDate(item.nextMaintenance)}
        </p>
        <p className="mt-1 line-clamp-2 text-xs text-slate-400">{displayValue(item.note)}</p>
        <div className="mt-3 flex justify-end gap-1.5 border-t border-slate-100 pt-2">
          <button
            type="button"
            onClick={() => openEditMachine(item)}
            className="inline-flex h-6 items-center rounded-md bg-slate-100 px-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200 cursor-pointer"
          >
            Chi tiết
          </button>
          <button
            type="button"
            onClick={(e) => startDeleteMachine(item.id, e)}
            className="inline-flex h-6 items-center rounded-md bg-red-50 px-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-100/70 cursor-pointer"
          >
            Xóa
          </button>
        </div>
      </div>
    );
  };

  const renderMachineListRow = (item: WashingMachineItem) => {
    return (
      <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <input
              type="checkbox"
              aria-label={`Chọn ${item.name}`}
              checked={selectedMachineIds.has(item.id)}
              onChange={() => toggleMachineOne(item.id)}
              className={`mt-1 shrink-0 ${checkboxClass}`}
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-950">{item.name}</p>
                <span className="text-xs font-medium text-slate-400">{item.id}</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  {item.area}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium"
                  style={{
                    color: statusColor[item.status].text,
                    backgroundColor: statusColor[item.status].bg,
                  }}
                >
                  <span className="size-2 rounded-full" style={{ backgroundColor: statusColor[item.status].text }} />
                  {item.status}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>Công suất: {item.capacity}</span>
                <span>Nhóm thiết bị: {item.loadType}</span>
                <span>Bảo trì gần nhất: {formatReadableDate(item.lastMaintenance)}</span>
                <span>Bảo trì kế tiếp: {formatReadableDate(item.nextMaintenance)}</span>
              </div>
              <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">{displayValue(item.note)}</p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
            <button
              type="button"
              className="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer"
              onClick={() => openEditMachine(item)}
            >
              Sửa
            </button>
            <button
              type="button"
              className="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-100 cursor-pointer"
              onClick={(e) => startDeleteMachine(item.id, e)}
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
            setSelectedMachineIds(new Set());
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
    { id: "Sẵn sàng", label: "Sẵn sàng", color: "#059669", bgColor: "rgba(5,150,105,0.09)" },
    { id: "Đang chạy", label: "Đang chạy", color: "#2563eb", bgColor: "rgba(37,99,235,0.09)" },
    { id: "Bảo trì", label: "Bảo trì", color: "#d97706", bgColor: "rgba(217,119,6,0.09)" },
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
        <MetricCard title="Tổng thiết bị" value={`${machines.length}`} hint="Máy giặt, máy sấy..." icon={WashingMachine} color="#2563eb" />
        <MetricCard title="Thiết bị sẵn sàng" value={`${machines.filter((m) => m.status === "Sẵn sàng").length}`} hint="Có thể hoạt động ngay" icon={WashingMachine} color="#059669" />
        <MetricCard title="Thiết bị đang chạy" value={`${machines.filter((m) => m.status === "Đang chạy").length}`} hint="Đang xử lý đơn hàng" icon={WashingMachine} color="#2563eb" />
        <MetricCard title="Thiết bị bảo trì" value={`${machines.filter((m) => m.status === "Bảo trì").length}`} hint="Cần kiểm tra kỹ thuật" icon={WashingMachine} color="#d97706" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <Toolbar
          leftContent={leftContent}
          query={query}
          onQueryChange={(q) => {
            setQuery(q);
            setPage(1);
          }}
          columns={columnsMachine}
          onColumnsChange={setColumnsMachine as any}
          tableResizeMode={tableResizeMode}
          onTableResizeModeChange={setTableResizeMode}
          selectedCount={selectedMachineIds.size}
          onOpenAddColumn={() => setOpenAddColumn(true)}
          showHistoryButton={true}
          onOpenHistory={() => {
            const selectedIds = Array.from(selectedMachineIds);
            const selectedMachinesList = machines.filter((m) => selectedIds.includes(m.id));
            if (selectedMachinesList.length === 0) {
              toast.error("Vui lòng chọn thiết bị trước khi xem lịch sử.");
              return;
            }
            openMaintenanceHistoryMultiple(selectedMachinesList);
          }}
          onExport={handleExport}
          defaultExportFileName={`thiet-bi-${new Date().toISOString().slice(0, 10)}`}
          onCreateClick={openCreateMachine}
          createLabel="Thêm thiết bị"
          defaultColumnIds={defaultMachineColumns.map((c) => c.id)}
          searchPlaceholder="Tìm thiết bị giặt sấy, khu vực, công suất..."
        />

        <FilterBar
          rangeLabel={rangeLabel}
          selectedValue={selectedMachineStatus}
          onValueChange={(val: string) => {
            setSelectedMachineStatus(val);
            setPage(1);
          }}
          filterOptions={filterOptions}
          filterLabel="Trạng thái thiết bị"
          showSelectionBar={true}
          allSelected={viewMode === "Bảng kéo" ? allKanbanMachinesSelected : allVisibleMachinesSelected}
          disabled={viewMode === "Bảng kéo" ? kanbanMachineIds.length === 0 : visibleMachineIds.length === 0}
          selectedCount={viewMode === "Bảng kéo" ? selectedKanbanMachineCount : selectedVisibleMachineCount}
          totalCount={viewMode === "Bảng kéo" ? kanbanMachineIds.length : visibleMachineIds.length}
          itemLabel="thiết bị"
          checkboxClass={checkboxClass}
          onToggleAll={viewMode === "Bảng kéo" ? toggleKanbanMachines : toggleVisibleMachines}
        />

        {filteredMachines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
            <p className="text-sm text-slate-400">Không tìm thấy thiết bị nào phù hợp.</p>
          </div>
        ) : viewMode === "Bảng kéo" ? (
          <KanbanView<WashingMachineItem>
            columns={machineKanbanColumns}
            rows={filteredMachines}
            groupByKey="status"
            draggedItemId={draggedMachineId}
            onDraggedItemIdChange={setDraggedMachineId}
            dragOverColumnId={dragOverMachineStatus}
            onDragOverColumnIdChange={setDragOverMachineStatus}
            onDropItem={async (machineId, status) => {
              const currentMachine = machines.find((item) => item.id === machineId);
              if (!currentMachine || currentMachine.status === status) return;
              setMachines((prev) => prev.map((m) => (m.id === machineId ? ({ ...m, status: status as MachineStatus } as WashingMachineItem) : m)));
              try {
                const saved = await homeApi<HomeMachineRow>(`/staff/machines/${currentMachine.dbId || machineId}`, {
                  method: "PUT",
                  body: JSON.stringify({ status }),
                });
                const nextMachine = mapHomeMachine(saved);
                setMachines((prev) => prev.map((m) => (m.id === machineId ? nextMachine : m)));
              } catch (error) {
                setMachines((prev) => prev.map((m) => (m.id === machineId ? currentMachine : m)));
                toast.error(error instanceof Error ? error.message : "Không cập nhật được trạng thái thiết bị.");
              }
            }}
            renderCard={renderMachineKanbanCard}
            tableResizeMode={tableResizeMode}
          />
        ) : viewMode === "Danh sách" ? (
          <div className="flex-1 flex flex-col min-h-0">
            <ListView paginatedRows={paginatedMachines} emptyMessage="Không tìm thấy thiết bị phù hợp." renderRow={renderMachineListRow} />
            <DashboardTableFooter
              page={page}
              pageCount={pageCount}
              pageSize={pageSize}
              totalRows={filteredMachines.length}
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
          <TableView<WashingMachineItem>
            columns={columnsMachine}
            onColumnsChange={setColumnsMachine as any}
            rows={paginatedMachines}
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
            emptyMessage="Không tìm thấy thiết bị phù hợp."
            tableResizeMode={tableResizeMode}
            totalVisibleWidth={totalVisibleWidth}
            renderCell={renderMachineCell as any}
            page={page}
            pageCount={pageCount}
            totalRows={filteredMachines.length}
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
        open={openMachineForm}
        onClose={() => setOpenMachineForm(false)}
        title={editingMachineId ? `Chỉnh sửa ${editingMachineId}` : "Thêm thiết bị giặt sấy mới"}
        fields={orderedMachineFormFields}
        form={machineForm}
        onFormChange={setMachineForm}
        onSave={saveMachine}
        isSaving={isSavingMachine}
        statusOptions={["Sẵn sàng", "Đang chạy", "Bảo trì"]}
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
        Bạn có chắc chắn muốn xóa thiết bị này không? Hành động này không thể hoàn tác.
      </DeleteConfirmDialog>

      {openHistoryDialog && (
        <MaintenanceHistoryDialog
          open={openHistoryDialog}
          onOpenChange={setOpenHistoryDialog}
          historyMachines={historyMachines}
          onUpdateMachineLastMaintenance={updateMachineLastMaintenance}
        />
      )}
    </>
  );
}
