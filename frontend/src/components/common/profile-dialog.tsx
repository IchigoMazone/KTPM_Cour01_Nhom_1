"use client";

import { API_BASE_URL } from "@/src/lib/config";
import { DEFAULT_ACCOUNT_AVATAR_URL, emitAccountProfileUpdated } from "@/src/lib/account-profile";
import AccountAvatar from "./account-avatar";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  Building2,
  Camera,
  CalendarDays,
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
import { Textarea } from "@/components/ui/textarea";
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
  profile_id: string | number;
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
  user_id: string;
  username: string;
  role: string;
  is_active: boolean;
  profile?: UserProfile | null;
};

type LinkedCustomer = {
  customer_code: string;
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  birthday?: string | null;
  rank?: string | null;
  loyalty_points?: number;
  total_orders?: number;
  total_spent?: number;
  note?: string | null;
  image_url?: string | null;
  account_id?: string | null;
  account_username?: string | null;
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

function formatBirthday(dateStr?: string | null) {
  if (!dateStr) return "-";
  const value = dateStr.slice(0, 10);
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
}

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
  const [linkedCustomer, setLinkedCustomer] = useState<LinkedCustomer | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const accountType = isUserArea ? "Tài khoản khách hàng" : "Tài khoản nội bộ";
  const isProfileLoading = (isLoading && !currentUser) || isUploading;
  const displayName = linkedCustomer?.full_name || form.full_name || accountName;
  const avatarUrl = currentUser?.profile?.image_url || DEFAULT_ACCOUNT_AVATAR_URL;
  const displayRole = currentUser ? roleLabel[currentUser.role] || currentUser.role : accountType;
  const displayMetaLabel = isUserArea ? "Khách hàng" : accountType;
  const displaySubRole = isUserArea
    ? (linkedCustomer?.rank || currentUser?.profile?.member_tier || "Thường")
    : displayRole;
  const displayUsername = isUserArea
    ? (linkedCustomer?.account_username || currentUser?.username || "Chưa liên kết")
    : (currentUser?.username || "");
  const displayEmail = isUserArea ? (linkedCustomer?.email || form.email || "-") : form.email;
  const displayPhone = isUserArea ? (linkedCustomer?.phone || form.phone || "-") : form.phone;
  const displayAddress = isUserArea ? (linkedCustomer?.address || form.address || "-") : form.address;
  const displayNotes = isUserArea ? (linkedCustomer?.note || "-") : form.special_notes;
  const accountCode = currentUser
    ? currentUser.role === "admin"
      ? "QL-0001"
      : isUserArea
        ? (linkedCustomer?.customer_code || "KH-0000")
        : `TK-${String(currentUser.user_id).slice(0, 8)}`
    : "Đang tải";
  const customerAvatarName = linkedCustomer?.full_name || displayName || "Khách hàng";

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
        emitAccountProfileUpdated();
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
        setLinkedCustomer((prev) => (prev ? { ...prev, image_url: data.image_url } : prev));
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
    if (!isUserArea) {
      return ["Đã liên kết", active, displayRole];
    }
    return [
      linkedCustomer?.account_id ? "Đã liên kết" : "Chưa liên kết",
      `${Number(linkedCustomer?.total_orders || 0).toLocaleString("vi-VN")} đơn hàng`,
      `${Number(linkedCustomer?.total_spent || 0).toLocaleString("vi-VN")}đ chi tiêu`,
    ];
  }, [currentUser, displayRole, isUserArea, linkedCustomer]);

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
        if (isUserArea) {
          try {
            const customerResponse = await fetch(`${API_BASE_URL}/api/home/my-customer`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            const customerData = await customerResponse.json();
            if (customerResponse.ok) {
              setLinkedCustomer(customerData);
            } else {
              setLinkedCustomer(null);
            }
          } catch {
            setLinkedCustomer(null);
          }
        } else {
          setLinkedCustomer(null);
        }
        setForm({
          full_name: data.profile?.full_name || data.username || accountName,
          email: data.profile?.email || "",
          phone: data.profile?.phone || "",
          address: data.profile?.address || "",
          special_notes: data.profile?.special_notes || "",
        });
        localStorage.setItem("accountName", data.profile?.full_name || data.username || accountName);
        localStorage.setItem("accountEmail", data.profile?.email || "");
        localStorage.setItem("accountAddress", data.profile?.address || "");
        localStorage.setItem("accountImageUrl", data.profile?.image_url || DEFAULT_ACCOUNT_AVATAR_URL);
        onProfileUpdated?.(data.profile?.full_name || data.username || accountName);
      } catch {
        setLinkedCustomer(null);
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
  }, [accountName, isUserArea, onProfileUpdated, open]);

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
      localStorage.setItem("accountName", data.profile?.full_name || data.username || accountName);
      localStorage.setItem("accountEmail", data.profile?.email || "");
      localStorage.setItem("accountAddress", data.profile?.address || "");
      localStorage.setItem("accountImageUrl", data.profile?.image_url || DEFAULT_ACCOUNT_AVATAR_URL);
      emitAccountProfileUpdated();
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
      <DialogContent className="flex h-[min(86vh,680px)] w-[min(86vw,680px)] max-w-[min(86vw,680px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[680px]" showCloseButton={false}>
        <DialogHeader className="border-b border-slate-200 px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              {isProfileLoading ? (
                <Skeleton className="size-10 rounded-full" />
              ) : (
                <AccountAvatar
                  name={customerAvatarName}
                  imageUrl={isUserArea ? linkedCustomer?.image_url : avatarUrl}
                  size={40}
                  className="shrink-0 after:border-slate-200"
                />
              )}
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={isProfileLoading || isSaving}
                className="absolute -bottom-1 -right-1 flex size-6 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Đổi ảnh đại diện"
              >
                <Camera className="size-3" />
              </button>
            </div>
            <div className="min-w-0">
              <DialogTitle className={isProfileLoading ? "sr-only" : "truncate text-base font-semibold leading-6 text-slate-950"}>
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
                  <DialogDescription className="text-sm text-slate-500">
                    {displayMetaLabel} · {accountCode}
                  </DialogDescription>
                  <p className="mt-1 text-xs text-slate-400">{displaySubRole}</p>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Họ tên</Label>
              {isProfileLoading ? (
                <Skeleton className="h-8 rounded-lg" />
              ) : (
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={isUserArea ? (linkedCustomer?.full_name || form.full_name || "-") : form.full_name}
                    onChange={(e) => updateField("full_name", e.target.value)}
                    disabled={isLoading || isUserArea}
                    className="h-8 rounded-lg border-input bg-transparent px-2.5 py-1 pl-8 text-sm text-slate-700 shadow-none disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Tên đăng nhập</Label>
              {isProfileLoading ? (
                <Skeleton className="h-8 rounded-lg" />
              ) : (
                <div className="relative">
                  <ShieldCheck className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={displayUsername}
                    disabled
                    className="h-8 rounded-lg border-input bg-slate-50 px-2.5 py-1 pl-8 text-sm text-slate-500 shadow-none"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              {isProfileLoading ? (
                <Skeleton className="h-8 rounded-lg" />
              ) : (
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="email"
                    value={displayEmail}
                    onChange={(e) => updateField("email", e.target.value)}
                    disabled={isLoading || isUserArea}
                    className="h-8 rounded-lg border-input bg-transparent px-2.5 py-1 pl-8 text-sm text-slate-700 shadow-none disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              {isProfileLoading ? (
                <Skeleton className="h-8 rounded-lg" />
              ) : (
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={displayPhone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    disabled={isLoading || isUserArea}
                    className="h-8 rounded-lg border-input bg-transparent px-2.5 py-1 pl-8 text-sm text-slate-700 shadow-none disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>{isUserArea ? "Ngày sinh" : "Vai trò"}</Label>
              {isProfileLoading ? (
                <Skeleton className="h-8 rounded-lg" />
              ) : (
                <div className="relative">
                  {isUserArea ? (
                    <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  ) : (
                    <CircleCheck className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  )}
                  <Input
                    value={isUserArea ? formatBirthday(linkedCustomer?.birthday) : displayRole}
                    disabled
                    className="h-8 rounded-lg border-input bg-slate-50 px-2.5 py-1 pl-8 text-sm text-slate-500 shadow-none"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Điểm / hạng</Label>
              {isProfileLoading ? (
                <Skeleton className="h-8 rounded-lg" />
              ) : (
                <div className="relative">
                  <Sparkles className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={
                      isUserArea
                        ? `${Number(linkedCustomer?.loyalty_points || 0).toLocaleString("vi-VN")} điểm · ${linkedCustomer?.rank || "Thường"}`
                        : currentUser?.profile
                          ? `${currentUser.profile.loyalty_points} điểm · ${currentUser.profile.member_tier}`
                          : "Chưa có dữ liệu"
                    }
                    disabled
                    className="h-8 rounded-lg border-input bg-slate-50 px-2.5 py-1 pl-8 text-sm text-slate-500 shadow-none"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>
                {isUserArea ? "Địa chỉ mặc định" : "Chi nhánh / địa chỉ"}
              </Label>
              {isProfileLoading ? (
                <Skeleton className="h-8 rounded-lg" />
              ) : (
                <div className="relative">
                  {isUserArea ? (
                    <MapPin className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  ) : (
                    <Building2 className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  )}
                  <Input
                    value={displayAddress}
                    onChange={(e) => updateField("address", e.target.value)}
                    disabled={isLoading || isUserArea}
                    className="h-8 rounded-lg border-input bg-transparent px-2.5 py-1 pl-8 text-sm text-slate-700 shadow-none disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Ghi chú</Label>
              {isProfileLoading ? (
                <Skeleton className="h-16 rounded-lg" />
              ) : (
                <Textarea
                  value={displayNotes}
                  onChange={(e) => updateField("special_notes", e.target.value)}
                  disabled={isLoading || isUserArea}
                  placeholder="Ví dụ: dị ứng hóa chất, yêu cầu riêng..."
                  className="h-16 min-h-16 resize-none rounded-lg border-input bg-transparent px-2.5 py-2 text-sm text-slate-700 shadow-none disabled:bg-slate-50 disabled:text-slate-500"
                />
              )}
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-sm font-medium text-slate-950">Trạng thái tài khoản</p>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              {isProfileLoading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-8 rounded-lg" />
                  ))
                : statusItems.map((item) => (
                    <div
                      key={item}
                      className="flex h-8 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700"
                    >
                      {item}
                    </div>
                  ))}
            </div>
          </div>
        </div>

        <DialogFooter className="m-0 flex-row justify-end gap-2 border-t border-slate-200 bg-white px-6 py-3">
          <DialogClose asChild>
            <Button variant="outline" className="h-8 rounded-lg bg-white px-3 text-sm shadow-none sm:w-auto">
              Đóng
            </Button>
          </DialogClose>
          <Button
            type="button"
            disabled={isLoading || isSaving}
            onClick={handleSave}
            className="h-8 rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white shadow-none hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {isSaving ? <SpokeSpinner /> : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
