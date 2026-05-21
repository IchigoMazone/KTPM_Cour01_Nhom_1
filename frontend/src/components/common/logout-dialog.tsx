"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type LogoutDialogProps = {
  accountName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function LogoutDialog({
  open,
  onOpenChange,
}: LogoutDialogProps) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[384px] gap-0 rounded-xl border border-black/10 bg-white p-0 shadow-[0_18px_60px_rgba(0,0,0,0.18)]" showCloseButton={false}>
        <DialogHeader className="gap-3 px-5 pb-4 pt-5">
          <DialogTitle className="text-base font-semibold leading-6">
            Xác nhận đăng xuất?
          </DialogTitle>
          <DialogDescription className="text-sm leading-5 text-[#6b6b6b]">
            Bạn sẽ rời khỏi phiên làm việc hiện tại. Bạn có thể đăng nhập lại bất cứ lúc nào.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="m-0 flex-row justify-end gap-2 rounded-b-xl border-t border-black/[0.06] bg-[#fafafa] px-4 py-4">
          <DialogClose asChild>
            <Button variant="outline" className="h-8 rounded-lg border-black/10 bg-white px-3 text-sm text-[#1f1f1f] shadow-sm hover:bg-[#f5f5f5] sm:w-auto">
              Hủy
            </Button>
          </DialogClose>
          <Button
            className="h-8 rounded-lg bg-[#1f1f1f] px-3 text-sm text-white shadow-sm hover:bg-black sm:w-auto"
            onClick={() => router.push("/logout")}
          >
            Tiếp tục
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
