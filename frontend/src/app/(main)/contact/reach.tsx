<<<<<<< HEAD
// import React from "react";

// export default function Reach() {
//   return (
//     <section
//       id="reach"
//       className="min-h-screen flex items-center justify-center bg-gray-100"
//     >
//       Reach
//     </section>
//   );
// }

"use client";

import React from "react";
import {
  PhoneCall,
  MessageCircleMore,
  Headset,
  Clock3,
  MapPin,
  ArrowUpRight,
} from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";

const reachData = {
  title: "Liên hệ với chúng tôi",
  subtitle:
    "Đặt lịch nhanh, hỏi giá tức thì hoặc nhận hỗ trợ trực tiếp chỉ với một chạm.",

  phone: "0987 654 321",
  zalo: "BeGauShop Official",
  time: "08:00 - 22:00 mỗi ngày",
  area: "Phục vụ nội thành Hà Nội",
};
=======
"use client";

import React, { useState } from "react";
import { MessageCircle, Mail, Send, Phone, CheckCircle } from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";
>>>>>>> dev

export default function Reach() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: "", phone: "", message: "" });
  };

  return (
    <section
      id="reach"
<<<<<<< HEAD
      className="h-screen px-4 bg-gradient-to-b from-slate-50 via-white to-blue-50 flex items-center"
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-20">
          <GradientText className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3">
            {reachData.title}
          </GradientText>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
            {reachData.subtitle}
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-2 gap-7 items-stretch">
          {/* Left Big Card */}
          <div className="bg-white rounded-[32px] shadow-2xl border border-blue-100 p-8">
            <div className="flex items-center gap-4 h-[50px] mb-5">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center ">
                <PhoneCall className="w-7 h-7 text-white" />
              </div>

              <GradientText className="text-3xl font-bold text-slate-500">
                Hotline hỗ trợ
              </GradientText>
            </div>

            <h2 className="text-4xl font-bold text-slate-600 mb-4">
              {reachData.phone}
            </h2>

            <p className="text-slate-600 leading-relaxed mb-16">
              Gọi ngay để được báo giá nhanh, đặt lịch lấy đồ tận nơi hoặc hỗ
              trợ khẩn cấp.
            </p>

            <button className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
              Gọi ngay
            </button>
          </div>

          {/* Right Cards */}
          <div className="space-y-5">
            {/* Zalo */}
            <div className="bg-white rounded-3xl border border-blue-100 shadow-xl p-6 flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <MessageCircleMore className="w-6 h-6 text-sky-500" />
              </div>

              <div className="flex-1">
                <GradientText className="text-base font-semibold text-slate-500 mb-1">Zalo</GradientText>
                <h3 className="text-xl font-bold text-slate-600">
                  {reachData.zalo}
                </h3>
              </div>

              <ArrowUpRight className="w-5 h-5 text-slate-400" />
            </div>

            {/* Time */}
            <div className="bg-white rounded-3xl border border-blue-100 shadow-xl p-6 flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Clock3 className="w-6 h-6 text-sky-500" />
              </div>

              <div>
                <GradientText className="text-base font-semibold text-slate-500 mb-1">Giờ hoạt động</GradientText>
                <h3 className="text-xl font-bold text-slate-600">
                  {reachData.time}
                </h3>
              </div>
            </div>

            {/* Area */}
            <div className="bg-white rounded-3xl border border-blue-100 shadow-xl p-6 flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-sky-500" />
              </div>

              <div>
                <GradientText className="text-base font-semibold text-slate-500 mb-1">Khu vực phục vụ</GradientText>
                <h3 className="text-xl font-bold text-slate-600">
                  {reachData.area}
                </h3>
              </div>
            </div>
=======
      className="min-h-screen flex items-center justify-center bg-white"
    >
      <div className="w-full max-w-6xl mx-auto px-6 pt-20 xl:pt-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            <GradientText>Kết Nối Với Chúng Tôi</GradientText>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Đội ngũ BegauShop luôn sẵn sàng lắng nghe và hỗ trợ bạn 24/7
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-12 items-center justify-center min-h-[calc(100vh-400px)]">
          {/* Left Column - Contact Info Cards */}
          <div className="order-2 lg:order-1 space-y-4">
            {/* Zalo Card */}
            <div className="group p-6 bg-white border border-gray-200 rounded-2xl hover:border-purple-300 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-purple-100 rounded-2xl">
                  <MessageCircle
                    className="w-8 h-8 text-purple-600"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900 mb-1">Zalo</h4>
                  <p className="text-gray-500">Phản hồi trong vài phút</p>
                </div>
                <a
                  href="https://zalo.me/begausop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 hover:shadow-lg transition-all"
                >
                  Chat ngay
                </a>
              </div>
            </div>

            {/* Email Card */}
            <div className="group p-6 bg-white border border-gray-200 rounded-2xl hover:border-purple-300 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-purple-100 rounded-2xl">
                  <Mail className="w-8 h-8 text-purple-600" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900 mb-1">
                    Email
                  </h4>
                  <p className="text-gray-500">Phản hồi trong 24h</p>
                </div>
                <a
                  href="mailto:contact@begausop.vn"
                  className="px-5 py-2.5 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 hover:shadow-lg transition-all"
                >
                  Gửi mail
                </a>
              </div>
            </div>

            {/* Phone Card */}
            <div className="group p-6 bg-white border border-gray-200 rounded-2xl hover:border-purple-300 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-purple-100 rounded-2xl">
                  <Phone
                    className="w-8 h-8 text-purple-600"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900 mb-1">
                    Hotline
                  </h4>
                  <p className="text-gray-500">0901 234 567</p>
                </div>
                <a
                  href="tel:0901234567"
                  className="px-5 py-2.5 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 hover:shadow-lg transition-all"
                >
                  Gọi ngay
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="order-1 lg:order-2 bg-white border border-gray-200 rounded-2xl p-8 shadow-lg w-full lg:max-w-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Gửi tin nhắn
            </h3>
            <p className="text-gray-500 mb-6">
              Điền thông tin, chúng tôi sẽ liên hệ lại trong 30 phút
            </p>

            {submitted ? (
              <div className="flex items-center justify-center gap-3 py-12 bg-green-50 rounded-xl text-green-600">
                <CheckCircle className="w-8 h-8" strokeWidth={1.5} />
                <span className="text-lg font-medium">
                  Gửi thành công! Chúng tôi sẽ liên hệ sớm.
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Nhập họ và tên của bạn"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="Nhập số điện thoại"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Mô tả yêu cầu của bạn..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 w-full px-8 py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors"
                >
                  <Send className="w-5 h-5" />
                  Gửi tin nhắn
                </button>
              </form>
            )}
>>>>>>> dev
          </div>
        </div>
      </div>
    </section>
  );
}
