"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Search,
  Star,
  Plus,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Pencil,
  Trash2,
  Clock,
  EyeOff,
  History,
  Kanban,
  Table2,
  List,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "../_components/dashboard-primitives";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import { formatRange, normalizeRange } from "@/src/utils/dashboard-time";

type Customer = {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpend: number;
  points: number;
  rank: string;
  note: string;
  email: string;
  birthday: string;
  createdAt?: string;
};

const seedCustomers: Customer[] = [
  { id: "KH-101", name: "Nguyễn Thị Hương", phone: "0903123456", address: "12 Trần Phú, Q.1, TP.HCM", totalOrders: 28, totalSpend: 6800000, points: 2400, rank: "Vàng", note: "Dị ứng hóa chất mạnh", email: "huong.nguyen@example.com", birthday: "1995-08-12", createdAt: "2026-05-29" },
  { id: "KH-102", name: "Trần Văn Minh", phone: "0912456789", address: "90 Lý Thường Kiệt, Q.5, TP.HCM", totalOrders: 17, totalSpend: 4200000, points: 1200, rank: "Bạc", note: "Giao sau 18h", email: "minh.tran@example.com", birthday: "1990-11-20", createdAt: "2026-05-22" },
  { id: "KH-103", name: "Phạm Thị Lan", phone: "0938123456", address: "18 Nguyễn Du, Q.3, TP.HCM", totalOrders: 12, totalSpend: 2900000, points: 860, rank: "Thường", note: "Không dùng nước xả", email: "lan.pham@example.com", birthday: "1998-03-05", createdAt: "2026-05-15" },
  { id: "KH-104", name: "Công ty ABC", phone: "0283812345", address: "55 Pasteur, Q.1, TP.HCM", totalOrders: 45, totalSpend: 18600000, points: 4800, rank: "Kim cương", note: "Xuất hóa đơn cuối tháng", email: "contact@abc.com", birthday: "2010-05-15", createdAt: "2026-05-10" },
  { id: "KH-105", name: "Lê Văn Nam", phone: "0967111222", address: "45 Lê Lợi, Q.1, TP.HCM", totalOrders: 5, totalSpend: 1200000, points: 300, rank: "Thường", note: "Gọi trước khi giao 30p", email: "nam.le@example.com", birthday: "1993-04-22", createdAt: "2026-05-29" },
  { id: "KH-106", name: "Hoàng Thị Mai", phone: "0988333444", address: "112 Cách Mạng Tháng 8, Q.3, TP.HCM", totalOrders: 20, totalSpend: 5400000, points: 1800, rank: "Vàng", note: "Giặt sấy nước ấm", email: "mai.hoang@example.com", birthday: "1987-12-01", createdAt: "2026-05-28" },
  { id: "KH-107", name: "Đỗ Minh Khang", phone: "0909555666", address: "33 Nguyễn Thị Minh Khai, Q.1, TP.HCM", totalOrders: 8, totalSpend: 2100000, points: 600, rank: "Bạc", note: "Không lấy móc nhựa", email: "khang.do@example.com", birthday: "1996-09-18", createdAt: "2026-05-28" },
  { id: "KH-108", name: "Phan Thanh Sơn", phone: "0918777888", address: "88 Điện Biên Phủ, Bình Thạnh, TP.HCM", totalOrders: 32, totalSpend: 9200000, points: 3100, rank: "Vàng", note: "Khách VIP, giặt hấp vest", email: "son.phan@example.com", birthday: "1982-07-14", createdAt: "2026-05-27" },
  { id: "KH-109", name: "Vũ Thị Hồng", phone: "0934999000", address: "202 Võ Văn Tần, Q.3, TP.HCM", totalOrders: 14, totalSpend: 3100000, points: 950, rank: "Bạc", note: "Đồ em bé giặt riêng", email: "hong.vu@example.com", birthday: "1991-02-28", createdAt: "2026-05-26" },
  { id: "KH-110", name: "Bùi Anh Tuấn", phone: "0977222333", address: "15 Trần Hưng Đạo, Q.5, TP.HCM", totalOrders: 6, totalSpend: 1550000, points: 450, rank: "Thường", note: "Chỉ nhận hàng buổi sáng", email: "tuan.bui@example.com", birthday: "1994-06-10", createdAt: "2026-05-25" },
  { id: "KH-111", name: "Lâm Mỹ Dung", phone: "0902888999", address: "64 Đồng Khởi, Q.1, TP.HCM", totalOrders: 50, totalSpend: 22000000, points: 5500, rank: "Kim cương", note: "Đơn giặt là cao cấp", email: "dung.lam@example.com", birthday: "1989-10-05", createdAt: "2026-05-24" },
  { id: "KH-112", name: "Ngô Quốc Bảo", phone: "0915666777", address: "123 Lê Hồng Phong, Q.10, TP.HCM", totalOrders: 11, totalSpend: 2450000, points: 700, rank: "Bạc", note: "Không dùng hóa chất tẩy mạnh", email: "bao.ngo@example.com", birthday: "1992-05-15", createdAt: "2026-05-20" }
];

const rankColor: Record<string, { text: string; bg: string }> = {
  "Kim cương": { text: "#db2777", bg: "rgba(219,39,119,0.08)" },
  "Vàng": { text: "#d97706", bg: "rgba(217,119,6,0.08)" },
  "Bạc": { text: "#475569", bg: "rgba(71,85,105,0.08)" },
  "Thường": { text: "#2563eb", bg: "rgba(37,99,235,0.08)" },
};

const allRankColor = "#0f766e";
const allRankBgColor = "rgba(15,118,110,0.09)";

const pageSize = 10;

const formatBirthday = (dateStr?: string) => {
  if (!dateStr) return "-";
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
};

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  birthday: "",
  address: "",
  note: "",
  rank: "Thường",
  points: "0",
  totalOrders: "0",
  totalSpend: "0",
  createdAt: "",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(seedCustomers);
  const [query, setQuery] = useState("");
  const [selectedRank, setSelectedRank] = useState<string | "Tất cả">("Tất cả");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(seedCustomers[0]);
  const [page, setPage] = useState(1);
  const [openForm, setOpenForm] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const range = useDashboardTimeRangeStore((state) => state.range);
  const rangeLabel = formatRange(normalizeRange(range));

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const source = `${c.name} ${c.phone} ${c.address} ${c.email}`;
      const matchQuery = source.toLowerCase().includes(query.toLowerCase());
      const matchRank = selectedRank === "Tất cả" || c.rank === selectedRank;
      return matchQuery && matchRank;
    });
  }, [customers, query, selectedRank]);

  const pageCount = Math.ceil(filteredCustomers.length / pageSize);
  const paginatedCustomers = filteredCustomers.slice((page - 1) * pageSize, page * pageSize);

  const openCreateForm = () => {
    setEditingCustomerId(null);
    setForm({ ...emptyForm, createdAt: new Date().toISOString().slice(0, 10) });
    setOpenForm(true);
  };

  const openEditForm = (c: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCustomerId(c.id);
    setForm({
      name: c.name,
      phone: c.phone,
      email: c.email,
      birthday: c.birthday,
      address: c.address,
      note: c.note,
      rank: c.rank,
      points: String(c.points),
      totalOrders: String(c.totalOrders),
      totalSpend: String(c.totalSpend),
      createdAt: c.createdAt || new Date().toISOString().slice(0, 10),
    });
    setOpenForm(true);
  };

  const deleteCustomer = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    if (selectedCustomer.id === id) {
      const remaining = customers.filter((c) => c.id !== id);
      if (remaining.length > 0) setSelectedCustomer(remaining[0]);
    }
    setPage(1);
  };

  const saveCustomer = () => {
    if (!form.name.trim() || !form.phone.trim()) return;

    const payload: Omit<Customer, "id"> = {
      name: form.name,
      phone: form.phone,
      email: form.email || "khachhang@example.com",
      birthday: form.birthday || new Date().toISOString().slice(0, 10),
      address: form.address,
      note: form.note || "Không có",
      rank: form.rank,
      points: Number(form.points) || 0,
      totalOrders: Number(form.totalOrders) || 0,
      totalSpend: Number(form.totalSpend) || 0,
      createdAt: form.createdAt || new Date().toISOString().slice(0, 10),
    };

    if (editingCustomerId) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === editingCustomerId ? { ...c, ...payload } : c
        )
      );
      const updatedCustomer = { id: editingCustomerId, ...payload };
      if (selectedCustomer.id === editingCustomerId) setSelectedCustomer(updatedCustomer);
    } else {
      const newId = `KH-${Date.now().toString().slice(-3)}`;
      const newCustomer = { id: newId, ...payload };
      setCustomers((prev) => [newCustomer, ...prev]);
      setSelectedCustomer(newCustomer);
    }

    setPage(1);
    setOpenForm(false);
  };

  return (
    <PageShell fullHeight>
      <div className="flex min-h-0 flex-1 flex-col">
        {/* ════════════ MAIN TABLE CONTAINER ════════════ */}
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-white">
          
          {/* ── Top Toolbar ── */}
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 pt-1 pb-3 xl:flex-row xl:items-center xl:justify-between">
            {/* Left: View Tabs */}
            <div className="flex items-center gap-1">
              {([
                ["Bảng", Table2],
                ["Bảng kéo", Kanban],
                ["Danh sách", List],
              ] as const).map(([label, Icon]) => (
                <button
                  key={label}
                  type="button"
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    label === "Bảng"
                      ? "text-slate-800"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Right: Search & Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[220px] flex-1 xl:w-64 xl:flex-none">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
                <Input
                  className="h-8 rounded-md border-slate-200 bg-white pl-8 text-xs text-slate-700 shadow-none placeholder:text-slate-500 focus-visible:ring-slate-200"
                  placeholder="Tìm tên, SĐT, địa chỉ..."
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs text-slate-700 transition-colors hover:bg-slate-50">
                <EyeOff className="size-3.5" />
                Ẩn cột
              </button>
              <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs text-slate-700 transition-colors hover:bg-slate-50">
                <History className="size-3.5" />
                Lịch sử
              </button>
              <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-slate-50">
                Xuất file
              </button>
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                onClick={openCreateForm}
              >
                Thêm khách
                <ChevronDown className="size-3.5" />
              </button>
            </div>
          </div>

          {/* ── Filter Pills ── */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-5 py-3">
            <button type="button" className="inline-flex h-7 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 text-xs text-slate-700 transition-colors hover:bg-slate-50">
              <Star className="size-3.5" />
              {selectedRank}
              <ChevronDown className="size-3.5" />
            </button>
            <button type="button" className="inline-flex h-7 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 text-xs text-slate-700 transition-colors hover:bg-slate-50">
              <Clock className="size-3.5" />
              {rangeLabel}
              <ChevronDown className="size-3.5" />
            </button>
            <button type="button" className="inline-flex h-7 items-center gap-1.5 px-2 text-xs text-slate-500 transition-colors hover:text-slate-700">
              <Plus className="size-3.5" />
              Thêm bộ lọc
            </button>
            <div className="ml-auto hidden flex-wrap gap-1.5 2xl:flex">
              {["Tất cả", "Kim cương", "Vàng", "Bạc", "Thường"].map((rank) => {
                const active = selectedRank === rank;
                const isAll = rank === "Tất cả";
                const activeColor = isAll ? allRankColor : rankColor[rank].text;
                const activeBgColor = isAll ? allRankBgColor : rankColor[rank].bg;

                return (
                  <button
                    key={rank}
                    type="button"
                    onClick={() => {
                      setSelectedRank(rank);
                      setPage(1);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-all hover:bg-slate-50"
                    style={
                      active
                        ? { color: activeColor, backgroundColor: activeBgColor }
                        : { color: "#64748b", backgroundColor: "transparent" }
                    }
                  >
                    <span
                      className="inline-block size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: active ? activeColor : "#cbd5e1" }}
                    />
                    {rank}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Table Container ── */}
          <div className="flex-1 overflow-auto">
            <Table className="w-full table-fixed text-xs [&_td:not(:first-child)]:border-l [&_td:not(:first-child)]:border-slate-100">
              <TableHeader>
                <TableRow className="h-9 border-b border-slate-100 bg-slate-50 hover:bg-slate-50">
                  <TableHead className="w-[208px] pl-4 text-xs font-medium text-slate-600">
                    <span className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        aria-label="Chọn tất cả khách hàng"
                        className="relative size-4 appearance-none rounded-[5px] border border-slate-300 bg-white transition-all duration-150 checked:border-slate-900 checked:bg-slate-900 after:absolute after:left-[4.5px] after:top-[1px] after:hidden after:h-[9px] after:w-[5px] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:content-[''] checked:after:block"
                      />
                      Tên khách hàng
                    </span>
                  </TableHead>
                  <TableHead className="w-[176px] border-l border-slate-100 text-xs font-medium text-slate-600">Email</TableHead>
                  <TableHead className="w-[112px] border-l border-slate-100 text-xs font-medium text-slate-600">Số điện thoại</TableHead>
                  <TableHead className="w-[190px] border-l border-slate-100 text-xs font-medium text-slate-600">Địa chỉ</TableHead>
                  <TableHead className="w-[82px] border-l border-slate-100 text-xs font-medium text-slate-600">Tổng đơn</TableHead>
                  <TableHead className="w-[112px] border-l border-slate-100 text-xs font-medium text-slate-600">Chi tiêu</TableHead>
                  <TableHead className="w-[76px] border-l border-slate-100 text-xs font-medium text-slate-600">Điểm</TableHead>
                  <TableHead className="w-[92px] border-l border-slate-100 text-xs font-medium text-slate-600">Hạng</TableHead>
                  <TableHead className="w-[92px] border-l border-slate-100 text-xs font-medium text-slate-600">Ngày sinh</TableHead>
                  <TableHead className="w-[150px] border-l border-slate-100 text-xs font-medium text-slate-600">Ghi chú</TableHead>
                  <TableHead className="w-[150px] border-l border-slate-100 px-4 text-left text-xs font-medium text-slate-600">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11}>
                      <div className="grid min-h-[300px] place-items-center text-sm text-slate-400">
                        Không tìm thấy khách hàng phù hợp.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCustomers.map((c) => (
                    <TableRow
                      key={c.id}
                      className={`group h-9 cursor-pointer border-b border-slate-100 text-slate-700 transition-colors ${
                        selectedCustomer.id === c.id ? "bg-slate-50/80 hover:bg-slate-50" : "hover:bg-slate-50/60"
                      }`}
                      onClick={() => setSelectedCustomer(c)}
                    >
                      {/* Name */}
                      <TableCell className="pl-4">
                        <div className="flex min-w-0 items-center gap-2">
                          <input
                            type="checkbox"
                            aria-label={`Chọn ${c.name}`}
                            className="relative size-4 appearance-none rounded-[5px] border border-slate-300 bg-white transition-all duration-150 checked:border-slate-900 checked:bg-slate-900 after:absolute after:left-[4.5px] after:top-[1px] after:hidden after:h-[9px] after:w-[5px] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:content-[''] checked:after:block"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Image
                            src="/default_avatar.jfif"
                            alt={c.name}
                            width={28}
                            height={28}
                            className="size-6 shrink-0 rounded-full object-cover"
                          />
                          <span className="whitespace-nowrap font-medium text-slate-900">
                            {c.name}
                          </span>
                        </div>
                      </TableCell>

                      {/* Email */}
                      <TableCell className="text-slate-500 truncate max-w-[140px]">
                        {c.email}
                      </TableCell>

                      {/* Phone */}
                      <TableCell>
                        <a href={`tel:${c.phone}`} className="text-slate-500 transition-colors hover:text-slate-800" onClick={(e) => e.stopPropagation()}>
                          {c.phone}
                        </a>
                      </TableCell>

                      {/* Address */}
                      <TableCell className="text-slate-600 truncate max-w-[150px]">{c.address}</TableCell>

                      {/* Total Orders */}
                      <TableCell className="text-slate-600 font-medium">{c.totalOrders} đơn</TableCell>

                      {/* Spending */}
                      <TableCell className="text-slate-900 font-medium">{c.totalSpend.toLocaleString("vi-VN")}đ</TableCell>

                      {/* Points */}
                      <TableCell className="text-slate-500 font-medium">{c.points.toLocaleString("vi-VN")}</TableCell>

                      {/* Rank */}
                      <TableCell>
                        <span
                          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium"
                          style={{
                            color: rankColor[c.rank]?.text || "#475569",
                            backgroundColor: rankColor[c.rank]?.bg || "rgba(71,85,105,0.08)",
                          }}
                        >
                          <span
                            className="inline-block size-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: rankColor[c.rank]?.text || "#475569" }}
                          />
                          {c.rank}
                        </span>
                      </TableCell>

                      {/* Birthday */}
                      <TableCell className="text-slate-500">{formatBirthday(c.birthday)}</TableCell>

                      {/* Note */}
                      <TableCell className="text-slate-500 truncate max-w-[180px]">{c.note || "-"}</TableCell>

                      {/* Actions */}
                      <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-start gap-1.5">
                          <button
                            type="button"
                            className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50"
                            onClick={(e) => openEditForm(c, e)}
                            title="Chỉnh sửa"
                          >
                            <Pencil className="size-3.5" />
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600"
                            onClick={(e) => deleteCustomer(c.id, e)}
                            title="Xóa"
                          >
                            <Trash2 className="size-3.5" />
                            Xóa
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}

                {/* empty filler rows */}
                {paginatedCustomers.length > 0 && paginatedCustomers.length < pageSize &&
                  Array.from({ length: pageSize - paginatedCustomers.length }).map((_, i) => (
                    <TableRow key={`empty-${i}`} className="border-b border-slate-100">
                      <TableCell className="pl-4">
                        <input type="checkbox" disabled className="size-4 opacity-0" />
                      </TableCell>
                      {Array.from({ length: 10 }).map((_, j) => (
                        <TableCell key={j}>&nbsp;</TableCell>
                      ))}
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </div>

          {/* ── Pagination Footer ── */}
          <div className="border-t border-slate-200 px-5 pt-3 pb-1">
            <div className="flex flex-col gap-3 text-xs text-slate-700 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <span>Số khách hàng mỗi trang</span>
                <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 px-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50">
                  {pageSize}
                  <ChevronDown className="size-3.5" />
                </button>
                <span className="text-slate-400">
                  {filteredCustomers.length === 0 ? 0 : (page - 1) * pageSize + 1}–
                  {Math.min(page * pageSize, filteredCustomers.length)} trong {filteredCustomers.length} khách hàng
                </span>
              </div>

              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 disabled:opacity-40"
                  disabled={page <= 1}
                  onClick={() => setPage(1)}
                >
                  <ChevronsLeft className="size-4" />
                </button>
                <button
                  type="button"
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 disabled:opacity-40"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(current - 1, 1))}
                >
                  <ChevronDown className="size-4 rotate-90" />
                </button>
                <span className="px-3 text-sm font-medium text-slate-700">
                  {page} / {pageCount || 1}
                </span>
                <button
                  type="button"
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 disabled:opacity-40"
                  disabled={page >= pageCount}
                  onClick={() => setPage((current) => Math.min(current + 1, pageCount))}
                >
                  <ChevronDown className="size-4 -rotate-90" />
                </button>
                <button
                  type="button"
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 disabled:opacity-40"
                  disabled={page >= pageCount}
                  onClick={() => setPage(pageCount || 1)}
                >
                  <ChevronsRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════ MODAL: CREATE / EDIT CUSTOMER ════════════ */}
      {openForm && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-xl rounded-2xl border-0 shadow-2xl overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 px-6 py-4">
              <CardTitle className="text-base font-semibold">
                {editingCustomerId ? "Chỉnh sửa thông tin khách hàng" : "Thêm khách hàng mới"}
              </CardTitle>
              <button
                type="button"
                className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setOpenForm(false)}
              >
                <X className="size-5" />
              </button>
            </CardHeader>
            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Họ tên</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Họ và tên" />
              </div>
              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="090..." />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="khachhang@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Ngày sinh</Label>
                <Input type="date" value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Địa chỉ mặc định</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Số nhà, tên đường, quận/huyện..." />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Ghi chú đặc biệt</Label>
                <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Dị ứng hóa chất, giờ giao hàng yêu thích..." />
              </div>
              
              {editingCustomerId && (
                <>
                  <div className="space-y-2">
                    <Label>Hạng khách hàng</Label>
                    <Input value={form.rank} onChange={(e) => setForm({ ...form, rank: e.target.value })} placeholder="Thường, Bạc, Vàng, Kim cương" />
                  </div>
                  <div className="space-y-2">
                    <Label>Điểm tích lũy</Label>
                    <Input type="number" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Ngày tham gia</Label>
                    <Input type="date" value={form.createdAt} onChange={(e) => setForm({ ...form, createdAt: e.target.value })} />
                  </div>
                </>
              )}

              <Button className="md:col-span-2 mt-2 bg-slate-900 text-white hover:bg-slate-800 h-10 font-semibold rounded-lg transition-colors" onClick={saveCustomer}>
                Lưu thông tin
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </PageShell>
  );
}
