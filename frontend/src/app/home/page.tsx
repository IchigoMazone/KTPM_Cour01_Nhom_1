"use client";

import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CalendarClock,
  PackageCheck,
  Wallet,
  WashingMachine,
  FlaskConical,
  StickyNote,
  CheckCircle2,
  Users,
  Settings,
} from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  Bar,
  BarChart,
  YAxis,
} from "recharts";
import { PageShell } from "./_components/dashboard-primitives";
import { homeApi } from "@/src/lib/home-api";
import { HomeDashboardContentSkeleton } from "@/src/components/common/auth-guard";
import { useDashboardTimeRangeStore } from "@/src/context/useDashboardTimeRangeStore";
import { formatRange, normalizeRange, toInputDate } from "@/src/utils/dashboard-time";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type HomeDashboardSummary = {
  total_orders: number;
  active_orders: number;
  completed_orders: number;
  paid_revenue: number;
  support_requests?: number;
  open_tickets?: number;
  total_customers: number;
  active_staff: number;
  low_inventory_items: number;
  active_machines: number;
  total_machines: number;
};

type HomeDashboardOverview = {
  summary: HomeDashboardSummary;
  order_status_mix: Array<{ name: string; value: number }>;
  service_mix: Array<{ name: string; value: number }>;
  revenue_7_days: Array<{ day: string; revenue: number }>;
  appointments: Array<{
    order_code: string;
    customer_name: string;
    service_name: string;
    appointment_time: string;
    date_label: string;
    appointment_type: string;
  }>;
  machines: Array<{
    machine_code: string;
    name: string;
    machine_type: string;
    status: string;
    order_code?: string | null;
    customer_name?: string | null;
  }>;
  inventory: Array<{
    item_code: string;
    name: string;
    unit: string;
    inventory_type: string;
    initial_quantity: number;
    quantity: number;
    status: string;
  }>;
  reminders: Array<{ text: string; type: string }>;
};

type RevenueBucket = {
  start_date: string;
  end_date: string;
  revenue: number;
};

type RevenueResponse = {
  start_date: string;
  end_date: string;
  group_days: number;
  items: RevenueBucket[];
};

function addCalendarDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toInputDate(date);
}

function inclusiveDaysBetween(start: string, end: string) {
  const startTime = new Date(`${start}T00:00:00`).getTime();
  const endTime = new Date(`${end}T00:00:00`).getTime();
  return Math.floor((endTime - startTime) / 86_400_000) + 1;
}

const statusColors: Record<string, string> = {
  "Hoàn thành": "#10b981",
  "Đang xử lý": "#f59e0b",
  "Quá hạn": "#f43f5e",
  "Mới": "#3b82f6",
};
const chartColors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#06b6d4", "#f43f5e"];
const DEFAULT_MAX_DISPLAYED_INVENTORY = 6;
const MAX_DISPLAYED_INVENTORY_LIMIT = 9;
const reminderTypeColors: Record<string, string> = {
  "Khẩn cấp": "#f43f5e",
  "Quan trọng": "#f59e0b",
  "Bình thường": "#0ea5e9",
  "Ít quan trọng": "#22c55e",
  "Theo dõi": "#a855f7",
  "Lưu ý": "#f97316",
  "Nhắc nhở": "#6366f1",
};
const customReminderColors = ["#14b8a6", "#f97316", "#6366f1", "#06b6d4", "#ec4899"];

function getReminderTypeColor(type: string) {
  if (reminderTypeColors[type]) return reminderTypeColors[type];
  const hash = Array.from(type).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return customReminderColors[hash % customReminderColors.length];
}
function formatCurrency(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}tr`;
  }
  return value.toLocaleString("vi-VN");
}

function KpiCard({
  title,
  value,
  hint,
  detail,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  hint: string;
  detail: string;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="flex h-full flex-col justify-between rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:border-slate-300">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-900">{title}</p>
          <p className="mt-1 truncate text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
        </div>
        <span
          className="grid size-10 shrink-0 place-items-center rounded-xl"
          style={{ color, backgroundColor: `${color}12` }}
        >
          <Icon className="size-4.5" />
        </span>
      </div>
      <div className="mt-2 flex min-w-0 items-end justify-between gap-2 border-t border-slate-200 pt-2">
        <p className="min-w-0 truncate text-[11px] text-slate-400">{hint}</p>
        <span
          className="shrink-0 rounded-md px-1.5 py-1 text-[10px] font-semibold"
          style={{ color, backgroundColor: `${color}10` }}
        >
          {detail}
        </span>
      </div>
    </div>
  );
}

export default function HomeOverview() {
  const dashboardRange = useDashboardTimeRangeStore((state) => state.range);
  const normalizedDashboardRange = normalizeRange(dashboardRange);
  const selectedRevenueStartDate = toInputDate(normalizedDashboardRange.start);
  const revenueEndDate = toInputDate(normalizedDashboardRange.end);
  const dashboardRangeLabel = formatRange(normalizedDashboardRange);
  const overviewPath = `/dashboard/overview?${new URLSearchParams({
    start_date: selectedRevenueStartDate,
    end_date: revenueEndDate,
  }).toString()}`;
  const selectedRevenueDays = inclusiveDaysBetween(selectedRevenueStartDate, revenueEndDate);
  const revenueStartDate = selectedRevenueDays < 7
    ? addCalendarDays(revenueEndDate, -6)
    : selectedRevenueStartDate;
  const revenueRangeDays = inclusiveDaysBetween(revenueStartDate, revenueEndDate);
  const [overview, setOverview] = useState<HomeDashboardOverview | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [hideEmptyInventory, setHideEmptyInventory] = useState(true);
  const [visibleInventoryCodes, setVisibleInventoryCodes] = useState<string[] | null>(null);
  const [maxDisplayedInventory, setMaxDisplayedInventory] = useState(DEFAULT_MAX_DISPLAYED_INVENTORY);
  const [maxDisplayedInventoryInput, setMaxDisplayedInventoryInput] = useState(
    String(DEFAULT_MAX_DISPLAYED_INVENTORY),
  );
  const [inventorySettingsLoaded, setInventorySettingsLoaded] = useState(false);
  const [visibleReminderKeys, setVisibleReminderKeys] = useState<string[] | null>(null);
  const [maxDisplayedReminders, setMaxDisplayedReminders] = useState(6);
  const [maxDisplayedRemindersInput, setMaxDisplayedRemindersInput] = useState("6");
  const [reminderSettingsLoaded, setReminderSettingsLoaded] = useState(false);
  const [visibleMachineCodes, setVisibleMachineCodes] = useState<string[] | null>(null);
  const [maxDisplayedMachines, setMaxDisplayedMachines] = useState(6);
  const [maxDisplayedMachinesInput, setMaxDisplayedMachinesInput] = useState("6");
  const [machineSettingsLoaded, setMachineSettingsLoaded] = useState(false);
  const [maxDisplayedAppointments, setMaxDisplayedAppointments] = useState(6);
  const [maxDisplayedAppointmentsInput, setMaxDisplayedAppointmentsInput] = useState("6");
  const [appointmentSettingsLoaded, setAppointmentSettingsLoaded] = useState(false);
  const [revenueGroupDays, setRevenueGroupDays] = useState(1);
  const [revenueGroupDaysInput, setRevenueGroupDaysInput] = useState("1");
  const [revenueItems, setRevenueItems] = useState<RevenueBucket[] | null>(null);
  const [revenueSettingsLoaded, setRevenueSettingsLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    const loadOverview = homeApi<HomeDashboardOverview>(overviewPath, { cache: "no-store" })
      .then((data) => {
        if (!alive) return;
        setOverview(data);
      })
      .catch(() => {
        if (!alive) return;
        setOverview(null);
      });

    Promise.allSettled([loadOverview]).then(() => {
      if (alive) setIsDataLoading(false);
    });

    return () => {
      alive = false;
    };
  }, [overviewPath]);

  useEffect(() => {
    const refreshOverview = () => {
      homeApi<HomeDashboardOverview>(overviewPath, { cache: "no-store" })
        .then(setOverview)
        .catch(() => undefined);
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refreshOverview();
    };
    const refreshInterval = window.setInterval(refreshOverview, 10_000);
    window.addEventListener("home-memos-changed", refreshOverview);
    window.addEventListener("home-orders-changed", refreshOverview);
    window.addEventListener("focus", refreshOverview);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.clearInterval(refreshInterval);
      window.removeEventListener("home-memos-changed", refreshOverview);
      window.removeEventListener("home-orders-changed", refreshOverview);
      window.removeEventListener("focus", refreshOverview);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [overviewPath]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("home-overview-inventory-setup");
      if (raw) {
        const parsed = JSON.parse(raw) as { hideEmpty?: boolean; visibleCodes?: string[] | null; maxItems?: number };
        setHideEmptyInventory(parsed.hideEmpty !== false);
        setVisibleInventoryCodes(Array.isArray(parsed.visibleCodes) ? parsed.visibleCodes : null);
        if (
          Number.isInteger(parsed.maxItems)
          && Number(parsed.maxItems) >= 1
          && Number(parsed.maxItems) <= MAX_DISPLAYED_INVENTORY_LIMIT
        ) {
          const maxItems = Number(parsed.maxItems);
          setMaxDisplayedInventory(maxItems);
          setMaxDisplayedInventoryInput(String(maxItems));
        }
      }
    } catch {
      setHideEmptyInventory(true);
      setVisibleInventoryCodes(null);
    } finally {
      setInventorySettingsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!inventorySettingsLoaded) return;
    window.localStorage.setItem(
      "home-overview-inventory-setup",
      JSON.stringify({
        hideEmpty: hideEmptyInventory,
        visibleCodes: visibleInventoryCodes,
        maxItems: maxDisplayedInventory,
      }),
    );
  }, [hideEmptyInventory, inventorySettingsLoaded, maxDisplayedInventory, visibleInventoryCodes]);

  const commitMaxDisplayedInventory = () => {
    const parsed = Number(maxDisplayedInventoryInput);
    const nextValue = Number.isFinite(parsed)
      ? Math.max(1, Math.min(MAX_DISPLAYED_INVENTORY_LIMIT, Math.floor(parsed)))
      : maxDisplayedInventory;
    setMaxDisplayedInventory(nextValue);
    setMaxDisplayedInventoryInput(String(nextValue));
  };

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("home-overview-reminder-setup");
      if (raw) {
        const parsed = JSON.parse(raw) as { visibleKeys?: string[] | null; maxItems?: number };
        setVisibleReminderKeys(Array.isArray(parsed.visibleKeys) ? parsed.visibleKeys : null);
        if (
          Number.isInteger(parsed.maxItems)
          && Number(parsed.maxItems) >= 1
          && Number(parsed.maxItems) <= MAX_DISPLAYED_INVENTORY_LIMIT
        ) {
          const maxItems = Number(parsed.maxItems);
          setMaxDisplayedReminders(maxItems);
          setMaxDisplayedRemindersInput(String(maxItems));
        }
      }
    } catch {
      setVisibleReminderKeys(null);
    } finally {
      setReminderSettingsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!reminderSettingsLoaded) return;
    window.localStorage.setItem(
      "home-overview-reminder-setup",
      JSON.stringify({ visibleKeys: visibleReminderKeys, maxItems: maxDisplayedReminders }),
    );
  }, [maxDisplayedReminders, reminderSettingsLoaded, visibleReminderKeys]);

  const commitMaxDisplayedReminders = () => {
    const parsed = Number(maxDisplayedRemindersInput);
    const nextValue = Number.isFinite(parsed)
      ? Math.max(1, Math.min(MAX_DISPLAYED_INVENTORY_LIMIT, Math.floor(parsed)))
      : maxDisplayedReminders;
    setMaxDisplayedReminders(nextValue);
    setMaxDisplayedRemindersInput(String(nextValue));
  };

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("home-overview-machine-setup");
      if (raw) {
        const parsed = JSON.parse(raw) as { visibleCodes?: string[] | null; maxItems?: number };
        setVisibleMachineCodes(Array.isArray(parsed.visibleCodes) ? parsed.visibleCodes : null);
        if (
          Number.isInteger(parsed.maxItems)
          && Number(parsed.maxItems) >= 1
          && Number(parsed.maxItems) <= MAX_DISPLAYED_INVENTORY_LIMIT
        ) {
          const maxItems = Number(parsed.maxItems);
          setMaxDisplayedMachines(maxItems);
          setMaxDisplayedMachinesInput(String(maxItems));
        }
      }
    } catch {
      setVisibleMachineCodes(null);
    } finally {
      setMachineSettingsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!machineSettingsLoaded) return;
    window.localStorage.setItem(
      "home-overview-machine-setup",
      JSON.stringify({ visibleCodes: visibleMachineCodes, maxItems: maxDisplayedMachines }),
    );
  }, [machineSettingsLoaded, maxDisplayedMachines, visibleMachineCodes]);

  const commitMaxDisplayedMachines = () => {
    const parsed = Number(maxDisplayedMachinesInput);
    const nextValue = Number.isFinite(parsed)
      ? Math.max(1, Math.min(MAX_DISPLAYED_INVENTORY_LIMIT, Math.floor(parsed)))
      : maxDisplayedMachines;
    setMaxDisplayedMachines(nextValue);
    setMaxDisplayedMachinesInput(String(nextValue));
  };

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("home-overview-appointment-setup");
      if (raw) {
        const parsed = JSON.parse(raw) as { maxItems?: number };
        if (
          Number.isInteger(parsed.maxItems)
          && Number(parsed.maxItems) >= 1
          && Number(parsed.maxItems) <= MAX_DISPLAYED_INVENTORY_LIMIT
        ) {
          const maxItems = Number(parsed.maxItems);
          setMaxDisplayedAppointments(maxItems);
          setMaxDisplayedAppointmentsInput(String(maxItems));
        }
      }
    } finally {
      setAppointmentSettingsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!appointmentSettingsLoaded) return;
    window.localStorage.setItem(
      "home-overview-appointment-setup",
      JSON.stringify({ maxItems: maxDisplayedAppointments }),
    );
  }, [appointmentSettingsLoaded, maxDisplayedAppointments]);

  const commitMaxDisplayedAppointments = () => {
    const parsed = Number(maxDisplayedAppointmentsInput);
    const nextValue = Number.isFinite(parsed)
      ? Math.max(1, Math.min(MAX_DISPLAYED_INVENTORY_LIMIT, Math.floor(parsed)))
      : maxDisplayedAppointments;
    setMaxDisplayedAppointments(nextValue);
    setMaxDisplayedAppointmentsInput(String(nextValue));
  };

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("home-overview-revenue-setup");
      if (raw) {
        const parsed = JSON.parse(raw) as { groupDays?: number };
        if (Number.isInteger(parsed.groupDays) && Number(parsed.groupDays) >= 1) {
          const groupDays = Math.min(3651, Number(parsed.groupDays));
          setRevenueGroupDays(groupDays);
          setRevenueGroupDaysInput(String(groupDays));
        }
      }
    } catch {
      setRevenueGroupDays(1);
      setRevenueGroupDaysInput("1");
    } finally {
      setRevenueSettingsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!revenueSettingsLoaded) return;
    const effectiveGroupDays = revenueRangeDays <= 7
      ? 1
      : Math.min(revenueRangeDays, revenueGroupDays);
    window.localStorage.setItem(
      "home-overview-revenue-setup",
      JSON.stringify({ groupDays: revenueGroupDays }),
    );

    const search = new URLSearchParams({
      start_date: revenueStartDate,
      end_date: revenueEndDate,
      group_days: String(effectiveGroupDays),
    });
    homeApi<RevenueResponse>(`/dashboard/revenue?${search.toString()}`, { cache: "no-store" })
      .then((data) => setRevenueItems(data.items))
      .catch(() => undefined);
  }, [revenueEndDate, revenueGroupDays, revenueRangeDays, revenueSettingsLoaded, revenueStartDate]);

  const commitRevenueGroupDays = () => {
    const parsed = Number(revenueGroupDaysInput);
    const groupDays = Number.isFinite(parsed)
      ? Math.max(1, Math.min(revenueRangeDays, Math.floor(parsed)))
      : 1;
    setRevenueGroupDays(groupDays);
    setRevenueGroupDaysInput(String(groupDays));
  };

  const summary = overview?.summary;
  const supportRequestCount = Number(summary?.support_requests ?? summary?.open_tickets ?? 0);
  const machines = overview?.machines || [];
  const visibleMachines = useMemo(() => {
    const visibleCodeSet = visibleMachineCodes ? new Set(visibleMachineCodes) : null;
    return machines.filter((machine) => !visibleCodeSet || visibleCodeSet.has(machine.machine_code));
  }, [machines, visibleMachineCodes]);
  const displayedMachines = useMemo(
    () => visibleMachines.slice(0, maxDisplayedMachines),
    [maxDisplayedMachines, visibleMachines],
  );
  const toggleMachine = (code: string, checked: boolean) => {
    setVisibleMachineCodes((prev) => {
      const current = new Set(prev ?? machines.map((machine) => machine.machine_code));
      if (checked) current.add(code);
      else current.delete(code);
      return Array.from(current);
    });
  };
  const upcomingAppointments = overview?.appointments || [];
  const displayedAppointments = useMemo(
    () => upcomingAppointments.slice(0, maxDisplayedAppointments),
    [maxDisplayedAppointments, upcomingAppointments],
  );
  const inventoryOverview = useMemo(
    () => (overview?.inventory || []).map((item) => {
      const quantity = Number(item.quantity || 0);
      const initialQuantity = Number(item.initial_quantity || 0);
      const target = Math.max(initialQuantity, quantity, 1);
      return {
        ...item,
        code: item.item_code.startsWith("VT-") ? item.item_code : `VT-${item.item_code}`,
        current: `${quantity.toLocaleString("vi-VN")} ${item.unit}`,
        initial: `${initialQuantity.toLocaleString("vi-VN")} ${item.unit}`,
        stockRatio: `${quantity.toLocaleString("vi-VN")}/${initialQuantity.toLocaleString("vi-VN")} ${item.unit}`,
        safetyPct: quantity <= 0 ? 0 : Math.min(100, Math.round((quantity / target) * 100)),
        emptyPct: quantity <= 0 ? 100 : Math.max(0, 100 - Math.min(100, Math.round((quantity / target) * 100))),
        color: item.status === "Cần mua" ? "#ef4444" : item.status === "Sắp hết" ? "#f59e0b" : "#10b981",
        progressColor: item.status === "Cần mua" ? "#fca5a5" : item.status === "Sắp hết" ? "#fcd34d" : "#6ee7b7",
        displayStatus: item.status === "Cần mua" ? "Hết" : item.status,
      };
    }),
    [overview],
  );
  const visibleInventoryOverview = useMemo(() => {
    const visibleCodeSet = visibleInventoryCodes ? new Set(visibleInventoryCodes) : null;
    return inventoryOverview.filter((item) => {
      if (item.status === "Cần mua") return false;
      if (visibleCodeSet && !visibleCodeSet.has(item.code)) return false;
      return true;
    });
  }, [inventoryOverview, visibleInventoryCodes]);
  const displayedInventoryOverview = useMemo(
    () => visibleInventoryOverview.slice(0, maxDisplayedInventory),
    [maxDisplayedInventory, visibleInventoryOverview],
  );
  const selectableInventoryOverview = useMemo(
    () => inventoryOverview.filter((item) => item.status !== "Cần mua"),
    [inventoryOverview],
  );
  const toggleInventoryCode = (code: string, checked: boolean) => {
    setVisibleInventoryCodes((prev) => {
      const selectableCodes = new Set(selectableInventoryOverview.map((item) => item.code));
      const current = new Set((prev ?? selectableInventoryOverview.map((item) => item.code)).filter((itemCode) => selectableCodes.has(itemCode)));
      if (checked) current.add(code);
      else current.delete(code);
      return Array.from(current);
    });
  };
  const reminders = useMemo(
    () => (overview?.reminders || []).map((note) => ({
      ...note,
      key: `${note.type}:${note.text}`,
    })),
    [overview],
  );
  const visibleReminders = useMemo(() => {
    const visibleKeySet = visibleReminderKeys ? new Set(visibleReminderKeys) : null;
    return reminders.filter((note) => !visibleKeySet || visibleKeySet.has(note.key));
  }, [reminders, visibleReminderKeys]);
  const displayedReminders = useMemo(
    () => visibleReminders.slice(0, maxDisplayedReminders),
    [maxDisplayedReminders, visibleReminders],
  );
  const toggleReminder = (key: string, checked: boolean) => {
    setVisibleReminderKeys((prev) => {
      const current = new Set(prev ?? reminders.map((note) => note.key));
      if (checked) current.add(key);
      else current.delete(key);
      return Array.from(current);
    });
  };
  const todayMix = ["Hoàn thành", "Đang xử lý", "Quá hạn", "Mới"].map((name) => ({
    name,
    value: Number(overview?.order_status_mix.find((item) => item.name === name)?.value || 0),
    color: statusColors[name],
  }));
  const serviceMix = (overview?.service_mix || []).map((item, index) => ({
    ...item,
    color: chartColors[index % chartColors.length],
  }));
  const revenueChartData = (
    revenueItems
    ?? (overview?.revenue_7_days || []).map((item) => ({
      start_date: item.day,
      end_date: item.day,
      revenue: item.revenue,
    }))
  ).map((item) => {
    const startLabel = new Date(`${item.start_date}T00:00:00`).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
    const endLabel = new Date(`${item.end_date}T00:00:00`).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
    return {
      day: item.start_date === item.end_date ? startLabel : `${startLabel}–${endLabel}`,
      fullRange: item.start_date === item.end_date
        ? new Date(`${item.start_date}T00:00:00`).toLocaleDateString("vi-VN")
        : `${new Date(`${item.start_date}T00:00:00`).toLocaleDateString("vi-VN")} - ${new Date(`${item.end_date}T00:00:00`).toLocaleDateString("vi-VN")}`,
      revenue: Number(item.revenue || 0),
    };
  });
  const displayedRevenueGroupDays = revenueRangeDays <= 7
    ? 1
    : Math.min(revenueRangeDays, revenueGroupDays);
  const totalMachines = summary?.total_machines || 0;
  const usedMachinesCount = summary?.active_machines || 0;
  const machineEfficiency = totalMachines ? Math.round((usedMachinesCount / totalMachines) * 100) : 0;
  const completedOrders = summary?.completed_orders || 0;
  const activeOrderRate = summary?.total_orders
    ? Math.round((summary.active_orders / summary.total_orders) * 100)
    : 0;
  const completedOrderRate = summary?.total_orders
    ? Math.round((completedOrders / summary.total_orders) * 100)
    : 0;
  const unusedMachines = Math.max(0, totalMachines - usedMachinesCount);

  if (isDataLoading) {
    return <HomeDashboardContentSkeleton />;
  }

  return (
    <PageShell fullHeight>
      <div className="h-full min-h-0 flex-1 overflow-hidden bg-white w-full">
        <div className="flex flex-col gap-3.5 p-0 w-full h-full min-h-0">
          {/* Top Panel: 3-3 cards (span 5), 2 donuts (span 3), 1 revenue chart (span 4) */}
          <div className="grid gap-3.5 grid-cols-1 lg:grid-cols-12 flex-[1.1] min-h-0 w-full items-stretch">
            {/* Left section: 6 compact KPI Cards in a 3x2 grid */}
            <div className="lg:col-span-5 h-full">
              <div className="grid grid-cols-2 auto-rows-fr gap-3 h-full">
                <KpiCard
                  title="Tổng đơn"
                  value={summary ? String(summary.total_orders) : "-"}
                  hint={summary ? `${dashboardRangeLabel} · ${summary.total_customers} khách hàng` : "Đang lấy dữ liệu"}
                  detail={summary ? `${summary.total_customers} khách` : "Chưa có"}
                  icon={PackageCheck}
                  color="#06b6d4"
                />
                <KpiCard
                  title="Doanh thu"
                  value={summary ? `${formatCurrency(Number(summary.paid_revenue || 0))}đ` : "-"}
                  hint={`${dashboardRangeLabel} · Doanh thu đã thu`}
                  detail="Đã ghi nhận"
                  icon={Wallet}
                  color="#10b981"
                />
                <KpiCard
                  title="Đơn đang xử lý"
                  value={summary ? String(summary.active_orders) : "-"}
                  hint={`${dashboardRangeLabel} · Giặt, sấy, kiểm tra`}
                  detail={`${activeOrderRate}% tổng đơn`}
                  icon={WashingMachine}
                  color="#f59e0b"
                />
                <KpiCard
                  title="Yêu cầu hỗ trợ"
                  value={summary ? String(supportRequestCount) : "-"}
                  hint={`${dashboardRangeLabel} · Yêu cầu đã ghi nhận`}
                  detail={supportRequestCount ? `${supportRequestCount} yêu cầu` : "Chưa có"}
                  icon={AlertTriangle}
                  color="#ef4444"
                />
                <KpiCard
                  title="Đơn hoàn thành"
                  value={summary ? String(completedOrders) : "-"}
                  hint={`${dashboardRangeLabel} · Đã giao và tất toán`}
                  detail={`${completedOrderRate}% tổng đơn`}
                  icon={CheckCircle2}
                  color="#10b981"
                />
                <KpiCard
                  title="Máy được sử dụng"
                  value={`${usedMachinesCount}/${totalMachines}`}
                  hint={`${dashboardRangeLabel} · Tỷ lệ sử dụng ${machineEfficiency}%`}
                  detail={`${unusedMachines} máy chưa dùng`}
                  icon={WashingMachine}
                  color="#3b82f6"
                />
              </div>
            </div>

            {/* Middle-Right section: 2 Donut charts stacked vertically */}
            <div className="lg:col-span-3 flex flex-col gap-3 h-full">
              {/* Donut Chart 1: Cơ cấu trạng thái đơn */}
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white flex flex-col justify-between flex-1 py-2.5 px-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 shrink-0">
                  <span className="text-sm font-bold text-slate-800">Cơ cấu trạng thái đơn</span>
                  <span className="text-xs font-semibold text-slate-500">
                    {summary ? `${summary.total_orders} đơn` : "0 đơn"}
                  </span>
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-4 pt-1.5 flex-1 min-h-0">
                  <div className="relative h-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={todayMix} dataKey="value" innerRadius={40} outerRadius={56} paddingAngle={2.5} cornerRadius={4}>
                          {todayMix.map((item, index) => (
                            <Cell key={`${item.name}-${index}`} fill={item.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            return (
                              <div className="rounded border border-slate-200 bg-white p-1.5 text-xs font-semibold text-slate-900">
                                {payload[0].name}: {payload[0].value} đơn
                              </div>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-base font-extrabold text-slate-900 leading-none">
                        {summary?.total_orders ?? 0}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5 justify-center flex flex-col text-xs">
                    {todayMix.map((item, index) => (
                      <div key={`${item.name}-${index}`} className="flex items-center justify-between gap-1">
                        <span className="inline-flex min-w-0 items-center gap-1.5 text-slate-500">
                          <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="truncate">{item.name}</span>
                        </span>
                        <span className="font-bold text-slate-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Donut Chart 2: Cơ cấu dịch vụ */}
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white flex flex-col justify-between flex-1 py-2.5 px-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 shrink-0">
                  <span className="text-sm font-bold text-slate-800">Cơ cấu dịch vụ trong kỳ</span>
                  <span className="text-xs font-semibold text-slate-500">
                    {serviceMix.reduce((sum, item) => sum + Number(item.value), 0)} lượt
                  </span>
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-4 pt-1.5 flex-1 min-h-0">
                  <div className="relative h-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={serviceMix} dataKey="value" innerRadius={40} outerRadius={56} paddingAngle={2.5} cornerRadius={4}>
                          {serviceMix.map((item, index) => (
                            <Cell key={`${item.name}-${index}`} fill={item.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            return (
                              <div className="rounded border border-slate-200 bg-white p-1.5 text-xs font-semibold text-slate-900">
                                {payload[0].name}: {payload[0].value} lượt
                              </div>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-base font-extrabold text-slate-900 leading-none">
                        {serviceMix.reduce((sum, item) => sum + Number(item.value), 0)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5 justify-center flex flex-col text-xs">
                    {serviceMix.map((item, index) => (
                      <div key={`${item.name}-${index}`} className="flex items-center justify-between gap-1">
                        <span className="inline-flex min-w-0 items-center gap-1.5 text-slate-500">
                          <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="truncate">{item.name}</span>
                        </span>
                        <span className="font-bold text-slate-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Far-Right section: 1 Revenue BarChart (aligned and stretched) */}
            <div className="lg:col-span-4 overflow-hidden rounded-lg border border-slate-200 bg-white flex flex-col p-3 h-full min-h-0 justify-between">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 shrink-0">
                <span className="text-sm font-bold text-slate-800">Doanh thu</span>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                    {revenueRangeDays} ngày - {displayedRevenueGroupDays} ngày - {revenueChartData.length} cột
                  </span>
                  {revenueRangeDays > 7 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex size-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                          aria-label="Thiết lập số ngày mỗi cột doanh thu"
                        >
                          <Settings className="size-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64">
                        <DropdownMenuLabel>Thiết lập doanh thu</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div
                          className="px-2 py-2"
                          onClick={(event) => event.stopPropagation()}
                          onKeyDown={(event) => event.stopPropagation()}
                        >
                          <label className="grid grid-cols-[1fr_100px] items-center gap-3 text-sm text-slate-700">
                            <span>Số ngày / cột</span>
                            <Input
                              type="text"
                              inputMode="numeric"
                              value={revenueGroupDaysInput}
                              onChange={(event) => setRevenueGroupDaysInput(event.target.value.replace(/\D/g, "").slice(0, 4))}
                              onBlur={commitRevenueGroupDays}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  commitRevenueGroupDays();
                                  event.currentTarget.blur();
                                }
                              }}
                              className="h-8 text-center text-xs"
                            />
                          </label>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
              <div className="flex-1 pt-3 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueChartData} margin={{ top: 10, right: 5, left: 5, bottom: 5 }}>
                    <defs>
                      <linearGradient id="revenueBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.85}/>
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.15}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} dy={8} style={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ fill: "#f0f9ff", fillOpacity: 0.7 }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="rounded border border-sky-100 bg-white/95 p-2 text-xs shadow-sm">
                            <p className="font-semibold text-slate-400">{payload[0].payload.fullRange}</p>
                            <p className="mt-0.5 font-bold text-slate-900">
                              {Number(payload[0].value).toLocaleString("vi-VN")}đ
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="revenue" fill="url(#revenueBarGradient)" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Details Lists (Original 4 columns restored exactly, stretched vertically) */}
          <div className="grid gap-3.5 xl:grid-cols-4 w-full flex-1 min-h-0">
            {/* Đơn sắp tới hẹn (Ngoài cùng bên trái) */}
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col h-full min-h-0">
              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5 shrink-0">
                <div className="flex items-center gap-2">
                  <CalendarClock className="size-4 text-slate-500" />
                  <h2 className="text-sm font-semibold text-slate-900">Đơn sắp tới hẹn</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-400">
                    {displayedAppointments.length}/{maxDisplayedAppointments} lịch hẹn
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex size-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                        aria-label="Thiết lập lịch hẹn hiển thị"
                      >
                        <Settings className="size-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Thiết lập lịch hẹn</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div
                        className="flex items-center justify-between gap-3 px-2 py-1.5"
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                      >
                        <span className="text-sm text-slate-700">Số ô tối đa</span>
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={maxDisplayedAppointmentsInput}
                          onChange={(event) => {
                            const value = event.target.value.replace(/\D/g, "").slice(0, 1);
                            setMaxDisplayedAppointmentsInput(value);
                            if (/^[1-9]$/.test(value)) setMaxDisplayedAppointments(Number(value));
                          }}
                          onBlur={commitMaxDisplayedAppointments}
                          onKeyDown={(event) => {
                            event.stopPropagation();
                            if (event.key === "Enter") {
                              commitMaxDisplayedAppointments();
                              event.currentTarget.blur();
                            }
                          }}
                          className="h-7 w-16 appearance-none px-2 text-center text-xs"
                        />
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="divide-y divide-slate-100 flex-1 overflow-y-auto min-h-0">
                {displayedAppointments.map((item, index) => {
                  const isDelivery = item.appointment_type === "Giao đồ";
                  const color = isDelivery ? "#10b981" : "#3b82f6";
                  return (
                  <div key={`${item.order_code}-${item.appointment_type}-${item.appointment_time}-${index}`} className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-slate-50/70">
                    <div className="w-11 shrink-0 text-center">
                      <p className="text-xs font-semibold tabular-nums text-slate-900">{item.appointment_time}</p>
                      <p className="mt-0.5 text-[10px] text-slate-400">{item.date_label}</p>
                    </div>
                    <span className="h-9 w-px shrink-0 bg-slate-200" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-800">{item.order_code} · {item.service_name}</p>
                      <p className="mt-1 truncate text-[11px] text-slate-400">Khách: {item.customer_name}</p>
                    </div>
                    <span
                      className="inline-flex max-w-full shrink-0 items-center gap-1.5 truncate rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium"
                      style={{ color, backgroundColor: `${color}14` }}
                    >
                      <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                      <span className="truncate">{item.appointment_type}</span>
                    </span>
                  </div>
                  );
                })}
                {displayedAppointments.length === 0 && (
                  <div className="flex h-full items-center justify-center p-6 text-xs text-slate-400">Chưa có lịch hẹn sắp tới.</div>
                )}
              </div>
            </div>

            {/* Tình trạng máy giặt/máy sấy (Ở giữa bên trái) */}
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col h-full min-h-0">
              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5 shrink-0">
                <div className="flex items-center gap-2">
                  <WashingMachine className="size-4 text-slate-500" />
                  <h2 className="text-sm font-semibold text-slate-900">Tình trạng máy giặt/máy sấy</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-400">
                    {displayedMachines.length}/{maxDisplayedMachines} máy
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex size-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                        aria-label="Thiết lập máy hiển thị"
                      >
                        <Settings className="size-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-72">
                      <DropdownMenuLabel>Thiết lập trạng thái máy</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div
                        className="flex items-center justify-between gap-3 px-2 py-1.5"
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                      >
                        <span className="text-sm text-slate-700">Số ô tối đa</span>
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={maxDisplayedMachinesInput}
                          onChange={(event) => {
                            const value = event.target.value.replace(/\D/g, "").slice(0, 1);
                            setMaxDisplayedMachinesInput(value);
                            if (/^[1-9]$/.test(value)) setMaxDisplayedMachines(Number(value));
                          }}
                          onBlur={commitMaxDisplayedMachines}
                          onKeyDown={(event) => {
                            event.stopPropagation();
                            if (event.key === "Enter") {
                              commitMaxDisplayedMachines();
                              event.currentTarget.blur();
                            }
                          }}
                          className="h-7 w-16 appearance-none px-2 text-center text-xs"
                        />
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setVisibleMachineCodes(null)}>
                        Hiện tất cả máy
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setVisibleMachineCodes([])}>
                        Ẩn tất cả máy
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs text-slate-400">Chọn máy hiển thị</DropdownMenuLabel>
                      <div className="max-h-56 overflow-y-auto">
                        {machines.map((machine, index) => {
                          const checked = visibleMachineCodes ? visibleMachineCodes.includes(machine.machine_code) : true;
                          return (
                            <DropdownMenuCheckboxItem
                              key={`${machine.machine_code}-${index}`}
                              checked={checked}
                              onCheckedChange={(nextChecked) => toggleMachine(machine.machine_code, Boolean(nextChecked))}
                            >
                              <span className="truncate">
                                {machine.machine_code} · {machine.name} · {machine.status}
                              </span>
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                        {machines.length === 0 && (
                          <div className="px-2 py-2 text-xs text-slate-400">Chưa có máy để thiết lập.</div>
                        )}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="divide-y divide-slate-100 flex-1 overflow-y-auto min-h-0">
                {displayedMachines.map((machine, index) => {
                  const statusColor = machine.status === "Đang chạy"
                    ? "#2563eb"
                    : machine.status === "Bảo trì"
                      ? "#d97706"
                      : "#059669";
                  return (
                    <div key={`${machine.machine_code}-${index}`} className="px-3 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs font-semibold text-slate-900">
                          {machine.machine_code.startsWith("TB-") ? machine.machine_code : `TB-${machine.machine_code}`} · {machine.name}
                        </p>
                        <span
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                          style={{ color: statusColor, backgroundColor: `${statusColor}12` }}
                        >
                          <span className="size-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
                          {machine.status}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-[11px] text-slate-400">
                        <span className="font-medium text-slate-600">
                          {machine.status === "Đang chạy"
                            ? machine.order_code || "-"
                            : machine.status === "Bảo trì"
                              ? "Tạm ngừng"
                              : "Chưa có đơn"}
                        </span>
                      </p>
                    </div>
                  );
                })}
                {displayedMachines.length === 0 && (
                  <div className="flex h-full items-center justify-center p-6 text-xs text-slate-400">
                    {machines.length === 0 ? "Chưa có thiết bị." : "Không có máy phù hợp thiết lập hiển thị."}
                  </div>
                )}
              </div>
            </div>

            {/* Thống kê tài nguyên (Ở giữa bên phải) */}
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col h-full min-h-0">
              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5 shrink-0">
                <div className="flex items-center gap-2">
                  <FlaskConical className="size-4 text-slate-500" />
                  <h2 className="text-sm font-semibold text-slate-900">Thống kê tài nguyên</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-400">
                    {displayedInventoryOverview.length}/{maxDisplayedInventory} vật tư
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex size-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                        aria-label="Thiết lập tài nguyên hiển thị"
                      >
                        <Settings className="size-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      <DropdownMenuLabel>Thiết lập tài nguyên</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem checked={hideEmptyInventory} disabled>
                        Ẩn vật tư đã hết
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuSeparator />
                      <div
                        className="flex items-center justify-between gap-3 px-2 py-1.5"
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                      >
                        <span className="text-sm text-slate-700">Số ô tối đa</span>
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={maxDisplayedInventoryInput}
                          onChange={(event) => {
                            const value = event.target.value.replace(/\D/g, "").slice(0, 1);
                            setMaxDisplayedInventoryInput(value);
                            if (/^[1-9]$/.test(value)) setMaxDisplayedInventory(Number(value));
                          }}
                          onBlur={commitMaxDisplayedInventory}
                          onKeyDown={(event) => {
                            event.stopPropagation();
                            if (event.key === "Enter") {
                              commitMaxDisplayedInventory();
                              event.currentTarget.blur();
                            }
                          }}
                          className="h-7 w-16 appearance-none px-2 text-center text-xs [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setVisibleInventoryCodes(null)}>
                        Hiện tất cả vật tư
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setVisibleInventoryCodes([])}>
                        Ẩn tất cả vật tư
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs text-slate-400">Chọn vật tư hiển thị</DropdownMenuLabel>
                      <div className="max-h-56 overflow-y-auto">
                        {selectableInventoryOverview.map((item, index) => {
                          const checked = visibleInventoryCodes ? visibleInventoryCodes.includes(item.code) : true;
                          return (
                            <DropdownMenuCheckboxItem
                              key={`${item.code}-${index}`}
                              checked={checked}
                              onCheckedChange={(nextChecked) => toggleInventoryCode(item.code, Boolean(nextChecked))}
                              className="gap-2"
                            >
                              <span className="truncate">{item.code} · {item.name}</span>
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                        {selectableInventoryOverview.length === 0 && (
                          <div className="px-2 py-2 text-xs text-slate-400">Không có vật tư còn tồn để thiết lập.</div>
                        )}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="divide-y divide-slate-100 flex-1 overflow-y-auto min-h-0">
                {displayedInventoryOverview.map((item, index) => (
                  <div key={`${item.code}-${index}`} className="px-3 py-2.5">
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-800">{item.code} · {item.name}</p>
                      </div>
                      <div className="shrink-0 text-right text-xs font-semibold text-slate-900">
                        {item.stockRatio}
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-[1fr_72px] items-center gap-2.5">
                      <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full shrink-0 transition-[flex-basis]"
                          style={{ flexBasis: `${item.safetyPct}%`, backgroundColor: item.progressColor }}
                        />
                        <div
                          className="h-full shrink-0 bg-rose-50 transition-[flex-basis]"
                          style={{ flexBasis: `${item.emptyPct}%` }}
                        />
                      </div>
                      <span className="truncate text-right text-[10px] font-semibold" style={{ color: item.color }}>
                        {item.displayStatus} · {item.safetyPct}%
                      </span>
                    </div>
                  </div>
                ))}
                {displayedInventoryOverview.length === 0 && (
                  <div className="flex h-full items-center justify-center p-6 text-xs text-slate-400">
                    {inventoryOverview.length === 0 ? "Chưa có dữ liệu vật tư." : "Không có vật tư phù hợp thiết lập hiển thị."}
                  </div>
                )}
              </div>
            </div>

            {/* Ghi chú & Nhắc nhở (Ngoài cùng bên phải) */}
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col h-full min-h-0">
              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5 shrink-0">
                <div className="flex items-center gap-2">
                  <StickyNote className="size-4 text-slate-500" />
                  <h2 className="text-sm font-semibold text-slate-900">Ghi chú & Nhắc nhở</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-400">
                    {displayedReminders.length}/{maxDisplayedReminders} ghi chú
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex size-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                        aria-label="Thiết lập ghi chú hiển thị"
                      >
                        <Settings className="size-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-72">
                      <DropdownMenuLabel>Thiết lập ghi chú</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div
                        className="flex items-center justify-between gap-3 px-2 py-1.5"
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                      >
                        <span className="text-sm text-slate-700">Số ô tối đa</span>
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={maxDisplayedRemindersInput}
                          onChange={(event) => {
                            const value = event.target.value.replace(/\D/g, "").slice(0, 1);
                            setMaxDisplayedRemindersInput(value);
                            if (/^[1-9]$/.test(value)) setMaxDisplayedReminders(Number(value));
                          }}
                          onBlur={commitMaxDisplayedReminders}
                          onKeyDown={(event) => {
                            event.stopPropagation();
                            if (event.key === "Enter") {
                              commitMaxDisplayedReminders();
                              event.currentTarget.blur();
                            }
                          }}
                          className="h-7 w-16 appearance-none px-2 text-center text-xs"
                        />
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setVisibleReminderKeys(null)}>
                        Hiện tất cả ghi chú
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setVisibleReminderKeys([])}>
                        Ẩn tất cả ghi chú
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs text-slate-400">Chọn ghi chú hiển thị</DropdownMenuLabel>
                      <div className="max-h-56 overflow-y-auto">
                        {reminders.map((note, index) => {
                          const checked = visibleReminderKeys ? visibleReminderKeys.includes(note.key) : true;
                          return (
                            <DropdownMenuCheckboxItem
                              key={`${note.key}-${index}`}
                              checked={checked}
                              onCheckedChange={(nextChecked) => toggleReminder(note.key, Boolean(nextChecked))}
                            >
                              <span className="truncate">{note.type} · {note.text}</span>
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                        {reminders.length === 0 && (
                          <div className="px-2 py-2 text-xs text-slate-400">Chưa có ghi chú để thiết lập.</div>
                        )}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="space-y-3 p-3 flex-1 overflow-y-auto min-h-0">
                {displayedReminders.map((note, index) => (
                  <div
                    key={`${note.key}-${index}`}
                    className="space-y-2 rounded-lg border px-2.5 py-2"
                    style={{
                      borderColor: `${getReminderTypeColor(note.type)}55`,
                      backgroundColor: `${getReminderTypeColor(note.type)}1a`,
                    }}
                  >
                    <span
                      className="inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-xs font-medium"
                      style={{
                        color: getReminderTypeColor(note.type),
                        borderColor: `${getReminderTypeColor(note.type)}55`,
                        backgroundColor: `${getReminderTypeColor(note.type)}20`,
                      }}
                    >
                      <span className="size-2 rounded-full" style={{ backgroundColor: getReminderTypeColor(note.type) }} />
                      {note.type}
                    </span>
                    <p className="text-sm leading-relaxed text-slate-700">
                      {note.text}
                    </p>
                  </div>
                ))}
                {displayedReminders.length === 0 && (
                  <div className="flex h-full items-center justify-center p-6 text-xs text-slate-400">
                    {reminders.length === 0 ? "Chưa có ghi chú hoặc nhắc nhở." : "Không có ghi chú phù hợp thiết lập hiển thị."}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </PageShell>
  );
}
