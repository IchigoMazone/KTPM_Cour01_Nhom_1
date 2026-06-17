"use client";

import { API_BASE_URL } from "./config";

type CurrentUserResponse = {
  user_id: string;
  username: string;
  role: string;
  is_active: boolean;
  page_size?: number | null;
  table_resize_mode?: string | null;
  columns_config?: string | null;
  profile?: {
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    image_url?: string | null;
  } | null;
};

const INVALID_SESSION_MESSAGES = [
  "Người dùng không tồn tại.",
  "Token không hợp lệ hoặc đã hết hạn.",
  "Token thiếu thông tin định danh.",
  "Tài khoản đã bị khóa.",
];

export function clearStoredSession() {
  if (typeof window === "undefined") return;

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
}

export function isInvalidSessionResponse(status: number, message: string) {
  if (status === 401 || status === 403) return true;
  return INVALID_SESSION_MESSAGES.some((item) => message.includes(item));
}

export function redirectToLogin() {
  if (typeof window === "undefined") return;
  const redirect = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.location.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
}

export async function readErrorMessage(response: Response) {
  const rawMessage = await response.text();
  if (!rawMessage) return "";

  try {
    const parsed = JSON.parse(rawMessage) as { detail?: string; message?: string };
    return parsed.detail || parsed.message || rawMessage;
  } catch {
    return rawMessage;
  }
}

export async function fetchCurrentUser(token: string): Promise<CurrentUserResponse | null> {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    if (isInvalidSessionResponse(response.status, message)) {
      clearStoredSession();
      redirectToLogin();
      return null;
    }
    throw new Error(message || "Failed to fetch profile");
  }

  return response.json() as Promise<CurrentUserResponse>;
}
