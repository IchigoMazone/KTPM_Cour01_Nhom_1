export type OrderStatus =
  | "Tiếp nhận"
  | "Đã xác nhận lịch"
  | "Đang giặt"
  | "Kiểm tra"
  | "Chờ thanh toán"
  | "Hoàn thành";

export type Order = {
  id: string;
  customer: string;
  service: string;
  quantity: string;
  deliveryDate: string; // YYYY-MM-DD
  deliveryTime: string; // HH:MM
  staff: string;
  amount: number;
  status: OrderStatus;
  rawStatus?: string;
  note: string;
  phone: string;
  address: string;
  createdAt: string; // YYYY-MM-DD
  customerCode?: string;
  customerImageUrl?: string;
  appointment?: string;
  payment?: string;
  discount?: string;
  serviceUnit?: string;
  unitPrice?: number;
  originalAmount?: number;
  discountValue?: string;
  discountAmount?: number;
  washer?: string;
  dryer?: string;
  [key: string]: string | number | undefined;
};
