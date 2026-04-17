import React from "react";


const deliveryOptions = [
  {
    title: "Giao nhận tận nơi",
    badge: "Phổ biến",
    badgeColor: "bg-emerald-100 text-emerald-700",
    desc: "Nhân viên đến lấy và giao trả tận nhà theo lịch bạn chọn. Không cần ra ngoài, tiết kiệm hoàn toàn thời gian.",
    perks: [
      { text: "Miễn phí trong 3km" },
      { text: "Đặt lịch linh hoạt 7:00–21:00" },
      { text: "Nhân viên đúng giờ, có định danh" },
      { text: "Theo dõi trạng thái đơn realtime" },
    ],
    cta: "Đặt lịch giao nhận",
    ctaStyle:
      "bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:opacity-90",
  },
  {
    title: "Tự mang đến tiệm",
    badge: "Nhanh hơn",
    badgeColor: "bg-sky-100 text-sky-700",
    desc: "Mang đồ trực tiếp đến cơ sở tại Hoàn Kiếm. Giảm 5% và được ưu tiên xử lý sớm hơn so với đơn giao nhận.",
    perks: [
      { text: "Giảm 5% toàn bộ dịch vụ" },
      { text: "Ưu tiên xử lý sớm hơn 1–2h" },
      { text: "Mở cửa 7:00–22:00 mỗi ngày" },
      { text: "Tư vấn trực tiếp tại tiệm" },
    ],
    cta: "Xem địa chỉ tiệm",
    ctaStyle:
      "border border-blue-200 text-blue-600 hover:border-blue-400 hover:bg-blue-50",
  },
];


export default function Select() {
  return (
    <div id="select" className="min-h-screen flex items-center justify-center border-b border-[var(--color-divider)] bg-blue-200">
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24">
        <div className="text-center mb-14">
        
          <h2 className="font-serif text-3xl md:text-4xl text-stone-900 mb-3">
            Chọn cách phù hợp với bạn
          </h2>
          <p className="text-stone-500 text-base max-w-md mx-auto">
            Giao nhận tận nơi hay tự ghé tiệm — cả hai đều được hỗ trợ nhiệt
            tình.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {deliveryOptions.map(
            ({ title, badge, badgeColor, desc, perks, cta, ctaStyle }) => (
              <div
                key={title}
                className="bg-white border border-blue-100 rounded-2xl p-8 flex flex-col gap-5 hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-2xl text-stone-900">
                    {title}
                  </h3>
                  <span
                    className={`text-[11px] font-medium px-3 py-1 rounded-full ${badgeColor}`}
                  >
                    {badge}
                  </span>
                </div>
                <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
                <ul className="flex flex-col gap-2.5">
                  {perks.map(({ text }) => (
                    <li
                      key={text}
                      className="flex items-center gap-2.5 text-sm text-stone-600"
                    >
                      <svg
                        className="w-4 h-4 text-blue-400 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {text}
                    </li>
                  ))}
                </ul>
                <button
                  className={`mt-auto w-full font-medium text-sm rounded-xl py-3.5 active:scale-[0.98] transition-all cursor-pointer ${ctaStyle}`}
                >
                  {cta}
                </button>
              </div>
            ),
          )}
        </div>
      </section>
    </div>
  );
}
