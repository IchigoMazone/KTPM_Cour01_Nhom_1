"use client";

import { useState } from "react";
import { Clock, Package, Plus, TrendingUp, Users } from "lucide-react";
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
  PaginationFooter,
  Period,
  PeriodTabs,
  SectionCard,
  StatCard,
  StatusBadge,
} from "../_components/dashboard-primitives";

const employees = [
  ["Nguyễn Văn A", "Giặt", "Sáng", "32 đơn", "4.8/5", "Hoạt động"],
  ["Trần Thị B", "Gấp/Là", "Chiều", "25 đơn", "4.7/5", "Hoạt động"],
  ["Lê Hoàng C", "Giao nhận", "Tối", "18 chuyến", "4.6/5", "Hoạt động"],
  ["Phạm Duy D", "Thu ngân", "Sáng", "42 giao dịch", "-", "Nghỉ phép"],
];

const shifts = [
  ["Thứ 2", "A, D", "B", "C"],
  ["Thứ 3", "A", "B, D", "C"],
  ["Thứ 4", "A, B", "D", "C"],
  ["Thứ 5", "D", "A, B", "C"],
];

const supplies = [
  ["Hóa chất giặt", "25 kg", "10 kg", "Ổn định"],
  ["Nước xả", "6 lít", "8 lít", "Sắp hết"],
  ["Túi đựng", "120 cái", "50 cái", "Ổn định"],
  ["Móc áo", "75 cái", "100 cái", "Sắp hết"],
];

const stockHistory = [
  ["16/05/2026", "Nước xả", "+12 lít", "Nhà cung cấp CleanPro", "720.000đ"],
  ["15/05/2026", "Túi đựng", "+200 cái", "Kho tổng", "460.000đ"],
  ["12/05/2026", "Hóa chất giặt", "+30 kg", "Nhà cung cấp EcoWash", "1.800.000đ"],
];

const purchaseStats = [
  ["Hóa chất giặt", "EcoWash", "90 kg", "3 lần", "5.400.000đ"],
  ["Nước xả", "CleanPro", "42 lít", "4 lần", "2.520.000đ"],
  ["Túi đựng", "Kho tổng", "600 cái", "3 lần", "1.380.000đ"],
  ["Móc áo", "Nhựa Minh An", "500 cái", "2 lần", "1.250.000đ"],
];

const purchaseSummary = [
  ["Tổng chi vật tư", "10.550.000đ"],
  ["Nhà cung cấp", "4"],
  ["Lượt nhập", "12"],
  ["Vật tư sắp cần mua", "2"],
];

export default function StaffOperationsPage() {
  const [tab, setTab] = useState("Nhân viên");
  const [period, setPeriod] = useState<Period>("Tuần");
  const [page, setPage] = useState(1);
  const [openForm, setOpenForm] = useState(false);

  return (
    <PageShell
      title="Vận Hành Nội Bộ"
      description="Quản lý nhân sự, ca làm, năng suất và kho vật tư."
      action={
        <Button className="bg-neutral-900 text-white hover:bg-neutral-800" onClick={() => setOpenForm(true)}>
          <Plus className="mr-2 size-4" />
          Thêm mới
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Nhân viên" value="12" hint="3 vai trò vận hành" icon={Users} />
        <StatCard label="Ca hôm nay" value="3" hint="Sáng · Chiều · Tối" icon={Clock} />
        <StatCard label="Năng suất" value="128 đơn" hint="+9% so với hôm qua" icon={TrendingUp} tone="success" />
        <StatCard label="Vật tư sắp hết" value="2" hint="Nước xả, móc áo" icon={Package} tone="danger" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <PeriodTabs value={period} onChange={setPeriod} />
        {["Nhân viên", "Ca làm việc", "Năng suất", "Kho & Vật tư"].map((item) => (
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

      {(tab === "Nhân viên" || tab === "Năng suất") && (
        <SectionCard title={tab === "Nhân viên" ? "Danh sách nhân viên" : "Năng suất nhân viên"}>
          <Table className="min-w-[820px]">
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Tên</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Ca</TableHead>
                <TableHead>Năng suất</TableHead>
                <TableHead>Đánh giá</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((row) => (
                <TableRow key={row[0]}>
                  {row.map((cell, index) => (
                    <TableCell key={`${row[0]}-${index}`}>
                      {index === 5 ? (
                        <StatusBadge tone={cell === "Hoạt động" ? "success" : "warning"}>
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
          </Table>
          <PaginationFooter
            page={page}
            pageCount={3}
            total={12}
            onPrev={() => setPage((current) => Math.max(current - 1, 1))}
            onNext={() => setPage((current) => Math.min(current + 1, 3))}
          />
        </SectionCard>
      )}

      {tab === "Ca làm việc" && (
        <SectionCard title="Lịch ca theo tuần">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Ngày</TableHead>
                <TableHead>Ca sáng</TableHead>
                <TableHead>Ca chiều</TableHead>
                <TableHead>Ca tối</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.map((row) => (
                <TableRow key={row[0]}>
                  {row.map((cell) => <TableCell key={cell}>{cell}</TableCell>)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>
      )}

      {tab === "Kho & Vật tư" && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            {purchaseSummary.map(([label, value]) => (
              <div key={label} className="rounded-xl border bg-card p-4">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-xl font-semibold">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
            <SectionCard title="Tồn kho hiện tại">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Vật tư</TableHead>
                    <TableHead>Tồn kho</TableHead>
                    <TableHead>Ngưỡng</TableHead>
                    <TableHead>Cảnh báo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplies.map((row) => (
                    <TableRow key={row[0]}>
                      <TableCell>{row[0]}</TableCell>
                      <TableCell>{row[1]}</TableCell>
                      <TableCell>{row[2]}</TableCell>
                      <TableCell>
                        <StatusBadge tone={row[3] === "Sắp hết" ? "danger" : "success"}>
                          {row[3]}
                        </StatusBadge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SectionCard>

            <SectionCard title="Lịch sử nhập kho">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Ngày</TableHead>
                    <TableHead>Vật tư</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Giá</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockHistory.map((row) => (
                    <TableRow key={`${row[0]}-${row[1]}`}>
                      <TableCell>{row[0]}</TableCell>
                      <TableCell>{row[1]}</TableCell>
                      <TableCell>{row[2]}</TableCell>
                      <TableCell>{row[4]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SectionCard>
          </div>

          <SectionCard
            title="Thống kê vật tư đã mua"
            description={`Tổng hợp theo ${period.toLowerCase()} để đối soát chi phí vật tư.`}
          >
            <Table className="min-w-[780px]">
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Vật tư</TableHead>
                  <TableHead>Nhà cung cấp</TableHead>
                  <TableHead>Tổng đã mua</TableHead>
                  <TableHead>Số lần nhập</TableHead>
                  <TableHead>Chi phí</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseStats.map((row) => (
                  <TableRow key={row[0]}>
                    {row.map((cell) => (
                      <TableCell key={cell}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard title="Chấm công hôm nay">
          <div className="space-y-3 p-4 text-sm">
            {[
              ["Nguyễn Văn A", "07:55", "Đúng giờ"],
              ["Trần Thị B", "13:05", "Trễ 5 phút"],
              ["Lê Hoàng C", "17:50", "Đúng giờ"],
            ].map(([name, time, status]) => (
              <div key={name} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{name}</p>
                  <p className="text-muted-foreground">Check-in {time}</p>
                </div>
                <StatusBadge tone={status.includes("Trễ") ? "warning" : "success"}>{status}</StatusBadge>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Phân việc theo ca">
          <div className="space-y-3 p-4 text-sm">
            {[
              ["Ca sáng", "Tiếp nhận 36 đơn · Giặt 210kg"],
              ["Ca chiều", "Sấy/Gấp 48 đơn · Giao 12 chuyến"],
              ["Ca tối", "Chốt đơn · Kiểm kho · Dọn máy"],
            ].map(([shift, work]) => (
              <div key={shift} className="rounded-lg border p-3">
                <p className="font-medium">{shift}</p>
                <p className="text-muted-foreground">{work}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Yêu cầu mua vật tư">
          <div className="space-y-3 p-4 text-sm">
            {[
              ["Nước xả", "Đề xuất mua 20 lít", "Cao"],
              ["Móc áo", "Đề xuất mua 200 cái", "Trung bình"],
              ["Bao bì", "Đủ dùng 5 ngày", "Thấp"],
            ].map(([item, desc, level]) => (
              <div key={item} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{item}</p>
                  <p className="text-muted-foreground">{desc}</p>
                </div>
                <StatusBadge tone={level === "Cao" ? "danger" : level === "Trung bình" ? "warning" : "default"}>{level}</StatusBadge>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {openForm && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-xl border bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Thêm nhân sự / vật tư</h2>
              <Button variant="ghost" size="sm" onClick={() => setOpenForm(false)}>Đóng</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Tên nhân viên / vật tư" />
              <Input placeholder="Vai trò / đơn vị tính" />
              <Input placeholder="Ca làm / tồn kho" />
              <Input placeholder="SĐT / ngưỡng cảnh báo" />
              <Input className="md:col-span-2" placeholder="Ghi chú vận hành" />
              <Button className="md:col-span-2 bg-neutral-900 text-white hover:bg-neutral-800">
                Lưu thông tin
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
