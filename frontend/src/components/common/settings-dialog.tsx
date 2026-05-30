"use client";

import {
  Bell,
  Clock3,
  KeyRound,
  Languages,
  Mail,
  MessageCircle,
  Moon,
  Route,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useDashboardSettingsStore } from "@/src/context/useDashboardSettingsStore";

type SettingsDialogProps = {
  isUserArea: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const adminToggles = [
  { icon: Bell, label: "Cảnh báo đơn quá hạn", enabled: true },
  { icon: Mail, label: "Gửi báo cáo cuối ngày qua email", enabled: true },
  { icon: ShieldCheck, label: "Yêu cầu OTP khi xuất dữ liệu", enabled: true },
  { icon: Clock3, label: "Nhắc ca làm trước 15 phút", enabled: false },
];

const userToggles = [
  { icon: Bell, label: "Thông báo trạng thái đơn", enabled: true },
  { icon: MessageCircle, label: "Nhận tin Zalo khi tài xế đến", enabled: true },
  { icon: Mail, label: "Gửi hóa đơn qua email", enabled: false },
  { icon: Clock3, label: "Nhắc lịch lấy đồ", enabled: true },
];

export default function SettingsDialog({
  isUserArea,
  open,
  onOpenChange,
}: SettingsDialogProps) {
  const toggles = isUserArea ? userToggles : adminToggles;
  const { deliveryEnabled, setDeliveryEnabled } = useDashboardSettingsStore();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[min(720px,calc(100vw-2rem))] !max-w-none gap-0 rounded-xl border border-black/10 bg-white p-0 shadow-[0_18px_60px_rgba(0,0,0,0.18)]" showCloseButton={false}>
        <DialogHeader className="gap-2 px-5 pt-5">
          <DialogTitle className="text-base font-semibold leading-6">
            Cài đặt
          </DialogTitle>
          <DialogDescription>
            Tùy chỉnh thông báo, bảo mật và trải nghiệm sử dụng.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 px-5 py-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-3">
            <p className="text-sm font-medium">Tùy chọn nhanh</p>
            {toggles.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-3 rounded-lg border border-black/[0.06] px-3 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <item.icon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm">{item.label}</span>
                </div>
                <Switch defaultChecked={item.enabled} />
              </div>
            ))}
            {!isUserArea && (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-black/[0.06] px-3 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Route className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0">
                    <span className="block text-sm">Hiển thị mục Giao nhận</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      Tắt để ẩn lịch giao nhận khỏi dashboard
                    </span>
                  </span>
                </div>
                <Switch
                  checked={deliveryEnabled}
                  onCheckedChange={setDeliveryEnabled}
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Thiết lập tài khoản</p>
            {[
              { icon: KeyRound, label: "Đổi mật khẩu", value: "Khuyến nghị mỗi 90 ngày" },
              { icon: Smartphone, label: "Thiết bị tin cậy", value: isUserArea ? "1 thiết bị" : "3 thiết bị" },
              { icon: Languages, label: "Ngôn ngữ", value: "Tiếng Việt" },
              { icon: Moon, label: "Giao diện", value: "Sáng" },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                className="flex w-full items-center gap-3 rounded-lg border border-black/[0.06] px-3 py-3 text-left transition-colors hover:bg-[#f7f7f7]"
              >
                <item.icon className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{item.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {item.value}
                  </span>
                </span>
              </button>
            ))}

            <label className="flex items-center gap-3 rounded-lg border border-black/[0.06] px-3 py-3">
              <Checkbox defaultChecked />
              <Label className="text-sm font-normal">
                Ghi nhớ thiết lập cho lần đăng nhập sau
              </Label>
            </label>
          </div>
        </div>

        <DialogFooter className="m-0 flex-row justify-end gap-2 rounded-b-xl border-t border-black/[0.06] bg-[#fafafa] px-4 py-4">
          <DialogClose asChild>
            <Button variant="outline" className="h-8 rounded-lg border-black/10 bg-white px-3 text-sm shadow-sm hover:bg-[#f5f5f5] sm:w-auto">
              Hủy
            </Button>
          </DialogClose>
          <Button className="h-8 rounded-lg bg-[#1f1f1f] px-3 text-sm text-white shadow-sm hover:bg-black sm:w-auto">
            Lưu cài đặt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
