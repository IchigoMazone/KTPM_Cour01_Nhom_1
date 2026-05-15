"use client";

import type { LucideIcon } from "lucide-react";
import { Check, CheckCircle2, Droplets, Leaf, ShieldCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GradientText } from "@/src/components/ui/gradient-text";

/* DATA riêng trong cùng file */
const assuranceData = {
  title: "Cam kết chất lượng",
  subtitle:
    "Mỗi sản phẩm được xử lý cẩn thận với tiêu chuẩn an toàn cho vải vóc và thân thiện với môi trường.",

  badges: [
    {
      icon: ShieldCheck,
      label: "Bảo vệ chất liệu",
      title: "An toàn vải vóc",
      desc: "Quy trình giặt phù hợp từng chất liệu, hạn chế co rút và phai màu.",
      points: ["Phân loại trước khi xử lý", "Điều chỉnh nhiệt độ giặt", "Kiểm tra màu sau khi hoàn tất"],
    },
    {
      icon: Leaf,
      label: "Quy trình xanh",
      title: "Thân thiện môi trường",
      desc: "Sử dụng hóa chất đạt chuẩn và tối ưu lượng nước tiêu thụ.",
      points: ["Dung dịch giặt đạt chuẩn", "Tối ưu lượng nước", "Giảm dư lượng hóa chất"],
    },
    {
      icon: Droplets,
      label: "Sạch sâu",
      title: "Sạch khuẩn hiệu quả",
      desc: "Loại bỏ mùi hôi, vi khuẩn và bụi bẩn khó xử lý.",
      points: ["Xử lý vết bẩn riêng", "Khử mùi bằng hơi nước", "Đóng gói sạch sau giặt"],
    },
    {
      icon: CheckCircle2,
      label: "Đúng cam kết",
      title: "Uy tín đúng hẹn",
      desc: "Cam kết giao đúng thời gian và giữ chất lượng ổn định.",
      points: ["Cập nhật trạng thái đơn", "Kiểm đếm khi bàn giao", "Hỗ trợ nếu cần xử lý lại"],
    },
  ] satisfies {
    icon: LucideIcon;
    label: string;
    title: string;
    desc: string;
    points: string[];
  }[],
};

export default function Assurance() {
  return (
    <section
      id="assurance"
      className="flex min-h-screen items-center px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center sm:mb-16">
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            <GradientText>{assuranceData.title}</GradientText>
          </h1>

          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            {assuranceData.subtitle}
          </p>
        </div>

        {/* Badge Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {assuranceData.badges.map((item, index) => {
            const Icon = item.icon;

            return (
              <Card
                key={index}
                className="border-blue-100 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
              >
                <CardHeader className="gap-4 pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-200">
                      <Icon className="size-6" />
                    </div>

                    <Badge
                      variant="secondary"
                      className="rounded-full bg-blue-50 text-blue-700"
                    >
                      {item.label}
                    </Badge>
                  </div>

                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-5">
                  <CardDescription className="min-h-18 leading-6">
                    {item.desc}
                  </CardDescription>

                  <div className="space-y-3">
                    {item.points.map((point) => (
                      <div key={point} className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                          <Check className="size-3.5" />
                        </span>
                        <span className="leading-5 text-foreground/80">
                          {point}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="border-t bg-muted/30 text-xs font-medium text-muted-foreground">
                  Kiểm soát chất lượng trước khi bàn giao
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
