import React from "react";
import Sidebar from "@/src/components/common/sidebar";
import Search from "@/src/components/common/search";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Search/>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
