import { on } from "events";
import React from "react";

export function Button({
  children,
  className,
  background = "#fff",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  background?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{ backgroundColor: background }}
      className={`px-2 py-[7px] rounded-[10px] text-[14px] font-semibold hover:outline hover:outline-gray-400 outline outline-gray-200 outline-offset-2 whitespace-nowrap ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
