"use client";

import { useState } from "react";
import { FileDown, FileText, Send, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PageShell,
  Period,
  PeriodTabs,
  SectionCard,
  StatusBadge,
} from "../_components/dashboard-primitives";

const reportData = [
  { name: "Giặt thường", orders: 340, revenue: 52000000 },
  { name: "Giặt khô", orders: 180, revenue: 46000000 },
  { name: "Giặt hấp", orders: 95, revenue: 26000000 },
  { name: "Chăn màn", orders: 72, revenue: 21000000 },
];

const topCustomers = [
  ["Công ty ABC", "45 đơn", "18.600.000đ"],
  ["Nguyễn Thị Hương", "28 đơn", "6.800.000đ"],
  ["Shop Linen", "22 đơn", "5.400.000đ"],
];

const roles = [
  ["Admin", "Toàn bộ hệ thống", "Bật"],
  ["Quản lý", "Dashboard, đơn, nhân viên, báo cáo", "Bật"],
  ["Nhân viên giặt", "Đơn hàng, trạng thái xử lý", "Bật"],
  ["Tài xế", "Giao nhận", "Bật"],
  ["Thu ngân", "Đơn hàng, tài chính", "Bật"],
];

const complaints = [
  ["Mất đồ", "Nguyễn Văn A", "Đang xử lý", "Thiếu 1 tất đen trong DH-1022"],
  ["Giao trễ", "Trần Thị B", "Mới", "Trễ 45 phút so với lịch hẹn"],
  ["Hỏng đồ", "Phạm Lan", "Đã giải quyết", "Đền bù theo chính sách"],
];

export default function ReportsSettingsPage() {
  const [tab, setTab] = useState("Báo cáo");
  const [period, setPeriod] = useState<Period>("Tháng");

  return (
    <PageShell
      title="Báo Cáo & Cài Đặt"
      description="Xuất dữ liệu, quản lý cửa hàng, phân quyền, tích hợp và phản hồi."
      action={
        <div className="flex gap-2">
          <Button variant="outline">
            <FileDown className="mr-2 size-4" />
            Excel
          </Button>
          <Button className="bg-neutral-900 text-white hover:bg-neutral-800">
            <FileText className="mr-2 size-4" />
            PDF
          </Button>
        </div>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <PeriodTabs value={period} onChange={setPeriod} />
        {["Báo cáo", "Cài đặt cửa hàng", "Phân quyền", "Tích hợp & Thông báo", "Hỗ trợ"].map((item) => (
          <Button
            key={item}
            variant={tab === item ? "default" : "outline"}
            size="sm"
            onClick={() => setTab(item)}
          >
            {item}
          </Button>
        ))}
      </div>

      {tab === "Báo cáo" && (
        <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
          <SectionCard title="Dịch vụ phổ biến">
            <div className="h-[320px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#111827" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
          <SectionCard title="Top khách hàng">
            <Table>
              <TableCaption>Top khách hàng theo số đơn và chi tiêu.</TableCaption>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Đơn</TableHead>
                  <TableHead>Chi tiêu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCustomers.map((row) => (
                  <TableRow key={row[0]}>
                    {row.map((cell) => <TableCell key={cell}>{cell}</TableCell>)}
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2}>Tổng chi tiêu nhóm top</TableCell>
                  <TableCell className="text-right">30.800.000đ</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </SectionCard>
        </div>
      )}

      {tab === "Cài đặt cửa hàng" && (
        <SectionCard title="Thông tin cửa hàng">
          <div className="grid gap-4 p-5 md:grid-cols-2">
            {[
              ["Tên cửa hàng", "Laundry Admin"],
              ["Địa chỉ", "12 Trần Phú, Quận 1, TP.HCM"],
              ["SĐT", "028 3812 3456"],
              ["Email", "hello@laundry.vn"],
              ["Múi giờ", "Asia/Bangkok"],
              ["Tiền tệ", "VND"],
            ].map(([label, value]) => (
              <div key={label} className="space-y-2">
                <Label>{label}</Label>
                <Input defaultValue={value} />
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {tab === "Phân quyền" && (
        <SectionCard
          title="Vai trò và quyền truy cập"
          description="Cấu hình quyền truy cập từng trang cho từng vai trò."
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Vai trò</TableHead>
                <TableHead>Phạm vi</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((row) => (
                <TableRow key={row[0]}>
                  <TableCell className="font-medium">{row[0]}</TableCell>
                  <TableCell>{row[1]}</TableCell>
                  <TableCell>
                    <StatusBadge tone="success">{row[2]}</StatusBadge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>
      )}

      {tab === "Tích hợp & Thông báo" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard title="Thanh toán">
            <div className="space-y-3 p-5">
              {["MoMo", "VNPay", "Tiền mặt", "Chuyển khoản ngân hàng"].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-lg border p-3">
                  <span className="flex items-center gap-2">
                    <Settings className="size-4" />
                    {item}
                  </span>
                  <Switch defaultChecked />
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Thông báo SMS / Zalo OA">
            <div className="space-y-3 p-5">
              {[
                "Xác nhận tiếp nhận đơn",
                "Cập nhật trạng thái đang giặt",
                "Nhắc lịch giao nhận",
                "Đơn đã giao xong",
                "Sinh nhật + mã giảm giá",
              ].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-lg border p-3">
                  <span className="flex items-center gap-2">
                    <Send className="size-4" />
                    {item}
                  </span>
                  <Switch defaultChecked={item !== "Sinh nhật + mã giảm giá"} />
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {tab === "Hỗ trợ" && (
        <SectionCard title="Khiếu nại & phản hồi">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Loại</TableHead>
                <TableHead>Khách</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Nội dung</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.map((row) => (
                <TableRow key={`${row[0]}-${row[1]}`}>
                  <TableCell>{row[0]}</TableCell>
                  <TableCell>{row[1]}</TableCell>
                  <TableCell>
                    <StatusBadge tone={row[2] === "Đã giải quyết" ? "success" : "warning"}>
                      {row[2]}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>{row[3]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard title="Template tin nhắn">
          <div className="space-y-3 p-4 text-sm">
            {[
              ["Tiếp nhận đơn", "Xin chào {{tên_khách}}, đơn {{mã_đơn}} đã được tiếp nhận."],
              ["Sẵn sàng giao", "Đơn {{mã_đơn}} đã sẵn sàng giao trả lúc {{giờ_giao}}."],
              ["Sinh nhật", "Chúc mừng sinh nhật {{tên_khách}}, tặng bạn mã {{mã_giảm_giá}}."],
            ].map(([name, template]) => (
              <div key={name} className="rounded-lg border p-3">
                <p className="font-medium">{name}</p>
                <p className="mt-1 text-muted-foreground">{template}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Lịch xuất báo cáo">
          <div className="space-y-3 p-4 text-sm">
            {[
              ["Doanh thu ngày", "22:00 mỗi ngày", "Email quản lý"],
              ["Công nợ tuần", "Thứ 2 hàng tuần", "Excel"],
              ["Tồn kho tháng", "Ngày 1 mỗi tháng", "PDF"],
            ].map(([name, schedule, channel]) => (
              <div key={name} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{name}</p>
                  <p className="text-muted-foreground">{schedule}</p>
                </div>
                <StatusBadge>{channel}</StatusBadge>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Audit cấu hình">
          <div className="space-y-3 p-4 text-sm">
            {[
              ["Admin cập nhật giờ hoạt động", "16/05/2026 09:12"],
              ["Quản lý bật VNPay", "15/05/2026 18:30"],
              ["Thu ngân đổi template SMS", "14/05/2026 11:05"],
            ].map(([event, time]) => (
              <div key={event} className="rounded-lg border p-3">
                <p className="font-medium">{event}</p>
                <p className="text-muted-foreground">{time}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}
