import React from "react";
import { Panda } from "lucide-react";

export default function Header() {
  return (
    <div className="w-full h-16 fixed top-0 left-0 right-0 bg-white border-b border-[var(--color-divider)] flex flex-cols">
      <div className="flex-2"></div>
      <div className="flex-6"></div>
      <div className="flex-2"></div>
    </div>
  );
}
