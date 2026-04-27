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

export default function Tracking() {
  return (
    <section
      id="tracking"
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
          </div>
        </div>
      </div>
    </section>
  );
}