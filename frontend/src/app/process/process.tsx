import React from "react";
import { GradientText } from "@/src/components/ui/gradient-text";

const trackingStates = [
  { label: "Đã nhận đồ", done: true },
  { label: "Đang xử lý", done: true },
  { label: "Đang giặt", done: true, active: true },
  { label: "Đang sấy", done: false },
  { label: "Sẵn sàng giao", done: false },
  { label: "Đã giao", done: false },
];

export default function Process() {
  return (
    <section
      id="process"
      className="min-h-screen flex items-center justify-center border-b border-[var(--color-divider)] bg-[#faf9f7] max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-20 grid lg:grid-cols-2 gap-16 items-center"
    >
      <div>
        {/* ===== MOBILE (< md) ===== */}
        <div className="block md:hidden px-2">
          <h1 className="font-serif text-4xl text-stone-900 leading-tight mb-4">
            Từ lúc đặt lịch
            <br />
            <GradientText className="italic">
              đến khi nhận đồ —
            </GradientText>
            <br />
            bạn chỉ cần chờ
          </h1>

          <p className="text-sm text-stone-500 leading-relaxed mb-6">
            Toàn bộ quy trình được thiết kế để bạn không phải lo bất cứ điều gì.
            Đặt lịch một lần, còn lại để Bé Gấu lo.
          </p>

          <div className="flex gap-3">
            <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-[13px] rounded-xl px-[1px] py-3">
              Đặt lịch ngay →
            </button>

            <button className="w-full border border-blue-200 text-blue-600 text-[13px] rounded-xl px-[1px] py-3">
              Gọi 0123 456 789
            </button>
          </div>
        </div>

        {/* ===== TABLET (md → < lg) ===== */}
        <div className="hidden md:block lg:hidden px-4 ">
          <h1 className="font-serif text-6xl text-stone-900 leading-tight mb-5">
            Từ lúc đặt lịch
            <br />
            <GradientText className="italic ">
              đến khi nhận đồ —
            </GradientText>
            <br />
            bạn chỉ cần chờ
          </h1>

          <p className="text-3xl text-stone-500 leading-relaxed mb-7">
            Toàn bộ quy trình được thiết kế để bạn không phải lo bất cứ điều gì.
            Đặt lịch một lần, còn lại để Bé Gấu lo.
          </p>

          <div className="flex gap-4 ">
            <button className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-xl rounded-xl px-5 py-5">
              Đặt lịch ngay →
            </button>

            <button className="border border-blue-200 text-blue-600 text-xl rounded-xl px-5 py-5">
              Gọi 0123 456 789
            </button>
          </div>
        </div>

        {/* ===== DESKTOP (lg+) ===== */}
        <div className="hidden lg:block">
          <h1 className="font-serif text-5xl text-stone-900 leading-tight mb-6">
            Từ lúc đặt lịch
            <br />
            <GradientText className="italic">
              đến khi nhận đồ —
            </GradientText>
            <br />
            bạn chỉ cần chờ
          </h1>

          <p className="text-base text-stone-500 leading-relaxed max-w-lg mb-8">
            Toàn bộ quy trình được thiết kế để bạn không phải lo bất cứ điều gì.
            Đặt lịch một lần, còn lại để Bé Gấu lo.
          </p>

          <div className="flex gap-5 justify-center md:justify-start">
            <button className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium text-sm rounded-xl px-5 py-3.5 hover:opacity-90 active:scale-[0.98] transition-all">
              Đặt lịch ngay →
            </button>

            <button className="border border-blue-200 text-blue-600 font-medium text-sm rounded-xl px-5 py-3.5 hover:border-blue-400 hover:bg-blue-50 active:scale-[0.98] transition-all">
              Gọi 0123 456 789
            </button>
          </div>
        </div>
      </div>

      {/* Tracking preview card */}

      <>
  {/* ================= MOBILE ================= */}
  <div className="block md:hidden">
    <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[11px] text-blue-400 uppercase tracking-wide mb-1">
            Đơn #BG-20241
          </p>
          <p className="font-medium text-stone-900">
            Giặt thường · 3.2 kg
          </p>
        </div>
        <span className="text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1 rounded-full">
          Đang xử lý
        </span>
      </div>

      <div className="flex items-center gap-0 mb-6">
        {trackingStates.map(({ done, active }, i) => (
          <React.Fragment key={i}>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-medium transition-all
              ${
                done && !active
                  ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white"
                  : active
                  ? "bg-amber-400 text-white ring-4 ring-amber-100"
                  : "bg-blue-50 text-blue-300"
              }`}
            >
              {done && !active ? (
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                i + 1
              )}
            </div>

            {i < trackingStates.length - 1 && (
              <div
                className={`flex-1 h-0.5 ${
                  i < trackingStates.findIndex((s) => s.active)
                    ? "bg-gradient-to-r from-blue-500 to-cyan-400"
                    : "bg-blue-50"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {trackingStates.map(({ label, done, active }) => (
          <p
            key={label}
            className={`text-[11px] text-center leading-snug
            ${
              active
                ? "text-amber-600 font-medium"
                : done
                ? "text-blue-400"
                : "text-stone-300"
            }`}
          >
            {label}
          </p>
        ))}
      </div>

      <div className="border-t border-blue-50 mt-5 pt-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-stone-500">
          <svg
            className="w-4 h-4 text-blue-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Dự kiến giao:
          <span className="font-medium text-stone-800 ml-1">
            17:00 hôm nay
          </span>
        </div>
      </div>
    </div>
  </div>

  {/* ================= TABLET ================= */}
  <div className="hidden md:block lg:hidden">
    <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[11px] text-blue-400 uppercase tracking-wide mb-1">
            Đơn #BG-20241
          </p>
          <p className="font-medium text-stone-900">
            Giặt thường · 3.2 kg
          </p>
        </div>
        <span className="text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1 rounded-full">
          Đang xử lý
        </span>
      </div>

      <div className="flex items-center gap-0 mb-6">
        {trackingStates.map(({ done, active }, i) => (
          <React.Fragment key={i}>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-medium transition-all
              ${
                done && !active
                  ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white"
                  : active
                  ? "bg-amber-400 text-white ring-4 ring-amber-100"
                  : "bg-blue-50 text-blue-300"
              }`}
            >
              {done && !active ? (
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                i + 1
              )}
            </div>

            {i < trackingStates.length - 1 && (
              <div
                className={`flex-1 h-0.5 ${
                  i < trackingStates.findIndex((s) => s.active)
                    ? "bg-gradient-to-r from-blue-500 to-cyan-400"
                    : "bg-blue-50"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {trackingStates.map(({ label, done, active }) => (
          <p
            key={label}
            className={`text-[11px] text-center leading-snug
            ${
              active
                ? "text-amber-600 font-medium"
                : done
                ? "text-blue-400"
                : "text-stone-300"
            }`}
          >
            {label}
          </p>
        ))}
      </div>

      <div className="border-t border-blue-50 mt-5 pt-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-stone-500">
          <svg
            className="w-4 h-4 text-blue-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Dự kiến giao:
          <span className="font-medium text-stone-800 ml-1">
            17:00 hôm nay
          </span>
        </div>
      </div>
    </div>
  </div>

  {/* ================= DESKTOP ================= */}
  <div className="hidden lg:block">
    <div className="border border-blue-100 rounded-2xl shadow-sm overflow-hidden">
      <table className="w-full">
        <tbody>
          <tr>
            <td className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[11px] text-blue-400 uppercase tracking-wide mb-1">
                    Đơn #BG-20241
                  </p>
                  <p className="font-medium text-stone-900">
                    Giặt thường · 3.2 kg
                  </p>
                </div>
                <span className="text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1 rounded-full">
                  Đang xử lý
                </span>
              </div>

              <div className="flex items-center gap-0 mb-6">
                {trackingStates.map(({ done, active }, i) => (
                  <React.Fragment key={i}>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-medium transition-all
                      ${
                        done && !active
                          ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white"
                          : active
                          ? "bg-amber-400 text-white ring-4 ring-amber-100"
                          : "bg-blue-50 text-blue-300"
                      }`}
                    >
                      {done && !active ? (
                        <svg
                          className="w-3.5 h-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>

                    {i < trackingStates.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 ${
                          i < trackingStates.findIndex((s) => s.active)
                            ? "bg-gradient-to-r from-blue-500 to-cyan-400"
                            : "bg-blue-50"
                        }`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {trackingStates.map(({ label, done, active }) => (
                  <p
                    key={label}
                    className={`text-[11px] text-center leading-snug
                    ${
                      active
                        ? "text-amber-600 font-medium"
                        : done
                        ? "text-blue-400"
                        : "text-stone-300"
                    }`}
                  >
                    {label}
                  </p>
                ))}
              </div>

              <div className="border-t border-blue-50 mt-5 pt-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-stone-500">
                  <svg
                    className="w-4 h-4 text-blue-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Dự kiến giao:
                  <span className="font-medium text-stone-800 ml-1">
                    17:00 hôm nay
                  </span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</>
    </section>
  );
}
