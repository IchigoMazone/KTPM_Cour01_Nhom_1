"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Order } from "../types";
import { statusDotColor, statusBgColor } from "../data";

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
  quantityDisplay?: string;
  customerImageUrl?: string | null;
}

const avatarColors = ["#0f766e", "#2563eb", "#7c3aed", "#be123c", "#c2410c", "#047857"];

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  return `${words[0][0]}${words.length > 1 ? words[words.length - 1][0] : ""}`.toUpperCase();
}

function getAvatarColor(name: string) {
  const hash = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

export function InvoiceModal({ order, onClose, quantityDisplay, customerImageUrl }: InvoiceModalProps) {
  return (
    <Dialog open={Boolean(order)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="flex w-[min(86vw,540px)] max-w-[min(86vw,540px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[540px]"
      >
        {order && (
          <>
            <DialogHeader className="min-h-[61px] flex-row items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
              <DialogTitle className="text-lg font-semibold leading-7 text-slate-950">
                Hóa đơn {order.id}
              </DialogTitle>
              <button
                type="button"
                aria-label="Đóng hóa đơn"
                className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                onClick={onClose}
              >
                <X className="size-4" />
              </button>
            </DialogHeader>
            <div className="space-y-4 p-6 text-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <Avatar className="size-8 shrink-0 after:border-slate-200">
                {customerImageUrl ? <AvatarImage src={customerImageUrl} alt={order.customer} /> : null}
                <AvatarFallback
                  className="text-[11px] font-semibold leading-none text-white"
                  style={{ backgroundColor: getAvatarColor(order.customer) }}
                >
                  <span className="block translate-y-px leading-none">{getInitials(order.customer)}</span>
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold leading-none text-slate-900">{order.customer}</p>
                {order.phone && (
                  <p className="mt-1.5 text-xs text-slate-500">{order.phone}</p>
                )}
              </div>
            </div>
            <div className="flex shrink-0 justify-end">
              <div
                aria-label={`QR thanh toán hóa đơn ${order.id}`}
                className="size-44 rounded-lg border border-slate-200 bg-white bg-[length:calc(100%-16px)_calc(100%-16px)] bg-center bg-no-repeat p-2"
                style={{
                  backgroundImage: `url("https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=1&data=${encodeURIComponent(`BEGAU PAY ${order.id} ${order.customer} ${order.amount} VND`)}")`,
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-200 pt-4 text-xs">
            <span className="text-slate-500">Dịch vụ</span>
            <span className="text-right text-slate-900">{order.service}</span>
            <span className="text-slate-500">Thời gian</span>
            <span className="text-right text-slate-900">{order.deliveryTime || "-"} · {order.deliveryDate || "-"}</span>
            <span className="text-slate-500">Số lượng</span>
            <span className="text-right text-slate-900">{quantityDisplay || order.quantity || "-"}</span>
            <span className="text-slate-500">Thanh toán</span>
            <span className="text-right text-slate-900">{order.payment || "Tiền mặt / QR"}</span>
            <span className="text-slate-500">Trạng thái</span>
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

          <div className="border-t border-slate-200 pt-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Giá gốc</span>
              <span className="text-slate-900">{Number(order.originalAmount || order.amount).toLocaleString("vi-VN")}đ</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-slate-500">Mã / điểm</span>
              <span className="text-slate-500">
                {order.discount
                  ? `${order.discount}${order.discountValue ? ` · ${order.discountValue}` : ""}`
                  : "Không áp dụng"}
              </span>
            </div>
            <div className="mt-3 flex justify-between text-base font-bold">
              <span className="text-slate-950">Cần thanh toán</span>
              <span className="text-slate-950">{order.amount.toLocaleString("vi-VN")}đ</span>
            </div>
          </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
