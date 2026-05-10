<<<<<<< HEAD
// import React from "react";

// export default function Tracking() {
//   return (
//     <section
//       id="tracking"
//       className="min-h-screen flex items-center justify-center bg-gray-100"
//     >
//       Tracking
//     </section>
//   );
// }



'use client';

import React from 'react';
import {
  Radar,
  PackageCheck,
  WashingMachine,
  Truck,
  CheckCircle2,
  Clock3,
} from 'lucide-react';
import { GradientText } from '@/src/components/ui/gradient-text';

const trackingData = {
  orderId: '#BG24068',
  percent: 70,
  status: 'Đang giặt xử lý',
  eta: 'Dự kiến giao lúc 16:00',

  steps: [
    {
      title: 'Đã tiếp nhận',
      icon: PackageCheck,
      done: true,
    },
    {
      title: 'Đang giặt xử lý',
      icon: WashingMachine,
      done: true,
      active: true,
    },
    {
      title: 'Chuẩn bị giao',
      icon: Truck,
      done: false,
    },
    {
      title: 'Hoàn tất',
      icon: CheckCircle2,
      done: false,
    },
  ],
};
=======
"use client";

import React from "react";
import { CheckCircle2, Circle, Package, Sparkles, Truck } from "lucide-react";
import { GradientText } from "@/src/components/ui/gradient-text";
>>>>>>> dev

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
<<<<<<< HEAD
      className="h-screen px-4 bg-gradient-to-b from-white via-slate-50 to-blue-50 flex items-center"
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-20">
          

          <h1 className="text-4xl sm:text-5xl font-bold mb-3">
            <GradientText >
              Theo dõi đơn hàng
            </GradientText>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg">
            Cập nhật tiến độ xử lý đơn hàng nhanh chóng và minh bạch
          </p>
        </div>

        {/* Main */}
        <div className="grid lg:grid-cols-2 gap-6 items-center">
          {/* Left Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-7">
            <p className="text-sm text-slate-500 mb-1">Mã đơn hàng</p>

            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              {trackingData.orderId}
            </h2>

            {/* Progress */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">
                  Tiến độ hoàn thành
                </span>

                <span className="text-sm font-semibold text-blue-600">
                  {trackingData.percent}%
                </span>
              </div>

              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"
                  style={{
                    width: `${trackingData.percent}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
              <p className="text-blue-600 font-semibold text-lg mb-1">
                {trackingData.status}
              </p>

              <p className="text-slate-600 text-sm">
                {trackingData.eta}
              </p>
            </div>
          </div>

          {/* Right Steps */}
          <div className="space-y-4">
            {trackingData.steps.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={index}
                  className={`rounded-2xl p-4 border flex items-center gap-4 ${
                    item.active
                      ? 'bg-blue-50 border-blue-200'
                      : item.done
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      item.active
                        ? 'bg-blue-600 text-white'
                        : item.done
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">
                      {item.title}
                    </h3>

                    <p className="text-sm text-slate-500">
                      Bước {index + 1}
                    </p>
                  </div>

                  {item.active && (
                    <Clock3 className="w-5 h-5 text-blue-600" />
                  )}

                  {item.done && !item.active && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                </div>
              );
            })}
=======
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
>>>>>>> dev
          </div>
        </div>
      </div>
    </section>
  );
}