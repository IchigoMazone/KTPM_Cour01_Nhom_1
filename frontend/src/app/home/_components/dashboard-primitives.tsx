"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type Period = "Ngày" | "Tuần" | "Tháng";

type PageShellProps = {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
};

export function PageShell({
  title,
  description,
  action,
  children,
}: PageShellProps) {
  return (
    <div className="w-full min-w-0 space-y-4 p-4 sm:space-y-5 sm:p-5 lg:space-y-6 lg:p-8">
      <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  tone?: "default" | "warning" | "danger" | "success";
};

const statTone = {
  default: "bg-neutral-100 text-neutral-900",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  success: "bg-emerald-50 text-emerald-700",
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: StatCardProps) {
  return (
    <Card className="min-w-0 border-border/70 shadow-sm">
      <CardContent className="flex min-w-0 items-center gap-3 p-4 sm:gap-4 sm:p-5">
        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${statTone[tone]}`}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
            {value}
          </p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function SectionCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="min-w-0 overflow-hidden border-border/70 shadow-sm">
      <CardHeader className="flex flex-col items-stretch justify-between gap-3 border-b bg-card px-4 py-4 sm:flex-row sm:items-start sm:px-6">
        <div className="min-w-0 space-y-1">
          <CardTitle className="text-base">{title}</CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}

export function StatusBadge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const className =
    tone === "success"
      ? "border border-emerald-200 bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
      : tone === "warning"
        ? "border border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-100"
        : tone === "danger"
          ? "border border-red-200 bg-red-100 text-red-800 hover:bg-red-100"
          : "border border-sky-200 bg-sky-100 text-sky-800 hover:bg-sky-100";

  return (
    <Badge variant="secondary" className={`rounded-full font-medium ${className}`}>
      {children}
    </Badge>
  );
}

export function ActionButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Button size="sm" className="bg-neutral-900 text-white hover:bg-neutral-800" onClick={onClick}>
      {children}
    </Button>
  );
}

export function PeriodTabs({
  value,
  onChange,
}: {
  value: Period;
  onChange: (value: Period) => void;
}) {
  return (
    <div className="flex w-full overflow-x-auto rounded-lg border bg-card p-1 sm:w-auto">
      {(["Ngày", "Tuần", "Tháng"] as Period[]).map((period) => (
        <Button
          key={period}
          type="button"
          variant={value === period ? "default" : "ghost"}
          size="sm"
          className={`shrink-0 ${value === period ? "bg-neutral-900 text-white" : ""}`}
          onClick={() => onChange(period)}
        >
          {period}
        </Button>
      ))}
    </div>
  );
}

export function PaginationFooter({
  page,
  pageCount,
  total,
  onPrev,
  onNext,
}: {
  page: number;
  pageCount: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <span>
        Hiển thị trang {page}/{pageCount || 1} · {total} bản ghi
      </span>
      <div className="flex gap-2 sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={onPrev}
        >
          Trước
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={onNext}
        >
          Sau
        </Button>
      </div>
    </div>
  );
}
