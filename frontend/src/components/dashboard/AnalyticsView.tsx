"use client";

import { motion } from "framer-motion";
import { BarChart } from "@/components/shared/AnalyticsChart";
import type { AnalyticsData } from "@/types";
import { TrendingUp, TrendingDown, Minus, IndianRupee, PieChart, ShoppingBag } from "lucide-react";

interface AnalyticsViewProps {
  data: AnalyticsData;
  isLoading: boolean;
}

export function AnalyticsView({ data, isLoading }: AnalyticsViewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0c6a54]"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Top Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-md border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
            <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</p>
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            ₹{data.totalRevenue.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-md border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
            <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Total Profit</p>
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            ₹{data.totalProfit.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            Margin: {data.profitMargin.toFixed(1)}%
          </p>
        </div>

        <div className="bg-white rounded-md border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Total Orders</p>
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {data.totalOrders.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-md border border-slate-200 p-6">
          <h3 className="text-[15px] font-bold text-slate-900 mb-6">Revenue Trend</h3>
          <BarChart 
            data={data.revenueData} 
            color="#0c6a54" 
            height={200} 
          />
        </div>

        {/* Profit Chart */}
        <div className="bg-white rounded-md border border-slate-200 p-6">
          <h3 className="text-[15px] font-bold text-slate-900 mb-6">Profit Trend</h3>
          <BarChart 
            data={data.profitData} 
            color="#3b82f6" 
            height={200} 
          />
        </div>
      </div>

      {/* Product Performance Table */}
      <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-[15px] font-bold text-slate-900">Product Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-white border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="px-5 py-3">Product Name</th>
                <th className="px-5 py-3">Units Sold</th>
                <th className="px-5 py-3">Revenue</th>
                <th className="px-5 py-3">Profit</th>
                <th className="px-5 py-3">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.productPerformance.map((item, idx) => (
                <motion.tr 
                  key={item.productId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-5 py-3 font-semibold text-slate-900">{item.productName}</td>
                  <td className="px-5 py-3 text-slate-600">{item.unitsSold}</td>
                  <td className="px-5 py-3 text-slate-600">₹{item.revenue.toLocaleString()}</td>
                  <td className="px-5 py-3 font-medium text-emerald-600">₹{item.profit.toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      {item.trend === "rising" ? (
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                      ) : item.trend === "declining" ? (
                        <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                      ) : (
                        <Minus className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span className={`text-[11px] font-medium ${
                        item.trend === 'rising' ? 'text-emerald-600' :
                        item.trend === 'declining' ? 'text-rose-600' : 'text-slate-500'
                      }`}>
                        {item.trendPercent}%
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
