// export default function Gallery() {
//   return (
//     <section id="gallery" className="h-screen overflow-hidden px-4 bg-gradient-to-b from-slate-50 via-white to-blue-50 flex items-center">
//         <div className="grid grid-rows-2 grid-[100px_fr] ">
//             <h1>
//                 Đội ngũ của chúng tôi
//             </h1>
//         </div>
//     </section>
//   );
// }









"use client";

import React from "react";

/**
 * MÔ PHỎNG DỮ LIỆU TỪ BACKEND
 * Bạn có thể dễ dàng thay đổi nội dung/ảnh tại đây.
 */
const OPERATIONS_DATA = {
  sectionTitle: "Quy Trình & Con Người",
  sectionTagline: "Sự giao thoa giữa công nghệ hiện đại và tâm hồn người thợ.",
  facilities: {
    title: "Hệ thống vận hành",
    desc: "Máy móc chuẩn EU, dung dịch hữu cơ sạch lành.",
    images: [
      { url: "https://images.unsplash.com/photo-1626806819284-f76597824c32?q=80&w=800", label: "Máy sấy công nghiệp" },
      { url: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=800", label: "Khu vực chăm sóc lụa" },
      { url: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?q=80&w=800", label: "Giặt hấp cao cấp" }
    ]
  },
  team: {
    title: "Đội ngũ chuyên gia",
    desc: "Những đôi bàn tay nâng niu từng sợi vải.",
    members: [
      { name: "Chị Lan", role: "Chuyên gia Vải lụa", avatar: "https://i.pravatar.cc/150?u=lan", quote: "Vải lụa cần được vỗ về." },
      { name: "Anh Đức", role: "Kỹ thuật trưởng", avatar: "https://i.pravatar.cc/150?u=duc", quote: "Máy móc phải có tâm." },
      { name: "Bạn Mai", role: "Kiểm định QC", avatar: "https://i.pravatar.cc/150?u=mai", quote: "Sạch thôi là chưa đủ." }
    ]
  }
};

export default function Gallery() {
  const navHeight = "80px"; 

  return (
    <section
      id="gallery"
      className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 font-sans text-slate-900"
    >
      {/* 1. BACKGROUND DECORATION */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-blue-100/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-orange-100/30 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/cubes.png')` }} />
      </div>

      {/* 2. NAVBAR SPACER */}
      <div style={{ height: navHeight, minHeight: navHeight }} className="w-full shrink-0" />

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 pb-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-6 text-center lg:mb-10">
          <h2 className="font-serif text-3xl font-medium sm:text-4xl lg:text-5xl">
            {OPERATIONS_DATA.sectionTitle}
          </h2>
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-500 sm:text-sm">
            {OPERATIONS_DATA.sectionTagline}
          </p>
        </div>

        {/* Content Grid: Chia đôi màn hình cho Máy móc và Đội ngũ */}
        <div className="grid w-full max-w-6xl flex-1 gap-6 md:grid-cols-2 lg:gap-12 items-stretch overflow-hidden">
          
          {/* COLUMN LEFT: FACILITIES (Máy móc) */}
          <div className="flex flex-col justify-between rounded-[2.5rem] bg-white/50 p-6 shadow-sm border border-white/80 transition-all hover:shadow-md">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-slate-900 p-2">
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.628.285a2 2 0 01-1.963 0l-.628-.285a6 6 0 00-3.86-.517l-2.388.477a2 2 0 00-1.022.547V18a2 2 0 002 2h11a2 2 0 002-2v-2.572zM12 11V3m0 0l-3 3m3-3l3 3" /></svg>
                </div>
                <h3 className="font-serif text-xl font-semibold">{OPERATIONS_DATA.facilities.title}</h3>
              </div>
              <p className="mb-6 text-xs leading-relaxed text-slate-600 sm:text-sm">{OPERATIONS_DATA.facilities.desc}</p>
            </div>

            {/* Staggered Image Gallery */}
            <div className="grid h-full max-h-[300px] grid-cols-2 grid-rows-2 gap-3 lg:max-h-none">
              <div className="row-span-2 overflow-hidden rounded-2xl border border-black/5 shadow-inner">
                <img src={OPERATIONS_DATA.facilities.images[0].url} alt="Facility" className="h-full w-full object-cover transition-transform duration-700 hover:scale-110" />
              </div>
              <div className="overflow-hidden rounded-2xl border border-black/5 shadow-inner">
                <img src={OPERATIONS_DATA.facilities.images[1].url} alt="Facility" className="h-full w-full object-cover transition-transform duration-700 hover:scale-110" />
              </div>
              <div className="overflow-hidden rounded-2xl border border-black/5 shadow-inner">
                <img src={OPERATIONS_DATA.facilities.images[2].url} alt="Facility" className="h-full w-full object-cover transition-transform duration-700 hover:scale-110" />
              </div>
            </div>
          </div>

          {/* COLUMN RIGHT: TEAM (Đội ngũ) */}
          <div className="flex flex-col justify-between rounded-[2.5rem] bg-slate-900 p-6 shadow-xl lg:p-8">
            <div className="text-white">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-white/10 p-2 backdrop-blur-md">
                  <svg className="h-4 w-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <h3 className="font-serif text-xl font-semibold text-white">{OPERATIONS_DATA.team.title}</h3>
              </div>
              <p className="mb-8 text-xs leading-relaxed text-slate-400 sm:text-sm">{OPERATIONS_DATA.team.desc}</p>
            </div>

            {/* Team Members List */}
            <div className="space-y-4">
              {OPERATIONS_DATA.team.members.map((member, idx) => (
                <div key={idx} className="group flex items-center gap-4 rounded-2xl bg-white/5 p-3 transition-colors hover:bg-white/10">
                  <img src={member.avatar} alt={member.name} className="h-12 w-12 rounded-xl object-cover grayscale transition-all group-hover:grayscale-0 sm:h-14 sm:w-14" />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between">
                      <h4 className="text-sm font-bold text-white sm:text-base">{member.name}</h4>
                      <span className="text-[10px] font-medium text-blue-300 sm:text-xs">{member.role}</span>
                    </div>
                    <p className="mt-1 text-[11px] italic text-slate-400 sm:text-xs">"{member.quote}"</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Tag */}
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-6 w-6 rounded-full border-2 border-slate-900 bg-slate-800 text-[8px] flex items-center justify-center text-white">+</div>
                ))}
              </div>
              <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Quality First</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}