"use client";

import { useEffect } from "react";

export function useScrollFromHash() {
  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (!id) return;

    const el = document.getElementById(id);
    if (!el) return;

    requestAnimationFrame(() => {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, []);
}
