"use client";

import { useMemo, useState } from "react";
import { Copy, Crown, Gift, Share2, Star, ArrowUpRight, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TableCell } from "@/components/ui/table";
import { PageShell } from "@/src/app/home/_components/dashboard-primitives";
import { Toolbar } from "@/src/app/home/_components/toolbar";
import { FilterBar, type FilterOption } from "@/src/app/home/_components/filter-bar";
import { TableView } from "@/src/app/home/_components/table-view";
import type { DashboardTableColumn } from "@/src/components/common/dashboard-data-table";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import { formatRange, normalizeRange } from "@/src/utils/dashboard-time";

interface Voucher {
  code: string;
  value: string;
  condition: string;
  pointsCost: number;
  expire: string;
  status: "Chưa nhận" | "Đã sở hữu" | "Đã dùng";
}

const initialVouchers: Voucher[] = [
  { code: "PANDA20", value: "Giảm 20%", condition: "Đơn từ 150.000đ", pointsCost: 150, expire: "31/05/2026", status: "Đã sở hữu" },
  { code: "FREESHIP", value: "Miễn phí giao", condition: "2 lượt mỗi tháng", pointsCost: 50, expire: "30/06/2026", status: "Đã sở hữu" },
  { code: "HAP50", value: "Giảm 50.000đ", condition: "Giặt hấp", pointsCost: 200, expire: "15/06/2026", status: "Chưa nhận" },
  { code: "KHACHMOI", value: "Giảm 30.000đ", condition: "Đơn đầu tiên", pointsCost: 100, expire: "31/07/2026", status: "Chưa nhận" },
  { code: "CUOITUAN", value: "Giảm 15%", condition: "Giặt sấy T7 & CN", pointsCost: 120, expire: "15/06/2026", status: "Chưa nhận" },
  { code: "SIEUVIET", value: "Giảm 100.000đ", condition: "Đơn từ 500.000đ", pointsCost: 350, expire: "31/08/2026", status: "Chưa nhận" },
  { code: "TRIANCS", value: "Tặng nước xả cao cấp", condition: "Đơn bất kỳ", pointsCost: 80, expire: "20/06/2026", status: "Đã dùng" },
];

const defaultColumns: DashboardTableColumn[] = [
  { id: "code", label: "Mã voucher", width: 130, visible: true },
  { id: "value", label: "Giá trị ưu đãi", width: 140, visible: true },
  { id: "condition", label: "Điều kiện áp dụng", width: 200, visible: true },
  { id: "pointsCost", label: "Điểm đổi", width: 120, visible: true },
  { id: "expire", label: "Hạn sử dụng", width: 120, visible: true },
  { id: "status", label: "Trạng thái", width: 130, visible: true },
  { id: "actions", label: "Thao tác", width: 140, visible: true },
];

const statusOptions: FilterOption[] = [
  { id: "Tất cả", label: "Tất cả", color: "#64748b", bgColor: "rgba(100,116,139,0.09)" },
  { id: "Chưa nhận", label: "Chưa nhận", color: "#3b82f6", bgColor: "rgba(59,130,246,0.08)" },
  { id: "Đã sở hữu", label: "Đã sở hữu", color: "#10b981", bgColor: "rgba(16,185,129,0.08)" },
  { id: "Đã dùng", label: "Đã dùng", color: "#64748b", bgColor: "rgba(100,116,139,0.09)" },
];

const checkboxClass =
  "relative size-4 appearance-none rounded-[5px] border border-slate-300 bg-white transition-all checked:border-emerald-300 checked:bg-emerald-300 after:absolute after:left-1/2 after:top-1/2 after:hidden after:h-[9px] after:w-[5px] after:-translate-x-1/2 after:-translate-y-[58%] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:content-[''] checked:after:block";

const statusStyle: Record<string, { color: string; bg: string }> = {
  "Chưa nhận": { color: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
  "Đã sở hữu": { color: "#10b981", bg: "rgba(16,185,129,0.08)" },
  "Đã dùng": { color: "#64748b", bg: "rgba(100,116,139,0.09)" },
};

function KpiCard({
  title,
  value,
  hint,
  change,
  icon: Icon,
  color,
  onClick,
  children,
}: {
  title: string;
  value: string;
  hint: string;
  change: string;
  icon: any;
  color: string;
  onClick?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg border border-slate-200 bg-white p-3 ${
        onClick ? "cursor-pointer transition-all hover:bg-slate-50 active:scale-[0.98]" : ""
      }`}
    >
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
      {children ? children : (
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="truncate text-xs text-slate-400">{hint}</span>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ color, backgroundColor: `${color}12` }}
          >
            {change}
          </span>
        </div>
      )}
    </div>
  );
}

export default function UserLoyaltyPage() {
  const range = useDashboardTimeRangeStore((state) => state.range);
  const rangeLabel = formatRange(normalizeRange(range));
  const [myPoints, setMyPoints] = useState(1250);
  const [vouchersList, setVouchersList] = useState<Voucher[]>(initialVouchers);
  const [columns, setColumns] = useState<DashboardTableColumn[]>(defaultColumns);
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [tableResizeMode, setTableResizeMode] = useState<"fit" | "custom">("fit");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [customPageSize, setCustomPageSize] = useState("");
  const [openPageSizeMenu, setOpenPageSizeMenu] = useState(false);

  // Dialog Đổi Điểm
  const [confirmExchangeOpen, setConfirmExchangeOpen] = useState(false);
  const [exchangeVoucher, setExchangeVoucher] = useState<Voucher | null>(null);

  const nextTierPoints = 1500;
  const progressPercent = Math.min(100, Math.floor((myPoints / nextTierPoints) * 100));

  const filteredVouchers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return vouchersList.filter((voucher) => {
      const matchesStatus = selectedStatus === "Tất cả" || voucher.status === selectedStatus;
      const matchesQuery =
        !normalizedQuery ||
        [voucher.code, voucher.value, voucher.condition, voucher.expire, voucher.status]
          .filter(Boolean)
          .some((val) => String(val).toLowerCase().includes(normalizedQuery));
      return matchesStatus && matchesQuery;
    });
  }, [vouchersList, query, selectedStatus]);

  const pageCount = Math.max(1, Math.ceil(filteredVouchers.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const paginatedVouchers = filteredVouchers.slice((safePage - 1) * pageSize, safePage * pageSize);
  const visibleIds = filteredVouchers.map((v) => v.code);
  const selectedVisibleCount = visibleIds.filter((code) => selectedIds.has(code)).length;
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const totalVisibleWidth = columns.filter((col) => col.visible !== false).reduce((sum, col) => sum + (col.width || 150), 0);

  const toggleVoucher = (code: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) visibleIds.forEach((code) => next.delete(code));
      else visibleIds.forEach((code) => next.add(code));
      return next;
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã voucher ${code}`);
  };

  const openExchangeDialog = (voucher: Voucher) => {
    if (voucher.pointsCost > myPoints) {
      toast.error(`Bạn không đủ điểm đổi! Thiếu ${voucher.pointsCost - myPoints} điểm.`);
      return;
    }
    setExchangeVoucher(voucher);
    setConfirmExchangeOpen(true);
  };

  const confirmExchange = () => {
    if (!exchangeVoucher) return;
    setMyPoints((prev) => prev - exchangeVoucher.pointsCost);
    setVouchersList((prev) =>
      prev.map((v) => (v.code === exchangeVoucher.code ? { ...v, status: "Đã sở hữu" } : v))
    );
    toast.success(`Đổi thành công voucher ${exchangeVoucher.code}. Đã trừ ${exchangeVoucher.pointsCost} điểm.`);
    setConfirmExchangeOpen(false);
    setExchangeVoucher(null);
  };

  const handleBulkExchange = () => {
    const selectedVouchers = vouchersList.filter((v) => selectedIds.has(v.code) && v.status === "Chưa nhận");
    if (selectedVouchers.length === 0) {
      toast.error("Không có voucher nào khả dụng để đổi điểm trong số đã chọn.");
      return;
    }
    const totalCost = selectedVouchers.reduce((sum, v) => sum + v.pointsCost, 0);
    if (totalCost > myPoints) {
      toast.error(`Tổng điểm cần đổi là ${totalCost} điểm, bạn hiện có ${myPoints} điểm. Không đủ điểm.`);
      return;
    }

    setMyPoints((prev) => prev - totalCost);
    setVouchersList((prev) =>
      prev.map((v) => (selectedIds.has(v.code) && v.status === "Chưa nhận" ? { ...v, status: "Đã sở hữu" } : v))
    );
    toast.success(`Đã đổi thành công ${selectedVouchers.length} voucher! Đã khấu trừ ${totalCost} điểm.`);
    setSelectedIds(new Set());
  };

  const handleBulkCopy = () => {
    const ownedCodes = vouchersList
      .filter((v) => selectedIds.has(v.code) && v.status === "Đã sở hữu")
      .map((v) => v.code);
    if (ownedCodes.length === 0) {
      toast.error("Vui lòng chọn các voucher đã sở hữu để sao chép.");
      return;
    }
    navigator.clipboard.writeText(ownedCodes.join(", "));
    toast.success(`Đã sao chép ${ownedCodes.length} mã voucher vào bộ nhớ tạm.`);
  };

  const renderCell = (voucher: Voucher, column: DashboardTableColumn) => {
    if (column.id === "code") {
      return (
        <TableCell key={column.id} className="pl-4 font-semibold text-slate-900">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              className={checkboxClass}
              checked={selectedIds.has(voucher.code)}
              onChange={() => toggleVoucher(voucher.code)}
              onClick={(e) => e.stopPropagation()}
            />
            <span>{voucher.code}</span>
          </div>
        </TableCell>
      );
    }
    if (column.id === "value") {
      return (
        <TableCell key={column.id} className="font-semibold text-slate-800">
          {voucher.value}
        </TableCell>
      );
    }
    if (column.id === "pointsCost") {
      return (
        <TableCell key={column.id} className="font-semibold text-slate-900">
          {voucher.status === "Đã sở hữu" || voucher.status === "Đã dùng" ? (
            <span className="text-slate-400 line-through">{voucher.pointsCost} điểm</span>
          ) : (
            <span>{voucher.pointsCost} điểm</span>
          )}
        </TableCell>
      );
    }
    if (column.id === "status") {
      const style = statusStyle[voucher.status] || { color: "#64748b", bg: "rgba(100,116,139,0.09)" };
      return (
        <TableCell key={column.id}>
          <span
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium"
            style={{ color: style.color, backgroundColor: style.bg }}
          >
            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: style.color }} />
            <span>{voucher.status}</span>
          </span>
        </TableCell>
      );
    }
    if (column.id === "actions") {
      return (
        <TableCell key={column.id} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1.5">
            {voucher.status === "Chưa nhận" ? (
              <button
                type="button"
                onClick={() => openExchangeDialog(voucher)}
                className="inline-flex h-7 items-center rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-50"
              >
                Đổi điểm
              </button>
            ) : voucher.status === "Đã sở hữu" ? (
              <button
                type="button"
                onClick={() => handleCopyCode(voucher.code)}
                className="inline-flex h-7 items-center rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Sao chép
              </button>
            ) : (
              <span className="text-xs text-slate-400">Đã dùng</span>
            )}
          </div>
        </TableCell>
      );
    }
    return (
      <TableCell key={column.id} className="text-slate-600 font-medium text-xs">
        {String(voucher[column.id as keyof Voucher] ?? "")}
      </TableCell>
    );
  };

  return (
    <PageShell fullHeight>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <div className="flex min-h-0 flex-1 flex-col gap-4 px-5 pt-5 pb-0">
          {/* KPI Dashboard Card Grid */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Điểm hiện có"
              value={myPoints.toLocaleString("vi-VN")}
              hint={`Tương đương ${(myPoints * 100).toLocaleString("vi-VN")}đ`}
              change="Tích lũy"
              icon={Star}
              color="#10b981"
            />
            <KpiCard
              title="Hạng thành viên"
              value={myPoints >= 1500 ? "Vàng" : "Bạc"}
              hint={myPoints >= 1500 ? "Đạt chiết khấu 5% đơn hàng" : `Còn ${nextTierPoints - myPoints}đ lên Vàng (${progressPercent}%)`}
              change={`${progressPercent}%`}
              icon={Crown}
              color="#3b82f6"
            />
            <KpiCard
              title="Voucher khả dụng"
              value={String(vouchersList.filter((v) => v.status === "Đã sở hữu").length)}
              hint="Sẵn sàng áp dụng cho giặt sấy"
              change="Ví voucher"
              icon={Gift}
              color="#f59e0b"
            />
            <KpiCard
              title="Mã giới thiệu"
              value="PANDA-HUONG"
              hint="Nhấp để sao chép nhanh"
              change="Giới thiệu"
              icon={Share2}
              color="#8b5cf6"
              onClick={() => {
                navigator.clipboard.writeText("PANDA-HUONG");
                toast.success("Đã sao chép mã giới thiệu.");
              }}
            />
          </div>

          {/* Full-width Voucher Table View */}
          <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-white">
            <Toolbar
              leftContent={
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-900">Danh sách Voucher</h2>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                      {filteredVouchers.length}
                    </span>
                  </div>
                  {selectedIds.size > 0 && (
                    <Button
                      variant="outline"
                      onClick={handleBulkCopy}
                      className="h-8 border-slate-200 text-xs gap-1.5 font-medium rounded-lg hover:bg-slate-50 shadow-sm animate-in fade-in zoom-in duration-200"
                    >
                      <Copy className="size-3.5" />
                      Sao chép mã chọn
                    </Button>
                  )}
                </div>
              }
              query={query}
              onQueryChange={(val) => {
                setQuery(val);
                setPage(1);
              }}
              columns={columns}
              onColumnsChange={setColumns}
              tableResizeMode={tableResizeMode}
              onTableResizeModeChange={setTableResizeMode}
              selectedCount={selectedIds.size}
              onOpenAddColumn={() => toast.info("Bảng voucher dùng bộ cột cố định.")}
              onExport={() => toast.info("Không có hành động xuất file cho Voucher.")}
              defaultExportFileName="vouchers-list"
              onCreateClick={handleBulkExchange}
              createLabel="Đổi điểm loạt chọn"
              defaultColumnIds={defaultColumns.map((col) => col.id)}
              searchPlaceholder="Tìm mã voucher, giá trị..."
              showAddColumnButton={false}
              showHistoryButton={false}
              onOpenHistory={() => {}}
            />
            <FilterBar
              rangeLabel={rangeLabel}
              selectedValue={selectedStatus}
              onValueChange={(val) => {
                setSelectedStatus(val);
                setPage(1);
              }}
              filterOptions={statusOptions}
              filterLabel="Bộ lọc ví"
              allSelected={allVisibleSelected}
              disabled={visibleIds.length === 0}
              selectedCount={selectedVisibleCount}
              totalCount={visibleIds.length}
              itemLabel="voucher"
              checkboxClass={checkboxClass}
              onToggleAll={toggleAll}
            />
            <TableView
              columns={columns}
              rows={paginatedVouchers}
              pageSize={pageSize}
              emptyMessage="Không tìm thấy voucher tương thích."
              tableResizeMode={tableResizeMode}
              totalVisibleWidth={totalVisibleWidth}
              renderCell={renderCell}
              page={safePage}
              pageCount={pageCount}
              totalRows={filteredVouchers.length}
              totalLabel="Tổng voucher"
              customPageSize={customPageSize}
              openPageSizeMenu={openPageSizeMenu}
              onOpenPageSizeMenuChange={setOpenPageSizeMenu}
              onCustomPageSizeChange={setCustomPageSize}
              onApplyCustomPageSize={() => {
                const val = Number(customPageSize);
                if (val > 0) {
                  setPageSize(val);
                  setPage(1);
                  setOpenPageSizeMenu(false);
                }
              }}
              onUpdatePageSize={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Points Exchange */}
      <Dialog open={confirmExchangeOpen} onOpenChange={setConfirmExchangeOpen}>
        <DialogContent
          className="max-w-[400px] gap-0 rounded-xl border border-slate-200 bg-white p-0 shadow-lg"
          showCloseButton={false}
        >
          <DialogHeader className="gap-3 px-5 pb-4 pt-5">
            <div className="flex items-center gap-2 text-slate-900">
              <Info className="size-5 text-amber-500" />
              <DialogTitle className="text-base font-semibold">Xác nhận đổi điểm</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-slate-500 leading-relaxed">
              Bạn có chắc chắn muốn dùng <span className="font-bold text-slate-900">{exchangeVoucher?.pointsCost} điểm</span>{" "}
              để lấy voucher <span className="font-bold text-slate-900">{exchangeVoucher?.value}</span> (
              {exchangeVoucher?.code})?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="m-0 flex-row justify-end gap-2 rounded-b-xl border-t border-slate-100 bg-slate-50 px-4 py-3">
            <DialogClose asChild>
              <Button variant="outline" className="h-8 border-slate-200 text-xs">
                Huỷ
              </Button>
            </DialogClose>
            <Button className="h-8 bg-slate-950 text-xs text-white hover:bg-slate-800" onClick={confirmExchange}>
              Đồng ý đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
