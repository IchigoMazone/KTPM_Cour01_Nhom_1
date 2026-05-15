"use client";

import type { LucideIcon } from "lucide-react";
import { Check, Clock, HelpCircle, Home, MapPin, Store } from "lucide-react";
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

type DeliveryOption = {
  icon: LucideIcon;
  title: string;
  price: string;
  description: string;
  conditions: string[];
  faq: string;
  faqAnswer: string;
  highlight?: boolean;
};

const deliveryOptions: DeliveryOption[] = [
  {
    icon: Home,
    title: "Giao nhận tận nơi",
    price: "Miễn phí",
    description: "Nhân viên đến lấy đồ tại nhà và giao lại khi hoàn thành.",
    conditions: [
      "Áp dụng trong phạm vi 5km từ tiệm",
      "Phí 5.000đ/km cho khoảng cách > 5km",
      "Đặt lịch trước tối thiểu 2 giờ",
    ],
    faq: "Tôi có thể hủy đơn sau khi đã đặt lịch không?",
    faqAnswer: "Có, hủy miễn phí trước 1 giờ so với giờ hẹn.",
    highlight: true,
  },
  {
    icon: Store,
    title: "Tự mang đến tiệm",
    price: "Không tính phí",
    description: "Bạn mang đồ trực tiếp đến tiệm theo giờ hoạt động.",
    conditions: [
      "Tiết kiệm chi phí giao hàng",
      "Kiểm tra đồ trực tiếp tại tiệm",
      "Nhận hàng nhanh hơn 1-2 giờ",
    ],
    faq: "Tôi có thể mang đồ đến tiệm ngoài giờ không?",
    faqAnswer: "Không, vui lòng đến trong giờ mở cửa 7:00-21:00.",
  },
];

export default function Pickup() {
  return (
    <section
      id="pickup"
      className="flex min-h-screen items-center px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center sm:mb-16">
          <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            <GradientText>Tùy chọn giao nhận</GradientText>
          </h2>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Linh hoạt với 2 hình thức: giao tận nơi hoặc tự mang đến tiệm.
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2">
          {deliveryOptions.map((option) => {
            const Icon = option.icon;

            return (
              <Card
                key={option.title}
                className={`flex h-full border-blue-100 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg ${
                  option.highlight ? "ring-1 ring-blue-200" : ""
                }`}
              >
                <CardHeader className="gap-4 pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-200">
                      <Icon className="size-6" />
                    </div>
                    <Badge
                      className={
                        option.highlight
                          ? "rounded-full bg-blue-600 text-white"
                          : "rounded-full bg-blue-50 text-blue-700"
                      }
                      variant={option.highlight ? "default" : "secondary"}
                    >
                      {option.price}
                    </Badge>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                    <CardDescription className="mt-2 leading-6">
                      {option.description}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <MapPin className="size-4 text-blue-600" />
                      Điều kiện áp dụng
                    </div>
                    {option.conditions.map((condition) => (
                      <div key={condition} className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                          <Check className="size-3.5" />
                        </span>
                        <span className="leading-5 text-foreground/80">
                          {condition}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto rounded-lg border bg-muted/30 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <HelpCircle className="size-4 text-blue-600" />
                      {option.faq}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {option.faqAnswer}
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="border-t bg-muted/30">
                  <Button className="h-10 w-full bg-blue-600 text-white hover:bg-blue-700">
                    Chọn hình thức này
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <Card className="mt-5 border-blue-100 bg-blue-50/60">
          <CardFooter className="justify-center border-0 bg-transparent text-center text-sm text-blue-700">
            <Clock className="mr-1.5 size-4" />
            Nhân viên giao nhận hoạt động từ 7:00 - 20:00 các ngày trong tuần.
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
