"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { getAreaToken, homeApi } from "@/src/lib/home-api";
import {
  Bell,
  CalendarDays,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Menu,
  MessageCircle,
  RotateCcw,
  X,
} from "lucide-react";
import { vi } from "date-fns/locale";
import { usePathname, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/src/lib/config";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import MemoPopover from "./memo-popover";
import NotificationsDialog from "./notifications-dialog";
import SupportChatBox, { type SupportChatConversation, type SupportChatMessage } from "./support-chat-box";
import { useNavbarStore } from "@/src/context/useNavbarStore";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import { uploadSupportChatImage } from "@/src/lib/support-chat-upload";
import {
  addDays,
  createRange,
  DateRange,
  dateFormatter,
  differenceInDays,
  formatRange,
  normalizeRange,
  RangeMode,
  rangeModes,
  shiftRange,
  startOfDay,
} from "@/src/utils/dashboard-time";

const pageTitles: Record<string, string> = {
  "/user": "Tổng quan",
  "/user/bookings": "Đặt lịch",
  "/user/orders": "Đơn của tôi",
  "/user/loyalty": "Ưu đãi",
  "/user/support": "Hỗ trợ",
};

type HeaderSupportMessage = {
  message_id: string;
  sender_role?: string;
  sender_avatar?: string;
  content?: string;
  image_url?: string;
  reply_to?: { id: string; sender: "customer" | "staff"; content: string };
  reaction?: string;
  revoked?: boolean;
  deleted_for_me?: boolean;
  created_at?: string;
};

type HeaderSupportTicket = {
  ticket_id: string;
  ticket_code: string;
  customer_name?: string;
  assigned_name?: string;
  assigned_avatar?: string;
  type?: string;
  subject?: string;
  order_code?: string;
  status?: string;
  messages?: HeaderSupportMessage[];
};

type HeaderSupportOrder = {
  order_code: string;
  status: string;
  wash_date?: string;
};

function formatChatTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function formatChatDateTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} ${date.toLocaleDateString("vi-VN")}`;
}

function UserTimeRangeControl() {
  const { range, setRange } = useDashboardTimeRangeStore();
  const normalizedRange = normalizeRange(range);
  const rangeLabel = formatRange(normalizedRange);
  const [open, setOpen] = useState(false);
  const [draftRange, setDraftRange] = useState<DateRange>(normalizedRange);
  const draftNormalizedRange = normalizeRange(draftRange);
  const draftRangeLabel = formatRange(draftNormalizedRange);
  const draftDayCount =
    differenceInDays(draftNormalizedRange.start, draftNormalizedRange.end) + 1;

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setDraftRange(normalizedRange);
    setOpen(nextOpen);
  };

  const handleModeChange = (mode: RangeMode) => {
    if (mode === "custom") {
      setDraftRange((current) => ({ ...current, mode: "custom" }));
      return;
    }

    setDraftRange(createRange(mode, draftNormalizedRange.start));
  };

  const setQuickRange = (days: number) => {
    const today = startOfDay(new Date());
    setDraftRange({
      mode: days === 1 ? "day" : "custom",
      start: addDays(today, 1 - days),
      end: today,
    });
  };

  const confirmRange = () => {
    setRange(draftNormalizedRange);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="flex h-8 min-w-[250px] shrink-0 gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-600 shadow-none transition-colors hover:bg-slate-50 hover:text-slate-800"
        >
          <CalendarDays className="size-4" />
          <span className="hidden whitespace-nowrap sm:inline">
            {rangeLabel}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="max-w-[min(92vw,560px)] gap-0 overflow-hidden rounded-2xl border-gray-200 bg-white p-0 shadow-2xl sm:max-w-[560px]"
      >
        <div className="flex items-start justify-between gap-3 border-b px-4 py-3">
          <div className="min-w-0">
            <DialogTitle className="text-base font-semibold">
              Bộ lọc thời gian
            </DialogTitle>
            <p className="truncate text-xs text-muted-foreground">
              Sẽ áp dụng {draftRangeLabel} · {draftDayCount} ngày dữ liệu
            </p>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setDraftRange(shiftRange(draftNormalizedRange, -1))}
              aria-label="Kỳ trước"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() =>
                setDraftRange(createRange(draftNormalizedRange.mode === "custom" ? "day" : draftNormalizedRange.mode))
              }
              aria-label="Hiện tại"
            >
              <RotateCcw className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setDraftRange(shiftRange(draftNormalizedRange, 1))}
              aria-label="Kỳ sau"
            >
              <ChevronRight className="size-4" />
            </Button>
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg border border-transparent text-muted-foreground hover:border-gray-200 hover:bg-gray-100 hover:text-black"
                aria-label="Đóng bộ lọc thời gian"
              >
                <X className="size-4" />
              </Button>
            </DialogClose>
          </div>
        </div>

        <div className="space-y-3 bg-gray-50/60 p-4">
          <div className="flex overflow-x-auto rounded-lg border bg-background p-1">
            {rangeModes.map((mode) => (
              <Button
                key={mode.value}
                type="button"
                variant={draftNormalizedRange.mode === mode.value ? "default" : "ghost"}
                size="sm"
                className={`shrink-0 ${draftNormalizedRange.mode === mode.value ? "bg-neutral-900 text-white" : ""}`}
                onClick={() => handleModeChange(mode.value)}
              >
                {mode.label}
              </Button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Từ ngày
              </span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full justify-start gap-2 rounded-lg bg-background px-3 text-left font-normal"
                  >
                    <CalendarDays className="size-4 text-muted-foreground" />
                    <span className="truncate">
                      {dateFormatter.format(draftNormalizedRange.start)}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="z-[2101] w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={draftNormalizedRange.start}
                    onSelect={(selected) => {
                      if (!selected) return;
                      setDraftRange((current) =>
                        normalizeRange({
                          ...current,
                          mode: "custom",
                          start: selected,
                        }),
                      );
                    }}
                    locale={vi}
                    className="[--cell-size:2.35rem]"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Đến ngày
              </span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full justify-start gap-2 rounded-lg bg-background px-3 text-left font-normal"
                  >
                    <CalendarDays className="size-4 text-muted-foreground" />
                    <span className="truncate">
                      {dateFormatter.format(draftNormalizedRange.end)}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="z-[2101] w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={draftNormalizedRange.end}
                    onSelect={(selected) => {
                      if (!selected) return;
                      setDraftRange((current) =>
                        normalizeRange({
                          ...current,
                          mode: "custom",
                          end: selected,
                        }),
                      );
                    }}
                    locale={vi}
                    className="[--cell-size:2.35rem]"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              ["Hôm nay", 1],
              ["7 ngày", 7],
              ["30 ngày", 30],
            ].map(([label, days]) => (
              <Button
                key={label}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickRange(Number(days))}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t bg-white px-4 py-3">
          <DialogClose asChild>
            <Button type="button" variant="outline" size="sm">
              Hủy
            </Button>
          </DialogClose>
          <Button
            type="button"
            size="sm"
            className="bg-neutral-900 text-white hover:bg-neutral-800"
            onClick={confirmRange}
          >
            Xác nhận
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function UserSearch() {
  const { toggle } = useNavbarStore();
  const router = useRouter();
  const pathname = usePathname();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [supportTickets, setSupportTickets] = useState<HeaderSupportTicket[]>([]);
  const [supportOrders, setSupportOrders] = useState<HeaderSupportOrder[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const currentUserIdRef = useRef("");
  const supportWsRef = useRef<WebSocket | null>(null);
  const pendingSupportWsPayloadsRef = useRef<string[]>([]);
  const typingTimeoutRef = useRef<number | null>(null);
  const [isAdminTyping, setIsAdminTyping] = useState(false);

  const loadMessageCount = useCallback(() => {
    Promise.allSettled([
      homeApi<Array<{ status?: string }>>("/support-tickets/full", { cache: "no-store" }),
      homeApi<{ appointments?: unknown[] }>("/dashboard/overview", { cache: "no-store" }),
    ]).then(([ticketResult, overviewResult]) => {
      const openTickets = ticketResult.status === "fulfilled"
        ? ticketResult.value.filter((ticket) => ticket.status !== "Đã giải quyết").length
        : 0;
      const appointments = overviewResult.status === "fulfilled"
        ? overviewResult.value.appointments?.length || 0
        : 0;
      setMessageCount(openTickets);
      setNotificationCount(openTickets + appointments);
    });
  }, []);

  const loadSupportChat = useCallback(async () => {
    const [tickets, orders] = await Promise.all([
      homeApi<HeaderSupportTicket[]>("/support-tickets/full", { cache: "no-store" }),
      homeApi<HeaderSupportOrder[]>("/support-tickets/orders", { cache: "no-store" }),
    ]);
    setSupportTickets(tickets);
    setSupportOrders(orders);
    return { tickets, orders };
  }, []);

  const getSupportWsUrl = useCallback(() => {
    const token = getAreaToken("user");
    if (!token) return "";
    const wsBase = API_BASE_URL.replace(/^https:/, "wss:").replace(/^http:/, "ws:");
    return `${wsBase}/api/home/ws/support-chat?token=${encodeURIComponent(token)}`;
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

  const sendSupportWsMessage = useCallback((ticketId: string, content: string, replyTo?: SupportChatMessage | null) => (
    sendSupportWsPayload({
      type: "send_support_message",
      ticket_id: ticketId,
      content,
      reply_to: replyTo
        ? {
            id: replyTo.id,
            sender: replyTo.sender,
            content: replyTo.imageUrl ? "Ảnh" : replyTo.content,
        }
        : undefined,
    })
  ), [sendSupportWsPayload]);

  const sendSupportWsMessageUpdate = useCallback((messageId: string, action: "react" | "revoke", reaction?: string) => {
    return sendSupportWsPayload({
      type: "update_support_message",
      message_id: messageId,
      action,
      reaction,
    });
  }, [sendSupportWsPayload]);

  const sendSupportTyping = useCallback((ticketId: string, isTyping: boolean) => {
    return sendSupportWsPayload({
      type: "support_typing",
      ticket_id: ticketId,
      is_typing: isTyping,
    });
  }, [sendSupportWsPayload]);

  const appendSupportMessage = useCallback((ticketId: string, message: HeaderSupportMessage) => {
    let found = false;
    setSupportTickets((current) =>
      current.map((ticket) => {
        if (ticket.ticket_id !== ticketId) return ticket;
        found = true;
        if ((ticket.messages || []).some((item) => item.message_id === message.message_id)) return ticket;
        const withoutMatchingLocal = (ticket.messages || []).filter((item) =>
          !item.message_id.startsWith("local-")
          || item.content !== message.content
          || item.sender_role !== message.sender_role,
        );
        return { ...ticket, status: "Chưa xử lý", messages: [...withoutMatchingLocal, message] };
      }),
    );
    return found;
  }, []);

  const updateSupportMessage = useCallback((ticketId: string, message: HeaderSupportMessage) => {
    let found = false;
    setSupportTickets((current) =>
      current.map((ticket) => {
        if (ticket.ticket_id !== ticketId) return ticket;
        found = true;
        return {
          ...ticket,
          messages: (ticket.messages || []).map((item) =>
            item.message_id === message.message_id ? { ...item, ...message } : item,
          ),
        };
      }),
    );
    return found;
  }, []);

  useEffect(() => {
    loadMessageCount();
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") loadMessageCount();
    };
    const handleRefreshEvents = () => {
      loadMessageCount();
    };
    window.addEventListener("focus", loadMessageCount);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("orders:created", handleRefreshEvents);
    window.addEventListener("booking-request:created", handleRefreshEvents);
    window.addEventListener("booking-requests-changed", handleRefreshEvents);
    window.addEventListener("home-orders-changed", handleRefreshEvents);
    window.addEventListener("support-tickets-changed", handleRefreshEvents);
    return () => {
      window.removeEventListener("focus", loadMessageCount);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("orders:created", handleRefreshEvents);
      window.removeEventListener("booking-request:created", handleRefreshEvents);
      window.removeEventListener("booking-requests-changed", handleRefreshEvents);
      window.removeEventListener("home-orders-changed", handleRefreshEvents);
      window.removeEventListener("support-tickets-changed", handleRefreshEvents);
    };
  }, [loadMessageCount]);

  useEffect(() => {
    currentUserIdRef.current = localStorage.getItem("user_id") || "";
    const wsUrl = getSupportWsUrl();
    if (!wsUrl) return;
    const socket = new WebSocket(wsUrl);
    supportWsRef.current = socket;
    socket.onopen = () => flushPendingSupportWsPayloads(socket);
    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as {
          type?: string;
          ticket_id?: string;
          message?: HeaderSupportMessage;
          sender_role?: "customer" | "staff";
          is_typing?: boolean;
          sender_id?: string;
        };
        if (payload.type === "support_message_created") {
          if (payload.ticket_id && payload.message) {
            const appended = appendSupportMessage(payload.ticket_id, payload.message);
            if (!appended && messagesOpen) void loadSupportChat();
          }
          loadMessageCount();
          window.dispatchEvent(new Event("support-tickets-changed"));
        }
        if (payload.type === "support_message_updated") {
          if (messagesOpen) void loadSupportChat();
          window.dispatchEvent(new Event("support-tickets-changed"));
        }
        const isOwnEvent = payload.sender_id && payload.sender_id === currentUserIdRef.current;
        if (payload.type === "support_typing" && payload.sender_role === "staff" && payload.ticket_id === activeTicketId && !isOwnEvent) {
          setIsAdminTyping(Boolean(payload.is_typing));
          if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
          if (payload.is_typing) {
            typingTimeoutRef.current = window.setTimeout(() => setIsAdminTyping(false), 1600);
          }
        }
      } catch {
        loadMessageCount();
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
  }, [activeTicketId, appendSupportMessage, flushPendingSupportWsPayloads, getSupportWsUrl, loadMessageCount, loadSupportChat, messagesOpen, updateSupportMessage]);

  const title = pageTitles[pathname] ?? "Khu vực khách hàng";
  const activeTicket = useMemo(() => {
    return supportTickets.find((ticket) => ticket.ticket_id === activeTicketId)
      || supportTickets.find((ticket) => ticket.status !== "Đã giải quyết")
      || supportTickets[0]
      || null;
  }, [activeTicketId, supportTickets]);
  const activeConversation = useMemo<SupportChatConversation | null>(() => {
    if (supportTickets.length === 0) return null;
    const latestTicket = activeTicket || supportTickets[0];
    const allMessages = supportTickets
      .flatMap((ticket) => (ticket.messages || []).map((message): SupportChatMessage => ({
        id: message.message_id,
        sender: message.sender_role === "staff" ? "staff" : "customer",
        content: message.revoked ? "Tin nhắn đã được thu hồi" : (message.content || ""),
        avatarUrl: message.sender_role === "staff"
          ? (message.sender_avatar || ticket.assigned_avatar || latestTicket.assigned_avatar || "")
          : (message.sender_avatar || ""),
        imageUrl: message.image_url,
        replyTo: message.reply_to,
        reaction: message.reaction,
        revoked: message.revoked,
        deletedForMe: message.deleted_for_me,
        timestamp: message.created_at,
        time: message.created_at
          ? new Date(message.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
          : "",
      })))
      .sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());
    return {
      id: "user-support-history",
      name: latestTicket.assigned_name || "Người phụ trách",
      avatarUrl: latestTicket.assigned_avatar || "",
      ticketCode: supportTickets.map((ticket) => ticket.ticket_code).join(", "),
      orderCode: latestTicket.order_code,
      messages: allMessages,
    };
  }, [activeTicket, supportTickets]);

  useEffect(() => {
    if (!messagesOpen) return;
    const intervalId = window.setInterval(() => {
      void loadSupportChat();
    }, 30000);
    return () => window.clearInterval(intervalId);
  }, [loadSupportChat, messagesOpen]);

  const openSupportChat = async () => {
    setMessagesOpen(true);
    try {
      const { tickets, orders } = await loadSupportChat();
      const existingTicket = tickets.find((ticket) => ticket.status !== "Đã giải quyết");
      if (existingTicket) {
        setActiveTicketId(existingTicket.ticket_id);
        return;
      }

      setSupportOrders(orders);
      setActiveTicketId(tickets[0]?.ticket_id || null);
    } catch {
      setSupportTickets([]);
    }
  };

  const sendSupportMessage = async (messageContent: string, replyTo?: SupportChatMessage | null) => {
    const content = messageContent.trim();
    if (!content || !activeTicket) return;
    const optimisticMessage: HeaderSupportMessage = {
      message_id: `local-${Date.now()}`,
      sender_role: "customer",
      content,
      reply_to: replyTo
        ? {
            id: replyTo.id,
            sender: replyTo.sender,
            content: replyTo.imageUrl ? "Ảnh" : replyTo.content,
          }
        : undefined,
      created_at: new Date().toISOString(),
    };
    appendSupportMessage(activeTicket.ticket_id, optimisticMessage);
    try {
      const sentByWs = sendSupportWsMessage(activeTicket.ticket_id, content, replyTo);
      if (!sentByWs) {
        throw new Error("Support chat websocket is not ready.");
      }
      window.dispatchEvent(new Event("support-tickets-changed"));
    } catch {
      setSupportTickets((current) =>
        current.map((ticket) =>
          ticket.ticket_id === activeTicket.ticket_id
            ? { ...ticket, messages: (ticket.messages || []).filter((item) => item.message_id !== optimisticMessage.message_id) }
            : ticket,
        ),
      );
    }
  };

  const sendSupportImage = async (file: File, replyTo?: SupportChatMessage | null) => {
    if (!activeTicket) return;
    const optimisticMessage: HeaderSupportMessage = {
      message_id: `local-image-${Date.now()}`,
      sender_role: "customer",
      content: "",
      image_url: "",
      reply_to: replyTo
        ? {
            id: replyTo.id,
            sender: replyTo.sender,
            content: replyTo.imageUrl ? "Ảnh" : replyTo.content,
          }
        : undefined,
      created_at: new Date().toISOString(),
    };

    try {
      const uploadResult = await uploadSupportChatImage(file, "user");
      optimisticMessage.image_url = uploadResult.image_url;
      appendSupportMessage(activeTicket.ticket_id, optimisticMessage);

      const sentByWs = sendSupportWsPayload({
        type: "send_support_message",
        ticket_id: activeTicket.ticket_id,
        content: "",
        image_url: optimisticMessage.image_url,
        reply_to: optimisticMessage.reply_to,
      });
      if (!sentByWs) {
        throw new Error("Support chat websocket is not ready.");
      }
      window.dispatchEvent(new Event("support-tickets-changed"));
    } catch {
      setSupportTickets((current) =>
        current.map((ticket) =>
          ticket.ticket_id === activeTicket.ticket_id
            ? { ...ticket, messages: (ticket.messages || []).filter((item) => item.message_id !== optimisticMessage.message_id) }
            : ticket,
        ),
      );
    }
  };

  const reactToSupportMessage = async (message: SupportChatMessage, reaction: string) => {
    if (!sendSupportWsMessageUpdate(message.id, "react", reaction)) {
      console.error("Support chat websocket is not ready.");
    }
  };

  const revokeSupportMessage = async (message: SupportChatMessage) => {
    if (!sendSupportWsMessageUpdate(message.id, "revoke")) {
      console.error("Support chat websocket is not ready.");
    }
  };

  const deleteSupportMessage = async (message: SupportChatMessage) => {
    if (!sendSupportWsPayload({
      type: "update_support_message",
      message_id: message.id,
      action: "delete",
    })) {
      try {
        await homeApi(`/support-messages/${message.id}`, {
          method: "PUT",
          body: JSON.stringify({ action: "delete" }),
        });
        await loadSupportChat();
      } catch {
        console.error("Không thể xóa tin nhắn hỗ trợ.");
      }
    }
  };

  return (
    <>
      <div className="relative z-[1000] min-h-12 border-b border-slate-200 bg-white px-5">
        <div className="flex min-h-12 min-w-0 items-center gap-2">
          <button
            type="button"
            aria-label="Mở menu"
            className="flex size-10 cursor-pointer items-center justify-center rounded-lg text-black transition-colors hover:bg-[#f3f3f3] xl:hidden"
            onClick={toggle}
          >
            <Menu size={24} strokeWidth={1.7} />
          </button>

          <div className="hidden items-center gap-1.5 text-sm font-medium text-slate-400 md:flex">
            <ChevronRight className="size-4 text-slate-400" />
            <span className="font-semibold text-slate-800">{title}</span>
          </div>

          <div className="ml-auto" />

          <UserTimeRangeControl />
          <Button
            variant="ghost"
            className="hidden h-8 shrink-0 gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-600 shadow-none transition-colors hover:bg-slate-50 hover:text-slate-800 md:flex"
            onClick={openSupportChat}
          >
            <MessageCircle className="size-4" />
            <span>{messageCount}</span>
          </Button>
          <Button
            variant="ghost"
            className="hidden h-8 shrink-0 gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-600 shadow-none transition-colors hover:bg-slate-50 hover:text-slate-800 md:flex"
            onClick={() => setNotificationsOpen(true)}
          >
            <Bell className="size-4" />
            <span>{notificationCount}</span>
          </Button>
          <MemoPopover className="hidden h-8 shrink-0 gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-600 shadow-none transition-colors hover:bg-slate-50 hover:text-slate-800 md:flex" />
          <Button
            className="hidden h-8 shrink-0 gap-1.5 rounded-md bg-slate-900 px-3 text-xs font-medium text-white transition-colors hover:bg-slate-800 sm:flex"
            onClick={() => router.push("/user/bookings")}
          >
            <CalendarPlus className="size-4" />
            Đặt lịch
          </Button>
        </div>
      </div>
      {messagesOpen && (
        <SupportChatBox
          conversation={activeConversation}
          currentSender="customer"
          fallbackName="Admin hỗ trợ"
          emptyMessage="Chưa có đơn hàng để tạo cuộc trò chuyện với admin."
          disabled={!activeTicket}
          disabledPlaceholder="Không thể gửi tin nhắn"
          showMeta={false}
          typingLabel={isAdminTyping ? "đang soạn tin..." : null}
          onClose={() => setMessagesOpen(false)}
          onSendMessage={(content, replyTo) => sendSupportMessage(content, replyTo)}
          onSendImage={(file, replyTo) => sendSupportImage(file, replyTo)}
          onReactMessage={reactToSupportMessage}
          onRevokeMessage={revokeSupportMessage}
          onDeleteMessage={deleteSupportMessage}
          onTypingChange={(isTyping) => activeTicket && sendSupportTyping(activeTicket.ticket_id, isTyping)}
        />
      )}
      <NotificationsDialog
        isUserArea
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
    </>
  );
}
