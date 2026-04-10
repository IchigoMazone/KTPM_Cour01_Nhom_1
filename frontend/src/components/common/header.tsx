"use client";

import React, { useRef } from "react";
import { Panda } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconType } from "../../types/icon-interface";
import { GradientText } from "../ui/gradient-text";
import { Button } from "../ui/button";

export default function Header() {
  const router = useRouter();
  const icon = useRef<IconType>({ x: 32, y: 1.6 });
  return (
    <header className="w-full h-16 fixed top-0 left-0 right-0 bg-white border-b border-[var(--color-divider)] flex flex-cols px-4">
      <div className="flex-2 flex items-center gap-2">
        <Panda size={icon.current.x} strokeWidth={icon.current.y} />
        <GradientText className="text-[16px] font-bold">BegauShop</GradientText>
      </div>
      <div className="hidden xl:flex flex-6">
        <nav className="w-full h-full">
          <ul className="h-full flex items-center justify-evenly text-[16px] font-semibold">
            <li className="h-full flex items-center">
              <Link
                href="/"
                className="h-full flex items-center text-[14px] hover:text-blue-500"
              >
                Giới thiệu
              </Link>
            </li>
            <li className="h-full flex items-center">
              <Link
                href="/services"
                className="h-full flex items-center text-[14px] hover:text-blue-500"
              >
                Dịch vụ
              </Link>
            </li>
            <li className="h-full flex items-center">
              <Link
                href="/process"
                className="h-full flex items-center text-[14px] hover:text-blue-500"
              >
                Quy trình
              </Link>
            </li>
            <li className="h-full flex items-center">
              <Link
                href="/promotions"
                className="h-full flex items-center text-[14px] hover:text-blue-500"
              >
                Ưu đãi
              </Link>
            </li>
            <li className="h-full flex items-center">
              <Link
                href="/contact"
                className="h-full flex items-center text-[14px] hover:text-blue-500"
              >
                Liên hệ
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="flex-2 flex items-center justify-end gap-2">
        <Button onClick={() => router.push("/login")}>Đăng nhập</Button>
        <Button onClick={() => router.push("/register")}>Đăng kí</Button>
      </div>
    </header>
  );
}
