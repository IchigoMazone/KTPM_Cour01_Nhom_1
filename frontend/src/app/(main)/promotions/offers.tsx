"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  Check,
  ChevronDown,
  Clock,
  Gift,
  Percent,
  Sparkles,
  Star,
  TrendingDown,
  Zap,
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
import { GradientText } from "@/src/components/ui/gradient-text";

type Offer = {
  id: number;
  title: string;
  description: string;
  value: string;
  badge: string;
  deadline: string;
  features: string[];
  icon: LucideIcon;
  highlight?: boolean;
};

const offers: Offer[] = [
  {
    id: 1,
    title: "Ưu đãi mùa hè",
    description:
      "Dịch vụ giặt hấp cao cấp, phù hợp cho vest, comple và đồ cưới.",
    value: "79.000đ/kg",
    badge: "Giảm 35%",
    deadline: "Có hiệu lực đến 30/06/2026",
    features: ["Máy giặt hấp công nghệ mới", "Bảo hành vải 100%", "Giao hàng miễn phí"],
    icon: Sparkles,
    highlight: true,
  },
  {
    id: 2,
    title: "Thứ 3 & Thứ 5",
    description: "Áp dụng cho các dịch vụ ủi thường, ủi cao cấp và đồ cưới.",
    value: "Giảm 25%",
    badge: "Hàng tuần",
    deadline: "Mỗi tuần, vô thời hạn",
    features: ["Chỉ áp dụng thứ 3 và thứ 5", "Không giới hạn số lượng", "Kết hợp được với mã khác"],
    icon: Percent,
  },
  {
    id: 3,
    title: "Khách hàng mới",
    description: "Dành riêng cho khách hàng lần đầu sử dụng BegauShop.",
    value: "Giảm 50%",
    badge: "Đơn đầu",
    deadline: "Sử dụng trong 30 ngày từ khi đăng ký",
    features: ["Tối đa giảm 100.000đ", "Áp dụng đơn từ 200.000đ", "Mỗi khách hàng 1 lần"],
    icon: Gift,
  },
  {
    id: 4,
    title: "Đơn hàng lớn",
    description: "Tặng voucher cho đơn kế tiếp khi đơn hiện tại từ 500.000đ.",
    value: "Tặng 50.000đ",
    badge: "Voucher",
    deadline: "Áp dụng quanh năm",
    features: ["Đơn từ 500.000đ", "Voucher hiệu lực 60 ngày", "Không giới hạn số lượng"],
    icon: TrendingDown,
  },
  {
    id: 5,
    title: "Khách hàng thân thiết",
    description: "Tích lũy điểm theo chi tiêu để đổi ưu đãi hoàn tiền.",
    value: "Hoàn tiền 10%",
    badge: "Tích điểm",
    deadline: "Chương trình thường trực",
    features: ["Không giới hạn tích điểm", "Điểm không có hạn sử dụng", "Đổi quà VIP"],
    icon: Award,
  },
  {
    id: 6,
    title: "Giặt nhanh 4H",
    description: "Dịch vụ giặt và giao trong 4 giờ cho đơn dưới 5kg.",
    value: "+30.000đ",
    badge: "Hỏa tốc",
    deadline: "Áp dụng 7h-17h, thứ 2-7",
    features: ["Giao trong 4 giờ", "Chỉ đơn dưới 5kg", "Cộng thêm 30.000đ"],
    icon: Zap,
  },
];

export default function Offers() {
  const [expanded, setExpanded] = useState<number | null>(1);

  return (
    <section
      id="offers"
      className="flex min-h-screen items-center px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center sm:mb-16">
          <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            <GradientText>Ưu đãi đặc biệt</GradientText>
          </h2>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Những ưu đãi hấp dẫn được cập nhật liên tục mỗi tháng.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => {
            const Icon = offer.icon;
            const isExpanded = expanded === offer.id;

            return (
              <Card
                key={offer.id}
                className={`border-blue-100 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg ${
                  offer.highlight ? "ring-1 ring-blue-200" : ""
                }`}
              >
                <CardHeader className="gap-4 pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-200">
                      <Icon className="size-6" />
                    </div>
                    <Badge
                      className={
                        offer.highlight
                          ? "rounded-full bg-blue-600 text-white"
                          : "rounded-full bg-blue-50 text-blue-700"
                      }
                      variant={offer.highlight ? "default" : "secondary"}
                    >
                      {offer.highlight && <Star className="size-3" />}
                      {offer.badge}
                    </Badge>
                  </div>

                  <div>
                    <CardTitle className="text-lg">{offer.title}</CardTitle>
                    <CardDescription className="mt-2 leading-6">
                      {offer.description}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {offer.value}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="size-4" />
                      {offer.deadline}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="space-y-3">
                      {offer.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-2 text-sm">
                          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                            <Check className="size-3.5" />
                          </span>
                          <span className="leading-5 text-foreground/80">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="border-t bg-muted/30">
                  <Button
                    variant="ghost"
                    className="h-8 w-full text-blue-700 hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => setExpanded(isExpanded ? null : offer.id)}
                  >
                    {isExpanded ? "Ẩn bớt" : "Xem chi tiết"}
                    <ChevronDown
                      className={`size-4 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
