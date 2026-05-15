"use client";

import React, { useState } from "react";
import { CheckCircle, Mail, MessageCircle, Phone, Send } from "lucide-react";
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

const contactChannels = [
  {
    icon: MessageCircle,
    title: "Zalo",
    desc: "Phản hồi trong vài phút",
    href: "https://zalo.me/begausop",
    action: "Chat ngay",
  },
  {
    icon: Mail,
    title: "Email",
    desc: "Phản hồi trong 24h",
    href: "mailto:contact@begausop.vn",
    action: "Gửi mail",
  },
  {
    icon: Phone,
    title: "Hotline",
    desc: "0901 234 567",
    href: "tel:0901234567",
    action: "Gọi ngay",
  },
];

export default function Reach() {
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
      id="reach"
      className="flex min-h-screen items-center px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center sm:mb-16">
          <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            <GradientText>Kết nối với chúng tôi</GradientText>
          </h2>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Đội ngũ BegauShop luôn sẵn sàng lắng nghe và hỗ trợ bạn 24/7.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            {contactChannels.map((item) => {
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
                      <CardDescription className="mt-1">
                        {item.desc}
                      </CardDescription>
                    </div>

                    <Button
                      asChild
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined}>
                        {item.action}
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="border-blue-100 bg-card shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-xl">Gửi tin nhắn</CardTitle>
                  <CardDescription className="mt-1">
                    Điền thông tin, chúng tôi sẽ liên hệ lại trong 30 phút.
                  </CardDescription>
                </div>
                <Badge
                  variant="secondary"
                  className="rounded-full bg-blue-50 text-blue-700"
                >
                  Nhanh chóng
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
                      <Label htmlFor="reach-name">Họ và tên</Label>
                      <Input
                        id="reach-name"
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
                      <Label htmlFor="reach-phone">Số điện thoại</Label>
                      <Input
                        id="reach-phone"
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
                    <Label htmlFor="reach-message">Nội dung</Label>
                    <Textarea
                      id="reach-message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Mô tả yêu cầu của bạn..."
                      className="resize-none focus-visible:border-blue-500 focus-visible:ring-blue-500/30"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="h-10 w-full bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Send className="size-4" />
                    Gửi tin nhắn
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
