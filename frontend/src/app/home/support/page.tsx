"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  FileDown,
  Kanban,
  List,
  MessageCircle,
  Pencil,
  Plus,
  Search,
  Table2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageShell } from "../_components/dashboard-primitives";
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
            {(["Bảng", "Bảng kéo", "Danh sách"] as const).map((label) => {
              const Icon = label === "Bảng" ? Table2 : label === "Bảng kéo" ? Kanban : List;
              return <button key={label} type="button" className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${label === "Bảng" ? "text-slate-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"}`}><Icon className="size-3.5" />{label}</button>;
            })}
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

        <div className="flex-1 overflow-auto">
          <Table className="w-full table-fixed text-xs [&_td:not(:first-child)]:border-l [&_td:not(:first-child)]:border-slate-100">
            <TableHeader>
              <TableRow className="h-9 border-b border-slate-100 bg-slate-50 hover:bg-slate-50">
                <TableHead className="w-[104px] pl-4 text-xs font-medium text-slate-600">Mã</TableHead>
                <TableHead className="w-[112px] border-l border-slate-100 text-xs font-medium text-slate-600">Loại</TableHead>
                <TableHead className="w-[150px] border-l border-slate-100 text-xs font-medium text-slate-600">Khách hàng</TableHead>
                <TableHead className="w-[116px] border-l border-slate-100 text-xs font-medium text-slate-600">SĐT</TableHead>
                <TableHead className="w-[96px] border-l border-slate-100 text-xs font-medium text-slate-600">Đơn</TableHead>
                <TableHead className="w-[96px] border-l border-slate-100 text-xs font-medium text-slate-600">Ưu tiên</TableHead>
                <TableHead className="w-[104px] border-l border-slate-100 text-xs font-medium text-slate-600">Phụ trách</TableHead>
                <TableHead className="w-[116px] border-l border-slate-100 text-xs font-medium text-slate-600">Trạng thái</TableHead>
                <TableHead className="w-[104px] border-l border-slate-100 text-xs font-medium text-slate-600">Ngày tạo</TableHead>
                <TableHead className="w-[240px] border-l border-slate-100 text-xs font-medium text-slate-600">Nội dung</TableHead>
                <TableHead className="w-[108px] border-l border-slate-100 px-4 text-xs font-medium text-slate-600">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTickets.map((ticket) => (
                <TableRow key={ticket.id} className="h-9 border-b border-slate-100 text-slate-700 hover:bg-slate-50/60">
                  <TableCell className="pl-4 font-medium text-slate-900">{ticket.id}</TableCell>
                  <TableCell>{ticket.type}</TableCell>
                  <TableCell className="font-medium text-slate-900">{ticket.customer}</TableCell>
                  <TableCell><a href={`tel:${ticket.phone}`} className="text-slate-500 hover:text-slate-800">{ticket.phone}</a></TableCell>
                  <TableCell>{ticket.orderId}</TableCell>
                  <TableCell><span className="font-medium" style={{ color: priorityColor[ticket.priority] }}>{ticket.priority}</span></TableCell>
                  <TableCell>{ticket.owner}</TableCell>
                  <TableCell><StatusPill label={ticket.status} /></TableCell>
                  <TableCell className="text-slate-500">{ticket.createdAt}</TableCell>
                  <TableCell className="truncate text-slate-500">{ticket.note}</TableCell>
                  <TableCell className="px-4">
                    <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 hover:bg-slate-50" onClick={() => openEditForm(ticket)}>
                      <Pencil className="size-3.5" />
                      Sửa
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="border-t border-slate-200 px-5 pt-3 pb-1">
          <div className="flex flex-col gap-3 text-xs text-slate-700 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3"><span>Số dòng mỗi trang</span><button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50">{pageSize}<ChevronDown className="size-3.5" /></button><span className="text-slate-400">{filteredTickets.length === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredTickets.length)} trong {filteredTickets.length} dòng</span></div>
            <div className="flex items-center justify-end gap-1"><button type="button" className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40" disabled={page <= 1} onClick={() => setPage(1)}><ChevronsLeft className="size-4" /></button><button type="button" className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40" disabled={page <= 1} onClick={() => setPage((current) => Math.max(current - 1, 1))}><ChevronDown className="size-4 rotate-90" /></button><span className="px-3 text-sm font-medium text-slate-700">{page} / {pageCount || 1}</span><button type="button" className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(current + 1, pageCount))}><ChevronDown className="size-4 -rotate-90" /></button><button type="button" className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40" disabled={page >= pageCount} onClick={() => setPage(pageCount || 1)}><ChevronsRight className="size-4" /></button></div>
          </div>
        </div>
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
