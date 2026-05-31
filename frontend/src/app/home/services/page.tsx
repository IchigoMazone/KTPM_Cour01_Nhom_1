"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  CircleDollarSign,
  EyeOff,
  FileDown,
  Gift,
  Kanban,
  List,
  Pencil,
  Plus,
  ReceiptText,
  Search,
  Settings,
  Table2,
  Tags,
  Wallet,
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

const pageSize = 10;

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
  const [query, setQuery] = useState("");
  const [selectedServiceStatus, setSelectedServiceStatus] = useState<ServiceStatus | "Tất cả">("Tất cả");
  const [selectedFinanceType, setSelectedFinanceType] = useState<FinanceType | "Tất cả">("Tất cả");
  const [selectedPromotionStatus, setSelectedPromotionStatus] = useState<PromotionStatus | "Tất cả">("Tất cả");
  const [page, setPage] = useState(1);
  const [openServiceForm, setOpenServiceForm] = useState(false);
  const [openFinanceForm, setOpenFinanceForm] = useState(false);
  const [openPromotionForm, setOpenPromotionForm] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingFinanceId, setEditingFinanceId] = useState<string | null>(null);
  const [editingPromotionId, setEditingPromotionId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [financeForm, setFinanceForm] = useState(emptyFinanceForm);
  const [promotionForm, setPromotionForm] = useState(emptyPromotionForm);
  const range = useDashboardTimeRangeStore((state) => state.range);
  const rangeLabel = formatRange(normalizeRange(range));

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
  const revenue = financeRecords.filter((item) => item.type === "Doanh thu" && item.status === "Đã thu").reduce((sum, item) => sum + item.amount, 0);
  const receivable = financeRecords.filter((item) => item.type === "Công nợ").reduce((sum, item) => sum + item.amount, 0);
  const expense = financeRecords.filter((item) => item.type === "Chi phí" || item.type === "Hoàn tiền").reduce((sum, item) => sum + item.amount, 0);

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

  return (
    <PageShell fullHeight>
      <div className="grid shrink-0 gap-3 md:grid-cols-4">
        <MetricCard title="Doanh thu đã thu" value={formatCurrency(revenue)} hint={`Theo ${rangeLabel}`} icon={Wallet} color="#059669" />
        <MetricCard title="Công nợ cần thu" value={formatCurrency(receivable)} hint="Theo dõi đơn chưa thanh toán" icon={ReceiptText} color="#d97706" />
        <MetricCard title="Chi phí ghi nhận" value={formatCurrency(expense)} hint="Hóa chất, hoàn tiền, vận hành" icon={CircleDollarSign} color="#2563eb" />
        <MetricCard title="Mã giảm giá" value={`${promotions.filter((item) => item.status === "Đang chạy").length}`} hint={`${services.filter((item) => item.status === "Đang hoạt động").length} dịch vụ đang bán`} icon={Gift} color="#7c3aed" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 pt-1 pb-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-1">
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
            <span className="mx-2 h-4 w-px bg-slate-200" />
            {(["Bảng", "Bảng kéo", "Danh sách"] as const).map((label) => {
              const Icon = label === "Bảng" ? Table2 : label === "Bảng kéo" ? Kanban : List;
              return (
                <button
                  key={label}
                  type="button"
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    label === "Bảng" ? "text-slate-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1 xl:w-64 xl:flex-none">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
              <Input
                className="h-8 rounded-md border-slate-200 bg-white pl-8 text-xs text-slate-700 shadow-none placeholder:text-slate-500 focus-visible:ring-slate-200"
                placeholder={tab === "Dịch vụ" ? "Tìm dịch vụ, nhóm, mã ưu đãi..." : tab === "Mã giảm giá" ? "Tìm mã, tên chương trình..." : "Tìm khách, mã đơn, phương thức..."}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs text-slate-700 transition-colors hover:bg-slate-50">
              <EyeOff className="size-3.5" />
              Ẩn cột
            </button>
            <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs text-slate-700 transition-colors hover:bg-slate-50">
              <Settings className="size-3.5" />
              Tùy chỉnh
            </button>
            <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-slate-50">
              <FileDown className="size-3.5" />
              Xuất file
            </button>
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
              onClick={tab === "Dịch vụ" ? openCreateServiceForm : tab === "Mã giảm giá" ? openCreatePromotionForm : openCreateFinanceForm}
            >
              {tab === "Dịch vụ" ? "Thêm dịch vụ" : tab === "Mã giảm giá" ? "Thêm mã giảm giá" : "Thêm giao dịch"}
              <ChevronDown className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-5 py-3">
          <button type="button" className="inline-flex h-7 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 text-xs text-slate-700 transition-colors hover:bg-slate-50">
            <CalendarClock className="size-3.5" />
            {rangeLabel}
            <ChevronDown className="size-3.5" />
          </button>
          {(tab === "Dịch vụ" ? serviceStatuses : tab === "Mã giảm giá" ? promotionStatuses : financeTypes).map((item) => {
            const active = tab === "Dịch vụ" ? selectedServiceStatus === item : tab === "Mã giảm giá" ? selectedPromotionStatus === item : selectedFinanceType === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => {
                  if (tab === "Dịch vụ") setSelectedServiceStatus(item as ServiceStatus | "Tất cả");
                  else if (tab === "Mã giảm giá") setSelectedPromotionStatus(item as PromotionStatus | "Tất cả");
                  else setSelectedFinanceType(item as FinanceType | "Tất cả");
                  setPage(1);
                }}
                className={`inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium transition-colors ${
                  active ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {item}
              </button>
            );
          })}
          <button type="button" className="inline-flex h-7 items-center gap-1.5 px-2 text-xs text-slate-500 transition-colors hover:text-slate-700">
            <Plus className="size-3.5" />
            Thêm bộ lọc
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {tab === "Dịch vụ" ? (
            <Table className="w-full table-fixed text-xs [&_td:not(:first-child)]:border-l [&_td:not(:first-child)]:border-slate-100">
              <TableHeader>
                <TableRow className="h-9 border-b border-slate-100 bg-slate-50 hover:bg-slate-50">
                  <TableHead className="w-[132px] pl-4 text-xs font-medium text-slate-600">Mã dịch vụ</TableHead>
                  <TableHead className="w-[184px] border-l border-slate-100 text-xs font-medium text-slate-600">Tên dịch vụ</TableHead>
                  <TableHead className="w-[140px] border-l border-slate-100 text-xs font-medium text-slate-600">Nhóm</TableHead>
                  <TableHead className="w-[76px] border-l border-slate-100 text-xs font-medium text-slate-600">Đơn vị</TableHead>
                  <TableHead className="w-[112px] border-l border-slate-100 text-xs font-medium text-slate-600">Đơn giá</TableHead>
                  <TableHead className="w-[112px] border-l border-slate-100 text-xs font-medium text-slate-600">Thời gian</TableHead>
                  <TableHead className="w-[126px] border-l border-slate-100 text-xs font-medium text-slate-600">Trạng thái</TableHead>
                  <TableHead className="w-[120px] border-l border-slate-100 text-xs font-medium text-slate-600">Ưu đãi</TableHead>
                  <TableHead className="w-[190px] border-l border-slate-100 text-xs font-medium text-slate-600">Ghi chú</TableHead>
                  <TableHead className="w-[108px] border-l border-slate-100 px-4 text-xs font-medium text-slate-600">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedServices.map((service) => (
                  <TableRow key={service.id} className="h-9 border-b border-slate-100 text-slate-700 transition-colors hover:bg-slate-50/60">
                    <TableCell className="pl-4 font-medium text-slate-900">{service.id}</TableCell>
                    <TableCell className="font-medium text-slate-900">{service.name}</TableCell>
                    <TableCell className="text-slate-600">{service.category}</TableCell>
                    <TableCell className="text-slate-500">{service.unit}</TableCell>
                    <TableCell className="font-medium text-slate-900">{formatCurrency(service.price)}</TableCell>
                    <TableCell className="text-slate-600">{service.turnaround}</TableCell>
                    <TableCell><StatusPill label={service.status} /></TableCell>
                    <TableCell className="text-slate-500">{service.promotion}</TableCell>
                    <TableCell className="truncate text-slate-500">{service.note}</TableCell>
                    <TableCell className="px-4">
                      <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50" onClick={() => openEditServiceForm(service)}>
                        <Pencil className="size-3.5" />
                        Sửa
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedServices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10}>
                      <div className="grid min-h-[320px] place-items-center text-sm text-slate-400">Không tìm thấy dịch vụ phù hợp.</div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          ) : tab === "Mã giảm giá" ? (
            <Table className="w-full table-fixed text-xs [&_td:not(:first-child)]:border-l [&_td:not(:first-child)]:border-slate-100">
              <TableHeader>
                <TableRow className="h-9 border-b border-slate-100 bg-slate-50 hover:bg-slate-50">
                  <TableHead className="w-[112px] pl-4 text-xs font-medium text-slate-600">Mã ID</TableHead>
                  <TableHead className="w-[138px] border-l border-slate-100 text-xs font-medium text-slate-600">Code</TableHead>
                  <TableHead className="w-[170px] border-l border-slate-100 text-xs font-medium text-slate-600">Chương trình</TableHead>
                  <TableHead className="w-[96px] border-l border-slate-100 text-xs font-medium text-slate-600">Loại</TableHead>
                  <TableHead className="w-[112px] border-l border-slate-100 text-xs font-medium text-slate-600">Giá trị</TableHead>
                  <TableHead className="w-[104px] border-l border-slate-100 text-xs font-medium text-slate-600">Bắt đầu</TableHead>
                  <TableHead className="w-[112px] border-l border-slate-100 text-xs font-medium text-slate-600">Kết thúc</TableHead>
                  <TableHead className="w-[112px] border-l border-slate-100 text-xs font-medium text-slate-600">Sử dụng</TableHead>
                  <TableHead className="w-[116px] border-l border-slate-100 text-xs font-medium text-slate-600">Trạng thái</TableHead>
                  <TableHead className="w-[190px] border-l border-slate-100 text-xs font-medium text-slate-600">Ghi chú</TableHead>
                  <TableHead className="w-[108px] border-l border-slate-100 px-4 text-xs font-medium text-slate-600">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPromotions.map((promotion) => (
                  <TableRow key={promotion.id} className="h-9 border-b border-slate-100 text-slate-700 transition-colors hover:bg-slate-50/60">
                    <TableCell className="pl-4 font-medium text-slate-900">{promotion.id}</TableCell>
                    <TableCell className="font-semibold text-slate-900">{promotion.code}</TableCell>
                    <TableCell className="font-medium text-slate-900">{promotion.name}</TableCell>
                    <TableCell className="text-slate-600">{promotion.type}</TableCell>
                    <TableCell className="font-medium text-slate-900">{promotion.value}</TableCell>
                    <TableCell className="text-slate-500">{promotion.startDate}</TableCell>
                    <TableCell className="text-slate-500">{promotion.endDate}</TableCell>
                    <TableCell className="text-slate-600">{promotion.usage}</TableCell>
                    <TableCell><StatusPill label={promotion.status} /></TableCell>
                    <TableCell className="truncate text-slate-500">{promotion.note}</TableCell>
                    <TableCell className="px-4">
                      <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50" onClick={() => openEditPromotionForm(promotion)}>
                        <Pencil className="size-3.5" />
                        Sửa
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedPromotions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11}>
                      <div className="grid min-h-[320px] place-items-center text-sm text-slate-400">Không tìm thấy mã giảm giá phù hợp.</div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          ) : (
            <Table className="w-full table-fixed text-xs [&_td:not(:first-child)]:border-l [&_td:not(:first-child)]:border-slate-100">
              <TableHeader>
                <TableRow className="h-9 border-b border-slate-100 bg-slate-50 hover:bg-slate-50">
                  <TableHead className="w-[116px] pl-4 text-xs font-medium text-slate-600">Mã giao dịch</TableHead>
                  <TableHead className="w-[104px] border-l border-slate-100 text-xs font-medium text-slate-600">Ngày</TableHead>
                  <TableHead className="w-[106px] border-l border-slate-100 text-xs font-medium text-slate-600">Loại</TableHead>
                  <TableHead className="w-[168px] border-l border-slate-100 text-xs font-medium text-slate-600">Khách / đối tác</TableHead>
                  <TableHead className="w-[92px] border-l border-slate-100 text-xs font-medium text-slate-600">Đơn</TableHead>
                  <TableHead className="w-[116px] border-l border-slate-100 text-xs font-medium text-slate-600">Phương thức</TableHead>
                  <TableHead className="w-[120px] border-l border-slate-100 text-xs font-medium text-slate-600">Số tiền</TableHead>
                  <TableHead className="w-[104px] border-l border-slate-100 text-xs font-medium text-slate-600">Trạng thái</TableHead>
                  <TableHead className="w-[104px] border-l border-slate-100 text-xs font-medium text-slate-600">Phụ trách</TableHead>
                  <TableHead className="w-[164px] border-l border-slate-100 text-xs font-medium text-slate-600">Ghi chú</TableHead>
                  <TableHead className="w-[108px] border-l border-slate-100 px-4 text-xs font-medium text-slate-600">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedFinance.map((record) => (
                  <TableRow key={record.id} className="h-9 border-b border-slate-100 text-slate-700 transition-colors hover:bg-slate-50/60">
                    <TableCell className="pl-4 font-medium text-slate-900">{record.id}</TableCell>
                    <TableCell className="text-slate-500">{record.date}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs font-medium" style={{ color: typeColor[record.type], backgroundColor: `${typeColor[record.type]}14` }}>
                        <span className="size-1.5 rounded-full" style={{ backgroundColor: typeColor[record.type] }} />
                        {record.type}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">{record.customer}</TableCell>
                    <TableCell className="text-slate-500">{record.orderId}</TableCell>
                    <TableCell className="text-slate-600">{record.method}</TableCell>
                    <TableCell className="font-medium text-slate-900">{formatCurrency(record.amount)}</TableCell>
                    <TableCell><StatusPill label={record.status} /></TableCell>
                    <TableCell className="text-slate-600">{record.owner}</TableCell>
                    <TableCell className="truncate text-slate-500">{record.note}</TableCell>
                    <TableCell className="px-4">
                      <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50" onClick={() => openEditFinanceForm(record)}>
                        <Pencil className="size-3.5" />
                        Sửa
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedFinance.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11}>
                      <div className="grid min-h-[320px] place-items-center text-sm text-slate-400">Không tìm thấy giao dịch phù hợp.</div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="border-t border-slate-200 px-5 pt-3 pb-1">
          <div className="flex flex-col gap-3 text-xs text-slate-700 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span>Số dòng mỗi trang</span>
              <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 px-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50">
                {pageSize}
                <ChevronDown className="size-3.5" />
              </button>
              <span className="text-slate-400">
                {activeRows.length === 0 ? 0 : (page - 1) * pageSize + 1}-
                {Math.min(page * pageSize, activeRows.length)} trong {activeRows.length} dòng
              </span>
            </div>

            <div className="flex items-center justify-end gap-1">
              <button type="button" className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 disabled:opacity-40" disabled={page <= 1} onClick={() => setPage(1)}>
                <ChevronsLeft className="size-4" />
              </button>
              <button type="button" className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 disabled:opacity-40" disabled={page <= 1} onClick={() => setPage((current) => Math.max(current - 1, 1))}>
                <ChevronDown className="size-4 rotate-90" />
              </button>
              <span className="px-3 text-sm font-medium text-slate-700">{page} / {pageCount || 1}</span>
              <button type="button" className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 disabled:opacity-40" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(current + 1, pageCount))}>
                <ChevronDown className="size-4 -rotate-90" />
              </button>
              <button type="button" className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 disabled:opacity-40" disabled={page >= pageCount} onClick={() => setPage(pageCount || 1)}>
                <ChevronsRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

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
