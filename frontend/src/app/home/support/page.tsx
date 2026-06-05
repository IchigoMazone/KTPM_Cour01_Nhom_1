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
import { PageShell } from "../_components/dashboard-primitives";
import { Toolbar } from "../_components/toolbar";
import { FilterBar, type FilterOption } from "../_components/filter-bar";
import { TableView } from "../_components/table-view";
import { KanbanView, type KanbanColumn } from "../_components/kanban-view";
import { ListView } from "../_components/list-view";
import { AddColumnDialog } from "../_components/add-column-dialog";
import {
  DashboardDataTable,
  DashboardSelectionBar,
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

const initialPageSize = 10;
const defaultColumns: DashboardTableColumn[] = [
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
  const [columns, setColumns] = useState<DashboardTableColumn[]>(defaultColumns);
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
  const [form, setForm] = useState(emptyForm);
  const [openPageSizeMenu, setOpenPageSizeMenu] = useState(false);
  const [customPageSize, setCustomPageSize] = useState("");
  const [openAddColumn, setOpenAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [selectedTicketIds, setSelectedTicketIds] = useState<Set<string>>(new Set());
  const range = useDashboardTimeRangeStore((state) => state.range);
  const rangeLabel = formatRange(normalizeRange(range));
  const checkboxClass =
    "relative size-4 appearance-none rounded-[5px] border border-slate-300 bg-white transition-all duration-150 checked:border-emerald-300 checked:bg-emerald-300 after:absolute after:left-1/2 after:top-1/2 after:hidden after:h-[9px] after:w-[5px] after:-translate-x-1/2 after:-translate-y-[58%] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:content-[''] checked:after:block";

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
  const totalVisibleWidth = columns.filter((column) => column.visible !== false).reduce((sum, column) => sum + (column.width || 150), 0);
  const visibleTicketIds = useMemo(
    () => (viewMode === "Bảng kéo" ? filteredTickets : paginatedTickets).map((ticket) => ticket.id),
    [filteredTickets, paginatedTickets, viewMode]
  );
  const allVisibleTicketsSelected = visibleTicketIds.length > 0 && visibleTicketIds.every((id) => selectedTicketIds.has(id));
  const selectedVisibleTicketCount = visibleTicketIds.filter((id) => selectedTicketIds.has(id)).length;

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
    const headers = columns.filter((column) => column.visible !== false && column.id !== "actions").map((column) => column.label);
    const values = filteredTickets.map((ticket) =>
      columns.filter((column) => column.visible !== false && column.id !== "actions").map((column) => String((ticket as Record<string, unknown>)[column.id] ?? ""))
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
      const next = [...prev];
      const actionIndex = next.findIndex((column) => column.id === "actions");
      next.splice(actionIndex === -1 ? next.length : actionIndex, 0, newColumn);
      return next;
    });
    setNewColumnName("");
    setOpenAddColumn(false);
  };

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
    if (column.id === "id") return (
      <TableCell key={column.id} className="pl-4 font-medium text-slate-900">
        <div className="flex items-center gap-2">
          <input type="checkbox" aria-label={`Chọn ticket ${ticket.id}`} checked={selectedTicketIds.has(ticket.id)} onChange={() => toggleTicket(ticket.id)} className={`shrink-0 ${checkboxClass}`} />
          <span>{ticket.id}</span>
        </div>
      </TableCell>
    );
    if (column.id === "type") return <TableCell key={column.id}>{ticket.type}</TableCell>;
    if (column.id === "customer") return <TableCell key={column.id} className="font-medium text-slate-900">{ticket.customer}</TableCell>;
    if (column.id === "phone") return <TableCell key={column.id}><a href={`tel:${ticket.phone}`} className="text-slate-500 hover:text-slate-800">{ticket.phone}</a></TableCell>;
    if (column.id === "orderId") return <TableCell key={column.id}>{ticket.orderId}</TableCell>;
    if (column.id === "priority") return <TableCell key={column.id}><span className="font-medium" style={{ color: priorityColor[ticket.priority] }}>{ticket.priority}</span></TableCell>;
    if (column.id === "owner") return <TableCell key={column.id}>{ticket.owner}</TableCell>;
    if (column.id === "status") return <TableCell key={column.id}><StatusPill label={ticket.status} /></TableCell>;
    if (column.id === "createdAt") return <TableCell key={column.id} className="text-slate-500">{ticket.createdAt}</TableCell>;
    if (column.id === "note") return <TableCell key={column.id} className="truncate text-slate-500" title={ticket.note}>{ticket.note}</TableCell>;
    if (column.id === "actions") return (
      <TableCell key={column.id} className="px-4">
        <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 hover:bg-slate-50" onClick={() => openEditForm(ticket)}>
          <Pencil className="size-3.5" />
          Sửa
        </button>
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
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-700">{ticket.customer}</p>
            <p className="truncate text-[11px] text-slate-400">{ticket.id} · {ticket.type}</p>
          </div>
        </div>
        <span className="font-medium text-xs" style={{ color: priorityColor[ticket.priority] }}>{ticket.priority}</span>
      </div>
      <p className="mt-2 line-clamp-2 text-xs text-slate-500">{ticket.note}</p>
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
        <span className="truncate text-[11px] text-slate-400">{ticket.owner}</span>
        <button type="button" className="inline-flex h-6 items-center rounded-md bg-slate-100 px-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200" onClick={() => openEditForm(ticket)}>
          Chi tiết
        </button>
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
              <p className="font-semibold text-slate-950">{ticket.customer}</p>
              <span className="text-xs font-medium text-slate-400">{ticket.id}</span>
              <StatusPill label={ticket.status} />
              <span className="font-medium text-xs" style={{ color: priorityColor[ticket.priority] }}>{ticket.priority}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>{ticket.phone}</span>
              <span>{ticket.orderId}</span>
              <span>{ticket.owner}</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">{ticket.note}</p>
          </div>
        </div>
        <button type="button" className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-slate-50" onClick={() => openEditForm(ticket)}>
          <Pencil className="size-3.5" />
          Sửa
        </button>
      </div>
    </div>
  );

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
          columns={columns}
          onColumnsChange={setColumns}
          tableResizeMode={tableResizeMode}
          onTableResizeModeChange={setTableResizeMode}
          selectedCount={selectedTicketIds.size}
          onOpenAddColumn={() => setOpenAddColumn(true)}
          onOpenHistory={() => {}}
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

        {viewMode === "Bảng" ? (
          <TableView
            columns={columns}
            rows={paginatedTickets}
            pageSize={pageSize}
            emptyMessage="Không tìm thấy ticket phù hợp."
            tableResizeMode={tableResizeMode}
            totalVisibleWidth={totalVisibleWidth}
            renderCell={renderTicketCell}
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
              setTickets((prev) => prev.map((ticket) => ticket.id === id ? { ...ticket, status: status as TicketStatus } : ticket));
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
