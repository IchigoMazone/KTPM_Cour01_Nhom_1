"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/src/lib/config";
import { Skeleton } from "@/src/components/ui/skeleton";

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
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("role");
  localStorage.removeItem("username");
  localStorage.removeItem("user_id");
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

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
  localStorage.setItem("role", data.role === "admin" ? "admin" : "customer");
  localStorage.setItem("username", data.username);
  localStorage.setItem("user_id", data.user_id);

  return getTokenPayload(data.access_token);
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
        <div className="flex min-h-16 items-center gap-3 border-b border-gray-200 bg-white/95 px-3 sm:px-4">
          <Skeleton className="size-10 rounded-lg xl:hidden" />
          <div className="hidden min-w-[180px] shrink-0 space-y-2 md:block">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="ml-auto h-10 w-full max-w-md rounded-lg" />
          <Skeleton className="hidden h-9 w-24 rounded-lg md:block" />
          <Skeleton className="hidden h-9 w-28 rounded-lg lg:block" />
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
      let token = localStorage.getItem("token");

      if (!token && localStorage.getItem("refreshToken")) {
        const refreshedPayload = await refreshAccessToken();
        token = localStorage.getItem("token");
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
        payload = await refreshAccessToken();
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
    return <ProtectedRouteSkeleton allowedRole={allowedRole} />;
  }

  return <>{children}</>;
}
