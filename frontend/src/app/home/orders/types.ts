export type OrderStatus =
  | "Tiếp nhận"
  | "Đã xác nhận lịch"
  | "Đang giặt"
  | "Kiểm tra"
  | "Chờ thanh toán"
  | "Hoàn thành";

export type Order = {
  id: string;
  customerCode?: string;
  customerDbId?: string;
  serviceCode?: string;
  serviceDbId?: string;
  customer: string;
  phone: string;
  address: string;
  service: string;
  serviceUnit?: string;
  unitPrice?: number;
  quantity: string;
  amount: number;
  status: OrderStatus;
  appointment: string;
  deliveryDate: string;
  deliveryTime: string;
  washer?: string;
  dryer?: string;
  staff: string;
  createdAt: string;
  note: string;
  dbId?: string;
  [key: string]: string | number | undefined;
};

export type ColumnId = string;

export type ColumnDef = {
  id: string;
  label: string;
  width: number;
  visible: boolean;
};
