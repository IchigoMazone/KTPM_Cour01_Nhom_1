"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface AddColumnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newColumnName: string;
  onNewColumnNameChange: (name: string) => void;
  onAddColumn: () => void;
}

export function AddColumnDialog({
  open,
  onOpenChange,
  newColumnName,
  onNewColumnNameChange,
  onAddColumn,
}: AddColumnDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex flex-col gap-0 overflow-hidden p-0 sm:max-w-[425px]"
      >
        <DialogHeader className="flex-row items-center justify-between gap-3 border-b border-slate-200 px-6 py-4 min-h-[61px]">
          <DialogTitle className="text-lg font-semibold leading-7 text-slate-950">
            Thêm cột tùy chỉnh
          </DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 p-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="columnName" className="text-sm font-medium text-slate-700">Tên cột mới</Label>
            <Input
              id="columnName"
              value={newColumnName}
              onChange={(e) => onNewColumnNameChange(e.target.value)}
              placeholder="VD: Ghi chú thêm, Kênh đặt..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") onAddColumn();
              }}
            />
          </div>
        </div>
        <DialogFooter className="m-0 border-t border-slate-200 bg-white px-6 py-4 flex flex-row items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-center text-center sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            className="w-full justify-center bg-slate-900 text-center text-white hover:bg-slate-800 sm:w-auto"
            onClick={onAddColumn}
          >
            Thêm cột
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
