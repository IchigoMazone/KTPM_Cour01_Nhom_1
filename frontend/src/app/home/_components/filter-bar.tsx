"use client";

import {
  CalendarClock,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardSelectionBar } from "@/src/components/common/dashboard-data-table";

export interface FilterOption {
  id: string;
  label: string;
  color?: string;
  bgColor?: string;
}

interface FilterBarProps {
  rangeLabel: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  filterOptions: FilterOption[];
  filterLabel: string;
  allSelected?: boolean;
  disabled?: boolean;
  selectedCount?: number;
  totalCount?: number;
  itemLabel?: string;
  checkboxClass?: string;
  onToggleAll?: () => void;
  showSelectionBar?: boolean;
}

export function FilterBar({
  rangeLabel,
  selectedValue,
  onValueChange,
  filterOptions,
  filterLabel,
  allSelected = false,
  disabled = false,
  selectedCount = 0,
  totalCount = 0,
  itemLabel = "",
  checkboxClass = "",
  onToggleAll,
  showSelectionBar = true,
}: FilterBarProps) {
  const selectedOption = filterOptions.find((option) => option.id === selectedValue);

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-5 py-3">
      <button type="button" className="inline-flex h-7 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 text-xs text-slate-700 transition-colors hover:bg-slate-50">
        <CalendarClock className="size-3.5" />
        {rangeLabel}
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="inline-flex h-7 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 text-xs text-slate-700 transition-colors hover:bg-slate-50">
            <SlidersHorizontal className="size-3.5" />
            {selectedOption?.label || selectedValue}
            <ChevronDown className="size-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuLabel>{filterLabel}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {filterOptions.map((opt) => {
            return (
              <DropdownMenuItem
                key={opt.id}
                onClick={() => onValueChange(opt.id)}
              >
                <span
                  className="mr-2 size-2 rounded-full"
                  style={{ backgroundColor: opt.color || "#64748b" }}
                />
                {opt.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      {showSelectionBar && onToggleAll && (
        <DashboardSelectionBar
          checked={allSelected}
          disabled={disabled}
          selectedCount={selectedCount}
          totalCount={totalCount}
          itemLabel={itemLabel}
          checkboxClassName={checkboxClass}
          onToggle={onToggleAll}
        />
      )}
      <div className="ml-auto hidden flex-wrap gap-1.5 2xl:flex">
        {filterOptions.map((opt) => {
          const active = selectedValue === opt.id;
          const activeColor = opt.color || "#0f766e";
          const activeBgColor = opt.bgColor || "rgba(15,118,110,0.09)";

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onValueChange(opt.id)}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-all hover:bg-slate-50"
              style={
                active
                  ? { color: activeColor, backgroundColor: activeBgColor }
                  : { color: "#64748b", backgroundColor: "transparent" }
              }
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: active ? activeColor : "#cbd5e1" }}
              />
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
