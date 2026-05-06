// import React from "react";

// export default function Home() {
//   return (
//     <div className="w-full h-screen flex justify-center items-center">
//       Khách hàng
//     </div>
//   );
// }

"use client";
import React, { useState } from "react";
import {
  Search,
  Phone,
  MapPin,
  Heart,
  AlertCircle,
  Star,
  Plus,
  ChevronRight,
  Filter,
  Edit2,
  Trash2,
  Download,
  SlidersHorizontal,
  MoreHorizontal,
} from "lucide-react";

export default function Home() {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);

  // Sample customer data
  const customers = [
    {
      id: 1,
      name: "Nguyễn Thị Hương",
      phone: "0903-123-456",
      address: "123 Nguyễn Huệ, Q1, TP.HCM",
      joinDate: "2023-01-15",
      totalOrders: 24,
      totalSpent: "₫4,800,000",
      loyaltyPoints: 2400,
      tier: "Gold",
      lastOrder: "2024-04-28",
      avatar: "NTH",
      specialNotes: [
        "Dị ứng với hóa chất tẩy trắng",
        "Yêu cầu giặt tay áo lụa",
      ],
      orderHistory: [
        {
          id: "ORD-001",
          date: "2024-04-28",
          amount: "₫250,000",
          items: 5,
          status: "Hoàn thành",
        },
        {
          id: "ORD-002",
          date: "2024-04-21",
          amount: "₫180,000",
          items: 3,
          status: "Hoàn thành",
        },
        {
          id: "ORD-003",
          date: "2024-04-14",
          amount: "₫320,000",
          items: 8,
          status: "Hoàn thành",
        },
        {
          id: "ORD-004",
          date: "2024-04-07",
          amount: "₫150,000",
          items: 2,
          status: "Hoàn thành",
        },
      ],
    },
    {
      id: 2,
      name: "Trần Văn Minh",
      phone: "0912-456-789",
      address: "456 Lê Lợi, Q5, TP.HCM",
      joinDate: "2023-06-20",
      totalOrders: 18,
      totalSpent: "₫3,200,000",
      loyaltyPoints: 1600,
      tier: "Silver",
      lastOrder: "2024-04-25",
      avatar: "TVM",
      specialNotes: ["Yêu cầu giặt nhanh (express)"],
      orderHistory: [
        {
          id: "ORD-005",
          date: "2024-04-25",
          amount: "₫200,000",
          items: 4,
          status: "Hoàn thành",
        },
        {
          id: "ORD-006",
          date: "2024-04-18",
          amount: "₫175,000",
          items: 3,
          status: "Hoàn thành",
        },
        {
          id: "ORD-007",
          date: "2024-04-11",
          amount: "₫280,000",
          items: 6,
          status: "Hoàn thành",
        },
      ],
    },
    {
      id: 3,
      name: "Phạm Thị Xuân",
      phone: "0938-789-012",
      address: "789 Pasteur, Q3, TP.HCM",
      joinDate: "2024-01-10",
      totalOrders: 5,
      totalSpent: "₫850,000",
      loyaltyPoints: 425,
      tier: "Bronze",
      lastOrder: "2024-04-20",
      avatar: "PTX",
      specialNotes: ["Khách hàng mới - tặng 10% cho 3 đơn đầu"],
      orderHistory: [
        {
          id: "ORD-008",
          date: "2024-04-20",
          amount: "₫220,000",
          items: 4,
          status: "Hoàn thành",
        },
        {
          id: "ORD-009",
          date: "2024-04-05",
          amount: "₫170,000",
          items: 2,
          status: "Hoàn thành",
        },
      ],
    },
    {
      id: 4,
      name: "Võ Đình Long",
      phone: "0968-234-567",
      address: "321 Trần Hưng Đạo, Q1, TP.HCM",
      joinDate: "2022-11-05",
      totalOrders: 42,
      totalSpent: "₫8,500,000",
      loyaltyPoints: 4250,
      tier: "Platinum",
      lastOrder: "2024-04-29",
      avatar: "VĐL",
      specialNotes: [
        "VIP - Nên gọi xác nhận trước khi giao",
        "Yêu cầu giặt riêng (không trộn với đơn khác)",
      ],
      orderHistory: [
        {
          id: "ORD-010",
          date: "2024-04-29",
          amount: "₫450,000",
          items: 10,
          status: "Hoàn thành",
        },
        {
          id: "ORD-011",
          date: "2024-04-22",
          amount: "₫380,000",
          items: 8,
          status: "Hoàn thành",
        },
        {
          id: "ORD-012",
          date: "2024-04-15",
          amount: "₫520,000",
          items: 12,
          status: "Hoàn thành",
        },
      ],
    },
  ];

  // Filter customers
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery);

    if (filterType === "all") return matchesSearch;
    if (filterType === "gold") return matchesSearch && customer.tier === "Gold";
    if (filterType === "platinum")
      return matchesSearch && customer.tier === "Platinum";
    if (filterType === "new") return matchesSearch && customer.totalOrders < 10;

    return matchesSearch;
  });

  const getTierColor = (tier) => {
    switch (tier) {
      case "Platinum":
        return "bg-slate-200 text-slate-900";
      case "Gold":
        return "bg-yellow-200 text-yellow-900";
      case "Silver":
        return "bg-gray-300 text-gray-900";
      case "Bronze":
        return "bg-orange-200 text-orange-900";
      default:
        return "bg-gray-200 text-gray-900";
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case "Platinum":
        return "👑";
      case "Gold":
        return "🥇";
      case "Silver":
        return "🥈";
      case "Bronze":
        return "🥉";
      default:
        return "⭐";
    }
  };

  const isUp = true;

  return (
    <div className="min-h-screen p-6 mx-auto ">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-3xl font-bold mb-2">Quản Lý Khách Hàng</h1>
      </div>

      <div className="border-[1px] border-solid border-gray-300 rounded-[20px]">
        <div className="p-5 flex justify-between  border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold">Danh Sách Khách Hàng</h2>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý và theo dõi thông tin khách hàng
            </p>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 border-[1px] border-solid border-gray-500 px-4 py-3 rounded-lg ">
              Xuất dữ liệu
              <Download />
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 active:bg-blue-600 "
            >
              <Plus className="w-5 h-5" />
              Thêm khách hàng
            </button>
          </div>
        </div>

        <div className="flex justify-between border-b border-[1px] border-gray-300 p-5">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[30%] pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 "
            />
          </div>

          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border-[1px] border-gray-400 ">
            <SlidersHorizontal />
            Lọc
          </button>
        </div>

        {/* Main Content */}
        <div className="">
          <table className="w-full bg-white shadow-sm overflow-hidden">
            <thead className="bg-gray-100 text-gray-600 text-sm font-base ">
              <tr>
                <th className="p-4 text-left flex gap-3">
                  Khách hàng
                  <div className="flex flex-col items-center leading-none text-[10px]">
                    <span className={isUp ? "text-gray-500" : "text-gray-300"}>
                      ▲
                    </span>
                    <span className={!isUp ? "text-gray" : "text-gray-300"}>
                      ▼
                    </span>
                  </div>
                </th>
                <th className="text-left p-4">Số điện thoại</th>
                <th className="text-left p-4">Địa chỉ</th>
                <th className="text-left flex gap-3 p-4">
                  Điểm tích lũy
                  <div className="flex flex-col items-center leading-none text-[10px]">
                    <span className={isUp ? "text-gray-500" : "text-gray-300"}>
                      ▲
                    </span>
                    <span className={!isUp ? "text-gray" : "text-gray-300"}>
                      ▼
                    </span>
                  </div>
                </th>
                <th className="text-left p-4">Ghi chú</th>
                <th></th>
              </tr>
            </thead>

            <tbody className="text-sm text-gray-600">
              {customers.map((c) => (
                <tr key={c.id} className="border-t border-gray-300 hover:bg-gray-50 transition">
                  <td className="p-4 font-medium">{c.name}</td>
                  <td className="p-4">{c.phone}</td>
                  <td className="p-4">{c.address}</td>
                  <td className="p-4 ">
                    {c.loyaltyPoints}
                  </td>
                  <td className="p-4 text-gray-600">{c.specialNotes || "-"}</td>
                  <td className="p-4 text-center">
                    <button className="p-2 rounded-lg hover:bg-gray-200 transition">
                      <MoreHorizontal className="w-4 h-4 text-gray-600" />
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
