"use client";

import Image from "next/image";
import {
  Building2,
  CalendarDays,
  Camera,
  Mail,
  MessageCircle,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ProfileDialogProps = {
  accountName: string;
  isUserArea: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ProfileDialog({
  accountName,
  isUserArea,
  open,
  onOpenChange,
}: ProfileDialogProps) {
  const accountType = isUserArea ? "Tài khoản khách hàng" : "Tài khoản quản trị";
  const email = isUserArea ? "huong.nguyen@email.com" : "nhat.trinh@begausshop.vn";
  const phone = isUserArea ? "0901 234 567" : "0902 888 168";
  const zalo = isUserArea ? "0901 234 567" : "0902 888 168";
  const birthday = isUserArea ? "12/08/1998" : "18/03/1997";
  const location = isUserArea ? "12 Nguyễn Trãi, Quận 1" : "Panda Laundry Quận 1";
  const role = isUserArea ? "Khách hàng thân thiết" : "Quản lý cửa hàng";
  const code = isUserArea ? "KH-1048" : "NV-001";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[min(680px,calc(100vw-2rem))] !max-w-none gap-0 rounded-xl border border-black/10 bg-white p-0 shadow-[0_18px_60px_rgba(0,0,0,0.18)]" showCloseButton={false}>
        <DialogHeader className="gap-3 px-5 pt-5">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <Image
                src="/default_avatar.jfif"
                alt="avatar"
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover"
              />
              <button
                type="button"
                className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm transition-colors hover:bg-[#f5f5f5]"
                aria-label="Đổi ảnh đại diện"
              >
                <Camera className="size-3.5" />
              </button>
            </div>
            <div className="min-w-0">
              <DialogTitle className="truncate text-base font-semibold leading-6">
                {accountName}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {accountType} · {code}
              </DialogDescription>
              <p className="mt-1 text-xs text-muted-foreground">{role}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-y-auto px-5 py-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Họ tên</Label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input defaultValue={accountName} className="h-10 rounded-lg pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Vai trò</Label>
              <div className="relative">
                <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input defaultValue={role} className="h-10 rounded-lg pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input defaultValue={email} className="h-10 rounded-lg pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Số điện thoại</Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input defaultValue={phone} className="h-10 rounded-lg pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Zalo</Label>
              <div className="relative">
                <MessageCircle className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input defaultValue={zalo} className="h-10 rounded-lg pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Ngày sinh</Label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input defaultValue={birthday} className="h-10 rounded-lg pl-9" />
              </div>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs text-muted-foreground">
                {isUserArea ? "Địa chỉ mặc định" : "Chi nhánh làm việc"}
              </Label>
              <div className="relative">
                {isUserArea ? (
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                ) : (
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                )}
                <Input defaultValue={location} className="h-10 rounded-lg pl-9" />
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-black/[0.06] bg-[#fafafa] p-3">
            <p className="text-sm font-medium">Trạng thái tài khoản</p>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              {["Đã xác minh", "Đang hoạt động", "Bảo mật tốt"].map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-black/[0.06] bg-white px-3 py-2 text-xs font-medium"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="m-0 flex-row justify-end gap-2 rounded-b-xl border-t border-black/[0.06] bg-[#fafafa] px-4 py-4">
          <DialogClose asChild>
            <Button variant="outline" className="h-8 rounded-lg border-black/10 bg-white px-3 text-sm shadow-sm hover:bg-[#f5f5f5] sm:w-auto">
              Đóng
            </Button>
          </DialogClose>
          <Button className="h-8 rounded-lg bg-[#1f1f1f] px-3 text-sm text-white shadow-sm hover:bg-black sm:w-auto">
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
