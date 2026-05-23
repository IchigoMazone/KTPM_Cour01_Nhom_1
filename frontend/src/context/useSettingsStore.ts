import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  deliveryEnabled: boolean;
  setDeliveryEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      deliveryEnabled: true,
      setDeliveryEnabled: (enabled: boolean) => set({ deliveryEnabled: enabled }),
    }),
    {
      name: "begau-settings-storage",
    }
  )
);
