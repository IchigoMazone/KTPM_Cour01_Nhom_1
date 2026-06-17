"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createRange,
  DateRange,
  fromOrderDate,
  normalizeRange,
  toInputDate,
} from "@/src/utils/dashboard-time";

type DashboardTimeRangeStore = {
  range: DateRange;
  setRange: (range: DateRange | ((current: DateRange) => DateRange)) => void;
};

export const useDashboardTimeRangeStore = create<DashboardTimeRangeStore>()(
  persist(
    (set) => ({
      range: createRange("month"),
      setRange: (range) =>
        set((state) => ({
          range: normalizeRange(
            typeof range === "function" ? range(state.range) : range,
          ),
        })),
    }),
    {
      name: "begau-dashboard-time-range",
      partialize: (state) => ({
        range: {
          ...state.range,
          start: toInputDate(state.range.start),
          end: toInputDate(state.range.end),
        },
      }) as unknown as DashboardTimeRangeStore,
      merge: (persistedState, currentState) => {
        const persisted = persistedState as {
          range?: { mode?: DateRange["mode"]; start?: string; end?: string };
        };
        const start = persisted.range?.start ? fromOrderDate(persisted.range.start) : currentState.range.start;
        const end = persisted.range?.end ? fromOrderDate(persisted.range.end) : currentState.range.end;
        return {
          ...currentState,
          range: normalizeRange({
            mode: persisted.range?.mode || currentState.range.mode,
            start: Number.isNaN(start.getTime()) ? currentState.range.start : start,
            end: Number.isNaN(end.getTime()) ? currentState.range.end : end,
          }),
        };
      },
    },
  ),
);
