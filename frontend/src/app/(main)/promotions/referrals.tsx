"use client";

import { useState } from "react";
import {
  Check,
  ChevronRight,
  Copy,
  Gift,
  Heart,
  Share2,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GradientText } from "@/src/components/ui/gradient-text";

const referralTiers = [
  {
    level: 1,
    title: "Người giới thiệu mới",
    referralsNeeded: 0,
    reward: 30000,
    description: "Mỗi khách được giới thiệu thành công",
    icon: Gift,
    benefits: ["Voucher 30.000đ", "Không giới hạn số lượng"],
  },
  {
    level: 2,
    title: "Người bạn đồng hành",
    referralsNeeded: 5,
    reward: 100000,
    description: "Khi có từ 5 người giới thiệu thành công",
    icon: Heart,
    benefits: ["Voucher 100.000đ", "Tặng thêm 50.000đ", "Ưu tiên xử lý đơn"],
  },
];

export default function Referrals() {
  const referralLink = "https://begaushop.vn/ref/MINE123";
  const currentReferrals = 7;
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: "BegauShop - Tiệm giặt là cao cấp",
        text: "Sử dụng dịch vụ giặt là chất lượng cao tại BegauShop.",
        url: referralLink,
      });
    } else {
      copyLink();
    }
  };

  return (
    <section
      id="referrals"
      className="flex min-h-screen items-center px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center sm:mb-16">
          <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            <GradientText>Giới thiệu bạn bè</GradientText>
          </h2>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Chia sẻ BegauShop với bạn bè, cả hai cùng nhận ưu đãi hấp dẫn.
          </p>
        </div>

        <Card className="mb-5 border-blue-100 bg-card shadow-sm">
          <CardHeader className="gap-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="size-5 text-blue-600" />
                  Link giới thiệu của bạn
                </CardTitle>
                <CardDescription className="mt-1">
                  Chia sẻ link này để ghi nhận lượt giới thiệu thành công.
                </CardDescription>
              </div>
              <Badge className="w-fit rounded-full bg-blue-600 text-white">
                {currentReferrals} lượt giới thiệu
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-3 rounded-lg border border-dashed bg-muted/30 p-3 sm:flex-row sm:items-center">
              <code className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">
                {referralLink}
              </code>
              <div className="flex gap-2">
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  onClick={copyLink}
                >
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? "Đã copy" : "Copy"}
                </Button>
                <Button
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                  onClick={shareLink}
                >
                  <Share2 className="size-4" />
                  Chia sẻ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-blue-100 bg-card shadow-sm">
          <CardHeader className="gap-2 border-b bg-card">
            <CardTitle className="text-lg">Cấp bậc phần thưởng</CardTitle>
            <CardDescription>
              Mốc thưởng được tự động mở khóa theo số lượt giới thiệu.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-0">
            <Table className="min-w-[760px]">
              <TableHeader className="[&_tr]:border-border/60">
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableHead className="h-11 pl-4 text-muted-foreground md:pl-8">
                    Cấp bậc
                  </TableHead>
                  <TableHead className="h-11 text-center text-muted-foreground">
                    Điều kiện
                  </TableHead>
                  <TableHead className="h-11 text-right text-muted-foreground">
                    Phần thưởng
                  </TableHead>
                  <TableHead className="hidden h-11 text-muted-foreground md:table-cell">
                    Quyền lợi
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="[&_tr]:border-border/60">
                {referralTiers.map((tier) => {
                  const Icon = tier.icon;
                  const isUnlocked = currentReferrals >= tier.referralsNeeded;

                  return (
                    <TableRow
                      key={tier.level}
                      className="bg-card transition-colors hover:bg-muted/20"
                    >
                      <TableCell className="py-3 pl-4 md:pl-8">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-200">
                            <Icon className="size-5" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-foreground">
                                {tier.title}
                              </span>
                              {isUnlocked && (
                                <Badge className="rounded-full bg-blue-600 text-white">
                                  Đã đạt
                                </Badge>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {tier.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 text-center">
                        <Badge variant="outline" className="rounded-full">
                          {tier.referralsNeeded} lượt
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3 text-right font-semibold text-blue-600">
                        {tier.reward.toLocaleString()}đ
                      </TableCell>

                      <TableCell className="hidden py-3 md:table-cell">
                        <div className="flex flex-wrap gap-2">
                          {tier.benefits.map((benefit) => (
                            <span
                              key={benefit}
                              className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-1 text-xs text-muted-foreground"
                            >
                              <Check className="size-3 text-blue-600" />
                              {benefit}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>

          <CardFooter className="justify-center border-t bg-muted/30 text-center text-xs text-muted-foreground">
            <ChevronRight className="mr-1.5 size-3.5 text-blue-600" />
            Phần thưởng được cộng sau khi đơn đầu tiên của người được giới thiệu
            hoàn tất.
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
