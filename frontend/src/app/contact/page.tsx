"use client";
import React, { useState } from "react";

/* ─────────────────────────── DATA ─────────────────────────── */

const contactCards = [
  {
    title: "Điện thoại",
    value: "0123 456 789",
    sub: "Gọi trực tiếp — hỗ trợ ngay",
    href: "tel:0123456789",
    cta: "Gọi ngay",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
      </svg>
    ),
  },
  {
    title: "Zalo",
    value: "0123 456 789",
    sub: "Nhắn tin — phản hồi trong 5 phút",
    href: "https://zalo.me/0123456789",
    cta: "Nhắn Zalo",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    title: "Email",
    value: "hello@begau.vn",
    sub: "Phản hồi trong vòng 24 giờ",
    href: "mailto:hello@begau.vn",
    cta: "Gửi email",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
];

const hours = [
  { day: "Thứ 2 – Thứ 6", time: "7:00 – 22:00", open: true },
  { day: "Thứ 7", time: "7:00 – 22:00", open: true },
  { day: "Chủ nhật", time: "8:00 – 21:00", open: true },
  { day: "Lễ, Tết", time: "9:00 – 20:00", open: true },
];

const faqs = [
  { q: "Đặt lịch bao lâu trước thì được?", a: "Đặt trước 2 giờ là đủ. Hỏa tốc trong ngày khả dụng trước 14:00." },
  { q: "Tiệm có làm việc ngày lễ không?", a: "Có, mở cửa 9:00–20:00 ngày lễ và Tết. Vui lòng đặt lịch trước." },
  { q: "Tôi có thể theo dõi đơn hàng không?", a: "Có. Sau khi nhận đồ, bạn nhận link theo dõi realtime qua Zalo/SMS." },
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

/* ─────────────────────────── PAGE ─────────────────────────── */

export default function LienHePage() {
  const [form, setForm] = useState({ name: "", phone: "", service: "", note: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const today = new Date().getDay(); // 0=Sun, 1=Mon...

  return (
    <main className="bg-[#faf9f7] text-stone-700 font-sans">

      {/* ══ HERO ══ */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-16 text-center">
        <SectionLabel>Liên hệ</SectionLabel>
        <h1 className="font-serif text-4xl md:text-6xl text-stone-900 leading-tight mb-5">
          Chúng tôi luôn<br />
          <span className="italic text-stone-400">sẵn sàng lắng nghe</span>
        </h1>
        <p className="text-base text-stone-500 leading-relaxed max-w-xl mx-auto">
          Có thắc mắc về dịch vụ, muốn đặt lịch hay chỉ hỏi thêm — gọi, nhắn hoặc
          điền form bên dưới, chúng tôi phản hồi trong vòng 5 phút.
        </p>
      </section>

      {/* ══ CONTACT CARDS ══ */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contactCards.map(({ title, value, sub, href, cta, icon }) => (
            <div key={title} className="bg-white border border-stone-100 rounded-2xl p-6 flex flex-col gap-4 hover:border-stone-200 hover:shadow-sm transition-all">
              <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-600">
                {icon}
              </div>
              <div>
                <p className="text-[11px] text-stone-400 uppercase tracking-wide mb-1">{title}</p>
                <p className="font-medium text-stone-900 text-lg">{value}</p>
                <p className="text-sm text-stone-400 mt-0.5">{sub}</p>
              </div>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors"
              >
                {cta}
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ══ MAP + HOURS ══ */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-20">
        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">

          {/* Map embed */}
          <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden">
            <div className="bg-stone-100 h-72 flex items-center justify-center relative">
              <iframe
                title="Bản đồ Tiệm giặt là Bé Gấu"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.0966864327997!2d105.84961731476368!3d21.02800868599819!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab9bd9861ca1%3A0xe7887f7b72ca17a9!2zSG_DoG4gS2nhur9tLCBIw6AgTuG7mWk!5e0!3m2!1svi!2svn!4v1680000000000!5m2!1svi!2svn"
                className="w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ border: 0 }}
                allowFullScreen
              />
            </div>
            <div className="p-5 flex items-start gap-3">
              <div className="w-9 h-9 bg-stone-50 rounded-xl flex items-center justify-center text-stone-500 shrink-0">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-stone-800 text-sm">Tiệm giặt là Bé Gấu</p>
                <p className="text-sm text-stone-500 mt-0.5">123 Hàng Bông, Hoàn Kiếm, Hà Nội</p>
                <a
                  href="https://maps.google.com/?q=Hoàn+Kiếm+Hà+Nội"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-stone-400 hover:text-stone-700 transition-colors mt-1 inline-block"
                >
                  Mở trong Google Maps →
                </a>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div className="bg-white border border-stone-100 rounded-2xl p-6 flex flex-col gap-5">
            <div>
              <SectionLabel>Giờ hoạt động</SectionLabel>
              {/* Live indicator */}
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-emerald-700 font-medium">Đang mở cửa</span>
              </div>
            </div>

            <div className="flex flex-col divide-y divide-stone-50">
              {hours.map(({ day, time, open }, i) => {
                const isToday =
                  (i === 0 && today >= 1 && today <= 5) ||
                  (i === 1 && today === 6) ||
                  (i === 2 && today === 0);
                return (
                  <div
                    key={day}
                    className={`flex items-center justify-between py-3 ${isToday ? "text-stone-900" : "text-stone-500"}`}
                  >
                    <div className="flex items-center gap-2">
                      {isToday && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                      <span className={`text-sm ${isToday ? "font-medium" : ""}`}>{day}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{time}</span>
                      {open && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full">
                          Mở
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-stone-50 pt-4 flex flex-col gap-2">
              <p className="text-[11px] text-stone-400 uppercase tracking-wide">Dịch vụ hỏa tốc</p>
              <p className="text-sm text-stone-600">
                Đặt trước 14:00 — nhận đồ ngay trong ngày.
                <br />Phụ thu 30%, liên hệ trước để đặt slot.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FORM + ZALO ══ */}
      <section className="bg-stone-50 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-start">

            {/* Form */}
            <div>
              <SectionLabel>Đặt lịch nhanh</SectionLabel>
              <h2 className="font-serif text-3xl text-stone-900 mb-2">Gửi yêu cầu</h2>
              <p className="text-sm text-stone-500 mb-8 leading-relaxed">
                Điền thông tin bên dưới, chúng tôi sẽ liên hệ xác nhận lịch trong vòng 5 phút.
              </p>

              {sent ? (
                <div className="bg-white border border-emerald-100 rounded-2xl p-8 text-center">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-stone-900 mb-1">Đã gửi thành công!</h3>
                  <p className="text-sm text-stone-500">Chúng tôi sẽ gọi lại trong vòng 5 phút.</p>
                  <button
                    className="mt-5 text-sm text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                    onClick={() => { setSent(false); setForm({ name: "", phone: "", service: "", note: "" }); }}
                  >
                    Gửi yêu cầu khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-stone-400 uppercase tracking-wide">Họ tên *</label>
                      <input
                        required
                        type="text"
                        placeholder="Nguyễn Văn A"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-stone-400 uppercase tracking-wide">Số điện thoại *</label>
                      <input
                        required
                        type="tel"
                        placeholder="09xx xxx xxx"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-stone-400 uppercase tracking-wide">Dịch vụ cần</label>
                    <select
                      value={form.service}
                      onChange={(e) => setForm({ ...form, service: e.target.value })}
                      className="bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 focus:outline-none focus:border-stone-400 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="">Chọn dịch vụ…</option>
                      <option>Giặt thường</option>
                      <option>Giặt khô</option>
                      <option>Giặt hấp</option>
                      <option>Giặt đồ da</option>
                      <option>Giặt chăn màn</option>
                      <option>Là phẳng</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-stone-400 uppercase tracking-wide">Ghi chú thêm</label>
                    <textarea
                      rows={3}
                      placeholder="Địa chỉ, thời gian mong muốn, yêu cầu đặc biệt…"
                      value={form.note}
                      onChange={(e) => setForm({ ...form, note: e.target.value })}
                      className="bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-stone-900 text-stone-100 font-medium text-sm rounded-xl py-3.5 hover:bg-stone-800 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Gửi yêu cầu đặt lịch →
                  </button>
                  <p className="text-xs text-stone-400 text-center">
                    Hoặc gọi trực tiếp <span className="font-medium text-stone-600">0123 456 789</span> để được hỗ trợ ngay
                  </p>
                </form>
              )}
            </div>

            {/* Zalo CTA + FAQs */}
            <div className="flex flex-col gap-6">
              {/* Zalo card */}
              <div className="bg-[#0068FF] rounded-2xl p-7 text-white flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Chat Zalo trực tiếp</p>
                    <p className="text-xs text-blue-200">Phản hồi trong 5 phút</p>
                  </div>
                </div>
                <p className="text-sm text-blue-100 leading-relaxed">
                  Nhắn Zalo để hỏi giá, đặt lịch hoặc theo dõi đơn hàng — tiện hơn gọi điện, nhanh hơn email.
                </p>
                <a
                  href="https://zalo.me/0123456789"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-[#0068FF] font-medium text-sm rounded-xl py-3 text-center hover:bg-blue-50 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Mở Zalo chat →
                </a>
              </div>

              {/* FAQ */}
              <div className="flex flex-col gap-3">
                <p className="text-[11px] text-stone-400 uppercase tracking-wide">Câu hỏi nhanh</p>
                {faqs.map(({ q, a }) => (
                  <div key={q} className="bg-white border border-stone-100 rounded-2xl p-5">
                    <h3 className="font-medium text-stone-800 text-sm mb-1">{q}</h3>
                    <p className="text-sm text-stone-500 leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}