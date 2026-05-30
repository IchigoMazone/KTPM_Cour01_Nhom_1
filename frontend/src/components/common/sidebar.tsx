"use client";

import Image from "next/image";
import React, { useState } from "react";
import { Bell, LogOut, Panda, PanelLeft, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Dropdown from "../ui/dropdown";
import LogoutDialog from "./logout-dialog";
import NotificationsDialog from "./notifications-dialog";
import ProfileDialog from "./profile-dialog";
import SettingsDialog from "./settings-dialog";
import { useNavbarStore } from "@/src/context/useNavbarStore";
import { menus } from "@/src/utils/routes";
import { userMenus } from "@/src/utils/user-routes";

type SidebarItem = (typeof menus)[number] | (typeof userMenus)[number];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { open, toggle } = useNavbarStore();
  const [activeX, setActiveX] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const isExpanded = open || activeX;
  const isUserArea = pathname.startsWith("/user");

  const activeMenus = isUserArea ? userMenus : menus;
  const accountName = isUserArea ? "Nguyễn Thị Hương" : "Trịnh Như Nhất";

  const iconSize = 18;
  const stroke = 1.5;

  const isActive = (item: SidebarItem) => {
    if (item.exact) return pathname === item.path;
    return pathname.startsWith(item.path);
  };

  return (
    <>
      <aside
        className={`
        ${!isExpanded ? "w-[57px]" : "w-[min(260px,80vw)]"}
        fixed left-0 top-0 z-50 flex-col
        h-screen max-w-[80vw]
        border-r border-slate-200 bg-white/95 font-sans text-[14px] font-normal text-[#0d0d0d] backdrop-blur
        will-change-[width]
        transition-[width,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
        ${open ? "" : "hidden xl:flex"}
        xl:relative
      `}
      >
        <nav className="flex h-full min-w-0 flex-col justify-between">
          <div className="min-h-0">
            <div className={`flex h-[65px] items-center px-2 ${isExpanded && "justify-between"}`}>
              <div
                className={`flex h-10 items-center rounded-xl bg-transparent text-black transition-colors hover:text-black ${
                  isExpanded
                    ? "min-w-0 flex-1 cursor-default px-2 text-[17px] font-medium tracking-normal opacity-100"
                    : "group relative w-10 cursor-pointer justify-center hover:bg-[#f3f3f3]"
                }`}
                onClick={() => {
                  if (!open && !isExpanded) setActiveX(true);
                }}
              >
                {isExpanded ? (
                  <span className="truncate leading-none">BegauShop</span>
                ) : (
                  <>
                    <Panda
                      size={24}
                      strokeWidth={stroke - 0.2}
                      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-100 transition-opacity duration-150 ease-out group-hover:opacity-0"
                    />
                    <PanelLeft
                      size={20}
                      strokeWidth={stroke - 0.2}
                      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100"
                    />
                  </>
                )}
              </div>

              {isExpanded && (
                <div
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-transparent text-black opacity-100 transition-[opacity,background-color,color] duration-200 ease-out hover:bg-[#f3f3f3] hover:text-black"
                  onClick={() => {
                    if (!open) setActiveX(false);
                    else toggle();
                  }}
                >
                  <PanelLeft size={20} strokeWidth={stroke - 0.2} />
                </div>
              )}
            </div>

            <div className="flex max-h-[calc(100dvh-140px)] flex-col gap-1 overflow-y-auto pt-8">
              {activeMenus.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);

                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      router.push(item.path);
                      if (open) toggle();
                    }}
                    className={`mx-2 flex h-10 min-w-0 cursor-pointer items-center rounded-lg transition-all ${
                      active
                        ? "bg-slate-100 text-slate-900 font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    title={!isExpanded ? item.label : undefined}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                      <Icon size={iconSize} strokeWidth={stroke} className={active ? "text-slate-900" : "text-slate-500"} />
                    </div>
                    <span
                      className={`${isExpanded ? "block min-w-0 truncate opacity-100" : "hidden opacity-0"} pl-1 font-medium transition-opacity duration-200`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={`mx-2 my-3 rounded-lg p-0.5 transition-colors ${
              isExpanded ? "hover:bg-slate-50" : ""
            }`}
          >
            <Dropdown
              trigger={
                <button className="flex h-10 min-w-0 cursor-pointer items-center rounded-lg text-slate-600">
                  <div className="flex h-10 w-10 items-center justify-center">
                    <Image
                      src="/default_avatar.jfif"
                      alt="avatar"
                      width={24}
                      height={24}
                      className="h-6 w-6 rounded-full object-cover transition-all hover:scale-105"
                    />
                  </div>
                  <span className={isExpanded ? "flex min-w-0 items-center truncate pl-1 font-normal" : "hidden"}>
                    {accountName}
                  </span>
                </button>
              }
              position="top-start"
              className="min-w-[208px]"
            >
              {({ close }) => (
                <>
                  <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2.5">
                    <Image
                      src="/default_avatar.jfif"
                      alt="avatar"
                      width={28}
                      height={28}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium leading-5">
                        {accountName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {isUserArea ? "Tài khoản khách hàng" : "Tài khoản quản trị"}
                      </p>
                    </div>
                  </div>
                  <div className="px-2 py-1">
                    <span className="block h-px bg-gray-100" />
                  </div>
                  <button
                    className="flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                    onClick={() => {
                      close();
                      setProfileOpen(true);
                    }}
                  >
                    <Image
                      src="/default_avatar.jfif"
                      alt="default-avatar"
                      width={14}
                      height={14}
                      className="h-[14px] w-[14px] rounded-full object-cover"
                    />
                    <span>Hồ sơ</span>
                  </button>
                  <button
                    className="flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                    onClick={() => {
                      close();
                      setSettingsOpen(true);
                    }}
                  >
                    <Settings size={14} strokeWidth={1.8} />
                    <span>Cài đặt</span>
                  </button>
                  <button
                    className="flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                    onClick={() => {
                      close();
                      setNotificationsOpen(true);
                    }}
                  >
                    <Bell size={14} strokeWidth={1.8} />
                    <span>Thông báo</span>
                  </button>
                  <div className="px-2 py-1">
                    <span className="block h-px bg-gray-100" />
                  </div>
                  <button
                    className="flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                    onClick={() => {
                      close();
                      setLogoutOpen(true);
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

      <LogoutDialog
        accountName={accountName}
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
      />
      <ProfileDialog
        accountName={accountName}
        isUserArea={isUserArea}
        open={profileOpen}
        onOpenChange={setProfileOpen}
      />
      <SettingsDialog
        isUserArea={isUserArea}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
      <NotificationsDialog
        isUserArea={isUserArea}
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
    </>
  );
}
