"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  FileDown,
  FileText,
  Kanban,
  List,
  Pencil,
  Plus,
  Search,
  Table2,
  TrendingUp,
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

const pageSize = 10;
const statuses: Array<ReportStatus | "Tất cả"> = ["Tất cả", "Bật", "Tắt"];

const seedReports: ReportRow[] = [
  { id: "BC-101", name: "Doanh thu ngày", category: "Doanh thu", range: "Hôm nay", owner: "Quản lý", format: "Excel", schedule: "22:00 mỗi ngày", status: "Bật", note: "Gửi email quản lý" },
  { id: "BC-102", name: "Công nợ tuần", category: "Tài chính", range: "7 ngày", owner: "Thu ngân", format: "Excel", schedule: "Thứ 2 hàng tuần", status: "Bật", note: "Lọc đơn chưa thu đủ" },
  { id: "BC-103", name: "Tồn kho tháng", category: "Kho", range: "Tháng này", owner: "Kho", format: "PDF", schedule: "Ngày 1 mỗi tháng", status: "Bật", note: "Kèm vật tư sắp hết" },
  { id: "BC-104", name: "Top khách hàng", category: "CRM", range: "30 ngày", owner: "Admin", format: "PDF", schedule: "Thủ công", status: "Tắt", note: "Dùng cho khuyến mãi" },
  { id: "BC-105", name: "Hiệu suất nhân viên", category: "Vận hành", range: "Tuần này", owner: "Quản lý", format: "Excel", schedule: "Chủ nhật", status: "Bật", note: "Theo đơn hoàn thành" },
];

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
  const [reports, setReports] = useState(seedReports);
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | "Tất cả">("Tất cả");
  const [page, setPage] = useState(1);
  const [openForm, setOpenForm] = useState(false);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyReportForm);
  const range = useDashboardTimeRangeStore((state) => state.range);
  const rangeLabel = formatRange(normalizeRange(range));

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
            {(["Bảng", "Bảng kéo", "Danh sách"] as const).map((label) => {
              const Icon = label === "Bảng" ? Table2 : label === "Bảng kéo" ? Kanban : List;
              return <button key={label} type="button" className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${label === "Bảng" ? "text-slate-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"}`}><Icon className="size-3.5" />{label}</button>;
            })}
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

        <div className="flex-1 overflow-auto">
          <Table className="w-full table-fixed text-xs [&_td:not(:first-child)]:border-l [&_td:not(:first-child)]:border-slate-100">
            <TableHeader>
              <TableRow className="h-9 border-b border-slate-100 bg-slate-50 hover:bg-slate-50">
                <TableHead className="w-[104px] pl-4 text-xs font-medium text-slate-600">Mã</TableHead>
                <TableHead className="w-[176px] border-l border-slate-100 text-xs font-medium text-slate-600">Tên báo cáo</TableHead>
                <TableHead className="w-[112px] border-l border-slate-100 text-xs font-medium text-slate-600">Nhóm</TableHead>
                <TableHead className="w-[104px] border-l border-slate-100 text-xs font-medium text-slate-600">Kỳ</TableHead>
                <TableHead className="w-[100px] border-l border-slate-100 text-xs font-medium text-slate-600">Phụ trách</TableHead>
                <TableHead className="w-[80px] border-l border-slate-100 text-xs font-medium text-slate-600">Định dạng</TableHead>
                <TableHead className="w-[140px] border-l border-slate-100 text-xs font-medium text-slate-600">Lịch chạy</TableHead>
                <TableHead className="w-[86px] border-l border-slate-100 text-xs font-medium text-slate-600">Trạng thái</TableHead>
                <TableHead className="w-[170px] border-l border-slate-100 text-xs font-medium text-slate-600">Ghi chú</TableHead>
                <TableHead className="w-[108px] border-l border-slate-100 px-4 text-xs font-medium text-slate-600">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedReports.map((report) => (
                <TableRow key={report.id} className="h-9 border-b border-slate-100 text-slate-700 hover:bg-slate-50/60">
                  <TableCell className="pl-4 font-medium text-slate-900">{report.id}</TableCell>
                  <TableCell className="font-medium text-slate-900">{report.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs font-medium" style={{ color: categoryColor[report.category], backgroundColor: `${categoryColor[report.category]}14` }}>
                      <span className="size-1.5 rounded-full" style={{ backgroundColor: categoryColor[report.category] }} />
                      {report.category}
                    </span>
                  </TableCell>
                  <TableCell>{report.range}</TableCell>
                  <TableCell>{report.owner}</TableCell>
                  <TableCell>{report.format}</TableCell>
                  <TableCell>{report.schedule}</TableCell>
                  <TableCell><StatusPill label={report.status} /></TableCell>
                  <TableCell className="truncate text-slate-500">{report.note}</TableCell>
                  <TableCell className="px-4">
                    <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 hover:bg-slate-50" onClick={() => openEditForm(report)}>
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
            <div className="flex flex-wrap items-center gap-3"><span>Số dòng mỗi trang</span><button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50">{pageSize}<ChevronDown className="size-3.5" /></button><span className="text-slate-400">{filteredReports.length === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredReports.length)} trong {filteredReports.length} dòng</span></div>
            <div className="flex items-center justify-end gap-1"><button type="button" className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40" disabled={page <= 1} onClick={() => setPage(1)}><ChevronsLeft className="size-4" /></button><button type="button" className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40" disabled={page <= 1} onClick={() => setPage((current) => Math.max(current - 1, 1))}><ChevronDown className="size-4 rotate-90" /></button><span className="px-3 text-sm font-medium text-slate-700">{page} / {pageCount || 1}</span><button type="button" className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(current + 1, pageCount))}><ChevronDown className="size-4 -rotate-90" /></button><button type="button" className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40" disabled={page >= pageCount} onClick={() => setPage(pageCount || 1)}><ChevronsRight className="size-4" /></button></div>
          </div>
        </div>
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
