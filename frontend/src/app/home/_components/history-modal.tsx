"use client";

import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HistoryModalProps<T> {
  open: boolean;
  onClose: () => void;
  title: string;
  items: T[];
  activeItemId: string | null;
  onActiveItemChange: (id: string) => void;
  renderSidebarItem: (item: T, active: boolean) => React.ReactNode;
  renderDetail: (item: T) => React.ReactNode;
  itemLabel?: string;
  maxWidthClass?: string;
}

export function HistoryModal<T extends { id: string }>({
  open,
  onClose,
  title,
  items,
  activeItemId,
  onActiveItemChange,
  renderSidebarItem,
  renderDetail,
  itemLabel = "mục",
  maxWidthClass = "max-w-3xl",
}: HistoryModalProps<T>) {
  if (!open) return null;

  const activeItem = items.find((item) => item.id === activeItemId) ?? items[0] ?? null;

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <Card className={`flex h-[620px] max-h-[86dvh] w-full ${maxWidthClass} flex-col overflow-hidden rounded-xl border-border bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10`}>
        <CardHeader className="flex flex-row items-start justify-between border-b border-border bg-popover px-4 py-3">
          <div>
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {items.length} {itemLabel} đang được chọn
            </p>
          </div>
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"
            onClick={onClose}
          >
            <X className="size-5" />
          </button>
        </CardHeader>
        <CardContent className="grid min-h-0 flex-1 overflow-hidden p-0 md:grid-cols-[230px_1fr]">
          <div className="flex min-h-0 flex-col border-b border-border bg-muted/30 p-2 md:border-b-0 md:border-r">
            <div className="flex min-h-0 flex-1 gap-1.5 overflow-x-auto [scrollbar-gutter:stable] md:flex-col md:overflow-x-hidden md:overflow-y-auto md:pr-1">
              {items.map((item) => {
                const active = activeItem?.id === item.id;
                return (
                  <div key={item.id} onClick={() => onActiveItemChange(item.id)} className="cursor-pointer">
                    {renderSidebarItem(item, active)}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto p-4 [scrollbar-gutter:stable]">
            {activeItem ? (
              renderDetail(activeItem)
            ) : (
              <div className="grid h-full min-h-[320px] place-items-center text-sm text-slate-400">
                Chọn một mục để xem chi tiết.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
