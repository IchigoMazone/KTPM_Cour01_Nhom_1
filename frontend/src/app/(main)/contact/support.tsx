// import React from "react";

// export default function Support() {
//   return (
//     <section
//       id="support"
//       className="min-h-screen flex items-center justify-center bg-gray-100"
//     >
//       Support
//     </section>
//   );
// }

"use client";

import React from "react";
import {
  MessageCircle,
  Phone,
  Send,
  User,
  Mail,
  FileText,

} from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";

const supportData = {
  title: "Hỗ trợ nhanh",
  subtitle:
    "Gửi yêu cầu liên hệ hoặc chat Zalo trực tiếp để được phản hồi nhanh nhất.",

  phone: "0987 654 321",
  zalo: "BeGauShop",
};

export default function Support() {
  return (
    <section
      id="support"
      className="min-h-screen px-4 bg-gradient-to-b from-slate-50 via-white to-blue-50 flex items-center"
    >
      <div className="max-w-6xl mx-auto w-full pt-10">
        {/* Header */}
        <div className="text-center mb-10">
          <GradientText className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3">
            {supportData.title}
          </GradientText>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
            {supportData.subtitle}
          </p>
        </div>

        {/* Main */}
        <div className="grid lg:grid-cols-2 gap-7 items-stretch">
          {/* Left Form */}
          <div className="bg-white rounded-[32px] shadow-2xl border border-blue-100 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Gửi yêu cầu liên hệ
            </h2>

            <div className="space-y-4">
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Họ và tên"
                  className="w-full pl-12 pr-4 h-12 rounded-2xl border border-slate-200 outline-none focus:border-blue-500"
                />
              </div>

              <div className="relative">
                <Phone className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Số điện thoại"
                  className="w-full pl-12 pr-4 h-12 rounded-2xl border border-slate-200 outline-none focus:border-blue-500"
                />
              </div>

              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Email (không bắt buộc)"
                  className="w-full pl-12 pr-4 h-12 rounded-2xl border border-slate-200 outline-none focus:border-blue-500"
                />
              </div>

              <div className="relative">
                <FileText className="w-5 h-5 text-slate-400 absolute left-4 top-5" />
                <textarea
                  rows="2"
                  placeholder="Nội dung cần hỗ trợ..."
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-blue-500 resize-none"
                ></textarea>
              </div>

              <button className="w-full h-12 rounded-2xl bg-blue-600 text-white font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition">
                Gửi yêu cầu
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Contact */}
          <div className="space-y-5">
            <div className="bg-white rounded-3xl border border-blue-100 shadow-xl p-6">
              <div className="flex gap-4 h-[50px] mb-4 items-center">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center ">
                  <Phone className="w-6 h-6 text-sky-500" />
                </div>

                <GradientText className="text-2xl font-bold">
                  Hotline
                </GradientText>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-6">
                {supportData.phone}
              </h3>

              <button className="w-full h-11 rounded-2xl bg-slate-100 text-slate-900 font-medium hover:bg-slate-200 transition">
                Gọi ngay
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-blue-100 shadow-xl p-6">
              <div className="flex h-[50px] gap-4 mb-4 items-center">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center ">
                  <MessageCircle className="w-6 h-6 text-sky-500" />
                </div>

                <GradientText className="text-2xl font-bold text-slate-500 mb-1">
                  Chat Zalo
                </GradientText>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-6">
                {supportData.zalo}
              </h3>

              <button className="w-full h-11 rounded-2xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
                Nhắn tin ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
