"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Search,
  Star,
  Plus,
  ChevronDown,
  Pencil,
  Trash2,
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
  { id: "note", label: "Ghi chú", width: 150, visible: true },
  { id: "actions", label: "Thao tác", width: 150, visible: true },
];
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
  const [openHistory, setOpenHistory] = useState(false);
  const [activeHistoryCustomerId, setActiveHistoryCustomerId] = useState<string | null>(null);
  const [openPageSizeMenu, setOpenPageSizeMenu] = useState(false);
  const [customPageSize, setCustomPageSize] = useState("");
  const [openAddColumn, setOpenAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof emptyForm & Record<string, string>>(emptyForm);

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
  const customColumns = useMemo(
    () => columns.filter((column) => !defaultColumns.some((defaultColumn) => defaultColumn.id === column.id)),
    [columns],
  );
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
  const activeHistoryCustomer =
    selectedCustomers.find((customer) => customer.id === activeHistoryCustomerId) ??
    selectedCustomers[0] ??
    null;
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

  const deleteCustomer = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setSelectedCustomerIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    if (selectedCustomer.id === id) {
      const remaining = customers.filter((c) => c.id !== id);
      if (remaining.length > 0) setSelectedCustomer(remaining[0]);
    }
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
            <Pencil className="size-3.5" />
            Sửa
          </button>
          <button
            type="button"
            className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600"
            onClick={(event) => deleteCustomer(customer.id, event)}
            title="Xóa"
          >
            <Trash2 className="size-3.5" />
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

  return (
    <PageShell fullHeight>
      <div className="grid shrink-0 gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
              <Star className="size-3.5" />
            </span>
            <p className="truncate text-xs font-semibold text-slate-900">Khách trong bộ lọc</p>
          </div>
          <p className="mt-3 text-xl font-semibold tracking-tight text-slate-950">{filteredCustomers.length}</p>
          <p className="mt-2 truncate text-xs text-slate-400">{selectedRank} · {rangeLabel}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-600">
              <History className="size-3.5" />
            </span>
            <p className="truncate text-xs font-semibold text-slate-900">Khách VIP</p>
          </div>
          <p className="mt-3 text-xl font-semibold tracking-tight text-slate-950">{vipCustomers}</p>
          <p className="mt-2 truncate text-xs text-slate-400">Vàng và Kim cương</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <Clock className="size-3.5" />
            </span>
            <p className="truncate text-xs font-semibold text-slate-900">Tổng chi tiêu</p>
          </div>
          <p className="mt-3 text-xl font-semibold tracking-tight text-slate-950">{totalSpend.toLocaleString("vi-VN")}đ</p>
          <p className="mt-2 truncate text-xs text-slate-400">Theo khách đang hiển thị</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-600">
              <Search className="size-3.5" />
            </span>
            <p className="truncate text-xs font-semibold text-slate-900">Chi tiêu TB</p>
          </div>
          <p className="mt-3 text-xl font-semibold tracking-tight text-slate-950">{averageSpend.toLocaleString("vi-VN")}đ</p>
          <p className="mt-2 truncate text-xs text-slate-400">Trung bình mỗi khách</p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {/* ════════════ MAIN TABLE CONTAINER ════════════ */}
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-white">
          
          {/* ── Top Toolbar ── */}
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 pt-1 pb-3 xl:flex-row xl:items-center xl:justify-between">
            {/* Left: View Tabs */}
            <div className="flex items-center gap-1">
              <ViewModeTabs value={viewMode} onChange={setViewMode} />
            </div>

            {/* Right: Search & Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[220px] flex-1 xl:w-64 xl:flex-none">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
                <Input
                  className="h-8 rounded-md border-slate-200 bg-white pl-8 text-xs text-slate-700 shadow-none placeholder:text-slate-500 focus-visible:ring-slate-200"
                  placeholder="Tìm tên, SĐT, địa chỉ..."
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
                          prev.map((item) =>
                            item.id === column.id ? { ...item, visible: !!value } : item,
                          ),
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
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => setColumns(defaultColumns)}>
                    <X className="size-3.5 mr-2" />
                    Đặt lại cột
                  </DropdownMenuItem>
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
                      {customColumns.map((column) => (
                        <DropdownMenuItem
                          key={column.id}
                          className="text-red-600 focus:text-red-600"
                          onClick={() => setColumns((prev) => prev.filter((item) => item.id !== column.id))}
                        >
                          <X className="size-3.5 mr-2" />
                          Xóa &quot;{column.label}&quot;
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50 disabled:text-slate-300 disabled:hover:bg-transparent"
                disabled={selectedCustomerIds.size === 0}
                onClick={() => {
                  setActiveHistoryCustomerId(selectedCustomers[0]?.id ?? null);
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
                    { label: "PDF", hint: "Bản in và báo cáo khách hàng", icon: FileText, format: "pdf" },
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
                Thêm khách
                <ChevronDown className="size-3.5" />
              </button>
            </div>
          </div>

          {/* ── Filter Pills ── */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-5 py-3">
            <button type="button" className="inline-flex h-7 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 text-xs text-slate-700 transition-colors hover:bg-slate-50">
              <Star className="size-3.5" />
              {selectedRank}
              <ChevronDown className="size-3.5" />
            </button>
            <button type="button" className="inline-flex h-7 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 text-xs text-slate-700 transition-colors hover:bg-slate-50">
              <Clock className="size-3.5" />
              {rangeLabel}
              <ChevronDown className="size-3.5" />
            </button>
            <button type="button" className="inline-flex h-7 items-center gap-1.5 px-2 text-xs text-slate-500 transition-colors hover:text-slate-700">
              <Plus className="size-3.5" />
              Thêm bộ lọc
            </button>
            <DashboardSelectionBar
              checked={viewMode === "Bảng kéo" ? allKanbanCustomersSelected : allVisibleSelected}
              disabled={viewMode === "Bảng kéo" ? kanbanCustomerIds.length === 0 : visibleCustomerIds.length === 0}
              selectedCount={viewMode === "Bảng kéo" ? selectedKanbanCustomerCount : selectedVisibleCustomerCount}
              totalCount={viewMode === "Bảng kéo" ? kanbanCustomerIds.length : visibleCustomerIds.length}
              itemLabel="khách"
              checkboxClassName={checkboxClass}
              onToggle={viewMode === "Bảng kéo" ? toggleKanbanCustomers : toggleVisibleCustomers}
            />
            <div className="ml-auto hidden flex-wrap gap-1.5 2xl:flex">
              {["Tất cả", "Kim cương", "Vàng", "Bạc", "Thường"].map((rank) => {
                const active = selectedRank === rank;
                const isAll = rank === "Tất cả";
                const activeColor = isAll ? allRankColor : rankColor[rank].text;
                const activeBgColor = isAll ? allRankBgColor : rankColor[rank].bg;

                return (
                  <button
                    key={rank}
                    type="button"
                    onClick={() => {
                      setSelectedRank(rank);
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
                      className="inline-block size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: active ? activeColor : "#cbd5e1" }}
                    />
                    {rank}
                  </button>
                );
              })}
            </div>
          </div>

          {viewMode === "Bảng" ? (
            <>
              <DashboardDataTable
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
              />
              <DashboardTableFooter
                page={page}
                pageCount={pageCount}
                pageSize={pageSize}
                totalRows={filteredCustomers.length}
                totalLabel={`Tổng ${totalSpend.toLocaleString("vi-VN")}đ`}
                customPageSize={customPageSize}
                openPageSizeMenu={openPageSizeMenu}
                onOpenPageSizeMenuChange={setOpenPageSizeMenu}
                onCustomPageSizeChange={setCustomPageSize}
                onApplyCustomPageSize={applyCustomPageSize}
                onUpdatePageSize={updatePageSize}
                onPageChange={setPage}
              />
            </>
          ) : viewMode === "Bảng kéo" ? (
            <div className={`min-h-0 flex-1 bg-slate-50/30 p-5 ${
                tableResizeMode === "fit"
                  ? "grid grid-cols-1 gap-4 overflow-y-auto sm:grid-cols-2 xl:grid-cols-4"
                  : "flex gap-4 overflow-x-auto"
              }`}>
                {rankOptions.map((rank) => {
                  const rankCustomers = filteredCustomers.filter((customer) => customer.rank === rank);
                  const color = rankColor[rank] || { text: "#64748b", bg: "rgba(100,116,139,0.1)" };

                  return (
                    <div
                      key={rank}
                      className={`flex flex-col rounded-xl border border-slate-200 bg-slate-100/50 p-3 transition-colors ${
                        tableResizeMode === "fit" ? "w-full min-h-[300px]" : "min-w-[300px] max-w-[300px]"
                      } ${dragOverRank === rank ? "border-slate-400 bg-slate-200/50" : ""}`}
                      onDragOver={(event) => {
                        event.preventDefault();
                        if (dragOverRank !== rank) setDragOverRank(rank);
                      }}
                      onDragLeave={() => setDragOverRank(null)}
                      onDrop={(event) => {
                        event.preventDefault();
                        if (draggedCustomerId) {
                          setCustomers((prev) =>
                            prev.map((customer) =>
                              customer.id === draggedCustomerId ? { ...customer, rank } : customer,
                            ),
                          );
                        }
                        setDraggedCustomerId(null);
                        setDragOverRank(null);
                      }}
                    >
                      <div className="mb-3 flex items-center justify-between px-1">
                        <span className="inline-flex items-center gap-1.5 font-semibold" style={{ color: color.text }}>
                          <span className="size-2 rounded-full" style={{ backgroundColor: color.text }} />
                          {rank}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-500">
                          {rankCustomers.length}
                        </span>
                      </div>

                      <div className="flex h-full min-h-[100px] flex-col gap-3 overflow-y-auto px-1 pb-2">
                        {rankCustomers.map((customer) => (
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
                      ))}

                      {rankCustomers.length === 0 && (
                        <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
                          Kéo thả vào đây
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })}
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/30 p-4">
              {paginatedCustomers.length === 0 ? (
                <div className="grid min-h-[320px] place-items-center rounded-lg border border-dashed border-slate-200 bg-white text-sm text-slate-400">
                  Không tìm thấy khách hàng phù hợp.
                </div>
              ) : (
                <div className="grid gap-3">
                  {paginatedCustomers.map((customer) => (
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
                            <Pencil className="size-3.5" />
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600"
                            onClick={(event) => deleteCustomer(customer.id, event)}
                          >
                            <Trash2 className="size-3.5" />
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ════════════ MODAL: CREATE / EDIT CUSTOMER ════════════ */}
      {openForm && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-xl rounded-2xl border-0 shadow-2xl overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 px-6 py-4">
              <CardTitle className="text-base font-semibold">
                {editingCustomerId ? "Chỉnh sửa thông tin khách hàng" : "Thêm khách hàng mới"}
              </CardTitle>
              <button
                type="button"
                className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setOpenForm(false)}
              >
                <X className="size-5" />
              </button>
            </CardHeader>
            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Họ tên</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Họ và tên" />
              </div>
              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="090..." />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="khachhang@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Ngày sinh</Label>
                <Input type="date" value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Địa chỉ mặc định</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Số nhà, tên đường, quận/huyện..." />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Ghi chú đặc biệt</Label>
                <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Dị ứng hóa chất, giờ giao hàng yêu thích..." />
              </div>
              
              {editingCustomerId && (
                <>
                  <div className="space-y-2">
                    <Label>Hạng khách hàng</Label>
                    <Input value={form.rank} onChange={(e) => setForm({ ...form, rank: e.target.value })} placeholder="Thường, Bạc, Vàng, Kim cương" />
                  </div>
                  <div className="space-y-2">
                    <Label>Điểm tích lũy</Label>
                    <Input type="number" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Ngày tham gia</Label>
                    <Input type="date" value={form.createdAt} onChange={(e) => setForm({ ...form, createdAt: e.target.value })} />
                  </div>
                </>
              )}

              {customColumns.map((column) => (
                <div key={column.id} className="space-y-2 md:col-span-2">
                  <Label>{column.label}</Label>
                  <Input
                    value={form[column.id] || ""}
                    onChange={(event) => setForm({ ...form, [column.id]: event.target.value })}
                    placeholder={`Nhập ${column.label.toLowerCase()}`}
                  />
                </div>
              ))}

              <Button className="md:col-span-2 mt-2 bg-slate-900 text-white hover:bg-slate-800 h-10 font-semibold rounded-lg transition-colors" onClick={saveCustomer}>
                Lưu thông tin
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={openAddColumn} onOpenChange={setOpenAddColumn}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Thêm cột tùy chỉnh</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="customerColumnName">Tên cột</Label>
              <Input
                id="customerColumnName"
                value={newColumnName}
                onChange={(event) => setNewColumnName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") addCustomColumn();
                }}
                placeholder="VD: Khu vực phụ trách"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpenAddColumn(false)}>Hủy</Button>
            <Button type="button" onClick={addCustomColumn}>Thêm cột</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {openHistory && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <Card className="flex h-[min(86vh,680px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border-0 bg-white shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <CardTitle className="text-base font-semibold">Lịch sử khách hàng</CardTitle>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedCustomers.length} khách đang được chọn
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

            <CardContent className="grid min-h-0 flex-1 gap-0 p-0 md:grid-cols-[240px_1fr]">
              <div className="border-b border-slate-200 p-3 md:border-b-0 md:border-r">
                <div className="flex min-h-0 gap-1.5 overflow-x-auto md:flex-col md:overflow-x-hidden md:overflow-y-auto md:pr-1">
                  {selectedCustomers.map((customer) => {
                    const active = activeHistoryCustomer?.id === customer.id;
                    return (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => setActiveHistoryCustomerId(customer.id)}
                        className={`flex min-w-[190px] items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors md:min-w-0 ${
                          active
                            ? "border-slate-300 bg-slate-50 text-slate-950"
                            : "border-transparent text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Image
                          src="https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif"
                          alt={customer.name}
                          width={28}
                          height={28}
                          className="size-7 shrink-0 rounded-full object-cover"
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-semibold">{customer.name}</span>
                          <span className="block truncate text-[11px] text-slate-400">{customer.id} · {customer.rank}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="min-h-0 overflow-y-auto p-4">
                {activeHistoryCustomer ? (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-950">{activeHistoryCustomer.name}</p>
                          <p className="mt-1 text-xs text-slate-500">{activeHistoryCustomer.phone} · {activeHistoryCustomer.email}</p>
                          <p className="mt-2 text-xs text-slate-400">{activeHistoryCustomer.address}</p>
                        </div>
                        <span
                          className="inline-flex w-fit items-center gap-1.5 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium"
                          style={{
                            color: rankColor[activeHistoryCustomer.rank]?.text || "#475569",
                            backgroundColor: rankColor[activeHistoryCustomer.rank]?.bg || "rgba(71,85,105,0.08)",
                          }}
                        >
                          <span className="size-1.5 rounded-full" style={{ backgroundColor: rankColor[activeHistoryCustomer.rank]?.text || "#475569" }} />
                          {activeHistoryCustomer.rank}
                        </span>
                      </div>
                    </div>

                    {[
                      {
                        title: "Tạo hồ sơ khách hàng",
                        detail: `Ngày tham gia ${activeHistoryCustomer.createdAt || "Chưa có"}`,
                        time: activeHistoryCustomer.createdAt || "Chưa có",
                      },
                      {
                        title: "Cập nhật tích lũy",
                        detail: `${activeHistoryCustomer.points.toLocaleString("vi-VN")} điểm · ${activeHistoryCustomer.totalOrders} đơn`,
                        time: "Gần nhất",
                      },
                      {
                        title: "Ghi chú chăm sóc",
                        detail: activeHistoryCustomer.note || "Không có ghi chú đặc biệt",
                        time: "CRM",
                      },
                    ].map((item, index) => (
                      <div key={item.title} className="relative border-l border-slate-200 pl-5">
                        <span className="absolute -left-[5px] top-1.5 size-2.5 rounded-full bg-slate-900 ring-4 ring-white" />
                        <div className="rounded-lg border border-slate-200 bg-white p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                            <span className="text-xs text-slate-400">{item.time}</span>
                          </div>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                          {index === 1 && (
                            <p className="mt-2 text-xs font-medium text-slate-900">
                              Tổng chi tiêu {activeHistoryCustomer.totalSpend.toLocaleString("vi-VN")}đ
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid h-full min-h-[320px] place-items-center text-sm text-slate-400">
                    Chọn khách hàng để xem lịch sử.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageShell>
  );
}
