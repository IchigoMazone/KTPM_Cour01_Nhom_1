"use client";

import React, { useState } from "react";
import { MessageCircle, Mail, Send, Phone, CheckCircle } from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";

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
          </div>
        </div>
      </div>
    </section>
  );
}
