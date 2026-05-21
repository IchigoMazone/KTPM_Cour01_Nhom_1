"use client";

import { CalendarCheck, Clock3, Gift, PackageCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  PageShell,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/src/app/home/_components/dashboard-primitives";

const activeOrders = [
  { code: "DH-1055", service: "Giặt thường", status: "Đang giặt", time: "Nhận 18:30 hôm nay" },
  { code: "DH-1048", service: "Giặt hấp vest", status: "Sẵn sàng giao", time: "Giao 10:30 ngày mai" },
];

const quickServices = [
  { title: "Giặt sấy theo kg", price: "18.000đ/kg", note: "Nhận trong 24 giờ" },
  { title: "Giặt hấp cao cấp", price: "Từ 80.000đ", note: "Vest, đầm, áo khoác" },
  { title: "Chăn màn gia đình", price: "Từ 120.000đ", note: "Khử khuẩn, hút ẩm" },
];

export default function UserOverviewPage() {
  return (
    <PageShell
      title="Khu Vực Khách Hàng"
      description="Theo dõi đơn giặt, lịch lấy đồ, điểm thưởng và các ưu đãi dành riêng cho bạn."
      action={<Button className="bg-neutral-900 text-white hover:bg-neutral-800">Đặt lịch mới</Button>}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Đơn đang xử lý" value="2" hint="1 đơn sẵn sàng giao" icon={PackageCheck} />
        <StatCard label="Lịch lấy đồ" value="16:00" hint="Hôm nay tại nhà" icon={CalendarCheck} tone="warning" />
        <StatCard label="Điểm thưởng" value="1.250" hint="Còn 250 điểm lên hạng" icon={Gift} tone="success" />
        <StatCard label="Thời gian giao" value="24h" hint="Trung bình 5 đơn gần nhất" icon={Clock3} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <SectionCard title="Đơn đang theo dõi" description="Cập nhật trạng thái gần nhất của các đơn giặt.">
          <div className="divide-y">
            {activeOrders.map((order) => (
              <div key={order.code} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="min-w-0">
                  <p className="font-medium">{order.code} · {order.service}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{order.time}</p>
                </div>
                <StatusBadge tone={order.status === "Sẵn sàng giao" ? "success" : "default"}>{order.status}</StatusBadge>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Lộ trình đơn DH-1055" description="Tiến độ xử lý hiện tại.">
          <div className="space-y-4 p-5">
            <Progress value={62} />
            {["Đã nhận đồ", "Phân loại", "Đang giặt", "Sấy & gấp", "Giao lại"].map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <span className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${index <= 2 ? "bg-neutral-900 text-white" : "bg-gray-100 text-muted-foreground"}`}>
                  {index + 1}
                </span>
                <span className={index <= 2 ? "font-medium" : "text-muted-foreground"}>{step}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Dịch vụ thường dùng" description="Chọn nhanh dịch vụ bạn hay đặt.">
        <div className="grid gap-3 p-4 md:grid-cols-3">
          {quickServices.map((service) => (
            <button key={service.title} className="rounded-lg border p-4 text-left transition-colors hover:bg-[#f7f7f7]">
              <Truck className="mb-3 size-5 text-neutral-900" />
              <p className="font-medium">{service.title}</p>
              <p className="mt-1 text-sm font-semibold">{service.price}</p>
              <p className="mt-1 text-sm text-muted-foreground">{service.note}</p>
            </button>
          ))}
        </div>
      </SectionCard>
    </PageShell>
  );
}
