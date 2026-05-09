"use client";

import React, { useState } from "react";
import { Ticket, Copy, Check, Clock, Tag, Gift } from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";

const coupons = [
  {
    code: "GIATLA20",
    discount: "20%",
    maxAmount: 50000,
    minOrder: 100000,
    title: "Giảm 20% cho đơn từ 100k",
    description: "Áp dụng cho dịch vụ giặt thường và giặt khô",
    validUntil: "31/05/2026",
    remaining: 156,
    color: "from-blue-500 to-cyan-500",
  },
  {
    code: "SALE50K",
    discount: "50.000đ",
    maxAmount: 50000,
    minOrder: 0,
    title: "Giảm 50.000đ toàn đơn",
    description: "Không giới hạn đơn hàng tối thiểu",
    validUntil: "15/06/2026",
    remaining: 89,
    color: "from-purple-500 to-pink-500",
  },
  {
    code: "FREESHIP",
    discount: "Miễn phí",
    maxAmount: 0,
    minOrder: 200000,
    title: "Miễn phí giao nhận",
    description: "Áp dụng cho đơn từ 200.000đ trong phạm vi 10km",
    validUntil: "30/06/2026",
    remaining: 234,
    color: "from-green-500 to-emerald-500",
  },
  {
    code: "VIP30",
    discount: "30%",
    maxAmount: 100000,
    minOrder: 300000,
    title: "VIP - Giảm 30% đơn lớn",
    description: "Chỉ dành cho khách hàng thân thiết, đơn từ 300k",
    validUntil: "31/12/2026",
    remaining: 45,
    color: "from-amber-500 to-orange-500",
    isVip: true,
  },
];

export default function Coupons() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <section
      id="coupons"
      className="min-h-screen flex items-center justify-center bg-white"
    >
      <div className="w-full max-w-6xl mx-auto px-6 pt-20 pb-20">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            <GradientText>Mã Giảm Giá</GradientText>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Săn mã giảm giá hấp dẫn, tiết kiệm đến 30% cho mỗi đơn hàng
          </p>
        </div>

        {/* Coupons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coupons.map((coupon, index) => (
            <div
              key={coupon.code}
              className={`relative bg-white border-2 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl ${
                coupon.isVip
                  ? "border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              {/* Discount Badge */}
              <div
                className={`absolute top-4 right-4 bg-gradient-to-r ${coupon.color} text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg`}
              >
                {coupon.discount}
              </div>

              {/* VIP Badge */}
              {coupon.isVip && (
                <div className="absolute top-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-br-xl">
                  <Gift className="w-3 h-3 inline mr-1" />
                  KHÁCH HÀNG THÂN THIẾT
                </div>
              )}

              <div className={`p-6 ${coupon.isVip ? "pt-12" : "pt-6"}`}>
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`p-4 rounded-2xl flex-shrink-0 bg-gradient-to-r ${coupon.color}`}
                  >
                    <Ticket className="w-8 h-8 text-white" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xl font-bold text-gray-900 mb-1">
                      {coupon.title}
                    </h4>
                    <p className="text-gray-500 text-sm">
                      {coupon.description}
                    </p>
                  </div>
                </div>

                {/* Code Box */}
                <div
                  className={`flex items-center gap-3 p-4 rounded-xl mb-4 ${
                    coupon.isVip ? "bg-white/80" : "bg-gray-50"
                  } border-2 border-dashed ${
                    coupon.isVip ? "border-amber-300" : "border-gray-200"
                  }`}
                >
                  <Tag className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <code className="flex-1 font-mono font-bold text-lg text-gray-800">
                    {coupon.code}
                  </code>
                  <button
                    onClick={() => copyCode(coupon.code)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      copiedCode === coupon.code
                        ? "bg-green-500 text-white"
                        : coupon.isVip
                        ? "bg-amber-500 text-white hover:bg-amber-600"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {copiedCode === coupon.code ? (
                      <>
                        <Check className="w-4 h-4" />
                        Đã copy
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                {/* Info */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="w-4 h-4" />
                    Hết hạn: {coupon.validUntil}
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Ticket className="w-4 h-4" />
                    Còn lại: {coupon.remaining} mã
                  </div>
                  {coupon.minOrder > 0 && (
                    <div className="flex items-center gap-2 text-gray-500">
                      Đơn tối thiểu: {coupon.minOrder.toLocaleString()}đ
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <div className="mt-12 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-blue-700 text-sm text-center">
            Mỗi mã chỉ sử dụng được 1 lần cho mỗi tài khoản. Không áp dụng
            đồng thời với các chương trình khuyến mãi khác.
          </p>
        </div>
      </div>
    </section>
  );
}
