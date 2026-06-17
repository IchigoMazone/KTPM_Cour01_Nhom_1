"use client";

import React, { useEffect, useRef, useState } from "react";
import { PageShell } from "../_components/dashboard-primitives";
import { listHomeResource } from "@/src/lib/home-api";
import { API_BASE_URL } from "@/src/lib/config";
import { fetchCurrentUser } from "@/src/lib/auth-session";
import { HomeTableContentSkeleton } from "@/src/components/common/auth-guard";
import { type DashboardTableColumn } from "@/src/components/common/dashboard-data-table";

// Internal module imports
import {
  ServicesTab,
  Service,
  FinanceRecord,
  Promotion,
  HomeServiceRow,
  HomePromotionRow,
  HomeFinanceRow,
} from "@/src/types/services";

import {
  defaultAvatarUrl,
  initialPageSize,
  serviceCustomValueStorageKey,
  promotionCustomValueStorageKey,
  serviceColumns,
  promotionColumns,
  financeColumns,
} from "@/src/constants/services";

import {
  mapHomeService,
  mapHomePromotion,
  mapHomeFinance,
  readStorageValue,
  mergeStoredCustomValues,
  assignFriendlyPromotionIds,
} from "@/src/utils/services";

import { ServiceTab } from "./_components/service-tab";
import { FinanceTab } from "./_components/finance-tab";
import { PromotionTab } from "./_components/promotion-tab";

function normalizeServiceColumns(columns: DashboardTableColumn[]) {
  const normalized = columns.map((column) =>
    column.id === "id" ? { ...column, label: "Mã DV" } : column,
  );
  if (!normalized.some((column) => column.id === "inventoryItems")) {
    const noteIndex = normalized.findIndex((column) => column.id === "note");
    normalized.splice(noteIndex === -1 ? normalized.length : noteIndex, 0, serviceColumns.find((column) => column.id === "inventoryItems")!);
  }
  return normalized;
}

function normalizeFinanceColumns(columns: DashboardTableColumn[]) {
  const existingIds = new Set(columns.map((column) => column.id));
  const defaultColumnById = new Map(financeColumns.map((column) => [column.id, column]));
  const next = columns.map((column) => ({
    ...column,
    label: defaultColumnById.get(column.id)?.label || column.label,
  }));
  financeColumns.forEach((column) => {
    if (existingIds.has(column.id)) return;
    const customerIndex = next.findIndex((item) => item.id === "customer");
    const actionIndex = next.findIndex((item) => item.id === "actions");
    const insertIndex = column.id === "inventoryName" && customerIndex !== -1
      ? customerIndex
      : actionIndex !== -1 ? actionIndex : next.length;
    next.splice(insertIndex, 0, column);
  });
  return next;
}

type ServicesTabKey = ServicesTab;

type ServicesLayoutConfig = {
  columnsService?: DashboardTableColumn[];
  columnsFinance?: DashboardTableColumn[];
  columnsPromotion?: DashboardTableColumn[];
  tableResizeModeMap?: Partial<Record<ServicesTabKey, "fit" | "custom">>;
  pageSizeMap?: Partial<Record<ServicesTabKey, number>>;
};

function defaultPerTab<T>(value: T): Record<ServicesTabKey, T> {
  return {
    "Dịch vụ": value,
    "Tài chính": value,
    "Mã giảm giá": value,
  };
}

export default function ServicesFinancePage() {
  const [currentStaffName] = useState(() => {
    if (typeof window === "undefined") return "Tài khoản";
    const username = localStorage.getItem("username");
    const displayName =
      localStorage.getItem("fullName") ||
      localStorage.getItem("fullname") ||
      localStorage.getItem("accountName");
    return displayName && displayName !== username ? displayName : "Tài khoản";
  });
  const [currentStaffAvatar] = useState(() => {
    if (typeof window === "undefined") return defaultAvatarUrl;
    return localStorage.getItem("accountImageUrl") || defaultAvatarUrl;
  });
  const [tab, setTab] = useState<ServicesTab>("Dịch vụ");
  const [services, setServices] = useState<Service[]>([]);
  const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>([]);
  const [promotions, setPromotionsRaw] = useState<Promotion[]>([]);
  const setPromotions = React.useCallback(
    (value: React.SetStateAction<Promotion[]>) => {
      setPromotionsRaw((prev) => {
        const next = typeof value === "function" ? (value as Function)(prev) : value;
        return assignFriendlyPromotionIds(next);
      });
    },
    []
  );
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isLayoutLoaded, setIsLayoutLoaded] = useState(false);
  const accountColumnsConfigRef = useRef<Record<string, unknown>>({});

  useEffect(() => {
    let alive = true;
    setIsDataLoading(true);

    Promise.all([
      listHomeResource<HomeServiceRow>("services", { limit: 500 }).catch(() => ({ items: [] })),
      listHomeResource<HomePromotionRow>("promotions", { limit: 500 }).catch(() => ({ items: [] })),
      listHomeResource<HomeFinanceRow>("finance-records", { limit: 500 }).catch(() => ({ items: [] })),
    ])
      .then(([servicesRes, promotionsRes, financeRes]) => {
        if (!alive) return;

        const mappedServices = servicesRes.items.map(mapHomeService);
        setServices(mergeStoredCustomValues(mappedServices, serviceCustomValueStorageKey));

        const mappedPromotions = promotionsRes.items.map(mapHomePromotion);
        setPromotions(mergeStoredCustomValues(mappedPromotions, promotionCustomValueStorageKey));
        setFinanceRecords(financeRes.items.map(mapHomeFinance));
      })
      .catch(() => {
        if (alive) {
          setServices([]);
          setPromotions([]);
          setFinanceRecords([]);
        }
      })
      .finally(() => {
        if (alive) setIsDataLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const [columnsService, setColumnsService] = useState<DashboardTableColumn[]>(() =>
    normalizeServiceColumns(readStorageValue("home_services_columns_service", serviceColumns)),
  );
  const [columnsFinance, setColumnsFinance] = useState<DashboardTableColumn[]>(() =>
    normalizeFinanceColumns(readStorageValue("home_services_columns_finance", financeColumns)),
  );
  const [columnsPromotion, setColumnsPromotion] = useState<DashboardTableColumn[]>(() =>
    readStorageValue("home_services_columns_promotion", promotionColumns),
  );

  const [tableResizeModeMap, setTableResizeModeMap] = useState<Record<ServicesTabKey, "fit" | "custom">>(
    defaultPerTab("fit"),
  );
  const [pageSizeMap, setPageSizeMap] = useState<Record<ServicesTabKey, number>>(
    defaultPerTab(initialPageSize),
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLayoutLoaded(true);
      return;
    }

    fetchCurrentUser(token)
      .then((data) => {
        if (!data) return;
        if (!data?.columns_config) return;
        const parsed = JSON.parse(data.columns_config) as Record<string, unknown>;
        accountColumnsConfigRef.current = parsed;
        const layout = (parsed.servicesLayout || {}) as ServicesLayoutConfig;

        if (layout.columnsService) setColumnsService(normalizeServiceColumns(layout.columnsService));
        if (layout.columnsFinance) setColumnsFinance(normalizeFinanceColumns(layout.columnsFinance));
        if (layout.columnsPromotion) setColumnsPromotion(layout.columnsPromotion);
        if (layout.tableResizeModeMap) {
          setTableResizeModeMap((prev) => ({ ...prev, ...layout.tableResizeModeMap }));
        }
        if (layout.pageSizeMap) {
          setPageSizeMap((prev) => ({ ...prev, ...layout.pageSizeMap }));
        }
      })
      .catch((error) => console.error("Error loading services layout from DB:", error))
      .finally(() => setIsLayoutLoaded(true));
  }, []);

  useEffect(() => {
    localStorage.setItem("home_services_columns_service", JSON.stringify(columnsService));
  }, [columnsService]);

  useEffect(() => {
    localStorage.setItem("home_services_columns_finance", JSON.stringify(columnsFinance));
  }, [columnsFinance]);

  useEffect(() => {
    localStorage.setItem("home_services_columns_promotion", JSON.stringify(columnsPromotion));
  }, [columnsPromotion]);

  const [viewMode, setViewMode] = useState<"Bảng" | "Bảng kéo" | "Danh sách">("Bảng");
  const tableResizeMode = tableResizeModeMap[tab];
  const setTableResizeMode = (mode: "fit" | "custom") => {
    setTableResizeModeMap((prev) => ({ ...prev, [tab]: mode }));
  };
  const pageSize = pageSizeMap[tab];
  const setPageSize = (size: number) => {
    setPageSizeMap((prev) => ({ ...prev, [tab]: size }));
  };

  useEffect(() => {
    if (!isLayoutLoaded) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const timeoutId = window.setTimeout(() => {
      const servicesLayout: ServicesLayoutConfig = {
        columnsService,
        columnsFinance,
        columnsPromotion,
        tableResizeModeMap,
        pageSizeMap,
      };
      const nextConfig = {
        ...accountColumnsConfigRef.current,
        servicesLayout,
      };
      accountColumnsConfigRef.current = nextConfig;

      fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ columns_config: JSON.stringify(nextConfig) }),
      }).catch((error) => console.error("Error saving services layout to DB:", error));
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [
    columnsFinance,
    columnsPromotion,
    columnsService,
    isLayoutLoaded,
    pageSizeMap,
    tableResizeModeMap,
  ]);

  return (
    <PageShell fullHeight>
      {isDataLoading ? (
        <HomeTableContentSkeleton />
      ) : tab === "Dịch vụ" ? (
        <ServiceTab
          services={services}
          setServices={setServices}
          columnsService={columnsService}
          setColumnsService={setColumnsService}
          viewMode={viewMode}
          setViewMode={setViewMode}
          tableResizeMode={tableResizeMode}
          setTableResizeMode={setTableResizeMode}
          pageSize={pageSize}
          setPageSize={setPageSize}
          tab={tab}
          setTab={setTab}
        />
      ) : tab === "Tài chính" ? (
        <FinanceTab
          financeRecords={financeRecords}
          setFinanceRecords={setFinanceRecords}
          columnsFinance={columnsFinance}
          setColumnsFinance={setColumnsFinance}
          viewMode={viewMode}
          setViewMode={setViewMode}
          tableResizeMode={tableResizeMode}
          setTableResizeMode={setTableResizeMode}
          pageSize={pageSize}
          setPageSize={setPageSize}
          tab={tab}
          setTab={setTab}
          currentStaffName={currentStaffName}
          currentStaffAvatar={currentStaffAvatar}
        />
      ) : (
        <PromotionTab
          services={services}
          promotions={promotions}
          setPromotions={setPromotions}
          columnsPromotion={columnsPromotion}
          setColumnsPromotion={setColumnsPromotion}
          viewMode={viewMode}
          setViewMode={setViewMode}
          tableResizeMode={tableResizeMode}
          setTableResizeMode={setTableResizeMode}
          pageSize={pageSize}
          setPageSize={setPageSize}
          tab={tab}
          setTab={setTab}
        />
      )}
    </PageShell>
  );
}
