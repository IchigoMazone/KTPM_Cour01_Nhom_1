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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm cột tùy chỉnh</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="columnName" className="text-sm font-medium">Tên cột mới</Label>
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
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={onAddColumn}>Thêm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
