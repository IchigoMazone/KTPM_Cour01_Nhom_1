"use client";

import { useState } from "react";
import { Check, Package, Sparkles } from "lucide-react";
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

const bundles = [
  {
    name: "Gói Cơ Bản",
    description: "Phù hợp đơn nhỏ, nhu cầu giặt sấy hằng ngày.",
    price: 99000,
    originalPrice: 120000,
    services: ["Giặt thường 3kg", "Sấy khô", "Giao trong 48h"],
    popular: false,
  },
  {
    name: "Gói Tiết Kiệm",
    description: "Cân bằng chi phí và tốc độ cho đơn gia đình.",
    price: 189000,
    originalPrice: 250000,
    services: ["Giặt thường 5kg", "Sấy khô", "Ủi cơ bản", "Giao trong 24h"],
    popular: true,
  },
  {
    name: "Gói Premium",
    description: "Dành cho đơn nhiều đồ, cần xử lý kỹ và giao nhanh.",
    price: 349000,
    originalPrice: 450000,
    services: [
      "Giặt 10kg",
      "Sấy cao cấp",
      "Ủi chuyên nghiệp",
      "Giặt hấp 2 món",
      "Giao hỏa tốc 4h",
    ],
    popular: false,
  },
];

export default function Bundles() {
  const [selected, setSelected] = useState<number | null>(1);

  return (
    <section
      id="bundles"
      className="flex min-h-screen items-center px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center sm:mb-16">
          <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            <GradientText>Combo tiết kiệm</GradientText>
          </h2>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Chọn gói dịch vụ phù hợp, tiết kiệm đến 30%.
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-3">
          {bundles.map((bundle, index) => {
            const saving = Math.round(
              (1 - bundle.price / bundle.originalPrice) * 100,
            );
            const isSelected = selected === index;

            return (
              <Card
                key={bundle.name}
                className={`flex h-full border-blue-100 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg ${
                  bundle.popular ? "ring-1 ring-blue-200" : ""
                }`}
              >
                <CardHeader className="gap-4 pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-200">
                      <Package className="size-6" />
                    </div>
                    <Badge
                      className={
                        bundle.popular
                          ? "rounded-full bg-blue-600 text-white"
                          : "rounded-full bg-blue-50 text-blue-700"
                      }
                      variant={bundle.popular ? "default" : "secondary"}
                    >
                      {bundle.popular && <Sparkles className="size-3" />}
                      {bundle.popular ? "Phổ biến nhất" : `Tiết kiệm ${saving}%`}
                    </Badge>
                  </div>

                  <div>
                    <CardTitle className="text-lg">{bundle.name}</CardTitle>
                    <CardDescription className="mt-2 min-h-10 leading-5">
                      {bundle.description}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-5">
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
                      <span className="text-3xl font-bold leading-none text-blue-600">
                        {bundle.price.toLocaleString()}đ
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        {bundle.originalPrice.toLocaleString()}đ
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Đã bao gồm các hạng mục trong gói.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {bundle.services.map((service) => (
                      <div
                        key={service}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                          <Check className="size-3.5" />
                        </span>
                        <span className="leading-5 text-foreground/80">
                          {service}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="mt-auto border-t bg-muted/30">
                  <Button
                    className={
                      isSelected
                        ? "h-10 w-full bg-blue-700 text-white hover:bg-blue-700"
                        : "h-10 w-full bg-blue-600 text-white hover:bg-blue-700"
                    }
                    onClick={() => setSelected(isSelected ? null : index)}
                  >
                    {isSelected ? "Đã chọn" : "Chọn gói này"}
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
