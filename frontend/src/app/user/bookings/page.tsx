"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  Trash2,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { PageShell } from "@/src/app/home/_components/dashboard-primitives";
import { FilterBar, type FilterOption } from "@/src/app/home/_components/filter-bar";
import { TableView } from "@/src/app/home/_components/table-view";
import { Toolbar } from "@/src/app/home/_components/toolbar";
import { HistoryModal } from "@/src/app/home/_components/history-modal";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import type { DashboardTableColumn } from "@/src/components/common/dashboard-data-table";
import { formatRange, normalizeRange } from "@/src/utils/dashboard-time";

type BookingStatus = "pending" | "confirmed" | "cancelled";

type Service = {
  id: string;
  name: string;
  description: string;
  unit: "kg" | "món";
  price: number;
  turnaround: string;
  color: string;
};

type Booking = {
  id: string;
  customer: string;
  service: string;
  quantity: string;
  date: string;
  timeSlot: string;
  staff: string;
  status: BookingStatus;
  estimate: number;
  note: string;
  phone: string;
};

const checkboxClass =
  "relative size-4 appearance-none rounded-[5px] border border-slate-300 bg-white transition-all checked:border-emerald-300 checked:bg-emerald-300 after:absolute after:left-1/2 after:top-1/2 after:hidden after:h-[9px] after:w-[5px] after:-translate-x-1/2 after:-translate-y-[58%] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:content-[''] checked:after:block";

const defaultAvatarUrl = "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif";
const fallbackCustomerName = "Nguyễn Thị Hương";

function getCurrentCustomerName() {
  if (typeof window === "undefined") return fallbackCustomerName;
  return localStorage.getItem("accountName") || localStorage.getItem("username") || fallbackCustomerName;
}

const statusLabels: Record<BookingStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  cancelled: "Đã hủy",
};

const statusStyle: Record<BookingStatus, { color: string; bg: string }> = {
  pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  confirmed: { color: "#10b981", bg: "rgba(16,185,129,0.08)" },
  cancelled: { color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
};

const statusOptions: FilterOption[] = [
  { id: "Tất cả", label: "Tất cả", color: "#64748b", bgColor: "rgba(100,116,139,0.09)" },
  ...Object.entries(statusStyle).map(([status, style]) => ({
    id: status,
    label: statusLabels[status as BookingStatus],
    color: style.color,
    bgColor: style.bg,
  })),
];

const services: Service[] = [
  { id: "wash", name: "Giặt sấy theo kg", description: "Áo quần hằng ngày", unit: "kg", price: 18000, turnaround: "24h", color: "#3b82f6" },
  { id: "dryclean", name: "Giặt hấp cao cấp", description: "Vest, áo khoác, đồ giữ form", unit: "món", price: 80000, turnaround: "36h", color: "#8b5cf6" },
  { id: "bedding", name: "Chăn màn", description: "Chăn, ga, rèm cửa", unit: "kg", price: 35000, turnaround: "30h", color: "#10b981" },
  { id: "express", name: "Giao nhanh", description: "Ưu tiên xử lý trong ngày", unit: "món", price: 45000, turnaround: "12h", color: "#f59e0b" },
];

const bookingColumns: DashboardTableColumn[] = [
  { id: "id", label: "Mã lịch", width: 120, visible: true },
  { id: "customer", label: "Khách hàng", width: 170, visible: true },
  { id: "phone", label: "Số điện thoại", width: 120, visible: true },
  { id: "service", label: "Dịch vụ", width: 140, visible: true },
  { id: "quantity", label: "Số lượng", width: 120, visible: true },
  { id: "timeSlot", label: "Giờ giao", width: 100, visible: true },
  { id: "date", label: "Thời gian", width: 120, visible: true },
  { id: "staff", label: "Nhân viên", width: 160, visible: true },
  { id: "estimate", label: "Tạm tính", width: 110, visible: true },
  { id: "status", label: "Trạng thái", width: 140, visible: true },
  { id: "actions", label: "Thao tác", width: 150, visible: true },
];

const pickupHours = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, "0"));
const pickupMinutes = Array.from({ length: 60 }, (_, minute) => String(minute).padStart(2, "0"));

function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
}

function toDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateValue(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function getDeliveryTimeParts(value: string) {
  if (!/^\d{2}:\d{2}$/.test(value)) {
    return { hour: "", minute: "" };
  }
  const [hour, minute] = value.split(":");
  return { hour, minute };
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function KpiCard({
  title,
  value,
  hint,
  change,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  hint: string;
  change: string;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
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
        <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium" style={{ color, backgroundColor: `${color}12` }}>
          {change}
        </span>
      </div>
    </div>
  );
}

const initialBookings: Booking[] = [
  {
    id: "LH-208",
    customer: "Nguyễn Thị Hương",
    service: "Giặt sấy theo kg",
    quantity: "5 kg",
    date: getTomorrowDate(),
    timeSlot: "16:00",
    staff: "Nguyễn Diệu Lynh",
    status: "confirmed",
    estimate: 90000,
    note: "Tách riêng áo trắng",
    phone: "0901 234 567",
  },
  {
    id: "LH-204",
    customer: "Nguyễn Thị Hương",
    service: "Giặt hấp cao cấp",
    quantity: "3 món",
    date: "2026-06-10",
    timeSlot: "09:00",
    staff: "Chưa gán",
    status: "pending",
    estimate: 80000,
    note: "Ủi phẳng và móc treo",
    phone: "0901 234 567",
  },
  {
    id: "LH-199",
    customer: "Nguyễn Thị Hương",
    service: "Chăn màn",
    quantity: "5 kg",
    date: "2026-06-05",
    timeSlot: "19:00",
    staff: "Phạm Quốc Huy",
    status: "cancelled",
    estimate: 175000,
    note: "Giao lại sau 19h",
    phone: "0901 234 567",
  },
];

const bookingStatuses: BookingStatus[] = ["pending", "confirmed", "cancelled"];

const bookingStatusLabels: Record<BookingStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  cancelled: "Đã hủy",
};

const bookingStatusDotColor: Record<BookingStatus, string> = {
  pending: "#f59e0b",
  confirmed: "#10b981",
  cancelled: "#ef4444",
};

const bookingStatusBgColor: Record<BookingStatus, string> = {
  pending: "rgba(245,158,11,0.08)",
  confirmed: "rgba(16,185,129,0.08)",
  cancelled: "rgba(239,68,68,0.08)",
};

const getBookingStatusTime = (
  booking: Booking,
  statusIndex: number,
  isCurrentStatus: boolean,
) => {
  if (statusIndex === 0)
    return `${formatDate(booking.date)} · Yêu cầu lấy đồ`;

  const baseDate = new Date(`${booking.date}T08:00:00`);
  if (Number.isNaN(baseDate.getTime()))
    return `${booking.date} · Chưa ghi giờ`;

  baseDate.setHours(baseDate.getHours() + statusIndex * 2);
  return baseDate.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function UserBookingsPage() {
  const range = useDashboardTimeRangeStore((state) => state.range);
  const rangeLabel = formatRange(normalizeRange(range));
  const [formOpen, setFormOpen] = useState(false);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [cancelBookingTarget, setCancelBookingTarget] = useState<Booking | null>(null);
  const [serviceId, setServiceId] = useState(services[0].id);
  const [customer] = useState(getCurrentCustomerName);
  const [bookings, setBookings] = useState<Booking[]>(() =>
    initialBookings.map((booking) => ({ ...booking, customer })),
  );
  const [pickupDate, setPickupDate] = useState(getTomorrowDate());
  const [timeSlot, setTimeSlot] = useState("Chưa hẹn");
  const [phone, setPhone] = useState("0901 234 567");
  const [weight, setWeight] = useState("5");
  const [amount, setAmount] = useState("90000");
  const [notes, setNotes] = useState("");
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | "Tất cả">("Tất cả");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [columns, setColumns] = useState<DashboardTableColumn[]>(bookingColumns);
  const [tableResizeMode, setTableResizeMode] = useState<"fit" | "custom">("fit");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [customPageSize, setCustomPageSize] = useState("");
  const [openPageSizeMenu, setOpenPageSizeMenu] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [activeHistoryBookingId, setActiveHistoryBookingId] = useState<string | null>(null);

  const selectedService = services.find((service) => service.id === serviceId) || services[0];
  const parsedWeight = Math.max(1, Number.parseFloat(weight) || 1);
  const subtotal = selectedService.unit === "kg" ? selectedService.price * parsedWeight : selectedService.price;
  const deliveryFee = subtotal >= 120000 ? 0 : 15000;
  const autoEstimate = subtotal + deliveryFee;
  const finalEstimate = Math.max(0, Number(amount) || autoEstimate);
  const deliveryTimeParts = getDeliveryTimeParts(timeSlot);

  const customerBookings = useMemo(
    () => bookings.filter((booking) => booking.customer === customer),
    [bookings, customer],
  );

  const filteredBookings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return customerBookings.filter((booking) => {
      const matchesStatus = selectedStatus === "Tất cả" || booking.status === selectedStatus;
      const matchesQuery =
        !normalizedQuery ||
        [booking.id, booking.customer, booking.service, booking.quantity, booking.date, booking.timeSlot, booking.staff, booking.note, booking.phone, statusLabels[booking.status]]
          .some((value) => String(value).toLowerCase().includes(normalizedQuery));

      return matchesStatus && matchesQuery;
    });
  }, [customerBookings, query, selectedStatus]);

  const selectedBookings = useMemo(() => {
    const selected = filteredBookings.filter((booking) => selectedIds.has(booking.id));
    return selected.length > 0 ? selected : filteredBookings;
  }, [filteredBookings, selectedIds]);

  const pageCount = Math.max(1, Math.ceil(filteredBookings.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const paginatedBookings = filteredBookings.slice((safePage - 1) * pageSize, safePage * pageSize);
  const visibleIds = filteredBookings.map((booking) => booking.id);
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.has(id)).length;
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const totalVisibleWidth = columns.filter((column) => column.visible !== false).reduce((sum, column) => sum + (column.width || 150), 0);
  const pendingCount = customerBookings.filter((booking) => booking.status === "pending").length;
  const confirmedCount = customerBookings.filter((booking) => booking.status === "confirmed").length;
  const nextBooking = customerBookings.find((booking) => booking.status === "confirmed" || booking.status === "pending");
  const detailService = detailBooking
    ? services.find((service) => service.name === detailBooking.service)
    : undefined;

  const toggleBooking = (id: string) => {
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

  const applyCustomPageSize = () => {
    const parsed = Number(customPageSize);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    setPageSize(Math.floor(parsed));
    setPage(1);
    setOpenPageSizeMenu(false);
  };

  const createBooking = () => {
    if (!customer.trim() || !phone.trim()) {
      toast.error("Vui lòng nhập khách hàng và số điện thoại.");
      return;
    }

    setBookings((prev) => [
      {
        id: `LH-${Math.floor(Math.random() * 900) + 100}`,
        customer: customer.trim(),
        service: selectedService.name,
        quantity: weight.trim() || `${parsedWeight} ${selectedService.unit}`,
        date: pickupDate,
        timeSlot,
        staff: "Chưa gán",
        status: "pending",
        estimate: finalEstimate,
        note: notes.trim() || "Không có ghi chú",
        phone: phone.trim(),
      },
      ...prev,
    ]);
    setNotes("");
    setFormOpen(false);
    toast.success("Đã tạo lịch hẹn demo.");
  };

  const cancelBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id ? { ...booking, status: "cancelled" } : booking,
      ),
    );
    setCancelBookingTarget(null);
    toast.success(`Đã hủy lịch ${id} trong dữ liệu demo.`);
  };

  const exportBookings = (format: "pdf" | "excel" | "csv", fileName: string) => {
    const exportColumns = columns.filter((column) => column.visible !== false && column.id !== "actions");
    const rows = filteredBookings.filter((booking) => selectedIds.size === 0 || selectedIds.has(booking.id));
    const headers = exportColumns.map((column) => column.label);
    const values = rows.map((row) =>
      exportColumns.map((column) => {
        const value = row[column.id as keyof Booking];
        if (column.id === "status") return statusLabels[row.status];
        if (column.id === "date") return formatDate(row.date);
        if (column.id === "estimate") return `${row.estimate.toLocaleString("vi-VN")}đ`;
        return String(value ?? "");
      }),
    );

    if (format === "csv") {
      const csv = "\uFEFF" + [headers, ...values].map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }

    toast.success(format === "excel" ? "Đã chuẩn bị Excel demo." : "Đã chuẩn bị bản in PDF demo.");
  };

  const renderCell = (booking: Booking, column: DashboardTableColumn) => {
    if (column.id === "id") {
      return (
        <TableCell key={column.id} className="pl-4 font-semibold text-slate-900">
          <div className="flex items-center gap-2">
            <input checked={selectedIds.has(booking.id)} onChange={() => toggleBooking(booking.id)} type="checkbox" className={checkboxClass} aria-label={`Chọn ${booking.id}`} />
            {booking.id}
          </div>
        </TableCell>
      );
    }

    if (column.id === "customer") {
      return (
        <TableCell key={column.id}>
          <div className="flex min-w-0 items-center gap-2">
            <Image src={defaultAvatarUrl} alt={booking.customer} width={24} height={24} className="size-6 shrink-0 rounded-full object-cover" />
            <span className="truncate font-semibold text-slate-800">{booking.customer}</span>
          </div>
        </TableCell>
      );
    }

    if (column.id === "staff") {
      return (
        <TableCell key={column.id}>
          <div className="flex min-w-0 items-center gap-2">
            <Image src={defaultAvatarUrl} alt={booking.staff} width={24} height={24} className="size-6 shrink-0 rounded-full object-cover" />
            <span className="truncate font-medium text-slate-700">{booking.staff}</span>
          </div>
        </TableCell>
      );
    }

    if (column.id === "service") {
      return (
        <TableCell key={column.id}>
          <span className="truncate font-semibold text-slate-800">{booking.service}</span>
        </TableCell>
      );
    }

    if (column.id === "date") return <TableCell key={column.id} className="font-medium text-slate-700">{formatDate(booking.date)}</TableCell>;
    if (column.id === "estimate") return <TableCell key={column.id} className="font-semibold text-slate-900">{booking.estimate.toLocaleString("vi-VN")}đ</TableCell>;
    if (column.id === "status") {
      const style = statusStyle[booking.status as BookingStatus] ?? { color: "#64748b", bg: "rgba(100,116,139,0.08)" };
      const label = statusLabels[booking.status as BookingStatus] ?? booking.status;
      return (
        <TableCell key={column.id}>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2 py-0.5 font-medium" style={{ color: style.color, backgroundColor: style.bg }}>
            <span className="size-1.5 rounded-full" style={{ backgroundColor: style.color }} />
            {label}
          </span>
        </TableCell>
      );
    }

    if (column.id === "actions") {
      return (
        <TableCell key={column.id} className="px-4">
          <div className="flex items-center gap-1.5">
            <button type="button" className="inline-flex h-7 items-center rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50" onClick={() => setDetailBooking(booking)}>
              Chi tiết
            </button>
            <button type="button" className="inline-flex h-7 items-center rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600" onClick={() => setCancelBookingTarget(booking)}>
              Hủy
            </button>
          </div>
        </TableCell>
      );
    }

    return <TableCell key={column.id} className="font-medium text-slate-700">{String(booking[column.id as keyof Booking] ?? "")}</TableCell>;
  };

  return (
    <PageShell fullHeight>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <div className="flex min-h-0 flex-1 flex-col gap-4 px-5 pt-5 pb-0">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Lịch sắp tới"
              value={nextBooking ? nextBooking.timeSlot : "--"}
              hint={nextBooking ? formatDate(nextBooking.date) : "Chưa có lịch"}
              change={nextBooking ? statusLabels[nextBooking.status] : "Trống"}
              icon={CalendarCheck}
              color="#06b6d4"
            />
            <KpiCard
              title="Chờ xác nhận"
              value={String(pendingCount)}
              hint="Lịch đang chờ tiệm duyệt"
              change="+ demo"
              icon={Clock}
              color="#f59e0b"
            />
            <KpiCard
              title="Đã xác nhận"
              value={String(confirmedCount)}
              hint="Sẵn sàng điều phối lấy đồ"
              change="Ổn định"
              icon={CheckCircle2}
              color="#10b981"
            />
            <KpiCard
              title="Ước tính hiện tại"
              value={`${finalEstimate.toLocaleString("vi-VN")}đ`}
              hint={selectedService.name}
              change={selectedService.turnaround}
              icon={Wallet}
              color="#3b82f6"
            />
          </div>

          <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-white">
            <Toolbar
              leftContent={<div className="flex items-center gap-2"><h2 className="text-sm font-semibold text-slate-900">Bảng lịch hẹn</h2><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">{filteredBookings.length}</span></div>}
              query={query}
              onQueryChange={(value) => { setQuery(value); setPage(1); }}
              columns={columns}
              onColumnsChange={setColumns}
              tableResizeMode={tableResizeMode}
              onTableResizeModeChange={setTableResizeMode}
              selectedCount={selectedIds.size}
              onOpenAddColumn={() => toast.info("Bảng lịch hẹn dùng bộ cột cố định.")}
              onOpenHistory={() => setOpenHistory(true)}
              onExport={exportBookings}
              defaultExportFileName={`lich-hen-${new Date().toISOString().slice(0, 10)}`}
              onCreateClick={() => setFormOpen(true)}
              createLabel="Tạo lịch"
              defaultColumnIds={bookingColumns.map((column) => column.id)}
              searchPlaceholder="Tìm mã lịch, khách, SĐT, dịch vụ..."
              showHistoryButton={true}
              showAddColumnButton={false}
            />
            <FilterBar
              rangeLabel={rangeLabel}
              selectedValue={selectedStatus}
              onValueChange={(value) => { setSelectedStatus(value as BookingStatus | "Tất cả"); setPage(1); }}
              filterOptions={statusOptions}
              filterLabel="Trạng thái lịch"
              allSelected={allVisibleSelected}
              disabled={visibleIds.length === 0}
              selectedCount={selectedVisibleCount}
              totalCount={visibleIds.length}
              itemLabel="lịch"
              checkboxClass={checkboxClass}
              onToggleAll={toggleAll}
            />
            <TableView
              columns={columns}
              rows={paginatedBookings}
              pageSize={pageSize}
              emptyMessage="Bạn chưa có lịch hẹn đặt lấy đồ nào."
              tableResizeMode={tableResizeMode}
              totalVisibleWidth={totalVisibleWidth}
              renderCell={renderCell}
              page={safePage}
              pageCount={pageCount}
              totalRows={filteredBookings.length}
              customPageSize={customPageSize}
              openPageSizeMenu={openPageSizeMenu}
              onOpenPageSizeMenuChange={setOpenPageSizeMenu}
              onCustomPageSizeChange={setCustomPageSize}
              onApplyCustomPageSize={applyCustomPageSize}
              onUpdatePageSize={(size) => { setPageSize(size); setPage(1); }}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-0 shadow-lg sm:w-[1000px] sm:max-w-[1000px]" showCloseButton={false}>
          <DialogHeader className="border-b border-slate-100 px-5 pb-3 pt-4">
            <DialogTitle className="text-base font-semibold text-slate-900">Tạo lịch lấy đồ</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">Nhập thông tin đặt lịch. Lịch sẽ được thêm vào bảng demo với trạng thái chờ xác nhận.</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/40 p-5">
            <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <h3 className="mb-3 text-sm font-semibold text-slate-900">Thông tin lấy đồ</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Khách hàng</Label>
                    <Input value={customer} readOnly className="h-9 border-slate-200 bg-slate-50 text-xs font-medium text-slate-700" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Số điện thoại</Label>
                    <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="090..." className="h-9 border-slate-200 bg-white text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Dịch vụ</Label>
                    <Select value={serviceId} onValueChange={setServiceId}>
                      <SelectTrigger className="h-9 border-slate-200 bg-white text-xs">
                        <SelectValue placeholder="Chọn dịch vụ" />
                      </SelectTrigger>
                      <SelectContent className="z-[2200]" position="popper">
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Số lượng</Label>
                    <Input value={weight} onChange={(event) => setWeight(event.target.value)} placeholder="5 kg / 3 món" className="h-9 border-slate-200 bg-white text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Giờ giao</Label>
                    <div className="grid grid-cols-[76px_76px_auto] items-center gap-2">
                      <Select value={deliveryTimeParts.hour} onValueChange={(value) => setTimeSlot(`${value}:${deliveryTimeParts.minute || "00"}`)}>
                        <SelectTrigger className="h-9 w-[76px] border-slate-200 bg-white text-xs">
                          <SelectValue placeholder="Giờ" />
                        </SelectTrigger>
                        <SelectContent className="z-[2200]" position="popper">
                          {pickupHours.map((hour) => (
                            <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={deliveryTimeParts.minute} onValueChange={(value) => setTimeSlot(`${deliveryTimeParts.hour || "00"}:${value}`)}>
                        <SelectTrigger className="h-9 w-[76px] border-slate-200 bg-white text-xs">
                          <SelectValue placeholder="Phút" />
                        </SelectTrigger>
                        <SelectContent className="z-[2200]" position="popper">
                          {pickupMinutes.map((minute) => (
                            <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant={/^\d{2}:\d{2}$/.test(timeSlot) ? "outline" : "default"}
                        onClick={() => setTimeSlot("Chưa hẹn")}
                        className="h-9 justify-center px-3 text-xs"
                      >
                        Chưa hẹn
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Thời gian</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 w-full justify-start border-slate-200 bg-white px-3 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <CalendarDays className="mr-2 size-3.5 text-slate-400" />
                          {formatDate(pickupDate)}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="z-[2200] w-auto p-0" sideOffset={6}>
                        <Calendar
                          mode="single"
                          selected={parseDateValue(pickupDate)}
                          onSelect={(date) => {
                            if (date) setPickupDate(toDateValue(date));
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Giá tiền</Label>
                    <Input value={amount} onChange={(event) => setAmount(event.target.value)} type="number" min={0} className="h-9 border-slate-200 bg-white text-xs" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Ghi chú</Label>
                    <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Ví dụ: tách riêng áo trắng, giao trước 18:00..." className="min-h-[140px] resize-none border-slate-200 bg-white text-xs" />
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-lg border border-slate-200 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Ước tính đơn</p>
                  <p className="mt-1 text-3xl font-semibold text-slate-950">{finalEstimate.toLocaleString("vi-VN")}đ</p>
                  <div className="mt-5 grid gap-2 text-xs">
                    {[
                      ["Khách hàng", customer || "--"],
                      ["Dịch vụ", selectedService.name],
                      ["Số lượng", `${parsedWeight} ${selectedService.unit}`],
                      ["Giờ giao", timeSlot],
                      ["Thời gian", formatDate(pickupDate)],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-3 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                        <span className="text-slate-400">{label}</span>
                        <span className="font-semibold text-slate-800">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="m-0 flex-row justify-end gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3">
            <DialogClose asChild><Button variant="outline" className="h-8 border-slate-200 text-xs">Hủy</Button></DialogClose>
            <Button className="h-8 bg-slate-950 text-xs text-white hover:bg-slate-800" onClick={createBooking}>Tạo lịch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailBooking} onOpenChange={(open) => !open && setDetailBooking(null)}>
        <DialogContent className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-0 shadow-lg sm:w-[1000px] sm:max-w-[1000px]" showCloseButton={false}>
          <DialogHeader className="border-b border-slate-100 px-5 pb-3 pt-4">
            <DialogTitle className="text-base font-semibold text-slate-900">Chi tiết lịch hẹn</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">Thông tin lấy đồ và ước tính hiện tại.</DialogDescription>
          </DialogHeader>
          {detailBooking && (
            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/40 p-5">
              <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
                <div className="rounded-lg border border-slate-200 bg-white p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-900">Thông tin lấy đồ</h3>
                    <span className="rounded-md border border-slate-200 px-2 py-0.5 text-xs font-medium" style={{ color: statusStyle[detailBooking.status].color, backgroundColor: statusStyle[detailBooking.status].bg }}>
                      {statusLabels[detailBooking.status]}
                    </span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      ["Mã lịch", detailBooking.id],
                      ["Khách hàng", detailBooking.customer],
                      ["Số điện thoại", detailBooking.phone],
                      ["Dịch vụ", detailBooking.service],
                      ["Số lượng", detailBooking.quantity],
                      ["Giờ giao", detailBooking.timeSlot],
                      ["Thời gian", formatDate(detailBooking.date)],
                      ["Nhân viên xử lý", detailBooking.staff],
                      ["Giá tiền", `${detailBooking.estimate.toLocaleString("vi-VN")}đ`],
                    ].map(([label, value]) => (
                      <div key={label} className="space-y-1.5">
                        <Label>{label}</Label>
                        <div className="flex h-9 items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700">
                          {value}
                        </div>
                      </div>
                    ))}
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>Ghi chú</Label>
                      <div className="min-h-[140px] rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium leading-5 text-slate-700">
                        {detailBooking.note}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="rounded-lg border border-slate-200 bg-white p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-900">Dịch vụ</h3>
                      <span className="text-xs font-medium text-slate-400">{detailService?.turnaround || "--"}</span>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{detailBooking.service}</p>
                          <p className="mt-0.5 text-xs leading-4 text-slate-400">{detailService?.description || "Dịch vụ đã đặt"}</p>
                        </div>
                        <span className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ color: detailService?.color || "#64748b", backgroundColor: `${detailService?.color || "#64748b"}14` }}>
                          {detailService?.turnaround || "Demo"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Ước tính đơn</p>
                    <p className="mt-1 text-3xl font-semibold text-slate-950">{detailBooking.estimate.toLocaleString("vi-VN")}đ</p>
                    <div className="mt-5 grid gap-2 text-xs">
                      {[
                        ["Khách hàng", detailBooking.customer],
                        ["Dịch vụ", detailBooking.service],
                        ["Số lượng", detailBooking.quantity],
                        ["Giờ giao", detailBooking.timeSlot],
                        ["Thời gian", formatDate(detailBooking.date)],
                        ["Nhân viên", detailBooking.staff],
                        ["Trạng thái", statusLabels[detailBooking.status]],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between gap-3 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                          <span className="text-slate-400">{label}</span>
                          <span className="text-right font-semibold text-slate-800">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="m-0 flex-row justify-end gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3">
            <DialogClose asChild><Button className="h-8 bg-slate-950 text-xs text-white hover:bg-slate-800">Đóng</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!cancelBookingTarget} onOpenChange={(open) => !open && setCancelBookingTarget(null)}>
        <DialogContent className="max-w-[420px] gap-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-0 shadow-lg" showCloseButton={false}>
          <DialogHeader className="border-b border-slate-100 px-5 pb-3 pt-4">
            <DialogTitle className="text-base font-semibold text-slate-900">Xác nhận hủy lịch</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {cancelBookingTarget
                ? `Bạn có chắc muốn hủy lịch ${cancelBookingTarget.id} của ${cancelBookingTarget.customer}?`
                : "Bạn có chắc muốn hủy lịch này?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="m-0 flex-row justify-end gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3">
            <DialogClose asChild><Button variant="outline" className="h-8 border-slate-200 text-xs">Không hủy</Button></DialogClose>
            <Button
              className="h-8 bg-red-600 text-xs text-white hover:bg-red-700"
              onClick={() => {
                if (cancelBookingTarget) cancelBooking(cancelBookingTarget.id);
              }}
            >
              Xác nhận hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <HistoryModal
        open={openHistory}
        onClose={() => setOpenHistory(false)}
        title="Lịch sử đặt lịch"
        items={selectedBookings}
        activeItemId={activeHistoryBookingId || selectedBookings[0]?.id || null}
        onActiveItemChange={setActiveHistoryBookingId}
        itemLabel="lịch"
        renderSidebarItem={(booking, active) => (
          <div className="flex min-w-0 items-start gap-2">
            <Image
              src={defaultAvatarUrl}
              alt={booking.customer}
              width={28}
              height={28}
              className="size-7 shrink-0 rounded-full object-cover ring-1 ring-background"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-semibold text-foreground">{booking.id}</span>
                <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ color: bookingStatusDotColor[booking.status], backgroundColor: bookingStatusBgColor[booking.status] }}>
                  {bookingStatusLabels[booking.status]}
                </span>
              </div>
              <p className="mt-1.5 truncate text-xs font-medium text-foreground/80">{booking.customer}</p>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{booking.service} · {booking.quantity}</p>
            </div>
          </div>
        )}
        renderDetail={(booking) => {
          const currentStatusIndex = bookingStatuses.indexOf(booking.status);
          return (
            <div>
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-3">
                <div className="flex min-w-0 items-start gap-3">
                  <Image
                    src={defaultAvatarUrl}
                    alt={booking.customer}
                    width={40}
                    height={40}
                    className="size-10 shrink-0 rounded-full object-cover ring-1 ring-border"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {booking.id} · {booking.customer}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {booking.phone}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {booking.service} · {booking.quantity} · {booking.staff}
                    </p>
                  </div>
                </div>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{
                    color: bookingStatusDotColor[booking.status],
                    backgroundColor: bookingStatusBgColor[booking.status],
                  }}
                >
                  <span className="size-2 rounded-full" style={{ backgroundColor: bookingStatusDotColor[booking.status] }} />
                  {bookingStatusLabels[booking.status]}
                </span>
              </div>

              <div className="space-y-0 text-sm">
                {bookingStatuses.map((status, idx) => {
                  const reached = idx <= currentStatusIndex;
                  const isCurrentStatus = status === booking.status;
                  const statusColor = bookingStatusDotColor[status];
                  const statusBg = bookingStatusBgColor[status];

                  return (
                    <div key={status} className="flex gap-2.5">
                      <div className="flex flex-col items-center">
                        <span
                          className="mt-1 size-3 rounded-full border-2 bg-white"
                          style={reached ? { borderColor: statusColor, backgroundColor: statusColor } : undefined}
                        />
                        {idx < bookingStatuses.length - 1 && (
                          <span
                            className="mt-1 h-9 w-0.5 bg-border/60"
                            style={reached ? { backgroundColor: statusColor, opacity: 0.35 } : undefined}
                          />
                        )}
                      </div>
                      <div className="min-w-0 pb-3">
                        <p
                          className={`inline-flex rounded-md px-1.5 py-0.5 text-xs font-medium ${reached ? "" : "text-muted-foreground"}`}
                          style={reached ? { color: statusColor, backgroundColor: statusBg } : undefined}
                        >
                          {bookingStatusLabels[status]}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {reached
                            ? getBookingStatusTime(booking, idx, isCurrentStatus)
                            : "Chưa cập nhật"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }}
      />
    </PageShell>
  );
}
