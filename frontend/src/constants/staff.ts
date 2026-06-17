import { MachineStatus, SupplyStatus } from "@/src/types/staff";

export const defaultSupplyColumns = [
  { id: "id", label: "Mã VT", width: 104, visible: true },
  { id: "name", label: "Vật tư", width: 156, visible: true },
  { id: "category", label: "Nhóm", width: 110, visible: true },
  { id: "inventoryType", label: "Loại vật tư", width: 138, visible: true },
  { id: "unit", label: "Đơn vị", width: 90, visible: true },
  { id: "initialStock", label: "Ban đầu", width: 90, visible: true },
  { id: "currentStock", label: "Hiện tại", width: 90, visible: true },
  { id: "supplier", label: "Nhà cung cấp", width: 132, visible: true },
  { id: "lastImport", label: "Ngày nhập", width: 110, visible: true },
  { id: "cost", label: "Chi phí", width: 112, visible: true },
  { id: "status", label: "Cảnh báo", width: 104, visible: true },
  { id: "note", label: "Ghi chú", width: 160, visible: true },
  { id: "actions", label: "Thao tác", width: 108, visible: true },
];

export const defaultMachineColumns = [
  { id: "id", label: "Mã TB", width: 104, visible: true },
  { id: "name", label: "Thiết bị", width: 156, visible: true },
  { id: "capacity", label: "Công suất", width: 100, visible: true },
  { id: "area", label: "Khu vực", width: 110, visible: true },
  { id: "loadType", label: "Nhóm thiết bị", width: 120, visible: true },
  { id: "lastMaintenance", label: "Bảo trì gần nhất", width: 130, visible: true },
  { id: "nextMaintenance", label: "Bảo trì kế tiếp", width: 130, visible: true },
  { id: "status", label: "Trạng thái", width: 112, visible: true },
  { id: "note", label: "Ghi chú", width: 160, visible: true },
  { id: "actions", label: "Thao tác", width: 108, visible: true },
];

export const emptySupplyForm = {
  name: "",
  category: "Hóa chất",
  inventoryType: "Vật tư tiêu hao",
  unit: "",
  initialStock: "",
  currentStock: "",
  supplier: "",
  lastImport: "",
  cost: "0",
  status: "Ổn định" as SupplyStatus,
  note: "",
};

export const emptyMachineForm = {
  name: "",
  capacity: "",
  area: "Khu giặt 1",
  loadType: "Máy giặt",
  lastMaintenance: "",
  nextMaintenance: "",
  status: "Sẵn sàng" as MachineStatus,
  note: "",
};

export const statusColor: Record<string, { text: string; bg: string }> = {
  "Ổn định": { text: "#059669", bg: "rgba(5,150,105,0.09)" },
  "Sắp hết": { text: "#d97706", bg: "rgba(217,119,6,0.09)" },
  "Cần mua": { text: "#dc2626", bg: "rgba(220,38,38,0.09)" },
  "Sẵn sàng": { text: "#059669", bg: "rgba(5,150,105,0.09)" },
  "Đang chạy": { text: "#2563eb", bg: "rgba(37,99,235,0.09)" },
  "Bảo trì": { text: "#d97706", bg: "rgba(217,119,6,0.09)" },
};

export const statusDotColors = Object.fromEntries(
  Object.entries(statusColor).map(([status, color]) => [status, color.text]),
);
