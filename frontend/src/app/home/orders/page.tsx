"use client";

import { useCallback, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { CalendarDays, ChevronLeft, ChevronRight, FileText, Plus, Search, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableCaption,
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
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<{ from: Date; to: Date } | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<{ month: number; year: number } | undefined>(undefined);
  const [monthPickerYear, setMonthPickerYear] = useState(new Date().getFullYear());
  const [weekPickerMonth, setWeekPickerMonth] = useState(new Date().getMonth());
  const [weekPickerYear, setWeekPickerYear] = useState(new Date().getFullYear());
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

  const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];

  const getWeekRange = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diffToMon = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMon);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { from: monday, to: sunday };
  };

  const getWeeksInMonth = (year: number, month: number) => {
    const weeks: { from: Date; to: Date }[] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const start = new Date(firstDay);
    const day = start.getDay();
    const diffToMon = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diffToMon);
    start.setHours(0, 0, 0, 0);

    let current = new Date(start);
    while (current <= lastDay) {
      const from = new Date(current);
      const to = new Date(current);
      to.setDate(to.getDate() + 6);
      to.setHours(23, 59, 59, 999);
      weeks.push({ from, to });
      current.setDate(current.getDate() + 7);
    }
    return weeks;
  };

  const handlePeriodChange = useCallback((newPeriod: Period) => {
    setPeriod(newPeriod);
    setDateRange(undefined);
    setSelectedWeek(undefined);
    setSelectedMonth(undefined);
    setCalendarOpen(false);
    setPage(1);
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const source = `${order.id} ${order.customer} ${order.phone} ${order.service} ${order.driver}`;
      const matchQuery = source.toLowerCase().includes(query.toLowerCase());
      const matchStatus = selectedStatus === "Tất cả" || order.status === selectedStatus;

      let matchDate = true;
      if (dateRange?.from) {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        const from = new Date(dateRange.from);
        from.setHours(0, 0, 0, 0);
        if (orderDate < from) matchDate = false;
        if (dateRange.to) {
          const to = new Date(dateRange.to);
          to.setHours(23, 59, 59, 999);
          if (orderDate > to) matchDate = false;
        }
      }

      return matchQuery && matchStatus && matchDate;
    });
  }, [orders, query, selectedStatus, dateRange]);

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
          {period === "Ngày" && (
            <div className="relative w-fit">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-[220px] justify-start text-left font-normal ${dateRange?.from ? "pr-9" : ""}`}
                  >
                    <CalendarDays className="mr-2 size-4 shrink-0 text-muted-foreground" />
                    <span className="overflow-x-auto whitespace-nowrap scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                      {dateRange?.from ? (
                        dateRange.to && dateRange.to.getTime() !== dateRange.from.getTime() ? (
                          <>
                            {dateRange.from.toLocaleDateString("vi-VN")} –{" "}
                            {dateRange.to.toLocaleDateString("vi-VN")}
                          </>
                        ) : (
                          dateRange.from.toLocaleDateString("vi-VN")
                        )
                      ) : (
                        "Chọn ngày"
                      )}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => {
                      setDateRange(range);
                      setPage(1);
                    }}
                  />
                </PopoverContent>
              </Popover>
              {dateRange?.from && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-sm bg-background p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDateRange(undefined);
                    setPage(1);
                  }}
                  title="Xóa bộ lọc ngày"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          )}

          {period === "Tuần" && (
            <div className="relative w-fit">
              <Popover
                open={calendarOpen}
                onOpenChange={(open) => {
                  setCalendarOpen(open);
                  if (open) {
                    const refDate = selectedWeek?.from || new Date();
                    setWeekPickerMonth(refDate.getMonth());
                    setWeekPickerYear(refDate.getFullYear());
                  }
                }}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-[220px] justify-start text-left font-normal ${selectedWeek ? "pr-9" : ""}`}
                  >
                    <CalendarDays className="mr-2 size-4 shrink-0 text-muted-foreground" />
                    <span className="overflow-x-auto whitespace-nowrap scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                      {selectedWeek ? (
                        <>
                          {selectedWeek.from.toLocaleDateString("vi-VN")} –{" "}
                          {selectedWeek.to.toLocaleDateString("vi-VN")}
                        </>
                      ) : (
                        "Chọn tuần"
                      )}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-3" align="start">
                  <div className="flex items-center justify-between mb-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => {
                        if (weekPickerMonth === 0) {
                          setWeekPickerMonth(11);
                          setWeekPickerYear((y) => y - 1);
                        } else {
                          setWeekPickerMonth((m) => m - 1);
                        }
                      }}
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    <span className="text-sm font-medium">
                      Tháng {weekPickerMonth + 1} / {weekPickerYear}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => {
                        if (weekPickerMonth === 11) {
                          setWeekPickerMonth(0);
                          setWeekPickerYear((y) => y + 1);
                        } else {
                          setWeekPickerMonth((m) => m + 1);
                        }
                      }}
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {getWeeksInMonth(weekPickerYear, weekPickerMonth).slice(0, 4).map((week, idx) => {
                      const isSelected = selectedWeek &&
                        selectedWeek.from.getTime() === week.from.getTime() &&
                        selectedWeek.to.getTime() === week.to.getTime();
                      return (
                        <Button
                          key={idx}
                          variant={isSelected ? "default" : "outline"}
                          className="w-full justify-between text-xs font-normal h-9 px-3"
                          onClick={() => {
                            setSelectedWeek(week);
                            setDateRange({ from: week.from, to: week.to });
                            setPage(1);
                            setCalendarOpen(false);
                          }}
                        >
                          <span className="font-medium">Tuần {idx + 1}</span>
                          <span className={isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}>
                            {week.from.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' })} - {week.to.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' })}
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
              {selectedWeek && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-sm bg-background p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedWeek(undefined);
                    setDateRange(undefined);
                    setPage(1);
                  }}
                  title="Xóa bộ lọc tuần"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          )}

          {period === "Tháng" && (
            <div className="relative w-fit">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-[220px] justify-start text-left font-normal ${selectedMonth ? "pr-9" : ""}`}
                  >
                    <CalendarDays className="mr-2 size-4 shrink-0 text-muted-foreground" />
                    {selectedMonth ? (
                      `${monthNames[selectedMonth.month]} / ${selectedMonth.year}`
                    ) : (
                      "Chọn tháng"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[260px] p-3" align="start">
                  <div className="flex items-center justify-between mb-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => setMonthPickerYear((y) => y - 1)}
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    <span className="text-sm font-medium">{monthPickerYear}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => setMonthPickerYear((y) => y + 1)}
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {monthNames.map((name, idx) => (
                      <Button
                        key={name}
                        variant={selectedMonth?.month === idx && selectedMonth?.year === monthPickerYear ? "default" : "ghost"}
                        size="sm"
                        className="h-9 text-xs"
                        onClick={() => {
                          setSelectedMonth({ month: idx, year: monthPickerYear });
                          const from = new Date(monthPickerYear, idx, 1);
                          const to = new Date(monthPickerYear, idx + 1, 0, 23, 59, 59, 999);
                          setDateRange({ from, to });
                          setPage(1);
                          setCalendarOpen(false);
                        }}
                      >
                        {name}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              {selectedMonth && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-sm bg-background p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMonth(undefined);
                    setDateRange(undefined);
                    setPage(1);
                  }}
                  title="Xóa bộ lọc tháng"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          )}
          <PeriodTabs value={period} onChange={handlePeriodChange} />
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
          <div className="my-4 text-center text-sm text-muted-foreground ">
            Danh sách đơn đang vận hành và lịch sử gần nhất.
          </div>
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
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4">
          <Card className="relative max-h-[90dvh] w-full max-w-2xl overflow-y-auto">
            <CardHeader className="pr-12">
              <CardTitle className="text-lg">Tạo đơn giặt mới</CardTitle>
              <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={() => setOpenForm(false)}>
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
