"use client";

import React from "react";
import { CheckCircle2, Circle, Package, Sparkles, Truck } from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";

export default function Tracking() {
  const statuses = [
    {
      id: "booked",
      icon: Package,
      title: "Đã đặt lịch",
      description: "Đơn hàng của bạn đã được xác nhận",
      time: "Hôm nay, 09:30",
      completed: true,
      color: "blue",
    },
    {
      id: "picked_up",
      icon: Truck,
      title: "Đã lấy đồ",
      description: "Nhân viên đã nhận đồ và đang vận chuyển về tiệm",
      time: "Hôm nay, 10:15",
      completed: true,
      color: "green",
    },
    {
      id: "washing",
      icon: Sparkles,
      title: "Đang giặt",
      description: "Đồ đang được xử lý theo quy trình chuẩn",
      time: "Đang diễn ra",
      completed: true,
      color: "purple",
    },
    {
      id: "done",
      icon: CheckCircle2,
      title: "Hoàn thành",
      description: "Đồ đã sẵn sàng để giao hoặc nhận",
      time: "Dự kiến 18:00",
      completed: false,
      color: "amber",
    },
    {
      id: "delivering",
      icon: Truck,
      title: "Đang giao",
      description: "Nhân viên đang trên đường giao đến bạn",
      time: "Sắp tới",
      completed: false,
      color: "gray",
    },
    {
      id: "completed",
      icon: CheckCircle2,
      title: "Đã nhận",
      description: "Cảm ơn bạn đã sử dụng dịch vụ!",
      time: "Hoàn tất",
      completed: false,
      color: "gray",
    },
  ];

  const getColorClasses = (color: string, isCompleted: boolean) => {
    if (isCompleted) {
      switch (color) {
        case "blue": return "bg-blue-600 text-white border-blue-600";
        case "green": return "bg-green-600 text-white border-green-600";
        case "purple": return "bg-purple-600 text-white border-purple-600";
        case "amber": return "bg-amber-500 text-white border-amber-500";
        default: return "bg-gray-600 text-white border-gray-600";
      }
    }
    if (color === "amber") {
      return "bg-amber-100 text-amber-600 border-2 border-amber-400";
    }
    return "bg-gray-200 text-gray-400 border-gray-200";
  };

  const getTextColor = (color: string, isCompleted: boolean) => {
    if (isCompleted) return "text-gray-900";
    if (color === "amber") return "text-amber-600";
    return "text-gray-500";
  };

  return (
    <section
      id="tracking"

      className="min-h-screen flex items-center justify-center bg-white"
    >
      <div className="w-full max-w-4xl mx-auto px-6 pt-20 pb-20">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            <GradientText>Theo Dõi Đơn Hàng</GradientText>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Cập nhật trạng thái đơn hàng realtime - biết chính xác đồ của bạn đang ở đâu
          </p>
        </div>

        {/* Order Info */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 pb-4 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Mã đơn: #GL-2026-0512
              </h3>
              <p className="text-gray-500 text-sm">
                Dịch vụ: Giặt hấp | Khối lượng: 3.5kg | Ngày nhận: 09/05/2026
              </p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full w-fit">
              Đang giặt
            </span>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            <div className="space-y-6">
              {statuses.map((status) => (
                <div key={status.id} className="relative flex gap-6">
                  <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getColorClasses(status.color, status.completed)}`}>
                    {status.completed ? (
                      <status.icon className="w-6 h-6" strokeWidth={1.5} />
                    ) : (
                      <Circle className="w-6 h-6" strokeWidth={1.5} />
                    )}
                  </div>

                  <div className="flex-1 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                      <h4 className={`font-semibold ${getTextColor(status.color, status.completed)}`}>
                        {status.title}
                      </h4>
                      <span className={`text-sm ${
                        status.completed ? "text-gray-500" : "text-gray-400"
                      }`}>
                        {status.time}
                      </span>
                    </div>
                    <p className={`text-sm ${
                      status.completed ? "text-gray-600" : "text-gray-400"
                    }`}>
                      {status.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}