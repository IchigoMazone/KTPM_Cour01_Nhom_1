<<<<<<< HEAD
// import React from "react";

// export default function Referrals() {
//   return (
//     <section
//       id="referrals"
//       className="min-h-screen flex items-center justify-center bg-gray-100"
//     >
//       Referrals
//     </section>
//   );
// }

"use client";

import React from "react";
import {
  Users,
  Gift,
  Crown,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Grab,
} from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";

const referralData = {
  title: "Ưu đãi khách hàng thân thiết",
  subtitle:
    "Nhận quà hấp dẫn khi quay lại sử dụng dịch vụ hoặc giới thiệu bạn bè đến BeGauShop.",

  cards: [
    {
      icon: Crown,
      title: "Khách hàng thân thiết",
      reward: "Giảm đến 20%",
      desc: "Tích lũy đơn hàng để nâng hạng thành viên và nhận ưu đãi định kỳ.",
      color: "blue",
      features: ["Ưu đãi sinh nhật", "Ưu tiên xử lý đơn", "Voucher hàng tháng"],
    },
    {
      icon: Users,
      title: "Giới thiệu bạn bè",
      reward: "Nhận 50.000đ",
      desc: "Mỗi người bạn đăng ký và hoàn tất đơn đầu tiên, bạn nhận thưởng.",
      color: "cyan",
      features: [
        "Không giới hạn lượt mời",
        "Bạn bè cũng có ưu đãi",
        "Nhận thưởng tự động",
      ],
    },
  ],
};
=======
"use client";

import React, { useState } from "react";
import { Users, Gift, Heart, Share2, Copy, Check, ChevronRight, Award, Star } from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";

const referralTiers = [
  {
    level: 1,
    title: "Người giới thiệu mới",
    referralsNeeded: 0,
    reward: 30000,
    rewardType: "voucher",
    description: "Mỗi khách được giới thiệu thành công",
    icon: Gift,
    color: "from-gray-500 to-gray-600",
    benefits: ["Voucher 30.000đ cho mỗi lượt giới thiệu", "Không giới hạn số lượng"],
  },
  {
    level: 2,
    title: "Người bạn đồng hành",
    referralsNeeded: 5,
    reward: 100000,
    rewardType: "cashback",
    description: "Khi có từ 5 người giới thiệu thành công",
    icon: Heart,
    color: "from-blue-500 to-cyan-500",
    benefits: ["Voucher 100.000đ khi đạt mốc", "Tặng thêm 50.000đ tiền mặt", "Ưu tiên xử lý đơn hàng"],
  },
];
>>>>>>> dev

export default function Referrals() {
  const [referralLink, setReferralLink] = useState("https://begaushop.vn/ref/MINE123");
  const [copied, setCopied] = useState(false);
  const [currentReferrals, setCurrentReferrals] = useState(7);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: "BegauShop - Tiệm giặt là cao cấp",
        text: "Sử dụng dịch vụ giặt là chất lượng cao tại BegauShop. Nhận ưu đãi khi đăng ký qua link của tôi!",
        url: referralLink,
      });
    } else {
      copyLink();
    }
  };

  const getProgressPercent = (referrals: number, needed: number) => {
    return Math.min((referrals / needed) * 100, 100);
  };

  return (
    <section
      id="referrals"
<<<<<<< HEAD
      className="h-screen overflow-hidden px-4 bg-gradient-to-b from-slate-50 via-white to-blue-50 scroll-mt-24 flex items-center"
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-20">
          <GradientText className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3">
            {referralData.title}
          </GradientText>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
            {referralData.subtitle}
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-7">
          {referralData.cards.map((item, index) => {
            const Icon = item.icon;

            const theme =
              item.color === "cyan"
                ? {
                    bg: "from-cyan-500 to-blue-500",
                    light: "bg-cyan-50",
                    text: "text-cyan-600",
                    border: "border-cyan-100",
                  }
                : {
                    bg: "from-blue-600 to-indigo-500",
                    light: "bg-blue-50",
                    text: "text-blue-600",
                    border: "border-blue-100",
                  };

            return (
              <div
                key={index}
                className={`bg-white rounded-3xl border ${theme.border} shadow-xl overflow-hidden`}
              >
                {/* Top */}
                <div className={`bg-gradient-to-r ${theme.bg} p-6 text-white`}>
                  <div className="flex gap-4 mb-4 items-center">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center ">
                      <Icon className="w-6 h-6" />
                    </div>

                    <h2 className="text-3xl font-bold">{item.title}</h2>
                  </div>

                  <p className="text-white/90 text-sm mb-4">{item.desc}</p>

                  <div className="text-4xl font-bold">{item.reward}</div>
                </div>

                {/* Bottom */}
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    {item.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle2
                          className={`w-5 h-5 shrink-0 ${theme.text}`}
                        />
                        <span className="text-slate-700 text-sm">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    className={`w-full rounded-2xl py-3 font-medium flex items-center justify-center gap-2 ${theme.light} ${theme.text} hover:opacity-90 transition`}
                  >
                    Tham gia ngay
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
=======
      className="min-h-screen flex items-center justify-center bg-white"
    >
      <div className="w-full max-w-6xl mx-auto px-6 pt-20 pb-20">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            <GradientText>Giới Thiệu Bạn Bè</GradientText>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Chia sẻ BegauShop với bạn bè, cả hai cùng nhận ưu đãi hấp dẫn
          </p>
        </div>

        {/* Referral Link Box */}
        <div className="group p-6 bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-xl transition-all duration-300 mb-12">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="font-semibold text-gray-900">Link giới thiệu của bạn</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
            <code className="flex-1 font-mono text-sm text-gray-600 truncate">{referralLink}</code>
            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
            >
              {copied ? (
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
            <button
              onClick={shareLink}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex-shrink-0"
            >
              <Share2 className="w-4 h-4" />
              Chia sẻ
            </button>
          </div>
        </div>

        {/* Tiers */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Cấp bậc phần thưởng</h3>
          {referralTiers.map((tier) => {
            const Icon = tier.icon;
            const isUnlocked = currentReferrals >= tier.referralsNeeded;
            const progress = getProgressPercent(currentReferrals, tier.referralsNeeded);
            const nextTier = referralTiers.find((t) => t.level === tier.level + 1);
            const referralsToNext = nextTier
              ? nextTier.referralsNeeded - currentReferrals
              : 0;

            return (
              <div
                key={tier.level}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                  isUnlocked
                    ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-300"
                    : "bg-white border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Icon & Title */}
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`p-4 rounded-2xl flex-shrink-0 bg-gradient-to-r ${tier.color} ${
                        !isUnlocked ? "opacity-50 grayscale" : ""
                      }`}
                    >
                      <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-gray-900">{tier.title}</h4>
                        {isUnlocked && (
                          <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                            Đã đạt
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm">{tier.description}</p>
                    </div>
                  </div>

                  {/* Reward */}
                  <div className="flex items-center gap-4 lg:flex-shrink-0">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Phần thưởng</p>
                      <p className="text-xl font-bold text-green-600">
                        {tier.reward.toLocaleString()}đ
                      </p>
                    </div>
                    {tier.level < referralTiers.length && (
                      <button className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
                        Chi tiết
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar (for non-unlocked tiers) */}
                {!isUnlocked && tier.level < referralTiers.length && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                      <span>
                        {currentReferrals}/{tier.referralsNeeded} người giới thiệu
                      </span>
                      <span>Cần thêm {referralsToNext} người</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Benefits */}
                {isUnlocked && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {tier.benefits.map((benefit, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm text-green-700"
                        >
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
>>>>>>> dev
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
