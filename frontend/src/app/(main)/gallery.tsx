"use client";

import { useState } from "react";
import { Gauge, Ruler, ShieldCheck, Sparkles, Star, Timer } from "lucide-react";
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
  {
    name: "Máy giặt nhỏ",
    count: "2",
    image: "/img (1).jfif",
    capacity: "7-9kg/mẻ",
    time: "35-45 phút",
    usage: "Đồ cá nhân, áo sơ mi, đồ trẻ em",
    feature: "Giặt nhẹ, tiết kiệm nước, phù hợp đồ mỏng",
    note: "Ưu tiên cho đơn nhỏ cần xử lý nhanh trong ngày.",
  },
  {
    name: "Máy giặt lớn",
    count: "1",
    image: "/img (4).jpg",
    capacity: "15-20kg/mẻ",
    time: "45-60 phút",
    usage: "Chăn ga, rèm cửa, đơn gia đình nhiều kg",
    feature: "Lồng giặt lớn, lực giặt ổn định, xử lý đồ dày",
    note: "Dùng cho đơn khối lượng lớn để giữ đồ sạch đều và không bị nén.",
  },
  {
    name: "Máy sấy nhỏ",
    count: "2",
    image: "/img (2).jfif",
    capacity: "7-9kg/mẻ",
    time: "30-40 phút",
    usage: "Áo thun, quần áo hằng ngày, khăn nhỏ",
    feature: "Sấy nhiệt vừa, giảm nhăn, giữ độ mềm vải",
    note: "Phù hợp đơn cần lấy nhanh nhưng vẫn cần kiểm soát nhiệt.",
  },
  {
    name: "Máy sấy lớn",
    count: "1",
    image: "/img (3).jpg",
    capacity: "15-20kg/mẻ",
    time: "50-70 phút",
    usage: "Chăn, ga, khăn lớn, đồ dày",
    feature: "Luồng gió mạnh, sấy đều đồ khối lượng lớn",
    note: "Dùng khi cần làm khô sâu cho đồ dày trước khi gấp gói.",
  },
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
  const [selectedEquipment, setSelectedEquipment] = useState<(typeof equipment)[number] | null>(
    null
  );

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
              <button
                type="button"
                className="group block w-full text-left"
                onClick={() => setSelectedEquipment(item)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-3 bottom-3 rounded-full bg-black/45 px-3 py-1.5 text-center text-xs font-medium text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                    Xem chi tiết máy
                  </div>
                </div>
              </button>
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

      {selectedEquipment ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`Chi tiết ${selectedEquipment.name}`}
          onClick={() => setSelectedEquipment(null)}
        >
          <div
            className="grid max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-blue-100 bg-background shadow-2xl md:grid-cols-[1fr_1.1fr]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bg-blue-50/60 p-3">
              <img
                src={selectedEquipment.image}
                alt={selectedEquipment.name}
                className="h-full max-h-[36vh] w-full rounded-2xl object-cover md:max-h-none"
              />
            </div>

            <div className="overflow-y-auto p-5 sm:p-6">
              <Badge
                variant="secondary"
                className="mb-3 rounded-full bg-blue-50 text-blue-700"
              >
                {selectedEquipment.count} thiết bị đang hoạt động
              </Badge>
              <h3 className="text-2xl font-bold tracking-tight">
                {selectedEquipment.name}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {selectedEquipment.note}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  [Ruler, "Sức chứa", selectedEquipment.capacity],
                  [Timer, "Thời gian", selectedEquipment.time],
                  [Gauge, "Phù hợp", selectedEquipment.usage],
                  [ShieldCheck, "Đặc điểm", selectedEquipment.feature],
                ].map(([Icon, label, value]) => {
                  const DetailIcon = Icon as typeof Ruler;

                  return (
                    <div
                      key={label as string}
                      className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4"
                    >
                      <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-white text-blue-600 ring-1 ring-blue-100">
                        <DetailIcon className="size-5" />
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wide text-blue-500">
                        {label as string}
                      </p>
                      <p className="mt-1 text-sm font-semibold leading-6 text-foreground">
                        {value as string}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 rounded-2xl border border-blue-100 bg-card p-4">
                <div className="flex items-center gap-2 font-semibold">
                  <Sparkles className="size-4 text-blue-600" />
                  Ghi chú vận hành
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Thông tin này giúp khách hàng hiểu thiết bị nào được dùng cho
                  từng loại đồ và vì sao quy trình giặt sấy được chọn phù hợp.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
