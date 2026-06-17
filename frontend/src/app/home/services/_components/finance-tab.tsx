"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Wallet, CircleDollarSign, Gift, Tags } from "lucide-react";
import { toast } from "sonner";
import { TableCell } from "@/components/ui/table";
import { ViewModeTabs } from "../../_components/dashboard-primitives";
import { Toolbar } from "../../_components/toolbar";
import { FilterBar, type FilterOption } from "../../_components/filter-bar";
import { TableView } from "../../_components/table-view";
import { ListView } from "../../_components/list-view";
import { AddColumnDialog } from "../../_components/add-column-dialog";
import { MetricCard } from "../../_components/metric-card";
import { DeleteConfirmDialog } from "@/src/components/common/delete-confirm-dialog";
import { DashboardTableFooter, type DashboardTableColumn } from "@/src/components/common/dashboard-data-table";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import { formatRange, normalizeRange } from "@/src/utils/dashboard-time";
import { homeApi, listHomeResource } from "@/src/lib/home-api";

import {
  FinanceRecord,
  FinanceType,
  FinanceStatus,
  FinanceForm,
  ServicesTab,
  HomeFinanceRow,
} from "@/src/types/services";

import {
  financeTypes,
  financeFixedStatus,
  statusColor,
  typeColor,
  initialPageSize,
  financeColumns,
  emptyFinanceForm,
} from "@/src/constants/services";

import {
  formatCurrency,
  parseInputDate,
  formatReadableDate,
  mapHomeFinance,
} from "@/src/utils/services";

import { FinanceDialog } from "./finance-dialog";

type FinanceCustomer = {
  customer_id: string;
  customer_code: string;
  full_name: string;
  image_url?: string | null;
  avatar_url?: string | null;
};

type FinanceOrder = {
  order_code: string;
};

interface FinanceTabProps {
  financeRecords: FinanceRecord[];
  setFinanceRecords: React.Dispatch<React.SetStateAction<FinanceRecord[]>>;
  columnsFinance: DashboardTableColumn[];
  setColumnsFinance: React.Dispatch<React.SetStateAction<DashboardTableColumn[]>>;
  viewMode: "Bảng" | "Bảng kéo" | "Danh sách";
  setViewMode: (mode: "Bảng" | "Bảng kéo" | "Danh sách") => void;
  tableResizeMode: "fit" | "custom";
  setTableResizeMode: (mode: "fit" | "custom") => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  tab: ServicesTab;
  setTab: (t: ServicesTab) => void;
  currentStaffName: string;
  currentStaffAvatar: string;
}

export function FinanceTab({
  financeRecords,
  setFinanceRecords,
  columnsFinance,
  setColumnsFinance,
  viewMode,
  setViewMode,
  tableResizeMode,
  setTableResizeMode,
  pageSize,
  setPageSize,
  tab,
  setTab,
  currentStaffName,
  currentStaffAvatar,
}: FinanceTabProps) {
  const [query, setQuery] = useState("");
  const [selectedFinanceType, setSelectedFinanceType] = useState<FinanceType | "Tất cả">("Tất cả");
  const [selectedFinanceIds, setSelectedFinanceIds] = useState<Set<string>>(new Set());

  const [page, setPage] = useState(1);
  const [customPageSize, setCustomPageSize] = useState(String(pageSize));
  const [openPageSizeMenu, setOpenPageSizeMenu] = useState(false);

  // Custom column dialog
  const [openAddColumn, setOpenAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  // CRUD Dialog states
  const [openFinanceForm, setOpenFinanceForm] = useState(false);
  const [editingFinanceId, setEditingFinanceId] = useState<string | null>(null);
  const [financeForm, setFinanceForm] = useState<FinanceForm>(emptyFinanceForm);

  // Delete Confirm Dialog states
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  // Column drag and drop
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<FinanceCustomer[]>([]);
  const [orders, setOrders] = useState<FinanceOrder[]>([]);

  useEffect(() => {
    let alive = true;
    Promise.all([
      listHomeResource<FinanceCustomer>("customers", { limit: 500 }),
      listHomeResource<FinanceOrder>("orders", { limit: 500 }),
    ])
      .then(([customerResponse, orderResponse]) => {
        if (!alive) return;
        setCustomers(customerResponse.items);
        setOrders(orderResponse.items);
      })
      .catch(() => {
        if (!alive) return;
        setCustomers([]);
        setOrders([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  const financeCustomColumns = useMemo(
    () => columnsFinance.filter((column) => column.id.startsWith("custom_")),
    [columnsFinance],
  );

  const range = useDashboardTimeRangeStore((state) => state.range);
  const { start, end } = normalizeRange(range);
  const rangeLabel = formatRange(normalizeRange(range));

  const filteredFinanceRecords = useMemo(() => {
    return financeRecords.filter((record) => {
      const recordDate = parseInputDate(record.date);
      if (!recordDate) return true;
      return recordDate >= start && recordDate <= end;
    });
  }, [financeRecords, start, end]);

  const revenue = filteredFinanceRecords
    .filter((item) => item.type === "Doanh thu" && item.status === "Đã thu")
    .reduce((sum, item) => sum + item.amount, 0);
  const receivable = filteredFinanceRecords
    .filter((item) => item.type === "Công nợ" && item.status === "Chờ thu")
    .reduce((sum, item) => sum + item.amount, 0);
  const expense = filteredFinanceRecords
    .filter((item) =>
      (item.type === "Chi phí" && (item.status === "Đã thu" || item.status === "Đã chi")) ||
      (item.type === "Hoàn tiền" && item.status === "Đã chi"),
    )
    .reduce((sum, item) => sum + item.amount, 0);
  const totalAmount = filteredFinanceRecords.reduce((sum, item) => sum + item.amount, 0);

  const searchFilteredRows = useMemo(() => {
    const rawQuery = query.trim().toLowerCase();
    let result = filteredFinanceRecords;
    if (selectedFinanceType !== "Tất cả") {
      result = result.filter((item) => item.type === selectedFinanceType);
    }
    if (rawQuery) {
      result = result.filter(
        (item) =>
          item.customer.toLowerCase().includes(rawQuery) ||
          item.inventoryName.toLowerCase().includes(rawQuery) ||
          item.id.toLowerCase().includes(rawQuery) ||
          item.orderId.toLowerCase().includes(rawQuery) ||
          item.method.toLowerCase().includes(rawQuery) ||
          item.note.toLowerCase().includes(rawQuery),
      );
    }
    return result;
  }, [filteredFinanceRecords, selectedFinanceType, query]);

  const pageCount = Math.max(1, Math.ceil(searchFilteredRows.length / pageSize));

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const activePaginatedRows = useMemo(() => {
    const offset = (page - 1) * pageSize;
    return searchFilteredRows.slice(offset, offset + pageSize);
  }, [searchFilteredRows, page, pageSize]);

  const selectableFinanceIds = useMemo(
    () => activePaginatedRows.map((row) => row.id),
    [activePaginatedRows],
  );
  const selectedVisibleCount = selectableFinanceIds.filter((id) => selectedFinanceIds.has(id)).length;
  const allVisibleSelected = selectableFinanceIds.length > 0 && selectedVisibleCount === selectableFinanceIds.length;

  const toggleActiveRow = (id: string) => {
    setSelectedFinanceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleActiveVisibleRows = () => {
    setSelectedFinanceIds((prev) => {
      const next = new Set(prev);
      selectableFinanceIds.forEach((id) => {
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
    () => columnsFinance.filter((column) => column.visible !== false).reduce((sum, column) => sum + (column.width || 100), 0),
    [columnsFinance],
  );

  const getCustomFields = (source: Record<string, unknown>, customCols: DashboardTableColumn[]) =>
    Object.fromEntries(customCols.map((column) => [column.id, String(source[column.id] ?? "")]));

  const getCustomFormValues = (form: Record<string, string>, customCols: DashboardTableColumn[]) =>
    Object.fromEntries(customCols.map((column) => [column.id, form[column.id] ?? ""]));

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
    setColumnsFinance((prev) => {
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

    const record = financeRecords.find((item) => item.id === deleteTargetId);
    try {
      await homeApi(`/finance-records/${String(record?.dbId || deleteTargetId)}`, { method: "DELETE" });
      setFinanceRecords((prev) => prev.filter((item) => item.id !== deleteTargetId));
      setSelectedFinanceIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteTargetId);
        return next;
      });
      toast.success(`Đã xóa thành công mục ${deleteTargetId}!`);
      setConfirmDeleteOpen(false);
      setDeleteTargetId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không xóa được giao dịch.");
    } finally {
      setIsDeletingItem(false);
    }
  };

  const openCreateFinanceForm = () => {
    setEditingFinanceId(null);
    setFinanceForm({
      ...emptyFinanceForm,
      ...getCustomFields({}, financeCustomColumns),
      date: new Date().toISOString().slice(0, 10),
      owner: currentStaffName,
    });
    setOpenFinanceForm(true);
  };

  const openEditFinanceForm = (record: FinanceRecord) => {
    setEditingFinanceId(record.id);
    setFinanceForm({
      date: record.date,
      type: record.type,
      customerCode: record.customerCode || "",
      customer: record.customer,
      inventoryName: record.inventoryName,
      orderId: record.orderId,
      method: record.method,
      amount: String(record.amount),
      status: record.status,
      owner: record.owner || currentStaffName,
      note: record.note,
      ...getCustomFields(record, financeCustomColumns),
    });
    setOpenFinanceForm(true);
  };

  const saveFinanceRecord = async () => {
    const requiresCustomerCode = ["Doanh thu", "Công nợ", "Hoàn tiền"].includes(financeForm.type);
    const editingRecord = financeRecords.find((record) => record.id === editingFinanceId);
    const isInventoryLinked = Boolean(editingRecord?.inventoryItemId);
    if (
      !financeForm.orderId.trim()
      || (requiresCustomerCode && !financeForm.customerCode.trim())
    ) {
      toast.error("Vui lòng nhập đầy đủ các trường bắt buộc.");
      return;
    }
    if (!financeForm.type.trim()) {
      toast.error("Vui lòng nhập loại giao dịch.");
      return;
    }
    if (!financeForm.date.trim()) {
      toast.error("Vui lòng chọn ngày ghi nhận.");
      return;
    }
    if (!financeForm.customer.trim() && !isInventoryLinked) {
      toast.error(requiresCustomerCode ? "Không tìm thấy khách hàng từ mã đã nhập." : "Vui lòng nhập khách hàng hoặc đối tác.");
      return;
    }
    if (!financeForm.amount.trim() || Number(financeForm.amount) <= 0) {
      toast.error("Vui lòng nhập số tiền lớn hơn 0.");
      return;
    }
    const normalizedCustomerCode = financeForm.customerCode.trim().toUpperCase();
    if (
      normalizedCustomerCode
      && !customers.some(
        (customer) => customer.customer_code.toUpperCase() === financeForm.customerCode.trim().toUpperCase(),
      )
    ) {
      toast.error(`Không tồn tại khách hàng ${normalizedCustomerCode}.`);
      return;
    }
    const relatedCode = financeForm.orderId.trim().toUpperCase();
    if (
      relatedCode
      && relatedCode !== "-"
      && relatedCode.startsWith("DH-")
      && !orders.some((order) => order.order_code.toUpperCase() === relatedCode)
    ) {
      toast.error(`Không tồn tại đơn hàng ${relatedCode}.`);
      return;
    }
    const apiPayload = {
      transaction_date: financeForm.date || new Date().toISOString().slice(0, 10),
      type: financeForm.type,
      customer_code: normalizedCustomerCode || null,
      customer: financeForm.customer,
      inventory_name: financeForm.inventoryName || null,
      related_code: relatedCode || "-",
      order_code: relatedCode || "-",
      payment_method: financeForm.method,
      amount: Number(financeForm.amount) || 0,
      status: financeFixedStatus[financeForm.type] || financeForm.status,
      owner: currentStaffName,
      note: financeForm.note,
    };

    try {
      const saved = editingRecord
        ? await homeApi<HomeFinanceRow>(`/finance-records/${String(editingRecord.dbId || editingRecord.id)}`, {
            method: "PUT",
            body: JSON.stringify(apiPayload),
          })
        : await homeApi<HomeFinanceRow>("/finance-records", {
            method: "POST",
            body: JSON.stringify(apiPayload),
          });
      const nextRecord = {
        ...mapHomeFinance(saved),
        ...getCustomFormValues(financeForm, financeCustomColumns),
      };
      const createdFromExisting = Boolean(
        editingRecord
        && String(saved.finance_record_id) !== String(editingRecord.dbId || editingRecord.id),
      );
      setFinanceRecords((prev) => {
        if (createdFromExisting) return [nextRecord, ...prev];
        if (editingRecord) {
          return prev.map((record) => (record.id === editingRecord.id ? nextRecord : record));
        }
        return [nextRecord, ...prev];
      });
      toast.success(
        createdFromExisting
          ? `Đã tạo giao dịch hoàn tiền ${nextRecord.id}.`
          : editingRecord
            ? "Đã cập nhật giao dịch."
            : "Đã thêm giao dịch.",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không lưu được giao dịch.");
      return;
    }

    setPage(1);
    setOpenFinanceForm(false);
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
    setColumnsFinance((prev) => {
      const next = [...prev];
      const actionIndex = next.findIndex((column) => column.id === "actions");
      next.splice(actionIndex === -1 ? next.length : actionIndex, 0, newColumn);
      return next;
    });
    setFinanceForm((prev) => ({ ...prev, [newColumn.id]: "" }));
    setNewColumnName("");
    setOpenAddColumn(false);
  };

  function StatusPill({ label }: { label: FinanceStatus }) {
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

  function TypePill({ label }: { label: FinanceType }) {
    const color = typeColor[label];
    if (!color) {
      return (
        <span className="inline-flex items-center rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium text-slate-600">
          {label}
        </span>
      );
    }
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium"
        style={{ color, backgroundColor: `${color}17` }}
      >
        <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
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

  const renderFinanceCell = (record: FinanceRecord, column: DashboardTableColumn) => {
    if (column.id === "id") return (
      <TableCell key={column.id} className="pl-4 font-medium text-slate-900">
        <div className="flex items-center gap-2">
          <input type="checkbox" aria-label={`Chọn giao dịch ${record.id}`} checked={selectedFinanceIds.has(record.id)} onChange={() => toggleActiveRow(record.id)} className={`shrink-0 ${checkboxClass}`} />
          <span>{record.id}</span>
        </div>
      </TableCell>
    );
    if (column.id === "date") return <TableCell key={column.id} className="text-slate-500">{formatReadableDate(record.date)}</TableCell>;
    if (column.id === "type") return <TableCell key={column.id}><TypePill label={record.type} /></TableCell>;
    if (column.id === "customer") return (
      <TableCell key={column.id} className={record.customer ? "font-semibold text-slate-800" : "text-slate-400 italic"}>
        {record.customer || "-"}
      </TableCell>
    );
    if (column.id === "inventoryName") return <TableCell key={column.id} className="font-medium text-slate-800">{record.inventoryName || "-"}</TableCell>;
    if (column.id === "orderId") return <TableCell key={column.id}>{record.orderId}</TableCell>;
    if (column.id === "method") return (
      <TableCell key={column.id} className={record.method ? "" : "text-slate-400 italic"}>
        {record.method || "-"}
      </TableCell>
    );
    if (column.id === "amount") return <TableCell key={column.id} className="font-semibold text-slate-950">{formatCurrency(record.amount)}</TableCell>;
    if (column.id === "status") return <TableCell key={column.id}><StatusPill label={record.status} /></TableCell>;
    if (column.id === "owner") return <TableCell key={column.id} className="text-slate-500">{record.owner}</TableCell>;
    if (column.id === "note") return <TableCell key={column.id} className="max-w-xs truncate text-slate-500" title={record.note}>{record.note || "-"}</TableCell>;
    if (column.id === "actions") return (
      <TableCell key={column.id} className="px-4">
        <div className="flex items-center justify-start gap-1.5">
          <button type="button" className="inline-flex h-7 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer" onClick={() => openEditFinanceForm(record)}>Sửa</button>
          <button type="button" className="inline-flex h-7 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-100 cursor-pointer" onClick={() => handleDeleteClick(record.id)}>Xóa</button>
        </div>
      </TableCell>
    );
    return renderOptionalCell(record, column);
  };

  const renderListRow = (row: FinanceRecord) => {
    return (
      <div key={row.id} className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 hover:bg-slate-50/50">
        <div className="flex min-w-0 items-center gap-3">
          <input type="checkbox" aria-label={`Chọn ${row.id}`} checked={selectedFinanceIds.has(row.id)} onChange={() => toggleActiveRow(row.id)} className={`shrink-0 ${checkboxClass}`} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800">{row.inventoryName !== "-" ? row.inventoryName : row.customer}</p>
            <p className="text-[11px] text-slate-400">{row.id} · {formatReadableDate(row.date)} · {formatCurrency(row.amount)} ({row.method})</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TypePill label={row.type} />
          <StatusPill label={row.status} />
          <button type="button" className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer" onClick={() => openEditFinanceForm(row)}>Sửa</button>
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
    () => {
      const customTypes = Array.from(
        new Set(financeRecords.map((record) => record.type).filter((type) => !financeTypes.includes(type))),
      );
      return [...financeTypes, ...customTypes].map((type) => ({
        id: type,
        label: type,
        color: type === "Tất cả" ? "#64748b" : typeColor[type],
        bgColor: "rgba(100,116,139,0.09)",
      }));
    },
    [financeRecords],
  );

  const handleExport = (format: "pdf" | "excel" | "csv", fileName: string) => {
    const headers = columnsFinance.filter((c) => c.visible !== false && c.id !== "actions").map((c) => c.label);
    const values = searchFilteredRows.map((record) =>
      columnsFinance
        .filter((c) => c.visible !== false && c.id !== "actions")
        .map((c) => (c.id === "amount" ? formatCurrency(record.amount) : String(record[c.id] ?? ""))),
    );
    const baseFileName = fileName || `tai-chinh-${new Date().toISOString().slice(0, 10)}`;

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
    printWindow.document.write(`<html><body><h2>Sổ quỹ Tài chính</h2><table border="1"><thead><tr>${tableHead}</tr></thead><tbody>${tableBody}</tbody></table></body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <>
      <div className="grid shrink-0 gap-3 md:grid-cols-4">
        <MetricCard title="Doanh thu thực tế" value={formatCurrency(revenue)} hint="Đã thu từ khách hàng" icon={CircleDollarSign} color="#059669" />
        <MetricCard title="Công nợ chưa thu" value={formatCurrency(receivable)} hint="Chờ thu từ đơn hàng" icon={CircleDollarSign} color="#d97706" />
        <MetricCard title="Chi phí & Hoàn tiền" value={formatCurrency(expense)} hint="Đã thực chi ra" icon={CircleDollarSign} color="#2563eb" />
        <MetricCard title="Tổng giá trị giao dịch" value={formatCurrency(totalAmount)} hint={formatRange(range)} icon={CircleDollarSign} color="#dc2626" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <Toolbar
          leftContent={leftContent}
          query={query}
          onQueryChange={(q) => {
            setQuery(q);
            setPage(1);
          }}
          columns={columnsFinance}
          onColumnsChange={setColumnsFinance as any}
          tableResizeMode={tableResizeMode}
          onTableResizeModeChange={setTableResizeMode}
          selectedCount={selectedFinanceIds.size}
          onOpenAddColumn={() => setOpenAddColumn(true)}
          showHistoryButton={false}
          onExport={handleExport}
          defaultExportFileName={`tai-chinh-${new Date().toISOString().slice(0, 10)}`}
          onCreateClick={openCreateFinanceForm}
          createLabel="Thêm giao dịch"
          defaultColumnIds={financeColumns.map((c) => c.id)}
          searchPlaceholder="Tìm kiếm giao dịch..."
        />

        <FilterBar
          rangeLabel={rangeLabel}
          selectedValue={selectedFinanceType}
          onValueChange={(val: string) => {
            setSelectedFinanceType(val as FinanceType | "Tất cả");
            setPage(1);
          }}
          filterOptions={filterOptions}
          filterLabel="Loại giao dịch"
          allSelected={allVisibleSelected}
          disabled={selectableFinanceIds.length === 0}
          selectedCount={selectedVisibleCount}
          totalCount={selectableFinanceIds.length}
          itemLabel="giao dịch"
          checkboxClass={checkboxClass}
          onToggleAll={toggleActiveVisibleRows}
        />

        {searchFilteredRows.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
            <p className="text-sm text-slate-400">Không tìm thấy giao dịch nào phù hợp.</p>
          </div>
        ) : viewMode === "Bảng kéo" ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-slate-400">
            Kéo thả Kanban không khả dụng với dữ liệu tài chính sổ quỹ.
          </div>
        ) : viewMode === "Danh sách" ? (
          <div className="flex-1 flex flex-col min-h-0">
            <ListView paginatedRows={activePaginatedRows} emptyMessage="Không tìm thấy giao dịch nào." renderRow={renderListRow} />
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
          <TableView<FinanceRecord>
            columns={columnsFinance}
            onColumnsChange={setColumnsFinance as any}
            rows={activePaginatedRows}
            pageSize={pageSize}
            emptyMessage="Không tìm thấy giao dịch nào."
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
            renderCell={renderFinanceCell}
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

      <FinanceDialog
        open={openFinanceForm}
        onOpenChange={setOpenFinanceForm}
        editingId={editingFinanceId}
        form={financeForm}
        onFormChange={setFinanceForm}
        onSave={saveFinanceRecord}
        currentStaffName={currentStaffName}
        currentStaffAvatar={currentStaffAvatar}
        customers={customers}
        columns={columnsFinance}
        inventoryLinked={Boolean(financeRecords.find((record) => record.id === editingFinanceId)?.inventoryItemId)}
        orderLinked={Boolean(financeRecords.find((record) => record.id === editingFinanceId)?.orderDbId)}
      />

      <AddColumnDialog
        open={openAddColumn}
        onOpenChange={setOpenAddColumn}
        newColumnName={newColumnName}
        onNewColumnNameChange={setNewColumnName}
        onAddColumn={addCustomColumn}
      />

      <DeleteConfirmDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen} onConfirm={confirmDelete} isLoading={isDeletingItem}>
        {financeRecords.find((record) => record.id === deleteTargetId)?.inventoryItemId
          ? `Giao dịch ${deleteTargetId} đang liên kết với vật tư. Xóa giao dịch sẽ xóa cả vật tư tương ứng. Hành động này không thể hoàn tác.`
          : `Bạn có chắc chắn muốn xóa giao dịch ${deleteTargetId} này không? Hành động này không thể hoàn tác.`}
      </DeleteConfirmDialog>
    </>
  );
}
