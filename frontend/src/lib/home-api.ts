import { API_BASE_URL } from "./config";
import { clearStoredSession, isInvalidSessionResponse, readErrorMessage, redirectToLogin } from "./auth-session";

type HomeListResponse<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
};

type HomeApiCacheEntry = {
  expiresAt: number;
  data: unknown;
};

const HOME_API_CACHE_TTL = 15_000;
const homeApiCache = new Map<string, HomeApiCacheEntry>();
const pendingHomeApiRequests = new Map<string, Promise<unknown>>();

export function getAreaToken(area?: "admin" | "user") {
  if (typeof window === "undefined") return null;
  const sessionToken = sessionStorage.getItem("token");
  const sessionRole = sessionStorage.getItem("role");

  if (area === "admin") {
    return (
      sessionStorage.getItem("adminToken") ||
      (sessionRole === "admin" ? sessionToken : null) ||
      localStorage.getItem("adminToken") ||
      localStorage.getItem("token")
    );
  }

  if (area === "user") {
    return (
      sessionStorage.getItem("userToken") ||
      (sessionRole === "customer" || sessionRole === "user" ? sessionToken : null) ||
      localStorage.getItem("userToken") ||
      localStorage.getItem("token")
    );
  }

  const pathname = window.location.pathname;
  if (pathname.startsWith("/home")) return getAreaToken("admin");
  if (pathname.startsWith("/user")) return getAreaToken("user");
  return sessionToken || localStorage.getItem("token");
}

export function clearHomeApiCache() {
  homeApiCache.clear();
  pendingHomeApiRequests.clear();
}

export async function homeApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAreaToken();
  const method = (init.method || "GET").toUpperCase();
  const url = `${API_BASE_URL}/api/home${path}`;
  const canCache = method === "GET" && typeof window !== "undefined" && init.cache !== "no-store";
  const cacheKey = canCache ? `${token || "guest"}:${url}` : "";

  if (canCache) {
    const cached = homeApiCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.data as T;

    const pending = pendingHomeApiRequests.get(cacheKey);
    if (pending) return pending as Promise<T>;
  }

  const request = fetch(url, {
    ...init,
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        const message = await readErrorMessage(response);
        if (typeof window !== "undefined" && isInvalidSessionResponse(response.status, message)) {
          clearStoredSession();
          clearHomeApiCache();
          redirectToLogin();
          throw new Error(message || "Phiên đăng nhập không hợp lệ.");
        }
        throw new Error(message || `Home API failed: ${response.status}`);
      }

      const data = await response.json();
      if (canCache) {
        homeApiCache.set(cacheKey, {
          data,
          expiresAt: Date.now() + HOME_API_CACHE_TTL,
        });
      } else if (method !== "GET") {
        clearHomeApiCache();
      }

      return data as T;
    })
    .finally(() => {
      if (canCache) pendingHomeApiRequests.delete(cacheKey);
    });

  if (canCache) pendingHomeApiRequests.set(cacheKey, request);

  return request;
}

export function listHomeResource<T>(
  resource: string,
  params?: { q?: string; limit?: number; offset?: number; includeCount?: boolean },
) {
  const search = new URLSearchParams();
  if (params?.q) search.set("q", params.q);
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.offset) search.set("offset", String(params.offset));
  search.set("include_count", params?.includeCount ? "true" : "false");
  const query = search.toString();
  return homeApi<HomeListResponse<T>>(`/${resource}${query ? `?${query}` : ""}`);
}

export const mapHomeOrderStatus = (status?: string) => {
  const statusMap: Record<string, string> = {
    "Đã nhận": "Tiếp nhận",
    "Phân loại": "Đã xác nhận lịch",
    "Đang giặt": "Đang giặt",
    "Đang sấy": "Đang giặt",
    "Gấp đồ": "Kiểm tra",
    "Sẵn sàng giao": "Chờ thanh toán",
    "Đang giao": "Chờ thanh toán",
    "Hoàn thành": "Hoàn thành",
    "Đã hủy": "Tiếp nhận",
  };
  return statusMap[status || ""] || "Tiếp nhận";
};

export const mapOrderStatusToApi = (status?: string) => {
  const statusMap: Record<string, string> = {
    "Tiếp nhận": "Đã nhận",
    "Đã xác nhận lịch": "Phân loại",
    "Đang giặt": "Đang giặt",
    "Kiểm tra": "Gấp đồ",
    "Chờ thanh toán": "Sẵn sàng giao",
    "Hoàn thành": "Hoàn thành",
  };
  return statusMap[status || ""] || "Đã nhận";
};
