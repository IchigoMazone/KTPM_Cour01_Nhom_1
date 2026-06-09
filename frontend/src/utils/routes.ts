import {
  LayoutDashboard,
  ClipboardList,
  CircleUser,
  BadgeCheck,
  Truck,
  Package,
  MessageCircle,
} from "lucide-react";

export const menus = [
  {
    icon: LayoutDashboard,
    label: "Tổng quan",
    path: "/home",
    exact: true,
    description: "Thống kê doanh thu, đơn hàng và cảnh báo nhanh",
  },
  {
    label: "Đơn hàng",
    icon: ClipboardList,
    path: "/home/orders",
    description: "Tạo đơn, theo dõi trạng thái và in phiếu giặt",
  },
  {
    label: "Giao nhận",
    icon: Truck,
    path: "/home/delivery",
    description: "Lịch lấy/trả đồ, tài xế và trạng thái giao hàng",
  },
  {
    label: "Khách hàng",
    icon: CircleUser,
    path: "/home/customers",
    description: "Hồ sơ, lịch sử đơn, loyalty và phản hồi",
  },
  {
    label: "Dịch vụ & Tài chính",
    icon: BadgeCheck,
    path: "/home/services",
    description: "Bảng giá, doanh thu, công nợ và khuyến mãi",
  },
  {
    label: "Vận hành nội bộ",
    icon: Package,
    path: "/home/staff",
    description: "Nhân viên, ca làm, năng suất và kho vật tư",
  },
  {
    label: "Hỗ trợ",
    icon: MessageCircle,
    path: "/home/support",
    description: "Khiếu nại, phản hồi và yêu cầu hỗ trợ khách hàng",
  },
];
