"use client";

import React, { useState } from "react";
import { Panda, Settings, LogOut, PanelLeft } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Dropdown from "../ui/dropdown";
import { Routes } from "@/src/utils/routes";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const iconSize = 18;
  const stroke = 1.5;

  const isActive = (item: (typeof Routes)[0]) => {
    if (item.exact) return pathname === item.path;
    return pathname.startsWith(item.path);
  };

  const [active, setActive] = useState<boolean>(false);
  const handleActive = () => {
    setActive((active) => !active);
  };

  return (
    <aside
      className={`${active ? "w-[260px]" : "w-[57px]"}  h-screen border-r border-gray-200 bg-white flex flex-col`}
    >
      <nav className="flex flex-col justify-between h-full">
        {/* Top */}
        <div className="">
          <div
            className={`h-[65px] flex items-center ${!active ? "justify-center" : "justify-between"} mx-2 cursor-pointer`}
            onClick={handleActive}
          >
            <div
              className="
    group
    flex
    w-10 h-10
    items-center justify-center
    rounded-xl
    hover:bg-gray-200
  "
            >
              {/* Panda */}
              <div className="flex items-center justify-center group-hover:hidden">
                <Panda size={24} strokeWidth={stroke} />
              </div>

              {/* Panel */}
              <div className="hidden items-center justify-center group-hover:flex">
                <PanelLeft
                  size={iconSize}
                  strokeWidth={stroke}
                  className="text-gray-500 group-hover:text-black"
                />
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="flex flex-col gap-1">
            {Routes.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item);
              const Label = item.label;
              return (
                <button
                  key={index}
                  onClick={() => router.push(item.path)}
                  className="h-[40px] flex items-center justify-center cursor-pointer"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all
                    ${
                      active
                        ? "bg-blue-100 text-blue-600"
                        : "text-gray-500 hover:bg-gray-100 hover:text-black"
                    }`}
                  >
                    <Icon size={iconSize} strokeWidth={stroke} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom avatar */}
        <div className="h-[55px] flex items-center justify-center">
          <Dropdown
            trigger={
              <button className="cursor-pointer">
                <img
                  src="/default_avatar.jfif"
                  alt="avatar"
                  className="w-6 h-6 rounded-full object-cover outline outline-2 outline-blue-500 outline-offset-2 hover:scale-105 transition-all"
                />
              </button>
            }
            position="top-start"
          >
            {({ close }) => (
              <>
                <button
                  className="w-full px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2 cursor-pointer select-none"
                  onClick={() => {
                    router.push("/home/profile");
                    close();
                  }}
                >
                  <img
                    src="/default_avatar.jfif"
                    alt="default-avatar"
                    className="w-[14px] h-[14px] rounded-full object-cover outline outline-2 outline-blue-500 outline-offset-2 transition-all"
                  />
                  <span>Hồ sơ</span>
                </button>

                <button
                  className="w-full px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2 cursor-pointer select-none"
                  onClick={() => {
                    router.push("/home/settings");
                    close();
                  }}
                >
                  <Settings size={14} strokeWidth={1.8} />
                  <span>Cài đặt</span>
                </button>

                <div className="flex justify-center py-[1px]">
                  <span className="w-[80%] h-[1px] bg-gray-200"></span>
                </div>

                <button
                  className="w-full px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2 cursor-pointer select-none text-red-500"
                  onClick={() => {
                    router.push("/logout");
                    close();
                  }}
                >
                  <LogOut size={14} strokeWidth={1.8} />
                  <span>Đăng xuất</span>
                </button>
              </>
            )}
          </Dropdown>
        </div>
      </nav>
    </aside>
  );
}
