"use client";

import type { LucideIcon } from "lucide-react";
import { Briefcase, Check, Droplets, Shirt, Wind } from "lucide-react";
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
const catalogData = {
  title: "Danh mục dịch vụ",
  subtitle:
    "Đa dạng các loại hình giặt là chuyên nghiệp, phù hợp với từng chất liệu và nhu cầu sử dụng.",

  services: [
    {
      icon: Shirt,
      label: "Hằng ngày",
      title: "Giặt thường",
      desc: "Phù hợp quần áo mặc hằng ngày, xử lý sạch bụi bẩn và mùi khó chịu.",
      price: "Nhanh chóng - Tiết kiệm",
      points: [
        "Phân loại theo màu sắc",
        "Giặt sạch mùi và bụi bẩn",
        "Gấp gọn trước khi bàn giao",
      ],
    },
    {
      icon: Wind,
      label: "Cao cấp",
      title: "Giặt khô",
      desc: "Dành cho vest, váy cao cấp và chất liệu cần bảo quản đặc biệt.",
      price: "An toàn - Cao cấp",
      points: [
        "Hạn chế biến dạng phom",
        "Bảo vệ chất liệu nhạy cảm",
        "Xử lý riêng từng sản phẩm",
      ],
    },
    {
      icon: Droplets,
      label: "Khử mùi",
      title: "Giặt hấp",
      desc: "Khử mùi, làm mới trang phục bằng công nghệ hơi nước hiện đại.",
      price: "Sạch khuẩn - Thơm lâu",
      points: [
        "Làm mới bằng hơi nước",
        "Giảm nhăn trên bề mặt vải",
        "Giữ hương thơm dịu nhẹ",
      ],
    },
    {
      icon: Briefcase,
      label: "Chuyên sâu",
      title: "Đồ da",
      desc: "Làm sạch và dưỡng bề mặt cho áo da, túi xách, giày da.",
      price: "Chuyên sâu - Tỉ mỉ",
      points: [
        "Làm sạch bề mặt nhẹ nhàng",
        "Dưỡng mềm sau xử lý",
        "Bảo quản phom và màu da",
      ],
    },
  ] satisfies {
    icon: LucideIcon;
    label: string;
    title: string;
    desc: string;
    price: string;
    points: string[];
  }[],
};

export default function Catalog() {
  return (
    <section
      id="catalog"
      className="flex min-h-screen items-center px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center sm:mb-16">
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            <GradientText>{catalogData.title}</GradientText>
          </h1>

          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            {catalogData.subtitle}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {catalogData.services.map((item, index) => {
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
                  {item.price}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
