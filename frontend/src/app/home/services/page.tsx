"use client";

import { useMemo, useState, type Dispatch, type DragEvent, type SetStateAction } from "react";
import Image from "next/image";
import {
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  Gift,
  ReceiptText,
  Tags,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageShell, ViewModeTabs } from "../_components/dashboard-primitives";
import { Toolbar } from "../_components/toolbar";
import { FilterBar, type FilterOption } from "../_components/filter-bar";
import { TableView } from "../_components/table-view";
import { KanbanView, type KanbanColumn } from "../_components/kanban-view";
import { ListView } from "../_components/list-view";
import { AddColumnDialog } from "../_components/add-column-dialog";
import { type DashboardTableColumn } from "@/src/components/common/dashboard-data-table";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import { formatRange, normalizeRange } from "@/src/utils/dashboard-time";

type ServiceStatus = "Đang hoạt động" | "Tạm ngừng";
type ServicePromotion = "Có" | "Không";
type ServiceUnit = "kg" | "món" | "bộ";
type ServiceTurnaround = "Trong ngày" | "6 giờ" | "24 giờ" | "48 giờ" | "72 giờ";
type FinanceStatus = "Đã thu" | "Chờ thu" | "Đã chi" | "Quá hạn";
type FinanceType = "Doanh thu" | "Công nợ" | "Chi phí" | "Hoàn tiền";
type FinanceMethod = "Tiền mặt" | "Chuyển khoản";
type PromotionStatus = "Đang chạy" | "Sắp hết hạn" | "Đã kết thúc";
type PromotionType = "Phần trăm" | "Số tiền";

type Service = {
  id: string;
  name: string;
  category: string;
  unit: ServiceUnit;
  price: number;
  turnaround: ServiceTurnaround;
  status: ServiceStatus;
  promotion: ServicePromotion;
  note: string;
} & Record<string, unknown>;

type FinanceRecord = {
  id: string;
  date: string;
  type: FinanceType;
  customer: string;
  orderId: string;
  method: FinanceMethod;
  amount: number;
  status: FinanceStatus;
  owner: string;
  note: string;
} & Record<string, unknown>;

type Promotion = {
  id: string;
  code: string;
  name: string;
  type: PromotionType;
  value: string;
  appliedService: string;
  startDate: string;
  endDate: string;
  usage: string;
  claimed: number;
  status: PromotionStatus;
  note: string;
} & Record<string, unknown>;

type ServiceForm = {
  name: string;
  category: string;
  unit: ServiceUnit;
  price: string;
  turnaround: ServiceTurnaround;
  status: ServiceStatus;
  promotion: ServicePromotion;
  note: string;
} & Record<string, string>;

type FinanceForm = {
  date: string;
  type: FinanceType;
  customer: string;
  orderId: string;
  method: FinanceMethod;
  amount: string;
  status: FinanceStatus;
  owner: string;
  note: string;
} & Record<string, string>;

type PromotionForm = {
  code: string;
  name: string;
  type: PromotionType;
  value: string;
  appliedService: string;
  startDate: string;
  endDate: string;
  usage: string;
  status: PromotionStatus;
  note: string;
} & Record<string, string>;

const serviceStatuses: Array<ServiceStatus | "Tất cả"> = ["Tất cả", "Đang hoạt động", "Tạm ngừng"];
const serviceUnits: ServiceUnit[] = ["kg", "món", "bộ"];
const serviceTurnarounds: ServiceTurnaround[] = ["Trong ngày", "6 giờ", "24 giờ", "48 giờ", "72 giờ"];
const financeTypes: Array<FinanceType | "Tất cả"> = ["Tất cả", "Doanh thu", "Công nợ", "Chi phí", "Hoàn tiền"];
const financeMethods: FinanceMethod[] = ["Tiền mặt", "Chuyển khoản"];
const promotionStatuses: Array<PromotionStatus | "Tất cả"> = ["Tất cả", "Đang chạy", "Sắp hết hạn", "Đã kết thúc"];
const promotionTypes: PromotionType[] = ["Phần trăm", "Số tiền"];
const financeStatuses: FinanceStatus[] = ["Đã thu", "Chờ thu", "Đã chi", "Quá hạn"];

const seedServices: Service[] = [
  { id: "DV-101", name: "Giặt thường", category: "Giặt theo kg", unit: "kg", price: 15000, turnaround: "Trong ngày", status: "Đang hoạt động", promotion: "Không", note: "Áo quần hằng ngày" },
  { id: "DV-102", name: "Giặt sấy", category: "Giặt theo kg", unit: "kg", price: 25000, turnaround: "6 giờ", status: "Đang hoạt động", promotion: "Có", note: "Tách đồ trắng theo yêu cầu" },
  { id: "DV-103", name: "Giặt khô vest", category: "Giặt theo món", unit: "món", price: 80000, turnaround: "24 giờ", status: "Đang hoạt động", promotion: "Có", note: "Vest, áo khoác, đồ công sở" },
  { id: "DV-104", name: "Chăn màn", category: "Đồ cồng kềnh", unit: "kg", price: 35000, turnaround: "24 giờ", status: "Đang hoạt động", promotion: "Không", note: "Chăn, ga, rèm cửa" },
  { id: "DV-105", name: "Vệ sinh rèm", category: "Tại nhà", unit: "bộ", price: 180000, turnaround: "48 giờ", status: "Đang hoạt động", promotion: "Có", note: "Có lịch khảo sát trước" },
  { id: "DV-106", name: "Giặt đồ da", category: "Cao cấp", unit: "món", price: 240000, turnaround: "72 giờ", status: "Tạm ngừng", promotion: "Không", note: "Cần xác nhận hóa chất" },
];

const seedFinanceRecords: FinanceRecord[] = [
  { id: "TC-2051", date: "2026-05-29", type: "Doanh thu", customer: "Nguyễn Thị Hương", orderId: "DH-1048", method: "Tiền mặt", amount: 180000, status: "Đã thu", owner: "Chị Lan", note: "Thanh toán đủ" },
  { id: "TC-2050", date: "2026-05-29", type: "Công nợ", customer: "Trần Minh", orderId: "DH-1052", method: "Tiền mặt", amount: 240000, status: "Chờ thu", owner: "Anh Minh", note: "Thu khi giao hàng" },
  { id: "TC-2049", date: "2026-05-28", type: "Chi phí", customer: "Nhà cung cấp Hóa Việt", orderId: "-", method: "Chuyển khoản", amount: 3200000, status: "Đã chi", owner: "Quản lý", note: "Mua hóa chất tháng 5" },
  { id: "TC-2048", date: "2026-05-28", type: "Doanh thu", customer: "Công ty ABC", orderId: "DH-1057", method: "Chuyển khoản", amount: 2500000, status: "Đã thu", owner: "Thu ngân", note: "Xuất hóa đơn cuối tháng" },
  { id: "TC-2047", date: "2026-05-27", type: "Công nợ", customer: "Shop Linen", orderId: "DH-1061", method: "Chuyển khoản", amount: 1800000, status: "Quá hạn", owner: "Thu ngân", note: "Nhắc thanh toán lần 2" },
  { id: "TC-2046", date: "2026-05-26", type: "Hoàn tiền", customer: "Lê Mai", orderId: "DH-1062", method: "Tiền mặt", amount: 50000, status: "Đã chi", owner: "Chị Lan", note: "Hoàn tiền vì giao trễ" },
];

const seedPromotions: Promotion[] = [
  { id: "MG-301", code: "WELCOME10", name: "Khách mới", type: "Phần trăm", value: "10%", appliedService: "Tất cả dịch vụ", startDate: "2026-05-01", endDate: "2026-06-30", usage: "120", claimed: 42, status: "Đang chạy", note: "Áp dụng đơn đầu tiên" },
  { id: "MG-302", code: "BIRTHDAY15", name: "Sinh nhật", type: "Phần trăm", value: "15%", appliedService: "Tất cả dịch vụ", startDate: "2026-01-01", endDate: "", usage: "", claimed: 18, status: "Đang chạy", note: "Tự cấp theo ngày sinh khách hàng" },
  { id: "MG-303", code: "COMBO-GIAT-SAY", name: "Combo giặt sấy", type: "Số tiền", value: "25.000đ", appliedService: "Giặt sấy", startDate: "2026-05-15", endDate: "2026-06-15", usage: "80", claimed: 68, status: "Sắp hết hạn", note: "Áp dụng dịch vụ giặt sấy từ 5kg" },
  { id: "MG-304", code: "VIP5", name: "Khách VIP", type: "Phần trăm", value: "5%", appliedService: "Giặt khô vest", startDate: "2026-04-01", endDate: "2026-12-31", usage: "", claimed: 96, status: "Đang chạy", note: "Chỉ áp dụng hạng Vàng trở lên" },
  { id: "MG-305", code: "RAINY20", name: "Ngày mưa", type: "Số tiền", value: "20.000đ", appliedService: "Giặt thường", startDate: "2026-05-20", endDate: "2026-05-31", usage: "200", claimed: 137, status: "Đã kết thúc", note: "Đã kết thúc do hết thời gian" },
];

const initialPageSize = 10;
const serviceColumns: DashboardTableColumn[] = [
  { id: "id", label: "Mã dịch vụ", width: 132, visible: true },
  { id: "name", label: "Tên dịch vụ", width: 184, visible: true },
  { id: "category", label: "Nhóm", width: 140, visible: true },
  { id: "unit", label: "Đơn vị", width: 76, visible: true },
  { id: "price", label: "Đơn giá", width: 112, visible: true },
  { id: "turnaround", label: "Thời gian", width: 112, visible: true },
  { id: "status", label: "Trạng thái", width: 126, visible: true },
  { id: "promotion", label: "Ưu đãi", width: 120, visible: true },
  { id: "note", label: "Ghi chú", width: 190, visible: true },
  { id: "actions", label: "Thao tác", width: 108, visible: true },
];
const promotionColumns: DashboardTableColumn[] = [
  { id: "id", label: "Mã ID", width: 112, visible: true },
  { id: "code", label: "Code", width: 138, visible: true },
  { id: "name", label: "Chương trình", width: 170, visible: true },
  { id: "type", label: "Loại", width: 96, visible: true },
  { id: "value", label: "Giá trị", width: 112, visible: true },
  { id: "appliedService", label: "Dịch vụ áp dụng", width: 150, visible: true },
  { id: "startDate", label: "Bắt đầu", width: 104, visible: true },
  { id: "endDate", label: "Kết thúc", width: 112, visible: true },
  { id: "usage", label: "Số lượng phát", width: 132, visible: true },
  { id: "status", label: "Trạng thái", width: 116, visible: true },
  { id: "note", label: "Ghi chú", width: 190, visible: true },
  { id: "actions", label: "Thao tác", width: 108, visible: true },
];
const financeColumns: DashboardTableColumn[] = [
  { id: "id", label: "Mã giao dịch", width: 116, visible: true },
  { id: "date", label: "Ngày", width: 104, visible: true },
  { id: "type", label: "Loại", width: 106, visible: true },
  { id: "customer", label: "Khách / đối tác", width: 168, visible: true },
  { id: "orderId", label: "Đơn", width: 92, visible: true },
  { id: "method", label: "Phương thức", width: 116, visible: true },
  { id: "amount", label: "Số tiền", width: 120, visible: true },
  { id: "status", label: "Trạng thái", width: 104, visible: true },
  { id: "owner", label: "Phụ trách", width: 104, visible: true },
  { id: "note", label: "Ghi chú", width: 164, visible: true },
  { id: "actions", label: "Thao tác", width: 108, visible: true },
];

const emptyServiceForm: ServiceForm = {
  name: "",
  category: "Giặt theo kg",
  unit: "kg" as ServiceUnit,
  price: "0",
  turnaround: "Trong ngày" as ServiceTurnaround,
  status: "Đang hoạt động" as ServiceStatus,
  promotion: "Không" as ServicePromotion,
  note: "",
};

const emptyFinanceForm: FinanceForm = {
  date: "",
  type: "Doanh thu" as FinanceType,
  customer: "",
  orderId: "",
  method: "Tiền mặt" as FinanceMethod,
  amount: "0",
  status: "Đã thu" as FinanceStatus,
  owner: "",
  note: "",
};

const emptyPromotionForm: PromotionForm = {
  code: "",
  name: "",
  type: "Phần trăm" as PromotionType,
  value: "",
  appliedService: "Tất cả dịch vụ",
  startDate: "",
  endDate: "",
  usage: "",
  status: "Đang chạy" as PromotionStatus,
  note: "",
};

const selectClassName =
  "!h-10 min-h-10 w-full rounded-lg border border-gray-200 bg-white text-sm text-slate-700 shadow-none focus-visible:ring-gray-200";
const selectContentClassName = "z-[2100]";
const formDialogClassName =
  "max-h-[90dvh] overflow-y-auto sm:max-w-3xl [&_input]:h-10 [&_input]:rounded-lg [&_input]:border [&_input]:border-gray-200 [&_input]:bg-white [&_input]:text-sm [&_input]:text-slate-700 [&_input]:shadow-none [&_input]:placeholder:text-slate-500 [&_input]:focus-visible:ring-gray-200 [&_textarea]:h-24 [&_textarea]:min-h-24 [&_textarea]:resize-none [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-gray-200 [&_textarea]:bg-white [&_textarea]:text-sm [&_textarea]:text-slate-700 [&_textarea]:shadow-none [&_textarea]:placeholder:text-slate-500 [&_textarea]:focus-visible:ring-gray-200";
const defaultAvatarUrl = "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif";

const statusColor: Record<ServiceStatus | FinanceStatus | PromotionStatus, { text: string; bg: string }> = {
  "Đang hoạt động": { text: "#059669", bg: "rgba(5,150,105,0.09)" },
  "Tạm ngừng": { text: "#d97706", bg: "rgba(217,119,6,0.09)" },
  "Đã thu": { text: "#059669", bg: "rgba(5,150,105,0.09)" },
  "Chờ thu": { text: "#d97706", bg: "rgba(217,119,6,0.09)" },
  "Đã chi": { text: "#2563eb", bg: "rgba(37,99,235,0.09)" },
  "Quá hạn": { text: "#dc2626", bg: "rgba(220,38,38,0.09)" },
  "Đang chạy": { text: "#059669", bg: "rgba(5,150,105,0.09)" },
  "Sắp hết hạn": { text: "#d97706", bg: "rgba(217,119,6,0.09)" },
  "Đã kết thúc": { text: "#64748b", bg: "rgba(100,116,139,0.1)" },
};

const typeColor: Record<FinanceType, string> = {
  "Doanh thu": "#059669",
  "Công nợ": "#d97706",
  "Chi phí": "#2563eb",
  "Hoàn tiền": "#dc2626",
};

function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

function parseInputDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function toInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string) {
  const date = parseInputDate(value);
  if (!date) return "Chọn ngày";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

function formatReadableDate(value: string) {
  const date = parseInputDate(value);
  if (!date) return value || "Chưa có";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

function getPromotionStatusByDate(startDate: string, endDate: string): PromotionStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = parseInputDate(endDate);
  if (!end) return "Đang chạy";
  end.setHours(0, 0, 0, 0);
  if (end < today) return "Đã kết thúc";

  const daysLeft = Math.ceil((end.getTime() - today.getTime()) / 86400000);
  return daysLeft <= 7 ? "Sắp hết hạn" : "Đang chạy";
}

function formatPromotionEndDate(value: string) {
  return value.trim() ? formatReadableDate(value) : "Không giới hạn";
}

function formatPromotionIssuedQuantity(limit: string, claimed: number) {
  const claimedCount = Number.isFinite(claimed) ? claimed : 0;
  return limit.trim() ? `${claimedCount}/${limit}` : "Không giới hạn";
}

function StatusPill({ label }: { label: ServiceStatus | FinanceStatus | PromotionStatus }) {
  const color = statusColor[label];

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium"
      style={{ color: color.text, backgroundColor: color.bg }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: color.text }} />
      {label}
    </span>
  );
}

function MetricCard({
  title,
  value,
  hint,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  hint: string;
  icon: typeof Wallet;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid size-7 shrink-0 place-items-center rounded-lg" style={{ color, backgroundColor: `${color}14` }}>
            <Icon className="size-3.5" />
          </span>
          <p className="truncate text-xs font-semibold text-slate-900">{title}</p>
        </div>
      </div>
      <p className="mt-3 text-xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 truncate text-xs text-slate-400">{hint}</p>
    </div>
  );
}

export default function ServicesFinancePage() {
  const [currentStaffName] = useState(() => {
    if (typeof window === "undefined") return "Tài khoản";
    const username = localStorage.getItem("username");
    const displayName = localStorage.getItem("fullName") || localStorage.getItem("fullname") || localStorage.getItem("accountName");
    return displayName && displayName !== username ? displayName : "Tài khoản";
  });
  const [currentStaffAvatar] = useState(() => {
    if (typeof window === "undefined") return defaultAvatarUrl;
    return localStorage.getItem("accountImageUrl") || defaultAvatarUrl;
  });
  const [tab, setTab] = useState<"Dịch vụ" | "Tài chính" | "Mã giảm giá">("Dịch vụ");
  const [services, setServices] = useState<Service[]>(seedServices);
  const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>(seedFinanceRecords);
  const [promotions, setPromotions] = useState<Promotion[]>(seedPromotions);
  const [columnsService, setColumnsService] = useState<DashboardTableColumn[]>(serviceColumns);
  const [columnsFinance, setColumnsFinance] = useState<DashboardTableColumn[]>(financeColumns);
  const [columnsPromotion, setColumnsPromotion] = useState<DashboardTableColumn[]>(promotionColumns);
  const [query, setQuery] = useState("");
  const [selectedServiceStatus, setSelectedServiceStatus] = useState<ServiceStatus | "Tất cả">("Tất cả");
  const [selectedFinanceType, setSelectedFinanceType] = useState<FinanceType | "Tất cả">("Tất cả");
  const [selectedPromotionStatus, setSelectedPromotionStatus] = useState<PromotionStatus | "Tất cả">("Tất cả");
  const [viewMode, setViewMode] = useState<"Bảng" | "Bảng kéo" | "Danh sách">("Bảng");
  const [tableResizeMode, setTableResizeMode] = useState<"fit" | "custom">("fit");
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [openServiceForm, setOpenServiceForm] = useState(false);
  const [openFinanceForm, setOpenFinanceForm] = useState(false);
  const [openPromotionForm, setOpenPromotionForm] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingFinanceId, setEditingFinanceId] = useState<string | null>(null);
  const [editingPromotionId, setEditingPromotionId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [financeForm, setFinanceForm] = useState(emptyFinanceForm);
  const [promotionForm, setPromotionForm] = useState(emptyPromotionForm);
  const [openPageSizeMenu, setOpenPageSizeMenu] = useState(false);
  const [customPageSize, setCustomPageSize] = useState("");
  const [openAddColumn, setOpenAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(new Set());
  const [selectedFinanceIds, setSelectedFinanceIds] = useState<Set<string>>(new Set());
  const [selectedPromotionIds, setSelectedPromotionIds] = useState<Set<string>>(new Set());
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: "service" | "finance" | "promotion" } | null>(null);
  const range = useDashboardTimeRangeStore((state) => state.range);
  const rangeLabel = formatRange(normalizeRange(range));
  const checkboxClass =
    "relative size-4 appearance-none rounded-[5px] border border-slate-300 bg-white transition-all duration-150 checked:border-emerald-300 checked:bg-emerald-300 after:absolute after:left-1/2 after:top-1/2 after:hidden after:h-[9px] after:w-[5px] after:-translate-x-1/2 after:-translate-y-[58%] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:content-[''] checked:after:block";

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const source = `${service.id} ${service.name} ${service.category} ${service.unit} ${service.note} ${service.promotion}`;
      const matchQuery = source.toLowerCase().includes(query.toLowerCase());
      const matchStatus = selectedServiceStatus === "Tất cả" || service.status === selectedServiceStatus;
      return matchQuery && matchStatus;
    });
  }, [query, selectedServiceStatus, services]);

  const filteredFinanceRecords = useMemo(() => {
    return financeRecords.filter((record) => {
      const source = `${record.id} ${record.customer} ${record.orderId} ${record.method} ${record.owner} ${record.note}`;
      const matchQuery = source.toLowerCase().includes(query.toLowerCase());
      const matchType = selectedFinanceType === "Tất cả" || record.type === selectedFinanceType;
      return matchQuery && matchType;
    });
  }, [financeRecords, query, selectedFinanceType]);

  const filteredPromotions = useMemo(() => {
    return promotions.filter((promotion) => {
      const source = `${promotion.id} ${promotion.code} ${promotion.name} ${promotion.type} ${promotion.value} ${promotion.note}`;
      const matchQuery = source.toLowerCase().includes(query.toLowerCase());
      const matchStatus = selectedPromotionStatus === "Tất cả" || promotion.status === selectedPromotionStatus;
      return matchQuery && matchStatus;
    });
  }, [promotions, query, selectedPromotionStatus]);

  const activeRows = tab === "Dịch vụ" ? filteredServices : tab === "Tài chính" ? filteredFinanceRecords : filteredPromotions;
  const pageCount = Math.ceil(activeRows.length / pageSize);
  const paginatedServices = filteredServices.slice((page - 1) * pageSize, page * pageSize);
  const paginatedFinance = filteredFinanceRecords.slice((page - 1) * pageSize, page * pageSize);
  const paginatedPromotions = filteredPromotions.slice((page - 1) * pageSize, page * pageSize);
  const activeColumns = tab === "Dịch vụ" ? columnsService : tab === "Tài chính" ? columnsFinance : columnsPromotion;
  const setActiveColumns = tab === "Dịch vụ" ? setColumnsService : tab === "Tài chính" ? setColumnsFinance : setColumnsPromotion;
  const defaultActiveColumns = tab === "Dịch vụ" ? serviceColumns : tab === "Tài chính" ? financeColumns : promotionColumns;
  const serviceCustomColumns = columnsService.filter((column) => !serviceColumns.some((defaultColumn) => defaultColumn.id === column.id) && column.id !== "actions");
  const financeCustomColumns = columnsFinance.filter((column) => !financeColumns.some((defaultColumn) => defaultColumn.id === column.id) && column.id !== "actions");
  const promotionCustomColumns = columnsPromotion.filter((column) => !promotionColumns.some((defaultColumn) => defaultColumn.id === column.id) && column.id !== "actions");
  const activePaginatedRows = tab === "Dịch vụ" ? paginatedServices : tab === "Tài chính" ? paginatedFinance : paginatedPromotions;
  const totalVisibleWidth = activeColumns.filter((column) => column.visible !== false).reduce((sum, column) => sum + (column.width || 150), 0);
  const totalAmount = useMemo(() => filteredFinanceRecords.reduce((sum, item) => sum + item.amount, 0), [filteredFinanceRecords]);
  const revenue = financeRecords.filter((item) => item.type === "Doanh thu" && item.status === "Đã thu").reduce((sum, item) => sum + item.amount, 0);
  const receivable = financeRecords.filter((item) => item.type === "Công nợ").reduce((sum, item) => sum + item.amount, 0);
  const expense = financeRecords.filter((item) => item.type === "Chi phí" || item.type === "Hoàn tiền").reduce((sum, item) => sum + item.amount, 0);
  const activeVisibleIds = (viewMode === "Bảng kéo" ? activeRows : activePaginatedRows).map((item) => item.id);
  const activeSelectedIds = tab === "Dịch vụ" ? selectedServiceIds : tab === "Tài chính" ? selectedFinanceIds : selectedPromotionIds;
  const allVisibleSelected = activeVisibleIds.length > 0 && activeVisibleIds.every((id) => activeSelectedIds.has(id));
  const selectedVisibleCount = activeVisibleIds.filter((id) => activeSelectedIds.has(id)).length;

  const toggleActiveVisibleRows = () => {
    const updateSelected = (setSelected: Dispatch<SetStateAction<Set<string>>>) => {
      setSelected((prev) => {
        const next = new Set(prev);
        if (allVisibleSelected) {
          activeVisibleIds.forEach((id) => next.delete(id));
        } else {
          activeVisibleIds.forEach((id) => next.add(id));
        }
        return next;
      });
    };

    if (tab === "Dịch vụ") updateSelected(setSelectedServiceIds);
    else if (tab === "Tài chính") updateSelected(setSelectedFinanceIds);
    else updateSelected(setSelectedPromotionIds);
  };

  const toggleActiveRow = (id: string) => {
    const updateSelected = (setSelected: Dispatch<SetStateAction<Set<string>>>) => {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    };

    if (tab === "Dịch vụ") updateSelected(setSelectedServiceIds);
    else if (tab === "Tài chính") updateSelected(setSelectedFinanceIds);
    else updateSelected(setSelectedPromotionIds);
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

  const handleDragStart = (event: DragEvent<HTMLTableCellElement>, id: string) => {
    setDraggedColumnId(id);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (event: DragEvent<HTMLTableCellElement>, id: string) => {
    event.preventDefault();
    if (id !== draggedColumnId) setDragOverColumnId(id);
  };

  const handleDragLeave = () => setDragOverColumnId(null);

  const handleDrop = (event: DragEvent<HTMLTableCellElement>, id: string) => {
    event.preventDefault();
    if (!draggedColumnId || draggedColumnId === id) {
      setDragOverColumnId(null);
      return;
    }

    setActiveColumns((prev) => {
      const draggedIndex = prev.findIndex((column) => column.id === draggedColumnId);
      const dropIndex = prev.findIndex((column) => column.id === id);
      if (draggedIndex === -1 || dropIndex === -1) return prev;

      const next = [...prev];
      const temp = next[draggedIndex];
      next[draggedIndex] = next[dropIndex];
      next[dropIndex] = temp;
      return next;
    });

    setDraggedColumnId(null);
    setDragOverColumnId(null);
  };

  const handleDragEnd = () => {
    setDraggedColumnId(null);
    setDragOverColumnId(null);
  };

  const filterOptions = useMemo<FilterOption[]>(() => {
    if (tab === "Dịch vụ") {
      return serviceStatuses.map((status) => ({
        id: status,
        label: status,
        color: status === "Tất cả" ? "#64748b" : statusColor[status].text,
        bgColor: status === "Tất cả" ? "rgba(100,116,139,0.09)" : statusColor[status].bg,
      }));
    }
    if (tab === "Tài chính") {
      return financeTypes.map((type) => ({
        id: type,
        label: type,
        color: type === "Tất cả" ? "#64748b" : typeColor[type],
        bgColor: type === "Tất cả" ? "rgba(100,116,139,0.09)" : `${typeColor[type]}14`,
      }));
    }
    return promotionStatuses.map((status) => ({
      id: status,
      label: status,
      color: status === "Tất cả" ? "#64748b" : statusColor[status].text,
      bgColor: status === "Tất cả" ? "rgba(100,116,139,0.09)" : statusColor[status].bg,
    }));
  }, [tab]);

  const kanbanColumns = useMemo<KanbanColumn[]>(() => {
    if (tab === "Dịch vụ") {
      return serviceStatuses.filter((status) => status !== "Tất cả").map((status) => ({
        id: status,
        label: status,
        color: statusColor[status],
      }));
    }
    if (tab === "Tài chính") {
      return financeStatuses.map((status) => ({
        id: status,
        label: status,
        color: statusColor[status],
      }));
    }
    return promotionStatuses.filter((status) => status !== "Tất cả").map((status) => ({
      id: status,
      label: status,
      color: statusColor[status],
    }));
  }, [tab]);

  const getDefaultExportFileName = () => {
    const scope = tab === "Dịch vụ" ? "dich-vu" : tab === "Tài chính" ? "tai-chinh" : "ma-giam-gia";
    return `${scope}-${new Date().toISOString().slice(0, 10)}`;
  };

  const handleExport = (format: "pdf" | "excel" | "csv", fileName: string) => {
    const rows = activeRows;
    if (rows.length === 0) return;
    const headers = activeColumns.filter((column) => column.visible !== false && column.id !== "actions").map((column) => column.label);
    const values = rows.map((row) =>
      activeColumns.filter((column) => column.visible !== false && column.id !== "actions").map((column) => String((row as Record<string, unknown>)[column.id] ?? ""))
    );
    const baseFileName = fileName || getDefaultExportFileName();

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
    printWindow.document.write(`<html><body><h2>${tab}</h2><table border="1"><thead><tr>${tableHead}</tr></thead><tbody>${tableBody}</tbody></table></body></html>`);
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
    setActiveColumns((prev) => {
      const next = [...prev];
      const actionIndex = next.findIndex((column) => column.id === "actions");
      next.splice(actionIndex === -1 ? next.length : actionIndex, 0, newColumn);
      return next;
    });
    if (tab === "Dịch vụ") setServiceForm((prev) => ({ ...prev, [newColumn.id]: "" }));
    else if (tab === "Tài chính") setFinanceForm((prev) => ({ ...prev, [newColumn.id]: "" }));
    else setPromotionForm((prev) => ({ ...prev, [newColumn.id]: "" }));
    setNewColumnName("");
    setOpenAddColumn(false);
  };

  const getCustomFields = (source: Record<string, unknown>, customColumns: DashboardTableColumn[]) =>
    Object.fromEntries(customColumns.map((column) => [column.id, String(source[column.id] ?? "")]));

  const getCustomFormValues = (form: Record<string, string>, customColumns: DashboardTableColumn[]) =>
    Object.fromEntries(customColumns.map((column) => [column.id, form[column.id] ?? ""]));

  const handleDeleteClick = (id: string, type: "service" | "finance" | "promotion") => {
    setDeleteTarget({ id, type });
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const { id, type } = deleteTarget;
    if (type === "service") {
      setServices((prev) => prev.filter((item) => item.id !== id));
      setSelectedServiceIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else if (type === "finance") {
      setFinanceRecords((prev) => prev.filter((item) => item.id !== id));
      setSelectedFinanceIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      setPromotions((prev) => prev.filter((item) => item.id !== id));
      setSelectedPromotionIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
    toast.success(`Đã xóa thành công mục ${id}!`);
    setConfirmDeleteOpen(false);
    setDeleteTarget(null);
  };

  const openCreateServiceForm = () => {
    setEditingServiceId(null);
    setServiceForm({ ...emptyServiceForm, ...getCustomFields({}, serviceCustomColumns) });
    setOpenServiceForm(true);
  };

  const openEditServiceForm = (service: Service) => {
    setEditingServiceId(service.id);
    setServiceForm({
      name: service.name,
      category: service.category,
      unit: service.unit,
      price: String(service.price),
      turnaround: service.turnaround,
      status: service.status,
      promotion: service.promotion,
      note: service.note,
      ...getCustomFields(service, serviceCustomColumns),
    });
    setOpenServiceForm(true);
  };

  const saveService = () => {
    if (!serviceForm.name.trim()) return;
    const payload: Omit<Service, "id"> = {
      name: serviceForm.name,
      category: serviceForm.category,
      unit: serviceForm.unit,
      price: Number(serviceForm.price) || 0,
      turnaround: serviceForm.turnaround || "Trong ngày",
      status: serviceForm.status,
      promotion: serviceForm.promotion === "Có" ? "Có" : "Không",
      note: serviceForm.note,
      ...getCustomFormValues(serviceForm, serviceCustomColumns),
    };

    if (editingServiceId) {
      setServices((prev) => prev.map((service) => service.id === editingServiceId ? { ...service, ...payload } as Service : service));
    } else {
      const newService: Service = { id: `DV-${Date.now().toString().slice(-3)}`, ...payload } as Service;
      setServices((prev) => [newService, ...prev]);
    }

    setPage(1);
    setOpenServiceForm(false);
  };

  const renderOptionalCell = (source: object, column: DashboardTableColumn) => {
    const value = (source as Record<string, unknown>)[column.id];
    const isMissing = value === undefined || value === null || value === "";
    const displayValue = isMissing ? "Chưa có" : String(value);

    return (
      <TableCell
        key={column.id}
        className={`max-w-0 truncate overflow-hidden ${isMissing ? "text-slate-400 italic" : "text-slate-600"}`}
        title={displayValue}
      >
        {displayValue}
      </TableCell>
    );
  };

  const renderServiceCell = (service: Service, column: DashboardTableColumn) => {
    if (column.id === "id") return (
      <TableCell key={column.id} className="pl-4 font-medium text-slate-900">
        <div className="flex items-center gap-2">
          <input type="checkbox" aria-label={`Chọn dịch vụ ${service.id}`} checked={selectedServiceIds.has(service.id)} onChange={() => toggleActiveRow(service.id)} className={`shrink-0 ${checkboxClass}`} />
          <span>{service.id}</span>
        </div>
      </TableCell>
    );
    if (column.id === "name") return <TableCell key={column.id} className="font-medium text-slate-900">{service.name}</TableCell>;
    if (column.id === "price") return <TableCell key={column.id} className="font-medium text-slate-900">{formatCurrency(service.price)}</TableCell>;
    if (column.id === "status") return <TableCell key={column.id}><StatusPill label={service.status} /></TableCell>;
    if (column.id === "promotion") return <TableCell key={column.id} className="text-slate-600">{service.promotion}</TableCell>;
    if (column.id === "note") return <TableCell key={column.id} className="truncate text-slate-500" title={service.note}>{service.note}</TableCell>;
    if (column.id === "actions") {
      return (
        <TableCell key={column.id} className="px-4">
          <div className="flex items-center gap-1.5">
            <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50" onClick={() => openEditServiceForm(service)}>
              Sửa
            </button>
            <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600" onClick={() => handleDeleteClick(service.id, "service")}>
              Xóa
            </button>
          </div>
        </TableCell>
      );
    }
    return renderOptionalCell(service, column);
  };

  const openCreateFinanceForm = () => {
    setEditingFinanceId(null);
    setFinanceForm({ ...emptyFinanceForm, ...getCustomFields({}, financeCustomColumns), date: new Date().toISOString().slice(0, 10), owner: currentStaffName });
    setOpenFinanceForm(true);
  };

  const openEditFinanceForm = (record: FinanceRecord) => {
    setEditingFinanceId(record.id);
    setFinanceForm({
      date: record.date,
      type: record.type,
      customer: record.customer,
      orderId: record.orderId,
      method: record.method,
      amount: String(record.amount),
      status: record.status,
      owner: currentStaffName,
      note: record.note,
      ...getCustomFields(record, financeCustomColumns),
    });
    setOpenFinanceForm(true);
  };

  const saveFinanceRecord = () => {
    if (!financeForm.customer.trim() || !financeForm.amount.trim()) return;
    const payload: Omit<FinanceRecord, "id"> = {
      date: financeForm.date || new Date().toISOString().slice(0, 10),
      type: financeForm.type,
      customer: financeForm.customer,
      orderId: financeForm.orderId || "-",
      method: financeForm.method,
      amount: Number(financeForm.amount) || 0,
      status: financeForm.status,
      owner: currentStaffName,
      note: financeForm.note,
      ...getCustomFormValues(financeForm, financeCustomColumns),
    };

    if (editingFinanceId) {
      setFinanceRecords((prev) => prev.map((record) => record.id === editingFinanceId ? { ...record, ...payload } as FinanceRecord : record));
    } else {
      const newRecord: FinanceRecord = { id: `TC-${Date.now().toString().slice(-4)}`, ...payload } as FinanceRecord;
      setFinanceRecords((prev) => [newRecord, ...prev]);
    }

    setPage(1);
    setOpenFinanceForm(false);
  };

  const openCreatePromotionForm = () => {
    setEditingPromotionId(null);
    const startDate = new Date().toISOString().slice(0, 10);
    const endDate = "";
    setPromotionForm({ ...emptyPromotionForm, ...getCustomFields({}, promotionCustomColumns), startDate, endDate, status: getPromotionStatusByDate(startDate, endDate) });
    setOpenPromotionForm(true);
  };

  const openEditPromotionForm = (promotion: Promotion) => {
    setEditingPromotionId(promotion.id);
    setPromotionForm({
      code: promotion.code,
      name: promotion.name,
      type: promotion.type,
      value: promotion.value,
      appliedService: promotion.appliedService,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      usage: promotion.usage,
      status: getPromotionStatusByDate(promotion.startDate, promotion.endDate),
      note: promotion.note,
      ...getCustomFields(promotion, promotionCustomColumns),
    });
    setOpenPromotionForm(true);
  };

  const savePromotion = () => {
    if (!promotionForm.code.trim() || !promotionForm.name.trim()) return;
    const payload: Omit<Promotion, "id"> = {
      code: promotionForm.code.toUpperCase(),
      name: promotionForm.name,
      type: promotionForm.type,
      value: promotionForm.value,
      appliedService: promotionForm.appliedService || "Tất cả dịch vụ",
      startDate: promotionForm.startDate || new Date().toISOString().slice(0, 10),
      endDate: promotionForm.endDate,
      usage: promotionForm.usage.trim(),
      claimed: editingPromotionId ? promotions.find((promotion) => promotion.id === editingPromotionId)?.claimed || 0 : 0,
      status: getPromotionStatusByDate(promotionForm.startDate, promotionForm.endDate),
      note: promotionForm.note,
      ...getCustomFormValues(promotionForm, promotionCustomColumns),
    };

    if (editingPromotionId) {
      setPromotions((prev) => prev.map((promotion) => promotion.id === editingPromotionId ? { ...promotion, ...payload } as Promotion : promotion));
    } else {
      const newPromotion: Promotion = { id: `MG-${Date.now().toString().slice(-3)}`, ...payload } as Promotion;
      setPromotions((prev) => [newPromotion, ...prev]);
    }

    setPage(1);
    setOpenPromotionForm(false);
  };

  const renderFinanceCell = (record: FinanceRecord, column: DashboardTableColumn) => {
    if (column.id === "id") return (
      <TableCell key={column.id} className="pl-4 font-medium text-slate-900">
        <div className="flex items-center gap-2">
          <input type="checkbox" aria-label={`Chọn giao dịch ${record.id}`} checked={selectedFinanceIds.has(record.id)} onChange={() => toggleActiveRow(record.id)} className={`shrink-0 ${checkboxClass}`} />
          <span>{record.id}</span>
        </div>
      </TableCell>
    );
    if (column.id === "type") {
      return (
        <TableCell key={column.id}>
          <span className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs font-medium" style={{ color: typeColor[record.type], backgroundColor: `${typeColor[record.type]}14` }}>
            <span className="size-1.5 rounded-full" style={{ backgroundColor: typeColor[record.type] }} />
            {record.type}
          </span>
        </TableCell>
      );
    }
    if (column.id === "amount") return <TableCell key={column.id} className="font-medium text-slate-900">{formatCurrency(record.amount)}</TableCell>;
    if (column.id === "date") return <TableCell key={column.id} className="text-slate-600">{formatReadableDate(record.date)}</TableCell>;
    if (column.id === "customer") {
      return (
        <TableCell key={column.id} className="max-w-0 truncate overflow-hidden" title={record.customer}>
          <div className="flex min-w-0 items-center gap-2">
            <Image src={defaultAvatarUrl} alt={record.customer} width={24} height={24} className="size-6 shrink-0 rounded-full object-cover" />
            <span className="truncate font-medium text-slate-900">{record.customer}</span>
          </div>
        </TableCell>
      );
    }
    if (column.id === "owner") {
      return (
        <TableCell key={column.id} className="max-w-0 truncate overflow-hidden" title={record.owner}>
          <div className="flex min-w-0 items-center gap-2">
            <Image src={record.owner === currentStaffName ? currentStaffAvatar : defaultAvatarUrl} alt={record.owner} width={24} height={24} className="size-6 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm" />
            <span className="truncate text-slate-600">{record.owner}</span>
          </div>
        </TableCell>
      );
    }
    if (column.id === "status") return <TableCell key={column.id}><StatusPill label={record.status} /></TableCell>;
    if (column.id === "note") return <TableCell key={column.id} className="truncate text-slate-500" title={record.note}>{record.note}</TableCell>;
    if (column.id === "actions") {
      return (
        <TableCell key={column.id} className="px-4">
          <div className="flex items-center gap-1.5">
            <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50" onClick={() => openEditFinanceForm(record)}>
              Sửa
            </button>
            <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600" onClick={() => handleDeleteClick(record.id, "finance")}>
              Xóa
            </button>
          </div>
        </TableCell>
      );
    }
    return renderOptionalCell(record, column);
  };

  const renderPromotionCell = (promotion: Promotion, column: DashboardTableColumn) => {
    if (column.id === "id") return (
      <TableCell key={column.id} className="pl-4 font-medium text-slate-900">
        <div className="flex items-center gap-2">
          <input type="checkbox" aria-label={`Chọn mã giảm giá ${promotion.id}`} checked={selectedPromotionIds.has(promotion.id)} onChange={() => toggleActiveRow(promotion.id)} className={`shrink-0 ${checkboxClass}`} />
          <span>{promotion.id}</span>
        </div>
      </TableCell>
    );
    if (column.id === "code") return <TableCell key={column.id} className="font-semibold text-slate-900">{promotion.code}</TableCell>;
    if (column.id === "name") return <TableCell key={column.id} className="font-medium text-slate-900">{promotion.name}</TableCell>;
    if (column.id === "appliedService") return <TableCell key={column.id} className="max-w-0 truncate overflow-hidden text-slate-600" title={promotion.appliedService}>{promotion.appliedService}</TableCell>;
    if (column.id === "startDate") return <TableCell key={column.id} className="text-slate-600">{formatReadableDate(promotion.startDate)}</TableCell>;
    if (column.id === "endDate") return <TableCell key={column.id} className="text-slate-600">{formatPromotionEndDate(promotion.endDate)}</TableCell>;
    if (column.id === "usage") return <TableCell key={column.id} className="text-slate-600">{formatPromotionIssuedQuantity(promotion.usage, promotion.claimed)}</TableCell>;
    if (column.id === "status") return <TableCell key={column.id}><StatusPill label={promotion.status} /></TableCell>;
    if (column.id === "note") return <TableCell key={column.id} className="truncate text-slate-500" title={promotion.note}>{promotion.note}</TableCell>;
    if (column.id === "actions") {
      return (
        <TableCell key={column.id} className="px-4">
          <div className="flex items-center gap-1.5">
            <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50" onClick={() => openEditPromotionForm(promotion)}>
              Sửa
            </button>
            <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600" onClick={() => handleDeleteClick(promotion.id, "promotion")}>
              Xóa
            </button>
          </div>
        </TableCell>
      );
    }
    return renderOptionalCell(promotion, column);
  };

  const renderActiveCell = (row: Service | FinanceRecord | Promotion, column: DashboardTableColumn) => {
    if (tab === "Dịch vụ") return renderServiceCell(row as Service, column);
    if (tab === "Tài chính") return renderFinanceCell(row as FinanceRecord, column);
    return renderPromotionCell(row as Promotion, column);
  };

  const getRowTitle = (row: Service | FinanceRecord | Promotion) => {
    if (tab === "Dịch vụ") return (row as Service).name;
    if (tab === "Tài chính") return (row as FinanceRecord).customer;
    return (row as Promotion).name;
  };

  const getRowSubtitle = (row: Service | FinanceRecord | Promotion) => {
    if (tab === "Dịch vụ") {
      const service = row as Service;
      return `${service.category} · ${formatCurrency(service.price)}`;
    }
    if (tab === "Tài chính") {
      const record = row as FinanceRecord;
      return `${record.type} · ${formatCurrency(record.amount)} · ${record.orderId}`;
    }
    const promotion = row as Promotion;
    return `${promotion.code} · ${promotion.value} · ${formatPromotionIssuedQuantity(promotion.usage, promotion.claimed)}`;
  };

  const getRowStatus = (row: Service | FinanceRecord | Promotion) => {
    if (tab === "Dịch vụ") return (row as Service).status;
    if (tab === "Tài chính") return (row as FinanceRecord).status;
    return (row as Promotion).status;
  };

  const renderKanbanCard = (row: Service | FinanceRecord | Promotion) => {
    const status = getRowStatus(row);
    return (
      <div
        key={row.id}
        draggable
        onDragStart={(event) => {
          setDraggedItemId(row.id);
          event.dataTransfer.effectAllowed = "move";
        }}
        onDragEnd={() => {
          setDraggedItemId(null);
          setDragOverStatus(null);
        }}
        className={`cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-slate-300 hover:shadow-md active:cursor-grabbing ${draggedItemId === row.id ? "opacity-50 ring-2 ring-slate-400" : ""}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <input
              type="checkbox"
              aria-label={`Chọn ${row.id}`}
              checked={activeSelectedIds.has(row.id)}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              onChange={() => toggleActiveRow(row.id)}
              className={`shrink-0 ${checkboxClass}`}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-700">{getRowTitle(row)}</p>
              <p className="truncate text-[11px] text-slate-400">{row.id}</p>
            </div>
          </div>
          <StatusPill label={status} />
        </div>
        <p className="mt-2 line-clamp-2 text-xs text-slate-500">{getRowSubtitle(row)}</p>
        <div className="mt-3 flex justify-end border-t border-slate-100 pt-2">
          <button
            type="button"
            className="inline-flex h-6 items-center rounded-md bg-slate-100 px-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
            onClick={() => {
              if (tab === "Dịch vụ") openEditServiceForm(row as Service);
              else if (tab === "Tài chính") openEditFinanceForm(row as FinanceRecord);
              else openEditPromotionForm(row as Promotion);
            }}
          >
            Chi tiết
          </button>
        </div>
      </div>
    );
  };

  const renderListRow = (row: Service | FinanceRecord | Promotion) => {
    const status = getRowStatus(row);
    return (
      <div key={row.id} className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <input
              type="checkbox"
              aria-label={`Chọn ${row.id}`}
              checked={activeSelectedIds.has(row.id)}
              onChange={() => toggleActiveRow(row.id)}
              className={`mt-1 shrink-0 ${checkboxClass}`}
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-950">{getRowTitle(row)}</p>
                <span className="text-xs font-medium text-slate-400">{row.id}</span>
                <StatusPill label={status} />
              </div>
              <p className="mt-2 text-xs text-slate-500">{getRowSubtitle(row)}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-slate-50"
              onClick={() => {
                if (tab === "Dịch vụ") openEditServiceForm(row as Service);
                else if (tab === "Tài chính") openEditFinanceForm(row as FinanceRecord);
                else openEditPromotionForm(row as Promotion);
              }}
            >
              Sửa
            </button>
            <button
              type="button"
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600"
              onClick={() => {
                const type = tab === "Dịch vụ" ? "service" : tab === "Tài chính" ? "finance" : "promotion";
                handleDeleteClick(row.id, type);
              }}
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <PageShell fullHeight>
      <div className="grid shrink-0 gap-3 md:grid-cols-4">
        <MetricCard title="Doanh thu đã thu" value={formatCurrency(revenue)} hint={`Theo ${rangeLabel}`} icon={Wallet} color="#059669" />
        <MetricCard title="Công nợ cần thu" value={formatCurrency(receivable)} hint="Theo dõi đơn chưa thanh toán" icon={ReceiptText} color="#d97706" />
        <MetricCard title="Chi phí ghi nhận" value={formatCurrency(expense)} hint="Hóa chất, hoàn tiền, vận hành" icon={CircleDollarSign} color="#2563eb" />
        <MetricCard title="Mã giảm giá" value={`${promotions.filter((item) => item.status === "Đang chạy").length}`} hint={`${services.filter((item) => item.status === "Đang hoạt động").length} dịch vụ đang bán`} icon={Gift} color="#7c3aed" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <Toolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          leftContent={
            <div className="flex flex-wrap items-center gap-1">
              {(["Dịch vụ", "Tài chính", "Mã giảm giá"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setTab(item);
                    setPage(1);
                    setQuery("");
                  }}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors ${
                    tab === item ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {item === "Dịch vụ" ? <Tags className="size-3.5" /> : item === "Mã giảm giá" ? <Gift className="size-3.5" /> : <Wallet className="size-3.5" />}
                  {item}
                </button>
              ))}
              <span className="mx-2 hidden h-4 w-px bg-slate-200 sm:block" />
              <ViewModeTabs value={viewMode} onChange={setViewMode} />
            </div>
          }
          query={query}
          onQueryChange={(value) => {
            setQuery(value);
            setPage(1);
          }}
          columns={activeColumns}
          onColumnsChange={setActiveColumns}
          tableResizeMode={tableResizeMode}
          onTableResizeModeChange={setTableResizeMode}
          selectedCount={activeSelectedIds.size}
          onOpenAddColumn={() => setOpenAddColumn(true)}
          onOpenHistory={() => {}}
          onExport={handleExport}
          defaultExportFileName={getDefaultExportFileName()}
          onCreateClick={tab === "Dịch vụ" ? openCreateServiceForm : tab === "Mã giảm giá" ? openCreatePromotionForm : openCreateFinanceForm}
          createLabel={tab === "Dịch vụ" ? "Thêm dịch vụ" : tab === "Mã giảm giá" ? "Thêm mã giảm giá" : "Thêm giao dịch"}
          defaultColumnIds={defaultActiveColumns.map((column) => column.id)}
          searchPlaceholder={tab === "Dịch vụ" ? "Tìm dịch vụ, nhóm, mã ưu đãi..." : tab === "Mã giảm giá" ? "Tìm mã, tên chương trình..." : "Tìm khách, mã đơn, phương thức..."}
          showHistoryButton={false}
        />

        <FilterBar
          rangeLabel={rangeLabel}
          selectedValue={tab === "Dịch vụ" ? selectedServiceStatus : tab === "Tài chính" ? selectedFinanceType : selectedPromotionStatus}
          onValueChange={(value) => {
            if (tab === "Dịch vụ") setSelectedServiceStatus(value as ServiceStatus | "Tất cả");
            else if (tab === "Tài chính") setSelectedFinanceType(value as FinanceType | "Tất cả");
            else setSelectedPromotionStatus(value as PromotionStatus | "Tất cả");
            setPage(1);
          }}
          filterOptions={filterOptions}
          filterLabel={tab === "Tài chính" ? "Loại giao dịch" : "Trạng thái"}
          allSelected={allVisibleSelected}
          disabled={activeVisibleIds.length === 0}
          selectedCount={selectedVisibleCount}
          totalCount={activeVisibleIds.length}
          itemLabel={tab === "Dịch vụ" ? "dịch vụ" : tab === "Tài chính" ? "giao dịch" : "mã giảm giá"}
          checkboxClass={checkboxClass}
          onToggleAll={toggleActiveVisibleRows}
        />

        {viewMode === "Bảng" ? (
          <TableView
            columns={activeColumns}
            rows={activePaginatedRows}
            pageSize={pageSize}
            emptyMessage={tab === "Dịch vụ" ? "Không tìm thấy dịch vụ phù hợp." : tab === "Mã giảm giá" ? "Không tìm thấy mã giảm giá phù hợp." : "Không tìm thấy giao dịch phù hợp."}
            tableResizeMode={tableResizeMode}
            totalVisibleWidth={totalVisibleWidth}
            renderCell={renderActiveCell}
            columnDrag={{
              draggedColumnId,
              dragOverColumnId,
              onDragStart: handleDragStart,
              onDragOver: handleDragOver,
              onDragLeave: handleDragLeave,
              onDrop: handleDrop,
              onDragEnd: handleDragEnd,
            }}
            page={page}
            pageCount={pageCount}
            totalRows={activeRows.length}
            totalLabel={tab === "Tài chính" ? `Tổng số tiền: ${totalAmount.toLocaleString("vi-VN")}đ` : undefined}
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
            rows={activeRows}
            groupByKey="status"
            draggedItemId={draggedItemId}
            onDraggedItemIdChange={setDraggedItemId}
            dragOverColumnId={dragOverStatus}
            onDragOverColumnIdChange={setDragOverStatus}
            onDropItem={(id, status) => {
              if (tab === "Dịch vụ") setServices((prev) => prev.map((item) => item.id === id ? { ...item, status: status as ServiceStatus } : item));
              else if (tab === "Tài chính") setFinanceRecords((prev) => prev.map((item) => item.id === id ? { ...item, status: status as FinanceStatus } : item));
              else setPromotions((prev) => prev.map((item) => item.id === id ? { ...item, status: status as PromotionStatus } : item));
            }}
            renderCard={renderKanbanCard}
            tableResizeMode={tableResizeMode}
          />
        ) : (
          <ListView
            paginatedRows={activePaginatedRows}
            emptyMessage={tab === "Dịch vụ" ? "Không tìm thấy dịch vụ phù hợp." : tab === "Mã giảm giá" ? "Không tìm thấy mã giảm giá phù hợp." : "Không tìm thấy giao dịch phù hợp."}
            renderRow={renderListRow}
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

      <Dialog open={openServiceForm} onOpenChange={setOpenServiceForm}>
        <DialogContent className={formDialogClassName} showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{editingServiceId ? `Chỉnh sửa ${editingServiceId}` : "Thêm dịch vụ mới"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tên dịch vụ</Label>
                <Input value={serviceForm.name} onChange={(event) => setServiceForm({ ...serviceForm, name: event.target.value })} placeholder="Giặt sấy nhanh" />
              </div>
              <div className="space-y-2">
                <Label>Nhóm dịch vụ</Label>
                <Input value={serviceForm.category} onChange={(event) => setServiceForm({ ...serviceForm, category: event.target.value })} placeholder="Giặt theo kg" />
              </div>
              <div className="space-y-2">
                <Label>Đơn vị tính</Label>
                <Select value={serviceForm.unit} onValueChange={(unit) => setServiceForm({ ...serviceForm, unit: unit as ServiceUnit })}>
                  <SelectTrigger className={selectClassName}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={selectContentClassName}>
                    {serviceUnits.map((unit) => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Đơn giá</Label>
                <div className="relative">
                  <Input className="pr-12" inputMode="numeric" value={serviceForm.price} onChange={(event) => setServiceForm({ ...serviceForm, price: event.target.value })} />
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
                    VND
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Thời gian xử lý</Label>
                <Select value={serviceForm.turnaround} onValueChange={(turnaround) => setServiceForm({ ...serviceForm, turnaround: turnaround as ServiceTurnaround })}>
                  <SelectTrigger className={selectClassName}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={selectContentClassName}>
                    {serviceTurnarounds.map((turnaround) => (
                      <SelectItem key={turnaround} value={turnaround}>{turnaround}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select value={serviceForm.status} onValueChange={(status) => setServiceForm({ ...serviceForm, status: status as ServiceStatus })}>
                  <SelectTrigger className={selectClassName}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={selectContentClassName}>
                    {serviceStatuses.filter((status) => status !== "Tất cả").map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ưu đãi</Label>
                <Select value={serviceForm.promotion} onValueChange={(promotion) => setServiceForm({ ...serviceForm, promotion: promotion as ServicePromotion })}>
                  <SelectTrigger className={selectClassName}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={selectContentClassName}>
                    {(["Không", "Có"] as ServicePromotion[]).map((promotion) => (
                      <SelectItem key={promotion} value={promotion}>{promotion}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {serviceCustomColumns.map((column) => (
                <div key={column.id} className="space-y-2">
                  <Label>{column.label}</Label>
                  <Input value={serviceForm[column.id] ?? ""} onChange={(event) => setServiceForm({ ...serviceForm, [column.id]: event.target.value })} placeholder={`Nhập ${column.label.toLowerCase()}`} />
                </div>
              ))}
              <div className="space-y-2 md:col-span-2">
                <Label>Ghi chú vận hành</Label>
                <Textarea value={serviceForm.note} onChange={(event) => setServiceForm({ ...serviceForm, note: event.target.value })} placeholder="Điều kiện nhận đồ, hóa chất, phân loại..." />
              </div>
          </div>
          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpenServiceForm(false)}>
              Hủy
            </Button>
            <Button className="bg-slate-900 font-semibold text-white hover:bg-slate-800" onClick={saveService}>
              Lưu dịch vụ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openFinanceForm} onOpenChange={setOpenFinanceForm}>
        <DialogContent className={formDialogClassName} showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{editingFinanceId ? `Chỉnh sửa ${editingFinanceId}` : "Thêm giao dịch tài chính"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Ngày ghi nhận</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 w-full justify-start rounded-lg border border-gray-200 bg-white px-2.5 text-left text-sm font-normal text-slate-700 shadow-none hover:bg-slate-50 focus-visible:ring-gray-200"
                    >
                      <CalendarDays className="mr-2 size-4 text-slate-400" />
                      {formatDisplayDate(financeForm.date)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="z-[2200] w-auto p-0" sideOffset={6}>
                    <Calendar
                      mode="single"
                      selected={parseInputDate(financeForm.date)}
                      defaultMonth={parseInputDate(financeForm.date)}
                      onSelect={(date) => {
                        if (date) setFinanceForm({ ...financeForm, date: toInputDate(date) });
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Loại giao dịch</Label>
                <Select value={financeForm.type} onValueChange={(type) => setFinanceForm({ ...financeForm, type: type as FinanceType })}>
                  <SelectTrigger className={selectClassName}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={selectContentClassName}>
                    {financeTypes.filter((type) => type !== "Tất cả").map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Khách hàng / đối tác</Label>
                <div className="relative">
                  {financeForm.customer.trim() && (
                    <Image src={defaultAvatarUrl} alt={financeForm.customer} width={24} height={24} className="pointer-events-none absolute left-2.5 top-1/2 size-6 -translate-y-1/2 rounded-full object-cover" />
                  )}
                  <Input className={financeForm.customer.trim() ? "pl-10" : ""} value={financeForm.customer} onChange={(event) => setFinanceForm({ ...financeForm, customer: event.target.value })} placeholder="Tên khách hoặc nhà cung cấp" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Mã đơn liên quan</Label>
                <Input value={financeForm.orderId} onChange={(event) => setFinanceForm({ ...financeForm, orderId: event.target.value })} placeholder="DH-1052 hoặc -" />
              </div>
              <div className="space-y-2">
                <Label>Phương thức</Label>
                <Select value={financeForm.method} onValueChange={(method) => setFinanceForm({ ...financeForm, method: method as FinanceMethod })}>
                  <SelectTrigger className={selectClassName}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={selectContentClassName}>
                    {financeMethods.map((method) => (
                      <SelectItem key={method} value={method}>{method}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Số tiền</Label>
                <div className="relative">
                  <Input className="pr-12" inputMode="numeric" value={financeForm.amount} onChange={(event) => setFinanceForm({ ...financeForm, amount: event.target.value })} />
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
                    VND
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select value={financeForm.status} onValueChange={(status) => setFinanceForm({ ...financeForm, status: status as FinanceStatus })}>
                  <SelectTrigger className={selectClassName}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={selectContentClassName}>
                    {financeStatuses.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Phụ trách</Label>
                <div className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-muted/40 px-2.5 text-sm text-slate-700">
                  <Image src={currentStaffAvatar} alt={currentStaffName} width={24} height={24} className="size-6 shrink-0 rounded-full object-cover" />
                  <span className="truncate">{currentStaffName}</span>
                </div>
              </div>
              {financeCustomColumns.map((column) => (
                <div key={column.id} className="space-y-2">
                  <Label>{column.label}</Label>
                  <Input value={financeForm[column.id] ?? ""} onChange={(event) => setFinanceForm({ ...financeForm, [column.id]: event.target.value })} placeholder={`Nhập ${column.label.toLowerCase()}`} />
                </div>
              ))}
              <div className="space-y-2 md:col-span-2">
                <Label>Ghi chú đối soát</Label>
                <Textarea value={financeForm.note} onChange={(event) => setFinanceForm({ ...financeForm, note: event.target.value })} placeholder="Nội dung thu chi, nhắc nợ, lý do hoàn tiền..." />
              </div>
          </div>
          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpenFinanceForm(false)}>
              Hủy
            </Button>
            <Button className="bg-slate-900 font-semibold text-white hover:bg-slate-800" onClick={saveFinanceRecord}>
              Lưu giao dịch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openPromotionForm} onOpenChange={setOpenPromotionForm}>
        <DialogContent className={formDialogClassName} showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{editingPromotionId ? `Chỉnh sửa ${editingPromotionId}` : "Thêm mã giảm giá"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Mã giảm giá</Label>
                <Input value={promotionForm.code} onChange={(event) => setPromotionForm({ ...promotionForm, code: event.target.value })} placeholder="WELCOME10" />
              </div>
              <div className="space-y-2">
                <Label>Tên chương trình</Label>
                <Input value={promotionForm.name} onChange={(event) => setPromotionForm({ ...promotionForm, name: event.target.value })} placeholder="Khách mới" />
              </div>
              <div className="space-y-2">
                <Label>Loại ưu đãi</Label>
                <Select value={promotionForm.type} onValueChange={(type) => setPromotionForm({ ...promotionForm, type: type as PromotionType })}>
                  <SelectTrigger className={selectClassName}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={selectContentClassName}>
                    {promotionTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Giá trị</Label>
                <Input value={promotionForm.value} onChange={(event) => setPromotionForm({ ...promotionForm, value: event.target.value })} placeholder="10% / 25.000đ" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Dịch vụ áp dụng</Label>
                {(() => {
                  const selectedServiceNames = promotionForm.appliedService
                    ? promotionForm.appliedService.split(", ").map((s) => s.trim())
                    : [];
                  const isAllServicesSelected = selectedServiceNames.includes("Tất cả dịch vụ") || selectedServiceNames.length === 0;
                  const displayText = isAllServicesSelected ? "Tất cả dịch vụ" : selectedServiceNames.join(", ");
                  return (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 w-full justify-between rounded-lg border border-gray-200 bg-white px-3 text-left text-sm font-normal text-slate-700 shadow-none hover:bg-slate-50 focus-visible:ring-gray-200"
                        >
                          <span className="truncate">{displayText}</span>
                          <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="z-[2200] w-[340px] p-2 bg-white rounded-xl border border-slate-200 shadow-lg">
                        <div className="max-h-[240px] overflow-y-auto space-y-1">
                          <button
                            type="button"
                            onClick={() => {
                              setPromotionForm((prev) => ({
                                ...prev,
                                appliedService: "Tất cả dịch vụ",
                              }));
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-slate-50 text-slate-700"
                          >
                            <input
                              type="checkbox"
                              checked={isAllServicesSelected}
                              readOnly
                              className={`shrink-0 ${checkboxClass}`}
                            />
                            <span className="font-semibold">Tất cả dịch vụ</span>
                          </button>
                          
                          <div className="h-px bg-slate-100 my-1" />
                          
                          {services.map((service) => {
                            const isSelected = selectedServiceNames.includes(service.name);
                            return (
                              <button
                                key={service.id}
                                type="button"
                                onClick={() => {
                                  setPromotionForm((prev) => {
                                    let nextNames: string[];
                                    const currentNames = prev.appliedService
                                      ? prev.appliedService.split(", ").map((s) => s.trim()).filter((s) => s !== "Tất cả dịch vụ")
                                      : [];
                                    if (currentNames.includes(service.name)) {
                                      nextNames = currentNames.filter((name) => name !== service.name);
                                    } else {
                                      nextNames = [...currentNames, service.name];
                                    }
                                    return {
                                      ...prev,
                                      appliedService: nextNames.length > 0 ? nextNames.join(", ") : "Tất cả dịch vụ",
                                    };
                                  });
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-slate-50 text-slate-700"
                              >
                                <input
                                  type="checkbox"
                                  checked={!isAllServicesSelected && isSelected}
                                  readOnly
                                  className={`shrink-0 ${checkboxClass}`}
                                />
                                <span>{service.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </PopoverContent>
                    </Popover>
                  );
                })()}
              </div>
              <div className="space-y-2">
                <Label>Ngày bắt đầu</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 w-full justify-start rounded-lg border border-gray-200 bg-white px-2.5 text-left text-sm font-normal text-slate-700 shadow-none hover:bg-slate-50 focus-visible:ring-gray-200"
                    >
                      <CalendarDays className="mr-2 size-4 text-slate-400" />
                      {formatDisplayDate(promotionForm.startDate)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="z-[2200] w-auto p-0" sideOffset={6}>
                    <Calendar
                      mode="single"
                      selected={parseInputDate(promotionForm.startDate)}
                      defaultMonth={parseInputDate(promotionForm.startDate)}
                      onSelect={(date) => {
                        if (date) {
                          const startDate = toInputDate(date);
                          setPromotionForm({ ...promotionForm, startDate, status: getPromotionStatusByDate(startDate, promotionForm.endDate) });
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Ngày kết thúc</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 w-full justify-start rounded-lg border border-gray-200 bg-white px-2.5 text-left text-sm font-normal text-slate-700 shadow-none hover:bg-slate-50 focus-visible:ring-gray-200"
                    >
                      <CalendarDays className="mr-2 size-4 text-slate-400" />
                      {promotionForm.endDate ? formatDisplayDate(promotionForm.endDate) : "Không giới hạn"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="z-[2200] w-auto p-0" sideOffset={6}>
                    <div>
                      <Calendar
                        mode="single"
                        selected={parseInputDate(promotionForm.endDate)}
                        defaultMonth={parseInputDate(promotionForm.endDate)}
                        onSelect={(date) => {
                          if (date) {
                            const endDate = toInputDate(date);
                            setPromotionForm({ ...promotionForm, endDate, status: getPromotionStatusByDate(promotionForm.startDate, endDate) });
                          }
                        }}
                      />
                      <div className="border-t border-gray-200 p-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-8 w-full rounded-md text-xs"
                          onClick={() => setPromotionForm({ ...promotionForm, endDate: "", status: getPromotionStatusByDate(promotionForm.startDate, "") })}
                        >
                          Không giới hạn
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Số lượng phát</Label>
                <Input inputMode="numeric" value={promotionForm.usage} onChange={(event) => setPromotionForm({ ...promotionForm, usage: event.target.value.replace(/[^\d]/g, "") })} placeholder="Không nhập là không giới hạn" />
              </div>
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <div className="flex h-10 items-center rounded-lg border border-gray-200 bg-muted/40 px-2.5">
                  <StatusPill label={getPromotionStatusByDate(promotionForm.startDate, promotionForm.endDate)} />
                </div>
              </div>
              {promotionCustomColumns.map((column) => (
                <div key={column.id} className="space-y-2">
                  <Label>{column.label}</Label>
                  <Input value={promotionForm[column.id] ?? ""} onChange={(event) => setPromotionForm({ ...promotionForm, [column.id]: event.target.value })} placeholder={`Nhập ${column.label.toLowerCase()}`} />
                </div>
              ))}
              <div className="space-y-2 md:col-span-2">
                <Label>Điều kiện áp dụng</Label>
                <Textarea value={promotionForm.note} onChange={(event) => setPromotionForm({ ...promotionForm, note: event.target.value })} placeholder="Dịch vụ áp dụng, hạng khách hàng, giá trị đơn tối thiểu..." />
              </div>
          </div>
          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpenPromotionForm(false)}>
              Hủy
            </Button>
            <Button className="bg-slate-900 font-semibold text-white hover:bg-slate-800" onClick={savePromotion}>
              Lưu mã giảm giá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa mục này ({deleteTarget?.id})? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
              Hủy
            </Button>
            <Button className="bg-slate-900 font-semibold text-white hover:bg-slate-800" onClick={confirmDelete}>
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
