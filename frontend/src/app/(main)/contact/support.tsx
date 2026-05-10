<<<<<<< HEAD
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
=======
"use client";

import React, { useState } from "react";
import { MessageCircle, Users, Headphones, Clock, Send, CheckCircle } from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";
>>>>>>> dev

export default function Support() {
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

  const channels = [
    {
      icon: MessageCircle,
      title: "Chat Zalo trực tiếp",
      desc: "Trò chuyện ngay với nhân viên tư vấn",
      link: "https://zalo.me/begausop",
      buttonText: "Bắt đầu chat",
      bgColor: "blue",
    },
    {
      icon: Users,
      title: "Tư vấn viên",
      desc: "Đội ngũ 10+ nhân viên tư vấn chuyên nghiệp",
      link: "tel:0901234567",
      buttonText: "Gọi ngay",
      bgColor: "green",
    },
    {
      icon: Clock,
      title: "Phản hồi nhanh",
      desc: "Trong vòng 5 phút vào giờ hành chính",
      link: null,
      buttonText: "24/7 hỗ trợ",
      bgColor: "purple",
    },
  ];

  return (
    <section
      id="support"
<<<<<<< HEAD
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
=======
      className="min-h-screen flex items-center justify-center bg-white"
    >
      <div className="w-full max-w-6xl mx-auto px-6 pt-20 pb-20">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            <GradientText>Hỗ Trợ Khách Hàng</GradientText>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Đội ngũ hỗ trợ BegauShop luôn sẵn sàng giải đáp mọi thắc mắc và hỗ trợ bạn 24/7
          </p>
        </div>

        {/* Support Channels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {channels.map((item, i) => (
            <div
              key={i}
              className="group p-5 bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className={`p-3 rounded-xl flex-shrink-0 ${
                  item.bgColor === "blue" ? "bg-blue-100" :
                  item.bgColor === "green" ? "bg-green-100" : "bg-purple-100"
                }`}>
                  <item.icon
                    className={`w-6 h-6 ${
                      item.bgColor === "blue" ? "text-blue-600" :
                      item.bgColor === "green" ? "text-green-600" : "text-purple-600"
                    }`}
                    strokeWidth={1.5}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-bold text-gray-900 mb-0.5">
                    {item.title}
                  </h4>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              </div>
              {item.link ? (
                <a
                  href={item.link}
                  target={item.link.startsWith("http") ? "_blank" : undefined}
                  rel={item.link.startsWith("http") ? "noopener noreferrer" : undefined}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 font-medium rounded-xl hover:shadow-lg transition-all ${
                    item.bgColor === "blue" ? "bg-blue-600 text-white hover:bg-blue-700" :
                    item.bgColor === "green" ? "bg-green-500 text-white hover:bg-green-600" :
                    "bg-purple-500 text-white hover:bg-purple-600"
                  }`}
                >
                  {item.buttonText}
                </a>
              ) : (
                <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-purple-600 bg-purple-100 rounded-full">
                  {item.buttonText}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Quick Contact Form */}
        <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-1">Gửi yêu cầu hỗ trợ</h3>
          <p className="text-gray-500 mb-4 text-sm">
            Điền thông tin, chúng tôi sẽ liên hệ lại trong 30 phút
          </p>

          {submitted ? (
            <div className="flex items-center justify-center gap-3 py-12 bg-green-50 rounded-xl text-green-600">
              <CheckCircle className="w-8 h-8" strokeWidth={1.5} />
              <span className="text-lg font-medium">Gửi thành công! Chúng tôi sẽ liên hệ sớm.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nhập họ và tên"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Nhập số điện thoại"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nội dung
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Mô tả yêu cầu hỗ trợ..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Gửi yêu cầu
                </button>
                <a
                  href="https://zalo.me/begausop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-100 text-blue-600 font-bold rounded-xl hover:bg-blue-200 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat Zalo
                </a>
              </div>
            </form>
          )}
>>>>>>> dev
        </div>
      </div>
    </section>
  );
}
