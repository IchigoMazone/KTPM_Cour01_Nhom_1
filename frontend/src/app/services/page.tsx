// import React from "react";

// /* ─────────────────────────── DATA ─────────────────────────── */

// const services = [
//   {
//     id: "giat-thuong",
//     tag: "Phổ biến nhất",
//     tagColor: "bg-sky-100 text-sky-700",
//     title: "Giặt thường",
//     desc: "Phù hợp với quần áo hàng ngày, đồ thể thao, đồ công sở. Giặt sạch hoàn toàn bằng máy công nghiệp, sấy khô và gấp gọn gàng trước khi giao.",
//     price: "25.000đ / kg",
//     time: "4–6 giờ",
//     icon: (
//       <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
//         <path d="M3 3h18v4H3z" /><path d="M3 7v14h18V7" /><circle cx="12" cy="14" r="4" /><path d="M12 10v4l2 2" />
//       </svg>
//     ),
//     highlights: ["Quần áo cotton, polyester", "Đồ thể thao, đồ lót", "Khăn mặt, khăn tắm", "Sấy khô & gấp gọn"],
//   },
//   {
//     id: "giat-kho",
//     tag: "Cao cấp",
//     tagColor: "bg-amber-100 text-amber-700",
//     title: "Giặt khô",
//     desc: "Dành cho trang phục cao cấp, vest, áo dài, len, cashmere. Quy trình giặt khô chuyên nghiệp giữ nguyên form dáng và màu sắc vải.",
//     price: "80.000đ / món",
//     time: "24 giờ",
//     icon: (
//       <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
//         <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
//       </svg>
//     ),
//     highlights: ["Vest, blazer, áo dài", "Len, cashmere, lụa", "Đầm dạ hội, áo cưới", "Giữ form & màu sắc"],
//   },
//   {
//     id: "giat-hap",
//     tag: "Khử khuẩn",
//     tagColor: "bg-emerald-100 text-emerald-700",
//     title: "Giặt hấp",
//     desc: "Công nghệ hơi nước nhiệt độ cao diệt khuẩn 99,9%, khử mùi triệt để. Lý tưởng cho đồ sơ sinh, đồ dị ứng, hoặc sau mùa dịch.",
//     price: "45.000đ / kg",
//     time: "6–8 giờ",
//     icon: (
//       <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
//         <path d="M8 3v3m4-3v3m4-3v3M8 18v3m4-3v3m4-3v3M3 9h18M3 15h18" />
//       </svg>
//     ),
//     highlights: ["Đồ sơ sinh, trẻ em", "Đồ dị ứng, nhạy cảm", "Diệt khuẩn 99,9%", "Khử mùi hoàn toàn"],
//   },
//   {
//     id: "giat-do-da",
//     tag: "Chuyên biệt",
//     tagColor: "bg-rose-100 text-rose-700",
//     title: "Giặt đồ da",
//     desc: "Chuyên xử lý túi xách, giày da, áo da với dung dịch làm sạch chuyên dụng. Dưỡng da sau giặt, giữ độ bóng và mềm mại tự nhiên.",
//     price: "Từ 120.000đ / món",
//     time: "48 giờ",
//     icon: (
//       <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
//         <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
//       </svg>
//     ),
//     highlights: ["Túi xách da, ví da", "Giày da, boot da", "Áo da, jacket", "Dưỡng da sau giặt"],
//   },
//   {
//     id: "giat-chan-man",
//     tag: "Gia đình",
//     tagColor: "bg-violet-100 text-violet-700",
//     title: "Giặt chăn màn",
//     desc: "Xử lý chăn bông, gối, nệm, rèm cửa khổ lớn với máy giặt công suất 20kg. Sấy hoàn toàn khô, không còn mùi ẩm mốc.",
//     price: "60.000đ / kg",
//     time: "8–12 giờ",
//     icon: (
//       <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
//         <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /><line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" />
//       </svg>
//     ),
//     highlights: ["Chăn bông, chăn lông vũ", "Gối, nệm topper", "Rèm cửa khổ lớn", "Sấy hoàn toàn khô"],
//   },
//   {
//     id: "la-phang",
//     tag: "Tiện ích",
//     tagColor: "bg-stone-100 text-stone-600",
//     title: "Là phẳng",
//     desc: "Dịch vụ là (ủi) riêng cho quần áo đã giặt khô. Sử dụng bàn là hơi nước chuyên nghiệp, xử lý nếp nhăn sâu, cổ áo thẳng đẹp.",
//     price: "15.000đ / món",
//     time: "2–4 giờ",
//     icon: (
//       <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
//         <path d="M3 17l4-8h14l-4 8H3z" /><path d="M7 17v2" /><path d="M17 17v2" /><path d="M5 9V7a2 2 0 012-2h10a2 2 0 012 2v2" />
//       </svg>
//     ),
//     highlights: ["Sơ mi, áo công sở", "Quần tây, chân váy", "Đồng phục học sinh", "Là hơi nước chuyên nghiệp"],
//   },
// ];

// const process = [
//   { step: "01", title: "Đặt lịch", desc: "Gọi điện, nhắn Zalo hoặc đặt online — chúng tôi xác nhận ngay trong 5 phút." },
//   { step: "02", title: "Giao nhận", desc: "Nhân viên đến đúng giờ, cân đồ và lập phiếu chi tiết tại chỗ." },
//   { step: "03", title: "Xử lý & kiểm tra", desc: "Phân loại, xử lý vết bẩn, giặt theo đúng quy trình từng loại vải." },
//   { step: "04", title: "Hoàn trả", desc: "Đồ sạch sẽ, thơm tho, gói gọn gàng — giao tận tay đúng hẹn." },
// ];

// const faqs = [
//   {
//     q: "Tiệm có nhận đồ hiệu, đồ nhập khẩu không?",
//     a: "Có. Chúng tôi có quy trình riêng cho đồ cao cấp với dung dịch giặt chuyên biệt và kiểm tra kỹ từng món trước & sau giặt.",
//   },
//   {
//     q: "Nếu đồ bị hỏng, tiệm có đền bù không?",
//     a: "Có chính sách đền bù rõ ràng tối đa 10 lần giá dịch vụ. Mọi đơn hàng đều được chụp ảnh xác nhận trước khi nhận.",
//   },
//   {
//     q: "Khu vực giao nhận miễn phí?",
//     a: "Miễn phí giao nhận trong bán kính 3km từ Hoàn Kiếm. Ngoài khu vực này phụ thu 10.000đ/km.",
//   },
//   {
//     q: "Có thể giặt gấp trong ngày không?",
//     a: "Có dịch vụ hỏa tốc 3–4 giờ với phụ thu 30%. Vui lòng liên hệ trước để đặt slot.",
//   },
// ];

// /* ─────────────────────── COMPONENTS ───────────────────────── */

// function SectionLabel({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="inline-flex items-center gap-2 mb-4">
//       <span className="w-5 h-px bg-stone-400" />
//       <span className="text-[11px] font-medium tracking-[1.6px] uppercase text-stone-400">
//         {children}
//       </span>
//     </div>
//   );
// }

// /* ─────────────────────────── PAGE ─────────────────────────── */

// export default function DichVuPage() {
//   return (
//     <main className="bg-[#faf9f7] text-stone-700 font-sans">

//       {/* ══ HERO ══ */}
//       <section className="max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-16 text-center">
//         <SectionLabel>Dịch vụ của chúng tôi</SectionLabel>
//         <h1 className="font-serif text-4xl md:text-6xl text-stone-900 leading-tight mb-5">
//           Mỗi loại vải —<br />
//           <span className="italic text-stone-400">một quy trình riêng</span>
//         </h1>
//         <p className="text-base text-stone-500 leading-relaxed max-w-xl mx-auto mb-10">
//           Bé Gấu không giặt theo kiểu "cho tất cả vào một máy". Từng loại đồ được
//           phân loại và xử lý đúng quy trình để đảm bảo sạch sẽ và bền vải nhất.
//         </p>
//       </section>

//       {/* ══ SERVICES GRID ══ */}
//       <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
//           {services.map(({ id, tag, tagColor, title, desc, price, time, icon, highlights }) => (
//             <div
//               key={id}
//               className="bg-white border border-stone-100 rounded-2xl p-7 flex flex-col gap-5 hover:border-stone-300 hover:shadow-sm transition-all group"
//             >
//               {/* Header */}
//               <div className="flex items-start justify-between">
//                 <div className="w-11 h-11 bg-stone-50 rounded-xl flex items-center justify-center text-stone-600 group-hover:bg-stone-100 transition-colors">
//                   {icon}
//                 </div>
//                 <span className={`text-[11px] font-medium tracking-wide px-2.5 py-1 rounded-full ${tagColor}`}>
//                   {tag}
//                 </span>
//               </div>

//               {/* Title & desc */}
//               <div>
//                 <h2 className="font-serif text-xl text-stone-900 mb-2">{title}</h2>
//                 <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
//               </div>

//               {/* Highlights */}
//               <ul className="flex flex-col gap-1.5">
//                 {highlights.map((h) => (
//                   <li key={h} className="flex items-center gap-2 text-sm text-stone-500">
//                     <span className="w-1.5 h-1.5 rounded-full bg-stone-300 shrink-0" />
//                     {h}
//                   </li>
//                 ))}
//               </ul>

//               {/* Footer */}
//               <div className="border-t border-stone-100 pt-4 flex items-center justify-between mt-auto">
//                 <div>
//                   <p className="text-[11px] text-stone-400 uppercase tracking-wide mb-0.5">Giá từ</p>
//                   <p className="font-medium text-stone-900 text-sm">{price}</p>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-[11px] text-stone-400 uppercase tracking-wide mb-0.5">Thời gian</p>
//                   <p className="font-medium text-stone-900 text-sm">{time}</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* ══ QUY TRÌNH ══ */}
//       <section className="bg-stone-900">
//         <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
//           <div className="text-center mb-14">
//             <div className="inline-flex items-center gap-2 mb-4">
//               <span className="w-5 h-px bg-stone-600" />
//               <span className="text-[11px] font-medium tracking-[1.6px] uppercase text-stone-500">Quy trình</span>
//             </div>
//             <h2 className="font-serif text-3xl md:text-4xl text-stone-100">
//               Đơn giản từ đầu đến cuối
//             </h2>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//             {process.map(({ step, title, desc }, i) => (
//               <div key={step} className="relative">
//                 {/* Connector line */}
//                 {i < process.length - 1 && (
//                   <div className="hidden md:block absolute top-5 left-[calc(50%+24px)] right-[-calc(50%-24px)] h-px bg-stone-700" />
//                 )}
//                 <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
//                   <div className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center text-stone-400 text-xs font-medium shrink-0">
//                     {step}
//                   </div>
//                   <div>
//                     <h3 className="font-medium text-stone-200 mb-1.5">{title}</h3>
//                     <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ══ GIÁ NIÊM YẾT ══ */}
//       <section className="max-w-7xl mx-auto px-6 md:px-12 py-24">
//         <div className="grid lg:grid-cols-[1fr_2fr] gap-16 items-start">
//           <div>
//             <SectionLabel>Bảng giá</SectionLabel>
//             <h2 className="font-serif text-3xl md:text-4xl text-stone-900 leading-tight mb-4">
//               Giá rõ ràng,<br />
//               <span className="italic text-stone-400">không phát sinh</span>
//             </h2>
//             <p className="text-sm text-stone-500 leading-relaxed">
//               Giá được tính theo kg hoặc theo món tùy dịch vụ. Cân đồ minh bạch tại chỗ,
//               khách hàng xác nhận trước khi nhận.
//             </p>
//           </div>
//           <div className="overflow-hidden rounded-2xl border border-stone-100">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="bg-stone-50 border-b border-stone-100">
//                   <th className="text-left px-6 py-4 font-medium text-stone-600 text-[11px] uppercase tracking-wide">Dịch vụ</th>
//                   <th className="text-left px-6 py-4 font-medium text-stone-600 text-[11px] uppercase tracking-wide">Đơn giá</th>
//                   <th className="text-left px-6 py-4 font-medium text-stone-600 text-[11px] uppercase tracking-wide">Thời gian</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-stone-50">
//                 {services.map(({ id, title, price, time, tagColor, tag }) => (
//                   <tr key={id} className="hover:bg-stone-50 transition-colors">
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-3">
//                         <span className="font-medium text-stone-800">{title}</span>
//                         <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full hidden sm:inline ${tagColor}`}>{tag}</span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 text-stone-700 font-medium">{price}</td>
//                     <td className="px-6 py-4 text-stone-400">{time}</td>
//                   </tr>
//                 ))}
//                 <tr className="bg-stone-50">
//                   <td className="px-6 py-4 text-stone-500 text-xs" colSpan={3}>
//                     * Dịch vụ hỏa tốc (3–4h) phụ thu 30% · Giao nhận miễn phí trong 3km
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
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

const services = [
  {
    id: "giat-thuong",
    tag: "Phổ biến nhất",
    tagColor: "bg-blue-100 text-blue-700",
    title: "Giặt thường",
    desc: "Phù hợp với quần áo hàng ngày, đồ thể thao, đồ công sở. Giặt sạch hoàn toàn bằng máy công nghiệp, sấy khô và gấp gọn gàng trước khi giao.",
    price: "25.000đ / kg",
    time: "4–6 giờ",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <path d="M3 3h18v4H3z" /><path d="M3 7v14h18V7" /><circle cx="12" cy="14" r="4" /><path d="M12 10v4l2 2" />
      </svg>
    ),
    highlights: ["Quần áo cotton, polyester", "Đồ thể thao, đồ lót", "Khăn mặt, khăn tắm", "Sấy khô & gấp gọn"],
  },
  {
    id: "giat-kho",
    tag: "Cao cấp",
    tagColor: "bg-amber-100 text-amber-700",
    title: "Giặt khô",
    desc: "Dành cho trang phục cao cấp, vest, áo dài, len, cashmere. Quy trình giặt khô chuyên nghiệp giữ nguyên form dáng và màu sắc vải.",
    price: "80.000đ / món",
    time: "24 giờ",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
      </svg>
    ),
    highlights: ["Vest, blazer, áo dài", "Len, cashmere, lụa", "Đầm dạ hội, áo cưới", "Giữ form & màu sắc"],
  },
  {
    id: "giat-hap",
    tag: "Khử khuẩn",
    tagColor: "bg-emerald-100 text-emerald-700",
    title: "Giặt hấp",
    desc: "Công nghệ hơi nước nhiệt độ cao diệt khuẩn 99,9%, khử mùi triệt để. Lý tưởng cho đồ sơ sinh, đồ dị ứng, hoặc sau mùa dịch.",
    price: "45.000đ / kg",
    time: "6–8 giờ",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <path d="M8 3v3m4-3v3m4-3v3M8 18v3m4-3v3m4-3v3M3 9h18M3 15h18" />
      </svg>
    ),
    highlights: ["Đồ sơ sinh, trẻ em", "Đồ dị ứng, nhạy cảm", "Diệt khuẩn 99,9%", "Khử mùi hoàn toàn"],
  },
  {
    id: "giat-do-da",
    tag: "Chuyên biệt",
    tagColor: "bg-rose-100 text-rose-700",
    title: "Giặt đồ da",
    desc: "Chuyên xử lý túi xách, giày da, áo da với dung dịch làm sạch chuyên dụng. Dưỡng da sau giặt, giữ độ bóng và mềm mại tự nhiên.",
    price: "Từ 120.000đ / món",
    time: "48 giờ",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      </svg>
    ),
    highlights: ["Túi xách da, ví da", "Giày da, boot da", "Áo da, jacket", "Dưỡng da sau giặt"],
  },
  {
    id: "giat-chan-man",
    tag: "Gia đình",
    tagColor: "bg-violet-100 text-violet-700",
    title: "Giặt chăn màn",
    desc: "Xử lý chăn bông, gối, nệm, rèm cửa khổ lớn với máy giặt công suất 20kg. Sấy hoàn toàn khô, không còn mùi ẩm mốc.",
    price: "60.000đ / kg",
    time: "8–12 giờ",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /><line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
    highlights: ["Chăn bông, chăn lông vũ", "Gối, nệm topper", "Rèm cửa khổ lớn", "Sấy hoàn toàn khô"],
  },
  {
    id: "la-phang",
    tag: "Tiện ích",
    tagColor: "bg-cyan-100 text-cyan-700",
    title: "Là phẳng",
    desc: "Dịch vụ là (ủi) riêng cho quần áo đã giặt khô. Sử dụng bàn là hơi nước chuyên nghiệp, xử lý nếp nhăn sâu, cổ áo thẳng đẹp.",
    price: "15.000đ / món",
    time: "2–4 giờ",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <path d="M3 17l4-8h14l-4 8H3z" /><path d="M7 17v2" /><path d="M17 17v2" /><path d="M5 9V7a2 2 0 012-2h10a2 2 0 012 2v2" />
      </svg>
    ),
    highlights: ["Sơ mi, áo công sở", "Quần tây, chân váy", "Đồng phục học sinh", "Là hơi nước chuyên nghiệp"],
  },
];

const process = [
  { step: "01", title: "Đặt lịch", desc: "Gọi điện, nhắn Zalo hoặc đặt online — chúng tôi xác nhận ngay trong 5 phút." },
  { step: "02", title: "Giao nhận", desc: "Nhân viên đến đúng giờ, cân đồ và lập phiếu chi tiết tại chỗ." },
  { step: "03", title: "Xử lý & kiểm tra", desc: "Phân loại, xử lý vết bẩn, giặt theo đúng quy trình từng loại vải." },
  { step: "04", title: "Hoàn trả", desc: "Đồ sạch sẽ, thơm tho, gói gọn gàng — giao tận tay đúng hẹn." },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 mb-4">
      <span className="w-5 h-px bg-blue-300" />
      <span className="text-[11px] font-medium tracking-[1.6px] uppercase text-blue-500">
        {children}
      </span>
    </div>
  );
}

/* ─────────────────────────── PAGE ─────────────────────────── */

export default function DichVuPage() {
  return (
    <main className="bg-[#faf9f7] text-stone-700 font-sans">

      {/* ══ HERO ══ */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-16 text-center">
        <SectionLabel>Dịch vụ của chúng tôi</SectionLabel>
        <h1 className="font-serif text-4xl md:text-6xl text-stone-900 leading-tight mb-5">
          Mỗi loại vải —<br />
          <span className="italic bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
            một quy trình riêng
          </span>
        </h1>
        <p className="text-base text-stone-500 leading-relaxed max-w-xl mx-auto mb-10">
          Bé Gấu không giặt theo kiểu "cho tất cả vào một máy". Từng loại đồ được
          phân loại và xử lý đúng quy trình để đảm bảo sạch sẽ và bền vải nhất.
        </p>
      </section>

      {/* ══ SERVICES GRID ══ */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map(({ id, tag, tagColor, title, desc, price, time, icon, highlights }) => (
            <div
              key={id}
              className="bg-white border border-stone-100 rounded-2xl p-7 flex flex-col gap-5 hover:border-blue-200 hover:shadow-sm transition-all group"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-100 transition-colors">
                  {icon}
                </div>
                <span className={`text-[11px] font-medium tracking-wide px-2.5 py-1 rounded-full ${tagColor}`}>
                  {tag}
                </span>
              </div>

              {/* Title & desc */}
              <div>
                <h2 className="font-serif text-xl text-stone-900 mb-2">{title}</h2>
                <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
              </div>

              {/* Highlights */}
              <ul className="flex flex-col gap-1.5">
                {highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-sm text-stone-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>

              {/* Footer */}
              <div className="border-t border-stone-100 pt-4 flex items-center justify-between mt-auto">
                <div>
                  <p className="text-[11px] text-stone-400 uppercase tracking-wide mb-0.5">Giá từ</p>
                  <p className="font-medium text-stone-900 text-sm">{price}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-stone-400 uppercase tracking-wide mb-0.5">Thời gian</p>
                  <p className="font-medium text-stone-900 text-sm">{time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ QUY TRÌNH ══ */}
      <section className="bg-gradient-to-r from-blue-500 to-cyan-400">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-5 h-px bg-blue-300" />
              <span className="text-[11px] font-medium tracking-[1.6px] uppercase text-blue-100">Quy trình</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-white">
              Đơn giản từ đầu đến cuối
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {process.map(({ step, title, desc }, i) => (
              <div key={step} className="relative">
                {i < process.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-[calc(50%+24px)] right-[-calc(50%-24px)] h-px bg-white/30" />
                )}
                <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
                  <div className="w-10 h-10 rounded-full border border-white/40 bg-white/10 flex items-center justify-center text-white text-xs font-medium shrink-0">
                    {step}
                  </div>
                  <div>
                    <h3 className="font-medium text-white mb-1.5">{title}</h3>
                    <p className="text-sm text-blue-100 leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ GIÁ NIÊM YẾT ══ */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-16 items-start">
          <div>
            <SectionLabel>Bảng giá</SectionLabel>
            <h2 className="font-serif text-3xl md:text-4xl text-stone-900 leading-tight mb-4">
              Giá rõ ràng,<br />
              <span className="italic bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                không phát sinh
              </span>
            </h2>
            <p className="text-sm text-stone-500 leading-relaxed">
              Giá được tính theo kg hoặc theo món tùy dịch vụ. Cân đồ minh bạch tại chỗ,
              khách hàng xác nhận trước khi nhận.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-stone-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-50 border-b border-blue-100">
                  <th className="text-left px-6 py-4 font-medium text-blue-600 text-[11px] uppercase tracking-wide">Dịch vụ</th>
                  <th className="text-left px-6 py-4 font-medium text-blue-600 text-[11px] uppercase tracking-wide">Đơn giá</th>
                  <th className="text-left px-6 py-4 font-medium text-blue-600 text-[11px] uppercase tracking-wide">Thời gian</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-stone-50">
                {services.map(({ id, title, price, time, tagColor, tag }) => (
                  <tr key={id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-stone-800">{title}</span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full hidden sm:inline ${tagColor}`}>{tag}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-stone-700 font-medium">{price}</td>
                    <td className="px-6 py-4 text-stone-400">{time}</td>
                  </tr>
                ))}
                <tr className="bg-blue-50/60">
                  <td className="px-6 py-4 text-stone-500 text-xs" colSpan={3}>
                    * Dịch vụ hỏa tốc (3–4h) phụ thu 30% · Giao nhận miễn phí trong 3km
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      

    </main>
  );
}