"use client";

import type { LucideIcon } from "lucide-react";
import { Award, Clock, Heart, MapPin, Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GradientText } from "@/src/components/ui/gradient-text";

type OverviewStat = {
  icon: LucideIcon;
  value: string;
  label: string;
};

const stats: OverviewStat[] = [
  { icon: Award, value: "10+", label: "Năm kinh nghiệm" },
  { icon: Users, value: "15K+", label: "Khách hàng tin tưởng" },
  { icon: Heart, value: "98%", label: "Tỷ lệ hài lòng" },
  { icon: Clock, value: "24/7", label: "Phục vụ mọi lúc" },
];

export default function Overview() {
  return (
    <section
      id="overview"
      className="flex min-h-screen items-center px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-8">
            <div>
              <Badge
                variant="secondary"
                className="mb-4 rounded-full bg-blue-50 text-blue-700"
              >
                Từ năm 2014
              </Badge>
              <h1 className="mb-5 text-4xl font-bold tracking-tight sm:text-5xl">
                <GradientText>BegauShop</GradientText>
              </h1>
              <div className="space-y-4 text-base leading-7 text-muted-foreground">
                <p>
                  BegauShop mang đến dịch vụ giặt là chuyên nghiệp, tiện lợi và
                  giá cả hợp lý cho người dân Hà Nội.
                </p>
                <p>
                  Với hơn 10 năm hoạt động, chúng tôi chăm sóc từng chiếc áo,
                  từng bộ quần áo cẩn thận như đồ của chính mình.
                </p>
                <p className="font-medium text-foreground">
                  Sứ mệnh của chúng tôi: Đồ của bạn xứng đáng được chăm sóc tốt
                  nhất.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <Card
                    key={stat.label}
                    className="border-blue-100 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
                  >
                    <CardHeader className="gap-3 pb-2">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-200">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {stat.value}
                        </div>
                        <CardTitle className="mt-1 text-sm">
                          {stat.label}
                        </CardTitle>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="size-5 fill-blue-500 text-blue-500"
                  />
                ))}
              </div>
              <span className="font-semibold text-foreground">4.9/5</span>
              <span className="text-sm text-muted-foreground">
                (2,847 đánh giá)
              </span>
            </div>
          </div>

          <Card className="overflow-hidden border-blue-100 bg-card p-0 shadow-sm">
            <CardContent className="space-y-4 p-4">
              <div className="overflow-hidden rounded-lg border">
                <img
                  src="/washer(2).jfif"
                  alt="BegauShop - Cơ sở giặt là"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="overflow-hidden rounded-lg border">
                  <img
                    src="/washer(1).jfif"
                    alt="Máy giặt công nghiệp"
                    className="aspect-square w-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-lg border">
                  <img
                    src="/washer(4).jfif"
                    alt="Đồ giặt sạch bóng"
                    className="aspect-square w-full object-cover"
                  />
                </div>
              </div>
              <CardDescription className="flex items-center gap-2">
                <MapPin className="size-4 text-blue-600" />
                Số 123 Đường Cầu Giấy, Hà Nội
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
