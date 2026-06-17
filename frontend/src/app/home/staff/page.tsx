"use client";

import { useEffect, useRef, useState } from "react";
import { PageShell } from "../_components/dashboard-primitives";
import { homeApi } from "@/src/lib/home-api";
import { API_BASE_URL } from "@/src/lib/config";
import { fetchCurrentUser } from "@/src/lib/auth-session";
import { HomeTableContentSkeleton } from "@/src/components/common/auth-guard";

import {
  Tab,
  Supply,
  WashingMachineItem,
  StaffOperationsOverview,
  ColumnItem,
} from "@/src/types/staff";

import {
  defaultSupplyColumns,
  defaultMachineColumns,
} from "@/src/constants/staff";

import {
  mapHomeSupply,
  mapHomeMachine,
} from "@/src/utils/staff";

import { SupplyTab } from "./_components/supply-tab";
import { MachineTab } from "./_components/machine-tab";

type TabKey = "Kho vật tư" | "Thiết bị giặt sấy";
function defaultPerTab<T>(val: T): Record<TabKey, T> {
  return {
    "Kho vật tư": val,
    "Thiết bị giặt sấy": val,
  };
}

function normalizeSupplyColumns(source: ColumnItem[]) {
  const removedIds = new Set(["stock", "threshold"]);
  const next = source.filter((column) => !removedIds.has(column.id));
  defaultSupplyColumns.forEach((column) => {
    const existing = next.find((item) => item.id === column.id);
    if (existing) {
      existing.label = column.label;
      return;
    }
    const actionIndex = next.findIndex((item) => item.id === "actions");
    next.splice(actionIndex === -1 ? next.length : actionIndex, 0, { ...column });
  });
  return next;
}

export default function StaffOperationsPage() {
  const [tab, setTab] = useState<Tab>("Kho vật tư");
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [machines, setMachines] = useState<WashingMachineItem[]>([]);

  const [viewMode, setViewMode] = useState<"Bảng" | "Bảng kéo" | "Danh sách">("Bảng");
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isLayoutLoaded, setIsLayoutLoaded] = useState(false);
  const accountColumnsConfigRef = useRef<Record<string, unknown>>({});

  const loadStaffOverview = () =>
    homeApi<StaffOperationsOverview>("/staff/overview?limit=500", { cache: "no-store" })
      .then((overview) => {
        const storedValues = localStorage.getItem("custom_field_values");
        const customValues = storedValues ? JSON.parse(storedValues) : {};
        setSupplies((overview.inventory || []).map(mapHomeSupply).map((item) => ({
          ...item,
          ...(customValues[item.id] || {}),
        })));
        setMachines((overview.machines || []).map(mapHomeMachine).map((item) => ({
          ...item,
          ...(customValues[item.id] || {}),
        })));
      });

  const [tableResizeModeMap, setTableResizeModeMap] = useState<Record<TabKey, "fit" | "custom">>(defaultPerTab("fit"));
  const tableResizeMode = tableResizeModeMap[tab as TabKey] ?? "fit";
  const setTableResizeMode = (mode: "fit" | "custom") =>
    setTableResizeModeMap((prev) => ({ ...prev, [tab]: mode }));

  const [pageSizeMap, setPageSizeMap] = useState<Record<TabKey, number>>(defaultPerTab(10));
  const pageSize = pageSizeMap[tab as TabKey] ?? 10;
  const setPageSize = (s: number) => setPageSizeMap((prev) => ({ ...prev, [tab]: s }));

  const [columnsSupply, setColumnsSupply] = useState<ColumnItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("columns_supply");
      if (saved) {
        try {
          return normalizeSupplyColumns(JSON.parse(saved));
        } catch {}
      }
    }
    return defaultSupplyColumns;
  });
  const [columnsMachine, setColumnsMachine] = useState<ColumnItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("columns_machine");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return defaultMachineColumns;
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchCurrentUser(token)
        .then((data) => {
          if (!data) return;
          if (data && data.columns_config) {
            try {
              const parsed = JSON.parse(data.columns_config);
              accountColumnsConfigRef.current = parsed;
              if (parsed.columnsSupply) setColumnsSupply(normalizeSupplyColumns(parsed.columnsSupply));
              if (parsed.columnsMachine) setColumnsMachine(parsed.columnsMachine);
              if (parsed.tableResizeModeMap && typeof parsed.tableResizeModeMap === "object") {
                setTableResizeModeMap((prev) => ({ ...prev, ...parsed.tableResizeModeMap }));
              }
              if (parsed.pageSizeMap && typeof parsed.pageSizeMap === "object") {
                setPageSizeMap((prev) => ({ ...prev, ...parsed.pageSizeMap }));
              }
            } catch (e) {
              console.error("Error parsing columns_config from DB:", e);
            }
          }
          setIsLayoutLoaded(true);
        })
        .catch((err) => {
          console.error("Error fetching page size:", err);
          setIsLayoutLoaded(true);
        });
    } else {
      setIsLayoutLoaded(true);
    }

    loadStaffOverview()
      .then(() => {
        setIsDataLoading(false);
      })
      .catch(() => {
        setSupplies([]);
        setMachines([]);
        setIsDataLoading(false);
      });
  }, []);

  useEffect(() => {
    const refresh = () => {
      void loadStaffOverview();
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("home-orders-changed", refresh);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.removeEventListener("home-orders-changed", refresh);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);

  const saveLayoutSettingsToDb = (
    resizeModeMap?: Record<TabKey, "fit" | "custom">,
    supplyCols?: ColumnItem[],
    machineCols?: ColumnItem[],
    pageSizes?: Record<TabKey, number>
  ) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const nextResizeModeMap = resizeModeMap ?? tableResizeModeMap;
    const nextSupplyCols = supplyCols ?? columnsSupply;
    const nextMachineCols = machineCols ?? columnsMachine;
    const nextPageSizes = pageSizes ?? pageSizeMap;

    const nextConfig = {
      ...accountColumnsConfigRef.current,
      columnsSupply: nextSupplyCols,
      columnsMachine: nextMachineCols,
      tableResizeModeMap: nextResizeModeMap,
      pageSizeMap: nextPageSizes,
    };
    accountColumnsConfigRef.current = nextConfig;
    const configStr = JSON.stringify(nextConfig);

    fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        columns_config: configStr,
      }),
    }).catch((err) => {
      console.error("Error saving layout to DB:", err);
    });
  };

  useEffect(() => {
    localStorage.setItem("columns_supply", JSON.stringify(columnsSupply));
    if (isLayoutLoaded) {
      saveLayoutSettingsToDb(undefined, columnsSupply, undefined);
    }
  }, [columnsSupply, isLayoutLoaded]);

  useEffect(() => {
    localStorage.setItem("columns_machine", JSON.stringify(columnsMachine));
    if (isLayoutLoaded) {
      saveLayoutSettingsToDb(undefined, undefined, columnsMachine);
    }
  }, [columnsMachine, isLayoutLoaded]);

  useEffect(() => {
    if (isLayoutLoaded) {
      saveLayoutSettingsToDb(tableResizeModeMap);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableResizeModeMap, isLayoutLoaded]);

  useEffect(() => {
    if (isLayoutLoaded) {
      saveLayoutSettingsToDb(undefined, undefined, undefined, pageSizeMap);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSizeMap, isLayoutLoaded]);

  // Sync custom fields value changes in items to local storage
  useEffect(() => {
    if (supplies.length === 0 && machines.length === 0) return;
    const storedValues = localStorage.getItem("custom_field_values");
    const customValues = storedValues ? JSON.parse(storedValues) : {};
    let changed = false;

    const syncCustoms = (items: any[]) => {
      items.forEach((item) => {
        const itemCustoms: Record<string, any> = {};
        Object.keys(item).forEach((key) => {
          if (key.startsWith("custom_")) {
            itemCustoms[key] = item[key];
          }
        });
        if (Object.keys(itemCustoms).length > 0) {
          customValues[item.id] = { ...(customValues[item.id] || {}), ...itemCustoms };
          changed = true;
        }
      });
    };

    syncCustoms(supplies);
    syncCustoms(machines);

    if (changed) {
      localStorage.setItem("custom_field_values", JSON.stringify(customValues));
    }
  }, [supplies, machines]);

  if (isDataLoading) {
    return <HomeTableContentSkeleton />;
  }

  return (
    <PageShell fullHeight>
      {tab === "Kho vật tư" ? (
        <SupplyTab
          supplies={supplies}
          setSupplies={setSupplies}
          columnsSupply={columnsSupply}
          setColumnsSupply={setColumnsSupply}
          viewMode={viewMode}
          setViewMode={setViewMode}
          tableResizeMode={tableResizeMode}
          setTableResizeMode={setTableResizeMode}
          pageSize={pageSize}
          setPageSize={setPageSize}
          tab={tab}
          setTab={setTab}
        />
      ) : (
        <MachineTab
          machines={machines}
          setMachines={setMachines}
          columnsMachine={columnsMachine}
          setColumnsMachine={setColumnsMachine}
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
