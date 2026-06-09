import type { LucideIcon } from "lucide-react";

export function MetricCard({
  title,
  value,
  hint,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="grid size-7 shrink-0 place-items-center rounded-lg"
          style={{ color, backgroundColor: `${color}14` }}
        >
          <Icon className="size-3.5" />
        </span>
        <p className="truncate text-xs font-semibold text-slate-900">{title}</p>
      </div>
      <p className="mt-3 text-xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-2 truncate text-xs text-slate-400">{hint}</p>
    </div>
  );
}
