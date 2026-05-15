"use client";

import type { LucideIcon } from "lucide-react";
import { Check, CheckCircle2, Package, Sparkles, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GradientText } from "@/src/components/ui/gradient-text";

type Step = {
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
  faq: string;
  faqAnswer: string;
};

const steps: Step[] = [
  {
    icon: Package,
    title: "Đặt lịch",
    description: "Chọn ngày giờ, loại dịch vụ và địa chỉ lấy đồ.",
    time: "2 phút",
    faq: "Tôi có thể đặt lịch vào giờ nào?",
    faqAnswer: "Bạn có thể đặt lịch 24/7, nhân viên xác nhận trong 30 phút.",
  },
  {
    icon: Truck,
    title: "Lấy đồ",
    description: "Nhân viên đến tận nhà hoặc bạn mang đồ đến tiệm.",
    time: "30 phút - 2 giờ",
    faq: "Phí ship có bao gồm trong giá không?",
    faqAnswer: "Miễn phí trong bán kính 5km, ngoài ra tính theo km.",
  },
  {
    icon: Sparkles,
    title: "Giặt & xử lý",
    description: "Đồ được phân loại, giặt theo đúng quy trình từng loại.",
    time: "Theo gói",
    faq: "Đồ của tôi có bị lẫn với đồ người khác không?",
    faqAnswer: "Không, mỗi đơn hàng được đóng túi riêng và theo dõi riêng.",
  },
  {
    icon: CheckCircle2,
    title: "Giao trả",
    description: "Đồ sạch sẽ, gấp gọn được giao tận nơi hoặc nhận tại tiệm.",
    time: "Theo gói",
    faq: "Tôi có thể yêu cầu giao lại đồ không?",
    faqAnswer: "Có, bạn có thể đổi lịch giao qua Zalo hoặc hotline.",
  },
];

export default function Stages() {
  return (
    <section
      id="stages"
      className="flex min-h-screen items-center px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center sm:mb-16">
          <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            <GradientText>Quy trình dịch vụ</GradientText>
          </h2>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Chỉ 4 bước đơn giản để có đồ sạch sẽ, thơm tho mà không cần di
            chuyển.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <Card
                key={step.title}
                className="relative border-blue-100 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
              >
                <div className="absolute left-4 top-4 flex size-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {index + 1}
                </div>

                <CardHeader className="gap-4 pb-2 pt-12">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-200">
                      <Icon className="size-6" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="rounded-full bg-blue-50 text-blue-700"
                    >
                      {step.time}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <CardDescription className="min-h-12 leading-6">
                    {step.description}
                  </CardDescription>

                  <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="text-sm font-semibold text-foreground">
                      {step.faq}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {step.faqAnswer}
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="border-t bg-muted/30 text-xs font-medium text-muted-foreground">
                  <Check className="mr-1.5 size-3.5 text-blue-600" />
                  Theo dõi trạng thái qua mã đơn
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
