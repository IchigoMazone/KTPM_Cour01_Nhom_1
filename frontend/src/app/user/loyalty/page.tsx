"use client";

import { Copy, Crown, Gift, Percent, Share2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  PageShell,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/src/app/home/_components/dashboard-primitives";

const vouchers = [
  { code: "PANDA20", value: "Giảm 20%", condition: "Đơn từ 150.000đ", expire: "31/05/2026" },
  { code: "FREESHIP", value: "Miễn phí giao", condition: "2 lượt mỗi tháng", expire: "30/06/2026" },
  { code: "HAP50", value: "Giảm 50.000đ", condition: "Giặt hấp", expire: "15/06/2026" },
];

export default function UserLoyaltyPage() {
  return (
    <PageShell
      title="Ưu Đãi & Điểm Thưởng"
      description="Quản lý điểm tích lũy, mã giảm giá và quyền lợi thành viên."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Điểm hiện có" value="1.250" hint="Tương đương 125.000đ" icon={Star} tone="success" />
        <StatCard label="Hạng thành viên" value="Bạc" hint="Còn 250 điểm lên Vàng" icon={Crown} />
        <StatCard label="Voucher khả dụng" value="3" hint="1 mã sắp hết hạn" icon={Gift} tone="warning" />
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

      <SectionCard title="Voucher của bạn" description="Bấm sao chép để dùng khi đặt lịch.">
        <div className="grid gap-3 p-4 md:grid-cols-3">
          {vouchers.map((voucher) => (
            <div key={voucher.code} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-3">
                <Percent className="size-5" />
                <StatusBadge tone="warning">HSD {voucher.expire}</StatusBadge>
              </div>
              <p className="mt-4 text-lg font-semibold">{voucher.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{voucher.condition}</p>
              <Button variant="outline" size="sm" className="mt-4 w-full gap-2">
                <Copy className="size-4" />
                {voucher.code}
              </Button>
            </div>
          ))}
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
