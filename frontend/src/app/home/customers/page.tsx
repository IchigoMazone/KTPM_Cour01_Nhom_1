"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { MetricCard } from "../_components/metric-card";
import { Toolbar } from "../_components/toolbar";
import { FilterBar } from "../_components/filter-bar";
import { TableView } from "../_components/table-view";
import { KanbanView } from "../_components/kanban-view";
import { ListView } from "../_components/list-view";
import { FormDialog, type FormField } from "../_components/form-dialog";
import { AddColumnDialog } from "../_components/add-column-dialog";
import {
  Search,
  Star,
  Plus,
  ChevronDown,
  Clock,
  Download,
  EyeOff,
  FileDown,
  FileSpreadsheet,
  FileText,
  FileType,
  History,
  Settings,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableCell } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  DashboardDataTable,
  DashboardSelectionBar,
  DashboardTableFooter,
  type DashboardTableColumn,
} from "@/src/components/common/dashboard-data-table";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import { formatRange, normalizeRange } from "@/src/utils/dashboard-time";

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
  createdAt?: string;
};

type Customer = CustomerFields & {
  id: string;
  [key: string]: string | number | undefined;
};

type ExportFormat = "pdf" | "excel" | "csv";
type CustomerColumn = DashboardTableColumn;
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

const seedCustomers: Customer[] = [
  { id: "KH-101", name: "Nguyễn Thị Hương", phone: "0903123456", address: "12 Trần Phú, Q.1, TP.HCM", totalOrders: 28, totalSpend: 6800000, points: 2400, rank: "Vàng", note: "Dị ứng hóa chất mạnh", email: "huong.nguyen@example.com", birthday: "1995-08-12", createdAt: "2026-05-29" },
  { id: "KH-102", name: "Trần Văn Minh", phone: "0912456789", address: "90 Lý Thường Kiệt, Q.5, TP.HCM", totalOrders: 17, totalSpend: 4200000, points: 1200, rank: "Bạc", note: "Giao sau 18h", email: "minh.tran@example.com", birthday: "1990-11-20", createdAt: "2026-05-22" },
  { id: "KH-103", name: "Phạm Thị Lan", phone: "0938123456", address: "18 Nguyễn Du, Q.3, TP.HCM", totalOrders: 12, totalSpend: 2900000, points: 860, rank: "Thường", note: "Không dùng nước xả", email: "lan.pham@example.com", birthday: "1998-03-05", createdAt: "2026-05-15" },
  { id: "KH-104", name: "Công ty ABC", phone: "0283812345", address: "55 Pasteur, Q.1, TP.HCM", totalOrders: 45, totalSpend: 18600000, points: 4800, rank: "Kim cương", note: "Xuất hóa đơn cuối tháng", email: "contact@abc.com", birthday: "2010-05-15", createdAt: "2026-05-10" },
  { id: "KH-105", name: "Lê Văn Nam", phone: "0967111222", address: "45 Lê Lợi, Q.1, TP.HCM", totalOrders: 5, totalSpend: 1200000, points: 300, rank: "Thường", note: "Gọi trước khi giao 30p", email: "nam.le@example.com", birthday: "1993-04-22", createdAt: "2026-05-29" },
  { id: "KH-106", name: "Hoàng Thị Mai", phone: "0988333444", address: "112 Cách Mạng Tháng 8, Q.3, TP.HCM", totalOrders: 20, totalSpend: 5400000, points: 1800, rank: "Vàng", note: "Giặt sấy nước ấm", email: "mai.hoang@example.com", birthday: "1987-12-01", createdAt: "2026-05-28" },
  { id: "KH-107", name: "Đỗ Minh Khang", phone: "0909555666", address: "33 Nguyễn Thị Minh Khai, Q.1, TP.HCM", totalOrders: 8, totalSpend: 2100000, points: 600, rank: "Bạc", note: "Không lấy móc nhựa", email: "khang.do@example.com", birthday: "1996-09-18", createdAt: "2026-05-28" },
  { id: "KH-108", name: "Phan Thanh Sơn", phone: "0918777888", address: "88 Điện Biên Phủ, Bình Thạnh, TP.HCM", totalOrders: 32, totalSpend: 9200000, points: 3100, rank: "Vàng", note: "Khách VIP, giặt hấp vest", email: "son.phan@example.com", birthday: "1982-07-14", createdAt: "2026-05-27" },
  { id: "KH-109", name: "Vũ Thị Hồng", phone: "0934999000", address: "202 Võ Văn Tần, Q.3, TP.HCM", totalOrders: 14, totalSpend: 3100000, points: 950, rank: "Bạc", note: "Đồ em bé giặt riêng", email: "hong.vu@example.com", birthday: "1991-02-28", createdAt: "2026-05-26" },
  { id: "KH-110", name: "Bùi Anh Tuấn", phone: "0977222333", address: "15 Trần Hưng Đạo, Q.5, TP.HCM", totalOrders: 6, totalSpend: 1550000, points: 450, rank: "Thường", note: "Chỉ nhận hàng buổi sáng", email: "tuan.bui@example.com", birthday: "1994-06-10", createdAt: "2026-05-25" },
  { id: "KH-111", name: "Lâm Mỹ Dung", phone: "0902888999", address: "64 Đồng Khởi, Q.1, TP.HCM", totalOrders: 50, totalSpend: 22000000, points: 5500, rank: "Kim cương", note: "Đơn giặt là cao cấp", email: "dung.lam@example.com", birthday: "1989-10-05", createdAt: "2026-05-24" },
  { id: "KH-112", name: "Ngô Quốc Bảo", phone: "0915666777", address: "123 Lê Hồng Phong, Q.10, TP.HCM", totalOrders: 11, totalSpend: 2450000, points: 700, rank: "Bạc", note: "Không dùng hóa chất tẩy mạnh", email: "bao.ngo@example.com", birthday: "1992-05-15", createdAt: "2026-05-20" }
];

const rankColor: Record<string, { text: string; bg: string }> = {
  "Kim cương": { text: "#db2777", bg: "rgba(219,39,119,0.08)" },
  "Vàng": { text: "#d97706", bg: "rgba(217,119,6,0.08)" },
  "Bạc": { text: "#475569", bg: "rgba(71,85,105,0.08)" },
  "Thường": { text: "#2563eb", bg: "rgba(37,99,235,0.08)" },
};

const allRankColor = "#0f766e";
const allRankBgColor = "rgba(15,118,110,0.09)";

const initialPageSize = 10;
const defaultColumns: CustomerColumn[] = [
  { id: "name", label: "Tên khách hàng", width: 208, visible: true },
  { id: "email", label: "Email", width: 176, visible: true },
  { id: "phone", label: "Số điện thoại", width: 112, visible: true },
  { id: "address", label: "Địa chỉ", width: 190, visible: true },
  { id: "totalOrders", label: "Tổng đơn", width: 82, visible: true },
  { id: "totalSpend", label: "Chi tiêu", width: 112, visible: true },
  { id: "points", label: "Điểm", width: 76, visible: true },
  { id: "rank", label: "Hạng", width: 92, visible: true },
  { id: "birthday", label: "Ngày sinh", width: 92, visible: true },
  { id: "createdAt", label: "Ngày tạo tài khoản", width: 128, visible: true },
  { id: "note", label: "Ghi chú", width: 150, visible: true },
  { id: "actions", label: "Thao tác", width: 150, visible: true },
];
const defaultColumnIdSet = new Set(defaultColumns.map((column) => column.id));
const rankOptions = ["Kim cương", "Vàng", "Bạc", "Thường"];

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
  const [customers, setCustomers] = useState<Customer[]>(seedCustomers);
  const [query, setQuery] = useState("");
  const [selectedRank, setSelectedRank] = useState<string | "Tất cả">("Tất cả");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(seedCustomers[0]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [columns, setColumns] = useState<CustomerColumn[]>(defaultColumns);
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
  const [form, setForm] = useState<typeof emptyForm & Record<string, string>>(emptyForm);

  const customerFormFields = useMemo<FormField[]>(() => {
    return [
      { id: "name", label: "Họ tên", type: "text", placeholder: "Họ và tên" },
      { id: "phone", label: "Số điện thoại", type: "text", placeholder: "090..." },
      { id: "email", label: "Email", type: "text", placeholder: "khachhang@example.com" },
      { id: "birthday", label: "Ngày sinh", type: "date" },
      { id: "address", label: "Địa chỉ mặc định", type: "text", placeholder: "Số nhà, tên đường, quận/huyện...", className: "md:col-span-2" },
      { id: "rank", label: "Hạng khách hàng", type: "select", options: rankOptions, placeholder: "Chọn hạng" },
      { id: "points", label: "Điểm tích lũy", type: "number" },
      { id: "createdAt", label: "Ngày tạo tài khoản", type: "date" },
      { id: "note", label: "Ghi chú đặc biệt", type: "textarea", placeholder: "Dị ứng hóa chất, giờ giao hàng yêu thích..." },
    ];
  }, []);

  const range = useDashboardTimeRangeStore((state) => state.range);
  const rangeLabel = formatRange(normalizeRange(range));
  const checkboxClass =
    "relative size-4 appearance-none rounded-[5px] border border-slate-300 bg-white transition-all duration-150 checked:border-emerald-300 checked:bg-emerald-300 after:absolute after:left-1/2 after:top-1/2 after:hidden after:h-[9px] after:w-[5px] after:-translate-x-1/2 after:-translate-y-[58%] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:content-[''] checked:after:block";

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const source = `${c.name} ${c.phone} ${c.address} ${c.email}`;
      const matchQuery = source.toLowerCase().includes(query.toLowerCase());
      const matchRank = selectedRank === "Tất cả" || c.rank === selectedRank;
      return matchQuery && matchRank;
    });
  }, [customers, query, selectedRank]);

  const pageCount = Math.ceil(filteredCustomers.length / pageSize);
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
      const actionIndex = next.findIndex((column) => column.id === "actions");
      next.splice(actionIndex === -1 ? next.length : actionIndex, 0, newColumn);
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
      const temp = next[draggedIndex];
      next[draggedIndex] = next[dropIndex];
      next[dropIndex] = temp;
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

  const confirmDeleteCustomer = () => {
    if (!deleteTarget) return;

    setCustomers((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setSelectedCustomerIds((prev) => {
      const next = new Set(prev);
      next.delete(deleteTarget.id);
      return next;
    });
    if (selectedCustomer.id === deleteTarget.id) {
      const remaining = customers.filter((c) => c.id !== deleteTarget.id);
      if (remaining.length > 0) setSelectedCustomer(remaining[0]);
    }
    setDeleteConfirmOpen(false);
    setDeleteTarget(null);
    setPage(1);
  };

  const saveCustomer = () => {
    if (!form.name.trim() || !form.phone.trim()) return;

    const payload: CustomerFields & Record<string, string | number | undefined> = {
      ...getCustomFields(form),
      name: form.name,
      phone: form.phone,
      email: form.email || "khachhang@example.com",
      birthday: form.birthday || new Date().toISOString().slice(0, 10),
      address: form.address,
      note: form.note || "Không có",
      rank: form.rank,
      points: Number(form.points) || 0,
      totalOrders: Number(form.totalOrders) || 0,
      totalSpend: Number(form.totalSpend) || 0,
      createdAt: form.createdAt || new Date().toISOString().slice(0, 10),
    };

    if (editingCustomerId) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === editingCustomerId ? { ...c, ...payload } : c
        )
      );
      const updatedCustomer = { id: editingCustomerId, ...payload };
      if (selectedCustomer.id === editingCustomerId) setSelectedCustomer(updatedCustomer);
    } else {
      const newId = `KH-${Date.now().toString().slice(-3)}`;
      const newCustomer = { id: newId, ...payload };
      setCustomers((prev) => [newCustomer, ...prev]);
      setSelectedCustomer(newCustomer);
    }

    setPage(1);
    setOpenForm(false);
  };

  const renderCustomerCell = (customer: Customer, column: CustomerColumn) => {
    if (column.id === "name") {
      return (
        <TableCell key={column.id} className="pl-4">
          <div className="flex min-w-0 items-center gap-2">
            <input
              type="checkbox"
              aria-label={`Chọn ${customer.name}`}
              checked={selectedCustomerIds.has(customer.id)}
              onChange={() => toggleCustomer(customer.id)}
              onClick={(event) => event.stopPropagation()}
              className={checkboxClass}
            />
            <Image
              src="https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif"
              alt={customer.name}
              width={28}
              height={28}
              className="size-6 shrink-0 rounded-full object-cover"
            />
            <span className="truncate font-medium text-slate-900">{customer.name}</span>
          </div>
        </TableCell>
      );
    }

    if (column.id === "email") {
      return (
        <TableCell key={column.id} className="max-w-0 truncate overflow-hidden text-slate-500" title={customer.email}>
          {customer.email}
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
        <TableCell key={column.id} className="max-w-0 truncate overflow-hidden text-slate-600" title={customer.address}>
          {customer.address}
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
              className="inline-block size-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: rankColor[customer.rank]?.text || "#475569" }}
            />
            <span className="truncate">{customer.rank}</span>
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
            className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50"
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
    const displayValue = customValue ? String(customValue) : "Chưa có";

    return (
      <TableCell
        key={column.id}
        className={`max-w-0 truncate overflow-hidden ${customValue ? "text-slate-600" : "text-slate-400 italic"}`}
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
            <Image
              src="https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif"
              alt={customer.name}
              width={32}
              height={32}
              className="size-8 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-700">{customer.name}</p>
              <p className="truncate text-[11px] text-slate-400">{customer.phone}</p>
            </div>
          </div>
          <span className="shrink-0 text-[11px] font-semibold text-slate-400">{customer.id}</span>
        </div>
        <p className="mt-2 truncate text-xs text-slate-500">{customer.email}</p>
        <p className="mt-1 truncate text-xs text-slate-500">{customer.totalOrders} đơn · {customer.points.toLocaleString("vi-VN")} điểm</p>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
          <span className="truncate text-[11px] text-slate-500">{formatBirthday(customer.birthday)}</span>
          <span className="text-[13px] font-bold text-slate-900">{customer.totalSpend.toLocaleString("vi-VN")}đ</span>
        </div>
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => openEditForm(customer)}
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
            <Image
              src="https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif"
              alt={customer.name}
              width={40}
              height={40}
              className="size-10 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-950">{customer.name}</p>
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
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>{customer.phone}</span>
                <span>{customer.email}</span>
                <span>{customer.totalOrders} đơn · {customer.points.toLocaleString("vi-VN")} điểm</span>
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-slate-400">{customer.address}</p>
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

          {viewMode === "Bảng" ? (
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
              onDropItem={(customerId, rank) => {
                setCustomers((prev) =>
                  prev.map((c) => (c.id === customerId ? { ...c, rank } : c)),
                );
              }}
              renderCard={renderCustomerKanbanCard}
              tableResizeMode={tableResizeMode}
            />
          ) : (
            <ListView
              paginatedRows={paginatedCustomers}
              emptyMessage="Không tìm thấy khách hàng phù hợp."
              renderRow={renderCustomerListRow}
            />
          )}
        </div>
      </div>

      <FormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        title={editingCustomerId ? "Chỉnh sửa thông tin khách hàng" : "Thêm khách hàng mới"}
        fields={customerFormFields}
        form={form}
        onFormChange={(newForm) => setForm({ ...emptyForm, ...newForm })}
        onSave={saveCustomer}
        customColumns={customColumns}
        customColumnsBeforeFieldId="createdAt"
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

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent showCloseButton={false} className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl sm:max-w-[400px]">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <DialogTitle className="text-base font-semibold text-slate-900">Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <div className="py-5 text-sm leading-6 text-slate-600">
            Bạn có chắc chắn muốn xóa khách hàng {deleteTarget ? `"${deleteTarget.name}"` : "này"} không? Hành động này không thể hoàn tác.
          </div>
          <DialogFooter className="flex flex-row items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setDeleteTarget(null);
              }}
            >
              Hủy
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 sm:w-auto"
              onClick={confirmDeleteCustomer}
            >
              Xác nhận xóa
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </PageShell>
  );
}
