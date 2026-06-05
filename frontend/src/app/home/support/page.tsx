"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  ChevronDown,
  FileDown,
  MessageCircle,
  Pencil,
  Plus,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TableCell } from "@/components/ui/table";
import { PageShell, ViewModeTabs } from "../_components/dashboard-primitives";
import {
  DashboardDataTable,
  DashboardTableFooter,
  type DashboardTableColumn,
} from "@/src/components/common/dashboard-data-table";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import { formatRange, normalizeRange } from "@/src/utils/dashboard-time";

type TicketStatus = "Mới" | "Đang xử lý" | "Đã giải quyết";
type Priority = "Cao" | "Trung bình" | "Thấp";

type Ticket = {
  id: string;
  type: string;
  customer: string;
  phone: string;
  orderId: string;
  priority: Priority;
  owner: string;
  status: TicketStatus;
  createdAt: string;
  note: string;
};

const pageSize = 10;
const columns: DashboardTableColumn[] = [
  { id: "id", label: "Mã", width: 104, visible: true },
  { id: "type", label: "Loại", width: 112, visible: true },
  { id: "customer", label: "Khách hàng", width: 150, visible: true },
  { id: "phone", label: "SĐT", width: 116, visible: true },
  { id: "orderId", label: "Đơn", width: 96, visible: true },
  { id: "priority", label: "Ưu tiên", width: 96, visible: true },
  { id: "owner", label: "Phụ trách", width: 104, visible: true },
  { id: "status", label: "Trạng thái", width: 116, visible: true },
  { id: "createdAt", label: "Ngày tạo", width: 104, visible: true },
  { id: "note", label: "Nội dung", width: 240, visible: true },
  { id: "actions", label: "Thao tác", width: 108, visible: true },
];
const statuses: Array<TicketStatus | "Tất cả"> = ["Tất cả", "Mới", "Đang xử lý", "Đã giải quyết"];

const seedTickets: Ticket[] = [
  { id: "HT-501", type: "Mất đồ", customer: "Nguyễn Văn A", phone: "0903123456", orderId: "DH-1022", priority: "Cao", owner: "Quản lý", status: "Đang xử lý", createdAt: "2026-05-29", note: "Thiếu 1 tất đen" },
  { id: "HT-502", type: "Giao trễ", customer: "Trần Thị B", phone: "0912456789", orderId: "DH-1031", priority: "Trung bình", owner: "Tài xế C", status: "Mới", createdAt: "2026-05-29", note: "Trễ 45 phút so với lịch hẹn" },
  { id: "HT-503", type: "Hỏng đồ", customer: "Phạm Lan", phone: "0938123456", orderId: "DH-1036", priority: "Cao", owner: "Admin", status: "Đã giải quyết", createdAt: "2026-05-28", note: "Đền bù theo chính sách" },
  { id: "HT-504", type: "Thanh toán", customer: "Shop Linen", phone: "0283999888", orderId: "DH-1061", priority: "Thấp", owner: "Thu ngân", status: "Đang xử lý", createdAt: "2026-05-27", note: "Đối soát chuyển khoản" },
];

const emptyForm = {
  type: "",
  customer: "",
  phone: "",
  orderId: "",
  priority: "Trung bình" as Priority,
  owner: "",
  status: "Mới" as TicketStatus,
  createdAt: "",
  note: "",
};

const statusColor: Record<TicketStatus, { text: string; bg: string }> = {
  "Mới": { text: "#2563eb", bg: "rgba(37,99,235,0.09)" },
  "Đang xử lý": { text: "#d97706", bg: "rgba(217,119,6,0.09)" },
  "Đã giải quyết": { text: "#059669", bg: "rgba(5,150,105,0.09)" },
};

const priorityColor: Record<Priority, string> = {
  "Cao": "#dc2626",
  "Trung bình": "#d97706",
  "Thấp": "#2563eb",
};

function StatusPill({ label }: { label: TicketStatus }) {
  const color = statusColor[label];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium" style={{ color: color.text, backgroundColor: color.bg }}>
      <span className="size-1.5 rounded-full" style={{ backgroundColor: color.text }} />
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

export default function SupportPage() {
  const [tickets, setTickets] = useState(seedTickets);
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | "Tất cả">("Tất cả");
  const [page, setPage] = useState(1);
  const [openForm, setOpenForm] = useState(false);
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [openPageSizeMenu, setOpenPageSizeMenu] = useState(false);
  const [customPageSize, setCustomPageSize] = useState("");
  const range = useDashboardTimeRangeStore((state) => state.range);
  const rangeLabel = formatRange(normalizeRange(range));

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const source = `${ticket.id} ${ticket.type} ${ticket.customer} ${ticket.phone} ${ticket.orderId} ${ticket.owner} ${ticket.note}`;
      const matchQuery = source.toLowerCase().includes(query.toLowerCase());
      const matchStatus = selectedStatus === "Tất cả" || ticket.status === selectedStatus;
      return matchQuery && matchStatus;
    });
  }, [query, selectedStatus, tickets]);

  const pageCount = Math.ceil(filteredTickets.length / pageSize);
  const paginatedTickets = filteredTickets.slice((page - 1) * pageSize, page * pageSize);
  const totalVisibleWidth = columns.reduce((sum, column) => sum + (column.width || 150), 0);

  const openCreateForm = () => {
    setEditingTicketId(null);
    setForm({ ...emptyForm, createdAt: new Date().toISOString().slice(0, 10) });
    setOpenForm(true);
  };

  const openEditForm = (ticket: Ticket) => {
    setEditingTicketId(ticket.id);
    setForm(ticket);
    setOpenForm(true);
  };

  const saveTicket = () => {
    if (!form.type.trim() || !form.customer.trim()) return;
    const payload: Omit<Ticket, "id"> = {
      type: form.type,
      customer: form.customer,
      phone: form.phone,
      orderId: form.orderId || "-",
      priority: form.priority,
      owner: form.owner || "Quản lý",
      status: form.status,
      createdAt: form.createdAt || new Date().toISOString().slice(0, 10),
      note: form.note,
    };

    if (editingTicketId) {
      setTickets((prev) => prev.map((ticket) => ticket.id === editingTicketId ? { ...ticket, ...payload } : ticket));
    } else {
      setTickets((prev) => [{ id: `HT-${Date.now().toString().slice(-3)}`, ...payload }, ...prev]);
    }

    setPage(1);
    setOpenForm(false);
  };

  const renderTicketCell = (ticket: Ticket, column: DashboardTableColumn) => {
    if (column.id === "id") return <TableCell key={column.id} className="pl-4 font-medium text-slate-900">{ticket.id}</TableCell>;
    if (column.id === "type") return <TableCell key={column.id}>{ticket.type}</TableCell>;
    if (column.id === "customer") return <TableCell key={column.id} className="font-medium text-slate-900">{ticket.customer}</TableCell>;
    if (column.id === "phone") return <TableCell key={column.id}><a href={`tel:${ticket.phone}`} className="text-slate-500 hover:text-slate-800">{ticket.phone}</a></TableCell>;
    if (column.id === "orderId") return <TableCell key={column.id}>{ticket.orderId}</TableCell>;
    if (column.id === "priority") return <TableCell key={column.id}><span className="font-medium" style={{ color: priorityColor[ticket.priority] }}>{ticket.priority}</span></TableCell>;
    if (column.id === "owner") return <TableCell key={column.id}>{ticket.owner}</TableCell>;
    if (column.id === "status") return <TableCell key={column.id}><StatusPill label={ticket.status} /></TableCell>;
    if (column.id === "createdAt") return <TableCell key={column.id} className="text-slate-500">{ticket.createdAt}</TableCell>;
    if (column.id === "note") return <TableCell key={column.id} className="truncate text-slate-500" title={ticket.note}>{ticket.note}</TableCell>;
    return (
      <TableCell key={column.id} className="px-4">
        <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 hover:bg-slate-50" onClick={() => openEditForm(ticket)}>
          <Pencil className="size-3.5" />
          Sửa
        </button>
      </TableCell>
    );
  };

  return (
    <PageShell fullHeight>
      <div className="grid shrink-0 gap-3 md:grid-cols-4">
        <MetricCard title="Ticket mở" value={`${tickets.filter((item) => item.status !== "Đã giải quyết").length}`} hint={`Theo ${rangeLabel}`} color="#2563eb" />
        <MetricCard title="Ưu tiên cao" value={`${tickets.filter((item) => item.priority === "Cao").length}`} hint="Cần xử lý trước" color="#dc2626" />
        <MetricCard title="Đang xử lý" value={`${tickets.filter((item) => item.status === "Đang xử lý").length}`} hint="Có người phụ trách" color="#d97706" />
        <MetricCard title="Đã giải quyết" value={`${tickets.filter((item) => item.status === "Đã giải quyết").length}`} hint="Đã đóng ticket" color="#059669" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 pt-1 pb-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-1">
            <ViewModeTabs value="Bảng" onChange={() => {}} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1 xl:w-64 xl:flex-none">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
              <Input className="h-8 rounded-md border-slate-200 bg-white pl-8 text-xs text-slate-700 shadow-none placeholder:text-slate-500 focus-visible:ring-slate-200" placeholder="Tìm khách, mã đơn, nội dung..." value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
            </div>
            <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-slate-50"><FileDown className="size-3.5" />Xuất file</button>
            <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50" onClick={openCreateForm}>
              Thêm ticket
              <ChevronDown className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-5 py-3">
          <button type="button" className="inline-flex h-7 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 text-xs text-slate-700 transition-colors hover:bg-slate-50"><CalendarClock className="size-3.5" />{rangeLabel}<ChevronDown className="size-3.5" /></button>
          {statuses.map((item) => {
            const active = selectedStatus === item;
            return <button key={item} type="button" onClick={() => { setSelectedStatus(item); setPage(1); }} className={`inline-flex h-7 items-center rounded-full px-2.5 text-xs font-medium transition-colors ${active ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>{item}</button>;
          })}
          <button type="button" className="inline-flex h-7 items-center gap-1.5 px-2 text-xs text-slate-500 transition-colors hover:text-slate-700"><Plus className="size-3.5" />Thêm bộ lọc</button>
        </div>

        <DashboardDataTable
          columns={columns}
          rows={paginatedTickets}
          pageSize={pageSize}
          emptyMessage="Không tìm thấy ticket phù hợp."
          totalVisibleWidth={totalVisibleWidth}
          renderCell={renderTicketCell}
        />
        <DashboardTableFooter
          page={page}
          pageCount={pageCount}
          pageSize={pageSize}
          totalRows={filteredTickets.length}
          customPageSize={customPageSize}
          openPageSizeMenu={openPageSizeMenu}
          onOpenPageSizeMenuChange={setOpenPageSizeMenu}
          onCustomPageSizeChange={setCustomPageSize}
          onApplyCustomPageSize={() => setCustomPageSize("")}
          onUpdatePageSize={() => setOpenPageSizeMenu(false)}
          onPageChange={setPage}
        />
      </div>

      {openForm && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <Card className="max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-2xl border-0 bg-white shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 px-6 py-4"><CardTitle className="text-base font-semibold">{editingTicketId ? `Chỉnh sửa ${editingTicketId}` : "Thêm ticket hỗ trợ"}</CardTitle><button type="button" className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" onClick={() => setOpenForm(false)}><X className="size-5" /></button></CardHeader>
            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
              <div className="space-y-2"><Label>Loại hỗ trợ</Label><Input value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} placeholder="Mất đồ / Giao trễ" /></div>
              <div className="space-y-2"><Label>Khách hàng</Label><Input value={form.customer} onChange={(event) => setForm({ ...form, customer: event.target.value })} placeholder="Tên khách" /></div>
              <div className="space-y-2"><Label>Số điện thoại</Label><Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="090..." /></div>
              <div className="space-y-2"><Label>Mã đơn</Label><Input value={form.orderId} onChange={(event) => setForm({ ...form, orderId: event.target.value })} placeholder="DH-1022" /></div>
              <div className="space-y-2"><Label>Ưu tiên</Label><Input value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as Priority })} placeholder="Cao / Trung bình / Thấp" /></div>
              <div className="space-y-2"><Label>Phụ trách</Label><Input value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })} placeholder="Quản lý" /></div>
              <div className="space-y-2"><Label>Ngày tạo</Label><Input type="date" value={form.createdAt} onChange={(event) => setForm({ ...form, createdAt: event.target.value })} /></div>
              <div className="space-y-2"><Label>Trạng thái</Label><Input value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as TicketStatus })} placeholder="Mới / Đang xử lý / Đã giải quyết" /></div>
              <div className="space-y-2 md:col-span-2"><Label>Nội dung xử lý</Label><Textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Mô tả vấn đề, phương án xử lý, bồi thường..." /></div>
              <Button className="md:col-span-2 h-10 rounded-lg bg-slate-900 font-semibold text-white hover:bg-slate-800" onClick={saveTicket}>Lưu ticket</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </PageShell>
  );
}
