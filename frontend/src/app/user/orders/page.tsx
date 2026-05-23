"use client";

import { useMemo, useState, useEffect } from "react";
import type { DateRange } from "react-day-picker";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  PackageCheck,
  ReceiptText,
  RotateCcw,
  X,
  Download,
  Star,
  Trash2,
  Eye,
  Clock,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
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
  { code: "DH-1015", date: "05/05/2026", service: "Giặt thường", total: "75.000đ", status: "Hoàn tất", tone: "success" },
  { code: "DH-1012", date: "01/05/2026", service: "Giặt thường", total: "110.000đ", status: "Hoàn tất", tone: "success" },
  { code: "DH-1008", date: "28/04/2026", service: "Giặt hấp", total: "150.000đ", status: "Hoàn tất", tone: "success" },
  { code: "DH-1005", date: "20/04/2026", service: "Giặt hấp", total: "220.000đ", status: "Hoàn tất", tone: "success" },
  { code: "DH-0998", date: "15/04/2026", service: "Giặt thường", total: "95.000đ", status: "Hoàn tất", tone: "success" },
] as const;

const monthNames = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

const parseOrderDate = (dateStr: string) => {
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day);
};

const getOrderTimeline = (order: { code: string; date: string; status: string }) => {
  const baseDate = order.date;
  
  if (order.status === "Đang giặt") {
    return [
      { stage: "Đã nhận đồ", time: `${baseDate} 08:00`, status: "completed", desc: "Nhân viên Panda đã nhận túi đồ từ khách hàng." },
      { stage: "Phân loại", time: `${baseDate} 09:15`, status: "completed", desc: "Đồ giặt đã được phân loại theo chất liệu và màu sắc." },
      { stage: "Đang giặt", time: `${baseDate} 10:30`, status: "current", desc: "Đồ đang được giặt máy bằng nước giặt hữu cơ sinh học." },
      { stage: "Sấy & gấp", time: "--:--", status: "pending", desc: "Sấy khô ở nhiệt độ thích hợp và xếp gọn vào túi." },
      { stage: "Giao lại", time: "--:--", status: "pending", desc: "Giao đồ sạch tận tay khách hàng theo lịch hẹn." },
    ];
  } else if (order.status === "Sẵn sàng giao") {
    return [
      { stage: "Đã nhận đồ", time: `${baseDate} 08:30`, status: "completed", desc: "Nhân viên Panda đã nhận túi đồ từ khách hàng." },
      { stage: "Phân loại", time: `${baseDate} 09:40`, status: "completed", desc: "Đồ giặt đã được phân loại theo chất liệu và màu sắc." },
      { stage: "Đang giặt", time: `${baseDate} 11:00`, status: "completed", desc: "Đồ đã được giặt sạch bằng nước giặt hữu cơ sinh học." },
      { stage: "Sấy & gấp", time: `${baseDate} 14:30`, status: "completed", desc: "Đồ đã được sấy khô và xếp gọn gàng vào túi đóng gói sạch." },
      { stage: "Giao lại (Chờ giao)", time: `${baseDate} 15:00`, status: "current", desc: "Đồ sạch sẵn sàng để giao lại. Đang chờ tài xế lấy đồ giao." },
    ];
  } else if (order.status === "Hoàn tất") {
    return [
      { stage: "Đã nhận đồ", time: `${baseDate} 08:00`, status: "completed", desc: "Nhân viên Panda đã nhận túi đồ từ khách hàng." },
      { stage: "Phân loại", time: `${baseDate} 09:00`, status: "completed", desc: "Đồ giặt đã được phân loại theo chất liệu và màu sắc." },
      { stage: "Đang giặt", time: `${baseDate} 10:30`, status: "completed", desc: "Đồ đã được giặt sạch bằng nước giặt hữu cơ sinh học." },
      { stage: "Sấy & gấp", time: `${baseDate} 13:00`, status: "completed", desc: "Đồ đã được sấy khô và xếp gọn gàng vào túi đóng gói sạch." },
      { stage: "Giao lại hoàn tất", time: `${baseDate} 16:30`, status: "completed", desc: "Đã giao lại túi đồ giặt là sạch sẽ và thơm tho cho khách hàng." },
    ];
  } else {
    return [
      { stage: "Đã nhận đồ", time: `${baseDate} 09:00`, status: "completed", desc: "Nhân viên Panda đã nhận túi đồ từ khách hàng." },
      { stage: "Đã hủy đơn", time: `${baseDate} 10:15`, status: "cancelled", desc: "Khách hàng yêu cầu hủy đơn hàng. Đã hoàn tất hoàn trả đồ nhận." },
    ];
  }
};

const getOrderDetails = (code: string) => {
  const detailsMap: Record<string, {
    customerName: string;
    phone: string;
    items: { name: string; qty: string; price: string }[];
    paymentMethod: string;
    address: string;
    notes: string;
    weight?: string;
  }> = {
    "DH-1055": {
      customerName: "nn",
      phone: "0901 234 567",
      items: [
        { name: "Giặt sấy quần áo thường", qty: "4.6 kg", price: "82.800đ" },
        { name: "Phụ phí nước giặt hữu cơ", qty: "1", price: "9.200đ" }
      ],
      paymentMethod: "Ví điện tử MoMo",
      address: "12 Nguyễn Trãi, Quận 1, TP.HCM",
      notes: "Giặt riêng đồ màu trắng, sấy khô hoàn toàn.",
      weight: "4.6 kg"
    },
    "DH-1048": {
      customerName: "Nguyen Van A",
      phone: "0901 234 567",
      items: [
        { name: "Giặt hấp Áo khoác vest", qty: "2 cái", price: "120.000đ" },
        { name: "Giặt hấp Váy đầm cao cấp", qty: "1 cái", price: "60.000đ" }
      ],
      paymentMethod: "Thẻ ATM Nội địa",
      address: "12 Nguyễn Trãi, Quận 1, TP.HCM",
      notes: "Ủi phẳng, móc treo cẩn thận.",
      weight: "3 cái"
    },
    "DH-1032": {
      customerName: "Trịnh Văn B",
      phone: "0901 234 567",
      items: [
        { name: "Giặt chăn bông dày", qty: "1 cái", price: "150.000đ" },
        { name: "Giặt ga trải giường", qty: "2 cái", price: "90.000đ" }
      ],
      paymentMethod: "Thanh toán khi nhận đồ (COD)",
      address: "12 Nguyễn Trãi, Quận 1, TP.HCM",
      notes: "Sử dụng nước xả vải Downy huyền bí thơm nhẹ.",
      weight: "3 chiếc"
    },
    "DH-1019": {
      customerName: "AAA",
      phone: "0901 234 567",
      items: [
        { name: "Giặt khô Áo dạ dài", qty: "1 cái", price: "135.000đ" }
      ],
      paymentMethod: "Ví điện tử MoMo",
      address: "12 Nguyễn Trãi, Quận 1, TP.HCM",
      notes: "Hộp giấy bảo quản form áo dạ.",
      weight: "1 cái"
    },
    "DH-1015": {
      customerName: "BBBB",
      phone: "0901 234 567",
      items: [
        { name: "Giặt sấy quần áo thường", qty: "3.7 kg", price: "66.600đ" },
        { name: "Nước xả vải cao cấp", qty: "1", price: "8.400đ" }
      ],
      paymentMethod: "Thanh toán khi nhận đồ (COD)",
      address: "12 Nguyễn Trãi, Quận 1, TP.HCM",
      notes: "Không sấy ở nhiệt độ quá cao tránh co rút vải.",
      weight: "3.7 kg"
    },
    "DH-1012": {
      customerName: "CCC",
      phone: "0901 234 567",
      items: [
        { name: "Giặt sấy quần áo thường", qty: "5.5 kg", price: "99.000đ" },
        { name: "Phụ phí giặt nước ấm", qty: "1", price: "11.000đ" }
      ],
      paymentMethod: "Ví điện tử MoMo",
      address: "12 Nguyễn Trãi, Quận 1, TP.HCM",
      notes: "Đồ em bé giặt riêng bằng xà phòng hypoallergenic.",
      weight: "5.5 kg"
    },
    "DH-1008": {
      customerName: "DDDD",
      phone: "0901 234 567",
      items: [
        { name: "Giặt hấp Giày thể thao", qty: "2 đôi", price: "100.000đ" },
        { name: "Giặt hấp Mũ lưỡi trai hiệu", qty: "1 cái", price: "50.000đ" }
      ],
      paymentMethod: "Chuyển khoản Ngân hàng",
      address: "12 Nguyễn Trãi, Quận 1, TP.HCM",
      notes: "Ủ giày thơm tho sạch sẽ.",
      weight: "3 món"
    },
    "DH-1005": {
      customerName: "EEEE",
      phone: "0901 234 567",
      items: [
        { name: "Giặt hấp Vét comple nam", qty: "1 bộ", price: "140.000đ" },
        { name: "Giặt hấp Áo sơ mi lụa", qty: "2 cái", price: "80.000đ" }
      ],
      paymentMethod: "Chuyển khoản Ngân hàng",
      address: "12 Nguyễn Trãi, Quận 1, TP.HCM",
      notes: "Ủi phẳng xếp nếp quần tây.",
      weight: "3 món"
    },
    "DH-0998": {
      customerName: "FFFF",
      phone: "0901 234 567",
      items: [
        { name: "Giặt sấy quần áo thường", qty: "4.7 kg", price: "84.600đ" },
        { name: "Thơm xịt sấy", qty: "1", price: "10.400đ" }
      ],
      paymentMethod: "Thanh toán khi nhận đồ (COD)",
      address: "12 Nguyễn Trãi, Quận 1, TP.HCM",
      notes: "Hẹn giao tối sau 19h.",
      weight: "4.7 kg"
    }
  };

  return detailsMap[code] || {
    customerName: "GGGG",
    phone: "0901 234 567",
    items: [{ name: "Giặt sấy tổng hợp", qty: "1 gói", price: "92.000đ" }],
    paymentMethod: "Thanh toán khi nhận đồ (COD)",
    address: "12 Nguyễn Trãi, Quận 1, TP.HCM",
    notes: "Không có ghi chú."
  };
};

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

interface Order {
  order_id: string;
  code: string;
  date: string;
  service: string;
  total: string;
  status: string;
  status_display: string;
  tone: "default" | "success" | "danger" | "warning";
  total_amount: number;
}

interface OrderItem {
  name: string;
  qty: string;
  price: string;
}

interface TimelineEvent {
  stage: string;
  time: string;
  status: string;
  desc: string;
}

interface OrderDetail {
  code: string;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: string;
  notes: string;
  weight?: string;
  total: string;
  status: string;
  status_display: string;
  tone: string;
  items: OrderItem[];
  timeline: TimelineEvent[];
}

export default function UserOrdersPage() {
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteOrderCode, setDeleteOrderCode] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>("Tháng");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<{ from: Date; to: Date } | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<{ month: number; year: number } | undefined>(undefined);
  const [monthPickerYear, setMonthPickerYear] = useState(new Date().getFullYear());
  const [weekPickerMonth, setWeekPickerMonth] = useState(new Date().getMonth());
  const [weekPickerYear, setWeekPickerYear] = useState(new Date().getFullYear());
  const [page, setPage] = useState(1);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reorderConfirmOpen, setReorderConfirmOpen] = useState(false);
  const [selectedTimelineOrder, setSelectedTimelineOrder] = useState<Order | null>(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<OrderDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const fetchOrders = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setIsLoading(true);
    fetch("http://localhost:8000/api/orders", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json() as Promise<Order[]>;
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setOrderList(data);
        }
      })
      .catch((err) => console.error("Error fetching orders:", err))
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!selectedTimelineOrder) {
      setSelectedOrderDetail(null);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    setIsDetailLoading(true);
    fetch(`http://localhost:8000/api/orders/${selectedTimelineOrder.code}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json() as Promise<OrderDetail>;
      })
      .then((data) => {
        setSelectedOrderDetail(data);
      })
      .catch((err) => {
        console.error("Error fetching order details:", err);
        toast.error("Không thể tải thông tin chi tiết đơn hàng.");
      })
      .finally(() => {
        setIsDetailLoading(false);
      });
  }, [selectedTimelineOrder]);

  const pageSize = 4;

  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod);
    setDateRange(undefined);
    setSelectedWeek(undefined);
    setSelectedMonth(undefined);
    setCalendarOpen(false);
    setPage(1);
  };

  const filteredOrders = useMemo(() => {
    return orderList.filter((order) => {
      if (!dateRange?.from) return true;

      const orderDate = parseOrderDate(order.date);
      orderDate.setHours(0, 0, 0, 0);

      const from = new Date(dateRange.from);
      from.setHours(0, 0, 0, 0);

      if (orderDate < from) return false;

      if (dateRange.to) {
        const to = new Date(dateRange.to);
        to.setHours(23, 59, 59, 999);
        if (orderDate > to) return false;
      }
      return true;
    });
  }, [dateRange, orderList]);

  const pageCount = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredOrders, page, pageSize]);

  const totalOrders = filteredOrders.length;
  const completedOrders = filteredOrders.filter((o) => o.status === "Hoàn tất").length;
  const totalSpent = useMemo(() => {
    const sum = filteredOrders.reduce((acc, o) => {
      const numeric = parseInt(o.total.replace(/\D/g, ""), 10) || 0;
      return acc + numeric;
    }, 0);
    if (sum >= 1000000) {
      return (sum / 1000000).toLocaleString("vi-VN", { maximumFractionDigits: 2 }) + "tr";
    }
    return sum.toLocaleString("vi-VN") + "đ";
  }, [filteredOrders]);

  const pickerActions = (
    <div className="flex flex-wrap items-center gap-2">
      {period === "Ngày" && (
        <div className="relative">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-[180px] sm:w-[220px] justify-start text-left font-normal ${dateRange?.from ? "pr-8" : ""}`}
                size="sm"
              >
                <CalendarDays className="mr-2 size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">
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
            <PopoverContent className="w-auto p-0" align="end">
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
        <div className="relative">
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
                className={`w-[180px] sm:w-[220px] justify-start text-left font-normal ${selectedWeek ? "pr-8" : ""}`}
                size="sm"
              >
                <CalendarDays className="mr-2 size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">
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
            <PopoverContent className="w-[280px] p-3" align="end">
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
        <div className="relative">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-[180px] sm:w-[220px] justify-start text-left font-normal ${selectedMonth ? "pr-8" : ""}`}
                size="sm"
              >
                <CalendarDays className="mr-2 size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">
                  {selectedMonth ? (
                    `Tháng ${selectedMonth.month + 1} / ${selectedMonth.year}`
                  ) : (
                    "Chọn tháng"
                  )}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[260px] p-3" align="end">
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
    </div>
  );

  return (
    <PageShell
      title="Đơn Của Tôi"
      description="Theo dõi trạng thái đơn hiện tại, hóa đơn và lịch sử giặt theo thời gian."
      action={pickerActions}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Tổng đơn" value={String(totalOrders)} hint={`Thống kê theo ${period.toLowerCase()}`} icon={ClipboardList} />
        <StatCard label="Đã hoàn tất" value={String(completedOrders)} hint="Không có khiếu nại" icon={PackageCheck} tone="success" />
        <StatCard label="Tổng chi tiêu" value={totalSpent} hint="Đã gồm ưu đãi" icon={ReceiptText} />
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
                <TableHead className="text-right w-[80px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <TableRow
                    key={order.code}
                    className="cursor-pointer hover:bg-neutral-50/80 transition-colors"
                    onClick={() => setSelectedTimelineOrder(order)}
                    title="Nhấp để xem tiến trình chi tiết"
                  >
                    <TableCell className="font-semibold text-neutral-900">{order.code}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>{order.service}</TableCell>
                    <TableCell>
                      <StatusBadge tone={order.tone}>{order.status}</StatusBadge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{order.total}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteOrderCode(order.code);
                        }}
                        title="Xóa đơn hàng"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Không tìm thấy đơn hàng nào trong khoảng thời gian đã chọn.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <PaginationFooter
          page={page}
          pageCount={pageCount}
          total={totalOrders}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(pageCount, p + 1))}
        />
      </SectionCard>

      <SectionCard title="Thao tác nhanh" description="Lặp lại đơn cũ hoặc tải hóa đơn.">
        <div className="grid gap-3 p-4 md:grid-cols-3">
          <Button
            variant="outline"
            className="justify-start gap-2 border-neutral-200 hover:bg-neutral-50"
            onClick={() => {
              setReorderConfirmOpen(true);
            }}
          >
            <RotateCcw className="size-4 text-neutral-500" />
            Đặt lại DH-1032
          </Button>

          <Button
            variant="outline"
            className="justify-start gap-2 border-neutral-200 hover:bg-neutral-50"
            onClick={() => {
              toast.success("Đang xuất hóa đơn PDF...", {
                description: "Tệp hóa đơn tháng 5 đang được chuẩn bị tải về máy."
              });
            }}
          >
            <Download className="size-4 text-neutral-500" />
            Tải hóa đơn tháng 5
          </Button>

          <Button
            variant="outline"
            className="justify-start gap-2 border-neutral-200 hover:bg-neutral-50"
            onClick={() => {
              setRatingValue(5);
              setReviewText("");
              setRatingDialogOpen(true);
            }}
          >
            <Star className="size-4 text-neutral-500" />
            Đánh giá dịch vụ
          </Button>
        </div>
      </SectionCard>

      {/* Rating Dialog */}
      <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
        <DialogContent className="max-w-[400px] gap-0 rounded-xl border border-black/10 bg-white p-0 shadow-lg" showCloseButton={false}>
          <DialogHeader className="gap-3 px-5 pb-4 pt-5">
            <DialogTitle className="text-base font-semibold leading-6 text-neutral-900">
              Đánh giá dịch vụ giặt là
            </DialogTitle>
            <DialogDescription className="text-sm leading-5 text-[#6b6b6b]">
              Ý kiến phản hồi của bạn giúp chúng tôi nâng cao chất lượng phục vụ mỗi ngày.
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-5 pb-5">
            <div className="flex gap-2 justify-center my-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingValue(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`size-8 ${
                      star <= ratingValue
                        ? "fill-amber-400 text-amber-400"
                        : "text-zinc-200 border-zinc-200"
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              placeholder="Nhập ý kiến đóng góp của bạn tại đây (không bắt buộc)..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full min-h-[100px] rounded-lg border border-zinc-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none text-neutral-800 placeholder-zinc-400"
            />
          </div>

          <DialogFooter className="m-0 flex-row justify-end gap-2 rounded-b-xl border-t border-black/[0.06] bg-[#fafafa] px-4 py-3">
            <DialogClose asChild>
              <Button variant="ghost" className="text-neutral-500 hover:text-neutral-900">Hủy</Button>
            </DialogClose>
            <Button
              className="bg-neutral-900 text-white hover:bg-neutral-800"
              onClick={() => {
                toast.success("Gửi đánh giá thành công!", {
                  description: `Cảm ơn bạn đã đánh giá ${ratingValue} sao cho dịch vụ!`
                });
                setRatingDialogOpen(false);
              }}
            >
              Gửi đánh giá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reorder Confirmation Dialog */}
      <Dialog open={reorderConfirmOpen} onOpenChange={setReorderConfirmOpen}>
        <DialogContent className="max-w-[400px] gap-0 rounded-xl border border-black/10 bg-white p-0 shadow-lg" showCloseButton={false}>
          <DialogHeader className="gap-3 px-5 pb-4 pt-5">
            <DialogTitle className="text-base font-semibold leading-6 text-neutral-900">
              Xác nhận đặt lại đơn hàng
            </DialogTitle>
            <DialogDescription className="text-sm leading-5 text-[#6b6b6b]">
              Bạn có chắc chắn muốn đặt lại đơn hàng **DH-1032** không? Các dịch vụ từ đơn hàng này sẽ được tự động thêm vào giỏ đồ của bạn.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="m-0 flex-row justify-end gap-2 rounded-b-xl border-t border-black/[0.06] bg-[#fafafa] px-4 py-3">
            <DialogClose asChild>
              <Button variant="ghost" className="text-neutral-500 hover:text-neutral-900">Hủy</Button>
            </DialogClose>
            <Button
              className="bg-neutral-900 text-white hover:bg-neutral-800"
              onClick={() => {
                toast.success("Đặt lại đơn hàng DH-1032 thành công!", {
                  description: "Các dịch vụ của đơn DH-1032 đã được thêm vào giỏ đồ của bạn."
                });
                setReorderConfirmOpen(false);
              }}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteOrderCode} onOpenChange={(open) => !open && setDeleteOrderCode(null)}>
        <DialogContent className="max-w-[400px] gap-0 rounded-xl border border-black/10 bg-white p-0 shadow-lg" showCloseButton={false}>
          <DialogHeader className="gap-3 px-5 pb-4 pt-5">
            <DialogTitle className="text-base font-semibold leading-6 text-neutral-900">
              Xác nhận hủy đơn hàng
            </DialogTitle>
            <DialogDescription className="text-sm leading-5 text-[#6b6b6b]">
              Bạn có chắc chắn muốn yêu cầu hủy đơn hàng **{deleteOrderCode}** không? Thao tác này chỉ áp dụng cho đơn hàng đang chờ xử lý và không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="m-0 flex-row justify-end gap-2 rounded-b-xl border-t border-black/[0.06] bg-[#fafafa] px-4 py-3">
            <DialogClose asChild>
              <Button variant="ghost" className="text-neutral-500 hover:text-neutral-900">Hủy</Button>
            </DialogClose>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={async () => {
                if (!deleteOrderCode) return;
                const token = localStorage.getItem("token");
                if (!token) {
                  toast.error("Vui lòng đăng nhập.");
                  return;
                }

                try {
                  const response = await fetch(`http://localhost:8000/api/orders/${deleteOrderCode}/cancel`, {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  });
                  
                  const data = await response.json();
                  if (response.ok) {
                    toast.success(`Đã hủy đơn hàng ${deleteOrderCode} thành công!`);
                    fetchOrders();
                  } else {
                    toast.error(data.detail || "Không thể hủy đơn hàng.");
                  }
                } catch (error) {
                  console.error("Error cancelling order:", error);
                  toast.error("Có lỗi xảy ra khi kết nối máy chủ.");
                } finally {
                  setDeleteOrderCode(null);
                }
              }}
            >
              Hủy đơn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Progress & Timeline Dialog */}
      <Dialog open={!!selectedTimelineOrder} onOpenChange={(open) => !open && setSelectedTimelineOrder(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-[760px] w-[95vw] max-h-[90vh] sm:max-h-[85vh] flex flex-col gap-0 rounded-xl border border-black/10 bg-white p-0 shadow-lg" showCloseButton={false}>
          <DialogHeader className="gap-3 px-5 pb-3 pt-4 border-b border-neutral-100 shrink-0">
            <DialogTitle className="text-base font-semibold leading-6 text-neutral-900 flex items-center justify-between">
              <span>Chi tiết tiến trình đơn hàng</span>
              {selectedTimelineOrder && (
                <span className="text-xs font-mono bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-md font-bold">
                  {selectedTimelineOrder.code}
                </span>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs leading-4 text-[#6b6b6b]">
              Xem trạng thái xử lý chi tiết và các mốc thời gian thực tế của đơn hàng dưới dạng bảng tiến trình.
            </DialogDescription>
          </DialogHeader>

          <div className="px-5 py-4 w-full min-w-0 overflow-y-auto flex-1 pr-4 mr-1 scrollbar-thin">
            {isDetailLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="size-8 rounded-full border-4 border-stone-200 border-t-stone-800 animate-spin" />
                <p className="text-sm text-stone-500 font-medium">Đang tải thông tin đơn hàng...</p>
              </div>
            ) : selectedTimelineOrder && selectedOrderDetail ? (
              <>
                {/* Detailed Order Panel Grid */}
                <div className="grid gap-3.5 md:grid-cols-2 mb-4">
                  {/* Left Column: Customer & Delivery Details */}
                  <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3 space-y-2">
                    <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      Thông tin giao nhận
                    </h4>
                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="text-neutral-400 block text-[9px] font-bold uppercase tracking-wide">Khách hàng</span>
                        <span className="font-semibold text-neutral-800">{selectedOrderDetail.customerName}</span>
                        {selectedOrderDetail.phone && (
                          <span className="text-neutral-500 ml-1 text-[11px]">({selectedOrderDetail.phone})</span>
                        )}
                      </div>
                      <div>
                        <span className="text-neutral-400 block text-[9px] font-bold uppercase tracking-wide">Địa chỉ nhận/giao</span>
                        <span className="font-medium text-neutral-700 text-xs leading-relaxed block mt-0.5">{selectedOrderDetail.address}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block text-[9px] font-bold uppercase tracking-wide">Ghi chú</span>
                        <span className="font-medium text-neutral-600 italic text-xs bg-white border border-neutral-100/70 rounded px-2 py-1 mt-0.5 block leading-relaxed">
                          "{selectedOrderDetail.notes || "Không có ghi chú"}"
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Items list & Payment */}
                  <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                        Chi tiết dịch vụ
                      </h4>
                      <div className="space-y-1 max-h-[90px] overflow-y-auto pr-1">
                        {selectedOrderDetail.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs border-b border-neutral-100/60 pb-0.5 last:border-0 last:pb-0">
                            <span className="text-neutral-600 font-medium truncate max-w-[200px]" title={item.name}>
                              {item.name}
                            </span>
                            <span className="text-neutral-400 text-[10px] ml-1 font-mono">({item.qty})</span>
                            <span className="font-mono text-neutral-800 font-medium ml-auto">{item.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border-t border-neutral-200/60 pt-2 mt-2 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-neutral-400 font-medium">Thanh toán:</span>
                        <span className="font-medium text-neutral-700 font-mono text-[10px] bg-neutral-100/80 px-1.5 py-0.5 rounded">{selectedOrderDetail.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-neutral-500 font-bold">Tổng thanh toán:</span>
                        <span className="text-xs font-bold text-neutral-900">{selectedTimelineOrder.total}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Quick Summary Badge Row */}
                <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs border-y border-neutral-100 py-2 px-1 bg-neutral-50/20">
                  <div className="flex items-center">
                    <span className="text-neutral-400 mr-1.5 font-medium">Mã đơn hàng:</span>
                    <span className="font-mono font-bold text-neutral-800 bg-neutral-100 px-1.5 py-0.5 rounded">{selectedTimelineOrder.code}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 mr-1.5 font-medium">Ngày đặt:</span>
                    <span className="font-semibold text-neutral-700">{selectedTimelineOrder.date}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-neutral-400 mr-1.5 font-medium">Trạng thái:</span>
                    <StatusBadge tone={selectedTimelineOrder.tone}>{selectedTimelineOrder.status}</StatusBadge>
                  </div>
                </div>

                {/* Timeline Table */}
                <div className="mt-3 border-t border-neutral-100 pt-3">
                  <h3 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                    Bảng tiến trình thực hiện
                  </h3>
                  <div className="overflow-x-auto rounded-lg border border-neutral-100 w-full">
                    <Table className="min-w-[600px] w-full">
                      <TableHeader>
                        <TableRow className="bg-[#f7f7f7] hover:bg-[#f7f7f7] h-8">
                          <TableHead className="w-[50px] text-center font-bold text-neutral-800 text-xs py-1">STT</TableHead>
                          <TableHead className="w-[140px] font-bold text-neutral-800 text-xs py-1">Giai đoạn</TableHead>
                          <TableHead className="w-[110px] font-bold text-neutral-800 text-xs py-1">Trạng thái</TableHead>
                          <TableHead className="w-[130px] font-bold text-neutral-800 text-xs py-1">Thời gian</TableHead>
                          <TableHead className="font-bold text-neutral-800 text-xs py-1">Mô tả hoạt động</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrderDetail.timeline.map((event, idx) => {
                          const getStatusConfig = (status: string) => {
                            switch (status) {
                              case "completed":
                                return { text: "Đã xong", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/50" };
                              case "current":
                                return { text: "Đang xử lý", badgeClass: "bg-amber-50 text-amber-700 border-amber-200 border-dashed animate-pulse" };
                              case "cancelled":
                                return { text: "Đã hủy", badgeClass: "bg-rose-50 text-rose-700 border-rose-200/50" };
                              default:
                                return { text: "Chờ xử lý", badgeClass: "bg-zinc-50 text-zinc-400 border-zinc-200" };
                            }
                          };

                          const config = getStatusConfig(event.status);

                          const getStageColor = (idx: number, status: string) => {
                            if (status === "pending") return "text-zinc-400 font-normal";
                            switch (idx) {
                              case 0: return "text-indigo-600 font-semibold";
                              case 1: return "text-blue-600 font-semibold";
                              case 2: return "text-amber-600 font-semibold";
                              case 3: return "text-cyan-600 font-semibold";
                              case 4: return "text-emerald-600 font-semibold";
                              default: return "text-neutral-800 font-semibold";
                            }
                          };

                          return (
                            <TableRow key={idx} className={`h-8 hover:bg-neutral-50/50 transition-colors ${event.status === "pending" ? "bg-neutral-50/30 text-zinc-400" : ""}`}>
                              <TableCell className="text-center font-mono text-xs py-1.5">
                                <span className={`inline-flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${
                                  event.status === "pending"
                                    ? "border border-zinc-200 bg-white text-zinc-400"
                                    : event.status === "cancelled"
                                    ? "bg-rose-500 text-white"
                                    : "bg-neutral-900 text-white"
                                }`}>
                                  {idx + 1}
                                </span>
                              </TableCell>
                              <TableCell className="text-xs py-1.5">
                                <span className={getStageColor(idx, event.status)}>{event.stage}</span>
                              </TableCell>
                              <TableCell className="text-xs py-1.5">
                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${config.badgeClass}`}>
                                  {config.text}
                                </span>
                              </TableCell>
                              <TableCell className="text-xs py-1.5 font-mono font-medium text-neutral-600">
                                {event.time}
                              </TableCell>
                              <TableCell className={`text-xs py-1.5 leading-relaxed ${event.status === "pending" ? "text-zinc-400/80" : "text-neutral-600"}`}>
                                {event.desc}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-stone-500 text-sm">
                Không tìm thấy chi tiết đơn hàng.
              </div>
            )}
          </div>

          <DialogFooter className="m-0 flex-row justify-end gap-2 rounded-b-xl border-t border-black/[0.06] bg-[#fafafa] px-4 py-3 shrink-0">
            <DialogClose asChild>
              <Button className="bg-neutral-900 text-white hover:bg-neutral-800" size="sm">Đóng</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

