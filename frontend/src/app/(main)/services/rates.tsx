"use client";

import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Briefcase,
  Check,
  Clock,
  Package,
  Shirt,
  Sparkles,
  Tag,
} from "lucide-react";
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

type RateItem = {
  icon: LucideIcon;
  name: string;
  price: number;
  unit: string;
  duration: string;
  note: string;
  badge: string;
  highlight?: boolean;
  points: string[];
};

const rates: RateItem[] = [
  {
    icon: Shirt,
    name: "Giặt thường",
    price: 25000,
    unit: "kg",
    duration: "24h",
    note: "Phù hợp đồ mặc hằng ngày",
    badge: "Tiết kiệm",
    points: ["Phân loại màu vải", "Giặt sạch mùi hằng ngày", "Gấp gọn khi bàn giao"],
  },
  {
    icon: Sparkles,
    name: "Giặt sấy nhanh",
    price: 35000,
    unit: "kg",
    duration: "4-6h",
    note: "Nhận lại trong ngày",
    badge: "Phổ biến",
    highlight: true,
    points: ["Ưu tiên xử lý nhanh", "Sấy khô đúng nhiệt", "Phù hợp lịch gấp"],
  },
  {
    icon: BadgeCheck,
    name: "Giặt hấp cao cấp",
    price: 45000,
    unit: "kg",
    duration: "24h",
    note: "Khử khuẩn, thơm lâu",
    badge: "Cao cấp",
    points: ["Làm mới bằng hơi nước", "Giảm nhăn bề mặt vải", "Hương thơm dịu nhẹ"],
  },
  {
    icon: Package,
    name: "Chăn ga",
    price: 50000,
    unit: "kg",
    duration: "48h",
    note: "Chăn bông, ga trải giường",
    badge: "Gia dụng",
    points: ["Xử lý đồ kích thước lớn", "Sấy kỹ lõi vải", "Đóng gói sạch sẽ"],
  },
  {
    icon: Shirt,
    name: "Sơ mi",
    price: 15000,
    unit: "món",
    duration: "24h",
    note: "Bao gồm là phẳng",
    badge: "Công sở",
    points: ["Giặt nhẹ cổ tay áo", "Là phẳng trước giao", "Giữ phom gọn gàng"],
  },
  {
    icon: Briefcase,
    name: "Vest / Suit",
    price: 80000,
    unit: "món",
    duration: "48h",
    note: "Giặt khô, là hơi chuyên dụng",
    badge: "Đặc biệt",
    highlight: true,
    points: ["Giữ phom áo vest", "Xử lý bằng giặt khô", "Là hơi chuyên dụng"],
  },
];

const formatPrice = (price: number) => price.toLocaleString("vi-VN");

export default function Rates() {
  return (
    <section
      id="rates"
      className="flex min-h-screen items-center px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <header className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center sm:mb-16">
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            <GradientText>Bảng giá dịch vụ</GradientText>
          </h1>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Chọn nhanh hạng mục phù hợp, xem rõ đơn giá, thời gian xử lý và các
            phần chính đã bao gồm trong từng dịch vụ.
          </p>
        </header>

        <Card className="overflow-hidden border-blue-100 bg-card shadow-sm">
          <CardHeader className="gap-2 border-b bg-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Tag className="size-5 text-blue-600" />
                  Bảng giá tham khảo
                </CardTitle>
                <CardDescription className="mt-1">
                  Giá được tính theo từng kg hoặc từng món tùy loại dịch vụ.
                </CardDescription>
              </div>

              <Badge
                variant="secondary"
                className="w-fit rounded-full bg-blue-50 text-blue-700"
              >
                6 dịch vụ chính
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
                  <TableHead className="h-11 text-right text-muted-foreground">
                    Đơn giá
                  </TableHead>
                  <TableHead className="h-11 text-center text-muted-foreground">
                    Thời gian
                  </TableHead>
                  <TableHead className="hidden h-11 text-muted-foreground lg:table-cell">
                    Bao gồm
                  </TableHead>
                  <TableHead className="hidden h-11 text-muted-foreground md:table-cell">
                    Ghi chú
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="[&_tr]:border-border/60">
                {rates.map((item) => {
                  const Icon = item.icon;

                  return (
                    <TableRow
                      key={item.name}
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
                                {item.name}
                              </span>
                              <Badge
                                variant={item.highlight ? "default" : "secondary"}
                                className={
                                  item.highlight
                                    ? "rounded-full bg-blue-600 text-white hover:bg-blue-600"
                                    : "rounded-full bg-blue-50 text-blue-700"
                                }
                              >
                                {item.highlight && <Sparkles className="size-3" />}
                                {item.highlight ? "Nên chọn" : item.badge}
                              </Badge>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground md:hidden">
                              {item.note}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 text-right">
                        <div className="font-semibold text-foreground">
                          {formatPrice(item.price)}
                          <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                            đ
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          / {item.unit}
                        </div>
                      </TableCell>

                      <TableCell className="py-3 text-center">
                        <Badge variant="outline" className="rounded-full">
                          <Clock className="size-3" />
                          {item.duration}
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
                        {item.note}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>

          <CardFooter className="justify-center border-t bg-muted/30 text-center text-xs text-muted-foreground">
            <Tag className="mr-1.5 size-3.5" />
            Giá tham khảo, xác nhận khi tiếp nhận đồ.
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
