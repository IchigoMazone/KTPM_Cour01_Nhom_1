"use client";

import type { LucideIcon } from "lucide-react";
import { Briefcase, Check, Clock, Droplets, Shirt, Wind } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GradientText } from "@/src/components/ui/gradient-text";

/* DATA riêng trong cùng file */
const turnaroundData = {
  title: "Thời gian hoàn thành",
  subtitle:
    "Cam kết xử lý nhanh chóng và đúng hẹn cho từng loại dịch vụ, giúp bạn tiết kiệm thời gian tối đa.",

  items: [
    {
      icon: Shirt,
      label: "Nhanh",
      service: "Giặt thường",
      time: "6 - 12 giờ",
      desc: "Xử lý nhanh cho quần áo mặc hằng ngày.",
      points: [
        "Nhận và phân loại trong ngày",
        "Phù hợp đơn số lượng vừa",
        "Bàn giao sau khi kiểm tra",
      ],
    },
    {
      icon: Wind,
      label: "Cẩn trọng",
      service: "Giặt khô",
      time: "24 giờ",
      desc: "Dành cho vest, váy và đồ cao cấp.",
      points: [
        "Kiểm tra chất liệu trước xử lý",
        "Giữ phom trang phục",
        "Là hơi sau khi hoàn tất",
      ],
    },
    {
      icon: Droplets,
      label: "Làm mới",
      service: "Giặt hấp",
      time: "12 - 24 giờ",
      desc: "Khử mùi, làm mới và giữ phom trang phục.",
      points: [
        "Xử lý bằng hơi nước",
        "Giảm mùi trên bề mặt vải",
        "Phù hợp đồ cần làm mới nhanh",
      ],
    },
    {
      icon: Briefcase,
      label: "Chuyên sâu",
      service: "Đồ da",
      time: "2 - 3 ngày",
      desc: "Làm sạch, dưỡng và phục hồi bề mặt da.",
      points: [
        "Vệ sinh từng vùng bề mặt",
        "Dưỡng mềm sau xử lý",
        "Cần thêm thời gian để ổn định da",
      ],
    },
  ] satisfies {
    icon: LucideIcon;
    label: string;
    service: string;
    time: string;
    desc: string;
    points: string[];
  }[],
};

export default function Turnaround() {
  return (
    <section
      id="turnaround"
      className="flex min-h-screen items-center px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center sm:mb-16">
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            <GradientText>{turnaroundData.title}</GradientText>
          </h1>

          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            {turnaroundData.subtitle}
          </p>
        </div>

        <Card className="overflow-hidden border-blue-100 bg-card shadow-sm">
          <CardHeader className="gap-2 border-b bg-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="size-5 text-blue-600" />
                  Lịch xử lý theo dịch vụ
                </CardTitle>
                <CardDescription className="mt-1">
                  Thời gian được tính từ lúc đơn hàng được tiếp nhận và phân
                  loại.
                </CardDescription>
              </div>

              <Badge
                variant="secondary"
                className="w-fit rounded-full bg-blue-50 text-blue-700"
              >
                4 nhóm dịch vụ
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="px-0">
            <Table className="min-w-[820px]">
              <TableHeader className="[&_tr]:border-border/60">
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableHead className="h-11 w-[260px] pl-4 text-muted-foreground md:pl-8">
                    Dịch vụ
                  </TableHead>
                  <TableHead className="h-11 text-center text-muted-foreground">
                    Thời gian
                  </TableHead>
                  <TableHead className="hidden h-11 text-muted-foreground lg:table-cell">
                    Quy trình chính
                  </TableHead>
                  <TableHead className="hidden h-11 text-muted-foreground md:table-cell">
                    Ghi chú
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="[&_tr]:border-border/60">
                {turnaroundData.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <TableRow
                      key={item.service}
                      className="bg-card transition-colors hover:bg-muted/20"
                    >
                      <TableCell className="py-3 pl-4 md:pl-8">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-200">
                            <Icon className="size-5" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-foreground">
                                {item.service}
                              </span>
                              <Badge
                                variant="secondary"
                                className="rounded-full bg-blue-50 text-blue-700"
                              >
                                {item.label}
                              </Badge>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground md:hidden">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 text-center">
                        <Badge variant="outline" className="rounded-full">
                          <Clock className="size-3" />
                          {item.time}
                        </Badge>
                      </TableCell>

                      <TableCell className="hidden py-3 lg:table-cell">
                        <div className="flex flex-wrap gap-2">
                          {item.points.slice(0, 2).map((point) => (
                            <span
                              key={point}
                              className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-1 text-xs text-muted-foreground"
                            >
                              <Check className="size-3 text-blue-600" />
                              {point}
                            </span>
                          ))}
                        </div>
                      </TableCell>

                      <TableCell className="hidden py-3 text-sm text-muted-foreground md:table-cell">
                        {item.desc}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>

          <CardFooter className="justify-center border-t bg-muted/30 text-center text-xs text-muted-foreground">
            <Clock className="mr-1.5 size-3.5" />
            Thời gian có thể thay đổi theo số lượng và tình trạng đồ.
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
