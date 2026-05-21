"use client";

import { CalendarDays, Clock, Home, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  PageShell,
  SectionCard,
  StatusBadge,
} from "@/src/app/home/_components/dashboard-primitives";

const bookings = [
  { id: "LH-2031", service: "Giặt sấy theo kg", slot: "Hôm nay · 16:00", address: "12 Nguyễn Trãi", status: "Đã xác nhận" },
  { id: "LH-2032", service: "Chăn màn", slot: "Thứ 6 · 09:30", address: "12 Nguyễn Trãi", status: "Chờ xác nhận" },
];

export default function UserBookingsPage() {
  return (
    <PageShell
      title="Đặt Lịch Lấy Đồ"
      description="Tạo lịch lấy đồ tại nhà, chọn dịch vụ và ghi chú yêu cầu xử lý."
    >
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Thông tin lịch hẹn" description="Điền nhanh thông tin để tiệm xác nhận lịch.">
          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
            <div className="space-y-2">
              <Label>Dịch vụ</Label>
              <Select defaultValue="wash-dry">
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Chọn dịch vụ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wash-dry">Giặt sấy theo kg</SelectItem>
                  <SelectItem value="dry-clean">Giặt hấp cao cấp</SelectItem>
                  <SelectItem value="blanket">Chăn màn</SelectItem>
                  <SelectItem value="express">Giao nhanh trong ngày</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ngày lấy đồ</Label>
              <Input type="date" defaultValue="2026-05-17" className="h-10" />
            </div>
            <div className="space-y-2">
              <Label>Khung giờ</Label>
              <Select defaultValue="16">
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Chọn giờ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9">09:00 - 10:00</SelectItem>
                  <SelectItem value="14">14:00 - 15:00</SelectItem>
                  <SelectItem value="16">16:00 - 17:00</SelectItem>
                  <SelectItem value="19">19:00 - 20:00</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input defaultValue="0901 234 567" className="h-10" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Địa chỉ lấy đồ</Label>
              <Input defaultValue="12 Nguyễn Trãi, Quận 1, TP.HCM" className="h-10" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Ghi chú</Label>
              <Textarea placeholder="Ví dụ: áo trắng tách riêng, cần giao trước 18:00..." />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
              <Button variant="outline">Lưu nháp</Button>
              <Button className="bg-neutral-900 text-white hover:bg-neutral-800">Gửi lịch hẹn</Button>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Ước tính đơn" description="Giá có thể thay đổi sau khi cân đồ.">
          <div className="space-y-4 p-5">
            {[
              { icon: Sparkles, label: "Giặt sấy theo kg", value: "5 kg x 18.000đ" },
              { icon: CalendarDays, label: "Ngày lấy đồ", value: "17/05/2026" },
              { icon: Clock, label: "Khung giờ", value: "16:00 - 17:00" },
              { icon: MapPin, label: "Phí giao nhận", value: "Miễn phí" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-gray-100">
                  <item.icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="font-medium">{item.value}</p>
                </div>
              </div>
            ))}
            <div className="rounded-lg bg-[#f7f7f7] p-4">
              <p className="text-sm text-muted-foreground">Tạm tính</p>
              <p className="text-2xl font-semibold">90.000đ</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Lịch hẹn sắp tới" description="Các lịch đã tạo và trạng thái xác nhận.">
        <div className="divide-y">
          {bookings.map((booking) => (
            <div key={booking.id} className="grid gap-3 px-4 py-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center sm:px-6">
              <div>
                <p className="font-medium">{booking.id}</p>
                <p className="text-sm text-muted-foreground">{booking.service}</p>
              </div>
              <div className="flex items-center gap-2 text-sm"><Clock className="size-4" />{booking.slot}</div>
              <div className="flex items-center gap-2 text-sm"><Home className="size-4" />{booking.address}</div>
              <StatusBadge tone={booking.status === "Đã xác nhận" ? "success" : "warning"}>{booking.status}</StatusBadge>
            </div>
          ))}
        </div>
      </SectionCard>
    </PageShell>
  );
}
