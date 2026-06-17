export const DEFAULT_ACCOUNT_AVATAR_URL = "";
export const LEGACY_DEFAULT_AVATAR_MARKERS = ["default_avatar.jfif"];

export const ACCOUNT_PROFILE_UPDATED_EVENT = "account-profile-updated";

export function normalizeAccountAvatarUrl(value?: string | null) {
  const normalized = String(value || "").trim();
  if (!normalized) return "";
  if (LEGACY_DEFAULT_AVATAR_MARKERS.some((marker) => normalized.includes(marker))) return "";
  return normalized;
}

export function emitAccountProfileUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ACCOUNT_PROFILE_UPDATED_EVENT));
}
