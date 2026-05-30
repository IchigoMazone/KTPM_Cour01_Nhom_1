"use client";

import React from "react";
import type { ReactNode } from "react";
import UserSearch from "@/src/components/common/user-search";
import Sidebar from "@/src/components/common/sidebar";
import { useNavbarStore } from "@/src/context/useNavbarStore";

export default function UserLayout({ children }: { children: ReactNode }) {
  const { open, toggle } = useNavbarStore();

  return (
    <div className="flex h-dvh min-w-0 overflow-hidden">
      <Sidebar />

      <div className="relative flex min-w-0 flex-1 flex-col">
        {open && (
          <div
            className="absolute inset-0 z-30 bg-black/30"
            onClick={toggle}
          />
        )}
        <UserSearch />
        <main className="min-w-0 flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
