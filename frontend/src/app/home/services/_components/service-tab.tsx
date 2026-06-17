"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Package, Wallet, Gift, Tags } from "lucide-react";
import { toast } from "sonner";
import { TableCell } from "@/components/ui/table";
import { ViewModeTabs } from "../../_components/dashboard-primitives";
import { Toolbar } from "../../_components/toolbar";
import { FilterBar, type FilterOption } from "../../_components/filter-bar";
import { TableView } from "../../_components/table-view";
import { KanbanView, type KanbanColumn } from "../../_components/kanban-view";
import { ListView } from "../../_components/list-view";
import { AddColumnDialog } from "../../_components/add-column-dialog";
import { MetricCard } from "../../_components/metric-card";
import { DeleteConfirmDialog } from "@/src/components/common/delete-confirm-dialog";
import { DashboardTableFooter, type DashboardTableColumn } from "@/src/components/common/dashboard-data-table";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import { formatRange, normalizeRange } from "@/src/utils/dashboard-time";

import {
  Service,
  ServiceStatus,
  ServiceForm,
  HomeServiceRow,
  ServicesTab,
} from "@/src/types/services";

import {
  serviceStatuses,
  statusColor,
  initialPageSize,
  serviceCustomValueStorageKey,
  serviceColumns,
  emptyServiceForm,
  serviceFormFields,
} from "@/src/constants/services";

import {
  formatCurrency,
  cleanServiceCode,
  toServiceUnitApi,
  toTurnaroundHours,
  toServiceStatusApi,
  mapHomeService,
  removeStoredCustomValues,
} from "@/src/utils/services";

import { homeApi } from "@/src/lib/home-api";
import { ServiceDialog } from "./service-dialog";
import type { StaffOperationsOverview } from "@/src/types/staff";

interface ServiceTabProps {
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  columnsService: DashboardTableColumn[];
  setColumnsService: React.Dispatch<React.SetStateAction<DashboardTableColumn[]>>;
  viewMode: "Bảng" | "Bảng kéo" | "Danh sách";
  setViewMode: (mode: "Bảng" | "Bảng kéo" | "Danh sách") => void;
  tableResizeMode: "fit" | "custom";
  setTableResizeMode: (mode: "fit" | "custom") => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  tab: ServicesTab;
  setTab: (t: ServicesTab) => void;
}

export function ServiceTab({
  services,
  setServices,
  columnsService,
  setColumnsService,
  viewMode,
  setViewMode,
  tableResizeMode,
  setTableResizeMode,
  pageSize,
  setPageSize,
  tab,
  setTab,
}: ServiceTabProps) {
  const [query, setQuery] = useState("");
  const [selectedServiceStatus, setSelectedServiceStatus] = useState<ServiceStatus | "Tất cả">("Tất cả");
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(new Set());

  const [page, setPage] = useState(1);
  const [customPageSize, setCustomPageSize] = useState(String(pageSize));
  const [openPageSizeMenu, setOpenPageSizeMenu] = useState(false);

  // Custom column dialog
  const [openAddColumn, setOpenAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  // CRUD Dialog states
  const [openServiceForm, setOpenServiceForm] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState<ServiceForm>(emptyServiceForm);
  const [inventoryOptions, setInventoryOptions] = useState<string[]>([]);
  const [inventoryOptionLabels, setInventoryOptionLabels] = useState<Record<string, string>>({});
  const [inventoryWarningLabels, setInventoryWarningLabels] = useState<Record<string, string>>({});
  const [disabledInventoryOptions, setDisabledInventoryOptions] = useState<string[]>([]);
  const [disabledInventoryLabels, setDisabledInventoryLabels] = useState<Record<string, string>>({});

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

  const serviceCustomColumns = useMemo(
    () => columnsService.filter((column) => column.id.startsWith("custom_")),
    [columnsService],
  );

  const range = useDashboardTimeRangeStore((state) => state.range);
  const rangeLabel = formatRange(normalizeRange(range));

  const activeServices = services.filter((item) => item.status === "Đang hoạt động").length;
  const pausedServices = services.filter((item) => item.status === "Tạm ngừng").length;
  const averageServicePrice = services.length > 0 ? services.reduce((sum, item) => sum + item.price, 0) / services.length : 0;

  const searchFilteredRows = useMemo(() => {
    const rawQuery = query.trim().toLowerCase();
    let result = services;
    if (selectedServiceStatus !== "Tất cả") {
      result = result.filter((item) => item.status === selectedServiceStatus);
    }
    if (rawQuery) {
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(rawQuery) ||
          item.category.toLowerCase().includes(rawQuery) ||
          item.id.toLowerCase().includes(rawQuery) ||
          item.note.toLowerCase().includes(rawQuery),
      );
    }
    return result;
  }, [services, selectedServiceStatus, query]);

  const pageCount = Math.max(1, Math.ceil(searchFilteredRows.length / pageSize));

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const activePaginatedRows = useMemo(() => {
    const offset = (page - 1) * pageSize;
    return searchFilteredRows.slice(offset, offset + pageSize);
  }, [searchFilteredRows, page, pageSize]);

  const selectableServiceIds = useMemo(
    () => (viewMode === "Bảng kéo" ? searchFilteredRows : activePaginatedRows).map((row) => row.id),
    [activePaginatedRows, searchFilteredRows, viewMode],
  );
  const selectedVisibleCount = selectableServiceIds.filter((id) => selectedServiceIds.has(id)).length;
  const allVisibleSelected = selectableServiceIds.length > 0 && selectedVisibleCount === selectableServiceIds.length;

  const toggleActiveRow = (id: string) => {
    setSelectedServiceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleActiveVisibleRows = () => {
    setSelectedServiceIds((prev) => {
      const next = new Set(prev);
      selectableServiceIds.forEach((id) => {
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
    () => columnsService.filter((column) => column.visible !== false).reduce((sum, column) => sum + (column.width || 100), 0),
    [columnsService],
  );

  const getCustomFields = (source: Record<string, unknown>, customCols: DashboardTableColumn[]) =>
    Object.fromEntries(customCols.map((column) => [column.id, String(source[column.id] ?? "")]));

  const getCustomFormValues = (form: Record<string, string>, customCols: DashboardTableColumn[]) =>
    Object.fromEntries(customCols.map((column) => [column.id, form[column.id] ?? ""]));

  const loadInventoryOptions = async () => {
    try {
      const overview = await homeApi<StaffOperationsOverview>("/staff/overview?limit=500", { cache: "no-store" });
      const inventory = (overview.inventory || []).filter((item) => item.item_code);
      const options = inventory.map((item) =>
        item.item_code!.startsWith("VT-") ? item.item_code! : `VT-${item.item_code}`,
      );
      setInventoryOptions(["Tất cả vật tư", ...options]);
      setInventoryOptionLabels(Object.fromEntries(inventory.map((item, index) => [
        options[index],
        `${options[index]} · ${item.name}`,
      ])));
      setDisabledInventoryOptions(inventory
        .filter((item) => item.status === "Cần mua" || Number(item.quantity || 0) <= 0)
        .map((item) => item.item_code!.startsWith("VT-") ? item.item_code! : `VT-${item.item_code}`));
      setDisabledInventoryLabels(Object.fromEntries(inventory
        .filter((item) => item.status === "Cần mua" || Number(item.quantity || 0) <= 0)
        .map((item) => {
          const code = item.item_code!.startsWith("VT-") ? item.item_code! : `VT-${item.item_code}`;
          return [code, Number(item.quantity || 0) <= 0 ? "Hết hàng" : "Cần mua"];
        })));
      setInventoryWarningLabels(Object.fromEntries(inventory
        .filter((item) => item.status === "Sắp hết" && Number(item.quantity || 0) > 0)
        .map((item) => {
          const code = item.item_code!.startsWith("VT-") ? item.item_code! : `VT-${item.item_code}`;
          return [code, "Sắp hết"];
        })));
    } catch {
      setInventoryOptions([]);
      setInventoryOptionLabels({});
      setDisabledInventoryOptions([]);
      setDisabledInventoryLabels({});
      setInventoryWarningLabels({});
    }
  };

  const orderedServiceFormFields = useMemo(() => {
    const fieldByColumnId = Object.fromEntries(serviceFormFields.map((field) => [
      field.id,
      field.id === "inventoryItems"
        ? {
            ...field,
            options: inventoryOptions,
            optionLabels: inventoryOptionLabels,
            optionWarningLabels: inventoryWarningLabels,
            disabledOptions: disabledInventoryOptions,
            disabledOptionLabels: disabledInventoryLabels,
          }
        : field,
    ]));
    const sortedColumns = columnsService.filter(
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
  }, [columnsService, disabledInventoryLabels, disabledInventoryOptions, inventoryOptionLabels, inventoryOptions, inventoryWarningLabels]);

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
    setColumnsService((prev) => {
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

    const service = services.find((item) => item.id === deleteTargetId);
    try {
      await homeApi(`/services/${String(service?.dbId || deleteTargetId)}`, {
        method: "DELETE",
      });
      setServices((prev) => prev.filter((item) => item.id !== deleteTargetId));
      removeStoredCustomValues(serviceCustomValueStorageKey, deleteTargetId);
      setSelectedServiceIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteTargetId);
        return next;
      });
      toast.success(`Đã xóa thành công mục ${deleteTargetId}!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không xóa được dịch vụ.");
    } finally {
      setIsDeletingItem(false);
      setConfirmDeleteOpen(false);
      setDeleteTargetId(null);
    }
  };

  const openCreateServiceForm = () => {
    void loadInventoryOptions();
    setEditingServiceId(null);
    setServiceForm({ ...emptyServiceForm, ...getCustomFields({}, serviceCustomColumns) });
    setOpenServiceForm(true);
  };

  const openEditServiceForm = (service: Service) => {
    void loadInventoryOptions();
    setEditingServiceId(service.id);
    setServiceForm({
      name: service.name,
      category: service.category,
      unit: service.unit,
      price: String(service.price),
      turnaround: service.turnaround,
      status: service.status,
      promotion: service.promotion,
      inventoryItems: service.inventoryItems,
      note: service.note,
      ...getCustomFields(service, serviceCustomColumns),
    });
    setOpenServiceForm(true);
  };

  const saveService = async () => {
    if (!serviceForm.name.trim() || !serviceForm.price.trim()) {
      toast.error("Vui lòng nhập đầy đủ các trường bắt buộc.");
      return;
    }
    if (Number(serviceForm.price) <= 0) {
      toast.error("Đơn giá phải là số lớn hơn 0.");
      return;
    }
    const selectedInventoryItems = serviceForm.inventoryItems.split(",").map((item) => item.trim()).filter(Boolean);
    if (selectedInventoryItems.some((item) => disabledInventoryOptions.includes(item))) {
      toast.error("Không thể lưu dịch vụ với vật tư đã hết hoặc đang cần mua.");
      return;
    }

    const editingService = services.find((service) => service.id === editingServiceId);
    const apiPayload = {
      service_code: cleanServiceCode(editingService?.id),
      name: serviceForm.name.trim(),
      category: serviceForm.category?.trim() || null,
      description: serviceForm.note?.trim() || null,
      unit: toServiceUnitApi(serviceForm.unit),
      price: Number(serviceForm.price) || 0,
      turnaround_hours: toTurnaroundHours(serviceForm.turnaround),
      status: toServiceStatusApi(serviceForm.status),
      promotion_enabled: serviceForm.promotion === "Có",
      inventory_items: serviceForm.inventoryItems
        .split(",")
        .map((item) => item.trim().split(" · ")[0])
        .filter(Boolean),
    };

    try {
      const saved = editingServiceId
        ? await homeApi<HomeServiceRow>(`/services/${String(editingService?.dbId || editingServiceId)}`, {
            method: "PUT",
            body: JSON.stringify(apiPayload),
          })
        : await homeApi<HomeServiceRow>("/services", {
            method: "POST",
            body: JSON.stringify(apiPayload),
          });
      const nextService = {
        ...mapHomeService(saved),
        ...getCustomFormValues(serviceForm, serviceCustomColumns),
      };
      setServices((prev) =>
        editingServiceId
          ? prev.map((service) => (service.id === editingServiceId ? nextService : service))
          : [nextService, ...prev],
      );
      toast.success(editingServiceId ? "Đã cập nhật dịch vụ." : "Đã thêm dịch vụ.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không lưu được dịch vụ.");
      return;
    }

    setPage(1);
    setOpenServiceForm(false);
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
    setColumnsService((prev) => {
      const next = [...prev];
      const noteIndex = next.findIndex((column) => column.id === "note");
      const actionIndex = next.findIndex((column) => column.id === "actions");
      const insertIndex = noteIndex !== -1 ? noteIndex : actionIndex !== -1 ? actionIndex : next.length;
      next.splice(insertIndex, 0, newColumn);
      return next;
    });
    setServiceForm((prev) => ({ ...prev, [newColumn.id]: "" }));
    setNewColumnName("");
    setOpenAddColumn(false);
  };

  function StatusPill({ label }: { label: ServiceStatus }) {
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

  const renderServiceCell = (service: Service, column: DashboardTableColumn) => {
    if (column.id === "id") return (
      <TableCell key={column.id} className="pl-4 font-medium text-slate-900">
        <div className="flex items-center gap-2">
          <input type="checkbox" aria-label={`Chọn dịch vụ ${service.id}`} checked={selectedServiceIds.has(service.id)} onChange={() => toggleActiveRow(service.id)} className={`shrink-0 ${checkboxClass}`} />
          <span>{service.id}</span>
        </div>
      </TableCell>
    );
    if (column.id === "name") return <TableCell key={column.id} className="font-semibold text-slate-800">{service.name}</TableCell>;
    if (column.id === "category") return <TableCell key={column.id}>{service.category}</TableCell>;
    if (column.id === "unit") return <TableCell key={column.id}>{service.unit}</TableCell>;
    if (column.id === "price") return <TableCell key={column.id} className="font-semibold text-slate-900">{formatCurrency(service.price)}</TableCell>;
    if (column.id === "turnaround") return <TableCell key={column.id} className="text-slate-500">{service.turnaround}</TableCell>;
    if (column.id === "status") return <TableCell key={column.id}><StatusPill label={service.status} /></TableCell>;
    if (column.id === "promotion") return <TableCell key={column.id} className="text-slate-500">{service.promotion}</TableCell>;
    if (column.id === "inventoryItems") return <TableCell key={column.id} className="max-w-0 truncate overflow-hidden text-slate-500" title={service.inventoryItems || "-"}>{service.inventoryItems || "-"}</TableCell>;
    if (column.id === "note") return <TableCell key={column.id} className="max-w-xs truncate text-slate-500" title={service.note}>{service.note || "-"}</TableCell>;
    if (column.id === "actions") return (
      <TableCell key={column.id} className="px-4">
        <div className="flex items-center justify-start gap-1.5">
          <button type="button" className="inline-flex h-7 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer" onClick={() => openEditServiceForm(service)}>Sửa</button>
          <button type="button" className="inline-flex h-7 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-100 cursor-pointer" onClick={() => handleDeleteClick(service.id)}>Xóa</button>
        </div>
      </TableCell>
    );
    return renderOptionalCell(service, column);
  };

  const renderKanbanCard = (row: Service) => {
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
              checked={selectedServiceIds.has(row.id)}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              onChange={() => toggleActiveRow(row.id)}
              className={`shrink-0 ${checkboxClass}`}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-700">{row.name}</p>
              <p className="truncate text-[11px] text-slate-400">{row.id} · {row.category}</p>
            </div>
          </div>
        </div>
        <p className="mt-2 text-xs font-semibold text-slate-900">{formatCurrency(row.price)} / {row.unit}</p>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-400">
          <span>Thời gian: {row.turnaround}</span>
          <button type="button" className="font-medium text-slate-700 hover:underline cursor-pointer" onClick={() => openEditServiceForm(row)}>Chi tiết</button>
        </div>
      </div>
    );
  };

  const renderListRow = (row: Service) => {
    return (
      <div key={row.id} className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 hover:bg-slate-50/50">
        <div className="flex min-w-0 items-center gap-3">
          <input type="checkbox" aria-label={`Chọn ${row.id}`} checked={selectedServiceIds.has(row.id)} onChange={() => toggleActiveRow(row.id)} className={`shrink-0 ${checkboxClass}`} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800">{row.name}</p>
            <p className="text-[11px] text-slate-400">{row.id} · {row.category} · {row.turnaround} · {formatCurrency(row.price)}/{row.unit}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill label={row.status} />
          <button type="button" className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer" onClick={() => openEditServiceForm(row)}>Sửa</button>
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
      serviceStatuses.map((status) => ({
        id: status,
        label: status,
        color: status === "Tất cả" ? "#64748b" : statusColor[status].text,
        bgColor: status === "Tất cả" ? "rgba(100,116,139,0.09)" : statusColor[status].bg,
      })),
    [],
  );

  const kanbanColumns = useMemo<KanbanColumn[]>(
    () =>
      serviceStatuses
        .filter((status) => status !== "Tất cả")
        .map((status) => ({
          id: status,
          label: status,
          color: statusColor[status as ServiceStatus],
        })),
    [],
  );

  const handleExport = (format: "pdf" | "excel" | "csv", fileName: string) => {
    const headers = columnsService.filter((c) => c.visible !== false && c.id !== "actions").map((c) => c.label);
    const values = searchFilteredRows.map((service) =>
      columnsService
        .filter((c) => c.visible !== false && c.id !== "actions")
        .map((c) => (c.id === "price" ? formatCurrency(service.price) : String(service[c.id] ?? ""))),
    );
    const baseFileName = fileName || `dich-vu-${new Date().toISOString().slice(0, 10)}`;

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
    printWindow.document.write(`<html><body><h2>Danh sách Dịch vụ</h2><table border="1"><thead><tr>${tableHead}</tr></thead><tbody>${tableBody}</tbody></table></body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <>
      <div className="grid shrink-0 gap-3 md:grid-cols-4">
        <MetricCard title="Dịch vụ hoạt động" value={`${activeServices}`} hint="Có thể nhận đơn hàng" icon={Package} color="#2563eb" />
        <MetricCard title="Dịch vụ tạm ngừng" value={`${pausedServices}`} hint="Ngưng cung cấp tạm thời" icon={Package} color="#d97706" />
        <MetricCard title="Đơn giá trung bình" value={formatCurrency(averageServicePrice)} hint="Tính trên các dịch vụ" icon={Package} color="#059669" />
        <MetricCard title="Nhóm dịch vụ" value={`${new Set(services.map((item) => item.category)).size}`} hint="Các loại phân loại" icon={Package} color="#dc2626" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <Toolbar
          leftContent={leftContent}
          query={query}
          onQueryChange={(q) => {
            setQuery(q);
            setPage(1);
          }}
          columns={columnsService}
          onColumnsChange={setColumnsService as any}
          tableResizeMode={tableResizeMode}
          onTableResizeModeChange={setTableResizeMode}
          selectedCount={selectedServiceIds.size}
          onOpenAddColumn={() => setOpenAddColumn(true)}
          showHistoryButton={false}
          onExport={handleExport}
          defaultExportFileName={`dich-vu-${new Date().toISOString().slice(0, 10)}`}
          onCreateClick={openCreateServiceForm}
          createLabel="Thêm dịch vụ"
          defaultColumnIds={serviceColumns.map((c) => c.id)}
          searchPlaceholder="Tìm dịch vụ, nhóm..."
        />

        <FilterBar
          rangeLabel={rangeLabel}
          selectedValue={selectedServiceStatus}
          onValueChange={(val: string) => {
            setSelectedServiceStatus(val as ServiceStatus | "Tất cả");
            setPage(1);
          }}
          filterOptions={filterOptions}
          filterLabel="Trạng thái dịch vụ"
          allSelected={allVisibleSelected}
          disabled={selectableServiceIds.length === 0}
          selectedCount={selectedVisibleCount}
          totalCount={selectableServiceIds.length}
          itemLabel="dịch vụ"
          checkboxClass={checkboxClass}
          onToggleAll={toggleActiveVisibleRows}
        />

        {searchFilteredRows.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
            <p className="text-sm text-slate-400">Không tìm thấy dịch vụ nào phù hợp.</p>
          </div>
        ) : viewMode === "Bảng kéo" ? (
          <KanbanView<Service>
            columns={kanbanColumns}
            rows={searchFilteredRows}
            groupByKey="status"
            draggedItemId={draggedItemId}
            onDraggedItemIdChange={setDraggedItemId}
            dragOverColumnId={dragOverStatus}
            onDragOverColumnIdChange={setDragOverStatus}
            onDropItem={async (id, status) => {
              const currentItem = services.find((item) => item.id === id);
              if (!currentItem || currentItem.status === status) return;
              setServices((prev) => prev.map((s) => (s.id === id ? ({ ...s, status: status as ServiceStatus } as Service) : s)));
              try {
                const saved = await homeApi<HomeServiceRow>(`/services/${String(currentItem.dbId || id)}`, {
                  method: "PUT",
                  body: JSON.stringify({ status: toServiceStatusApi(status as ServiceStatus) }),
                });
                setServices((prev) => prev.map((s) => (s.id === id ? mapHomeService(saved) : s)));
              } catch (error) {
                setServices((prev) => prev.map((s) => (s.id === id ? currentItem : s)));
                toast.error(error instanceof Error ? error.message : "Không cập nhật được trạng thái dịch vụ.");
              }
            }}
            renderCard={renderKanbanCard}
            tableResizeMode={tableResizeMode}
          />
        ) : viewMode === "Danh sách" ? (
          <div className="flex-1 flex flex-col min-h-0">
            <ListView paginatedRows={activePaginatedRows} emptyMessage="Không tìm thấy dịch vụ nào." renderRow={renderListRow} />
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
          <TableView<Service>
            columns={columnsService}
            onColumnsChange={setColumnsService as any}
            rows={activePaginatedRows}
            pageSize={pageSize}
            emptyMessage="Không tìm thấy dịch vụ nào."
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
            renderCell={renderServiceCell}
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

      <ServiceDialog
        open={openServiceForm}
        onClose={() => setOpenServiceForm(false)}
        editingId={editingServiceId}
        fields={orderedServiceFormFields}
        form={serviceForm}
        onFormChange={setServiceForm}
        onSave={saveService}
      />

      <AddColumnDialog
        open={openAddColumn}
        onOpenChange={setOpenAddColumn}
        newColumnName={newColumnName}
        onNewColumnNameChange={setNewColumnName}
        onAddColumn={addCustomColumn}
      />

      <DeleteConfirmDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen} onConfirm={confirmDelete} isLoading={isDeletingItem}>
        Bạn có chắc chắn muốn xóa dịch vụ {deleteTargetId} này không? Hành động này không thể hoàn tác.
      </DeleteConfirmDialog>
    </>
  );
}
