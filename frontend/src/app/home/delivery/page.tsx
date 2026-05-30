"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRight, CalendarDays, MapPin, Plus, Route, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useDashboardSettingsStore } from "@/src/context/useDashboardSettingsStore";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import { formatRange, normalizeRange } from "@/src/utils/dashboard-time";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PageShell,
  PaginationFooter,
  SectionCard,
  StatCard,
  StatusBadge,
} from "../_components/dashboard-primitives";

const trips = [
  ["08:30", "Lấy đồ", "Nguyễn Thị Hương", "12 Trần Phú, Q.1", "Anh Minh", "Đã lấy", "Ưu tiên đồ trắng"],
  ["09:15", "Trả đồ", "Trần Minh", "90 Lý Thường Kiệt, Q.3", "Chị Lan", "Đang giao", "Thu COD"],
  ["10:00", "Lấy đồ", "Công ty ABC", "55 Pasteur, Q.1", "Anh Tuấn", "Chờ lấy", "8 túi đồ"],
  ["14:30", "Trả đồ", "Phạm Lan", "18 Nguyễn Du, Q.1", "Anh Minh", "Chờ giao", "Gọi trước 15 phút"],
];

const drivers = [
  ["Anh Minh", "5 điểm", "3 lấy · 2 trả", "Đang giao"],
  ["Chị Lan", "4 điểm", "1 lấy · 3 trả", "Rảnh 30 phút"],
  ["Anh Tuấn", "3 điểm", "2 lấy · 1 trả", "Đang lấy"],
];

const slots = [
  ["08:00", "Lấy đồ", "DH-1048", "bg-neutral-900 text-white"],
  ["09:00", "Trả đồ", "DH-1052", "bg-amber-100 text-amber-800"],
  ["10:00", "Lấy đồ", "DH-1057", "bg-neutral-900 text-white"],
  ["14:00", "Trả đồ", "DH-1055", "bg-amber-100 text-amber-800"],
];

export default function DeliveryPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const deliveryEnabled = useDashboardSettingsStore((state) => state.deliveryEnabled);
  const range = useDashboardTimeRangeStore((state) => state.range);
  const rangeLabel = formatRange(normalizeRange(range));

  return (
    <PageShell
      title="Quản lý Giao Nhận"
      description="Điều phối lấy đồ, trả đồ, tài xế và tuyến đường trong ngày."
      action={
        deliveryEnabled ? (
          <Button className="bg-neutral-900 text-white hover:bg-neutral-800">
            <Plus className="mr-2 size-4" />
            Thêm chuyến
          </Button>
        ) : null
      }
    >
      {!deliveryEnabled && (
        <div className="grid min-h-[calc(100dvh-220px)] place-items-center rounded-lg border border-dashed border-neutral-300 bg-white p-6">
          <div className="mx-auto max-w-xl text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <AlertTriangle className="size-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">
              Mục Giao nhận đã được tắt
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Thông tin giao nhận đang được ẩn theo cài đặt hiện tại. Chọn một trang khác để rời khỏi đây, sau đó mục Giao nhận sẽ biến mất khỏi dashboard.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {[
                ["Tổng quan", "/home"],
                ["Đơn hàng", "/home/orders"],
                ["Khách hàng", "/home/customers"],
              ].map(([label, path]) => (
                <Button
                  key={path}
                  variant={path === "/home" ? "default" : "outline"}
                  size="sm"
                  className={
                    path === "/home"
                      ? "gap-2 bg-neutral-900 text-white hover:bg-neutral-800"
                      : "gap-2"
                  }
                  onClick={() => router.push(path)}
                >
                  {label}
                  <ArrowRight className="size-4" />
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {deliveryEnabled && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Chuyến hôm nay" value="18" hint="9 lấy · 9 trả" icon={Truck} />
            <StatCard label="Đúng hẹn" value="92%" hint="2 chuyến có nguy cơ trễ" icon={CalendarDays} tone="success" />
            <StatCard label="Tài xế hoạt động" value="3/4" hint="1 tài xế dự phòng" icon={Route} />
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm text-muted-foreground">
              Đang áp dụng thời gian chung: {rangeLabel} · có {trips.length} chuyến nổi bật
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
            <SectionCard title="Lịch giao nhận" description={`Xem nhanh theo ${rangeLabel}.`}>
              <div className="space-y-3 p-4">
                {slots.map(([time, type, order, className]) => (
                  <button
                    key={`${time}-${order}`}
                    className="flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors hover:border-neutral-300"
                  >
                    <div>
                      <p className="font-medium">{time}</p>
                      <p className="text-sm text-muted-foreground">{order}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${className}`}>
                      {type}
                    </span>
                  </button>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Danh sách chuyến trong ngày">
              <Table className="min-w-[920px]">
            <TableCaption>Danh sách chuyến lấy/trả đồ cần điều phối hôm nay.</TableCaption>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Giờ</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Khách</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead>Tài xế</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ghi chú</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trips.map((trip) => (
                <TableRow key={`${trip[0]}-${trip[2]}`}>
                  {trip.map((cell, index) => (
                    <TableCell key={`${trip[0]}-${index}`}>
                      {index === 5 ? (
                        <StatusBadge tone={cell.includes("Đã") ? "success" : "default"}>
                          {cell}
                        </StatusBadge>
                      ) : (
                        cell
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>Tổng chuyến hiển thị</TableCell>
                <TableCell>{trips.length} chuyến</TableCell>
                <TableCell colSpan={2}>Tài xế đang hoạt động</TableCell>
                <TableCell className="text-right">3 người</TableCell>
              </TableRow>
            </TableFooter>
              </Table>
              <PaginationFooter
                page={page}
                pageCount={2}
                total={trips.length + 4}
                onPrev={() => setPage((current) => Math.max(current - 1, 1))}
                onNext={() => setPage((current) => Math.min(current + 1, 2))}
              />
            </SectionCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
            <SectionCard title="Phân công tài xế" description="Theo dõi tải công việc mỗi tài xế.">
          <div className="divide-y">
            {drivers.map(([name, points, load, status]) => (
              <div key={name} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">{name}</p>
                  <p className="text-sm text-muted-foreground">{points} · {load}</p>
                </div>
                <StatusBadge>{status}</StatusBadge>
              </div>
            ))}
          </div>
            </SectionCard>

            <SectionCard title="Bản đồ tuyến đường" description="Mô phỏng các điểm lấy/trả trong ngày.">
          <div className="relative min-h-[320px] overflow-hidden bg-neutral-100">
            <div className="absolute inset-6 rounded-2xl border border-dashed border-neutral-300" />
            {[
              ["20%", "24%", "1"],
              ["58%", "32%", "2"],
              ["42%", "68%", "3"],
              ["78%", "72%", "4"],
            ].map(([left, top, label]) => (
              <div
                key={label}
                className="absolute flex size-9 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white shadow"
                style={{ left, top }}
              >
                {label}
              </div>
            ))}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm shadow-sm">
              <MapPin className="size-4" />
              Tuyến gợi ý: Q.1 → Q.3 → Q.1
            </div>
          </div>
            </SectionCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <SectionCard title="Xác nhận OTP tài xế">
          <div className="space-y-3 p-4">
            {[
              ["DH-1048", "OTP lấy đồ", "482193", "Đã xác nhận"],
              ["DH-1052", "OTP giao trả", "739204", "Chờ khách xác nhận"],
              ["DH-1057", "OTP lấy đồ", "118502", "Chưa gửi"],
            ].map(([order, type, otp, status]) => (
              <div key={`${order}-${type}`} className="rounded-lg border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{order}</span>
                  <StatusBadge tone={status === "Đã xác nhận" ? "success" : "warning"}>{status}</StatusBadge>
                </div>
                <p className="mt-1 text-muted-foreground">{type} · {otp}</p>
              </div>
            ))}
          </div>
            </SectionCard>

            <SectionCard title="Timestamp trạng thái">
          <div className="space-y-3 p-4 text-sm">
            {[
              ["08:32", "Anh Minh đã lấy DH-1048"],
              ["09:20", "Chị Lan bắt đầu giao DH-1052"],
              ["10:04", "Anh Tuấn đang đến điểm lấy DH-1057"],
              ["14:02", "Hệ thống nhắc lịch giao DH-1055"],
            ].map(([time, event]) => (
              <div key={event} className="flex gap-3">
                <span className="w-12 shrink-0 font-medium">{time}</span>
                <span className="text-muted-foreground">{event}</span>
              </div>
            ))}
          </div>
            </SectionCard>

            <SectionCard title="Gợi ý tối ưu tuyến">
          <div className="space-y-3 p-4 text-sm">
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="font-medium">Tuyến Q.1 gom 4 điểm</p>
              <p className="text-muted-foreground">Tiết kiệm 18 phút so với thứ tự hiện tại.</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="font-medium">Chuyển DH-1055 sang Chị Lan</p>
              <p className="text-muted-foreground">Tải Anh Minh giảm còn 4 điểm trong buổi chiều.</p>
            </div>
            <Button className="w-full bg-neutral-900 text-white hover:bg-neutral-800">
              Áp dụng gợi ý
            </Button>
          </div>
            </SectionCard>
          </div>
        </>
      )}
    </PageShell>
  );
}
