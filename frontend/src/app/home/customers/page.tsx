"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { MetricCard } from "../_components/metric-card";
import { Toolbar } from "../_components/toolbar";
import { FilterBar } from "../_components/filter-bar";
import { TableView } from "../_components/table-view";
import { KanbanView } from "../_components/kanban-view";
import { ListView } from "../_components/list-view";
import { FormDialog, type FormField } from "../_components/form-dialog";
import { AddColumnDialog } from "../_components/add-column-dialog";
import { CalendarDays, Clock, History, Mail, MapPin, Phone, Search, ShieldCheck, Sparkles, Star, UserRound } from "lucide-react";
import { TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DeleteConfirmDialog } from "@/src/components/common/delete-confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PageShell,
  ViewModeTabs,
  type DashboardViewMode,
} from "../_components/dashboard-primitives";
import { DashboardTableFooter, type DashboardTableColumn } from "@/src/components/common/dashboard-data-table";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import { formatRange, normalizeRange } from "@/src/utils/dashboard-time";
import { homeApi, listHomeResource } from "@/src/lib/home-api";
import { API_BASE_URL } from "@/src/lib/config";
import { HomeTableContentSkeleton } from "@/src/components/common/auth-guard";

type CustomerFields = {
  name: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpend: number;
  points: number;
  rank: string;
  note: string;
  email: string;
  birthday: string;
  imageUrl?: string;
  accountId?: string;
  accountUsername?: string;
  accountActive?: boolean;
  createdAt?: string;
};

type Customer = CustomerFields & {
  id: string;
  [key: string]: string | number | boolean | undefined;
};

type ExportFormat = "pdf" | "excel" | "csv";
type CustomerColumn = DashboardTableColumn;
type HomeCustomerRow = {
  customer_id: string;
  customer_code: string;
  full_name: string;
  phone: string;
  email?: string;
  address?: string;
  rank?: string;
  total_orders?: number;
  total_spent?: number;
  loyalty_points?: number;
  note?: string;
  created_at?: string;
  birthday?: string;
  image_url?: string;
  account_id?: string;
  account_username?: string;
  account_active?: boolean;
  extra_fields?: Record<string, string>;
};
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

const rankColor: Record<string, { text: string; bg: string }> = {
  "Kim cương": { text: "#db2777", bg: "rgba(219,39,119,0.08)" },
  "Vàng": { text: "#d97706", bg: "rgba(217,119,6,0.08)" },
  "Bạc": { text: "#475569", bg: "rgba(71,85,105,0.08)" },
  "Thường": { text: "#2563eb", bg: "rgba(37,99,235,0.08)" },
};

const allRankColor = "#0f766e";
const allRankBgColor = "rgba(15,118,110,0.09)";
const rankDotColors = Object.fromEntries(
  Object.entries(rankColor).map(([rank, color]) => [rank, color.text])
);

const initialPageSize = 10;
const defaultColumns: CustomerColumn[] = [
  { id: "id", label: "Mã KH", width: 132, visible: true },
  { id: "name", label: "Tên khách hàng", width: 208, visible: true },
  { id: "email", label: "Email", width: 176, visible: true },
  { id: "phone", label: "Số điện thoại", width: 112, visible: true },
  { id: "address", label: "Địa chỉ", width: 190, visible: true },
  { id: "totalOrders", label: "Tổng đơn", width: 82, visible: true },
  { id: "totalSpend", label: "Chi tiêu", width: 112, visible: true },
  { id: "points", label: "Điểm", width: 76, visible: true },
  { id: "rank", label: "Hạng", width: 92, visible: true },
  { id: "linkedAccount", label: "Liên kết tài khoản", width: 150, visible: true },
  { id: "birthday", label: "Ngày sinh", width: 92, visible: true },
  { id: "createdAt", label: "Ngày tạo tài khoản", width: 128, visible: true },
  { id: "note", label: "Ghi chú", width: 150, visible: true },
  { id: "actions", label: "Thao tác", width: 150, visible: true },
];
const defaultColumnIdSet = new Set(defaultColumns.map((column) => column.id));
const rankOptions = ["Kim cương", "Vàng", "Bạc", "Thường"];

function normalizeCustomerColumns(columns: CustomerColumn[]) {
  const existingIds = new Set(columns.map((column) => column.id));
  const next = [...columns];
  defaultColumns.forEach((column) => {
    if (existingIds.has(column.id)) return;
    if (column.id === "id") {
      next.unshift(column);
      return;
    }
    const noteIndex = next.findIndex((item) => item.id === "note");
    const actionIndex = next.findIndex((item) => item.id === "actions");
    const insertIndex = column.id === "linkedAccount"
      ? Math.max(0, next.findIndex((item) => item.id === "birthday"))
      : noteIndex !== -1 ? noteIndex : actionIndex !== -1 ? actionIndex : next.length;
    next.splice(insertIndex === -1 ? next.length : insertIndex, 0, column);
  });
  return next;
}

function mapHomeCustomer(row: HomeCustomerRow): Customer {
  return {
    ...(row.extra_fields || {}),
    id: row.customer_code || row.customer_id,
    name: row.full_name,
    phone: row.phone,
    address: row.address || "",
    totalOrders: Number(row.total_orders || 0),
    totalSpend: Number(row.total_spent || 0),
    points: Number(row.loyalty_points || 0),
    rank: row.rank || "Thường",
    note: row.note || "",
    email: row.email || "",
    birthday: row.birthday?.slice(0, 10) || "",
    imageUrl: row.image_url || "",
    accountId: row.account_id || "",
    accountUsername: row.account_username || "",
    accountActive: row.account_active,
    createdAt: row.created_at?.slice(0, 10) || "",
    dbId: row.customer_id,
  };
}

const avatarColors = ["#0f766e", "#2563eb", "#7c3aed", "#be123c", "#c2410c", "#047857"];

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  return `${words[0][0]}${words.length > 1 ? words[words.length - 1][0] : ""}`.toUpperCase();
}

function getAvatarColor(name: string) {
  const hash = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

function CustomerAvatar({ customer, size = 28 }: { customer: Customer; size?: number }) {
  return (
    <Avatar className="after:border-slate-200" style={{ width: size, height: size }}>
      {customer.imageUrl ? <AvatarImage src={customer.imageUrl} alt={customer.name} /> : null}
      <AvatarFallback
        className="font-semibold leading-none text-white"
        style={{ backgroundColor: getAvatarColor(customer.name), fontSize: Math.max(10, size * 0.34) }}
      >
        <span className="block translate-y-px leading-none">{getInitials(customer.name)}</span>
      </AvatarFallback>
    </Avatar>
  );
}

const formatBirthday = (dateStr?: string) => {
  if (!dateStr) return "-";
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
};

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  birthday: "",
  address: "",
  note: "",
  rank: "Thường",
  points: "0",
  totalOrders: "0",
  totalSpend: "0",
  createdAt: "",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isLayoutLoaded, setIsLayoutLoaded] = useState(false);
  const accountColumnsConfigRef = useRef<Record<string, unknown>>({});
  const [query, setQuery] = useState("");
  const [selectedRank, setSelectedRank] = useState<string | "Tất cả">("Tất cả");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [columns, setColumns] = useState<CustomerColumn[]>(() => {
    if (typeof window === "undefined") return defaultColumns;
    try {
      const saved = JSON.parse(localStorage.getItem("home_customers_columns") || "");
      return normalizeCustomerColumns(saved || defaultColumns);
    } catch {
      return defaultColumns;
    }
  });
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<DashboardViewMode>("Bảng");
  const [tableResizeMode, setTableResizeMode] = useState<"fit" | "custom">("fit");
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [draggedCustomerId, setDraggedCustomerId] = useState<string | null>(null);
  const [dragOverRank, setDragOverRank] = useState<string | null>(null);
  const [openPageSizeMenu, setOpenPageSizeMenu] = useState(false);
  const [customPageSize, setCustomPageSize] = useState("");
  const [openAddColumn, setOpenAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [isDeletingCustomer, setIsDeletingCustomer] = useState(false);
  const [profileCustomer, setProfileCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState<typeof emptyForm & Record<string, string>>(emptyForm);

  useEffect(() => {
    let alive = true;
    listHomeResource<HomeCustomerRow>("customers", { limit: 500 })
      .then((response) => {
        if (!alive) return;
        const apiCustomers = response.items.map(mapHomeCustomer);
        setCustomers(apiCustomers);
      })
      .catch(() => {
        if (!alive) return;
        setCustomers([]);
      })
      .finally(() => {
        if (alive) setIsDataLoading(false);
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
        if (!response.ok) throw new Error("Failed to load customers layout");
        return response.json();
      })
      .then((data) => {
        if (!data?.columns_config) return;
        const parsed = JSON.parse(data.columns_config) as Record<string, unknown>;
        accountColumnsConfigRef.current = parsed;
        const layout = (parsed.customersLayout || {}) as {
          columns?: CustomerColumn[];
          tableResizeMode?: "fit" | "custom";
          pageSize?: number;
        };
        if (layout.columns) setColumns(normalizeCustomerColumns(layout.columns));
        if (layout.tableResizeMode) setTableResizeMode(layout.tableResizeMode);
        if (layout.pageSize) setPageSize(layout.pageSize);
      })
      .catch((error) => console.error("Error loading customers layout:", error))
      .finally(() => setIsLayoutLoaded(true));
  }, []);

  useEffect(() => {
    localStorage.setItem("home_customers_columns", JSON.stringify(columns));
    if (!isLayoutLoaded) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    const timeoutId = window.setTimeout(() => {
      const nextConfig = {
        ...accountColumnsConfigRef.current,
        customersLayout: { columns, tableResizeMode, pageSize },
      };
      accountColumnsConfigRef.current = nextConfig;
      fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ columns_config: JSON.stringify(nextConfig) }),
      }).catch((error) => console.error("Error saving customers layout:", error));
    }, 250);
    return () => window.clearTimeout(timeoutId);
  }, [columns, isLayoutLoaded, pageSize, tableResizeMode]);

  const customerFormFields = useMemo<FormField[]>(() => {
    const fieldByColumnId: Record<string, FormField> = {
      name: { id: "name", label: "Họ tên", type: "text", placeholder: "Họ và tên", required: true },
      phone: { id: "phone", label: "Số điện thoại", type: "text", placeholder: "090..." },
      email: { id: "email", label: "Email", type: "text", placeholder: "khachhang@example.com" },
      birthday: { id: "birthday", label: "Ngày sinh", type: "date", yearDropdown: true },
      address: { id: "address", label: "Địa chỉ mặc định", type: "text", placeholder: "Số nhà, tên đường, quận/huyện..." },
      rank: { id: "rank", label: "Hạng khách hàng", type: "select", options: rankOptions, placeholder: "Chọn hạng", optionDotColors: rankDotColors },
      points: { id: "points", label: "Điểm tích lũy", type: "number" },
      totalOrders: { id: "totalOrders", label: "Tổng đơn", type: "number" },
      totalSpend: { id: "totalSpend", label: "Chi tiêu", type: "number" },
      createdAt: { id: "createdAt", label: "Ngày tạo tài khoản", type: "date" },
      note: { id: "note", label: "Ghi chú đặc biệt", type: "textarea", placeholder: "Dị ứng hóa chất, giờ giao hàng yêu thích..." },
    };

    const sortedColumns = columns.filter(
      (column) => column.id !== "id" && column.id !== "actions" && column.id !== "linkedAccount",
    );
    const noteIndex = sortedColumns.findIndex((column) => column.id === "note");
    if (noteIndex !== -1) {
      const [noteColumn] = sortedColumns.splice(noteIndex, 1);
      sortedColumns.push(noteColumn);
    }

    return sortedColumns
      .map((column) => {
        return fieldByColumnId[column.id] || {
          id: column.id,
          label: column.label,
          type: "text",
          placeholder: `Nhập ${column.label.toLowerCase()}`,
        } satisfies FormField;
      });
  }, [columns]);

  const range = useDashboardTimeRangeStore((state) => state.range);
  const rangeLabel = formatRange(normalizeRange(range));
  const checkboxClass =
    "relative size-4 appearance-none rounded-[5px] border border-slate-300 bg-white transition-all duration-150 checked:border-emerald-300 checked:bg-emerald-300 after:absolute after:left-1/2 after:top-1/2 after:hidden after:h-[9px] after:w-[5px] after:-translate-x-1/2 after:-translate-y-[58%] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:content-[''] checked:after:block";

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const source = `${c.name} ${c.phone} ${c.address} ${c.email} ${c.accountUsername || ""}`;
      const matchQuery = source.toLowerCase().includes(query.toLowerCase());
      const matchRank = selectedRank === "Tất cả" || c.rank === selectedRank;
      return matchQuery && matchRank;
    });
  }, [customers, query, selectedRank]);

  const pageCount = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const paginatedCustomers = filteredCustomers.slice((page - 1) * pageSize, page * pageSize);
  const totalSpend = filteredCustomers.reduce((sum, customer) => sum + customer.totalSpend, 0);
  const vipCustomers = filteredCustomers.filter((customer) => ["Vàng", "Kim cương"].includes(customer.rank)).length;
  const averageSpend =
    filteredCustomers.length > 0 ? Math.round(totalSpend / filteredCustomers.length) : 0;
  const visibleColumns = columns.filter((column) => column.visible);
  const exportColumns = visibleColumns.filter((column) => column.id !== "actions");
  const customColumns = columns.filter((column) => !defaultColumnIdSet.has(column.id));
  const totalVisibleWidth = visibleColumns.reduce((sum, column) => sum + (column.width || 150), 0);
  const visibleCustomerIds = useMemo(
    () => paginatedCustomers.map((customer) => customer.id),
    [paginatedCustomers],
  );
  const kanbanCustomerIds = useMemo(
    () => filteredCustomers.map((customer) => customer.id),
    [filteredCustomers],
  );
  const selectedCustomers = useMemo(
    () => customers.filter((customer) => selectedCustomerIds.has(customer.id)),
    [customers, selectedCustomerIds],
  );
  const allVisibleSelected =
    visibleCustomerIds.length > 0 && visibleCustomerIds.every((id) => selectedCustomerIds.has(id));
  const allKanbanCustomersSelected =
    kanbanCustomerIds.length > 0 && kanbanCustomerIds.every((id) => selectedCustomerIds.has(id));
  const selectedVisibleCustomerCount = visibleCustomerIds.filter((id) => selectedCustomerIds.has(id)).length;
  const selectedKanbanCustomerCount = kanbanCustomerIds.filter((id) => selectedCustomerIds.has(id)).length;

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const toggleVisibleCustomers = () => {
    setSelectedCustomerIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleCustomerIds.forEach((id) => next.delete(id));
      } else {
        visibleCustomerIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleKanbanCustomers = () => {
    setSelectedCustomerIds((prev) => {
      const next = new Set(prev);
      if (allKanbanCustomersSelected) {
        kanbanCustomerIds.forEach((id) => next.delete(id));
      } else {
        kanbanCustomerIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleCustomer = (id: string) => {
    setSelectedCustomerIds((prev) => {
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
    const fileScope = selectedCustomerIds.size > 0 ? "da-chon" : "tat-ca";
    const fileDate = new Date().toISOString().slice(0, 10);
    return `khach-hang-${fileScope}-${fileDate}`;
  };

  const getExportValue = (customer: Customer, columnId: CustomerColumn["id"]) => {
    if (columnId === "actions") return "";
    const value = customer[columnId];
    if (columnId === "birthday") return formatBirthday(customer.birthday);
    if (columnId === "totalSpend") return `${customer.totalSpend.toLocaleString("vi-VN")}đ`;
    if (columnId === "totalOrders") return `${customer.totalOrders} đơn`;
    if (columnId === "points") return customer.points.toLocaleString("vi-VN");
    if (columnId === "linkedAccount") return customer.accountUsername || "Chưa liên kết";
    return value === undefined || value === null || value === "" ? "-" : String(value);
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
          types: [{ description, accept: { [type.split(";")[0]]: [extension] } }],
        });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
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

  const handleExport = async (format: ExportFormat, fileName: string) => {
    const rows = selectedCustomerIds.size > 0 ? selectedCustomers : customers;
    if (rows.length === 0) return;

    const baseFileName = sanitizeFileName(fileName) || getDefaultExportFileName();
    const exportedAt = new Date().toLocaleString("vi-VN");
    const exportTotalSpend = rows.reduce((sum, customer) => sum + customer.totalSpend, 0);

    if (format === "csv") {
      const csvRows = [
        ["Thời gian lọc", rangeLabel],
        ["Thời điểm xuất file", exportedAt],
        ["Số khách", String(rows.length)],
        ["Tổng chi tiêu", `${exportTotalSpend.toLocaleString("vi-VN")}đ`],
        [],
        exportColumns.map((column) => column.label),
        ...rows.map((customer) => exportColumns.map((column) => getExportValue(customer, column.id))),
      ];
      const csv = csvRows
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");
      await downloadBlob(`\uFEFF${csv}`, `${baseFileName}.csv`, "text/csv;charset=utf-8", ".csv", "CSV");
      return;
    }

    const tableHead = exportColumns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("");
    const tableBody = rows
      .map((customer) =>
        `<tr>${exportColumns
          .map((column) => `<td>${escapeHtml(getExportValue(customer, column.id))}</td>`)
          .join("")}</tr>`,
      )
      .join("");
    const exportSummary = `
      <div class="summary">
        <p><span>Thời gian:</span> ${escapeHtml(rangeLabel)}</p>
        <p><span>Thời điểm xuất file:</span> ${escapeHtml(exportedAt)}</p>
        <p><span>Số khách:</span> ${rows.length}</p>
        <p><span>Tổng chi tiêu:</span> ${escapeHtml(`${exportTotalSpend.toLocaleString("vi-VN")}đ`)}</p>
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
            <h1>Danh sách khách hàng</h1>
            ${exportSummary}
            <table><thead><tr>${tableHead}</tr></thead><tbody>${tableBody}</tbody></table>
          </body>
        </html>
      `;
      await downloadBlob(workbook, `${baseFileName}.xls`, "application/vnd.ms-excel;charset=utf-8", ".xls", "Excel");
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
          <h1>Danh sách khách hàng</h1>
          <p>${rows.length} khách · ${selectedCustomerIds.size > 0 ? "Khách đã chọn" : "Tất cả khách hàng"}</p>
          ${exportSummary}
          <table><thead><tr>${tableHead}</tr></thead><tbody>${tableBody}</tbody></table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const getCustomFields = (source: Record<string, unknown> = {}): Record<string, string> =>
    Object.fromEntries(customColumns.map((column) => [column.id, String(source[column.id] ?? "")]));

  const addCustomColumn = () => {
    const label = newColumnName.trim();
    if (!label) return;

    const newColumn: CustomerColumn = {
      id: `custom_${Date.now()}`,
      label,
      width: 150,
      visible: true,
    };

    setColumns((prev) => {
      const next = [...prev];
      const noteIndex = next.findIndex((column) => column.id === "note");
      const actionIndex = next.findIndex((column) => column.id === "actions");
      const insertIndex = noteIndex !== -1 ? noteIndex : actionIndex !== -1 ? actionIndex : next.length;
      next.splice(insertIndex, 0, newColumn);
      return next;
    });
    setForm((prev) => ({ ...prev, [newColumn.id]: "" }));
    setNewColumnName("");
    setOpenAddColumn(false);
  };

  const handleDragStart = (event: React.DragEvent<HTMLTableCellElement>, id: string) => {
    setDraggedColumnId(id);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (event: React.DragEvent<HTMLTableCellElement>, id: string) => {
    event.preventDefault();
    if (id !== draggedColumnId) setDragOverColumnId(id);
  };

  const handleDrop = (event: React.DragEvent<HTMLTableCellElement>, id: string) => {
    event.preventDefault();
    if (!draggedColumnId || draggedColumnId === id) {
      setDragOverColumnId(null);
      return;
    }

    setColumns((prev) => {
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

  const openCreateForm = () => {
    setEditingCustomerId(null);
    setForm({ ...emptyForm, ...getCustomFields(), createdAt: new Date().toISOString().slice(0, 10) });
    setOpenForm(true);
  };

  const openEditForm = (c: Customer, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingCustomerId(c.id);
    setForm({
      name: c.name,
      phone: c.phone,
      email: c.email,
      birthday: c.birthday,
      address: c.address,
      note: c.note,
      rank: c.rank,
      points: String(c.points),
      totalOrders: String(c.totalOrders),
      totalSpend: String(c.totalSpend),
      createdAt: c.createdAt || new Date().toISOString().slice(0, 10),
      ...getCustomFields(c),
    });
    setOpenForm(true);
  };

  const requestDeleteCustomer = (customer: Customer, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeleteTarget(customer);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteCustomer = async () => {
    if (!deleteTarget) return;
    setIsDeletingCustomer(true);
    try {
      await homeApi(`/customers/${String(deleteTarget.dbId || deleteTarget.id)}`, { method: "DELETE" });
      setCustomers((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setSelectedCustomerIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
      setPage(1);
      toast.success("Đã xóa khách hàng.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xóa khách hàng.");
    } finally {
      setIsDeletingCustomer(false);
    }
  };

  const saveCustomer = async () => {
    if (!form.name.trim()) {
      toast.error("Vui lòng nhập đầy đủ các trường bắt buộc.");
      return;
    }

    const apiPayload = {
      full_name: form.name.trim(),
      phone: form.phone.trim() || null,
      email: form.email || null,
      birthday: form.birthday || null,
      address: form.address,
      note: form.note || null,
      rank: form.rank,
      loyalty_points: Number(form.points) || 0,
      total_orders: Number(form.totalOrders) || 0,
      total_spent: Number(form.totalSpend) || 0,
      extra_fields: getCustomFields(form),
    };

    try {
      const editingCustomer = customers.find((customer) => customer.id === editingCustomerId);
      const savedRow = editingCustomer
        ? await homeApi<HomeCustomerRow>(`/customers/${String(editingCustomer.dbId || editingCustomer.id)}`, {
            method: "PUT",
            body: JSON.stringify(apiPayload),
          })
        : await homeApi<HomeCustomerRow>("/customers", {
            method: "POST",
            body: JSON.stringify(apiPayload),
          });
      const savedCustomer = mapHomeCustomer(savedRow);
      setCustomers((prev) =>
        editingCustomer
          ? prev.map((customer) => customer.id === editingCustomer.id ? savedCustomer : customer)
          : [savedCustomer, ...prev],
      );
      setPage(1);
      setOpenForm(false);
      toast.success(editingCustomer ? "Đã cập nhật khách hàng." : "Đã thêm khách hàng.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu khách hàng.");
    }
  };

  const updateCustomerRank = async (customerId: string, rank: string) => {
    const customer = customers.find((item) => item.id === customerId);
    if (!customer || customer.rank === rank) return;
    try {
      const savedRow = await homeApi<HomeCustomerRow>(
        `/customers/${String(customer.dbId || customer.id)}`,
        { method: "PUT", body: JSON.stringify({ rank }) },
      );
      const savedCustomer = mapHomeCustomer(savedRow);
      setCustomers((prev) => prev.map((item) => item.id === customerId ? savedCustomer : item));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật hạng khách hàng.");
    }
  };

  const renderCustomerCell = (customer: Customer, column: CustomerColumn) => {
    if (column.id === "id") {
      return (
        <TableCell key={column.id} className="pl-4 font-medium text-slate-700">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              aria-label={`Chọn ${customer.name}`}
              checked={selectedCustomerIds.has(customer.id)}
              onChange={() => toggleCustomer(customer.id)}
              onClick={(event) => event.stopPropagation()}
              className={`shrink-0 ${checkboxClass}`}
            />
            <span className="truncate">{customer.id}</span>
          </div>
        </TableCell>
      );
    }
    if (column.id === "name") {
      return (
        <TableCell key={column.id} className="pl-4">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setProfileCustomer(customer);
              }}
              className="flex min-w-0 items-center gap-2 text-left cursor-pointer"
              title="Xem hồ sơ khách hàng"
            >
              <CustomerAvatar customer={customer} size={24} />
              <span className="truncate font-medium text-slate-900 transition-colors hover:text-emerald-700">
                {customer.name}
              </span>
            </button>
          </div>
        </TableCell>
      );
    }

    if (column.id === "email") {
      return (
        <TableCell key={column.id} className="max-w-0 truncate overflow-hidden text-slate-500" title={customer.email || "-"}>
          {customer.email || "-"}
        </TableCell>
      );
    }

    if (column.id === "phone") {
      return (
        <TableCell key={column.id} className="max-w-0 truncate overflow-hidden" title={customer.phone}>
          <a href={`tel:${customer.phone}`} className="text-slate-500 transition-colors hover:text-slate-800" onClick={(event) => event.stopPropagation()}>
            {customer.phone}
          </a>
        </TableCell>
      );
    }

    if (column.id === "address") {
      return (
        <TableCell key={column.id} className="max-w-0 truncate overflow-hidden text-slate-600" title={customer.address || "-"}>
          {customer.address || "-"}
        </TableCell>
      );
    }

    if (column.id === "totalOrders") {
      return <TableCell key={column.id} className="font-medium text-slate-600">{customer.totalOrders} đơn</TableCell>;
    }

    if (column.id === "totalSpend") {
      return <TableCell key={column.id} className="font-medium text-slate-900">{customer.totalSpend.toLocaleString("vi-VN")}đ</TableCell>;
    }

    if (column.id === "points") {
      return <TableCell key={column.id} className="font-medium text-slate-500">{customer.points.toLocaleString("vi-VN")}</TableCell>;
    }

    if (column.id === "rank") {
      return (
        <TableCell key={column.id}>
          <span
            className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium"
            style={{
              color: rankColor[customer.rank]?.text || "#475569",
              backgroundColor: rankColor[customer.rank]?.bg || "rgba(71,85,105,0.08)",
            }}
          >
            <span
              className="inline-block size-2 shrink-0 rounded-full"
              style={{ backgroundColor: rankColor[customer.rank]?.text || "#475569" }}
            />
            <span className="truncate">{customer.rank}</span>
          </span>
        </TableCell>
      );
    }

    if (column.id === "linkedAccount") {
      const linked = Boolean(customer.accountId);
      return (
        <TableCell key={column.id}>
          <span
            className={`inline-flex max-w-full items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-xs font-medium ${
              linked
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-50 text-slate-500"
            }`}
            title={linked ? `Tài khoản: ${customer.accountUsername || customer.accountId}` : "Khách hàng chưa có tài khoản đăng nhập"}
          >
            <span className={`size-1.5 shrink-0 rounded-full ${linked ? "bg-emerald-500" : "bg-slate-400"}`} />
            <span className="truncate">{linked ? customer.accountUsername || "Đã liên kết" : "Chưa liên kết"}</span>
          </span>
        </TableCell>
      );
    }

    if (column.id === "birthday") {
      return <TableCell key={column.id} className="text-slate-500">{formatBirthday(customer.birthday)}</TableCell>;
    }

    if (column.id === "createdAt") {
      return <TableCell key={column.id} className="text-slate-500">{formatBirthday(customer.createdAt)}</TableCell>;
    }

    if (column.id === "note") {
      return (
        <TableCell key={column.id} className="max-w-0 truncate overflow-hidden text-slate-500" title={customer.note || "-"}>
          {customer.note || "-"}
        </TableCell>
      );
    }

    if (column.id === "actions") {
      return (
      <TableCell key={column.id} className="px-4" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-start gap-1.5">
          <button
            type="button"
            className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50"
            onClick={(event) => openEditForm(customer, event)}
            title="Chỉnh sửa"
          >
            Sửa
          </button>
          <button
            type="button"
            className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-600"
            onClick={(event) => requestDeleteCustomer(customer, event)}
            title="Xóa"
          >
            Xóa
          </button>
        </div>
      </TableCell>
      );
    }

    const customValue = customer[column.id];
    const hasCustomValue = customValue !== undefined && customValue !== null && customValue !== "";
    const displayValue = hasCustomValue ? String(customValue) : "-";

    return (
      <TableCell
        key={column.id}
        className={`max-w-0 truncate overflow-hidden ${hasCustomValue ? "text-slate-600" : "text-slate-400 italic"}`}
        title={displayValue}
      >
        {displayValue}
      </TableCell>
    );
  };

  const customerFilterOptions = useMemo(() => {
    return (["Tất cả", ...rankOptions] as const).map((rank) => {
      const isAll = rank === "Tất cả";
      return {
        id: rank,
        label: rank,
        color: isAll ? allRankColor : rankColor[rank].text,
        bgColor: isAll ? allRankBgColor : rankColor[rank].bg,
      };
    });
  }, []);

  const customerKanbanColumns = useMemo(() => {
    return rankOptions.map((rank) => ({
      id: rank,
      label: rank,
      color: { text: rankColor[rank].text, bg: rankColor[rank].bg },
    }));
  }, []);

  const renderCustomerKanbanCard = (customer: Customer) => {
    return (
      <div
        key={customer.id}
        draggable
        onDragStart={(event) => {
          setDraggedCustomerId(customer.id);
          event.dataTransfer.effectAllowed = "move";
        }}
        onDragEnd={() => {
          setDraggedCustomerId(null);
          setDragOverRank(null);
        }}
        className={`cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-slate-300 hover:shadow-md active:cursor-grabbing ${draggedCustomerId === customer.id ? "opacity-50 ring-2 ring-slate-400" : ""}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <input
              type="checkbox"
              aria-label={`Chọn ${customer.name}`}
              checked={selectedCustomerIds.has(customer.id)}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              onChange={() => toggleCustomer(customer.id)}
              className={`shrink-0 ${checkboxClass}`}
            />
            <button
              type="button"
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                setProfileCustomer(customer);
              }}
              className="flex min-w-0 items-center gap-2 text-left cursor-pointer"
            >
              <CustomerAvatar customer={customer} size={32} />
              <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-700 hover:text-emerald-700">{customer.name}</p>
              <p className="truncate text-[11px] text-slate-400">{customer.phone}</p>
              </div>
            </button>
          </div>
          <span className="shrink-0 text-[11px] font-semibold text-slate-400">{customer.id}</span>
        </div>
        <p className="mt-2 truncate text-xs text-slate-500">{customer.email || "-"}</p>
        <p className="mt-1 truncate text-xs text-slate-500">{customer.totalOrders} đơn · {customer.points.toLocaleString("vi-VN")} điểm</p>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
          <span className="truncate text-[11px] text-slate-500">{formatBirthday(customer.birthday)}</span>
          <span className="text-[13px] font-bold text-slate-900">{customer.totalSpend.toLocaleString("vi-VN")}đ</span>
        </div>
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => setProfileCustomer(customer)}
            className="inline-flex h-6 items-center rounded-md bg-slate-100 px-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
          >
            Chi tiết
          </button>
        </div>
      </div>
    );
  };

  const renderCustomerListRow = (customer: Customer) => {
    return (
      <div key={customer.id} className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <input
              type="checkbox"
              aria-label={`Chọn ${customer.name}`}
              checked={selectedCustomerIds.has(customer.id)}
              onChange={() => toggleCustomer(customer.id)}
              className={`mt-1 shrink-0 ${checkboxClass}`}
            />
            <CustomerAvatar customer={customer} size={40} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setProfileCustomer(customer)}
                  className="font-semibold text-slate-950 transition-colors hover:text-emerald-700 cursor-pointer"
                >
                  {customer.name}
                </button>
                <span className="text-xs font-medium text-slate-400">{customer.id}</span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium"
                  style={{
                    color: rankColor[customer.rank]?.text || "#475569",
                    backgroundColor: rankColor[customer.rank]?.bg || "rgba(71,85,105,0.08)",
                  }}
                >
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: rankColor[customer.rank]?.text || "#475569" }} />
                  {customer.rank}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-xs font-medium ${
                    customer.accountId
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-50 text-slate-500"
                  }`}
                >
                  <span className={`size-1.5 rounded-full ${customer.accountId ? "bg-emerald-500" : "bg-slate-400"}`} />
                  {customer.accountId ? customer.accountUsername || "Đã liên kết" : "Chưa liên kết"}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>{customer.phone}</span>
                <span>{customer.email || "-"}</span>
                <span>{customer.totalOrders} đơn · {customer.points.toLocaleString("vi-VN")} điểm</span>
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-slate-400">{customer.address || "-"}</p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              {customer.totalSpend.toLocaleString("vi-VN")}đ
            </span>
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-slate-50"
              onClick={() => openEditForm(customer)}
            >
              Sửa
            </button>
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-slate-50"
              onClick={(event) => requestDeleteCustomer(customer, event)}
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isDataLoading) {
    return <HomeTableContentSkeleton />;
  }

  return (
    <PageShell fullHeight>
      <div className="grid shrink-0 gap-3 md:grid-cols-4">
        <MetricCard title="Khách trong bộ lọc" value={String(filteredCustomers.length)} hint={`${selectedRank} · ${rangeLabel}`} icon={Star} color="#2563eb" />
        <MetricCard title="Khách VIP" value={String(vipCustomers)} hint="Vàng và Kim cương" icon={History} color="#d97706" />
        <MetricCard title="Tổng chi tiêu" value={`${totalSpend.toLocaleString("vi-VN")}đ`} hint="Theo khách đang hiển thị" icon={Clock} color="#10b981" />
        <MetricCard title="Chi tiêu TB" value={`${averageSpend.toLocaleString("vi-VN")}đ`} hint="Trung bình mỗi khách" icon={Search} color="#8b5cf6" />
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
            selectedCount={selectedCustomerIds.size}
            onOpenAddColumn={() => setOpenAddColumn(true)}
            onExport={handleExport}
            defaultExportFileName={getDefaultExportFileName()}
            onCreateClick={openCreateForm}
            createLabel="Thêm khách"
            defaultColumnIds={defaultColumns.map((c) => c.id)}
            searchPlaceholder="Tìm tên, SĐT, địa chỉ..."
            showHistoryButton={false}
          />
          <FilterBar
            rangeLabel={rangeLabel}
            selectedValue={selectedRank}
            onValueChange={(rank) => { setSelectedRank(rank); setPage(1); }}
            filterOptions={customerFilterOptions}
            filterLabel="Hạng khách hàng"
            allSelected={viewMode === "Bảng kéo" ? allKanbanCustomersSelected : allVisibleSelected}
            disabled={viewMode === "Bảng kéo" ? kanbanCustomerIds.length === 0 : visibleCustomerIds.length === 0}
            selectedCount={viewMode === "Bảng kéo" ? selectedKanbanCustomerCount : selectedVisibleCustomerCount}
            totalCount={viewMode === "Bảng kéo" ? kanbanCustomerIds.length : visibleCustomerIds.length}
            itemLabel="khách"
            checkboxClass={checkboxClass}
            onToggleAll={viewMode === "Bảng kéo" ? toggleKanbanCustomers : toggleVisibleCustomers}
          />

          {filteredCustomers.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-8 text-center">
              <p className="text-sm text-slate-400">Không tìm thấy khách hàng nào phù hợp.</p>
            </div>
          ) : viewMode === "Bảng" ? (
            <TableView
              columns={columns}
              rows={paginatedCustomers}
              pageSize={pageSize}
              emptyMessage="Không tìm thấy khách hàng phù hợp."
              tableResizeMode={tableResizeMode}
              totalVisibleWidth={totalVisibleWidth}
              renderCell={renderCustomerCell}
              columnDrag={{
                draggedColumnId,
                dragOverColumnId,
                onDragStart: handleDragStart,
                onDragOver: handleDragOver,
                onDragLeave: () => setDragOverColumnId(null),
                onDrop: handleDrop,
                onDragEnd: handleDragEnd,
              }}
              page={page}
              pageCount={pageCount}
              totalRows={filteredCustomers.length}
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
              columns={customerKanbanColumns}
              rows={filteredCustomers}
              groupByKey="rank"
              draggedItemId={draggedCustomerId}
              onDraggedItemIdChange={setDraggedCustomerId}
              dragOverColumnId={dragOverRank}
              onDragOverColumnIdChange={setDragOverRank}
              onDropItem={updateCustomerRank}
              renderCard={renderCustomerKanbanCard}
              tableResizeMode={tableResizeMode}
            />
          ) : (
            <div className="flex min-h-0 flex-1 flex-col">
              <ListView
                paginatedRows={paginatedCustomers}
                emptyMessage="Không tìm thấy khách hàng phù hợp."
                renderRow={renderCustomerListRow}
              />
              <DashboardTableFooter
                page={page}
                pageCount={pageCount}
                pageSize={pageSize}
                totalRows={filteredCustomers.length}
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
                  <CustomerAvatar customer={profileCustomer} size={40} />
                  <div className="min-w-0">
                    <DialogTitle className="truncate text-base font-semibold leading-6 text-slate-950">
                      {profileCustomer.name}
                    </DialogTitle>
                    <p className="text-sm text-slate-500">Khách hàng · {profileCustomer.id}</p>
                    <p className="mt-1 text-xs text-slate-400">{profileCustomer.rank}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="min-h-0 flex-1 p-5">
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    [UserRound, "Họ tên", profileCustomer.name],
                    [ShieldCheck, "Tên đăng nhập", profileCustomer.accountUsername || "Chưa liên kết"],
                    [Mail, "Email", profileCustomer.email || "-"],
                    [Phone, "Số điện thoại", profileCustomer.phone || "-"],
                    [CalendarDays, "Ngày sinh", formatBirthday(profileCustomer.birthday)],
                    [Sparkles, "Điểm / hạng", `${profileCustomer.points.toLocaleString("vi-VN")} điểm · ${profileCustomer.rank}`],
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
                      profileCustomer.accountId ? "Đã liên kết" : "Chưa liên kết",
                      `${profileCustomer.totalOrders.toLocaleString("vi-VN")} đơn hàng`,
                      `${profileCustomer.totalSpend.toLocaleString("vi-VN")}đ chi tiêu`,
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
                <button
                  type="button"
                  className="inline-flex h-8 items-center justify-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white shadow-none hover:bg-slate-800 cursor-pointer"
                  onClick={() => {
                    const customer = profileCustomer;
                    setProfileCustomer(null);
                    openEditForm(customer);
                  }}
                >
                  Chỉnh sửa
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <FormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        title={editingCustomerId ? "Chỉnh sửa thông tin khách hàng" : "Thêm khách hàng mới"}
        fields={customerFormFields}
        form={form}
        onFormChange={(newForm) => setForm({ ...emptyForm, ...newForm })}
        onSave={saveCustomer}
        gridClassName="grid gap-4 md:grid-cols-2"
        showCloseButton={false}
        showCloseButtonAtBottom
      />

      <AddColumnDialog
        open={openAddColumn}
        onOpenChange={setOpenAddColumn}
        newColumnName={newColumnName}
        onNewColumnNameChange={setNewColumnName}
        onAddColumn={addCustomColumn}
      />

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open);
          if (!open && !isDeletingCustomer) setDeleteTarget(null);
        }}
        onConfirm={confirmDeleteCustomer}
        isLoading={isDeletingCustomer}
      >
        Bạn có chắc chắn muốn xóa khách hàng {deleteTarget ? `"${deleteTarget.name}"` : "này"} không?
        Hành động này không thể hoàn tác.
      </DeleteConfirmDialog>

    </PageShell>
  );
}
