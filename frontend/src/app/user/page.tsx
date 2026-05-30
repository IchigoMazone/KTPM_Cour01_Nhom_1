"use client";

import { CalendarCheck, Check, Clock3, Gift, PackageCheck, Truck, Package, Layers, Droplets, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  PageShell,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/src/app/home/_components/dashboard-primitives";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const activeOrders = [
  { code: "DH-1055", service: "Giặt thường", status: "Đang giặt", time: "Nhận 18:30 hôm nay" },
  { code: "DH-1048", service: "Giặt hấp vest", status: "Sẵn sàng giao", time: "Giao 10:30 ngày mai" },
];

const services = [
  ["Giặt thường", "Theo kg", "15.000đ/kg", "Đang hoạt động", "Áo quần hằng ngày"],
  ["Giặt khô", "Theo món", "80.000đ/món", "Đang hoạt động", "Vest, áo khoác"],
  ["Giặt hấp", "Theo món", "45.000đ/món", "Đang hoạt động", "Đồ nhạy cảm"],
  ["Giặt đồ da", "Theo món", "180.000đ/món", "Tạm ngừng", "Cần xác nhận trước"],
  ["Giặt chăn màn", "Theo kg", "35.000đ/kg", "Đang hoạt động", "Chăn, ga, rèm"],
];


const stepThemes = [
  {
    bg: "bg-blue-600 border-blue-600 text-white",
    activeRing: "ring-4 ring-blue-600/15",
    upcoming: "bg-blue-50 border-blue-200 text-blue-500",
    line: "bg-blue-600",
  },
  {
    bg: "bg-indigo-600 border-indigo-600 text-white",
    activeRing: "ring-4 ring-indigo-600/15",
    upcoming: "bg-indigo-50 border-indigo-200 text-indigo-500",
    line: "bg-indigo-600",
  },
  {
    bg: "bg-teal-600 border-teal-600 text-white",
    activeRing: "ring-4 ring-teal-600/15",
    upcoming: "bg-teal-50 border-teal-200 text-teal-500",
    line: "bg-teal-600",
  },
  {
    bg: "bg-rose-600 border-rose-600 text-white",
    activeRing: "ring-4 ring-rose-600/15",
    upcoming: "bg-rose-50 border-rose-200 text-rose-500",
    line: "bg-rose-600",
  },
  {
    bg: "bg-emerald-600 border-emerald-600 text-white",
    activeRing: "ring-4 ring-emerald-600/15",
    upcoming: "bg-emerald-50 border-emerald-200 text-emerald-500",
    line: "bg-emerald-600",
  }
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
          <div className="p-6 space-y-6">
            <Progress value={52} className="h-2" />
            <div className="flex flex-col">
              {[
                { label: "Đã nhận đồ", time: "08:30 · 17/05", desc: "Nhận quần áo từ khách hàng" },
                { label: "Phân loại", time: "09:15 · 17/05", desc: "Đo ký & phân loại chất liệu vải" },
                { label: "Đang giặt", time: "Đang chạy", desc: "Giặt sấy tự động công nghệ mới" },
                { label: "Sấy & gấp", time: "Dự kiến 16:30", desc: "Ủi phẳng, gấp và đóng gói" },
                { label: "Giao lại", time: "Dự kiến ngày mai", desc: "Giao hàng tận nhà" }
              ].map((step, index) => {
                const isCompleted = index < 2;
                const isActive = index === 2;
                const isUpcoming = index > 2;
                
                const theme = stepThemes[index];
                
                let containerClass = "";
                let labelClass = "";
                let timeClass = "";
                let descClass = "";
                
                if (isCompleted) {
                  containerClass = theme.bg;
                  labelClass = "text-neutral-900 font-semibold";
                  timeClass = "text-neutral-500";
                  descClass = "text-neutral-600";
                } else if (isActive) {
                  containerClass = `${theme.bg} ${theme.activeRing}`;
                  labelClass = "text-neutral-950 font-bold";
                  timeClass = "text-neutral-950 font-semibold";
                  descClass = "text-neutral-700";
                } else {
                  containerClass = theme.upcoming;
                  labelClass = "text-zinc-500 font-medium";
                  timeClass = "text-zinc-450";
                  descClass = "text-zinc-400";
                }
                
                return (
                  <div key={step.label} className="flex gap-4">
                    {/* Left Column: Number Container & Connecting Line */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className={`flex size-8 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300 ${containerClass}`}>
                        {index + 1}
                      </div>
                      
                      {index < 4 && (
                        <div className={`w-0.5 flex-1 my-1.5 min-h-[24px] rounded-full ${
                          index < 2 ? theme.line : "bg-zinc-200"
                        }`} />
                      )}
                    </div>

                    {/* Right Column: Step details */}
                    <div className="flex-1 min-w-0 pb-4">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className={`text-sm transition-colors ${labelClass}`}>
                          {step.label}
                        </p>
                        <span className={`text-[10px] transition-colors ${timeClass}`}>
                          {step.time}
                        </span>
                      </div>
                      <p className={`mt-0.5 text-xs transition-colors ${descClass}`}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Danh mục dịch vụ">
        <Table className="min-w-[780px]">
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Dịch vụ</TableHead>
              <TableHead>Cách tính</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ghi chú</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((row) => (
              <TableRow key={row[0]}>
                <TableCell className="font-medium">{row[0]}</TableCell>
                <TableCell>{row[1]}</TableCell>
                <TableCell>{row[2]}</TableCell>
                <TableCell>
                  <StatusBadge tone={row[3] === "Đang hoạt động" ? "success" : "warning"}>
                    {row[3]}
                  </StatusBadge>
                </TableCell>
                <TableCell>{row[4]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SectionCard>
    </PageShell>
  );
}
