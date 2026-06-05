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
  [key: string]: string | number;
};

export type ColumnId = string;

export type ColumnDef = {
  id: string;
  label: string;
  width: number;
  visible: boolean;
};
