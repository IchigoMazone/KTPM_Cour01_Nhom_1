import { API_BASE_URL } from "./config";
import { getAreaToken } from "./home-api";
import { clearStoredSession, isInvalidSessionResponse, readErrorMessage, redirectToLogin } from "./auth-session";

type UploadArea = "admin" | "user";

export async function uploadSupportChatImage(file: File, area: UploadArea) {
  const token = getAreaToken(area);
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/home/support-chat/upload-image`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    if (typeof window !== "undefined" && isInvalidSessionResponse(response.status, message)) {
      clearStoredSession();
      redirectToLogin();
    }
    throw new Error(message || "Không thể tải ảnh lên.");
  }

  return response.json() as Promise<{ success: true; image_url: string }>;
}
