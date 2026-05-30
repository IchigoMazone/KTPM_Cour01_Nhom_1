"use client";

import { useState } from "react";
import { Copy, Crown, Gift, Percent, Share2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  PageShell,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/src/app/home/_components/dashboard-primitives";
import { toast } from "sonner";

const AVAILABLE_VOUCHERS = [
  { code: "PANDA20", value: "Giảm 20%", condition: "Đơn từ 150.000đ", expire: "31/05/2026" },
  { code: "FREESHIP", value: "Miễn phí giao", condition: "2 lượt mỗi tháng", expire: "30/06/2026" },
  { code: "HAP50", value: "Giảm 50.000đ", condition: "Giặt hấp", expire: "15/06/2026" },
  { code: "KHACHMOI", value: "Giảm 30.000đ", condition: "Đơn đầu tiên", expire: "31/07/2026" },
  { code: "CUOITUAN", value: "Giảm 15%", condition: "Giặt sấy T7 & CN", expire: "15/06/2026" },
];

export default function UserLoyaltyPage() {
  const [myVouchers, setMyVouchers] = useState<string[]>(["PANDA20", "FREESHIP"]);
  const [activeTab, setActiveTab] = useState<"mine" | "store">("mine");

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã ${code}`);
  };

  const handleClaim = (code: string) => {
    if (!myVouchers.includes(code)) {
      setMyVouchers((prev) => [...prev, code]);
      toast.success(`Đã nhận voucher ${code} thành công!`);
    }
  };

  const myVouchersList = AVAILABLE_VOUCHERS.filter((v) => myVouchers.includes(v.code));
  const storeVouchersList = AVAILABLE_VOUCHERS.filter((v) => !myVouchers.includes(v.code));

  return (
    <PageShell
      title="Ưu Đãi & Điểm Thưởng"
      description="Quản lý điểm tích lũy, mã giảm giá và quyền lợi thành viên."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Điểm hiện có" value="1.250" hint="Tương đương 125.000đ" icon={Star} tone="success" />
        <StatCard label="Hạng thành viên" value="Bạc" hint="Còn 250 điểm lên Vàng" icon={Crown} />
        <StatCard label="Voucher khả dụng" value={myVouchers.length.toString()} hint="Sẵn sàng áp dụng khi thanh toán" icon={Gift} tone="warning" />
      </div>

      <SectionCard title="Tiến độ lên hạng" description="Tích điểm sau mỗi đơn hoàn tất.">
        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Bạc</span>
            <span className="text-muted-foreground">1.250 / 1.500 điểm</span>
          </div>
          <Progress value={83} />
          <div className="grid gap-3 text-sm md:grid-cols-3">
            <div className="rounded-lg bg-[#f7f7f7] p-3">Tích 1 điểm cho mỗi 1.000đ</div>
            <div className="rounded-lg bg-[#f7f7f7] p-3">Ưu tiên giao trong khung giờ đẹp</div>
            <div className="rounded-lg bg-[#f7f7f7] p-3">Quà sinh nhật hằng năm</div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Voucher của bạn"
        description="Nhận và quản lý các mã ưu đãi giảm giá dịch vụ."
        action={
          <div className="inline-flex h-9 items-center justify-center rounded-lg bg-neutral-100 p-1 text-muted-foreground">
            <button
              onClick={() => setActiveTab("mine")}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                activeTab === "mine"
                  ? "bg-white text-neutral-900 shadow-sm animate-fade-in"
                  : "hover:bg-neutral-200/50 hover:text-neutral-900"
              }`}
            >
              Voucher của tôi ({myVouchersList.length})
            </button>
            <button
              onClick={() => setActiveTab("store")}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                activeTab === "store"
                  ? "bg-white text-neutral-900 shadow-sm animate-fade-in"
                  : "hover:bg-neutral-200/50 hover:text-neutral-900"
              }`}
            >
              Nhận thêm ({storeVouchersList.length})
            </button>
          </div>
        }
      >
        <div className="p-4 sm:p-6">
          {activeTab === "mine" ? (
            myVouchersList.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3">
                {myVouchersList.map((voucher) => (
                  <div key={voucher.code} className="rounded-lg border p-4 bg-white shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <Percent className="size-5 text-neutral-950" />
                        <StatusBadge tone="warning">HSD {voucher.expire}</StatusBadge>
                      </div>
                      <p className="mt-4 text-lg font-semibold text-neutral-900">{voucher.value}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{voucher.condition}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full gap-2 border-dashed border-neutral-300 hover:border-neutral-950 hover:bg-neutral-50"
                      onClick={() => handleCopy(voucher.code)}
                    >
                      <Copy className="size-4" />
                      Sao chép: <span className="font-mono font-bold text-neutral-950">{voucher.code}</span>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg">
                <Gift className="size-8 text-muted-foreground/60 mb-2" />
                <p className="font-medium text-sm text-neutral-900">Bạn chưa sở hữu voucher nào</p>
                <p className="text-xs text-muted-foreground mt-1 mb-4">Hãy sang tab "Nhận thêm voucher" để nhận các mã ưu đãi mới nhất.</p>
                <Button size="sm" onClick={() => setActiveTab("store")} className="bg-neutral-900 hover:bg-neutral-800 text-white">
                  Nhận thêm voucher
                </Button>
              </div>
            )
          ) : storeVouchersList.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {storeVouchersList.map((voucher) => (
                <div key={voucher.code} className="rounded-lg border p-4 bg-white shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <Percent className="size-5 text-neutral-500" />
                      <StatusBadge tone="default">HSD {voucher.expire}</StatusBadge>
                    </div>
                    <p className="mt-4 text-lg font-semibold text-neutral-900">{voucher.value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{voucher.condition}</p>
                  </div>
                  <Button
                    size="sm"
                    className="mt-4 w-full bg-neutral-900 hover:bg-neutral-800 text-white"
                    onClick={() => handleClaim(voucher.code)}
                  >
                    Thu thập
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg">
              <Gift className="size-8 text-emerald-500/60 mb-2" />
              <p className="font-medium text-sm text-neutral-900">Bạn đã thu thập tất cả voucher có sẵn!</p>
              <p className="text-xs text-muted-foreground mt-1">Vui lòng quay lại tab "Voucher của tôi" để sử dụng.</p>
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Giới thiệu bạn bè" description="Nhận điểm khi bạn bè hoàn tất đơn đầu tiên.">
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Mã giới thiệu: PANDA-HUONG</p>
            <p className="text-sm text-muted-foreground">Bạn nhận 100 điểm, bạn bè nhận mã giảm 20%.</p>
          </div>
          <Button className="gap-2 bg-neutral-900 text-white hover:bg-neutral-800">
            <Share2 className="size-4" />
            Chia sẻ
          </Button>
        </div>
      </SectionCard>
    </PageShell>
  );
}
