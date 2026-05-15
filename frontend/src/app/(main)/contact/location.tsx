"use client";

import { Clock, MapPin, Navigation, Phone, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GradientText } from "@/src/components/ui/gradient-text";

const locationCards = [
  {
    icon: MapPin,
    title: "Cửa hàng chính",
    desc: "123 Đường Nguyễn Trãi, Quận Thanh Xuân, Hà Nội",
    action: "Chỉ đường",
    href: "https://maps.google.com/?q=123+Nguyen+Trai+Thanh+Xuan+Hanoi",
    external: true,
  },
  {
    icon: Phone,
    title: "Hotline 24/7",
    desc: "0901 234 567 - Hỗ trợ đặt lịch & tư vấn dịch vụ",
    action: "Gọi ngay",
    href: "tel:0901234567",
  },
  {
    icon: Truck,
    title: "Dịch vụ giao nhận",
    desc: "Miễn phí giao nhận trong bán kính 5km",
  },
  {
    icon: Clock,
    title: "Giờ hoạt động",
    desc: "Thứ 2 - Thứ 6: 7:00 - 21:00 | Thứ 7 - CN: 8:00 - 20:00",
  },
];

export default function Location() {
  return (
    <section
      id="location"
      className="flex min-h-screen items-center px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center sm:mb-16">
          <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            <GradientText>Địa chỉ cửa hàng</GradientText>
          </h2>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Tìm đường đến BegauShop dễ dàng và chủ động chọn hình thức liên hệ
            phù hợp.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="order-2 min-h-[420px] overflow-hidden border-blue-100 bg-card p-0 shadow-sm lg:order-1 lg:h-full">
            <div className="h-[420px] w-full lg:h-full lg:min-h-[560px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.0969462837!2d105.81761!3d21.02889!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDAxJzQ3LjQiTiAxMDXCsDQ5JzAyLjUiRQ!5e0!3m2!1svi!2s!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="BegauShop Location"
                className="block h-full w-full"
              />
            </div>
          </Card>

          <div className="order-1 space-y-4 lg:order-2">
            {locationCards.map((item) => {
              const Icon = item.icon;

              return (
                <Card
                  key={item.title}
                  className="border-blue-100 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
                >
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-200">
                      <Icon className="size-6" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription className="mt-1 leading-6">
                        {item.desc}
                      </CardDescription>
                    </div>

                    {item.href && (
                      <Button
                        asChild
                        className="bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <a
                          href={item.href}
                          target={item.external ? "_blank" : undefined}
                          rel={item.external ? "noopener noreferrer" : undefined}
                        >
                          {item.action === "Chỉ đường" && (
                            <Navigation className="size-4" />
                          )}
                          {item.action}
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            <Card className="border-blue-100 bg-blue-50/60">
              <CardHeader className="gap-2">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-base text-blue-900">
                    Giao nhận khu vực gần
                  </CardTitle>
                  <Badge className="rounded-full bg-blue-600 text-white">
                    Free 5km
                  </Badge>
                </div>
                <CardDescription className="text-blue-700">
                  Đặt lịch trước để đội giao nhận sắp xếp khung giờ phù hợp.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
