"use client";

import { useRouter } from "next/navigation";
import { emitAccountProfileUpdated } from "@/src/lib/account-profile";

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
      <DialogContent className="w-[min(86vw,420px)] max-w-[min(86vw,420px)] gap-0 overflow-hidden p-0 sm:max-w-[420px]" showCloseButton={false}>
        <DialogHeader className="gap-2 border-b border-slate-200 px-6 py-4">
          <DialogTitle className="text-lg font-semibold leading-7 text-slate-950">
            Xác nhận đăng xuất?
          </DialogTitle>
          <DialogDescription className="text-sm leading-5 text-slate-500">
            Bạn sẽ rời khỏi phiên làm việc hiện tại. Bạn có thể đăng nhập lại bất cứ lúc nào.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="m-0 flex-row justify-end gap-2 bg-white px-6 py-4">
          <DialogClose asChild>
            <Button variant="outline" className="h-8 rounded-lg bg-white px-3 text-sm shadow-none sm:w-auto">
              Hủy
            </Button>
          </DialogClose>
          <Button
            className="h-8 rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white shadow-none hover:bg-slate-800 sm:w-auto"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("refreshToken");
              localStorage.removeItem("role");
              localStorage.removeItem("username");
              localStorage.removeItem("user_id");
              localStorage.removeItem("accountName");
              localStorage.removeItem("accountEmail");
              localStorage.removeItem("accountAddress");
              localStorage.removeItem("accountImageUrl");
              emitAccountProfileUpdated();
              router.push("/login");
            }}
          >
            Tiếp tục
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
