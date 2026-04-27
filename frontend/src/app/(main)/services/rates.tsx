// import React from "react";

// export default function Rates() {
//   return (
//     <section
//       id="rates"
//       className="min-h-screen flex items-center justify-center bg-gray-100"
//     >
//       Rates
//     </section>
//   );
// }



'use client';

import {
  Scale,
  Shirt,
} from 'lucide-react';
import { GradientText } from '@/src/components/ui/gradient-text';

/* DATA riêng trong cùng file */
const ratesData = {
  title: 'Bảng giá dịch vụ',
  subtitle:
    'Giá cả minh bạch, hợp lý theo nhu cầu giặt theo kg hoặc theo từng món đồ riêng biệt.',

 byKg: [
  { name: 'Giặt thường', price: 25000 },
  { name: 'Giặt sấy nhanh', price: 35000 },
  { name: 'Giặt hấp cao cấp', price: 45000 },
  { name: 'Giặt chăn ga', price: 50000 },
  { name: 'Giặt đồ len cao cấp', price: 55000 },
],

  byItem: [
    { name: 'Áo sơ mi', price: 15000 },
    { name: 'Quần tây', price: 20000 },
    { name: 'Vest / Suit', price: 80000 },
    { name: 'Áo khoác', price: 50000 },
    { name: 'Túi da', price: 70000 },
  ],
};

export default function Rates() {
  return (
    <section
      id="rates"
      className="h-screen flex items-center bg-white bg-gradient-to-b from-slate-50 via-white to-blue-50"
    > 
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-20">

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3">
            <GradientText >
              {ratesData.title}
            </GradientText>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            {ratesData.subtitle}
          </p>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Theo KG */}
          <div className="bg-white rounded-3xl border border-blue-100 shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                <Scale className="w-6 h-6 text-sky-500" />
              </div>

              <GradientText className="text-2xl font-bold text-slate-900">
                Giá theo kg
              </GradientText>
            </div>

            <div className="space-y-4">
              {ratesData.byKg.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-slate-100 pb-3"
                >
                  <span className="text-slate-700">{item.name}</span>
                  <GradientText className="font-semibold text-blue-600">
                    {item.price}đ / kg
                  </GradientText>
                </div>
              ))}
            </div>
          </div>

          {/* Theo món */}
          <div className="bg-white rounded-3xl border border-blue-100 shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Shirt className="w-6 h-6 text-sky-500" />
              </div>

              <GradientText className="text-2xl font-bold text-slate-900">
                Giá theo món
              </GradientText>
            </div>

            <div className="space-y-4">
              {ratesData.byItem.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-slate-100 pb-3"
                >
                  <span className="text-slate-700">{item.name}</span>
                  <GradientText className="font-semibold ">
                    {item.price}đ / món
                  </GradientText>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}