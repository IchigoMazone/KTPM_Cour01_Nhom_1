"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Gift, Tags, Wallet } from "lucide-react";
import { toast } from "sonner";
import { TableCell } from "@/components/ui/table";
import { ViewModeTabs } from "../../_components/dashboard-primitives";
import { Toolbar } from "../../_components/toolbar";
import { FilterBar, type FilterOption } from "../../_components/filter-bar";
import { TableView } from "../../_components/table-view";
import { KanbanView, type KanbanColumn } from "../../_components/kanban-view";
import { ListView } from "../../_components/list-view";
import { AddColumnDialog } from "../../_components/add-column-dialog";
import { DeleteConfirmDialog } from "@/src/components/common/delete-confirm-dialog";
import { DashboardTableFooter, type DashboardTableColumn } from "@/src/components/common/dashboard-data-table";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import { formatRange, normalizeRange } from "@/src/utils/dashboard-time";

import {
  Promotion,
  PromotionStatus,
  PromotionForm,
  HomePromotionRow,
  ServicesTab,
  Service,
} from "@/src/types/services";

import {
  promotionStatuses,
  statusColor,
  initialPageSize,
  promotionCustomValueStorageKey,
  promotionColumns,
  emptyPromotionForm,
  promotionFormFields,
} from "@/src/constants/services";

import {
  formatReadableDate,
  getPromotionStatusByDate,
  formatPromotionEndDate,
  formatPromotionIssuedQuantity,
  cleanPromotionValue,
  formatPromotionValue,
  mapHomePromotion,
  removeStoredCustomValues,
} from "@/src/utils/services";

import { homeApi } from "@/src/lib/home-api";
import { PromotionDialog } from "./promotion-dialog";

interface PromotionTabProps {
  services: Service[];
  promotions: Promotion[];
  setPromotions: React.Dispatch<React.SetStateAction<Promotion[]>>;
  columnsPromotion: DashboardTableColumn[];
  setColumnsPromotion: React.Dispatch<React.SetStateAction<DashboardTableColumn[]>>;
  viewMode: "Bảng" | "Bảng kéo" | "Danh sách";
  setViewMode: (mode: "Bảng" | "Bảng kéo" | "Danh sách") => void;
  tableResizeMode: "fit" | "custom";
  setTableResizeMode: (mode: "fit" | "custom") => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  tab: ServicesTab;
  setTab: (t: ServicesTab) => void;
}

export function PromotionTab({
  services,
  promotions,
  setPromotions,
  columnsPromotion,
  setColumnsPromotion,
  viewMode,
  setViewMode,
  tableResizeMode,
  setTableResizeMode,
  pageSize,
  setPageSize,
  tab,
  setTab,
}: PromotionTabProps) {
  const [query, setQuery] = useState("");
  const [selectedPromotionStatus, setSelectedPromotionStatus] = useState<PromotionStatus | "Tất cả">("Tất cả");
  const [selectedPromotionIds, setSelectedPromotionIds] = useState<Set<string>>(new Set());

  const [page, setPage] = useState(1);
  const [customPageSize, setCustomPageSize] = useState(String(pageSize));
  const [openPageSizeMenu, setOpenPageSizeMenu] = useState(false);

  // Custom column dialog
  const [openAddColumn, setOpenAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  // CRUD Dialog states
  const [openPromotionForm, setOpenPromotionForm] = useState(false);
  const [editingPromotionId, setEditingPromotionId] = useState<string | null>(null);
  const [promotionForm, setPromotionForm] = useState<PromotionForm>(emptyPromotionForm);

  // Delete Confirm Dialog states
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  // Kanban view states
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);

  // Column drag and drop
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  const promotionCustomColumns = useMemo(
    () => columnsPromotion.filter((column) => column.id.startsWith("custom_")),
    [columnsPromotion],
  );

  const range = useDashboardTimeRangeStore((state) => state.range);
  const rangeLabel = formatRange(normalizeRange(range));

  const runningPromotions = promotions.filter((item) => item.status === "Đang chạy").length;
  const expiringPromotions = promotions.filter((item) => item.status === "Sắp hết hạn").length;
  const endedPromotions = promotions.filter((item) => item.status === "Đã kết thúc").length;
  const usedPromotions = promotions.reduce((sum, item) => sum + Number(item.usedCount || 0), 0);

  const searchFilteredRows = useMemo(() => {
    const rawQuery = query.trim().toLowerCase();
    let result = promotions;
    if (selectedPromotionStatus !== "Tất cả") {
      result = result.filter((item) => item.status === selectedPromotionStatus);
    }
    if (rawQuery) {
      result = result.filter(
        (item) =>
          item.code.toLowerCase().includes(rawQuery) ||
          item.name.toLowerCase().includes(rawQuery) ||
          item.id.toLowerCase().includes(rawQuery) ||
          item.note.toLowerCase().includes(rawQuery),
      );
    }
    return result;
  }, [promotions, selectedPromotionStatus, query]);

  const pageCount = Math.max(1, Math.ceil(searchFilteredRows.length / pageSize));

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const activePaginatedRows = useMemo(() => {
    const offset = (page - 1) * pageSize;
    return searchFilteredRows.slice(offset, offset + pageSize);
  }, [searchFilteredRows, page, pageSize]);

  const selectablePromotionIds = useMemo(
    () => (viewMode === "Bảng kéo" ? searchFilteredRows : activePaginatedRows).map((row) => row.id),
    [activePaginatedRows, searchFilteredRows, viewMode],
  );
  const selectedVisibleCount = selectablePromotionIds.filter((id) => selectedPromotionIds.has(id)).length;
  const allVisibleSelected = selectablePromotionIds.length > 0 && selectedVisibleCount === selectablePromotionIds.length;

  const toggleActiveRow = (id: string) => {
    setSelectedPromotionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleActiveVisibleRows = () => {
    setSelectedPromotionIds((prev) => {
      const next = new Set(prev);
      selectablePromotionIds.forEach((id) => {
        if (allVisibleSelected) next.delete(id);
        else next.add(id);
      });
      return next;
    });
  };

  const updatePageSize = (nextSize: number) => {
    setPageSize(nextSize);
    setCustomPageSize(String(nextSize));
    setPage(1);
    setOpenPageSizeMenu(false);
  };

  const applyCustomPageSize = () => {
    const parsed = Math.max(1, Math.min(500, Number(customPageSize) || initialPageSize));
    setPageSize(parsed);
    setCustomPageSize(String(parsed));
    setPage(1);
    setOpenPageSizeMenu(false);
  };

  const totalVisibleWidth = useMemo(
    () => columnsPromotion.filter((column) => column.visible !== false).reduce((sum, column) => sum + (column.width || 100), 0),
    [columnsPromotion],
  );

  const getCustomFields = (source: Record<string, unknown>, customCols: DashboardTableColumn[]) =>
    Object.fromEntries(customCols.map((column) => [column.id, String(source[column.id] ?? "")]));

  const getCustomFormValues = (form: Record<string, string>, customCols: DashboardTableColumn[]) =>
    Object.fromEntries(customCols.map((column) => [column.id, form[column.id] ?? ""]));

  const normalizeAppliedServiceCodes = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        if (item === "Tất cả dịch vụ" || item.startsWith("DV-")) return item;
        return services.find((service) => service.name === item)?.id || item;
      })
      .join(", ");

  const orderedPromotionFormFields = useMemo(() => {
    const serviceCodes = Array.from(new Set(services.map((service) => service.id)));
    const options = ["Tất cả dịch vụ", ...serviceCodes];
    const disabledOptions = services
      .filter((service) => service.status !== "Đang hoạt động")
      .map((service) => service.id);
    const disabledOptionLabels = Object.fromEntries(
      disabledOptions.map((serviceCode) => [serviceCode, "Tạm ngừng"]),
    );
    const optionLabels = Object.fromEntries(
      services.map((service) => [service.id, `${service.id} · ${service.name}`]),
    );
    const fieldByColumnId = Object.fromEntries(
      promotionFormFields.map((field) => [
        field.id,
        field.id === "appliedService"
          ? { ...field, options, optionLabels, disabledOptions, disabledOptionLabels }
          : field,
      ]),
    );
    const sortedColumns = columnsPromotion.filter(
      (column) => column.id !== "id" && column.id !== "actions",
    );
    const noteIndex = sortedColumns.findIndex((column) => column.id === "note");
    if (noteIndex !== -1) {
      const [noteColumn] = sortedColumns.splice(noteIndex, 1);
      sortedColumns.push(noteColumn);
    }

    return sortedColumns.map(
      (column) =>
        fieldByColumnId[column.id] || {
          id: column.id,
          label: column.label,
          type: "text" as const,
          placeholder: `Nhập ${column.label.toLowerCase()}`,
        },
    );
  }, [columnsPromotion, services]);

  const checkboxClass =
    "relative size-4 appearance-none rounded-[5px] border border-slate-300 bg-white transition-all duration-150 checked:border-emerald-300 checked:bg-emerald-300 after:absolute after:left-1/2 after:top-1/2 after:hidden after:h-[9px] after:w-[5px] after:-translate-x-1/2 after:-translate-y-[58%] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:content-[''] checked:after:block";

  const handleDragStart = (event: React.DragEvent<HTMLTableCellElement>, id: string) => {
    setDraggedColumnId(id);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (event: React.DragEvent<HTMLTableCellElement>, id: string) => {
    event.preventDefault();
    if (id !== draggedColumnId) {
      setDragOverColumnId(id);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLTableCellElement>, id: string) => {
    event.preventDefault();
    if (!draggedColumnId || draggedColumnId === id) {
      setDragOverColumnId(null);
      return;
    }
    setColumnsPromotion((prev) => {
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

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    if (isDeletingItem) return;
    setIsDeletingItem(true);

    const promotion = promotions.find((item) => item.id === deleteTargetId);
    try {
      if (promotion?.dbId) {
        await homeApi(`/promotions/${String(promotion.dbId)}`, {
          method: "DELETE",
        });
      }
      setPromotions((prev) => prev.filter((item) => item.id !== deleteTargetId));
      removeStoredCustomValues(promotionCustomValueStorageKey, deleteTargetId);
      setSelectedPromotionIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteTargetId);
        return next;
      });
      toast.success(`Đã xóa thành công mục ${deleteTargetId}!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không xóa được mã giảm giá.");
    } finally {
      setIsDeletingItem(false);
      setConfirmDeleteOpen(false);
      setDeleteTargetId(null);
    }
  };

  const openCreatePromotionForm = () => {
    setEditingPromotionId(null);
    const startDate = new Date().toISOString().slice(0, 10);
    const endDate = "";
    setPromotionForm({
      ...emptyPromotionForm,
      ...getCustomFields({}, promotionCustomColumns),
      startDate,
      endDate,
      status: getPromotionStatusByDate(endDate),
    });
    setOpenPromotionForm(true);
  };

  const openEditPromotionForm = (promotion: Promotion) => {
    const normalizedAppliedServices = normalizeAppliedServiceCodes(promotion.appliedService);
    setEditingPromotionId(promotion.id);
    setPromotionForm({
      code: promotion.code,
      name: promotion.name,
      type: promotion.type,
      value: cleanPromotionValue(promotion.value),
      appliedService: normalizedAppliedServices,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      usage: promotion.usage,
      status: getPromotionStatusByDate(promotion.endDate),
      note: promotion.note,
      ...getCustomFields(promotion, promotionCustomColumns),
    });
    setOpenPromotionForm(true);
  };

  const savePromotion = async () => {
    if (
      !promotionForm.code.trim()
      || !promotionForm.name.trim()
      || !promotionForm.type.trim()
      || !promotionForm.appliedService.trim()
      || !promotionForm.value.trim()
    ) {
      toast.error("Vui lòng nhập đầy đủ các trường bắt buộc.");
      return;
    }
    const inactiveServiceCodes = new Set(
      services.filter((service) => service.status !== "Đang hoạt động").map((service) => service.id),
    );
    const selectedServiceCodes = promotionForm.appliedService.split(",").map((value) => value.trim()).filter(Boolean);
    if (selectedServiceCodes.some((code) => inactiveServiceCodes.has(code))) {
      toast.error("Không thể áp dụng mã giảm giá cho dịch vụ đang tạm ngừng.");
      return;
    }

    const numericValue = Number(cleanPromotionValue(promotionForm.value));
    if (Number.isNaN(numericValue) || numericValue <= 0) {
      toast.error("Giá trị giảm giá phải là số lớn hơn 0.");
      return;
    }

    if (promotionForm.type === "Phần trăm" && numericValue > 100) {
      toast.error("Giá trị giảm giá theo phần trăm không được vượt quá 100%.");
      return;
    }

    const editingPromotion = promotions.find((p) => p.id === editingPromotionId);
    const apiPayload = {
      code: promotionForm.code.trim().toUpperCase(),
      name: promotionForm.name.trim(),
      type: promotionForm.type,
      value: cleanPromotionValue(promotionForm.value),
      applied_service: promotionForm.appliedService
        .split(",")
        .map((value) => value.trim().split(" · ")[0])
        .filter(Boolean)
        .join(", "),
      start_date: promotionForm.startDate || new Date().toISOString().slice(0, 10),
      end_date: promotionForm.endDate || null,
      usage_limit: promotionForm.usage.trim() ? Number(promotionForm.usage.trim()) : null,
      claimed: editingPromotion ? editingPromotion.claimed : 0,
      note: promotionForm.note || null,
    };

    try {
      const saved = editingPromotionId && editingPromotion?.dbId
        ? await homeApi<HomePromotionRow>(`/promotions/${String(editingPromotion.dbId)}`, {
            method: "PUT",
            body: JSON.stringify(apiPayload),
          })
        : await homeApi<HomePromotionRow>("/promotions", {
            method: "POST",
            body: JSON.stringify(apiPayload),
          });

      const nextPromotion = {
        ...mapHomePromotion(saved),
        ...getCustomFormValues(promotionForm, promotionCustomColumns),
      };

      setPromotions((prev) =>
        editingPromotionId
          ? prev.map((promotion) => (promotion.id === editingPromotionId ? nextPromotion : promotion))
          : [nextPromotion, ...prev],
      );
      toast.success(editingPromotionId ? "Đã cập nhật mã giảm giá." : "Đã thêm mã giảm giá.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không lưu được mã giảm giá.");
      return;
    }

    setPage(1);
    setOpenPromotionForm(false);
  };

  const addCustomColumn = () => {
    const label = newColumnName.trim();
    if (!label) return;
    const newColumn: DashboardTableColumn = {
      id: `custom_${Date.now()}`,
      label,
      width: 150,
      visible: true,
    };
    setColumnsPromotion((prev) => {
      const next = [...prev];
      const noteIndex = next.findIndex((column) => column.id === "note");
      const actionIndex = next.findIndex((column) => column.id === "actions");
      const insertIndex = noteIndex !== -1 ? noteIndex : actionIndex !== -1 ? actionIndex : next.length;
      next.splice(insertIndex, 0, newColumn);
      return next;
    });
    setPromotionForm((prev) => ({ ...prev, [newColumn.id]: "" }));
    setNewColumnName("");
    setOpenAddColumn(false);
  };

  function StatusPill({ label }: { label: PromotionStatus }) {
    const color = statusColor[label];
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium"
        style={{ color: color.text, backgroundColor: color.bg }}
      >
        <span className="size-1.5 rounded-full" style={{ backgroundColor: color.text }} />
        {label}
      </span>
    );
  }

  function MetricCard({
    title,
    value,
    hint,
    icon: Icon,
    color,
  }: {
    title: string;
    value: string;
    hint: string;
    icon: any;
    color: string;
  }) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg" style={{ color, backgroundColor: `${color}14` }}>
              <Icon className="size-3.5" />
            </span>
            <p className="truncate text-xs font-semibold text-slate-900">{title}</p>
          </div>
        </div>
        <p className="mt-3 text-xl font-semibold tracking-tight text-slate-950">{value}</p>
        <p className="mt-2 truncate text-xs text-slate-400">{hint}</p>
      </div>
    );
  }

  const renderOptionalCell = (source: object, column: DashboardTableColumn) => {
    const value = (source as Record<string, unknown>)[column.id];
    const isMissing = value === undefined || value === null || value === "";
    const dispVal = isMissing ? "-" : String(value);

    return (
      <TableCell
        key={column.id}
        className={`max-w-0 truncate overflow-hidden ${isMissing ? "text-slate-400 italic" : "text-slate-600"}`}
        title={dispVal}
      >
        {dispVal}
      </TableCell>
    );
  };

  const renderPromotionCell = (promotion: Promotion, column: DashboardTableColumn) => {
    if (column.id === "id") return (
      <TableCell key={column.id} className="pl-4 font-medium text-slate-900 max-w-[120px] truncate">
        <div className="flex items-center gap-2 truncate">
          <input type="checkbox" aria-label={`Chọn mã giảm giá ${promotion.id}`} checked={selectedPromotionIds.has(promotion.id)} onChange={() => toggleActiveRow(promotion.id)} className={`shrink-0 ${checkboxClass}`} />
          <span className="truncate" title={promotion.id}>{promotion.id}</span>
        </div>
      </TableCell>
    );
    if (column.id === "code") return <TableCell key={column.id} className="font-semibold text-slate-900">{promotion.code}</TableCell>;
    if (column.id === "name") return <TableCell key={column.id} className="font-medium text-slate-800">{promotion.name}</TableCell>;
    if (column.id === "value") return <TableCell key={column.id} className="font-medium text-slate-900">{formatPromotionValue(promotion.value, promotion.type)}</TableCell>;
    if (column.id === "appliedService") {
      const appliedServiceCodes = normalizeAppliedServiceCodes(promotion.appliedService);
      return <TableCell key={column.id} className="max-w-0 truncate overflow-hidden text-slate-600" title={appliedServiceCodes}>{appliedServiceCodes}</TableCell>;
    }
    if (column.id === "startDate") return <TableCell key={column.id} className="text-slate-600">{formatReadableDate(promotion.startDate)}</TableCell>;
    if (column.id === "endDate") return <TableCell key={column.id} className="text-slate-600">{formatPromotionEndDate(promotion.endDate)}</TableCell>;
    if (column.id === "usage") return <TableCell key={column.id} className="text-slate-600">{formatPromotionIssuedQuantity(promotion.usage, promotion.claimed)}</TableCell>;
    if (column.id === "status") return <TableCell key={column.id}><StatusPill label={promotion.status} /></TableCell>;
    if (column.id === "note") return <TableCell key={column.id} className="max-w-xs truncate text-slate-500" title={promotion.note}>{promotion.note || "-"}</TableCell>;
    if (column.id === "actions") return (
      <TableCell key={column.id} className="px-4">
        <div className="flex items-center justify-start gap-1.5">
          <button type="button" className="inline-flex h-7 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer" onClick={() => openEditPromotionForm(promotion)}>Sửa</button>
          <button type="button" className="inline-flex h-7 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-100 cursor-pointer" onClick={() => handleDeleteClick(promotion.id)}>Xóa</button>
        </div>
      </TableCell>
    );
    return renderOptionalCell(promotion, column);
  };

  const renderKanbanCard = (row: Promotion) => {
    return (
      <div
        key={row.id}
        draggable
        onDragStart={(event) => {
          setDraggedItemId(row.id);
          event.dataTransfer.effectAllowed = "move";
        }}
        onDragEnd={() => {
          setDraggedItemId(null);
          setDragOverStatus(null);
        }}
        className={`cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-slate-300 hover:shadow-md active:cursor-grabbing ${draggedItemId === row.id ? "opacity-50 ring-2 ring-slate-400" : ""}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <input
              type="checkbox"
              aria-label={`Chọn ${row.id}`}
              checked={selectedPromotionIds.has(row.id)}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              onChange={() => toggleActiveRow(row.id)}
              className={`shrink-0 ${checkboxClass}`}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-700">{row.name}</p>
              <p className="truncate text-[11px] text-slate-400">{row.id} · {row.code}</p>
            </div>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">{formatPromotionValue(row.value, row.type)} · Đã dùng: {Number(row.usedCount || 0)}/{row.usage || "∞"}</p>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-400">
          <span>Hạn dùng: {formatPromotionEndDate(row.endDate)}</span>
          <button type="button" className="font-medium text-slate-700 hover:underline cursor-pointer" onClick={() => openEditPromotionForm(row)}>Chi tiết</button>
        </div>
      </div>
    );
  };

  const renderListRow = (row: Promotion) => {
    return (
      <div key={row.id} className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 hover:bg-slate-50/50">
        <div className="flex min-w-0 items-center gap-3">
          <input type="checkbox" aria-label={`Chọn ${row.id}`} checked={selectedPromotionIds.has(row.id)} onChange={() => toggleActiveRow(row.id)} className={`shrink-0 ${checkboxClass}`} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800">{row.name}</p>
            <p className="text-[11px] text-slate-400">{row.id} · Mã: {row.code} · Áp dụng: {normalizeAppliedServiceCodes(row.appliedService)} · Giá trị: {formatPromotionValue(row.value, row.type)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill label={row.status} />
          <button type="button" className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer" onClick={() => openEditPromotionForm(row)}>Sửa</button>
        </div>
      </div>
    );
  };

  const leftContent = (
    <div className="flex flex-wrap items-center gap-1">
      {(
        [
          ["Dịch vụ", Tags],
          ["Mã giảm giá", Gift],
          ["Tài chính", Wallet],
        ] as const
      ).map(([item, Icon]) => (
        <button
          key={item}
          type="button"
          onClick={() => {
            setTab(item as ServicesTab);
            setQuery("");
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

  const filterOptions = useMemo<FilterOption[]>(
    () =>
      promotionStatuses.map((status) => ({
        id: status,
        label: status,
        color: status === "Tất cả" ? "#64748b" : statusColor[status as PromotionStatus].text,
        bgColor: status === "Tất cả" ? "rgba(100,116,139,0.09)" : statusColor[status as PromotionStatus].bg,
      })),
    [],
  );

  const kanbanColumns = useMemo<KanbanColumn[]>(
    () =>
      promotionStatuses
        .filter((status) => status !== "Tất cả")
        .map((status) => ({
          id: status,
          label: status,
          color: statusColor[status as PromotionStatus],
        })),
    [],
  );

  const handleExport = (format: "pdf" | "excel" | "csv", fileName: string) => {
    const headers = columnsPromotion.filter((c) => c.visible !== false && c.id !== "actions").map((c) => c.label);
    const values = searchFilteredRows.map((promotion) =>
      columnsPromotion
        .filter((c) => c.visible !== false && c.id !== "actions")
        .map((c) => (c.id === "value" ? formatPromotionValue(promotion.value, promotion.type) : String(promotion[c.id] ?? ""))),
    );
    const baseFileName = fileName || `ma-giam-gia-${new Date().toISOString().slice(0, 10)}`;

    if (format === "csv") {
      const csv = "\uFEFF" + [headers, ...values].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${baseFileName}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    const tableHead = headers.map((h) => `<th>${h}</th>`).join("");
    const tableBody = values.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("");
    if (format === "excel") {
      const blob = new Blob([`<html><meta charset="utf-8" /><body><table border="1"><thead><tr>${tableHead}</tr></thead><tbody>${tableBody}</tbody></table></body></html>`], { type: "application/vnd.ms-excel" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${baseFileName}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`<html><body><h2>Danh sách Mã giảm giá</h2><table border="1"><thead><tr>${tableHead}</tr></thead><tbody>${tableBody}</tbody></table></body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <>
      <div className="grid shrink-0 gap-3 md:grid-cols-4">
        <MetricCard title="Tổng mã giảm giá" value={`${promotions.length}`} hint="Mã ưu đãi đã thiết lập" icon={Gift} color="#2563eb" />
        <MetricCard title="Đang kích hoạt" value={`${runningPromotions}`} hint={`${expiringPromotions} mã sắp hết hạn`} icon={Gift} color="#059669" />
        <MetricCard title="Đã kết thúc" value={`${endedPromotions}`} hint="Hết hạn hoặc ngưng dùng" icon={Gift} color="#d97706" />
        <MetricCard title="Tổng lượt đã dùng" value={`${usedPromotions}`} hint="Lượt khách áp dụng thành công" icon={Gift} color="#dc2626" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <Toolbar
          leftContent={leftContent}
          query={query}
          onQueryChange={(q) => {
            setQuery(q);
            setPage(1);
          }}
          columns={columnsPromotion}
          onColumnsChange={setColumnsPromotion as any}
          tableResizeMode={tableResizeMode}
          onTableResizeModeChange={setTableResizeMode}
          selectedCount={selectedPromotionIds.size}
          onOpenAddColumn={() => setOpenAddColumn(true)}
          showHistoryButton={false}
          onExport={handleExport}
          defaultExportFileName={`ma-giam-gia-${new Date().toISOString().slice(0, 10)}`}
          onCreateClick={openCreatePromotionForm}
          createLabel="Thêm mã giảm giá"
          defaultColumnIds={promotionColumns.map((c) => c.id)}
          searchPlaceholder="Tìm mã, tên chương trình..."
        />

        <FilterBar
          rangeLabel={rangeLabel}
          selectedValue={selectedPromotionStatus}
          onValueChange={(val: string) => {
            setSelectedPromotionStatus(val as PromotionStatus | "Tất cả");
            setPage(1);
          }}
          filterOptions={filterOptions}
          filterLabel="Trạng thái mã giảm giá"
          allSelected={allVisibleSelected}
          disabled={selectablePromotionIds.length === 0}
          selectedCount={selectedVisibleCount}
          totalCount={selectablePromotionIds.length}
          itemLabel="mã giảm giá"
          checkboxClass={checkboxClass}
          onToggleAll={toggleActiveVisibleRows}
        />

        {searchFilteredRows.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
            <p className="text-sm text-slate-400">Không tìm thấy mã giảm giá nào phù hợp.</p>
          </div>
        ) : viewMode === "Bảng kéo" ? (
          <KanbanView<Promotion>
            columns={kanbanColumns}
            rows={searchFilteredRows}
            groupByKey="status"
            draggedItemId={draggedItemId}
            onDraggedItemIdChange={setDraggedItemId}
            dragOverColumnId={dragOverStatus}
            onDragOverColumnIdChange={setDragOverStatus}
            onDropItem={async (id, status) => {
              const currentItem = promotions.find((item) => item.id === id);
              if (!currentItem || currentItem.status === status) return;
              setPromotions((prev) => prev.map((p) => (p.id === id ? ({ ...p, status: status as PromotionStatus } as Promotion) : p)));
              try {
                if (currentItem.dbId) {
                  const saved = await homeApi<HomePromotionRow>(`/promotions/${String(currentItem.dbId)}`, {
                    method: "PUT",
                    body: JSON.stringify({
                      status: status as PromotionStatus,
                      start_date: currentItem.startDate,
                      end_date: status === "Đã kết thúc" ? new Date().toISOString().slice(0, 10) : currentItem.endDate,
                    }),
                  });
                  setPromotions((prev) => prev.map((p) => (p.id === id ? mapHomePromotion(saved) : p)));
                }
              } catch (error) {
                setPromotions((prev) => prev.map((p) => (p.id === id ? currentItem : p)));
                toast.error(error instanceof Error ? error.message : "Không cập nhật được trạng thái mã giảm giá.");
              }
            }}
            renderCard={renderKanbanCard}
            tableResizeMode={tableResizeMode}
          />
        ) : viewMode === "Danh sách" ? (
          <div className="flex-1 flex flex-col min-h-0">
            <ListView paginatedRows={activePaginatedRows} emptyMessage="Không tìm thấy mã giảm giá nào." renderRow={renderListRow} />
            <DashboardTableFooter
              page={page}
              pageCount={pageCount}
              pageSize={pageSize}
              totalRows={searchFilteredRows.length}
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
          <TableView<Promotion>
            columns={columnsPromotion}
            onColumnsChange={setColumnsPromotion as any}
            rows={activePaginatedRows}
            pageSize={pageSize}
            emptyMessage="Không tìm thấy mã giảm giá nào."
            columnDrag={{
              draggedColumnId,
              dragOverColumnId,
              onDragStart: handleDragStart,
              onDragOver: handleDragOver,
              onDragLeave: () => setDragOverColumnId(null),
              onDrop: handleDrop,
              onDragEnd: () => {
                setDraggedColumnId(null);
                setDragOverColumnId(null);
              },
            }}
            renderCell={renderPromotionCell}
            tableResizeMode={tableResizeMode}
            totalVisibleWidth={totalVisibleWidth}
            page={page}
            pageCount={pageCount}
            totalRows={searchFilteredRows.length}
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

      <PromotionDialog
        open={openPromotionForm}
        onClose={() => setOpenPromotionForm(false)}
        editingId={editingPromotionId}
        fields={orderedPromotionFormFields}
        form={promotionForm}
        onFormChange={setPromotionForm}
        onSave={savePromotion}
      />

      <AddColumnDialog
        open={openAddColumn}
        onOpenChange={setOpenAddColumn}
        newColumnName={newColumnName}
        onNewColumnNameChange={setNewColumnName}
        onAddColumn={addCustomColumn}
      />

      <DeleteConfirmDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen} onConfirm={confirmDelete} isLoading={isDeletingItem}>
        Bạn có chắc chắn muốn xóa mã giảm giá {deleteTargetId} này không? Hành động này không thể hoàn tác.
      </DeleteConfirmDialog>
    </>
  );
}
