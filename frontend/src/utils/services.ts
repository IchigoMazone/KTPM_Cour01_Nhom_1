import {
  Service,
  ServiceUnit,
  ServiceTurnaround,
  ServiceStatus,
  Promotion,
  PromotionType,
  PromotionStatus,
  HomeServiceRow,
  HomePromotionRow,
  HomeFinanceRow,
  FinanceRecord,
} from "@/src/types/services";

export function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

export function parseInputDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function toInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(value: string) {
  const date = parseInputDate(value);
  if (!date) return "Chọn ngày";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

export function formatReadableDate(value: string) {
  const date = parseInputDate(value);
  if (!date) return value || "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

export function getPromotionStatusByDate(endDate: string): PromotionStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = parseInputDate(endDate);
  if (!end) return "Đang chạy";
  end.setHours(0, 0, 0, 0);
  if (end < today) return "Đã kết thúc";

  const daysLeft = Math.ceil((end.getTime() - today.getTime()) / 86400000);
  return daysLeft <= 7 ? "Sắp hết hạn" : "Đang chạy";
}

export function formatPromotionEndDate(value: string) {
  return value.trim() ? formatReadableDate(value) : "Không giới hạn";
}

export function formatPromotionIssuedQuantity(limit: string, claimed: number) {
  const claimedCount = Number.isFinite(claimed) ? claimed : 0;
  return limit.trim() ? `${claimedCount}/${limit}` : "Không giới hạn";
}

export function cleanPromotionValue(value: string) {
  return value.replace(/[^\d]/g, "");
}

export function formatPromotionValue(value: string, type: PromotionType) {
  const numericValue = cleanPromotionValue(value);
  if (!numericValue) return "-";
  if (type === "Phần trăm") return `${numericValue}%`;
  return formatCurrency(Number(numericValue));
}

export function cleanServiceCode(code?: string) {
  return code?.startsWith("DV-") ? code.slice(3) : code;
}

export function toServiceUnitApi(unit: ServiceUnit) {
  if (unit === "món") return "item";
  if (unit === "bộ") return "combo";
  return "kg";
}

export function toTurnaroundHours(turnaround: ServiceTurnaround) {
  if (turnaround === "Trong ngày") return 12;
  return Number(turnaround.replace(/[^\d]/g, "")) || 24;
}

export function toServiceStatusApi(status: ServiceStatus) {
  return status === "Đang hoạt động" ? "active" : "inactive";
}

export function mapHomeService(row: HomeServiceRow): Service {
  const unitMap: Record<HomeServiceRow["unit"], ServiceUnit> = {
    kg: "kg",
    item: "món",
    combo: "bộ",
  };
  const hours = Number(row.turnaround_hours || 24);
  const turnaround: ServiceTurnaround =
    hours <= 6 ? "6 giờ" : hours <= 12 ? "Trong ngày" : hours <= 24 ? "24 giờ" : hours <= 48 ? "48 giờ" : "72 giờ";
  const serviceCode = row.service_code || row.service_id;
  return {
    id: serviceCode && !serviceCode.startsWith("DV-") ? `DV-${serviceCode}` : serviceCode,
    name: row.name,
    category: row.category || "Dịch vụ",
    unit: unitMap[row.unit] || "kg",
    price: Number(row.price || 0),
    turnaround,
    status: row.status === "active" ? "Đang hoạt động" : "Tạm ngừng",
    promotion: row.promotion_enabled ? "Có" : "Không",
    inventoryItems: (row.inventory_items || []).map((item) => item.split(" · ")[0]).join(", "),
    note: row.description || "",
    dbId: row.service_id,
  };
}

export function mapHomePromotion(row: HomePromotionRow): Promotion {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(row.promotion_id);
  const displayId = isUuid ? `MG-${row.promotion_id.slice(0, 8).toUpperCase()}` : row.promotion_id;
  return {
    id: displayId,
    code: row.code,
    name: row.name,
    type: row.type as PromotionType,
    value: row.value,
    appliedService: row.applied_service.split(",").map((value) => value.trim().split(" · ")[0]).join(", "),
    startDate: row.start_date,
    endDate: row.end_date || "",
    usage: row.usage_limit ? String(row.usage_limit) : "",
    claimed: Number(row.claimed || 0),
    usedCount: Number(row.used_count || 0),
    status: getPromotionStatusByDate(row.end_date || ""),
    note: row.note || "",
    dbId: row.promotion_id,
  };
}

export function mapHomeFinance(row: HomeFinanceRow): FinanceRecord {
  const code = row.transaction_code || row.finance_record_id;
  return {
    id: code.startsWith("TC-") ? code : `TC-${code}`,
    date: row.transaction_date,
    type: row.type,
    customerCode: row.customer_code || "",
    customer: row.customer === "-" ? "" : row.customer,
    inventoryName: row.inventory_name || "-",
    orderId: row.related_code || row.order_code || "-",
    method: row.payment_method || "",
    amount: Number(row.amount || 0),
    status: row.status,
    owner: row.owner || "-",
    note: row.note || "",
    dbId: row.finance_record_id,
    inventoryItemId: row.inventory_item_id || undefined,
    orderDbId: row.order_id || undefined,
  };
}

export function readStorageValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const saved = localStorage.getItem(key);
  if (!saved) return fallback;
  try {
    return JSON.parse(saved) as T;
  } catch {
    return fallback;
  }
}

export function mergeStoredCustomValues<T extends { id: string }>(rows: T[], key: string) {
  const storedValues = readStorageValue<Record<string, Record<string, string>>>(key, {});
  return rows.map((row) => ({
    ...row,
    ...(storedValues[row.id] || {}),
  }));
}

export function removeStoredCustomValues(key: string, id: string) {
  if (typeof window === "undefined") return;
  const storedValues = readStorageValue<Record<string, Record<string, string>>>(key, {});
  delete storedValues[id];
  localStorage.setItem(key, JSON.stringify(storedValues));
}

export function assignFriendlyPromotionIds(promotions: Promotion[]): Promotion[] {
  const sorted = [...promotions].sort((a, b) => {
    const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
    const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
    if (dateA !== dateB) return dateA - dateB;
    return a.code.localeCompare(b.code);
  });

  const idMap = new Map<string, string>();
  sorted.forEach((p, idx) => {
    const num = String(idx + 1).padStart(4, "0");
    const key = p.dbId || p.id;
    idMap.set(key, `MG-${num}`);
  });

  return promotions.map((p) => {
    const key = p.dbId || p.id;
    const friendlyId = idMap.get(key) || p.id;
    return {
      ...p,
      id: friendlyId,
    };
  });
}
