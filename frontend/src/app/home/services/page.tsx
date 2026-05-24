"use client";

import { useState } from "react";
import { BadgeCheck, Gift, Plus, Receipt, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Period,
  PeriodTabs,
  SectionCard,
  StatCard,
  StatusBadge,
} from "../_components/dashboard-primitives";

const services = [
  ["Giặt thường", "Theo kg", "15.000đ/kg", "Đang hoạt động", "Áo quần hằng ngày"],
  ["Giặt khô", "Theo món", "80.000đ/món", "Đang hoạt động", "Vest, áo khoác"],
  ["Giặt hấp", "Theo món", "45.000đ/món", "Đang hoạt động", "Đồ nhạy cảm"],
  ["Giặt đồ da", "Theo món", "180.000đ/món", "Tạm ngừng", "Cần xác nhận trước"],
  ["Giặt chăn màn", "Theo kg", "35.000đ/kg", "Đang hoạt động", "Chăn, ga, rèm"],
];

const receivables = [
  ["Công ty ABC", "DH-1038", "2.500.000đ", "Thanh toán một phần"],
  ["Shop Linen", "DH-1044", "1.800.000đ", "Chưa thanh toán"],
  ["Trần Minh", "DH-1052", "240.000đ", "Chưa thanh toán"],
];

const expenses = [
  ["Lương", "12.000.000đ", "15/05/2026"],
  ["Hóa chất", "3.200.000đ", "12/05/2026"],
  ["Điện nước", "2.850.000đ", "10/05/2026"],
  ["Thuê mặt bằng", "18.000.000đ", "01/05/2026"],
];

const promotions = [
  ["WELCOME10", "Giảm 10%", "31/05/2026", "120 lượt"],
  ["BIRTHDAY15", "Sinh nhật giảm 15%", "Không giới hạn", "Tự động"],
  ["COMBO-GIAT-SAY", "Combo giặt + sấy", "30/06/2026", "80 lượt"],
];

export default function ServicesFinancePage() {
  const [tab, setTab] = useState("Dịch vụ & Bảng giá");
  const [period, setPeriod] = useState<Period>("Tháng");
  const [openForm, setOpenForm] = useState(false);

  return (
    <PageShell
      title="Dịch Vụ & Tài Chính"
      description="Quản lý bảng giá, doanh thu, công nợ, thu chi và khuyến mãi."
      action={
        <Button className="bg-neutral-900 text-white hover:bg-neutral-800" onClick={() => setOpenForm(true)}>
          <Plus className="mr-2 size-4" />
          Thêm cấu hình
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Doanh thu tháng" value="186tr" hint="+14% so với tháng trước" icon={Wallet} tone="success" />
        <StatCard label="Công nợ" value="4,54tr" hint="3 đơn chưa thu đủ" icon={Receipt} tone="warning" />
        <StatCard label="Chi phí" value="36,05tr" hint="Lương, hóa chất, điện nước" icon={BadgeCheck} />
        <StatCard label="Mã đang chạy" value="3" hint="1 mã tự động sinh nhật" icon={Gift} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <PeriodTabs value={period} onChange={setPeriod} />
        {[
          "Dịch vụ & Bảng giá",
          "Doanh thu & Công nợ",
          "Thu Chi & Lợi nhuận",
          "Khuyến mãi & Loyalty",
        ].map((item) => (
          <Button
            key={item}
            variant={tab === item ? "default" : "outline"}
            size="sm"
            onClick={() => setTab(item)}
          >
            {item}
          </Button>
        ))}
      </div>

      {tab === "Dịch vụ & Bảng giá" && (
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
      )}

      {tab === "Doanh thu & Công nợ" && (
        <SectionCard title="Danh sách công nợ khách hàng">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Khách hàng</TableHead>
                <TableHead>Đơn</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receivables.map((row) => (
                <TableRow key={row[1]}>
                  <TableCell>{row[0]}</TableCell>
                  <TableCell>{row[1]}</TableCell>
                  <TableCell>{row[2]}</TableCell>
                  <TableCell><StatusBadge tone="warning">{row[3]}</StatusBadge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>
      )}

      {tab === "Thu Chi & Lợi nhuận" && (
        <SectionCard title="Chi phí vận hành">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Hạng mục</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Ngày ghi nhận</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((row) => (
                <TableRow key={row[0]}>
                  <TableCell>{row[0]}</TableCell>
                  <TableCell>{row[1]}</TableCell>
                  <TableCell>{row[2]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>
      )}

      {tab === "Khuyến mãi & Loyalty" && (
        <SectionCard title="Mã giảm giá và tích điểm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Mã / chương trình</TableHead>
                <TableHead>Ưu đãi</TableHead>
                <TableHead>Thời hạn</TableHead>
                <TableHead>Giới hạn</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.map((row) => (
                <TableRow key={row[0]}>
                  <TableCell className="font-medium">{row[0]}</TableCell>
                  <TableCell>{row[1]}</TableCell>
                  <TableCell>{row[2]}</TableCell>
                  <TableCell>{row[3]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard title="Kênh thanh toán">
          <div className="space-y-3 p-4 text-sm">
            {[
              ["Tiền mặt", "42%", "Đối soát cuối ca"],
              ["MoMo", "28%", "Tự động ghi nhận"],
              ["VNPay", "18%", "Tự động ghi nhận"],
              ["Chuyển khoản", "12%", "Cần xác nhận"],
            ].map(([name, share, note]) => (
              <div key={name} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{name}</p>
                  <p className="text-muted-foreground">{note}</p>
                </div>
                <span className="font-semibold">{share}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Cấu hình tích điểm">
          <div className="space-y-3 p-4 text-sm">
            <div className="rounded-lg border p-3">
              <p className="font-medium">10.000đ = 1 điểm</p>
              <p className="text-muted-foreground">Áp dụng cho đơn đã thanh toán đủ.</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="font-medium">100 điểm = 10.000đ</p>
              <p className="text-muted-foreground">Cho phép đổi trực tiếp khi tạo đơn.</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="font-medium">Ưu đãi sinh nhật</p>
              <p className="text-muted-foreground">Tự động cấp mã BIRTHDAY15.</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Điều kiện hạng thành viên">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Hạng</TableHead>
                <TableHead>Điều kiện</TableHead>
                <TableHead>Quyền lợi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                ["Bạc", "1.000 điểm", "Giảm 3%"],
                ["Vàng", "2.000 điểm", "Giảm 5%"],
                ["Kim cương", "4.000 điểm", "Giảm 8% + giao miễn phí"],
              ].map((row) => (
                <TableRow key={row[0]}>
                  {row.map((cell) => <TableCell key={cell}>{cell}</TableCell>)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>
      </div>

      {openForm && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-xl border bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Thêm cấu hình dịch vụ / tài chính</h2>
              <Button variant="ghost" size="sm" onClick={() => setOpenForm(false)}>Đóng</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Tên dịch vụ / mã giảm giá / hạng mục" />
              <Input placeholder="Giá trị / số tiền" />
              <Input placeholder="Đơn vị: kg, món, %, VNĐ" />
              <Input type="date" />
              <Input className="md:col-span-2" placeholder="Mô tả điều kiện áp dụng" />
              <Button className="md:col-span-2 bg-neutral-900 text-white hover:bg-neutral-800">
                Lưu cấu hình
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
