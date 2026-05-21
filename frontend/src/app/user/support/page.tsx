"use client";

import { HelpCircle, MessageSquare, Phone, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  PageShell,
  SectionCard,
  StatusBadge,
} from "@/src/app/home/_components/dashboard-primitives";

const tickets = [
  { id: "HT-309", topic: "Giao trễ đơn DH-1048", time: "17/05/2026 09:20", status: "Đang xử lý" },
  { id: "HT-288", topic: "Cập nhật địa chỉ nhận", time: "14/05/2026 15:40", status: "Đã phản hồi" },
];

const faqs = [
  "Tôi có thể đổi lịch lấy đồ sau khi đặt không?",
  "Giá cuối cùng được tính như thế nào?",
  "Nếu thất lạc hoặc hư hại đồ thì xử lý ra sao?",
  "Tôi có thể xuất hóa đơn điện tử không?",
];

export default function UserSupportPage() {
  return (
    <PageShell
      title="Hỗ Trợ Khách Hàng"
      description="Gửi yêu cầu hỗ trợ, theo dõi phản hồi và xem các câu hỏi thường gặp."
    >
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="Gửi yêu cầu mới" description="Mô tả vấn đề để nhân viên xử lý nhanh hơn.">
          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
            <div className="space-y-2">
              <Label>Loại yêu cầu</Label>
              <Select defaultValue="order">
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Chọn loại yêu cầu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="order">Vấn đề đơn hàng</SelectItem>
                  <SelectItem value="delivery">Giao nhận</SelectItem>
                  <SelectItem value="payment">Thanh toán</SelectItem>
                  <SelectItem value="quality">Chất lượng giặt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mã đơn liên quan</Label>
              <Input placeholder="VD: DH-1055" className="h-10" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Tiêu đề</Label>
              <Input placeholder="Tóm tắt vấn đề cần hỗ trợ" className="h-10" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Nội dung</Label>
              <Textarea placeholder="Mô tả chi tiết tình huống, thời gian, mong muốn xử lý..." />
            </div>
            <div className="sm:col-span-2">
              <Button className="gap-2 bg-neutral-900 text-white hover:bg-neutral-800">
                <Send className="size-4" />
                Gửi yêu cầu
              </Button>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Kênh liên hệ nhanh" description="Dành cho vấn đề cần xử lý gấp.">
          <div className="space-y-3 p-5">
            {[
              { icon: Phone, label: "Hotline", value: "1900 8989" },
              { icon: MessageSquare, label: "Zalo CSKH", value: "Panda Laundry" },
              { icon: ShieldCheck, label: "Cam kết phản hồi", value: "Trong 15 phút" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-lg border p-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-gray-100">
                  <item.icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Yêu cầu gần đây" description="Theo dõi tiến độ phản hồi từ tiệm.">
          <div className="divide-y">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <p className="font-medium">{ticket.id} · {ticket.topic}</p>
                  <p className="text-sm text-muted-foreground">{ticket.time}</p>
                </div>
                <StatusBadge tone={ticket.status === "Đã phản hồi" ? "success" : "warning"}>{ticket.status}</StatusBadge>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Câu hỏi thường gặp" description="Các vấn đề khách hàng hay hỏi.">
          <div className="divide-y">
            {faqs.map((faq) => (
              <button key={faq} className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-[#f7f7f7] sm:px-6">
                <HelpCircle className="size-4 shrink-0" />
                <span className="text-sm font-medium">{faq}</span>
              </button>
            ))}
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}
