import React from "react";

const steps = [
  {
    id: "01",
    title: "Đặt lịch",
    time: "~2 phút",
    desc: "Gọi điện, nhắn Zalo hoặc đặt online. Chúng tôi xác nhận lịch trong vòng 5 phút và gửi thông tin nhân viên phụ trách.",
    detail: ["Gọi 0123 456 789", "Nhắn Zalo cùng số", "Đặt qua website 24/7"],
  },
  {
    id: "02",
    title: "Lấy đồ tại nhà",
    time: "15–30 phút",
    desc: "Nhân viên đến đúng giờ, cân đồ minh bạch và lập phiếu chi tiết từng món. Bạn xác nhận trước khi chúng tôi mang đi.",
    detail: ["Cân đồ tại chỗ", "Chụp ảnh xác nhận", "Lập phiếu chi tiết"],
  },
  {
    id: "03",
    title: "Phân loại & xử lý",
    time: "1–2 giờ",
    desc: "Đồ được phân loại theo chất liệu và màu sắc. Vết bẩn cứng đầu được xử lý thủ công trước khi đưa vào máy giặt công nghiệp.",
    detail: [
      "Phân loại vải kỹ lưỡng",
      "Tẩy vết bẩn thủ công",
      "Chọn chương trình giặt phù hợp",
    ],
  },
  {
    id: "04",
    title: "Giặt & sấy",
    time: "2–6 giờ",
    desc: "Giặt bằng máy công nghiệp nhập khẩu châu Âu với hóa chất sinh học an toàn. Sấy khô hoàn toàn, không ẩm mốc.",
    detail: ["Máy giặt 15–20kg", "Hóa chất sinh học", "Sấy khô 100%"],
  },
  {
    id: "05",
    title: "Kiểm tra & gấp",
    time: "30–60 phút",
    desc: "Từng món được kiểm tra lại — đảm bảo sạch, không mất, không nhầm lẫn. Gấp gọn gàng, bọc túi riêng từng loại.",
    detail: ["Kiểm tra từng món", "Gấp theo tiêu chuẩn", "Bọc túi bảo vệ"],
  },
  {
    id: "06",
    title: "Giao trả tận nơi",
    time: "Đúng hẹn",
    desc: "Nhân viên giao đồ đúng giờ đã hẹn. Bạn kiểm tra tại chỗ và thanh toán khi hài lòng — không thu trước.",
    detail: ["Giao đúng giờ hẹn", "Kiểm tra tại chỗ", "Thanh toán khi nhận"],
  },
];


export default function StepProcess() {
  return (
    <section id="stepprocess" className="min-h-screen flex items-center justify-center border-b border-[var(--color-divider)] bg-gradient-to-br from-blue-50 to-cyan-50 border-y border-blue-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
        {/* ================= HEADER ================= */}
        <div className="text-center mb-16">
  
          <h2 className="font-serif text-3xl md:text-5xl lg:text-4xl text-stone-900">
            Quy trình 6 bước đặt lịch
          </h2>
        </div>

        {/* ================= MOBILE ================= */}
        <div className="grid grid-cols-1 gap-5 md:hidden">
          {steps.map(({ id, title, time, desc, detail }) => (
            <div
              key={id}
              className="bg-white border border-blue-100 rounded-2xl p-6 flex flex-col gap-4 hover:border-blue-200 hover:shadow-sm transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[16px] font-medium text-blue-300">
                    Bước {id}
                    <h3 className="font-serif text-xl text-stone-900 mb-2">
                      {title}
                    </h3>
                  </span>

                  <div className="text-right">
                    <span className="text-[11px] text-stone-400 uppercase tracking-wide block">
                      Thời gian
                    </span>
                    <span className="text-sm font-medium text-stone-700">
                      {time}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
              </div>

              <ul className="flex flex-col gap-1.5 mt-auto pt-4 border-t border-blue-50">
                {detail.map((d) => (
                  <li
                    key={d}
                    className="flex items-center gap-2 text-sm text-stone-500"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-blue-400 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ================= TABLET ================= */}
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-5">
          {steps.map(({ id, title, time, desc, detail }) => (
            <div
              key={id}
              className="bg-white border border-blue-100 rounded-2xl p-6 flex flex-col gap-4 hover:border-blue-200 hover:shadow-sm transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[16px] font-medium text-blue-300">
                    Bước {id}
                    <h3 className="font-serif text-xl text-stone-900 mb-2">
                      {title}
                    </h3>
                  </span>

                  <div className="text-right">
                    <span className="text-[11px] text-stone-400 uppercase tracking-wide block">
                      Thời gian
                    </span>
                    <span className="text-sm font-medium text-stone-700">
                      {time}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
              </div>

              <ul className="flex flex-col gap-1.5 mt-auto pt-4 border-t border-blue-50">
                {detail.map((d) => (
                  <li
                    key={d}
                    className="flex items-center gap-2 text-sm text-stone-500"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-blue-400 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ================= DESKTOP ================= */}
        <div className="hidden lg:grid grid-cols-3 gap-5">
          {steps.map(({ id, title, time, desc, detail }) => (
            <div
              key={id}
              className="bg-white border border-blue-100 rounded-2xl p-6 flex flex-col gap-4 hover:border-blue-200 hover:shadow-sm transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[16px] font-medium text-blue-300">
                    Bước {id}
                    <h3 className="font-serif text-xl text-stone-900 mb-2">
                      {title}
                    </h3>
                  </span>

                  <div className="text-right">
                    <span className="text-[11px] text-stone-400 uppercase tracking-wide block">
                      Thời gian
                    </span>
                    <span className="text-sm font-medium text-stone-700">
                      {time}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
              </div>

              <ul className="flex flex-col gap-1.5 mt-auto pt-4 border-t border-blue-50">
                {detail.map((d) => (
                  <li
                    key={d}
                    className="flex items-center gap-2 text-sm text-stone-500"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-blue-400 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
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
  );
}
