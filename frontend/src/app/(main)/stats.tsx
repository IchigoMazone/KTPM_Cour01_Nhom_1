"use client";

import React from "react";
import { Users, Calendar, Smile, Building2, TrendingUp, Package, UserCheck, Phone, Star } from "lucide-react";
import { GradientText } from "../../components/ui/gradient-text";

export default function Stats() {
  const mainStats = [
    { icon: Users, number: "50,000+", label: "Khách hàng", bg: "bg-blue-500" },
    { icon: Calendar, number: "9+", label: "Năm kinh nghiệm", bg: "bg-green-500" },
    { icon: Smile, number: "98%", label: "Hài lòng", bg: "bg-amber-500" },
    { icon: Building2, number: "3", label: "Chi nhánh", bg: "bg-purple-500" }
  ];

  const subStats = [
    { icon: Package, value: "120K+", label: "Đơn hàng" },
    { icon: TrendingUp, value: "50+", label: "Thiết bị" },
    { icon: UserCheck, value: "25+", label: "Nhân viên" },
    { icon: Phone, value: "24/7", label: "Hỗ trợ" }
  ];

  const reviews = [
    { name: "Minh Anh", avatar: "bg-pink-500", rating: 5, text: "Dịch vụ tuyệt vời, đồ giặt thơm tho và sạch sẽ!" },
    { name: "Hoàng Nam", avatar: "bg-blue-500", rating: 5, text: "Rất nhanh, hôm sau lấy được luôn. Recommend!" },
    { name: "Thu Hà", avatar: "bg-green-500", rating: 5, text: "Nhân viên dễ thương, tư vấn nhiệt tình." }
  ];

  return (
    <section id="stats" className="h-screen flex items-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="w-full px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
          
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Những Con Số <GradientText>Ấn Tượng</GradientText>
            </h2>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            {mainStats.map((stat, i) => (
              <div key={i} className="bg-white/10 rounded-2xl p-5 text-center border border-white/20 hover:bg-white/20 transition-all group">
                <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <p className="text-3xl font-black text-white mb-1">{stat.number}</p>
                <p className="text-sm text-gray-300">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-3 mb-6">
            {subStats.map((item, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                <item.icon className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                <p className="text-xl font-bold text-white">{item.value}</p>
                <p className="text-xs text-gray-400">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {reviews.map((r, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 ${r.avatar} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                    {r.name[0]}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{r.name}</p>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`} />)}
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">"{r.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
