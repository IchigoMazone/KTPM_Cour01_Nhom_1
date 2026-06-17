"use client";

import type { CSSProperties, DragEvent, ReactNode, RefObject } from "react";
import { ChevronDown, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResizableTableHead } from "@/src/components/ui/resizable-table-head";

export type DashboardTableColumn = {
  id: string;
  label: string;
  width?: number;
  visible?: boolean;
};

type DashboardDataTableProps<T> = {
  columns: DashboardTableColumn[];
  rows: T[];
  pageSize: number;
  emptyMessage: string;
  tableResizeMode?: "fit" | "custom";
  totalVisibleWidth?: number;
  rowClassName?: (row: T) => string;
  onRowClick?: (row: T) => void;
  renderCell: (row: T, column: DashboardTableColumn) => ReactNode;
  selectAll?: {
    ref?: RefObject<HTMLInputElement | null>;
    checked: boolean;
    disabled?: boolean;
    onChange: () => void;
    className: string;
    label: string;
    columnId?: string;
  };
  columnDrag?: {
    draggedColumnId: string | null;
    dragOverColumnId: string | null;
    onDragStart: (event: DragEvent<HTMLTableCellElement>, id: string) => void;
    onDragOver: (event: DragEvent<HTMLTableCellElement>, id: string) => void;
    onDragLeave: () => void;
    onDrop: (event: DragEvent<HTMLTableCellElement>, id: string) => void;
    onDragEnd: () => void;
  };
  onColumnsChange?: any;
};

export function DashboardDataTable<T>({
  columns,
  rows,
  pageSize,
  emptyMessage,
  tableResizeMode = "fit",
  totalVisibleWidth,
  rowClassName,
  onRowClick,
  renderCell,
  selectAll,
  columnDrag,
  onColumnsChange,
}: DashboardDataTableProps<T>) {
  const visibleColumns = columns.filter((column) => column.visible !== false);
  const widthTotal =
    totalVisibleWidth || visibleColumns.reduce((sum, column) => sum + (column.width || 150), 0);
  const showSelectAllInColumn = selectAll ? (selectAll.columnId || visibleColumns[0]?.id) : null;


  return (
    <div className="flex-1 overflow-auto [&_div[data-slot=table-container]]:overflow-visible">
      <Table className={`${tableResizeMode === "fit" ? "w-full table-fixed" : "w-max table-fixed"} text-xs [&_td]:h-11 [&_td]:py-0 [&_td]:align-middle [&_th]:h-11 [&_th]:py-0 [&_th]:align-middle`}>
        <TableHeader>
          <TableRow className="h-9 border-b border-slate-200 bg-slate-50 hover:bg-slate-50">
            {visibleColumns.map((column) => {
              const fitStyle: CSSProperties | undefined =
                tableResizeMode === "fit"
                  ? { width: `${((column.width || 120) / widthTotal) * 100}%` }
                  : undefined;
              const canDragColumn = Boolean(columnDrag);

              return (
                <ResizableTableHead
                  key={column.id}
                  width={tableResizeMode === "fit" ? undefined : column.width}
                  autoWidth={tableResizeMode === "fit"}
                  style={fitStyle}
                  onResize={(width) => {
                    if (onColumnsChange) {
                      onColumnsChange((prev: any) =>
                        prev.map((c: any) => (c.id === column.id ? { ...c, width } : c))
                      );
                    }
                  }}
                  className={`text-xs font-medium text-slate-600 group/head ${column.id === "actions" ? "text-left" : ""} ${columnDrag?.dragOverColumnId === column.id ? "bg-slate-200/50" : ""} ${columnDrag?.draggedColumnId === column.id ? "opacity-50" : ""}`}
                  draggable={canDragColumn}
                  onDragStart={(event) => {
                    if (!canDragColumn) return;
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", column.id);
                    columnDrag?.onDragStart(event, column.id);
                  }}
                  onDragOver={(event) => {
                    if (!canDragColumn) return;
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                    columnDrag?.onDragOver(event, column.id);
                  }}
                  onDragLeave={canDragColumn ? columnDrag?.onDragLeave : undefined}
                  onDrop={(event) => {
                    if (!canDragColumn) return;
                    event.preventDefault();
                    columnDrag?.onDrop(event, column.id);
                  }}
                  onDragEnd={canDragColumn ? columnDrag?.onDragEnd : undefined}
                >
                  {selectAll && showSelectAllInColumn && column.id === showSelectAllInColumn ? (
                    <span className="inline-flex items-center gap-2">
                      <input
                        ref={selectAll.ref}
                        type="checkbox"
                        aria-label={selectAll.label}
                        checked={selectAll.checked}
                        disabled={selectAll.disabled}
                        onChange={selectAll.onChange}
                        className={selectAll.className}
                      />
                      {column.label}
                    </span>
                  ) : (
                    <span>{column.label}</span>
                  )}
                </ResizableTableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={visibleColumns.length}>
                <div className="grid min-h-[300px] place-items-center text-sm text-slate-400">
                  {emptyMessage}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow
                key={index}
                className={rowClassName?.(row) || "group h-11 border-b border-slate-200 text-slate-700 transition-colors hover:bg-slate-50/60"}
                onClick={() => onRowClick?.(row)}
              >
                {visibleColumns.map((column) => renderCell(row, column))}
              </TableRow>
            ))
          )}

        </TableBody>
      </Table>
    </div>
  );
}

type DashboardTableFooterProps = {
  page: number;
  pageCount: number;
  pageSize: number;
  totalRows: number;
  totalLabel?: string;
  customPageSize: string;
  openPageSizeMenu: boolean;
  onOpenPageSizeMenuChange: (open: boolean) => void;
  onCustomPageSizeChange: (value: string) => void;
  onApplyCustomPageSize: () => void;
  onUpdatePageSize: (size: number) => void;
  onPageChange: (page: number | ((current: number) => number)) => void;
};

type DashboardSelectionBarProps = {
  checked: boolean;
  disabled?: boolean;
  selectedCount: number;
  totalCount: number;
  itemLabel: string;
  checkboxClassName: string;
  onToggle: () => void;
};

export function DashboardSelectionBar({
  checked,
  disabled,
  selectedCount,
  totalCount,
  itemLabel,
  checkboxClassName,
  onToggle,
}: DashboardSelectionBarProps) {
  return (
    <div className="inline-flex flex-wrap items-center gap-2 text-xs">
      <label
        className={`inline-flex h-7 items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 font-medium transition-colors ${
          disabled ? "cursor-not-allowed text-slate-300" : "cursor-pointer text-slate-700 hover:bg-slate-50"
        }`}
      >
        <input
          type="checkbox"
          aria-label={`Chọn tất cả ${itemLabel}`}
          checked={checked}
          disabled={disabled}
          onChange={onToggle}
          className={checkboxClassName}
        />
        Chọn tất cả
      </label>
      <span className="inline-flex h-7 items-center rounded-full bg-slate-100 px-2.5 font-medium text-slate-500">
        {selectedCount}/{totalCount} {itemLabel} đã chọn
      </span>
    </div>
  );
}

export function DashboardTableFooter({
  page,
  pageCount,
  pageSize,
  totalRows,
  totalLabel,
  customPageSize,
  openPageSizeMenu,
  onOpenPageSizeMenuChange,
  onCustomPageSizeChange,
  onApplyCustomPageSize,
  onUpdatePageSize,
  onPageChange,
}: DashboardTableFooterProps) {
  return (
    <div className="shrink-0 border-t border-slate-200 bg-white px-5 pt-3 pb-1">
      <div className="flex flex-col gap-3 text-xs text-slate-700 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span>Số dòng mỗi trang</span>
          <DropdownMenu open={openPageSizeMenu} onOpenChange={onOpenPageSizeMenuChange}>
            <DropdownMenuTrigger asChild>
              <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 px-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50">
                {pageSize}
                <ChevronDown className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              {[5, 10, 20, 50].map((size) => (
                <DropdownMenuItem key={size} onClick={() => onUpdatePageSize(size)}>
                  {size} dòng
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <div className="p-2">
                <Label htmlFor="dashboardCustomPageSize" className="text-xs text-slate-500">
                  Tự nhập
                </Label>
                <div className="mt-1 flex gap-1.5">
                  <Input
                    id="dashboardCustomPageSize"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={customPageSize}
                    onChange={(event) => {
                      const val = event.target.value.replace(/\D/g, "");
                      onCustomPageSizeChange(val);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") onApplyCustomPageSize();
                    }}
                    className="h-8 text-xs"
                    placeholder="VD: 15"
                  />
                  <Button type="button" size="sm" className="h-8 px-2 text-xs" onClick={onApplyCustomPageSize}>
                    OK
                  </Button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="text-slate-400">
            {totalRows === 0 ? 0 : (page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, totalRows)} trong {totalRows} dòng
          </span>
          {totalLabel && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {totalLabel}
            </span>
          )}
        </div>

        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => onPageChange(1)}
          >
            <ChevronsLeft className="size-4" />
          </button>
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => onPageChange((current) => Math.max(current - 1, 1))}
          >
            <ChevronDown className="size-4 rotate-90" />
          </button>
          <span className="px-3 text-sm font-medium text-slate-700">
            {page} / {pageCount || 1}
          </span>
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 disabled:opacity-40"
            disabled={page >= pageCount}
            onClick={() => onPageChange((current) => Math.min(current + 1, pageCount))}
          >
            <ChevronDown className="size-4 -rotate-90" />
          </button>
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 disabled:opacity-40"
            disabled={page >= pageCount}
            onClick={() => onPageChange(pageCount || 1)}
          >
            <ChevronsRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
