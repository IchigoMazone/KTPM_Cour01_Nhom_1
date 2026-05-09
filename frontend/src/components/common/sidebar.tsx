"use client";

import React, { useState, useEffect } from "react";
import { Panda, Settings, LogOut, PanelLeft } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Dropdown from "../ui/dropdown";
import { menus } from "@/src/utils/routes";
import { useNavbarStore } from "@/src/context/useNavbarStore";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { open, toggle } = useNavbarStore();

  const iconSize = 18;
  const stroke = 1.5;
  const [activeX, setActiveX] = useState<boolean>(false);

  const isActive = (item: (typeof menus)[0]) => {
    if (item.exact) return pathname === item.path;
    return pathname.startsWith(item.path);
  };

  useEffect(() => {
    if (open) {
      setActiveX(true);
    }
  }, [open]);

  return (
    <aside
      className={`
        ${!activeX ? "w-[57px]" : "w-[260px]"}
        h-screen 
        border-r 
        border-gray-200 
        bg-white 
        fixed xl:relative
        top-0 left-0
        flex-col
        z-50
        transition-transform duration-300
        translate-x-0
        ${open ? "" : "hidden xl:flex"}
      `}
    >
      <nav className="flex flex-col justify-between h-full">
        {/* Top */}
        <div>
          {/* Logo */}
          <div
            className={`h-[65px] flex items-center px-2 ${activeX && "justify-between"}`}
          >
            <div
              className="w-10 h-10 bg-transparent flex justify-center items-center rounded-xl cursor-pointer group hover:bg-gray-200"
              onClick={() => {
                if (!open) {
                  setActiveX(!activeX);
                }
              }}
            >
              <Panda
                size={24}
                strokeWidth={stroke}
                className={`${!activeX ? "group-hover:hidden" : "block"}`}
              />
              <PanelLeft
                size={24}
                strokeWidth={stroke}
                className={`${!activeX ? "hidden group-hover:block" : "hidden"}`}
              />
            </div>
            {activeX && (
              <div
                className="w-10 h-10 bg-transparent flex justify-center items-center rounded-xl cursor-pointer hover:bg-gray-200"
                onClick={() => {
                  if (!open) {
                    setActiveX(!activeX);
                  } else toggle();
                }}
              >
                <PanelLeft size={24} strokeWidth={stroke} />
              </div>
            )}
          </div>

          {/* Menu */}
          <div className="flex flex-col gap-1">
            {menus.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item);
              const label = item.label;

              return (
                <button
                  key={index}
                  onClick={() => router.push(item.path)}
                  className={`h-[40px] flex items-center mx-2 rounded-xl cursor-pointer ${active ? "bg-blue-100" : "hover:bg-gray-100 hover:text-black"}`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all
                    ${
                      active
                        ? "bg-blue-100 text-blue-600"
                        : "hover:bg-gray-100 hover:text-black"
                    }`}
                  >
                    <Icon size={iconSize} strokeWidth={stroke} />
                  </div>
                  <span
                    className={`${activeX ? "block" : "hidden"} ${
                      active ? "bg-blue-100 text-blue-600" : "hover:text-black"
                    } pl-1`}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom avatar */}
        <div
          className={`h-[45px] flex items-center mx-2 my-2 rounded-xl ${activeX ? "hover:bg-gray-200" : ""}`}
        >
          <Dropdown
            trigger={
              <button className="flex cursor-pointer">
                <div className={`w-10 h-10 flex justify-center items-center`}>
                  <img
                    src="/default_avatar.jfif"
                    alt="avatar"
                    className="w-6 h-6 rounded-full object-cover outline outline-2 outline-blue-500 outline-offset-2 hover:scale-105 transition-all"
                  />
                </div>
                <span
                  className={
                    activeX ? "block flex items-center pl-1" : "hidden"
                  }
                >
                  Trịnh Như Nhất
                </span>
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
