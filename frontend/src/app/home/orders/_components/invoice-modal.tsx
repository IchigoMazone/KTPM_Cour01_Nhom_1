"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Order } from "../types";
import { statusDotColor, statusBgColor } from "../data";

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export function InvoiceModal({ order, onClose }: InvoiceModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-lg overflow-hidden rounded-xl border-border bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10">
        <CardHeader className="flex flex-row items-start justify-between border-b border-border bg-popover px-6 py-3">
          <CardTitle className="text-lg font-semibold">Hóa đơn {order.id}</CardTitle>
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"
            onClick={onClose}
          >
            <X className="size-5" />
          </button>
        </CardHeader>
        <CardContent className="space-y-4 px-6 py-3 text-sm">
          <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex min-w-0 items-start gap-3">
              <Image
                src="https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif"
                alt={order.customer}
                width={32}
                height={32}
                className="size-8 shrink-0 rounded-full object-cover ring-1 ring-border"
              />
              <div className="min-w-0">
                <p className="font-semibold leading-none text-foreground">{order.customer}</p>
                {order.phone && (
                  <p className="mt-1.5 text-xs text-muted-foreground">{order.phone}</p>
                )}
              </div>
            </div>
            <div className="flex shrink-0 justify-end">
              <div
                aria-label={`QR thanh toán hóa đơn ${order.id}`}
                className="size-44 rounded-lg border border-border bg-background bg-[length:calc(100%-16px)_calc(100%-16px)] bg-center bg-no-repeat p-2 shadow-sm"
                style={{
                  backgroundImage: `url("https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=1&data=${encodeURIComponent(`BEGAU PAY ${order.id} ${order.customer} ${order.amount} VND`)}")`,
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <span className="text-muted-foreground">Dịch vụ</span>
            <span className="text-right text-foreground">{order.service}</span>
            <span className="text-muted-foreground">Thời gian</span>
            <span className="text-right text-foreground">{order.deliveryTime} · {order.deliveryDate}</span>
            <span className="text-muted-foreground">Khối lượng</span>
            <span className="text-right text-foreground">{order.quantity}</span>
            <span className="text-muted-foreground">Thanh toán</span>
            <span className="text-right text-foreground">Tiền mặt / QR</span>
            <span className="text-muted-foreground">Trạng thái</span>
            <span className="text-right">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  color: statusDotColor[order.status],
                  backgroundColor: statusBgColor[order.status],
                }}
              >
                <span className="size-1.5 rounded-full" style={{ backgroundColor: statusDotColor[order.status] }} />
                {order.status}
              </span>
            </span>
          </div>

          <div className="border-t border-border pt-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Giá tiền</span>
              <span className="text-foreground">{order.amount.toLocaleString("vi-VN")}đ</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-muted-foreground">Mã / điểm</span>
              <span className="text-muted-foreground">Không áp dụng</span>
            </div>
            <div className="mt-3 flex justify-between text-base font-bold">
              <span className="text-foreground">Cần thanh toán</span>
              <span className="text-foreground">{order.amount.toLocaleString("vi-VN")}đ</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
