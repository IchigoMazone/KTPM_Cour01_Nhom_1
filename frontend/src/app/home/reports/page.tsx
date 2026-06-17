"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  ChevronDown,
  FileDown,
  FileText,
  Pencil,
  Plus,
  Search,
  TrendingUp,
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
import { listHomeResource } from "@/src/lib/home-api";
import { HomeTableContentSkeleton } from "@/src/components/common/auth-guard";

type ReportStatus = "Bật" | "Tắt";
type ReportCategory = "Doanh thu" | "Tài chính" | "Kho" | "CRM" | "Vận hành";

type ReportRow = {
  id: string;
  name: string;
  category: ReportCategory;
  range: string;
  owner: string;
  format: string;
  schedule: string;
  status: ReportStatus;
  note: string;
};

type HomeDailyReportRow = {
  report_id: string;
  report_date: string;
  total_orders: number;
  completed_orders: number;
  open_tickets: number;
  revenue: number;
  expense: number;
};

const pageSize = 10;
const columns: DashboardTableColumn[] = [
  { id: "id", label: "Mã", width: 104, visible: true },
  { id: "name", label: "Tên báo cáo", width: 176, visible: true },
  { id: "category", label: "Nhóm", width: 112, visible: true },
  { id: "range", label: "Kỳ", width: 104, visible: true },
  { id: "owner", label: "Phụ trách", width: 100, visible: true },
  { id: "format", label: "Định dạng", width: 80, visible: true },
  { id: "schedule", label: "Lịch chạy", width: 140, visible: true },
  { id: "status", label: "Trạng thái", width: 86, visible: true },
  { id: "note", label: "Ghi chú", width: 170, visible: true },
  { id: "actions", label: "Thao tác", width: 108, visible: true },
];
const statuses: Array<ReportStatus | "Tất cả"> = ["Tất cả", "Bật", "Tắt"];

function mapHomeDailyReport(row: HomeDailyReportRow): ReportRow {
  const reportDate = row.report_date?.slice(0, 10) || "";
  return {
    id: `BC-${reportDate.replaceAll("-", "") || row.report_id.slice(0, 6)}`,
    name: `Báo cáo ngày ${reportDate || "mới nhất"}`,
    category: "Vận hành",
    range: reportDate,
    owner: "Hệ thống",
    format: "Excel",
    schedule: "22:00 mỗi ngày",
    status: "Bật",
    note: `${Number(row.completed_orders || 0)}/${Number(row.total_orders || 0)} đơn hoàn thành, ${Number(row.open_tickets || 0)} ticket mở, doanh thu ${Number(row.revenue || 0).toLocaleString("vi-VN")}đ`,
  };
}

const emptyReportForm = {
  name: "",
  category: "Doanh thu" as ReportCategory,
  range: "",
  owner: "",
  format: "Excel",
  schedule: "",
  status: "Bật" as ReportStatus,
  note: "",
};

const categoryColor: Record<ReportCategory, string> = {
  "Doanh thu": "#059669",
  "Tài chính": "#d97706",
  "Kho": "#2563eb",
  "CRM": "#7c3aed",
  "Vận hành": "#0f766e",
};

const statusColor: Record<ReportStatus, { text: string; bg: string }> = {
  "Bật": { text: "#059669", bg: "rgba(5,150,105,0.09)" },
  "Tắt": { text: "#64748b", bg: "rgba(100,116,139,0.1)" },
};

function StatusPill({ label }: { label: ReportStatus }) {
  const color = statusColor[label];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium" style={{ color: color.text, backgroundColor: color.bg }}>
      <span className="size-1.5 rounded-full" style={{ backgroundColor: color.text }} />
      {label}
    </span>
  );
}

function MetricCard({ title, value, hint, icon: Icon, color }: { title: string; value: string; hint: string; icon: typeof TrendingUp; color: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg" style={{ color, backgroundColor: `${color}14` }}>
          <Icon className="size-3.5" />
        </span>
        <p className="truncate text-xs font-semibold text-slate-900">{title}</p>
      </div>
      <p className="mt-3 text-xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 truncate text-xs text-slate-400">{hint}</p>
    </div>
  );
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | "Tất cả">("Tất cả");
  const [page, setPage] = useState(1);
  const [openForm, setOpenForm] = useState(false);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyReportForm);
  const [openPageSizeMenu, setOpenPageSizeMenu] = useState(false);
  const [customPageSize, setCustomPageSize] = useState("");
  const range = useDashboardTimeRangeStore((state) => state.range);
  const rangeLabel = formatRange(normalizeRange(range));

  useEffect(() => {
    let alive = true;
    listHomeResource<HomeDailyReportRow>("daily-reports", { limit: 500 })
      .then((response) => {
        if (!alive) return;
        setReports(response.items.map(mapHomeDailyReport));
      })
      .catch(() => {
        if (alive) setReports([]);
      })
      .finally(() => {
        if (alive) setIsDataLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const source = `${report.id} ${report.name} ${report.category} ${report.owner} ${report.format} ${report.schedule} ${report.note}`;
      const matchQuery = source.toLowerCase().includes(query.toLowerCase());
      const matchStatus = selectedStatus === "Tất cả" || report.status === selectedStatus;
      return matchQuery && matchStatus;
    });
  }, [query, reports, selectedStatus]);

  const pageCount = Math.ceil(filteredReports.length / pageSize);
  const paginatedReports = filteredReports.slice((page - 1) * pageSize, page * pageSize);
  const totalVisibleWidth = columns.reduce((sum, column) => sum + (column.width || 150), 0);

  const openCreateForm = () => {
    setEditingReportId(null);
    setForm(emptyReportForm);
    setOpenForm(true);
  };

  const openEditForm = (report: ReportRow) => {
    setEditingReportId(report.id);
    setForm({
      name: report.name,
      category: report.category,
      range: report.range,
      owner: report.owner,
      format: report.format,
      schedule: report.schedule,
      status: report.status,
      note: report.note,
    });
    setOpenForm(true);
  };

  const saveReport = () => {
    if (!form.name.trim()) return;
    const payload: Omit<ReportRow, "id"> = {
      name: form.name,
      category: form.category,
      range: form.range || rangeLabel,
      owner: form.owner || "Quản lý",
      format: form.format || "Excel",
      schedule: form.schedule || "Thủ công",
      status: form.status,
      note: form.note,
    };

    if (editingReportId) {
      setReports((prev) => prev.map((report) => report.id === editingReportId ? { ...report, ...payload } : report));
    } else {
      setReports((prev) => [{ id: `BC-${Date.now().toString().slice(-3)}`, ...payload }, ...prev]);
    }

    setPage(1);
    setOpenForm(false);
  };

  const renderReportCell = (report: ReportRow, column: DashboardTableColumn) => {
    if (column.id === "id") return <TableCell key={column.id} className="pl-4 font-medium text-slate-900">{report.id}</TableCell>;
    if (column.id === "name") return <TableCell key={column.id} className="font-medium text-slate-900">{report.name}</TableCell>;
    if (column.id === "category") {
      return (
        <TableCell key={column.id}>
          <span className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs font-medium" style={{ color: categoryColor[report.category], backgroundColor: `${categoryColor[report.category]}14` }}>
            <span className="size-1.5 rounded-full" style={{ backgroundColor: categoryColor[report.category] }} />
            {report.category}
          </span>
        </TableCell>
      );
    }
    if (column.id === "range") return <TableCell key={column.id}>{report.range}</TableCell>;
    if (column.id === "owner") return <TableCell key={column.id}>{report.owner}</TableCell>;
    if (column.id === "format") return <TableCell key={column.id}>{report.format}</TableCell>;
    if (column.id === "schedule") return <TableCell key={column.id}>{report.schedule}</TableCell>;
    if (column.id === "status") return <TableCell key={column.id}><StatusPill label={report.status} /></TableCell>;
    if (column.id === "note") return <TableCell key={column.id} className="truncate text-slate-500" title={report.note}>{report.note}</TableCell>;
    return (
      <TableCell key={column.id} className="px-4">
        <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 hover:bg-slate-50" onClick={() => openEditForm(report)}>
          <Pencil className="size-3.5" />
          Sửa
        </button>
      </TableCell>
    );
  };

  if (isDataLoading) {
    return <HomeTableContentSkeleton />;
  }

  return (
    <PageShell fullHeight>
      <div className="grid shrink-0 gap-3 md:grid-cols-4">
        <MetricCard title="Báo cáo đang chạy" value={`${reports.filter((item) => item.status === "Bật").length}`} hint={`Theo ${rangeLabel}`} icon={TrendingUp} color="#2563eb" />
        <MetricCard title="Lịch tự động" value={`${reports.filter((item) => item.schedule !== "Thủ công").length}`} hint="Email, Excel, PDF" icon={CalendarClock} color="#059669" />
        <MetricCard title="Định dạng Excel" value={`${reports.filter((item) => item.format === "Excel").length}`} hint="Phù hợp đối soát" icon={FileDown} color="#d97706" />
        <MetricCard title="Định dạng PDF" value={`${reports.filter((item) => item.format === "PDF").length}`} hint="Phù hợp in ấn" icon={FileText} color="#7c3aed" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 pt-1 pb-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-1">
            <ViewModeTabs value="Bảng" onChange={() => {}} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1 xl:w-64 xl:flex-none">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
              <Input className="h-8 rounded-md border-slate-200 bg-white pl-8 text-xs text-slate-700 shadow-none placeholder:text-slate-500 focus-visible:ring-slate-200" placeholder="Tìm báo cáo, người phụ trách..." value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
            </div>
            <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-slate-50"><FileDown className="size-3.5" />Excel</button>
            <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-slate-50"><FileText className="size-3.5" />PDF</button>
            <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50" onClick={openCreateForm}>
              Thêm báo cáo
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
          rows={paginatedReports}
          pageSize={pageSize}
          emptyMessage="Không tìm thấy báo cáo phù hợp."
          totalVisibleWidth={totalVisibleWidth}
          renderCell={renderReportCell}
        />
        <DashboardTableFooter
          page={page}
          pageCount={pageCount}
          pageSize={pageSize}
          totalRows={filteredReports.length}
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
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 px-6 py-4"><CardTitle className="text-base font-semibold">{editingReportId ? `Chỉnh sửa ${editingReportId}` : "Thêm báo cáo mới"}</CardTitle><button type="button" className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" onClick={() => setOpenForm(false)}><X className="size-5" /></button></CardHeader>
            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
              <div className="space-y-2"><Label>Tên báo cáo</Label><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Doanh thu ngày" /></div>
              <div className="space-y-2"><Label>Nhóm báo cáo</Label><Input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as ReportCategory })} placeholder="Doanh thu / Tài chính / Kho..." /></div>
              <div className="space-y-2"><Label>Kỳ dữ liệu</Label><Input value={form.range} onChange={(event) => setForm({ ...form, range: event.target.value })} placeholder={rangeLabel} /></div>
              <div className="space-y-2"><Label>Phụ trách</Label><Input value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })} placeholder="Quản lý" /></div>
              <div className="space-y-2"><Label>Định dạng</Label><Input value={form.format} onChange={(event) => setForm({ ...form, format: event.target.value })} placeholder="Excel / PDF" /></div>
              <div className="space-y-2"><Label>Lịch chạy</Label><Input value={form.schedule} onChange={(event) => setForm({ ...form, schedule: event.target.value })} placeholder="22:00 mỗi ngày" /></div>
              <div className="space-y-2 md:col-span-2"><Label>Trạng thái</Label><div className="flex gap-2">{(["Bật", "Tắt"] as ReportStatus[]).map((status) => <button key={status} type="button" onClick={() => setForm({ ...form, status })} className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-medium ${form.status === status ? "bg-slate-900 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{status}</button>)}</div></div>
              <div className="space-y-2 md:col-span-2"><Label>Ghi chú</Label><Textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Điều kiện lọc, người nhận, mục đích sử dụng..." /></div>
              <Button className="md:col-span-2 h-10 rounded-lg bg-slate-900 font-semibold text-white hover:bg-slate-800" onClick={saveReport}>Lưu báo cáo</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </PageShell>
  );
}
