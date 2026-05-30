"use client";

import { useState } from "react";
import { ClipboardList, PackageCheck, ReceiptText, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PageShell,
  PaginationFooter,
  Period,
  PeriodTabs,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/src/app/home/_components/dashboard-primitives";

const orders = [
  { code: "DH-1055", date: "17/05/2026", service: "Giặt thường", total: "92.000đ", status: "Đang giặt", tone: "default" },
  { code: "DH-1048", date: "16/05/2026", service: "Giặt hấp", total: "180.000đ", status: "Sẵn sàng giao", tone: "success" },
  { code: "DH-1032", date: "12/05/2026", service: "Chăn màn", total: "240.000đ", status: "Hoàn tất", tone: "success" },
  { code: "DH-1019", date: "06/05/2026", service: "Giặt khô", total: "135.000đ", status: "Đã hủy", tone: "danger" },
] as const;

export default function UserOrdersPage() {
  const [period, setPeriod] = useState<Period>("Tháng");

  return (
    <PageShell
      title="Đơn Của Tôi"
      description="Theo dõi trạng thái đơn hiện tại, hóa đơn và lịch sử giặt theo thời gian."
      action={<PeriodTabs value={period} onChange={setPeriod} />}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Tổng đơn" value="18" hint={`Thống kê theo ${period.toLowerCase()}`} icon={ClipboardList} />
        <StatCard label="Đã hoàn tất" value="15" hint="Không có khiếu nại" icon={PackageCheck} tone="success" />
        <StatCard label="Tổng chi tiêu" value="2,46tr" hint="Đã gồm ưu đãi" icon={ReceiptText} />
      </div>

      <SectionCard title="Danh sách đơn hàng" description="Các đơn gần nhất của tài khoản này.">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f7f7f7] hover:bg-[#f7f7f7]">
                <TableHead>Mã đơn</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>Dịch vụ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.code}>
                  <TableCell className="font-medium">{order.code}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.service}</TableCell>
                  <TableCell><StatusBadge tone={order.tone}>{order.status}</StatusBadge></TableCell>
                  <TableCell className="text-right">{order.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <PaginationFooter page={1} pageCount={3} total={18} onPrev={() => {}} onNext={() => {}} />
      </SectionCard>

      <SectionCard title="Thao tác nhanh" description="Lặp lại đơn cũ hoặc tải hóa đơn.">
        <div className="grid gap-3 p-4 md:grid-cols-3">
          {["Đặt lại DH-1032", "Tải hóa đơn tháng 5", "Đánh giá dịch vụ"].map((label) => (
            <Button key={label} variant="outline" className="justify-start gap-2">
              <RotateCcw className="size-4" />
              {label}
            </Button>
          ))}
        </div>
      </SectionCard>
    </PageShell>
  );
}
