"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Gift, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TableCell } from "@/components/ui/table";
import { API_BASE_URL } from "@/src/lib/config";
import { PageShell } from "@/src/app/home/_components/dashboard-primitives";
import { MetricCard } from "@/src/app/home/_components/metric-card";
import { Toolbar } from "@/src/app/home/_components/toolbar";
import { FilterBar, type FilterOption } from "@/src/app/home/_components/filter-bar";
import { TableView } from "@/src/app/home/_components/table-view";
import type { DashboardTableColumn } from "@/src/components/common/dashboard-data-table";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import { formatRange, normalizeRange } from "@/src/utils/dashboard-time";
import { homeApi, listHomeResource } from "@/src/lib/home-api";
import type { HomePromotionRow, Promotion } from "@/src/types/services";
import {
  assignFriendlyPromotionIds,
  formatPromotionEndDate,
  formatPromotionValue,
  formatReadableDate,
  mapHomePromotion,
} from "@/src/utils/services";

type PromotionClaim = {
  claim_id: string;
  promotion_id: string;
  code: string;
  claim_status: "Đã nhận" | "Đã sử dụng";
  claimed_at?: string;
  used_at?: string;
  booking_id?: string;
  order_id?: string;
};

const defaultColumns: DashboardTableColumn[] = [
  { id: "id", label: "Mã ID", width: 112, visible: true },
  { id: "code", label: "Code", width: 138, visible: true },
  { id: "name", label: "Chương trình", width: 170, visible: true },
  { id: "type", label: "Loại", width: 96, visible: true },
  { id: "appliedService", label: "Dịch vụ áp dụng", width: 150, visible: true },
  { id: "startDate", label: "Bắt đầu", width: 104, visible: true },
  { id: "expire", label: "Kết thúc", width: 120, visible: true },
  { id: "status", label: "Trạng thái", width: 130, visible: true },
  { id: "note", label: "Ghi chú", width: 190, visible: true },
  { id: "value", label: "Giá trị", width: 112, visible: true },
  { id: "actions", label: "Thao tác", width: 140, visible: true },
];

const statusOptions: FilterOption[] = [
  { id: "Tất cả", label: "Tất cả", color: "#64748b", bgColor: "rgba(100,116,139,0.09)" },
  { id: "Chưa sử dụng", label: "Chưa sử dụng", color: "#059669", bgColor: "rgba(5,150,105,0.09)" },
  { id: "Đã sử dụng", label: "Đã sử dụng", color: "#64748b", bgColor: "rgba(100,116,139,0.10)" },
];

const checkboxClass =
  "relative size-4 appearance-none rounded-[5px] border border-slate-300 bg-white transition-all checked:border-emerald-300 checked:bg-emerald-300 after:absolute after:left-1/2 after:top-1/2 after:hidden after:h-[9px] after:w-[5px] after:-translate-x-1/2 after:-translate-y-[58%] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:content-[''] checked:after:block";

const statusStyle: Record<string, { color: string; bg: string }> = {
  "Chưa sử dụng": { color: "#059669", bg: "rgba(5,150,105,0.09)" },
  "Đã sử dụng": { color: "#64748b", bg: "rgba(100,116,139,0.10)" },
};

function normalizeCode(value?: string) {
  return String(value || "").trim().toUpperCase();
}

function getClaimUsageStatus(claim?: PromotionClaim | null) {
  return claim?.claim_status === "Đã sử dụng" ? "Đã sử dụng" : "Chưa sử dụng";
}

export default function UserLoyaltyPage() {
  const range = useDashboardTimeRangeStore((state) => state.range);
  const rangeLabel = formatRange(normalizeRange(range));
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [claims, setClaims] = useState<PromotionClaim[]>([]);
  const [columns, setColumns] = useState<DashboardTableColumn[]>(defaultColumns);
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [tableResizeMode, setTableResizeMode] = useState<"fit" | "custom">("fit");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [customPageSize, setCustomPageSize] = useState("");
  const [openPageSizeMenu, setOpenPageSizeMenu] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [openClaimDialog, setOpenClaimDialog] = useState(false);
  const accountColumnsConfigRef = useRef<Record<string, unknown>>({});

  const loadPromotions = useCallback(async () => {
    const response = await listHomeResource<HomePromotionRow>("promotions", { limit: 500, includeCount: true });
    setPromotions(assignFriendlyPromotionIds(response.items.map(mapHomePromotion)));
  }, []);

  const loadClaims = useCallback(async () => {
    const rows = await homeApi<PromotionClaim[]>("/my-promotion-claims", { cache: "no-store" });
    setClaims(rows);
  }, []);

  useEffect(() => {
    let alive = true;
    Promise.allSettled([loadPromotions(), loadClaims()]).then((results) => {
      if (!alive) return;
      const firstError = results.find((item) => item.status === "rejected") as PromiseRejectedResult | undefined;
      if (firstError) {
        toast.error(firstError.reason instanceof Error ? firstError.reason.message : "Không tải được mã giảm giá.");
      }
    });
    return () => {
      alive = false;
    };
  }, [loadClaims, loadPromotions]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsConfigLoaded(true);
      return;
    }

    fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((data) => {
        if (!data?.columns_config) return;
        const parsed = JSON.parse(data.columns_config) as Record<string, unknown>;
        accountColumnsConfigRef.current = parsed;
        const layout = (parsed.userLoyaltyLayout || {}) as {
          columns?: DashboardTableColumn[];
          tableResizeMode?: "fit" | "custom";
          pageSize?: number;
        };
        if (layout.columns) setColumns(layout.columns);
        if (layout.tableResizeMode) setTableResizeMode(layout.tableResizeMode);
        if (layout.pageSize) setPageSize(layout.pageSize);
      })
      .catch(() => undefined)
      .finally(() => setIsConfigLoaded(true));
  }, []);

  useEffect(() => {
    if (!isConfigLoaded) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    const timeoutId = window.setTimeout(() => {
      const nextConfig = {
        ...accountColumnsConfigRef.current,
        userLoyaltyLayout: { columns, tableResizeMode, pageSize },
      };
      accountColumnsConfigRef.current = nextConfig;
      fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ columns_config: JSON.stringify(nextConfig) }),
      }).catch((error) => console.error("Error saving user loyalty layout:", error));
    }, 250);
    return () => window.clearTimeout(timeoutId);
  }, [columns, isConfigLoaded, pageSize, tableResizeMode]);

  const claimMap = useMemo(
    () => new Map(claims.map((claim) => [normalizeCode(claim.code), claim])),
    [claims],
  );

  const claimedPromotions = useMemo(
    () => promotions.filter((promotion) => claimMap.has(normalizeCode(promotion.code))),
    [claimMap, promotions],
  );

  const filteredPromotions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return claimedPromotions.filter((promotion) => {
      const usageStatus = getClaimUsageStatus(claimMap.get(normalizeCode(promotion.code)));
      const matchesStatus = selectedStatus === "Tất cả" || usageStatus === selectedStatus;
      const matchesQuery =
        !normalizedQuery ||
        [
          promotion.id,
          promotion.code,
          promotion.name,
          promotion.value,
          promotion.appliedService,
          promotion.startDate,
          promotion.endDate,
          usageStatus,
          promotion.note,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery));
      return matchesStatus && matchesQuery;
    });
  }, [claimMap, claimedPromotions, query, selectedStatus]);

  const pageCount = Math.max(1, Math.ceil(filteredPromotions.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const paginatedPromotions = filteredPromotions.slice((safePage - 1) * pageSize, safePage * pageSize);
  const visibleIds = filteredPromotions.map((promotion) => promotion.code);
  const selectedVisibleCount = visibleIds.filter((code) => selectedIds.has(code)).length;
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const totalVisibleWidth = columns.filter((column) => column.visible !== false).reduce((sum, column) => sum + (column.width || 150), 0);

  const claimedCount = claims.filter((claim) => claim.claim_status === "Đã nhận").length;
  const usedCount = claims.filter((claim) => claim.claim_status === "Đã sử dụng").length;

  const togglePromotion = (code: string) => {
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

  const handleClaimCode = useCallback(async (rawCode?: string) => {
    const normalizedCode = normalizeCode(rawCode ?? codeInput);
    if (!normalizedCode) {
      toast.error("Vui lòng nhập mã giảm giá.");
      return;
    }
    setIsClaiming(true);
    try {
      await homeApi("/promotions/claim", {
        method: "POST",
        body: JSON.stringify({ code: normalizedCode }),
      });
      setCodeInput("");
      setOpenClaimDialog(false);
      await Promise.all([loadPromotions(), loadClaims()]);
      toast.success(`Đã thêm mã ${normalizedCode} vào tài khoản.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể thêm mã giảm giá.");
    } finally {
      setIsClaiming(false);
    }
  }, [codeInput, loadClaims, loadPromotions]);

  const handleCopyCode = useCallback(async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Đã sao chép mã ${code}.`);
    } catch {
      toast.error("Không thể sao chép mã giảm giá.");
    }
  }, []);

  const handleDeleteClaim = useCallback(async (claimId: string) => {
    try {
      await homeApi(`/my-promotion-claims/${claimId}`, { method: "DELETE" });
      await loadClaims();
      toast.success("Đã xóa mã đã hết hạn khỏi tài khoản.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xóa mã giảm giá.");
    }
  }, [loadClaims]);

  const handleDeleteAllClaims = useCallback(async () => {
    try {
      const result = await homeApi<{ deleted_count?: number }>("/my-promotion-claims", { method: "DELETE" });
      setSelectedIds(new Set());
      await loadClaims();
      toast.success(`Đã xóa ${Number(result.deleted_count || 0)} mã trong user.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xóa tất cả mã.");
    }
  }, [loadClaims]);

  const renderCell = (promotion: Promotion, column: DashboardTableColumn) => {
    if (column.id === "id") {
      return (
        <TableCell key={column.id} className="pl-4 font-medium text-slate-900 max-w-[120px] truncate">
          <div className="flex items-center gap-2 truncate">
            <input
              type="checkbox"
              aria-label={`Chọn mã giảm giá ${promotion.id}`}
              className={`shrink-0 ${checkboxClass}`}
              checked={selectedIds.has(promotion.code)}
              onChange={() => togglePromotion(promotion.code)}
              onClick={(event) => event.stopPropagation()}
            />
            <span className="truncate" title={promotion.id}>{promotion.id}</span>
          </div>
        </TableCell>
      );
    }
    if (column.id === "code") return <TableCell key={column.id} className="font-semibold text-slate-900">{promotion.code}</TableCell>;
    if (column.id === "name") return <TableCell key={column.id} className="font-medium text-slate-800">{promotion.name}</TableCell>;
    if (column.id === "type") return <TableCell key={column.id} className="text-slate-600">{promotion.type}</TableCell>;
    if (column.id === "startDate") return <TableCell key={column.id} className="text-slate-600">{formatReadableDate(promotion.startDate)}</TableCell>;
    if (column.id === "value") return <TableCell key={column.id} className="font-medium text-slate-900">{formatPromotionValue(promotion.value, promotion.type)}</TableCell>;
    if (column.id === "appliedService") {
      return <TableCell key={column.id} className="max-w-0 truncate overflow-hidden text-slate-600" title={promotion.appliedService}>{promotion.appliedService}</TableCell>;
    }
    if (column.id === "expire") return <TableCell key={column.id} className="text-slate-600">{formatPromotionEndDate(promotion.endDate)}</TableCell>;
    if (column.id === "status") {
      const usageStatus = getClaimUsageStatus(claimMap.get(normalizeCode(promotion.code)));
      const style = statusStyle[usageStatus] || { color: "#64748b", bg: "rgba(100,116,139,0.09)" };
      return (
        <TableCell key={column.id}>
          <span
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium"
            style={{ color: style.color, backgroundColor: style.bg }}
          >
            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: style.color }} />
            <span>{usageStatus}</span>
          </span>
        </TableCell>
      );
    }
    if (column.id === "note") {
      return <TableCell key={column.id} className="max-w-xs truncate text-slate-500" title={promotion.note}>{promotion.note || "-"}</TableCell>;
    }
    if (column.id === "actions") {
      const claim = claimMap.get(normalizeCode(promotion.code));
      const canDeleteExpired = Boolean(claim?.claim_id) && promotion.status === "Đã kết thúc";
      return (
        <TableCell key={column.id} className="px-4" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-center justify-start gap-1.5">
            <button
              type="button"
              onClick={() => void handleCopyCode(promotion.code)}
              className="inline-flex h-7 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50"
            >
              Copy mã
            </button>
            {canDeleteExpired && claim ? (
              <button
                type="button"
                onClick={() => void handleDeleteClaim(claim.claim_id)}
                className="inline-flex h-7 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-600"
              >
                Xóa
              </button>
            ) : null}
          </div>
        </TableCell>
      );
    }
    return <TableCell key={column.id} className="text-slate-600 font-medium text-xs">{String(promotion[column.id as keyof Promotion] ?? "")}</TableCell>;
  };

  return (
    <PageShell fullHeight>
      <div className="grid shrink-0 gap-3 md:grid-cols-4">
        <MetricCard title="Mã trong user" value={String(claimedPromotions.length)} hint="Các mã đã nhận vào tài khoản" icon={Gift} color="#2563eb" />
        <MetricCard title="Chưa sử dụng" value={String(claimedCount)} hint="Mã trong user chưa áp sang đơn hàng" icon={Gift} color="#059669" />
        <MetricCard title="Đã dùng" value={String(usedCount)} hint="Mỗi mã chỉ dùng một lần" icon={Gift} color="#64748b" />
        <MetricCard title="Đã hết hạn" value={String(claimedPromotions.filter((promotion) => promotion.status === "Đã kết thúc").length)} hint="Mã trong user đã hết thời gian áp dụng" icon={Gift} color="#d97706" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-white">
          <Toolbar
            leftContent={
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-900">Bảng mã giảm giá</h2>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                    {filteredPromotions.length}
                  </span>
                </div>
                {claims.length > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 border-slate-200 px-3 text-xs font-medium text-slate-700 hover:border-red-100 hover:bg-red-50 hover:text-red-600"
                    onClick={() => void handleDeleteAllClaims()}
                  >
                    Xóa tất cả
                  </Button>
                ) : null}
              </div>
            }
            query={query}
            onQueryChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            columns={columns}
            onColumnsChange={setColumns}
            tableResizeMode={tableResizeMode}
            onTableResizeModeChange={setTableResizeMode}
            selectedCount={selectedIds.size}
            onOpenAddColumn={() => toast.info("Bảng mã giảm giá dùng bộ cột cố định.")}
            onExport={() => toast.info("Không có hành động xuất file cho mã giảm giá.")}
            defaultExportFileName="ma-giam-gia"
            onCreateClick={() => setOpenClaimDialog(true)}
            createLabel="Thêm mã"
            defaultColumnIds={defaultColumns.map((column) => column.id)}
            searchPlaceholder="Tìm mã, tên chương trình..."
            showAddColumnButton={false}
            showHistoryButton={false}
            onOpenHistory={() => {}}
          />

          <FilterBar
            rangeLabel={rangeLabel}
            selectedValue={selectedStatus}
            onValueChange={(value) => {
              setSelectedStatus(value);
              setPage(1);
            }}
            filterOptions={statusOptions}
            filterLabel="Trạng thái mã giảm giá"
            allSelected={allVisibleSelected}
            disabled={visibleIds.length === 0}
            selectedCount={selectedVisibleCount}
            totalCount={visibleIds.length}
            itemLabel="mã giảm giá"
            checkboxClass={checkboxClass}
            onToggleAll={toggleAll}
          />

          {filteredPromotions.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-8 text-center">
              <p className="text-sm text-slate-400">Không tìm thấy mã giảm giá phù hợp.</p>
            </div>
          ) : (
            <TableView
              columns={columns}
              rows={paginatedPromotions}
              pageSize={pageSize}
              emptyMessage="Không tìm thấy mã giảm giá phù hợp."
              tableResizeMode={tableResizeMode}
              totalVisibleWidth={totalVisibleWidth}
              renderCell={renderCell}
              page={safePage}
              pageCount={pageCount}
              totalRows={filteredPromotions.length}
              totalLabel="Tổng mã giảm giá"
              customPageSize={customPageSize}
              openPageSizeMenu={openPageSizeMenu}
              onOpenPageSizeMenuChange={setOpenPageSizeMenu}
              onCustomPageSizeChange={setCustomPageSize}
              onApplyCustomPageSize={() => {
                const value = Number(customPageSize);
                if (value > 0) {
                  setPageSize(value);
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
          )}
        </div>
      </div>

      <Dialog open={openClaimDialog} onOpenChange={setOpenClaimDialog}>
        <DialogContent className="max-w-[420px] gap-0 rounded-xl border border-slate-200 bg-white p-0 shadow-none">
          <DialogHeader className="min-h-[61px] flex-row items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
            <DialogTitle className="text-lg font-semibold leading-7 text-slate-950">Thêm mã giảm giá</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4 px-6 py-5"
            onSubmit={(event) => {
              event.preventDefault();
              void handleClaimCode();
            }}
          >
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-900">Code</p>
              <Input
                value={codeInput}
                onChange={(event) => setCodeInput(event.target.value.toUpperCase())}
                placeholder="Nhập code mã giảm giá..."
                className="h-10 border-slate-200 text-sm uppercase"
                autoFocus
              />
              <p className="text-xs text-slate-500">Nếu mã còn hạn và còn lượt phát, hệ thống sẽ lưu vào tài khoản của bạn.</p>
            </div>
            <DialogFooter className="m-0 flex-row justify-end gap-2 border-t border-slate-200 bg-white px-0 pt-4">
              <Button type="button" variant="outline" className="h-9 border-slate-200 px-4 text-sm" onClick={() => setOpenClaimDialog(false)}>
                Đóng
              </Button>
              <Button type="submit" disabled={isClaiming} className="h-9 gap-1.5 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800">
                <Plus className="size-4" />
                Thêm mã
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
