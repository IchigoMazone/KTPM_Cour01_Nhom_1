"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  Gift,
  PackageCheck,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/src/app/home/_components/dashboard-primitives";

type NotificationsDialogProps = {
  isUserArea: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type NotificationItem = {
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
  tone: "default" | "success" | "warning" | "danger";
  label: string;
  orderCode?: string;
  customer?: string;
  service?: string;
  amount?: string;
  pickupTime?: string;
  address?: string;
  confirmLabel?: string;
};

const adminNotifications: NotificationItem[] = [
  {
    icon: AlertTriangle,
    title: "3 đơn sắp quá hạn xử lý",
    description: "Ưu tiên kiểm tra DH-1057, DH-1058 và DH-1061.",
    time: "5 phút trước",
    tone: "danger",
    label: "Gấp",
    orderCode: "DH-1057",
    customer: "Công ty ABC",
    service: "Chăn màn",
    amount: "420.000đ",
    pickupTime: "Hôm nay · 12:30",
    address: "22 Lê Lợi, Quận 1",
    confirmLabel: "Xác nhận xử lý",
  },
  {
    icon: Truck,
    title: "Tài xế Minh đã hoàn tất 6 điểm giao",
    description: "Còn 2 điểm giao trong ca chiều.",
    time: "18 phút trước",
    tone: "success",
    label: "Giao nhận",
    orderCode: "GN-2041",
    customer: "Tài xế Minh",
    service: "Giao đơn hoàn tất",
    amount: "6/8 điểm",
    pickupTime: "Ca chiều",
    address: "Khu vực Quận 1",
    confirmLabel: "Xác nhận hoàn tất",
  },
  {
    icon: Clock3,
    title: "Ca tối bắt đầu lúc 18:00",
    description: "Kiểm tra phân công nhân viên trước ca.",
    time: "40 phút trước",
    tone: "warning",
    label: "Ca làm",
    orderCode: "CA-TOI",
    customer: "Tổ vận hành",
    service: "Phân ca nhân viên",
    amount: "5 nhân viên",
    pickupTime: "18:00 - 22:00",
    address: "Panda Laundry Quận 1",
    confirmLabel: "Đã kiểm tra",
  },
];

const userNotifications: NotificationItem[] = [
  {
    icon: PackageCheck,
    title: "Đơn DH-1055 đang được sấy",
    description: "Dự kiến sẵn sàng giao lúc 18:30 hôm nay.",
    time: "7 phút trước",
    tone: "success",
    label: "Đơn hàng",
    orderCode: "DH-1055",
    customer: "Nguyễn Thị Hương",
    service: "Giặt thường",
    amount: "92.000đ",
    pickupTime: "Sẵn sàng giao 18:30",
    address: "12 Nguyễn Trãi, Quận 1",
    confirmLabel: "Xác nhận đã nhận",
  },
  {
    icon: Truck,
    title: "Tài xế sẽ đến lấy đồ lúc 16:00",
    description: "Bạn có thể thay đổi địa chỉ trước 15:30.",
    time: "22 phút trước",
    tone: "warning",
    label: "Lịch hẹn",
    orderCode: "LH-2031",
    customer: "Nguyễn Thị Hương",
    service: "Lấy đồ tại nhà",
    amount: "Tạm tính 90.000đ",
    pickupTime: "Hôm nay · 16:00",
    address: "12 Nguyễn Trãi, Quận 1",
    confirmLabel: "Xác nhận lịch hẹn",
  },
  {
    icon: Gift,
    title: "Bạn có mã PANDA20 mới",
    description: "Giảm 20% cho đơn từ 150.000đ.",
    time: "Hôm qua",
    tone: "default",
    label: "Ưu đãi",
    orderCode: "PANDA20",
    customer: "Nguyễn Thị Hương",
    service: "Mã ưu đãi",
    amount: "Giảm 20%",
    pickupTime: "HSD 31/05/2026",
    address: "Áp dụng toàn hệ thống",
    confirmLabel: "Đã lưu mã",
  },
];

export default function NotificationsDialog({
  isUserArea,
  open,
  onOpenChange,
}: NotificationsDialogProps) {
  const notifications = isUserArea ? userNotifications : adminNotifications;
  const [selected, setSelected] = useState<NotificationItem | null>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) setSelected(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="!w-[min(640px,calc(100vw-2rem))] !max-w-none gap-0 rounded-xl border border-black/10 bg-white p-0 shadow-[0_18px_60px_rgba(0,0,0,0.18)]" showCloseButton={false}>
        {!selected ? (
          <>
            <DialogHeader className="gap-2 px-5 pt-5">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-[#f3f3f3]">
                  <Bell className="size-4" />
                </span>
                <div>
                  <DialogTitle className="text-base font-semibold leading-6">
                    Thông báo
                  </DialogTitle>
                  <DialogDescription>
                    Bấm vào thông báo liên quan đơn/lịch hẹn để xác nhận xử lý.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="max-h-[62vh] overflow-y-auto px-5 py-4">
              <div className="space-y-3">
                {notifications.map((item) => (
                  <button
                    key={`${item.title}-${item.time}`}
                    type="button"
                    className="flex w-full gap-3 rounded-xl border border-black/[0.06] p-3 text-left transition-colors hover:bg-[#fafafa]"
                    onClick={() => setSelected(item)}
                  >
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#f3f3f3]">
                      <item.icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-medium">{item.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <StatusBadge tone={item.tone}>{item.label}</StatusBadge>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="size-3.5" />
                        <span>{item.time}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter className="m-0 flex-row justify-end gap-2 rounded-b-xl border-t border-black/[0.06] bg-[#fafafa] px-4 py-4">
              <DialogClose asChild>
                <Button variant="outline" className="h-8 rounded-lg border-black/10 bg-white px-3 text-sm shadow-sm hover:bg-[#f5f5f5] sm:w-auto">
                  Đóng
                </Button>
              </DialogClose>
              <Button className="h-8 rounded-lg bg-[#1f1f1f] px-3 text-sm text-white shadow-sm hover:bg-black sm:w-auto">
                Đánh dấu đã đọc
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="gap-2 px-5 pt-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f3f3f3]">
                    <selected.icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <DialogTitle className="truncate text-base font-semibold leading-6">
                      {selected.title}
                    </DialogTitle>
                    <DialogDescription>{selected.description}</DialogDescription>
                  </div>
                </div>
                <StatusBadge tone={selected.tone}>{selected.label}</StatusBadge>
              </div>
            </DialogHeader>

            <div className="px-5 py-4">
              <div className="grid gap-3 rounded-xl border border-black/[0.06] bg-[#fafafa] p-4 sm:grid-cols-2">
                {[
                  { label: "Mã tham chiếu", value: selected.orderCode ?? "N/A" },
                  {
                    label: isUserArea ? "Khách hàng" : "Người phụ trách",
                    value: selected.customer ?? "N/A",
                  },
                  { label: "Dịch vụ", value: selected.service ?? "N/A" },
                  { label: "Chi phí/Tiến độ", value: selected.amount ?? "N/A" },
                  { label: "Thời gian", value: selected.pickupTime ?? selected.time },
                  { label: "Địa chỉ/Khu vực", value: selected.address ?? "N/A" },
                ].map((detail) => (
                  <div
                    key={detail.label}
                    className="rounded-lg border border-black/[0.06] bg-white px-3 py-2.5"
                  >
                    <p className="text-xs text-muted-foreground">{detail.label}</p>
                    <p className="mt-1 truncate text-sm font-medium">{detail.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
                Bấm xác nhận để ghi nhận thông báo này đã được xử lý trong hệ thống.
              </div>
            </div>

            <DialogFooter className="m-0 flex-row justify-end gap-2 rounded-b-xl border-t border-black/[0.06] bg-[#fafafa] px-4 py-4">
              <Button
                variant="outline"
                className="h-8 rounded-lg border-black/10 bg-white px-3 text-sm shadow-sm hover:bg-[#f5f5f5] sm:w-auto"
                onClick={() => setSelected(null)}
              >
                Quay lại
              </Button>
              <Button
                variant="outline"
                className="h-8 rounded-lg border-black/10 bg-white px-3 text-sm shadow-sm hover:bg-[#f5f5f5] sm:w-auto"
                onClick={() => handleOpenChange(false)}
              >
                Bỏ qua
              </Button>
              <Button
                className="h-8 rounded-lg bg-[#1f1f1f] px-3 text-sm text-white shadow-sm hover:bg-black sm:w-auto"
                onClick={() => handleOpenChange(false)}
              >
                {selected.confirmLabel ?? "Xác nhận"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
