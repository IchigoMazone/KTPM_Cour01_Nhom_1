"use client";
import React, { useState } from "react";
import {
  Search,
  Plus,
  Download,
  MoreHorizontal,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const [showInfor, setShowInfor] = useState(null);

  const [tooltip, setTooltip] = useState(null);
  const customers = [
    {
      id: 1,
      name: "Nguyễn Thị Hương",
      phone: "0903123456",
      address: "123 Nguyễn Huệ, Q1, TP.HCM",

      totalOrders: 24,
      totalSpent: 4800000,
      loyaltyPoints: 2400,
      specialNotes: `Dị ứng với hóa chất tẩy trắng,
        Yêu cầu giặt tay áo lụa`,

      orderHistory: [
        {
          id: "ORD-001",
          date: "2024-04-28",
          amount: 250000,
          items: 5,
          status: "Hoàn thành",
        },
        {
          id: "ORD-002",
          date: "2024-04-21",
          amount: 180000,
          items: 3,
          status: "Hoàn thành",
        },
        {
          id: "ORD-003",
          date: "2024-04-14",
          amount: 320000,
          items: 8,
          status: "Hoàn thành",
        },
        {
          id: "ORD-004",
          date: "2024-04-07",
          amount: 150000,
          items: 2,
          status: "Hoàn thành",
        },
      ],
    },
    {
      id: 2,
      name: "Trần Văn Minh",
      phone: "0912456789",
      address: "456 Lê Lợi, Q5, TP.HCM",
      joinDate: "2023-06-20",
      totalOrders: 18,
      totalSpent: 3200000,
      loyaltyPoints: 1600,

      lastOrder: "2024-04-25",
      avatar: "TVM",
      specialNotes: `Yêu cầu giặt nhanh`,
      orderHistory: [
        {
          id: "ORD-005",
          date: "2024-04-25",
          amount: 200000,
          items: 4,
          status: "Hoàn thành",
        },
        {
          id: "ORD-006",
          date: "2024-04-18",
          amount: 175000,
          items: 3,
          status: "Hoàn thành",
        },
        {
          id: "ORD-007",
          date: "2024-04-11",
          amount: 280000,
          items: 6,
          status: "Hoàn thành",
        },
      ],
    },
    {
      id: 3,
      name: "Phạm Thị Xuân",
      phone: "0938789012",
      address: "789 Pasteur, Q3, TP.HCM",
      joinDate: "2024-01-10",
      totalOrders: 5,
      totalSpent: 850000,
      loyaltyPoints: 425,

      lastOrder: "2024-04-20",
      avatar: "PTX",
      specialNotes: `Khách hàng mới - tặng 10% cho 3 đơn đầu`,
      orderHistory: [
        {
          id: "ORD-008",
          date: "2024-04-20",
          amount: 220000,
          items: 4,
          status: "Hoàn thành",
        },
        {
          id: "ORD-009",
          date: "2024-04-05",
          amount: 170000,
          items: 2,
          status: "Hoàn thành",
        },
      ],
    },
    {
      id: 4,
      name: "Võ Đình Long",
      phone: "0968234567",
      address: "321 Trần Hưng Đạo, Q1, TP.HCM",

      totalOrders: 42,
      totalSpent: 8500000,
      loyaltyPoints: 4250,

      specialNotes: `
        VIP - Nên gọi xác nhận trước khi giao,
        Yêu cầu giặt riêng (không trộn với đơn khác)`,

      orderHistory: [
        {
          id: "ORD-010",
          date: "2024-04-29",
          amount: 450000,
          items: 10,
          status: "Hoàn thành",
        },
        {
          id: "ORD-011",
          date: "2024-04-22",
          amount: 380000,
          items: 8,
          status: "Hoàn thành",
        },
        {
          id: "ORD-012",
          date: "2024-04-15",
          amount: 520000,
          items: 12,
          status: "Hoàn thành",
        },
      ],
    },

    {
      id: 5,
      name: "Võ Đình A",
      phone: "0968234567",
      address: "321 Trần Hưng Đạo, Q1, TP.HCM",

      totalOrders: 42,
      totalSpent: 8500000,
      loyaltyPoints: 4250,

      specialNotes: `
        VIP - Nên gọi xác nhận trước khi giao,
        Yêu cầu giặt riêng (không trộn với đơn khác)`,

      orderHistory: [
        {
          id: "ORD-010",
          date: "2024-04-29",
          amount: 450000,
          items: 10,
          status: "Hoàn thành",
        },
        {
          id: "ORD-011",
          date: "2024-04-22",
          amount: 380000,
          items: 8,
          status: "Hoàn thành",
        },
        {
          id: "ORD-012",
          date: "2024-04-15",
          amount: 520000,
          items: 12,
          status: "Hoàn thành",
        },
      ],
    },
    {
      id: 6,
      name: "Võ Đình B",
      phone: "0968-234-567",
      address: "321 Trần Hưng Đạo, Q1, TP.HCM",

      totalOrders: 42,
      totalSpent: 8500000,
      loyaltyPoints: 4250,

      specialNotes: `
        VIP - Nên gọi xác nhận trước khi giao,
        Yêu cầu giặt riêng (không trộn với đơn khác)`,

      orderHistory: [
        {
          id: "ORD-010",
          date: "2024-04-29",
          amount: 450000,
          items: 10,
          status: "Hoàn thành",
        },
        {
          id: "ORD-011",
          date: "2024-04-22",
          amount: 380000,
          items: 8,
          status: "Hoàn thành",
        },
        {
          id: "ORD-012",
          date: "2024-04-15",
          amount: 520000,
          items: 12,
          status: "Hoàn thành",
        },
      ],
    },
    {
      id: 7,
      name: "Võ Đình C",
      phone: "0968234567",
      address: "321 Trần Hưng Đạo, Q1, TP.HCM",

      totalOrders: 42,
      totalSpent: 8500000,
      loyaltyPoints: 4250,

      specialNotes: `
        VIP - Nên gọi xác nhận trước khi giao,
        Yêu cầu giặt riêng (không trộn với đơn khác)`,

      orderHistory: [
        {
          id: "ORD-010",
          date: "2024-04-29",
          amount: 450000,
          items: 10,
          status: "Hoàn thành",
        },
        {
          id: "ORD-011",
          date: "2024-04-22",
          amount: 380000,
          items: 8,
          status: "Hoàn thành",
        },
        {
          id: "ORD-012",
          date: "2024-04-15",
          amount: 520000,
          items: 12,
          status: "Hoàn thành",
        },
      ],
    },
  ];

  const selectedCustomer = customers.find((c) => c.id === showInfor);

  return (
    <div className="min-h-screen p-6 mx-auto ">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-bold mb-2">Quản Lý Khách Hàng</h1>
      </div>

      <div className="border-[1px] border-solid border-gray-200 rounded-[12px] overflow-hidden">
        <div className="p-5 flex justify-between  border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold">Danh Sách Khách Hàng</h2>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý và theo dõi thông tin khách hàng
            </p>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 border-[1px] border-solid border-gray-300 px-4 py-3 rounded-lg text-sm">
              Xuất dữ liệu
              <Download size={18} />
            </button>
            <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 active:bg-blue-600 text-sm">
              <Plus size={18} />
              Thêm khách hàng
            </button>
          </div>
        </div>

        <div className="border-b border-gray-300 p-5 relative">
          <Search className="absolute left-8 top-8 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[30%] pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 "
          />
        </div>

        {/* Main Content */}
        <div className="">
          <table className="w-full bg-white shadow-sm overflow-hidden">
            <thead className="bg-gray-100 text-gray-600 text-sm font-base ">
              <tr>
                <th className="p-4 text-left flex gap-3">Khách hàng</th>
                <th className="text-left p-4">Số điện thoại</th>
                <th className="text-left p-4">Địa chỉ</th>
                <th className="text-left flex gap-3 p-4">Điểm tích lũy</th>
                <th className="text-left p-4">Ghi chú</th>
                <th></th>
              </tr>
            </thead>

            <tbody className="text-sm text-gray-600">
              {customers.map((c) => (
                <tr
                  key={c.id}
                  className="border-t border-gray-300 hover:bg-gray-50 transition"
                >
                  <td className="p-4 font-medium">{c.name}</td>
                  <td className="p-4">{c.phone}</td>
                  <td className="p-4">{c.address}</td>
                  <td className="p-4 ">{c.loyaltyPoints}</td>
                  <td className="p-4 text-gray-600">{c.specialNotes || "-"}</td>
                  <td className="p-4 text-center relative">
                    <button
                      className="p-2 rounded-lg hover:bg-gray-200 transition"
                      onClick={() => setTooltip(tooltip === c.id ? null : c.id)}
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-600" />
                    </button>
                    {tooltip === c.id && (
                      <div className="tooltip z-10 absolute top-10 right-5 bg-white w-40 flex flex-col border-[1px] border-gray-300 p-2 rounded-[12px] gap-1">
                        <button
                          className="px-3 py-2 flex justify-start hover:bg-gray-200 hover:rounded-[8px]"
                          onClick={() => {
                            setShowInfor(tooltip);
                            setTooltip(null);
                          }}
                        >
                          Xem Thêm
                        </button>
                        <button className="px-3 py-2 flex justify-start hover:bg-gray-200 hover:rounded-[8px]">
                          Xóa
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot className="border-t border-gray-300">
              <tr>
                <td colSpan={7} className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Showing 1 to 7 of 20
                    </span>

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

          {selectedCustomer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <div className="w-[75%] h-[85%] bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* HEADER */}
                <div className="flex justify-between items-center border-b border-gray-200 p-6">
                  <div>
                    <h2 className="text-2xl font-bold">Thông tin khách hàng</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Chi tiết hồ sơ và lịch sử đơn hàng
                    </p>
                  </div>

                  <button
                    onClick={() => setShowInfor(null)}
                    className="w-10 h-10 rounded-lg hover:bg-gray-100 text-xl"
                  >
                    ✕
                  </button>
                </div>

                {/* CONTENT */}
                <div className="p-6 overflow-y-auto h-[calc(100%-88px)]">
                  {/* TOP INFO */}
                  <div className="p-5 mb-6 border border-gray-200 rounded-2xl ">
                    {/* PROFILE */}

                    <h3 className="text-lg font-semibold mb-5 pb-5 border-b border-gray-300">
                      Hồ sơ khách hàng
                    </h3>

                    <div className="grid grid-cols-2 w-full flex justify-between text-sm col-span-2 ">
                      {/* LEFT */}
                      <div className="space-y-5 border-r border-gray-200">
                        <div>
                          <p className="text-gray-500 mb-1">Họ tên</p>
                          <p className="font-medium">{selectedCustomer.name}</p>
                        </div>

                        <div>
                          <p className="text-gray-500 mb-1">Số điện thoại</p>
                          <p className="font-medium">
                            {selectedCustomer.phone}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500 mb-1">Địa chỉ</p>
                          <p className="font-medium">
                            {selectedCustomer.address}
                          </p>
                        </div>
                      </div>

                      {/* RIGHT */}
                      <div className="space-y-5 text-right">
                        <div>
                          <p className="text-gray-500 text-sm">Tổng đơn hàng</p>
                          <p className="text-sm font-semibold">
                            {selectedCustomer.totalOrders}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500 text-sm">Tổng chi tiêu</p>
                          <p className="text-sm font-bold text-green-500">
                            {selectedCustomer.totalSpent.toLocaleString()}đ
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500 text-sm">Điểm tích lũy</p>
                          <p className="text-sm font-bold text-blue-500">
                            {selectedCustomer.loyaltyPoints}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* NOTES */}
                  <div className="border border-gray-200 rounded-2xl p-5 mb-6">
                    <h3 className="text-lg font-semibold mb-3 ">
                      Ghi chú đặc biệt
                    </h3>

                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {selectedCustomer.specialNotes}
                    </p>
                  </div>

                  {/* ORDER HISTORY */}
                  <div className="border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="p-5 border-b border-gray-200">
                      <h3 className="text-lg font-semibold">
                        Lịch sử đơn hàng
                      </h3>
                    </div>

                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-600">
                        <tr>
                          <th className="p-4 text-left">Mã đơn</th>
                          <th className="text-left">Ngày</th>
                          <th className="text-left">Số lượng</th>
                          <th className="text-left">Tổng tiền</th>
                          <th className="text-left">Trạng thái</th>
                        </tr>
                      </thead>

                      <tbody>
                        {selectedCustomer.orderHistory.map((order) => (
                          <tr
                            key={order.id}
                            className="border-t border-gray-200 hover:bg-gray-50"
                          >
                            <td className="p-4 font-medium">{order.id}</td>

                            <td>{order.date}</td>

                            <td>{order.items} món</td>

                            <td className="font-medium">
                              {order.amount.toLocaleString()}đ
                            </td>

                            <td>
                              <span className="px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-medium">
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
