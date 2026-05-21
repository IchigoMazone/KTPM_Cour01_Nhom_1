"use client";

import {
  AlertTriangle,
  Clock,
  Package,
  Shirt,
  ShoppingBag,
  Truck,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  PageShell,
  SectionCard,
  StatCard,
  StatusBadge,
} from "./_components/dashboard-primitives";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const revenue7Days = [
  { day: "T2", value: 6200000 },
  { day: "T3", value: 7100000 },
  { day: "T4", value: 6800000 },
  { day: "T5", value: 7900000 },
  { day: "T6", value: 8300000 },
  { day: "T7", value: 9600000 },
  { day: "CN", value: 7400000 },
];

const serviceShare = [
  { name: "Giặt thường", value: 46, color: "#111827" },
  { name: "Giặt khô", value: 22, color: "#6b7280" },
  { name: "Giặt hấp", value: 19, color: "#9ca3af" },
  { name: "Đồ da", value: 13, color: "#d1d5db" },
];

const urgentOrders = [
  ["DH-1048", "Nguyễn Thị Hương", "Giặt hấp", "Phơi/Sấy", "10:30"],
  ["DH-1052", "Trần Minh", "Giặt khô", "Gấp/Là", "11:15"],
  ["DH-1055", "Phạm Lan", "Giặt thường", "Sẵn sàng giao", "12:00"],
  ["DH-1057", "Công ty ABC", "Chăn màn", "Đang giặt", "12:30"],
];

const alerts = [
  ["Nước xả vải", "Còn 6 lít, thấp hơn ngưỡng 8 lít", "danger"],
  ["Nhân viên vắng", "1 nhân viên ca chiều đã báo nghỉ", "warning"],
  ["Khiếu nại mở", "2 phản hồi giao trễ chưa xử lý", "warning"],
];

export default function HomeOverview() {
  return (
    <PageShell
      title="Tổng quan"
      description="Theo dõi đơn hàng, doanh thu, vận hành và cảnh báo trong ngày."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tổng đơn hôm nay"
          value="86"
          hint="+12 đơn so với hôm qua"
          icon={ShoppingBag}
          tone="success"
        />
        <StatCard
          label="Doanh thu hôm nay"
          value="8,6tr"
          hint="Tuần này 48,2tr"
          icon={Wallet}
          tone="default"
        />
        <StatCard
          label="Đang xử lý"
          value="31"
          hint="Giặt 12 · Sấy 8 · Gấp 11"
          icon={Shirt}
          tone="warning"
        />
        <StatCard
          label="Đơn trễ hạn"
          value="4"
          hint="Cần xử lý trước 14:00"
          icon={AlertTriangle}
          tone="danger"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <SectionCard
          title="Đơn cần xử lý ngay"
          description="Các đơn có deadline trong 2 giờ tới."
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Mã đơn</TableHead>
                <TableHead>Khách</TableHead>
                <TableHead>Dịch vụ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Deadline</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {urgentOrders.map((order) => (
                <TableRow key={order[0]}>
                  {order.map((cell, index) => (
                    <TableCell key={cell} className={index === 0 ? "font-medium" : ""}>
                      {index === 3 ? (
                        <span className="font-medium text-neutral-700">
                          {cell}
                        </span>
                      ) : (
                        cell
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>

        <SectionCard title="Cảnh báo hệ thống">
          <div className="divide-y">
            {alerts.map(([title, desc, tone]) => (
              <div key={title} className="flex items-start gap-3 p-4">
                <div className="mt-0.5 flex size-9 items-center justify-center rounded-lg bg-neutral-100">
                  {title === "Nước xả vải" ? (
                    <Package className="size-4" />
                  ) : title === "Nhân viên vắng" ? (
                    <Clock className="size-4" />
                  ) : (
                    <Truck className="size-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
                <StatusBadge tone={tone as "danger" | "warning"}>Mở</StatusBadge>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Doanh thu 7 ngày">
          <div className="h-[280px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" />
                <YAxis tickFormatter={(value) => `${Number(value) / 1000000}tr`} />
                <Tooltip
                  formatter={(value) =>
                    `${Number(value).toLocaleString("vi-VN")} đ`
                  }
                />
                <Area
                  dataKey="value"
                  stroke="#111827"
                  fill="#f3f4f6"
                  strokeWidth={2}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Tỷ lệ dịch vụ hôm nay">
          <div className="grid gap-4 p-4 md:grid-cols-[240px_1fr]">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={serviceShare} dataKey="value" innerRadius={58} outerRadius={90}>
                    {serviceShare.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center gap-3">
              {serviceShare.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ background: item.color }} />
                    {item.name}
                  </span>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        <SectionCard title="Lịch hẹn sắp tới">
          <div className="space-y-3 p-4 text-sm">
            {[
              ["09:00", "Lấy đồ", "Trần Minh"],
              ["10:30", "Giao DH-1048", "Nguyễn Thị Hương"],
              ["13:00", "Lấy chăn màn", "Công ty ABC"],
            ].map(([time, task, customer]) => (
              <div key={`${time}-${task}`} className="rounded-lg border p-3">
                <p className="font-medium">{time} · {task}</p>
                <p className="text-muted-foreground">{customer}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Năng lực máy hôm nay">
          <div className="space-y-3 p-4 text-sm">
            {[
              ["Máy giặt 01", "Đang chạy", "42 phút"],
              ["Máy sấy 02", "Rảnh", "Sẵn sàng"],
              ["Máy hấp 01", "Bảo trì", "16:00 xong"],
            ].map(([machine, status, eta]) => (
              <div key={machine} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{machine}</p>
                  <p className="text-muted-foreground">{eta}</p>
                </div>
                <StatusBadge tone={status === "Bảo trì" ? "warning" : "default"}>{status}</StatusBadge>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Nguồn đơn">
          <div className="space-y-3 p-4 text-sm">
            {[
              ["Website đặt lịch", "31 đơn"],
              ["Zalo / Điện thoại", "24 đơn"],
              ["Khách tại cửa hàng", "21 đơn"],
              ["Khách doanh nghiệp", "10 đơn"],
            ].map(([source, count]) => (
              <div key={source} className="flex items-center justify-between">
                <span>{source}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Checklist cuối ca">
          <div className="space-y-3 p-4 text-sm">
            {[
              "Đối soát tiền mặt",
              "Chốt đơn đã giao",
              "Kiểm kho hóa chất",
              "Gửi SMS đơn còn treo",
            ].map((item, index) => (
              <label key={item} className="flex items-center gap-3">
                <input type="checkbox" defaultChecked={index < 2} className="size-4 accent-neutral-900" />
                {item}
              </label>
            ))}
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}
