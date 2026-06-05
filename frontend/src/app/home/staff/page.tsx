"use client";

import { useMemo, useState } from "react";
import { Users, Clock, Package, TrendingUp, Pencil } from "lucide-react";
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
import { HistoryModal } from "../_components/history-modal";
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
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
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
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
};

const defaultStaffColumns = [
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

const defaultShiftColumns = [
  { id: "id", label: "Mã ca", width: 116, visible: true },
  { id: "day", label: "Ngày", width: 104, visible: true },
  { id: "morning", label: "Ca sáng", width: 190, visible: true },
  { id: "afternoon", label: "Ca chiều", width: 190, visible: true },
  { id: "evening", label: "Ca tối", width: 190, visible: true },
  { id: "workload", label: "Tải việc", width: 160, visible: true },
  { id: "status", label: "Trạng thái", width: 112, visible: true },
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

const seedStaff: Staff[] = [
  { id: "NV-101", name: "Nguyễn Văn A", role: "Giặt", shift: "Sáng", phone: "0903123456", productivity: "32 đơn", rating: "4.8/5", status: "Hoạt động", note: "Phụ trách máy giặt 01", createdAt: "05/06/2026, 08:00:00", updatedAt: "05/06/2026, 08:00:00" },
  { id: "NV-102", name: "Trần Thị B", role: "Gấp/Là", shift: "Chiều", phone: "0912456789", productivity: "25 đơn", rating: "4.7/5", status: "Hoạt động", note: "Kiểm tra đồ trắng", createdAt: "05/06/2026, 08:00:00", updatedAt: "05/06/2026, 08:00:00" },
  { id: "NV-103", name: "Lê Hoàng C", role: "Giao nhận", shift: "Tối", phone: "0938123456", productivity: "18 chuyến", rating: "4.6/5", status: "Hoạt động", note: "Tuyến Quận 1", createdAt: "05/06/2026, 08:00:00", updatedAt: "05/06/2026, 08:00:00" },
  { id: "NV-104", name: "Phạm Duy D", role: "Thu ngân", shift: "Sáng", phone: "0988333444", productivity: "42 giao dịch", rating: "-", status: "Nghỉ phép", note: "Nghỉ đến 02/06", createdAt: "05/06/2026, 08:00:00", updatedAt: "05/06/2026, 08:00:00" },
  { id: "NV-105", name: "Hoàng Minh Tâm", role: "Kiểm đồ", shift: "Chiều", phone: "0977000111", productivity: "37 đơn", rating: "4.9/5", status: "Hoạt động", note: "Đối soát đồ lỗi", createdAt: "05/06/2026, 08:00:00", updatedAt: "05/06/2026, 08:00:00" },
  { id: "NV-106", name: "Vũ Thanh Mai", role: "Kho", shift: "Sáng", phone: "0909555666", productivity: "16 phiếu", rating: "4.5/5", status: "Tạm nghỉ", note: "Đào tạo lại quy trình nhập kho", createdAt: "05/06/2026, 08:00:00", updatedAt: "05/06/2026, 08:00:00" },
];

const seedShifts: Shift[] = [
  { id: "CA-201", day: "Thứ 2", morning: "A, D, Mai", afternoon: "B, Tâm", evening: "C", workload: "128 đơn dự kiến", status: "Đủ người" },
  { id: "CA-202", day: "Thứ 3", morning: "A, Mai", afternoon: "B, D", evening: "C, Tâm", workload: "112 đơn dự kiến", status: "Đủ người" },
  { id: "CA-203", day: "Thứ 4", morning: "A, B", afternoon: "D, Tâm", evening: "C", workload: "136 đơn dự kiến", status: "Thiếu người" },
  { id: "CA-204", day: "Thứ 5", morning: "D, Mai", afternoon: "A, B", evening: "C", workload: "104 đơn dự kiến", status: "Đủ người" },
  { id: "CA-205", day: "Thứ 6", morning: "A, Tâm", afternoon: "B, Mai", evening: "C, D", workload: "154 đơn dự kiến", status: "Thiếu người" },
];

const seedSupplies: Supply[] = [
  { id: "VT-301", name: "Hóa chất giặt", category: "Hóa chất", stock: "25 kg", threshold: "10 kg", supplier: "EcoWash", lastImport: "12/05/2026", cost: 1800000, status: "Ổn định", note: "Dùng cho máy giặt 01, 02", createdAt: "05/06/2026, 08:00:00", updatedAt: "05/06/2026, 08:00:00" },
  { id: "VT-302", name: "Nước xả", category: "Hóa chất", stock: "6 lít", threshold: "8 lít", supplier: "CleanPro", lastImport: "16/05/2026", cost: 720000, status: "Sắp hết", note: "Cần mua trong 2 ngày", createdAt: "05/06/2026, 08:00:00", updatedAt: "05/06/2026, 08:00:00" },
  { id: "VT-303", name: "Túi đựng", category: "Bao bì", stock: "120 cái", threshold: "50 cái", supplier: "Kho tổng", lastImport: "15/05/2026", cost: 460000, status: "Ổn định", note: "Túi size M/L", createdAt: "05/06/2026, 08:00:00", updatedAt: "05/06/2026, 08:00:00" },
  { id: "VT-304", name: "Móc áo", category: "Phụ kiện", stock: "75 cái", threshold: "100 cái", supplier: "Nhựa Minh An", lastImport: "10/05/2026", cost: 1250000, status: "Cần mua", note: "Ưu tiên móc áo vest", createdAt: "05/06/2026, 08:00:00", updatedAt: "05/06/2026, 08:00:00" },
  { id: "VT-305", name: "Tem mã đơn", category: "Bao bì", stock: "3 cuộn", threshold: "2 cuộn", supplier: "In nhanh Q1", lastImport: "08/05/2026", cost: 360000, status: "Ổn định", note: "Dùng cho tiếp nhận", createdAt: "05/06/2026, 08:00:00", updatedAt: "05/06/2026, 08:00:00" },
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

const statusColor: Record<string, { text: string; bg: string }> = {
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

const staffFormFields: FormField[] = [
  { id: "name", label: "Họ tên", type: "text", placeholder: "Tên nhân viên" },
  { id: "phone", label: "Số điện thoại", type: "text", placeholder: "090..." },
  { id: "role", label: "Vai trò", type: "text", placeholder: "Giặt / Gấp/Là / Giao nhận..." },
  { id: "shift", label: "Ca chính", type: "text", placeholder: "Sáng / Chiều / Tối" },
  { id: "productivity", label: "Năng suất", type: "text", placeholder: "32 đơn" },
  { id: "rating", label: "Đánh giá", type: "text", placeholder: "4.8/5" },
  { id: "status", label: "Trạng thái", type: "select", options: ["Hoạt động", "Nghỉ phép", "Tạm nghỉ"] },
  { id: "note", label: "Ghi chú vận hành", type: "textarea", placeholder: "Khu vực phụ trách, kỹ năng, lịch nghỉ..." },
];

const supplyFormFields: FormField[] = [
  { id: "name", label: "Tên vật tư", type: "text", placeholder: "Nước xả" },
  { id: "category", label: "Nhóm", type: "text", placeholder: "Hóa chất / Bao bì / Phụ kiện" },
  { id: "stock", label: "Tồn kho", type: "text", placeholder: "20 lít" },
  { id: "threshold", label: "Ngưỡng cảnh báo", type: "text", placeholder: "8 lít" },
  { id: "supplier", label: "Nhà cung cấp", type: "text", placeholder: "EcoWash / CleanPro..." },
  { id: "lastImport", label: "Ngày nhập", type: "text", placeholder: "31/05/2026" },
  { id: "cost", label: "Chi phí nhập", type: "number" },
  { id: "status", label: "Cảnh báo", type: "select", options: ["Ổn định", "Sắp hết", "Cần mua"] },
  { id: "note", label: "Ghi chú", type: "textarea", placeholder: "Kế hoạch mua, khu vực lưu kho..." },
];

export default function StaffOperationsPage() {
  const [tab, setTab] = useState<Tab>("Nhân viên");
  const [staff, setStaff] = useState(seedStaff);
  const [supplies, setSupplies] = useState(seedSupplies);
  const [query, setQuery] = useState("");
  const [selectedStaffStatus, setSelectedStaffStatus] = useState<string>("Tất cả");
  const [selectedSupplyStatus, setSelectedSupplyStatus] = useState<string>("Tất cả");
  const [viewMode, setViewMode] = useState<"Bảng" | "Bảng kéo" | "Danh sách">("Bảng");
  const [selectedStaffIds, setSelectedStaffIds] = useState<Set<string>>(new Set());
  const [selectedSupplyIds, setSelectedSupplyIds] = useState<Set<string>>(new Set());
  const [openHistory, setOpenHistory] = useState(false);
  const [activeHistoryItemId, setActiveHistoryItemId] = useState<string | null>(null);

  const [draggedStaffId, setDraggedStaffId] = useState<string | null>(null);
  const [dragOverStaffStatus, setDragOverStaffStatus] = useState<string | null>(null);
  const [draggedSupplyId, setDraggedSupplyId] = useState<string | null>(null);
  const [dragOverSupplyStatus, setDragOverSupplyStatus] = useState<string | null>(null);

  const checkboxClass =
    "relative size-4 appearance-none rounded-[5px] border border-slate-300 bg-white transition-all duration-150 checked:border-emerald-300 checked:bg-emerald-300 after:absolute after:left-1/2 after:top-1/2 after:hidden after:h-[9px] after:w-[5px] after:-translate-x-1/2 after:-translate-y-[58%] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:content-[''] checked:after:block";

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [columnsStaff, setColumnsStaff] = useState(defaultStaffColumns);
  const [columnsShift, setColumnsShift] = useState(defaultShiftColumns);
  const [columnsSupply, setColumnsSupply] = useState(defaultSupplyColumns);

  const activeColumns = tab === "Nhân viên" ? columnsStaff : tab === "Ca làm" ? columnsShift : columnsSupply;
  const setColumnsActive = tab === "Nhân viên" ? setColumnsStaff : tab === "Ca làm" ? setColumnsShift : setColumnsSupply;

  const [tableResizeMode, setTableResizeMode] = useState<"fit" | "custom">("fit");
  const [openStaffForm, setOpenStaffForm] = useState(false);
  const [openSupplyForm, setOpenSupplyForm] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [editingSupplyId, setEditingSupplyId] = useState<string | null>(null);
  const [staffForm, setStaffForm] = useState<Record<string, string>>(emptyStaffForm);
  const [supplyForm, setSupplyForm] = useState<Record<string, string>>(emptySupplyForm);
  const [openPageSizeMenu, setOpenPageSizeMenu] = useState(false);
  const [customPageSize, setCustomPageSize] = useState("");
  const [openAddColumn, setOpenAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

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

  const activePaginatedRows = tab === "Nhân viên" ? paginatedStaff : tab === "Ca làm" ? paginatedShifts : paginatedSupplies;
  const totalVisibleWidth = activeColumns.filter(c => c.visible).reduce((sum, column) => sum + (column.width || 150), 0);

  const visibleStaffIds = useMemo(() => paginatedStaff.map((s) => s.id), [paginatedStaff]);
  const kanbanStaffIds = useMemo(() => filteredStaff.map((s) => s.id), [filteredStaff]);
  const selectedStaff = useMemo(() => staff.filter((s) => selectedStaffIds.has(s.id)), [staff, selectedStaffIds]);

  const allVisibleStaffSelected = visibleStaffIds.length > 0 && visibleStaffIds.every((id) => selectedStaffIds.has(id));
  const allKanbanStaffSelected = kanbanStaffIds.length > 0 && kanbanStaffIds.every((id) => selectedStaffIds.has(id));
  const selectedVisibleStaffCount = visibleStaffIds.filter((id) => selectedStaffIds.has(id)).length;
  const selectedKanbanStaffCount = kanbanStaffIds.filter((id) => selectedStaffIds.has(id)).length;

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
  const visibleSupplyIds = useMemo(() => paginatedSupplies.map((s) => s.id), [paginatedSupplies]);
  const kanbanSupplyIds = useMemo(() => filteredSupplies.map((s) => s.id), [filteredSupplies]);
  const selectedSupplies = useMemo(() => supplies.filter((s) => selectedSupplyIds.has(s.id)), [supplies, selectedSupplyIds]);

  const allVisibleSuppliesSelected = visibleSupplyIds.length > 0 && visibleSupplyIds.every((id) => selectedSupplyIds.has(id));
  const allKanbanSuppliesSelected = kanbanSupplyIds.length > 0 && kanbanSupplyIds.every((id) => selectedSupplyIds.has(id));
  const selectedVisibleSupplyCount = visibleSupplyIds.filter((id) => selectedSupplyIds.has(id)).length;
  const selectedKanbanSupplyCount = kanbanSupplyIds.filter((id) => selectedSupplyIds.has(id)).length;

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

  const totalCost = useMemo(() => filteredSupplies.reduce((sum, item) => sum + item.cost, 0), [filteredSupplies]);
  
  const lowStock = supplies.filter((item) => item.status !== "Ổn định").length;
  const purchaseCost = supplies.reduce((sum, item) => sum + item.cost, 0);

  const customColumnsStaff = useMemo(
    () => columnsStaff.filter((col) => !defaultStaffColumns.some((dc) => dc.id === col.id)),
    [columnsStaff]
  );
  
  const customColumnsSupply = useMemo(
    () => columnsSupply.filter((col) => !defaultSupplyColumns.some((dc) => dc.id === col.id)),
    [columnsSupply]
  );

  const openCreateStaff = () => {
    setEditingStaffId(null);
    const customFieldsDefaults = Object.fromEntries(customColumnsStaff.map(col => [col.id, ""]));
    setStaffForm({ ...emptyStaffForm, ...customFieldsDefaults });
    setOpenStaffForm(true);
  };

  const openEditStaff = (item: Staff) => {
    setEditingStaffId(item.id);
    const customFieldsDefaults = Object.fromEntries(customColumnsStaff.map(col => [col.id, item[col.id] || ""]));
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
      phone: staffForm.phone,
      role: staffForm.role,
      shift: staffForm.shift,
      productivity: staffForm.productivity || "0 đơn",
      rating: staffForm.rating || "-",
      status: staffForm.status as StaffStatus,
      note: staffForm.note,
      ...Object.fromEntries(customColumnsStaff.map(col => [col.id, staffForm[col.id] || ""]))
    };
    if (editingStaffId) {
      setStaff((prev) => prev.map((item) => item.id === editingStaffId ? { ...item, ...payload } : item));
    } else {
      setStaff((prev) => [{ id: `NV-${Date.now().toString().slice(-3)}`, ...payload } as Staff, ...prev]);
    }
    setPage(1);
    setOpenStaffForm(false);
  };

  const openCreateSupply = () => {
    setEditingSupplyId(null);
    const customFieldsDefaults = Object.fromEntries(customColumnsSupply.map(col => [col.id, ""]));
    setSupplyForm({ ...emptySupplyForm, ...customFieldsDefaults });
    setOpenSupplyForm(true);
  };

  const openEditSupply = (item: Supply) => {
    setEditingSupplyId(item.id);
    const customFieldsDefaults = Object.fromEntries(customColumnsSupply.map(col => [col.id, item[col.id] || ""]));
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
      ...Object.fromEntries(customColumnsSupply.map(col => [col.id, supplyForm[col.id] || ""]))
    };
    if (editingSupplyId) {
      setSupplies((prev) => prev.map((item) => item.id === editingSupplyId ? { ...item, ...payload } : item));
    } else {
      setSupplies((prev) => [{ id: `VT-${Date.now().toString().slice(-3)}`, ...payload } as Supply, ...prev]);
    }
    setPage(1);
    setOpenSupplyForm(false);
  };

  const getDefaultExportFileName = () => {
    const scope = tab === "Nhân viên" ? "nhan-vien" : tab === "Ca làm" ? "ca-lam" : "kho-vat-tu";
    return `${scope}-${new Date().toISOString().slice(0, 10)}`;
  };

  const handleExport = (format: "pdf" | "excel" | "csv", fileName: string) => {
    const rows = activeRows;
    if (rows.length === 0) return;
    const baseFileName = fileName || getDefaultExportFileName();
    const headers = activeColumns.filter(c => c.id !== "actions" && c.visible).map(c => c.label);
    
    if (format === "csv") {
      const csvData = rows.map(row => 
        activeColumns.filter(c => c.id !== "actions" && c.visible).map(c => {
          let val = (row as any)[c.id] ?? "";
          if (c.id === "cost") val = formatCurrency(Number(val));
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
        `<tr>${activeColumns.filter(c => c.id !== "actions" && c.visible).map(c => {
          let val = (row as any)[c.id] ?? "";
          if (c.id === "cost") val = formatCurrency(Number(val));
          return `<td>${val}</td>`;
        }).join("")}</tr>`
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
        `<tr>${activeColumns.filter(c => c.id !== "actions" && c.visible).map(c => {
          let val = (row as any)[c.id] ?? "";
          if (c.id === "cost") val = formatCurrency(Number(val));
          return `<td>${val}</td>`;
        }).join("")}</tr>`
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

  const renderStaffCell = (item: Staff, column: any) => {
    if (column.id === "id") return (
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
    if (column.id === "name") return <TableCell key={column.id} className="font-medium text-slate-900">{item.name}</TableCell>;
    if (column.id === "phone") {
      return (
        <TableCell key={column.id}>
          <a href={`tel:${item.phone}`} className="text-slate-500 hover:text-slate-800">
            {item.phone}
          </a>
        </TableCell>
      );
    }
    if (column.id === "status") {
      const color = statusColor[item.status];
      return (
        <TableCell key={column.id}>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium" style={{ color: color.text, backgroundColor: color.bg }}>
            <span className="size-1.5 rounded-full" style={{ backgroundColor: color.text }} />
            {item.status}
          </span>
        </TableCell>
      );
    }
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
    const customValue = item[column.id];
    return <TableCell key={column.id} className={customValue ? "text-slate-600" : "text-slate-400 italic"}>{customValue || "Chưa có"}</TableCell>;
  };

  const renderShiftCell = (item: Shift, column: any) => {
    if (column.id === "id") return <TableCell key={column.id} className="pl-4 font-medium text-slate-900">{item.id}</TableCell>;
    if (column.id === "status") {
      const color = statusColor[item.status];
      return (
        <TableCell key={column.id}>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium" style={{ color: color.text, backgroundColor: color.bg }}>
            <span className="size-1.5 rounded-full" style={{ backgroundColor: color.text }} />
            {item.status}
          </span>
        </TableCell>
      );
    }
    return <TableCell key={column.id}>{String(item[column.id as keyof Shift] ?? "")}</TableCell>;
  };

  const renderSupplyCell = (item: Supply, column: any) => {
    if (column.id === "id") return (
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
    if (column.id === "name") return <TableCell key={column.id} className="font-medium text-slate-900">{item.name}</TableCell>;
    if (column.id === "cost") return <TableCell key={column.id} className="font-medium text-slate-900">{formatCurrency(item.cost)}</TableCell>;
    if (column.id === "status") {
      const color = statusColor[item.status];
      return (
        <TableCell key={column.id}>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium" style={{ color: color.text, backgroundColor: color.bg }}>
            <span className="size-1.5 rounded-full" style={{ backgroundColor: color.text }} />
            {item.status}
          </span>
        </TableCell>
      );
    }
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
    const customValue = item[column.id];
    return <TableCell key={column.id} className={customValue ? "text-slate-600" : "text-slate-400 italic"}>{customValue || "Chưa có"}</TableCell>;
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
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-700">{item.name}</p>
              <p className="truncate text-[11px] text-slate-400">{item.phone}</p>
            </div>
          </div>
          <span className="shrink-0 text-[11px] font-semibold text-slate-400">{item.id}</span>
        </div>
        <p className="mt-2 text-xs text-slate-500 font-medium">Vai trò: {item.role} · Ca: {item.shift}</p>
        <p className="mt-1 text-xs text-slate-500">Năng suất: {item.productivity} · Đánh giá: {item.rating}</p>
        <p className="mt-1 line-clamp-2 text-xs text-slate-400">{item.note}</p>
        <div className="mt-3 flex justify-end border-t border-slate-100 pt-2">
          <button
            type="button"
            onClick={() => openEditStaff(item)}
            className="inline-flex h-6 items-center rounded-md bg-slate-100 px-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
          >
            Chi tiết
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
              <p className="truncate text-sm font-medium text-slate-700">{item.name}</p>
              <p className="truncate text-[11px] text-slate-400">{item.category}</p>
            </div>
          </div>
          <span className="shrink-0 text-[11px] font-semibold text-slate-400">{item.id}</span>
        </div>
        <p className="mt-2 text-xs text-slate-500 font-medium">Tồn kho: {item.stock} / Ngưỡng: {item.threshold}</p>
        <p className="mt-1 text-xs text-slate-500">Nhà cung cấp: {item.supplier} · Chi phí: {formatCurrency(item.cost)}</p>
        <p className="mt-1 line-clamp-2 text-xs text-slate-400">{item.note}</p>
        <div className="mt-3 flex justify-end border-t border-slate-100 pt-2">
          <button
            type="button"
            onClick={() => openEditSupply(item)}
            className="inline-flex h-6 items-center rounded-md bg-slate-100 px-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
          >
            Chi tiết
          </button>
        </div>
      </div>
    );
  };

  const renderStaffListRow = (item: Staff) => {
    return (
      <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300">
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
                <p className="font-semibold text-slate-950">{item.name}</p>
                <span className="text-xs font-medium text-slate-400">{item.id}</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{item.role}</span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium"
                  style={{
                    color: statusColor[item.status].text,
                    backgroundColor: statusColor[item.status].bg,
                  }}
                >
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: statusColor[item.status].text }} />
                  {item.status}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>Số điện thoại: {item.phone}</span>
                <span>Ca chính: {item.shift}</span>
                <span>Năng suất: {item.productivity}</span>
                <span>Đánh giá: {item.rating}</span>
              </div>
              <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">{item.note}</p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-slate-50"
              onClick={() => openEditStaff(item)}
            >
              <Pencil className="size-3.5" />
              Sửa
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSupplyListRow = (item: Supply) => {
    return (
      <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300">
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
                <span className="text-xs font-medium text-slate-400">{item.id}</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{item.category}</span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium"
                  style={{
                    color: statusColor[item.status].text,
                    backgroundColor: statusColor[item.status].bg,
                  }}
                >
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: statusColor[item.status].text }} />
                  {item.status}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>Tồn kho: {item.stock} (Ngưỡng: {item.threshold})</span>
                <span>Nhà cung cấp: {item.supplier}</span>
                <span>Ngày nhập gần nhất: {item.lastImport}</span>
                <span>Chi phí: {formatCurrency(item.cost)}</span>
              </div>
              <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">{item.note}</p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-slate-50"
              onClick={() => openEditSupply(item)}
            >
              <Pencil className="size-3.5" />
              Sửa
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCell = (row: any, column: any) => {
    if (tab === "Nhân viên") return renderStaffCell(row, column);
    if (tab === "Ca làm") return renderShiftCell(row, column);
    return renderSupplyCell(row, column);
  };

  const leftContent = (
    <div className="flex flex-wrap items-center gap-1">
      {([
        ["Nhân viên", Users],
        ["Ca làm", Clock],
        ["Kho vật tư", Package],
      ] as const).map(([item, Icon]) => (
        <button
          key={item}
          type="button"
          onClick={() => {
            setTab(item);
            setPage(1);
            setQuery("");
            setSelectedStaffIds(new Set());
            setSelectedSupplyIds(new Set());
          }}
          className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors ${
            tab === item ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Icon className="size-3.5" />
          {item}
        </button>
      ))}
      {(tab === "Nhân viên" || tab === "Kho vật tư") && (
        <>
          <span className="mx-2 hidden h-4 w-px bg-slate-200 sm:block" />
          <ViewModeTabs value={viewMode} onChange={setViewMode} />
        </>
      )}
    </div>
  );

  const filterOptions = useMemo<FilterOption[]>(() => {
    if (tab === "Nhân viên") {
      return [
        { id: "Tất cả", label: "Tất cả", color: "#64748b", bgColor: "rgba(100,116,139,0.09)" },
        { id: "Hoạt động", label: "Hoạt động", color: "#059669", bgColor: "rgba(5,150,105,0.09)" },
        { id: "Nghỉ phép", label: "Nghỉ phép", color: "#d97706", bgColor: "rgba(217,119,6,0.09)" },
        { id: "Tạm nghỉ", label: "Tạm nghỉ", color: "#64748b", bgColor: "rgba(100,116,139,0.1)" },
      ];
    }
    if (tab === "Kho vật tư") {
      return [
        { id: "Tất cả", label: "Tất cả", color: "#64748b", bgColor: "rgba(100,116,139,0.09)" },
        { id: "Ổn định", label: "Ổn định", color: "#059669", bgColor: "rgba(5,150,105,0.09)" },
        { id: "Sắp hết", label: "Sắp hết", color: "#d97706", bgColor: "rgba(217,119,6,0.09)" },
        { id: "Cần mua", label: "Cần mua", color: "#dc2626", bgColor: "rgba(220,38,38,0.09)" },
      ];
    }
    return [
      { id: "Tất cả", label: "Tất cả", color: "#64748b", bgColor: "rgba(100,116,139,0.09)" }
    ];
  }, [tab]);

  return (
    <PageShell fullHeight>
      <div className="grid shrink-0 gap-3 md:grid-cols-4">
        <MetricCard title="Nhân viên hoạt động" value={`${staff.filter((item) => item.status === "Hoạt động").length}`} hint={`${staff.length} hồ sơ nội bộ`} icon={Users} color="#2563eb" />
        <MetricCard title="Ca hôm nay" value="3" hint="Sáng, chiều, tối" icon={Clock} color="#7c3aed" />
        <MetricCard title="Năng suất" value="128 đơn" hint={`Theo ${rangeLabel}`} icon={TrendingUp} color="#059669" />
        <MetricCard title="Vật tư cảnh báo" value={`${lowStock}`} hint={`Đã nhập ${formatCurrency(purchaseCost)}`} icon={Package} color="#dc2626" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <Toolbar
          leftContent={leftContent}
          query={query}
          onQueryChange={(q) => { setQuery(q); setPage(1); }}
          columns={activeColumns}
          onColumnsChange={setColumnsActive}
          tableResizeMode={tableResizeMode}
          onTableResizeModeChange={setTableResizeMode}
          selectedCount={
            tab === "Nhân viên"
              ? selectedStaffIds.size
              : tab === "Kho vật tư"
              ? selectedSupplyIds.size
              : 0
          }
          onOpenAddColumn={() => setOpenAddColumn(true)}
          onOpenHistory={() => {
            if (tab === "Nhân viên" && selectedStaffIds.size > 0) {
              const firstId = Array.from(selectedStaffIds)[0];
              setActiveHistoryItemId(firstId);
              setOpenHistory(true);
            } else if (tab === "Kho vật tư" && selectedSupplyIds.size > 0) {
              const firstId = Array.from(selectedSupplyIds)[0];
              setActiveHistoryItemId(firstId);
              setOpenHistory(true);
            }
          }}
          onExport={handleExport}
          defaultExportFileName={getDefaultExportFileName()}
          onCreateClick={tab === "Kho vật tư" ? openCreateSupply : openCreateStaff}
          createLabel={tab === "Kho vật tư" ? "Thêm vật tư" : "Thêm nhân viên"}
          defaultColumnIds={(tab === "Nhân viên" ? defaultStaffColumns : tab === "Ca làm" ? defaultShiftColumns : defaultSupplyColumns).map(c => c.id)}
          searchPlaceholder={tab === "Kho vật tư" ? "Tìm vật tư, nhà cung cấp..." : "Tìm nhân viên, ca, vai trò..."}
          showHistoryButton={tab === "Nhân viên" || tab === "Kho vật tư"}
        />

        <FilterBar
          rangeLabel={rangeLabel}
          selectedValue={tab === "Kho vật tư" ? selectedSupplyStatus : selectedStaffStatus}
          onValueChange={(val) => {
            if (tab === "Kho vật tư") setSelectedSupplyStatus(val);
            else setSelectedStaffStatus(val);
            setPage(1);
          }}
          filterOptions={filterOptions}
          filterLabel="Lọc trạng thái"
          showSelectionBar={(tab === "Nhân viên" || tab === "Kho vật tư") && (viewMode === "Bảng" || viewMode === "Bảng kéo" || viewMode === "Danh sách")}
          allSelected={
            tab === "Nhân viên"
              ? (viewMode === "Bảng kéo" ? allKanbanStaffSelected : allVisibleStaffSelected)
              : tab === "Kho vật tư"
              ? (viewMode === "Bảng kéo" ? allKanbanSuppliesSelected : allVisibleSuppliesSelected)
              : false
          }
          disabled={
            tab === "Nhân viên"
              ? (viewMode === "Bảng kéo" ? kanbanStaffIds.length === 0 : visibleStaffIds.length === 0)
              : tab === "Kho vật tư"
              ? (viewMode === "Bảng kéo" ? kanbanSupplyIds.length === 0 : visibleSupplyIds.length === 0)
              : true
          }
          selectedCount={
            tab === "Nhân viên"
              ? (viewMode === "Bảng kéo" ? selectedKanbanStaffCount : selectedVisibleStaffCount)
              : tab === "Kho vật tư"
              ? (viewMode === "Bảng kéo" ? selectedKanbanSupplyCount : selectedVisibleSupplyCount)
              : 0
          }
          totalCount={
            tab === "Nhân viên"
              ? (viewMode === "Bảng kéo" ? kanbanStaffIds.length : visibleStaffIds.length)
              : tab === "Kho vật tư"
              ? (viewMode === "Bảng kéo" ? kanbanSupplyIds.length : visibleSupplyIds.length)
              : 0
          }
          itemLabel={tab === "Nhân viên" ? "nhân viên" : tab === "Kho vật tư" ? "vật tư" : "mục"}
          checkboxClass={checkboxClass}
          onToggleAll={
            tab === "Nhân viên"
              ? (viewMode === "Bảng kéo" ? toggleKanbanStaff : toggleVisibleStaff)
              : tab === "Kho vật tư"
              ? (viewMode === "Bảng kéo" ? toggleKanbanSupplies : toggleVisibleSupplies)
              : () => {}
          }
        />

        {viewMode === "Bảng kéo" && (tab === "Nhân viên" || tab === "Kho vật tư") ? (
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
                  prev.map((s) => (s.id === staffId ? { ...s, status: status as StaffStatus } : s))
                );
              }}
              renderCard={renderStaffKanbanCard}
              tableResizeMode={tableResizeMode}
            />
          ) : (
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
                  prev.map((s) => (s.id === supplyId ? { ...s, status: status as SupplyStatus } : s))
                );
              }}
              renderCard={renderSupplyKanbanCard}
              tableResizeMode={tableResizeMode}
            />
          )
        ) : viewMode === "Danh sách" && (tab === "Nhân viên" || tab === "Kho vật tư") ? (
          tab === "Nhân viên" ? (
            <ListView
              paginatedRows={paginatedStaff}
              emptyMessage="Không tìm thấy nhân viên phù hợp."
              renderRow={renderStaffListRow}
            />
          ) : (
            <ListView
              paginatedRows={paginatedSupplies}
              emptyMessage="Không tìm thấy vật tư phù hợp."
              renderRow={renderSupplyListRow}
            />
          )
        ) : (
          <TableView
            columns={activeColumns.filter(c => c.visible)}
            rows={activePaginatedRows}
            pageSize={pageSize}
            emptyMessage={
              tab === "Nhân viên" ? "Không tìm thấy nhân viên phù hợp." :
              tab === "Ca làm" ? "Không tìm thấy ca làm phù hợp." : "Không tìm thấy vật tư phù hợp."
            }
            tableResizeMode={tableResizeMode}
            totalVisibleWidth={totalVisibleWidth}
            renderCell={renderCell}
            page={page}
            pageCount={pageCount}
            totalRows={activeRows.length}
            totalLabel={tab === "Kho vật tư" ? `Tổng chi phí: ${totalCost.toLocaleString("vi-VN")}đ` : undefined}
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
        title={editingStaffId ? `Chỉnh sửa ${editingStaffId}` : "Thêm nhân viên mới"}
        fields={staffFormFields}
        form={staffForm}
        onFormChange={setStaffForm}
        onSave={saveStaff}
        customColumns={customColumnsStaff}
      />

      <FormDialog
        open={openSupplyForm}
        onClose={() => setOpenSupplyForm(false)}
        title={editingSupplyId ? `Chỉnh sửa ${editingSupplyId}` : "Thêm vật tư mới"}
        fields={supplyFormFields}
        form={supplyForm}
        onFormChange={setSupplyForm}
        onSave={saveSupply}
        customColumns={customColumnsSupply}
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
        onClose={() => {
          setOpenHistory(false);
          setActiveHistoryItemId(null);
        }}
        items={(tab === "Nhân viên" ? selectedStaff : selectedSupplies) as any}
        activeItemId={activeHistoryItemId}
        onActiveItemChange={setActiveHistoryItemId}
        itemLabel={tab === "Nhân viên" ? "nhân viên" : "vật tư"}
        renderSidebarItem={(item, active) => (
          <div className={`rounded-lg p-2.5 transition-colors ${active ? "bg-white shadow-sm ring-1 ring-slate-200/50" : "hover:bg-slate-100/50"}`}>
            <div className="flex items-start justify-between gap-1.5">
              <span className="truncate text-xs font-semibold text-slate-900">
                {tab === "Nhân viên" ? (item as Staff).name : (item as Supply).name}
              </span>
              <span className="shrink-0 text-[10px] text-slate-400 font-mono">{item.id}</span>
            </div>
            <p className="mt-1 truncate text-[10px] text-slate-500">
              {tab === "Nhân viên" ? (item as Staff).role : (item as Supply).category}
            </p>
          </div>
        )}
        title={tab === "Nhân viên" ? "Lịch sử nhân viên" : "Lịch sử vật tư"}
        renderDetail={(item: any) => {
          if (tab === "Nhân viên") {
            const s = item as Staff;
            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{s.name}</h3>
                    <p className="text-sm text-slate-500">Mã NV: {s.id}</p>
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold"
                    style={{ color: statusColor[s.status].text, backgroundColor: statusColor[s.status].bg }}
                  >
                    {s.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-slate-400">Số điện thoại</p>
                    <p className="text-slate-900">{s.phone}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-400">Vai trò</p>
                    <p className="text-slate-900">{s.role}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-400">Ca chính</p>
                    <p className="text-slate-900">{s.shift}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-400">Năng suất</p>
                    <p className="text-slate-900">{s.productivity}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-400">Đánh giá</p>
                    <p className="text-slate-900">{s.rating}</p>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-slate-400">Ghi chú</p>
                  <p className="text-slate-900">{s.note}</p>
                </div>
                <div className="border-t pt-3 space-y-1 text-xs text-slate-400">
                  <p>Ngày tạo: {s.createdAt || "Chưa có"}</p>
                  <p>Ngày sửa đổi cuối: {s.updatedAt || "Chưa có"}</p>
                </div>
              </div>
            );
          } else {
            const sup = item as Supply;
            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{sup.name}</h3>
                    <p className="text-sm text-slate-500">Mã VT: {sup.id}</p>
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold"
                    style={{ color: statusColor[sup.status].text, backgroundColor: statusColor[sup.status].bg }}
                  >
                    {sup.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-slate-400">Nhóm vật tư</p>
                    <p className="text-slate-900">{sup.category}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-400">Tồn kho / Ngưỡng</p>
                    <p className="text-slate-900">{sup.stock} / {sup.threshold}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-400">Nhà cung cấp</p>
                    <p className="text-slate-900">{sup.supplier}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-400">Ngày nhập gần nhất</p>
                    <p className="text-slate-900">{sup.lastImport}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-400">Chi phí nhập</p>
                    <p className="text-slate-900">{formatCurrency(sup.cost)}</p>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-slate-400">Ghi chú</p>
                  <p className="text-slate-900">{sup.note}</p>
                </div>
                <div className="border-t pt-3 space-y-1 text-xs text-slate-400">
                  <p>Ngày tạo: {sup.createdAt || "Chưa có"}</p>
                  <p>Ngày sửa đổi cuối: {sup.updatedAt || "Chưa có"}</p>
                </div>
              </div>
            );
          }
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
