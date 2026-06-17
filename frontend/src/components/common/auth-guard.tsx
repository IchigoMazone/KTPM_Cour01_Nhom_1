"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/src/lib/config";
import { Skeleton } from "@/src/components/ui/skeleton";
import { emitAccountProfileUpdated } from "@/src/lib/account-profile";
import { getAreaToken } from "@/src/lib/home-api";

type AllowedRole = "admin" | "user";

type TokenPayload = {
  exp?: number;
  role?: AllowedRole;
};

function getTokenPayload(token: string): TokenPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(normalizedPayload));
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("adminToken");
  localStorage.removeItem("userToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("adminRefreshToken");
  localStorage.removeItem("userRefreshToken");
  localStorage.removeItem("role");
  localStorage.removeItem("username");
  localStorage.removeItem("user_id");
  localStorage.removeItem("accountName");
  localStorage.removeItem("accountEmail");
  localStorage.removeItem("accountAddress");
  localStorage.removeItem("accountImageUrl");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("adminToken");
  sessionStorage.removeItem("userToken");
  sessionStorage.removeItem("role");
  sessionStorage.removeItem("refreshToken");
  sessionStorage.removeItem("adminRefreshToken");
  sessionStorage.removeItem("userRefreshToken");
  emitAccountProfileUpdated();
}

async function refreshAccessToken(area: AllowedRole) {
  const refreshToken =
    sessionStorage.getItem(area === "admin" ? "adminRefreshToken" : "userRefreshToken") ||
    sessionStorage.getItem("refreshToken") ||
    localStorage.getItem(area === "admin" ? "adminRefreshToken" : "userRefreshToken") ||
    localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.success || !data.access_token) return null;

    localStorage.setItem("token", data.access_token);
    localStorage.setItem(data.role === "admin" ? "adminToken" : "userToken", data.access_token);
    localStorage.setItem(data.role === "admin" ? "adminRefreshToken" : "userRefreshToken", data.refresh_token || refreshToken);
    localStorage.setItem("role", data.role === "admin" ? "admin" : "customer");
    localStorage.setItem("username", data.username);
    localStorage.setItem("user_id", data.user_id);
    sessionStorage.setItem("token", data.access_token);
    sessionStorage.setItem(area === "admin" ? "adminToken" : "userToken", data.access_token);
    sessionStorage.setItem("refreshToken", data.refresh_token || refreshToken);
    sessionStorage.setItem(area === "admin" ? "adminRefreshToken" : "userRefreshToken", data.refresh_token || refreshToken);
    sessionStorage.setItem("role", data.role === "admin" ? "admin" : "customer");

    return getTokenPayload(data.access_token);
  } catch {
    return null;
  }
}

function ProtectedRouteSkeleton({ allowedRole }: { allowedRole: AllowedRole }) {
  const isAdmin = allowedRole === "admin";

  return (
    <div className="flex fixed inset-0 min-w-0 overflow-hidden bg-background">
      <aside className="hidden h-screen w-[57px] shrink-0 border-r border-slate-200 bg-white xl:block">
        <div className="flex h-[65px] items-center justify-center">
          <Skeleton className="size-9 rounded-xl" />
        </div>
        <div className="mt-8 flex flex-col items-center gap-3">
          {Array.from({ length: isAdmin ? 7 : 5 }).map((_, index) => (
            <Skeleton key={index} className="size-9 rounded-lg" />
          ))}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-h-12 items-center gap-2 border-b border-slate-200 bg-white px-5">
          <Skeleton className="size-10 rounded-lg xl:hidden" />
          <div className="hidden min-w-[180px] shrink-0 space-y-2 md:block">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="ml-auto size-8 rounded-md" />
          <Skeleton className="hidden h-8 w-[194px] rounded-md sm:block" />
          <Skeleton className="hidden h-8 w-14 rounded-md md:block" />
          <Skeleton className="hidden h-8 w-[86px] rounded-md lg:block" />
          <Skeleton className="hidden h-8 w-[90px] rounded-md sm:block" />
        </div>

        <main className="min-w-0 flex-1 overflow-hidden bg-background p-2.5">
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-7 rounded-lg" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="mt-4 h-7 w-28" />
                  <Skeleton className="mt-3 h-3 w-full" />
                </div>
              ))}
            </div>

            <div className="grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="mt-4 h-56 w-full rounded-lg" />
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <Skeleton className="h-5 w-32" />
                <div className="mt-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-9 w-full rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export function StaffRouteSkeleton() {
  return (
    <div className="flex fixed inset-0 min-w-0 overflow-hidden bg-background">
      <aside className="hidden h-screen w-[57px] shrink-0 border-r border-slate-200 bg-white xl:block">
        <div className="flex h-[65px] items-center justify-center">
          <Skeleton className="size-9 rounded-xl" />
        </div>
        <div className="mt-8 flex flex-col items-center gap-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="size-9 rounded-lg" />
          ))}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-h-12 items-center gap-2 border-b border-slate-200 bg-white px-5">
          <Skeleton className="size-10 rounded-lg xl:hidden" />
          <div className="hidden min-w-[180px] shrink-0 space-y-2 md:block">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="ml-auto size-8 rounded-md" />
          <Skeleton className="hidden h-8 w-[194px] rounded-md sm:block" />
          <Skeleton className="hidden h-8 w-14 rounded-md md:block" />
          <Skeleton className="hidden h-8 w-[86px] rounded-md lg:block" />
          <Skeleton className="hidden h-8 w-[90px] rounded-md sm:block" />
        </div>

        <main className="min-h-0 min-w-0 flex-1 overflow-hidden bg-background p-2.5">
          <div className="flex h-full min-h-0 flex-col gap-3">
            <div className="grid shrink-0 gap-3 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-3">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-7 w-24" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                    <Skeleton className="size-9 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
              <div className="flex min-h-14 shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 px-3 py-2">
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-8 w-36 rounded-md" />
                <div className="mx-2 hidden h-4 w-px bg-slate-200 sm:block" />
                <Skeleton className="h-8 w-28 rounded-md" />
                <Skeleton className="h-8 w-28 rounded-md" />
                <Skeleton className="ml-auto h-9 w-full max-w-sm rounded-md" />
                <Skeleton className="h-9 w-24 rounded-md" />
                <Skeleton className="h-9 w-28 rounded-md" />
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-100 px-3 py-2">
                <Skeleton className="h-7 w-28 rounded-md" />
                <Skeleton className="h-7 w-20 rounded-md" />
                <Skeleton className="h-7 w-20 rounded-md" />
                <Skeleton className="h-7 w-24 rounded-md" />
                <Skeleton className="ml-auto h-5 w-40" />
              </div>

              <div className="min-h-0 flex-1 overflow-hidden p-3">
                <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200">
                  <div className="grid shrink-0 grid-cols-[44px_repeat(6,minmax(0,1fr))] gap-3 border-b border-slate-200 bg-slate-50 px-3 py-3">
                    {Array.from({ length: 7 }).map((_, index) => (
                      <Skeleton key={index} className="h-4 w-full" />
                    ))}
                  </div>
                  <div className="min-h-0 flex-1 divide-y divide-slate-100 overflow-hidden pb-2">
                    {Array.from({ length: 13 }).map((_, rowIndex) => (
                      <div
                        key={rowIndex}
                        className="grid grid-cols-[44px_repeat(6,minmax(0,1fr))] gap-3 px-3 py-2.5"
                      >
                        <Skeleton className="size-4 rounded-[5px]" />
                        {Array.from({ length: 6 }).map((_, index) => (
                          <Skeleton
                            key={index}
                            className="h-4 w-full"
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="flex h-12 shrink-0 items-center justify-between border-t border-slate-100 px-3">
                    <Skeleton className="h-4 w-40" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-20 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function HomeRouteFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex fixed inset-0 min-w-0 overflow-hidden bg-background">
      <aside className="hidden h-screen w-[57px] shrink-0 border-r border-slate-200 bg-white xl:block">
        <div className="flex h-[65px] items-center justify-center">
          <Skeleton className="size-9 rounded-xl" />
        </div>
        <div className="mt-8 flex flex-col items-center gap-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="size-9 rounded-lg" />
          ))}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-h-12 items-center gap-2 border-b border-slate-200 bg-white px-5">
          <Skeleton className="size-10 rounded-lg xl:hidden" />
          <div className="hidden min-w-[180px] shrink-0 space-y-2 md:block">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="ml-auto size-8 rounded-md" />
          <Skeleton className="hidden h-8 w-[194px] rounded-md sm:block" />
          <Skeleton className="hidden h-8 w-14 rounded-md md:block" />
          <Skeleton className="hidden h-8 w-[86px] rounded-md lg:block" />
          <Skeleton className="hidden h-8 w-[90px] rounded-md sm:block" />
        </div>
        {children}
      </div>
    </div>
  );
}

function MetricGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid shrink-0 gap-3 ${count === 6 ? "sm:grid-cols-2 2xl:grid-cols-3" : "md:grid-cols-4"}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-3 w-36" />
            </div>
            <Skeleton className="size-9 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TableAreaSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
      <div className="flex min-h-14 shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 px-3 py-2">
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-28 rounded-md" />
        <Skeleton className="h-8 w-28 rounded-md" />
        <Skeleton className="ml-auto h-9 w-full max-w-sm rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-100 px-3 py-2">
        <Skeleton className="h-7 w-28 rounded-md" />
        <Skeleton className="h-7 w-20 rounded-md" />
        <Skeleton className="h-7 w-24 rounded-md" />
        <Skeleton className="h-7 w-24 rounded-md" />
        <Skeleton className="ml-auto h-5 w-40" />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden p-3">
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200">
          <div className="grid shrink-0 grid-cols-[44px_repeat(6,minmax(0,1fr))] gap-3 border-b border-slate-200 bg-slate-50 px-3 py-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </div>
          <div className="min-h-0 flex-1 divide-y divide-slate-100 overflow-hidden pb-2">
            {Array.from({ length: 13 }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-[44px_repeat(6,minmax(0,1fr))] gap-3 px-3 py-2.5"
              >
                <Skeleton className="size-4 rounded-[5px]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
          <div className="flex h-12 shrink-0 items-center justify-between border-t border-slate-100 px-3">
            <Skeleton className="h-4 w-40" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomeTableRouteSkeleton() {
  return (
    <HomeRouteFrame>
      <main className="min-h-0 min-w-0 flex-1 overflow-hidden bg-background p-2.5">
        <div className="flex h-full min-h-0 flex-col gap-3">
          <MetricGridSkeleton />
          <TableAreaSkeleton />
        </div>
      </main>
    </HomeRouteFrame>
  );
}

export function HomeDashboardRouteSkeleton() {
  return (
    <HomeRouteFrame>
      <main className="min-h-0 min-w-0 flex-1 overflow-hidden bg-background">
        <div className="h-full min-h-0 overflow-hidden bg-white">
          <div className="flex h-full min-h-0 flex-col gap-4 p-5">
            <div className="grid shrink-0 gap-4 lg:grid-cols-2">
              <MetricGridSkeleton count={6} />
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <Skeleton className="mt-3 h-28 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1.35fr_0.65fr]">
              <div className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white p-4">
                <Skeleton className="h-5 w-36" />
                <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-hidden">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              </div>
              <div className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white p-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-4 h-48 w-full rounded-lg" />
                <div className="mt-4 space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-8 w-full rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </HomeRouteFrame>
  );
}

export function StaffContentSkeleton() {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col gap-3 px-2 py-1.5 sm:px-2.5 sm:py-2">
      <MetricGridSkeleton />
      <TableAreaSkeleton />
    </div>
  );
}

export function HomeTableContentSkeleton() {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col gap-3 px-2 py-1.5 sm:px-2.5 sm:py-2">
      <MetricGridSkeleton />
      <TableAreaSkeleton />
    </div>
  );
}

export function HomeDashboardContentSkeleton() {
  return (
    <div className="h-full min-h-0 w-full overflow-hidden bg-white">
      <div className="flex h-full min-h-0 flex-col gap-4 p-5">
        <div className="grid shrink-0 gap-4 lg:grid-cols-2">
          <MetricGridSkeleton count={6} />
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="mt-3 h-28 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white p-4">
            <Skeleton className="h-5 w-36" />
            <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-hidden">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          </div>
          <div className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white p-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-4 h-48 w-full rounded-lg" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomeDetailContentSkeleton() {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-white px-2 py-1.5 sm:px-2.5 sm:py-2">
      <div className="flex min-h-14 shrink-0 items-center gap-3 border-b border-slate-200 px-4">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-5 w-48" />
        <Skeleton className="ml-auto h-9 w-28 rounded-md" />
      </div>
      <div className="grid min-h-0 flex-1 gap-3 p-3 lg:grid-cols-[320px_1fr]">
        <div className="min-h-0 overflow-hidden rounded-lg border border-slate-200 p-3">
          <Skeleton className="h-5 w-32" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 9 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 p-3">
          <Skeleton className="h-5 w-40" />
          <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-hidden">
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton key={index} className={`h-12 rounded-lg ${index % 2 ? "ml-auto w-3/5" : "w-2/3"}`} />
            ))}
          </div>
          <Skeleton className="mt-4 h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function AuthGuard({
  allowedRole,
  children,
}: {
  allowedRole: AllowedRole;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    const verifySession = async () => {
      let token = getAreaToken(allowedRole === "admin" ? "admin" : "user");

      const refreshToken =
        sessionStorage.getItem(allowedRole === "admin" ? "adminRefreshToken" : "userRefreshToken") ||
        sessionStorage.getItem("refreshToken") ||
        localStorage.getItem(allowedRole === "admin" ? "adminRefreshToken" : "userRefreshToken") ||
        localStorage.getItem("refreshToken");

      if (!token && refreshToken) {
        const refreshedPayload = await refreshAccessToken(allowedRole);
        token = getAreaToken(allowedRole === "admin" ? "admin" : "user");
        if (!refreshedPayload || !token) {
          clearSession();
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }
      }

      if (!token) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      let payload = getTokenPayload(token);
      const isExpired = payload?.exp ? payload.exp * 1000 <= Date.now() : true;

      if (isExpired) {
        payload = await refreshAccessToken(allowedRole);
      }

      const isStillExpired = payload?.exp ? payload.exp * 1000 <= Date.now() : true;

      if (!payload || isStillExpired || !payload.role) {
        clearSession();
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      const hasAccess = allowedRole === "user"
        ? payload.role === "user" || payload.role === "admin"
        : payload.role === allowedRole;

      if (!hasAccess) {
        router.replace(payload.role === "admin" ? "/home" : "/user");
        return;
      }

      timer = window.setTimeout(() => {
        if (!cancelled) {
          setIsAuthorized(true);
        }
      }, 0);
    };

    verifySession();

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [allowedRole, pathname, router]);

  if (!isAuthorized) {
    if (pathname === "/home/staff") {
      return <StaffRouteSkeleton />;
    }

    if (pathname === "/home") {
      return <HomeDashboardRouteSkeleton />;
    }

    if (pathname.startsWith("/home/")) {
      return <HomeTableRouteSkeleton />;
    }

    return <ProtectedRouteSkeleton allowedRole={allowedRole} />;
  }

  return <>{children}</>;
}
