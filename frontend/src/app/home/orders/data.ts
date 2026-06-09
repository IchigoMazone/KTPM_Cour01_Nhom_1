import { toInputDate, addDays } from "@/src/utils/dashboard-time";
import { Order, OrderStatus, ColumnId } from "./types";

export const statuses: OrderStatus[] = [
  "Tiếp nhận",
  "Đã xác nhận lịch",
  "Đang giặt",
  "Kiểm tra",
  "Chờ thanh toán",
  "Hoàn thành",
];

const today = new Date();
const d0 = toInputDate(today);
const d1 = toInputDate(addDays(today, -1));
const d2 = toInputDate(addDays(today, -2));
const d3 = toInputDate(addDays(today, -3));
const d4 = toInputDate(addDays(today, -4));

export const seedOrders: Order[] = [
  { id: "DH-1048", customer: "Nguyễn Thị Hương", phone: "0903123456", address: "12 Trần Phú, Q.1", service: "Giặt", quantity: "6 kg", amount: 180000, status: "Kiểm tra", appointment: "10:30", deliveryDate: d0, deliveryTime: "18:00", staff: "Nguyen Anh Minh", createdAt: d0, note: "Không dùng nước xả" },
  { id: "DH-1052", customer: "Trần Minh", phone: "0912456789", address: "90 Lý Thường Kiệt, Q.3", service: "Giặt sấy", quantity: "8 kg", amount: 240000, status: "Chờ thanh toán", appointment: "11:15", deliveryDate: d0, deliveryTime: "19:00", staff: "Chị Lan", createdAt: d0, note: "Ưu tiên đồ trắng riêng" },
  { id: "DH-1055", customer: "Phạm Lan", phone: "0938123456", address: "18 Nguyễn Du, Q.1", service: "Giặt thường", quantity: "5 kg", amount: 125000, status: "Hoàn thành", appointment: "12:00", deliveryDate: d1, deliveryTime: "17:30", staff: "Anh Tuấn", createdAt: d1, note: "Khách tự kiểm lại" },
  { id: "DH-1057", customer: "Công ty ABC", phone: "0283812345", address: "55 Pasteur, Q.1", service: "Chăn màn", quantity: "8 kg", amount: 320000, status: "Đang giặt", appointment: "12:30", deliveryDate: d2, deliveryTime: "20:00", staff: "Anh Minh", createdAt: d2, note: "Xuất hóa đơn cuối tháng" },
  { id: "DH-1061", customer: "Shop Linen", phone: "0283999888", address: "22 Mạc Đĩnh Chi, Q.1", service: "Giặt sấy", quantity: "12 kg", amount: 300000, status: "Tiếp nhận", appointment: "15:00", deliveryDate: d3, deliveryTime: "21:00", staff: "Chưa gán", createdAt: d3, note: "Khách doanh nghiệp" },
  { id: "DH-1062", customer: "Lê Mai", phone: "0977000111", address: "4 Võ Văn Tần, Q.3", service: "Vệ sinh rèm", quantity: "4 bộ", amount: 180000, status: "Hoàn thành", appointment: "16:30", deliveryDate: d4, deliveryTime: "18:30", staff: "Chị Lan", createdAt: d4, note: "Đã thu tiền mặt" },
  { id: "DH-1063", customer: "Nguyễn Văn Phúc", phone: "0901234567", address: "88 Nguyễn Huệ, Q.1", service: "Giặt", quantity: "4 kg", amount: 120000, status: "Đã xác nhận lịch", appointment: "09:00", deliveryDate: d2, deliveryTime: "16:00", staff: "Anh Tuấn", createdAt: d2, note: "" },
  { id: "DH-1064", customer: "Trương Thị Bích", phone: "0987654321", address: "45 Hai Bà Trưng, Q.3", service: "Giặt khô", quantity: "3 kg", amount: 150000, status: "Hoàn thành", appointment: "08:30", deliveryDate: d3, deliveryTime: "15:00", staff: "Chị Lan", createdAt: d3, note: "Đồ lụa" },
  { id: "DH-1065", customer: "Café Sương Mai", phone: "0281234567", address: "12 Lê Lợi, Q.1", service: "Giặt sấy", quantity: "15 kg", amount: 375000, status: "Tiếp nhận", appointment: "14:00", deliveryDate: d0, deliveryTime: "20:00", staff: "Chưa gán", createdAt: d0, note: "Khăn bàn, rèm cửa" },
  { id: "DH-1066", customer: "Lý Minh Châu", phone: "0909876543", address: "33 Điện Biên Phủ, Bình Thạnh", service: "Giặt hấp", quantity: "2 kg", amount: 100000, status: "Đang giặt", appointment: "11:00", deliveryDate: d0, deliveryTime: "17:00", staff: "Anh Minh", createdAt: d0, note: "Vest + sơ mi" },
  { id: "DH-1067", customer: "Hotel Majestic", phone: "0283456789", address: "1 Đồng Khởi, Q.1", service: "Chăn màn", quantity: "25 kg", amount: 750000, status: "Kiểm tra", appointment: "07:00", deliveryDate: d1, deliveryTime: "19:00", staff: "Anh Tuấn", createdAt: d1, note: "Đơn doanh nghiệp lớn" },
  { id: "DH-1068", customer: "Đặng Hoàng", phone: "0976543210", address: "67 Cách Mạng Tháng 8, Q.10", service: "Giặt thường", quantity: "7 kg", amount: 175000, status: "Chờ thanh toán", appointment: "13:30", deliveryDate: d0, deliveryTime: "18:30", staff: "Chị Lan", createdAt: d0, note: "" },
];

export const pageSize = 10;

export const emptyForm = {
  customer: "",
  phone: "",
  address: "",
  service: "Giặt",
  quantity: "",
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
  note: "",
};

export const statusDotColor: Record<OrderStatus, string> = {
  "Tiếp nhận": "#6366f1",
  "Đã xác nhận lịch": "#3b82f6",
  "Đang giặt": "#f59e0b",
  "Kiểm tra": "#8b5cf6",
  "Chờ thanh toán": "#ef4444",
  "Hoàn thành": "#10b981",
};

export const statusBgColor: Record<OrderStatus, string> = {
  "Tiếp nhận": "rgba(99,102,241,0.08)",
  "Đã xác nhận lịch": "rgba(59,130,246,0.08)",
  "Đang giặt": "rgba(245,158,11,0.08)",
  "Kiểm tra": "rgba(139,92,246,0.08)",
  "Chờ thanh toán": "rgba(239,68,68,0.08)",
  "Hoàn thành": "rgba(16,185,129,0.08)",
};

export const allStatusColor = "#0f766e";
export const allStatusBgColor = "rgba(15,118,110,0.09)";

export const defaultColumns = [
  { id: "id" as ColumnId, label: "Mã đơn", width: 130, visible: true },
  { id: "customer" as ColumnId, label: "Khách hàng", width: 180, visible: true },
  { id: "phone" as ColumnId, label: "Số điện thoại", width: 120, visible: true },
  { id: "service" as ColumnId, label: "Dịch vụ", width: 120, visible: true },
  { id: "quantity" as ColumnId, label: "Khối lượng", width: 100, visible: true },
  { id: "washer" as ColumnId, label: "Máy giặt", width: 110, visible: true },
  { id: "dryer" as ColumnId, label: "Máy sấy", width: 110, visible: true },
  { id: "amount" as ColumnId, label: "Giá", width: 120, visible: true },
  { id: "deliveryDate" as ColumnId, label: "Ngày giao", width: 110, visible: true },
  { id: "deliveryTime" as ColumnId, label: "Giờ giao", width: 100, visible: true },
  { id: "staff" as ColumnId, label: "Nhân viên", width: 160, visible: true },
  { id: "status" as ColumnId, label: "Trạng thái", width: 150, visible: true },
  { id: "createdAt" as ColumnId, label: "Ngày tạo đơn", width: 120, visible: true },
  { id: "actions" as ColumnId, label: "Thao tác", width: 180, visible: true },
];

export const checkboxClass =
  "relative size-4 appearance-none rounded-[5px] border border-slate-300 bg-white transition-all duration-150 checked:border-emerald-300 checked:bg-emerald-300 after:absolute after:left-1/2 after:top-1/2 after:hidden after:h-[9px] after:w-[5px] after:-translate-x-1/2 after:-translate-y-[58%] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:content-[''] checked:after:block";
