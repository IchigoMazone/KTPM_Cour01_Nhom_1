"use client";

import { useMemo, useState } from "react";
import { FileText, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  ActionButton,
  PageShell,
  PaginationFooter,
  Period,
  PeriodTabs,
  SectionCard,
  StatusBadge,
} from "../_components/dashboard-primitives";

type OrderStatus =
  | "Tiếp nhận"
  | "Đang giặt"
  | "Phơi/Sấy"
  | "Gấp/Là"
  | "Sẵn sàng giao"
  | "Đã giao trả";

type Order = {
  id: string;
  customer: string;
  phone: string;
  service: string;
  quantity: string;
  amount: number;
  status: OrderStatus;
  due: string;
  driver: string;
  createdAt: string;
  note: string;
};

const statuses: OrderStatus[] = [
  "Tiếp nhận",
  "Đang giặt",
  "Phơi/Sấy",
  "Gấp/Là",
  "Sẵn sàng giao",
  "Đã giao trả",
];

const seedOrders: Order[] = [
  { id: "DH-1048", customer: "Nguyễn Thị Hương", phone: "0903123456", service: "Giặt hấp", quantity: "3 món", amount: 180000, status: "Phơi/Sấy", due: "10:30", driver: "Anh Minh", createdAt: "2026-05-17", note: "Không dùng nước xả" },
  { id: "DH-1052", customer: "Trần Minh", phone: "0912456789", service: "Giặt khô", quantity: "2 món", amount: 240000, status: "Gấp/Là", due: "11:15", driver: "Chị Lan", createdAt: "2026-05-17", note: "Vest cần treo riêng" },
  { id: "DH-1055", customer: "Phạm Lan", phone: "0938123456", service: "Giặt thường", quantity: "5 kg", amount: 125000, status: "Sẵn sàng giao", due: "12:00", driver: "Anh Tuấn", createdAt: "2026-05-17", note: "Giao trước 13h" },
  { id: "DH-1057", customer: "Công ty ABC", phone: "0283812345", service: "Chăn màn", quantity: "8 kg", amount: 320000, status: "Đang giặt", due: "12:30", driver: "Anh Minh", createdAt: "2026-05-16", note: "Xuất hóa đơn cuối tháng" },
  { id: "DH-1061", customer: "Shop Linen", phone: "0283999888", service: "Giặt thường", quantity: "12 kg", amount: 300000, status: "Tiếp nhận", due: "15:00", driver: "Chưa gán", createdAt: "2026-05-15", note: "Khách doanh nghiệp" },
  { id: "DH-1062", customer: "Lê Mai", phone: "0977000111", service: "Giặt đồ da", quantity: "1 món", amount: 180000, status: "Đã giao trả", due: "16:30", driver: "Chị Lan", createdAt: "2026-05-14", note: "Đã thu tiền mặt" },
];

const pageSize = 4;

export default function OrdersPage() {
  const [orders, setOrders] = useState(seedOrders);
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "Tất cả">("Tất cả");
  const [period, setPeriod] = useState<Period>("Ngày");
  const [page, setPage] = useState(1);
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState({
    customer: "",
    phone: "",
    service: "Giặt thường",
    quantity: "",
    amount: "0",
    due: "",
    payment: "Tiền mặt",
    discount: "",
    note: "",
  });

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const source = `${order.id} ${order.customer} ${order.phone} ${order.service} ${order.driver}`;
      const matchQuery = source.toLowerCase().includes(query.toLowerCase());
      const matchStatus = selectedStatus === "Tất cả" || order.status === selectedStatus;
      return matchQuery && matchStatus;
    });
  }, [orders, query, selectedStatus]);

  const pageCount = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);
  const totalAmount = filteredOrders.reduce((sum, order) => sum + order.amount, 0);

  const createOrder = () => {
    if (!form.customer.trim() || !form.quantity.trim()) return;
    const amount = Number(form.amount) || 0;
    const newOrder: Order = {
      id: `DH-${Date.now().toString().slice(-4)}`,
      customer: form.customer,
      phone: form.phone,
      service: form.service,
      quantity: form.quantity,
      amount,
      status: "Tiếp nhận",
      due: form.due || "Chưa hẹn",
      driver: "Chưa gán",
      createdAt: new Date().toISOString().slice(0, 10),
      note: `${form.note}${form.discount ? ` · Mã ${form.discount}` : ""}`,
    };
    setOrders((prev) => [newOrder, ...prev]);
    setPage(1);
    setOpenForm(false);
    setForm({
      customer: "",
      phone: "",
      service: "Giặt thường",
      quantity: "",
      amount: "0",
      due: "",
      payment: "Tiền mặt",
      discount: "",
      note: "",
    });
  };

  return (
    <PageShell
      title="Quản lý Đơn Hàng"
      description="Theo dõi vòng đời đơn giặt từ tiếp nhận đến giao trả."
      action={
        <ActionButton onClick={() => setOpenForm(true)}>
          <Plus className="mr-2 size-4" />
          Tạo đơn mới
        </ActionButton>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 xl:flex-row xl:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Tìm mã đơn, khách hàng, số điện thoại..."
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <PeriodTabs value={period} onChange={setPeriod} />
          <div className="flex flex-wrap gap-2">
            {["Tất cả", ...statuses].map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedStatus(status as OrderStatus | "Tất cả");
                  setPage(1);
                }}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        <SectionCard title="Danh sách đơn hàng" description={`Đang xem theo ${period.toLowerCase()}.`}>
          <Table className="min-w-[1080px]">
            <TableCaption>Danh sách đơn đang vận hành và lịch sử gần nhất.</TableCaption>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Mã đơn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>SĐT</TableHead>
                <TableHead>Dịch vụ</TableHead>
                <TableHead>Số kg/món</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Hẹn trả</TableHead>
                <TableHead>Tài xế</TableHead>
                <TableHead className="text-right">Phiếu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.phone}</TableCell>
                  <TableCell>{order.service}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>{order.amount.toLocaleString("vi-VN")}đ</TableCell>
                  <TableCell>
                    <StatusBadge tone={order.status === "Sẵn sàng giao" || order.status === "Đã giao trả" ? "success" : "default"}>
                      {order.status}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>{order.due}</TableCell>
                  <TableCell>{order.driver}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" title="Xem phiếu">
                      <FileText className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4}>Tổng đơn lọc được</TableCell>
                <TableCell>{filteredOrders.length} đơn</TableCell>
                <TableCell>{totalAmount.toLocaleString("vi-VN")}đ</TableCell>
                <TableCell colSpan={4} className="text-right">
                  Kỳ xem: {period}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
          <PaginationFooter
            page={page}
            pageCount={pageCount}
            total={filteredOrders.length}
            onPrev={() => setPage((current) => Math.max(current - 1, 1))}
            onNext={() => setPage((current) => Math.min(current + 1, pageCount))}
          />
        </SectionCard>

        <SectionCard title="Pipeline trạng thái">
          <div className="grid gap-3 p-4 md:grid-cols-3 xl:grid-cols-6">
            {statuses.map((status) => (
              <Card key={status} className="bg-muted/20">
                <CardHeader className="p-3">
                  <CardTitle className="text-sm">{status}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-3 pt-0">
                  {orders
                    .filter((order) => order.status === status)
                    .map((order) => (
                      <div key={order.id} className="rounded-md border bg-background p-2 text-xs">
                        <p className="font-medium">{order.id}</p>
                        <p className="text-muted-foreground">{order.customer}</p>
                      </div>
                    ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard title="Bộ lọc vận hành nâng cao">
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Nhân viên phụ trách</Label>
              <Input placeholder="Tên thợ giặt / thu ngân" />
            </div>
            <div className="space-y-2">
              <Label>Ngày tạo</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Ngày hẹn trả</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Loại dịch vụ</Label>
              <Input placeholder="Giặt thường, giặt khô..." />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Lịch sử cập nhật đơn">
          <div className="space-y-3 p-4 text-sm">
            {orders.slice(0, 4).map((order) => (
              <div key={`${order.id}-history`} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{order.id}</p>
                  <span className="text-muted-foreground">{order.createdAt}</span>
                </div>
                <p className="mt-1 text-muted-foreground">
                  {order.status} · {order.note || "Không có ghi chú"}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Template phiếu đơn">
          <div className="space-y-3 p-4 text-sm">
            <div className="rounded-lg border p-4">
              <p className="font-semibold">Laundry Admin</p>
              <p className="text-muted-foreground">Logo · QR mã đơn · danh mục đồ · giá</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <span>Khách hàng</span>
                <span className="text-right">Nguyễn Thị Hương</span>
                <span>Thanh toán</span>
                <span className="text-right">MoMo / VNPay / tiền mặt</span>
                <span>Tổng tiền</span>
                <span className="text-right font-semibold">180.000đ</span>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <FileText className="mr-2 size-4" />
              Xem trước phiếu
            </Button>
          </div>
        </SectionCard>
      </div>

      {openForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Tạo đơn giặt mới</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setOpenForm(false)}>
                <X className="size-4" />
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Khách hàng</Label>
                <Input value={form.customer} onChange={(event) => setForm({ ...form, customer: event.target.value })} placeholder="Tên khách" />
              </div>
              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="090..." />
              </div>
              <div className="space-y-2">
                <Label>Dịch vụ</Label>
                <Input value={form.service} onChange={(event) => setForm({ ...form, service: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Số lượng</Label>
                <Input value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} placeholder="5 kg / 3 món" />
              </div>
              <div className="space-y-2">
                <Label>Hẹn trả</Label>
                <Input value={form.due} onChange={(event) => setForm({ ...form, due: event.target.value })} placeholder="14:30" />
              </div>
              <div className="space-y-2">
                <Label>Tạm tính</Label>
                <Input type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Thanh toán</Label>
                <Input value={form.payment} onChange={(event) => setForm({ ...form, payment: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Mã giảm giá / điểm</Label>
                <Input value={form.discount} onChange={(event) => setForm({ ...form, discount: event.target.value })} placeholder="BIRTHDAY15" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Ghi chú đặc biệt</Label>
                <Textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Dị ứng hóa chất, đồ nhạy cảm..." />
              </div>
              <div className="md:col-span-2">
                <Button className="w-full bg-neutral-900 text-white hover:bg-neutral-800" onClick={createOrder}>
                  Lưu đơn và đưa vào tiếp nhận
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageShell>
  );
}
