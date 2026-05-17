"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Gift, MapPin, Phone, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Customer = {
  id: string;
  name: string;
  phone: string;
  address: string;
  points: number;
  note: string;
};

type LaundryOrder = {
  id: string;
  customerId: string;
  service: string;
  status: string;
  total: string;
  date: string;
};

const initialCustomers: Customer[] = [
  {
    id: "KH-001",
    name: "Nguyễn Minh Anh",
    phone: "0901 234 567",
    address: "25 Lê Lợi, Quận 1",
    points: 1240,
    note: "Dị ứng nước xả mạnh",
  },
  {
    id: "KH-002",
    name: "Trần Hoàng Nam",
    phone: "0912 456 789",
    address: "18 Nguyễn Đình Chiểu, Quận 3",
    points: 860,
    note: "Gấp áo sơ mi theo nếp",
  },
  {
    id: "KH-003",
    name: "Lê Thu Hà",
    phone: "0988 111 222",
    address: "92 Điện Biên Phủ, Bình Thạnh",
    points: 2100,
    note: "Ưu tiên giặt riêng đồ trẻ em",
  },
  {
    id: "KH-004",
    name: "Phạm Gia Hân",
    phone: "0933 777 888",
    address: "41 Hoa Sứ, Phú Nhuận",
    points: 540,
    note: "Nhận đồ sau 19:00",
  },
  {
    id: "KH-005",
    name: "Đỗ Quang Huy",
    phone: "0909 345 678",
    address: "12 Trần Hưng Đạo, Quận 5",
    points: 320,
    note: "Không dùng nước xả có mùi nồng, ưu tiên giao buổi sáng.",
  },
  {
    id: "KH-006",
    name: "Vũ Bảo Ngọc",
    phone: "0977 654 321",
    address: "77 Nguyễn Văn Trỗi, Phú Nhuận",
    points: 1780,
    note: "Đồ lụa cần giặt tay và đóng gói riêng từng món.",
  },
  {
    id: "KH-007",
    name: "Hoàng Đức Long",
    phone: "0966 222 333",
    address: "9 Pasteur, Quận 1",
    points: 940,
    note: "Áo vest cần treo móc, không gấp.",
  },
  {
    id: "KH-008",
    name: "Mai Thanh Tâm",
    phone: "0944 888 999",
    address: "63 Võ Văn Tần, Quận 3",
    points: 1320,
    note: "Dị ứng hóa chất tẩy mạnh. Khi xử lý vết bẩn cần gọi xác nhận trước.",
  },
  {
    id: "KH-009",
    name: "Ngô Hải Yến",
    phone: "0922 101 202",
    address: "31 Cộng Hòa, Tân Bình",
    points: 760,
    note: "Giao hàng tại quầy lễ tân tầng trệt.",
  },
  {
    id: "KH-010",
    name: "Bùi Quốc Khánh",
    phone: "0919 303 404",
    address: "120 Nguyễn Thị Minh Khai, Quận 3",
    points: 2500,
    note: "Khách VIP, ưu tiên kiểm tra kỹ trước khi bàn giao.",
  },
  {
    id: "KH-011",
    name: "Tạ Minh Châu",
    phone: "0981 505 606",
    address: "46 Phan Xích Long, Phú Nhuận",
    points: 410,
    note: "Chỉ nhận hàng sau 18:30.",
  },
  {
    id: "KH-012",
    name: "Lý Anh Khoa",
    phone: "0938 707 808",
    address: "5 Nguyễn Hữu Cảnh, Bình Thạnh",
    points: 1190,
    note: "Giặt riêng đồ thể thao, không sấy nhiệt cao.",
  },
  {
    id: "KH-013",
    name: "Phan Mỹ Linh",
    phone: "0903 909 010",
    address: "88 Lý Thường Kiệt, Quận 10",
    points: 680,
    note: "Yêu cầu đóng gói bằng túi giấy nếu có.",
  },
  {
    id: "KH-014",
    name: "Cao Nhật Minh",
    phone: "0972 121 314",
    address: "14 Ba Tháng Hai, Quận 10",
    points: 1510,
    note: "Chăn ga cần hút chân không sau khi giặt.",
  },
  {
    id: "KH-015",
    name: "Hồ Khánh Vy",
    phone: "0968 151 617",
    address: "72 Nguyễn Trãi, Quận 5",
    points: 990,
    note: "Không dùng chất tạo hương. Ghi chú này cố tình dài để kiểm tra bố cục khi nội dung nhiều: kiểm tra kỹ nhãn áo, tách riêng đồ màu trắng, báo trước nếu phát hiện sờn chỉ hoặc thiếu nút.",
  },
  {
    id: "KH-016",
    name: "Trịnh Gia Bảo",
    phone: "0955 181 920",
    address: "27 Hoàng Sa, Quận 1",
    points: 350,
    note: "Liên hệ trước khi giao 30 phút.",
  },
];

const initialOrders: LaundryOrder[] = [
  {
    id: "DH-1057",
    customerId: "KH-001",
    service: "Combo sơ mi",
    status: "Hoàn thành",
    total: "320.000đ",
    date: "17/05/2026",
  },
  {
    id: "DH-1051",
    customerId: "KH-002",
    service: "Giặt khô áo vest",
    status: "Đang xử lý",
    total: "180.000đ",
    date: "17/05/2026",
  },
  {
    id: "DH-1048",
    customerId: "KH-003",
    service: "Chăn ga 5kg",
    status: "Chờ giao",
    total: "250.000đ",
    date: "16/05/2026",
  },
  {
    id: "DH-1042",
    customerId: "KH-001",
    service: "Giặt sấy 8kg",
    status: "Hoàn thành",
    total: "210.000đ",
    date: "15/05/2026",
  },
  {
    id: "DH-1039",
    customerId: "KH-001",
    service: "Giặt khô áo dài",
    status: "Hoàn thành",
    total: "160.000đ",
    date: "14/05/2026",
  },
  {
    id: "DH-1034",
    customerId: "KH-001",
    service: "Vệ sinh giày",
    status: "Hoàn thành",
    total: "120.000đ",
    date: "12/05/2026",
  },
  {
    id: "DH-1030",
    customerId: "KH-001",
    service: "Giặt rèm cửa",
    status: "Hoàn thành",
    total: "480.000đ",
    date: "10/05/2026",
  },
  {
    id: "DH-1024",
    customerId: "KH-001",
    service: "Combo văn phòng",
    status: "Hoàn thành",
    total: "290.000đ",
    date: "08/05/2026",
  },
  {
    id: "DH-1020",
    customerId: "KH-001",
    service: "Tẩy vết bẩn áo trắng",
    status: "Hoàn thành",
    total: "90.000đ",
    date: "06/05/2026",
  },
  {
    id: "DH-1015",
    customerId: "KH-001",
    service: "Giặt hấp áo khoác",
    status: "Hoàn thành",
    total: "220.000đ",
    date: "03/05/2026",
  },
  {
    id: "DH-1054",
    customerId: "KH-005",
    service: "Giặt sấy 5kg",
    status: "Đang xử lý",
    total: "135.000đ",
    date: "17/05/2026",
  },
  {
    id: "DH-1053",
    customerId: "KH-006",
    service: "Giặt tay đồ lụa",
    status: "Chờ giao",
    total: "260.000đ",
    date: "17/05/2026",
  },
  {
    id: "DH-1052",
    customerId: "KH-008",
    service: "Tẩy vết bẩn",
    status: "Đang xử lý",
    total: "95.000đ",
    date: "17/05/2026",
  },
  {
    id: "DH-1045",
    customerId: "KH-010",
    service: "Giặt khô vest",
    status: "Hoàn thành",
    total: "300.000đ",
    date: "15/05/2026",
  },
  {
    id: "DH-1041",
    customerId: "KH-012",
    service: "Giặt đồ thể thao",
    status: "Hoàn thành",
    total: "170.000đ",
    date: "14/05/2026",
  },
  {
    id: "DH-1037",
    customerId: "KH-015",
    service: "Giặt sơ mi",
    status: "Hoàn thành",
    total: "145.000đ",
    date: "13/05/2026",
  },
];

const CUSTOMERS_PER_PAGE = 10;

export default function CustomersPage() {
  const [customers] = useState<Customer[]>(initialCustomers);
  const [orders] = useState<LaundryOrder[]>(initialOrders);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const selectedCustomer =
    customers.find((customer) => customer.id === selectedCustomerId) ?? null;

  const filteredCustomers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return customers;
    }

    return customers.filter((customer) =>
      [customer.id, customer.name, customer.phone, customer.address, customer.note]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [customers, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / CUSTOMERS_PER_PAGE));
  const activePage = Math.min(currentPage, totalPages);
  const pageStartIndex = (activePage - 1) * CUSTOMERS_PER_PAGE;
  const visibleCustomers = filteredCustomers.slice(
    pageStartIndex,
    pageStartIndex + CUSTOMERS_PER_PAGE
  );
  const resultStart = filteredCustomers.length ? pageStartIndex + 1 : 0;
  const resultEnd = Math.min(pageStartIndex + visibleCustomers.length, filteredCustomers.length);

  const selectedOrders = useMemo(
    () => orders.filter((order) => order.customerId === selectedCustomer?.id),
    [orders, selectedCustomer?.id]
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 pb-10 sm:px-6 lg:px-8">
      <header className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,_#ffffff_0%,_#f8fbff_55%,_#eff6ff_100%)] p-6 shadow-sm ring-1 ring-white/70">
        <Badge className="mb-3 rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 ring-1 ring-blue-100 hover:bg-blue-50">
          Quản lý khách hàng
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Hồ sơ khách hàng
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          Quản lý tên, số điện thoại, địa chỉ, lịch sử đơn giặt, điểm tích lũy
          và ghi chú đặc biệt như dị ứng hóa chất hoặc yêu cầu riêng.
        </p>
      </header>

      <section>
        <Card className="overflow-hidden rounded-[22px] border-slate-200 bg-white/95 shadow-sm ring-1 ring-white/70">
          <CardHeader className="gap-3 border-b border-slate-100 bg-white lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Danh sách khách hàng</CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                Bấm vào một dòng để xem chi tiết khách hàng và lịch sử đơn đặt.
              </p>
            </div>
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
              <Input
                className="pl-9"
                placeholder="Tìm tên, số điện thoại hoặc mã khách"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="pl-4">Mã</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Điểm</TableHead>
                  <TableHead className="pr-4">Ghi chú đặc biệt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleCustomers.length ? (
                  visibleCustomers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      className={`cursor-pointer transition-colors hover:bg-blue-50/60 ${
                        selectedCustomerId === customer.id ? "bg-blue-50/80" : ""
                      }`}
                      onClick={() => setSelectedCustomerId(customer.id)}
                    >
                      <TableCell className="pl-4 font-semibold text-slate-900">{customer.id}</TableCell>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1">
                          <Phone className="size-3.5 text-blue-600" />
                          {customer.phone}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3.5 text-blue-600" />
                          {customer.address}
                        </span>
                      </TableCell>
                      <TableCell>{customer.points.toLocaleString("vi-VN")} điểm</TableCell>
                      <TableCell className="pr-4 text-slate-500">{customer.note}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-28 text-center text-slate-500">
                      Không tìm thấy khách hàng phù hợp.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter className="bg-white">
                <TableRow className="hover:bg-white">
                  <TableCell colSpan={6} className="px-4 py-3">
                    <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                      <span>
                        Hiển thị {resultStart}-{resultEnd} trong tổng {filteredCustomers.length} khách hàng
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={activePage === 1}
                          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                        >
                          <ChevronLeft className="size-4" />
                          Trước
                        </button>
                        <span className="min-w-20 text-center font-medium text-slate-700">
                          {activePage}/{totalPages}
                        </span>
                        <button
                          type="button"
                          className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={activePage === totalPages}
                          onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                        >
                          Sau
                          <ChevronRight className="size-4" />
                        </button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
      </section>

      {selectedCustomer ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <Badge className="mb-2 rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 ring-1 ring-blue-100 hover:bg-blue-50">
                  {selectedCustomer.id}
                </Badge>
                <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                  {selectedCustomer.name}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Chi tiết khách hàng và lịch sử đơn đặt
                </p>
              </div>
              <button
                type="button"
                aria-label="Đóng chi tiết khách hàng"
                className="inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
                onClick={() => setSelectedCustomerId(null)}
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 gap-5 overflow-hidden p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr]">
              <Card className="self-start rounded-[20px] border-slate-200 bg-slate-50/60 shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">Thông tin khách hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-medium uppercase text-slate-400">Số điện thoại</p>
                      <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-slate-900">
                        <Phone className="size-4 text-blue-600" />
                        {selectedCustomer.phone}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-medium uppercase text-slate-400">Điểm tích lũy</p>
                      <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-slate-900">
                        <Gift className="size-4 text-blue-600" />
                        {selectedCustomer.points.toLocaleString("vi-VN")} điểm
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-medium uppercase text-slate-400">Địa chỉ</p>
                    <p className="mt-2 inline-flex items-start gap-2 text-sm font-medium text-slate-900">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-blue-600" />
                      {selectedCustomer.address}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                    <p className="text-xs font-medium uppercase text-blue-500">Ghi chú đặc biệt</p>
                    <div className="mt-2 min-h-32 rounded-xl border border-blue-100 bg-white/80 p-3 text-sm font-medium leading-6 text-blue-900 shadow-inner">
                      {selectedCustomer.note}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="flex min-h-0 flex-col rounded-[20px] border-slate-200 bg-white shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">Lịch sử đơn đặt</CardTitle>
                  <p className="text-sm text-slate-500">
                    Các đơn giặt đã ghi nhận cho khách hàng này.
                  </p>
                </CardHeader>
                <CardContent className="min-h-0 flex-1">
                  <div className="h-full min-h-56 space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/70 p-3 shadow-inner">
                  {selectedOrders.length ? (
                    selectedOrders.map((order) => (
                      <div
                        key={order.id}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-950">{order.id}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              {order.service} · {order.date}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 ring-1 ring-blue-100"
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
                          Tổng tiền: {order.total}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-5 text-sm text-slate-500">
                      Khách hàng này chưa có lịch sử đơn đặt.
                    </div>
                  )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
