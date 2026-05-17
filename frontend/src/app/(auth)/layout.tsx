import React from "react";
import { Toaster } from "@/components/ui/sonner";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      {children}
      <Toaster richColors position="top-center" visibleToasts={3} />
    </main>
  );
}
