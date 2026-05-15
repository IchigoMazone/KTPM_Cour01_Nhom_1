"use client";

import React, { useMemo, useState } from "react";

import {
  Search,
  MoreHorizontal,
  Star,
  Phone,
  Mail,
  MapPin,
  Package,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

/* ============================================================================
   MOCK DATA
============================================================================ */
const customers = [
  {
    id: 1,
    name: "Nguyễn Thị Hương",
    phone: "0903123456",
    email: "huong@gmail.com",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    loyaltyPoints: 2400,
    specialNotes: ["Dị ứng hóa chất mạnh", "Giặt riêng đồ trắng"],
  },
  {
    id: 2,
    name: "Trần Văn Minh",
    phone: "0912456789",
    email: "minh@gmail.com",
    address: "45 Lê Lợi, Quận 5, TP.HCM",
    loyaltyPoints: 1200,
    specialNotes: ["Khách VIP", "Giao hàng sau 18h"],
  },
  {
    id: 3,
    name: "Phạm Thị Lan",
    phone: "0938123456",
    email: "lan@gmail.com",
    address: "89 Pasteur, Quận 3, TP.HCM",
    loyaltyPoints: 860,
    specialNotes: ["Không dùng nước xả"],
  },
];

const orders = [
  {
    id: "DH001",
    customerId: 1,
    customerName: "Nguyễn Thị Hương",
    service: "Giặt sấy cao cấp",
    createdAt: "08:30 01/05/2026",
    completedAt: "17:00 01/05/2026",
    note: "Giao trước 18h",
    date: "2026-05-01",
    quantity: 5,
    total: 250000,
    status: "Hoàn thành",
    items: [
      { name: "Áo sơ mi", quantity: 3, price: 30000 },
      { name: "Quần tây", quantity: 2, price: 40000 },
    ],
  },
  {
    id: "DH002",
    customerId: 1,
    customerName: "Nguyễn Thị Hương",
    service: "Giặt nhanh",
    createdAt: "09:00 26/04/2026",
    completedAt: "Đang xử lý",
    note: "Không dùng nước xả",
    date: "2026-04-26",
    quantity: 3,
    total: 180000,
    status: "Đang xử lý",
    items: [
      { name: "Áo hoodie", quantity: 1, price: 80000 },
      { name: "Quần jean", quantity: 2, price: 50000 },
    ],
  },
  {
    id: "DH003",
    customerId: 2,
    customerName: "Trần Văn Minh",
    service: "Giặt hấp",
    createdAt: "10:30 02/05/2026",
    completedAt: "16:00 02/05/2026",
    note: "Khách VIP",
    date: "2026-05-02",
    quantity: 7,
    total: 420000,
    status: "Hoàn thành",
    items: [
      { name: "Vest", quantity: 2, price: 120000 },
      { name: "Sơ mi", quantity: 5, price: 36000 },
    ],
  },
  {
    id: "DH004",
    customerId: 3,
    customerName: "Phạm Thị Lan",
    service: "Giặt thường",
    createdAt: "13:00 03/05/2026",
    completedAt: "Đang giao",
    note: "Không dùng nước xả",
    date: "2026-05-03",
    quantity: 2,
    total: 120000,
    status: "Đang giao",
    items: [{ name: "Đầm", quantity: 2, price: 60000 }],
  },
];

const ITEMS_PER_PAGE = 10;

export default function CustomerPage() {
  /* ---------- State ---------- */
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null,
  );
  const [openCustomerDetail, setOpenCustomerDetail] = useState(false);

  /* ---------- Derived data ---------- */
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const customerOrders = orders.filter(
    (o) => o.customerId === selectedCustomerId,
  );

  const orderCountByCustomer = useMemo(() => {
    const map: Record<number, number> = {};
    orders.forEach((o) => (map[o.customerId] = (map[o.customerId] || 0) + 1));
    return map;
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery),
    );
  }, [searchQuery]);

  const visibleCustomers = filteredCustomers.slice(0, ITEMS_PER_PAGE);

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <div className="mx-auto p-6">
        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Quản lý khách hàng
            </h1>
            <p className="mt-2 text-slate-500">
              Quản lý hồ sơ khách hàng và lịch sử đơn giặt
            </p>
          </div>
        </div>

        <Card className="overflow-hidden rounded-[20px] border-0 bg-white ">
          {/* TOP */}
          <div className="flex items-center justify-between border-b border-gray-200 px-8 py-7">
            {/* SEARCH */}
            <div className="relative w-[360px]">
              <Search className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm kiếm khách hàng..."
                className="h-12 rounded-2xl border-slate-200 bg-slate-50 pl-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 bg-slate-50/60 hover:bg-slate-50/60">
                  <TableHead className="px-8 py-5">Khách hàng</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Điểm</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>

              <TableBody>
                {visibleCustomers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="border-b border-gray-200 transition-all hover:bg-slate-50/70"
                  >
                    {/* CUSTOMER */}
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="">{customer.name}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* PHONE */}
                    <TableCell className="font-medium text-slate-700">
                      {customer.phone}
                    </TableCell>

                    {/* ADDRESS */}
                    <TableCell className="text-slate-900">
                      {customer.address}
                    </TableCell>

                    <TableCell className="font-medium text-slate-900">
                      {customer.loyaltyPoints}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {customer.specialNotes.map((note, index) => (
                          <Badge
                            key={index}
                            className="rounded-full bg-slate-100 px-4 py-1.5 text-slate-700 hover:bg-slate-100"
                          >
                            {note}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>

                    {/* ACTION */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl"
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                          align="end"
                          className="w-44 rounded-2xl"
                        >
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCustomerId(customer.id);
                              setOpenCustomerDetail(true);
                            }}
                          >
                            Xem chi tiết
                          </DropdownMenuItem>

                          <DropdownMenuItem className="text-red-500">
                            Xóa khách hàng
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

              <TableFooter>
                <TableRow>
                  <TableCell rowSpan={7} className="flex justify-between items-center">
                    <span>hiển thị 10/20</span>
                    <div>
                      <Button className="px-2 py-2">
                        <ArrowLeft size={18}></ArrowLeft>
                      </Button>
                      <Button className="px-2 py-2">
                        <ArrowRight size={18}></ArrowRight>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>

        {selectedCustomer && openCustomerDetail && (
          <div className="fixed left-1/2 top-20 z-50 h-[80%] w-[90%] -translate-x-1/2 overflow-hidden rounded-[40px] border border-slate-200 bg-[#f4f7fb] shadow-xl">
            <Card className="h-full rounded-[40px] border border-slate-200 bg-white shadow-sm">
              <div className="grid h-full grid-cols-[380px_1fr]">
                {/* LEFT INFO */}
                <div className="border-r border-slate-100 bg-slate-50/50 p-8">
                  {/* PROFILE */}
                  <div className="flex items-center gap-5">
                    <Avatar className="h-24 w-24 rounded-3xl shadow-sm">
                      <AvatarFallback className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-700 text-3xl font-bold text-white">
                        {selectedCustomer.name
                          .split(" ")
                          .slice(-2)
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {selectedCustomer.name}
                      </h2>
                      <p className="text-slate-500">Khách hàng thân thiết</p>

                      <div className="mt-1 flex flex-wrap gap-2">
                        <Badge className="rounded-full bg-slate-900 px-4 py-1.5 text-white hover:bg-slate-900">
                          {selectedCustomer.loyaltyPoints} điểm
                        </Badge>
                        <Badge className="rounded-full bg-slate-200 px-4 py-1.5 text-slate-700 hover:bg-slate-200">
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          {customerOrders.length} đơn
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* CONTACT + NOTES */}
                  <div className="mt-10 space-y-6">
                    {/* PHONE */}
                    <InfoBlock icon={Phone} label="Số điện thoại">
                      {selectedCustomer.phone}
                    </InfoBlock>
                    {/* EMAIL */}
                    <InfoBlock icon={Mail} label="Email">
                      {selectedCustomer.email}
                    </InfoBlock>
                    {/* ADDRESS */}
                    <InfoBlock icon={MapPin} label="Địa chỉ">
                      {selectedCustomer.address}
                    </InfoBlock>
                    {/* NOTES */}
                    <InfoBlock icon={Package} label="Ghi chú đặc biệt">
                      <div className="flex flex-wrap gap-3">
                        {selectedCustomer.specialNotes.map((note, idx) => (
                          <Badge
                            key={idx}
                            className="rounded-full bg-red-50 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            {note}
                          </Badge>
                        ))}
                      </div>
                    </InfoBlock>
                  </div>
                </div>

                {/* RIGHT CONTENT – ORDER HISTORY */}
                <div className="h-full flex flex-col ">
                  {/* HEADER */}
                  <div className="flex items-center justify-between border-b border-slate-100 px-8 py-7">
                    <div>
                      <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                        Lịch sử đơn hàng
                      </h2>
                      <p className="mt-2 text-slate-500">
                        Theo dõi toàn bộ đơn giặt của khách hàng
                      </p>
                    </div>
                    {/* SEARCH IN ORDERS (placeholder) */}
                    <div className="relative w-[340px]">
                      <Search className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Tìm mã đơn..."
                        className="h-12 rounded-2xl border-slate-200 bg-slate-50 pl-11"
                      />
                    </div>
                  </div>

                  {/* ORDER TABLE */}
                  <div className="flex-1 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-slate-100 bg-slate-50 hover:bg-slate-50">
                          <TableHead className="px-8 py-5">Mã đơn</TableHead>
                          <TableHead>Dịch vụ</TableHead>
                          <TableHead>Ngày tạo</TableHead>
                          <TableHead>Tổng tiền</TableHead>
                          <TableHead>Trạng thái</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {customerOrders.map((order) => (
                          <TableRow
                            key={order.id}
                            className="cursor-pointer border-b border-slate-100 transition-all hover:bg-slate-50/70"
                          >
                            <TableCell className="px-8 py-6">
                              <p className="font-semibold text-slate-900">
                                {order.id}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                {order.quantity} sản phẩm
                              </p>
                            </TableCell>

                            <TableCell>
                              <p className="font-medium text-slate-900">
                                {order.service}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                {order.createdAt}
                              </p>
                            </TableCell>

                            <TableCell className="text-slate-600">
                              {order.date}
                            </TableCell>

                            <TableCell>
                              <p className="text-sm font-semibold text-slate-900">
                                {order.total.toLocaleString()}đ
                              </p>
                            </TableCell>

                            <TableCell>
                              <Badge
                                className={
                                  order.status === "Hoàn thành"
                                    ? "rounded-full bg-green-100 px-4 py-2 text-green-700 hover:bg-green-100"
                                    : "rounded-full bg-yellow-100 px-4 py-2 text-yellow-700 hover:bg-yellow-100"
                                }
                              >
                                {order.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   SMALL SUB-COMPONENTS
============================================================================ */
function InfoBlock({
  icon: Icon,
  label,
  children,
}: {
  icon: any;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 text-slate-500">
        <Icon className="h-5 w-5" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="mt-4 text-lg font-semibold text-slate-900">
        {children}
      </div>
    </div>
  );
}
