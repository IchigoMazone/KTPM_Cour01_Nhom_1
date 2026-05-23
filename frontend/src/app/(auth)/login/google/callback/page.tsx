"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const finishGoogleLogin = async () => {
      const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const googleError = params.get("error");
      const idToken = params.get("id_token");
      const state = params.get("state");
      const expectedState = sessionStorage.getItem("google_oauth_state");
      const clientId = sessionStorage.getItem("google_oauth_client_id") || "";

      sessionStorage.removeItem("google_oauth_state");
      sessionStorage.removeItem("google_oauth_client_id");

      if (googleError) {
        throw new Error("Google đã hủy hoặc từ chối đăng nhập.");
      }

      if (!idToken) {
        throw new Error("Google không trả về mã xác thực.");
      }

      if (!state || !expectedState || state !== expectedState) {
        throw new Error("Phiên đăng nhập Google không hợp lệ.");
      }

      const response = await fetch("http://localhost:8000/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_token: idToken,
          client_id: clientId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Đăng nhập Google thất bại.");
      }

      toast.success(data.message || "Đăng nhập Google thành công!");
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role || "customer");
      router.replace(data.role === "admin" ? "/home" : "/user");
    };

    finishGoogleLogin().catch((err) => {
      const message = err instanceof Error ? err.message : "Đăng nhập Google thất bại.";
      setError(message);
      toast.error(message);
    });
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4">
      <section className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-base font-semibold text-gray-900">
          {error ? "Không thể đăng nhập" : "Đang hoàn tất đăng nhập"}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {error || "Vui lòng chờ trong giây lát."}
        </p>
        {error && (
          <Link
            href="/login"
            className="mt-5 inline-flex h-9 items-center justify-center rounded-md bg-amber-500 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-600"
          >
            Quay lại đăng nhập
          </Link>
        )}
      </section>
    </main>
  );
}
