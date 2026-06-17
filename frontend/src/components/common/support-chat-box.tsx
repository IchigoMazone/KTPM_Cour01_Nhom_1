"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Image, Maximize2, Reply, RotateCcw, Send, Smile, ThumbsUp, Trash2, X } from "lucide-react";
import EmojiPicker, { type EmojiClickData, Theme } from "emoji-picker-react";

export type SupportChatSender = "customer" | "staff";

export type SupportChatMessage = {
  id: string;
  sender: SupportChatSender;
  content: string;
  time: string;
  timestamp?: string;
  avatarUrl?: string;
  imageUrl?: string;
  replyTo?: { id: string; sender: SupportChatSender; content: string };
  reaction?: string;
  revoked?: boolean;
  deletedForMe?: boolean;
};

export type SupportChatConversation = {
  id: string;
  name: string;
  avatarUrl?: string;
  ticketCode?: string;
  orderCode?: string;
  messages: SupportChatMessage[];
};

type SupportChatBoxProps = {
  conversation?: SupportChatConversation | null;
  currentSender: SupportChatSender;
  fallbackName?: string;
  emptyMessage?: string;
  disabled?: boolean;
  disabledPlaceholder?: string;
  className?: string;
  showMeta?: boolean;
  onClose: () => void;
  onSendMessage: (content: string, replyTo?: SupportChatMessage | null) => void | Promise<void>;
  onSendImage?: (file: File, replyTo?: SupportChatMessage | null) => void | Promise<void>;
  onReactMessage?: (message: SupportChatMessage, reaction: string) => void | Promise<void>;
  onRevokeMessage?: (message: SupportChatMessage) => void | Promise<void>;
};

const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "😡"];

function initialsOf(name: string, fallback: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || fallback;
}

function messageTimeLabel(message: SupportChatMessage) {
  if (!message.timestamp) return message.time;
  const date = new Date(message.timestamp);
  if (Number.isNaN(date.getTime())) return message.time;
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function SupportChatBox({
  conversation,
  currentSender,
  fallbackName = "Admin hỗ trợ",
  emptyMessage = "Chưa có cuộc trò chuyện.",
  disabled = false,
  disabledPlaceholder = "Không thể gửi tin nhắn",
  className = "fixed bottom-2 right-2.5 z-[2200] flex h-[min(460px,calc(100vh-4rem))] w-[min(330px,calc(100vw-1.25rem))] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white",
  showMeta = true,
  onClose,
  onSendMessage,
  onSendImage,
  onReactMessage,
  onRevokeMessage,
}: SupportChatBoxProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const messageTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState("");
  const [replyingTo, setReplyingTo] = useState<SupportChatMessage | null>(null);
  const [actionMessage, setActionMessage] = useState<SupportChatMessage | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [inputExpanded, setInputExpanded] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, Partial<SupportChatMessage>>>({});

  const displayMessages = useMemo(
    () => (conversation?.messages || [])
      .map((message) => ({ ...message, ...(overrides[message.id] || {}) }))
      .filter((message) => !message.deletedForMe),
    [conversation?.messages, overrides],
  );
  const initials = initialsOf(conversation?.name || fallbackName, currentSender === "staff" ? "KH" : "AD");

  useEffect(() => {
    requestAnimationFrame(() => {
      chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, [displayMessages.length, conversation?.id]);

  useEffect(() => {
    const textarea = messageTextareaRef.current;
    if (!textarea) return;
    textarea.style.height = "36px";
    const nextHeight = Math.min(textarea.scrollHeight, 128);
    textarea.style.height = `${nextHeight}px`;
    setInputExpanded(nextHeight > 44);
  }, [draft]);

  useEffect(() => {
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
  }, [emojiPickerOpen]);

  const updateMessage = (messageId: string, updater: (message: SupportChatMessage) => Partial<SupportChatMessage>) => {
    const message = displayMessages.find((item) => item.id === messageId);
    if (!message) return;
    setOverrides((current) => ({
      ...current,
      [messageId]: { ...(current[messageId] || {}), ...updater(message) },
    }));
  };

  const reactToMessage = async (messageId: string, reaction: string) => {
    const message = displayMessages.find((item) => item.id === messageId);
    if (!message) return;
    if (onReactMessage) {
      await onReactMessage(message, reaction);
    } else {
      updateMessage(messageId, (currentMessage) => ({ reaction: currentMessage.reaction === reaction ? undefined : reaction }));
    }
    setActionMessage(null);
  };

  const copyMessage = (message: SupportChatMessage) => {
    const text = message.imageUrl ? message.imageUrl : message.content;
    if (text) void navigator.clipboard?.writeText(text);
    setActionMessage(null);
  };

  const revokeMessage = async (messageId: string) => {
    const message = displayMessages.find((item) => item.id === messageId);
    if (!message) return;
    if (onRevokeMessage) {
      await onRevokeMessage(message);
    } else {
      updateMessage(messageId, () => ({
      content: "Tin nhắn đã được thu hồi",
      imageUrl: undefined,
      replyTo: undefined,
      reaction: undefined,
      revoked: true,
      }));
    }
    setActionMessage(null);
  };

  const deleteMessageForMe = (messageId: string) => {
    updateMessage(messageId, () => ({ deletedForMe: true }));
    setActionMessage(null);
  };

  const scrollToRepliedMessage = (messageId: string) => {
    const element = document.getElementById(`chat-message-${messageId}`);
    if (!element) return;
    element.scrollIntoView({ block: "center", behavior: "smooth" });
    setHighlightedMessageId(messageId);
    window.setTimeout(() => setHighlightedMessageId((current) => current === messageId ? null : current), 1200);
  };

  const submitMessage = async (content: string) => {
    const text = content.trim();
    if (!conversation || !text || disabled) return;
    setDraft("");
    setEmojiPickerOpen(false);
    await onSendMessage(text, replyingTo);
    setReplyingTo(null);
  };

  const selectImageFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !conversation || disabled) return;
    if (onSendImage) {
      await onSendImage(file, replyingTo);
      setReplyingTo(null);
      return;
    }
    setPreviewImage(URL.createObjectURL(file));
  };

  const selectEmoji = (emoji: EmojiClickData) => {
    setDraft((current) => `${current}${emoji.emoji}`);
  };

  return (
    <>
      <div ref={panelRef} className={className}>
        <div className="flex h-14 shrink-0 items-center gap-1 border-b border-slate-200 px-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-600">
            {conversation?.avatarUrl ? (
              <img src={conversation.avatarUrl} alt={conversation.name} className="size-full rounded-full object-cover" />
            ) : initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold text-slate-950">
              {conversation?.name || fallbackName}
            </span>
            {showMeta && (conversation?.ticketCode || conversation?.orderCode) ? (
              <span className="block truncate text-[11px] text-slate-400">
                {[conversation?.ticketCode, conversation?.orderCode].filter(Boolean).join(" · ")}
              </span>
            ) : null}
          </span>
          <button
            type="button"
            className="grid size-7 place-items-center rounded-lg text-[#7c2cff] hover:bg-violet-50"
            onClick={() => {
              setPreviewImage(null);
              setEmojiPickerOpen(false);
              setReplyingTo(null);
              onClose();
            }}
            aria-label="Đóng tin nhắn"
          >
            <X className="size-3.5" />
          </button>
        </div>

        <div ref={chatScrollRef} className="min-h-0 flex-1 overflow-y-auto bg-white px-3 py-3">
          {!conversation ? (
            <div className="flex h-full items-center justify-center px-6 text-center text-xs text-slate-400">
              {emptyMessage}
            </div>
          ) : (
            <div className="space-y-1">
              {displayMessages.map((message, index, messages) => {
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
                const isMine = message.sender === currentSender;
                const isEmojiOnly = Boolean(message.content)
                  && !/[A-Za-zÀ-ỹ0-9]/u.test(message.content)
                  && Array.from(message.content).length <= 6;

                return (
                  <div
                    key={message.id}
                    id={`chat-message-${message.id}`}
                    className={`${startsNewSenderGroup ? "pt-2" : ""} ${message.reaction ? "pb-5" : ""} rounded-lg transition-shadow ${highlightedMessageId === message.id ? "shadow-[0_0_0_2px_rgba(37,99,235,0.35)]" : ""}`}
                  >
                    {showTimeDivider && (
                      <div className="my-3 text-center">
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[10px] font-medium text-slate-500">
                          {messageTimeLabel(message)}
                        </span>
                      </div>
                    )}
                    <div className={`group flex items-end gap-1.5 ${isMine ? "justify-end" : "justify-start"}`}>
                      {!isMine && (
                        <span className={`grid size-6 shrink-0 place-items-center rounded-full bg-slate-200 text-[8px] font-semibold text-slate-600 ${isLastInGroup ? "" : "invisible"}`}>
                          {message.avatarUrl || conversation.avatarUrl ? (
                            <img
                              src={message.avatarUrl || conversation.avatarUrl}
                              alt={conversation.name}
                              className="size-full rounded-full object-cover"
                            />
                          ) : initials}
                        </span>
                      )}
                      {message.imageUrl ? (
                        <span className={`relative flex max-w-[78%] flex-col ${isMine ? "items-end" : "items-start"}`}>
                          {message.replyTo && (
                            <button
                              type="button"
                              className="mb-1.5 block max-w-full border-l-2 border-blue-500 bg-slate-50/80 px-2 py-1 text-left text-[11px] leading-4 text-slate-500"
                              onClick={() => scrollToRepliedMessage(message.replyTo?.id || "")}
                            >
                              <span className="block font-medium text-slate-600">
                                {message.replyTo.sender === currentSender ? "Bạn" : conversation.name}
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
                            <img src={message.imageUrl} alt="Ảnh trong đoạn chat" className="max-h-44 w-full object-cover" />
                          </button>
                          {isLastInGroup && <span className="mt-1 px-1 text-[10px] text-slate-400">{message.time}</span>}
                          {message.reaction && (
                            <span className={`absolute -bottom-4 grid size-6 place-items-center rounded-full border bg-white text-xs shadow-sm ${isMine ? "right-1 border-blue-200" : "right-1 border-slate-200"}`}>
                              {message.reaction}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className={`relative min-w-0 max-w-[78%] ${isMine ? "items-end" : "items-start"}`}>
                          <div
                            role="button"
                            tabIndex={0}
                            className={`block rounded-lg border px-2.5 text-left leading-5 ${
                              isMine
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
                                  {message.replyTo.sender === currentSender ? "Bạn" : conversation.name}
                                </span>
                                <span className="block max-w-40 truncate">{message.replyTo.content}</span>
                              </button>
                            )}
                            <span className={`block whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${message.revoked ? "text-slate-400" : ""}`}>{message.content}</span>
                            {isLastInGroup && (
                              <span className={`${isEmojiOnly ? "mt-1.5" : "mt-0.5"} block text-[10px] leading-3 ${isMine ? "text-blue-400" : "text-slate-400"}`}>
                                {message.time}
                              </span>
                            )}
                          </div>
                          {message.reaction && (
                            <span className={`absolute -bottom-4 grid size-6 place-items-center rounded-full border bg-white text-xs shadow-sm ${isMine ? "right-1 border-blue-200" : "right-1 border-slate-200"}`}>
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
          )}
        </div>

        {replyingTo && (
          <div className="flex shrink-0 items-center gap-2 border-t border-slate-200 bg-slate-50 px-3 py-2">
            <span className="min-w-0 flex-1 border-l-2 border-blue-500 pl-2">
              <span className="block text-[11px] font-semibold text-blue-600">
                Đang trả lời {replyingTo.sender === currentSender ? "bạn" : conversation?.name || fallbackName}
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
            void submitMessage(draft);
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
            className="mb-0 grid size-9 shrink-0 place-items-center rounded-lg text-blue-600 transition-colors hover:bg-blue-50 disabled:text-slate-300"
            aria-label="Chọn ảnh"
            disabled={disabled || !conversation}
            onClick={() => imageInputRef.current?.click()}
          >
            <Image className="size-5 fill-blue-600 text-white" strokeWidth={2} />
          </button>
          <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={selectImageFile} />
          <label className="relative min-w-0 flex-1 overflow-hidden">
            <textarea
              ref={messageTextareaRef}
              value={draft}
              disabled={disabled || !conversation}
              onChange={(event) => setDraft(event.target.value.slice(0, 200))}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void submitMessage(draft);
                }
              }}
              rows={1}
              maxLength={200}
              className={`block max-h-32 min-h-9 w-full min-w-0 resize-none overflow-y-auto border-0 bg-slate-100 py-2 pl-9 pr-3 text-[13px] leading-5 text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:bg-slate-50 disabled:text-slate-400 whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${inputExpanded ? "rounded-lg" : "rounded-full"}`}
              placeholder={disabled || !conversation ? disabledPlaceholder : "Tin nhắn"}
            />
          </label>
          <button
            ref={emojiButtonRef}
            type="button"
            className="absolute bottom-2 left-14 grid size-9 place-items-center rounded-lg text-blue-600 transition-colors hover:bg-blue-50 disabled:text-slate-300"
            aria-label="Chọn biểu cảm"
            disabled={disabled || !conversation}
            onClick={() => setEmojiPickerOpen((current) => !current)}
          >
            <Smile className="size-5 fill-blue-600 text-white" strokeWidth={2} />
          </button>
          {!draft.trim() && (
            <button
              type="button"
              className="mb-0 grid size-9 shrink-0 place-items-center rounded-lg text-blue-600 transition-colors hover:bg-blue-50 disabled:text-slate-300"
              aria-label="Gửi lượt thích"
              disabled={disabled || !conversation}
              onClick={() => void submitMessage("👍")}
            >
              <ThumbsUp className="size-6 fill-blue-600 text-white" strokeWidth={2} />
            </button>
          )}
          <button
            type="submit"
            className={`mb-0 size-9 shrink-0 place-items-center rounded-lg text-blue-600 transition-colors hover:bg-blue-50 disabled:text-slate-300 ${draft.trim() ? "grid" : "hidden"}`}
            disabled={disabled || !conversation || !draft.trim()}
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
                    onClick={() => void reactToMessage(actionMessage.id, reaction)}
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
                {actionMessage.sender === currentSender && (
                  <button
                    type="button"
                    className="grid size-8 place-items-center rounded-md text-orange-500 transition-colors hover:bg-blue-100/70"
                    onClick={() => void revokeMessage(actionMessage.id)}
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
}
