export type SupplyStatus = "Ổn định" | "Sắp hết" | "Cần mua";
export type InventoryType = "Vật tư tiêu hao" | "Vật tư tái sử dụng";
export type MachineStatus = "Sẵn sàng" | "Đang chạy" | "Bảo trì";
export type Tab = "Kho vật tư" | "Thiết bị giặt sấy";

export type Supply = {
  id: string;
  name: string;
  category: string;
  inventoryType: InventoryType;
  unit: string;
  initialStock: string;
  currentStock: string;
  supplier: string;
  lastImport: string;
  cost: number;
  status: SupplyStatus;
  note: string;
  createdAt?: string;
  updatedAt?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export type WashingMachineItem = {
  dbId?: string;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export type MaintenanceRecord = {
  id: string;
  machineId: string;
  dbMachineId?: string;
  date: string;
  nextDate?: string;
  type: "Bảo dưỡng" | "Sửa chữa";
  cost: number;
  performer: string;
  note: string;
};

export type HomeMaintenanceRecordRow = {
  record_id: string;
  machine_id: string;
  maintenance_date: string;
  maintenance_type: "Bảo dưỡng" | "Sửa chữa";
  next_maintenance_at?: string;
  cost?: number;
  performer?: string;
  note?: string;
};

export type HomeInventoryRow = {
  inventory_item_id: string;
  item_code?: string;
  name: string;
  category?: string;
  inventory_type?: InventoryType;
  unit?: string;
  initial_quantity?: number;
  quantity?: number;
  supplier?: string;
  cost?: number;
  status?: string;
  last_restocked_at?: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
};

export type HomeMachineRow = {
  machine_id: string;
  machine_code?: string;
  name: string;
  machine_type?: string;
  capacity_kg?: number;
  status?: string;
  location?: string;
  last_maintenance_at?: string;
  next_maintenance_at?: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
};

export type StaffOperationsOverview = {
  inventory: HomeInventoryRow[];
  machines: HomeMachineRow[];
};

export interface ColumnItem {
  id: string;
  label: string;
  width: number;
  visible: boolean;
}
