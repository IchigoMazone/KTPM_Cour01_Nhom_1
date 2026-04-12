"use client"
import React from "react";

/* ─────────────────────────── DATA ─────────────────────────── */

const coupons = [
  {
    code: "BEGAU10",
    discount: "Giảm 10%",
    desc: "Toàn bộ dịch vụ — không giới hạn đơn hàng",
    expiry: "31/12/2026",
    condition: "Đơn tối thiểu 100.000đ",
    tag: "Đang hot",
    tagColor: "bg-rose-100 text-rose-700",
    highlight: true,
  },
  {
    code: "MOIKHACH",
    discount: "Miễn phí giao nhận",
    desc: "Áp dụng cho khách hàng đặt lịch lần đầu tiên",
    expiry: "Không giới hạn",
    condition: "Chỉ dùng 1 lần / tài khoản",
    tag: "Khách mới",
    tagColor: "bg-sky-100 text-sky-700",
    highlight: false,
  },
  {
    code: "WEEKEND20",
    discount: "Giảm 20%",
    desc: "Áp dụng các ngày thứ 7 & Chủ nhật hàng tuần",
    expiry: "Mỗi cuối tuần",
    condition: "Đơn tối thiểu 150.000đ",
    tag: "Cuối tuần",
    tagColor: "bg-amber-100 text-amber-700",
    highlight: false,
  },
  {
    code: "CHANMAN15",
    discount: "Giảm 15%",
    desc: "Riêng dịch vụ giặt chăn màn, gối, nệm",
    expiry: "30/06/2026",
    condition: "Tối thiểu 2 món",
    tag: "Chuyên biệt",
    tagColor: "bg-violet-100 text-violet-700",
    highlight: false,
  },
];

const combos = [
  {
    name: "Combo Gia đình",
    originalPrice: "320.000đ",
    salePrice: "259.000đ",
    save: "Tiết kiệm 61.000đ",
    items: ["Giặt thường 5kg", "Giặt 1 bộ chăn màn", "Là phẳng 5 món", "Giao nhận miễn phí"],
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    popular: true,
  },
  {
    name: "Combo Công sở",
    originalPrice: "180.000đ",
    salePrice: "145.000đ",
    save: "Tiết kiệm 35.000đ",
    items: ["Giặt thường 3kg", "Là phẳng 10 áo sơ mi", "Giao nhận miễn phí", "Ưu tiên xử lý"],
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
      </svg>
    ),
    popular: false,
  },
  {
    name: "Combo Cao cấp",
    originalPrice: "450.000đ",
    salePrice: "369.000đ",
    save: "Tiết kiệm 81.000đ",
    items: ["Giặt khô 3 món vest/áo dài", "Giặt da 1 túi xách", "Dưỡng da sau giặt", "Giao nhận miễn phí"],
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    popular: false,
  },
];

const loyaltyTiers = [
  {
    name: "Thành viên",
    threshold: "0 – 500 điểm",
    color: "bg-stone-100 text-stone-600 border-stone-200",
    dotColor: "bg-stone-400",
    perks: ["Tích 1 điểm / 1.000đ", "Sinh nhật giảm 10%", "Thông báo ưu đãi sớm"],
  },
  {
    name: "Bạc",
    threshold: "500 – 2.000 điểm",
    color: "bg-slate-100 text-slate-700 border-slate-200",
    dotColor: "bg-slate-400",
    perks: ["Tích 1.2 điểm / 1.000đ", "Ưu tiên xử lý hỏa tốc", "Giảm 5% mọi đơn hàng"],
  },
  {
    name: "Vàng",
    threshold: "2.000 – 5.000 điểm",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    dotColor: "bg-amber-400",
    perks: ["Tích 1.5 điểm / 1.000đ", "Giao nhận miễn phí 5km", "Giảm 10% mọi đơn hàng"],
    highlight: true,
  },
  {
    name: "Kim cương",
    threshold: "5.000+ điểm",
    color: "bg-sky-50 text-sky-700 border-sky-200",
    dotColor: "bg-sky-400",
    perks: ["Tích 2 điểm / 1.000đ", "Hotline riêng 24/7", "Giảm 15% + quà tháng"],
  },
];

const rewards = [
  { points: 200, reward: "Giảm 20.000đ cho đơn tiếp theo", icon: "🎟" },
  { points: 500, reward: "1 lần giặt thường miễn phí (tối đa 3kg)", icon: "🧺" },
  { points: 1000, reward: "Combo giặt + là phẳng trị giá 150.000đ", icon: "🎁" },
  { points: 2000, reward: "Dịch vụ giặt khô 1 vest hoặc áo dài", icon: "✨" },
];

const referral = [
  { step: "01", title: "Chia sẻ mã của bạn", desc: "Mỗi tài khoản có một mã giới thiệu riêng. Gửi cho bạn bè qua Zalo, Facebook hay nhắn tin." },
  { step: "02", title: "Bạn bè đặt đơn đầu", desc: "Khi người được giới thiệu đặt đơn đầu tiên và sử dụng mã của bạn, hệ thống ghi nhận ngay." },
  { step: "03", title: "Cả hai nhận thưởng", desc: "Bạn nhận 100.000đ vào tài khoản. Bạn bè được giảm 20% đơn đầu tiên." },
];

/* ─────────────────────── COMPONENTS ───────────────────────── */

function SectionLabel({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div className="inline-flex items-center gap-2 mb-4">
      <span className={`w-5 h-px ${light ? "bg-stone-600" : "bg-stone-400"}`} />
      <span className={`text-[11px] font-medium tracking-[1.6px] uppercase ${light ? "text-stone-500" : "text-stone-400"}`}>
        {children}
      </span>
    </div>
  );
}

function CopyButton({ code }: { code: string }) {
  return (
    <button
      className="group flex items-center gap-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-stone-300 rounded-xl px-4 py-2.5 transition-all cursor-pointer"
      onClick={() => navigator.clipboard?.writeText(code)}
    >
      <span className="font-mono font-semibold text-stone-800 tracking-widest text-sm">{code}</span>
      <svg className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
      </svg>
    </button>
  );
}

/* ─────────────────────────── PAGE ─────────────────────────── */

export default function UuDaiPage() {
  return (
    <main className="bg-[#faf9f7] text-stone-700 font-sans">

      {/* ══ HERO ══ */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-16 text-center">
        <SectionLabel>Ưu đãi & Khuyến mãi</SectionLabel>
        <h1 className="font-serif text-4xl md:text-6xl text-stone-900 leading-tight mb-5">
          Giặt sạch hơn —<br />
          <span className="italic text-stone-400">chi tiêu ít hơn</span>
        </h1>
        <p className="text-base text-stone-500 leading-relaxed max-w-xl mx-auto">
          Mã giảm giá, combo tiết kiệm, tích điểm đổi quà và ưu đãi khi giới thiệu bạn bè —
          Bé Gấu luôn có cách để bạn tiết kiệm hơn mỗi lần giặt.
        </p>
      </section>

      {/* ══ MÃ GIẢM GIÁ ══ */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <SectionLabel>Mã giảm giá</SectionLabel>
            <h2 className="font-serif text-3xl text-stone-900">Đang có hiệu lực</h2>
          </div>
          <span className="text-sm text-stone-400">Cập nhật tháng 4/2026</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.map(({ code, discount, desc, expiry, condition, tag, tagColor, highlight }) => (
            <div
              key={code}
              className={`relative rounded-2xl border p-6 flex flex-col gap-4 transition-all
                ${highlight
                  ? "bg-stone-900 border-stone-800"
                  : "bg-white border-stone-100 hover:border-stone-200 hover:shadow-sm"
                }`}
            >
              {/* Dashed divider effect */}
              <div className={`absolute left-[40%] top-0 bottom-0 border-l-2 border-dashed ${highlight ? "border-stone-700" : "border-stone-100"}`} />

              <div className="flex items-start justify-between pr-[62%]">
                <div>
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full mb-2 inline-block ${tagColor}`}>{tag}</span>
                  <p className={`font-serif text-2xl font-semibold ${highlight ? "text-stone-100" : "text-stone-900"}`}>{discount}</p>
                  <p className={`text-sm mt-1 leading-snug ${highlight ? "text-stone-400" : "text-stone-500"}`}>{desc}</p>
                </div>
              </div>

              <div className="pl-[62%] -mt-16 flex flex-col items-center justify-center gap-3 h-28">
                <CopyButton code={code} />
                <p className={`text-[11px] text-center leading-snug ${highlight ? "text-stone-600" : "text-stone-400"}`}>
                  {condition}
                </p>
              </div>

              <div className={`border-t pt-3 flex items-center gap-1.5 ${highlight ? "border-stone-800" : "border-stone-50"}`}>
                <svg className={`w-3.5 h-3.5 ${highlight ? "text-stone-600" : "text-stone-300"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                <span className={`text-[11px] ${highlight ? "text-stone-500" : "text-stone-400"}`}>
                  Hạn sử dụng: {expiry}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ COMBO ══ */}
      <section className="bg-stone-50 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
          <div className="text-center mb-14">
            <SectionLabel>Combo tiết kiệm</SectionLabel>
            <h2 className="font-serif text-3xl md:text-4xl text-stone-900 mb-3">Gộp lại — rẻ hơn rõ ràng</h2>
            <p className="text-stone-500 text-sm max-w-md mx-auto">
              Kết hợp nhiều dịch vụ trong một đơn để tiết kiệm tối đa chi phí.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {combos.map(({ name, originalPrice, salePrice, save, items, icon, popular }) => (
              <div
                key={name}
                className={`relative bg-white rounded-2xl p-7 flex flex-col gap-5 transition-all
                  ${popular ? "border-2 border-stone-900 shadow-md" : "border border-stone-100 hover:border-stone-200 hover:shadow-sm"}`}
              >
                {popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-stone-900 text-stone-100 text-[11px] font-medium px-4 py-1.5 rounded-full whitespace-nowrap">
                      Phổ biến nhất
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 bg-stone-50 rounded-xl flex items-center justify-center text-stone-600">
                    {icon}
                  </div>
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                    {save}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-xl text-stone-900 mb-1">{name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-2xl text-stone-900">{salePrice}</span>
                    <span className="text-sm text-stone-400 line-through">{originalPrice}</span>
                  </div>
                </div>

                <ul className="flex flex-col gap-2">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-stone-500">
                      <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>

                <button className={`mt-auto w-full font-medium text-sm rounded-xl py-3.5 active:scale-[0.98] transition-all cursor-pointer
                  ${popular
                    ? "bg-stone-900 text-stone-100 hover:bg-stone-800"
                    : "border border-stone-200 text-stone-700 hover:border-stone-400 hover:bg-stone-50"
                  }`}>
                  Chọn combo này
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TÍCH ĐIỂM ══ */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24">
        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-16 items-start">
          <div>
            <SectionLabel>Tích điểm</SectionLabel>
            <h2 className="font-serif text-3xl md:text-4xl text-stone-900 leading-tight mb-4">
              Mỗi đồng chi —<br />
              <span className="italic text-stone-400">một điểm tích lũy</span>
            </h2>
            <p className="text-sm text-stone-500 leading-relaxed mb-8">
              Tự động tích điểm sau mỗi đơn hàng. Điểm không hết hạn và có thể đổi
              thành dịch vụ miễn phí hoặc voucher giảm giá bất cứ lúc nào.
            </p>

            {/* Rewards list */}
            <div className="flex flex-col gap-3">
              {rewards.map(({ points, reward }) => (
                <div key={points} className="flex items-center gap-4 bg-stone-50 border border-stone-100 rounded-xl px-5 py-4">
                  <div className="text-center shrink-0 w-14">
                    <p className="font-serif text-xl text-stone-900">{points}</p>
                    <p className="text-[10px] text-stone-400 uppercase tracking-wide">điểm</p>
                  </div>
                  <div className="w-px h-8 bg-stone-200 shrink-0" />
                  <p className="text-sm text-stone-600">{reward}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tiers */}
          <div className="flex flex-col gap-4">
            <p className="text-[11px] font-medium tracking-[1.6px] uppercase text-stone-400 mb-2">
              Hạng thành viên
            </p>
            {loyaltyTiers.map(({ name, threshold, color, dotColor, perks, highlight }) => (
              <div
                key={name}
                className={`border rounded-2xl p-5 flex flex-col gap-3 transition-all ${color}
                  ${highlight ? "shadow-sm" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                    <span className="font-medium text-base">{name}</span>
                    {highlight && (
                      <span className="text-[10px] font-medium bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                        Phổ biến
                      </span>
                    )}
                  </div>
                  <span className="text-xs opacity-70">{threshold}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {perks.map((p) => (
                    <span key={p} className="text-xs opacity-80 flex items-center gap-1.5">
                      <svg className="w-3 h-3 shrink-0 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ GIỚI THIỆU BẠN BÈ ══ */}
      <section className="bg-stone-900">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
          <div className="text-center mb-14">
            <SectionLabel light>Giới thiệu bạn bè</SectionLabel>
            <h2 className="font-serif text-3xl md:text-4xl text-stone-100 mb-3">
              Giới thiệu — cả hai cùng thắng
            </h2>
            <p className="text-stone-500 text-sm max-w-md mx-auto">
              Bạn nhận <span className="text-stone-300 font-medium">100.000đ</span>, bạn bè được giảm <span className="text-stone-300 font-medium">20%</span> đơn đầu tiên.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {referral.map(({ step, title, desc }) => (
              <div key={step} className="text-center flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-stone-700 flex items-center justify-center text-stone-400 text-sm font-medium">
                  {step}
                </div>
                <div>
                  <h3 className="font-medium text-stone-200 mb-2">{title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Referral code mockup */}
          <div className="mt-14 max-w-sm mx-auto bg-stone-800 border border-stone-700 rounded-2xl p-6 text-center">
            <p className="text-xs text-stone-500 uppercase tracking-wide mb-3">Mã giới thiệu của bạn</p>
            <div className="bg-stone-900 border border-stone-700 rounded-xl px-6 py-3 mb-4">
              <span className="font-mono text-xl font-semibold text-stone-100 tracking-[0.2em]">
                BEGAU–XXXX
              </span>
            </div>
            <button className="w-full bg-[#faf9f7] text-stone-900 font-medium text-sm rounded-xl py-3 hover:bg-stone-100 active:scale-[0.98] transition-all cursor-pointer">
              Sao chép & chia sẻ
            </button>
            <p className="text-xs text-stone-600 mt-3">
              Đăng nhập để xem mã giới thiệu cá nhân của bạn
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}