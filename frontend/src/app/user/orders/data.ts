import { ColumnId } from "./types";

export const orders = [
  { code: "DH-1055", date: "17/05/2026", service: "Giặt thường", total: "92.000đ", status: "Đang giặt", tone: "default" },
  { code: "DH-1048", date: "16/05/2026", service: "Giặt hấp", total: "180.000đ", status: "Sẵn sàng giao", tone: "success" },
  { code: "DH-1032", date: "12/05/2026", service: "Chăn màn", total: "240.000đ", status: "Hoàn tất", tone: "success" },
  { code: "DH-1019", date: "06/05/2026", service: "Giặt khô", total: "135.000đ", status: "Đã hủy", tone: "danger" },
  { code: "DH-1015", date: "05/05/2026", service: "Giặt thường", total: "75.000đ", status: "Hoàn tất", tone: "success" },
  { code: "DH-1012", date: "01/05/2026", service: "Giặt thường", total: "110.000đ", status: "Hoàn tất", tone: "success" },
  { code: "DH-1008", date: "28/04/2026", service: "Giặt hấp", total: "150.000đ", status: "Hoàn tất", tone: "success" },
  { code: "DH-1005", date: "20/04/2026", service: "Giặt hấp", total: "220.000đ", status: "Hoàn tất", tone: "success" },
  { code: "DH-0998", date: "15/04/2026", service: "Giặt thường", total: "95.000đ", status: "Hoàn tất", tone: "success" },
] as const;

export const monthNames = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

export const defaultColumns = [
  { id: "code" as ColumnId, label: "Mã đơn", width: 120, visible: true },
  { id: "date" as ColumnId, label: "Ngày", width: 120, visible: true },
  { id: "service" as ColumnId, label: "Dịch vụ", width: 150, visible: true },
  { id: "status" as ColumnId, label: "Trạng thái", width: 150, visible: true },
  { id: "total" as ColumnId, label: "Tổng tiền", width: 120, visible: true, alignRight: true },
  { id: "actions" as ColumnId, label: "Thao tác", width: 80, visible: true, alignRight: true },
];
