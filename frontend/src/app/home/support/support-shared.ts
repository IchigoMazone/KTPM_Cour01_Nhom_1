export type TicketStatus = "Chưa xử lý" | "Đang xử lý" | "Đã giải quyết";
export type Priority = "Cao" | "Trung bình" | "Thấp";

export type Ticket = {
  id: string;
  dbId?: string;
  type: string;
  subject: string;
  customerCode: string;
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

export type SupportMessage = {
  id: string;
  ticketId: string;
  sender: "customer" | "staff";
  senderName: string;
  avatar?: string;
  content: string;
  imageUrl?: string;
  fileAttachment?: {
    name: string;
    size: string;
    type: string;
    url: string;
  };
  createdAt: string;
};

export type HomeSupportTicketRow = {
  ticket_id: string;
  ticket_code: string;
  type: string;
  subject: string;
  status: TicketStatus;
  priority: Priority;
  wash_date?: string;
  created_at?: string;
  note?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_code?: string;
  order_code?: string;
  assigned_name?: string;
  assigned_avatar?: string;
  messages?: HomeSupportMessageRow[];
};

export type HomeSupportMessageRow = {
  message_id: string;
  sender_role: "customer" | "staff";
  sender_name: string;
  sender_avatar?: string;
  content: string;
  image_url?: string;
  file_attachment?: SupportMessage["fileAttachment"];
  reply_to?: { id: string; sender: "customer" | "staff"; content: string };
  reaction?: string;
  revoked?: boolean;
  created_at: string;
};

export function mapHomeTicket(row: HomeSupportTicketRow): Ticket {
  return {
    id: row.ticket_code,
    dbId: row.ticket_id,
    type: row.type,
    subject: row.subject,
    customerCode: row.customer_code || "",
    customer: row.customer_name || "Khách hàng",
    phone: row.customer_phone || "",
    orderId: row.order_code || "",
    priority: row.priority || "Trung bình",
    owner: row.assigned_name || "Chưa gán",
    ownerAvatar: row.assigned_avatar || "",
    status: row.status || "Chưa xử lý",
    washDate: row.wash_date || "",
    createdAt: row.created_at?.slice(0, 10) || "",
    note: row.note || row.subject || "",
  };
}

export function mapHomeMessages(row: HomeSupportTicketRow): SupportMessage[] {
  return (row.messages || []).map((message) => ({
    id: message.message_id,
    ticketId: row.ticket_code,
    sender: message.sender_role,
    senderName: message.sender_name,
    avatar: message.sender_avatar,
    content: message.content,
    imageUrl: message.image_url,
    fileAttachment: message.file_attachment,
    createdAt: message.created_at,
  }));
}

export const statusColor: Record<TicketStatus, { text: string; bg: string }> = {
  "Chưa xử lý": { text: "#2563eb", bg: "rgba(37,99,235,0.09)" },
  "Đang xử lý": { text: "#d97706", bg: "rgba(217,119,6,0.09)" },
  "Đã giải quyết": { text: "#059669", bg: "rgba(5,150,105,0.09)" },
};

export const priorityColor: Record<Priority, { text: string; bg: string }> = {
  "Cao": { text: "#dc2626", bg: "rgba(220,38,38,0.09)" },
  "Trung bình": { text: "#d97706", bg: "rgba(217,119,6,0.09)" },
  "Thấp": { text: "#2563eb", bg: "rgba(37,99,235,0.09)" },
};

export function formatReadableDate(dateStr?: string) {
  if (!dateStr) return "-";
  if (dateStr.includes("/")) return dateStr;
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
}

export function formatMessageTime(timeStr?: string) {
  if (!timeStr) return "Vừa xong";
  try {
    if (timeStr.includes(" ") || timeStr.includes(",")) {
      const timePart = timeStr.split(/\s+/).find((part) => /^\d{2}:\d{2}/.test(part));
      if (timePart) {
        const parts = timePart.split(":");
        if (parts[0] && parts[1]) {
          return `${parts[0].padStart(2, "0")}:${parts[1].slice(0, 2)}`;
        }
      }
    }
    if (timeStr.length === 10 && timeStr.includes("-")) {
      return "08:00";
    }
  } catch (e) {
    // ignore
  }
  return timeStr;
}

export const quickReplies = [
  "Chào anh/chị, em có thể giúp gì cho anh/chị ạ?",
  "Live chat hỗ trợ hoạt động từ 8h00 - 22h00 hàng ngày.",
  "Dạ bên em xin lỗi vì sự cố này, shop đang kiểm tra lại đơn giặt và sẽ phản hồi lại ngay ạ.",
  "Đơn hàng của anh/chị đã hoàn thành và đang được chuẩn bị giao.",
  "Vui lòng click vào link này để xem chính sách bồi thường và hoàn trả của cửa hàng.",
  "Nếu anh/chị còn câu hỏi nào khác, xin vui lòng nhắn lại để em hỗ trợ thêm ạ."
];
