"use client";

import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Circle, Package, Sparkles, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GradientText } from "@/src/components/ui/gradient-text";

type Status = {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
  completed: boolean;
  current?: boolean;
};

const statuses: Status[] = [
  {
    id: "booked",
    icon: Package,
    title: "Đã đặt lịch",
    description: "Đơn hàng của bạn đã được xác nhận",
    time: "Hôm nay, 09:30",
    completed: true,
  },
  {
    id: "picked_up",
    icon: Truck,
    title: "Đã lấy đồ",
    description: "Nhân viên đã nhận đồ và vận chuyển về tiệm",
    time: "Hôm nay, 10:15",
    completed: true,
  },
  {
    id: "washing",
    icon: Sparkles,
    title: "Đang giặt",
    description: "Đồ đang được xử lý theo quy trình chuẩn",
    time: "Đang diễn ra",
    completed: true,
    current: true,
  },
  {
    id: "done",
    icon: CheckCircle2,
    title: "Hoàn thành",
    description: "Đồ đã sẵn sàng để giao hoặc nhận",
    time: "Dự kiến 18:00",
    completed: false,
  },
  {
    id: "delivering",
    icon: Truck,
    title: "Đang giao",
    description: "Nhân viên đang trên đường giao đến bạn",
    time: "Sắp tới",
    completed: false,
  },
  {
    id: "completed",
    icon: CheckCircle2,
    title: "Đã nhận",
    description: "Cảm ơn bạn đã sử dụng dịch vụ",
    time: "Hoàn tất",
    completed: false,
  },
];

export default function Tracking() {
  return (
    <section
      id="tracking"
      className="flex min-h-screen items-center px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-4xl">
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center sm:mb-16">
          <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            <GradientText>Theo dõi đơn hàng</GradientText>
          </h2>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Cập nhật trạng thái đơn hàng realtime, biết chính xác đồ của bạn
            đang ở đâu.
          </p>
        </div>

        <Card className="border-blue-100 bg-card shadow-sm">
          <CardHeader className="gap-2 border-b">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-lg">Mã đơn: #GL-2026-0512</CardTitle>
                <CardDescription className="mt-1">
                  Giặt hấp | 3.5kg | Ngày nhận: 09/05/2026
                </CardDescription>
              </div>
              <Badge className="w-fit rounded-full bg-blue-600 text-white">
                Đang giặt
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="py-6">
            <div className="relative">
              <div className="absolute bottom-0 left-5 top-0 w-px bg-blue-100" />

              <div className="space-y-6">
                {statuses.map((status) => {
                  const Icon = status.icon;

                  return (
                    <div key={status.id} className="relative flex gap-4">
                      <div
                        className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border ${
                          status.completed
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-blue-100 bg-background text-muted-foreground"
                        }`}
                      >
                        {status.completed ? (
                          <Icon className="size-5" />
                        ) : (
                          <Circle className="size-5" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 pt-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-foreground">
                              {status.title}
                            </h4>
                            {status.current && (
                              <Badge
                                variant="secondary"
                                className="rounded-full bg-blue-50 text-blue-700"
                              >
                                Hiện tại
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {status.time}
                          </span>
                        </div>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {status.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
