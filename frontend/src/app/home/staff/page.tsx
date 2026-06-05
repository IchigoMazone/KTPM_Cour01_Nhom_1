"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  ChevronDown,
  Clock,
  EyeOff,
  FileDown,
  Package,
  Pencil,
  Plus,
  Search,
  Settings,
  TrendingUp,
  Users,
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

type StaffStatus = "Hoạt động" | "Nghỉ phép" | "Tạm nghỉ";
type SupplyStatus = "Ổn định" | "Sắp hết" | "Cần mua";
type Tab = "Nhân viên" | "Ca làm" | "Kho vật tư";

type Staff = {
  id: string;
  name: string;
  role: string;
  shift: string;
  phone: string;
  productivity: string;
  rating: string;
  status: StaffStatus;
  note: string;
};

type Shift = {
  id: string;
  day: string;
  morning: string;
  afternoon: string;
  evening: string;
  workload: string;
  status: "Đủ người" | "Thiếu người";
};

type Supply = {
  id: string;
  name: string;
  category: string;
  stock: string;
  threshold: string;
  supplier: string;
  lastImport: string;
  cost: number;
  status: SupplyStatus;
  note: string;
};

const pageSize = 10;
const staffColumns: DashboardTableColumn[] = [
  { id: "id", label: "Mã NV", width: 104, visible: true },
  { id: "name", label: "Họ tên", width: 168, visible: true },
  { id: "role", label: "Vai trò", width: 112, visible: true },
  { id: "shift", label: "Ca", width: 82, visible: true },
  { id: "phone", label: "SĐT", width: 116, visible: true },
  { id: "productivity", label: "Năng suất", width: 112, visible: true },
  { id: "rating", label: "Đánh giá", width: 84, visible: true },
  { id: "status", label: "Trạng thái", width: 112, visible: true },
  { id: "note", label: "Ghi chú", width: 180, visible: true },
  { id: "actions", label: "Thao tác", width: 108, visible: true },
];
const shiftColumns: DashboardTableColumn[] = [
  { id: "id", label: "Mã ca", width: 116, visible: true },
  { id: "day", label: "Ngày", width: 104, visible: true },
  { id: "morning", label: "Ca sáng", width: 190, visible: true },
  { id: "afternoon", label: "Ca chiều", width: 190, visible: true },
  { id: "evening", label: "Ca tối", width: 190, visible: true },
  { id: "workload", label: "Tải việc", width: 160, visible: true },
  { id: "status", label: "Trạng thái", width: 112, visible: true },
];
const supplyColumns: DashboardTableColumn[] = [
  { id: "id", label: "Mã VT", width: 104, visible: true },
  { id: "name", label: "Vật tư", width: 156, visible: true },
  { id: "category", label: "Nhóm", width: 110, visible: true },
  { id: "stock", label: "Tồn kho", width: 90, visible: true },
  { id: "threshold", label: "Ngưỡng", width: 90, visible: true },
  { id: "supplier", label: "Nhà cung cấp", width: 132, visible: true },
  { id: "lastImport", label: "Ngày nhập", width: 110, visible: true },
  { id: "cost", label: "Chi phí", width: 112, visible: true },
  { id: "status", label: "Cảnh báo", width: 104, visible: true },
  { id: "note", label: "Ghi chú", width: 160, visible: true },
  { id: "actions", label: "Thao tác", width: 108, visible: true },
];
const staffStatuses: Array<StaffStatus | "Tất cả"> = ["Tất cả", "Hoạt động", "Nghỉ phép", "Tạm nghỉ"];
const supplyStatuses: Array<SupplyStatus | "Tất cả"> = ["Tất cả", "Ổn định", "Sắp hết", "Cần mua"];

const seedStaff: Staff[] = [
  { id: "NV-101", name: "Nguyễn Văn A", role: "Giặt", shift: "Sáng", phone: "0903123456", productivity: "32 đơn", rating: "4.8/5", status: "Hoạt động", note: "Phụ trách máy giặt 01" },
  { id: "NV-102", name: "Trần Thị B", role: "Gấp/Là", shift: "Chiều", phone: "0912456789", productivity: "25 đơn", rating: "4.7/5", status: "Hoạt động", note: "Kiểm tra đồ trắng" },
  { id: "NV-103", name: "Lê Hoàng C", role: "Giao nhận", shift: "Tối", phone: "0938123456", productivity: "18 chuyến", rating: "4.6/5", status: "Hoạt động", note: "Tuyến Quận 1" },
  { id: "NV-104", name: "Phạm Duy D", role: "Thu ngân", shift: "Sáng", phone: "0988333444", productivity: "42 giao dịch", rating: "-", status: "Nghỉ phép", note: "Nghỉ đến 02/06" },
  { id: "NV-105", name: "Hoàng Minh Tâm", role: "Kiểm đồ", shift: "Chiều", phone: "0977000111", productivity: "37 đơn", rating: "4.9/5", status: "Hoạt động", note: "Đối soát đồ lỗi" },
  { id: "NV-106", name: "Vũ Thanh Mai", role: "Kho", shift: "Sáng", phone: "0909555666", productivity: "16 phiếu", rating: "4.5/5", status: "Tạm nghỉ", note: "Đào tạo lại quy trình nhập kho" },
];

const seedShifts: Shift[] = [
  { id: "CA-201", day: "Thứ 2", morning: "A, D, Mai", afternoon: "B, Tâm", evening: "C", workload: "128 đơn dự kiến", status: "Đủ người" },
  { id: "CA-202", day: "Thứ 3", morning: "A, Mai", afternoon: "B, D", evening: "C, Tâm", workload: "112 đơn dự kiến", status: "Đủ người" },
  { id: "CA-203", day: "Thứ 4", morning: "A, B", afternoon: "D, Tâm", evening: "C", workload: "136 đơn dự kiến", status: "Thiếu người" },
  { id: "CA-204", day: "Thứ 5", morning: "D, Mai", afternoon: "A, B", evening: "C", workload: "104 đơn dự kiến", status: "Đủ người" },
  { id: "CA-205", day: "Thứ 6", morning: "A, Tâm", afternoon: "B, Mai", evening: "C, D", workload: "154 đơn dự kiến", status: "Thiếu người" },
];

const seedSupplies: Supply[] = [
  { id: "VT-301", name: "Hóa chất giặt", category: "Hóa chất", stock: "25 kg", threshold: "10 kg", supplier: "EcoWash", lastImport: "12/05/2026", cost: 1800000, status: "Ổn định", note: "Dùng cho máy giặt 01, 02" },
  { id: "VT-302", name: "Nước xả", category: "Hóa chất", stock: "6 lít", threshold: "8 lít", supplier: "CleanPro", lastImport: "16/05/2026", cost: 720000, status: "Sắp hết", note: "Cần mua trong 2 ngày" },
  { id: "VT-303", name: "Túi đựng", category: "Bao bì", stock: "120 cái", threshold: "50 cái", supplier: "Kho tổng", lastImport: "15/05/2026", cost: 460000, status: "Ổn định", note: "Túi size M/L" },
  { id: "VT-304", name: "Móc áo", category: "Phụ kiện", stock: "75 cái", threshold: "100 cái", supplier: "Nhựa Minh An", lastImport: "10/05/2026", cost: 1250000, status: "Cần mua", note: "Ưu tiên móc áo vest" },
  { id: "VT-305", name: "Tem mã đơn", category: "Bao bì", stock: "3 cuộn", threshold: "2 cuộn", supplier: "In nhanh Q1", lastImport: "08/05/2026", cost: 360000, status: "Ổn định", note: "Dùng cho tiếp nhận" },
];

const emptyStaffForm = {
  name: "",
  role: "Giặt",
  shift: "Sáng",
  phone: "",
  productivity: "",
  rating: "",
  status: "Hoạt động" as StaffStatus,
  note: "",
};

const emptySupplyForm = {
  name: "",
  category: "Hóa chất",
  stock: "",
  threshold: "",
  supplier: "",
  lastImport: "",
  cost: "0",
  status: "Ổn định" as SupplyStatus,
  note: "",
};

const statusColor: Record<StaffStatus | SupplyStatus | Shift["status"], { text: string; bg: string }> = {
  "Hoạt động": { text: "#059669", bg: "rgba(5,150,105,0.09)" },
  "Nghỉ phép": { text: "#d97706", bg: "rgba(217,119,6,0.09)" },
  "Tạm nghỉ": { text: "#64748b", bg: "rgba(100,116,139,0.1)" },
  "Ổn định": { text: "#059669", bg: "rgba(5,150,105,0.09)" },
  "Sắp hết": { text: "#d97706", bg: "rgba(217,119,6,0.09)" },
  "Cần mua": { text: "#dc2626", bg: "rgba(220,38,38,0.09)" },
  "Đủ người": { text: "#059669", bg: "rgba(5,150,105,0.09)" },
  "Thiếu người": { text: "#dc2626", bg: "rgba(220,38,38,0.09)" },
};

function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

function StatusPill({ label }: { label: StaffStatus | SupplyStatus | Shift["status"] }) {
  const color = statusColor[label];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium" style={{ color: color.text, backgroundColor: color.bg }}>
      <span className="size-1.5 rounded-full" style={{ backgroundColor: color.text }} />
      {label}
    </span>
  );
}

function MetricCard({ title, value, hint, icon: Icon, color }: { title: string; value: string; hint: string; icon: typeof Users; color: string }) {
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

export default function StaffOperationsPage() {
  const [tab, setTab] = useState<Tab>("Nhân viên");
  const [staff, setStaff] = useState(seedStaff);
  const [supplies, setSupplies] = useState(seedSupplies);
  const [query, setQuery] = useState("");
  const [selectedStaffStatus, setSelectedStaffStatus] = useState<StaffStatus | "Tất cả">("Tất cả");
  const [selectedSupplyStatus, setSelectedSupplyStatus] = useState<SupplyStatus | "Tất cả">("Tất cả");
  const [page, setPage] = useState(1);
  const [openStaffForm, setOpenStaffForm] = useState(false);
  const [openSupplyForm, setOpenSupplyForm] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [editingSupplyId, setEditingSupplyId] = useState<string | null>(null);
  const [staffForm, setStaffForm] = useState(emptyStaffForm);
  const [supplyForm, setSupplyForm] = useState(emptySupplyForm);
  const [openPageSizeMenu, setOpenPageSizeMenu] = useState(false);
  const [customPageSize, setCustomPageSize] = useState("");
  const range = useDashboardTimeRangeStore((state) => state.range);
  const rangeLabel = formatRange(normalizeRange(range));

  const filteredStaff = useMemo(() => {
    return staff.filter((item) => {
      const source = `${item.id} ${item.name} ${item.role} ${item.shift} ${item.phone} ${item.note}`;
      const matchQuery = source.toLowerCase().includes(query.toLowerCase());
      const matchStatus = selectedStaffStatus === "Tất cả" || item.status === selectedStaffStatus;
      return matchQuery && matchStatus;
    });
  }, [query, selectedStaffStatus, staff]);

  const filteredShifts = useMemo(() => {
    return seedShifts.filter((item) => `${item.day} ${item.morning} ${item.afternoon} ${item.evening} ${item.workload}`.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  const filteredSupplies = useMemo(() => {
    return supplies.filter((item) => {
      const source = `${item.id} ${item.name} ${item.category} ${item.supplier} ${item.note}`;
      const matchQuery = source.toLowerCase().includes(query.toLowerCase());
      const matchStatus = selectedSupplyStatus === "Tất cả" || item.status === selectedSupplyStatus;
      return matchQuery && matchStatus;
    });
  }, [query, selectedSupplyStatus, supplies]);

  const activeRows = tab === "Nhân viên" ? filteredStaff : tab === "Ca làm" ? filteredShifts : filteredSupplies;
  const pageCount = Math.ceil(activeRows.length / pageSize);
  const paginatedStaff = filteredStaff.slice((page - 1) * pageSize, page * pageSize);
  const paginatedShifts = filteredShifts.slice((page - 1) * pageSize, page * pageSize);
  const paginatedSupplies = filteredSupplies.slice((page - 1) * pageSize, page * pageSize);
  const activeColumns = tab === "Nhân viên" ? staffColumns : tab === "Ca làm" ? shiftColumns : supplyColumns;
  const activePaginatedRows = tab === "Nhân viên" ? paginatedStaff : tab === "Ca làm" ? paginatedShifts : paginatedSupplies;
  const totalVisibleWidth = activeColumns.reduce((sum, column) => sum + (column.width || 150), 0);
  const lowStock = supplies.filter((item) => item.status !== "Ổn định").length;
  const purchaseCost = supplies.reduce((sum, item) => sum + item.cost, 0);

  const openCreateStaff = () => {
    setEditingStaffId(null);
    setStaffForm(emptyStaffForm);
    setOpenStaffForm(true);
  };

  const openEditStaff = (item: Staff) => {
    setEditingStaffId(item.id);
    setStaffForm({ name: item.name, role: item.role, shift: item.shift, phone: item.phone, productivity: item.productivity, rating: item.rating, status: item.status, note: item.note });
    setOpenStaffForm(true);
  };

  const saveStaff = () => {
    if (!staffForm.name.trim()) return;
    const payload: Omit<Staff, "id"> = { ...staffForm, productivity: staffForm.productivity || "0 đơn", rating: staffForm.rating || "-" };
    if (editingStaffId) setStaff((prev) => prev.map((item) => item.id === editingStaffId ? { ...item, ...payload } : item));
    else setStaff((prev) => [{ id: `NV-${Date.now().toString().slice(-3)}`, ...payload }, ...prev]);
    setPage(1);
    setOpenStaffForm(false);
  };

  const openCreateSupply = () => {
    setEditingSupplyId(null);
    setSupplyForm(emptySupplyForm);
    setOpenSupplyForm(true);
  };

  const openEditSupply = (item: Supply) => {
    setEditingSupplyId(item.id);
    setSupplyForm({ name: item.name, category: item.category, stock: item.stock, threshold: item.threshold, supplier: item.supplier, lastImport: item.lastImport, cost: String(item.cost), status: item.status, note: item.note });
    setOpenSupplyForm(true);
  };

  const saveSupply = () => {
    if (!supplyForm.name.trim()) return;
    const payload: Omit<Supply, "id"> = { ...supplyForm, cost: Number(supplyForm.cost) || 0 };
    if (editingSupplyId) setSupplies((prev) => prev.map((item) => item.id === editingSupplyId ? { ...item, ...payload } : item));
    else setSupplies((prev) => [{ id: `VT-${Date.now().toString().slice(-3)}`, ...payload }, ...prev]);
    setPage(1);
    setOpenSupplyForm(false);
  };

  const renderStaffCell = (item: Staff, column: DashboardTableColumn) => {
    if (column.id === "id") return <TableCell key={column.id} className="pl-4 font-medium text-slate-900">{item.id}</TableCell>;
    if (column.id === "name") return <TableCell key={column.id} className="font-medium text-slate-900">{item.name}</TableCell>;
    if (column.id === "phone") return <TableCell key={column.id}><a href={`tel:${item.phone}`} className="text-slate-500 hover:text-slate-800">{item.phone}</a></TableCell>;
    if (column.id === "status") return <TableCell key={column.id}><StatusPill label={item.status} /></TableCell>;
    if (column.id === "note") return <TableCell key={column.id} className="truncate text-slate-500" title={item.note}>{item.note}</TableCell>;
    if (column.id === "actions") {
      return (
        <TableCell key={column.id} className="px-4">
          <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 hover:bg-slate-50" onClick={() => openEditStaff(item)}>
            <Pencil className="size-3.5" />
            Sửa
          </button>
        </TableCell>
      );
    }
    return <TableCell key={column.id}>{String(item[column.id as keyof Staff] ?? "")}</TableCell>;
  };

  const renderShiftCell = (item: Shift, column: DashboardTableColumn) => {
    if (column.id === "id") return <TableCell key={column.id} className="pl-4 font-medium text-slate-900">{item.id}</TableCell>;
    if (column.id === "status") return <TableCell key={column.id}><StatusPill label={item.status} /></TableCell>;
    return <TableCell key={column.id}>{String(item[column.id as keyof Shift] ?? "")}</TableCell>;
  };

  const renderSupplyCell = (item: Supply, column: DashboardTableColumn) => {
    if (column.id === "id") return <TableCell key={column.id} className="pl-4 font-medium text-slate-900">{item.id}</TableCell>;
    if (column.id === "name") return <TableCell key={column.id} className="font-medium text-slate-900">{item.name}</TableCell>;
    if (column.id === "cost") return <TableCell key={column.id} className="font-medium text-slate-900">{formatCurrency(item.cost)}</TableCell>;
    if (column.id === "status") return <TableCell key={column.id}><StatusPill label={item.status} /></TableCell>;
    if (column.id === "note") return <TableCell key={column.id} className="truncate text-slate-500" title={item.note}>{item.note}</TableCell>;
    if (column.id === "actions") {
      return (
        <TableCell key={column.id} className="px-4">
          <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 hover:bg-slate-50" onClick={() => openEditSupply(item)}>
            <Pencil className="size-3.5" />
            Sửa
          </button>
        </TableCell>
      );
    }
    return <TableCell key={column.id}>{String(item[column.id as keyof Supply] ?? "")}</TableCell>;
  };

  const renderActiveCell = (row: Staff | Shift | Supply, column: DashboardTableColumn) => {
    if (tab === "Nhân viên") return renderStaffCell(row as Staff, column);
    if (tab === "Ca làm") return renderShiftCell(row as Shift, column);
    return renderSupplyCell(row as Supply, column);
  };

  return (
    <PageShell fullHeight>
      <div className="grid shrink-0 gap-3 md:grid-cols-4">
        <MetricCard title="Nhân viên hoạt động" value={`${staff.filter((item) => item.status === "Hoạt động").length}`} hint={`${staff.length} hồ sơ nội bộ`} icon={Users} color="#2563eb" />
        <MetricCard title="Ca hôm nay" value="3" hint="Sáng, chiều, tối" icon={Clock} color="#7c3aed" />
        <MetricCard title="Năng suất" value="128 đơn" hint={`Theo ${rangeLabel}`} icon={TrendingUp} color="#059669" />
        <MetricCard title="Vật tư cảnh báo" value={`${lowStock}`} hint={`Đã nhập ${formatCurrency(purchaseCost)}`} icon={Package} color="#dc2626" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 pt-1 pb-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-1">
            {(["Nhân viên", "Ca làm", "Kho vật tư"] as Tab[]).map((item) => (
              <button key={item} type="button" onClick={() => { setTab(item); setPage(1); setQuery(""); }} className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors ${tab === item ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
                {item === "Nhân viên" ? <Users className="size-3.5" /> : item === "Ca làm" ? <Clock className="size-3.5" /> : <Package className="size-3.5" />}
                {item}
              </button>
            ))}
            <span className="mx-2 hidden h-4 w-px bg-slate-200 sm:block" />
            <ViewModeTabs value="Bảng" onChange={() => {}} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1 xl:w-64 xl:flex-none">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
              <Input className="h-8 rounded-md border-slate-200 bg-white pl-8 text-xs text-slate-700 shadow-none placeholder:text-slate-500 focus-visible:ring-slate-200" placeholder={tab === "Kho vật tư" ? "Tìm vật tư, nhà cung cấp..." : "Tìm nhân viên, ca, vai trò..."} value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
            </div>
            <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs text-slate-700 transition-colors hover:bg-slate-50"><EyeOff className="size-3.5" />Ẩn cột</button>
            <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs text-slate-700 transition-colors hover:bg-slate-50"><Settings className="size-3.5" />Tùy chỉnh</button>
            <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-slate-50"><FileDown className="size-3.5" />Xuất file</button>
            <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50" onClick={tab === "Kho vật tư" ? openCreateSupply : openCreateStaff} disabled={tab === "Ca làm"}>
              {tab === "Kho vật tư" ? "Thêm vật tư" : tab === "Ca làm" ? "Thêm ca" : "Thêm nhân viên"}
              <ChevronDown className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-5 py-3">
          <button type="button" className="inline-flex h-7 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 text-xs text-slate-700 transition-colors hover:bg-slate-50">
            <CalendarClock className="size-3.5" />{rangeLabel}<ChevronDown className="size-3.5" />
          </button>
          {(tab === "Kho vật tư" ? supplyStatuses : staffStatuses).map((item) => {
            if (tab === "Ca làm" && item !== "Tất cả") return null;
            const active = tab === "Kho vật tư" ? selectedSupplyStatus === item : selectedStaffStatus === item;
            return <button key={item} type="button" onClick={() => { if (tab === "Kho vật tư") setSelectedSupplyStatus(item as SupplyStatus | "Tất cả"); else setSelectedStaffStatus(item as StaffStatus | "Tất cả"); setPage(1); }} className={`inline-flex h-7 items-center rounded-full px-2.5 text-xs font-medium transition-colors ${active ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>{item}</button>;
          })}
          <button type="button" className="inline-flex h-7 items-center gap-1.5 px-2 text-xs text-slate-500 transition-colors hover:text-slate-700"><Plus className="size-3.5" />Thêm bộ lọc</button>
        </div>

        <DashboardDataTable
          columns={activeColumns}
          rows={activePaginatedRows}
          pageSize={pageSize}
          emptyMessage="Không có dữ liệu phù hợp."
          totalVisibleWidth={totalVisibleWidth}
          renderCell={renderActiveCell}
        />
        <DashboardTableFooter
          page={page}
          pageCount={pageCount}
          pageSize={pageSize}
          totalRows={activeRows.length}
          customPageSize={customPageSize}
          openPageSizeMenu={openPageSizeMenu}
          onOpenPageSizeMenuChange={setOpenPageSizeMenu}
          onCustomPageSizeChange={setCustomPageSize}
          onApplyCustomPageSize={() => setCustomPageSize("")}
          onUpdatePageSize={() => setOpenPageSizeMenu(false)}
          onPageChange={setPage}
        />
      </div>

      {openStaffForm && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <Card className="max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-2xl border-0 bg-white shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 px-6 py-4"><CardTitle className="text-base font-semibold">{editingStaffId ? `Chỉnh sửa ${editingStaffId}` : "Thêm nhân viên mới"}</CardTitle><button type="button" className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" onClick={() => setOpenStaffForm(false)}><X className="size-5" /></button></CardHeader>
            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
              <div className="space-y-2"><Label>Họ tên</Label><Input value={staffForm.name} onChange={(event) => setStaffForm({ ...staffForm, name: event.target.value })} placeholder="Tên nhân viên" /></div>
              <div className="space-y-2"><Label>Số điện thoại</Label><Input value={staffForm.phone} onChange={(event) => setStaffForm({ ...staffForm, phone: event.target.value })} placeholder="090..." /></div>
              <div className="space-y-2"><Label>Vai trò</Label><Input value={staffForm.role} onChange={(event) => setStaffForm({ ...staffForm, role: event.target.value })} /></div>
              <div className="space-y-2"><Label>Ca chính</Label><Input value={staffForm.shift} onChange={(event) => setStaffForm({ ...staffForm, shift: event.target.value })} /></div>
              <div className="space-y-2"><Label>Năng suất</Label><Input value={staffForm.productivity} onChange={(event) => setStaffForm({ ...staffForm, productivity: event.target.value })} placeholder="32 đơn" /></div>
              <div className="space-y-2"><Label>Đánh giá</Label><Input value={staffForm.rating} onChange={(event) => setStaffForm({ ...staffForm, rating: event.target.value })} placeholder="4.8/5" /></div>
              <div className="space-y-2 md:col-span-2"><Label>Trạng thái</Label><div className="flex flex-wrap gap-2">{(["Hoạt động", "Nghỉ phép", "Tạm nghỉ"] as StaffStatus[]).map((status) => <button key={status} type="button" onClick={() => setStaffForm({ ...staffForm, status })} className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-medium ${staffForm.status === status ? "bg-slate-900 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{status}</button>)}</div></div>
              <div className="space-y-2 md:col-span-2"><Label>Ghi chú vận hành</Label><Textarea value={staffForm.note} onChange={(event) => setStaffForm({ ...staffForm, note: event.target.value })} placeholder="Khu vực phụ trách, kỹ năng, lịch nghỉ..." /></div>
              <Button className="md:col-span-2 h-10 rounded-lg bg-slate-900 font-semibold text-white hover:bg-slate-800" onClick={saveStaff}>Lưu nhân viên</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {openSupplyForm && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <Card className="max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-2xl border-0 bg-white shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 px-6 py-4"><CardTitle className="text-base font-semibold">{editingSupplyId ? `Chỉnh sửa ${editingSupplyId}` : "Thêm vật tư mới"}</CardTitle><button type="button" className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" onClick={() => setOpenSupplyForm(false)}><X className="size-5" /></button></CardHeader>
            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
              <div className="space-y-2"><Label>Tên vật tư</Label><Input value={supplyForm.name} onChange={(event) => setSupplyForm({ ...supplyForm, name: event.target.value })} placeholder="Nước xả" /></div>
              <div className="space-y-2"><Label>Nhóm</Label><Input value={supplyForm.category} onChange={(event) => setSupplyForm({ ...supplyForm, category: event.target.value })} /></div>
              <div className="space-y-2"><Label>Tồn kho</Label><Input value={supplyForm.stock} onChange={(event) => setSupplyForm({ ...supplyForm, stock: event.target.value })} placeholder="20 lít" /></div>
              <div className="space-y-2"><Label>Ngưỡng cảnh báo</Label><Input value={supplyForm.threshold} onChange={(event) => setSupplyForm({ ...supplyForm, threshold: event.target.value })} placeholder="8 lít" /></div>
              <div className="space-y-2"><Label>Nhà cung cấp</Label><Input value={supplyForm.supplier} onChange={(event) => setSupplyForm({ ...supplyForm, supplier: event.target.value })} /></div>
              <div className="space-y-2"><Label>Ngày nhập</Label><Input value={supplyForm.lastImport} onChange={(event) => setSupplyForm({ ...supplyForm, lastImport: event.target.value })} placeholder="31/05/2026" /></div>
              <div className="space-y-2"><Label>Chi phí nhập</Label><Input type="number" value={supplyForm.cost} onChange={(event) => setSupplyForm({ ...supplyForm, cost: event.target.value })} /></div>
              <div className="space-y-2"><Label>Cảnh báo</Label><Input value={supplyForm.status} onChange={(event) => setSupplyForm({ ...supplyForm, status: event.target.value as SupplyStatus })} placeholder="Ổn định / Sắp hết / Cần mua" /></div>
              <div className="space-y-2 md:col-span-2"><Label>Ghi chú</Label><Textarea value={supplyForm.note} onChange={(event) => setSupplyForm({ ...supplyForm, note: event.target.value })} placeholder="Kế hoạch mua, khu vực lưu kho..." /></div>
              <Button className="md:col-span-2 h-10 rounded-lg bg-slate-900 font-semibold text-white hover:bg-slate-800" onClick={saveSupply}>Lưu vật tư</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </PageShell>
  );
}
