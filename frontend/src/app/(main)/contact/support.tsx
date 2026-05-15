"use client";

import React, { useState } from "react";
import {
  CheckCircle,
  Clock,
  Headphones,
  MessageCircle,
  Send,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GradientText } from "@/src/components/ui/gradient-text";

const channels = [
  {
    icon: MessageCircle,
    title: "Chat Zalo trực tiếp",
    desc: "Trò chuyện ngay với nhân viên tư vấn",
    link: "https://zalo.me/begausop",
    buttonText: "Bắt đầu chat",
  },
  {
    icon: Users,
    title: "Tư vấn viên",
    desc: "Đội ngũ 10+ nhân viên tư vấn chuyên nghiệp",
    link: "tel:0901234567",
    buttonText: "Gọi ngay",
  },
  {
    icon: Clock,
    title: "Phản hồi nhanh",
    desc: "Trong vòng 5 phút vào giờ hành chính",
    link: null,
    buttonText: "24/7 hỗ trợ",
  },
];

export default function Support() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: "", phone: "", message: "" });
  };

  return (
    <section
      id="support"
      className="flex min-h-screen items-center px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center sm:mb-16">
          <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            <GradientText>Hỗ trợ khách hàng</GradientText>
          </h2>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Đội ngũ hỗ trợ BegauShop luôn sẵn sàng giải đáp thắc mắc và xử lý
            yêu cầu của bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {channels.map((item) => {
            const Icon = item.icon;

            return (
              <Card
                key={item.title}
                className="border-blue-100 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
              >
                <CardHeader className="gap-4">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-200">
                    <Icon className="size-6" />
                  </div>

                  <div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription className="mt-1 leading-6">
                      {item.desc}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent>
                  {item.link ? (
                    <Button
                      asChild
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <a
                        href={item.link}
                        target={item.link.startsWith("http") ? "_blank" : undefined}
                        rel={
                          item.link.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                      >
                        {item.buttonText}
                      </a>
                    </Button>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="rounded-full bg-blue-50 text-blue-700"
                    >
                      {item.buttonText}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-5 border-blue-100 bg-card shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Headphones className="size-5 text-blue-600" />
                  Gửi yêu cầu hỗ trợ
                </CardTitle>
                <CardDescription className="mt-1">
                  Điền thông tin, chúng tôi sẽ liên hệ lại trong 30 phút.
                </CardDescription>
              </div>
              <Badge
                variant="secondary"
                className="rounded-full bg-blue-50 text-blue-700"
              >
                Ưu tiên xử lý
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            {submitted ? (
              <div className="flex items-center justify-center gap-3 rounded-lg bg-blue-50 py-12 text-blue-700">
                <CheckCircle className="size-8" />
                <span className="text-base font-medium">
                  Gửi thành công! Chúng tôi sẽ liên hệ sớm.
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="support-name">Họ và tên</Label>
                    <Input
                      id="support-name"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Nhập họ và tên"
                      className="h-10 focus-visible:border-blue-500 focus-visible:ring-blue-500/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="support-phone">Số điện thoại</Label>
                    <Input
                      id="support-phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="Nhập số điện thoại"
                      className="h-10 focus-visible:border-blue-500 focus-visible:ring-blue-500/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-message">Nội dung</Label>
                  <Textarea
                    id="support-message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Mô tả yêu cầu hỗ trợ..."
                    className="resize-none focus-visible:border-blue-500 focus-visible:ring-blue-500/30"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="submit"
                    className="h-10 bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Send className="size-4" />
                    Gửi yêu cầu
                  </Button>

                  <Button
                    asChild
                    variant="secondary"
                    className="h-10 bg-blue-50 text-blue-700 hover:bg-blue-100"
                  >
                    <a
                      href="https://zalo.me/begausop"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="size-4" />
                      Chat Zalo
                    </a>
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
