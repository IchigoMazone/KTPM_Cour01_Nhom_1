"use client";

import type { LucideIcon } from "lucide-react";
import { Check, Clock, Droplets, Shirt, Sparkles, Wind } from "lucide-react";
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

type ServiceWorkflow = {
  icon: LucideIcon;
  name: string;
  time: string;
  description: string;
  badge: string;
  faq: string;
  faqAnswer: string;
};

const services: ServiceWorkflow[] = [
  {
    icon: Shirt,
    name: "Giặt thường",
    time: "24 giờ",
    description: "Phù hợp đồ everyday, đồ cotton, vải thường",
    badge: "Phổ biến",
    faq: "Giặt thường có an toàn cho đồ không?",
    faqAnswer: "Có, chúng tôi dùng bột giặt chuyên dụng cho vải thường.",
  },
  {
    icon: Wind,
    name: "Giặt khô",
    time: "48 giờ",
    description: "Cho đồ mỏng, vest, áo sơ mi cần giữ form",
    badge: "Giữ form",
    faq: "Giặt khô khác gì giặt nước?",
    faqAnswer: "Giặt khô dùng dung môi đặc biệt, hạn chế co vải.",
  },
  {
    icon: Droplets,
    name: "Giặt hấp",
    time: "36 giờ",
    description: "Đồ cần làm sạch sâu, khử trùng, khử mùi",
    badge: "Sạch sâu",
    faq: "Giặt hấp có tốt hơn giặt thường không?",
    faqAnswer: "Phù hợp đồ cần khử mùi và vệ sinh sâu hơn.",
  },
  {
    icon: Sparkles,
    name: "Đồ da",
    time: "72 giờ",
    description: "Giày, túi da, áo da cần xử lý đặc biệt",
    badge: "Cẩn thận",
    faq: "Đồ da có bảo hành không?",
    faqAnswer: "Có, chúng tôi cam kết xử lý cẩn thận theo tình trạng da.",
  },
];

export default function Workflow() {
  return (
    <section
      id="workflow"
      className="flex min-h-screen items-center px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center sm:mb-16">
          <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            <GradientText>Thời gian hoàn thành</GradientText>
          </h2>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Tùy theo loại dịch vụ, thời gian hoàn thành dao động từ 24h đến
            72h.
          </p>
        </div>

        <Card className="overflow-hidden border-blue-100 bg-card shadow-sm">
          <CardHeader className="gap-2 border-b bg-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="size-5 text-blue-600" />
                  Lịch xử lý theo loại dịch vụ
                </CardTitle>
                <CardDescription className="mt-1">
                  Thời gian tính từ khi đơn được tiếp nhận và phân loại.
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
            <Table className="min-w-[860px]">
              <TableHeader className="[&_tr]:border-border/60">
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableHead className="h-11 w-[260px] pl-4 text-muted-foreground md:pl-8">
                    Dịch vụ
                  </TableHead>
                  <TableHead className="h-11 text-center text-muted-foreground">
                    Thời gian
                  </TableHead>
                  <TableHead className="hidden h-11 text-muted-foreground md:table-cell">
                    Ghi chú
                  </TableHead>
                  <TableHead className="hidden h-11 text-muted-foreground lg:table-cell">
                    Hỏi nhanh
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="[&_tr]:border-border/60">
                {services.map((service) => {
                  const Icon = service.icon;

                  return (
                    <TableRow
                      key={service.name}
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
                                {service.name}
                              </span>
                              <Badge
                                variant="secondary"
                                className="rounded-full bg-blue-50 text-blue-700"
                              >
                                {service.badge}
                              </Badge>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground md:hidden">
                              {service.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <Badge variant="outline" className="rounded-full">
                          <Clock className="size-3" />
                          {service.time}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden py-3 text-sm text-muted-foreground md:table-cell">
                        {service.description}
                      </TableCell>
                      <TableCell className="hidden py-3 lg:table-cell">
                        <div className="rounded-lg border bg-background p-3">
                          <p className="text-sm font-medium text-foreground">
                            {service.faq}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {service.faqAnswer}
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
            <Check className="mr-1.5 size-3.5 text-blue-600" />
            Đơn gấp có thể hoàn thành sớm hơn với phụ phí theo từng dịch vụ.
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
