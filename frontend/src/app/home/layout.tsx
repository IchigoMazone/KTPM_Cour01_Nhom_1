"use client";

import React from "react";
import Sidebar from "@/src/components/common/sidebar";
import Search from "@/src/components/common/search";

import { useNavbarStore } from "@/src/context/useNavbarStore";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { open, toggle } = useNavbarStore();

  return (
    <div className="flex h-dvh min-w-0 overflow-hidden">
      <Sidebar />

      <div className="relative flex min-w-0 flex-1 flex-col">
        {open && (
          <div
            className="absolute inset-0 bg-black/30 z-30"
            onClick={toggle}
          ></div>
        )}
        <Search />
        <main className="min-w-0 flex-1 overflow-hidden bg-background flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
