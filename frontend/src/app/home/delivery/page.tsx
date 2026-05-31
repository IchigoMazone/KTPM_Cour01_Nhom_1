"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  EyeOff,
  FileDown,
  Kanban,
  List,
  MapPin,
  Pencil,
  Plus,
  Search,
  Settings,
  Table2,
  Users,
  X,
  Truck,
  TrendingUp,
  ShieldCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
import { useDashboardSettingsStore } from "@/src/context/useDashboardSettingsStore";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import { formatRange, normalizeRange } from "@/src/utils/dashboard-time";

type TripStatus = "Đã lấy" | "Đang giao" | "Chờ lấy" | "Chờ giao";
type DriverStatus = "Đang giao" | "Rảnh 30 phút" | "Đang lấy" | "Nghỉ";
type Tab = "Chuyến đi" | "Tài xế" | "Lộ trình" | "OTP & Nhật ký";

type Trip = {
  id: string;
  time: string;
  type: "Lấy đồ" | "Trả đồ";
  customer: string;
  address: string;
  driver: string;
  status: TripStatus;
  note: string;
  phone: string;
  avatar: string;
};

type Driver = {
  id: string;
  name: string;
  phone: string;
  rating: string;
  load: string;
  status: DriverStatus;
  note: string;
  avatar: string;
};

const seedTrips: Trip[] = [
  { id: "CY-201", time: "08:30", type: "Lấy đồ", customer: "Nguyễn Thị Hương", address: "12 Trần Phú, Q.1", driver: "Anh Minh", status: "Đã lấy", note: "Ưu tiên đồ trắng", phone: "0903123456", avatar: "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif" },
  { id: "CY-202", time: "09:15", type: "Trả đồ", customer: "Trần Văn Minh", address: "90 Lý Thường Kiệt, Q.5", driver: "Chị Lan", status: "Đang giao", note: "Thu COD 240.000đ", phone: "0912456789", avatar: "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif" },
  { id: "CY-203", time: "10:00", type: "Lấy đồ", customer: "Công ty ABC", address: "55 Pasteur, Q.1", driver: "Anh Tuấn", status: "Chờ lấy", note: "8 túi đồ giặt là sấy", phone: "0283812345", avatar: "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif" },
  { id: "CY-204", time: "14:30", type: "Trả đồ", customer: "Phạm Thị Lan", address: "18 Nguyễn Du, Q.3", driver: "Anh Minh", status: "Chờ giao", note: "Gọi trước khi giao 30p", phone: "0938123456", avatar: "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif" },
  { id: "CY-205", time: "16:00", type: "Lấy đồ", customer: "Lê Văn Nam", address: "45 Lê Lợi, Q.1", driver: "Chị Lan", status: "Chờ lấy", note: "Lấy đồ vest cao cấp", phone: "0967111222", avatar: "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif" },
  { id: "CY-206", time: "17:30", type: "Trả đồ", customer: "Hoàng Thị Mai", address: "112 Cách Mạng Tháng 8, Q.3", driver: "Anh Tuấn", status: "Chờ giao", note: "Giao đồ lụa giặt riêng", phone: "0988333444", avatar: "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif" },
];

const seedDrivers: Driver[] = [
  { id: "TX-301", name: "Anh Minh", phone: "0909555666", rating: "4.8/5", load: "3 lấy · 2 trả", status: "Đang giao", note: "Tuyến cố định Quận 1", avatar: "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif" },
  { id: "TX-302", name: "Chị Lan", phone: "0918777888", rating: "4.9/5", load: "1 lấy · 3 trả", status: "Rảnh 30 phút", note: "Phụ trách Quận 5 và Quận 3", avatar: "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif" },
  { id: "TX-303", name: "Anh Tuấn", phone: "0934999000", rating: "4.7/5", load: "2 lấy · 1 trả", status: "Đang lấy", note: "Tuyến đường Quận 10", avatar: "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif" },
];

const seedOtps = [
  { order: "DH-1048", type: "OTP lấy đồ", otp: "482193", status: "Đã xác nhận" },
  { order: "DH-1052", type: "OTP giao trả", otp: "739204", status: "Chờ khách xác nhận" },
  { order: "DH-1057", type: "OTP lấy đồ", otp: "118502", status: "Chưa gửi" },
];

const seedTimeline = [
  { time: "08:32", event: "Anh Minh đã lấy đồ đơn DH-1048 thành công" },
  { time: "09:20", event: "Chị Lan bắt đầu đi giao hàng đơn DH-1052" },
  { time: "10:04", event: "Anh Tuấn đang di chuyển đến điểm lấy đồ DH-1057" },
  { time: "14:02", event: "Hệ thống tự động nhắc nhở lịch giao trả đơn DH-1055" },
];

const seedRoutePlans = [
  { id: "LT-401", route: "Tuyến Q.1 gom 4 điểm", driver: "Anh Minh", orders: "DH-1048, DH-1055", eta: "58 phút", saving: "Giảm 18 phút", status: "Sẵn sàng áp dụng" },
  { id: "LT-402", route: "Chuyển DH-1055 sang Chị Lan", driver: "Chị Lan", orders: "DH-1052, DH-1055", eta: "42 phút", saving: "Giảm tải 1 chuyến", status: "Cần duyệt" },
  { id: "LT-403", route: "Gom điểm Q.3 cuối ca", driver: "Anh Tuấn", orders: "DH-1057, DH-1061", eta: "64 phút", saving: "Giảm 1.2 lít xăng", status: "Đang theo dõi" },
];

const tripStatusColor: Record<TripStatus, { text: string; bg: string }> = {
  "Đã lấy": { text: "#059669", bg: "rgba(5,150,105,0.09)" },
  "Đang giao": { text: "#2563eb", bg: "rgba(37,99,235,0.09)" },
  "Chờ lấy": { text: "#d97706", bg: "rgba(217,119,6,0.09)" },
  "Chờ giao": { text: "#7c3aed", bg: "rgba(124,58,237,0.09)" },
};

const driverStatusColor: Record<DriverStatus, { text: string; bg: string }> = {
  "Đang giao": { text: "#2563eb", bg: "rgba(37,99,235,0.09)" },
  "Rảnh 30 phút": { text: "#059669", bg: "rgba(5,150,105,0.09)" },
  "Đang lấy": { text: "#d97706", bg: "rgba(217,119,6,0.09)" },
  "Nghỉ": { text: "#64748b", bg: "rgba(100,116,139,0.1)" },
};

const emptyTripForm = {
  time: "",
  type: "Lấy đồ" as "Lấy đồ" | "Trả đồ",
  customer: "",
  address: "",
  driver: "Anh Minh",
  status: "Chờ lấy" as TripStatus,
  note: "",
  phone: "",
};

const emptyDriverForm = {
  name: "",
  phone: "",
  rating: "5.0/5",
  load: "0 lấy · 0 trả",
  status: "Rảnh 30 phút" as DriverStatus,
  note: "",
};

const pageSize = 10;
const tripStatuses: Array<TripStatus | "Tất cả"> = ["Tất cả", "Đã lấy", "Đang giao", "Chờ lấy", "Chờ giao"];
const driverStatuses: Array<DriverStatus | "Tất cả"> = ["Tất cả", "Đang giao", "Rảnh 30 phút", "Đang lấy", "Nghỉ"];

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
  icon: LucideIcon;
  color: string;
}) {
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

function StatusPill({ label, colorMap }: { label: string; colorMap: Record<string, { text: string; bg: string }> }) {
  const color = colorMap[label] || { text: "#64748b", bg: "rgba(100,116,139,0.1)" };
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

export default function DeliveryDashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Chuyến đi");
  const [trips, setTrips] = useState<Trip[]>(seedTrips);
  const [drivers, setDrivers] = useState<Driver[]>(seedDrivers);
  const [otps] = useState(seedOtps);
  const [timeline] = useState(seedTimeline);
  
  const [query, setQuery] = useState("");
  const [selectedTripStatus, setSelectedTripStatus] = useState<TripStatus | "Tất cả">("Tất cả");
  const [selectedDriverStatus, setSelectedDriverStatus] = useState<DriverStatus | "Tất cả">("Tất cả");
  const [page, setPage] = useState(1);
  
  const [openTripForm, setOpenTripForm] = useState(false);
  const [openDriverForm, setOpenDriverForm] = useState(false);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [editingDriverId, setEditingDriverId] = useState<string | null>(null);
  
  const [tripForm, setTripForm] = useState(emptyTripForm);
  const [driverForm, setDriverForm] = useState(emptyDriverForm);

  const deliveryEnabled = useDashboardSettingsStore((state) => state.deliveryEnabled);
  const range = useDashboardTimeRangeStore((state) => state.range);
  const rangeLabel = formatRange(normalizeRange(range));

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const source = `${trip.id} ${trip.customer} ${trip.address} ${trip.driver} ${trip.note}`;
      const matchQuery = source.toLowerCase().includes(query.toLowerCase());
      const matchStatus = selectedTripStatus === "Tất cả" || trip.status === selectedTripStatus;
      return matchQuery && matchStatus;
    });
  }, [query, selectedTripStatus, trips]);

  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const source = `${d.id} ${d.name} ${d.phone} ${d.note}`;
      const matchQuery = source.toLowerCase().includes(query.toLowerCase());
      const matchStatus = selectedDriverStatus === "Tất cả" || d.status === selectedDriverStatus;
      return matchQuery && matchStatus;
    });
  }, [drivers, query, selectedDriverStatus]);

  const filteredRoutePlans = useMemo(() => {
    return seedRoutePlans.filter((item) =>
      `${item.id} ${item.route} ${item.driver} ${item.orders} ${item.status}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  const filteredOtpRows = useMemo(() => {
    return otps.filter((item) =>
      `${item.order} ${item.type} ${item.otp} ${item.status}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [otps, query]);

  const filteredTimeline = useMemo(() => {
    return timeline.filter((item) =>
      `${item.time} ${item.event}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, timeline]);

  const activeRows =
    tab === "Chuyến đi"
      ? filteredTrips
      : tab === "Tài xế"
      ? filteredDrivers
      : tab === "Lộ trình"
      ? filteredRoutePlans
      : [...filteredOtpRows, ...filteredTimeline];
  const pageCount = Math.ceil(activeRows.length / pageSize);
  const paginatedTrips = filteredTrips.slice((page - 1) * pageSize, page * pageSize);
  const paginatedDrivers = filteredDrivers.slice((page - 1) * pageSize, page * pageSize);
  const paginatedRoutePlans = filteredRoutePlans.slice((page - 1) * pageSize, page * pageSize);
  const paginatedOtps = filteredOtpRows.slice((page - 1) * pageSize, page * pageSize);
  const paginatedTimeline = filteredTimeline.slice((page - 1) * pageSize, page * pageSize);

  const openCreateTrip = () => {
    setEditingTripId(null);
    setTripForm({
      ...emptyTripForm,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    });
    setOpenTripForm(true);
  };

  const openEditTrip = (trip: Trip) => {
    setEditingTripId(trip.id);
    setTripForm({
      time: trip.time,
      type: trip.type,
      customer: trip.customer,
      address: trip.address,
      driver: trip.driver,
      status: trip.status,
      note: trip.note,
      phone: trip.phone,
    });
    setOpenTripForm(true);
  };

  const saveTrip = () => {
    if (!tripForm.customer.trim() || !tripForm.address.trim()) return;
    const payload: Omit<Trip, "id" | "avatar"> = {
      time: tripForm.time,
      type: tripForm.type,
      customer: tripForm.customer,
      address: tripForm.address,
      driver: tripForm.driver,
      status: tripForm.status,
      note: tripForm.note || "Không có",
      phone: tripForm.phone || "090...",
    };

    if (editingTripId) {
      setTrips((prev) =>
        prev.map((item) =>
          item.id === editingTripId
            ? { ...item, ...payload }
            : item
        )
      );
    } else {
      const newId = `CY-${Date.now().toString().slice(-3)}`;
      setTrips((prev) => [
        {
          id: newId,
          avatar: "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif",
          ...payload,
        },
        ...prev,
      ]);
    }
    setPage(1);
    setOpenTripForm(false);
  };

  const openCreateDriver = () => {
    setEditingDriverId(null);
    setDriverForm(emptyDriverForm);
    setOpenDriverForm(true);
  };

  const openEditDriver = (d: Driver) => {
    setEditingDriverId(d.id);
    setDriverForm({
      name: d.name,
      phone: d.phone,
      rating: d.rating,
      load: d.load,
      status: d.status,
      note: d.note,
    });
    setOpenDriverForm(true);
  };

  const saveDriver = () => {
    if (!driverForm.name.trim() || !driverForm.phone.trim()) return;
    const payload: Omit<Driver, "id" | "avatar"> = {
      name: driverForm.name,
      phone: driverForm.phone,
      rating: driverForm.rating,
      load: driverForm.load,
      status: driverForm.status,
      note: driverForm.note || "Không có",
    };

    if (editingDriverId) {
      setDrivers((prev) =>
        prev.map((item) =>
          item.id === editingDriverId ? { ...item, ...payload } : item
        )
      );
    } else {
      const newId = `TX-${Date.now().toString().slice(-3)}`;
      setDrivers((prev) => [
        {
          id: newId,
          avatar: "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif",
          ...payload,
        },
        ...prev,
      ]);
    }
    setPage(1);
    setOpenDriverForm(false);
  };

  return (
    <PageShell fullHeight>
      {/* ── Delivery Enabled Check ── */}
      {!deliveryEnabled && (
        <div className="grid min-h-[calc(100dvh-220px)] place-items-center rounded-lg border border-dashed border-neutral-300 bg-white p-6">
          <div className="mx-auto max-w-xl text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <AlertTriangle className="size-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">Mục Giao nhận đã được tắt</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Thông tin giao nhận đang được ẩn theo cấu hình hệ thống hiện tại. Vui lòng bật lại mục này trong phần Cài Đặt Chung hoặc điều phối trên trang khác.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {[
                ["Tổng quan", "/home"],
                ["Đơn hàng", "/home/orders"],
                ["Khách hàng", "/home/customers"],
              ].map(([label, path]) => (
                <Button
                  key={path}
                  variant={path === "/home" ? "default" : "outline"}
                  size="sm"
                  className={path === "/home" ? "gap-2 bg-neutral-900 text-white hover:bg-neutral-800" : "gap-2"}
                  onClick={() => router.push(path)}
                >
                  {label}
                  <ArrowRight className="size-4" />
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {deliveryEnabled && (
        <>
          {/* ════════════ METRICS SECTION ════════════ */}
          <div className="grid shrink-0 gap-3 md:grid-cols-4">
            <MetricCard title="Chuyến hôm nay" value="18 chuyến" hint="9 chuyến lấy · 9 chuyến trả" icon={Truck} color="#2563eb" />
            <MetricCard title="Đúng hẹn" value="92%" hint="2 chuyến có nguy cơ trễ" icon={Clock} color="#059669" />
            <MetricCard title="Tài xế hoạt động" value="3/4 tài xế" hint="1 tài xế dự phòng ca sau" icon={Users} color="#7c3aed" />
            <MetricCard title="Tối ưu lộ trình" value="Đã tối ưu" hint="Thuật toán giảm 18% độ lệch" icon={TrendingUp} color="#f59e0b" />
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
            
            {/* ── Top Toolbar ── */}
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 pt-1 pb-3 xl:flex-row xl:items-center xl:justify-between">
              {/* Left View Tabs & Icon Selectors */}
              <div className="flex flex-wrap items-center gap-1">
                {([
                  ["Chuyến đi", Truck],
                  ["Tài xế", Users],
                  ["Lộ trình", MapPin],
                  ["OTP & Nhật ký", ShieldCheck],
                ] as const).map(([item, Icon]) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setTab(item);
                      setPage(1);
                      setQuery("");
                    }}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors ${
                      tab === item
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="size-3.5" />
                    {item}
                  </button>
                ))}
                
                <span className="mx-2 hidden h-4 w-px bg-slate-200 sm:block" />
                
                {([
                  ["Bảng", Table2],
                  ["Bảng kéo", Kanban],
                  ["Danh sách", List],
                ] as const).map(([label, Icon]) => (
                  <button
                    key={label}
                    type="button"
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      label === "Bảng"
                        ? "text-slate-800"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                  >
                    <Icon className="size-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Right Search Box & Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[220px] flex-1 xl:w-64 xl:flex-none">
                  <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
                  <Input
                    className="h-8 rounded-md border-slate-200 bg-white pl-8 text-xs text-slate-700 shadow-none placeholder:text-slate-500 focus-visible:ring-slate-200"
                    placeholder={
                      tab === "Chuyến đi"
                        ? "Tìm chuyến, khách, tài xế..."
                        : tab === "Tài xế"
                        ? "Tìm tên, SĐT tài xế..."
                        : tab === "Lộ trình"
                        ? "Tìm tuyến, tài xế, mã đơn..."
                        : "Tìm OTP, mã đơn, sự kiện..."
                    }
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
                {(tab === "Chuyến đi" || tab === "Tài xế") && (
                  <button
                    type="button"
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    onClick={tab === "Chuyến đi" ? openCreateTrip : openCreateDriver}
                  >
                    {tab === "Chuyến đi" ? "Thêm chuyến" : "Thêm tài xế"}
                    <ChevronDown className="size-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* ── Filter Pills ── */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-5 py-3">
              <button type="button" className="inline-flex h-7 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 text-xs text-slate-700 transition-colors hover:bg-slate-50">
                <CalendarClock className="size-3.5" />
                {rangeLabel}
                <ChevronDown className="size-3.5" />
              </button>

              {tab === "Chuyến đi" && (
                <>
                  {tripStatuses.map((status) => {
                    const active = selectedTripStatus === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => {
                          setSelectedTripStatus(status);
                          setPage(1);
                        }}
                        className={`inline-flex h-7 items-center rounded-full px-2.5 text-xs font-medium transition-colors ${
                          active ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </>
              )}

              {tab === "Tài xế" && (
                <>
                  {driverStatuses.map((status) => {
                    const active = selectedDriverStatus === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => {
                          setSelectedDriverStatus(status);
                          setPage(1);
                        }}
                        className={`inline-flex h-7 items-center rounded-full px-2.5 text-xs font-medium transition-colors ${
                          active ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </>
              )}

              {tab === "Lộ trình" && (
                <>
                  {["Tất cả", "Sẵn sàng áp dụng", "Cần duyệt", "Đang theo dõi"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      className="inline-flex h-7 items-center rounded-full border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      {status}
                    </button>
                  ))}
                </>
              )}

              <button type="button" className="inline-flex h-7 items-center gap-1.5 px-2 text-xs text-slate-500 transition-colors hover:text-slate-700">
                <Plus className="size-3.5" />
                Thêm bộ lọc
              </button>
            </div>

            {/* ── Table & Interactive Layout Content Area ── */}
            <div className="flex-1 overflow-auto">
              
              {/* TAB 1: CHUYẾN ĐI (Trips Spreadsheet Table) */}
              {tab === "Chuyến đi" && (
                <Table className="w-full table-fixed text-xs [&_td:not(:first-child)]:border-l [&_td:not(:first-child)]:border-slate-100">
                  <TableHeader>
                    <TableRow className="h-9 border-b border-slate-100 bg-slate-50 hover:bg-slate-50">
                      <TableHead className="w-[126px] pl-4 text-xs font-medium text-slate-600">
                        <span className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="relative size-4 appearance-none rounded-[5px] border border-slate-300 bg-white transition-all duration-150 checked:border-slate-900 checked:bg-slate-900 after:absolute after:left-[4.5px] after:top-[1px] after:hidden after:h-[9px] after:w-[5px] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:content-[''] checked:after:block"
                            aria-label="Chọn tất cả chuyến đi"
                          />
                          Mã chuyến
                        </span>
                      </TableHead>
                      <TableHead className="w-[110px] border-l border-slate-100 text-xs font-medium text-slate-600">Giờ hẹn</TableHead>
                      <TableHead className="w-[112px] border-l border-slate-100 text-xs font-medium text-slate-600">Loại chuyến</TableHead>
                      <TableHead className="w-[180px] border-l border-slate-100 text-xs font-medium text-slate-600">Khách hàng</TableHead>
                      <TableHead className="w-[200px] border-l border-slate-100 text-xs font-medium text-slate-600">Địa chỉ</TableHead>
                      <TableHead className="w-[132px] border-l border-slate-100 text-xs font-medium text-slate-600">Tài xế phụ trách</TableHead>
                      <TableHead className="w-[126px] border-l border-slate-100 text-xs font-medium text-slate-600">Trạng thái</TableHead>
                      <TableHead className="w-[180px] border-l border-slate-100 text-xs font-medium text-slate-600">Ghi chú</TableHead>
                      <TableHead className="w-[108px] border-l border-slate-100 px-4 text-left text-xs font-medium text-slate-600">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTrips.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9}>
                          <div className="grid min-h-[300px] place-items-center text-sm text-slate-400">
                            Không tìm thấy chuyến giao nhận phù hợp.
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedTrips.map((trip) => (
                        <TableRow
                          key={trip.id}
                          className="group h-9 border-b border-slate-100 text-slate-700 transition-colors hover:bg-slate-50/60"
                        >
                          <TableCell className="pl-4 font-medium text-slate-900">
                            <span className="inline-flex items-center gap-2">
                              <input
                                type="checkbox"
                                className="relative size-4 appearance-none rounded-[5px] border border-slate-300 bg-white transition-all duration-150 checked:border-slate-900 checked:bg-slate-900 after:absolute after:left-[4.5px] after:top-[1px] after:hidden after:h-[9px] after:w-[5px] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:content-[''] checked:after:block"
                                aria-label={`Chọn chuyến ${trip.id}`}
                                onClick={(e) => e.stopPropagation()}
                              />
                              {trip.id}
                            </span>
                          </TableCell>
                          <TableCell className="font-semibold text-slate-900">{trip.time}</TableCell>
                          <TableCell>
                            {trip.type === "Lấy đồ" ? (
                              <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                                {trip.type}
                              </span>
                            ) : (
                              <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                {trip.type}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex min-w-0 items-center gap-2">
                              <Image
                                src={trip.avatar}
                                alt={trip.customer}
                                width={24}
                                height={24}
                                className="size-6 shrink-0 rounded-full object-cover"
                              />
                              <span className="whitespace-nowrap font-medium text-slate-900">{trip.customer}</span>
                            </div>
                          </TableCell>
                          <TableCell className="truncate font-medium text-slate-600">{trip.address}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <div className="size-1.5 shrink-0 rounded-full bg-indigo-500" />
                              <span className="font-semibold text-slate-700">{trip.driver}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusPill label={trip.status} colorMap={tripStatusColor} />
                          </TableCell>
                          <TableCell className="truncate text-slate-500">{trip.note}</TableCell>
                          <TableCell className="px-4">
                            <button
                              type="button"
                              className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50"
                              onClick={() => openEditTrip(trip)}
                            >
                              <Pencil className="size-3.5" />
                              Sửa
                            </button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    {/* Empty placeholder rows to fill the height to 10 rows */}
                    {paginatedTrips.length > 0 && paginatedTrips.length < pageSize &&
                      Array.from({ length: pageSize - paginatedTrips.length }).map((_, i) => (
                        <TableRow key={`empty-${i}`} className="border-b border-slate-100">
                          <TableCell className="pl-4">
                            <input type="checkbox" disabled className="size-4 opacity-0" />
                          </TableCell>
                          {Array.from({ length: 8 }).map((_, j) => (
                            <TableCell key={j}>&nbsp;</TableCell>
                          ))}
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              )}

              {/* TAB 2: TÀI XẾ (Drivers Spreadsheet Table) */}
              {tab === "Tài xế" && (
                <Table className="w-full table-fixed text-xs [&_td:not(:first-child)]:border-l [&_td:not(:first-child)]:border-slate-100">
                  <TableHeader>
                    <TableRow className="h-9 border-b border-slate-100 bg-slate-50 hover:bg-slate-50">
                      <TableHead className="w-[126px] pl-4 text-xs font-medium text-slate-600">Mã tài xế</TableHead>
                      <TableHead className="w-[180px] border-l border-slate-100 text-xs font-medium text-slate-600">Họ và tên</TableHead>
                      <TableHead className="w-[140px] border-l border-slate-100 text-xs font-medium text-slate-600">Số điện thoại</TableHead>
                      <TableHead className="w-[110px] border-l border-slate-100 text-xs font-medium text-slate-600">Đánh giá</TableHead>
                      <TableHead className="w-[140px] border-l border-slate-100 text-xs font-medium text-slate-600">Tải công việc trong ngày</TableHead>
                      <TableHead className="w-[126px] border-l border-slate-100 text-xs font-medium text-slate-600">Trạng thái ca</TableHead>
                      <TableHead className="w-[200px] border-l border-slate-100 text-xs font-medium text-slate-600">Ghi chú vận chuyển</TableHead>
                      <TableHead className="w-[108px] border-l border-slate-100 px-4 text-xs font-medium text-slate-600">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedDrivers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8}>
                          <div className="grid min-h-[300px] place-items-center text-sm text-slate-400">
                            Không tìm thấy tài xế phù hợp.
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedDrivers.map((d) => (
                        <TableRow
                          key={d.id}
                          className="h-9 border-b border-slate-100 text-slate-700 transition-colors hover:bg-slate-50/60"
                        >
                          <TableCell className="pl-4 font-semibold text-slate-900">{d.id}</TableCell>
                          <TableCell>
                            <div className="flex min-w-0 items-center gap-2">
                              <Image
                                src={d.avatar}
                                alt={d.name}
                                width={24}
                                height={24}
                                className="size-6 shrink-0 rounded-full object-cover"
                              />
                              <span className="whitespace-nowrap font-medium text-slate-900">{d.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <a href={`tel:${d.phone}`} className="text-slate-500 hover:text-slate-800">
                              {d.phone}
                            </a>
                          </TableCell>
                          <TableCell className="font-semibold text-slate-800">{d.rating}</TableCell>
                          <TableCell className="font-medium text-slate-700">{d.load}</TableCell>
                          <TableCell>
                            <StatusPill label={d.status} colorMap={driverStatusColor} />
                          </TableCell>
                          <TableCell className="truncate text-slate-500">{d.note}</TableCell>
                          <TableCell className="px-4">
                            <button
                              type="button"
                              className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50"
                              onClick={() => openEditDriver(d)}
                            >
                              <Pencil className="size-3.5" />
                              Sửa
                            </button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    {/* Empty placeholder rows to fill the height to 10 rows */}
                    {paginatedDrivers.length > 0 && paginatedDrivers.length < pageSize &&
                      Array.from({ length: pageSize - paginatedDrivers.length }).map((_, i) => (
                        <TableRow key={`empty-${i}`} className="border-b border-slate-100">
                          <TableCell className="pl-4 font-semibold text-slate-900">&nbsp;</TableCell>
                          {Array.from({ length: 7 }).map((_, j) => (
                            <TableCell key={j}>&nbsp;</TableCell>
                          ))}
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              )}

              {tab === "Lộ trình" && (
                <Table className="w-full table-fixed text-xs [&_td:not(:first-child)]:border-l [&_td:not(:first-child)]:border-slate-100">
                  <TableHeader>
                    <TableRow className="h-9 border-b border-slate-100 bg-slate-50 hover:bg-slate-50">
                      <TableHead className="w-[112px] pl-4 text-xs font-medium text-slate-600">Mã tuyến</TableHead>
                      <TableHead className="w-[220px] border-l border-slate-100 text-xs font-medium text-slate-600">Gợi ý điều phối</TableHead>
                      <TableHead className="w-[132px] border-l border-slate-100 text-xs font-medium text-slate-600">Tài xế</TableHead>
                      <TableHead className="w-[168px] border-l border-slate-100 text-xs font-medium text-slate-600">Đơn liên quan</TableHead>
                      <TableHead className="w-[104px] border-l border-slate-100 text-xs font-medium text-slate-600">ETA</TableHead>
                      <TableHead className="w-[148px] border-l border-slate-100 text-xs font-medium text-slate-600">Hiệu quả</TableHead>
                      <TableHead className="w-[146px] border-l border-slate-100 text-xs font-medium text-slate-600">Trạng thái</TableHead>
                      <TableHead className="w-[116px] border-l border-slate-100 px-4 text-xs font-medium text-slate-600">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRoutePlans.map((item) => (
                      <TableRow key={item.id} className="h-9 border-b border-slate-100 text-slate-700 transition-colors hover:bg-slate-50/60">
                        <TableCell className="pl-4 font-medium text-slate-900">{item.id}</TableCell>
                        <TableCell className="font-medium text-slate-900">{item.route}</TableCell>
                        <TableCell>{item.driver}</TableCell>
                        <TableCell className="text-slate-500">{item.orders}</TableCell>
                        <TableCell className="font-semibold text-slate-800">{item.eta}</TableCell>
                        <TableCell className="text-slate-600">{item.saving}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium text-blue-700" style={{ backgroundColor: "rgba(37,99,235,0.08)" }}>
                            <span className="size-1.5 rounded-full bg-blue-600" />
                            {item.status}
                          </span>
                        </TableCell>
                        <TableCell className="px-4">
                          <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50">
                            <Zap className="size-3.5" />
                            Áp dụng
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {tab === "OTP & Nhật ký" && (
                <div className="grid min-h-full grid-cols-1 lg:grid-cols-[1fr_1.15fr]">
                  <div className="border-r border-slate-100">
                    <Table className="w-full table-fixed text-xs [&_td:not(:first-child)]:border-l [&_td:not(:first-child)]:border-slate-100">
                      <TableHeader>
                        <TableRow className="h-9 border-b border-slate-100 bg-slate-50 hover:bg-slate-50">
                          <TableHead className="w-[104px] pl-4 text-xs font-medium text-slate-600">Mã đơn</TableHead>
                          <TableHead className="w-[116px] border-l border-slate-100 text-xs font-medium text-slate-600">Loại OTP</TableHead>
                          <TableHead className="w-[92px] border-l border-slate-100 text-xs font-medium text-slate-600">Mã OTP</TableHead>
                          <TableHead className="w-[142px] border-l border-slate-100 text-xs font-medium text-slate-600">Trạng thái</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedOtps.map((item) => (
                          <TableRow key={item.order} className="h-9 border-b border-slate-100 text-slate-700 transition-colors hover:bg-slate-50/60">
                            <TableCell className="pl-4 font-medium text-slate-900">{item.order}</TableCell>
                            <TableCell>{item.type}</TableCell>
                            <TableCell className="font-mono font-semibold text-slate-900">{item.otp}</TableCell>
                            <TableCell>
                              <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium text-slate-700">
                                <span className="size-1.5 rounded-full bg-slate-500" />
                                {item.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <Table className="w-full table-fixed text-xs [&_td:not(:first-child)]:border-l [&_td:not(:first-child)]:border-slate-100">
                    <TableHeader>
                      <TableRow className="h-9 border-b border-slate-100 bg-slate-50 hover:bg-slate-50">
                        <TableHead className="w-[88px] pl-4 text-xs font-medium text-slate-600">Thời gian</TableHead>
                        <TableHead className="border-l border-slate-100 text-xs font-medium text-slate-600">Nhật ký trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTimeline.map((item) => (
                        <TableRow key={item.event} className="h-9 border-b border-slate-100 text-slate-700 transition-colors hover:bg-slate-50/60">
                          <TableCell className="pl-4 font-semibold text-slate-900">{item.time}</TableCell>
                          <TableCell className="text-slate-600">{item.event}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

            </div>

            {/* ── Pagination Footer ── */}
            <div className="border-t border-slate-200 px-5 pt-3 pb-1">
              <div className="flex flex-col gap-3 text-xs text-slate-700 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <span>Số dòng mỗi trang</span>
                  <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 px-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50">
                    {pageSize}
                    <ChevronDown className="size-3.5" />
                  </button>
                  <span className="text-slate-400">
                    {activeRows.length === 0 ? 0 : (page - 1) * pageSize + 1}–
                    {Math.min(page * pageSize, activeRows.length)} trong {activeRows.length} dòng
                  </span>
                </div>

                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 disabled:opacity-40"
                    disabled={page <= 1}
                    onClick={() => setPage(1)}
                  >
                    <ChevronsLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 disabled:opacity-40"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => Math.max(current - 1, 1))}
                  >
                    <ChevronDown className="size-4 rotate-90" />
                  </button>
                  <span className="px-3 text-sm font-medium text-slate-700">
                    {page} / {pageCount || 1}
                  </span>
                  <button
                    type="button"
                    className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 disabled:opacity-40"
                    disabled={page >= pageCount}
                    onClick={() => setPage((current) => Math.min(current + 1, pageCount))}
                  >
                    <ChevronDown className="size-4 -rotate-90" />
                  </button>
                  <button
                    type="button"
                    className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 disabled:opacity-40"
                    disabled={page >= pageCount}
                    onClick={() => setPage(pageCount || 1)}
                  >
                    <ChevronsRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ════════════ MODAL popup: CREATE / EDIT TRIP ════════════ */}
      {openTripForm && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-xl rounded-2xl border-0 shadow-2xl overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 px-6 py-4">
              <CardTitle className="text-base font-semibold">
                {editingTripId ? `Chỉnh sửa chuyến ${editingTripId}` : "Thêm chuyến giao nhận mới"}
              </CardTitle>
              <button
                type="button"
                className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setOpenTripForm(false)}
              >
                <X className="size-5" />
              </button>
            </CardHeader>
            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Khách hàng</Label>
                <Input value={tripForm.customer} onChange={(e) => setTripForm({ ...tripForm, customer: e.target.value })} placeholder="Họ tên khách" />
              </div>
              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <Input value={tripForm.phone} onChange={(e) => setTripForm({ ...tripForm, phone: e.target.value })} placeholder="090..." />
              </div>
              <div className="space-y-2">
                <Label>Giờ hẹn</Label>
                <Input value={tripForm.time} onChange={(e) => setTripForm({ ...tripForm, time: e.target.value })} placeholder="08:30" />
              </div>
              <div className="space-y-2">
                <Label>Tài xế giao nhận</Label>
                <Input value={tripForm.driver} onChange={(e) => setTripForm({ ...tripForm, driver: e.target.value })} placeholder="Anh Minh / Chị Lan..." />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Địa chỉ</Label>
                <Input value={tripForm.address} onChange={(e) => setTripForm({ ...tripForm, address: e.target.value })} placeholder="Địa chỉ giao/nhận hàng" />
              </div>
              
              <div className="space-y-2">
                <Label>Loại chuyến</Label>
                <div className="flex h-10 items-center gap-2">
                  {(["Lấy đồ", "Trả đồ"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTripForm({ ...tripForm, type: t })}
                      className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold ${
                        tripForm.type === t ? "bg-slate-900 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <div className="flex h-10 items-center gap-2">
                  {(["Chờ lấy", "Đang giao", "Đã lấy", "Chờ giao"] as TripStatus[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setTripForm({ ...tripForm, status: s })}
                      className={`inline-flex h-8 items-center rounded-full px-3.5 text-xs font-semibold ${
                        tripForm.status === s ? "bg-slate-900 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Ghi chú</Label>
                <Textarea value={tripForm.note} onChange={(e) => setTripForm({ ...tripForm, note: e.target.value })} placeholder="Ghi chú đóng gói, thời gian đặc biệt..." />
              </div>
              
              <Button className="md:col-span-2 mt-2 bg-slate-900 text-white hover:bg-slate-800 h-10 font-semibold rounded-lg transition-colors" onClick={saveTrip}>
                Lưu thông tin
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ════════════ MODAL popup: CREATE / EDIT DRIVER ════════════ */}
      {openDriverForm && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-xl rounded-2xl border-0 shadow-2xl overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 px-6 py-4">
              <CardTitle className="text-base font-semibold">
                {editingDriverId ? `Chỉnh sửa tài xế ${editingDriverId}` : "Thêm tài xế mới"}
              </CardTitle>
              <button
                type="button"
                className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setOpenDriverForm(false)}
              >
                <X className="size-5" />
              </button>
            </CardHeader>
            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tài xế</Label>
                <Input value={driverForm.name} onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })} placeholder="Tên tài xế" />
              </div>
              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <Input value={driverForm.phone} onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })} placeholder="090..." />
              </div>
              <div className="space-y-2">
                <Label>Đánh giá / Rating</Label>
                <Input value={driverForm.rating} onChange={(e) => setDriverForm({ ...driverForm, rating: e.target.value })} placeholder="4.8/5" />
              </div>
              <div className="space-y-2">
                <Label>Tải việc trong ngày</Label>
                <Input value={driverForm.load} onChange={(e) => setDriverForm({ ...driverForm, load: e.target.value })} placeholder="2 lấy · 2 trả" />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label>Trạng thái hoạt động</Label>
                <div className="flex flex-wrap gap-2">
                  {(["Đang giao", "Rảnh 30 phút", "Đang lấy", "Nghỉ"] as DriverStatus[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setDriverForm({ ...driverForm, status: s })}
                      className={`inline-flex h-8 items-center rounded-full px-3.5 text-xs font-semibold ${
                        driverForm.status === s ? "bg-slate-900 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Ghi chú tuyến đường</Label>
                <Textarea value={driverForm.note} onChange={(e) => setDriverForm({ ...driverForm, note: e.target.value })} placeholder="Khu vực phụ trách, lưu ý khi di chuyển..." />
              </div>
              
              <Button className="md:col-span-2 mt-2 bg-slate-900 text-white hover:bg-slate-800 h-10 font-semibold rounded-lg transition-colors" onClick={saveDriver}>
                Lưu thông tin tài xế
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </PageShell>
  );
}
