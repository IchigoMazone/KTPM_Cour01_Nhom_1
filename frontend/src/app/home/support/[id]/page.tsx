"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import EmojiPicker from "emoji-picker-react";
import {
  ArrowUp,
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
} from "lucide-react";

import { seedOrders } from "../../orders/data";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageShell } from "../../_components/dashboard-primitives";

import {
  seedTickets,
  statusColor,
  priorityColor,
  quickReplies,
  formatReadableDate,
  formatMessageTime,
  type Ticket,
  type TicketStatus,
  type Priority,
  type SupportMessage,
} from "../page";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function parseMarkdown(text: string): React.ReactNode {
  if (!text) return null;
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ node, ...props }) => (
          <a
            {...props}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            {props.children}
            <svg className="size-3 inline-block shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ),
        strong: ({ node, ...props }) => (
          <strong {...props} className="font-semibold text-slate-950 dark:text-white" />
        ),
        em: ({ node, ...props }) => (
          <em {...props} className="italic text-slate-800 dark:text-slate-200" />
        ),
        code: ({ node, ...props }) => (
          <code {...props} className="bg-slate-100 text-red-600 font-mono text-xs px-1 py-0.5 rounded border border-slate-200" />
        ),
        p: ({ node, ...props }) => (
          <span {...props} />
        )
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

export default function SupportReplyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [tickets, setTickets] = useState<Ticket[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("support_tickets");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return seedTickets;
  });

  const [ticketMessages, setTicketMessages] = useState<Record<string, SupportMessage[]>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("support_messages");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return Object.fromEntries(
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
    );
  });

  useEffect(() => {
    localStorage.setItem("support_tickets", JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem("support_messages", JSON.stringify(ticketMessages));
  }, [ticketMessages]);

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

  const [chatDraft, setChatDraft] = useState("");
  const [chatImagePreview, setChatImagePreview] = useState<string | null>(null);
  const [viewingImageUrl, setViewingImageUrl] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; type: string; url: string } | null>(null);
  const [expandOrder, setExpandOrder] = useState(true);
  const [expandCanned, setExpandCanned] = useState(true);
  const [cannedQuery, setCannedQuery] = useState("");
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);

  // States for text helper features
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiTab, setActiveEmojiTab] = useState<"feelings" | "work">("feelings");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [showAiAssist, setShowAiAssist] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);

  const isEmojiOnlyMessage = (content: string) => {
    const compact = content.trim();
    if (!compact) return false;
    const withoutEmoji = compact
      .replace(/[\p{Emoji_Presentation}\p{Emoji_Modifier}\uFE0F\u200D]/gu, "")
      .trim();
    return withoutEmoji.length === 0;
  };

  const getMessageTimeValue = (value: string) => {
    const parts = value.trim().split(/\s+/);
    const timePart = parts.find((part) => /^\d{2}:\d{2}$/.test(part));
    const datePart = parts.find((part) => /^\d{2}\/\d{2}\/\d{4}$/.test(part));
    if (!timePart || !datePart) return 0;
    const [hour, minute] = timePart.split(":").map(Number);
    const [day, month, year] = datePart.split("/").map(Number);
    return new Date(year, month - 1, day, hour, minute).getTime();
  };

  const isGroupedWithPrevious = (message: SupportMessage, previous?: SupportMessage) => {
    if (!previous || previous.sender !== message.sender) return false;
    const currentTime = getMessageTimeValue(message.createdAt);
    const previousTime = getMessageTimeValue(previous.createdAt);
    return currentTime > 0 && previousTime > 0 && currentTime - previousTime <= 5 * 60 * 1000;
  };

  const isGroupedWithNext = (message: SupportMessage, next?: SupportMessage) => {
    if (!next || next.sender !== message.sender) return false;
    const currentTime = getMessageTimeValue(message.createdAt);
    const nextTime = getMessageTimeValue(next.createdAt);
    return currentTime > 0 && nextTime > 0 && nextTime - currentTime <= 5 * 60 * 1000;
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
      if (linkRef.current && !linkRef.current.contains(event.target as Node)) {
        setShowLinkInput(false);
      }
      if (aiRef.current && !aiRef.current.contains(event.target as Node)) {
        setShowAiAssist(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const activeChatTicket = tickets.find((t) => t.id === id);
  const activeChatMessages = activeChatTicket ? ticketMessages[activeChatTicket.id] ?? [] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [activeChatMessages.length]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 96)}px`;
  }, [chatDraft]);

  const aiSuggestions: Record<string, string> = {
    "Mất đồ": `Chào ${activeChatTicket?.customer}, shop rất tiếc về sự cố này. Em đã kiểm tra lịch trình giặt của đơn ${activeChatTicket?.orderId} và đang liên hệ với nhân viên phụ trách ca để rà soát. Shop sẽ phản hồi lại ngay cho anh/chị khi có kết quả ạ.`,
    "Giao trễ": `Chào ${activeChatTicket?.customer}, shop vô cùng xin lỗi vì sự bất tiện này. Đơn hàng ${activeChatTicket?.orderId} của mình đang được đối tác vận chuyển giao gấp, dự kiến tài xế sẽ tới trong vòng 10-15 phút nữa ạ. Mong anh/chị thông cảm giúp shop nhé.`,
    "Hỏng đồ": `Chào ${activeChatTicket?.customer}, shop chân thành xin lỗi vì trải nghiệm không tốt này. Shop đã tiếp nhận thông tin về đồ bị hỏng của đơn ${activeChatTicket?.orderId} và đang chuyển sang bộ phận đền bù để giải quyết theo chính sách tốt nhất cho mình. Nhân viên sẽ liên hệ lại ngay ạ.`,
    "Thanh toán": `Chào ${activeChatTicket?.customer}, shop đã nhận được yêu cầu hỗ trợ về thanh toán của đơn ${activeChatTicket?.orderId}. Bộ phận kế toán đang đối soát giao dịch ngân hàng và sẽ cập nhật trạng thái đơn ngay khi hoàn tất ạ.`,
    "Khác": `Chào ${activeChatTicket?.customer}, em đã nhận được yêu cầu hỗ trợ của mình và đang chuyển tiếp đến nhân viên chuyên trách. Shop sẽ phản hồi lại ngay lập tức ạ.`
  };

  const handleAiAction = (action: "suggest" | "formal" | "shorten" | "translate" | "fix") => {
    if (isAiGenerating || !activeChatTicket) return;
    setIsAiGenerating(true);
    setShowAiAssist(false);
    
    setTimeout(() => {
      let result = chatDraft;
      const baseSuggestion = aiSuggestions[activeChatTicket.type] || aiSuggestions["Khác"];
      
      switch (action) {
        case "suggest":
          result = baseSuggestion;
          break;
        case "formal":
          const textToFormalize = chatDraft.trim() || baseSuggestion;
          result = `Kính gửi quý khách hàng ${activeChatTicket.customer},\n\nDạ shop WashPro xin chân thành xin lỗi anh/chị về sự cố không mong muốn vừa qua. ${textToFormalize.replace(/Chào\s+[^,]+,/, "").trim()}\n\nRất mong anh/chị thông cảm cho shop. Trân trọng cảm ơn anh/chị!`;
          break;
        case "shorten":
          const textToShorten = chatDraft.trim() || baseSuggestion;
          result = textToShorten
            .replace("xin chân thành xin lỗi anh/chị về sự cố không mong muốn vừa qua.", "rất tiếc về sự cố này.")
            .replace("Em đã kiểm tra lịch trình giặt của đơn", "Shop đang kiểm tra đơn")
            .replace("đang liên hệ với nhân viên phụ trách ca để rà soát. Shop sẽ phản hồi lại ngay cho anh/chị khi có kết quả ạ.", "sẽ báo lại ngay khi có kết quả.");
          if (result === textToShorten) {
            result = "Shop đã nhận được thông tin phản hồi và đang tiến hành xử lý gấp cho mình ạ. Xin lỗi vì sự bất tiện này.";
          }
          break;
        case "translate":
          const typeTranslations: Record<string, string> = {
            "Mất đồ": `Dear ${activeChatTicket.customer}, we are deeply sorry for the missing item. We are reviewing the washing schedule for order ${activeChatTicket.orderId} and checking with the shift staff. We will update you as soon as possible.`,
            "Giao trễ": `Dear ${activeChatTicket.customer}, we apologize for the delivery delay. Order ${activeChatTicket.orderId} is on the way and should arrive in 10-15 minutes. Thank you for your patience.`,
            "Hỏng đồ": `Dear ${activeChatTicket.customer}, we apologize for the damaged item. We have received your feedback for order ${activeChatTicket.orderId} and forwarded it to our compensation team. We will contact you shortly.`,
            "Thanh toán": `Dear ${activeChatTicket.customer}, we have received your request regarding payment for order ${activeChatTicket.orderId}. Our accounting team is verifying the transaction and will update you soon.`,
            "Khác": `Dear ${activeChatTicket.customer}, we have received your request and assigned it to our support specialist. We will respond shortly.`
          };
          result = typeTranslations[activeChatTicket.type] || typeTranslations["Khác"];
          break;
        case "fix":
          const textToFix = chatDraft.trim() || baseSuggestion;
          result = textToFix
            .replace(/\s+/g, " ")
            .replace(/\s*([,.?!;:])\s*/g, "$1 ")
            .trim();
          if (result) {
            result = result.charAt(0).toUpperCase() + result.slice(1);
            if (!/[.!?]$/.test(result)) {
              result += ".";
            }
          }
          break;
      }
      
      setChatDraft(result);
      setIsAiGenerating(false);
      textareaRef.current?.focus();
    }, 800);
  };

  const insertBold = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const replacement = `**${selectedText}**`;
    setChatDraft(text.substring(0, start) + replacement + text.substring(end));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 2, start + 2 + selectedText.length);
    }, 0);
  };

  // If the ticket is not found, render an error state
  if (!activeChatTicket) {
    return (
      <PageShell fullHeight>
        <div className="flex h-full flex-col items-center justify-center bg-white text-slate-800 p-6">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Không tìm thấy Ticket</h2>
            <p className="text-slate-500 text-sm">Yêu cầu hỗ trợ #{id} không tồn tại hoặc đã bị xóa.</p>
            <Button onClick={() => router.push("/home/support")} className="bg-slate-900 text-white hover:bg-slate-800">
              Quay lại danh sách
            </Button>
          </div>
        </div>
      </PageShell>
    );
  }

  const associatedOrder = seedOrders.find((o) => o.id === activeChatTicket.orderId);
  const filteredCannedAnswers = quickReplies.filter((reply) =>
    reply.toLowerCase().includes(cannedQuery.toLowerCase())
  );
  const supportOrderTitle = associatedOrder ? associatedOrder.service : activeChatTicket.type;
  const supportOrderQuantity = associatedOrder ? associatedOrder.quantity : "Chưa có";
  const supportOrderPrice = associatedOrder ? associatedOrder.amount : 0;
  const supportOrderStatus = associatedOrder ? associatedOrder.status : activeChatTicket.status;
  const orderNote = associatedOrder ? associatedOrder.note : "Không có ghi chú thêm";
  const sendMessage = () => {
    if (!chatDraft.trim() && !chatImagePreview && !attachedFile) return;
    const now = new Date();
    const message: SupportMessage = {
      id: `${activeChatTicket.id}-${now.getTime()}`,
      ticketId: activeChatTicket.id,
      sender: "staff",
      senderName: currentUser,
      avatar: currentUserAvatar,
      content: chatDraft.trim(),
      imageUrl: chatImagePreview || undefined,
      fileAttachment: attachedFile || undefined,
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
      [activeChatTicket.id]: [...(prev[activeChatTicket.id] ?? []), message],
    }));
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === activeChatTicket.id
          ? {
              ...ticket,
              owner: currentUser,
              ownerAvatar: currentUserAvatar,
              status: ticket.status === "Chưa xử lý" ? "Đang xử lý" : ticket.status,
            }
          : ticket
      )
    );
    setChatDraft("");
    setChatImagePreview(null);
    setAttachedFile(null);
  };

  return (
    <PageShell fullHeight>
      <div className="flex h-full min-h-0 flex-1 overflow-hidden bg-white text-slate-800">
        
        {/* Left Panel: Ticket Details (w-80) */}
        {showLeftPanel && (
        <div className="hidden md:flex w-80 shrink-0 flex-col bg-white border-r border-slate-200 min-h-0">
          <div className="flex h-[65px] shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900">Thông tin Ticket</h2>
              <p className="mt-0.5 text-xs text-slate-400">Chi tiết sự cố & phân công</p>
            </div>
            <button
              type="button"
              onClick={() => setShowLeftPanel(false)}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-900 transition-colors hover:bg-slate-200"
              title="Đóng thông tin ticket"
            >
              <PanelRight className="size-4.5 rotate-180" />
            </button>
          </div>
          
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-4 space-y-4">
              
              {/* General Info Card */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-3xs space-y-3.5">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mã yêu cầu</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{activeChatTicket.id}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Khách hàng</span>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">{activeChatTicket.customer}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{activeChatTicket.phone}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Loại sự cố</span>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">{activeChatTicket.type}</p>
                </div>
              </div>

              {/* Interactive Status & Priority Card */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-3xs space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Trạng thái</span>
                  <Select
                    value={activeChatTicket.status}
                    onValueChange={(newStatus: TicketStatus) => {
                      setTickets((prev) =>
                        prev.map((t) => (t.id === activeChatTicket.id ? { ...t, status: newStatus } : t))
                      );
                    }}
                  >
                    <SelectTrigger className="w-full h-9 border-slate-200 text-xs font-semibold text-slate-800 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-white border border-slate-200 shadow-md">
                      <SelectItem value="Chưa xử lý">
                        <span className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-blue-500" />
                          Chưa xử lý
                        </span>
                      </SelectItem>
                      <SelectItem value="Đang xử lý">
                        <span className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-amber-500" />
                          Đang xử lý
                        </span>
                      </SelectItem>
                      <SelectItem value="Đã giải quyết">
                        <span className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-emerald-500" />
                          Đã giải quyết
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Mức độ ưu tiên</span>
                  <Select
                    value={activeChatTicket.priority}
                    onValueChange={(newPriority: Priority) => {
                      setTickets((prev) =>
                        prev.map((t) => (t.id === activeChatTicket.id ? { ...t, priority: newPriority } : t))
                      );
                    }}
                  >
                    <SelectTrigger className="w-full h-9 border-slate-200 text-xs font-semibold text-slate-800 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-white border border-slate-200 shadow-md">
                      <SelectItem value="Thấp">
                        <span className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-blue-500" />
                          Thấp
                        </span>
                      </SelectItem>
                      <SelectItem value="Trung bình">
                        <span className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-amber-500" />
                          Trung bình
                        </span>
                      </SelectItem>
                      <SelectItem value="Cao">
                        <span className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-red-500" />
                          Cao
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Assignment & Date Card */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-3xs space-y-3.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Người phụ trách</span>
                  <div className="flex items-center gap-1.5">
                    <Image
                      src={activeChatTicket.ownerAvatar || "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif"}
                      alt={activeChatTicket.owner}
                      width={18}
                      height={18}
                      className="size-4.5 rounded-full object-cover"
                    />
                    <span className="font-semibold text-slate-800">{activeChatTicket.owner}</span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Ngày tạo</span>
                  <span className="font-semibold text-slate-800">{formatReadableDate(activeChatTicket.createdAt)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Ngày giặt</span>
                  <span className="font-semibold text-slate-800">{formatReadableDate(activeChatTicket.washDate)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Mã đơn hàng</span>
                  <span className="font-semibold text-slate-800">{activeChatTicket.orderId}</span>
                </div>
              </div>

            </div>
          </ScrollArea>
        </div>
        )}

        {/* Middle Panel: Active Conversation (flex-1) */}
        <div className="flex flex-1 flex-col bg-white min-h-0 relative border-r border-slate-200">
          {!showLeftPanel && (
            <button
              type="button"
              onClick={() => setShowLeftPanel(true)}
              className="absolute left-0 top-1/2 z-20 hidden h-16 w-7 -translate-y-1/2 items-center justify-center rounded-r-lg border border-l-0 border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 md:flex"
              title="Mở thông tin ticket"
            >
              <PanelRight className="size-4 rotate-180" />
            </button>
          )}
          
          {/* Header */}
          <div className="border-b border-slate-100 bg-white px-4 py-3 shrink-0 flex items-center justify-between gap-3 shadow-3xs">
            <div className="flex min-w-0 items-center gap-3">
              <Image
                src="https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif"
                alt={activeChatTicket.customer}
                width={36}
                height={36}
                className="size-9 rounded-full object-cover shrink-0 border border-slate-200 shadow-2xs"
                unoptimized
              />
              
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
                  setTickets((prev) => prev.map((t) => t.id === activeChatTicket.id ? { ...t, status: "Đã giải quyết" } : t));
                  router.push("/home/support");
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Đóng Ticket
              </button>
              
              <button
                onClick={() => setShowRightPanel(!showRightPanel)}
                className={`flex size-8 items-center justify-center rounded-lg transition-colors ${
                  showRightPanel 
                    ? "text-slate-900 bg-slate-100" 
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                }`}
                title={showRightPanel ? "Đóng bảng phụ" : "Mở bảng phụ"}
              >
                <PanelRight className="size-4.5" />
              </button>
            </div>
          </div>

          {/* Conversation Messages */}
          <div className="min-h-0 flex-1 bg-white overflow-hidden">
            <ScrollArea className="h-full">
              <div className="px-5 py-6">
                {activeChatMessages.map((message, index) => {
                  const isStaff = message.sender === "staff";
                  const groupedWithPrevious = isGroupedWithPrevious(message, activeChatMessages[index - 1]);
                  const groupedWithNext = isGroupedWithNext(message, activeChatMessages[index + 1]);
                  const showAvatar = !groupedWithNext;
                  const showMeta = !groupedWithNext;
                  const emojiOnly = message.content ? isEmojiOnlyMessage(message.content) && !message.imageUrl && !message.fileAttachment : false;
                  return (
                    <div
                      key={message.id}
                      className={`flex items-end gap-3 ${index === 0 ? "" : groupedWithPrevious ? "mt-1" : "mt-5"} ${isStaff ? "justify-end" : "justify-start"}`}
                    >
                      {!isStaff && showAvatar && (
                        <Image
                          src="https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif"
                          alt={message.senderName}
                          width={32}
                          height={32}
                          className="mb-5 size-8 shrink-0 rounded-full border border-slate-200 object-cover shadow-2xs"
                          unoptimized
                        />
                      )}
                      {!isStaff && !showAvatar && <div className="size-8 shrink-0" />}
                      
                      <div className={`flex max-w-[70%] flex-col gap-1.5 ${isStaff ? "items-end" : "items-start"}`}>
                        {message.imageUrl && (
                          <button
                            type="button"
                            onClick={() => setViewingImageUrl(message.imageUrl || null)}
                            className="overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-3xs transition-opacity hover:opacity-95"
                            title="Xem ảnh"
                          >
                            <Image
                              src={message.imageUrl}
                              alt="Ảnh đính kèm"
                              width={360}
                              height={240}
                              unoptimized
                              className="max-h-64 w-full object-cover"
                            />
                          </button>
                        )}

                        {message.fileAttachment && (
                          <div className="flex min-w-[240px] max-w-sm items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-3xs">
                            <div className="flex min-w-0 items-center gap-2">
                              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold uppercase text-blue-700">
                                {message.fileAttachment.type.slice(0, 3)}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-slate-800" title={message.fileAttachment.name}>
                                  {message.fileAttachment.name}
                                </p>
                                <p className="text-[10px] font-medium text-slate-400">{message.fileAttachment.size}</p>
                              </div>
                            </div>
                            <a
                              href={message.fileAttachment.url}
                              download={message.fileAttachment.name}
                              className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800"
                            >
                              Tải xuống
                            </a>
                          </div>
                        )}

                        {message.content && (
                          emojiOnly ? (
                            <div className="px-1 text-3xl leading-none">
                              {message.content}
                            </div>
                          ) : (
                            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-sm leading-relaxed text-slate-800 shadow-3xs">
                              <div className="whitespace-pre-wrap">
                                {parseMarkdown(message.content)}
                              </div>
                            </div>
                          )
                        )}

                        {showMeta && (
                          <div className="mt-1 flex items-center gap-1 px-1">
                            <span className="text-[10px] font-medium text-slate-400">{formatMessageTime(message.createdAt)}</span>
                            {isStaff && <CheckCheck className="size-3 text-emerald-500" />}
                          </div>
                        )}
                      </div>
                      
                      {isStaff && showAvatar && (
                        <Image
                          src={message.avatar || activeChatTicket.ownerAvatar || "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif"}
                          alt={message.senderName}
                          width={32}
                          height={32}
                          className="mb-5 size-8 shrink-0 rounded-full border border-slate-200 object-cover shadow-2xs"
                          unoptimized
                        />
                      )}
                      {isStaff && !showAvatar && <div className="size-8 shrink-0" />}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Input Box */}
          <div className="border-t border-slate-100 bg-white p-4 shrink-0">
            {chatImagePreview && (
              <div className="mb-3 flex items-end gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 w-fit">
                <Image
                  src={chatImagePreview}
                  alt="Xem trước"
                  width={96}
                  height={64}
                  unoptimized
                  className="h-16 w-24 rounded-md object-cover"
                />
                <Button variant="ghost" size="sm" onClick={() => setChatImagePreview(null)}>
                  Xóa
                </Button>
              </div>
            )}

            {attachedFile && (
              <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5 w-72 shadow-3xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="size-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs uppercase shrink-0">
                    {attachedFile.type.slice(0, 3)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate" title={attachedFile.name}>{attachedFile.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{attachedFile.size}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-500 hover:text-slate-800" onClick={() => setAttachedFile(null)}>
                  Xóa
                </Button>
              </div>
            )}

             <div className={`relative rounded-xl border border-slate-200 bg-white p-3 shadow-2xs focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-400 transition-all flex flex-col gap-2 ${
               isAiGenerating ? "opacity-80 border-blue-300 ring-1 ring-blue-300 animate-pulse" : ""
             }`}>
               {isAiGenerating && (
                 <div className="absolute inset-0 bg-blue-50/20 backdrop-blur-[0.5px] rounded-xl flex items-center justify-center z-10">
                   <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-blue-100 shadow-sm text-xs font-medium text-blue-600">
                     <svg className="animate-spin h-3.5 w-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                     </svg>
                     AI đang xử lý...
                   </div>
                 </div>
               )}

                <textarea
                  ref={textareaRef}
                  value={chatDraft}
                  onChange={(event) => setChatDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Nhập phản hồi tại đây và nhấn Enter để gửi..."
                  className="min-h-[50px] max-h-24 w-full resize-none overflow-y-auto bg-transparent py-1 text-sm text-slate-800 placeholder-slate-400 focus:outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                />

                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    
                    {/* Emojis */}
                    <div ref={emojiRef} className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setShowEmojiPicker(!showEmojiPicker);
                          setShowLinkInput(false);
                          setShowAiAssist(false);
                        }}
                        className={`p-1 hover:bg-slate-50 rounded-lg hover:text-slate-600 transition-colors ${
                          showEmojiPicker ? "text-slate-900 bg-slate-100" : ""
                        }`}
                        title="Emojis"
                      >
                        <Smile className="size-4" />
                      </button>

                      {showEmojiPicker && (
                        <div className="absolute bottom-10 left-0 z-50 shadow-lg transition-all">
                          <EmojiPicker
                            onEmojiClick={(emojiData) => {
                              setChatDraft(prev => prev + emojiData.emoji);
                              setShowEmojiPicker(false);
                              textareaRef.current?.focus();
                            }}
                            autoFocusSearch={false}
                            width={320}
                            height={380}
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Attachment */}
                    <label className="p-1 hover:bg-slate-50 rounded-lg hover:text-slate-600 transition-colors cursor-pointer" title="Đính kèm tệp">
                      <Paperclip className="size-4" />
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          
                          if (file.type.startsWith("image/")) {
                            setChatImagePreview(URL.createObjectURL(file));
                            setAttachedFile(null);
                          } else {
                            const sizeStr = file.size > 1024 * 1024 
                              ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
                              : `${(file.size / 1024).toFixed(0)} KB`;
                            setAttachedFile({
                              name: file.name,
                              size: sizeStr,
                              type: file.name.split(".").pop() || "file",
                              url: URL.createObjectURL(file)
                            });
                            setChatImagePreview(null);
                          }
                          event.target.value = "";
                        }}
                      />
                    </label>

                    {/* Links */}
                    <div ref={linkRef} className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setShowLinkInput(!showLinkInput);
                          setShowEmojiPicker(false);
                          setShowAiAssist(false);
                        }}
                        className={`p-1 hover:bg-slate-50 rounded-lg hover:text-slate-600 transition-colors ${
                          showLinkInput ? "text-slate-900 bg-slate-100" : ""
                        }`}
                        title="Chèn link"
                      >
                        <Link className="size-4" />
                      </button>

                      {showLinkInput && (
                        <div className="absolute bottom-10 left-0 z-50 p-3 bg-white border border-slate-200 rounded-xl shadow-lg w-64 flex flex-col gap-2">
                          <p className="text-xs font-bold text-slate-700">Chèn liên kết</p>
                          <input
                            type="text"
                            placeholder="Tiêu đề (VD: Xem đơn hàng)"
                            value={linkText}
                            onChange={(e) => setLinkText(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 text-slate-800"
                          />
                          <input
                            type="text"
                            placeholder="Địa chỉ URL (VD: https://...)"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 text-slate-800"
                          />
                          <div className="flex justify-end gap-1.5 mt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setShowLinkInput(false);
                                setLinkText("");
                                setLinkUrl("");
                              }}
                              className="px-2 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 rounded-md transition-colors"
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!linkUrl) return;
                                const title = linkText || "Liên kết";
                                setChatDraft(prev => prev + ` [${title}](${linkUrl})`);
                                setShowLinkInput(false);
                                setLinkText("");
                                setLinkUrl("");
                                textareaRef.current?.focus();
                              }}
                              className="px-2 py-1 text-[11px] font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
                            >
                              Thêm
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Bold */}
                    <button
                      type="button"
                      onClick={insertBold}
                      className="p-1 hover:bg-slate-50 rounded-lg hover:text-slate-600 transition-colors"
                      title="Định dạng đậm"
                    >
                      <Bold className="size-4" />
                    </button>
                    
                    {/* AI Assist */}
                    <div ref={aiRef} className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAiAssist(!showAiAssist);
                          setShowEmojiPicker(false);
                          setShowLinkInput(false);
                        }}
                        className={`p-1 hover:bg-slate-50 rounded-lg transition-colors ${
                          showAiAssist ? "text-blue-500 bg-blue-50" : "hover:text-slate-700"
                        }`}
                        title="AI Trợ lý"
                      >
                        <Sparkles className="size-4" />
                      </button>

                      {showAiAssist && (
                        <div className="absolute bottom-10 left-0 z-50 p-2 bg-white border border-slate-200 rounded-xl shadow-lg w-52 flex flex-col gap-1 text-left">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1">AI Trợ lý phản hồi</p>
                          <button
                            type="button"
                            onClick={() => handleAiAction("suggest")}
                            className="w-full text-left text-xs px-2.5 py-2 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium transition-colors"
                          >
                            🪄 <span>Tự động phản hồi</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAiAction("formal")}
                            className="w-full text-left text-xs px-2.5 py-2 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium transition-colors"
                          >
                            ✍️ <span>Viết lại trang trọng</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAiAction("shorten")}
                            className="w-full text-left text-xs px-2.5 py-2 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium transition-colors"
                          >
                            ⚡ <span>Rút ngắn tin nhắn</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAiAction("translate")}
                            className="w-full text-left text-xs px-2.5 py-2 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium transition-colors"
                          >
                            🌍 <span>Dịch sang tiếng Anh</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAiAction("fix")}
                            className="w-full text-left text-xs px-2.5 py-2 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium transition-colors"
                          >
                            🔍 <span>Sửa chính tả & ngữ pháp</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                 <div className="flex items-center gap-2 text-[10px] text-slate-400 mr-1">
                   <span>Shift + Enter xuống dòng</span>
                 </div>

                 <button
                   type="button"
                   onClick={sendMessage}
                   disabled={!chatDraft.trim() && !chatImagePreview && !attachedFile}
                   className="flex size-8 items-center justify-center rounded-full bg-slate-900 text-white transition-colors hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400"
                 >
                   <ArrowUp className="size-4" />
                 </button>
               </div>
             </div>
          </div>
        </div>

        {/* Right Panel: Details, Order items & Canned responses (w-80) */}
        {showRightPanel && (
          <div className="hidden lg:flex w-80 shrink-0 flex-col bg-white min-h-0">
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-3 space-y-3">
                
                {/* Support Order Info Accordion */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-3xs">
                  <button
                    onClick={() => setExpandOrder(!expandOrder)}
                    className="flex w-full items-center justify-between p-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors border-b border-slate-100"
                  >
                    <span className="flex items-center gap-1.5">Thông tin đơn hàng cần hỗ trợ</span>
                    {expandOrder ? <ChevronUp className="size-4 text-slate-400" /> : <ChevronDown className="size-4 text-slate-400" />}
                  </button>
                  
                  {expandOrder && (
                    <div className="p-3 space-y-3">
                      <div className="flex items-start gap-2.5">
                        <div className="size-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                          <Image
                            src="https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif"
                            alt="Đơn hàng"
                            width={48}
                            height={48}
                            className="object-cover size-full opacity-60"
                          />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-semibold text-xs text-slate-900 truncate">{activeChatTicket.orderId}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">{supportOrderTitle}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Khối lượng: {supportOrderQuantity}</p>
                          <p className="text-[11px] text-slate-400 font-normal">Ghi chú: {orderNote}</p>
                        </div>
                        <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700">
                          {supportOrderStatus}
                        </span>
                      </div>

                      <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-500">Giá trị đơn</span>
                        <span className="font-extrabold text-sm text-slate-900">
                          {supportOrderPrice > 0 ? `${supportOrderPrice.toLocaleString("vi-VN")} đ` : "Chưa có"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Canned Answers Accordion */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-3xs">
                  <button
                    onClick={() => setExpandCanned(!expandCanned)}
                    className="flex w-full items-center justify-between p-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors border-b border-slate-100"
                  >
                    <span className="flex items-center gap-1.5">Phản hồi nhanh</span>
                    {expandCanned ? <ChevronUp className="size-4 text-slate-400" /> : <ChevronDown className="size-4 text-slate-400" />}
                  </button>
                  
                  {expandCanned && (
                    <div className="p-3 space-y-2.5">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                        <input
                          type="text"
                          value={cannedQuery}
                          onChange={(e) => setCannedQuery(e.target.value)}
                          placeholder="Tìm phản hồi nhanh..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 placeholder-slate-400"
                        />
                      </div>

                      <div className="space-y-1.5">
                        {filteredCannedAnswers.map((reply, idx) => (
                          <div
                            key={idx}
                            onClick={() => setChatDraft((prev) => prev ? prev + "\n" + reply : reply)}
                            className="p-2 text-[11px] text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors cursor-pointer text-left break-words font-medium"
                          >
                            {reply}
                          </div>
                        ))}
                        {filteredCannedAnswers.length === 0 && (
                          <p className="text-center text-[11px] text-slate-400 py-2">Không tìm thấy phản hồi phù hợp.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </ScrollArea>
          </div>
        )}

      </div>

      {viewingImageUrl && (
        <div
          className="fixed inset-0 z-[2500] flex items-center justify-center bg-slate-950/80 p-6"
          onClick={() => setViewingImageUrl(null)}
        >
          <button
            type="button"
            className="absolute right-5 top-5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
            onClick={(event) => {
              event.stopPropagation();
              setViewingImageUrl(null);
            }}
          >
            Đóng
          </button>
          <Image
            src={viewingImageUrl}
            alt="Ảnh đính kèm"
            width={1200}
            height={800}
            unoptimized
            className="max-h-[86vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </PageShell>
  );
}
