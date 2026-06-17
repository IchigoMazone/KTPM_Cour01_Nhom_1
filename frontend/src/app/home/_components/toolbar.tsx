"use client";

import {
  Download,
  EyeOff,
  FileDown,
  FileSpreadsheet,
  FileText,
  FileType,
  History,
  Plus,
  Search,
  Settings,
  X,
} from "lucide-react";
import { type Dispatch, type SetStateAction, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ViewModeTabs,
  type DashboardViewMode,
} from "./dashboard-primitives";

type ToolbarColumn = {
  id: string;
  label: string;
  visible?: boolean;
};

interface ToolbarProps<TColumn extends ToolbarColumn> {
  viewMode?: DashboardViewMode;
  onViewModeChange?: (mode: DashboardViewMode) => void;
  leftContent?: React.ReactNode;
  query: string;
  onQueryChange: (query: string) => void;
  columns: TColumn[];
  onColumnsChange: Dispatch<SetStateAction<TColumn[]>>;
  tableResizeMode: "fit" | "custom";
  onTableResizeModeChange: (mode: "fit" | "custom") => void;
  selectedCount: number;
  onOpenAddColumn: () => void;
  onOpenHistory?: () => void;
  onExport: (format: "pdf" | "excel" | "csv", fileName: string) => void;
  defaultExportFileName: string;
  onCreateClick?: () => void;
  createLabel: string;
  defaultColumnIds?: string[];
  searchPlaceholder?: string;
  showSearch?: boolean;
  showHistoryButton?: boolean;
  showAddColumnButton?: boolean;
}

export function Toolbar<TColumn extends ToolbarColumn>({
  viewMode,
  onViewModeChange,
  leftContent,
  query,
  onQueryChange,
  columns,
  onColumnsChange,
  tableResizeMode,
  onTableResizeModeChange,
  selectedCount,
  onOpenAddColumn,
  onOpenHistory,
  onExport,
  defaultExportFileName,
  onCreateClick,
  createLabel,
  defaultColumnIds,
  searchPlaceholder = "Tìm kiếm...",
  showSearch = true,
  showHistoryButton = true,
  showAddColumnButton = true,
}: ToolbarProps<TColumn>) {
  const customColumns = useMemo(() => {
    if (!defaultColumnIds) return [];
    return columns.filter((col) => !defaultColumnIds.includes(col.id));
  }, [columns, defaultColumnIds]);

  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 px-5 pt-1 pb-3 xl:flex-row xl:items-center xl:justify-between">
      {/* Left: custom leftContent or view tabs */}
      <div className="flex items-center gap-1">
        {leftContent ? leftContent : (
          viewMode && onViewModeChange && (
            <ViewModeTabs value={viewMode} onChange={onViewModeChange} />
          )
        )}
      </div>

      {/* Right: search + actions */}
      <div className="flex flex-wrap items-center gap-2">
        {showSearch && (
          <div className="relative min-w-[220px] flex-1 xl:w-64 xl:flex-none">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
            <Input
              className="h-8 rounded-md border-slate-200 bg-white pl-8 text-xs text-slate-700 shadow-none placeholder:text-slate-500 focus-visible:ring-slate-200"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
            />
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs text-slate-700 transition-colors hover:bg-slate-50">
              <EyeOff className="size-3.5" />
              Ẩn cột
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Hiển thị cột</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {columns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.visible}
                onCheckedChange={(value) => {
                  onColumnsChange((prev) =>
                    prev.map((c) =>
                      c.id === column.id ? { ...c, visible: !!value } : c
                    )
                  );
                }}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs text-slate-700 transition-colors hover:bg-slate-50">
              <Settings className="size-3.5" />
              Tùy chỉnh
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {showAddColumnButton && (
              <>
                <DropdownMenuItem onClick={onOpenAddColumn}>
                  <Plus className="size-3.5 mr-2" />
                  Thêm cột mới
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuLabel>Co giãn dữ liệu bảng</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={tableResizeMode === "fit"}
              onCheckedChange={(checked) => {
                if (checked) onTableResizeModeChange("fit");
              }}
            >
              Tự động vừa thiết bị
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={tableResizeMode === "custom"}
              onCheckedChange={(checked) => {
                if (checked) onTableResizeModeChange("custom");
              }}
            >
              Kéo giãn nâng cao
            </DropdownMenuCheckboxItem>
            {customColumns.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Xóa cột tùy chỉnh</DropdownMenuLabel>
                {customColumns.map((col) => (
                  <DropdownMenuItem
                    key={col.id}
                    className="text-red-600 focus:text-red-600"
                    onClick={() => {
                      onColumnsChange((prev) => prev.filter((c) => c.id !== col.id));
                    }}
                  >
                    <X className="size-3.5 mr-2" />
                    Xóa &quot;{col.label}&quot;
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {showHistoryButton && (
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs text-slate-700 transition-colors hover:bg-slate-50 disabled:text-slate-300 disabled:hover:bg-transparent"
            disabled={selectedCount === 0}
            onClick={onOpenHistory}
          >
            <History className="size-3.5" />
            Lịch sử
          </button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-colors hover:bg-slate-50">
              <Download className="size-3.5" />
              Xuất file
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Chọn định dạng xuất</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[
              { label: "PDF", hint: "Bản in, hóa đơn và báo cáo", icon: FileText, format: "pdf" as const },
              { label: "Excel", hint: "Đối soát, lọc và xử lý dữ liệu", icon: FileSpreadsheet, format: "excel" as const },
              { label: "CSV", hint: "Nhập dữ liệu sang hệ thống khác", icon: FileType, format: "csv" as const },
            ].map(({ label, hint, icon: Icon, format }) => (
              <DropdownMenuItem key={label} className="items-start gap-3 py-2.5" onClick={() => onExport(format, defaultExportFileName)}>
                <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                  {label === "PDF" ? <FileDown className="size-4" /> : <Icon className="size-4" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-medium text-slate-800">Xuất {label}</span>
                  <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">{hint}</span>
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {onCreateClick && (
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
            onClick={onCreateClick}
          >
            <Plus className="size-3.5" />
            {createLabel}
          </button>
        )}
      </div>
    </div>
  );
}
