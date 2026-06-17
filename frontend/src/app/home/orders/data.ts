import { OrderStatus, ColumnId } from "./types";

export const statuses: OrderStatus[] = [
  "Tiếp nhận",
  "Đã xác nhận lịch",
  "Đang giặt",
  "Kiểm tra",
  "Chờ thanh toán",
  "Hoàn thành",
];

export const emptyForm = {
  customerCode: "",
  customer: "",
  phone: "",
  address: "",
  service: "",
  serviceUnit: "",
  unitPrice: "0",
  quantity: "",
  originalAmount: "0",
  amount: "0",
  appointment: "",
  deliveryDate: "",
  deliveryTime: "",
  washer: "",
  dryer: "",
  staff: "Chưa gán",
  status: "Tiếp nhận" as OrderStatus,
  createdAt: "",
  payment: "Tiền mặt",
  discount: "",
  discountValue: "",
  discountAmount: "0",
  note: "",
};

export const statusDotColor: Record<string, string> = {
  "Tiếp nhận": "#6366f1",
  "Đã xác nhận lịch": "#3b82f6",
  "Đang giặt": "#f59e0b",
  "Kiểm tra": "#8b5cf6",
  "Chờ thanh toán": "#ef4444",
  "Hoàn thành": "#10b981",
  "Đã hủy": "#ef4444",
};

export const statusBgColor: Record<string, string> = {
  "Tiếp nhận": "rgba(99,102,241,0.08)",
  "Đã xác nhận lịch": "rgba(59,130,246,0.08)",
  "Đang giặt": "rgba(245,158,11,0.08)",
  "Kiểm tra": "rgba(139,92,246,0.08)",
  "Chờ thanh toán": "rgba(239,68,68,0.08)",
  "Hoàn thành": "rgba(16,185,129,0.08)",
  "Đã hủy": "rgba(239,68,68,0.08)",
};

export const allStatusColor = "#0f766e";
export const allStatusBgColor = "rgba(15,118,110,0.09)";

export const defaultColumns = [
  { id: "id" as ColumnId, label: "Mã đơn", width: 130, visible: true },
  { id: "customerCode" as ColumnId, label: "Mã KH", width: 110, visible: true },
  { id: "customer" as ColumnId, label: "Khách hàng", width: 180, visible: true },
  { id: "phone" as ColumnId, label: "Số điện thoại", width: 120, visible: true },
  { id: "address" as ColumnId, label: "Địa chỉ", width: 180, visible: false },
  { id: "service" as ColumnId, label: "Dịch vụ", width: 120, visible: true },
  { id: "quantity" as ColumnId, label: "Số lượng", width: 110, visible: true },
  { id: "unitPrice" as ColumnId, label: "Đơn giá", width: 120, visible: true },
  { id: "originalAmount" as ColumnId, label: "Giá gốc", width: 120, visible: true },
  { id: "washer" as ColumnId, label: "Máy giặt", width: 110, visible: true },
  { id: "dryer" as ColumnId, label: "Máy sấy", width: 110, visible: true },
  { id: "amount" as ColumnId, label: "Thành tiền", width: 120, visible: true },
  { id: "deliveryDate" as ColumnId, label: "Ngày giao", width: 110, visible: true },
  { id: "deliveryTime" as ColumnId, label: "Giờ giao", width: 100, visible: true },
  { id: "staff" as ColumnId, label: "Nhân viên", width: 160, visible: true },
  { id: "status" as ColumnId, label: "Trạng thái", width: 150, visible: true },
  { id: "createdAt" as ColumnId, label: "Ngày tạo đơn", width: 120, visible: true },
  { id: "payment" as ColumnId, label: "Thanh toán", width: 120, visible: false },
  { id: "discount" as ColumnId, label: "Mã giảm giá", width: 120, visible: true },
  { id: "discountValue" as ColumnId, label: "Ưu đãi", width: 120, visible: true },
  { id: "note" as ColumnId, label: "Ghi chú", width: 180, visible: true },
  { id: "actions" as ColumnId, label: "Thao tác", width: 220, visible: true },
];

export const checkboxClass =
  "relative size-4 appearance-none rounded-[5px] border border-slate-300 bg-white transition-all duration-150 checked:border-emerald-300 checked:bg-emerald-300 after:absolute after:left-1/2 after:top-1/2 after:hidden after:h-[9px] after:w-[5px] after:-translate-x-1/2 after:-translate-y-[58%] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:content-[''] checked:after:block";
