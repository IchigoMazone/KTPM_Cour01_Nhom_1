"use client";

import { API_BASE_URL } from "@/src/lib/config";

import React, { useState } from "react";
import { Bell, LogOut, Panda, PanelLeft, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import AccountAvatar from "./account-avatar";
import Dropdown from "../ui/dropdown";
import LogoutDialog from "./logout-dialog";
import NotificationsDialog from "./notifications-dialog";
import ProfileDialog from "./profile-dialog";
import SettingsDialog from "./settings-dialog";
import { useNavbarStore } from "@/src/context/useNavbarStore";
import { useSettingsStore } from "@/src/context/useSettingsStore";
import { menus } from "@/src/utils/routes";
import { userMenus } from "@/src/utils/user-routes";
import { ACCOUNT_PROFILE_UPDATED_EVENT, DEFAULT_ACCOUNT_AVATAR_URL } from "@/src/lib/account-profile";

type SidebarItem = (typeof menus)[number] | (typeof userMenus)[number];

type CurrentUser = {
  username: string;
  role: string;
  profile?: {
    full_name?: string | null;
    image_url?: string | null;
  } | null;
};

type LinkedCustomer = {
  customer_code?: string | null;
  full_name?: string | null;
  image_url?: string | null;
  rank?: string | null;
};

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { open, toggle } = useNavbarStore();
  const { deliveryEnabled } = useSettingsStore();
  const [activeX, setActiveX] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const isExpanded = open || activeX;
  const isUserArea = pathname.startsWith("/user");
  const fallbackAccountName = isUserArea ? "Khách hàng" : "Quản trị viên";
  const fallbackRoleLabel = isUserArea ? "Tài khoản khách hàng" : "Tài khoản nội bộ";
  const [accountName, setAccountName] = useState("");
  const [accountRoleLabel, setAccountRoleLabel] = useState("");
  const [accountImageUrl, setAccountImageUrl] = useState(DEFAULT_ACCOUNT_AVATAR_URL);

  React.useEffect(() => {
    let ignore = false;
    const token = localStorage.getItem("token");
    const storedAccountName = localStorage.getItem("accountName");
    const storedRole = localStorage.getItem("role");
    const storedImageUrl = localStorage.getItem("accountImageUrl");

    if (!token) {
      return;
    }

    const roleLabels: Record<string, string> = {
      admin: "Tài khoản quản trị",
      manager: "Tài khoản quản lý",
      staff: "Tài khoản nhân viên",
      driver: "Tài khoản giao nhận",
      cashier: "Tài khoản thu ngân",
      customer: "Tài khoản khách hàng",
    };

    const syncStoredAccount = () => {
      if (ignore) return;
      const nextAccountName = localStorage.getItem("accountName");
      const nextRole = localStorage.getItem("role");
      const nextImageUrl = localStorage.getItem("accountImageUrl");

      if (nextAccountName) setAccountName(nextAccountName);
      if (nextRole) setAccountRoleLabel(roleLabels[nextRole] || fallbackRoleLabel);
      setAccountImageUrl(nextImageUrl || DEFAULT_ACCOUNT_AVATAR_URL);
    };

    const timer = window.setTimeout(() => {
      if (ignore) return;
      if (storedAccountName) setAccountName(storedAccountName);
      if (storedRole) setAccountRoleLabel(roleLabels[storedRole] || fallbackRoleLabel);
      setAccountImageUrl(storedImageUrl || DEFAULT_ACCOUNT_AVATAR_URL);
    }, 0);

    window.addEventListener(ACCOUNT_PROFILE_UPDATED_EVENT, syncStoredAccount);
    window.addEventListener("storage", syncStoredAccount);

    fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json() as Promise<CurrentUser>;
      })
      .then((user) => {
        if (ignore || !user) return;
        const nextAccountName = user.profile?.full_name || user.username;
        setAccountName(nextAccountName);
        setAccountRoleLabel(roleLabels[user.role] || "Tài khoản");
        localStorage.setItem("accountName", nextAccountName);
        if (user.profile?.image_url) {
          setAccountImageUrl(user.profile.image_url);
          localStorage.setItem("accountImageUrl", user.profile.image_url);
        } else {
          setAccountImageUrl(DEFAULT_ACCOUNT_AVATAR_URL);
          localStorage.setItem("accountImageUrl", DEFAULT_ACCOUNT_AVATAR_URL);
        }

        if (isUserArea) {
          fetch(`${API_BASE_URL}/api/home/my-customer`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          })
            .then(async (response) => {
              if (!response.ok) return null;
              return response.json() as Promise<LinkedCustomer>;
            })
            .then((customer) => {
              if (ignore || !customer) return;
              const customerName = customer.full_name?.trim() || nextAccountName;
              const customerImage = customer.image_url || user.profile?.image_url || DEFAULT_ACCOUNT_AVATAR_URL;
              const customerRole = customer.customer_code
                ? `Khách hàng · ${customer.customer_code}`
                : "Khách hàng";

              setAccountName(customerName);
              setAccountRoleLabel(customerRole);
              setAccountImageUrl(customerImage);
              localStorage.setItem("accountName", customerName);
              localStorage.setItem("accountImageUrl", customerImage);
            })
            .catch(() => undefined);
        }
      })
      .catch(() => {
        if (ignore) return;
        setAccountName("");
        setAccountRoleLabel("");
      });

    return () => {
      ignore = true;
      window.clearTimeout(timer);
      window.removeEventListener(ACCOUNT_PROFILE_UPDATED_EVENT, syncStoredAccount);
      window.removeEventListener("storage", syncStoredAccount);
    };
  }, [fallbackRoleLabel, isUserArea]);

  const activeMenus = (isUserArea ? userMenus : menus).filter((item) => {
    if (item.path === "/home/delivery" && !deliveryEnabled) {
      return false;
    }
    return true;
  });
  const displayAccountName = accountName || fallbackAccountName;
  const displayRoleLabel = accountRoleLabel || fallbackRoleLabel;

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
                    <AccountAvatar
                      name={displayAccountName}
                      imageUrl={accountImageUrl}
                      size={24}
                      className="shrink-0 transition-transform hover:scale-105 after:border-slate-200"
                    />
                  </div>
                  <span className={isExpanded ? "flex min-w-0 items-center truncate pl-1 font-normal" : "hidden"}>
                    {displayAccountName}
                  </span>
                </button>
              }
              position="top-start"
              className="min-w-[208px]"
            >
              {({ close }) => (
                <>
                  <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2.5">
                    <AccountAvatar name={displayAccountName} imageUrl={accountImageUrl} size={28} className="shrink-0 after:border-slate-200" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium leading-5">
                        {displayAccountName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {displayRoleLabel}
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
                    <AccountAvatar name={displayAccountName} imageUrl={accountImageUrl} size={14} className="shrink-0 after:border-slate-200" />
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
        accountName={displayAccountName}
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
      />
      <ProfileDialog
        accountName={displayAccountName}
        isUserArea={isUserArea}
        open={profileOpen}
        onOpenChange={setProfileOpen}
        onProfileUpdated={setAccountName}
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
