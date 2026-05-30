"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/src/lib/config";
import { CalendarDays, Clock, Home, MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";
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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PageShell,
  SectionCard,
  StatusBadge,
} from "@/src/app/home/_components/dashboard-primitives";

interface Service {
  service_id: string;
  name: string;
  description: string;
  unit_type: string;
  base_price: number;
  turnaround_hours: number;
}

interface Booking {
  booking_id: string;
  service_name: string;
  pickup_date: string;
  time_slot: string;
  address: string;
  status: string;
  estimated_price: number;
}

const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
};

export default function UserBookingsPage() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  
  // Form states
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [pickupDate, setPickupDate] = useState(getTomorrowDate());
  const [timeSlot, setTimeSlot] = useState("16:00 - 17:00");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch active services
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/bookings/services`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json() as Promise<Service[]>;
      })
      .then((data) => {
        setServices(data);
        if (data.length > 0) {
          setSelectedServiceId(data[0].service_id);
        }
      })
      .catch(() => {
        setServices([]);
        toast.error("Không thể tải danh sách dịch vụ.");
      });
  }, []);

  // Fetch logged in user profile & bookings list
  const fetchBookings = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_BASE_URL}/api/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json() as Promise<Booking[]>;
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setUserBookings(data);
        }
      })
      .catch(() => {
        setUserBookings([]);
        toast.error("Không thể tải lịch hẹn.");
      });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    // Auto-fill user profile info
    fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((user) => {
        if (user && user.profile) {
          setPhone(user.profile.phone || "");
          setAddress(user.profile.address || "");
        }
      })
      .catch(() => {
        toast.error("Không thể tải thông tin hồ sơ.");
      });

    fetchBookings();
  }, []);

  const handleConfirmSubmit = async () => {
    setConfirmOpen(false);
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để thực hiện đặt lịch.");
      return;
    }

    if (!phone.trim() || !address.trim()) {
      toast.error("Vui lòng nhập đầy đủ Số điện thoại và Địa chỉ.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          service_id: selectedServiceId,
          pickup_date: pickupDate,
          time_slot: timeSlot,
          phone: phone.trim(),
          address: address.trim(),
          notes: notes.trim(),
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success("Lịch hẹn đã được gửi thành công!", {
          description: "Tiệm sẽ xác nhận và liên hệ lại với bạn sớm nhất.",
        });
        setNotes("");
        fetchBookings(); // Reload list
      } else {
        toast.error(data.detail || "Không thể đặt lịch hẹn. Vui lòng kiểm tra lại.");
      }
    } catch {
      toast.error("Không thể kết nối đến máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedService = services.find((s) => s.service_id === selectedServiceId);
  const displayPrice = selectedService
    ? selectedService.unit_type === "kg"
      ? `5 kg x ${selectedService.base_price.toLocaleString("vi-VN")}đ`
      : `${selectedService.base_price.toLocaleString("vi-VN")}đ`
    : "0đ";

  const estimatedTotal = selectedService
    ? selectedService.unit_type === "kg"
      ? selectedService.base_price * 5
      : selectedService.base_price
    : 0;

  const formatDateString = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

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
              <Select
                value={selectedServiceId}
                onValueChange={setSelectedServiceId}
              >
                <SelectTrigger className="h-10 w-full bg-white border border-gray-200">
                  <SelectValue placeholder="Chọn dịch vụ" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-md">
                  {services.map((s) => (
                    <SelectItem key={s.service_id} value={s.service_id}>
                      {s.name} ({s.base_price.toLocaleString("vi-VN")}đ/{s.unit_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ngày lấy đồ</Label>
              <Input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="h-10 border-gray-200"
              />
            </div>
            <div className="space-y-2">
              <Label>Khung giờ</Label>
              <Select value={timeSlot} onValueChange={setTimeSlot}>
                <SelectTrigger className="h-10 w-full bg-white border border-gray-200">
                  <SelectValue placeholder="Chọn giờ" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-md">
                  <SelectItem value="09:00 - 10:00">09:00 - 10:00</SelectItem>
                  <SelectItem value="14:00 - 15:00">14:00 - 15:00</SelectItem>
                  <SelectItem value="16:00 - 17:00">16:00 - 17:00</SelectItem>
                  <SelectItem value="19:00 - 20:00">19:00 - 20:00</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại liên lạc"
                className="h-10 border-gray-200"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Địa chỉ lấy đồ</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Địa chỉ cụ thể nhân viên đến lấy đồ"
                className="h-10 border-gray-200"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Ghi chú</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ví dụ: áo trắng tách riêng, cần giao trước 18:00..."
                className="border-gray-200"
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                type="button"
                onClick={() => toast.success("Đã lưu nháp!", { description: "Bạn có thể quay lại chỉnh sửa bất cứ lúc nào." })}
                className="border-gray-200 hover:bg-gray-50"
              >
                Lưu nháp
              </Button>
              <Button
                type="button"
                className="bg-neutral-900 text-white hover:bg-neutral-800"
                onClick={() => setConfirmOpen(true)}
                disabled={isLoading}
              >
                Gửi lịch hẹn
              </Button>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Ước tính đơn" description="Giá có thể thay đổi sau khi cân đồ.">
          <div className="space-y-4 p-5">
            {[
              { icon: Sparkles, label: "Dịch vụ đã chọn", value: selectedService?.name || "Chưa chọn" },
              { icon: CalendarDays, label: "Ngày lấy đồ", value: formatDateString(pickupDate) },
              { icon: Clock, label: "Khung giờ", value: timeSlot },
              { icon: MapPin, label: "Đơn giá ước tính", value: displayPrice },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-gray-100">
                  <item.icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="font-medium text-sm truncate">{item.value}</p>
                </div>
              </div>
            ))}
            <div className="rounded-lg bg-[#f7f7f7] p-4">
              <p className="text-sm text-muted-foreground">Tạm tính ước lượng</p>
              <p className="text-2xl font-semibold">{estimatedTotal.toLocaleString("vi-VN")}đ</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Lịch hẹn sắp tới" description="Các lịch đã tạo và trạng thái xác nhận.">
        <div className="divide-y">
          {userBookings.length === 0 ? (
            <div className="p-8 text-center text-stone-500 text-sm">
              Bạn chưa có lịch hẹn đặt lấy đồ nào.
            </div>
          ) : (
            userBookings.map((booking) => {
              const bookingStatusLabels: Record<string, string> = {
                pending: "Chờ xác nhận",
                confirmed: "Đã xác nhận",
                assigned: "Đã phân công",
                picked_up: "Đã lấy đồ",
                cancelled: "Đã hủy",
              };
              
              const statusColors: Record<string, "warning" | "success" | "default"> = {
                pending: "warning",
                confirmed: "success",
                assigned: "success",
                picked_up: "success",
                cancelled: "default",
              };

              return (
                <div key={booking.booking_id} className="grid gap-3 px-4 py-4 sm:grid-cols-[1.2fr_1fr_1fr_0.8fr] sm:items-center sm:px-6">
                  <div>
                    <p className="font-medium text-sm">{booking.service_name || "Dịch vụ khác"}</p>
                    <p className="text-xs text-muted-foreground">Ước tính: {booking.estimated_price.toLocaleString("vi-VN")}đ</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="size-4 text-stone-400" />
                    <span>{formatDateString(booking.pickup_date)} · {booking.time_slot}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm truncate">
                    <Home className="size-4 text-stone-400" />
                    <span className="truncate">{booking.address}</span>
                  </div>
                  <div className="flex sm:justify-end">
                    <StatusBadge tone={statusColors[booking.status] || "default"}>
                      {bookingStatusLabels[booking.status] || booking.status}
                    </StatusBadge>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SectionCard>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-[384px] gap-0 rounded-xl border border-black/10 bg-white p-0 shadow-[0_18px_60px_rgba(0,0,0,0.18)]" showCloseButton={false}>
          <DialogHeader className="gap-3 px-5 pb-4 pt-5">
            <DialogTitle className="text-base font-semibold leading-6">
              Xác nhận gửi lịch hẹn?
            </DialogTitle>
            <DialogDescription className="text-sm leading-5 text-[#6b6b6b]">
              Bạn có chắc chắn muốn gửi lịch hẹn này? Sau khi gửi, tiệm sẽ xác nhận và liên hệ lại với bạn.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="m-0 flex-row justify-end gap-2 rounded-b-xl border-t border-black/[0.06] bg-[#fafafa] px-4 py-4">
            <DialogClose asChild>
              <Button variant="outline" className="h-8 rounded-lg border-black/10 bg-white px-3 text-sm text-[#1f1f1f] shadow-sm hover:bg-[#f5f5f5] sm:w-auto">
                Hủy
              </Button>
            </DialogClose>
            <Button
              className="h-8 rounded-lg bg-[#1f1f1f] px-3 text-sm text-white shadow-sm hover:bg-black sm:w-auto"
              onClick={handleConfirmSubmit}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
