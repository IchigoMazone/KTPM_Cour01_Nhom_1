"use client";
import React, { useState, useEffect } from "react";
import { TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Home() {
  const [activeTab, setActiveTab] = useState("today");
  const [dashboardData] = useState({
    today: {
      orders: 24,
      ordersChange: 12,
      revenue: "₫8.5M",
      revenueChange: 8,
      processing: 8,
    },
    revenueData: [
      { time: "00h", revenue: 200 },
      { time: "04h", revenue: 150 },
      { time: "08h", revenue: 450 },
      { time: "12h", revenue: 800 },
      { time: "16h", revenue: 950 },
      { time: "20h", revenue: 700 },
    ],
    orderStatus: {
      completed: 12,
      processing: 8,
      unconfirmed: 3,
      cancelled: 1,
    },
    alerts: {
      overdue: 3,
      almostDue: 5,
    },
  });

  return (
    <div className="w-full min-h-screen p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 ">
            Tổng Quan
          </h1>
        </div>

        <div className="">
          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Orders Card */}
            <div className="bg-white  rounded-[20px] p-6  border border-gray-200 ">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Tổng đơn hôm nay
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {dashboardData.today.orders}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                ↑ {dashboardData.today.ordersChange}% so với hôm qua
              </p>
            </div>

            <div className="bg-white  rounded-[20px] p-6  border border-gray-200 ">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Tổng đơn hôm nay
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {dashboardData.today.orders}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                ↑ {dashboardData.today.ordersChange}% so với hôm qua
              </p>
            </div>
            {/* Processing Orders Card */}
            <div className="bg-white  rounded-[20px] p-6  border border-gray-200 ">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Đơn đang xử lý
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {dashboardData.today.processing}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Cần xử lý ngay
              </p>
            </div>

            <div className="bg-white  rounded-[20px] p-6  border border-gray-200 ">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Đơn bị trễ hẹn
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {dashboardData.today.processing}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Cần xử lý ngay
              </p>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="grid grid-cols-[2fr_1fr] gap-5">
            <div className="bg-white 0 rounded-[20px] p-6  border border-gray-200 ">
              <div className="mb-6 flex justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Doanh thu theo thời gian
                </h2>

                {/* Tab Buttons */}
                <div className="flex bg-gray-200 rounded-[8px] p-1">
                  <div className=" ">
                    <button
                      onClick={() => setActiveTab("today")}
                      className={`px-4 py-2  text-sm font-medium  transition-colors ${
                        activeTab === "today"
                          ? "bg-white text-black rounded-[8px]"
                          : "text-gray-500 hover:text-black"
                      }`}
                    >
                      24h
                    </button>

                    <button
                      onClick={() => setActiveTab("week")}
                      className={`px-4 py-2  text-sm font-medium transition-colors ${
                        activeTab === "week"
                          ? "bg-white text-black rounded-[8px]"
                          : "text-gray-500 hover:text-black"
                      }`}
                    >
                      Tuần
                    </button>
                    <button
                      onClick={() => setActiveTab("month")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === "month"
                          ? "bg-white text-black"
                          : "text-gray-500 hover:text-black"
                      }`}
                    >
                      Tháng
                    </button>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.revenueData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0,0,0,0.1)"
                  />
                  <XAxis dataKey="time" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    formatter={(value) => `₫${value}K`}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="border-[1px] border-solid rounded-[20px] p-6">
              <h1 className="text-lg font-semibold">Doanh thu hôm nay</h1>
              <div className="">
                <div>2,100,100</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
