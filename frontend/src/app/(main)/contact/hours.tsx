"use client";

import type { LucideIcon } from "lucide-react";
import { Calendar, Clock, Gift, Phone } from "lucide-react";
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

type HourItem = {
  icon: LucideIcon;
  label: string;
  detail: string;
  subtext: string;
  status: string;
  faq: string;
  faqAnswer: string;
};

const hours: HourItem[] = [
  {
    icon: Clock,
    label: "Thứ 2 - Thứ 6",
    detail: "7:00 - 21:00",
    subtext: "Ca sáng: 7:00 - 12:00 | Ca chiều: 12:00 - 21:00",
    status: "Hoạt động",
    faq: "Tôi có thể đặt lịch trước không?",
    faqAnswer: "Có, bạn có thể đặt lịch qua hotline hoặc Zalo.",
  },
  {
    icon: Calendar,
    label: "Thứ 7 - Chủ nhật",
    detail: "8:00 - 20:00",
    subtext: "Ca sáng: 8:00 - 12:00 | Ca chiều: 12:00 - 20:00",
    status: "Hoạt động",
    faq: "Cuối tuần có phụ thu thêm không?",
    faqAnswer: "Không, giá cả không thay đổi vào cuối tuần.",
  },
  {
    icon: Gift,
    label: "Ngày lễ",
    detail: "9:00 - 17:00",
    subtext: "Giờ hoạt động có thể thay đổi vào ngày lễ",
    status: "Có thay đổi",
    faq: "Ngày lễ có mở cửa không?",
    faqAnswer: "Có nhưng giờ hoạt động rút ngắn. Vui lòng gọi xác nhận.",
  },
  {
    icon: Phone,
    label: "Hỗ trợ khẩn cấp",
    detail: "0901 234 567",
    subtext: "Luôn sẵn sàng 24/7 ngoài giờ hành chính",
    status: "Luôn sẵn sàng",
    faq: "Khi nào nên gọi hotline?",
    faqAnswer: "Gọi khi cần hỗ trợ ngoài giờ hoặc cần giặt gấp.",
  },
];

export default function Hours() {
  return (
    <section
      id="hours"
      className="flex min-h-screen items-center px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center sm:mb-16">
          <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            <GradientText>Giờ hoạt động</GradientText>
          </h2>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            BegauShop phục vụ suốt tuần với khung giờ linh hoạt cho từng nhu
            cầu giao nhận.
          </p>
        </div>

        <Card className="overflow-hidden border-blue-100 bg-card shadow-sm">
          <CardHeader className="gap-2 border-b bg-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="size-5 text-blue-600" />
                  Lịch làm việc
                </CardTitle>
                <CardDescription className="mt-1">
                  Theo dõi khung giờ mở cửa và kênh hỗ trợ ngoài giờ.
                </CardDescription>
              </div>

              <Badge
                variant="secondary"
                className="w-fit rounded-full bg-blue-50 text-blue-700"
              >
                Mở cửa cả tuần
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="px-0">
            <Table className="min-w-[820px]">
              <TableHeader className="[&_tr]:border-border/60">
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableHead className="h-11 w-[260px] pl-4 text-muted-foreground md:pl-8">
                    Khung ngày
                  </TableHead>
                  <TableHead className="h-11 text-center text-muted-foreground">
                    Thời gian
                  </TableHead>
                  <TableHead className="hidden h-11 text-muted-foreground lg:table-cell">
                    Chi tiết ca
                  </TableHead>
                  <TableHead className="hidden h-11 text-muted-foreground md:table-cell">
                    Hỏi nhanh
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="[&_tr]:border-border/60">
                {hours.map((item) => {
                  const Icon = item.icon;

                  return (
                    <TableRow
                      key={item.label}
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
                                {item.label}
                              </span>
                              <Badge
                                variant="secondary"
                                className="rounded-full bg-blue-50 text-blue-700"
                              >
                                {item.status}
                              </Badge>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground lg:hidden">
                              {item.subtext}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 text-center">
                        <Badge variant="outline" className="rounded-full">
                          <Clock className="size-3" />
                          {item.detail}
                        </Badge>
                      </TableCell>

                      <TableCell className="hidden py-3 text-sm text-muted-foreground lg:table-cell">
                        {item.subtext}
                      </TableCell>

                      <TableCell className="hidden py-3 md:table-cell">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {item.faq}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {item.faqAnswer}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>

          <CardFooter className="justify-center border-t bg-muted/30 text-center text-xs text-muted-foreground">
            <Clock className="mr-1.5 size-3.5 text-blue-600" />
            Giờ hoạt động có thể thay đổi vào dịp lễ Tết. Vui lòng liên hệ
            trước để xác nhận.
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
