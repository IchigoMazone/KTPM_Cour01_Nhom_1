"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { MessageSquare, Phone, Send, ShieldCheck, TicketCheck, HelpCircle, ArrowUpRight, RotateCcw, X, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TableCell } from "@/components/ui/table";
import { PageShell } from "@/src/app/home/_components/dashboard-primitives";
import { Toolbar } from "@/src/app/home/_components/toolbar";
import { FilterBar, type FilterOption } from "@/src/app/home/_components/filter-bar";
import { TableView } from "@/src/app/home/_components/table-view";
import type { DashboardTableColumn } from "@/src/components/common/dashboard-data-table";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import { formatRange, normalizeRange } from "@/src/utils/dashboard-time";
import { initialOrders } from "@/src/app/user/orders/data";

interface ChatMessage {
  sender: "user" | "cskh";
  text: string;
  time: string;
}

interface Ticket {
  id: string;
  topic: string;
  orderCode: string;
  time: string;
  status: "Đang xử lý" | "Đã phản hồi" | "Đã đóng";
  type: string;
  messages: ChatMessage[];
}

const initialTickets: Ticket[] = [
  {
    id: "HT-309",
    topic: "Giao trễ đơn hàng DH-1048",
    orderCode: "DH-1048",
    time: "08/06/2026 09:20",
    status: "Đang xử lý",
    type: "delivery",
    messages: [
      { sender: "user", text: "Chào shop, đơn DH-1048 hẹn giao sáng nay nhưng giờ vẫn chưa thấy shipper gọi điện.", time: "08/06/2026 09:20" },
      { sender: "cskh", text: "Dạ BegauShop xin chào chị Hương! Shop đã nhận được yêu cầu và đang liên hệ điều phối tài xế giao hàng. Shop sẽ báo lại chị ngay khi có thông tin ạ.", time: "08/06/2026 09:25" }
    ]
  },
  {
    id: "HT-288",
    topic: "Cập nhật lại địa chỉ giao nhận",
    orderCode: "DH-1039",
    time: "05/06/2026 15:40",
    status: "Đã phản hồi",
    type: "order",
    messages: [
      { sender: "user", text: "Mình muốn đổi địa chỉ nhận đồ đơn DH-1039 sang số 15 Lê Lợi nhé shop.", time: "05/06/2026 15:40" },
      { sender: "cskh", text: "Dạ BegauShop đã cập nhật địa chỉ giao của đơn DH-1039 sang 15 Lê Lợi thành công rồi ạ! Shipper sẽ giao theo địa chỉ mới này nha chị.", time: "05/06/2026 15:45" }
    ]
  },
];

const faqs = [
  { q: "Tôi có thể đổi lịch lấy đồ sau khi đặt không?", a: "Có thể đổi lịch trước giờ lấy đồ tối thiểu 2 tiếng qua mục Đặt lịch của tôi hoặc gọi trực tiếp tổng đài CSKH." },
  { q: "Giá cuối cùng được tính như thế nào?", a: "Giá được tính dựa trên cân nặng thực tế sau khi nhận đồ và phân loại tại quầy của nhân viên BegauShop." },
  { q: "Nếu thất luật hoặc hư hại đồ thì xử lý ra sao?", a: "BegauShop cam kết đền bù lên đến 10 lần giá trị gói giặt sấy đối với các sự cố thất lạc hoặc hư hại theo chính sách bảo hiểm." },
  { q: "Tôi có thể xuất hóa đơn điện tử không?", a: "Có, vui lòng chọn tùy chọn 'Yêu cầu hóa đơn GTGT' khi thanh toán hoặc cung cấp mã số thuế cho CSKH trong vòng 24h từ khi hoàn tất đơn." },
];

const defaultColumns: DashboardTableColumn[] = [
  { id: "id", label: "Mã yêu cầu", width: 120, visible: true },
  { id: "topic", label: "Tiêu đề yêu cầu", width: 220, visible: true },
  { id: "orderCode", label: "Đơn liên quan", width: 140, visible: true },
  { id: "time", label: "Thời gian tạo", width: 150, visible: true },
  { id: "status", label: "Trạng thái", width: 130, visible: true },
  { id: "actions", label: "Thao tác", width: 150, visible: true },
];

const statusOptions: FilterOption[] = [
  { id: "Tất cả", label: "Tất cả", color: "#64748b", bgColor: "rgba(100,116,139,0.09)" },
  { id: "Đang xử lý", label: "Đang xử lý", color: "#f59e0b", bgColor: "rgba(245,158,11,0.08)" },
  { id: "Đã phản hồi", label: "Đã phản hồi", color: "#10b981", bgColor: "rgba(16,185,129,0.08)" },
  { id: "Đã đóng", label: "Đã đóng", color: "#64748b", bgColor: "rgba(100,116,139,0.09)" },
];

const checkboxClass =
  "relative size-4 appearance-none rounded-[5px] border border-slate-300 bg-white transition-all checked:border-emerald-300 checked:bg-emerald-300 after:absolute after:left-1/2 after:top-1/2 after:hidden after:h-[9px] after:w-[5px] after:-translate-x-1/2 after:-translate-y-[58%] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:content-[''] checked:after:block";

const statusStyle: Record<string, { color: string; bg: string }> = {
  "Đang xử lý": { color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  "Đã phản hồi": { color: "#10b981", bg: "rgba(16,185,129,0.08)" },
  "Đã đóng": { color: "#64748b", bg: "rgba(100,116,139,0.09)" },
};

function KpiCard({
  title,
  value,
  hint,
  change,
  icon: Icon,
  color,
  onClick,
}: {
  title: string;
  value: string;
  hint: string;
  change: string;
  icon: any;
  color: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg border border-slate-200 bg-white p-3 ${
        onClick ? "cursor-pointer transition-all hover:bg-slate-50 active:scale-[0.98]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg" style={{ color, backgroundColor: `${color}14` }}>
            <Icon className="size-3.5" />
          </span>
          <p className="text-xs font-semibold text-slate-900">{title}</p>
        </div>
        <ArrowUpRight className="size-3.5 text-slate-400" />
      </div>
      <p className="mt-3 text-xl font-semibold tracking-tight text-slate-950">{value}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="truncate text-xs text-slate-400">{hint}</span>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ color, backgroundColor: `${color}12` }}
        >
          {change}
        </span>
      </div>
    </div>
  );
}

export default function UserSupportPage() {
  const range = useDashboardTimeRangeStore((state) => state.range);
  const normalizedRange = normalizeRange(range);
  const rangeLabel = formatRange(normalizedRange);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [columns, setColumns] = useState<DashboardTableColumn[]>(defaultColumns);
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [tableResizeMode, setTableResizeMode] = useState<"fit" | "custom">("fit");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [customPageSize, setCustomPageSize] = useState("");
  const [openPageSizeMenu, setOpenPageSizeMenu] = useState(false);

  // Modals
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);

  // Form states
  const [type, setType] = useState("order");
  const [orderCode, setOrderCode] = useState("none");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Chat conversation
  const [chatOpen, setChatOpen] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeTicket = useMemo(() => tickets.find((t) => t.id === activeTicketId) || null, [tickets, activeTicketId]);

  useEffect(() => {
    if (chatOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatOpen, activeTicket?.messages]);

  const filteredTickets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const matchesStatus = selectedStatus === "Tất cả" || ticket.status === selectedStatus;
      const matchesQuery =
        !normalizedQuery ||
        [ticket.id, ticket.topic, ticket.orderCode, ticket.time, ticket.status]
          .filter(Boolean)
          .some((val) => String(val).toLowerCase().includes(normalizedQuery));

      // Parse ticket date "DD/MM/YYYY HH:mm"
      const [datePart] = ticket.time.split(" ");
      const [day, month, year] = datePart.split("/").map(Number);
      const ticketDate = new Date(year, month - 1, day);
      const matchRange = ticketDate >= normalizedRange.start && ticketDate <= normalizedRange.end;

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

  const getFormattedTime = () => {
    const now = new Date();
    const pad = (v: number) => String(v).padStart(2, "0");
    return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  };

  const submitRequest = () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Vui lòng nhập đầy đủ tiêu đề và mô tả chi tiết.");
      setSubmitConfirmOpen(false);
      return;
    }

    const ticketId = `HT-${Math.floor(Math.random() * 900) + 100}`;
    const newTicket: Ticket = {
      id: ticketId,
      topic: title.trim(),
      orderCode: orderCode === "none" ? "Không có" : orderCode,
      time: getFormattedTime(),
      status: "Đang xử lý",
      type,
      messages: [{ sender: "user", text: content.trim(), time: getFormattedTime() }],
    };

    setTickets((prev) => [newTicket, ...prev]);
    setType("order");
    setOrderCode("none");
    setTitle("");
    setContent("");
    setSubmitConfirmOpen(false);
    setNewRequestOpen(false);
    toast.success(`Gửi yêu cầu thành công! Mã yêu cầu: ${ticketId}`);
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !activeTicketId) return;
    const userMsgText = replyText.trim();
    const timeStr = getFormattedTime();

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === activeTicketId) {
          return {
            ...t,
            status: "Đang xử lý",
            messages: [...t.messages, { sender: "user", text: userMsgText, time: timeStr }],
          };
        }
        return t;
      })
    );
    setReplyText("");

    setTimeout(() => {
      setTickets((prev) =>
        prev.map((t) => {
          if (t.id === activeTicketId) {
            return {
              ...t,
              status: "Đã phản hồi",
              messages: [
                ...t.messages,
                {
                  sender: "cskh",
                  text: "Dạ BegauShop đã nhận được phản hồi từ chị. Shop đã chuyển yêu cầu này sang nhân viên xử lý đơn, shop sẽ phản hồi chi tiết lại cho chị ngay sau ít phút nhé.",
                  time: getFormattedTime(),
                },
              ],
            };
          }
          return t;
        })
      );
    }, 1200);
  };

  const closeTicket = (id: string) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: "Đã đóng" } : t)));
    toast.success(`Đã đóng yêu cầu hỗ trợ ${id}.`);
  };

  const handleBulkClose = () => {
    const selectedActive = tickets.filter((t) => selectedIds.has(t.id) && t.status !== "Đã đóng");
    if (selectedActive.length === 0) {
      toast.error("Không có yêu cầu nào đang mở để đóng.");
      return;
    }
    setTickets((prev) => prev.map((t) => (selectedIds.has(t.id) ? { ...t, status: "Đã đóng" } : t)));
    toast.success(`Đã đóng thành công ${selectedActive.length} yêu cầu hỗ trợ.`);
    setSelectedIds(new Set());
  };

  const renderCell = (ticket: Ticket, column: DashboardTableColumn) => {
    if (column.id === "id") {
      return (
        <TableCell key={column.id} className="pl-4 font-semibold text-slate-800">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              className={checkboxClass}
              checked={selectedIds.has(ticket.id)}
              onChange={() => toggleTicket(ticket.id)}
              onClick={(e) => e.stopPropagation()}
            />
            <span>{ticket.id}</span>
          </div>
        </TableCell>
      );
    }
    if (column.id === "topic") {
      return (
        <TableCell key={column.id} className="font-semibold text-slate-900 truncate">
          {ticket.topic}
        </TableCell>
      );
    }
    if (column.id === "orderCode") {
      return (
        <TableCell key={column.id} className="font-mono text-xs text-slate-600">
          {ticket.orderCode !== "Không có" ? (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium">{ticket.orderCode}</span>
          ) : (
            <span className="text-slate-400">Không liên kết</span>
          )}
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
              onClick={() => {
                setActiveTicketId(ticket.id);
                setChatOpen(true);
              }}
              className="inline-flex h-7 items-center rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Trò chuyện
            </button>
            {ticket.status !== "Đã đóng" && (
              <button
                type="button"
                onClick={() => closeTicket(ticket.id)}
                className="inline-flex h-7 items-center rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                Đóng
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
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <div className="flex min-h-0 flex-1 flex-col gap-4 px-5 pt-5 pb-0">
          {/* KPI Dashboard Card Grid */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Tổng yêu cầu"
              value={String(tickets.length)}
              hint="Lịch sử hỗ trợ"
              change="Yêu cầu"
              icon={TicketCheck}
              color="#3b82f6"
            />
            <KpiCard
              title="Đang xử lý"
              value={String(tickets.filter((t) => t.status === "Đang xử lý").length)}
              hint="Đang tiếp nhận giải quyết"
              change="Tiến trình"
              icon={RotateCcw}
              color="#f59e0b"
            />
            <KpiCard
              title="Đã phản hồi"
              value={String(tickets.filter((t) => t.status === "Đã phản hồi").length)}
              hint="BegauShop phản hồi"
              change="Phản hồi"
              icon={MessageSquare}
              color="#10b981"
            />
            <KpiCard
              title="Đường dây nóng"
              value="1900 8989"
              hint="Hotline hỗ trợ 24/7"
              change="Gọi ngay"
              icon={Phone}
              color="#ec4899"
              onClick={() => {
                toast.success("Đang kết nối cuộc gọi thoại đến Hotline 1900 8989...");
              }}
            />
          </div>

          {/* Full-width Ticket Table View */}
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
              onCreateClick={() => setNewRequestOpen(true)}
              createLabel="Gửi yêu cầu"
              defaultColumnIds={defaultColumns.map((col) => col.id)}
              searchPlaceholder="Tìm mã yêu cầu, tiêu đề..."
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
          </div>
        </div>
      </div>

      {/* Dialog Gửi Yêu Cầu Mới */}
      <Dialog open={newRequestOpen} onOpenChange={setNewRequestOpen}>
        <DialogContent className="max-w-[460px] gap-0 rounded-xl border border-slate-200 bg-white p-0 shadow-lg">
          <DialogHeader className="gap-2 px-5 pb-3 pt-5">
            <DialogTitle className="text-base font-semibold text-slate-900">Gửi yêu cầu hỗ trợ mới</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Điền các thông tin dưới đây để được hỗ trợ giải quyết nhanh nhất.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-5 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Loại yêu cầu</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-9 border-slate-200 bg-white text-xs rounded-lg">
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="order">Vấn đề đơn hàng</SelectItem>
                    <SelectItem value="delivery">Giao nhận đồ</SelectItem>
                    <SelectItem value="payment">Thanh toán</SelectItem>
                    <SelectItem value="quality">Chất lượng giặt</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Đơn hàng liên quan</Label>
                <Select value={orderCode} onValueChange={setOrderCode}>
                  <SelectTrigger className="h-9 border-slate-200 bg-white text-xs rounded-lg">
                    <SelectValue placeholder="Chọn đơn hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không liên kết</SelectItem>
                    {initialOrders.map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.id} ({order.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Tiêu đề yêu cầu</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Không áp dụng được voucher..."
                className="h-9 border-slate-200 text-xs rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Nội dung chi tiết</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Mô tả cụ thể sự cố hoặc yêu cầu cần BegauShop hỗ trợ..."
                className="min-h-[100px] border-slate-200 text-xs rounded-lg"
              />
            </div>
          </div>

          <DialogFooter className="m-0 flex-row justify-end gap-2 rounded-b-xl border-t border-slate-100 bg-slate-50 px-4 py-3">
            <DialogClose asChild>
              <Button variant="outline" className="h-8 border-slate-200 text-xs">
                Huỷ
              </Button>
            </DialogClose>
            <Button
              className="h-8 bg-slate-950 text-xs text-white hover:bg-slate-800"
              onClick={() => setSubmitConfirmOpen(true)}
            >
              Gửi yêu cầu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Submission */}
      <Dialog open={submitConfirmOpen} onOpenChange={setSubmitConfirmOpen}>
        <DialogContent
          className="max-w-[400px] gap-0 rounded-xl border border-slate-200 bg-white p-0 shadow-lg"
          showCloseButton={false}
        >
          <DialogHeader className="gap-3 px-5 pb-4 pt-5">
            <div className="flex items-center gap-2 text-slate-900">
              <Info className="size-5 text-indigo-500" />
              <DialogTitle className="text-base font-semibold">Xác nhận gửi</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-slate-500">
              Yêu cầu hỗ trợ sẽ được chuyển trực tiếp đến hệ thống chăm sóc khách hàng BegauShop.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="m-0 flex-row justify-end gap-2 rounded-b-xl border-t border-slate-100 bg-slate-50 px-4 py-3">
            <DialogClose asChild>
              <Button variant="outline" className="h-8 border-slate-200 text-xs">
                Huỷ
              </Button>
            </DialogClose>
            <Button className="h-8 bg-slate-950 text-xs text-white hover:bg-slate-800" onClick={submitRequest}>
              Xác nhận
            </Button>
          </DialogFooter>
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

          <div className="h-[280px] overflow-y-auto bg-slate-50/50 p-4 space-y-3.5">
            {activeTicket?.messages.map((msg, index) => {
              const isUser = msg.sender === "user";
              return (
                <div key={index} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                  <span className="text-[9px] text-slate-400 mb-1 px-1">
                    {isUser ? "Bạn" : "Hỗ trợ khách hàng"} · {msg.time}
                  </span>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm ${
                      isUser
                        ? "bg-slate-900 text-white rounded-tr-none"
                        : "bg-white border border-slate-200/80 text-slate-800 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {activeTicket?.status !== "Đã đóng" ? (
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
