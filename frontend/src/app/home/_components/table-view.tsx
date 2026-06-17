"use client";

import {
  DashboardDataTable,
  DashboardTableFooter,
} from "@/src/components/common/dashboard-data-table";

interface TableViewProps<T> {
  columns: any[];
  rows: T[];
  pageSize: number;
  emptyMessage: string;
  tableResizeMode: "fit" | "custom";
  totalVisibleWidth: number;
  renderCell: (row: T, col: any) => React.ReactNode;
  columnDrag?: {
    draggedColumnId: string | null;
    dragOverColumnId: string | null;
    onDragStart: (e: React.DragEvent<HTMLTableCellElement>, id: string) => void;
    onDragOver: (e: React.DragEvent<HTMLTableCellElement>, id: string) => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent<HTMLTableCellElement>, id: string) => void;
    onDragEnd: () => void;
  };
  onColumnsChange?: any;
  selectAll?: {
    ref?: any;
    checked: boolean;
    disabled?: boolean;
    onChange: () => void;
    className: string;
    label: string;
    columnId?: string;
  };
  page: number;
  pageCount: number;
  totalRows: number;
  totalLabel?: string;
  customPageSize: string;
  openPageSizeMenu: boolean;
  onOpenPageSizeMenuChange: (open: boolean) => void;
  onCustomPageSizeChange: (value: string) => void;
  onApplyCustomPageSize: () => void;
  onUpdatePageSize: (size: number) => void;
  onPageChange: (page: number | ((current: number) => number)) => void;
}

export function TableView<T>({
  columns,
  rows,
  pageSize,
  emptyMessage,
  tableResizeMode,
  totalVisibleWidth,
  renderCell,
  columnDrag,
  onColumnsChange,
  selectAll,
  page,
  pageCount,
  totalRows,
  totalLabel,
  customPageSize,
  openPageSizeMenu,
  onOpenPageSizeMenuChange,
  onCustomPageSizeChange,
  onApplyCustomPageSize,
  onUpdatePageSize,
  onPageChange,
}: TableViewProps<T>) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <DashboardDataTable
        columns={columns}
        rows={rows}
        pageSize={pageSize}
        emptyMessage={emptyMessage}
        tableResizeMode={tableResizeMode}
        totalVisibleWidth={totalVisibleWidth}
        renderCell={renderCell}
        columnDrag={columnDrag}
        onColumnsChange={onColumnsChange}
        selectAll={selectAll}
      />
      <DashboardTableFooter
        page={page}
        pageCount={pageCount}
        pageSize={pageSize}
        totalRows={totalRows}
        totalLabel={totalLabel}
        customPageSize={customPageSize}
        openPageSizeMenu={openPageSizeMenu}
        onOpenPageSizeMenuChange={onOpenPageSizeMenuChange}
        onCustomPageSizeChange={onCustomPageSizeChange}
        onApplyCustomPageSize={onApplyCustomPageSize}
        onUpdatePageSize={onUpdatePageSize}
        onPageChange={onPageChange}
      />
    </div>
  );
}
