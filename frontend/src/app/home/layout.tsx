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
    <div className="flex h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_#eff6ff_0,_#f8fafc_32rem,_#f1f5f9_100%)]">
      <Sidebar />

      <div className="flex flex-col flex-1 relative">
        {open && (
          <div
            className="absolute inset-0 bg-black/30 z-30"
            onClick={toggle}
          ></div>
        )}
        <Search />
        <main className="flex-1 overflow-y-auto bg-transparent">{children}</main>
      </div>
    </div>
  );
}
