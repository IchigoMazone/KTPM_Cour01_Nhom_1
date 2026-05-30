"use client";

import { create } from "zustand";
import { createRange, DateRange, normalizeRange } from "@/src/utils/dashboard-time";

type DashboardTimeRangeStore = {
  range: DateRange;
  setRange: (range: DateRange | ((current: DateRange) => DateRange)) => void;
};

export const useDashboardTimeRangeStore = create<DashboardTimeRangeStore>((set) => ({
  range: createRange("month"),
  setRange: (range) =>
    set((state) => ({
      range: normalizeRange(
        typeof range === "function" ? range(state.range) : range,
      ),
    })),
}));
