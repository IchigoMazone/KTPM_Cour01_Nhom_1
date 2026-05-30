"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type DashboardSettingsStore = {
  deliveryEnabled: boolean;
  setDeliveryEnabled: (enabled: boolean) => void;
};

export const useDashboardSettingsStore = create<DashboardSettingsStore>()(
  persist(
    (set) => ({
      deliveryEnabled: true,
      setDeliveryEnabled: (enabled) => set({ deliveryEnabled: enabled }),
    }),
    {
      name: "begau-dashboard-settings",
    },
  ),
);
