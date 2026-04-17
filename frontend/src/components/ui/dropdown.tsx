"use client";

import { useState, useRef, useEffect, ReactNode } from "react";

type Side = "top" | "bottom" | "left" | "right";
type Align = "start" | "center" | "end";
type Position = `${Side}-${Align}`;

interface DropdownProps {
  trigger: ReactNode;
  children: (props: { close: () => void }) => ReactNode;
  position?: Position;
  gap?: number;
  className?: string;
}

export default function Dropdown({
  trigger,
  children,
  position = "bottom-start",
  gap = 6,
  className = "",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const [side, align] = position.split("-") as [Side, Align];

  const style: React.CSSProperties = {
    position: "absolute",
    zIndex: 50,
  };

  if (side === "top") style.bottom = `calc(100% + ${gap}px)`;
  if (side === "bottom") style.top = `calc(100% + ${gap}px)`;
  if (side === "left") style.right = `calc(100% + ${gap}px)`;
  if (side === "right") style.left = `calc(100% + ${gap}px)`;

  if (side === "top" || side === "bottom") {
    if (align === "start") style.left = 0;
    if (align === "center") {
      style.left = "50%";
      style.transform = "translateX(-50%)";
    }
    if (align === "end") style.right = 0;
  }

  if (side === "left" || side === "right") {
    if (align === "start") style.top = 0;
    if (align === "center") {
      style.top = "50%";
      style.transform = "translateY(-50%)";
    }
    if (align === "end") style.bottom = 0;
  }

  return (
    <div ref={wrapRef} className="relative inline-flex">
      <div onClick={() => setOpen((v) => !v)} className="cursor-pointer">
        {trigger}
      </div>

      {open && (
        <div
          style={style}
          className={`min-w-[160px] bg-white border border-gray-200 rounded-lg shadow-lg p-1 ${className}`}
        >
          {children({ close })}
        </div>
      )}
    </div>
  );
}
