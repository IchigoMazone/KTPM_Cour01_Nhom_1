export type OrderStatus =
  | "Tiếp nhận"
  | "Đang giặt"
  | "Kiểm tra"
  | "Chờ thanh toán"
  | "Hoàn thành"
  | "Đã hủy";

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
  note: string;
  phone: string;
  address: string;
  createdAt: string; // YYYY-MM-DD
};
