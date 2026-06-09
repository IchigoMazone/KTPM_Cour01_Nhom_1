"use client";

import { useMemo, useState, type DragEvent } from "react";
import Image from "next/image";
import {
  ImagePlus,
  MessageCircle,
  Send,
  ChevronLeft,
  CheckCheck,
  MoreVertical,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TableCell } from "@/components/ui/table";
import { PageShell } from "../_components/dashboard-primitives";
import { Toolbar } from "../_components/toolbar";
import { FilterBar, type FilterOption } from "../_components/filter-bar";
import { TableView } from "../_components/table-view";
import { KanbanView, type KanbanColumn } from "../_components/kanban-view";
import { ListView } from "../_components/list-view";
import { AddColumnDialog } from "../_components/add-column-dialog";
import { FormDialog, type FormField } from "../_components/form-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { type DashboardTableColumn } from "@/src/components/common/dashboard-data-table";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import { formatRange, normalizeRange } from "@/src/utils/dashboard-time";

type TicketStatus = "Chưa xử lý" | "Đang xử lý" | "Đã giải quyết";
type Priority = "Cao" | "Trung bình" | "Thấp";

type Ticket = {
  id: string;
  type: string;
  customer: string;
  phone: string;
  orderId: string;
  priority: Priority;
  owner: string;
  ownerAvatar?: string;
  status: TicketStatus;
  washDate: string;
  createdAt: string;
  note: string;
};

type SupportMessage = {
  id: string;
  ticketId: string;
  sender: "customer" | "staff";
  senderName: string;
  avatar?: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
};

const initialPageSize = 10;
const defaultColumns: DashboardTableColumn[] = [
  { id: "id", label: "Mã", width: 104, visible: true },
  { id: "type", label: "Loại", width: 112, visible: true },
  { id: "customer", label: "Khách hàng", width: 150, visible: true },
  { id: "phone", label: "SĐT", width: 116, visible: true },
  { id: "orderId", label: "Đơn", width: 96, visible: true },
  { id: "priority", label: "Ưu tiên", width: 96, visible: true },
  { id: "owner", label: "Phụ trách", width: 104, visible: true },
  { id: "status", label: "Trạng thái", width: 116, visible: true },
  { id: "washDate", label: "Ngày giặt", width: 112, visible: true },
  { id: "createdAt", label: "Ngày tạo", width: 104, visible: true },
  { id: "note", label: "Nội dung", width: 240, visible: true },
  { id: "actions", label: "Thao tác", width: 152, visible: true },
];
const statuses: Array<TicketStatus | "Tất cả"> = ["Tất cả", "Chưa xử lý", "Đang xử lý", "Đã giải quyết"];

function mergeDefaultColumns(source: DashboardTableColumn[]) {
  const next = [...source];
  defaultColumns.forEach((column) => {
    if (next.some((item) => item.id === column.id)) return;
    const actionIndex = next.findIndex((item) => item.id === "actions");
    next.splice(actionIndex === -1 ? next.length : actionIndex, 0, column);
  });
  return next;
}

const seedTickets: Ticket[] = [
  { id: "HT-501", type: "Mất đồ", customer: "Nguyễn Văn A", phone: "0903123456", orderId: "DH-1022", priority: "Cao", owner: "Quản lý", ownerAvatar: "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif", status: "Đang xử lý", washDate: "2026-05-29", createdAt: "2026-05-29", note: "Thiếu 1 tất đen" },
  { id: "HT-502", type: "Giao trễ", customer: "Trần Thị B", phone: "0912456789", orderId: "DH-1031", priority: "Trung bình", owner: "Tài xế C", ownerAvatar: "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif", status: "Chưa xử lý", washDate: "2026-05-29", createdAt: "2026-05-29", note: "Trễ 45 phút so với lịch hẹn" },
  { id: "HT-503", type: "Hỏng đồ", customer: "Phạm Lan", phone: "0938123456", orderId: "DH-1036", priority: "Cao", owner: "Admin", ownerAvatar: "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif", status: "Đã giải quyết", washDate: "2026-05-28", createdAt: "2026-05-28", note: "Đền bù theo chính sách" },
  { id: "HT-504", type: "Thanh toán", customer: "Shop Linen", phone: "0283999888", orderId: "DH-1061", priority: "Thấp", owner: "Thu ngân", ownerAvatar: "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif", status: "Đang xử lý", washDate: "2026-05-27", createdAt: "2026-05-27", note: "Đối soát chuyển khoản" },
];

const emptyForm = {
  type: "",
  customer: "",
  phone: "",
  orderId: "",
  priority: "Trung bình" as Priority,
  owner: "",
  status: "Chưa xử lý" as TicketStatus,
  washDate: "",
  createdAt: "",
  note: "",
};

const statusColor: Record<TicketStatus, { text: string; bg: string }> = {
  "Chưa xử lý": { text: "#2563eb", bg: "rgba(37,99,235,0.09)" },
  "Đang xử lý": { text: "#d97706", bg: "rgba(217,119,6,0.09)" },
  "Đã giải quyết": { text: "#059669", bg: "rgba(5,150,105,0.09)" },
};

const priorityColor: Record<Priority, { text: string; bg: string }> = {
  "Cao": { text: "#dc2626", bg: "rgba(220,38,38,0.09)" },
  "Trung bình": { text: "#d97706", bg: "rgba(217,119,6,0.09)" },
  "Thấp": { text: "#2563eb", bg: "rgba(37,99,235,0.09)" },
};

const statusDotColors = Object.fromEntries(
  Object.entries(statusColor).map(([status, color]) => [status, color.text])
);
const priorityDotColors = Object.fromEntries(
  Object.entries(priorityColor).map(([priority, color]) => [priority, color.text])
);

function PriorityPill({ label }: { label: Priority }) {
  const color = priorityColor[label];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium" style={{ color: color.text, backgroundColor: color.bg }}>
      <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color.text }} />
      {label}
    </span>
  );
}

function StatusPill({ label }: { label: TicketStatus }) {
  const color = statusColor[label];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium" style={{ color: color.text, backgroundColor: color.bg }}>
      <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color.text }} />
      {label}
    </span>
  );
}

function formatReadableDate(dateStr?: string) {
  if (!dateStr) return "-";
  if (dateStr.includes("/")) return dateStr;
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
}

function MetricCard({ title, value, hint, color }: { title: string; value: string; hint: string; color: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg" style={{ color, backgroundColor: `${color}14` }}>
          <MessageCircle className="size-3.5" />
        </span>
        <p className="truncate text-xs font-semibold text-slate-900">{title}</p>
      </div>
      <p className="mt-3 text-xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 truncate text-xs text-slate-400">{hint}</p>
    </div>
  );
}

export default function SupportPage() {
  const [tickets, setTickets] = useState(seedTickets);
  const [currentUser] = useState(() => {
    if (typeof window !== "undefined") {
      const username = localStorage.getItem("username");
      const displayName = localStorage.getItem("fullName") || localStorage.getItem("fullname") || localStorage.getItem("full_name") || localStorage.getItem("accountName");
      if (displayName && displayName !== username) return displayName;
    }
    return "Quản lý";
  });
  const [currentUserAvatar] = useState(() => {
    if (typeof window !== "undefined") {
      const storedAvatar = localStorage.getItem("accountImageUrl");
      if (storedAvatar) return storedAvatar;
    }
    return "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif";
  });
  const [columns, setColumns] = useState<DashboardTableColumn[]>(defaultColumns);
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingTicketId, setDeletingTicketId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | "Tất cả">("Tất cả");
  const [viewMode, setViewMode] = useState<"Bảng" | "Bảng kéo" | "Danh sách">("Bảng");
  const [tableResizeMode, setTableResizeMode] = useState<"fit" | "custom">("fit");
  const [draggedTicketId, setDraggedTicketId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [openForm, setOpenForm] = useState(false);
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>(emptyForm);
  const [openPageSizeMenu, setOpenPageSizeMenu] = useState(false);
  const [customPageSize, setCustomPageSize] = useState("");
  const [openAddColumn, setOpenAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [selectedTicketIds, setSelectedTicketIds] = useState<Set<string>>(new Set());
  const [activeChatTicketId, setActiveChatTicketId] = useState<string | null>(null);
  const [chatDraft, setChatDraft] = useState("");
  const [chatImagePreview, setChatImagePreview] = useState<string | null>(null);
  const [ticketMessages, setTicketMessages] = useState<Record<string, SupportMessage[]>>(() =>
    Object.fromEntries(
      seedTickets.map((ticket) => [
        ticket.id,
        [
          {
            id: `${ticket.id}-seed`,
            ticketId: ticket.id,
            sender: "customer" as const,
            senderName: ticket.customer,
            content: ticket.note,
            createdAt: ticket.createdAt,
          },
        ],
      ]),
    ),
  );
  const activeColumns = useMemo(() => mergeDefaultColumns(columns), [columns]);
  const ticketFormFields = useMemo<FormField[]>(() => {
    const fieldByColumnId: Record<string, FormField> = {
      type: { id: "type", label: "Loại hỗ trợ", type: "select", options: ["Mất đồ", "Giao trễ", "Hỏng đồ", "Thanh toán", "Khác"] },
      customer: { id: "customer", label: "Tên khách", type: "text", placeholder: "Tên khách" },
      phone: { id: "phone", label: "Số điện thoại", type: "text", placeholder: "090..." },
      orderId: { id: "orderId", label: "Mã đơn", type: "text", placeholder: "DH-1022" },
      priority: { id: "priority", label: "Độ ưu tiên", type: "select", options: ["Cao", "Trung bình", "Thấp"], optionDotColors: priorityDotColors },
      owner: { id: "owner", label: "Người phụ trách", type: "custom_staff" },
      status: { id: "status", label: "Trạng thái", type: "custom_status" },
      washDate: { id: "washDate", label: "Ngày giặt", type: "date" },
      createdAt: { id: "createdAt", label: "Ngày tạo", type: "date" },
      note: { id: "note", label: "Nội dung xử lý", type: "textarea", placeholder: "Mô tả vấn đề, phương án xử lý, bồi thường..." },
    };

    return activeColumns
      .filter((column) => column.visible !== false && column.id !== "id" && column.id !== "actions")
      .map((column) => {
        return fieldByColumnId[column.id] || {
          id: column.id,
          label: column.label,
          type: "text",
          placeholder: `Nhập ${column.label.toLowerCase()}`,
        } satisfies FormField;
      });
  }, [activeColumns]);
  const updateColumns = (value: DashboardTableColumn[] | ((prev: DashboardTableColumn[]) => DashboardTableColumn[])) => {
    setColumns((prev) => {
      const mergedPrev = mergeDefaultColumns(prev);
      return typeof value === "function" ? value(mergedPrev) : value;
    });
  };
  const range = useDashboardTimeRangeStore((state) => state.range);
  const rangeLabel = formatRange(normalizeRange(range));
  const checkboxClass =
    "relative size-4 appearance-none rounded-[5px] border border-slate-300 bg-white transition-all duration-150 checked:border-emerald-300 checked:bg-emerald-300 after:absolute after:left-1/2 after:top-1/2 after:hidden after:h-[9px] after:w-[5px] after:-translate-x-1/2 after:-translate-y-[58%] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:content-[''] checked:after:block";

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const source = `${ticket.id} ${ticket.type} ${ticket.customer} ${ticket.phone} ${ticket.orderId} ${ticket.owner} ${ticket.washDate} ${ticket.createdAt} ${ticket.note}`;
      const matchQuery = source.toLowerCase().includes(query.toLowerCase());
      const matchStatus = selectedStatus === "Tất cả" || ticket.status === selectedStatus;
      return matchQuery && matchStatus;
    });
  }, [query, selectedStatus, tickets]);

  const pageCount = Math.ceil(filteredTickets.length / pageSize);
  const paginatedTickets = filteredTickets.slice((page - 1) * pageSize, page * pageSize);
  const totalVisibleWidth = activeColumns.filter((column) => column.visible !== false).reduce((sum, column) => sum + (column.width || 150), 0);
  const visibleTicketIds = useMemo(
    () => (viewMode === "Bảng kéo" ? filteredTickets : paginatedTickets).map((ticket) => ticket.id),
    [filteredTickets, paginatedTickets, viewMode]
  );
  const allVisibleTicketsSelected = visibleTicketIds.length > 0 && visibleTicketIds.every((id) => selectedTicketIds.has(id));
  const selectedVisibleTicketCount = visibleTicketIds.filter((id) => selectedTicketIds.has(id)).length;
  const activeChatTicket = activeChatTicketId ? tickets.find((ticket) => ticket.id === activeChatTicketId) ?? null : null;
  const activeChatMessages = activeChatTicketId ? ticketMessages[activeChatTicketId] ?? [] : [];
  const customColumns = useMemo(
    () => activeColumns.filter((column) => !defaultColumns.some((defaultColumn) => defaultColumn.id === column.id)),
    [activeColumns]
  );
  const getCustomFields = (source: Record<string, unknown> = {}) =>
    Object.fromEntries(customColumns.map((column) => [column.id, String(source[column.id] ?? "")]));

  const toggleVisibleTickets = () => {
    setSelectedTicketIds((prev) => {
      const next = new Set(prev);
      if (allVisibleTicketsSelected) {
        visibleTicketIds.forEach((id) => next.delete(id));
      } else {
        visibleTicketIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleTicket = (id: string) => {
    setSelectedTicketIds((prev) => {
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

  const filterOptions = useMemo<FilterOption[]>(
    () => statuses.map((status) => ({
      id: status,
      label: status,
      color: status === "Tất cả" ? "#64748b" : statusColor[status].text,
      bgColor: status === "Tất cả" ? "rgba(100,116,139,0.09)" : statusColor[status].bg,
    })),
    []
  );

  const kanbanColumns = useMemo<KanbanColumn[]>(
    () => statuses.filter((status) => status !== "Tất cả").map((status) => ({
      id: status,
      label: status,
      color: statusColor[status],
    })),
    []
  );

  const handleExport = (format: "pdf" | "excel" | "csv", fileName: string) => {
    const headers = activeColumns.filter((column) => column.visible !== false && column.id !== "actions").map((column) => column.label);
    const values = filteredTickets.map((ticket) =>
      activeColumns.filter((column) => column.visible !== false && column.id !== "actions").map((column) => {
        if (column.id === "washDate") return formatReadableDate(ticket.washDate);
        if (column.id === "createdAt") return formatReadableDate(ticket.createdAt);
        return String((ticket as Record<string, unknown>)[column.id] ?? "");
      })
    );
    const baseFileName = fileName || `ho-tro-${new Date().toISOString().slice(0, 10)}`;

    if (format === "csv") {
      const csv = "\uFEFF" + [headers, ...values].map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
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

    const tableHead = headers.map((header) => `<th>${header}</th>`).join("");
    const tableBody = values.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("");
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
    printWindow.document.write(`<html><body><h2>Hỗ trợ</h2><table border="1"><thead><tr>${tableHead}</tr></thead><tbody>${tableBody}</tbody></table></body></html>`);
    printWindow.document.close();
    printWindow.print();
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
    setColumns((prev) => {
      const next = mergeDefaultColumns(prev);
      const actionIndex = next.findIndex((column) => column.id === "actions");
      next.splice(actionIndex === -1 ? next.length : actionIndex, 0, newColumn);
      return next;
    });
    setForm((prev) => ({ ...prev, [newColumn.id]: "" }));
    setNewColumnName("");
    setOpenAddColumn(false);
  };

  const handleDragStart = (event: DragEvent<HTMLTableCellElement>, id: string) => {
    setDraggedColumnId(id);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (event: DragEvent<HTMLTableCellElement>, id: string) => {
    event.preventDefault();
    if (id !== draggedColumnId) setDragOverColumnId(id);
  };

  const handleDragLeave = () => setDragOverColumnId(null);

  const handleDrop = (event: DragEvent<HTMLTableCellElement>, id: string) => {
    event.preventDefault();
    if (!draggedColumnId || draggedColumnId === id) {
      setDragOverColumnId(null);
      return;
    }

    setColumns((prev) => {
      const mergedPrev = mergeDefaultColumns(prev);
      const draggedIndex = mergedPrev.findIndex((column) => column.id === draggedColumnId);
      const dropIndex = mergedPrev.findIndex((column) => column.id === id);
      if (draggedIndex === -1 || dropIndex === -1) return prev;

      const next = [...mergedPrev];
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

  const startDeleteTicket = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingTicketId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingTicketId) {
      setTickets((prev) => prev.filter((item) => item.id !== deletingTicketId));
      setSelectedTicketIds((prev) => {
        const next = new Set(prev);
        next.delete(deletingTicketId);
        return next;
      });
      setDeletingTicketId(null);
    }
    setDeleteConfirmOpen(false);
  };

  const openCreateForm = () => {
    setEditingTicketId(null);
    setForm({
      ...emptyForm,
      ...getCustomFields(),
      createdAt: new Date().toISOString().slice(0, 10),
      owner: currentUser,
    });
    setOpenForm(true);
  };

  const openEditForm = (ticket: Ticket) => {
    setEditingTicketId(ticket.id);
    setForm({
      type: ticket.type,
      customer: ticket.customer,
      phone: ticket.phone,
      orderId: ticket.orderId,
      priority: ticket.priority,
      owner: currentUser,
      status: ticket.status,
      washDate: ticket.washDate || ticket.createdAt,
      createdAt: ticket.createdAt,
      note: ticket.note,
      ...getCustomFields(ticket as unknown as Record<string, unknown>),
    });
    setOpenForm(true);
  };

  const openReplyPage = (ticket: Ticket) => {
    setActiveChatTicketId(ticket.id);
    setChatDraft("");
    setChatImagePreview(null);
    setTickets((prev) =>
      prev.map((item) =>
        item.id === ticket.id
          ? {
            ...item,
            owner: currentUser,
            ownerAvatar: currentUserAvatar,
            status: item.status === "Chưa xử lý" ? "Đang xử lý" : item.status,
          }
          : item,
      ),
    );
  };

  const sendMessage = () => {
    if (!activeChatTicketId || (!chatDraft.trim() && !chatImagePreview)) return;
    const now = new Date();
    const message: SupportMessage = {
      id: `${activeChatTicketId}-${now.getTime()}`,
      ticketId: activeChatTicketId,
      sender: "staff",
      senderName: currentUser,
      avatar: currentUserAvatar,
      content: chatDraft.trim(),
      imageUrl: chatImagePreview || undefined,
      createdAt: now.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setTicketMessages((prev) => ({
      ...prev,
      [activeChatTicketId]: [...(prev[activeChatTicketId] ?? []), message],
    }));
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === activeChatTicketId
          ? {
            ...ticket,
            owner: currentUser,
            ownerAvatar: currentUserAvatar,
            status: ticket.status === "Chưa xử lý" ? "Đang xử lý" : ticket.status,
          }
          : ticket,
      ),
    );
    setChatDraft("");
    setChatImagePreview(null);
  };

  const saveTicket = () => {
    if (!form.type?.trim() || !form.customer?.trim()) return;

    if (editingTicketId) {
      const originalTicket = tickets.find((t) => t.id === editingTicketId);
      const payload: Omit<Ticket, "id"> = {
        type: form.type,
        customer: form.customer,
        phone: form.phone || "",
        orderId: form.orderId || "-",
        priority: (form.priority as Priority) || "Trung bình",
        owner: currentUser,
        ownerAvatar: currentUserAvatar || originalTicket?.ownerAvatar || "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif",
        status: (form.status as TicketStatus) || "Chưa xử lý",
        washDate: form.washDate || form.createdAt || new Date().toISOString().slice(0, 10),
        createdAt: form.createdAt || new Date().toISOString().slice(0, 10),
        note: form.note || "",
        ...getCustomFields(form),
      };
      setTickets((prev) => prev.map((ticket) => ticket.id === editingTicketId ? { ...ticket, ...payload } : ticket));
    } else {
      const payload: Omit<Ticket, "id"> = {
        type: form.type,
        customer: form.customer,
        phone: form.phone || "",
        orderId: form.orderId || "-",
        priority: (form.priority as Priority) || "Trung bình",
        owner: currentUser,
        ownerAvatar: currentUserAvatar || "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif",
        status: (form.status as TicketStatus) || "Chưa xử lý",
        washDate: form.washDate || form.createdAt || new Date().toISOString().slice(0, 10),
        createdAt: form.createdAt || new Date().toISOString().slice(0, 10),
        note: form.note || "",
        ...getCustomFields(form),
      };
      setTickets((prev) => [{ id: `HT-${Date.now().toString().slice(-3)}`, ...payload }, ...prev]);
    }

    setPage(1);
    setOpenForm(false);
  };

  const renderTicketCell = (ticket: Ticket, column: DashboardTableColumn) => {
    if (column.id === "id") return (
      <TableCell key={column.id} className="pl-4 font-medium text-slate-900">
        <div className="flex items-center gap-2">
          <input type="checkbox" aria-label={`Chọn ticket ${ticket.id}`} checked={selectedTicketIds.has(ticket.id)} onChange={() => toggleTicket(ticket.id)} className={`shrink-0 ${checkboxClass}`} />
          <span>{ticket.id}</span>
        </div>
      </TableCell>
    );
    if (column.id === "type") return <TableCell key={column.id}>{ticket.type}</TableCell>;
    if (column.id === "customer") {
      const avatarUrl = "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif";
      return (
        <TableCell key={column.id} className="font-medium text-slate-900">
          <div className="flex items-center gap-2.5">
            <Image
              src={avatarUrl}
              alt={ticket.customer}
              width={28}
              height={28}
              className="size-6 shrink-0 rounded-full object-cover"
            />
            <span className="truncate">{ticket.customer}</span>
          </div>
        </TableCell>
      );
    }
    if (column.id === "phone") return <TableCell key={column.id}><a href={`tel:${ticket.phone}`} className="text-slate-500 hover:text-slate-800">{ticket.phone}</a></TableCell>;
    if (column.id === "orderId") return <TableCell key={column.id}>{ticket.orderId}</TableCell>;
    if (column.id === "priority") return <TableCell key={column.id}><PriorityPill label={ticket.priority} /></TableCell>;
    if (column.id === "owner") {
      const avatarUrl = ticket.ownerAvatar || "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif";
      return (
        <TableCell key={column.id} className="font-medium text-slate-900">
          <div className="flex items-center gap-2.5">
            <Image
              src={avatarUrl}
              alt={ticket.owner}
              width={24}
              height={24}
              className="size-6 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
            <span className="truncate">{ticket.owner}</span>
          </div>
        </TableCell>
      );
    }
    if (column.id === "status") return <TableCell key={column.id}><StatusPill label={ticket.status} /></TableCell>;
    if (column.id === "washDate") return <TableCell key={column.id} className="text-slate-500">{formatReadableDate(ticket.washDate)}</TableCell>;
    if (column.id === "createdAt") return <TableCell key={column.id} className="text-slate-500">{formatReadableDate(ticket.createdAt)}</TableCell>;
    if (column.id === "note") return <TableCell key={column.id} className="truncate text-slate-500" title={ticket.note}>{ticket.note}</TableCell>;
    if (column.id === "actions") return (
      <TableCell key={column.id} className="px-4">
        <div className="flex items-center justify-start gap-1.5">
          <button
            type="button"
            className="inline-flex h-7 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50"
            onClick={() => openEditForm(ticket)}
          >
            Sửa
          </button>
          <button
            type="button"
            className="inline-flex h-7 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50"
            onClick={() => openReplyPage(ticket)}
          >
            Phản hồi
          </button>
          <button
            type="button"
            className="inline-flex h-7 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-100"
            onClick={(e) => startDeleteTicket(ticket.id, e)}
          >
            Xóa
          </button>
        </div>
      </TableCell>
    );
    return <TableCell key={column.id} className="text-slate-400 italic">Chưa có</TableCell>;
  };

  const renderTicketKanbanCard = (ticket: Ticket) => (
    <div
      key={ticket.id}
      draggable
      onDragStart={(event) => {
        setDraggedTicketId(ticket.id);
        event.dataTransfer.effectAllowed = "move";
      }}
      onDragEnd={() => {
        setDraggedTicketId(null);
        setDragOverStatus(null);
      }}
      className={`cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-slate-300 hover:shadow-md active:cursor-grabbing ${draggedTicketId === ticket.id ? "opacity-50 ring-2 ring-slate-400" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <input
            type="checkbox"
            aria-label={`Chọn ${ticket.id}`}
            checked={selectedTicketIds.has(ticket.id)}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
            onChange={() => toggleTicket(ticket.id)}
            className={`shrink-0 ${checkboxClass}`}
          />
          <Image
            src="https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif"
            alt={ticket.customer}
            width={32}
            height={32}
            className="size-8 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-700">{ticket.customer}</p>
            <p className="truncate text-[11px] text-slate-400">{ticket.id} · {ticket.type}</p>
          </div>
        </div>
        <PriorityPill label={ticket.priority} />
      </div>
      <p className="mt-2 line-clamp-2 text-xs text-slate-500">{ticket.note}</p>
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Image
            src={ticket.ownerAvatar || "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif"}
            alt={ticket.owner}
            width={16}
            height={16}
            className="size-4 shrink-0 rounded-full object-cover ring-1 ring-slate-100 shadow-sm"
          />
          <span className="truncate text-[11px] text-slate-400">{ticket.owner} · Giặt {formatReadableDate(ticket.washDate)}</span>
        </div>
        <div className="flex gap-1.5">
          <button type="button" className="inline-flex h-6 items-center rounded-md bg-slate-100 px-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200" onClick={() => openEditForm(ticket)}>
            Chi tiết
          </button>
          <button type="button" className="inline-flex h-6 items-center rounded-md bg-slate-100 px-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200" onClick={() => openReplyPage(ticket)}>
            Phản hồi
          </button>
          <button type="button" className="inline-flex h-6 items-center rounded-md bg-red-50 px-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-100/70" onClick={(e) => startDeleteTicket(ticket.id, e)}>
            Xóa
          </button>
        </div>
      </div>
    </div>
  );

  const renderTicketListRow = (ticket: Ticket) => (
    <div key={ticket.id} className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <input
            type="checkbox"
            aria-label={`Chọn ${ticket.id}`}
            checked={selectedTicketIds.has(ticket.id)}
            onChange={() => toggleTicket(ticket.id)}
            className={`mt-1 shrink-0 ${checkboxClass}`}
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Image
                src="https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif"
                alt={ticket.customer}
                width={24}
                height={24}
                className="size-6 rounded-full object-cover ring-1 ring-slate-100 shadow-sm"
              />
              <p className="font-semibold text-slate-950">{ticket.customer}</p>
              <span className="text-xs font-medium text-slate-400">{ticket.id}</span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{ticket.type}</span>
              <StatusPill label={ticket.status} />
              <PriorityPill label={ticket.priority} />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>Số điện thoại: {ticket.phone}</span>
              <span>Mã đơn: {ticket.orderId}</span>
              <span className="inline-flex items-center gap-1.5">
                Phụ trách:
                <Image
                  src={ticket.ownerAvatar || "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif"}
                  alt={ticket.owner}
                  width={16}
                  height={16}
                  className="size-4 shrink-0 rounded-full object-cover ring-1 ring-slate-100 shadow-sm"
                />
                <span>{ticket.owner}</span>
              </span>
              <span>Ngày tạo: {formatReadableDate(ticket.createdAt)}</span>
              <span>Ngày giặt: {formatReadableDate(ticket.washDate)}</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">{ticket.note}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
          <button
            type="button"
            className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-slate-50"
            onClick={() => openEditForm(ticket)}
          >
            Sửa
          </button>
          <button
            type="button"
            className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-slate-50"
            onClick={() => openReplyPage(ticket)}
          >
            Phản hồi
          </button>
          <button
            type="button"
            className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-100"
            onClick={(e) => startDeleteTicket(ticket.id, e)}
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );

  if (activeChatTicket) {
    return (
      <PageShell fullHeight>
        <div className="min-h-0 flex-1 overflow-hidden bg-white flex flex-col">

          {/* Left Column: Chat Conversation */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">

            {/* Chat Header */}
            <div className="border-b border-slate-100 bg-white px-4 py-3 shrink-0 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  onClick={() => setActiveChatTicketId(null)}
                  className="mr-1 rounded-full p-1 text-slate-400 hover:bg-slate-100 lg:hidden"
                  title="Quay lại"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <Avatar className="size-9 border border-slate-100 shadow-sm shrink-0">
                  <AvatarImage src="https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif" alt={activeChatTicket.customer} />
                  <AvatarFallback>{activeChatTicket.customer.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 text-left">
                  <p className="truncate text-sm font-semibold text-slate-900 leading-tight">{activeChatTicket.customer}</p>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                    {activeChatTicket.id} · {activeChatTicket.type}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => {
                    setTickets(prev => prev.map(t => t.id === activeChatTicket.id ? { ...t, status: "Đã giải quyết" } : t));
                    setActiveChatTicketId(null);
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Đóng Ticket
                </button>
                <button className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700">
                  <MoreVertical className="size-4.5" />
                </button>
              </div>
            </div>

            {/* Conversation Messages */}
            <div className="min-h-0 flex-1 bg-white overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-6 px-5 py-6">
                  {activeChatMessages.map((message) => {
                    const isStaff = message.sender === "staff";
                    return (
                      <div key={message.id} className={`flex items-start gap-3 ${isStaff ? "justify-end" : "justify-start"}`}>
                        {!isStaff && (
                          <Avatar className="size-8 mt-1 border border-slate-100 shadow-sm shrink-0">
                            <AvatarImage src="https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif" alt={message.senderName} />
                            <AvatarFallback>{message.senderName.slice(0, 1)}</AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`flex max-w-[70%] flex-col gap-1 ${isStaff ? "items-end" : "items-start"}`}>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-0.5">
                            <span>{message.senderName}</span>
                            <span>·</span>
                            <span>{formatReadableDate(message.createdAt)}</span>
                            {isStaff && <span className="font-bold text-[#0ebd85]">You</span>}
                          </div>
                          <div className={`rounded-xl px-4 py-3 text-sm leading-5 shadow-2xs ${isStaff
                            ? "bg-[#edfbf4] text-slate-800 rounded-tr-none border border-emerald-50/50"
                            : "bg-[#f1f3f4] text-slate-800 rounded-tl-none"
                            }`}>
                            {message.imageUrl && (
                              <div className="mb-2 overflow-hidden rounded-lg">
                                <Image
                                  src={message.imageUrl}
                                  alt="Ảnh đính kèm"
                                  width={360}
                                  height={240}
                                  unoptimized
                                  className="max-h-64 w-full object-cover"
                                />
                              </div>
                            )}
                            {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
                          </div>

                          {/* Time and checkmarks under message */}
                          <div className="flex items-center gap-1 px-1 mt-0.5">
                            <span className="text-[10px] text-slate-400">10:30 am</span>
                            <CheckCheck className="size-3 text-slate-400" />
                          </div>
                        </div>
                        {isStaff && (
                          <Avatar className="size-8 mt-1 border border-slate-100 shadow-sm shrink-0">
                            <AvatarImage src={message.avatar || currentUserAvatar} alt={message.senderName} />
                            <AvatarFallback>{message.senderName.slice(0, 1)}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>




            {/* Chat Input Footer */}
            <div className="border-t border-slate-105 bg-white p-4 shrink-0">
              {chatImagePreview && (
                <div className="mb-3 flex w-fit items-start gap-2 rounded-lg border bg-background p-2">
                  <Image
                    src={chatImagePreview}
                    alt="Ảnh chuẩn bị gửi"
                    width={96}
                    height={72}
                    unoptimized
                    className="h-16 w-24 rounded-md object-cover"
                  />
                  <Button variant="ghost" size="sm" onClick={() => setChatImagePreview(null)}>
                    Xóa
                  </Button>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <textarea
                  value={chatDraft}
                  onChange={(event) => setChatDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Write a message..."
                  className="w-full resize-none bg-transparent text-sm text-slate-750 placeholder-slate-400 focus:outline-none min-h-[50px] max-h-24 py-1"
                />

                <div className="flex items-center justify-between border-t border-slate-50 pt-2.5">
                  <div className="flex items-center gap-1.5 text-slate-400">

                    {/* File Attachment */}
                    <label className="flex items-center gap-1 shrink-0 cursor-pointer rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-100">
                      <Paperclip className="size-3.5" />
                      <span>File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          setChatImagePreview(URL.createObjectURL(file));
                          event.target.value = "";
                        }}
                      />
                    </label>

                    {/* Image Shortcut */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <label className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg hover:bg-slate-50 hover:text-slate-600 transition-colors">
                            <ImagePlus className="size-4" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (!file) return;
                                setChatImagePreview(URL.createObjectURL(file));
                                event.target.value = "";
                              }}
                            />
                          </label>
                        </TooltipTrigger>
                        <TooltipContent>Gửi ảnh</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <button type="button" className="flex size-7 items-center justify-center rounded-lg hover:bg-slate-50 hover:text-slate-600 transition-colors" title="AI Assist">
                      <span className="text-xs">✨</span>
                    </button>
                    <button type="button" className="flex size-7 items-center justify-center rounded-lg hover:bg-slate-50 hover:text-slate-600 transition-colors" title="Emojis">
                      <span className="text-xs">😊</span>
                    </button>
                  </div>

                  {/* Send Button Green */}
                  <button
                    type="button"
                    onClick={sendMessage}
                    disabled={!chatDraft.trim() && !chatImagePreview}
                    className="flex items-center gap-1.5 rounded-lg bg-[#0ebd85] px-4 py-2 text-xs font-bold text-white transition-all hover:bg-[#0ca977] hover:scale-[1.02] active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-400 disabled:scale-100 shadow-2xs"
                  >
                    <span>Send</span>
                    <Send className="size-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>


        </div>
      </PageShell>
    );
  }

  return (
    <PageShell fullHeight>
      <div className="grid shrink-0 gap-3 md:grid-cols-4">
        <MetricCard title="Ticket mở" value={`${tickets.filter((item) => item.status !== "Đã giải quyết").length}`} hint={`Theo ${rangeLabel}`} color="#2563eb" />
        <MetricCard title="Ưu tiên cao" value={`${tickets.filter((item) => item.priority === "Cao").length}`} hint="Cần xử lý trước" color="#dc2626" />
        <MetricCard title="Đang xử lý" value={`${tickets.filter((item) => item.status === "Đang xử lý").length}`} hint="Có người phụ trách" color="#d97706" />
        <MetricCard title="Đã giải quyết" value={`${tickets.filter((item) => item.status === "Đã giải quyết").length}`} hint="Đã đóng ticket" color="#059669" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <Toolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          query={query}
          onQueryChange={(value) => {
            setQuery(value);
            setPage(1);
          }}
          columns={activeColumns}
          onColumnsChange={updateColumns}
          tableResizeMode={tableResizeMode}
          onTableResizeModeChange={setTableResizeMode}
          selectedCount={selectedTicketIds.size}
          onOpenAddColumn={() => setOpenAddColumn(true)}
          onOpenHistory={() => { }}
          onExport={handleExport}
          defaultExportFileName={`ho-tro-${new Date().toISOString().slice(0, 10)}`}
          onCreateClick={openCreateForm}
          createLabel="Thêm ticket"
          defaultColumnIds={defaultColumns.map((column) => column.id)}
          searchPlaceholder="Tìm khách, mã đơn, nội dung..."
          showHistoryButton={false}
        />

        <FilterBar
          rangeLabel={rangeLabel}
          selectedValue={selectedStatus}
          onValueChange={(value) => {
            setSelectedStatus(value as TicketStatus | "Tất cả");
            setPage(1);
          }}
          filterOptions={filterOptions}
          filterLabel="Trạng thái ticket"
          allSelected={allVisibleTicketsSelected}
          disabled={visibleTicketIds.length === 0}
          selectedCount={selectedVisibleTicketCount}
          totalCount={visibleTicketIds.length}
          itemLabel="ticket"
          checkboxClass={checkboxClass}
          onToggleAll={toggleVisibleTickets}
        />

        {viewMode === "Bảng" ? (
          <TableView
            columns={activeColumns}
            onColumnsChange={updateColumns}
            rows={paginatedTickets}
            pageSize={pageSize}
            emptyMessage="Không tìm thấy ticket phù hợp."
            tableResizeMode={tableResizeMode}
            totalVisibleWidth={totalVisibleWidth}
            renderCell={renderTicketCell}
            columnDrag={{
              draggedColumnId,
              dragOverColumnId,
              onDragStart: handleDragStart,
              onDragOver: handleDragOver,
              onDragLeave: handleDragLeave,
              onDrop: handleDrop,
              onDragEnd: handleDragEnd,
            }}
            page={page}
            pageCount={pageCount}
            totalRows={filteredTickets.length}
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
            columns={kanbanColumns}
            rows={filteredTickets}
            groupByKey="status"
            draggedItemId={draggedTicketId}
            onDraggedItemIdChange={setDraggedTicketId}
            dragOverColumnId={dragOverStatus}
            onDragOverColumnIdChange={setDragOverStatus}
            onDropItem={(id, status) => {
              setTickets((prev) => prev.map((ticket) => ticket.id === id ? { ...ticket, status: status as TicketStatus } : ticket));
            }}
            renderCard={renderTicketKanbanCard}
            tableResizeMode={tableResizeMode}
          />
        ) : (
          <ListView
            paginatedRows={paginatedTickets}
            emptyMessage="Không tìm thấy ticket phù hợp."
            renderRow={renderTicketListRow}
          />
        )}
      </div>

      <AddColumnDialog
        open={openAddColumn}
        onOpenChange={setOpenAddColumn}
        newColumnName={newColumnName}
        onNewColumnNameChange={setNewColumnName}
        onAddColumn={addCustomColumn}
      />

      <FormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        title={editingTicketId ? `Chỉnh sửa ${editingTicketId}` : "Thêm ticket hỗ trợ"}
        fields={ticketFormFields}
        form={form}
        onFormChange={setForm}
        onSave={saveTicket}
        currentStaffName={currentUser}
        currentStaffAvatar={currentUserAvatar}
        statusOptions={["Chưa xử lý", "Đang xử lý", "Đã giải quyết"]}
        statusDotColors={statusDotColors}
        showCloseButton={false}
        showCloseButtonAtBottom={true}
      />

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-[400px] bg-white rounded-xl border border-slate-200 shadow-xl p-6">
          <DialogHeader className="pb-3 border-b border-slate-100">
            <DialogTitle className="text-base font-semibold text-slate-900">Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <div className="py-5 text-sm text-slate-600">
            Bạn có chắc chắn muốn xóa ticket hỗ trợ này không? Hành động này không thể hoàn tác.
          </div>
          <DialogFooter className="flex flex-row items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 w-full sm:w-auto"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Hủy
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700 w-full sm:w-auto"
              onClick={handleDeleteConfirm}
            >
              Xác nhận xóa
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
