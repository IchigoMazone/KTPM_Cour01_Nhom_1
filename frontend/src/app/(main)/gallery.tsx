"use client";

import { Star } from "lucide-react";
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

const equipment = [
  { name: "Máy giặt nhỏ", count: "2", image: "/img (1).jfif" },
  { name: "Máy giặt lớn", count: "1", image: "/img (4).jpg" },
  { name: "Máy sấy nhỏ", count: "2", image: "/img (2).jfif" },
  { name: "Máy sấy lớn", count: "1", image: "/img (3).jpg" },
];

const feedbacks = [
  {
    name: "Thu Hà",
    avatar: "TH",
    content: "Đồ giặt sạch thơm, giao nhanh!",
    rating: 5,
    description: "Khách hàng thường xuyên",
  },
  {
    name: "Minh Đức",
    avatar: "MD",
    content: "Veston ủi phẳng như tiệm may.",
    rating: 5,
    description: "Khách hàng VIP",
  },
  {
    name: "Hoàng Yến",
    avatar: "HY",
    content: "Đồ bé sạch khuẩn, an toàn.",
    rating: 5,
    description: "Khách hàng mới",
  },
];

export default function Gallery() {
  return (
    <section
      id="gallery"
      className="flex min-h-screen items-center px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center sm:mb-16">
          <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            <GradientText>Thiết bị & đánh giá</GradientText>
          </h2>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Hệ thống máy móc hiện đại, phục vụ hơn 15,000 khách hàng.
          </p>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {equipment.map((item) => (
            <Card
              key={item.name}
              className="overflow-hidden border-blue-100 bg-card p-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
            >
              <div className="overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <CardHeader className="items-center text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {item.count}
                </div>
                <CardTitle className="text-base">{item.name}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {feedbacks.map((item) => (
            <Card
              key={item.name}
              className="border-blue-100 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
            >
              <CardHeader className="gap-3 pb-2">
                <div className="flex items-center gap-1">
                  {[...Array(item.rating)].map((_, idx) => (
                    <Star
                      key={idx}
                      className="size-4 fill-blue-500 text-blue-500"
                    />
                  ))}
                </div>
                <CardDescription className="text-base leading-7 text-foreground/80">
                  &ldquo;{item.content}&rdquo;
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Badge
                  variant="secondary"
                  className="rounded-full bg-blue-50 text-blue-700"
                >
                  {item.description}
                </Badge>
              </CardContent>

              <CardFooter className="border-t bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600 ring-1 ring-blue-200">
                    {item.avatar}
                  </div>
                  <span className="font-semibold text-foreground">
                    {item.name}
                  </span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
