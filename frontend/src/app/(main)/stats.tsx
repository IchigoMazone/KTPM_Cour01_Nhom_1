"use client";

import type { LucideIcon } from "lucide-react";
import { Award, Clock, Star, ThumbsUp, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GradientText } from "@/src/components/ui/gradient-text";

type Stat = {
  icon: LucideIcon;
  value: string;
  label: string;
  description: string;
};

const stats: Stat[] = [
  {
    icon: Users,
    value: "15,000+",
    label: "Khách hàng tin tưởng",
    description: "Hơn 15 nghìn khách hàng đã sử dụng và đồng hành cùng BegauShop.",
  },
  {
    icon: Award,
    value: "10+",
    label: "Năm kinh nghiệm",
    description: "Một thập kỷ chinh phục chất lượng dịch vụ giặt là chuyên nghiệp.",
  },
  {
    icon: ThumbsUp,
    value: "98%",
    label: "Tỷ lệ hài lòng",
    description: "Minh chứng cho chất lượng dịch vụ vượt kỳ vọng.",
  },
  {
    icon: Clock,
    value: "24h",
    label: "Giao nhanh",
    description: "Thời gian giặt ủi nhanh chóng, hỗ trợ lấy trong ngày.",
  },
];

export default function Stats() {
  return (
    <section
      id="stats"
      className="flex min-h-screen items-center px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center sm:mb-16">
          <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            <GradientText>Những con số nói lên tất cả</GradientText>
          </h2>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Mỗi con số là minh chứng cho sự tin tưởng và yêu mến của khách
            hàng.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Card
                key={stat.label}
                className="border-blue-100 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
              >
                <CardHeader className="gap-4 pb-2">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-200">
                    <Icon className="size-6" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600">
                      {stat.value}
                    </div>
                    <CardTitle className="mt-2 text-lg">{stat.label}</CardTitle>
                  </div>
                </CardHeader>

                <CardContent>
                  <CardDescription className="leading-6">
                    {stat.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {[
            { icon: Star, label: "Được bình chọn 5 sao" },
            { icon: TrendingUp, label: "Phát triển liên tục" },
            { icon: ThumbsUp, label: "Dịch vụ ổn định" },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <Badge
                key={item.label}
                variant="secondary"
                className="rounded-full bg-blue-50 px-4 py-2 text-blue-700"
              >
                <Icon className="size-4" />
                {item.label}
              </Badge>
            );
          })}
        </div>
      </div>
    </section>
  );
}
