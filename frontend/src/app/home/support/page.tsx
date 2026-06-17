"use client";

import { useCallback, useMemo, useState, useEffect, useRef, type DragEvent } from "react";
import {
  ImagePlus,
  MessageCircle,
  Send,
  ChevronLeft,
  CheckCheck,
  Paperclip,
  ChevronDown,
  ChevronUp,
  Smile,
  Link,
  Bold,
  Sparkles,
  Search,
  PanelRight,
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { homeApi, listHomeResource } from "@/src/lib/home-api";
import { HomeTableContentSkeleton } from "@/src/components/common/auth-guard";
import { toast } from "sonner";
import { API_BASE_URL } from "@/src/lib/config";

import {
  TicketStatus,
  Priority,
  Ticket,
  SupportMessage,
  HomeSupportTicketRow,
  SupportSocketPayload,
  getSupportWsUrl,
  mapHomeTicket,
  mapHomeMessages,
  statusColor,
  priorityColor,
  formatReadableDate,
  formatMessageTime,
  quickReplies,
} from "./support-shared";

const initialPageSize = 10;
const defaultColumns: DashboardTableColumn[] = [
  { id: "id", label: "Mã", width: 104, visible: true },
  { id: "type", label: "Loại", width: 112, visible: true },
  { id: "customerCode", label: "Mã KH", width: 112, visible: true },
  { id: "customer", label: "Khách hàng", width: 150, visible: true },
  { id: "phone", label: "SĐT", width: 116, visible: true },
  { id: "orderId", label: "Đơn", width: 96, visible: true },
  { id: "priority", label: "Ưu tiên", width: 96, visible: true },
  { id: "owner", label: "Phụ trách", width: 104, visible: true },
  { id: "status", label: "Trạng thái", width: 116, visible: true },
  { id: "washDate", label: "Ngày giặt", width: 112, visible: true },
  { id: "createdAt", label: "Ngày tạo", width: 104, visible: true },
  { id: "note", label: "Ghi chú", width: 240, visible: true },
  { id: "actions", label: "Thao tác", width: 152, visible: true },
];
const statuses: Array<TicketStatus | "Tất cả"> = ["Tất cả", "Chưa xử lý", "Đang xử lý", "Đã giải quyết"];

function mergeDefaultColumns(source: DashboardTableColumn[]) {
  const next = source.map((column) => {
    const defaultColumn = defaultColumns.find((item) => item.id === column.id);
    return defaultColumn ? { ...column, label: defaultColumn.label } : column;
  });
  defaultColumns.forEach((column) => {
    if (next.some((item) => item.id === column.id)) return;
    const actionIndex = next.findIndex((item) => item.id === "actions");
    next.splice(actionIndex === -1 ? next.length : actionIndex, 0, column);
  });
  return next;
}

const emptyForm = {
  type: "",
  customerCode: "",
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

function getInitials(name: string) {
  if (!name) return "KH";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getInitialsBg(name: string) {
  if (!name) return "bg-purple-100 text-purple-700 border-purple-200";
  const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    "bg-indigo-100 text-indigo-700 border-indigo-200",
    "bg-purple-100 text-purple-700 border-purple-200",
    "bg-pink-100 text-pink-700 border-pink-200",
    "bg-blue-100 text-blue-700 border-blue-200",
    "bg-cyan-100 text-cyan-700 border-cyan-200",
    "bg-teal-100 text-teal-700 border-teal-200",
    "bg-emerald-100 text-emerald-700 border-emerald-200",
    "bg-amber-100 text-amber-700 border-amber-200",
    "bg-orange-100 text-orange-700 border-orange-200",
  ];
  return colors[sum % colors.length];
}

type SupportCustomer = {
  customer_id: string;
  customer_code: string;
  full_name: string;
  phone?: string;
  address?: string;
  email?: string;
  birthday?: string;
  image_url?: string;
  rank?: string;
  loyalty_points?: number;
  total_orders?: number;
  total_spent?: number;
  note?: string;
  account_id?: string;
  account_username?: string;
};

const customerAvatarColors = ["#0f766e", "#2563eb", "#7c3aed", "#be123c", "#c2410c", "#047857"];

function getCustomerAvatarColor(name: string) {
  const hash = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return customerAvatarColors[hash % customerAvatarColors.length];
}

function SupportCustomerAvatar({ customer, name, size = 28 }: { customer?: SupportCustomer; name: string; size?: number }) {
  return (
    <Avatar className="shrink-0 after:border-slate-200" style={{ width: size, height: size }}>
      {customer?.image_url ? <AvatarImage src={customer.image_url} alt={name} /> : null}
      <AvatarFallback
        className="font-semibold leading-none text-white"
        style={{ backgroundColor: getCustomerAvatarColor(name), fontSize: Math.max(10, size * 0.34) }}
      >
        <span className="block translate-y-px leading-none">{getInitials(name)}</span>
      </AvatarFallback>
    </Avatar>
  );
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isLayoutLoaded, setIsLayoutLoaded] = useState(false);
  const accountColumnsConfigRef = useRef<Record<string, unknown>>({});
  const supportWsRef = useRef<WebSocket | null>(null);
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
    return "";
  });
  const [columns, setColumns] = useState<DashboardTableColumn[]>(() => {
    if (typeof window === "undefined") return defaultColumns;
    try {
      const saved = JSON.parse(localStorage.getItem("home_support_columns") || "");
      return mergeDefaultColumns(saved || defaultColumns);
    } catch {
      return defaultColumns;
    }
  });
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
  const [expandOngoing, setExpandOngoing] = useState(true);
  const [expandClosed, setExpandClosed] = useState(true);
  const [ticketMessages, setTicketMessages] = useState<Record<string, SupportMessage[]>>({});
  const [customers, setCustomers] = useState<SupportCustomer[]>([]);
  const [profileCustomer, setProfileCustomer] = useState<SupportCustomer | null>(null);
  const [supportOrders, setSupportOrders] = useState<Array<{
    order_code: string;
    customer_code: string;
  }>>([]);

  const refreshSupportData = useCallback(async (showError = true) => {
    const rows = await homeApi<HomeSupportTicketRow[]>("/support-tickets/full");
    setTickets(rows.map(mapHomeTicket));
    setTicketMessages(Object.fromEntries(rows.map((row) => [row.ticket_code, mapHomeMessages(row)])));
  }, []);

  useEffect(() => {
    let alive = true;
    refreshSupportData()
      .catch((error) => {
        if (!alive) return;
        setTickets([]);
        setTicketMessages({});
        toast.error(error instanceof Error ? error.message : "Không thể tải danh sách ticket.");
      })
      .finally(() => {
        if (alive) setIsDataLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [refreshSupportData]);

  useEffect(() => {
    const handleRefreshEvents = () => {
      void refreshSupportData(false).catch(() => undefined);
    };
    window.addEventListener("support-tickets-changed", handleRefreshEvents);
    return () => {
      window.removeEventListener("support-tickets-changed", handleRefreshEvents);
    };
  }, [refreshSupportData]);

  useEffect(() => {
    const wsUrl = getSupportWsUrl("admin");
    if (!wsUrl) return;
    const socket = new WebSocket(wsUrl);
    supportWsRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as SupportSocketPayload;
        if (payload.type === "support_message_created" || payload.type === "support_message_updated") {
          void refreshSupportData(false).catch(() => undefined);
          window.dispatchEvent(new Event("support-tickets-changed"));
        }
      } catch {
        // Ignore malformed websocket payloads.
      }
    };

    socket.onclose = () => {
      if (supportWsRef.current === socket) {
        supportWsRef.current = null;
      }
    };

    return () => {
      if (supportWsRef.current === socket) {
        supportWsRef.current = null;
      }
      socket.close();
    };
  }, [refreshSupportData]);

  useEffect(() => {
    Promise.all([
      listHomeResource<SupportCustomer>("customers", { limit: 500 }),
      homeApi<Array<{ order_code: string; customer_code: string }>>("/support-tickets/orders"),
    ])
      .then(([customerRows, orderRows]) => {
        setCustomers(customerRows.items);
        setSupportOrders(orderRows);
      })
      .catch(() => {
        setCustomers([]);
        setSupportOrders([]);
      });
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
        if (!response.ok) return null;
        return response.json();
      })
      .then((data) => {
        if (!data?.columns_config) return;
        const parsed = JSON.parse(data.columns_config) as Record<string, unknown>;
        accountColumnsConfigRef.current = parsed;
        const layout = (parsed.supportLayout || {}) as {
          columns?: DashboardTableColumn[];
          tableResizeMode?: "fit" | "custom";
          pageSize?: number;
        };
        if (layout.columns) setColumns(mergeDefaultColumns(layout.columns));
        if (layout.tableResizeMode) setTableResizeMode(layout.tableResizeMode);
        if (layout.pageSize) setPageSize(layout.pageSize);
      })
      .catch(() => undefined)
      .finally(() => setIsLayoutLoaded(true));
  }, []);

  useEffect(() => {
    localStorage.setItem("home_support_columns", JSON.stringify(columns));
    if (!isLayoutLoaded) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    const timeoutId = window.setTimeout(() => {
      const nextConfig = {
        ...accountColumnsConfigRef.current,
        supportLayout: { columns, tableResizeMode, pageSize },
      };
      accountColumnsConfigRef.current = nextConfig;
      fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ columns_config: JSON.stringify(nextConfig) }),
      }).catch(() => undefined);
    }, 250);
    return () => window.clearTimeout(timeoutId);
  }, [columns, isLayoutLoaded, pageSize, tableResizeMode]);

  const activeColumns = useMemo(() => mergeDefaultColumns(columns), [columns]);
  const ticketFormFields = useMemo<FormField[]>(() => {
    const fieldByColumnId: Record<string, FormField> = {
      type: { id: "type", label: "Loại hỗ trợ", type: "select", options: ["Mất đồ", "Giao trễ", "Hỏng đồ", "Thanh toán", "Khác"], required: true },
      customerCode: { id: "customerCode", label: "Mã khách hàng", type: "text", placeholder: "KH-0001", required: true },
      customer: { id: "customer", label: "Tên khách", type: "text", readOnly: true },
      phone: { id: "phone", label: "Số điện thoại", type: "text", readOnly: true },
      orderId: { id: "orderId", label: "Mã đơn", type: "text", placeholder: "DH-0001", required: true },
      priority: { id: "priority", label: "Độ ưu tiên", type: "select", options: ["Cao", "Trung bình", "Thấp"], optionDotColors: priorityDotColors },
      owner: { id: "owner", label: "Người phụ trách", type: "custom_staff" },
      status: { id: "status", label: "Trạng thái", type: "custom_status" },
      washDate: { id: "washDate", label: "Ngày giặt", type: "date" },
      createdAt: { id: "createdAt", label: "Ngày tạo", type: "date" },
      note: { id: "note", label: "Ghi chú", type: "textarea", placeholder: "Mô tả yêu cầu hỗ trợ..." },
    };

    const orderedFields = activeColumns
      .filter((column) => column.id !== "id" && column.id !== "actions")
      .map((column) => {
        return fieldByColumnId[column.id] || {
          id: column.id,
          label: column.label,
          type: "text",
          placeholder: `Nhập ${column.label.toLowerCase()}`,
        } satisfies FormField;
      });

    return [
      ...orderedFields.filter((field) => field.id !== "note"),
      fieldByColumnId.note,
    ];
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

  const pageCount = Math.max(1, Math.ceil(filteredTickets.length / pageSize));
  const paginatedTickets = filteredTickets.slice((page - 1) * pageSize, page * pageSize);
  const totalVisibleWidth = activeColumns.filter((column) => column.visible !== false).reduce((sum, column) => sum + (column.width || 150), 0);
  const visibleTicketIds = useMemo(
    () => (viewMode === "Bảng kéo" ? filteredTickets : paginatedTickets).map((ticket) => ticket.id),
    [filteredTickets, paginatedTickets, viewMode]
  );
  const allVisibleTicketsSelected = visibleTicketIds.length > 0 && visibleTicketIds.every((id) => selectedTicketIds.has(id));
  const selectedVisibleTicketCount = visibleTicketIds.filter((id) => selectedTicketIds.has(id)).length;
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

  const handleDeleteConfirm = async () => {
    if (deletingTicketId) {
      const ticket = tickets.find((item) => item.id === deletingTicketId);
      try {
        await homeApi(`/support-tickets/${ticket?.dbId || deletingTicketId}`, { method: "DELETE" });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Không thể xóa ticket.");
        return;
      }
      setTickets((prev) => prev.filter((item) => item.id !== deletingTicketId));
      setSelectedTicketIds((prev) => {
        const next = new Set(prev);
        next.delete(deletingTicketId);
        return next;
      });
      setDeletingTicketId(null);
      toast.success("Đã xóa ticket hỗ trợ.");
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
      customerCode: ticket.customerCode,
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

  const handleTicketFormChange = (nextForm: Record<string, string>) => {
    const rawCustomerCode = (nextForm.customerCode || "").trim().toUpperCase();
    const customerCode = rawCustomerCode && !rawCustomerCode.startsWith("KH-")
      ? `KH-${rawCustomerCode.replace(/\D/g, "").slice(0, 4)}`
      : rawCustomerCode;
    const customer = customers.find((item) => item.customer_code.toUpperCase() === customerCode);
    const orderCode = (nextForm.orderId || "").trim().toUpperCase();
    setForm({
      ...nextForm,
      customerCode,
      customer: customer?.full_name || "",
      phone: customer?.phone || "",
      orderId: orderCode,
    });
  };

  const updateTicketStatus = async (ticket: Ticket, nextStatus: TicketStatus) => {
    if (ticket.status === nextStatus) return;
    try {
      const saved = await homeApi<HomeSupportTicketRow>(`/support-tickets/${ticket.dbId || ticket.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: nextStatus }),
      });
      setTickets((prev) => prev.map((item) =>
        item.id === ticket.id ? { ...item, status: saved.status } : item
      ));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật trạng thái.");
    }
  };

  const saveTicket = async () => {
    if (!form.type?.trim() || !form.customerCode?.trim() || !form.orderId?.trim()) {
      toast.error("Vui lòng nhập đầy đủ các trường bắt buộc.");
      return;
    }
    const customer = customers.find((item) => item.customer_code === form.customerCode);
    if (!customer) {
      toast.error(`Không tồn tại khách hàng ${form.customerCode}.`);
      return;
    }
    if (!supportOrders.some((order) =>
      order.order_code === form.orderId && order.customer_code === form.customerCode
    )) {
      toast.error(`Đơn hàng ${form.orderId} không thuộc khách hàng ${form.customerCode}.`);
      return;
    }
    const originalTicket = tickets.find((ticket) => ticket.id === editingTicketId);
    const payload = {
      type: form.type,
      subject: form.note?.trim().slice(0, 200) || `${form.type} · ${form.orderId}`,
      customer_code: form.customerCode,
      order_code: form.orderId,
      priority: (form.priority as Priority) || "Trung bình",
      assigned_name: currentUser,
      assigned_avatar: currentUserAvatar,
      status: (form.status as TicketStatus) || "Chưa xử lý",
      wash_date: form.washDate || null,
      note: form.note?.trim() || "",
    };
    try {
      const saved = editingTicketId
        ? await homeApi<HomeSupportTicketRow>(`/support-tickets/${originalTicket?.dbId || editingTicketId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          })
        : await homeApi<HomeSupportTicketRow>("/support-tickets", {
            method: "POST",
            body: JSON.stringify(payload),
          });
      const nextTicket = mapHomeTicket({
        ...saved,
        customer_code: saved.customer_code || payload.customer_code,
        customer_name: saved.customer_name || customer.full_name,
        customer_phone: saved.customer_phone || customer.phone,
        order_code: saved.order_code || payload.order_code || undefined,
        assigned_name: saved.assigned_name || currentUser,
        assigned_avatar: saved.assigned_avatar || currentUserAvatar,
      });
      setTickets((prev) => editingTicketId
        ? prev.map((ticket) => ticket.id === editingTicketId ? nextTicket : ticket)
        : [nextTicket, ...prev]);
      setPage(1);
      setOpenForm(false);
      toast.success(editingTicketId ? "Đã cập nhật ticket." : `Đã tạo ${nextTicket.id}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu ticket.");
    }
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
    if (column.id === "customerCode") return <TableCell key={column.id} className="font-medium text-slate-700">{ticket.customerCode || "-"}</TableCell>;
    if (column.id === "customer") {
      const customer = customers.find((item) => item.customer_code === ticket.customerCode);
      return (
        <TableCell key={column.id}>
          <div className="flex items-center gap-2.5">
            <SupportCustomerAvatar customer={customer} name={ticket.customer} size={24} />
            <button
              type="button"
              className="truncate text-left text-slate-900 hover:text-slate-600"
              onClick={() => customer && setProfileCustomer(customer)}
            >
              {ticket.customer}
            </button>
          </div>
        </TableCell>
      );
    }
    if (column.id === "phone") return <TableCell key={column.id}><a href={`tel:${ticket.phone}`} className="text-slate-500 hover:text-slate-800">{ticket.phone}</a></TableCell>;
    if (column.id === "orderId") return <TableCell key={column.id}>{ticket.orderId}</TableCell>;
    if (column.id === "priority") return <TableCell key={column.id}><PriorityPill label={ticket.priority} /></TableCell>;
    if (column.id === "owner") return <TableCell key={column.id} className="font-normal text-slate-700">{ticket.owner || "-"}</TableCell>;
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
          <SupportCustomerAvatar
            customer={customers.find((item) => item.customer_code === ticket.customerCode)}
            name={ticket.customer}
            size={32}
          />
          <div className="min-w-0">
            <button
              type="button"
              className="block max-w-full truncate text-left text-sm font-medium text-slate-700 hover:text-slate-950"
              onClick={() => {
                const customer = customers.find((item) => item.customer_code === ticket.customerCode);
                if (customer) setProfileCustomer(customer);
              }}
            >
              {ticket.customer}
            </button>
            <p className="truncate text-[11px] text-slate-400">{ticket.id} · {ticket.type}</p>
          </div>
        </div>
        <PriorityPill label={ticket.priority} />
      </div>
      <p className="mt-2 line-clamp-2 text-xs text-slate-500">{ticket.note}</p>
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
        <span className="min-w-0 truncate text-[11px] font-normal text-slate-400">{ticket.owner || "-"} · Giặt {formatReadableDate(ticket.washDate)}</span>
        <div className="flex gap-1.5">
          <button type="button" className="inline-flex h-6 items-center rounded-md bg-slate-100 px-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200" onClick={() => openEditForm(ticket)}>
            Chi tiết
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
              <SupportCustomerAvatar
                customer={customers.find((item) => item.customer_code === ticket.customerCode)}
                name={ticket.customer}
                size={24}
              />
              <button
                type="button"
                className="font-semibold text-slate-950 hover:text-slate-600"
                onClick={() => {
                  const customer = customers.find((item) => item.customer_code === ticket.customerCode);
                  if (customer) setProfileCustomer(customer);
                }}
              >
                {ticket.customer}
              </button>
              <span className="text-xs font-medium text-slate-400">{ticket.id}</span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{ticket.type}</span>
              <StatusPill label={ticket.status} />
              <PriorityPill label={ticket.priority} />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>Số điện thoại: {ticket.phone}</span>
              <span>Mã đơn: {ticket.orderId}</span>
              <span>Phụ trách: {ticket.owner || "-"}</span>
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
            className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-100"
            onClick={(e) => startDeleteTicket(ticket.id, e)}
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );

  if (isDataLoading) {
    return <HomeTableContentSkeleton />;
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

        {filteredTickets.length === 0 ? (
          <div className="flex min-h-0 flex-1 items-center justify-center p-8 text-center">
            <p className="text-sm text-slate-400">Không tìm thấy ticket phù hợp.</p>
          </div>
        ) : viewMode === "Bảng" ? (
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
              const ticket = tickets.find((item) => item.id === id);
              if (ticket) void updateTicketStatus(ticket, status as TicketStatus);
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
        onFormChange={handleTicketFormChange}
        onSave={saveTicket}
        currentStaffName={currentUser}
        currentStaffAvatar={currentUserAvatar}
        statusOptions={["Chưa xử lý", "Đang xử lý", "Đã giải quyết"]}
        statusDotColors={statusDotColors}
        showCloseButton={false}
        showCloseButtonAtBottom={true}
      />

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
                  <SupportCustomerAvatar customer={profileCustomer} name={profileCustomer.full_name} size={40} />
                  <div className="min-w-0">
                    <DialogTitle className="truncate text-base font-semibold leading-6 text-slate-950">
                      {profileCustomer.full_name}
                    </DialogTitle>
                    <p className="text-sm text-slate-500">Khách hàng · {profileCustomer.customer_code}</p>
                    <p className="mt-1 text-xs text-slate-400">{profileCustomer.rank || "Thường"}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="min-h-0 flex-1 p-5">
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    [UserRound, "Họ tên", profileCustomer.full_name],
                    [ShieldCheck, "Tên đăng nhập", profileCustomer.account_username || "Chưa liên kết"],
                    [Mail, "Email", profileCustomer.email || "-"],
                    [Phone, "Số điện thoại", profileCustomer.phone || "-"],
                    [CalendarDays, "Ngày sinh", formatReadableDate(profileCustomer.birthday?.slice(0, 10))],
                    [Sparkles, "Điểm / hạng", `${Number(profileCustomer.loyalty_points || 0).toLocaleString("vi-VN")} điểm · ${profileCustomer.rank || "Thường"}`],
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
                      profileCustomer.account_id ? "Đã liên kết" : "Chưa liên kết",
                      `${Number(profileCustomer.total_orders || 0).toLocaleString("vi-VN")} đơn hàng`,
                      `${Number(profileCustomer.total_spent || 0).toLocaleString("vi-VN")}đ chi tiêu`,
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
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

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
