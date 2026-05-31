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
  phone: string;
  address: string;
  service: string;
  quantity: string;
  amount: number;
  status: OrderStatus;
  appointment: string;
  deliveryDate: string;
  deliveryTime: string;
  staff: string;
  createdAt: string;
  note: string;
  [key: string]: any;
};

export type ColumnId = string;
