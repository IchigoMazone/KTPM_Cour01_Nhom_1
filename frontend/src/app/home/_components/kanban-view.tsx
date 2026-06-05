"use client";

import React from "react";

export interface KanbanColumn {
  id: string;
  label: string;
  color?: { text: string; bg: string };
}

interface KanbanViewProps<T> {
  columns: KanbanColumn[];
  rows: T[];
  groupByKey: keyof T;
  draggedItemId: string | null;
  onDraggedItemIdChange: (id: string | null) => void;
  dragOverColumnId: string | null;
  onDragOverColumnIdChange: (id: string | null) => void;
  onDropItem: (itemId: string, columnId: string) => void;
  renderCard: (item: T) => React.ReactNode;
  tableResizeMode: "fit" | "custom";
  onAddColumn?: (col: KanbanColumn) => void;
  onRemoveColumn?: (colId: string) => void;
  /** Force a specific number of columns in the grid (e.g. 2 for a 2-column layout) */
  maxCols?: 1 | 2 | 3 | 4 | 6;
  lanesPerColumn?: 1 | 2 | 3;
}

export function KanbanView<T extends { id: string }>({
  columns,
  rows,
  groupByKey,
  draggedItemId,
  onDraggedItemIdChange,
  dragOverColumnId,
  onDragOverColumnIdChange,
  onDropItem,
  renderCard,
  tableResizeMode,
  onAddColumn: _onAddColumn,
  onRemoveColumn: _onRemoveColumn,
  maxCols,
  lanesPerColumn,
}: KanbanViewProps<T>) {
  const effectiveLanesPerColumn =
    lanesPerColumn ?? (columns.length === 3 ? 2 : columns.length <= 2 ? 3 : 1);
  const fitGridClass = maxCols === 2
    ? "grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto"
    : maxCols === 3
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto"
    : maxCols === 6
    ? "grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-y-auto"
    : effectiveLanesPerColumn > 1 && columns.length === 1
    ? "grid grid-cols-1 gap-4 overflow-y-auto"
    : effectiveLanesPerColumn > 1 && columns.length === 2
    ? "grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto"
    : effectiveLanesPerColumn > 1 && columns.length === 3
    ? "grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-y-auto"
    : columns.length === 4
    ? "grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto xl:grid-cols-4"
    : "grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto lg:grid-cols-3 xl:grid-cols-6";
  const lanes = Array.from({ length: effectiveLanesPerColumn }, (_, index) => index);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className={`flex-1 p-5 bg-slate-50/30 min-h-0 ${
        tableResizeMode === "fit" ? fitGridClass : "flex gap-4 overflow-x-auto"
      }`}>
        {columns.map((col, index) => {
          const colItems = rows.filter((item) => String(item[groupByKey]) === col.id);
          const color = col.color || { text: "#64748b", bg: "rgba(100,116,139,0.1)" };
          const fillOddTwoColumnRow =
            tableResizeMode === "fit" &&
            maxCols === 2 &&
            columns.length % 2 === 1 &&
            index === columns.length - 1;

          return (
            <div
              key={col.id}
              className={`flex flex-col rounded-xl border border-slate-200 bg-slate-100/50 p-3 transition-colors ${
                tableResizeMode === "fit" ? "w-full min-h-[300px]" : effectiveLanesPerColumn === 3 ? "min-w-[940px] max-w-[940px]" : effectiveLanesPerColumn > 1 ? "min-w-[620px] max-w-[620px]" : "min-w-[300px] max-w-[300px]"
              } ${fillOddTwoColumnRow ? "sm:col-span-2" : ""} ${dragOverColumnId === col.id ? "border-slate-400 bg-slate-200/50" : ""}`}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <span className="inline-flex items-center gap-1.5 font-semibold" style={{ color: color.text }}>
                  <span className="size-2 rounded-full" style={{ backgroundColor: color.text }} />
                  {col.label}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-500">
                  {colItems.length}
                </span>
              </div>

              {effectiveLanesPerColumn > 1 ? (
                <div className={`grid h-full min-h-[100px] gap-3 overflow-y-auto px-1 pb-2 ${effectiveLanesPerColumn === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
                  {lanes.map((laneIndex) => {
                    const laneItems = colItems.filter((_, itemIndex) => itemIndex % effectiveLanesPerColumn === laneIndex);

                    return (
                      <div
                        key={`${col.id}-${laneIndex}`}
                        className="flex min-h-[100px] flex-col gap-3"
                        onDragOver={(event) => {
                          event.preventDefault();
                          if (dragOverColumnId !== col.id) onDragOverColumnIdChange(col.id);
                        }}
                        onDragLeave={() => onDragOverColumnIdChange(null)}
                        onDrop={(event) => {
                          event.preventDefault();
                          if (draggedItemId) {
                            onDropItem(draggedItemId, col.id);
                          }
                          onDraggedItemIdChange(null);
                          onDragOverColumnIdChange(null);
                        }}
                      >
                        {laneItems.map((item) => renderCard(item))}

                        {laneItems.length === 0 && (
                          <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
                            Kéo thả vào đây
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  className="flex h-full min-h-[100px] flex-col gap-3 overflow-y-auto px-1 pb-2"
                  onDragOver={(event) => {
                    event.preventDefault();
                    if (dragOverColumnId !== col.id) onDragOverColumnIdChange(col.id);
                  }}
                  onDragLeave={() => onDragOverColumnIdChange(null)}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (draggedItemId) {
                      onDropItem(draggedItemId, col.id);
                    }
                    onDraggedItemIdChange(null);
                    onDragOverColumnIdChange(null);
                  }}
                >
                  {colItems.map((item) => renderCard(item))}

                  {colItems.length === 0 && (
                    <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
                      Kéo thả vào đây
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
