import {
  CalendarCheck,
  Gift,
  Headset,
  Home,
  PackageCheck,
} from "lucide-react";

export const userMenus = [
  {
    icon: Home,
    label: "Tổng quan",
    path: "/user",
    exact: true,
    description: "Theo dõi lịch hẹn, đơn giặt và ưu đãi cá nhân",
  },
  {
    icon: CalendarCheck,
    label: "Đặt lịch",
    path: "/user/bookings",
    description: "Đặt lịch lấy đồ và chọn dịch vụ giặt",
  },
  {
    icon: PackageCheck,
    label: "Đơn của tôi",
    path: "/user/orders",
    description: "Theo dõi trạng thái đơn và lịch sử giặt",
  },
  {
    icon: Gift,
    label: "Ưu đãi",
    path: "/user/loyalty",
    description: "Điểm thưởng, mã giảm giá và hạng thành viên",
  },
  {
    icon: Headset,
    label: "Hỗ trợ",
    path: "/user/support",
    description: "Gửi yêu cầu hỗ trợ và phản hồi dịch vụ",
  },
];
