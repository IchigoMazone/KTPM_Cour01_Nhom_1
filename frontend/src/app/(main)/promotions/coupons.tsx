"use client";

import { useState } from "react";
import { Check, Clock, Copy, Gift, Tag, Ticket } from "lucide-react";
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

const coupons = [
  {
    code: "GIATLA20",
    discount: "20%",
    minOrder: 100000,
    title: "Giảm 20% cho đơn từ 100k",
    description: "Áp dụng cho dịch vụ giặt thường và giặt khô",
    validUntil: "31/05/2026",
    remaining: 156,
  },
  {
    code: "SALE50K",
    discount: "50.000đ",
    minOrder: 0,
    title: "Giảm 50.000đ toàn đơn",
    description: "Không giới hạn đơn hàng tối thiểu",
    validUntil: "15/06/2026",
    remaining: 89,
  },
  {
    code: "FREESHIP",
    discount: "Miễn phí",
    minOrder: 200000,
    title: "Miễn phí giao nhận",
    description: "Áp dụng cho đơn từ 200.000đ trong phạm vi 10km",
    validUntil: "30/06/2026",
    remaining: 234,
  },
  {
    code: "VIP30",
    discount: "30%",
    minOrder: 300000,
    title: "VIP - Giảm 30% đơn lớn",
    description: "Chỉ dành cho khách hàng thân thiết, đơn từ 300k",
    validUntil: "31/12/2026",
    remaining: 45,
    isVip: true,
  },
];

export default function Coupons() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <section
      id="coupons"
      className="flex min-h-screen items-center px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center sm:mb-16">
          <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            <GradientText>Mã giảm giá</GradientText>
          </h2>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Săn mã giảm giá hấp dẫn, tiết kiệm đến 30% cho mỗi đơn hàng.
          </p>
        </div>

        <Card className="overflow-hidden border-blue-100 bg-card shadow-sm">
          <CardHeader className="gap-2 border-b bg-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Ticket className="size-5 text-blue-600" />
                  Danh sách mã ưu đãi
                </CardTitle>
                <CardDescription className="mt-1">
                  Sao chép mã phù hợp và áp dụng khi tạo đơn giặt.
                </CardDescription>
              </div>

              <Badge
                variant="secondary"
                className="w-fit rounded-full bg-blue-50 text-blue-700"
              >
                {coupons.length} mã khả dụng
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="px-0">
            <Table className="min-w-[900px]">
              <TableHeader className="[&_tr]:border-border/60">
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableHead className="h-11 w-[280px] pl-4 text-muted-foreground md:pl-8">
                    Mã giảm giá
                  </TableHead>
                  <TableHead className="h-11 text-center text-muted-foreground">
                    Ưu đãi
                  </TableHead>
                  <TableHead className="h-11 text-center text-muted-foreground">
                    Điều kiện
                  </TableHead>
                  <TableHead className="h-11 text-center text-muted-foreground">
                    Hạn dùng
                  </TableHead>
                  <TableHead className="h-11 pr-4 text-right text-muted-foreground md:pr-8">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="[&_tr]:border-border/60">
                {coupons.map((coupon) => (
                  <TableRow
                    key={coupon.code}
                    className="bg-card transition-colors hover:bg-muted/20"
                  >
                    <TableCell className="py-3 pl-4 md:pl-8">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-200">
                          <Tag className="size-5" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <code className="font-mono text-sm font-bold text-foreground">
                              {coupon.code}
                            </code>
                            {coupon.isVip && (
                              <Badge className="rounded-full bg-blue-600 text-white">
                                <Gift className="size-3" />
                                VIP
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {coupon.title}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground md:hidden">
                            {coupon.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3 text-center">
                      <Badge className="rounded-full bg-blue-50 text-blue-700">
                        {coupon.discount}
                      </Badge>
                      <p className="mt-1 hidden text-xs text-muted-foreground md:block">
                        {coupon.description}
                      </p>
                    </TableCell>

                    <TableCell className="py-3 text-center text-sm text-muted-foreground">
                      {coupon.minOrder > 0
                        ? `Từ ${coupon.minOrder.toLocaleString()}đ`
                        : "Không tối thiểu"}
                    </TableCell>

                    <TableCell className="py-3 text-center">
                      <Badge variant="outline" className="rounded-full">
                        <Clock className="size-3" />
                        {coupon.validUntil}
                      </Badge>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Còn {coupon.remaining} mã
                      </p>
                    </TableCell>

                    <TableCell className="py-3 pr-4 text-right md:pr-8">
                      <Button
                        size="sm"
                        className={
                          copiedCode === coupon.code
                            ? "bg-blue-700 text-white hover:bg-blue-700"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }
                        onClick={() => copyCode(coupon.code)}
                      >
                        {copiedCode === coupon.code ? (
                          <>
                            <Check className="size-4" />
                            Đã copy
                          </>
                        ) : (
                          <>
                            <Copy className="size-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>

          <CardFooter className="justify-center border-t bg-muted/30 text-center text-xs text-muted-foreground">
            <Ticket className="mr-1.5 size-3.5 text-blue-600" />
            Mỗi mã chỉ sử dụng được 1 lần cho mỗi tài khoản. Không áp dụng đồng
            thời với các chương trình khuyến mãi khác.
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
