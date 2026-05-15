"use client";

import type { LucideIcon } from "lucide-react";
import { Award, Check, Heart, Leaf, Shield } from "lucide-react";
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

type Value = {
  icon: LucideIcon;
  title: string;
  description: string;
  label: string;
};

const values: Value[] = [
  {
    icon: Shield,
    title: "An toàn tuyệt đối",
    label: "Bảo vệ vải",
    description:
      "Mỗi loại vải được xử lý riêng theo công thức phù hợp để hạn chế co rút, lem màu và hư hại.",
  },
  {
    icon: Leaf,
    title: "Thân thiện môi trường",
    label: "Quy trình xanh",
    description:
      "Ưu tiên sản phẩm giặt là sinh học, an toàn cho sức khỏe và giảm tác động đến môi trường.",
  },
  {
    icon: Heart,
    title: "Tận tâm phục vụ",
    label: "Luôn hỗ trợ",
    description:
      "Đội ngũ tư vấn lắng nghe từng yêu cầu, hỗ trợ qua điện thoại, Zalo và trực tiếp tại cửa hàng.",
  },
  {
    icon: Award,
    title: "Chất lượng cam kết",
    label: "Đảm bảo đầu ra",
    description:
      "Nếu kết quả chưa đạt kỳ vọng, chúng tôi hỗ trợ xử lý lại theo chính sách chất lượng.",
  },
];

export default function Mission() {
  return (
    <section
      id="mission"
      className="flex min-h-screen items-center px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto mb-12 flex max-w-3xl flex-col items-center text-center sm:mb-16">
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            <GradientText>Đồ của bạn xứng đáng được chăm sóc tốt nhất</GradientText>
          </h1>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Với hơn 10 năm kinh nghiệm, BegauShop là điểm đến tin cậy của hàng
            nghìn gia đình Hà Nội.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => {
            const Icon = value.icon;

            return (
              <Card
                key={value.title}
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
                      {value.label}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>

                <CardContent>
                  <CardDescription className="leading-6">
                    {value.description}
                  </CardDescription>
                </CardContent>

                <CardFooter className="border-t bg-muted/30 text-xs font-medium text-muted-foreground">
                  <Check className="mr-1.5 size-3.5 text-blue-600" />
                  Tiêu chuẩn vận hành BegauShop
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
