"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  PackageCheck,
  Wallet,
  WashingMachine,
  FlaskConical,
  StickyNote,
  Pencil,
  FileText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Area,
  AreaChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { TableCell } from "@/components/ui/table";
import { PageShell } from "./_components/dashboard-primitives";
import { Toolbar } from "./_components/toolbar";
import { FilterBar, type FilterOption } from "./_components/filter-bar";
import { TableView } from "./_components/table-view";
import { AddColumnDialog } from "./_components/add-column-dialog";
import { FormDialog, type FormField } from "./_components/form-dialog";
import { InvoiceModal } from "./orders/_components/invoice-modal";
import type { Order as LaundryOrder } from "./orders/types";
import { seedOrders, statuses, statusDotColor } from "./orders/data";
import { type DashboardTableColumn } from "@/src/components/common/dashboard-data-table";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import { addDays, formatRange, normalizeRange, shortDateFormatter } from "@/src/utils/dashboard-time";

type OrderStatus = "Tiếp nhận" | "Đang giặt" | "Kiểm tra" | "Chờ thanh toán" | "Hoàn thành" | "Quá hạn";

const latestOrderColumns: DashboardTableColumn[] = [
  { id: "id", label: "Mã đơn", width: 110, visible: true },
  { id: "customerName", label: "Khách hàng", width: 170, visible: true },
  { id: "customerType", label: "Loại khách", width: 100, visible: true },
  { id: "service", label: "Dịch vụ", width: 100, visible: true },
  { id: "weight", label: "Khối lượng", width: 100, visible: true },
  { id: "status", label: "Trạng thái", width: 130, visible: true },
  { id: "deliveryDate", label: "Ngày giao", width: 100, visible: true },
  { id: "deliveryTime", label: "Giờ giao", width: 90, visible: true },
  { id: "washer", label: "Máy giặt", width: 125, visible: true },
  { id: "dryer", label: "Máy sấy", width: 125, visible: true },
  { id: "staff", label: "Nhân viên", width: 110, visible: true },
  { id: "actions", label: "Thao tác", width: 150, visible: true },
];

const statusStyle: Record<OrderStatus, { color: string; bg: string }> = {
  "Tiếp nhận": { color: "#6366f1", bg: "rgba(99,102,241,0.08)" },
  "Đang giặt": { color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  "Kiểm tra": { color: "#8b5cf6", bg: "rgba(139,92,246,0.08)" },
  "Chờ thanh toán": { color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
  "Hoàn thành": { color: "#10b981", bg: "rgba(16,185,129,0.08)" },
  "Quá hạn": { color: "#dc2626", bg: "rgba(220,38,38,0.08)" },
};

const latestOrderStatusOptions: FilterOption[] = [
  { id: "Tất cả", label: "Tất cả", color: "#64748b", bgColor: "rgba(100,116,139,0.09)" },
  ...Object.entries(statusStyle).map(([status, style]) => ({
    id: status,
    label: status,
    color: style.color,
    bgColor: style.bg,
  })),
];

const checkboxClass =
  "relative size-4 appearance-none rounded-[5px] border border-slate-300 bg-white transition-all duration-150 checked:border-emerald-300 checked:bg-emerald-300 after:absolute after:left-1/2 after:top-1/2 after:hidden after:h-[9px] after:w-[5px] after:-translate-x-1/2 after:-translate-y-[58%] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:content-[''] checked:after:block";

const latestOrderFormFields: FormField[] = [
  { id: "customer", label: "Khách hàng", type: "text", placeholder: "Tên khách" },
  { id: "phone", label: "Số điện thoại", type: "text", placeholder: "090..." },
  { id: "service", label: "Dịch vụ", type: "text" },
  { id: "quantity", label: "Khối lượng", type: "text", placeholder: "5 kg / 3 món" },
  { id: "deliveryTime", label: "Giờ giao", type: "time" },
  { id: "createdAt", label: "Thời gian", type: "date" },
  { id: "staff", label: "Nhân viên xử lý", type: "custom_staff" },
  { id: "amount", label: "Giá tiền", type: "number" },
  { id: "status", label: "Cập nhật trạng thái", type: "custom_status" },
  { id: "note", label: "Ghi chú", type: "textarea", placeholder: "Ghi chú xử lý đơn" },
];

const latestOrders: Array<{
  id: string;
  customerName: string;
  customerType: "Mới" | "Cũ";
  service: string;
  weight: string;
  status: OrderStatus;
  deliveryDate: string;
  deliveryTime: string;
  washer: string | null;
  dryer: string | null;
  staff: string;
}> = [
  {
    id: "DH-1048",
    customerName: "Nguyễn Thị Hương",
    customerType: "Cũ",
    service: "Giặt",
    weight: "6 kg",
    status: "Kiểm tra",
    deliveryDate: "30/05",
    deliveryTime: "18:00",
    washer: "Máy giặt 01",
    dryer: null,
    staff: "Anh Minh",
  },
  {
    id: "DH-1052",
    customerName: "Trần Minh",
    customerType: "Mới",
    service: "Giặt sấy",
    weight: "8 kg",
    status: "Chờ thanh toán",
    deliveryDate: "30/05",
    deliveryTime: "19:00",
    washer: "Máy giặt 02",
    dryer: null,
    staff: "Chị Lan",
  },
  {
    id: "DH-1057",
    customerName: "Công ty ABC",
    customerType: "Cũ",
    service: "Chăn màn",
    weight: "8 kg",
    status: "Đang giặt",
    deliveryDate: "30/05",
    deliveryTime: "20:00",
    washer: "Máy giặt 02",
    dryer: null,
    staff: "Anh Minh",
  },
  {
    id: "DH-1061",
    customerName: "Shop Linen",
    customerType: "Cũ",
    service: "Giặt sấy",
    weight: "12 kg",
    status: "Tiếp nhận",
    deliveryDate: "31/05",
    deliveryTime: "21:00",
    washer: null,
    dryer: null,
    staff: "Chưa gán",
  },
  {
    id: "DH-1067",
    customerName: "Hotel Majestic",
    customerType: "Cũ",
    service: "Chăn màn",
    weight: "25 kg",
    status: "Kiểm tra",
    deliveryDate: "30/05",
    deliveryTime: "19:00",
    washer: "Máy giặt 02",
    dryer: null,
    staff: "Anh Tuấn",
  },
  {
    id: "DH-1062",
    customerName: "Lê Mai",
    customerType: "Mới",
    service: "Vệ sinh rèm",
    weight: "4 bộ",
    status: "Hoàn thành",
    deliveryDate: "30/05",
    deliveryTime: "18:30",
    washer: "Máy giặt 02",
    dryer: "Máy sấy 02",
    staff: "Chị Lan",
  },
];

const machines = [
  { name: "Máy giặt 01", type: "Máy giặt", status: "Đang chạy", detail: "Còn 42 phút", progress: 68, color: "#3b82f6", customer: "Chị Hương (DH-1078)" },
  { name: "Máy giặt 02", type: "Máy giặt", status: "Rảnh", detail: "Sẵn sàng nhận mẻ", progress: 0, color: "#10b981", customer: null },
  { name: "Máy sấy 01", type: "Máy sấy", status: "Đang chạy", detail: "Còn 18 phút", progress: 82, color: "#f59e0b", customer: "Anh Minh (DH-1077)" },
  { name: "Máy sấy 02", type: "Máy sấy", status: "Bảo trì", detail: "Kiểm tra nhiệt", progress: 35, color: "#ef4444", customer: null },
];

const todayMix = [
  { name: "Hoàn thành", value: 22, color: "#10b981" },
  { name: "Đang xử lý", value: 18, color: "#f59e0b" },
  { name: "Quá hạn", value: 4, color: "#f43f5e" },
  { name: "Mới", value: 4, color: "#3b82f6" },
];

function formatCurrency(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}tr`;
  }

  return value.toLocaleString("vi-VN");
}

function buildRevenue7Days() {
  const today = new Date();
  const start = addDays(today, -6);

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index);
    const base = 5200000 + ((index + 3) % 5) * 720000;
    const weekend = [0, 6].includes(date.getDay()) ? 960000 : 0;

    return {
      day: shortDateFormatter.format(date),
      revenue: base + weekend,
    };
  });
}

function KpiCard({
  title,
  value,
  hint,
  change,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  hint: string;
  change: string;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg" style={{ color, backgroundColor: `${color}14` }}>
            <Icon className="size-3.5" />
          </span>
          <p className="text-xs font-semibold text-slate-900">{title}</p>
        </div>
        <ArrowUpRight className="size-3.5 text-slate-400" />
      </div>
      <p className="mt-3 text-xl font-semibold tracking-tight text-slate-950">{value}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="truncate text-xs text-slate-400">{hint}</span>
        <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium" style={{ color, backgroundColor: `${color}12` }}>
          {change}
        </span>
      </div>
    </div>
  );
}

export default function HomeOverview() {
  const range = useDashboardTimeRangeStore((state) => state.range);
  const rangeLabel = formatRange(normalizeRange(range));
  const revenue7Days = useMemo(() => buildRevenue7Days(), []);
  const todayRevenue = revenue7Days[revenue7Days.length - 1]?.revenue ?? 0;
  const [latestOrderQuery, setLatestOrderQuery] = useState("");
  const [selectedLatestOrderStatus, setSelectedLatestOrderStatus] = useState<OrderStatus | "Tất cả">("Tất cả");
  const [selectedLatestOrderIds, setSelectedLatestOrderIds] = useState<Set<string>>(new Set());
  const [latestOrderColumnsState, setLatestOrderColumnsState] = useState<DashboardTableColumn[]>(latestOrderColumns);
  const [latestOrderTableResizeMode, setLatestOrderTableResizeMode] = useState<"fit" | "custom">("fit");
  const [latestOrderPage, setLatestOrderPage] = useState(1);
  const [latestOrderPageSize, setLatestOrderPageSize] = useState(latestOrders.length);
  const [latestOrderCustomPageSize, setLatestOrderCustomPageSize] = useState("");
  const [openLatestOrderPageSizeMenu, setOpenLatestOrderPageSizeMenu] = useState(false);
  const [openLatestOrderAddColumn, setOpenLatestOrderAddColumn] = useState(false);
  const [newLatestOrderColumnName, setNewLatestOrderColumnName] = useState("");
  const [latestOrderRows, setLatestOrderRows] = useState(latestOrders);
  const [editingLatestOrderId, setEditingLatestOrderId] = useState<string | null>(null);
  const [latestOrderForm, setLatestOrderForm] = useState<Record<string, string>>({});
  const [invoiceLatestOrder, setInvoiceLatestOrder] = useState<LaundryOrder | null>(null);

  const activeMachinesCount = useMemo(() => machines.filter((m) => m.status === "Đang chạy").length, []);
  const totalMachines = machines.length;
  const machineEfficiency = useMemo(() => {
    if (totalMachines === 0) return 0;
    return Math.round((activeMachinesCount / totalMachines) * 100);
  }, [activeMachinesCount, totalMachines]);

  const filteredLatestOrders = useMemo(() => {
    const query = latestOrderQuery.trim().toLowerCase();
    return latestOrderRows.filter((order) => {
      const matchesStatus = selectedLatestOrderStatus === "Tất cả" || order.status === selectedLatestOrderStatus;
      const matchesQuery =
        !query ||
        [
          order.id,
          order.customerName,
          order.customerType,
          order.service,
          order.weight,
          order.status,
          order.deliveryDate,
          order.deliveryTime,
          order.washer,
          order.dryer,
          order.staff,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      return matchesStatus && matchesQuery;
    });
  }, [latestOrderQuery, latestOrderRows, selectedLatestOrderStatus]);

  const latestOrderPageCount = Math.max(1, Math.ceil(filteredLatestOrders.length / latestOrderPageSize));
  const latestOrderSafePage = Math.min(latestOrderPage, latestOrderPageCount);
  const paginatedLatestOrders = filteredLatestOrders.slice((latestOrderSafePage - 1) * latestOrderPageSize, latestOrderSafePage * latestOrderPageSize);
  const visibleLatestOrderIds = filteredLatestOrders.map((order) => order.id);
  const selectedVisibleLatestOrderCount = visibleLatestOrderIds.filter((id) => selectedLatestOrderIds.has(id)).length;
  const allVisibleLatestOrdersSelected = visibleLatestOrderIds.length > 0 && selectedVisibleLatestOrderCount === visibleLatestOrderIds.length;
  const latestOrderTotalWidth = latestOrderColumnsState
    .filter((column) => column.visible !== false)
    .reduce((sum, column) => sum + (column.width || 150), 0);

  const toggleLatestOrder = (orderId: string) => {
    setSelectedLatestOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const toggleVisibleLatestOrders = () => {
    setSelectedLatestOrderIds((prev) => {
      const next = new Set(prev);
      if (allVisibleLatestOrdersSelected) {
        visibleLatestOrderIds.forEach((id) => next.delete(id));
      } else {
        visibleLatestOrderIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const updateLatestOrderPageSize = (size: number) => {
    setLatestOrderPageSize(size);
    setLatestOrderPage(1);
  };

  const applyLatestOrderCustomPageSize = () => {
    const parsed = Number(latestOrderCustomPageSize);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    updateLatestOrderPageSize(Math.floor(parsed));
    setOpenLatestOrderPageSizeMenu(false);
  };

  const addLatestOrderColumn = () => {
    const label = newLatestOrderColumnName.trim();
    if (!label) return;
    const newColumn: DashboardTableColumn = {
      id: `custom_${Date.now()}`,
      label,
      width: 150,
      visible: true,
    };
    setLatestOrderColumnsState((prev) => {
      const next = [...prev];
      const actionIndex = next.findIndex((column) => column.id === "actions");
      next.splice(actionIndex === -1 ? next.length : actionIndex, 0, newColumn);
      return next;
    });
    setNewLatestOrderColumnName("");
    setOpenLatestOrderAddColumn(false);
  };

  const getDefaultLatestOrderFileName = () => `don-hang-moi-nhat-${new Date().toISOString().slice(0, 10)}`;

  const findFullLatestOrder = (orderId: string) => seedOrders.find((order) => order.id === orderId);

  const buildFallbackOrder = (order: (typeof latestOrders)[number]): LaundryOrder => ({
    id: order.id,
    customer: order.customerName,
    phone: "",
    address: "",
    service: order.service,
    quantity: order.weight,
    amount: 0,
    status: order.status === "Quá hạn" ? "Tiếp nhận" : order.status,
    appointment: "Chưa hẹn",
    deliveryDate: order.deliveryDate,
    deliveryTime: order.deliveryTime,
    staff: order.staff,
    createdAt: new Date().toISOString().slice(0, 10),
    note: "",
  });

  const openLatestOrderEdit = (order: (typeof latestOrders)[number]) => {
    const fullOrder = findFullLatestOrder(order.id) ?? buildFallbackOrder(order);
    setEditingLatestOrderId(order.id);
    setLatestOrderForm({
      customer: fullOrder.customer,
      phone: fullOrder.phone,
      address: fullOrder.address,
      service: fullOrder.service,
      quantity: fullOrder.quantity,
      amount: String(fullOrder.amount),
      appointment: fullOrder.appointment,
      deliveryDate: fullOrder.deliveryDate,
      deliveryTime: fullOrder.deliveryTime,
      staff: fullOrder.staff,
      status: fullOrder.status,
      createdAt: fullOrder.createdAt,
      payment: "Tiền mặt",
      discount: "",
      note: fullOrder.note,
    });
  };

  const closeLatestOrderEdit = () => {
    setEditingLatestOrderId(null);
    setLatestOrderForm({});
  };

  const saveLatestOrderEdit = () => {
    if (!editingLatestOrderId) return;
    setLatestOrderRows((prev) =>
      prev.map((order) =>
        order.id === editingLatestOrderId
          ? {
              ...order,
              customerName: latestOrderForm.customer || order.customerName,
              service: latestOrderForm.service || order.service,
              weight: latestOrderForm.quantity || order.weight,
              status:
                latestOrderForm.status && latestOrderForm.status in statusStyle
                  ? (latestOrderForm.status as OrderStatus)
                  : order.status,
              deliveryTime: latestOrderForm.deliveryTime || order.deliveryTime,
              staff: latestOrderForm.staff || order.staff,
            }
          : order,
      ),
    );
    closeLatestOrderEdit();
  };

  const openLatestOrderInvoice = (order: (typeof latestOrders)[number]) => {
    setInvoiceLatestOrder(findFullLatestOrder(order.id) ?? buildFallbackOrder(order));
  };

  const handleLatestOrderExport = (format: "pdf" | "excel" | "csv", fileName: string) => {
    const selectedRows = filteredLatestOrders.filter((order) => selectedLatestOrderIds.has(order.id));
    const rows = selectedRows.length > 0 ? selectedRows : filteredLatestOrders;
    if (rows.length === 0) return;

    const exportColumns = latestOrderColumnsState.filter((column) => column.visible !== false && column.id !== "actions");
    const headers = exportColumns.map((column) => column.label);
    const values = rows.map((row) =>
      exportColumns.map((column) => String((row as Record<string, unknown>)[column.id] ?? ""))
    );
    const baseFileName = fileName || getDefaultLatestOrderFileName();

    if (format === "csv") {
      const csv = "\uFEFF" + [headers, ...values].map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${baseFileName}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    const tableHead = headers.map((header) => `<th>${header}</th>`).join("");
    const tableBody = values.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("");
    if (format === "excel") {
      const blob = new Blob([`<html><meta charset="utf-8" /><body><table border="1"><thead><tr>${tableHead}</tr></thead><tbody>${tableBody}</tbody></table></body></html>`], { type: "application/vnd.ms-excel" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${baseFileName}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`<html><body><h2>Bảng đơn hàng mới nhất</h2><table border="1"><thead><tr>${tableHead}</tr></thead><tbody>${tableBody}</tbody></table></body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const renderLatestOrderCell = (order: (typeof latestOrders)[number], column: DashboardTableColumn) => {
    if (column.id === "id") {
      return (
        <TableCell key={column.id} className="pl-4 font-medium text-slate-900">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedLatestOrderIds.has(order.id)}
              onChange={() => toggleLatestOrder(order.id)}
              className={`shrink-0 ${checkboxClass}`}
              aria-label={`Chọn ${order.id}`}
            />
            <span>{order.id}</span>
          </div>
        </TableCell>
      );
    }
    if (column.id === "customerName") {
      return (
        <TableCell key={column.id}>
          <div className="flex min-w-0 items-center gap-2">
            <Image src="https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif" alt={order.customerName} width={24} height={24} className="size-6 shrink-0 rounded-full object-cover" />
            <span className="truncate font-semibold text-slate-800">{order.customerName}</span>
          </div>
        </TableCell>
      );
    }
    if (column.id === "customerType") {
      return (
        <TableCell key={column.id}>
          <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold ${
            order.customerType === "Mới"
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : "border-slate-200 bg-slate-50 text-slate-600"
          }`}>
            Khách {order.customerType}
          </span>
        </TableCell>
      );
    }
    if (column.id === "status") {
      const style = statusStyle[order.status];
      return (
        <TableCell key={column.id}>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2 py-0.5 font-medium" style={{ color: style.color, backgroundColor: style.bg }}>
            <span className="size-1.5 rounded-full" style={{ backgroundColor: style.color }} />
            {order.status}
          </span>
        </TableCell>
      );
    }
    if (column.id === "washer" || column.id === "dryer") {
      const machine = order[column.id];
      const activeClass = column.id === "washer" ? "border-blue-100 bg-blue-50/50 text-blue-700" : "border-amber-100 bg-amber-50/50 text-amber-700";
      const dotClass = column.id === "washer" ? "bg-blue-500" : "bg-amber-500";
      return (
        <TableCell key={column.id}>
          {machine ? (
            <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-semibold ${activeClass}`}>
              <span className={`size-1.5 rounded-full ${dotClass}`} />
              {machine}
            </span>
          ) : (
            <span className="text-[11px] italic text-slate-400">Chưa dùng</span>
          )}
        </TableCell>
      );
    }
    if (column.id === "actions") {
      return (
        <TableCell key={column.id} className="px-4">
          <div className="flex items-center justify-start gap-1.5">
            <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50" onClick={() => openLatestOrderEdit(order)} title="Sửa đơn hàng">
              <Pencil className="size-3" />
              Sửa
            </button>
            <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50" onClick={() => openLatestOrderInvoice(order)} title="Xem hóa đơn">
              <FileText className="size-3" />
              Hóa đơn
            </button>
          </div>
        </TableCell>
      );
    }
    const value = order[column.id as keyof typeof order];
    return <TableCell key={column.id} className="font-medium text-slate-700">{String(value ?? "Chưa có")}</TableCell>;
  };

  return (
    <PageShell fullHeight>
      <div className="min-h-0 flex-1 overflow-auto bg-white">
        <div className="flex min-h-full flex-col gap-4 p-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              <KpiCard
                title="Tổng đơn hôm nay"
                value="48"
                hint="12 đơn mới trong 2 giờ gần nhất"
                change="+8.4%"
                icon={PackageCheck}
                color="#06b6d4"
              />
              <KpiCard
                title="Doanh thu hôm nay"
                value={formatCurrency(todayRevenue)}
                hint="Đã thu và chờ thanh toán"
                change="+12.1%"
                icon={Wallet}
                color="#10b981"
              />
              <KpiCard
                title="Đơn đang xử lý"
                value="18"
                hint="Giặt, sấy, kiểm tra"
                change="+3 đơn"
                icon={WashingMachine}
                color="#f59e0b"
              />
              <KpiCard
                title="Đơn quá hạn"
                value="4"
                hint="Cần ưu tiên trong hôm nay"
                change="-1 đơn"
                icon={AlertTriangle}
                color="#ef4444"
              />
              <KpiCard
                title="Đơn hoàn thành"
                value="22"
                hint="Đã giao và tất toán"
                change="+6 đơn"
                icon={CheckCircle2}
                color="#10b981"
              />
              <KpiCard
                title="Máy đang hoạt động"
                value={`${activeMachinesCount}/${totalMachines}`}
                hint="Đang xử lý đơn hàng"
                change={`Hiệu suất ${machineEfficiency}%`}
                icon={WashingMachine}
                color="#3b82f6"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-semibold text-slate-900">Cơ cấu hôm nay</h2>
                  <span className="text-xs font-medium text-slate-400">48 đơn</span>
                </div>
                <div className="mt-2 grid grid-cols-[112px_1fr] items-center gap-3">
                  <div className="relative h-28">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={todayMix} dataKey="value" innerRadius={34} outerRadius={50} paddingAngle={4} cornerRadius={8}>
                          {todayMix.map((item) => (
                            <Cell key={item.name} fill={item.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            return (
                              <div className="rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium text-slate-900 shadow-lg">
                                {payload[0].name}: {payload[0].value}
                              </div>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 grid place-items-center">
                      <span className="text-lg font-semibold text-slate-950">48</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {todayMix.map((item) => (
                      <div key={item.name} className="flex items-center justify-between gap-2 text-xs">
                        <span className="inline-flex min-w-0 items-center gap-1.5 text-slate-500">
                          <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="truncate">{item.name}</span>
                        </span>
                        <span className="font-medium text-slate-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xs font-semibold text-slate-900">Doanh thu 7 ngày</h2>
                    <p className="mt-0.5 text-[11px] text-slate-400">{rangeLabel}</p>
                  </div>
                  <span className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700">7 ngày</span>
                </div>
                <div className="mt-2 h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenue7Days} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.24}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" tickLine={false} axisLine={false} dy={10} style={{ fontSize: 11, fill: "#64748b" }} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;

                          return (
                            <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-lg">
                              <p className="font-medium text-slate-400">{payload[0].payload.day}</p>
                              <p className="mt-1 font-semibold text-slate-900">
                                {Number(payload[0].value).toLocaleString("vi-VN")}đ
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.4} fill="url(#revenueGradient)" dot={{ r: 3, fill: "#10b981" }} activeDot={{ r: 5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-4">
            {/* Đơn sắp tới hẹn (Ngoài cùng bên trái) */}
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <CalendarClock className="size-4 text-slate-500" />
                  <h2 className="text-sm font-semibold text-slate-900">Đơn sắp tới hẹn</h2>
                </div>
                <span className="text-xs font-medium text-slate-400">3 lịch hẹn</span>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { time: "09:00", task: "Lấy đồ giặt sấy", customer: "Trần Minh", avatar: "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif", type: "Lấy đồ", color: "#3b82f6", bg: "rgba(59,130,246,0.06)", border: "rgba(59,130,246,0.12)" },
                  { time: "10:30", task: "Giao đơn DH-1048", customer: "Nguyễn Thị Hương", avatar: "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif", type: "Giao đồ", color: "#10b981", bg: "rgba(16,185,129,0.06)", border: "rgba(16,185,129,0.12)" },
                  { time: "13:00", task: "Lấy đồ chăn màn", customer: "Công ty ABC", avatar: "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif", type: "Lấy đồ", color: "#6366f1", bg: "rgba(99,102,241,0.06)", border: "rgba(99,102,241,0.12)" },
                ].map((item, index) => (
                  <div key={index} className="px-4 py-3.5 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border" style={{ color: item.color, backgroundColor: item.bg, borderColor: item.border }}>
                            {item.type}
                          </span>
                          <span className="text-[11px] font-bold text-slate-900 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                            {item.time}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-800 text-xs mt-2">
                          {item.task}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Image
                            src={item.avatar}
                            alt={item.customer}
                            width={16}
                            height={16}
                            className="size-4 rounded-full object-cover shadow-sm ring-1 ring-slate-100"
                          />
                          <span className="text-[11px] font-semibold text-slate-500">{item.customer}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tình trạng máy giặt/máy sấy (Ở giữa bên trái) */}
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <WashingMachine className="size-4 text-slate-500" />
                  <h2 className="text-sm font-semibold text-slate-900">Tình trạng máy giặt/máy sấy</h2>
                </div>
                <span className="text-xs font-medium text-slate-400">{machines.length} máy</span>
              </div>
              <div className="divide-y divide-slate-100">
                {machines.map((machine) => (
                  <div key={machine.name} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">{machine.name}</p>
                        <p className="mt-0.5 text-xs text-slate-400">{machine.type} · {machine.detail}</p>
                        {machine.customer && (
                          <div className="mt-1 flex items-center gap-1">
                            <span className="text-[10px] font-medium text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                              Đồ của: <span className="font-semibold text-slate-700">{machine.customer}</span>
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium" style={{ color: machine.color, backgroundColor: `${machine.color}14` }}>
                        <span className="size-1.5 rounded-full" style={{ backgroundColor: machine.color }} />
                        {machine.status}
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full" style={{ width: `${machine.progress}%`, backgroundColor: machine.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Thống kê tài nguyên (Ở giữa bên phải) */}
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <FlaskConical className="size-4 text-slate-500" />
                  <h2 className="text-sm font-semibold text-slate-900">Thống kê tài nguyên</h2>
                </div>
                <span className="text-xs font-medium text-slate-400">5 danh mục</span>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { name: "Nước giặt chính", current: "45L", total: "50L", pct: 90, color: "#3b82f6" },
                  { name: "Nước xả thơm", current: "32L", total: "50L", pct: 64, color: "#10b981" },
                  { name: "Nước tẩy chuyên dụng", current: "8L", total: "20L", pct: 40, color: "#f59e0b" },
                  { name: "Móc treo quần áo", current: "180 chiếc", total: "200 chiếc", pct: 90, color: "#8b5cf6" },
                  { name: "Túi đóng gói", current: "250 chiếc", total: "500 chiếc", pct: 50, color: "#06b6d4" },
                ].map((item, index) => (
                  <div key={index} className="px-4 py-3">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-700">{item.name}</span>
                      <span className="text-slate-450 text-[11px]">
                        <strong className="text-slate-900 font-semibold">{item.current}</strong> / {item.total}
                      </span>
                    </div>
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 w-8 text-right">{item.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ghi chú & Nhắc nhở (Ngoài cùng bên phải) */}
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <StickyNote className="size-4 text-slate-500" />
                  <h2 className="text-sm font-semibold text-slate-900">Ghi chú & Nhắc nhở</h2>
                </div>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 border border-indigo-100">4 lưu ý</span>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { text: "Kiểm tra khuy áo dạ của anh Trần Minh trước khi giặt", type: "Quan trọng", color: "#ef4444", bg: "rgba(239,68,68,0.06)" },
                  { text: "Đơn DH-1075 yêu cầu sấy nhẹ nhiệt độ thấp", type: "Lưu ý", color: "#f59e0b", bg: "rgba(245,158,11,0.06)" },
                  { text: "Nhắc nhân viên ca sau bàn giao tiền mặt đối soát", type: "Nhắc nhở", color: "#3b82f6", bg: "rgba(59,130,246,0.06)" },
                  { text: "Máy sấy 02 bảo trì dự kiến xong lúc 18:30 hôm nay", type: "Thông tin", color: "#10b981", bg: "rgba(16,185,129,0.06)" },
                ].map((note, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-100/80 space-y-1" style={{ backgroundColor: note.bg }}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: note.color }}>
                        {note.type}
                      </span>
                      <span className="size-1.5 rounded-full" style={{ backgroundColor: note.color }} />
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                      {note.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
            <Toolbar
              leftContent={
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-900">Bảng đơn hàng mới nhất</h2>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">{filteredLatestOrders.length}</span>
                </div>
              }
              query={latestOrderQuery}
              onQueryChange={(value) => {
                setLatestOrderQuery(value);
                setLatestOrderPage(1);
              }}
              columns={latestOrderColumnsState}
              onColumnsChange={setLatestOrderColumnsState}
              tableResizeMode={latestOrderTableResizeMode}
              onTableResizeModeChange={setLatestOrderTableResizeMode}
              selectedCount={selectedLatestOrderIds.size}
              onOpenAddColumn={() => setOpenLatestOrderAddColumn(true)}
              onOpenHistory={() => {}}
              onExport={handleLatestOrderExport}
              defaultExportFileName={getDefaultLatestOrderFileName()}
              onCreateClick={() => {
                window.location.href = "/home/orders?action=create";
              }}
              createLabel="Thêm đơn"
              defaultColumnIds={latestOrderColumns.map((column) => column.id)}
              searchPlaceholder="Tìm mã đơn, khách hàng, dịch vụ..."
              showHistoryButton={false}
            />

            <FilterBar
              rangeLabel={rangeLabel}
              selectedValue={selectedLatestOrderStatus}
              onValueChange={(value) => {
                setSelectedLatestOrderStatus(value as OrderStatus | "Tất cả");
                setLatestOrderPage(1);
              }}
              filterOptions={latestOrderStatusOptions}
              filterLabel="Trạng thái đơn"
              allSelected={allVisibleLatestOrdersSelected}
              disabled={visibleLatestOrderIds.length === 0}
              selectedCount={selectedVisibleLatestOrderCount}
              totalCount={visibleLatestOrderIds.length}
              itemLabel="đơn"
              checkboxClass={checkboxClass}
              onToggleAll={toggleVisibleLatestOrders}
            />

            <TableView
              columns={latestOrderColumnsState}
              rows={paginatedLatestOrders}
              pageSize={latestOrderPageSize}
              emptyMessage="Chưa có đơn hàng mới."
              tableResizeMode={latestOrderTableResizeMode}
              totalVisibleWidth={latestOrderTotalWidth}
              renderCell={renderLatestOrderCell}
              page={latestOrderSafePage}
              pageCount={latestOrderPageCount}
              totalRows={filteredLatestOrders.length}
              customPageSize={latestOrderCustomPageSize}
              openPageSizeMenu={openLatestOrderPageSizeMenu}
              onOpenPageSizeMenuChange={setOpenLatestOrderPageSizeMenu}
              onCustomPageSizeChange={setLatestOrderCustomPageSize}
              onApplyCustomPageSize={applyLatestOrderCustomPageSize}
              onUpdatePageSize={updateLatestOrderPageSize}
              onPageChange={setLatestOrderPage}
            />
          </div>
        </div>
      </div>

      <AddColumnDialog
        open={openLatestOrderAddColumn}
        onOpenChange={setOpenLatestOrderAddColumn}
        newColumnName={newLatestOrderColumnName}
        onNewColumnNameChange={setNewLatestOrderColumnName}
        onAddColumn={addLatestOrderColumn}
      />

      <FormDialog
        open={!!editingLatestOrderId}
        onClose={closeLatestOrderEdit}
        title={editingLatestOrderId ? `Chi tiết đơn ${editingLatestOrderId}` : "Chi tiết đơn"}
        fields={latestOrderFormFields}
        form={latestOrderForm}
        onFormChange={setLatestOrderForm}
        onSave={saveLatestOrderEdit}
        statusOptions={statuses}
        statusDotColors={statusDotColor}
      />

      <InvoiceModal
        order={invoiceLatestOrder}
        onClose={() => setInvoiceLatestOrder(null)}
      />
    </PageShell>
  );
}
