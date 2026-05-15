'use client';

import { GradientText } from '@/src/components/ui/gradient-text';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

/* DỮ LIỆU */
const rates = [
  { name: 'Giặt thường', price: 25000, unit: 'kg' },
  { name: 'Giặt sấy nhanh', price: 35000, unit: 'kg' },
  { name: 'Giặt hấp cao cấp', price: 45000, unit: 'kg' },
  { name: 'Giặt chăn ga', price: 50000, unit: 'kg' },
  { name: 'Giặt đồ len cao cấp', price: 55000, unit: 'kg' },
  { name: 'Áo sơ mi', price: 15000, unit: 'món' },
  { name: 'Quần tây', price: 20000, unit: 'món' },
  { name: 'Vest / Suit', price: 80000, unit: 'món' },
  { name: 'Áo khoác', price: 50000, unit: 'món' },
  { name: 'Túi da', price: 70000, unit: 'món' },
];

export default function Rates() {
  return (
    <section id="rates" className="py-24 bg-gray-50">
      <div className="mx-auto w-full max-w-5xl px-6">
        {/* Header */}
        <header className="mb-16 text-center">
          <h1 className="mb-3 text-4xl font-bold sm:text-5xl">
            <GradientText>Bảng giá dịch vụ</GradientText>
          </h1>
          <p className="mx-auto max-w-2xl text-base text-slate-600 sm:text-lg">
            Giá minh bạch – bạn chỉ trả đúng hạng mục đã chọn.
          </p>
        </header>

        {/* ONE TABLE */}
        <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Loại dịch vụ / món đồ</TableHead>
                <TableHead className="text-right">Giá&nbsp;(đ)</TableHead>
                <TableHead className="text-center">Đơn vị</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rates.map((item) => (
                <TableRow key={item.name} className="hover:bg-slate-50">
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-right font-medium text-slate-900">
                    {item.price.toLocaleString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-center uppercase">
                    {item.unit}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}