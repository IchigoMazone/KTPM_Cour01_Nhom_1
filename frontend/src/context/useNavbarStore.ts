import { create } from "zustand";
import { NavbarStore } from "../types/navbar-interface";

export const useNavbarStore = create<NavbarStore>((set) => ({
  open: false,

  toggle: () =>
    set((state) => ({
      open: !state.open,
    })),
}));
