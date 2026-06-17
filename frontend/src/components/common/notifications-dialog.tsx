"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  CalendarClock,
  Copy,
  Headphones,
  Image,
  Maximize2,
  Reply,
  RotateCcw,
  Search,
  Send,
  Smile,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import EmojiPicker, { type EmojiClickData, Theme } from "emoji-picker-react";
import { getAreaToken, homeApi } from "@/src/lib/home-api";
import { API_BASE_URL } from "@/src/lib/config";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormDialog, type FormField } from "@/src/app/home/_components/form-dialog";
import SupportChatBox, { type SupportChatMessage } from "./support-chat-box";

type NotificationsDialogProps = {
  isUserArea: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "notifications" | "messages";
};

type Appointment = {
  booking_id: string;
  booking_code: string;
  customer_name: string;
  service_name: string;
  appointment_time: string;
  date_label: string;
  appointment_type: string;
  status?: string;
  wash_date?: string;
  due_at?: string;
};

type SupportTicket = {
  ticket_id: string;
  ticket_code: string;
  subject?: string;
  type?: string;
  customer_name?: string;
  customer_code?: string;
  customer_image_url?: string;
  order_code?: string;
  assigned_name?: string;
  assigned_avatar?: string;
  note?: string;
  status?: string;
  created_at?: string;
  messages?: Array<{
    message_id: string;
    sender_role?: "customer" | "staff";
    sender_name?: string;
    sender_avatar?: string;
    content?: string;
    image_url?: string;
    reply_to?: { id: string; sender: "customer" | "staff"; content: string };
    reaction?: string;
    revoked?: boolean;
    created_at?: string;
  }>;
};

type NotificationItem = {
  id: string;
  kind: "appointment" | "support";
  title: string;
  description: string;
  time: string;
  href: string;
  bookingId?: string;
};

type Conversation = {
  id: string;
  ticketId: string;
  name: string;
  avatarUrl?: string;
  preview: string;
  time: string;
  ticketCode: string;
  messages: Array<{
    id: string;
    sender: "customer" | "staff";
    content: string;
    time: string;
    timestamp?: string;
    avatarUrl?: string;
    imageUrl?: string;
    replyTo?: { id: string; sender: "customer" | "staff"; content: string };
    reaction?: string;
    revoked?: boolean;
    deletedForMe?: boolean;
  }>;
};

type ChatMessage = Conversation["messages"][number];
const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "😡"];
const bookingDecisionStatusOptions = ["Đã được duyệt", "Không được duyệt"];
const bookingDecisionStatusColors: Record<string, string> = {
  "Đã được duyệt": "#10b981",
  "Không được duyệt": "#ef4444",
};

function formatTicketTime(value?: string) {
  if (!value) return "Vừa tạo";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Vừa tạo";
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function isJunkSupportTicket(ticket: SupportTicket) {
  const text = `${ticket.subject || ""} ${ticket.note || ""} ${ticket.type || ""}`.toLocaleLowerCase("vi");
  if (text.includes("trao đổi với admin") || text.includes("bắt đầu cuộc trò chuyện với admin")) return true;
  const customerMessages = ticket.messages?.filter((message) => message.sender_role === "customer") || [];
  if (customerMessages.length === 0) return true;
  if (!customerMessages.some((message) =>
    (message.content || "").toLocaleLowerCase("vi").includes("đây là tin nhắn của yêu cầu hỗ trợ"),
  )) {
    return true;
  }
  return customerMessages.every((message) =>
    (message.content || "").toLocaleLowerCase("vi").includes("bắt đầu cuộc trò chuyện với admin"),
  );
}

function formatAppointmentTime(item: Appointment) {
  if (item.due_at) {
    const date = new Date(item.due_at);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  }
  if (item.wash_date) {
    const date = new Date(`${item.wash_date}T00:00:00`);
    if (!Number.isNaN(date.getTime())) {
      const day = date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return `${item.appointment_time || "--:--"} - ${day}`;
    }
  }
  return item.appointment_time || "Vừa tạo";
}

export default function NotificationsDialog({
  isUserArea,
  open,
  onOpenChange,
  mode = "notifications",
}: NotificationsDialogProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const messageTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [messageQuery, setMessageQuery] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [actionMessage, setActionMessage] = useState<ChatMessage | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [messageInputExpanded, setMessageInputExpanded] = useState(false);
  const [localMessages, setLocalMessages] = useState<Record<string, ChatMessage[]>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const supportWsRef = useRef<WebSocket | null>(null);
  const pendingSupportWsPayloadsRef = useRef<string[]>([]);

  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isLoadingBooking, setIsLoadingBooking] = useState(false);
  const [isUpdatingBooking, setIsUpdatingBooking] = useState(false);
  const [bookingDecisionForm, setBookingDecisionForm] = useState<Record<string, string>>({
    status: "Đã được duyệt",
  });
  const bookingDecisionLocked = Boolean(
    selectedBooking && selectedBooking.status && selectedBooking.status !== "Chờ xử lý",
  );

  useEffect(() => {
    if (!selectedBooking) {
      setBookingDecisionForm({ status: "Đã được duyệt" });
      return;
    }

    const dueTime = selectedBooking.due_at
      ? selectedBooking.due_at.split("T")[1]?.substring(0, 5) || ""
      : "";

    setBookingDecisionForm({
      bookingCode: selectedBooking.booking_code || "",
      customerName: selectedBooking.customer_name || "",
      customerPhone: selectedBooking.customer_phone || "-",
      pickupAddress: selectedBooking.pickup_address || "-",
      serviceName: selectedBooking.service_name || "",
      quantity: `${selectedBooking.quantity || 0} ${selectedBooking.extra_fields?.serviceUnit || ""}`.trim() || "-",
      washDate: selectedBooking.wash_date || "-",
      dueTime: dueTime || "-",
      totalAmount: `${Number(selectedBooking.total_amount || 0).toLocaleString("vi-VN")}đ`,
      note: selectedBooking.note || "-",
      status: selectedBooking.status === "Không được duyệt" ? "Không được duyệt" : "Đã được duyệt",
    });
  }, [selectedBooking]);

  const bookingApprovalFields = useMemo<FormField[]>(
    () => [
      { id: "bookingCode", label: "Mã lịch", type: "text", readOnly: true },
      { id: "customerName", label: "Khách hàng", type: "text", readOnly: true },
      { id: "customerPhone", label: "Số điện thoại", type: "text", readOnly: true },
      { id: "pickupAddress", label: "Địa chỉ", type: "text", readOnly: true },
      { id: "serviceName", label: "Dịch vụ", type: "text", readOnly: true },
      { id: "quantity", label: "Số lượng", type: "text", readOnly: true },
      { id: "washDate", label: "Ngày giao", type: "text", readOnly: true },
      { id: "dueTime", label: "Giờ giao", type: "text", readOnly: true },
      { id: "totalAmount", label: "Thành tiền", type: "text", readOnly: true },
      { id: "status", label: "Trạng thái duyệt", type: bookingDecisionLocked ? "text" : "custom_status", readOnly: bookingDecisionLocked },
      { id: "note", label: "Ghi chú", type: "textarea", readOnly: true, className: "md:col-span-2" },
    ],
    [bookingDecisionLocked],
  );

  const refreshData = useCallback(() => {
    Promise.allSettled([
      homeApi<{ appointments?: Appointment[] }>("/dashboard/overview", { cache: "no-store" }),
      homeApi<SupportTicket[]>("/support-tickets/full", { cache: "no-store" }),
    ]).then(([overviewResult, ticketResult]) => {
      setAppointments(overviewResult.status === "fulfilled" ? overviewResult.value.appointments || [] : []);
      setTickets(
        ticketResult.status === "fulfilled"
          ? ticketResult.value.filter((ticket) => ticket.status !== "Đã giải quyết" && !isJunkSupportTicket(ticket))
          : [],
      );
    });
  }, []);

  const getSupportWsUrl = useCallback(() => {
    const token = getAreaToken(isUserArea ? "user" : "admin");
    if (!token) return "";
    const wsBase = API_BASE_URL.replace(/^https:/, "wss:").replace(/^http:/, "ws:");
    return `${wsBase}/api/home/ws/support-chat?token=${encodeURIComponent(token)}`;
  }, [isUserArea]);

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

  const sendSupportWsMessage = useCallback((ticketId: string, content: string, replyTo?: SupportChatMessage | ChatMessage | null) => (
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

  const appendSupportMessage = useCallback((ticketId: string, message: NonNullable<SupportTicket["messages"]>[number]) => {
    let found = false;
    setTickets((current) =>
      current.map((ticket) => {
        if (ticket.ticket_id !== ticketId) return ticket;
        found = true;
        if ((ticket.messages || []).some((item) => item.message_id === message.message_id)) return ticket;
        return { ...ticket, status: message.sender_role === "customer" ? "Chưa xử lý" : ticket.status, messages: [...(ticket.messages || []), message] };
      }),
    );
    setLocalMessages({});
    return found;
  }, []);

  const updateSupportMessage = useCallback((ticketId: string, message: NonNullable<SupportTicket["messages"]>[number]) => {
    let found = false;
    setTickets((current) =>
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
    setLocalMessages({});
    return found;
  }, []);

  useEffect(() => {
    try {
      setReadIds(new Set(JSON.parse(localStorage.getItem("header-notification-read-ids") || "[]")));
    } catch {
      setReadIds(new Set());
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    refreshData();
  }, [open, refreshData]);

  useEffect(() => {
    if (!open) return;
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
          message?: NonNullable<SupportTicket["messages"]>[number];
        };
        if (payload.type === "support_message_created") {
          if (payload.ticket_id && payload.message) {
            const appended = appendSupportMessage(payload.ticket_id, payload.message);
            if (!appended) refreshData();
          } else {
            refreshData();
          }
          window.dispatchEvent(new Event("support-tickets-changed"));
        }
        if (payload.type === "support_message_updated") {
          if (payload.ticket_id && payload.message) {
            const updated = updateSupportMessage(payload.ticket_id, payload.message);
            if (!updated) refreshData();
          } else {
            refreshData();
          }
          window.dispatchEvent(new Event("support-tickets-changed"));
        }
        if (payload.type === "support_error") {
          toast.error(typeof payload.message === "string" ? payload.message : "Không thể gửi tin nhắn.");
        }
      } catch {
        refreshData();
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
  }, [appendSupportMessage, flushPendingSupportWsPayloads, getSupportWsUrl, open, refreshData, updateSupportMessage]);

  useEffect(() => {
    const handleChanged = () => {
      if (!open) return;
      refreshData();
    };
    window.addEventListener("booking-requests-changed", handleChanged);
    window.addEventListener("home-orders-changed", handleChanged);
    return () => {
      window.removeEventListener("booking-requests-changed", handleChanged);
      window.removeEventListener("home-orders-changed", handleChanged);
    };
  }, [open, refreshData]);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (previewRef.current?.contains(target)) return;
      if (
        emojiPickerOpen
        && !emojiPickerRef.current?.contains(target)
        && !emojiButtonRef.current?.contains(target)
      ) {
        setEmojiPickerOpen(false);
      }
    };
    const timeout = window.setTimeout(() => document.addEventListener("mousedown", closeOnOutsideClick), 0);
    return () => {
      window.clearTimeout(timeout);
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, [emojiPickerOpen, open]);

  useEffect(() => {
    if (open) return;
    setPreviewImage(null);
    setEmojiPickerOpen(false);
    setMessageDraft("");
    setReplyingTo(null);
    setActionMessage(null);
    setSelectedConversationId(null);
  }, [open]);

  const notifications = useMemo<NotificationItem[]>(() => {
    const appointmentItems = appointments.map((item) => ({
      id: `appointment-${item.booking_id}-${item.appointment_time}`,
      kind: "appointment" as const,
      title: `Đặt lịch - ${item.customer_name || "Khách hàng"}`,
      description: "",
      time: formatAppointmentTime(item),
      href: isUserArea ? "/user/bookings" : "/home/orders",
      bookingId: item.booking_id,
    }));
    const supportItems = tickets.map((ticket) => ({
      id: `support-${ticket.ticket_id}`,
      kind: "support" as const,
      title: `Hỗ trợ - ${ticket.customer_name || "Khách hàng"}`,
      description: "",
      time: formatTicketTime(ticket.created_at),
      href: isUserArea ? "/user/support" : "/home/support",
    }));
    return mode === "messages" ? supportItems : [...supportItems, ...appointmentItems];
  }, [appointments, isUserArea, mode, tickets]);

  const visibleNotifications = useMemo(() => {
    const list = showUnreadOnly
      ? notifications.filter((item) => !readIds.has(item.id))
      : notifications;
    return [...list].sort((a, b) => {
      const aUnread = !readIds.has(a.id);
      const bUnread = !readIds.has(b.id);
      if (aUnread && !bUnread) return -1;
      if (!aUnread && bUnread) return 1;
      return 0;
    });
  }, [notifications, readIds, showUnreadOnly]);

  const allConversations = useMemo<Conversation[]>(() => {
    const grouped = new Map<string, {
      name: string;
      avatarUrl: string;
      tickets: SupportTicket[];
    }>();

    tickets
      .filter((ticket) => !isJunkSupportTicket(ticket))
      .forEach((ticket) => {
        const name = ticket.customer_name || "Khách hàng";
        const groupKey = ticket.customer_code || name.toLocaleLowerCase("vi");
        const customerAvatar = ticket.customer_image_url
          || ticket.messages?.find((message) => message.sender_role === "customer" && message.sender_avatar)?.sender_avatar
          || "";
        const current = grouped.get(groupKey);
        if (current) {
          current.tickets.push(ticket);
          if (!current.avatarUrl && customerAvatar) current.avatarUrl = customerAvatar;
          return;
        }
        grouped.set(groupKey, {
          name,
          avatarUrl: customerAvatar,
          tickets: [ticket],
        });
      });

    return Array.from(grouped.entries()).map(([groupKey, group]) => {
      const sortedTickets = [...group.tickets].sort((a, b) =>
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
      );
      const latestTicket = sortedTickets[0];
      const messages = sortedTickets
        .flatMap((ticket) => (ticket.messages || []).map((message) => ({
          id: message.message_id,
          sender: message.sender_role || "customer",
          content: message.content || "",
          avatarUrl: message.sender_avatar,
          imageUrl: message.image_url,
          replyTo: message.reply_to,
          reaction: message.reaction,
          revoked: message.revoked,
          timestamp: message.created_at,
          time: message.created_at
            ? new Date(message.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
            : "",
        })))
        .sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());
      const lastMessage = messages.at(-1);
      return {
        id: `support-customer-${groupKey}`,
        ticketId: latestTicket.ticket_id,
        name: group.name,
        avatarUrl: group.avatarUrl,
        preview: lastMessage?.content || latestTicket.subject || latestTicket.type || "Cần hỗ trợ",
        time: formatTicketTime(lastMessage?.timestamp || latestTicket.created_at),
        ticketCode: sortedTickets.map((ticket) => ticket.ticket_code).join(", "),
        messages,
      };
    });
  }, [tickets]);

  const conversations = useMemo(() => {
    const query = messageQuery.trim().toLocaleLowerCase("vi");
    const filtered = allConversations
      .filter((item) => {
        if (showUnreadOnly && readIds.has(item.id)) return false;
        return !query || `${item.name} ${item.preview} ${item.ticketCode}`.toLocaleLowerCase("vi").includes(query);
      });
    return [...filtered].sort((a, b) => {
      const aUnread = !readIds.has(a.id);
      const bUnread = !readIds.has(b.id);
      if (aUnread && !bUnread) return -1;
      if (!aUnread && bUnread) return 1;
      return 0;
    });
  }, [allConversations, messageQuery, readIds, showUnreadOnly]);

  const selectedConversationBase = allConversations.find((item) => item.id === selectedConversationId);
  const selectedConversation = selectedConversationBase
    ? {
        ...selectedConversationBase,
        messages: localMessages[selectedConversationBase.id] || selectedConversationBase.messages,
      }
    : undefined;

  const appendLocalMessage = async (content: string, replyToMessage: ChatMessage | SupportChatMessage | null = replyingTo) => {
    if (!selectedConversation || !content.trim()) return;
    const now = new Date();
    const message: ChatMessage = {
      id: `local-${now.getTime()}`,
      sender: "staff",
      content: content.trim(),
      time: now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      timestamp: now.toISOString(),
      replyTo: replyToMessage
        ? {
            id: replyToMessage.id,
            sender: replyToMessage.sender,
            content: replyToMessage.imageUrl ? "Ảnh" : replyToMessage.content,
          }
        : undefined,
    };
    setLocalMessages((current) => ({
      ...current,
      [selectedConversation.id]: [...selectedConversation.messages, message],
    }));
    setReplyingTo(null);
    try {
      const sentByWs = sendSupportWsMessage(selectedConversation.ticketId, content.trim(), replyToMessage);
      if (!sentByWs) {
        throw new Error("WebSocket chưa sẵn sàng, vui lòng mở lại hộp chat và thử lại.");
      }
      window.dispatchEvent(new Event("support-tickets-changed"));
    } catch (error) {
      setLocalMessages((current) => ({
        ...current,
        [selectedConversation.id]: (current[selectedConversation.id] || selectedConversation.messages).filter((item) => item.id !== message.id),
      }));
      toast.error(error instanceof Error ? error.message : "Không thể gửi tin nhắn.");
    }
  };

  const reactToSupportMessage = async (message: SupportChatMessage, reaction: string) => {
    if (!sendSupportWsMessageUpdate(message.id, "react", reaction)) {
      toast.error("WebSocket chưa sẵn sàng, vui lòng thử lại.");
    }
  };

  const revokeSupportMessage = async (message: SupportChatMessage) => {
    if (!sendSupportWsMessageUpdate(message.id, "revoke")) {
      toast.error("WebSocket chưa sẵn sàng, vui lòng thử lại.");
    }
  };

  const appendLocalImage = (imageUrl: string, replyToMessage: ChatMessage | SupportChatMessage | null = replyingTo) => {
    if (!selectedConversation) return;
    const now = new Date();
    const message: ChatMessage = {
      id: `local-image-${now.getTime()}`,
      sender: "staff",
      content: "",
      imageUrl,
      time: now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      timestamp: now.toISOString(),
      replyTo: replyToMessage
        ? {
            id: replyToMessage.id,
            sender: replyToMessage.sender,
            content: replyToMessage.imageUrl ? "Ảnh" : replyToMessage.content,
          }
        : undefined,
    };
    setLocalMessages((current) => ({
      ...current,
      [selectedConversation.id]: [...selectedConversation.messages, message],
    }));
    setReplyingTo(null);
  };

  const selectImageFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    appendLocalImage(URL.createObjectURL(file));
    event.target.value = "";
  };

  const selectEmoji = (emoji: EmojiClickData) => {
    setMessageDraft((current) => `${current}${emoji.emoji}`);
  };

  const updateMessage = (messageId: string, updater: (message: ChatMessage) => ChatMessage) => {
    if (!selectedConversation) return;
    setLocalMessages((current) => ({
      ...current,
      [selectedConversation.id]: selectedConversation.messages.map((message) =>
        message.id === messageId ? updater(message) : message,
      ),
    }));
  };

  const reactToMessage = (messageId: string, reaction: string) => {
    updateMessage(messageId, (message) => ({
      ...message,
      reaction: message.reaction === reaction ? undefined : reaction,
    }));
    setActionMessage(null);
  };

  const copyMessage = (message: ChatMessage) => {
    const text = message.imageUrl ? message.imageUrl : message.content;
    if (!text) return;
    void navigator.clipboard?.writeText(text);
    setActionMessage(null);
  };

  const revokeMessage = (messageId: string) => {
    updateMessage(messageId, (message) => ({
      ...message,
      content: "Tin nhắn đã được thu hồi",
      imageUrl: undefined,
      replyTo: undefined,
      reaction: undefined,
      revoked: true,
    }));
    setActionMessage(null);
  };

  const deleteMessageForMe = (messageId: string) => {
    updateMessage(messageId, (message) => ({ ...message, deletedForMe: true }));
    setActionMessage(null);
  };

  const scrollToRepliedMessage = (messageId: string) => {
    const element = document.getElementById(`chat-message-${messageId}`);
    if (!element) return;
    element.scrollIntoView({ block: "center", behavior: "smooth" });
    setHighlightedMessageId(messageId);
    window.setTimeout(() => setHighlightedMessageId((current) => current === messageId ? null : current), 1200);
  };

  useEffect(() => {
    if (!selectedConversation) return;
    requestAnimationFrame(() => {
      chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, [selectedConversation?.messages.length]);

  useEffect(() => {
    const textarea = messageTextareaRef.current;
    if (!textarea) return;
    textarea.style.height = "36px";
    const nextHeight = Math.min(textarea.scrollHeight, 128);
    textarea.style.height = `${nextHeight}px`;
    setMessageInputExpanded(nextHeight > 44);
  }, [messageDraft]);

  const handleBookingDecision = async () => {
    if (!selectedBooking) return;
    if (bookingDecisionLocked) {
      toast.info("Yêu cầu đặt lịch này đã được xử lý.");
      return;
    }
    const nextStatus = bookingDecisionForm.status === "Không được duyệt" ? "Không được duyệt" : "Đã được duyệt";
    setIsUpdatingBooking(true);
    try {
      await homeApi(`/booking-requests/${selectedBooking.booking_id}`, {
        method: "PUT",
        body: JSON.stringify({ status: nextStatus }),
      });
      toast.success(
        nextStatus === "Không được duyệt"
          ? `Đã từ chối yêu cầu ${selectedBooking.booking_code || selectedBooking.booking_id}.`
          : `Đã phê duyệt yêu cầu ${selectedBooking.booking_code || selectedBooking.booking_id}.`,
      );
      setConfirmDialogOpen(false);
      setSelectedBooking(null);
      window.dispatchEvent(new Event("booking-requests-changed"));
      if (nextStatus === "Đã được duyệt") {
        window.dispatchEvent(new Event("home-orders-changed"));
      }
      refreshData();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : nextStatus === "Không được duyệt"
            ? "Không thể từ chối yêu cầu."
            : "Không thể phê duyệt yêu cầu.",
      );
    } finally {
      setIsUpdatingBooking(false);
    }
  };

  const openNotification = async (item: NotificationItem) => {
    const nextReadIds = new Set(readIds).add(item.id);
    setReadIds(nextReadIds);
    localStorage.setItem("header-notification-read-ids", JSON.stringify(Array.from(nextReadIds)));

    if (!isUserArea && item.kind === "appointment" && item.bookingId) {
      setIsLoadingBooking(true);
      setConfirmDialogOpen(true);
      try {
        const res = await homeApi<any>(`/booking-requests?limit=500&include_count=false`, { cache: "no-store" });
        const found = (res.items || []).find((o: any) => o.booking_id === item.bookingId || o.booking_code === item.bookingId);
        if (found) {
          setSelectedBooking(found);
        } else {
          toast.error("Không tìm thấy thông tin yêu cầu này.");
          setConfirmDialogOpen(false);
        }
      } catch (err) {
        toast.error("Không thể tải chi tiết yêu cầu.");
        setConfirmDialogOpen(false);
      } finally {
        setIsLoadingBooking(false);
      }
      return;
    }

    onOpenChange(false);
    router.push(item.href);
  };

  if (!open) return null;

  if (mode === "messages") {
    if (selectedConversation) {
      return (
        <SupportChatBox
          conversation={selectedConversation}
          currentSender="staff"
          showMeta={false}
          onClose={() => {
            setPreviewImage(null);
            setEmojiPickerOpen(false);
            setReplyingTo(null);
            setSelectedConversationId(null);
            onOpenChange(false);
          }}
          onSendMessage={(content, replyTo) => appendLocalMessage(content, replyTo)}
          onSendImage={(file, replyTo) => appendLocalImage(URL.createObjectURL(file), replyTo)}
          onReactMessage={reactToSupportMessage}
          onRevokeMessage={revokeSupportMessage}
        />
      );

      /*
      const initials = selectedConversation.name
        .trim()
        .split(/\s+/)
        .slice(-2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
      return (
        <>
        <div
          ref={panelRef}
          className="fixed bottom-2 right-2.5 z-[2200] flex h-[min(460px,calc(100vh-4rem))] w-[min(330px,calc(100vw-1.25rem))] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white"
        >
          <div className="flex h-14 shrink-0 items-center gap-1 border-b border-slate-200 px-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-600">
              {initials || "KH"}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-slate-950">{selectedConversation.name}</span>
            </span>
            <button
              type="button"
              className="grid size-7 place-items-center rounded-lg text-[#7c2cff] hover:bg-violet-50"
              onClick={() => {
                setPreviewImage(null);
                setEmojiPickerOpen(false);
                setReplyingTo(null);
                setSelectedConversationId(null);
                onOpenChange(false);
              }}
              aria-label="Đóng tin nhắn"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <div ref={chatScrollRef} className="min-h-0 flex-1 overflow-y-auto bg-white px-3 py-3">
            <div className="space-y-1">
              {selectedConversation.messages.filter((message) => !message.deletedForMe).map((message, index, messages) => {
                const previousMessage = messages[index - 1];
                const currentTime = message.timestamp ? new Date(message.timestamp).getTime() : Number.NaN;
                const previousTime = previousMessage?.timestamp ? new Date(previousMessage.timestamp).getTime() : Number.NaN;
                const showTimeDivider = index === 0
                  || (Number.isFinite(currentTime) && Number.isFinite(previousTime) && currentTime - previousTime >= 10 * 60 * 1000);
                const nextMessage = messages[index + 1];
                const nextTime = nextMessage?.timestamp ? new Date(nextMessage.timestamp).getTime() : Number.NaN;
                const isWithinTwoMinutes = Number.isFinite(currentTime)
                  && Number.isFinite(nextTime)
                  && nextTime - currentTime <= 2 * 60 * 1000;
                const isLastInGroup = !nextMessage
                  || nextMessage.sender !== message.sender
                  || !isWithinTwoMinutes;
                const startsNewSenderGroup = Boolean(previousMessage && previousMessage.sender !== message.sender);
                const isStaff = message.sender === "staff";
                const isEmojiOnly = Boolean(message.content)
                  && !/[A-Za-zÀ-ỹ0-9]/u.test(message.content)
                  && Array.from(message.content).length <= 6;
                const dividerLabel = message.timestamp
                  ? new Date(message.timestamp).toLocaleString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : message.time;
                return (
                  <div
                    key={message.id}
                    id={`chat-message-${message.id}`}
                    className={`${startsNewSenderGroup ? "pt-2" : ""} ${message.reaction ? "pb-5" : ""} rounded-lg transition-shadow ${highlightedMessageId === message.id ? "shadow-[0_0_0_2px_rgba(37,99,235,0.35)]" : ""}`}
                  >
                    {showTimeDivider && (
                      <div className="my-3 text-center">
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[10px] font-medium text-slate-500">
                          {dividerLabel}
                        </span>
                      </div>
                    )}
                    <div className={`group flex items-end gap-1.5 ${isStaff ? "justify-end" : "justify-start"}`}>
                      {!isStaff && (
                        <span className={`grid size-6 shrink-0 place-items-center rounded-full bg-slate-200 text-[8px] font-semibold text-slate-600 ${isLastInGroup ? "" : "invisible"}`}>
                          {initials || "KH"}
                        </span>
                      )}
                      {message.imageUrl ? (
                        <span className={`relative flex max-w-[78%] flex-col ${isStaff ? "items-end" : "items-start"}`}>
                          {message.replyTo && (
                            <button
                              type="button"
                              className="mb-1.5 block max-w-full border-l-2 border-blue-500 bg-slate-50/80 px-2 py-1 text-left text-[11px] leading-4 text-slate-500"
                              onClick={() => scrollToRepliedMessage(message.replyTo?.id || "")}
                            >
                              <span className="block font-medium text-slate-600">
                                {message.replyTo.sender === "staff" ? "Bạn" : selectedConversation.name}
                              </span>
                              <span className="block max-w-40 truncate">{message.replyTo.content}</span>
                            </button>
                          )}
                          <button
                            type="button"
                            className="overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-sm"
                            onClick={() => setPreviewImage(message.imageUrl || null)}
                            onContextMenu={(event) => {
                              event.preventDefault();
                              setActionMessage(message);
                            }}
                            aria-label="Mở thao tác ảnh"
                          >
                            <img
                              src={message.imageUrl}
                              alt="Ảnh trong đoạn chat"
                              className="max-h-44 w-full object-cover"
                            />
                          </button>
                          {isLastInGroup && <span className="mt-1 px-1 text-[10px] text-slate-400">{message.time}</span>}
                          {message.reaction && (
                            <span className={`absolute -bottom-4 grid size-6 place-items-center rounded-full border bg-white text-xs shadow-sm ${
                              isStaff ? "right-1 border-blue-200" : "right-1 border-slate-200"
                            }`}>
                              {message.reaction}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className={`relative min-w-0 max-w-[78%] ${isStaff ? "items-end" : "items-start"}`}>
                          <div
                            role="button"
                            tabIndex={0}
                            className={`block rounded-lg border px-2.5 text-left leading-5 ${
                            isStaff
                              ? "border-blue-200 bg-blue-50 text-slate-800"
                              : "border-slate-200 bg-white text-slate-800"
                          } ${isEmojiOnly ? "py-2.5 text-2xl" : "py-1.5 text-[13px]"}`}
                            onClick={() => setActionMessage(message)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") setActionMessage(message);
                            }}
                          >
                            {message.replyTo && (
                              <button
                                type="button"
                                className="mb-1.5 block border-l-2 border-blue-500 bg-slate-50/80 px-2 py-1 text-left text-[11px] leading-4 text-slate-500"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  scrollToRepliedMessage(message.replyTo?.id || "");
                                }}
                              >
                                <span className="block font-medium text-slate-600">
                                  {message.replyTo.sender === "staff" ? "Bạn" : selectedConversation.name}
                                </span>
                                <span className="block max-w-40 truncate">{message.replyTo.content}</span>
                              </button>
                            )}
                            <span className={`block whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${message.revoked ? "text-slate-400" : ""}`}>{message.content}</span>
                            {isLastInGroup && (
                              <span className={`${isEmojiOnly ? "mt-1.5" : "mt-0.5"} block text-[10px] leading-3 ${isStaff ? "text-blue-400" : "text-slate-400"}`}>
                                {message.time}
                              </span>
                            )}
                          </div>
                          {message.reaction && (
                            <span className={`absolute -bottom-4 grid size-6 place-items-center rounded-full border bg-white text-xs shadow-sm ${
                              isStaff ? "right-1 border-blue-200" : "right-1 border-slate-200"
                            }`}>
                              {message.reaction}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {replyingTo && (
            <div className="flex shrink-0 items-center gap-2 border-t border-slate-200 bg-slate-50 px-3 py-2">
              <span className="min-w-0 flex-1 border-l-2 border-blue-500 pl-2">
                <span className="block text-[11px] font-semibold text-blue-600">
                  Đang trả lời {replyingTo.sender === "staff" ? "bạn" : selectedConversation.name}
                </span>
                <span className="block truncate text-[11px] text-slate-500">
                  {replyingTo.imageUrl ? "Ảnh" : replyingTo.content}
                </span>
              </span>
              <button
                type="button"
                className="grid size-7 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                onClick={() => setReplyingTo(null)}
                aria-label="Hủy trả lời"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}

          <form
            className="relative flex min-h-14 shrink-0 items-end gap-1.5 border-t border-slate-200 bg-white px-2.5 py-2"
            onSubmit={(event) => {
              event.preventDefault();
              appendLocalMessage(messageDraft);
              setMessageDraft("");
              setEmojiPickerOpen(false);
            }}
          >
            {emojiPickerOpen && (
              <div ref={emojiPickerRef} className="fixed bottom-16 right-[355px] z-[2300] overflow-hidden rounded-lg border border-slate-200 bg-white">
                <EmojiPicker
                  className="!border-0"
                  theme={Theme.LIGHT}
                  width={300}
                  height={340}
                  style={{ border: 0, borderRadius: 8 }}
                  lazyLoadEmojis
                  previewConfig={{ showPreview: false }}
                  onEmojiClick={selectEmoji}
                />
              </div>
            )}
            <button
              type="button"
              className="mb-0 grid size-9 shrink-0 place-items-center rounded-lg text-blue-600 transition-colors hover:bg-blue-50"
              aria-label="Chọn ảnh"
              onClick={() => imageInputRef.current?.click()}
            >
              <Image className="size-5 fill-blue-600 text-white" strokeWidth={2} />
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={selectImageFile}
            />
            <label className="relative min-w-0 flex-1 overflow-hidden">
              <textarea
                ref={messageTextareaRef}
                value={messageDraft}
                onChange={(event) => setMessageDraft(event.target.value.slice(0, 200))}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    appendLocalMessage(messageDraft);
                    setMessageDraft("");
                    setEmojiPickerOpen(false);
                  }
                }}
                rows={1}
                maxLength={200}
                className={`block max-h-32 min-h-9 w-full min-w-0 resize-none overflow-y-auto border-0 bg-slate-100 py-2 pl-9 pr-3 text-[13px] leading-5 text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:bg-slate-50 whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${messageInputExpanded ? "rounded-lg" : "rounded-full"}`}
                placeholder="Tin nhắn"
              />
            </label>
            <button
              ref={emojiButtonRef}
              type="button"
              className="absolute bottom-2 left-14 grid size-9 place-items-center rounded-lg text-blue-600 transition-colors hover:bg-blue-50"
              aria-label="Chọn biểu cảm"
              onClick={() => setEmojiPickerOpen((current) => !current)}
            >
              <Smile className="size-5 fill-blue-600 text-white" strokeWidth={2} />
            </button>
            {!messageDraft.trim() && (
              <button
                type="button"
              className="mb-0 grid size-9 shrink-0 place-items-center rounded-lg text-blue-600 transition-colors hover:bg-blue-50"
                aria-label="Gửi lượt thích"
                onClick={() => appendLocalMessage("👍")}
              >
                <ThumbsUp className="size-6 fill-blue-600 text-white" strokeWidth={2} />
              </button>
            )}
            <button
              type="submit"
              className={`mb-0 size-9 shrink-0 place-items-center rounded-lg text-blue-600 transition-colors hover:bg-blue-50 ${messageDraft.trim() ? "grid" : "hidden"}`}
              disabled={!messageDraft.trim()}
              aria-label="Gửi tin nhắn"
            >
              <Send className="size-6 fill-blue-600 text-white" strokeWidth={2} />
            </button>
          </form>
          {actionMessage && (
            <div className="absolute inset-0 z-30 bg-black/35" onClick={() => setActionMessage(null)}>
            <div
              className="absolute bottom-16 left-1/2 w-max max-w-[calc(100%-1rem)] -translate-x-1/2 space-y-2"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex w-[calc(100vw-2rem)] max-w-[310px] items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 shadow-2xl">
                {quickReactions.map((reaction) => (
                  <button
                    key={reaction}
                    type="button"
                    className="grid size-9 place-items-center rounded-md text-xl transition-transform hover:scale-125"
                    onClick={() => reactToMessage(actionMessage.id, reaction)}
                    aria-label={`React ${reaction}`}
                  >
                    {reaction}
                  </button>
                ))}
              </div>

              <div className="relative flex items-center justify-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2 py-1.5 text-slate-800 shadow-2xl">
                <button
                  type="button"
                  className="grid size-8 place-items-center rounded-md text-blue-600 transition-colors hover:bg-blue-100/70"
                  onClick={() => { setReplyingTo(actionMessage); setActionMessage(null); }}
                  aria-label="Trả lời"
                >
                  <Reply className="size-5" strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  className="grid size-8 place-items-center rounded-md text-blue-600 transition-colors hover:bg-blue-100/70"
                  onClick={() => copyMessage(actionMessage)}
                  aria-label="Sao chép"
                >
                  <Copy className="size-5" strokeWidth={1.8} />
                </button>
                {actionMessage.sender === "staff" && (
                  <button
                    type="button"
                    className="grid size-8 place-items-center rounded-md text-orange-500 transition-colors hover:bg-blue-100/70"
                    onClick={() => revokeMessage(actionMessage.id)}
                    aria-label="Thu hồi"
                  >
                    <RotateCcw className="size-5" strokeWidth={1.8} />
                  </button>
                )}
                <button
                  type="button"
                  className="grid size-8 place-items-center rounded-md text-red-500 transition-colors hover:bg-blue-100/70"
                  onClick={() => deleteMessageForMe(actionMessage.id)}
                  aria-label="Xóa phía mình"
                >
                  <Trash2 className="size-5" strokeWidth={1.8} />
                </button>
                {actionMessage.imageUrl && (
                  <button
                    type="button"
                    className="grid size-8 place-items-center rounded-md text-blue-600 transition-colors hover:bg-blue-100/70"
                    onClick={() => {
                      setPreviewImage(actionMessage.imageUrl || null);
                      setActionMessage(null);
                    }}
                    aria-label="Xem ảnh"
                  >
                    <Maximize2 className="size-5" strokeWidth={1.8} />
                  </button>
                )}
              </div>
            </div>
            </div>
          )}
        </div>
        {previewImage && (
          <div
            ref={previewRef}
            className="fixed inset-0 z-[3000] grid place-items-center bg-black/90 p-4"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              setPreviewImage(null);
            }}
            role="presentation"
          >
            <button
              type="button"
              className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                setPreviewImage(null);
              }}
              aria-label="Đóng ảnh"
            >
              <X className="size-5" />
            </button>
            <img
              src={previewImage}
              alt="Ảnh toàn màn hình"
              className="max-h-full max-w-full object-contain"
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            />
          </div>
        )}
        </>
      );
      */
    }

    return (
      <div
        ref={panelRef}
        className="fixed bottom-2 right-2.5 top-[57px] z-[2200] flex w-[min(400px,calc(100vw-1.25rem))] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white"
      >
        <div className="flex items-center justify-between px-4 pb-2 pt-3">
          <h2 className="text-lg font-semibold text-slate-950">Đoạn chat</h2>
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            onClick={() => onOpenChange(false)}
            aria-label="Đóng tin nhắn"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-4">
          <label className="flex h-9 items-center gap-2 rounded-full bg-slate-100 px-3 text-slate-500">
            <Search className="size-4 shrink-0" />
            <input
              value={messageQuery}
              onChange={(event) => setMessageQuery(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              placeholder="Tìm kiếm tin nhắn"
            />
          </label>
        </div>

        <div className="flex items-center gap-1.5 px-4 py-2.5">
          <button
            type="button"
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${!showUnreadOnly ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
            onClick={() => setShowUnreadOnly(false)}
          >
            Tất cả
          </button>
          <button
            type="button"
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${showUnreadOnly ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
            onClick={() => setShowUnreadOnly(true)}
          >
            Chưa đọc
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          {conversations.length > 0 ? <div className="space-y-1.5">
            {conversations.map((item) => {
            const unread = !readIds.has(item.id);
            const initials = item.name
              .trim()
              .split(/\s+/)
              .slice(-2)
              .map((part) => part[0])
              .join("")
              .toUpperCase();
            return (
              <button
                key={item.id}
                type="button"
                className={`group flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${unread ? "border-blue-200 bg-blue-50/35 hover:bg-blue-50/60" : "border-transparent hover:border-slate-200 hover:bg-slate-50"}`}
                onClick={() => {
                  const nextReadIds = new Set(readIds).add(item.id);
                  setReadIds(nextReadIds);
                  localStorage.setItem("header-notification-read-ids", JSON.stringify(Array.from(nextReadIds)));
                  setSelectedConversationId(item.id);
                }}
              >
                <span className={`grid size-10 shrink-0 place-items-center rounded-full text-xs font-semibold transition-colors ${unread ? "bg-white text-blue-600" : "bg-slate-200 text-slate-600"}`}>
                  {item.avatarUrl ? (
                    <img src={item.avatarUrl} alt={item.name} className="size-full rounded-full object-cover" />
                  ) : initials || "KH"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    {unread && <span className="size-1.5 shrink-0 rounded-full bg-blue-500" />}
                    <span className="block truncate text-sm font-semibold text-slate-900">{item.name}</span>
                  </span>
                  <span className="mt-1 block truncate text-xs text-slate-500">
                    {item.preview} · {item.time}
                  </span>
                </span>
              </button>
            );
            })}
          </div> : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              Không có đoạn chat phù hợp.
            </div>
          )}
        </div>
        <div className="h-10 shrink-0 border-t border-slate-200 bg-white" />
      </div>
    );
  }

  return (
    <>
      <div
        ref={panelRef}
        className="fixed bottom-2 right-2.5 top-[57px] z-[2200] flex w-[min(400px,calc(100vw-1.25rem))] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white"
      >
        <div className="flex items-center justify-between px-4 pb-2 pt-3">
          <h2 className="text-lg font-semibold text-slate-950">Thông báo</h2>
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            onClick={() => onOpenChange(false)}
            aria-label="Đóng thông báo"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 px-4 py-2.5">
          <button
            type="button"
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${!showUnreadOnly ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-100"}`}
            onClick={() => setShowUnreadOnly(false)}
          >
            Tất cả
          </button>
          <button
            type="button"
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${showUnreadOnly ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-100"}`}
            onClick={() => setShowUnreadOnly(true)}
          >
            Chưa đọc
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          {visibleNotifications.length > 0 ? (
            <div className="space-y-1.5">
              {visibleNotifications.map((item) => {
                const unread = !readIds.has(item.id);
                const Icon = item.kind === "appointment" ? CalendarClock : Headphones;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`group flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${unread ? "border-blue-200 bg-blue-50/35 hover:bg-blue-50/60" : "border-transparent hover:border-slate-200 hover:bg-slate-50"}`}
                    onClick={() => openNotification(item)}
                  >
                    <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors ${unread ? "bg-white text-blue-600" : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-700"}`}>
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        {unread && <span className="size-1.5 shrink-0 rounded-full bg-blue-500" />}
                        <span className="block truncate text-sm font-semibold text-slate-900">{item.title}</span>
                      </span>
                      <span className="mt-1 block truncate text-xs text-slate-500">
                        {item.description ? `${item.description} · ${item.time}` : item.time}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              Không có thông báo phù hợp.
            </div>
          )}
        </div>

        <div className="h-10 shrink-0 border-t border-slate-200 bg-white" />
      </div>

      <Dialog
        open={confirmDialogOpen && isLoadingBooking}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setConfirmDialogOpen(false);
            setSelectedBooking(null);
          }
        }}
      >
        <DialogContent className="max-w-md bg-white p-6 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900">
              Xác nhận yêu cầu đặt lịch
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Vui lòng xem thông tin chi tiết và đưa ra quyết định duyệt.
            </DialogDescription>
          </DialogHeader>

          <div className="py-8 text-center text-sm text-slate-500">
            Đang tải chi tiết yêu cầu...
          </div>
        </DialogContent>
      </Dialog>

      {confirmDialogOpen && !isLoadingBooking && selectedBooking ? (
        <FormDialog
          open={confirmDialogOpen}
          onClose={() => {
            setConfirmDialogOpen(false);
            setSelectedBooking(null);
          }}
          title="Xác nhận yêu cầu đặt lịch"
          fields={bookingApprovalFields}
          form={bookingDecisionForm}
          onFormChange={setBookingDecisionForm}
          onSave={bookingDecisionLocked ? undefined : handleBookingDecision}
          isSaving={isUpdatingBooking}
          statusOptions={bookingDecisionLocked ? undefined : bookingDecisionStatusOptions}
          statusDotColors={bookingDecisionStatusColors}
          showSaveButton={!bookingDecisionLocked}
          saveLabel={bookingDecisionForm.status === "Không được duyệt" ? "Từ chối yêu cầu" : "Duyệt yêu cầu"}
          gridClassName="grid gap-4 md:grid-cols-2"
        />
      ) : null}
    </>
  );
}
