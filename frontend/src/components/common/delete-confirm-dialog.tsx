import { type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpokeSpinner } from "@/src/components/ui/spoke-spinner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export type DeleteConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  confirmLabel?: string;
  children: ReactNode;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
};

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title = "Xác nhận xóa",
  confirmLabel = "Xác nhận xóa",
  children,
  onConfirm,
  isLoading = false,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="flex w-[min(86vw,420px)] max-w-[min(86vw,420px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[420px]"
      >
        <DialogHeader className="min-h-[61px] flex-row items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
          <DialogTitle className="text-lg font-semibold leading-7 text-slate-950">
            {title}
          </DialogTitle>
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            >
              <X className="size-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="min-h-0 flex-1 p-6 text-sm leading-6 text-slate-600 select-text">
          {children}
        </div>
        <DialogFooter className="m-0 flex flex-row items-center justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-center text-center sm:w-auto"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            className="w-full justify-center bg-slate-900 text-center text-white hover:bg-slate-800 sm:w-auto"
            disabled={isLoading}
            onClick={onConfirm}
          >
            {isLoading ? <SpokeSpinner /> : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteConfirmDialog;
