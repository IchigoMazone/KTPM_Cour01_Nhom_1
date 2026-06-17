"use client";

import { useMemo, useState, type DragEvent } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Truck,
  Clock,
  Users,
  TrendingUp,
  MapPin,
  ShieldCheck,
  Zap,
  Pencil
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import { PageShell, ViewModeTabs } from "../_components/dashboard-primitives";
import { MetricCard } from "../_components/metric-card";
import { Toolbar } from "../_components/toolbar";
import { FilterBar, type FilterOption } from "../_components/filter-bar";
import { TableView } from "../_components/table-view";
import { FormDialog, type FormField } from "../_components/form-dialog";
import { AddColumnDialog } from "../_components/add-column-dialog";
import { KanbanView, type KanbanColumn } from "../_components/kanban-view";
import { ListView } from "../_components/list-view";
import { HistoryModal } from "../_components/history-modal";
import {
  DashboardDataTable,
  DashboardTableFooter
} from "@/src/components/common/dashboard-data-table";
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
  createdAt?: string;
  updatedAt?: string;
  [key: string]: string | undefined;
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
  createdAt?: string;
  updatedAt?: string;
  [key: string]: string | undefined;
};

type RoutePlan = {
  id: string;
  route: string;
  driver: string;
  orders: string;
  eta: string;
  saving: string;
  status: string;
};

type OtpRow = {
  id: string;
  order?: string;
  type?: string;
  otp?: string;
  status?: string;
  time?: string;
  event?: string;
};

type TimelineRow = {
  time: string;
  event: string;
};

const tripStatusColor: Record<TripStatus, { text: string; bg: string }> = {
  "Đã lấy": { text: "#059669", bg: "rgba(5,150,105,0.09)" },
  "Đang giao": { text: "#2563eb", bg: "rgba(37,99,235,0.09)" },
  "Chờ lấy": { text: "#d97706", bg: "rgba(217,119,6,0.09)" },
  "Chờ giao": { text: "#7c3aed", bg: "rgba(124,58,237,0.09)" },
};

const tripStatusOptions: TripStatus[] = ["Chờ lấy", "Đang giao", "Đã lấy", "Chờ giao"];
const tripStatusDotColors = Object.fromEntries(
  Object.entries(tripStatusColor).map(([status, color]) => [status, color.text])
);

const tripTypeDotColors: Record<Trip["type"], string> = {
  "Lấy đồ": "#2563eb",
  "Trả đồ": "#059669",
};

const driverStatusColor: Record<DriverStatus, { text: string; bg: string }> = {
  "Đang giao":    { text: "#2563eb", bg: "rgba(37,99,235,0.09)" },
  "Rảnh 30 phút": { text: "#059669", bg: "rgba(5,150,105,0.09)" },
  "Đang lấy":    { text: "#d97706", bg: "rgba(217,119,6,0.09)" },
  "Nghỉ":        { text: "#64748b", bg: "rgba(100,116,139,0.1)" },
};

const routeStatusColor: Record<string, { text: string; bg: string }> = {
  "Sẵn sàng áp dụng": { text: "#2563eb", bg: "rgba(37,99,235,0.09)" },
  "Cần duyệt":       { text: "#d97706", bg: "rgba(217,119,6,0.09)" },
  "Đang theo dõi":  { text: "#64748b", bg: "rgba(100,116,139,0.1)" },
};

const otpStatusColor: Record<string, { text: string; bg: string }> = {
  "Đã xác nhận":        { text: "#059669", bg: "rgba(5,150,105,0.09)" },
  "Chờ khách xác nhận": { text: "#7c3aed", bg: "rgba(124,58,237,0.09)" },
  "Chưa gửi":          { text: "#64748b", bg: "rgba(100,116,139,0.1)" },
};

const defaultTripColumns = [
  { id: "id", label: "Mã chuyến", width: 126, visible: true },
  { id: "time", label: "Giờ hẹn", width: 110, visible: true },
  { id: "type", label: "Loại chuyến", width: 112, visible: true },
  { id: "customer", label: "Khách hàng", width: 180, visible: true },
  { id: "phone", label: "Số điện thoại", width: 140, visible: true },
  { id: "address", label: "Địa chỉ", width: 200, visible: true },
  { id: "driver", label: "Tài xế phụ trách", width: 132, visible: true },
  { id: "status", label: "Trạng thái", width: 126, visible: true },
  { id: "note", label: "Ghi chú", width: 180, visible: true },
  { id: "actions", label: "Thao tác", width: 108, visible: true },
];

const defaultDriverColumns = [
  { id: "id", label: "Mã tài xế", width: 126, visible: true },
  { id: "name", label: "Họ và tên", width: 180, visible: true },
  { id: "phone", label: "Số điện thoại", width: 140, visible: true },
  { id: "rating", label: "Đánh giá", width: 110, visible: true },
  { id: "load", label: "Tải công việc trong ngày", width: 140, visible: true },
  { id: "status", label: "Trạng thái ca", width: 126, visible: true },
  { id: "note", label: "Ghi chú vận chuyển", width: 200, visible: true },
  { id: "actions", label: "Thao tác", width: 108, visible: true },
];

const defaultRouteColumns = [
  { id: "id", label: "Mã tuyến", width: 112, visible: true },
  { id: "route", label: "Gợi ý điều phối", width: 220, visible: true },
  { id: "driver", label: "Tài xế", width: 132, visible: true },
  { id: "orders", label: "Đơn liên quan", width: 168, visible: true },
  { id: "eta", label: "ETA", width: 104, visible: true },
  { id: "saving", label: "Hiệu quả", width: 148, visible: true },
  { id: "status", label: "Trạng thái", width: 146, visible: true },
  { id: "actions", label: "Thao tác", width: 116, visible: true },
];

const defaultOtpColumns = [
  { id: "order", label: "Mã đơn", width: 104, visible: true },
  { id: "type", label: "Loại OTP", width: 116, visible: true },
  { id: "otp", label: "Mã OTP", width: 92, visible: true },
  { id: "status", label: "Trạng thái", width: 142, visible: true },
  { id: "time", label: "Thời gian", width: 88, visible: true },
  { id: "event", label: "Nhật ký trạng thái", width: 420, visible: true },
];

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

const driverFormFields: FormField[] = [
  { id: "name", label: "Tài xế", type: "text", placeholder: "Tên tài xế" },
  { id: "phone", label: "Số điện thoại", type: "text", placeholder: "090..." },
  { id: "rating", label: "Đánh giá / Rating", type: "text", placeholder: "4.8/5" },
  { id: "load", label: "Tải việc trong ngày", type: "text", placeholder: "2 lấy · 2 trả" },
  { id: "status", label: "Trạng thái hoạt động", type: "select", options: ["Đang giao", "Rảnh 30 phút", "Đang lấy", "Nghỉ"] },
  { id: "note", label: "Ghi chú tuyến đường", type: "textarea", placeholder: "Khu vực phụ trách, lưu ý khi di chuyển..." },
];

export default function DeliveryDashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Chuyến đi");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routePlans, setRoutePlans] = useState<RoutePlan[]>([]);
  const [otpsState, setOtpsState] = useState<Array<Pick<OtpRow, "order" | "type" | "otp" | "status">>>([]);
  const [timeline] = useState<TimelineRow[]>([]);

  const [query, setQuery] = useState("");
  const [selectedTripStatus, setSelectedTripStatus] = useState<string>("Tất cả");
  const [selectedDriverStatus, setSelectedDriverStatus] = useState<string>("Tất cả");
  const [selectedRouteStatus, setSelectedRouteStatus] = useState<string>("Tất cả");
  const [selectedOtpStatus, setSelectedOtpStatus] = useState<string>("Tất cả");
  const [viewMode, setViewMode] = useState<"Bảng" | "Bảng kéo" | "Danh sách">("Bảng");
  const [selectedTripIds, setSelectedTripIds] = useState<Set<string>>(new Set());
  const [selectedDriverIds, setSelectedDriverIds] = useState<Set<string>>(new Set());
  const [selectedRouteIds, setSelectedRouteIds] = useState<Set<string>>(new Set());
  const [selectedOtpIds, setSelectedOtpIds] = useState<Set<string>>(new Set());
  const [openHistory, setOpenHistory] = useState(false);
  const [activeHistoryItemId, setActiveHistoryItemId] = useState<string | null>(null);

  const [draggedTripId, setDraggedTripId] = useState<string | null>(null);
  const [dragOverTripStatus, setDragOverTripStatus] = useState<string | null>(null);
  const [draggedDriverId, setDraggedDriverId] = useState<string | null>(null);
  const [dragOverDriverStatus, setDragOverDriverStatus] = useState<string | null>(null);
  const [draggedRouteId, setDraggedRouteId] = useState<string | null>(null);
  const [dragOverRouteStatus, setDragOverRouteStatus] = useState<string | null>(null);
  const [draggedOtpId, setDraggedOtpId] = useState<string | null>(null);
  const [dragOverOtpStatus, setDragOverOtpStatus] = useState<string | null>(null);

  const checkboxClass =
    "relative size-4 appearance-none rounded-[5px] border border-slate-300 bg-white transition-all duration-150 checked:border-emerald-300 checked:bg-emerald-300 after:absolute after:left-1/2 after:top-1/2 after:hidden after:h-[9px] after:w-[5px] after:-translate-x-1/2 after:-translate-y-[58%] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:content-[''] checked:after:block";

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [columnsTrip, setColumnsTrip] = useState(defaultTripColumns);
  const [columnsDriver, setColumnsDriver] = useState(defaultDriverColumns);
  const [columnsRoute, setColumnsRoute] = useState(defaultRouteColumns);
  const [columnsOtp, setColumnsOtp] = useState(defaultOtpColumns);

  const activeColumns = 
    tab === "Chuyến đi" ? columnsTrip : 
    tab === "Tài xế" ? columnsDriver : 
    tab === "Lộ trình" ? columnsRoute : columnsOtp;

  const activeDefaultColumnIds =
    tab === "Chuyến đi" ? defaultTripColumns.map((column) => column.id) :
    tab === "Tài xế" ? defaultDriverColumns.map((column) => column.id) :
    tab === "Lộ trình" ? defaultRouteColumns.map((column) => column.id) :
    defaultOtpColumns.map((column) => column.id);

  const setColumnsActive = 
    tab === "Chuyến đi" ? setColumnsTrip : 
    tab === "Tài xế" ? setColumnsDriver : 
    tab === "Lộ trình" ? setColumnsRoute : setColumnsOtp;

  const [tableResizeMode, setTableResizeMode] = useState<"fit" | "custom">("fit");
  const [openTripForm, setOpenTripForm] = useState(false);
  const [openDriverForm, setOpenDriverForm] = useState(false);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [editingDriverId, setEditingDriverId] = useState<string | null>(null);

  const [tripForm, setTripForm] = useState<Record<string, string>>(emptyTripForm);
  const [driverForm, setDriverForm] = useState<Record<string, string>>(emptyDriverForm);

  const [openPageSizeMenu, setOpenPageSizeMenu] = useState(false);
  const [customPageSize, setCustomPageSize] = useState("");
  const [openAddColumn, setOpenAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

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
    return routePlans.filter((item) => {
      const source = `${item.id} ${item.route} ${item.driver} ${item.orders} ${item.status}`;
      const matchQuery = source.toLowerCase().includes(query.toLowerCase());
      const matchStatus = selectedRouteStatus === "Tất cả" || item.status === selectedRouteStatus;
      return matchQuery && matchStatus;
    });
  }, [routePlans, query, selectedRouteStatus]);

  const combinedOtpRows = useMemo<OtpRow[]>(() => {
    const maxLen = Math.max(otpsState.length, timeline.length);
    const result: OtpRow[] = [];
    for (let i = 0; i < maxLen; i++) {
      const otpItem = otpsState[i] || { order: "", type: "", otp: "", status: "" };
      const timelineItem = timeline[i] || { time: "", event: "" };
      result.push({
        id: otpItem.order || `otp-combined-${i}`,
        ...otpItem,
        ...timelineItem,
      });
    }
    return result;
  }, [otpsState, timeline]);

  const completedTrips = trips.filter((trip) => trip.status === "Đã lấy").length;
  const onTimeRate = trips.length > 0 ? Math.round((completedTrips / trips.length) * 100) : 0;
  const activeDrivers = drivers.filter((driver) => driver.status !== "Nghỉ").length;
  const optimizedRoutes = routePlans.filter((route) => route.status === "Đã tối ưu").length;

  const filteredOtpRows = useMemo(() => {
    return combinedOtpRows.filter((item) => {
      const source = `${item.order} ${item.type} ${item.otp} ${item.status} ${item.time} ${item.event}`;
      const matchQuery = source.toLowerCase().includes(query.toLowerCase());
      const matchStatus = selectedOtpStatus === "Tất cả" || item.status === selectedOtpStatus;
      return matchQuery && matchStatus;
    });
  }, [combinedOtpRows, query, selectedOtpStatus]);

  const activeRows =
    tab === "Chuyến đi"
      ? filteredTrips
      : tab === "Tài xế"
      ? filteredDrivers
      : tab === "Lộ trình"
      ? filteredRoutePlans
      : filteredOtpRows;

  const pageCount = Math.ceil(activeRows.length / pageSize);
  const paginatedTrips = filteredTrips.slice((page - 1) * pageSize, page * pageSize);
  const paginatedDrivers = filteredDrivers.slice((page - 1) * pageSize, page * pageSize);
  const paginatedRoutePlans = filteredRoutePlans.slice((page - 1) * pageSize, page * pageSize);
  const paginatedOtps = filteredOtpRows.slice((page - 1) * pageSize, page * pageSize);

  const activePaginatedRows = 
    tab === "Chuyến đi" ? paginatedTrips : 
    tab === "Tài xế" ? paginatedDrivers : 
    tab === "Lộ trình" ? paginatedRoutePlans : paginatedOtps;

  const totalVisibleWidth = activeColumns.filter(c => c.visible).reduce((sum, column) => sum + (column.width || 150), 0);

  const visibleTripIds = useMemo(() => paginatedTrips.map((trip) => trip.id), [paginatedTrips]);
  const kanbanTripIds = useMemo(() => filteredTrips.map((trip) => trip.id), [filteredTrips]);
  const selectedTrips = useMemo(() => trips.filter((trip) => selectedTripIds.has(trip.id)), [trips, selectedTripIds]);

  const allVisibleTripsSelected = visibleTripIds.length > 0 && visibleTripIds.every((id) => selectedTripIds.has(id));
  const allKanbanTripsSelected = kanbanTripIds.length > 0 && kanbanTripIds.every((id) => selectedTripIds.has(id));
  const selectedVisibleTripCount = visibleTripIds.filter((id) => selectedTripIds.has(id)).length;
  const selectedKanbanTripCount = kanbanTripIds.filter((id) => selectedTripIds.has(id)).length;

  const toggleVisibleTrips = () => {
    setSelectedTripIds((prev) => {
      const next = new Set(prev);
      if (allVisibleTripsSelected) {
        visibleTripIds.forEach((id) => next.delete(id));
      } else {
        visibleTripIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleKanbanTrips = () => {
    setSelectedTripIds((prev) => {
      const next = new Set(prev);
      if (allKanbanTripsSelected) {
        kanbanTripIds.forEach((id) => next.delete(id));
      } else {
        kanbanTripIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleTrip = (id: string) => {
    setSelectedTripIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const visibleDriverIds = useMemo(() => paginatedDrivers.map((driver) => driver.id), [paginatedDrivers]);
  const kanbanDriverIds = useMemo(() => filteredDrivers.map((driver) => driver.id), [filteredDrivers]);
  const selectedDrivers = useMemo(() => drivers.filter((driver) => selectedDriverIds.has(driver.id)), [drivers, selectedDriverIds]);

  const allVisibleDriversSelected = visibleDriverIds.length > 0 && visibleDriverIds.every((id) => selectedDriverIds.has(id));
  const allKanbanDriversSelected = kanbanDriverIds.length > 0 && kanbanDriverIds.every((id) => selectedDriverIds.has(id));
  const selectedVisibleDriverCount = visibleDriverIds.filter((id) => selectedDriverIds.has(id)).length;
  const selectedKanbanDriverCount = kanbanDriverIds.filter((id) => selectedDriverIds.has(id)).length;

  const toggleVisibleDrivers = () => {
    setSelectedDriverIds((prev) => {
      const next = new Set(prev);
      if (allVisibleDriversSelected) {
        visibleDriverIds.forEach((id) => next.delete(id));
      } else {
        visibleDriverIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleKanbanDrivers = () => {
    setSelectedDriverIds((prev) => {
      const next = new Set(prev);
      if (allKanbanDriversSelected) {
        kanbanDriverIds.forEach((id) => next.delete(id));
      } else {
        kanbanDriverIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleDriver = (id: string) => {
    setSelectedDriverIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const activeHistoryTrip = selectedTrips.find((t) => t.id === activeHistoryItemId) || selectedTrips[0] || null;
  const activeHistoryDriver = selectedDrivers.find((d) => d.id === activeHistoryItemId) || selectedDrivers[0] || null;

  /* ---- Kanban columns (state, so columns can be added/removed) ---- */
  const [tripKanbanColumns, setTripKanbanColumns] = useState<KanbanColumn[]>([
    { id: "Chờ lấy",  label: "Chờ lấy",  color: tripStatusColor["Chờ lấy"] },
    { id: "Đang giao", label: "Đang giao", color: tripStatusColor["Đang giao"] },
    { id: "Đã lấy",  label: "Đã lấy",  color: tripStatusColor["Đã lấy"] },
    { id: "Chờ giao", label: "Chờ giao", color: tripStatusColor["Chờ giao"] },
  ]);
  const [driverKanbanColumns, setDriverKanbanColumns] = useState<KanbanColumn[]>([
    { id: "Đang giao",    label: "Đang giao",    color: driverStatusColor["Đang giao"] },
    { id: "Rảnh 30 phút", label: "Rảnh 30 phút", color: driverStatusColor["Rảnh 30 phút"] },
    { id: "Đang lấy",    label: "Đang lấy",    color: driverStatusColor["Đang lấy"] },
    { id: "Nghỉ",        label: "Nghỉ",        color: driverStatusColor["Nghỉ"] },
  ]);
  const [routeKanbanColumns, setRouteKanbanColumns] = useState<KanbanColumn[]>([
    { id: "Sẵn sàng áp dụng", label: "Sẵn sàng áp dụng", color: routeStatusColor["Sẵn sàng áp dụng"] },
    { id: "Cần duyệt",        label: "Cần duyệt",        color: routeStatusColor["Cần duyệt"] },
    { id: "Đang theo dõi",   label: "Đang theo dõi",   color: routeStatusColor["Đang theo dõi"] },
  ]);
  const [otpKanbanColumns, setOtpKanbanColumns] = useState<KanbanColumn[]>([
    { id: "Đã xác nhận",        label: "Đã xác nhận",        color: otpStatusColor["Đã xác nhận"] },
    { id: "Chờ khách xác nhận", label: "Chờ khách xác nhận", color: otpStatusColor["Chờ khách xác nhận"] },
    { id: "Chưa gửi",          label: "Chưa gửi",          color: otpStatusColor["Chưa gửi"] },
  ]);

  const toggleRoute = (id: string) => setSelectedRouteIds(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
  const toggleOtp = (id: string) => setSelectedOtpIds(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });

  const visibleRouteIds = useMemo(() => paginatedRoutePlans.map((route) => route.id), [paginatedRoutePlans]);
  const kanbanRouteIds = useMemo(() => filteredRoutePlans.map((route) => route.id), [filteredRoutePlans]);
  const allVisibleRoutesSelected = visibleRouteIds.length > 0 && visibleRouteIds.every((id) => selectedRouteIds.has(id));
  const allKanbanRoutesSelected = kanbanRouteIds.length > 0 && kanbanRouteIds.every((id) => selectedRouteIds.has(id));
  const selectedVisibleRouteCount = visibleRouteIds.filter((id) => selectedRouteIds.has(id)).length;
  const selectedKanbanRouteCount = kanbanRouteIds.filter((id) => selectedRouteIds.has(id)).length;

  const toggleVisibleRoutes = () => {
    setSelectedRouteIds((prev) => {
      const next = new Set(prev);
      if (allVisibleRoutesSelected) {
        visibleRouteIds.forEach((id) => next.delete(id));
      } else {
        visibleRouteIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleKanbanRoutes = () => {
    setSelectedRouteIds((prev) => {
      const next = new Set(prev);
      if (allKanbanRoutesSelected) {
        kanbanRouteIds.forEach((id) => next.delete(id));
      } else {
        kanbanRouteIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const visibleOtpIds = useMemo(() => paginatedOtps.map((item) => item.id), [paginatedOtps]);
  const kanbanOtpIds = useMemo(() => filteredOtpRows.map((item) => item.id), [filteredOtpRows]);
  const allVisibleOtpsSelected = visibleOtpIds.length > 0 && visibleOtpIds.every((id) => selectedOtpIds.has(id));
  const allKanbanOtpsSelected = kanbanOtpIds.length > 0 && kanbanOtpIds.every((id) => selectedOtpIds.has(id));
  const selectedVisibleOtpCount = visibleOtpIds.filter((id) => selectedOtpIds.has(id)).length;
  const selectedKanbanOtpCount = kanbanOtpIds.filter((id) => selectedOtpIds.has(id)).length;

  const toggleVisibleOtps = () => {
    setSelectedOtpIds((prev) => {
      const next = new Set(prev);
      if (allVisibleOtpsSelected) {
        visibleOtpIds.forEach((id) => next.delete(id));
      } else {
        visibleOtpIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleKanbanOtps = () => {
    setSelectedOtpIds((prev) => {
      const next = new Set(prev);
      if (allKanbanOtpsSelected) {
        kanbanOtpIds.forEach((id) => next.delete(id));
      } else {
        kanbanOtpIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const selectedRoutes = useMemo(
    () => routePlans.filter((route) => selectedRouteIds.has(route.id)),
    [routePlans, selectedRouteIds]
  );

  const selectedOtps = useMemo(
    () => combinedOtpRows.filter((item) => selectedOtpIds.has(item.id)),
    [combinedOtpRows, selectedOtpIds]
  );

  const customColumnsTrip = useMemo(
    () => columnsTrip.filter((col) => !defaultTripColumns.some((dc) => dc.id === col.id)),
    [columnsTrip]
  );
  
  const customColumnsDriver = useMemo(
    () => columnsDriver.filter((col) => !defaultDriverColumns.some((dc) => dc.id === col.id)),
    [columnsDriver]
  );

  const orderedTripFormFields = useMemo<FormField[]>(() => {
    const fieldByColumnId: Record<string, FormField> = {
      time: { id: "time", label: "Giờ hẹn", type: "time" },
      type: { id: "type", label: "Loại chuyến", type: "select", options: ["Lấy đồ", "Trả đồ"], optionDotColors: tripTypeDotColors },
      customer: { id: "customer", label: "Tên khách", type: "text", placeholder: "Tên khách" },
      phone: { id: "phone", label: "Số điện thoại", type: "text", placeholder: "090..." },
      address: { id: "address", label: "Địa chỉ", type: "text", placeholder: "Địa chỉ giao/nhận hàng" },
      driver: { id: "driver", label: "Tài xế giao nhận", type: "text", placeholder: "Anh Minh / Chị Lan..." },
      status: { id: "status", label: "Trạng thái", type: "custom_status" },
      note: { id: "note", label: "Ghi chú", type: "textarea", placeholder: "Ghi chú đóng gói, thời gian đặc biệt..." },
    };

    const fields = columnsTrip
      .filter((column) => column.visible && column.id !== "id" && column.id !== "actions")
      .map((column) => {
        return fieldByColumnId[column.id] || {
          id: column.id,
          label: column.label,
          type: "text",
          placeholder: `Nhập ${column.label.toLowerCase()}`,
        } satisfies FormField;
      });
    return fields;
  }, [columnsTrip]);

  const openCreateTrip = () => {
    setEditingTripId(null);
    const customFieldsDefaults = Object.fromEntries(customColumnsTrip.map(col => [col.id, ""]));
    setTripForm({
      ...emptyTripForm,
      ...customFieldsDefaults,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    });
    setOpenTripForm(true);
  };

  const openEditTrip = (trip: Trip) => {
    setEditingTripId(trip.id);
    const customFieldsDefaults = Object.fromEntries(customColumnsTrip.map(col => [col.id, trip[col.id] || ""]));
    setTripForm({
      time: trip.time,
      type: trip.type,
      customer: trip.customer,
      address: trip.address,
      driver: trip.driver,
      status: trip.status,
      note: trip.note,
      phone: trip.phone,
      ...customFieldsDefaults,
    });
    setOpenTripForm(true);
  };

  const saveTrip = () => {
    if (!tripForm.customer.trim() || !tripForm.address.trim()) return;
    const payload: Omit<Trip, "id" | "avatar"> = {
      time: tripForm.time,
      type: tripForm.type as "Lấy đồ" | "Trả đồ",
      customer: tripForm.customer,
      address: tripForm.address,
      driver: tripForm.driver,
      status: tripForm.status as TripStatus,
      note: tripForm.note || "Không có",
      phone: tripForm.phone || "090...",
      ...Object.fromEntries(customColumnsTrip.map(col => [col.id, tripForm[col.id] || ""]))
    };

    if (editingTripId) {
      setTrips((prev) =>
        prev.map((item) => item.id === editingTripId ? { ...item, ...payload, updatedAt: new Date().toLocaleString("vi-VN") } : item)
      );
    } else {
      const newId = `CY-${Date.now().toString().slice(-3)}`;
      setTrips((prev) => [
        {
          id: newId,
          avatar: "",
          ...payload,
          createdAt: new Date().toLocaleString("vi-VN"),
          updatedAt: new Date().toLocaleString("vi-VN"),
        } as Trip,
        ...prev,
      ]);
    }
    setPage(1);
    setOpenTripForm(false);
  };

  const openCreateDriver = () => {
    setEditingDriverId(null);
    const customFieldsDefaults = Object.fromEntries(customColumnsDriver.map(col => [col.id, ""]));
    setDriverForm({ ...emptyDriverForm, ...customFieldsDefaults });
    setOpenDriverForm(true);
  };

  const openEditDriver = (d: Driver) => {
    setEditingDriverId(d.id);
    const customFieldsDefaults = Object.fromEntries(customColumnsDriver.map(col => [col.id, d[col.id] || ""]));
    setDriverForm({
      name: d.name,
      phone: d.phone,
      rating: d.rating,
      load: d.load,
      status: d.status,
      note: d.note,
      ...customFieldsDefaults,
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
      status: driverForm.status as DriverStatus,
      note: driverForm.note || "Không có",
      ...Object.fromEntries(customColumnsDriver.map(col => [col.id, driverForm[col.id] || ""]))
    };

    if (editingDriverId) {
      setDrivers((prev) =>
        prev.map((item) => item.id === editingDriverId ? { ...item, ...payload, updatedAt: new Date().toLocaleString("vi-VN") } : item)
      );
    } else {
      const newId = `TX-${Date.now().toString().slice(-3)}`;
      setDrivers((prev) => [
        {
          id: newId,
          avatar: "",
          ...payload,
          createdAt: new Date().toLocaleString("vi-VN"),
          updatedAt: new Date().toLocaleString("vi-VN"),
        } as Driver,
        ...prev,
      ]);
    }
    setPage(1);
    setOpenDriverForm(false);
  };

  const getDefaultExportFileName = () => {
    const scope = 
      tab === "Chuyến đi" ? "chuyen-di" : 
      tab === "Tài xế" ? "tai-xe" : 
      tab === "Lộ trình" ? "lo-trinh" : "otp";
    return `${scope}-${new Date().toISOString().slice(0, 10)}`;
  };

  const handleExport = (format: "pdf" | "excel" | "csv", fileName: string) => {
    const rows = tab === "OTP & Nhật ký" ? filteredOtpRows : activeRows;
    if (rows.length === 0) return;
    const baseFileName = fileName || getDefaultExportFileName();
    const headers = activeColumns.filter(c => c.id !== "actions" && c.visible).map(c => c.label);
    
    if (format === "csv") {
      const csvData = rows.map(row => 
        activeColumns.filter(c => c.id !== "actions" && c.visible).map(c => {
          const val = (row as any)[c.id] ?? "";
          return `"${String(val).replace(/"/g, '""')}"`;
        }).join(",")
      );
      const csvContent = "\uFEFF" + [headers.join(","), ...csvData].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${baseFileName}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "excel") {
      const tableHead = headers.map(h => `<th>${h}</th>`).join("");
      const tableBody = rows.map(row => 
        `<tr>${activeColumns.filter(c => c.id !== "actions" && c.visible).map(c => `<td>${(row as any)[c.id] ?? ""}</td>`).join("")}</tr>`
      ).join("");
      const excelContent = `
        <html>
          <head><meta charset="utf-8" /></head>
          <body>
            <table border="1">
              <thead><tr>${tableHead}</tr></thead>
              <tbody>${tableBody}</tbody>
            </table>
          </body>
        </html>
      `;
      const blob = new Blob([excelContent], { type: "application/vnd.ms-excel" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${baseFileName}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;
      const tableHead = headers.map(h => `<th>${h}</th>`).join("");
      const tableBody = rows.map(row => 
        `<tr>${activeColumns.filter(c => c.id !== "actions" && c.visible).map(c => `<td>${(row as any)[c.id] ?? ""}</td>`).join("")}</tr>`
      ).join("");
      printWindow.document.write(`
        <html>
          <head>
            <style>
              table { width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 12px; }
              th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
              th { background-color: #f1f5f9; }
            </style>
          </head>
          <body>
            <h2>Danh sách ${tab}</h2>
            <table>
              <thead><tr>${tableHead}</tr></thead>
              <tbody>${tableBody}</tbody>
            </table>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const addCustomColumn = () => {
    const label = newColumnName.trim();
    if (!label) return;
    const newColumn = {
      id: `custom_${Date.now()}`,
      label,
      width: 150,
      visible: true,
    };
    setColumnsActive((prev: any) => {
      const next = [...prev];
      const actionIndex = next.findIndex((c) => c.id === "actions");
      next.splice(actionIndex === -1 ? next.length : actionIndex, 0, newColumn);
      return next;
    });
    setNewColumnName("");
    setOpenAddColumn(false);
  };

  const handleColumnDragStart = (event: DragEvent<HTMLTableCellElement>, id: string) => {
    setDraggedColumnId(id);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleColumnDragOver = (event: DragEvent<HTMLTableCellElement>, id: string) => {
    event.preventDefault();
    if (id !== draggedColumnId) setDragOverColumnId(id);
  };

  const handleColumnDragLeave = () => setDragOverColumnId(null);

  const handleColumnDrop = (event: DragEvent<HTMLTableCellElement>, id: string) => {
    event.preventDefault();
    if (!draggedColumnId || draggedColumnId === id) {
      setDragOverColumnId(null);
      return;
    }

    setColumnsActive((prev: any) => {
      const draggedIndex = prev.findIndex((column: any) => column.id === draggedColumnId);
      const dropIndex = prev.findIndex((column: any) => column.id === id);
      if (draggedIndex === -1 || dropIndex === -1) return prev;

      const next = [...prev];
      const [draggedColumn] = next.splice(draggedIndex, 1);
      next.splice(dropIndex, 0, draggedColumn);
      return next;
    });

    setDraggedColumnId(null);
    setDragOverColumnId(null);
  };

  const handleColumnDragEnd = () => {
    setDraggedColumnId(null);
    setDragOverColumnId(null);
  };

  const renderTripCell = (trip: Trip, column: any) => {
    if (column.id === "id") return (
      <TableCell key={column.id} className="pl-4 font-medium text-slate-900">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            aria-label={`Chọn chuyến ${trip.id}`}
            checked={selectedTripIds.has(trip.id)}
            onChange={() => toggleTrip(trip.id)}
            className={`shrink-0 ${checkboxClass}`}
          />
          <span>{trip.id}</span>
        </div>
      </TableCell>
    );
    if (column.id === "type") {
      return (
        <TableCell key={column.id}>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${trip.type === "Lấy đồ" ? "border-blue-100 bg-blue-50 text-blue-700" : "border-emerald-100 bg-emerald-50 text-emerald-700"}`}>
            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: tripTypeDotColors[trip.type] }} />
            {trip.type}
          </span>
        </TableCell>
      );
    }
    if (column.id === "customer") {
      return (
        <TableCell key={column.id}>
          <div className="flex min-w-0 items-center gap-2">
            <Image src={trip.avatar} alt={trip.customer} width={24} height={24} className="size-6 shrink-0 rounded-full object-cover" />
            <span className="whitespace-nowrap font-medium text-slate-900">{trip.customer}</span>
          </div>
        </TableCell>
      );
    }
    if (column.id === "phone") {
      return (
        <TableCell key={column.id}>
          <a href={`tel:${trip.phone}`} className="text-slate-500 hover:text-slate-800">
            {trip.phone}
          </a>
        </TableCell>
      );
    }
    if (column.id === "driver") return <TableCell key={column.id}><div className="flex items-center gap-1.5"><div className="size-1.5 shrink-0 rounded-full bg-indigo-500" /><span className="font-semibold text-slate-700">{trip.driver}</span></div></TableCell>;
    if (column.id === "status") {
      const color = tripStatusColor[trip.status] || { text: "#64748b", bg: "rgba(100,116,139,0.1)" };
      return (
        <TableCell key={column.id}>
          <span className="inline-flex max-w-full items-center gap-1.5 truncate rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium" style={{ color: color.text, backgroundColor: color.bg }}>
            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color.text }} />
            {trip.status}
          </span>
        </TableCell>
      );
    }
    if (column.id === "note") return <TableCell key={column.id} className="truncate text-slate-500" title={trip.note}>{trip.note}</TableCell>;
    if (column.id === "actions") {
      return (
        <TableCell key={column.id} className="px-4">
          <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50" onClick={() => openEditTrip(trip)}>
            <Pencil className="size-3.5" />
            Sửa
          </button>
        </TableCell>
      );
    }
    const customValue = trip[column.id];
    return <TableCell key={column.id} className={customValue ? "text-slate-600" : "text-slate-400 italic"}>{customValue || "Chưa có"}</TableCell>;
  };

  const renderDriverCell = (driver: Driver, column: any) => {
    if (column.id === "id") return (
      <TableCell key={column.id} className="pl-4 font-semibold text-slate-900">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            aria-label={`Chọn tài xế ${driver.id}`}
            checked={selectedDriverIds.has(driver.id)}
            onChange={() => toggleDriver(driver.id)}
            className={`shrink-0 ${checkboxClass}`}
          />
          <span>{driver.id}</span>
        </div>
      </TableCell>
    );
    if (column.id === "name") {
      return (
        <TableCell key={column.id}>
          <div className="flex min-w-0 items-center gap-2">
            <Image src={driver.avatar} alt={driver.name} width={24} height={24} className="size-6 shrink-0 rounded-full object-cover" />
            <span className="whitespace-nowrap font-medium text-slate-900">{driver.name}</span>
          </div>
        </TableCell>
      );
    }
    if (column.id === "phone") {
      return (
        <TableCell key={column.id}>
          <a href={`tel:${driver.phone}`} className="text-slate-500 hover:text-slate-800">
            {driver.phone}
          </a>
        </TableCell>
      );
    }
    if (column.id === "status") {
      const color = driverStatusColor[driver.status] || { text: "#64748b", bg: "rgba(100,116,139,0.1)" };
      return (
        <TableCell key={column.id}>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium" style={{ color: color.text, backgroundColor: color.bg }}>
            <span className="size-1.5 rounded-full" style={{ backgroundColor: color.text }} />
            {driver.status}
          </span>
        </TableCell>
      );
    }
    if (column.id === "note") return <TableCell key={column.id} className="truncate text-slate-500" title={driver.note}>{driver.note}</TableCell>;
    if (column.id === "actions") {
      return (
        <TableCell key={column.id} className="px-4">
          <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50" onClick={() => openEditDriver(driver)}>
            <Pencil className="size-3.5" />
            Sửa
          </button>
        </TableCell>
      );
    }
    const customValue = driver[column.id];
    return <TableCell key={column.id} className={customValue ? "text-slate-600" : "text-slate-400 italic"}>{customValue || "Chưa có"}</TableCell>;
  };

  const renderRouteCell = (item: RoutePlan, column: any) => {
    if (column.id === "id") return (
      <TableCell key={column.id} className="pl-4 font-medium text-slate-900">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            aria-label={`Chọn lộ trình ${item.id}`}
            checked={selectedRouteIds.has(item.id)}
            onChange={() => toggleRoute(item.id)}
            className={`shrink-0 ${checkboxClass}`}
          />
          <span>{item.id}</span>
        </div>
      </TableCell>
    );
    if (column.id === "route") return <TableCell key={column.id} className="font-medium text-slate-900">{item.route}</TableCell>;
    if (column.id === "status") {
      return (
        <TableCell key={column.id}>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium text-blue-700" style={{ backgroundColor: "rgba(37,99,235,0.08)" }}>
            <span className="size-1.5 rounded-full bg-blue-600" />
            {item.status}
          </span>
        </TableCell>
      );
    }
    if (column.id === "actions") {
      return (
        <TableCell key={column.id} className="px-4">
          <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50">
            <Zap className="size-3.5" />
            Áp dụng
          </button>
        </TableCell>
      );
    }
    return <TableCell key={column.id} className="text-slate-600">{String(item[column.id as keyof typeof item] ?? "")}</TableCell>;
  };

  const renderOtpCell = (item: any, column: any) => {
    if (column.id === "order") return (
      <TableCell key={column.id} className="pl-4 font-medium text-slate-900">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            aria-label={`Chọn OTP ${item.order || item.id}`}
            checked={selectedOtpIds.has(item.id)}
            onChange={() => toggleOtp(item.id)}
            className={`shrink-0 ${checkboxClass}`}
          />
          <span>{item.order || "-"}</span>
        </div>
      </TableCell>
    );
    if (column.id === "otp") return <TableCell key={column.id} className="font-mono font-semibold text-slate-900">{item.otp || "-"}</TableCell>;
    if (column.id === "status") {
      if (!item.status) return <TableCell key={column.id}>-</TableCell>;
      return (
        <TableCell key={column.id}>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium text-slate-700">
            <span className="size-1.5 rounded-full bg-slate-500" />
            {item.status}
          </span>
        </TableCell>
      );
    }
    if (column.id === "time") return <TableCell key={column.id} className="font-semibold text-slate-900">{item.time || "-"}</TableCell>;
    if (column.id === "event") return <TableCell key={column.id} className="text-slate-600">{item.event || "-"}</TableCell>;
    return <TableCell key={column.id}>{String(item[column.id as keyof typeof item] ?? "")}</TableCell>;
  };

  const renderTripKanbanCard = (trip: Trip) => {
    return (
      <div
        key={trip.id}
        draggable
        onDragStart={(event) => {
          setDraggedTripId(trip.id);
          event.dataTransfer.effectAllowed = "move";
        }}
        onDragEnd={() => {
          setDraggedTripId(null);
          setDragOverTripStatus(null);
        }}
        className={`cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-slate-300 hover:shadow-md active:cursor-grabbing ${draggedTripId === trip.id ? "opacity-50 ring-2 ring-slate-400" : ""}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <input
              type="checkbox"
              aria-label={`Chọn ${trip.id}`}
              checked={selectedTripIds.has(trip.id)}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              onChange={() => toggleTrip(trip.id)}
              className={`shrink-0 ${checkboxClass}`}
            />
            <Image
              src={trip.avatar}
              alt={trip.customer}
              width={32}
              height={32}
              className="size-8 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-700">{trip.customer}</p>
              <p className="truncate text-[11px] text-slate-400">{trip.phone}</p>
            </div>
          </div>
          <span className="shrink-0 text-[11px] font-semibold text-slate-400">{trip.id}</span>
        </div>
        <p className="mt-2 text-xs text-slate-500 font-medium">Loại: {trip.type} · Hẹn: {trip.time}</p>
        <p className="mt-1 truncate text-xs text-slate-500">Tài xế: {trip.driver}</p>
        <p className="mt-1 line-clamp-2 text-xs text-slate-400">{trip.note}</p>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
          <span className="truncate text-[10px] text-slate-400">{trip.address}</span>
          <button
            type="button"
            onClick={() => openEditTrip(trip)}
            className="inline-flex h-6 items-center rounded-md bg-slate-100 px-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
          >
            Chi tiết
          </button>
        </div>
      </div>
    );
  };

  const renderDriverKanbanCard = (driver: Driver) => {
    return (
      <div
        key={driver.id}
        draggable
        onDragStart={(event) => {
          setDraggedDriverId(driver.id);
          event.dataTransfer.effectAllowed = "move";
        }}
        onDragEnd={() => {
          setDraggedDriverId(null);
          setDragOverDriverStatus(null);
        }}
        className={`cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-slate-300 hover:shadow-md active:cursor-grabbing ${draggedDriverId === driver.id ? "opacity-50 ring-2 ring-slate-400" : ""}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <input
              type="checkbox"
              aria-label={`Chọn ${driver.name}`}
              checked={selectedDriverIds.has(driver.id)}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              onChange={() => toggleDriver(driver.id)}
              className={`shrink-0 ${checkboxClass}`}
            />
            <Image
              src={driver.avatar}
              alt={driver.name}
              width={32}
              height={32}
              className="size-8 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-700">{driver.name}</p>
              <p className="truncate text-[11px] text-slate-400">{driver.phone}</p>
            </div>
          </div>
          <span className="shrink-0 text-[11px] font-semibold text-slate-400">{driver.id}</span>
        </div>
        <p className="mt-2 text-xs text-slate-500 font-medium">Tải việc: {driver.load}</p>
        <p className="mt-1 text-xs text-slate-500">Đánh giá: {driver.rating}</p>
        <p className="mt-1 line-clamp-2 text-xs text-slate-400">{driver.note}</p>
        <div className="mt-3 flex justify-end border-t border-slate-100 pt-2">
          <button
            type="button"
            onClick={() => openEditDriver(driver)}
            className="inline-flex h-6 items-center rounded-md bg-slate-100 px-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
          >
            Chi tiết
          </button>
        </div>
      </div>
    );
  };

  const renderTripListRow = (trip: Trip) => {
    return (
      <div key={trip.id} className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <input
              type="checkbox"
              aria-label={`Chọn ${trip.id}`}
              checked={selectedTripIds.has(trip.id)}
              onChange={() => toggleTrip(trip.id)}
              className={`mt-1 shrink-0 ${checkboxClass}`}
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Image src={trip.avatar} alt={trip.customer} width={24} height={24} className="size-6 rounded-full object-cover" />
                <p className="font-semibold text-slate-950">{trip.customer}</p>
                <span className="text-xs font-medium text-slate-400">{trip.id}</span>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${trip.type === "Lấy đồ" ? "border-blue-100 bg-blue-50 text-blue-700" : "border-emerald-100 bg-emerald-50 text-emerald-700"}`}>{trip.type}</span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium"
                  style={{
                    color: (tripStatusColor[trip.status] || { text: "#64748b" }).text,
                    backgroundColor: (tripStatusColor[trip.status] || { bg: "rgba(100,116,139,0.1)" }).bg,
                  }}
                >
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: (tripStatusColor[trip.status] || { text: "#64748b" }).text }} />
                  {trip.status}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>Số điện thoại: {trip.phone}</span>
                <span>Hẹn giờ: {trip.time}</span>
                <span>Tài xế phụ trách: {trip.driver}</span>
                <span>Địa chỉ: {trip.address}</span>
              </div>
              <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">{trip.note}</p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-slate-50"
              onClick={() => openEditTrip(trip)}
            >
              <Pencil className="size-3.5" />
              Sửa
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDriverListRow = (driver: Driver) => {
    return (
      <div key={driver.id} className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <input
              type="checkbox"
              aria-label={`Chọn ${driver.name}`}
              checked={selectedDriverIds.has(driver.id)}
              onChange={() => toggleDriver(driver.id)}
              className={`mt-1 shrink-0 ${checkboxClass}`}
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Image src={driver.avatar} alt={driver.name} width={24} height={24} className="size-6 rounded-full object-cover" />
                <p className="font-semibold text-slate-950">{driver.name}</p>
                <span className="text-xs font-medium text-slate-400">{driver.id}</span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium"
                  style={{
                    color: (driverStatusColor[driver.status] || { text: "#64748b" }).text,
                    backgroundColor: (driverStatusColor[driver.status] || { bg: "rgba(100,116,139,0.1)" }).bg,
                  }}
                >
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: (driverStatusColor[driver.status] || { text: "#64748b" }).text }} />
                  {driver.status}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>Số điện thoại: {driver.phone}</span>
                <span>Đánh giá: {driver.rating}</span>
                <span>Tải việc: {driver.load}</span>
              </div>
              <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">{driver.note}</p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-slate-50"
              onClick={() => openEditDriver(driver)}
            >
              <Pencil className="size-3.5" />
              Sửa
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderRouteKanbanCard = (route: any) => (
    <div
      key={route.id}
      draggable
      onDragStart={(e) => { setDraggedRouteId(route.id); e.dataTransfer.effectAllowed = "move"; }}
      onDragEnd={() => { setDraggedRouteId(null); setDragOverRouteStatus(null); }}
      className={`cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-slate-300 hover:shadow-md active:cursor-grabbing ${draggedRouteId === route.id ? "opacity-50 ring-2 ring-slate-400" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <input type="checkbox" aria-label={`Chọn ${route.id}`} checked={selectedRouteIds.has(route.id)}
            onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}
            onChange={() => toggleRoute(route.id)} className={`shrink-0 ${checkboxClass}`} />
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 ring-2 ring-white shadow-sm">
            <MapPin className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-700">{route.driver}</p>
            <p className="truncate text-[11px] text-slate-400">{route.id}</p>
          </div>
        </div>
        <span className="shrink-0 text-[11px] font-semibold text-slate-400">{route.eta}</span>
      </div>
      <p className="mt-2 truncate text-xs text-slate-500 font-medium">{route.route}</p>
      <p className="mt-1 truncate text-xs text-slate-400">Đơn: {route.orders}</p>
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
        <span className="text-[11px] text-emerald-600 font-medium">{route.saving}</span>
        <button
          type="button"
          className="inline-flex h-6 items-center rounded-md bg-slate-100 px-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
        >
          Áp dụng
        </button>
      </div>
    </div>
  );

  const renderOtpKanbanCard = (item: any) => (
    <div
      key={item.id}
      draggable
      onDragStart={(e) => { setDraggedOtpId(item.id); e.dataTransfer.effectAllowed = "move"; }}
      onDragEnd={() => { setDraggedOtpId(null); setDragOverOtpStatus(null); }}
      className={`flex h-[168px] cursor-grab flex-col rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-slate-300 hover:shadow-md active:cursor-grabbing ${draggedOtpId === item.id ? "opacity-50 ring-2 ring-slate-400" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <input type="checkbox" aria-label={`Chọn ${item.id}`} checked={selectedOtpIds.has(item.id)}
            onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}
            onChange={() => toggleOtp(item.id)} className={`shrink-0 ${checkboxClass}`} />
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 ring-2 ring-white shadow-sm">
            <ShieldCheck className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-700">{item.order || item.id}</p>
            <p className="truncate text-[11px] text-slate-400">{item.type}</p>
          </div>
        </div>
        <span className="font-mono text-sm font-bold text-indigo-600">{item.otp}</span>
      </div>
      <p className="mt-3 line-clamp-3 min-h-[48px] text-xs leading-4 text-slate-500">{item.event || ""}</p>
      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-2">
        <span className="text-[11px] text-slate-400">{item.time || ""}</span>
        <button
          type="button"
          className="inline-flex h-6 items-center rounded-md bg-slate-100 px-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
        >
          Chi tiết
        </button>
      </div>
    </div>
  );

  const renderRouteListRow = (route: any) => (
    <div key={route.id} className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <input type="checkbox" aria-label={`Chọn ${route.id}`} checked={selectedRouteIds.has(route.id)}
            onChange={() => toggleRoute(route.id)} className={`mt-1 shrink-0 ${checkboxClass}`} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-slate-950">{route.route}</p>
              <span className="text-xs font-medium text-slate-400">{route.id}</span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium text-blue-700" style={{ backgroundColor: "rgba(37,99,235,0.08)" }}>
                <span className="size-1.5 rounded-full bg-blue-600" />{route.status}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>Tài xế: {route.driver}</span>
              <span>ETA: {route.eta}</span>
              <span>Tiết kiệm: {route.saving}</span>
              <span>Đơn liên quan: {route.orders}</span>
            </div>
          </div>
        </div>
        <button type="button" className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-slate-50">
          <Zap className="size-3.5" />Áp dụng
        </button>
      </div>
    </div>
  );

  const renderOtpListRow = (item: any) => (
    <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <input type="checkbox" aria-label={`Chọn ${item.id}`} checked={selectedOtpIds.has(item.id)}
            onChange={() => toggleOtp(item.id)} className={`mt-1 shrink-0 ${checkboxClass}`} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-slate-950">{item.order || item.id}</p>
              <span className="text-xs font-medium text-slate-400">{item.type}</span>
              {item.status && (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium text-slate-700">
                  <span className="size-1.5 rounded-full bg-slate-500" />{item.status}
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              {item.otp && <span>Mã OTP: <span className="font-mono font-bold text-slate-900">{item.otp}</span></span>}
              {item.time && <span>Thời gian: {item.time}</span>}
            </div>
            {item.event && <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">{item.event}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCell = (row: any, column: any) => {
    if (tab === "Chuyến đi") return renderTripCell(row as Trip, column);
    if (tab === "Tài xế") return renderDriverCell(row as Driver, column);
    if (tab === "Lộ trình") return renderRouteCell(row as RoutePlan, column);
    return renderOtpCell(row, column);
  };

  const leftContent = (
    <div className="flex flex-wrap items-center gap-1">
      {([
        ["Chuyến đi",    Truck],
        ["Tài xế",       Users],
        ["Lộ trình",    MapPin],
        ["OTP & Nhật ký", ShieldCheck],
      ] as const).map(([item, Icon]) => (
        <button
          key={item}
          type="button"
          onClick={() => { setTab(item); setPage(1); setQuery(""); }}
          className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors ${
            tab === item ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Icon className="size-3.5" />
          {item}
        </button>
      ))}
      <span className="mx-2 hidden h-4 w-px bg-slate-200 sm:block" />
      <ViewModeTabs value={viewMode} onChange={setViewMode} />
    </div>
  );

  const filterOptions = useMemo<FilterOption[]>(() => {
    if (tab === "Chuyến đi") return [
      { id: "Tất cả",    label: "Tất cả",    color: "#64748b", bgColor: "rgba(100,116,139,0.09)" },
      { id: "Đã lấy",   label: "Đã lấy",   color: "#059669", bgColor: "rgba(5,150,105,0.09)" },
      { id: "Đang giao", label: "Đang giao", color: "#2563eb", bgColor: "rgba(37,99,235,0.09)" },
      { id: "Chờ lấy",  label: "Chờ lấy",  color: "#d97706", bgColor: "rgba(217,119,6,0.09)" },
      { id: "Chờ giao", label: "Chờ giao", color: "#7c3aed", bgColor: "rgba(124,58,237,0.09)" },
    ];
    if (tab === "Tài xế") return [
      { id: "Tất cả",       label: "Tất cả",       color: "#64748b", bgColor: "rgba(100,116,139,0.09)" },
      { id: "Đang giao",    label: "Đang giao",    color: "#2563eb", bgColor: "rgba(37,99,235,0.09)" },
      { id: "Rảnh 30 phút", label: "Rảnh 30 phút", color: "#059669", bgColor: "rgba(5,150,105,0.09)" },
      { id: "Đang lấy",    label: "Đang lấy",    color: "#d97706", bgColor: "rgba(217,119,6,0.09)" },
      { id: "Nghỉ",        label: "Nghỉ",        color: "#64748b", bgColor: "rgba(100,116,139,0.1)" },
    ];
    if (tab === "Lộ trình") return [
      { id: "Tất cả",             label: "Tất cả",             color: "#64748b", bgColor: "rgba(100,116,139,0.09)" },
      { id: "Sẵn sàng áp dụng", label: "Sẵn sàng áp dụng", color: "#2563eb", bgColor: "rgba(37,99,235,0.09)" },
      { id: "Cần duyệt",        label: "Cần duyệt",        color: "#d97706", bgColor: "rgba(217,119,6,0.09)" },
      { id: "Đang theo dõi",   label: "Đang theo dõi",   color: "#64748b", bgColor: "rgba(100,116,139,0.1)" },
    ];
    return [
      { id: "Tất cả",           label: "Tất cả",           color: "#64748b", bgColor: "rgba(100,116,139,0.09)" },
      { id: "Đã xác nhận",      label: "Đã xác nhận",      color: "#059669", bgColor: "rgba(5,150,105,0.09)" },
      { id: "Chờ khách xác nhận", label: "Chờ khách xác nhận", color: "#7c3aed", bgColor: "rgba(124,58,237,0.09)" },
      { id: "Chưa gửi",        label: "Chưa gửi",        color: "#64748b", bgColor: "rgba(100,116,139,0.1)" },
    ];
  }, [tab]);

  return (
    <PageShell fullHeight>
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
          <div className="grid shrink-0 gap-3 md:grid-cols-4">
            <MetricCard title="Chuyến hôm nay" value={`${trips.length} chuyến`} hint={`${trips.filter((trip) => trip.type === "Lấy đồ").length} chuyến lấy · ${trips.filter((trip) => trip.type === "Trả đồ").length} chuyến trả`} icon={Truck} color="#2563eb" />
            <MetricCard title="Đúng hẹn" value={`${onTimeRate}%`} hint={trips.length > 0 ? `${trips.length - completedTrips} chuyến chưa hoàn tất` : "Chưa có dữ liệu chuyến"} icon={Clock} color="#059669" />
            <MetricCard title="Tài xế hoạt động" value={`${activeDrivers}/${drivers.length} tài xế`} hint={drivers.length > 0 ? `${drivers.length - activeDrivers} tài xế nghỉ` : "Chưa có dữ liệu tài xế"} icon={Users} color="#7c3aed" />
            <MetricCard title="Tối ưu lộ trình" value={`${optimizedRoutes}/${routePlans.length}`} hint={routePlans.length > 0 ? "Lộ trình đã tối ưu" : "Chưa có dữ liệu lộ trình"} icon={TrendingUp} color="#f59e0b" />
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
            <Toolbar
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              leftContent={leftContent}
              query={query}
              onQueryChange={(q) => { setQuery(q); setPage(1); }}
              columns={activeColumns}
              onColumnsChange={setColumnsActive}
              tableResizeMode={tableResizeMode}
              onTableResizeModeChange={setTableResizeMode}
              selectedCount={
                tab === "Chuyến đi" ? selectedTripIds.size :
                tab === "Tài xế" ? selectedDriverIds.size :
                tab === "Lộ trình" ? selectedRouteIds.size :
                selectedOtpIds.size
              }
              onOpenAddColumn={() => setOpenAddColumn(true)}
              onOpenHistory={() => {
                if (tab === "Chuyến đi") setActiveHistoryItemId(selectedTrips[0]?.id || null);
                else if (tab === "Tài xế") setActiveHistoryItemId(selectedDrivers[0]?.id || null);
                else if (tab === "Lộ trình") setActiveHistoryItemId(selectedRoutes[0]?.id || null);
                else setActiveHistoryItemId(selectedOtps[0]?.id || null);
                setOpenHistory(true);
              }}
              onExport={handleExport}
              defaultExportFileName={getDefaultExportFileName()}
              onCreateClick={
                tab === "Chuyến đi" ? openCreateTrip :
                tab === "Tài xế" ? openCreateDriver : undefined
              }
              createLabel={
                tab === "Chuyến đi" ? "Thêm chuyến" : "Thêm tài xế"
              }
              defaultColumnIds={activeDefaultColumnIds}
              searchPlaceholder={
                tab === "Chuyến đi" ? "Tìm chuyến, khách, tài xế..." :
                tab === "Tài xế" ? "Tìm tên, SĐT tài xế..." :
                tab === "Lộ trình" ? "Tìm tuyến, tài xế, mã đơn..." : "Tìm OTP, mã đơn, sự kiện..."
              }
              showHistoryButton={true}
            />

            <FilterBar
              rangeLabel={rangeLabel}
              selectedValue={
                tab === "Chuyến đi" ? selectedTripStatus :
                tab === "Tài xế" ? selectedDriverStatus :
                tab === "Lộ trình" ? selectedRouteStatus :
                selectedOtpStatus
              }
              onValueChange={(val) => {
                if (tab === "Chuyến đi") setSelectedTripStatus(val);
                else if (tab === "Tài xế") setSelectedDriverStatus(val);
                else if (tab === "Lộ trình") setSelectedRouteStatus(val);
                else setSelectedOtpStatus(val);
                setPage(1);
              }}
              filterOptions={filterOptions}
              filterLabel="Lọc trạng thái"
              allSelected={
                tab === "Chuyến đi" ? (viewMode === "Bảng kéo" ? allKanbanTripsSelected : allVisibleTripsSelected) :
                tab === "Tài xế" ? (viewMode === "Bảng kéo" ? allKanbanDriversSelected : allVisibleDriversSelected) :
                tab === "Lộ trình" ? (viewMode === "Bảng kéo" ? allKanbanRoutesSelected : allVisibleRoutesSelected) :
                (viewMode === "Bảng kéo" ? allKanbanOtpsSelected : allVisibleOtpsSelected)
              }
              disabled={
                tab === "Chuyến đi" ? (viewMode === "Bảng kéo" ? kanbanTripIds.length === 0 : visibleTripIds.length === 0) :
                tab === "Tài xế" ? (viewMode === "Bảng kéo" ? kanbanDriverIds.length === 0 : visibleDriverIds.length === 0) :
                tab === "Lộ trình" ? (viewMode === "Bảng kéo" ? kanbanRouteIds.length === 0 : visibleRouteIds.length === 0) :
                (viewMode === "Bảng kéo" ? kanbanOtpIds.length === 0 : visibleOtpIds.length === 0)
              }
              selectedCount={
                tab === "Chuyến đi" ? (viewMode === "Bảng kéo" ? selectedKanbanTripCount : selectedVisibleTripCount) :
                tab === "Tài xế" ? (viewMode === "Bảng kéo" ? selectedKanbanDriverCount : selectedVisibleDriverCount) :
                tab === "Lộ trình" ? (viewMode === "Bảng kéo" ? selectedKanbanRouteCount : selectedVisibleRouteCount) :
                (viewMode === "Bảng kéo" ? selectedKanbanOtpCount : selectedVisibleOtpCount)
              }
              totalCount={
                tab === "Chuyến đi" ? (viewMode === "Bảng kéo" ? kanbanTripIds.length : visibleTripIds.length) :
                tab === "Tài xế" ? (viewMode === "Bảng kéo" ? kanbanDriverIds.length : visibleDriverIds.length) :
                tab === "Lộ trình" ? (viewMode === "Bảng kéo" ? kanbanRouteIds.length : visibleRouteIds.length) :
                (viewMode === "Bảng kéo" ? kanbanOtpIds.length : visibleOtpIds.length)
              }
              itemLabel={
                tab === "Chuyến đi" ? "chuyến đi" :
                tab === "Tài xế" ? "tài xế" :
                tab === "Lộ trình" ? "lộ trình" : "OTP & nhật ký"
              }
              checkboxClass={checkboxClass}
              onToggleAll={
                tab === "Chuyến đi" ? (viewMode === "Bảng kéo" ? toggleKanbanTrips : toggleVisibleTrips) :
                tab === "Tài xế" ? (viewMode === "Bảng kéo" ? toggleKanbanDrivers : toggleVisibleDrivers) :
                tab === "Lộ trình" ? (viewMode === "Bảng kéo" ? toggleKanbanRoutes : toggleVisibleRoutes) :
                (viewMode === "Bảng kéo" ? toggleKanbanOtps : toggleVisibleOtps)
              }
              showSelectionBar={true}
            />

            {viewMode === "Bảng kéo" ? (
              tab === "Chuyến đi" ? (
                <KanbanView
                  columns={tripKanbanColumns}
                  rows={filteredTrips}
                  groupByKey="status"
                  draggedItemId={draggedTripId}
                  onDraggedItemIdChange={setDraggedTripId}
                  dragOverColumnId={dragOverTripStatus}
                  onDragOverColumnIdChange={setDragOverTripStatus}
                  onDropItem={(id, status) => setTrips(prev => prev.map(t => t.id === id ? { ...t, status: status as TripStatus } : t))}
                  renderCard={renderTripKanbanCard}
                  tableResizeMode={tableResizeMode}
                  onAddColumn={col => setTripKanbanColumns(prev => [...prev, col])}
                  onRemoveColumn={colId => setTripKanbanColumns(prev => prev.filter(c => c.id !== colId))}
                />
              ) : tab === "Tài xế" ? (
                <KanbanView
                  columns={driverKanbanColumns}
                  rows={filteredDrivers}
                  groupByKey="status"
                  draggedItemId={draggedDriverId}
                  onDraggedItemIdChange={setDraggedDriverId}
                  dragOverColumnId={dragOverDriverStatus}
                  onDragOverColumnIdChange={setDragOverDriverStatus}
                  onDropItem={(id, status) => setDrivers(prev => prev.map(d => d.id === id ? { ...d, status: status as DriverStatus } : d))}
                  renderCard={renderDriverKanbanCard}
                  tableResizeMode={tableResizeMode}
                  onAddColumn={col => setDriverKanbanColumns(prev => [...prev, col])}
                  onRemoveColumn={colId => setDriverKanbanColumns(prev => prev.filter(c => c.id !== colId))}
                />
              ) : tab === "Lộ trình" ? (
                <KanbanView
                  columns={routeKanbanColumns}
                  rows={filteredRoutePlans.map(r => ({ ...r, id: r.id }))}
                  groupByKey="status"
                  draggedItemId={draggedRouteId}
                  onDraggedItemIdChange={setDraggedRouteId}
                  dragOverColumnId={dragOverRouteStatus}
                  onDragOverColumnIdChange={setDragOverRouteStatus}
                  onDropItem={(id, status) => setRoutePlans(prev => prev.map(r => r.id === id ? { ...r, status } : r))}
                  renderCard={renderRouteKanbanCard}
                  tableResizeMode={tableResizeMode}
                  maxCols={6}
                  lanesPerColumn={2}
                  onAddColumn={col => setRouteKanbanColumns(prev => [...prev, col])}
                  onRemoveColumn={colId => setRouteKanbanColumns(prev => prev.filter(c => c.id !== colId))}
                />
              ) : (
                <KanbanView
                  columns={otpKanbanColumns}
                  rows={filteredOtpRows}
                  groupByKey="status"
                  draggedItemId={draggedOtpId}
                  onDraggedItemIdChange={setDraggedOtpId}
                  dragOverColumnId={dragOverOtpStatus}
                  onDragOverColumnIdChange={setDragOverOtpStatus}
                  onDropItem={(id, status) => setOtpsState(prev => prev.map(o => o.order === id ? { ...o, status } : o))}
                  renderCard={renderOtpKanbanCard}
                  tableResizeMode={tableResizeMode}
                  maxCols={6}
                  lanesPerColumn={2}
                  onAddColumn={col => setOtpKanbanColumns(prev => [...prev, col])}
                  onRemoveColumn={colId => setOtpKanbanColumns(prev => prev.filter(c => c.id !== colId))}
                />
              )
            ) : viewMode === "Danh sách" ? (
              tab === "Chuyến đi" ? (
                <ListView paginatedRows={paginatedTrips} emptyMessage="Không tìm thấy chuyến giao nhận phù hợp." renderRow={renderTripListRow} />
              ) : tab === "Tài xế" ? (
                <ListView paginatedRows={paginatedDrivers} emptyMessage="Không tìm thấy tài xế phù hợp." renderRow={renderDriverListRow} />
              ) : tab === "Lộ trình" ? (
                <ListView paginatedRows={paginatedRoutePlans} emptyMessage="Không tìm thấy lộ trình phù hợp." renderRow={renderRouteListRow} />
              ) : (
                <ListView paginatedRows={paginatedOtps} emptyMessage="Không tìm thấy OTP & nhật ký phù hợp." renderRow={renderOtpListRow} />
              )
            ) : (
              <TableView
                columns={activeColumns.filter(c => c.visible)}
                onColumnsChange={setColumnsActive as any}
                rows={activePaginatedRows}
                pageSize={pageSize}
                emptyMessage={
                  tab === "Chuyến đi" ? "Không tìm thấy chuyến giao nhận phù hợp." :
                  tab === "Tài xế" ? "Không tìm thấy tài xế phù hợp." :
                  tab === "Lộ trình" ? "Không tìm thấy lộ trình phù hợp." :
                  "Không tìm thấy OTP & nhật ký phù hợp."
                }
                tableResizeMode={tableResizeMode}
                totalVisibleWidth={totalVisibleWidth}
                renderCell={renderCell}
                columnDrag={{
                  draggedColumnId,
                  dragOverColumnId,
                  onDragStart: handleColumnDragStart,
                  onDragOver: handleColumnDragOver,
                  onDragLeave: handleColumnDragLeave,
                  onDrop: handleColumnDrop,
                  onDragEnd: handleColumnDragEnd,
                }}
                page={page}
                pageCount={pageCount}
                totalRows={activeRows.length}
                customPageSize={customPageSize}
                openPageSizeMenu={openPageSizeMenu}
                onOpenPageSizeMenuChange={setOpenPageSizeMenu}
                onCustomPageSizeChange={setCustomPageSize}
                onApplyCustomPageSize={applyCustomPageSize}
                onUpdatePageSize={updatePageSize}
                onPageChange={setPage}
              />
            )}
          </div>
        </>
      )}

      <FormDialog
        open={openTripForm}
        onClose={() => setOpenTripForm(false)}
        title={editingTripId ? `Chỉnh sửa chuyến ${editingTripId}` : "Thêm chuyến giao nhận mới"}
        fields={orderedTripFormFields}
        form={tripForm}
        onFormChange={setTripForm}
        onSave={saveTrip}
        statusOptions={tripStatusOptions}
        statusDotColors={tripStatusDotColors}
      />

      <FormDialog
        open={openDriverForm}
        onClose={() => setOpenDriverForm(false)}
        title={editingDriverId ? `Chỉnh sửa tài xế ${editingDriverId}` : "Thêm tài xế mới"}
        fields={driverFormFields}
        form={driverForm}
        onFormChange={setDriverForm}
        onSave={saveDriver}
        customColumns={customColumnsDriver}
      />

      <AddColumnDialog
        open={openAddColumn}
        onOpenChange={setOpenAddColumn}
        newColumnName={newColumnName}
        onNewColumnNameChange={setNewColumnName}
        onAddColumn={addCustomColumn}
      />

      <HistoryModal
        open={openHistory}
        onClose={() => setOpenHistory(false)}
        title={
          tab === "Chuyến đi" ? "Lịch sử chuyến đi" :
          tab === "Tài xế" ? "Lịch sử tài xế" :
          tab === "Lộ trình" ? "Lịch sử lộ trình" :
          "Lịch sử OTP & nhật ký"
        }
        items={(
          tab === "Chuyến đi" ? selectedTrips :
          tab === "Tài xế" ? selectedDrivers :
          tab === "Lộ trình" ? selectedRoutes :
          selectedOtps
        ) as Array<Trip | Driver | RoutePlan | OtpRow>}
        activeItemId={activeHistoryItemId}
        onActiveItemChange={setActiveHistoryItemId}
        itemLabel={
          tab === "Chuyến đi" ? "chuyến đi" :
          tab === "Tài xế" ? "tài xế" :
          tab === "Lộ trình" ? "lộ trình" :
          "OTP & nhật ký"
        }
        renderSidebarItem={(item, active) => (
          <div className={`rounded-lg p-2.5 transition-colors ${active ? "bg-white shadow-sm ring-1 ring-slate-200/50" : "hover:bg-slate-100/50"}`}>
            <div className="flex items-start justify-between gap-1.5">
              <span className="truncate text-xs font-semibold text-slate-900">
                {tab === "Chuyến đi" ? (item as Trip).customer :
                 tab === "Tài xế" ? (item as Driver).name :
                 tab === "Lộ trình" ? (item as RoutePlan).route :
                 (item as OtpRow).order || item.id}
              </span>
              <span className="shrink-0 text-[10px] text-slate-400 font-mono">{item.id}</span>
            </div>
            <p className="mt-1 truncate text-[10px] text-slate-500">
               {tab === "Chuyến đi" ? (item as Trip).type :
                tab === "Tài xế" ? (item as Driver).rating || "Tài xế" :
               tab === "Lộ trình" ? `${(item as RoutePlan).driver} · ${(item as RoutePlan).status}` :
               `${(item as OtpRow).type || "Nhật ký"} · ${(item as OtpRow).status || (item as OtpRow).time || "Chưa cập nhật"}`}
            </p>
          </div>
        )}
        renderDetail={(item) => {
          if (tab === "Chuyến đi") {
            const trip = item as Trip;
            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{trip.customer}</h4>
                    <p className="text-xs text-slate-400">{trip.id} · {trip.type}</p>
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium"
                    style={{
                      color: (tripStatusColor[trip.status] || { text: "#64748b" }).text,
                      backgroundColor: (tripStatusColor[trip.status] || { bg: "rgba(100,116,139,0.1)" }).bg,
                    }}
                  >
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: (tripStatusColor[trip.status] || { text: "#64748b" }).text }} />
                    {trip.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Giờ hẹn:</span>
                    <p className="mt-0.5 font-medium text-slate-700">{trip.time}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Số điện thoại:</span>
                    <p className="mt-0.5 font-medium text-slate-700">{trip.phone}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Địa chỉ:</span>
                    <p className="mt-0.5 font-medium text-slate-700">{trip.address}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Tài xế phụ trách:</span>
                    <p className="mt-0.5 font-medium text-slate-700">{trip.driver}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Ngày tạo:</span>
                    <p className="mt-0.5 font-medium text-slate-700">{trip.createdAt || "05/06/2026, 08:00:00"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Ngày cập nhật:</span>
                    <p className="mt-0.5 font-medium text-slate-700">{trip.updatedAt || "05/06/2026, 08:00:00"}</p>
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ghi chú vận chuyển</span>
                  <p className="mt-1.5 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{trip.note}</p>
                </div>
              </div>
            );
          }

          if (tab === "Tài xế") {
            const driver = item as Driver;
            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{driver.name}</h4>
                    <p className="text-xs text-slate-400">{driver.id} · {driver.phone}</p>
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium"
                    style={{
                      color: (driverStatusColor[driver.status] || { text: "#64748b" }).text,
                      backgroundColor: (driverStatusColor[driver.status] || { bg: "rgba(100,116,139,0.1)" }).bg,
                    }}
                  >
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: (driverStatusColor[driver.status] || { text: "#64748b" }).text }} />
                    {driver.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Đánh giá:</span>
                    <p className="mt-0.5 font-medium text-slate-700">{driver.rating}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Tải công việc:</span>
                    <p className="mt-0.5 font-medium text-slate-700">{driver.load}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Ngày tạo:</span>
                    <p className="mt-0.5 font-medium text-slate-700">{driver.createdAt || "05/06/2026, 08:00:00"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Ngày cập nhật:</span>
                    <p className="mt-0.5 font-medium text-slate-700">{driver.updatedAt || "05/06/2026, 08:00:00"}</p>
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ghi chú vận chuyển</span>
                  <p className="mt-1.5 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{driver.note}</p>
                </div>
              </div>
            );
          }

          if (tab === "Lộ trình") {
            const route = item as RoutePlan;
            const color = routeStatusColor[route.status] || { text: "#64748b", bg: "rgba(100,116,139,0.1)" };
            const routeEvents = [
              { label: "Tạo gợi ý", time: "08:20", detail: `${route.route} được hệ thống đề xuất cho ${route.driver}.`, done: true },
              { label: "Đánh giá hiệu quả", time: "08:24", detail: `${route.saving} · ETA ${route.eta}.`, done: true },
              { label: route.status === "Cần duyệt" ? "Chờ quản lý duyệt" : route.status === "Sẵn sàng áp dụng" ? "Sẵn sàng áp dụng" : "Theo dõi vận hành", time: "Hiện tại", detail: `Đơn liên quan: ${route.orders}.`, done: route.status !== "Cần duyệt" },
            ];

            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{route.route}</h4>
                    <p className="text-xs text-slate-400">{route.id} · {route.driver}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium" style={{ color: color.text, backgroundColor: color.bg }}>
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: color.text }} />
                    {route.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Tài xế:</span>
                    <p className="mt-0.5 font-medium text-slate-700">{route.driver}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">ETA:</span>
                    <p className="mt-0.5 font-medium text-slate-700">{route.eta}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Hiệu quả:</span>
                    <p className="mt-0.5 font-medium text-slate-700">{route.saving}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Đơn liên quan:</span>
                    <p className="mt-0.5 font-medium text-slate-700">{route.orders}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Lịch sử xử lý lộ trình</span>
                  <div className="mt-3 space-y-3">
                    {routeEvents.map((event) => (
                      <div key={`${route.id}-${event.label}`} className="flex gap-2.5">
                        <span className={`mt-1 size-2.5 shrink-0 rounded-full ${event.done ? "bg-emerald-500" : "bg-amber-500"}`} />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800">{event.label} · {event.time}</p>
                          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{event.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          const otpItem = item as OtpRow;
          const color = otpStatusColor[otpItem.status || ""] || { text: "#64748b", bg: "rgba(100,116,139,0.1)" };
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{otpItem.order || otpItem.id}</h4>
                  <p className="text-xs text-slate-400">{otpItem.type || "Nhật ký giao nhận"} · {otpItem.time || "Chưa có thời gian"}</p>
                </div>
                {otpItem.status && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium" style={{ color: color.text, backgroundColor: color.bg }}>
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: color.text }} />
                    {otpItem.status}
                  </span>
                )}
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">OTP</span>
                  <p className="mt-2 font-mono text-2xl font-bold text-slate-900">{otpItem.otp || "------"}</p>
                  <div className="mt-3 space-y-1 text-xs text-slate-500">
                    <p>Loại: <span className="font-medium text-slate-700">{otpItem.type || "Không có"}</span></p>
                    <p>Đơn hàng: <span className="font-medium text-slate-700">{otpItem.order || "Không có"}</span></p>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Nhật ký</span>
                  <div className="mt-3 flex gap-2.5">
                    <span className="mt-1 size-2.5 shrink-0 rounded-full bg-indigo-500" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800">{otpItem.time || "Chưa cập nhật"}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{otpItem.event || "Chưa có sự kiện nhật ký."}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      />
    </PageShell>
  );

  function updatePageSize(size: number) {
    const nextSize = Math.max(1, Math.min(500, Math.floor(size)));
    setPageSize(nextSize);
    setPage(1);
    setOpenPageSizeMenu(false);
  }

  function applyCustomPageSize() {
    const nextSize = Number(customPageSize);
    if (!Number.isFinite(nextSize) || nextSize <= 0) return;
    updatePageSize(nextSize);
    setCustomPageSize("");
  }
}
