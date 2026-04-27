"use client";

import { GradientText } from "../components/ui/gradient-text";

const NAV_HEIGHT = 80;

const SHOP_DATA = {
  foundingYear: "2024",
  brandName: "BeGauShop",
  tagline: "Tiệm giặt của những người yêu sợi vải",
  story:
    "BeGauShop không bắt đầu từ những cỗ máy. Chúng mình bắt đầu từ ký ức về mùi nắng trên chiếc áo mới. Ra đời vào năm 2024, tiệm mang sứ mệnh hồi sinh sự mềm mại vốn có của từng sợi vải bằng sự tận tâm thủ công và những giải pháp làm sạch an lành nhất. Tại đây, chúng mình không chỉ giặt sạch, chúng mình gói ghém sự trân trọng vào từng nếp gấp.",
  values: [
    { label: "Tận Tâm", desc: "Chăm sóc thủ công" },
    { label: "An Lành", desc: "Hữu cơ 100%" },
    { label: "Tỉ Mỉ", desc: "Từng nếp gấp" },
  ],
  signature: "Từ Gấu với tất cả tình yêu",
  cta: "Khám phá quy trình",
};

export default function Overview() {
  return (
    <section
      id="overview"
      className=" bg-[#f9f7f2] text-sky-950"
      style={{ paddingTop: `${NAV_HEIGHT}px` }}
    >
      <div aria-hidden="true" className="" />

      <div
        className="mx-auto flex w-full max-w-5xl items-center justify-center px-4 pb-4 sm:px-6 sm:pb-6"
        style={{ minHeight: `calc(100svh - ${NAV_HEIGHT}px)` }}
      >
        <div className="w-full max-w-4xl rounded-3xl border border-sky-200/60 bg-white/58 px-4 py-4 text-center shadow-[0_20px_80px_rgba(59,130,246,0.18)]  sm:px-7 sm:py-6 lg:px-10 lg:py-7">
          <p className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 select-none font-serif text-[4.8rem] font-semibold tracking-tight text-sky-200/70 sm:text-[7.5rem] md:text-[10rem]">
            {SHOP_DATA.foundingYear}
          </p>

          <div className="mx-auto flex w-full max-w-xs items-center gap-2.5 text-[10px] uppercase tracking-[0.22em] text-sky-700 sm:max-w-sm sm:gap-3 sm:text-xs">
            <span className="h-px flex-1 bg-sky-300/80" />
            <span>Established in {SHOP_DATA.foundingYear}</span>
            <span className="h-px flex-1 bg-sky-300/80" />
          </div>

          <div className="mt-2.5 space-y-1 sm:mt-3 sm:space-y-1.5">
            <h2 className="font-serif text-3xl tracking-tight sm:text-5xl md:text-6xl">
              <GradientText>{SHOP_DATA.brandName}</GradientText>
            </h2>
            <p className="mx-auto max-w-xl text-xs leading-relaxed text-balance text-sky-800 sm:text-base">
              {SHOP_DATA.tagline}.
            </p>
          </div>

          <div className="mx-auto mt-3.5 w-full max-w-2xl rounded-2xl border border-sky-200/70 bg-white/72 px-4 py-3 text-left shadow-[0_10px_30px_rgba(59,130,246,0.11)] sm:mt-4 sm:px-6 sm:py-4">
            <p className="font-serif text-2xl leading-none text-cyan-500 sm:text-4xl">
              "
            </p>
            <p className="mt-1 text-xs leading-relaxed text-balance text-sky-900 sm:text-base">
              {SHOP_DATA.story}
            </p>
          </div>

          <div className="mx-auto mt-3.5 grid w-full max-w-2xl grid-cols-3 gap-2 sm:mt-4 sm:gap-3">
            {SHOP_DATA.values.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-sky-200/75 bg-white/72 px-2 py-2 text-center shadow-[0_6px_18px_rgba(59,130,246,0.1)] sm:px-3 sm:py-2.5"
              >
                <p className="text-xs font-semibold text-sky-900 sm:text-sm">
                  {item.label}
                </p>
                <p className="mt-0.5 text-[11px] text-sky-700 sm:text-xs">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3.5 space-y-2 sm:mt-4 sm:space-y-2.5">
            <p className="font-serif text-sm italic text-cyan-700 sm:text-lg">
              {SHOP_DATA.signature}.
            </p>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-sky-400/90 bg-white/70 px-4 py-2 text-[11px] font-medium text-sky-800 transition hover:bg-sky-50 sm:text-sm"
            >
              <span>{SHOP_DATA.cta}</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-current"
                aria-hidden="true"
              >
                <path
                  d="M5 12H19M19 12L13 6M19 12L13 18"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
