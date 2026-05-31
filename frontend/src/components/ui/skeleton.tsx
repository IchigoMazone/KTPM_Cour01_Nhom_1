"use client";

import React from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`premium-shimmer rounded-md ${className}`}
    />
  );
}
