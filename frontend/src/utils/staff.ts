import { fromOrderDate } from "@/src/utils/dashboard-time";
import {
  HomeMaintenanceRecordRow,
  MaintenanceRecord,
  HomeInventoryRow,
  Supply,
  HomeMachineRow,
  WashingMachineItem,
  SupplyStatus,
  MachineStatus,
} from "@/src/types/staff";

export function mapMaintenanceRecord(row: HomeMaintenanceRecordRow, machineId: string): MaintenanceRecord {
  return {
    id: row.record_id,
    machineId,
    dbMachineId: row.machine_id,
    date: row.maintenance_date,
    nextDate: formatApiDate(row.next_maintenance_at),
    type: row.maintenance_type,
    cost: Number(row.cost || 0),
    performer: row.performer || "",
    note: row.note || "",
  };
}

function formatApiDate(value?: string) {
  return value ? value.slice(0, 10) : "";
}

export function nullableDate(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function numericValue(value?: string | number) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const normalized = String(value || "").replace(/[^\d.]/g, "");
  const nextValue = Number(normalized);
  return Number.isFinite(nextValue) ? nextValue : 0;
}

export function parseCapacityKg(value?: string) {
  const match = String(value || "").replace(",", ".").match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function mapSupplyStatus(status?: string): SupplyStatus {
  if (status === "Sắp hết") return "Sắp hết";
  if (status === "Hết hàng" || status === "Cần mua") return "Cần mua";
  return "Ổn định";
}

function mapMachineStatus(status?: string): MachineStatus {
  if (status === "Đang chạy") return "Đang chạy";
  if (status === "Bảo trì" || status === "Ngưng dùng") return "Bảo trì";
  return "Sẵn sàng";
}

export function mapHomeSupply(row: HomeInventoryRow): Supply {
  const quantity = Number(row.quantity || 0);
  let id = row.item_code || row.inventory_item_id;
  if (id && !id.startsWith("VT-") && id.length <= 10) {
    id = `VT-${id}`;
  }
  return {
    id,
    name: row.name || "-",
    category: row.category || "-",
    inventoryType: row.inventory_type || "Vật tư tiêu hao",
    unit: row.unit || "-",
    initialStock: String(Number(row.initial_quantity ?? quantity)),
    currentStock: String(quantity),
    supplier: row.supplier || "-",
    lastImport: formatApiDate(row.last_restocked_at),
    cost: Number(row.cost || 0),
    status: mapSupplyStatus(row.status),
    note: row.note || "-",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    dbId: row.inventory_item_id,
  };
}

export function mapHomeMachine(row: HomeMachineRow): WashingMachineItem {
  let id = row.machine_code || row.machine_id;
  if (id && !id.startsWith("TB-") && id.length <= 10) {
    id = `TB-${id}`;
  }
  return {
    dbId: row.machine_id,
    id,
    name: row.name || "-",
    capacity: row.capacity_kg ? `${row.capacity_kg} kg` : "-",
    area: row.location || "-",
    loadType: row.machine_type || "-",
    lastMaintenance: formatApiDate(row.last_maintenance_at),
    nextMaintenance: formatApiDate(row.next_maintenance_at),
    status: mapMachineStatus(row.status),
    note: row.note || "-",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

export function formatReadableDate(dateStr?: string) {
  if (!dateStr) return "-";
  if (dateStr.includes("/")) return dateStr;
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
}

export function getCalendarDate(value?: string) {
  if (!value) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = fromOrderDate(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [d, m, y] = value.split("/").map(Number);
    const date = new Date(y, m - 1, d);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
  return undefined;
}

export function displayValue(value?: string) {
  const trimmed = value?.trim() || "";
  return trimmed && trimmed !== "Chưa có" ? trimmed : "-";
}
