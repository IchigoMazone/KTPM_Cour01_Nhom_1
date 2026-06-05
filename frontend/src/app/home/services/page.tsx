"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import {
  CalendarClock,
  ChevronDown,
  CircleDollarSign,
  EyeOff,
  FileDown,
  Gift,
  Pencil,
  Plus,
  ReceiptText,
  Search,
  Settings,
  Tags,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TableCell } from "@/components/ui/table";
import { PageShell, ViewModeTabs } from "../_components/dashboard-primitives";
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

type ServiceStatus = "Đang hoạt động" | "Tạm ngừng";
type FinanceStatus = "Đã thu" | "Chờ thu" | "Đã chi" | "Quá hạn";
type FinanceType = "Doanh thu" | "Công nợ" | "Chi phí" | "Hoàn tiền";
type PromotionStatus = "Đang chạy" | "Sắp hết hạn" | "Tạm dừng";
type PromotionType = "Phần trăm" | "Số tiền" | "Combo" | "Loyalty";

type Service = {
  id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  turnaround: string;
  status: ServiceStatus;
  promotion: string;
  note: string;
};

type FinanceRecord = {
  id: string;
  date: string;
  type: FinanceType;
  customer: string;
  orderId: string;
  method: string;
  amount: number;
  status: FinanceStatus;
  owner: string;
  note: string;
};

type Promotion = {
  id: string;
  code: string;
  name: string;
  type: PromotionType;
  value: string;
  startDate: string;
  endDate: string;
  usage: string;
  status: PromotionStatus;
  note: string;
};

const serviceStatuses: Array<ServiceStatus | "Tất cả"> = ["Tất cả", "Đang hoạt động", "Tạm ngừng"];
const financeTypes: Array<FinanceType | "Tất cả"> = ["Tất cả", "Doanh thu", "Công nợ", "Chi phí", "Hoàn tiền"];
const promotionStatuses: Array<PromotionStatus | "Tất cả"> = ["Tất cả", "Đang chạy", "Sắp hết hạn", "Tạm dừng"];
const financeStatuses: FinanceStatus[] = ["Đã thu", "Chờ thu", "Đã chi", "Quá hạn"];

const seedServices: Service[] = [
  { id: "DV-101", name: "Giặt thường", category: "Giặt theo kg", unit: "kg", price: 15000, turnaround: "Trong ngày", status: "Đang hoạt động", promotion: "Không", note: "Áo quần hằng ngày" },
  { id: "DV-102", name: "Giặt sấy", category: "Giặt theo kg", unit: "kg", price: 25000, turnaround: "6 giờ", status: "Đang hoạt động", promotion: "COMBO-GIAT-SAY", note: "Tách đồ trắng theo yêu cầu" },
  { id: "DV-103", name: "Giặt khô vest", category: "Giặt theo món", unit: "món", price: 80000, turnaround: "24 giờ", status: "Đang hoạt động", promotion: "VIP5", note: "Vest, áo khoác, đồ công sở" },
  { id: "DV-104", name: "Chăn màn", category: "Đồ cồng kềnh", unit: "kg", price: 35000, turnaround: "24 giờ", status: "Đang hoạt động", promotion: "Không", note: "Chăn, ga, rèm cửa" },
  { id: "DV-105", name: "Vệ sinh rèm", category: "Tại nhà", unit: "bộ", price: 180000, turnaround: "48 giờ", status: "Đang hoạt động", promotion: "WELCOME10", note: "Có lịch khảo sát trước" },
  { id: "DV-106", name: "Giặt đồ da", category: "Cao cấp", unit: "món", price: 240000, turnaround: "72 giờ", status: "Tạm ngừng", promotion: "Không", note: "Cần xác nhận hóa chất" },
];

const seedFinanceRecords: FinanceRecord[] = [
  { id: "TC-2051", date: "2026-05-29", type: "Doanh thu", customer: "Nguyễn Thị Hương", orderId: "DH-1048", method: "MoMo", amount: 180000, status: "Đã thu", owner: "Chị Lan", note: "Thanh toán đủ" },
  { id: "TC-2050", date: "2026-05-29", type: "Công nợ", customer: "Trần Minh", orderId: "DH-1052", method: "Tiền mặt", amount: 240000, status: "Chờ thu", owner: "Anh Minh", note: "Thu khi giao hàng" },
  { id: "TC-2049", date: "2026-05-28", type: "Chi phí", customer: "Nhà cung cấp Hóa Việt", orderId: "-", method: "Chuyển khoản", amount: 3200000, status: "Đã chi", owner: "Quản lý", note: "Mua hóa chất tháng 5" },
  { id: "TC-2048", date: "2026-05-28", type: "Doanh thu", customer: "Công ty ABC", orderId: "DH-1057", method: "Chuyển khoản", amount: 2500000, status: "Đã thu", owner: "Thu ngân", note: "Xuất hóa đơn cuối tháng" },
  { id: "TC-2047", date: "2026-05-27", type: "Công nợ", customer: "Shop Linen", orderId: "DH-1061", method: "Chuyển khoản", amount: 1800000, status: "Quá hạn", owner: "Thu ngân", note: "Nhắc thanh toán lần 2" },
  { id: "TC-2046", date: "2026-05-26", type: "Hoàn tiền", customer: "Lê Mai", orderId: "DH-1062", method: "Tiền mặt", amount: 50000, status: "Đã chi", owner: "Chị Lan", note: "Hoàn tiền vì giao trễ" },
];

const seedPromotions: Promotion[] = [
  { id: "MG-301", code: "WELCOME10", name: "Khách mới", type: "Phần trăm", value: "10%", startDate: "2026-05-01", endDate: "2026-06-30", usage: "42/120 lượt", status: "Đang chạy", note: "Áp dụng đơn đầu tiên" },
  { id: "MG-302", code: "BIRTHDAY15", name: "Sinh nhật", type: "Phần trăm", value: "15%", startDate: "2026-01-01", endDate: "Không giới hạn", usage: "Tự động", status: "Đang chạy", note: "Tự cấp theo ngày sinh khách hàng" },
  { id: "MG-303", code: "COMBO-GIAT-SAY", name: "Combo giặt sấy", type: "Combo", value: "Giảm 25.000đ", startDate: "2026-05-15", endDate: "2026-06-15", usage: "68/80 lượt", status: "Sắp hết hạn", note: "Áp dụng dịch vụ giặt sấy từ 5kg" },
  { id: "MG-304", code: "VIP5", name: "Khách VIP", type: "Loyalty", value: "5%", startDate: "2026-04-01", endDate: "2026-12-31", usage: "Không giới hạn", status: "Đang chạy", note: "Chỉ áp dụng hạng Vàng trở lên" },
  { id: "MG-305", code: "RAINY20", name: "Ngày mưa", type: "Số tiền", value: "20.000đ", startDate: "2026-05-20", endDate: "2026-05-31", usage: "Đã khóa", status: "Tạm dừng", note: "Tạm dừng do vượt ngân sách" },
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
  { id: "startDate", label: "Bắt đầu", width: 104, visible: true },
  { id: "endDate", label: "Kết thúc", width: 112, visible: true },
  { id: "usage", label: "Sử dụng", width: 112, visible: true },
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

const emptyServiceForm = {
  name: "",
  category: "Giặt theo kg",
  unit: "kg",
  price: "0",
  turnaround: "",
  status: "Đang hoạt động" as ServiceStatus,
  promotion: "",
  note: "",
};

const emptyFinanceForm = {
  date: "",
  type: "Doanh thu" as FinanceType,
  customer: "",
  orderId: "",
  method: "Tiền mặt",
  amount: "0",
  status: "Đã thu" as FinanceStatus,
  owner: "",
  note: "",
};

const emptyPromotionForm = {
  code: "",
  name: "",
  type: "Phần trăm" as PromotionType,
  value: "",
  startDate: "",
  endDate: "",
  usage: "",
  status: "Đang chạy" as PromotionStatus,
  note: "",
};

const statusColor: Record<ServiceStatus | FinanceStatus | PromotionStatus, { text: string; bg: string }> = {
  "Đang hoạt động": { text: "#059669", bg: "rgba(5,150,105,0.09)" },
  "Tạm ngừng": { text: "#d97706", bg: "rgba(217,119,6,0.09)" },
  "Đã thu": { text: "#059669", bg: "rgba(5,150,105,0.09)" },
  "Chờ thu": { text: "#d97706", bg: "rgba(217,119,6,0.09)" },
  "Đã chi": { text: "#2563eb", bg: "rgba(37,99,235,0.09)" },
  "Quá hạn": { text: "#dc2626", bg: "rgba(220,38,38,0.09)" },
  "Đang chạy": { text: "#059669", bg: "rgba(5,150,105,0.09)" },
  "Sắp hết hạn": { text: "#d97706", bg: "rgba(217,119,6,0.09)" },
  "Tạm dừng": { text: "#64748b", bg: "rgba(100,116,139,0.1)" },
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
    setNewColumnName("");
    setOpenAddColumn(false);
  };

  const openCreateServiceForm = () => {
    setEditingServiceId(null);
    setServiceForm(emptyServiceForm);
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
      promotion: serviceForm.promotion || "Không",
      note: serviceForm.note,
    };

    if (editingServiceId) {
      setServices((prev) => prev.map((service) => service.id === editingServiceId ? { ...service, ...payload } : service));
    } else {
      setServices((prev) => [{ id: `DV-${Date.now().toString().slice(-3)}`, ...payload }, ...prev]);
    }

    setPage(1);
    setOpenServiceForm(false);
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
    if (column.id === "note") return <TableCell key={column.id} className="truncate text-slate-500" title={service.note}>{service.note}</TableCell>;
    if (column.id === "actions") {
      return (
        <TableCell key={column.id} className="px-4">
          <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50" onClick={() => openEditServiceForm(service)}>
            <Pencil className="size-3.5" />
            Sửa
          </button>
        </TableCell>
      );
    }
    return <TableCell key={column.id} className="text-slate-600">{String(service[column.id as keyof Service] ?? "")}</TableCell>;
  };

  const openCreateFinanceForm = () => {
    setEditingFinanceId(null);
    setFinanceForm({ ...emptyFinanceForm, date: new Date().toISOString().slice(0, 10) });
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
      owner: record.owner,
      note: record.note,
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
      owner: financeForm.owner || "Thu ngân",
      note: financeForm.note,
    };

    if (editingFinanceId) {
      setFinanceRecords((prev) => prev.map((record) => record.id === editingFinanceId ? { ...record, ...payload } : record));
    } else {
      setFinanceRecords((prev) => [{ id: `TC-${Date.now().toString().slice(-4)}`, ...payload }, ...prev]);
    }

    setPage(1);
    setOpenFinanceForm(false);
  };

  const openCreatePromotionForm = () => {
    setEditingPromotionId(null);
    setPromotionForm({ ...emptyPromotionForm, startDate: new Date().toISOString().slice(0, 10) });
    setOpenPromotionForm(true);
  };

  const openEditPromotionForm = (promotion: Promotion) => {
    setEditingPromotionId(promotion.id);
    setPromotionForm({
      code: promotion.code,
      name: promotion.name,
      type: promotion.type,
      value: promotion.value,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      usage: promotion.usage,
      status: promotion.status,
      note: promotion.note,
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
      startDate: promotionForm.startDate || new Date().toISOString().slice(0, 10),
      endDate: promotionForm.endDate || "Không giới hạn",
      usage: promotionForm.usage || "0 lượt",
      status: promotionForm.status,
      note: promotionForm.note,
    };

    if (editingPromotionId) {
      setPromotions((prev) => prev.map((promotion) => promotion.id === editingPromotionId ? { ...promotion, ...payload } : promotion));
    } else {
      setPromotions((prev) => [{ id: `MG-${Date.now().toString().slice(-3)}`, ...payload }, ...prev]);
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
    if (column.id === "status") return <TableCell key={column.id}><StatusPill label={record.status} /></TableCell>;
    if (column.id === "note") return <TableCell key={column.id} className="truncate text-slate-500" title={record.note}>{record.note}</TableCell>;
    if (column.id === "actions") {
      return (
        <TableCell key={column.id} className="px-4">
          <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50" onClick={() => openEditFinanceForm(record)}>
            <Pencil className="size-3.5" />
            Sửa
          </button>
        </TableCell>
      );
    }
    return <TableCell key={column.id} className="text-slate-600">{String(record[column.id as keyof FinanceRecord] ?? "")}</TableCell>;
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
    if (column.id === "status") return <TableCell key={column.id}><StatusPill label={promotion.status} /></TableCell>;
    if (column.id === "note") return <TableCell key={column.id} className="truncate text-slate-500" title={promotion.note}>{promotion.note}</TableCell>;
    if (column.id === "actions") {
      return (
        <TableCell key={column.id} className="px-4">
          <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50" onClick={() => openEditPromotionForm(promotion)}>
            <Pencil className="size-3.5" />
            Sửa
          </button>
        </TableCell>
      );
    }
    return <TableCell key={column.id} className="text-slate-600">{String(promotion[column.id as keyof Promotion] ?? "")}</TableCell>;
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
    return `${promotion.code} · ${promotion.value} · ${promotion.usage}`;
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
          <button
            type="button"
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-slate-50"
            onClick={() => {
              if (tab === "Dịch vụ") openEditServiceForm(row as Service);
              else if (tab === "Tài chính") openEditFinanceForm(row as FinanceRecord);
              else openEditPromotionForm(row as Promotion);
            }}
          >
            <Pencil className="size-3.5" />
            Sửa
          </button>
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

      {openServiceForm && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <Card className="max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-2xl border-0 bg-white shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 px-6 py-4">
              <CardTitle className="text-base font-semibold">{editingServiceId ? `Chỉnh sửa ${editingServiceId}` : "Thêm dịch vụ mới"}</CardTitle>
              <button type="button" className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" onClick={() => setOpenServiceForm(false)}>
                <X className="size-5" />
              </button>
            </CardHeader>
            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
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
                <Input value={serviceForm.unit} onChange={(event) => setServiceForm({ ...serviceForm, unit: event.target.value })} placeholder="kg / món / bộ" />
              </div>
              <div className="space-y-2">
                <Label>Đơn giá</Label>
                <Input type="number" value={serviceForm.price} onChange={(event) => setServiceForm({ ...serviceForm, price: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Thời gian xử lý</Label>
                <Input value={serviceForm.turnaround} onChange={(event) => setServiceForm({ ...serviceForm, turnaround: event.target.value })} placeholder="6 giờ / 24 giờ" />
              </div>
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <div className="flex h-10 items-center gap-2">
                  {(["Đang hoạt động", "Tạm ngừng"] as ServiceStatus[]).map((status) => (
                    <button key={status} type="button" onClick={() => setServiceForm({ ...serviceForm, status })} className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-medium ${serviceForm.status === status ? "bg-slate-900 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Mã ưu đãi áp dụng</Label>
                <Input value={serviceForm.promotion} onChange={(event) => setServiceForm({ ...serviceForm, promotion: event.target.value })} placeholder="WELCOME10, VIP5 hoặc Không" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Ghi chú vận hành</Label>
                <Textarea value={serviceForm.note} onChange={(event) => setServiceForm({ ...serviceForm, note: event.target.value })} placeholder="Điều kiện nhận đồ, hóa chất, phân loại..." />
              </div>
              <Button className="md:col-span-2 h-10 rounded-lg bg-slate-900 font-semibold text-white hover:bg-slate-800" onClick={saveService}>
                Lưu dịch vụ
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {openFinanceForm && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <Card className="max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-2xl border-0 bg-white shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 px-6 py-4">
              <CardTitle className="text-base font-semibold">{editingFinanceId ? `Chỉnh sửa ${editingFinanceId}` : "Thêm giao dịch tài chính"}</CardTitle>
              <button type="button" className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" onClick={() => setOpenFinanceForm(false)}>
                <X className="size-5" />
              </button>
            </CardHeader>
            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Ngày ghi nhận</Label>
                <Input type="date" value={financeForm.date} onChange={(event) => setFinanceForm({ ...financeForm, date: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Loại giao dịch</Label>
                <Input value={financeForm.type} onChange={(event) => setFinanceForm({ ...financeForm, type: event.target.value as FinanceType })} placeholder="Doanh thu / Công nợ / Chi phí / Hoàn tiền" />
              </div>
              <div className="space-y-2">
                <Label>Khách hàng / đối tác</Label>
                <Input value={financeForm.customer} onChange={(event) => setFinanceForm({ ...financeForm, customer: event.target.value })} placeholder="Tên khách hoặc nhà cung cấp" />
              </div>
              <div className="space-y-2">
                <Label>Mã đơn liên quan</Label>
                <Input value={financeForm.orderId} onChange={(event) => setFinanceForm({ ...financeForm, orderId: event.target.value })} placeholder="DH-1052 hoặc -" />
              </div>
              <div className="space-y-2">
                <Label>Phương thức</Label>
                <Input value={financeForm.method} onChange={(event) => setFinanceForm({ ...financeForm, method: event.target.value })} placeholder="Tiền mặt / MoMo / Chuyển khoản" />
              </div>
              <div className="space-y-2">
                <Label>Số tiền</Label>
                <Input type="number" value={financeForm.amount} onChange={(event) => setFinanceForm({ ...financeForm, amount: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Input value={financeForm.status} onChange={(event) => setFinanceForm({ ...financeForm, status: event.target.value as FinanceStatus })} placeholder="Đã thu / Chờ thu / Đã chi / Quá hạn" />
              </div>
              <div className="space-y-2">
                <Label>Phụ trách</Label>
                <Input value={financeForm.owner} onChange={(event) => setFinanceForm({ ...financeForm, owner: event.target.value })} placeholder="Thu ngân / Quản lý" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Ghi chú đối soát</Label>
                <Textarea value={financeForm.note} onChange={(event) => setFinanceForm({ ...financeForm, note: event.target.value })} placeholder="Nội dung thu chi, nhắc nợ, lý do hoàn tiền..." />
              </div>
              <Button className="md:col-span-2 h-10 rounded-lg bg-slate-900 font-semibold text-white hover:bg-slate-800" onClick={saveFinanceRecord}>
                Lưu giao dịch
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {openPromotionForm && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <Card className="max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-2xl border-0 bg-white shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 px-6 py-4">
              <CardTitle className="text-base font-semibold">{editingPromotionId ? `Chỉnh sửa ${editingPromotionId}` : "Thêm mã giảm giá"}</CardTitle>
              <button type="button" className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" onClick={() => setOpenPromotionForm(false)}>
                <X className="size-5" />
              </button>
            </CardHeader>
            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
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
                <Input value={promotionForm.type} onChange={(event) => setPromotionForm({ ...promotionForm, type: event.target.value as PromotionType })} placeholder="Phần trăm / Số tiền / Combo / Loyalty" />
              </div>
              <div className="space-y-2">
                <Label>Giá trị</Label>
                <Input value={promotionForm.value} onChange={(event) => setPromotionForm({ ...promotionForm, value: event.target.value })} placeholder="10% / 25.000đ" />
              </div>
              <div className="space-y-2">
                <Label>Ngày bắt đầu</Label>
                <Input type="date" value={promotionForm.startDate} onChange={(event) => setPromotionForm({ ...promotionForm, startDate: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Ngày kết thúc</Label>
                <Input value={promotionForm.endDate} onChange={(event) => setPromotionForm({ ...promotionForm, endDate: event.target.value })} placeholder="2026-06-30 hoặc Không giới hạn" />
              </div>
              <div className="space-y-2">
                <Label>Giới hạn sử dụng</Label>
                <Input value={promotionForm.usage} onChange={(event) => setPromotionForm({ ...promotionForm, usage: event.target.value })} placeholder="0/120 lượt" />
              </div>
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Input value={promotionForm.status} onChange={(event) => setPromotionForm({ ...promotionForm, status: event.target.value as PromotionStatus })} placeholder="Đang chạy / Sắp hết hạn / Tạm dừng" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Điều kiện áp dụng</Label>
                <Textarea value={promotionForm.note} onChange={(event) => setPromotionForm({ ...promotionForm, note: event.target.value })} placeholder="Dịch vụ áp dụng, hạng khách hàng, giá trị đơn tối thiểu..." />
              </div>
              <Button className="md:col-span-2 h-10 rounded-lg bg-slate-900 font-semibold text-white hover:bg-slate-800" onClick={savePromotion}>
                Lưu mã giảm giá
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </PageShell>
  );
}
