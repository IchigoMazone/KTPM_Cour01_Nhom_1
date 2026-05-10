
"use client";

import React from "react";
import { Star } from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";

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

  const equipment = [
    { name: "Máy giặt nhỏ", count: "2", image: "/img (1).jfif" },
    { name: "Máy giặt lớn", count: "1", image: "/img (4).jpg" },
    { name: "Máy sấy nhỏ", count: "2", image: "/img (2).jfif" },
    { name: "Máy sấy lớn", count: "1", image: "/img (3).jpg" },
  ];

  const feedbacks = [
    {
      name: "Thu Hà",
      avatar: "TH",
      content: "Đồ giặt sạch thơm, giao nhanh!",
      rating: 5,
      description: "Khách hàng thường xuyên",
    },
    {
      name: "Minh Đức",
      avatar: "MD",
      content: "Veston ủi phẳng như tiệm may.",
      rating: 5,
      description: "Khách hàng VIP",
    },
    {
      name: "Hoàng Yến",
      avatar: "HY",
      content: "Đồ bé sạch khuẩn, an toàn.",
      rating: 5,
      description: "Khách hàng mới",
    },
  ];


  return (
    <section
      id="gallery"

      className="min-h-screen flex items-center justify-center bg-white"
    >
      <div className="w-full max-w-6xl mx-auto px-6 pt-20 xl:pt-12 pb-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            <GradientText>Thiết Bị & Đánh Giá</GradientText>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Hệ thống máy móc hiện đại - Phục vụ hơn 15,000 khách hàng
          </p>
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {equipment.map((item, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300 group"
            >
              <div className="relative h-32 bg-gray-100">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 text-center">
                <p className="text-xl font-bold text-blue-500">{item.count}</p>
                <p className="text-sm font-bold text-gray-800">{item.name}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Feedbacks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedbacks.map((item, i) => (
            <div
              key={i}
              className="p-6 bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:border-gray-300 transition-all duration-300 group"
            >
              <div className="flex items-center gap-0.5 mb-3">
                {[...Array(item.rating)].map((_, idx) => (
                  <Star
                    key={idx}
                    className="w-4 h-4 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
              <p className="text-gray-700 text-base leading-relaxed mb-4 italic">
                &ldquo;{item.content}&rdquo;
              </p>
              <p className="text-blue-500 text-sm font-medium mb-4">
                {item.description}
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                  <span className="text-blue-500 font-bold text-sm">
                    {item.avatar}
                  </span>
                </div>
                <p className="font-bold text-gray-900">{item.name}</p>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}