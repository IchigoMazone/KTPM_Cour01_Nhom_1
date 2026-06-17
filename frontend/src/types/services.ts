export type ServiceStatus = "Đang hoạt động" | "Tạm ngừng";
export type ServicePromotion = "Có" | "Không";
export type ServiceUnit = "kg" | "món" | "bộ";
export type ServiceTurnaround = "Trong ngày" | "6 giờ" | "24 giờ" | "48 giờ" | "72 giờ";

export type FinanceStatus = "Đã thu" | "Chờ thu" | "Đã chi" | "Quá hạn";
export type FinanceType = string;
export type FinanceMethod = "Tiền mặt" | "Chuyển khoản";

export type PromotionStatus = "Đang chạy" | "Sắp hết hạn" | "Đã kết thúc";
export type PromotionType = "Phần trăm" | "Số tiền";

export type ServicesTab = "Dịch vụ" | "Tài chính" | "Mã giảm giá";

export type Service = {
  id: string;
  name: string;
  category: string;
  unit: ServiceUnit;
  price: number;
  turnaround: ServiceTurnaround;
  status: ServiceStatus;
  promotion: ServicePromotion;
  inventoryItems: string;
  note: string;
  dbId?: string;
} & Record<string, unknown>;

export type FinanceRecord = {
  id: string;
  date: string;
  type: FinanceType;
  customerCode: string;
  customer: string;
  inventoryName: string;
  orderId: string;
  method: FinanceMethod;
  amount: number;
  status: FinanceStatus;
  owner: string;
  note: string;
  dbId?: string;
  inventoryItemId?: string;
  orderDbId?: string;
} & Record<string, unknown>;

export type Promotion = {
  id: string;
  code: string;
  name: string;
  type: PromotionType;
  value: string;
  appliedService: string;
  startDate: string;
  endDate: string;
  usage: string;
  claimed: number;
  usedCount?: number;
  status: PromotionStatus;
  note: string;
  dbId?: string;
} & Record<string, unknown>;

export type ServiceForm = {
  name: string;
  category: string;
  unit: ServiceUnit;
  price: string;
  turnaround: ServiceTurnaround;
  status: ServiceStatus;
  promotion: ServicePromotion;
  inventoryItems: string;
  note: string;
} & Record<string, string>;

export type FinanceForm = {
  date: string;
  type: FinanceType;
  customerCode: string;
  customer: string;
  inventoryName: string;
  orderId: string;
  method: FinanceMethod;
  amount: string;
  status: FinanceStatus;
  owner: string;
  note: string;
} & Record<string, string>;

export type PromotionForm = {
  code: string;
  name: string;
  type: PromotionType;
  value: string;
  appliedService: string;
  startDate: string;
  endDate: string;
  usage: string;
  status: PromotionStatus;
  note: string;
} & Record<string, string>;

export type HomeServiceRow = {
  service_id: string;
  service_code: string;
  name: string;
  category: string | null;
  description: string | null;
  unit: "kg" | "item" | "combo";
  price: number;
  turnaround_hours: number;
  status: "active" | "inactive";
  promotion_enabled: boolean;
  inventory_items?: string[];
};

export type HomePromotionRow = {
  promotion_id: string;
  code: string;
  name: string;
  type: string;
  value: string;
  applied_service: string;
  start_date: string;
  end_date: string | null;
  usage_limit: number | null;
  claimed: number;
  used_count?: number;
  note: string | null;
};

export type HomeFinanceRow = {
  finance_record_id: string;
  transaction_code: string;
  transaction_date: string;
  type: FinanceType;
  customer_code: string | null;
  customer: string;
  inventory_name: string | null;
  related_code: string;
  order_code: string;
  payment_method: FinanceMethod;
  amount: number;
  status: FinanceStatus;
  owner: string | null;
  note: string | null;
  inventory_item_id: string | null;
  order_id: string | null;
};
