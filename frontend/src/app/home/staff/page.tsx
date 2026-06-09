"use client";

import { useMemo, useState, type DragEvent } from "react";
import { Users, Package, TrendingUp, CircleDollarSign } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
type Tab = "Nhân viên" | "Kho vật tư";

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

const seedSupplies: Supply[] = [
  { id: "VT-301", name: "Hóa chất giặt", category: "Hóa chất", stock: "25 kg", threshold: "10 kg", supplier: "EcoWash", lastImport: "2026-05-12", cost: 1800000, status: "Ổn định", note: "Dùng cho máy giặt 01, 02", createdAt: "05/06/2026, 08:00:00", updatedAt: "05/06/2026, 08:00:00" },
  { id: "VT-302", name: "Nước xả", category: "Hóa chất", stock: "6 lít", threshold: "8 lít", supplier: "CleanPro", lastImport: "2026-05-16", cost: 720000, status: "Sắp hết", note: "Cần mua trong 2 ngày", createdAt: "05/06/2026, 08:00:00", updatedAt: "05/06/2026, 08:00:00" },
  { id: "VT-303", name: "Túi đựng", category: "Bao bì", stock: "120 cái", threshold: "50 cái", supplier: "Kho tổng", lastImport: "2026-05-15", cost: 460000, status: "Ổn định", note: "Túi size M/L", createdAt: "05/06/2026, 08:00:00", updatedAt: "05/06/2026, 08:00:00" },
  { id: "VT-304", name: "Móc áo", category: "Phụ kiện", stock: "75 cái", threshold: "100 cái", supplier: "Nhựa Minh An", lastImport: "2026-05-10", cost: 1250000, status: "Cần mua", note: "Ưu tiên móc áo vest", createdAt: "05/06/2026, 08:00:00", updatedAt: "05/06/2026, 08:00:00" },
  { id: "VT-305", name: "Tem mã đơn", category: "Bao bì", stock: "3 cuộn", threshold: "2 cuộn", supplier: "In nhanh Q1", lastImport: "2026-05-08", cost: 360000, status: "Ổn định", note: "Dùng cho tiếp nhận", createdAt: "05/06/2026, 08:00:00", updatedAt: "05/06/2026, 08:00:00" },
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

function formatReadableDate(dateStr?: string) {
  if (!dateStr) return "-";
  if (dateStr.includes("/")) return dateStr;
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
}

const staffFormFields: FormField[] = [
  { id: "name", label: "Họ tên", type: "text", placeholder: "Tên nhân viên" },
  { id: "phone", label: "Số điện thoại", type: "text", placeholder: "090..." },
  { id: "role", label: "Vai trò", type: "select", options: ["Giặt", "Gấp/Là", "Giao nhận", "Thu ngân", "Kiểm đồ", "Kho"], placeholder: "Chọn vai trò..." },
  { id: "shift", label: "Ca chính", type: "select", options: ["Sáng", "Chiều", "Tối"], placeholder: "Chọn ca chính..." },
  { id: "productivity", label: "Năng suất", type: "text", placeholder: "Chưa có đơn", readOnly: true },
  { id: "rating", label: "Đánh giá", type: "text", placeholder: "Chưa có đánh giá", readOnly: true },
  { id: "status", label: "Trạng thái", type: "select", options: ["Hoạt động", "Nghỉ phép", "Tạm nghỉ"] },
  { id: "note", label: "Ghi chú vận hành", type: "textarea", placeholder: "Khu vực phụ trách, kỹ năng, lịch nghỉ..." },
];

const supplyFormFields: FormField[] = [
  { id: "name", label: "Tên vật tư", type: "text", placeholder: "Nước xả" },
  { id: "category", label: "Nhóm", type: "select", options: ["Hóa chất", "Bao bì", "Phụ kiện", "Thiết bị"], placeholder: "Chọn nhóm vật tư..." },
  { id: "stock", label: "Tồn kho", type: "text", placeholder: "20 lít" },
  { id: "threshold", label: "Ngưỡng cảnh báo", type: "text", placeholder: "8 lít" },
  { id: "supplier", label: "Nhà cung cấp", type: "text", placeholder: "EcoWash / CleanPro..." },
  { id: "lastImport", label: "Ngày nhập", type: "date" },
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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingStaffId, setDeletingStaffId] = useState<string | null>(null);
  const [deletingSupplyId, setDeletingSupplyId] = useState<string | null>(null);

  const [draggedStaffId, setDraggedStaffId] = useState<string | null>(null);
  const [dragOverStaffStatus, setDragOverStaffStatus] = useState<string | null>(null);
  const [draggedSupplyId, setDraggedSupplyId] = useState<string | null>(null);
  const [dragOverSupplyStatus, setDragOverSupplyStatus] = useState<string | null>(null);

  const checkboxClass =
    "relative size-4 appearance-none rounded-[5px] border border-slate-300 bg-white transition-all duration-150 checked:border-emerald-300 checked:bg-emerald-300 after:absolute after:left-1/2 after:top-1/2 after:hidden after:h-[9px] after:w-[5px] after:-translate-x-1/2 after:-translate-y-[58%] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:content-[''] checked:after:block";

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [columnsStaff, setColumnsStaff] = useState(defaultStaffColumns);
  const [columnsSupply, setColumnsSupply] = useState(defaultSupplyColumns);

  const activeColumns = tab === "Nhân viên" ? columnsStaff : columnsSupply;
  const setColumnsActive = tab === "Nhân viên" ? setColumnsStaff : setColumnsSupply;

  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

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

  const filteredSupplies = useMemo(() => {
    return supplies.filter((item) => {
      const source = `${item.id} ${item.name} ${item.category} ${item.supplier} ${item.note}`;
      const matchQuery = source.toLowerCase().includes(query.toLowerCase());
      const matchStatus = selectedSupplyStatus === "Tất cả" || item.status === selectedSupplyStatus;
      return matchQuery && matchStatus;
    });
  }, [query, selectedSupplyStatus, supplies]);

  const activeRows = tab === "Nhân viên" ? filteredStaff : filteredSupplies;
  const pageCount = Math.ceil(activeRows.length / pageSize);
  const paginatedStaff = filteredStaff.slice((page - 1) * pageSize, page * pageSize);
  const paginatedSupplies = filteredSupplies.slice((page - 1) * pageSize, page * pageSize);

  const activePaginatedRows = tab === "Nhân viên" ? paginatedStaff : paginatedSupplies;
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

  const startDeleteStaff = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingStaffId(id);
    setDeletingSupplyId(null);
    setDeleteConfirmOpen(true);
  };

  const startDeleteSupply = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingSupplyId(id);
    setDeletingStaffId(null);
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
      setSupplies((prev) => prev.filter((item) => item.id !== deletingSupplyId));
      setSelectedSupplyIds((prev) => {
        const next = new Set(prev);
        next.delete(deletingSupplyId);
        return next;
      });
      setDeletingSupplyId(null);
    }
    setDeleteConfirmOpen(false);
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

    setColumnsActive((prev: any) => {
      const draggedIndex = prev.findIndex((column: any) => column.id === draggedColumnId);
      const dropIndex = prev.findIndex((column: any) => column.id === id);
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

  const getDefaultExportFileName = () => {
    const scope = tab === "Nhân viên" ? "nhan-vien" : "kho-vat-tu";
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
    if (column.id === "name") {
      const avatarUrl = item.avatar || "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif";
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
    return <TableCell key={column.id} className={customValue ? "text-slate-600" : "text-slate-400 italic"}>{customValue || "Chưa có"}</TableCell>;
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
    if (column.id === "lastImport") return <TableCell key={column.id} className="text-slate-600">{formatReadableDate(item.lastImport)}</TableCell>;
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
            <Image
              src={item.avatar || "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif"}
              alt={item.name}
              width={32}
              height={32}
              className="size-8 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
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
              <p className="truncate text-sm font-medium text-slate-700">{item.name}</p>
              <p className="truncate text-[11px] text-slate-400">{item.category}</p>
            </div>
          </div>
          <span className="shrink-0 text-[11px] font-semibold text-slate-400">{item.id}</span>
        </div>
        <p className="mt-2 text-xs text-slate-500 font-medium">Tồn kho: {item.stock} / Ngưỡng: {item.threshold}</p>
        <p className="mt-1 text-xs text-slate-500">Nhà cung cấp: {item.supplier} · Chi phí: {formatCurrency(item.cost)}</p>
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
                <Image
                  src={item.avatar || "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif"}
                  alt={item.name}
                  width={24}
                  height={24}
                  className="size-6 rounded-full object-cover ring-1 ring-slate-100 shadow-sm"
                />
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
                <span>Ngày nhập gần nhất: {formatReadableDate(item.lastImport)}</span>
                <span>Chi phí: {formatCurrency(item.cost)}</span>
              </div>
              <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">{item.note}</p>
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

  const renderCell = (row: any, column: any) => {
    if (tab === "Nhân viên") return renderStaffCell(row, column);
    return renderSupplyCell(row, column);
  };

  const leftContent = (
    <div className="flex flex-wrap items-center gap-1">
      {([
        ["Nhân viên", Users],
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
      <span className="mx-2 hidden h-4 w-px bg-slate-200 sm:block" />
      <ViewModeTabs value={viewMode} onChange={setViewMode} />
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
        <MetricCard title="Năng suất" value="128 đơn" hint={`Theo ${rangeLabel}`} icon={TrendingUp} color="#059669" />
        <MetricCard title="Vật tư cảnh báo" value={`${lowStock}`} hint="Sắp hết hoặc cần mua" icon={Package} color="#dc2626" />
        <MetricCard title="Chi phí nhập vật tư" value={formatCurrency(purchaseCost)} hint="Tổng ngân sách đã chi" icon={CircleDollarSign} color="#d97706" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <Toolbar
          leftContent={leftContent}
          query={query}
          onQueryChange={(q) => { setQuery(q); setPage(1); }}
          columns={activeColumns}
          onColumnsChange={setColumnsActive as any}
          tableResizeMode={tableResizeMode}
          onTableResizeModeChange={setTableResizeMode}
          selectedCount={tab === "Nhân viên" ? selectedStaffIds.size : selectedSupplyIds.size}
          onOpenAddColumn={() => setOpenAddColumn(true)}
          onOpenHistory={() => {}}
          onExport={handleExport}
          defaultExportFileName={getDefaultExportFileName()}
          onCreateClick={tab === "Kho vật tư" ? openCreateSupply : openCreateStaff}
          createLabel={tab === "Kho vật tư" ? "Thêm vật tư" : "Thêm nhân viên"}
          defaultColumnIds={(tab === "Nhân viên" ? defaultStaffColumns : defaultSupplyColumns).map(c => c.id)}
          searchPlaceholder={tab === "Kho vật tư" ? "Tìm vật tư, nhà cung cấp..." : "Tìm nhân viên, ca, vai trò..."}
          showHistoryButton={false}
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
          showSelectionBar={viewMode === "Bảng" || viewMode === "Bảng kéo" || viewMode === "Danh sách"}
          allSelected={
            tab === "Nhân viên"
              ? (viewMode === "Bảng kéo" ? allKanbanStaffSelected : allVisibleStaffSelected)
              : (viewMode === "Bảng kéo" ? allKanbanSuppliesSelected : allVisibleSuppliesSelected)
          }
          disabled={
            tab === "Nhân viên"
              ? (viewMode === "Bảng kéo" ? kanbanStaffIds.length === 0 : visibleStaffIds.length === 0)
              : (viewMode === "Bảng kéo" ? kanbanSupplyIds.length === 0 : visibleSupplyIds.length === 0)
          }
          selectedCount={
            tab === "Nhân viên"
              ? (viewMode === "Bảng kéo" ? selectedKanbanStaffCount : selectedVisibleStaffCount)
              : (viewMode === "Bảng kéo" ? selectedKanbanSupplyCount : selectedVisibleSupplyCount)
          }
          totalCount={
            tab === "Nhân viên"
              ? (viewMode === "Bảng kéo" ? kanbanStaffIds.length : visibleStaffIds.length)
              : (viewMode === "Bảng kéo" ? kanbanSupplyIds.length : visibleSupplyIds.length)
          }
          itemLabel={tab === "Nhân viên" ? "nhân viên" : "vật tư"}
          checkboxClass={checkboxClass}
          onToggleAll={
            tab === "Nhân viên"
              ? (viewMode === "Bảng kéo" ? toggleKanbanStaff : toggleVisibleStaff)
              : (viewMode === "Bảng kéo" ? toggleKanbanSupplies : toggleVisibleSupplies)
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
              tab === "Nhân viên" ? "Không tìm thấy nhân viên phù hợp." : "Không tìm thấy vật tư phù hợp."
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
        showCloseButton={false}
        showCloseButtonAtBottom={true}
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
        <DialogContent showCloseButton={false} className="sm:max-w-[400px] bg-white rounded-xl border border-slate-200 shadow-xl p-6">
          <DialogHeader className="pb-3 border-b border-slate-100">
            <DialogTitle className="text-base font-semibold text-slate-900">Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <div className="py-5 text-sm text-slate-600">
            Bạn có chắc chắn muốn xóa {deletingStaffId ? "nhân viên" : "vật tư"} này không? Hành động này không thể hoàn tác.
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
