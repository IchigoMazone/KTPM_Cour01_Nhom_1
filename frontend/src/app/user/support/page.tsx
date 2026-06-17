"use client";

import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { CalendarDays, Mail, MapPin, MessageSquare, Phone, Send, ShieldCheck, Sparkles, TicketCheck, HelpCircle, RotateCcw, Trash2, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableCell } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { PageShell } from "@/src/app/home/_components/dashboard-primitives";
import { MetricCard } from "@/src/app/home/_components/metric-card";
import { Toolbar } from "@/src/app/home/_components/toolbar";
import { FilterBar, type FilterOption } from "@/src/app/home/_components/filter-bar";
import { TableView } from "@/src/app/home/_components/table-view";
import { FormDialog, type FormField } from "@/src/app/home/_components/form-dialog";
import type { DashboardTableColumn } from "@/src/components/common/dashboard-data-table";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import { formatRange, normalizeRange } from "@/src/utils/dashboard-time";
import { homeApi } from "@/src/lib/home-api";
import { API_BASE_URL } from "@/src/lib/config";
import { getSupportWsUrl, type HomeSupportMessageRow, type HomeSupportTicketRow, type SupportSocketPayload } from "@/src/app/home/support/support-shared";

type UserSupportTicketRow = HomeSupportTicketRow & {
  customer_image_url?: string;
};

type SupportCustomer = {
  customer_id?: string;
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

interface ChatMessage {
  id: string;
  sender: "user" | "cskh";
  text: string;
  time: string;
  revoked?: boolean;
  deletedForMe?: boolean;
}

interface Ticket {
  id: string;
  dbId?: string;
  customerCode: string;
  customerName: string;
  customerPhone: string;
  customerImageUrl?: string;
  assignedName?: string;
  assignedAvatar?: string;
  topic: string;
  orderCode: string;
  priority: string;
  washDate: string;
  note: string;
  time: string;
  status: "Chưa xử lý" | "Đang xử lý" | "Đã giải quyết";
  type: string;
  messages: ChatMessage[];
}

const avatarColors = ["#0f766e", "#2563eb", "#7c3aed", "#db2777", "#d97706", "#dc2626"];

function getInitials(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "KH";
}

function getAvatarColor(name: string) {
  const hash = Array.from(name || "KH").reduce((total, char) => total + char.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

function formatTicketTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function parseTicketDate(value: string) {
  const [datePart = ""] = value.replace(",", "").split(/\s+/);
  const [day, month, year] = datePart.split("/").map(Number);
  const ticketDate = new Date(year, month - 1, day);
  return Number.isNaN(ticketDate.getTime()) ? null : ticketDate;
}

function formatReadableDate(dateStr?: string) {
  if (!dateStr) return "-";
  const value = dateStr.slice(0, 10);
  if (value.includes("/")) return value;
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
}

function mapUserTicket(row: UserSupportTicketRow): Ticket {
  const messages = (row.messages || []).map((message) => ({
    id: message.message_id,
    sender: message.sender_role === "customer" ? "user" as const : "cskh" as const,
    text: message.revoked ? "Tin nhắn đã được thu hồi" : message.content,
    time: formatTicketTime(message.created_at),
    revoked: message.revoked,
    deletedForMe: message.deleted_for_me,
  }));
  return {
    id: row.ticket_code,
    dbId: row.ticket_id,
    customerCode: row.customer_code || "-",
    customerName: row.customer_name || "Khách hàng",
    customerPhone: row.customer_phone || "",
    customerImageUrl: row.customer_image_url || "",
    assignedName: row.assigned_name || "Người phụ trách",
    assignedAvatar: row.assigned_avatar || "",
    topic: row.subject,
    orderCode: row.order_code || "Không có",
    priority: row.priority || "Trung bình",
    washDate: row.wash_date?.slice(0, 10) || "",
    note: row.note || row.subject || "",
    time: formatTicketTime(row.created_at),
    status: row.status || "Chưa xử lý",
    type: row.type,
    messages,
  };
}

const faqs = [
  { q: "Tôi có thể đổi lịch lấy đồ sau khi đặt không?", a: "Có thể đổi lịch trước giờ lấy đồ tối thiểu 2 tiếng qua mục Đặt lịch của tôi hoặc gọi trực tiếp tổng đài CSKH." },
  { q: "Giá cuối cùng được tính như thế nào?", a: "Giá được tính dựa trên cân nặng thực tế sau khi nhận đồ và phân loại tại quầy của nhân viên BegauShop." },
  { q: "Nếu thất luật hoặc hư hại đồ thì xử lý ra sao?", a: "BegauShop cam kết đền bù lên đến 10 lần giá trị gói giặt sấy đối với các sự cố thất lạc hoặc hư hại theo chính sách bảo hiểm." },
  { q: "Tôi có thể xuất hóa đơn điện tử không?", a: "Có, vui lòng chọn tùy chọn 'Yêu cầu hóa đơn GTGT' khi thanh toán hoặc cung cấp mã số thuế cho CSKH trong vòng 24h từ khi hoàn tất đơn." },
];

const defaultColumns: DashboardTableColumn[] = [
  { id: "id", label: "Mã", width: 120, visible: true },
  { id: "customerCode", label: "Mã KH", width: 120, visible: true },
  { id: "type", label: "Loại", width: 130, visible: true },
  { id: "customerName", label: "Khách hàng", width: 170, visible: true },
  { id: "customerPhone", label: "SĐT", width: 130, visible: true },
  { id: "orderCode", label: "Đơn", width: 130, visible: true },
  { id: "priority", label: "Ưu tiên", width: 120, visible: true },
  { id: "status", label: "Trạng thái", width: 130, visible: true },
  { id: "washDate", label: "Ngày giặt", width: 120, visible: true },
  { id: "time", label: "Ngày tạo", width: 150, visible: true },
  { id: "note", label: "Ghi chú", width: 240, visible: true },
  { id: "actions", label: "Thao tác", width: 150, visible: true },
];

function mergeDefaultColumns(savedColumns?: DashboardTableColumn[]) {
  if (!Array.isArray(savedColumns) || savedColumns.length === 0) return defaultColumns;
  const defaultById = new Map(defaultColumns.map((column) => [column.id, column]));
  const merged = savedColumns
    .filter((column) => defaultById.has(column.id))
    .map((column) => ({ ...defaultById.get(column.id), ...column }));
  defaultColumns.forEach((column) => {
    if (!merged.some((item) => item.id === column.id)) {
      merged.push(column);
    }
  });
  return merged;
}

type UserSupportLayout = {
  columns?: DashboardTableColumn[];
  tableResizeMode?: "fit" | "custom";
  pageSize?: number;
};

function loadSavedSupportLayout(): UserSupportLayout {
  if (typeof window === "undefined") return {};
  try {
    const layout = JSON.parse(localStorage.getItem("user_support_layout") || "{}") as UserSupportLayout;
    if (layout.columns) return layout;
  } catch {
    // Fall back to the legacy columns key below.
  }
  try {
    const columns = JSON.parse(localStorage.getItem("user_support_columns") || "");
    return { columns } as { columns?: DashboardTableColumn[] };
  } catch {
    return {};
  }
}

const statusOptions: FilterOption[] = [
  { id: "Tất cả", label: "Tất cả", color: "#64748b", bgColor: "rgba(100,116,139,0.09)" },
  { id: "Chưa xử lý", label: "Chưa xử lý", color: "#2563eb", bgColor: "rgba(37,99,235,0.09)" },
  { id: "Đang xử lý", label: "Đang xử lý", color: "#f59e0b", bgColor: "rgba(245,158,11,0.08)" },
  { id: "Đã giải quyết", label: "Đã giải quyết", color: "#10b981", bgColor: "rgba(16,185,129,0.08)" },
];

const checkboxClass =
  "relative size-4 appearance-none rounded-[5px] border border-slate-300 bg-white transition-all checked:border-emerald-300 checked:bg-emerald-300 after:absolute after:left-1/2 after:top-1/2 after:hidden after:h-[9px] after:w-[5px] after:-translate-x-1/2 after:-translate-y-[58%] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:content-[''] checked:after:block";

const statusStyle: Record<string, { color: string; bg: string }> = {
  "Chưa xử lý": { color: "#2563eb", bg: "rgba(37,99,235,0.09)" },
  "Đang xử lý": { color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  "Đã giải quyết": { color: "#10b981", bg: "rgba(16,185,129,0.08)" },
};

const priorityStyle: Record<string, { color: string; bg: string }> = {
  "Cao": { color: "#dc2626", bg: "rgba(220,38,38,0.09)" },
  "Trung bình": { color: "#d97706", bg: "rgba(217,119,6,0.09)" },
  "Thấp": { color: "#2563eb", bg: "rgba(37,99,235,0.09)" },
};

export default function UserSupportPage() {
  const range = useDashboardTimeRangeStore((state) => state.range);
  const normalizedRange = normalizeRange(range);
  const rangeLabel = formatRange(normalizedRange);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [supportOrders, setSupportOrders] = useState<Array<{ order_code: string; status: string; wash_date?: string }>>([]);
  const [columns, setColumns] = useState<DashboardTableColumn[]>(() => {
    const layout = loadSavedSupportLayout();
    return mergeDefaultColumns(layout.columns);
  });
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [tableResizeMode, setTableResizeMode] = useState<"fit" | "custom">(() => {
    const layout = loadSavedSupportLayout();
    return layout.tableResizeMode === "custom" ? "custom" : "fit";
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    const layout = loadSavedSupportLayout();
    return layout.pageSize && layout.pageSize > 0 ? layout.pageSize : 5;
  });
  const [customPageSize, setCustomPageSize] = useState("");
  const [openPageSizeMenu, setOpenPageSizeMenu] = useState(false);
  const [isLayoutLoaded, setIsLayoutLoaded] = useState(false);
  const accountColumnsConfigRef = useRef<Record<string, unknown>>({});

  // Modals
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [viewingTicketId, setViewingTicketId] = useState<string | null>(null);
  const [profileCustomer, setProfileCustomer] = useState<SupportCustomer | null>(null);

  // Form states
  const [supportForm, setSupportForm] = useState<Record<string, string>>({
    type: "Mất đồ",
    orderId: "",
    priority: "Cao",
    washDate: "",
    note: "",
  });

  // Chat conversation
  const [chatOpen, setChatOpen] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const supportWsRef = useRef<WebSocket | null>(null);
  const pendingSupportWsPayloadsRef = useRef<string[]>([]);
  const typingTimeoutRef = useRef<number | null>(null);
  const shouldStickUserChatToBottomRef = useRef(true);
  const currentUserIdRef = useRef("");
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const [visibleMessageCount, setVisibleMessageCount] = useState(30);

  const loadSupportData = useCallback((showError = false) => {
    Promise.all([
      homeApi<UserSupportTicketRow[]>("/support-tickets/full"),
      homeApi<Array<{ order_code: string; status: string; wash_date?: string }>>("/support-tickets/orders"),
    ])
      .then(([rows, orders]) => {
        setTickets(rows.map(mapUserTicket));
        setSupportOrders(orders);
      })
      .catch((error) => {
        setTickets([]);
        setSupportOrders([]);
        if (showError) {
          toast.error(error instanceof Error ? error.message : "Không thể tải yêu cầu hỗ trợ.");
        }
      });
  }, []);

  const sendSupportWsPayload = useCallback((payload: Record<string, unknown>) => {
    const socket = supportWsRef.current;
    const serializedPayload = JSON.stringify(payload);
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(serializedPayload);
      return true;
    }
    if (socket?.readyState === WebSocket.CONNECTING) {
      pendingSupportWsPayloadsRef.current.push(serializedPayload);
      return true;
    }
    return false;
  }, []);

  const flushPendingSupportWsPayloads = useCallback((socket: WebSocket) => {
    const pendingPayloads = pendingSupportWsPayloadsRef.current.splice(0);
    pendingPayloads.forEach((payload) => socket.send(payload));
  }, []);

  const appendSupportMessage = useCallback((ticketId: string, ticketCode: string | undefined, message: HomeSupportMessageRow) => {
    let found = false;
    setTickets((current) =>
      current.map((ticket) => {
        const matchesTicket = ticket.dbId === ticketId || ticket.id === ticketCode;
        if (!matchesTicket) return ticket;
        found = true;
        const nextMessage: ChatMessage = {
          id: message.message_id,
          sender: message.sender_role === "customer" ? "user" : "cskh",
          text: message.revoked ? "Tin nhắn đã được thu hồi" : message.content,
          time: formatTicketTime(message.created_at),
          revoked: message.revoked,
        };
        const exists = ticket.messages.some((item) =>
          item.id === nextMessage.id,
        );
        if (exists) return ticket;
        return {
          ...ticket,
          status: message.sender_role === "customer" ? "Chưa xử lý" : "Đang xử lý",
          messages: [...ticket.messages, nextMessage],
        };
      }),
    );
    return found;
  }, []);

  useEffect(() => {
    loadSupportData(true);
    const intervalId = window.setInterval(() => loadSupportData(false), 10000);
    return () => window.clearInterval(intervalId);
  }, [loadSupportData]);

  useEffect(() => {
    currentUserIdRef.current = localStorage.getItem("user_id") || "";
    const wsUrl = getSupportWsUrl("user");
    if (!wsUrl) return;
    const socket = new WebSocket(wsUrl);
    supportWsRef.current = socket;
    socket.onopen = () => flushPendingSupportWsPayloads(socket);
    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as SupportSocketPayload;
        if (payload.type === "support_message_created" && payload.ticket_id && payload.message) {
          const appended = appendSupportMessage(payload.ticket_id, payload.ticket_code, payload.message);
          if (!appended) loadSupportData(false);
          window.dispatchEvent(new Event("support-tickets-changed"));
          return;
        }
        if (payload.type === "support_message_updated") {
          loadSupportData(false);
          window.dispatchEvent(new Event("support-tickets-changed"));
          return;
        }
        if (payload.type === "support_typing") {
          const currentTicket = tickets.find((ticket) => ticket.id === activeTicketId);
          const matchesActiveTicket = payload.ticket_id && (payload.ticket_id === currentTicket?.dbId || payload.ticket_id === currentTicket?.id);
          const isAdminEvent = payload.sender_role === "staff";
          const isOwnEvent = payload.sender_id && payload.sender_id === currentUserIdRef.current;
          if (matchesActiveTicket && isAdminEvent && !isOwnEvent) {
            setIsAdminTyping(Boolean(payload.is_typing));
            if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
            if (payload.is_typing) {
              typingTimeoutRef.current = window.setTimeout(() => setIsAdminTyping(false), 1600);
            }
          }
          return;
        }
        if (payload.type === "support_error") {
          toast.error(typeof payload.error === "string" ? payload.error : "Không thể đồng bộ chat hỗ trợ.");
        }
      } catch {
        loadSupportData(false);
      }
    };
    socket.onclose = () => {
      if (supportWsRef.current === socket) supportWsRef.current = null;
    };
    return () => {
      if (supportWsRef.current === socket) supportWsRef.current = null;
      pendingSupportWsPayloadsRef.current = [];
      socket.close();
    };
  }, [activeTicketId, appendSupportMessage, flushPendingSupportWsPayloads, loadSupportData, tickets]);

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
        const layout = (parsed.userSupportLayout || {}) as {
          columns?: DashboardTableColumn[];
          tableResizeMode?: "fit" | "custom";
          pageSize?: number;
        };
        if (layout.columns) setColumns(mergeDefaultColumns(layout.columns));
        if (layout.tableResizeMode) setTableResizeMode(layout.tableResizeMode);
        if (layout.pageSize && layout.pageSize > 0) setPageSize(layout.pageSize);
      })
      .catch(() => undefined)
      .finally(() => setIsLayoutLoaded(true));
  }, []);

  useEffect(() => {
    const layout = { columns, tableResizeMode, pageSize };
    localStorage.setItem("user_support_columns", JSON.stringify(columns));
    localStorage.setItem("user_support_layout", JSON.stringify(layout));
    if (!isLayoutLoaded) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    const timeoutId = window.setTimeout(() => {
      const nextConfig = {
        ...accountColumnsConfigRef.current,
        userSupportLayout: layout,
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

  const activeTicket = useMemo(() => tickets.find((t) => t.id === activeTicketId) || null, [tickets, activeTicketId]);
  const allVisibleChatMessages = useMemo(
    () => activeTicket?.messages.filter((message) => !message.deletedForMe) || [],
    [activeTicket],
  );
  const visibleChatMessages = useMemo(
    () => allVisibleChatMessages.slice(-visibleMessageCount),
    [allVisibleChatMessages, visibleMessageCount],
  );

  useEffect(() => {
    setVisibleMessageCount(30);
    shouldStickUserChatToBottomRef.current = true;
  }, [activeTicketId]);

  useEffect(() => {
    if (!chatOpen) return;
    const scrollToBottom = () => {
      if (!shouldStickUserChatToBottomRef.current) return;
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
      messagesEndRef.current?.scrollIntoView({ block: "end" });
    };
    window.requestAnimationFrame(scrollToBottom);
  }, [chatOpen, activeTicketId, visibleChatMessages.length]);

  const filteredTickets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const matchesStatus = selectedStatus === "Tất cả" || ticket.status === selectedStatus;
      const matchesQuery =
        !normalizedQuery ||
        [ticket.id, ticket.customerCode, ticket.type, ticket.customerName, ticket.customerPhone, ticket.orderCode, ticket.priority, ticket.washDate, ticket.note, ticket.time, ticket.status]
          .filter(Boolean)
          .some((val) => String(val).toLowerCase().includes(normalizedQuery));

      const ticketDate = parseTicketDate(ticket.time);
      const matchRange = !ticketDate || (ticketDate >= normalizedRange.start && ticketDate <= normalizedRange.end);

      return matchesStatus && matchesQuery && matchRange;
    });
  }, [tickets, query, selectedStatus, normalizedRange.start, normalizedRange.end]);

  const pageCount = Math.max(1, Math.ceil(filteredTickets.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const paginatedTickets = filteredTickets.slice((safePage - 1) * pageSize, safePage * pageSize);
  const visibleIds = filteredTickets.map((t) => t.id);
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.has(id)).length;
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const totalVisibleWidth = columns.filter((col) => col.visible !== false).reduce((sum, col) => sum + (col.width || 150), 0);
  const createSupportFields = useMemo<FormField[]>(() => [
    { id: "type", label: "Loại hỗ trợ", type: "select", options: ["Mất đồ", "Giao trễ", "Hỏng đồ", "Thanh toán"], required: true },
    { id: "orderId", label: "Mã đơn", type: "select", options: supportOrders.map((order) => order.order_code), required: true, allowCustom: false },
    {
      id: "priority",
      label: "Độ ưu tiên",
      type: "select",
      options: ["Cao", "Trung bình", "Thấp"],
      optionDotColors: { "Cao": "#dc2626", "Trung bình": "#d97706", "Thấp": "#2563eb" },
      allowCustom: false,
    },
    { id: "note", label: "Nội dung phản ánh", type: "textarea", placeholder: "Ví dụ: Tôi bị mất áo trắng trong đơn này...", required: true },
  ], [supportOrders]);

  const viewSupportFields = useMemo<FormField[]>(() => [
    { id: "ticketCode", label: "Mã yêu cầu", type: "text", readOnly: true },
    { id: "customerCode", label: "Mã khách hàng", type: "text", readOnly: true },
    { id: "customerName", label: "Khách hàng", type: "text", readOnly: true },
    { id: "customerPhone", label: "Số điện thoại", type: "text", readOnly: true },
    { id: "type", label: "Loại hỗ trợ", type: "text", readOnly: true },
    { id: "orderId", label: "Mã đơn", type: "text", readOnly: true },
    { id: "priority", label: "Độ ưu tiên", type: "text", readOnly: true },
    { id: "status", label: "Trạng thái", type: "text", readOnly: true },
    { id: "washDate", label: "Ngày giặt", type: "text", readOnly: true },
    { id: "createdAt", label: "Ngày tạo", type: "text", readOnly: true },
    { id: "assignee", label: "Người phụ trách", type: "text", readOnly: true },
    { id: "note", label: "Nội dung phản ánh", type: "textarea", readOnly: true, className: "md:col-span-2" },
  ], []);

  const handleSupportFormChange = (nextForm: Record<string, string>) => {
    const selectedOrder = supportOrders.find((order) => order.order_code === nextForm.orderId);
    const orderChanged = nextForm.orderId !== supportForm.orderId;
    setSupportForm({
      ...nextForm,
      washDate: orderChanged ? selectedOrder?.wash_date?.slice(0, 10) || "" : supportForm.washDate || "",
    });
  };

  const toggleTicket = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const resetSupportForm = () => {
    setSupportForm({
      type: "Mất đồ",
      orderId: "",
      priority: "Cao",
      washDate: "",
      note: "",
    });
  };

  const openCreateSupportForm = () => {
    setViewingTicketId(null);
    resetSupportForm();
    setNewRequestOpen(true);
  };

  const openViewSupportForm = (ticket: Ticket) => {
    setViewingTicketId(ticket.id);
    setSupportForm({
      ticketCode: ticket.id,
      customerCode: ticket.customerCode || "-",
      customerName: ticket.customerName || "Khách hàng",
      customerPhone: ticket.customerPhone || "-",
      type: ticket.type || "Mất đồ",
      orderId: ticket.orderCode === "Không có" ? "" : ticket.orderCode,
      priority: ticket.priority || "Trung bình",
      status: ticket.status || "-",
      washDate: formatReadableDate(ticket.washDate),
      createdAt: ticket.time || "-",
      assignee: ticket.assignedName || "Người phụ trách",
      note: ticket.note || ticket.topic || "",
    });
    setNewRequestOpen(true);
  };

  const openCustomerProfile = async (ticket: Ticket) => {
    const fallbackCustomer: SupportCustomer = {
      customer_code: ticket.customerCode,
      full_name: ticket.customerName,
      phone: ticket.customerPhone,
      image_url: ticket.customerImageUrl,
      rank: "Thường",
    };
    setProfileCustomer(fallbackCustomer);
    if (!ticket.customerCode || ticket.customerCode === "-") return;

    try {
      const result = await homeApi<{ items: SupportCustomer[] }>(`/customers?q=${encodeURIComponent(ticket.customerCode)}&limit=5&include_count=false`);
      const matched = result.items.find((customer) => customer.customer_code === ticket.customerCode) || result.items[0];
      if (matched) setProfileCustomer(matched);
    } catch {
      // Keep the fallback profile from the ticket row.
    }
  };

  const submitRequest = async () => {
    if (viewingTicketId) return;
    const type = supportForm.type?.trim() || "";
    const orderCode = supportForm.orderId?.trim() || "";
    const priority = supportForm.priority?.trim() || "Cao";
    const washDate = supportForm.washDate?.trim() || "";
    const note = supportForm.note?.trim() || "";

    if (!type || !orderCode || !note) {
      toast.error("Vui lòng nhập đầy đủ các trường bắt buộc.");
      return;
    }

    let saved: HomeSupportTicketRow;
    try {
      const payload = {
        type,
        subject: note.slice(0, 200) || `${type} · ${orderCode}`,
        order_code: orderCode,
        priority,
        wash_date: washDate || null,
        note,
      };
      saved = await homeApi<HomeSupportTicketRow>("/support-tickets", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu yêu cầu hỗ trợ.");
      return;
    }
    const newTicket = mapUserTicket({
      ...saved,
      created_at: saved.created_at || new Date().toISOString(),
      messages: [{
        message_id: `${saved.ticket_id}-initial`,
        sender_role: "customer",
        sender_name: "Bạn",
        content: `Tôi là ${saved.customer_name || "Khách hàng"} mã ${saved.customer_code || "-"}, đây là tin nhắn của yêu cầu hỗ trợ ${saved.ticket_code} về đơn hàng ${orderCode} tôi phản ánh về việc ${type.toLowerCase()} của tôi: ${note}`,
        created_at: saved.created_at || new Date().toISOString(),
      }],
    });
    setTickets((prev) => [newTicket, ...prev]);
    setQuery("");
    setSelectedStatus("Tất cả");
    setPage(1);
    resetSupportForm();
    setViewingTicketId(null);
    setNewRequestOpen(false);
    toast.success(`Gửi yêu cầu thành công! Mã yêu cầu: ${newTicket.id}`);
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeTicketId) return;
    const userMsgText = replyText.trim();
    const ticket = tickets.find((item) => item.id === activeTicketId);
    if (!ticket) return;
    if (sendSupportWsPayload({
      type: "send_support_message",
      ticket_id: ticket.dbId || ticket.id,
      content: userMsgText,
    })) {
      setReplyText("");
      return;
    }
    try {
      const saved = await homeApi<{
        content: string;
        created_at: string;
      }>(`/support-tickets/${ticket.dbId || ticket.id}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: userMsgText }),
      });
      const timeStr = formatTicketTime(saved.created_at);

      setTickets((prev) =>
        prev.map((t) => {
          if (t.id === activeTicketId) {
            return {
              ...t,
              status: "Chưa xử lý",
              messages: [...t.messages, { id: `${Date.now()}`, sender: "user", text: saved.content, time: timeStr }],
            };
          }
          return t;
        })
      );
      setReplyText("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể gửi tin nhắn.");
    }
  };

  const handleRevokeReply = async (messageId: string) => {
    if (!activeTicketId || !messageId) return;
    if (sendSupportWsPayload({
      type: "update_support_message",
      message_id: messageId,
      action: "revoke",
    })) {
      return;
    }
    try {
      await homeApi(`/support-messages/${messageId}`, {
        method: "PUT",
        body: JSON.stringify({ action: "revoke" }),
      });
      loadSupportData(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể thu hồi tin nhắn lúc này.");
    }
  };

  const handleDeleteReply = (messageId: string) => {
    if (!activeTicketId || !messageId) return;
    if (sendSupportWsPayload({
      type: "update_support_message",
      message_id: messageId,
      action: "delete",
    })) {
      return;
    }
    void homeApi(`/support-messages/${messageId}`, {
      method: "PUT",
      body: JSON.stringify({ action: "delete" }),
    }).then(() => {
      loadSupportData(false);
    }).catch((error) => {
      toast.error(error instanceof Error ? error.message : "Không thể xóa tin nhắn lúc này.");
    });
  };

  useEffect(() => {
    if (!chatOpen || !activeTicket) return;
    const hasDraft = Boolean(replyText.trim());
    if (hasDraft) {
      sendSupportWsPayload({
        type: "support_typing",
        ticket_id: activeTicket.dbId || activeTicket.id,
        is_typing: true,
      });
    }
    const timeoutId = window.setTimeout(() => {
      sendSupportWsPayload({
        type: "support_typing",
        ticket_id: activeTicket.dbId || activeTicket.id,
        is_typing: false,
      });
    }, hasDraft ? 1200 : 0);
    return () => window.clearTimeout(timeoutId);
  }, [activeTicket, chatOpen, replyText, sendSupportWsPayload]);

  const deleteTicket = async (id: string) => {
    const ticket = tickets.find((item) => item.id === id);
    if (!ticket) return;
    try {
      await homeApi(`/support-tickets/${ticket.dbId || ticket.id}`, { method: "DELETE" });
      setTickets((prev) => prev.filter((item) => item.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success(`Đã xóa yêu cầu hỗ trợ ${id}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xóa yêu cầu.");
    }
  };

  const handleBulkClose = () => {
    const selectedActive = tickets.filter((t) => selectedIds.has(t.id) && t.status !== "Đã giải quyết");
    if (selectedActive.length === 0) {
      toast.error("Không có yêu cầu nào đang mở để đóng.");
      return;
    }
    void Promise.all(selectedActive.map((ticket) =>
      homeApi(`/support-tickets/${ticket.dbId || ticket.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "Đã giải quyết" }),
      })
    )).then(() => {
      setTickets((prev) => prev.map((ticket) => selectedIds.has(ticket.id) ? { ...ticket, status: "Đã giải quyết" } : ticket));
      toast.success(`Đã đóng thành công ${selectedActive.length} yêu cầu hỗ trợ.`);
      setSelectedIds(new Set());
    }).catch((error) => {
      toast.error(error instanceof Error ? error.message : "Không thể đóng các yêu cầu đã chọn.");
    });
  };

  const renderCell = (ticket: Ticket, column: DashboardTableColumn) => {
    if (column.id === "id") {
      return (
        <TableCell key={column.id} className="pl-4 font-medium text-slate-900">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className={`shrink-0 ${checkboxClass}`}
              checked={selectedIds.has(ticket.id)}
              onChange={() => toggleTicket(ticket.id)}
              onClick={(e) => e.stopPropagation()}
            />
            <span>{ticket.id}</span>
          </div>
        </TableCell>
      );
    }
    if (column.id === "type") {
      return (
        <TableCell key={column.id}>
          {ticket.type || "-"}
        </TableCell>
      );
    }
    if (column.id === "customerCode") {
      return (
        <TableCell key={column.id} className="font-medium text-slate-700">
          {ticket.customerCode || "-"}
        </TableCell>
      );
    }
    if (column.id === "customerName") {
      return (
        <TableCell key={column.id}>
          <div className="flex items-center gap-2.5">
            <Avatar size="sm" className="shrink-0">
              {ticket.customerImageUrl ? <AvatarImage src={ticket.customerImageUrl} alt={ticket.customerName} /> : null}
              <AvatarFallback
                className="text-[10px] font-semibold text-white"
                style={{ backgroundColor: getAvatarColor(ticket.customerName) }}
              >
                {getInitials(ticket.customerName)}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              className="truncate text-left text-slate-900 hover:text-slate-600"
              onClick={() => openCustomerProfile(ticket)}
            >
              {ticket.customerName || "-"}
            </button>
          </div>
        </TableCell>
      );
    }
    if (column.id === "customerPhone") {
      return (
        <TableCell key={column.id}>
          {ticket.customerPhone ? <a href={`tel:${ticket.customerPhone}`} className="text-slate-500 hover:text-slate-800">{ticket.customerPhone}</a> : "-"}
        </TableCell>
      );
    }
    if (column.id === "orderCode") {
      return (
        <TableCell key={column.id}>
          {ticket.orderCode !== "Không có" ? ticket.orderCode : <span className="text-slate-400">Không liên kết</span>}
        </TableCell>
      );
    }
    if (column.id === "priority") {
      const style = priorityStyle[ticket.priority] || priorityStyle["Trung bình"];
      return (
        <TableCell key={column.id}>
          <span
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium"
            style={{ color: style.color, backgroundColor: style.bg }}
          >
            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: style.color }} />
            <span>{ticket.priority || "Trung bình"}</span>
          </span>
        </TableCell>
      );
    }
    if (column.id === "washDate") {
      return (
        <TableCell key={column.id} className="text-slate-500">
          {ticket.washDate ? ticket.washDate.split("-").reverse().join("/") : "-"}
        </TableCell>
      );
    }
    if (column.id === "note") {
      return (
        <TableCell key={column.id} className="max-w-[240px] truncate text-slate-500" title={ticket.note}>
          {ticket.note || "-"}
        </TableCell>
      );
    }
    if (column.id === "time") {
      return (
        <TableCell key={column.id} className="text-slate-500">
          {ticket.time ? ticket.time.split(" ")[0] : "-"}
        </TableCell>
      );
    }
    if (column.id === "status") {
      const style = statusStyle[ticket.status] || { color: "#64748b", bg: "rgba(100,116,139,0.09)" };
      return (
        <TableCell key={column.id}>
          <span
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium"
            style={{ color: style.color, backgroundColor: style.bg }}
          >
            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: style.color }} />
            <span>{ticket.status}</span>
          </span>
        </TableCell>
      );
    }
    if (column.id === "actions") {
      return (
        <TableCell key={column.id} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => openViewSupportForm(ticket)}
              className="inline-flex h-7 items-center rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Xem
            </button>
            {ticket.status === "Đã giải quyết" && (
              <button
                type="button"
                onClick={() => deleteTicket(ticket.id)}
                className="inline-flex h-7 items-center rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                Xóa
              </button>
            )}
          </div>
        </TableCell>
      );
    }
    return (
      <TableCell key={column.id} className="text-slate-600 font-medium text-xs">
        {String(ticket[column.id as keyof Ticket] ?? "")}
      </TableCell>
    );
  };

  return (
    <PageShell fullHeight>
      <style jsx>{`
        @keyframes typing-bounce {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.45;
          }
          30% {
            transform: translateY(-3px);
            opacity: 1;
          }
        }
      `}</style>
      <div className="grid shrink-0 gap-3 md:grid-cols-4">
        <MetricCard
          title="Tổng yêu cầu"
          value={String(tickets.length)}
          hint="Lịch sử hỗ trợ"
          icon={TicketCheck}
          color="#3b82f6"
        />
        <MetricCard
          title="Đang xử lý"
          value={String(tickets.filter((t) => t.status === "Đang xử lý").length)}
          hint="Đang tiếp nhận giải quyết"
          icon={RotateCcw}
          color="#f59e0b"
        />
        <MetricCard
          title="Đã giải quyết"
          value={String(tickets.filter((t) => t.status === "Đã giải quyết").length)}
          hint="Đã đóng ticket"
          icon={MessageSquare}
          color="#10b981"
        />
        <button
          type="button"
          className="rounded-lg text-left transition-colors hover:bg-slate-50"
          onClick={() => {
            toast.success("Đang kết nối cuộc gọi thoại đến Hotline 1900 8989...");
          }}
        >
          <MetricCard
            title="Đường dây nóng"
            value="1900 8989"
            hint="Hotline hỗ trợ 24/7"
            icon={Phone}
            color="#ec4899"
          />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-white">
            <Toolbar
              leftContent={
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-900">Yêu cầu gần đây</h2>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                      {filteredTickets.length}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setFaqOpen(true)}
                    className="h-8 border-slate-200 text-xs gap-1.5 font-medium rounded-lg hover:bg-slate-50 shadow-sm"
                  >
                    <HelpCircle className="size-3.5" />
                    Trợ giúp & FAQ
                  </Button>
                </div>
              }
              query={query}
              onQueryChange={(val) => {
                setQuery(val);
                setPage(1);
              }}
              columns={columns}
              onColumnsChange={setColumns}
              tableResizeMode={tableResizeMode}
              onTableResizeModeChange={setTableResizeMode}
              selectedCount={selectedIds.size}
              onOpenAddColumn={() => toast.info("Bảng hỗ trợ sử dụng bộ cột cố định.")}
              onExport={() => toast.info("Không hỗ trợ xuất file cho Yêu cầu hỗ trợ.")}
              defaultExportFileName="support-tickets"
              onCreateClick={openCreateSupportForm}
              createLabel="Gửi yêu cầu"
              defaultColumnIds={defaultColumns.map((col) => col.id)}
              searchPlaceholder="Tìm mã yêu cầu, loại hỗ trợ, mã đơn..."
              showSearch={false}
              showAddColumnButton={false}
              showHistoryButton={false}
              onOpenHistory={() => {}}
            />
            <FilterBar
              rangeLabel={rangeLabel}
              selectedValue={selectedStatus}
              onValueChange={(val) => {
                setSelectedStatus(val);
                setPage(1);
              }}
              filterOptions={statusOptions}
              filterLabel="Bộ lọc trạng thái"
              allSelected={allVisibleSelected}
              disabled={visibleIds.length === 0}
              selectedCount={selectedVisibleCount}
              totalCount={visibleIds.length}
              itemLabel="yêu cầu"
              checkboxClass={checkboxClass}
              onToggleAll={toggleAll}
            />
            {filteredTickets.length === 0 ? (
              <div className="flex min-h-0 flex-1 items-center justify-center p-8 text-center">
                <p className="text-sm text-slate-400">Không tìm thấy yêu cầu hỗ trợ nào.</p>
              </div>
            ) : (
              <TableView
                columns={columns}
                rows={paginatedTickets}
                pageSize={pageSize}
                emptyMessage="Không tìm thấy yêu cầu hỗ trợ nào."
                tableResizeMode={tableResizeMode}
                totalVisibleWidth={totalVisibleWidth}
                renderCell={renderCell}
                page={safePage}
                pageCount={pageCount}
                totalRows={filteredTickets.length}
                totalLabel="Tổng yêu cầu"
                customPageSize={customPageSize}
                openPageSizeMenu={openPageSizeMenu}
                onOpenPageSizeMenuChange={setOpenPageSizeMenu}
                onCustomPageSizeChange={setCustomPageSize}
                onApplyCustomPageSize={() => {
                  const val = Number(customPageSize);
                  if (val > 0) {
                    setPageSize(val);
                    setPage(1);
                    setOpenPageSizeMenu(false);
                  }
                }}
                onUpdatePageSize={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
                onPageChange={setPage}
              />
            )}
        </div>
      </div>

      <FormDialog
        open={newRequestOpen}
        onClose={() => {
          setNewRequestOpen(false);
          setViewingTicketId(null);
          resetSupportForm();
        }}
        title={viewingTicketId ? `Xem yêu cầu ${viewingTicketId}` : "Gửi yêu cầu hỗ trợ mới"}
        fields={viewingTicketId ? viewSupportFields : createSupportFields}
        form={supportForm}
        onFormChange={handleSupportFormChange}
        onSave={viewingTicketId ? undefined : submitRequest}
        showCloseButton={false}
        showCloseButtonAtBottom={true}
        showSaveButton={!viewingTicketId}
        saveLabel="Gửi yêu cầu"
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
                  <Avatar className="shrink-0 after:border-slate-200" style={{ width: 40, height: 40 }}>
                    {profileCustomer.image_url ? <AvatarImage src={profileCustomer.image_url} alt={profileCustomer.full_name} /> : null}
                    <AvatarFallback
                      className="font-semibold leading-none text-white"
                      style={{ backgroundColor: getAvatarColor(profileCustomer.full_name), fontSize: 14 }}
                    >
                      {getInitials(profileCustomer.full_name)}
                    </AvatarFallback>
                  </Avatar>
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
                    [CalendarDays, "Ngày sinh", formatReadableDate(profileCustomer.birthday)],
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
                  className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-none hover:bg-slate-50"
                  onClick={() => setProfileCustomer(null)}
                >
                  Đóng
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Trợ Giúp & FAQ */}
      <Dialog open={faqOpen} onOpenChange={setFaqOpen}>
        <DialogContent className="max-w-[500px] gap-0 rounded-xl border border-slate-200 bg-white p-0 shadow-lg">
          <DialogHeader className="gap-2 px-5 pb-3 pt-5">
            <DialogTitle className="text-base font-semibold text-slate-900">Trợ giúp & Hỏi đáp (FAQ)</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Các thắc mắc thường gặp và thông tin liên lạc hỗ trợ nhanh.
            </DialogDescription>
          </DialogHeader>

          <div className="px-5 py-3 space-y-4 max-h-[380px] overflow-y-auto">
            {/* Contact channels inside Help Dialog */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 rounded-lg border border-slate-150 p-2.5 bg-slate-50/50">
                <Phone className="size-4.5 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-medium">Hotline CSKH</p>
                  <p className="text-xs font-bold text-slate-800">1900 8989</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-lg border border-slate-150 p-2.5 bg-slate-50/50">
                <MessageSquare className="size-4.5 text-indigo-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-medium">Zalo Official</p>
                  <p className="text-xs font-bold text-slate-800">BegauShop</p>
                </div>
              </div>
            </div>

            {/* FAQs List */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5">Câu hỏi thường gặp</p>
              {faqs.map((faq, idx) => (
                <div key={idx} className="space-y-1 rounded-lg border border-slate-100 p-3 bg-slate-50/20">
                  <p className="text-xs font-bold text-slate-800 flex items-start gap-1.5">
                    <span className="text-indigo-600 font-mono">Q:</span> {faq.q}
                  </p>
                  <p className="text-xs text-slate-600 pl-4 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="m-0 flex-row justify-end gap-2 rounded-b-xl border-t border-slate-100 bg-slate-50 px-4 py-3">
            <DialogClose asChild>
              <Button className="h-8 bg-slate-950 text-xs text-white hover:bg-slate-800">Đóng</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detailed Chat & Conversation Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent
          className="max-w-[500px] gap-0 rounded-xl border border-slate-200 bg-white p-0 shadow-2xl overflow-hidden"
          showCloseButton={false}
        >
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-lg bg-slate-900 text-white">
                <MessageSquare className="size-4.5" />
              </span>
              <div>
                <DialogTitle className="text-xs font-bold text-slate-900">Hội thoại CSKH {activeTicket?.id}</DialogTitle>
                <DialogDescription className="text-[10px] text-slate-400">Chủ đề: {activeTicket?.topic}</DialogDescription>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="grid size-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          <div
            ref={chatScrollRef}
            className="relative h-[280px] overflow-y-auto bg-slate-50/50 p-4 space-y-3.5"
            onScroll={(event) => {
              const target = event.currentTarget;
              const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
              shouldStickUserChatToBottomRef.current = distanceToBottom < 48;
            }}
          >
            {allVisibleChatMessages.length > visibleChatMessages.length ? (
              <div className="pb-1 text-center">
                <button
                  type="button"
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
                  onClick={() => setVisibleMessageCount((current) => current + 30)}
                >
                  Xem thêm tin nhắn cũ
                </button>
              </div>
            ) : null}
            {visibleChatMessages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div key={msg.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                  <div className="mb-1 flex items-center gap-2 px-1 text-[9px] text-slate-400">
                    <span>
                      {isUser ? "Bạn" : "Hỗ trợ khách hàng"} · {msg.time}
                    </span>
                    {isUser ? (
                      <>
                        {!msg.revoked && activeTicket?.status !== "Đã giải quyết" ? (
                          <button
                            type="button"
                            onClick={() => handleRevokeReply(msg.id)}
                            className="rounded px-1.5 py-0.5 text-[9px] font-medium text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
                          >
                            Thu hồi
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => handleDeleteReply(msg.id)}
                          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-medium text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
                        >
                          <Trash2 className="size-2.5" />
                          Xóa
                        </button>
                      </>
                    ) : null}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm ${
                      isUser
                        ? "bg-slate-900 text-white rounded-tr-none"
                        : "bg-white border border-slate-200/80 text-slate-800 rounded-tl-none"
                    } ${msg.revoked ? "!text-slate-400" : ""}`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
            {isAdminTyping ? (
              <div className="pointer-events-none absolute bottom-2 left-3 z-20 rounded-full bg-white px-2.5 py-1 text-left text-[11px] font-medium text-slate-500 shadow-md ring-1 ring-slate-200">
                đang soạn tin...
              </div>
            ) : null}
          </div>

          {activeTicket?.status !== "Đã giải quyết" ? (
            <div className="border-t border-slate-100 bg-white p-3 flex gap-2">
              <Input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendReply();
                }}
                placeholder="Nhập nội dung tin nhắn gửi CSKH..."
                className="h-9 flex-1 border-slate-200 text-xs rounded-lg"
              />
              <Button onClick={handleSendReply} className="h-9 bg-slate-950 hover:bg-slate-850 px-3.5 rounded-lg text-white">
                <Send className="size-3.5" />
              </Button>
            </div>
          ) : (
            <div className="border-t border-slate-100 bg-slate-100/50 p-4 text-center text-xs text-slate-400 font-medium">
              Yêu cầu hỗ trợ này đã được đóng lại. Không thể gửi thêm tin nhắn.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
