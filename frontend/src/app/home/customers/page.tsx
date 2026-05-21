"use client";

import { useMemo, useState } from "react";
import { Mail, MapPin, Phone, Search, Star, UserPlus } from "lucide-react";
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
  StatusBadge,
} from "../_components/dashboard-primitives";

const customers = [
  ["Nguyễn Thị Hương", "0903123456", "Q.1, TP.HCM", "28", "6.800.000đ", "2.400", "Vàng", "Dị ứng hóa chất mạnh"],
  ["Trần Văn Minh", "0912456789", "Q.5, TP.HCM", "17", "4.200.000đ", "1.200", "Bạc", "Giao sau 18h"],
  ["Phạm Thị Lan", "0938123456", "Q.3, TP.HCM", "12", "2.900.000đ", "860", "Thường", "Không dùng nước xả"],
  ["Công ty ABC", "0283812345", "Q.1, TP.HCM", "45", "18.600.000đ", "4.800", "Kim cương", "Xuất hóa đơn cuối tháng"],
];

const history = [
  ["DH-1048", "Giặt hấp", "180.000đ", "Hoàn thành", "16/05/2026"],
  ["DH-1031", "Giặt thường", "125.000đ", "Hoàn thành", "12/05/2026"],
  ["DH-1018", "Giặt khô", "240.000đ", "Đã giao trả", "08/05/2026"],
];

const pointHistory = [
  ["+180", "Hoàn thành DH-1048", "16/05/2026"],
  ["-120", "Đổi mã giảm 12.000đ", "14/05/2026"],
  ["+125", "Hoàn thành DH-1031", "12/05/2026"],
];

const feedback = [
  ["5 sao", "Đồ sạch, giao đúng giờ", "Đã ghi nhận"],
  ["Khiếu nại", "Giao trễ 30 phút", "Đang xử lý"],
];

export default function CustomersPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(customers[0]);
  const [tab, setTab] = useState("Thông tin");
  const [period, setPeriod] = useState<Period>("Tháng");
  const [page, setPage] = useState(1);
  const [openForm, setOpenForm] = useState(false);

  const filteredCustomers = useMemo(
    () =>
      customers.filter((customer) =>
        customer.join(" ").toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  return (
    <PageShell
      title="Khách Hàng"
      description="Quản lý hồ sơ, lịch sử đơn, loyalty và phản hồi trong một nơi."
      action={
        <Button className="bg-neutral-900 text-white hover:bg-neutral-800" onClick={() => setOpenForm(true)}>
          <UserPlus className="mr-2 size-4" />
          Thêm khách hàng
        </Button>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[1.2fr_420px]">
        <SectionCard
          title="Danh sách khách hàng"
          action={
            <div className="flex flex-col gap-2 md:flex-row">
              <PeriodTabs value={period} onChange={setPeriod} />
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Tên, SĐT, khu vực..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
            </div>
          }
        >
          <Table className="min-w-[920px]">
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Tên</TableHead>
                <TableHead>SĐT</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead>Tổng đơn</TableHead>
                <TableHead>Tổng chi tiêu</TableHead>
                <TableHead>Điểm</TableHead>
                <TableHead>Hạng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow
                  key={customer[1]}
                  className="cursor-pointer"
                  onClick={() => setSelected(customer)}
                >
                  {customer.slice(0, 7).map((cell, index) => (
                    <TableCell key={`${customer[1]}-${index}`}>
                      {index === 6 ? (
                        <StatusBadge tone={cell === "Kim cương" ? "success" : "default"}>
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
            pageCount={2}
            total={filteredCustomers.length + 4}
            onPrev={() => setPage((current) => Math.max(current - 1, 1))}
            onNext={() => setPage((current) => Math.min(current + 1, 2))}
          />
        </SectionCard>

        <SectionCard title="Hồ sơ khách hàng" description={selected[0]}>
          <div className="space-y-4 p-4">
            <div className="flex flex-wrap gap-2">
              {["Thông tin", "Lịch sử", "Loyalty", "Phản hồi"].map((item) => (
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

            {tab === "Thông tin" && (
              <div className="space-y-4 text-sm">
                <Info icon={Phone} label="Số điện thoại" value={selected[1]} />
                <Info icon={Mail} label="Email" value="khachhang@example.com" />
                <Info icon={MapPin} label="Địa chỉ mặc định" value={selected[2]} />
                <Info icon={Star} label="Ghi chú đặc biệt" value={selected[7]} />
              </div>
            )}

            {tab === "Lịch sử" && (
              <MiniRows rows={history} />
            )}

            {tab === "Loyalty" && (
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/40 p-4">
                  <p className="text-sm text-muted-foreground">Điểm hiện tại</p>
                  <p className="text-2xl font-semibold">{selected[5]} điểm</p>
                  <p className="mt-1 text-sm">Hạng {selected[6]} · Mã đang có: BIRTHDAY15</p>
                </div>
                <MiniRows rows={pointHistory} />
              </div>
            )}

            {tab === "Phản hồi" && (
              <MiniRows rows={feedback} />
            )}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Sổ địa chỉ giao nhận">
          <div className="space-y-3 p-4 text-sm">
            {[
              ["Nhà riêng", "123 Nguyễn Huệ, Q.1", "Mặc định"],
              ["Văn phòng", "45 Lê Lợi, Q.5", "Sau 18h"],
              ["Người nhận phụ", "89 Pasteur, Q.3", "Gọi trước"],
            ].map(([name, address, note]) => (
              <div key={name} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{name}</p>
                  <StatusBadge>{note}</StatusBadge>
                </div>
                <p className="mt-1 text-muted-foreground">{address}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Mã giảm giá đang có">
          <div className="space-y-3 p-4 text-sm">
            {[
              ["BIRTHDAY15", "Giảm 15%", "Còn 12 ngày"],
              ["LOYALTY50K", "Giảm 50.000đ", "Đổi từ 500 điểm"],
              ["FASTSHIP", "Miễn phí giao nhận", "Khách Vàng"],
            ].map(([code, value, note]) => (
              <div key={code} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{code}</p>
                  <p className="text-muted-foreground">{note}</p>
                </div>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Rủi ro cần lưu ý">
          <div className="space-y-3 p-4 text-sm">
            <div className="rounded-lg bg-red-50 p-3 text-red-700">
              Dị ứng hóa chất mạnh: ưu tiên quy trình giặt riêng.
            </div>
            <div className="rounded-lg bg-amber-50 p-3 text-amber-700">
              Có 1 khiếu nại giao trễ trong 30 ngày gần nhất.
            </div>
            <div className="rounded-lg bg-muted/40 p-3">
              Tần suất đặt hàng: 2-3 đơn / tuần.
            </div>
          </div>
        </SectionCard>
      </div>

      {openForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-xl border bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Thêm khách hàng</h2>
              <Button variant="ghost" size="sm" onClick={() => setOpenForm(false)}>Đóng</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Họ tên" />
              <Input placeholder="Số điện thoại" />
              <Input placeholder="Email" />
              <Input placeholder="Ngày sinh" type="date" />
              <Input className="md:col-span-2" placeholder="Địa chỉ mặc định" />
              <Input className="md:col-span-2" placeholder="Ghi chú: dị ứng hóa chất, yêu cầu riêng..." />
              <Button className="md:col-span-2 bg-neutral-900 text-white hover:bg-neutral-800">
                Lưu khách hàng
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <Icon className="mt-0.5 size-4 text-muted-foreground" />
      <div>
        <p className="text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

function MiniRows({ rows }: { rows: string[][] }) {
  return (
    <div className="divide-y rounded-lg border">
      {rows.map((row) => (
        <div key={row.join("-")} className="space-y-1 p-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium">{row[0]}</span>
            <span className="text-muted-foreground">{row[row.length - 1]}</span>
          </div>
          <p className="text-muted-foreground">{row.slice(1, -1).join(" · ")}</p>
        </div>
      ))}
    </div>
  );
}
