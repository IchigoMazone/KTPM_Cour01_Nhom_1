"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/src/components/common/sidebar";
import Search from "@/src/components/common/search";

import { useNavbarStore } from "@/src/context/useNavbarStore";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { open, toggle } = useNavbarStore();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      router.push("/login");
    } else if (role !== "admin") {
      router.push("/user");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return null;
  }

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
        <main className="min-w-0 flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
