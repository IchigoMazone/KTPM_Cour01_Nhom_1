"use client";

import React from "react";

interface ListViewProps<T> {
  paginatedRows: T[];
  emptyMessage: string;
  renderRow: (row: T) => React.ReactNode;
}

export function ListView<T>({
  paginatedRows,
  emptyMessage,
  renderRow,
}: ListViewProps<T>) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/30 p-4">
        {paginatedRows.length === 0 ? (
          <div className="grid min-h-[320px] place-items-center rounded-lg border border-dashed border-slate-200 bg-white text-sm text-slate-400">
            {emptyMessage}
          </div>
        ) : (
          <div className="grid gap-3">
            {paginatedRows.map((row) => renderRow(row))}
          </div>
        )}
      </div>
    </div>
  );
}
