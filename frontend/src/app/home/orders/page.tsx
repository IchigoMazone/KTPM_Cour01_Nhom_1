import { ArrowLeft, ArrowRight, MoreHorizontal, Plus } from "lucide-react";
import React from "react";

export default function Home() {
  return (
    <div className="w-full h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">Quản Lý Đơn Hàng</h1>
      <div className="overflow-hidden border border-gray-200 rounded-[12px] bg-white">
        <div className="flex justify-between items-center p-5">
          <h3 className="">Danh Sách Đơn Hàng</h3>
          <button className="flex gap-2 bg-blue-600 px-4 py-3 rounded-[8px] text-white text-sm">
            <Plus size={18}/>
            <span>Tạo đơn hàng</span>
          </button>
        </div>

        <table className="w-full shadow-sm ">
          <thead className="bg-gray-100 text-gray-600 text-sm font-base">
            <tr className="">
              <th className="p-4 text-left">Mã đơn hàng</th>
              <th className="p-4 text-left">Khách hàng</th>
              <th className="p-4 text-left">Đơn hàng</th>
              <th className="p-4 text-left">Giá đơn</th>
              <th className="p-4 text-left">Ngày đặt</th>
              <th className="p-4 text-left">Trạng thái</th>
              <th></th>
            </tr>
          </thead>

          <tbody className="">
            <tr className="border-t border-gray-300 text-[344054]">
              <td className="p-4 ">#12345</td>
              <td className="p-4 ">Nguyen Xuan Son</td>
              <td className="p-4 ">quan ao</td>
              <td className="p-4 ">230000</td>
              <td className="p-4 ">23-05-2026</td>
              <td className="p-4 ">Tiep nhan</td>
              <td className="p-1">
                <MoreHorizontal className="w-4 h-4" />
              </td>
            </tr>
          </tbody>

          <tfoot className="">
            <tr className="border-t border-gray-200 ">
              <td colSpan={7} className="p-4">
                <div className="flex justify-between items-center">
                  <p>show 1 to 7 from 10</p>
                  <div className="flex gap-2">
                    <button className="w-10 h-10 flex justify-center items-center rounded-[8px] border-[1px] border-gray-200 text-gray-900">
                      <ArrowLeft size={20} />
                    </button>
                    <div className="flex gap-1">
                      <button className="w-10 h-10 hover:bg-blue-600 hover:text-white hover:rounded-[8px]">
                        1
                      </button>
                      <button className="w-10 h-10 hover:bg-blue-600 hover:text-white hover:rounded-[8px]">
                        2
                      </button>
                      <button className="w-10 h-10 hover:bg-blue-600 hover:text-white hover:rounded-[8px]">
                        3
                      </button>
                    </div>

                    <button className="w-10 h-10 flex justify-center items-center rounded-[8px] border-[1px] border-gray-200 text-gray-900">
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
