  // import React from "react";

  // /* ─────────────────────────── DATA ─────────────────────────── */

  // const steps = [
  //   {
  //     id: "01",
  //     title: "Đặt lịch",
  //     time: "~2 phút",
  //     desc: "Gọi điện, nhắn Zalo hoặc đặt online. Chúng tôi xác nhận lịch trong vòng 5 phút và gửi thông tin nhân viên phụ trách.",
  //     detail: ["Gọi 0123 456 789", "Nhắn Zalo cùng số", "Đặt qua website 24/7"],
  //     icon: (
  //       <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
  //         <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  //       </svg>
  //     ),
  //   },
  //   {
  //     id: "02",
  //     title: "Lấy đồ tại nhà",
  //     time: "15–30 phút",
  //     desc: "Nhân viên đến đúng giờ, cân đồ minh bạch và lập phiếu chi tiết từng món. Bạn xác nhận trước khi chúng tôi mang đi.",
  //     detail: ["Cân đồ tại chỗ", "Chụp ảnh xác nhận", "Lập phiếu chi tiết"],
  //     icon: (
  //       <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
  //         <path d="M5 12H3l9-9 9 9h-2" /><path d="M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /><rect x="9" y="12" width="6" height="8" />
  //       </svg>
  //     ),
  //   },
  //   {
  //     id: "03",
  //     title: "Phân loại & xử lý",
  //     time: "1–2 giờ",
  //     desc: "Đồ được phân loại theo chất liệu và màu sắc. Vết bẩn cứng đầu được xử lý thủ công trước khi đưa vào máy giặt công nghiệp.",
  //     detail: ["Phân loại vải kỹ lưỡng", "Tẩy vết bẩn thủ công", "Chọn chương trình giặt phù hợp"],
  //     icon: (
  //       <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
  //         <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
  //       </svg>
  //     ),
  //   },
  //   {
  //     id: "04",
  //     title: "Giặt & sấy",
  //     time: "2–6 giờ",
  //     desc: "Giặt bằng máy công nghiệp nhập khẩu châu Âu với hóa chất sinh học an toàn. Sấy khô hoàn toàn, không ẩm mốc.",
  //     detail: ["Máy giặt 15–20kg", "Hóa chất sinh học", "Sấy khô 100%"],
  //     icon: (
  //       <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
  //         <rect x="2" y="3" width="20" height="18" rx="2" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" /><line x1="6" y1="6" x2="6" y2="6.01" />
  //       </svg>
  //     ),
  //   },
  //   {
  //     id: "05",
  //     title: "Kiểm tra & gấp",
  //     time: "30–60 phút",
  //     desc: "Từng món được kiểm tra lại — đảm bảo sạch, không mất, không nhầm lẫn. Gấp gọn gàng, bọc túi riêng từng loại.",
  //     detail: ["Kiểm tra từng món", "Gấp theo tiêu chuẩn", "Bọc túi bảo vệ"],
  //     icon: (
  //       <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
  //         <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  //       </svg>
  //     ),
  //   },
  //   {
  //     id: "06",
  //     title: "Giao trả tận nơi",
  //     time: "Đúng hẹn",
  //     desc: "Nhân viên giao đồ đúng giờ đã hẹn. Bạn kiểm tra tại chỗ và thanh toán khi hài lòng — không thu trước.",
  //     detail: ["Giao đúng giờ hẹn", "Kiểm tra tại chỗ", "Thanh toán khi nhận"],
  //     icon: (
  //       <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
  //         <rect x="1" y="3" width="15" height="13" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
  //       </svg>
  //     ),
  //   },
  // ];

  // const deliveryOptions = [
  //   {
  //     title: "Giao nhận tận nơi",
  //     badge: "Phổ biến",
  //     badgeColor: "bg-emerald-100 text-emerald-700",
  //     desc: "Nhân viên đến lấy và giao trả tận nhà theo lịch bạn chọn. Không cần ra ngoài, tiết kiệm hoàn toàn thời gian.",
  //     perks: [
  //       { icon: "✓", text: "Miễn phí trong 3km" },
  //       { icon: "✓", text: "Đặt lịch linh hoạt 7:00–21:00" },
  //       { icon: "✓", text: "Nhân viên đúng giờ, có định danh" },
  //       { icon: "✓", text: "Theo dõi trạng thái đơn realtime" },
  //     ],
  //     cta: "Đặt lịch giao nhận",
  //     ctaStyle: "bg-stone-900 text-stone-100 hover:bg-stone-800",
  //   },
  //   {
  //     title: "Tự mang đến tiệm",
  //     badge: "Nhanh hơn",
  //     badgeColor: "bg-sky-100 text-sky-700",
  //     desc: "Mang đồ trực tiếp đến cơ sở tại Hoàn Kiếm. Giảm 5% và được ưu tiên xử lý sớm hơn so với đơn giao nhận.",
  //     perks: [
  //       { icon: "✓", text: "Giảm 5% toàn bộ dịch vụ" },
  //       { icon: "✓", text: "Ưu tiên xử lý sớm hơn 1–2h" },
  //       { icon: "✓", text: "Mở cửa 7:00–22:00 mỗi ngày" },
  //       { icon: "✓", text: "Tư vấn trực tiếp tại tiệm" },
  //     ],
  //     cta: "Xem địa chỉ tiệm",
  //     ctaStyle: "border border-stone-200 text-stone-700 hover:border-stone-400 hover:bg-stone-50",
  //   },
  // ];

  // const trackingStates = [
  //   { label: "Đã nhận đồ", done: true },
  //   { label: "Đang xử lý", done: true },
  //   { label: "Đang giặt", done: true, active: true },
  //   { label: "Đang sấy", done: false },
  //   { label: "Sẵn sàng giao", done: false },
  //   { label: "Đã giao", done: false },
  // ];

  // const faqs = [
  //   {
  //     q: "Tôi có thể đặt lịch cho hôm nay không?",
  //     a: "Có. Nếu đặt trước 14:00, chúng tôi có thể lấy đồ trong ngày. Dịch vụ hỏa tốc 3–4h có phụ thu 30%.",
  //   },
  //   {
  //     q: "Nhân viên đến trễ thì sao?",
  //     a: "Chúng tôi cam kết đúng giờ ±15 phút. Nếu trễ hơn, bạn nhận voucher giảm 20% cho đơn tiếp theo.",
  //   },
  //   {
  //     q: "Tôi theo dõi đơn hàng bằng cách nào?",
  //     a: "Sau khi nhận đồ, bạn nhận link theo dõi qua Zalo/SMS. Cập nhật realtime từng bước xử lý.",
  //   },
  //   {
  //     q: "Tôi muốn đổi lịch giao trả được không?",
  //     a: "Được, liên hệ trước 2 giờ so với giờ giao là chúng tôi điều chỉnh ngay, không phát sinh chi phí.",
  //   },
  // ];

  // /* ─────────────────────── COMPONENTS ───────────────────────── */

  // function SectionLabel({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  //   return (
  //     <div className="inline-flex items-center gap-2 mb-4">
  //       <span className={`w-5 h-px ${light ? "bg-stone-600" : "bg-stone-400"}`} />
  //       <span className={`text-[11px] font-medium tracking-[1.6px] uppercase ${light ? "text-stone-500" : "text-stone-400"}`}>
  //         {children}
  //       </span>
  //     </div>
  //   );
  // }

  // /* ─────────────────────────── PAGE ─────────────────────────── */

  // export default function QuyTrinhPage() {
  //   return (
  //     <main className="bg-[#faf9f7] text-stone-700 font-sans">

  //       {/* ══ HERO ══ */}
  //       <section className="max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-20 grid lg:grid-cols-2 gap-16 items-center">
  //         <div>
  //           <SectionLabel>Quy trình</SectionLabel>
  //           <h1 className="font-serif text-4xl md:text-5xl text-stone-900 leading-tight mb-6">
  //             Từ lúc đặt lịch<br />
  //             <span className="italic text-stone-400">đến khi nhận đồ —</span><br />
  //             bạn chỉ cần chờ
  //           </h1>
  //           <p className="text-base text-stone-500 leading-relaxed max-w-lg mb-8">
  //             Toàn bộ quy trình được thiết kế để bạn không phải lo bất cứ điều gì.
  //             Đặt lịch một lần, còn lại để Bé Gấu lo.
  //           </p>
  //           <div className="flex flex-wrap gap-3">
  //             <button className="bg-stone-900 text-stone-100 font-medium text-sm rounded-xl px-7 py-3.5 hover:bg-stone-800 active:scale-[0.98] transition-all cursor-pointer">
  //               Đặt lịch ngay →
  //             </button>
  //             <button className="border border-stone-200 text-stone-600 font-medium text-sm rounded-xl px-7 py-3.5 hover:border-stone-400 hover:text-stone-900 active:scale-[0.98] transition-all cursor-pointer">
  //               Gọi 0123 456 789
  //             </button>
  //           </div>
  //         </div>

  //         {/* Tracking preview card */}
  //         <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
  //           <div className="flex items-center justify-between mb-6">
  //             <div>
  //               <p className="text-[11px] text-stone-400 uppercase tracking-wide mb-1">Đơn #BG-20241</p>
  //               <p className="font-medium text-stone-900">Giặt thường · 3.2 kg</p>
  //             </div>
  //             <span className="text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1 rounded-full">
  //               Đang xử lý
  //             </span>
  //           </div>

  //           {/* Progress bar steps */}
  //           <div className="flex items-center gap-0 mb-6">
  //             {trackingStates.map(({ done, active }, i) => (
  //               <React.Fragment key={i}>
  //                 <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-medium transition-all
  //                   ${done && !active ? "bg-stone-900 text-white" : active ? "bg-amber-400 text-white ring-4 ring-amber-100" : "bg-stone-100 text-stone-400"}`}>
  //                   {done && !active ? (
  //                     <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
  //                       <polyline points="20 6 9 17 4 12" />
  //                     </svg>
  //                   ) : (
  //                     i + 1
  //                   )}
  //                 </div>
  //                 {i < trackingStates.length - 1 && (
  //                   <div className={`flex-1 h-0.5 ${i < trackingStates.findIndex(s => s.active) ? "bg-stone-900" : "bg-stone-100"}`} />
  //                 )}
  //               </React.Fragment>
  //             ))}
  //           </div>

  //           <div className="grid grid-cols-3 gap-2">
  //             {trackingStates.map(({ label, done, active }) => (
  //               <p key={label} className={`text-[11px] text-center leading-snug
  //                 ${active ? "text-amber-600 font-medium" : done ? "text-stone-400" : "text-stone-300"}`}>
  //                 {label}
  //               </p>
  //             ))}
  //           </div>

  //           <div className="border-t border-stone-100 mt-5 pt-5 flex items-center justify-between">
  //             <div className="flex items-center gap-2 text-sm text-stone-500">
  //               <svg className="w-4 h-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
  //                 <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  //               </svg>
  //               Dự kiến giao: <span className="font-medium text-stone-800 ml-1">17:00 hôm nay</span>
  //             </div>
  //             <button className="text-xs text-stone-400 hover:text-stone-700 transition-colors cursor-pointer">
  //               Chi tiết →
  //             </button>
  //           </div>
  //         </div>
  //       </section>

  //       {/* ══ STEPS ══ */}
  //       <section className="bg-stone-50 border-y border-stone-200">
  //         <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
  //           <div className="text-center mb-16">
  //             <SectionLabel>6 bước</SectionLabel>
  //             <h2 className="font-serif text-3xl md:text-4xl text-stone-900">
  //               Quy trình từng bước
  //             </h2>
  //           </div>

  //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
  //             {steps.map(({ id, title, time, desc, detail, icon }) => (
  //               <div key={id} className="bg-white border border-stone-100 rounded-2xl p-6 flex flex-col gap-4 hover:border-stone-200 hover:shadow-sm transition-all">
  //                 <div className="flex items-start justify-between">
  //                   <div className="w-11 h-11 bg-stone-50 rounded-xl flex items-center justify-center text-stone-600">
  //                     {icon}
  //                   </div>
  //                   <div className="text-right">
  //                     <span className="text-[11px] text-stone-400 uppercase tracking-wide block">Thời gian</span>
  //                     <span className="text-sm font-medium text-stone-700">{time}</span>
  //                   </div>
  //                 </div>
  //                 <div>
  //                   <div className="flex items-center gap-2 mb-1.5">
  //                     <span className="text-[11px] font-medium text-stone-300">Bước {id}</span>
  //                   </div>
  //                   <h3 className="font-serif text-xl text-stone-900 mb-2">{title}</h3>
  //                   <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
  //                 </div>
  //                 <ul className="flex flex-col gap-1.5 mt-auto pt-4 border-t border-stone-50">
  //                   {detail.map((d) => (
  //                     <li key={d} className="flex items-center gap-2 text-sm text-stone-500">
  //                       <svg className="w-3.5 h-3.5 text-stone-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
  //                         <polyline points="20 6 9 17 4 12" />
  //                       </svg>
  //                       {d}
  //                     </li>
  //                   ))}
  //                 </ul>
  //               </div>
  //             ))}
  //           </div>
  //         </div>
  //       </section>

  //       {/* ══ DELIVERY OPTIONS ══ */}
  //       <section className="max-w-7xl mx-auto px-6 md:px-12 py-24">
  //         <div className="text-center mb-14">
  //           <SectionLabel>Tùy chọn nhận đồ</SectionLabel>
  //           <h2 className="font-serif text-3xl md:text-4xl text-stone-900 mb-3">
  //             Chọn cách phù hợp với bạn
  //           </h2>
  //           <p className="text-stone-500 text-base max-w-md mx-auto">
  //             Giao nhận tận nơi hay tự ghé tiệm — cả hai đều được hỗ trợ nhiệt tình.
  //           </p>
  //         </div>

  //         <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
  //           {deliveryOptions.map(({ title, badge, badgeColor, desc, perks, cta, ctaStyle }) => (
  //             <div key={title} className="bg-white border border-stone-100 rounded-2xl p-8 flex flex-col gap-5 hover:border-stone-200 hover:shadow-sm transition-all">
  //               <div className="flex items-center justify-between">
  //                 <h3 className="font-serif text-2xl text-stone-900">{title}</h3>
  //                 <span className={`text-[11px] font-medium px-3 py-1 rounded-full ${badgeColor}`}>{badge}</span>
  //               </div>
  //               <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
  //               <ul className="flex flex-col gap-2.5">
  //                 {perks.map(({ text }) => (
  //                   <li key={text} className="flex items-center gap-2.5 text-sm text-stone-600">
  //                     <svg className="w-4 h-4 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
  //                       <polyline points="20 6 9 17 4 12" />
  //                     </svg>
  //                     {text}
  //                   </li>
  //                 ))}
  //               </ul>
  //               <button className={`mt-auto w-full font-medium text-sm rounded-xl py-3.5 active:scale-[0.98] transition-all cursor-pointer ${ctaStyle}`}>
  //                 {cta}
  //               </button>
  //             </div>
  //           ))}
  //         </div>
  //       </section>

  //       {/* ══ TIMELINE THỜI GIAN ══ */}
  //       <section className="bg-stone-900">
  //         <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
  //           <div className="text-center mb-14">
  //             <SectionLabel light>Thời gian hoàn thành</SectionLabel>
  //             <h2 className="font-serif text-3xl md:text-4xl text-stone-100">
  //               Bao lâu thì nhận được đồ?
  //             </h2>
  //           </div>
  //           <div className="max-w-2xl mx-auto flex flex-col gap-3">
  //             {[
  //               { service: "Là phẳng", duration: "2–4 giờ", bar: "w-1/4" },
  //               { service: "Giặt thường", duration: "4–6 giờ", bar: "w-2/5" },
  //               { service: "Giặt hấp", duration: "6–8 giờ", bar: "w-1/2" },
  //               { service: "Chăn màn", duration: "8–12 giờ", bar: "w-3/5" },
  //               { service: "Giặt khô", duration: "24 giờ", bar: "w-4/5" },
  //               { service: "Giặt đồ da", duration: "48 giờ", bar: "w-full" },
  //             ].map(({ service, duration, bar }) => (
  //               <div key={service} className="flex items-center gap-4">
  //                 <span className="text-sm text-stone-400 w-28 shrink-0 text-right">{service}</span>
  //                 <div className="flex-1 bg-stone-800 rounded-full h-2">
  //                   <div className={`${bar} bg-stone-400 h-2 rounded-full`} />
  //                 </div>
  //                 <span className="text-sm font-medium text-stone-300 w-16 shrink-0">{duration}</span>
  //               </div>
  //             ))}
  //             <p className="text-xs text-stone-600 text-center mt-4">
  //               * Dịch vụ hỏa tốc rút ngắn 40–50% thời gian, phụ thu 30%
  //             </p>
  //           </div>
  //         </div>
  //       </section>

  //       {/* ══ FAQ ══ */}
  //       <section className="bg-stone-50 border-y border-stone-200">
  //         <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
  //           <div className="text-center mb-14">
  //             <SectionLabel>Câu hỏi thường gặp</SectionLabel>
  //             <h2 className="font-serif text-3xl md:text-4xl text-stone-900">Giải đáp thắc mắc</h2>
  //           </div>
  //           <div className="max-w-3xl mx-auto grid gap-4">
  //             {faqs.map(({ q, a }) => (
  //               <div key={q} className="bg-white border border-stone-100 rounded-2xl p-6">
  //                 <h3 className="font-medium text-stone-900 mb-2">{q}</h3>
  //                 <p className="text-sm text-stone-500 leading-relaxed">{a}</p>
  //               </div>
  //             ))}
  //           </div>
  //         </div>
  //       </section>

  //     </main>
  //   );
  // }








  import React from "react";

/* ─────────────────────────── DATA ─────────────────────────── */

const steps = [
  {
    id: "01",
    title: "Đặt lịch",
    time: "~2 phút",
    desc: "Gọi điện, nhắn Zalo hoặc đặt online. Chúng tôi xác nhận lịch trong vòng 5 phút và gửi thông tin nhân viên phụ trách.",
    detail: ["Gọi 0123 456 789", "Nhắn Zalo cùng số", "Đặt qua website 24/7"],
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: "02",
    title: "Lấy đồ tại nhà",
    time: "15–30 phút",
    desc: "Nhân viên đến đúng giờ, cân đồ minh bạch và lập phiếu chi tiết từng món. Bạn xác nhận trước khi chúng tôi mang đi.",
    detail: ["Cân đồ tại chỗ", "Chụp ảnh xác nhận", "Lập phiếu chi tiết"],
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <path d="M5 12H3l9-9 9 9h-2" /><path d="M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /><rect x="9" y="12" width="6" height="8" />
      </svg>
    ),
  },
  {
    id: "03",
    title: "Phân loại & xử lý",
    time: "1–2 giờ",
    desc: "Đồ được phân loại theo chất liệu và màu sắc. Vết bẩn cứng đầu được xử lý thủ công trước khi đưa vào máy giặt công nghiệp.",
    detail: ["Phân loại vải kỹ lưỡng", "Tẩy vết bẩn thủ công", "Chọn chương trình giặt phù hợp"],
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    ),
  },
  {
    id: "04",
    title: "Giặt & sấy",
    time: "2–6 giờ",
    desc: "Giặt bằng máy công nghiệp nhập khẩu châu Âu với hóa chất sinh học an toàn. Sấy khô hoàn toàn, không ẩm mốc.",
    detail: ["Máy giặt 15–20kg", "Hóa chất sinh học", "Sấy khô 100%"],
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <rect x="2" y="3" width="20" height="18" rx="2" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" /><line x1="6" y1="6" x2="6" y2="6.01" />
      </svg>
    ),
  },
  {
    id: "05",
    title: "Kiểm tra & gấp",
    time: "30–60 phút",
    desc: "Từng món được kiểm tra lại — đảm bảo sạch, không mất, không nhầm lẫn. Gấp gọn gàng, bọc túi riêng từng loại.",
    detail: ["Kiểm tra từng món", "Gấp theo tiêu chuẩn", "Bọc túi bảo vệ"],
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
  {
    id: "06",
    title: "Giao trả tận nơi",
    time: "Đúng hẹn",
    desc: "Nhân viên giao đồ đúng giờ đã hẹn. Bạn kiểm tra tại chỗ và thanh toán khi hài lòng — không thu trước.",
    detail: ["Giao đúng giờ hẹn", "Kiểm tra tại chỗ", "Thanh toán khi nhận"],
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <rect x="1" y="3" width="15" height="13" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
];

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
    ctaStyle: "bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:opacity-90",
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
    ctaStyle: "border border-blue-200 text-blue-600 hover:border-blue-400 hover:bg-blue-50",
  },
];

const trackingStates = [
  { label: "Đã nhận đồ", done: true },
  { label: "Đang xử lý", done: true },
  { label: "Đang giặt", done: true, active: true },
  { label: "Đang sấy", done: false },
  { label: "Sẵn sàng giao", done: false },
  { label: "Đã giao", done: false },
];

/* ─────────────────────── COMPONENTS ───────────────────────── */

function SectionLabel({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div className="inline-flex items-center gap-2 mb-4">
      <span className={`w-5 h-px ${light ? "bg-blue-400" : "bg-blue-300"}`} />
      <span className={`text-[11px] font-medium tracking-[1.6px] uppercase ${light ? "text-blue-300" : "text-blue-500"}`}>
        {children}
      </span>
    </div>
  );
}

/* ─────────────────────────── PAGE ─────────────────────────── */

export default function QuyTrinhPage() {
  return (
    <main className="bg-[#faf9f7] text-stone-700 font-sans">

      {/* ══ HERO ══ */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-20 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <SectionLabel>Quy trình</SectionLabel>
          <h1 className="font-serif text-4xl md:text-5xl text-stone-900 leading-tight mb-6">
            Từ lúc đặt lịch<br />
            <span className="italic bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              đến khi nhận đồ —
            </span><br />
            bạn chỉ cần chờ
          </h1>
          <p className="text-base text-stone-500 leading-relaxed max-w-lg mb-8">
            Toàn bộ quy trình được thiết kế để bạn không phải lo bất cứ điều gì.
            Đặt lịch một lần, còn lại để Bé Gấu lo.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium text-sm rounded-xl px-7 py-3.5 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer">
              Đặt lịch ngay →
            </button>
            <button className="border border-blue-200 text-blue-600 font-medium text-sm rounded-xl px-7 py-3.5 hover:border-blue-400 hover:bg-blue-50 active:scale-[0.98] transition-all cursor-pointer">
              Gọi 0123 456 789
            </button>
          </div>
        </div>

        {/* Tracking preview card */}
        <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[11px] text-blue-400 uppercase tracking-wide mb-1">Đơn #BG-20241</p>
              <p className="font-medium text-stone-900">Giặt thường · 3.2 kg</p>
            </div>
            <span className="text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1 rounded-full">
              Đang xử lý
            </span>
          </div>

          {/* Progress bar steps */}
          <div className="flex items-center gap-0 mb-6">
            {trackingStates.map(({ done, active }, i) => (
              <React.Fragment key={i}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-medium transition-all
                  ${done && !active ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white" : active ? "bg-amber-400 text-white ring-4 ring-amber-100" : "bg-blue-50 text-blue-300"}`}>
                  {done && !active ? (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                {i < trackingStates.length - 1 && (
                  <div className={`flex-1 h-0.5 ${i < trackingStates.findIndex(s => s.active) ? "bg-gradient-to-r from-blue-500 to-cyan-400" : "bg-blue-50"}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {trackingStates.map(({ label, done, active }) => (
              <p key={label} className={`text-[11px] text-center leading-snug
                ${active ? "text-amber-600 font-medium" : done ? "text-blue-400" : "text-stone-300"}`}>
                {label}
              </p>
            ))}
          </div>

          <div className="border-t border-blue-50 mt-5 pt-5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              Dự kiến giao: <span className="font-medium text-stone-800 ml-1">17:00 hôm nay</span>
            </div>
            <button className="text-xs text-blue-400 hover:text-blue-600 transition-colors cursor-pointer">
              Chi tiết →
            </button>
          </div>
        </div>
      </section>

      {/* ══ STEPS ══ */}
      <section className="bg-gradient-to-br from-blue-50 to-cyan-50 border-y border-blue-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
          <div className="text-center mb-16">
            <SectionLabel>6 bước</SectionLabel>
            <h2 className="font-serif text-3xl md:text-4xl text-stone-900">
              Quy trình từng bước
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {steps.map(({ id, title, time, desc, detail, icon }) => (
              <div key={id} className="bg-white border border-blue-100 rounded-2xl p-6 flex flex-col gap-4 hover:border-blue-200 hover:shadow-sm transition-all group">
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-100 transition-colors">
                    {icon}
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-stone-400 uppercase tracking-wide block">Thời gian</span>
                    <span className="text-sm font-medium text-stone-700">{time}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-medium text-blue-300">Bước {id}</span>
                  </div>
                  <h3 className="font-serif text-xl text-stone-900 mb-2">{title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
                </div>
                <ul className="flex flex-col gap-1.5 mt-auto pt-4 border-t border-blue-50">
                  {detail.map((d) => (
                    <li key={d} className="flex items-center gap-2 text-sm text-stone-500">
                      <svg className="w-3.5 h-3.5 text-blue-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DELIVERY OPTIONS ══ */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24">
        <div className="text-center mb-14">
          <SectionLabel>Tùy chọn nhận đồ</SectionLabel>
          <h2 className="font-serif text-3xl md:text-4xl text-stone-900 mb-3">
            Chọn cách phù hợp với bạn
          </h2>
          <p className="text-stone-500 text-base max-w-md mx-auto">
            Giao nhận tận nơi hay tự ghé tiệm — cả hai đều được hỗ trợ nhiệt tình.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {deliveryOptions.map(({ title, badge, badgeColor, desc, perks, cta, ctaStyle }) => (
            <div key={title} className="bg-white border border-blue-100 rounded-2xl p-8 flex flex-col gap-5 hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-2xl text-stone-900">{title}</h3>
                <span className={`text-[11px] font-medium px-3 py-1 rounded-full ${badgeColor}`}>{badge}</span>
              </div>
              <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
              <ul className="flex flex-col gap-2.5">
                {perks.map(({ text }) => (
                  <li key={text} className="flex items-center gap-2.5 text-sm text-stone-600">
                    <svg className="w-4 h-4 text-blue-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {text}
                  </li>
                ))}
              </ul>
              <button className={`mt-auto w-full font-medium text-sm rounded-xl py-3.5 active:scale-[0.98] transition-all cursor-pointer ${ctaStyle}`}>
                {cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ══ TIMELINE THỜI GIAN ══ */}
      <section className="bg-gradient-to-r from-blue-500 to-cyan-400">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
          <div className="text-center mb-14">
            <SectionLabel light>Thời gian hoàn thành</SectionLabel>
            <h2 className="font-serif text-3xl md:text-4xl text-white">
              Bao lâu thì nhận được đồ?
            </h2>
          </div>
          <div className="max-w-2xl mx-auto flex flex-col gap-3">
            {[
              { service: "Là phẳng", duration: "2–4 giờ", bar: "w-1/4" },
              { service: "Giặt thường", duration: "4–6 giờ", bar: "w-2/5" },
              { service: "Giặt hấp", duration: "6–8 giờ", bar: "w-1/2" },
              { service: "Chăn màn", duration: "8–12 giờ", bar: "w-3/5" },
              { service: "Giặt khô", duration: "24 giờ", bar: "w-4/5" },
              { service: "Giặt đồ da", duration: "48 giờ", bar: "w-full" },
            ].map(({ service, duration, bar }) => (
              <div key={service} className="flex items-center gap-4">
                <span className="text-sm text-blue-100 w-28 shrink-0 text-right">{service}</span>
                <div className="flex-1 bg-white/20 rounded-full h-2">
                  <div className={`${bar} bg-white h-2 rounded-full`} />
                </div>
                <span className="text-sm font-medium text-white w-16 shrink-0">{duration}</span>
              </div>
            ))}
            <p className="text-xs text-blue-200 text-center mt-4">
              * Dịch vụ hỏa tốc rút ngắn 40–50% thời gian, phụ thu 30%
            </p>
          </div>
        </div>
      </section>

      

    </main>
  );
}