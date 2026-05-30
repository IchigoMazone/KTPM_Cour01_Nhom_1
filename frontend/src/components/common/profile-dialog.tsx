"use client";

import { API_BASE_URL } from "@/src/lib/config";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  Building2,
  Camera,
  CircleCheck,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SpokeSpinner } from "@/src/components/ui/spoke-spinner";
import { Skeleton } from "@/src/components/ui/skeleton";
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
  onProfileUpdated?: (accountName: string) => void;
};

type UserProfile = {
  profile_id: number;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  image_url?: string | null;
  loyalty_points: number;
  member_tier: string;
  special_notes?: string | null;
};

type CurrentUser = {
  user_id: number;
  username: string;
  role: string;
  is_active: boolean;
  profile?: UserProfile | null;
};

type ProfileForm = {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  special_notes: string;
};

const emptyForm: ProfileForm = {
  full_name: "",
  email: "",
  phone: "",
  address: "",
  special_notes: "",
};

const roleLabel: Record<string, string> = {
  admin: "Quản trị viên",
  manager: "Quản lý cửa hàng",
  staff: "Nhân viên vận hành",
  driver: "Nhân viên giao nhận",
  cashier: "Thu ngân",
  customer: "Khách hàng",
};

export default function ProfileDialog({
  accountName,
  isUserArea,
  open,
  onOpenChange,
  onProfileUpdated,
}: ProfileDialogProps) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const accountType = isUserArea ? "Tài khoản khách hàng" : "Tài khoản nội bộ";
  const isProfileLoading = (isLoading && !currentUser) || isUploading;
  const displayName = form.full_name || accountName;
  const avatarUrl = currentUser?.profile?.image_url || "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif";
  const displayRole = currentUser ? roleLabel[currentUser.role] || currentUser.role : accountType;
  const accountCode = currentUser
    ? `${isUserArea ? "KH" : "TK"}-${String(currentUser.user_id).padStart(4, "0")}`
    : "Đang tải";

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Phiên đăng nhập đã hết hạn.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/upload-avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        toast.error(data.detail || data.message || "Tải ảnh lên thất bại.");
        return;
      }

      toast.success("Cập nhật ảnh đại diện thành công!");
      if (data.image_url) {
        localStorage.setItem("accountImageUrl", data.image_url);
        setCurrentUser((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            profile: prev.profile ? { ...prev.profile, image_url: data.image_url } : {
              profile_id: 0,
              full_name: prev.username,
              image_url: data.image_url,
              loyalty_points: 0,
              member_tier: "Thường"
            }
          };
        });
        onProfileUpdated?.(displayName);
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể kết nối đến máy chủ.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const statusItems = useMemo(() => {
    const active = currentUser?.is_active ? "Đang hoạt động" : "Đã khóa";
    const member = currentUser?.profile?.member_tier
      ? `Hạng ${currentUser.profile.member_tier}`
      : "Hồ sơ tiêu chuẩn";

    return ["Đã xác minh", active, member];
  }, [currentUser]);

  useEffect(() => {
    if (!open) return;

    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Phiên đăng nhập đã hết hạn.");
        return;
      }

      const storedAccountName = localStorage.getItem("accountName") || accountName;
      const storedEmail = localStorage.getItem("accountEmail") || "";
      const storedAddress = localStorage.getItem("accountAddress") || "";

      setForm((current) => ({
        ...current,
        full_name: current.full_name || storedAccountName,
        email: current.email || storedEmail,
        address: current.address || storedAddress,
      }));

      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          toast.error(data.detail || "Không thể tải hồ sơ.");
          return;
        }

        setCurrentUser(data);
        setForm({
          full_name: data.profile?.full_name || data.username || accountName,
          email: data.profile?.email || "",
          phone: data.profile?.phone || "",
          address: data.profile?.address || "",
          special_notes: data.profile?.special_notes || "",
        });
        localStorage.setItem("accountEmail", data.profile?.email || "");
        localStorage.setItem("accountAddress", data.profile?.address || "");
        localStorage.setItem("accountImageUrl", data.profile?.image_url || "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif");
        onProfileUpdated?.(data.profile?.full_name || data.username || accountName);
      } catch {
        setForm((current) => ({
          ...current,
          full_name: current.full_name || storedAccountName || accountName,
        }));
        toast.error("Không thể kết nối đến máy chủ.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [accountName, onProfileUpdated, open]);

  const updateField = (field: keyof ProfileForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Phiên đăng nhập đã hết hạn.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          special_notes: form.special_notes.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.detail || "Không thể lưu hồ sơ.");
        return;
      }

      setCurrentUser(data);
      setForm({
        full_name: data.profile?.full_name || data.username || accountName,
        email: data.profile?.email || "",
        phone: data.profile?.phone || "",
        address: data.profile?.address || "",
        special_notes: data.profile?.special_notes || "",
      });
      localStorage.setItem("accountEmail", data.profile?.email || "");
      localStorage.setItem("accountAddress", data.profile?.address || "");
      localStorage.setItem("accountImageUrl", data.profile?.image_url || "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif");
      onProfileUpdated?.(data.profile?.full_name || data.username || accountName);
      toast.success("Đã lưu hồ sơ.");
      onOpenChange(false);
    } catch {
      toast.error("Không thể kết nối đến máy chủ.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[min(680px,calc(100vw-2rem))] !max-w-none gap-0 rounded-xl border border-black/10 bg-white p-0 shadow-[0_18px_60px_rgba(0,0,0,0.18)]" showCloseButton={false}>
        <DialogHeader className="gap-3 px-5 pt-5">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              {isProfileLoading ? (
                <Skeleton className="h-16 w-16 rounded-full" />
              ) : (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="h-16 w-16 rounded-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={isProfileLoading || isSaving}
                className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm transition-colors hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                aria-label="Đổi ảnh đại diện"
              >
                <Camera className="size-3.5" />
              </button>
            </div>
            <div className="min-w-0">
              <DialogTitle className={isProfileLoading ? "sr-only" : "truncate text-base font-semibold leading-6"}>
                {displayName || "Hồ sơ tài khoản"}
              </DialogTitle>
              {isProfileLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ) : (
                <>
                  <DialogDescription className="text-sm text-muted-foreground">
                    {accountType} · {accountCode}
                  </DialogDescription>
                  <p className="mt-1 text-xs text-muted-foreground">{displayRole}</p>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-y-auto px-5 py-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Họ tên</Label>
              {isProfileLoading ? (
                <Skeleton className="h-10 rounded-lg" />
              ) : (
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={form.full_name}
                    onChange={(e) => updateField("full_name", e.target.value)}
                    disabled={isLoading}
                    className="h-10 rounded-lg pl-9"
                  />
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Tên đăng nhập</Label>
              {isProfileLoading ? (
                <Skeleton className="h-10 rounded-lg" />
              ) : (
                <div className="relative">
                  <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={currentUser?.username || ""}
                    disabled
                    className="h-10 rounded-lg bg-muted/40 pl-9"
                  />
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Email</Label>
              {isProfileLoading ? (
                <Skeleton className="h-10 rounded-lg" />
              ) : (
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    disabled={isLoading}
                    className="h-10 rounded-lg pl-9"
                  />
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Số điện thoại</Label>
              {isProfileLoading ? (
                <Skeleton className="h-10 rounded-lg" />
              ) : (
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    disabled={isLoading}
                    className="h-10 rounded-lg pl-9"
                  />
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Vai trò</Label>
              {isProfileLoading ? (
                <Skeleton className="h-10 rounded-lg" />
              ) : (
                <div className="relative">
                  <CircleCheck className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={displayRole} disabled className="h-10 rounded-lg bg-muted/40 pl-9" />
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Điểm / hạng</Label>
              {isProfileLoading ? (
                <Skeleton className="h-10 rounded-lg" />
              ) : (
                <div className="relative">
                  <Sparkles className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={
                      currentUser?.profile
                        ? `${currentUser.profile.loyalty_points} điểm · ${currentUser.profile.member_tier}`
                        : "Chưa có dữ liệu"
                    }
                    disabled
                    className="h-10 rounded-lg bg-muted/40 pl-9"
                  />
                </div>
              )}
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs text-muted-foreground">
                {isUserArea ? "Địa chỉ mặc định" : "Chi nhánh / địa chỉ"}
              </Label>
              {isProfileLoading ? (
                <Skeleton className="h-10 rounded-lg" />
              ) : (
                <div className="relative">
                  {isUserArea ? (
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  ) : (
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  )}
                  <Input
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    disabled={isLoading}
                    className="h-10 rounded-lg pl-9"
                  />
                </div>
              )}
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs text-muted-foreground">Ghi chú</Label>
              {isProfileLoading ? (
                <Skeleton className="h-10 rounded-lg" />
              ) : (
                <Input
                  value={form.special_notes}
                  onChange={(e) => updateField("special_notes", e.target.value)}
                  disabled={isLoading}
                  placeholder="Ví dụ: dị ứng hóa chất, yêu cầu riêng..."
                  className="h-10 rounded-lg"
                />
              )}
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-black/[0.06] bg-[#fafafa] p-3">
            <p className="text-sm font-medium">Trạng thái tài khoản</p>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              {isProfileLoading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-9 rounded-lg" />
                  ))
                : statusItems.map((item) => (
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
          <Button
            type="button"
            disabled={isLoading || isSaving}
            onClick={handleSave}
            className="h-8 rounded-lg bg-[#1f1f1f] px-3 text-sm text-white shadow-sm hover:bg-black disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {isSaving ? <SpokeSpinner /> : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
