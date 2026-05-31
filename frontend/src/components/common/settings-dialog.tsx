"use client";

import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Building2,
  Clock3,
  CreditCard,
  FileText,
  KeyRound,
  Languages,
  Mail,
  MessageCircle,
  Moon,
  Route,
  ShieldCheck,
  Smartphone,
  UserCog,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useDashboardSettingsStore } from "@/src/context/useDashboardSettingsStore";

type SettingsDialogProps = {
  isUserArea: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ToggleItem = {
  icon: LucideIcon;
  label: string;
  description: string;
  enabled: boolean;
};

type SelectItemRow = {
  icon: LucideIcon;
  label: string;
  description: string;
  value: string;
  options: string[];
};

const adminToggles: ToggleItem[] = [
  { icon: Bell, label: "Cảnh báo đơn quá hạn", description: "Nhắc khi đơn gần trễ SLA xử lý.", enabled: true },
  { icon: Mail, label: "Gửi báo cáo cuối ngày qua email", description: "Tự động gửi doanh thu và công nợ.", enabled: true },
  { icon: ShieldCheck, label: "Yêu cầu OTP khi xuất dữ liệu", description: "Bảo vệ thao tác tải file nhạy cảm.", enabled: true },
  { icon: Clock3, label: "Nhắc ca làm trước 15 phút", description: "Thông báo trước khi ca mới bắt đầu.", enabled: false },
];

const userToggles: ToggleItem[] = [
  { icon: Bell, label: "Thông báo trạng thái đơn", description: "Nhận cập nhật khi đơn thay đổi trạng thái.", enabled: true },
  { icon: MessageCircle, label: "Nhận tin Zalo khi tài xế đến", description: "Thông báo khi có lịch lấy/trả đồ.", enabled: true },
  { icon: Mail, label: "Gửi hóa đơn qua email", description: "Tự động gửi hóa đơn sau thanh toán.", enabled: false },
  { icon: Clock3, label: "Nhắc lịch lấy đồ", description: "Nhắc trước lịch hẹn giao nhận.", enabled: true },
];

const storeRows: SelectItemRow[] = [
  { icon: Building2, label: "Tên cửa hàng", description: "Hiển thị trên hóa đơn và dashboard.", value: "Laundry Admin", options: ["Laundry Admin", "Panda Laundry"] },
  { icon: Clock3, label: "Giờ hoạt động", description: "Khung giờ nhận đơn và giao nhận.", value: "07:00 - 22:00", options: ["07:00 - 22:00", "08:00 - 21:00", "24/7"] },
];

const paymentRows: SelectItemRow[] = [
  { icon: CreditCard, label: "Tiền tệ", description: "Đơn vị tiền dùng khi tạo đơn.", value: "VND", options: ["VND", "USD"] },
  { icon: CreditCard, label: "MoMo / VNPay", description: "Cổng thanh toán QR cho thu ngân.", value: "Đang bật", options: ["Đang bật", "Tạm tắt"] },
  { icon: MessageCircle, label: "SMS / Zalo OA", description: "Kênh gửi thông báo cho khách.", value: "SMS bật, Zalo chờ token", options: ["SMS bật, Zalo chờ token", "Bật tất cả", "Tắt tất cả"] },
];

const permissionRows: SelectItemRow[] = [
  { icon: UserCog, label: "Vai trò nội bộ", description: "Phân quyền nhân viên theo vai trò.", value: "Admin, Quản lý, Nhân viên, Tài xế, Thu ngân", options: ["Admin, Quản lý, Nhân viên, Tài xế, Thu ngân", "Chỉ Admin quản trị"] },
  { icon: ShieldCheck, label: "OTP xuất dữ liệu", description: "Áp dụng khi xuất khách hàng, đơn hàng, tài chính.", value: "Bắt buộc", options: ["Bắt buộc", "Chỉ Admin", "Tắt"] },
];

const reportRows: SelectItemRow[] = [
  { icon: FileText, label: "Báo cáo doanh thu", description: "File tổng hợp doanh thu ngày.", value: "Excel 22:00 mỗi ngày", options: ["Excel 22:00 mỗi ngày", "PDF 22:00 mỗi ngày", "Tắt"] },
  { icon: FileText, label: "Báo cáo công nợ", description: "Danh sách khách chưa thanh toán đủ.", value: "Excel thứ 2 hàng tuần", options: ["Excel thứ 2 hàng tuần", "PDF thứ 2 hàng tuần", "Tắt"] },
  { icon: FileText, label: "Báo cáo tồn kho", description: "Vật tư tồn kho và cảnh báo mua thêm.", value: "PDF ngày 1 mỗi tháng", options: ["PDF ngày 1 mỗi tháng", "Excel ngày 1 mỗi tháng", "Tắt"] },
];

function ToggleRow({
  item,
  checked,
  onCheckedChange,
}: {
  item: ToggleItem;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  const Icon = item.icon;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-black/[0.06] px-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0">
          <span className="block text-sm font-medium">{item.label}</span>
          <span className="block truncate text-xs text-muted-foreground">{item.description}</span>
        </span>
      </div>
      <Switch
        className="data-checked:bg-blue-600 data-unchecked:bg-slate-300"
        checked={checked}
        defaultChecked={checked ?? item.enabled}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

function SelectRow({ item }: { item: SelectItemRow }) {
  const Icon = item.icon;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-black/[0.06] px-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 pr-2">
          <span className="block text-sm font-medium">{item.label}</span>
          <span className="block truncate text-xs text-muted-foreground">{item.description}</span>
        </span>
      </div>
      <Select defaultValue={item.value}>
        <SelectTrigger className="h-8 w-[140px] md:w-[180px] shrink-0 rounded-lg border-black/10 bg-white text-sm shadow-sm focus-visible:border-neutral-500 focus-visible:ring-neutral-500/20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-lg border-black/10 bg-white">
          {item.options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function SettingsDialog({
  isUserArea,
  open,
  onOpenChange,
}: SettingsDialogProps) {
  const toggles = isUserArea ? userToggles : adminToggles;
  const { deliveryEnabled, setDeliveryEnabled } = useDashboardSettingsStore();
  const triggerClass =
    "flex items-center justify-start gap-3 rounded-lg px-3 py-2 text-[14px] font-normal text-slate-700 transition-all hover:bg-[#f3f3f3]/60 hover:text-slate-900 data-[state=active]:!bg-[#f3f3f3] data-[state=active]:!text-slate-900 data-[state=active]:!font-normal data-active:!bg-[#f3f3f3] data-active:!text-slate-900 data-active:!font-normal data-[state=active]:!shadow-none data-active:!shadow-none w-full shrink-0 [&_svg]:size-[18px] [&_svg]:text-slate-500 data-[state=active]:[&_svg]:!text-slate-900 data-active:[&_svg]:!text-slate-900 h-10 border-none outline-none";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[min(760px,calc(100vw-2rem))] !max-w-none h-[min(80dvh,590px)] gap-0 overflow-hidden rounded-xl border border-black/10 bg-white p-0 shadow-[0_18px_60px_rgba(0,0,0,0.18)]" showCloseButton={false}>
        <DialogTitle className="sr-only">Cài đặt hệ thống</DialogTitle>
        <Tabs defaultValue="quick" orientation="vertical" className="grid h-full gap-0 overflow-hidden grid-cols-[188px_1fr]">
          <div className="relative z-10 border-b border-black/[0.06] bg-white p-3 md:border-b-0 md:border-r overflow-y-auto flex flex-col gap-2">
            <div className="flex items-center justify-start px-1 py-1">
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors">
                  <X className="size-4" />
                </Button>
              </DialogClose>
            </div>
            <TabsList variant="default" className="flex h-auto w-full flex-col justify-start gap-1 !bg-transparent p-0 md:overflow-visible">
              <TabsTrigger value="quick" className={triggerClass}>
                <Bell className="size-4" />
                Nhanh
              </TabsTrigger>
              <TabsTrigger value="account" className={triggerClass}>
                <KeyRound className="size-4" />
                Tài khoản
              </TabsTrigger>
              {!isUserArea && (
                <>
                  <TabsTrigger value="store" className={triggerClass}>
                    <Building2 className="size-4" />
                    Cửa hàng
                  </TabsTrigger>
                  <TabsTrigger value="payment" className={triggerClass}>
                    <CreditCard className="size-4" />
                    Thanh toán
                  </TabsTrigger>
                  <TabsTrigger value="security" className={triggerClass}>
                    <ShieldCheck className="size-4" />
                    Phân quyền
                  </TabsTrigger>
                  <TabsTrigger value="reports" className={triggerClass}>
                    <FileText className="size-4" />
                    Báo cáo
                  </TabsTrigger>
                </>
              )}
            </TabsList>
          </div>

          <div className="min-w-0 overflow-y-auto px-5 py-4">
            <TabsContent value="quick" className="m-0 space-y-2">
              <div className="mb-4">
                <DialogTitle className="text-base font-semibold leading-6">Cài đặt nhanh</DialogTitle>
                <DialogDescription className="mt-1 text-sm text-muted-foreground">
                  Tùy chỉnh thông báo và bảo mật vận hành.
                </DialogDescription>
              </div>
              <div className="rounded-lg border border-black/[0.06] bg-[#fafafa] p-4">
                <div className="flex items-start gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-slate-700 ring-1 ring-black/[0.08]">
                    <ShieldCheck className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">Bảo mật tài khoản</p>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      Bật OTP khi xuất dữ liệu và nhận cảnh báo các tác vụ quan trọng.
                    </p>
                    <Button className="mt-3 h-8 rounded-lg bg-[#1f1f1f] px-3 text-xs text-white hover:bg-black">
                      Thiết lập bảo mật
                    </Button>
                  </div>
                </div>
              </div>

              {toggles.map((item) => (
                <ToggleRow key={item.label} item={item} />
              ))}
            </TabsContent>

            <TabsContent value="account" className="m-0 space-y-2">
              <div className="mb-4">
                <DialogTitle className="text-base font-semibold leading-6">Tài khoản</DialogTitle>
                <DialogDescription className="mt-1 text-sm text-muted-foreground">
                  Thiết lập bảo mật và trải nghiệm cá nhân.
                </DialogDescription>
              </div>
              {[
                { icon: KeyRound, label: "Đổi mật khẩu", description: "Khuyến nghị mỗi 90 ngày", value: "Nhắc định kỳ", options: ["Nhắc định kỳ", "Nhắc mỗi 30 ngày", "Không nhắc"] },
                { icon: Smartphone, label: "Thiết bị tin cậy", description: "Thiết bị đã đăng nhập gần đây", value: isUserArea ? "1 thiết bị" : "3 thiết bị", options: ["1 thiết bị", "3 thiết bị", "Không giới hạn"] },
                { icon: Languages, label: "Ngôn ngữ", description: "Ngôn ngữ hiển thị trong hệ thống", value: "Tiếng Việt", options: ["Tiếng Việt", "English"] },
                { icon: Moon, label: "Giao diện", description: "Chế độ hiển thị", value: "Sáng", options: ["Sáng", "Tối", "Theo hệ thống"] },
              ].map((item) => (
                <SelectRow key={item.label} item={item} />
              ))}

              <label className="flex items-center gap-3 rounded-lg border border-black/[0.06] px-3 py-3">
                <Checkbox defaultChecked />
                <Label className="text-sm font-normal">
                  Ghi nhớ thiết lập cho lần đăng nhập sau
                </Label>
              </label>
            </TabsContent>

            {!isUserArea && (
              <>
                <TabsContent value="store" className="m-0 space-y-2">
                  <div className="mb-4">
                    <DialogTitle className="text-base font-semibold leading-6">Cửa hàng</DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-muted-foreground">
                      Thông tin vận hành và phạm vi giao nhận.
                    </DialogDescription>
                  </div>
                  {storeRows.map((item) => <SelectRow key={item.label} item={item} />)}
                </TabsContent>

                <TabsContent value="payment" className="m-0 space-y-2">
                  <div className="mb-4">
                    <DialogTitle className="text-base font-semibold leading-6">Thanh toán</DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-muted-foreground">
                      Tiền tệ, cổng thanh toán và kênh thông báo.
                    </DialogDescription>
                  </div>
                  {paymentRows.map((item) => <SelectRow key={item.label} item={item} />)}
                </TabsContent>

                <TabsContent value="security" className="m-0 space-y-2">
                  <div className="mb-4">
                    <DialogTitle className="text-base font-semibold leading-6">Phân quyền</DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-muted-foreground">
                      Vai trò nội bộ và bảo mật xuất dữ liệu.
                    </DialogDescription>
                  </div>
                  {permissionRows.map((item) => <SelectRow key={item.label} item={item} />)}
                </TabsContent>

                <TabsContent value="reports" className="m-0 space-y-2">
                  <div className="mb-4">
                    <DialogTitle className="text-base font-semibold leading-6">Báo cáo</DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-muted-foreground">
                      Lịch xuất file tự động cho tài khoản quản trị.
                    </DialogDescription>
                  </div>
                  {reportRows.map((item) => <SelectRow key={item.label} item={item} />)}
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>


      </DialogContent>
    </Dialog>
  );
}
