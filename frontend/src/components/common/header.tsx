"use client";

import React, { useRef } from "react";
import { Panda } from "lucide-react";
import { IconType } from "../../types/icon-interface";
import { GradientText } from "../ui/gradient-text";

export default function Header() {
  const icon = useRef<IconType>({ x: 32, y: 1.6 });
  return (
    <header className="w-full h-16 fixed top-0 left-0 right-0 bg-white border-b border-[var(--color-divider)] flex flex-cols">
      <div className="flex-2 flex items-center">
        <div className="w-16 h-16 flex items-center justify-center">
          <Panda size={icon.current.x} strokeWidth={icon.current.y} />
        </div>
        <GradientText className="text-5 font-bold">BegauShop</GradientText>
      </div>
      <div className="flex-6"></div>
      <div className="flex-2"></div>
    </header>
  );
}
