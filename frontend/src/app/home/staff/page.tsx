"use client";

import { useMemo, useState, type DragEvent } from "react";
import {
  Users,
  Package,
  TrendingUp,
  CircleDollarSign,
  WashingMachine,
} from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { TableCell } from "@/components/ui/table";
import { PageShell, ViewModeTabs } from "../_components/dashboard-primitives";
import { MetricCard } from "../_components/metric-card";
import { Toolbar } from "../_components/toolbar";
import { FilterBar, type FilterOption } from "../_components/filter-bar";
import { TableView } from "../_components/table-view";
import { FormDialog, type FormField } from "../_components/form-dialog";
import { AddColumnDialog } from "../_components/add-column-dialog";
import { KanbanView } from "../_components/kanban-view";
import { ListView } from "../_components/list-view";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import { formatRange, normalizeRange } from "@/src/utils/dashboard-time";

type StaffStatus = "Hoạt động" | "Nghỉ phép" | "Tạm nghỉ";
type SupplyStatus = "Ổn định" | "Sắp hết" | "Cần mua";
type MachineStatus = "Sẵn sàng" | "Đang chạy" | "Bảo trì";
type Tab = "Nhân viên" | "Kho vật tư" | "Thiết bị giặt sấy";

type Staff = {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  shift: string;
  shiftDate: string;
  phone: string;
  productivity: string;
  rating: string;
  status: StaffStatus;
  note: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
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
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
};

type WashingMachineItem = {
  id: string;
  name: string;
  capacity: string;
  area: string;
  loadType: string;
  lastMaintenance: string;
  nextMaintenance: string;
  status: MachineStatus;
  note: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
};

const defaultStaffColumns = [
  { id: "id", label: "Mã NV", width: 104, visible: true },
  { id: "name", label: "Họ tên", width: 168, visible: true },
  { id: "role", label: "Vai trò", width: 112, visible: true },
  { id: "shift", label: "Ca", width: 82, visible: true },
  { id: "shiftDate", label: "Ngày ca", width: 110, visible: true },
  { id: "phone", label: "SĐT", width: 116, visible: true },
  { id: "productivity", label: "Năng suất", width: 112, visible: true },
  { id: "rating", label: "Đánh giá", width: 84, visible: true },
  { id: "status", label: "Trạng thái", width: 112, visible: true },
  { id: "note", label: "Ghi chú", width: 180, visible: true },
  { id: "actions", label: "Thao tác", width: 108, visible: true },
];

const defaultSupplyColumns = [
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

const defaultMachineColumns = [
  { id: "id", label: "Mã TB", width: 104, visible: true },
  { id: "name", label: "Thiết bị", width: 156, visible: true },
  { id: "capacity", label: "Công suất", width: 100, visible: true },
  { id: "area", label: "Khu vực", width: 110, visible: true },
  { id: "loadType", label: "Nhóm thiết bị", width: 120, visible: true },
  {
    id: "lastMaintenance",
    label: "Bảo trì gần nhất",
    width: 130,
    visible: true,
  },
  {
    id: "nextMaintenance",
    label: "Bảo trì kế tiếp",
    width: 130,
    visible: true,
  },
  { id: "status", label: "Trạng thái", width: 112, visible: true },
  { id: "note", label: "Ghi chú", width: 160, visible: true },
  { id: "actions", label: "Thao tác", width: 108, visible: true },
];

const staffRoleOptions = [
  "Tất cả",
  "Giặt",
  "Gấp/Là",
  "Kiểm đồ",
  "Giao nhận",
  "Tài xế",
  "Thu ngân",
  "Kho",
];

const defaultAvatarUrl = "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif";
const getSafeAvatarUrl = (avatar?: string) =>
  avatar?.includes("images.unsplash.com") ? defaultAvatarUrl : avatar || defaultAvatarUrl;

const seedStaff: Staff[] = [
  {
    id: "NV-101",
    name: "Nguyễn Văn A",
    avatar: defaultAvatarUrl,
    role: "Giặt",
    shift: "Sáng",
    shiftDate: "2026-06-09",
    phone: "0903123456",
    productivity: "32 đơn",
    rating: "4.8/5",
    status: "Hoạt động",
    note: "Phụ trách máy giặt 01",
    createdAt: "05/06/2026, 08:00:00",
    updatedAt: "05/06/2026, 08:00:00",
  },
  {
    id: "NV-102",
    name: "Trần Thị B",
    avatar: defaultAvatarUrl,
    role: "Gấp/Là",
    shift: "Chiều",
    shiftDate: "2026-06-09",
    phone: "0912456789",
    productivity: "25 đơn",
    rating: "4.7/5",
    status: "Hoạt động",
    note: "Kiểm tra đồ trắng",
    createdAt: "05/06/2026, 08:00:00",
    updatedAt: "05/06/2026, 08:00:00",
  },
  {
    id: "NV-103",
    name: "Lê Hoàng C",
    avatar: defaultAvatarUrl,
    role: "Giao nhận",
    shift: "Tối",
    shiftDate: "2026-06-09",
    phone: "0938123456",
    productivity: "18 chuyến",
    rating: "4.6/5",
    status: "Hoạt động",
    note: "Tuyến Quận 1",
    createdAt: "05/06/2026, 08:00:00",
    updatedAt: "05/06/2026, 08:00:00",
  },
  {
    id: "NV-104",
    name: "Phạm Duy D",
    avatar: defaultAvatarUrl,
    role: "Thu ngân",
    shift: "Sáng",
    shiftDate: "2026-06-10",
    phone: "0988333444",
    productivity: "42 giao dịch",
    rating: "-",
    status: "Nghỉ phép",
    note: "Nghỉ đến 02/06",
    createdAt: "05/06/2026, 08:00:00",
    updatedAt: "05/06/2026, 08:00:00",
  },
  {
    id: "NV-105",
    name: "Hoàng Minh Tâm",
    avatar: defaultAvatarUrl,
    role: "Kiểm đồ",
    shift: "Chiều",
    shiftDate: "2026-06-10",
    phone: "0977000111",
    productivity: "37 đơn",
    rating: "4.9/5",
    status: "Hoạt động",
    note: "Đối soát đồ lỗi",
    createdAt: "05/06/2026, 08:00:00",
    updatedAt: "05/06/2026, 08:00:00",
  },
  {
    id: "NV-106",
    name: "Vũ Thanh Mai",
    avatar: defaultAvatarUrl,
    role: "Kho",
    shift: "Sáng",
    shiftDate: "2026-06-10",
    phone: "0909555666",
    productivity: "16 phiếu",
    rating: "4.5/5",
    status: "Tạm nghỉ",
    note: "Đào tạo lại quy trình nhập kho",
    createdAt: "05/06/2026, 08:00:00",
    updatedAt: "05/06/2026, 08:00:00",
  },
];

const seedSupplies: Supply[] = [
  {
    id: "VT-301",
    name: "Hóa chất giặt",
    category: "Hóa chất",
    stock: "25 kg",
    threshold: "10 kg",
    supplier: "EcoWash",
    lastImport: "2026-05-12",
    cost: 1800000,
    status: "Ổn định",
    note: "Dùng cho máy giặt 01, 02",
    createdAt: "05/06/2026, 08:00:00",
    updatedAt: "05/06/2026, 08:00:00",
  },
  {
    id: "VT-302",
    name: "Nước xả",
    category: "Hóa chất",
    stock: "6 lít",
    threshold: "8 lít",
    supplier: "CleanPro",
    lastImport: "2026-05-16",
    cost: 720000,
    status: "Sắp hết",
    note: "Cần mua trong 2 ngày",
    createdAt: "05/06/2026, 08:00:00",
    updatedAt: "05/06/2026, 08:00:00",
  },
  {
    id: "VT-303",
    name: "Túi đựng",
    category: "Bao bì",
    stock: "120 cái",
    threshold: "50 cái",
    supplier: "Kho tổng",
    lastImport: "2026-05-15",
    cost: 460000,
    status: "Ổn định",
    note: "Túi size M/L",
    createdAt: "05/06/2026, 08:00:00",
    updatedAt: "05/06/2026, 08:00:00",
  },
  {
    id: "VT-304",
    name: "Móc áo",
    category: "Phụ kiện",
    stock: "75 cái",
    threshold: "100 cái",
    supplier: "Nhựa Minh An",
    lastImport: "2026-05-10",
    cost: 1250000,
    status: "Cần mua",
    note: "Ưu tiên móc áo vest",
    createdAt: "05/06/2026, 08:00:00",
    updatedAt: "05/06/2026, 08:00:00",
  },
  {
    id: "VT-305",
    name: "Tem mã đơn",
    category: "Bao bì",
    stock: "3 cuộn",
    threshold: "2 cuộn",
    supplier: "In nhanh Q1",
    lastImport: "2026-05-08",
    cost: 360000,
    status: "Ổn định",
    note: "Dùng cho tiếp nhận",
    createdAt: "05/06/2026, 08:00:00",
    updatedAt: "05/06/2026, 08:00:00",
  },
];

const seedMachines: WashingMachineItem[] = [
  {
    id: "MG-01",
    name: "Máy giặt nhỏ A",
    capacity: "8 kg",
    area: "Khu giặt 1",
    loadType: "Máy giặt",
    lastMaintenance: "2026-05-18",
    nextMaintenance: "2026-06-18",
    status: "Sẵn sàng",
    note: "Ưu tiên đồ màu, chạy ổn định",
    createdAt: "05/06/2026, 08:00:00",
    updatedAt: "05/06/2026, 08:00:00",
  },
  {
    id: "MG-02",
    name: "Máy giặt lớn B",
    capacity: "18 kg",
    area: "Khu giặt 2",
    loadType: "Máy giặt",
    lastMaintenance: "2026-05-20",
    nextMaintenance: "2026-06-20",
    status: "Đang chạy",
    note: "Đang xử lý đơn DH-1055",
    createdAt: "05/06/2026, 08:00:00",
    updatedAt: "05/06/2026, 08:00:00",
  },
  {
    id: "MS-01",
    name: "Máy sấy công nghiệp A",
    capacity: "16 kg",
    area: "Khu sấy 1",
    loadType: "Máy sấy",
    lastMaintenance: "2026-05-12",
    nextMaintenance: "2026-06-12",
    status: "Sẵn sàng",
    note: "Dùng cho chăn ga và đơn số lượng lớn",
    createdAt: "05/06/2026, 08:00:00",
    updatedAt: "05/06/2026, 08:00:00",
  },
  {
    id: "MS-02",
    name: "Máy sấy nhanh B",
    capacity: "12 kg",
    area: "Khu sấy 1",
    loadType: "Máy sấy",
    lastMaintenance: "2026-05-28",
    nextMaintenance: "2026-06-28",
    status: "Bảo trì",
    note: "Kiểm tra bộ gia nhiệt",
    createdAt: "05/06/2026, 08:00:00",
    updatedAt: "05/06/2026, 08:00:00",
  },
];

const emptyStaffForm = {
  name: "",
  avatar: "",
  role: "Giặt",
  shift: "Sáng",
  shiftDate: "",
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

const emptyMachineForm = {
  name: "",
  capacity: "",
  area: "Khu giặt 1",
  loadType: "Máy giặt",
  lastMaintenance: "",
  nextMaintenance: "",
  status: "Sẵn sàng" as MachineStatus,
  note: "",
};

const statusColor: Record<string, { text: string; bg: string }> = {
  "Hoạt động": { text: "#059669", bg: "rgba(5,150,105,0.09)" },
  "Nghỉ phép": { text: "#d97706", bg: "rgba(217,119,6,0.09)" },
  "Tạm nghỉ": { text: "#64748b", bg: "rgba(100,116,139,0.1)" },
  "Ổn định": { text: "#059669", bg: "rgba(5,150,105,0.09)" },
  "Sắp hết": { text: "#d97706", bg: "rgba(217,119,6,0.09)" },
  "Cần mua": { text: "#dc2626", bg: "rgba(220,38,38,0.09)" },
  "Sẵn sàng": { text: "#059669", bg: "rgba(5,150,105,0.09)" },
  "Đang chạy": { text: "#2563eb", bg: "rgba(37,99,235,0.09)" },
  "Bảo trì": { text: "#d97706", bg: "rgba(217,119,6,0.09)" },
  "Đủ người": { text: "#059669", bg: "rgba(5,150,105,0.09)" },
  "Thiếu người": { text: "#dc2626", bg: "rgba(220,38,38,0.09)" },
};

const statusDotColors = Object.fromEntries(
  Object.entries(statusColor).map(([status, color]) => [status, color.text]),
);

function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

function formatReadableDate(dateStr?: string) {
  if (!dateStr) return "-";
  if (dateStr.includes("/")) return dateStr;
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
}

export default function StaffOperationsPage() {
  const [tab, setTab] = useState<Tab>("Nhân viên");
  const [staff, setStaff] = useState(seedStaff);
  const [supplies, setSupplies] = useState(seedSupplies);
  const [machines, setMachines] = useState(seedMachines);
  const [query, setQuery] = useState("");
  const [selectedStaffStatus, setSelectedStaffStatus] =
    useState<string>("Tất cả");
  const [selectedSupplyStatus, setSelectedSupplyStatus] =
    useState<string>("Tất cả");
  const [selectedMachineStatus, setSelectedMachineStatus] =
    useState<string>("Tất cả");
  const [viewMode, setViewMode] = useState<"Bảng" | "Bảng kéo" | "Danh sách">(
    "Bảng",
  );
  const [selectedStaffIds, setSelectedStaffIds] = useState<Set<string>>(
    new Set(),
  );
  const [selectedSupplyIds, setSelectedSupplyIds] = useState<Set<string>>(
    new Set(),
  );
  const [selectedMachineIds, setSelectedMachineIds] = useState<Set<string>>(
    new Set(),
  );
  const [openHistory, setOpenHistory] = useState(false);
  const [activeHistoryItemId, setActiveHistoryItemId] = useState<string | null>(
    null,
  );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingStaffId, setDeletingStaffId] = useState<string | null>(null);
  const [deletingSupplyId, setDeletingSupplyId] = useState<string | null>(null);
  const [deletingMachineId, setDeletingMachineId] = useState<string | null>(
    null,
  );

  const [draggedStaffId, setDraggedStaffId] = useState<string | null>(null);
  const [dragOverStaffStatus, setDragOverStaffStatus] = useState<string | null>(
    null,
  );
  const [draggedSupplyId, setDraggedSupplyId] = useState<string | null>(null);
  const [dragOverSupplyStatus, setDragOverSupplyStatus] = useState<
    string | null
  >(null);
  const [draggedMachineId, setDraggedMachineId] = useState<string | null>(null);
  const [dragOverMachineStatus, setDragOverMachineStatus] = useState<
    string | null
  >(null);

  const checkboxClass =
    "relative size-4 appearance-none rounded-[5px] border border-slate-300 bg-white transition-all duration-150 checked:border-emerald-300 checked:bg-emerald-300 after:absolute after:left-1/2 after:top-1/2 after:hidden after:h-[9px] after:w-[5px] after:-translate-x-1/2 after:-translate-y-[58%] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:content-[''] checked:after:block";

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [columnsStaff, setColumnsStaff] = useState(defaultStaffColumns);
  const [columnsSupply, setColumnsSupply] = useState(defaultSupplyColumns);
  const [columnsMachine, setColumnsMachine] = useState(defaultMachineColumns);

  const activeColumns =
    tab === "Nhân viên"
      ? columnsStaff
      : tab === "Kho vật tư"
        ? columnsSupply
        : columnsMachine;
  const setColumnsActive =
    tab === "Nhân viên"
      ? setColumnsStaff
      : tab === "Kho vật tư"
        ? setColumnsSupply
        : setColumnsMachine;

  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  const [tableResizeMode, setTableResizeMode] = useState<"fit" | "custom">(
    "fit",
  );
  const [openStaffForm, setOpenStaffForm] = useState(false);
  const [openSupplyForm, setOpenSupplyForm] = useState(false);
  const [openMachineForm, setOpenMachineForm] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [editingSupplyId, setEditingSupplyId] = useState<string | null>(null);
  const [editingMachineId, setEditingMachineId] = useState<string | null>(null);
  const [staffForm, setStaffForm] =
    useState<Record<string, string>>(emptyStaffForm);
  const [supplyForm, setSupplyForm] =
    useState<Record<string, string>>(emptySupplyForm);
  const [machineForm, setMachineForm] =
    useState<Record<string, string>>(emptyMachineForm);
  const [openPageSizeMenu, setOpenPageSizeMenu] = useState(false);
  const [customPageSize, setCustomPageSize] = useState("");
  const [openAddColumn, setOpenAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  const range = useDashboardTimeRangeStore((state) => state.range);
  const rangeLabel = formatRange(normalizeRange(range));

  const filteredStaff = useMemo(() => {
    return staff.filter((item) => {
      const source = `${item.id} ${item.name} ${item.role} ${item.shift} ${item.shiftDate} ${formatReadableDate(item.shiftDate)} ${item.phone} ${item.note}`;
      const matchQuery = source.toLowerCase().includes(query.toLowerCase());
      const matchStatus =
        selectedStaffStatus === "Tất cả" || item.status === selectedStaffStatus;
      return matchQuery && matchStatus;
    });
  }, [query, selectedStaffStatus, staff]);

  const filteredSupplies = useMemo(() => {
    return supplies.filter((item) => {
      const source = `${item.id} ${item.name} ${item.category} ${item.supplier} ${item.note}`;
      const matchQuery = source.toLowerCase().includes(query.toLowerCase());
      const matchStatus =
        selectedSupplyStatus === "Tất cả" ||
        item.status === selectedSupplyStatus;
      return matchQuery && matchStatus;
    });
  }, [query, selectedSupplyStatus, supplies]);

  const filteredMachines = useMemo(() => {
    return machines.filter((item) => {
      const source = `${item.id} ${item.name} ${item.capacity} ${item.area} ${item.loadType} ${item.note}`;
      const matchQuery = source.toLowerCase().includes(query.toLowerCase());
      const matchStatus =
        selectedMachineStatus === "Tất cả" ||
        item.status === selectedMachineStatus;
      return matchQuery && matchStatus;
    });
  }, [query, selectedMachineStatus, machines]);

  const activeRows =
    tab === "Nhân viên"
      ? filteredStaff
      : tab === "Kho vật tư"
        ? filteredSupplies
        : filteredMachines;
  const pageCount = Math.ceil(activeRows.length / pageSize);
  const paginatedStaff = filteredStaff.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const paginatedSupplies = filteredSupplies.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const paginatedMachines = filteredMachines.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const activePaginatedRows =
    tab === "Nhân viên"
      ? paginatedStaff
      : tab === "Kho vật tư"
        ? paginatedSupplies
        : paginatedMachines;
  const totalVisibleWidth = activeColumns
    .filter((c) => c.visible)
    .reduce((sum, column) => sum + (column.width || 150), 0);

  const visibleStaffIds = useMemo(
    () => paginatedStaff.map((s) => s.id),
    [paginatedStaff],
  );
  const kanbanStaffIds = useMemo(
    () => filteredStaff.map((s) => s.id),
    [filteredStaff],
  );
  const selectedStaff = useMemo(
    () => staff.filter((s) => selectedStaffIds.has(s.id)),
    [staff, selectedStaffIds],
  );

  const allVisibleStaffSelected =
    visibleStaffIds.length > 0 &&
    visibleStaffIds.every((id) => selectedStaffIds.has(id));
  const allKanbanStaffSelected =
    kanbanStaffIds.length > 0 &&
    kanbanStaffIds.every((id) => selectedStaffIds.has(id));
  const selectedVisibleStaffCount = visibleStaffIds.filter((id) =>
    selectedStaffIds.has(id),
  ).length;
  const selectedKanbanStaffCount = kanbanStaffIds.filter((id) =>
    selectedStaffIds.has(id),
  ).length;

  const toggleVisibleStaff = () => {
    setSelectedStaffIds((prev) => {
      const next = new Set(prev);
      if (allVisibleStaffSelected) {
        visibleStaffIds.forEach((id) => next.delete(id));
      } else {
        visibleStaffIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleKanbanStaff = () => {
    setSelectedStaffIds((prev) => {
      const next = new Set(prev);
      if (allKanbanStaffSelected) {
        kanbanStaffIds.forEach((id) => next.delete(id));
      } else {
        kanbanStaffIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleStaffOne = (id: string) => {
    setSelectedStaffIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Supplies selection
  const visibleSupplyIds = useMemo(
    () => paginatedSupplies.map((s) => s.id),
    [paginatedSupplies],
  );
  const kanbanSupplyIds = useMemo(
    () => filteredSupplies.map((s) => s.id),
    [filteredSupplies],
  );
  const selectedSupplies = useMemo(
    () => supplies.filter((s) => selectedSupplyIds.has(s.id)),
    [supplies, selectedSupplyIds],
  );

  const allVisibleSuppliesSelected =
    visibleSupplyIds.length > 0 &&
    visibleSupplyIds.every((id) => selectedSupplyIds.has(id));
  const allKanbanSuppliesSelected =
    kanbanSupplyIds.length > 0 &&
    kanbanSupplyIds.every((id) => selectedSupplyIds.has(id));
  const selectedVisibleSupplyCount = visibleSupplyIds.filter((id) =>
    selectedSupplyIds.has(id),
  ).length;
  const selectedKanbanSupplyCount = kanbanSupplyIds.filter((id) =>
    selectedSupplyIds.has(id),
  ).length;

  const toggleVisibleSupplies = () => {
    setSelectedSupplyIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSuppliesSelected) {
        visibleSupplyIds.forEach((id) => next.delete(id));
      } else {
        visibleSupplyIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleKanbanSupplies = () => {
    setSelectedSupplyIds((prev) => {
      const next = new Set(prev);
      if (allKanbanSuppliesSelected) {
        kanbanSupplyIds.forEach((id) => next.delete(id));
      } else {
        kanbanSupplyIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleSupplyOne = (id: string) => {
    setSelectedSupplyIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const visibleMachineIds = useMemo(
    () => paginatedMachines.map((m) => m.id),
    [paginatedMachines],
  );
  const kanbanMachineIds = useMemo(
    () => filteredMachines.map((m) => m.id),
    [filteredMachines],
  );
  const selectedMachines = useMemo(
    () => machines.filter((m) => selectedMachineIds.has(m.id)),
    [machines, selectedMachineIds],
  );

  const allVisibleMachinesSelected =
    visibleMachineIds.length > 0 &&
    visibleMachineIds.every((id) => selectedMachineIds.has(id));
  const allKanbanMachinesSelected =
    kanbanMachineIds.length > 0 &&
    kanbanMachineIds.every((id) => selectedMachineIds.has(id));
  const selectedVisibleMachineCount = visibleMachineIds.filter((id) =>
    selectedMachineIds.has(id),
  ).length;
  const selectedKanbanMachineCount = kanbanMachineIds.filter((id) =>
    selectedMachineIds.has(id),
  ).length;

  const toggleVisibleMachines = () => {
    setSelectedMachineIds((prev) => {
      const next = new Set(prev);
      if (allVisibleMachinesSelected) {
        visibleMachineIds.forEach((id) => next.delete(id));
      } else {
        visibleMachineIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleKanbanMachines = () => {
    setSelectedMachineIds((prev) => {
      const next = new Set(prev);
      if (allKanbanMachinesSelected) {
        kanbanMachineIds.forEach((id) => next.delete(id));
      } else {
        kanbanMachineIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleMachineOne = (id: string) => {
    setSelectedMachineIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalCost = useMemo(
    () => filteredSupplies.reduce((sum, item) => sum + item.cost, 0),
    [filteredSupplies],
  );

  const lowStock = supplies.filter((item) => item.status !== "Ổn định").length;
  const purchaseCost = supplies.reduce((sum, item) => sum + item.cost, 0);

  const customColumnsStaff = useMemo(
    () =>
      columnsStaff.filter(
        (col) => !defaultStaffColumns.some((dc) => dc.id === col.id),
      ),
    [columnsStaff],
  );

  const customColumnsSupply = useMemo(
    () =>
      columnsSupply.filter(
        (col) => !defaultSupplyColumns.some((dc) => dc.id === col.id),
      ),
    [columnsSupply],
  );

  const customColumnsMachine = useMemo(
    () =>
      columnsMachine.filter(
        (col) => !defaultMachineColumns.some((dc) => dc.id === col.id),
      ),
    [columnsMachine],
  );

  const orderedStaffFormFields = useMemo<FormField[]>(() => {
    const fieldByColumnId: Record<string, FormField> = {
      name: {
        id: "name",
        label: "Họ tên",
        type: "text",
        placeholder: "Tên nhân viên",
      },
      role: {
        id: "role",
        label: "Vai trò",
        type: "select",
        options: staffRoleOptions,
        placeholder: "Chọn vai trò...",
      },
      shift: {
        id: "shift",
        label: "Ca chính",
        type: "select",
        options: ["Cả ngày", "Sáng", "Chiều", "Tối"],
        placeholder: "Chọn ca chính...",
      },
      shiftDate: { id: "shiftDate", label: "Ngày ca", type: "date" },
      phone: {
        id: "phone",
        label: "Số điện thoại",
        type: "text",
        placeholder: "090...",
      },
      productivity: {
        id: "productivity",
        label: "Năng suất",
        type: "text",
        placeholder: "Chưa có đơn",
        readOnly: true,
      },
      rating: {
        id: "rating",
        label: "Đánh giá",
        type: "text",
        placeholder: "Chưa có đánh giá",
        readOnly: true,
      },
      status: { id: "status", label: "Trạng thái", type: "custom_status" },
      note: {
        id: "note",
        label: "Ghi chú vận hành",
        type: "textarea",
        placeholder: "Khu vực phụ trách, kỹ năng, lịch nghỉ...",
      },
    };

    return columnsStaff
      .filter(
        (column) =>
          column.visible && column.id !== "id" && column.id !== "actions",
      )
      .map((column) => {
        return (
          fieldByColumnId[column.id] ||
          ({
            id: column.id,
            label: column.label,
            type: "text",
            placeholder: `Nhập ${column.label.toLowerCase()}`,
          } satisfies FormField)
        );
      });
  }, [columnsStaff]);

  const orderedSupplyFormFields = useMemo<FormField[]>(() => {
    const fieldByColumnId: Record<string, FormField> = {
      name: {
        id: "name",
        label: "Tên vật tư",
        type: "text",
        placeholder: "Nước xả",
      },
      category: {
        id: "category",
        label: "Nhóm",
        type: "select",
        options: ["Hóa chất", "Bao bì", "Phụ kiện", "Thiết bị"],
        placeholder: "Chọn nhóm vật tư...",
      },
      stock: {
        id: "stock",
        label: "Tồn kho",
        type: "text",
        placeholder: "20 lít",
      },
      threshold: {
        id: "threshold",
        label: "Ngưỡng cảnh báo",
        type: "text",
        placeholder: "8 lít",
      },
      supplier: {
        id: "supplier",
        label: "Nhà cung cấp",
        type: "text",
        placeholder: "EcoWash / CleanPro...",
      },
      lastImport: { id: "lastImport", label: "Ngày nhập", type: "date" },
      cost: { id: "cost", label: "Chi phí nhập", type: "number" },
      status: { id: "status", label: "Cảnh báo", type: "custom_status" },
      note: {
        id: "note",
        label: "Ghi chú",
        type: "textarea",
        placeholder: "Kế hoạch mua, khu vực lưu kho...",
      },
    };

    return columnsSupply
      .filter(
        (column) =>
          column.visible && column.id !== "id" && column.id !== "actions",
      )
      .map((column) => {
        return (
          fieldByColumnId[column.id] ||
          ({
            id: column.id,
            label: column.label,
            type: "text",
            placeholder: `Nhập ${column.label.toLowerCase()}`,
          } satisfies FormField)
        );
      });
  }, [columnsSupply]);

  const orderedMachineFormFields = useMemo<FormField[]>(() => {
    const fieldByColumnId: Record<string, FormField> = {
      name: {
        id: "name",
        label: "Tên thiết bị",
        type: "text",
        placeholder: "Máy giặt nhỏ A / Máy sấy công nghiệp A",
      },
      capacity: {
        id: "capacity",
        label: "Công suất",
        type: "text",
        placeholder: "8 kg",
      },
      area: {
        id: "area",
        label: "Khu vực",
        type: "select",
        options: ["Khu giặt 1", "Khu giặt 2", "Khu sấy 1", "Khu sấy 2"],
        placeholder: "Chọn khu vực...",
      },
      loadType: {
        id: "loadType",
        label: "Nhóm thiết bị",
        type: "select",
        options: ["Máy giặt", "Máy sấy", "Máy giặt sấy"],
        placeholder: "Chọn nhóm thiết bị...",
      },
      lastMaintenance: {
        id: "lastMaintenance",
        label: "Bảo trì gần nhất",
        type: "date",
      },
      nextMaintenance: {
        id: "nextMaintenance",
        label: "Bảo trì kế tiếp",
        type: "date",
      },
      status: { id: "status", label: "Trạng thái", type: "custom_status" },
      note: {
        id: "note",
        label: "Ghi chú",
        type: "textarea",
        placeholder: "Đơn đang chạy, tình trạng kỹ thuật, nhân sự phụ trách...",
      },
    };

    return columnsMachine
      .filter(
        (column) =>
          column.visible && column.id !== "id" && column.id !== "actions",
      )
      .map((column) => {
        return (
          fieldByColumnId[column.id] ||
          ({
            id: column.id,
            label: column.label,
            type: "text",
            placeholder: `Nhập ${column.label.toLowerCase()}`,
          } satisfies FormField)
        );
      });
  }, [columnsMachine]);

  const openCreateStaff = () => {
    setEditingStaffId(null);
    const customFieldsDefaults = Object.fromEntries(
      customColumnsStaff.map((col) => [col.id, ""]),
    );
    setStaffForm({ ...emptyStaffForm, ...customFieldsDefaults });
    setOpenStaffForm(true);
  };

  const openEditStaff = (item: Staff) => {
    setEditingStaffId(item.id);
    const customFieldsDefaults = Object.fromEntries(
      customColumnsStaff.map((col) => [col.id, item[col.id] || ""]),
    );
    setStaffForm({
      ...item,
      ...customFieldsDefaults,
    });
    setOpenStaffForm(true);
  };

  const saveStaff = () => {
    if (!staffForm.name.trim()) return;
    const payload: Omit<Staff, "id"> = {
      name: staffForm.name,
      avatar: staffForm.avatar || (editingStaffId ? staff.find(s => s.id === editingStaffId)?.avatar : undefined) || defaultAvatarUrl,
      phone: staffForm.phone,
      role: staffForm.role,
      shift: staffForm.shift,
      shiftDate: staffForm.shiftDate,
      productivity: staffForm.productivity || "0 đơn",
      rating: staffForm.rating || "-",
      status: staffForm.status as StaffStatus,
      note: staffForm.note,
      ...Object.fromEntries(
        customColumnsStaff.map((col) => [col.id, staffForm[col.id] || ""]),
      ),
    };
    if (editingStaffId) {
      setStaff((prev) =>
        prev.map((item) =>
          item.id === editingStaffId ? { ...item, ...payload } : item,
        ),
      );
    } else {
      setStaff((prev) => [
        { id: `NV-${Date.now().toString().slice(-3)}`, ...payload } as Staff,
        ...prev,
      ]);
    }
    setPage(1);
    setOpenStaffForm(false);
  };

  const openCreateSupply = () => {
    setEditingSupplyId(null);
    const customFieldsDefaults = Object.fromEntries(
      customColumnsSupply.map((col) => [col.id, ""]),
    );
    setSupplyForm({ ...emptySupplyForm, ...customFieldsDefaults });
    setOpenSupplyForm(true);
  };

  const openEditSupply = (item: Supply) => {
    setEditingSupplyId(item.id);
    const customFieldsDefaults = Object.fromEntries(
      customColumnsSupply.map((col) => [col.id, item[col.id] || ""]),
    );
    setSupplyForm({
      ...item,
      cost: String(item.cost),
      ...customFieldsDefaults,
    });
    setOpenSupplyForm(true);
  };

  const saveSupply = () => {
    if (!supplyForm.name.trim()) return;
    const payload: Omit<Supply, "id"> = {
      name: supplyForm.name,
      category: supplyForm.category,
      stock: supplyForm.stock,
      threshold: supplyForm.threshold,
      supplier: supplyForm.supplier,
      lastImport: supplyForm.lastImport,
      cost: Number(supplyForm.cost) || 0,
      status: supplyForm.status as SupplyStatus,
      note: supplyForm.note,
      ...Object.fromEntries(
        customColumnsSupply.map((col) => [col.id, supplyForm[col.id] || ""]),
      ),
    };
    if (editingSupplyId) {
      setSupplies((prev) =>
        prev.map((item) =>
          item.id === editingSupplyId ? { ...item, ...payload } : item,
        ),
      );
    } else {
      setSupplies((prev) => [
        { id: `VT-${Date.now().toString().slice(-3)}`, ...payload } as Supply,
        ...prev,
      ]);
    }
    setPage(1);
    setOpenSupplyForm(false);
  };

  const openCreateMachine = () => {
    setEditingMachineId(null);
    const customFieldsDefaults = Object.fromEntries(
      customColumnsMachine.map((col) => [col.id, ""]),
    );
    setMachineForm({ ...emptyMachineForm, ...customFieldsDefaults });
    setOpenMachineForm(true);
  };

  const openEditMachine = (item: WashingMachineItem) => {
    setEditingMachineId(item.id);
    const customFieldsDefaults = Object.fromEntries(
      customColumnsMachine.map((col) => [col.id, item[col.id] || ""]),
    );
    setMachineForm({
      ...item,
      ...customFieldsDefaults,
    });
    setOpenMachineForm(true);
  };

  const saveMachine = () => {
    if (!machineForm.name.trim()) return;
    const payload: Omit<WashingMachineItem, "id"> = {
      name: machineForm.name,
      capacity: machineForm.capacity,
      area: machineForm.area,
      loadType: machineForm.loadType,
      lastMaintenance: machineForm.lastMaintenance,
      nextMaintenance: machineForm.nextMaintenance,
      status: machineForm.status as MachineStatus,
      note: machineForm.note,
      ...Object.fromEntries(
        customColumnsMachine.map((col) => [col.id, machineForm[col.id] || ""]),
      ),
    };
    if (editingMachineId) {
      setMachines((prev) =>
        prev.map((item) =>
          item.id === editingMachineId ? { ...item, ...payload } : item,
        ),
      );
    } else {
      setMachines((prev) => [
        {
          id: `TB-${Date.now().toString().slice(-2)}`,
          ...payload,
        } as WashingMachineItem,
        ...prev,
      ]);
    }
    setPage(1);
    setOpenMachineForm(false);
  };

  const startDeleteStaff = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingStaffId(id);
    setDeletingSupplyId(null);
    setDeletingMachineId(null);
    setDeleteConfirmOpen(true);
  };

  const startDeleteSupply = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingSupplyId(id);
    setDeletingStaffId(null);
    setDeletingMachineId(null);
    setDeleteConfirmOpen(true);
  };

  const startDeleteMachine = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingMachineId(id);
    setDeletingStaffId(null);
    setDeletingSupplyId(null);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingStaffId) {
      setStaff((prev) => prev.filter((item) => item.id !== deletingStaffId));
      setSelectedStaffIds((prev) => {
        const next = new Set(prev);
        next.delete(deletingStaffId);
        return next;
      });
      setDeletingStaffId(null);
    } else if (deletingSupplyId) {
      setSupplies((prev) =>
        prev.filter((item) => item.id !== deletingSupplyId),
      );
      setSelectedSupplyIds((prev) => {
        const next = new Set(prev);
        next.delete(deletingSupplyId);
        return next;
      });
      setDeletingSupplyId(null);
    } else if (deletingMachineId) {
      setMachines((prev) =>
        prev.filter((item) => item.id !== deletingMachineId),
      );
      setSelectedMachineIds((prev) => {
        const next = new Set(prev);
        next.delete(deletingMachineId);
        return next;
      });
      setDeletingMachineId(null);
    }
    setDeleteConfirmOpen(false);
  };

  const handleDragStart = (
    event: DragEvent<HTMLTableCellElement>,
    id: string,
  ) => {
    setDraggedColumnId(id);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (
    event: DragEvent<HTMLTableCellElement>,
    id: string,
  ) => {
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

    setColumnsActive((prev: any) => {
      const draggedIndex = prev.findIndex(
        (column: any) => column.id === draggedColumnId,
      );
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

  const handleDragEnd = () => {
    setDraggedColumnId(null);
    setDragOverColumnId(null);
  };

  const getDefaultExportFileName = () => {
    const scope =
      tab === "Nhân viên"
        ? "nhan-vien"
        : tab === "Kho vật tư"
          ? "kho-vat-tu"
          : "thiet-bi-giat-say";
    return `${scope}-${new Date().toISOString().slice(0, 10)}`;
  };

  const handleExport = (format: "pdf" | "excel" | "csv", fileName: string) => {
    const rows = activeRows;
    if (rows.length === 0) return;
    const baseFileName = fileName || getDefaultExportFileName();
    const headers = activeColumns
      .filter((c) => c.id !== "actions" && c.visible)
      .map((c) => c.label);

    if (format === "csv") {
      const csvData = rows.map((row) =>
        activeColumns
          .filter((c) => c.id !== "actions" && c.visible)
          .map((c) => {
            let val = (row as any)[c.id] ?? "";
            if (c.id === "cost") val = formatCurrency(Number(val));
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(","),
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
      const tableHead = headers.map((h) => `<th>${h}</th>`).join("");
      const tableBody = rows
        .map(
          (row) =>
            `<tr>${activeColumns
              .filter((c) => c.id !== "actions" && c.visible)
              .map((c) => {
                let val = (row as any)[c.id] ?? "";
                if (c.id === "cost") val = formatCurrency(Number(val));
                return `<td>${val}</td>`;
              })
              .join("")}</tr>`,
        )
        .join("");
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
      const blob = new Blob([excelContent], {
        type: "application/vnd.ms-excel",
      });
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
      const tableHead = headers.map((h) => `<th>${h}</th>`).join("");
      const tableBody = rows
        .map(
          (row) =>
            `<tr>${activeColumns
              .filter((c) => c.id !== "actions" && c.visible)
              .map((c) => {
                let val = (row as any)[c.id] ?? "";
                if (c.id === "cost") val = formatCurrency(Number(val));
                return `<td>${val}</td>`;
              })
              .join("")}</tr>`,
        )
        .join("");
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
    if (tab === "Nhân viên") {
      setStaffForm((prev) => ({ ...prev, [newColumn.id]: "" }));
    } else if (tab === "Kho vật tư") {
      setSupplyForm((prev) => ({ ...prev, [newColumn.id]: "" }));
    } else {
      setMachineForm((prev) => ({ ...prev, [newColumn.id]: "" }));
    }
    setNewColumnName("");
    setOpenAddColumn(false);
  };

  const renderStaffCell = (item: Staff, column: any) => {
    if (column.id === "id")
      return (
        <TableCell key={column.id} className="pl-4 font-medium text-slate-900">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              aria-label={`Chọn nhân viên ${item.id}`}
              checked={selectedStaffIds.has(item.id)}
              onChange={() => toggleStaffOne(item.id)}
              className={`shrink-0 ${checkboxClass}`}
            />
            <span>{item.id}</span>
          </div>
        </TableCell>
      );
    if (column.id === "name") {
      const avatarUrl = getSafeAvatarUrl(item.avatar);
      return (
        <TableCell key={column.id} className="font-medium text-slate-900">
          <div className="flex items-center gap-2.5">
            <Image
              src={avatarUrl}
              alt={item.name}
              width={24}
              height={24}
              className="size-6 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
            <span className="truncate">{item.name}</span>
          </div>
        </TableCell>
      );
    }
    if (column.id === "phone") {
      return (
        <TableCell key={column.id}>
          <a
            href={`tel:${item.phone}`}
            className="text-slate-500 hover:text-slate-800"
          >
            {item.phone}
          </a>
        </TableCell>
      );
    }
    if (column.id === "shiftDate")
      return (
        <TableCell key={column.id} className="text-slate-500">
          {formatReadableDate(item.shiftDate)}
        </TableCell>
      );
    if (column.id === "status") {
      const color = statusColor[item.status];
      return (
        <TableCell key={column.id}>
          <span
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium"
            style={{ color: color.text, backgroundColor: color.bg }}
          >
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: color.text }}
            />
            {item.status}
          </span>
        </TableCell>
      );
    }
    if (column.id === "note")
      return (
        <TableCell
          key={column.id}
          className="truncate text-slate-500"
          title={item.note}
        >
          {item.note}
        </TableCell>
      );
    if (column.id === "actions") {
      return (
        <TableCell key={column.id} className="px-4">
          <div className="flex items-center justify-start gap-1.5">
            <button
              type="button"
              className="inline-flex h-7 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50"
              onClick={() => openEditStaff(item)}
            >
              Sửa
            </button>
            <button
              type="button"
              className="inline-flex h-7 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-100"
              onClick={(e) => startDeleteStaff(item.id, e)}
            >
              Xóa
            </button>
          </div>
        </TableCell>
      );
    }
    const customValue = item[column.id];
    return (
      <TableCell
        key={column.id}
        className={customValue ? "text-slate-600" : "text-slate-400 italic"}
      >
        {customValue || "Chưa có"}
      </TableCell>
    );
  };

  const renderSupplyCell = (item: Supply, column: any) => {
    if (column.id === "id")
      return (
        <TableCell key={column.id} className="pl-4 font-medium text-slate-900">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              aria-label={`Chọn vật tư ${item.id}`}
              checked={selectedSupplyIds.has(item.id)}
              onChange={() => toggleSupplyOne(item.id)}
              className={`shrink-0 ${checkboxClass}`}
            />
            <span>{item.id}</span>
          </div>
        </TableCell>
      );
    if (column.id === "name")
      return (
        <TableCell key={column.id} className="font-medium text-slate-900">
          {item.name}
        </TableCell>
      );
    if (column.id === "cost")
      return (
        <TableCell key={column.id} className="font-medium text-slate-900">
          {formatCurrency(item.cost)}
        </TableCell>
      );
    if (column.id === "lastImport")
      return (
        <TableCell key={column.id} className="text-slate-600">
          {formatReadableDate(item.lastImport)}
        </TableCell>
      );
    if (column.id === "status") {
      const color = statusColor[item.status];
      return (
        <TableCell key={column.id}>
          <span
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium"
            style={{ color: color.text, backgroundColor: color.bg }}
          >
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: color.text }}
            />
            {item.status}
          </span>
        </TableCell>
      );
    }
    if (column.id === "note")
      return (
        <TableCell
          key={column.id}
          className="truncate text-slate-500"
          title={item.note}
        >
          {item.note}
        </TableCell>
      );
    if (column.id === "actions") {
      return (
        <TableCell key={column.id} className="px-4">
          <div className="flex items-center justify-start gap-1.5">
            <button
              type="button"
              className="inline-flex h-7 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50"
              onClick={() => openEditSupply(item)}
            >
              Sửa
            </button>
            <button
              type="button"
              className="inline-flex h-7 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-100"
              onClick={(e) => startDeleteSupply(item.id, e)}
            >
              Xóa
            </button>
          </div>
        </TableCell>
      );
    }
    const customValue = item[column.id];
    return (
      <TableCell
        key={column.id}
        className={customValue ? "text-slate-600" : "text-slate-400 italic"}
      >
        {customValue || "Chưa có"}
      </TableCell>
    );
  };

  const renderMachineCell = (item: WashingMachineItem, column: any) => {
    if (column.id === "id")
      return (
        <TableCell key={column.id} className="pl-4 font-medium text-slate-900">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              aria-label={`Chọn thiết bị ${item.id}`}
              checked={selectedMachineIds.has(item.id)}
              onChange={() => toggleMachineOne(item.id)}
              className={`shrink-0 ${checkboxClass}`}
            />
            <span>{item.id}</span>
          </div>
        </TableCell>
      );
    if (column.id === "name")
      return (
        <TableCell key={column.id} className="font-medium text-slate-900">
          {item.name}
        </TableCell>
      );
    if (column.id === "lastMaintenance" || column.id === "nextMaintenance")
      return (
        <TableCell key={column.id} className="text-slate-600">
          {formatReadableDate(item[column.id])}
        </TableCell>
      );
    if (column.id === "status") {
      const color = statusColor[item.status];
      return (
        <TableCell key={column.id}>
          <span
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium"
            style={{ color: color.text, backgroundColor: color.bg }}
          >
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: color.text }}
            />
            {item.status}
          </span>
        </TableCell>
      );
    }
    if (column.id === "note")
      return (
        <TableCell
          key={column.id}
          className="truncate text-slate-500"
          title={item.note}
        >
          {item.note}
        </TableCell>
      );
    if (column.id === "actions") {
      return (
        <TableCell key={column.id} className="px-4">
          <div className="flex items-center justify-start gap-1.5">
            <button
              type="button"
              className="inline-flex h-7 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50"
              onClick={() => openEditMachine(item)}
            >
              Sửa
            </button>
            <button
              type="button"
              className="inline-flex h-7 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-100"
              onClick={(e) => startDeleteMachine(item.id, e)}
            >
              Xóa
            </button>
          </div>
        </TableCell>
      );
    }
    const customValue = item[column.id];
    return (
      <TableCell
        key={column.id}
        className={customValue ? "text-slate-600" : "text-slate-400 italic"}
      >
        {customValue || "Chưa có"}
      </TableCell>
    );
  };

  const staffKanbanColumns = [
    { id: "Hoạt động", label: "Hoạt động", color: statusColor["Hoạt động"] },
    { id: "Nghỉ phép", label: "Nghỉ phép", color: statusColor["Nghỉ phép"] },
    { id: "Tạm nghỉ", label: "Tạm nghỉ", color: statusColor["Tạm nghỉ"] },
  ];

  const supplyKanbanColumns = [
    { id: "Ổn định", label: "Ổn định", color: statusColor["Ổn định"] },
    { id: "Sắp hết", label: "Sắp hết", color: statusColor["Sắp hết"] },
    { id: "Cần mua", label: "Cần mua", color: statusColor["Cần mua"] },
  ];

  const machineKanbanColumns = [
    { id: "Sẵn sàng", label: "Sẵn sàng", color: statusColor["Sẵn sàng"] },
    { id: "Đang chạy", label: "Đang chạy", color: statusColor["Đang chạy"] },
    { id: "Bảo trì", label: "Bảo trì", color: statusColor["Bảo trì"] },
  ];

  const renderStaffKanbanCard = (item: Staff) => {
    return (
      <div
        key={item.id}
        draggable
        onDragStart={(event) => {
          setDraggedStaffId(item.id);
          event.dataTransfer.effectAllowed = "move";
        }}
        onDragEnd={() => {
          setDraggedStaffId(null);
          setDragOverStaffStatus(null);
        }}
        className={`cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-slate-300 hover:shadow-md active:cursor-grabbing ${draggedStaffId === item.id ? "opacity-50 ring-2 ring-slate-400" : ""}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <input
              type="checkbox"
              aria-label={`Chọn ${item.name}`}
              checked={selectedStaffIds.has(item.id)}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              onChange={() => toggleStaffOne(item.id)}
              className={`shrink-0 ${checkboxClass}`}
            />
            <Image
              src={getSafeAvatarUrl(item.avatar)}
              alt={item.name}
              width={32}
              height={32}
              className="size-8 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-700">
                {item.name}
              </p>
              <p className="truncate text-[11px] text-slate-400">
                {item.phone}
              </p>
            </div>
          </div>
          <span className="shrink-0 text-[11px] font-semibold text-slate-400">
            {item.id}
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500 font-medium">
          Vai trò: {item.role} · Ca: {item.shift} · Ngày:{" "}
          {formatReadableDate(item.shiftDate)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Năng suất: {item.productivity} · Đánh giá: {item.rating}
        </p>
        <p className="mt-1 line-clamp-2 text-xs text-slate-400">{item.note}</p>
        <div className="mt-3 flex justify-end gap-1.5 border-t border-slate-100 pt-2">
          <button
            type="button"
            onClick={() => openEditStaff(item)}
            className="inline-flex h-6 items-center rounded-md bg-slate-100 px-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
          >
            Chi tiết
          </button>
          <button
            type="button"
            onClick={(e) => startDeleteStaff(item.id, e)}
            className="inline-flex h-6 items-center rounded-md bg-red-50 px-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-100/70"
          >
            Xóa
          </button>
        </div>
      </div>
    );
  };

  const renderSupplyKanbanCard = (item: Supply) => {
    return (
      <div
        key={item.id}
        draggable
        onDragStart={(event) => {
          setDraggedSupplyId(item.id);
          event.dataTransfer.effectAllowed = "move";
        }}
        onDragEnd={() => {
          setDraggedSupplyId(null);
          setDragOverSupplyStatus(null);
        }}
        className={`cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-slate-300 hover:shadow-md active:cursor-grabbing ${draggedSupplyId === item.id ? "opacity-50 ring-2 ring-slate-400" : ""}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <input
              type="checkbox"
              aria-label={`Chọn ${item.name}`}
              checked={selectedSupplyIds.has(item.id)}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              onChange={() => toggleSupplyOne(item.id)}
              className={`shrink-0 ${checkboxClass}`}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-700">
                {item.name}
              </p>
              <p className="truncate text-[11px] text-slate-400">
                {item.category}
              </p>
            </div>
          </div>
          <span className="shrink-0 text-[11px] font-semibold text-slate-400">
            {item.id}
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500 font-medium">
          Tồn kho: {item.stock} / Ngưỡng: {item.threshold}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Nhà cung cấp: {item.supplier} · Chi phí: {formatCurrency(item.cost)}
        </p>
        <p className="mt-1 line-clamp-2 text-xs text-slate-400">{item.note}</p>
        <div className="mt-3 flex justify-end gap-1.5 border-t border-slate-100 pt-2">
          <button
            type="button"
            onClick={() => openEditSupply(item)}
            className="inline-flex h-6 items-center rounded-md bg-slate-100 px-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
          >
            Chi tiết
          </button>
          <button
            type="button"
            onClick={(e) => startDeleteSupply(item.id, e)}
            className="inline-flex h-6 items-center rounded-md bg-red-50 px-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-100/70"
          >
            Xóa
          </button>
        </div>
      </div>
    );
  };

  const renderMachineKanbanCard = (item: WashingMachineItem) => {
    return (
      <div
        key={item.id}
        draggable
        onDragStart={(event) => {
          setDraggedMachineId(item.id);
          event.dataTransfer.effectAllowed = "move";
        }}
        onDragEnd={() => {
          setDraggedMachineId(null);
          setDragOverMachineStatus(null);
        }}
        className={`cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-slate-300 hover:shadow-md active:cursor-grabbing ${draggedMachineId === item.id ? "opacity-50 ring-2 ring-slate-400" : ""}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <input
              type="checkbox"
              aria-label={`Chọn ${item.name}`}
              checked={selectedMachineIds.has(item.id)}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              onChange={() => toggleMachineOne(item.id)}
              className={`shrink-0 ${checkboxClass}`}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-700">
                {item.name}
              </p>
              <p className="truncate text-[11px] text-slate-400">{item.area}</p>
            </div>
          </div>
          <span className="shrink-0 text-[11px] font-semibold text-slate-400">
            {item.id}
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500 font-medium">
          Công suất: {item.capacity} · Nhóm: {item.loadType}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Bảo trì: {formatReadableDate(item.lastMaintenance)} đến{" "}
          {formatReadableDate(item.nextMaintenance)}
        </p>
        <p className="mt-1 line-clamp-2 text-xs text-slate-400">{item.note}</p>
        <div className="mt-3 flex justify-end gap-1.5 border-t border-slate-100 pt-2">
          <button
            type="button"
            onClick={() => openEditMachine(item)}
            className="inline-flex h-6 items-center rounded-md bg-slate-100 px-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
          >
            Chi tiết
          </button>
          <button
            type="button"
            onClick={(e) => startDeleteMachine(item.id, e)}
            className="inline-flex h-6 items-center rounded-md bg-red-50 px-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-100/70"
          >
            Xóa
          </button>
        </div>
      </div>
    );
  };

  const renderStaffListRow = (item: Staff) => {
    return (
      <div
        key={item.id}
        className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <input
              type="checkbox"
              aria-label={`Chọn ${item.name}`}
              checked={selectedStaffIds.has(item.id)}
              onChange={() => toggleStaffOne(item.id)}
              className={`mt-1 shrink-0 ${checkboxClass}`}
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Image
                  src={getSafeAvatarUrl(item.avatar)}
                  alt={item.name}
                  width={24}
                  height={24}
                  className="size-6 rounded-full object-cover ring-1 ring-slate-100 shadow-sm"
                />
                <p className="font-semibold text-slate-950">{item.name}</p>
                <span className="text-xs font-medium text-slate-400">
                  {item.id}
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  {item.role}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium"
                  style={{
                    color: statusColor[item.status].text,
                    backgroundColor: statusColor[item.status].bg,
                  }}
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: statusColor[item.status].text }}
                  />
                  {item.status}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>Số điện thoại: {item.phone}</span>
                <span>
                  Ca chính: {item.shift} - {formatReadableDate(item.shiftDate)}
                </span>
                <span>Năng suất: {item.productivity}</span>
                <span>Đánh giá: {item.rating}</span>
              </div>
              <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                {item.note}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
            <button
              type="button"
              className="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-slate-50"
              onClick={() => openEditStaff(item)}
            >
              Sửa
            </button>
            <button
              type="button"
              className="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-100"
              onClick={(e) => startDeleteStaff(item.id, e)}
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSupplyListRow = (item: Supply) => {
    return (
      <div
        key={item.id}
        className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <input
              type="checkbox"
              aria-label={`Chọn ${item.name}`}
              checked={selectedSupplyIds.has(item.id)}
              onChange={() => toggleSupplyOne(item.id)}
              className={`mt-1 shrink-0 ${checkboxClass}`}
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-950">{item.name}</p>
                <span className="text-xs font-medium text-slate-400">
                  {item.id}
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  {item.category}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium"
                  style={{
                    color: statusColor[item.status].text,
                    backgroundColor: statusColor[item.status].bg,
                  }}
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: statusColor[item.status].text }}
                  />
                  {item.status}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>
                  Tồn kho: {item.stock} (Ngưỡng: {item.threshold})
                </span>
                <span>Nhà cung cấp: {item.supplier}</span>
                <span>
                  Ngày nhập gần nhất: {formatReadableDate(item.lastImport)}
                </span>
                <span>Chi phí: {formatCurrency(item.cost)}</span>
              </div>
              <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                {item.note}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
            <button
              type="button"
              className="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-slate-50"
              onClick={() => openEditSupply(item)}
            >
              Sửa
            </button>
            <button
              type="button"
              className="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-100"
              onClick={(e) => startDeleteSupply(item.id, e)}
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderMachineListRow = (item: WashingMachineItem) => {
    return (
      <div
        key={item.id}
        className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <input
              type="checkbox"
              aria-label={`Chọn ${item.name}`}
              checked={selectedMachineIds.has(item.id)}
              onChange={() => toggleMachineOne(item.id)}
              className={`mt-1 shrink-0 ${checkboxClass}`}
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-950">{item.name}</p>
                <span className="text-xs font-medium text-slate-400">
                  {item.id}
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  {item.area}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium"
                  style={{
                    color: statusColor[item.status].text,
                    backgroundColor: statusColor[item.status].bg,
                  }}
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: statusColor[item.status].text }}
                  />
                  {item.status}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>Công suất: {item.capacity}</span>
                <span>Nhóm thiết bị: {item.loadType}</span>
                <span>
                  Bảo trì gần nhất: {formatReadableDate(item.lastMaintenance)}
                </span>
                <span>
                  Bảo trì kế tiếp: {formatReadableDate(item.nextMaintenance)}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                {item.note}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
            <button
              type="button"
              className="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-slate-50"
              onClick={() => openEditMachine(item)}
            >
              Sửa
            </button>
            <button
              type="button"
              className="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-100"
              onClick={(e) => startDeleteMachine(item.id, e)}
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCell = (row: any, column: any) => {
    if (tab === "Nhân viên") return renderStaffCell(row, column);
    if (tab === "Kho vật tư") return renderSupplyCell(row, column);
    return renderMachineCell(row, column);
  };

  const leftContent = (
    <div className="flex flex-wrap items-center gap-1">
      {(
        [
          ["Nhân viên", Users],
          ["Kho vật tư", Package],
          ["Thiết bị giặt sấy", WashingMachine],
        ] as const
      ).map(([item, Icon]) => (
        <button
          key={item}
          type="button"
          onClick={() => {
            setTab(item);
            setPage(1);
            setQuery("");
            setSelectedStaffIds(new Set());
            setSelectedSupplyIds(new Set());
            setSelectedMachineIds(new Set());
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
      <ViewModeTabs value={viewMode} onChange={setViewMode} />
    </div>
  );

  const filterOptions = useMemo<FilterOption[]>(() => {
    if (tab === "Nhân viên") {
      return [
        {
          id: "Tất cả",
          label: "Tất cả",
          color: "#64748b",
          bgColor: "rgba(100,116,139,0.09)",
        },
        {
          id: "Hoạt động",
          label: "Hoạt động",
          color: "#059669",
          bgColor: "rgba(5,150,105,0.09)",
        },
        {
          id: "Nghỉ phép",
          label: "Nghỉ phép",
          color: "#d97706",
          bgColor: "rgba(217,119,6,0.09)",
        },
        {
          id: "Tạm nghỉ",
          label: "Tạm nghỉ",
          color: "#64748b",
          bgColor: "rgba(100,116,139,0.1)",
        },
      ];
    }
    if (tab === "Kho vật tư") {
      return [
        {
          id: "Tất cả",
          label: "Tất cả",
          color: "#64748b",
          bgColor: "rgba(100,116,139,0.09)",
        },
        {
          id: "Ổn định",
          label: "Ổn định",
          color: "#059669",
          bgColor: "rgba(5,150,105,0.09)",
        },
        {
          id: "Sắp hết",
          label: "Sắp hết",
          color: "#d97706",
          bgColor: "rgba(217,119,6,0.09)",
        },
        {
          id: "Cần mua",
          label: "Cần mua",
          color: "#dc2626",
          bgColor: "rgba(220,38,38,0.09)",
        },
      ];
    }
    return [
      {
        id: "Tất cả",
        label: "Tất cả",
        color: "#64748b",
        bgColor: "rgba(100,116,139,0.09)",
      },
      {
        id: "Sẵn sàng",
        label: "Sẵn sàng",
        color: "#059669",
        bgColor: "rgba(5,150,105,0.09)",
      },
      {
        id: "Đang chạy",
        label: "Đang chạy",
        color: "#2563eb",
        bgColor: "rgba(37,99,235,0.09)",
      },
      {
        id: "Bảo trì",
        label: "Bảo trì",
        color: "#d97706",
        bgColor: "rgba(217,119,6,0.09)",
      },
    ];
  }, [tab]);

  return (
    <PageShell fullHeight>
      <div className="grid shrink-0 gap-3 md:grid-cols-4">
        <MetricCard
          title="Nhân viên hoạt động"
          value={`${staff.filter((item) => item.status === "Hoạt động").length}`}
          hint={`${staff.length} hồ sơ nội bộ`}
          icon={Users}
          color="#2563eb"
        />
        <MetricCard
          title="Năng suất"
          value="128 đơn"
          hint={`Theo ${rangeLabel}`}
          icon={TrendingUp}
          color="#059669"
        />
        <MetricCard
          title="Vật tư cảnh báo"
          value={`${lowStock}`}
          hint="Sắp hết hoặc cần mua"
          icon={Package}
          color="#dc2626"
        />
        <MetricCard
          title="Chi phí nhập vật tư"
          value={formatCurrency(purchaseCost)}
          hint="Tổng ngân sách đã chi"
          icon={CircleDollarSign}
          color="#d97706"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <Toolbar
          leftContent={leftContent}
          query={query}
          onQueryChange={(q) => {
            setQuery(q);
            setPage(1);
          }}
          columns={activeColumns}
          onColumnsChange={setColumnsActive as any}
          tableResizeMode={tableResizeMode}
          onTableResizeModeChange={setTableResizeMode}
          selectedCount={
            tab === "Nhân viên"
              ? selectedStaffIds.size
              : tab === "Kho vật tư"
                ? selectedSupplyIds.size
                : selectedMachineIds.size
          }
          onOpenAddColumn={() => setOpenAddColumn(true)}
          onOpenHistory={() => {}}
          onExport={handleExport}
          defaultExportFileName={getDefaultExportFileName()}
          onCreateClick={
            tab === "Nhân viên"
              ? openCreateStaff
              : tab === "Kho vật tư"
                ? openCreateSupply
                : openCreateMachine
          }
          createLabel={
            tab === "Nhân viên"
              ? "Thêm nhân viên"
              : tab === "Kho vật tư"
                ? "Thêm vật tư"
                : "Thêm thiết bị"
          }
          defaultColumnIds={(tab === "Nhân viên"
            ? defaultStaffColumns
            : tab === "Kho vật tư"
              ? defaultSupplyColumns
              : defaultMachineColumns
          ).map((c) => c.id)}
          searchPlaceholder={
            tab === "Nhân viên"
              ? "Tìm nhân viên, ca, vai trò..."
              : tab === "Kho vật tư"
                ? "Tìm vật tư, nhà cung cấp..."
                : "Tìm thiết bị giặt sấy, khu vực, công suất..."
          }
          showHistoryButton={false}
        />

        <FilterBar
          rangeLabel={rangeLabel}
          selectedValue={
            tab === "Nhân viên"
              ? selectedStaffStatus
              : tab === "Kho vật tư"
                ? selectedSupplyStatus
                : selectedMachineStatus
          }
          onValueChange={(val) => {
            if (tab === "Nhân viên") setSelectedStaffStatus(val);
            else if (tab === "Kho vật tư") setSelectedSupplyStatus(val);
            else setSelectedMachineStatus(val);
            setPage(1);
          }}
          filterOptions={filterOptions}
          filterLabel="Lọc trạng thái"
          showSelectionBar={
            viewMode === "Bảng" ||
            viewMode === "Bảng kéo" ||
            viewMode === "Danh sách"
          }
          allSelected={
            tab === "Nhân viên"
              ? viewMode === "Bảng kéo"
                ? allKanbanStaffSelected
                : allVisibleStaffSelected
              : tab === "Kho vật tư"
                ? viewMode === "Bảng kéo"
                  ? allKanbanSuppliesSelected
                  : allVisibleSuppliesSelected
                : viewMode === "Bảng kéo"
                  ? allKanbanMachinesSelected
                  : allVisibleMachinesSelected
          }
          disabled={
            tab === "Nhân viên"
              ? viewMode === "Bảng kéo"
                ? kanbanStaffIds.length === 0
                : visibleStaffIds.length === 0
              : tab === "Kho vật tư"
                ? viewMode === "Bảng kéo"
                  ? kanbanSupplyIds.length === 0
                  : visibleSupplyIds.length === 0
                : viewMode === "Bảng kéo"
                  ? kanbanMachineIds.length === 0
                  : visibleMachineIds.length === 0
          }
          selectedCount={
            tab === "Nhân viên"
              ? viewMode === "Bảng kéo"
                ? selectedKanbanStaffCount
                : selectedVisibleStaffCount
              : tab === "Kho vật tư"
                ? viewMode === "Bảng kéo"
                  ? selectedKanbanSupplyCount
                  : selectedVisibleSupplyCount
                : viewMode === "Bảng kéo"
                  ? selectedKanbanMachineCount
                  : selectedVisibleMachineCount
          }
          totalCount={
            tab === "Nhân viên"
              ? viewMode === "Bảng kéo"
                ? kanbanStaffIds.length
                : visibleStaffIds.length
              : tab === "Kho vật tư"
                ? viewMode === "Bảng kéo"
                  ? kanbanSupplyIds.length
                  : visibleSupplyIds.length
                : viewMode === "Bảng kéo"
                  ? kanbanMachineIds.length
                  : visibleMachineIds.length
          }
          itemLabel={
            tab === "Nhân viên"
              ? "nhân viên"
              : tab === "Kho vật tư"
                ? "vật tư"
                : "thiết bị"
          }
          checkboxClass={checkboxClass}
          onToggleAll={
            tab === "Nhân viên"
              ? viewMode === "Bảng kéo"
                ? toggleKanbanStaff
                : toggleVisibleStaff
              : tab === "Kho vật tư"
                ? viewMode === "Bảng kéo"
                  ? toggleKanbanSupplies
                  : toggleVisibleSupplies
                : viewMode === "Bảng kéo"
                  ? toggleKanbanMachines
                  : toggleVisibleMachines
          }
        />

        {viewMode === "Bảng kéo" &&
        (tab === "Nhân viên" ||
          tab === "Kho vật tư" ||
          tab === "Thiết bị giặt sấy") ? (
          tab === "Nhân viên" ? (
            <KanbanView
              columns={staffKanbanColumns}
              rows={filteredStaff}
              groupByKey="status"
              draggedItemId={draggedStaffId}
              onDraggedItemIdChange={setDraggedStaffId}
              dragOverColumnId={dragOverStaffStatus}
              onDragOverColumnIdChange={setDragOverStaffStatus}
              onDropItem={(staffId, status) => {
                setStaff((prev) =>
                  prev.map((s) =>
                    s.id === staffId
                      ? { ...s, status: status as StaffStatus }
                      : s,
                  ),
                );
              }}
              renderCard={renderStaffKanbanCard}
              tableResizeMode={tableResizeMode}
            />
          ) : tab === "Kho vật tư" ? (
            <KanbanView
              columns={supplyKanbanColumns}
              rows={filteredSupplies}
              groupByKey="status"
              draggedItemId={draggedSupplyId}
              onDraggedItemIdChange={setDraggedSupplyId}
              dragOverColumnId={dragOverSupplyStatus}
              onDragOverColumnIdChange={setDragOverSupplyStatus}
              onDropItem={(supplyId, status) => {
                setSupplies((prev) =>
                  prev.map((s) =>
                    s.id === supplyId
                      ? { ...s, status: status as SupplyStatus }
                      : s,
                  ),
                );
              }}
              renderCard={renderSupplyKanbanCard}
              tableResizeMode={tableResizeMode}
            />
          ) : (
            <KanbanView
              columns={machineKanbanColumns}
              rows={filteredMachines}
              groupByKey="status"
              draggedItemId={draggedMachineId}
              onDraggedItemIdChange={setDraggedMachineId}
              dragOverColumnId={dragOverMachineStatus}
              onDragOverColumnIdChange={setDragOverMachineStatus}
              onDropItem={(machineId, status) => {
                setMachines((prev) =>
                  prev.map((m) =>
                    m.id === machineId
                      ? { ...m, status: status as MachineStatus }
                      : m,
                  ),
                );
              }}
              renderCard={renderMachineKanbanCard}
              tableResizeMode={tableResizeMode}
            />
          )
        ) : viewMode === "Danh sách" &&
          (tab === "Nhân viên" ||
            tab === "Kho vật tư" ||
            tab === "Thiết bị giặt sấy") ? (
          tab === "Nhân viên" ? (
            <ListView
              paginatedRows={paginatedStaff}
              emptyMessage="Không tìm thấy nhân viên phù hợp."
              renderRow={renderStaffListRow}
            />
          ) : tab === "Kho vật tư" ? (
            <ListView
              paginatedRows={paginatedSupplies}
              emptyMessage="Không tìm thấy vật tư phù hợp."
              renderRow={renderSupplyListRow}
            />
          ) : (
            <ListView
              paginatedRows={paginatedMachines}
              emptyMessage="Không tìm thấy thiết bị phù hợp."
              renderRow={renderMachineListRow}
            />
          )
        ) : (
          <TableView
            columns={activeColumns}
            onColumnsChange={setColumnsActive as any}
            rows={activePaginatedRows}
            columnDrag={{
              draggedColumnId,
              dragOverColumnId,
              onDragStart: handleDragStart,
              onDragOver: handleDragOver,
              onDragLeave: handleDragLeave,
              onDrop: handleDrop,
              onDragEnd: handleDragEnd,
            }}
            pageSize={pageSize}
            emptyMessage={
              tab === "Nhân viên"
                ? "Không tìm thấy nhân viên phù hợp."
                : tab === "Kho vật tư"
                  ? "Không tìm thấy vật tư phù hợp."
                  : "Không tìm thấy thiết bị phù hợp."
            }
            tableResizeMode={tableResizeMode}
            totalVisibleWidth={totalVisibleWidth}
            renderCell={renderCell}
            page={page}
            pageCount={pageCount}
            totalRows={activeRows.length}
            totalLabel={
              tab === "Kho vật tư"
                ? `Tổng chi phí: ${totalCost.toLocaleString("vi-VN")}đ`
                : undefined
            }
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

      <FormDialog
        open={openStaffForm}
        onClose={() => setOpenStaffForm(false)}
        title={
          editingStaffId ? `Chỉnh sửa ${editingStaffId}` : "Thêm nhân viên mới"
        }
        fields={orderedStaffFormFields}
        form={staffForm}
        onFormChange={setStaffForm}
        onSave={saveStaff}
        statusOptions={["Hoạt động", "Nghỉ phép", "Tạm nghỉ"]}
        statusDotColors={statusDotColors}
        showCloseButton={false}
        showCloseButtonAtBottom={true}
      />

      <FormDialog
        open={openSupplyForm}
        onClose={() => setOpenSupplyForm(false)}
        title={
          editingSupplyId ? `Chỉnh sửa ${editingSupplyId}` : "Thêm vật tư mới"
        }
        fields={orderedSupplyFormFields}
        form={supplyForm}
        onFormChange={setSupplyForm}
        onSave={saveSupply}
        statusOptions={["Ổn định", "Sắp hết", "Cần mua"]}
        statusDotColors={statusDotColors}
        showCloseButton={false}
        showCloseButtonAtBottom={true}
      />

      <FormDialog
        open={openMachineForm}
        onClose={() => setOpenMachineForm(false)}
        title={
          editingMachineId
            ? `Chỉnh sửa ${editingMachineId}`
            : "Thêm thiết bị giặt sấy mới"
        }
        fields={orderedMachineFormFields}
        form={machineForm}
        onFormChange={setMachineForm}
        onSave={saveMachine}
        statusOptions={["Sẵn sàng", "Đang chạy", "Bảo trì"]}
        statusDotColors={statusDotColors}
        showCloseButton={false}
        showCloseButtonAtBottom={true}
      />

      <AddColumnDialog
        open={openAddColumn}
        onOpenChange={setOpenAddColumn}
        newColumnName={newColumnName}
        onNewColumnNameChange={setNewColumnName}
        onAddColumn={addCustomColumn}
      />

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[400px] bg-white rounded-xl border border-slate-200 shadow-xl p-6"
        >
          <DialogHeader className="pb-3 border-b border-slate-100">
            <DialogTitle className="text-base font-semibold text-slate-900">
              Xác nhận xóa
            </DialogTitle>
          </DialogHeader>
          <div className="py-5 text-sm text-slate-600">
            Bạn có chắc chắn muốn xóa{" "}
            {deletingStaffId
              ? "nhân viên"
              : deletingSupplyId
                ? "vật tư"
                : "thiết bị"}{" "}
            này không? Hành động này không thể hoàn tác.
          </div>
          <DialogFooter className="flex flex-row items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 w-full sm:w-auto"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Hủy
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700 w-full sm:w-auto"
              onClick={handleDeleteConfirm}
            >
              Xác nhận xóa
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
