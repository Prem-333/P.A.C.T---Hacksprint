"use client";

import { motion } from "framer-motion";
import { CashFlowChart } from "@/components/shared/AnalyticsChart";
import type { AnalyticsData } from "@/types";
import { Download, FileText, Banknote, PackageOpen, Truck } from "lucide-react";

interface ReportsViewProps {
  data: AnalyticsData;
  isLoading: boolean;
}

export function ReportsView({ data, isLoading }: ReportsViewProps) {
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
      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Financial Reports</h2>
          <p className="text-[13px] text-slate-500 mt-1">Cash flow and tax breakdown for the current period</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-md text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          <Download className="w-4 h-4 text-slate-500" />
          Export CSV
        </button>
      </div>

      {/* Cash Flow Chart Section */}
      <div className="bg-white rounded-md border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Banknote className="w-5 h-5 text-[#0c6a54]" />
          <h3 className="text-[15px] font-bold text-slate-900">Cash Flow Analysis</h3>
        </div>
        <CashFlowChart data={data.cashFlow} height={220} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GST Collected */}
        <div className="bg-white rounded-md border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <h3 className="text-[14px] font-bold text-slate-900">GST Collected</h3>
          </div>
          <div className="p-5 flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200">
              <span className="text-[13px] text-slate-500 font-medium">CGST</span>
              <span className="text-[14px] font-bold text-slate-900">₹{data.gstCollected.cgst.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200">
              <span className="text-[13px] text-slate-500 font-medium">SGST</span>
              <span className="text-[14px] font-bold text-slate-900">₹{data.gstCollected.sgst.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-3 mt-2 bg-slate-50 rounded px-3">
              <span className="text-[13px] text-slate-700 font-bold">Total Tax Liability</span>
              <span className="text-[15px] font-bold text-rose-600">₹{data.gstCollected.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-md border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
            <PackageOpen className="w-4 h-4 text-slate-500" />
            <h3 className="text-[14px] font-bold text-slate-900">Top Sellers</h3>
          </div>
          <div className="p-5 flex-1">
            <div className="space-y-4">
              {data.topProducts.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-[13px] font-semibold text-slate-900">{product.name}</p>
                      <p className="text-[11px] text-slate-500">{product.units} units</p>
                    </div>
                  </div>
                  <span className="text-[13px] font-bold text-[#0c6a54]">
                    ₹{product.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Supplier Payments */}
        <div className="bg-white rounded-md border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
            <Truck className="w-4 h-4 text-slate-500" />
            <h3 className="text-[14px] font-bold text-slate-900">Supplier Payments</h3>
          </div>
          <div className="p-5 flex-1">
            <div className="space-y-4">
              {data.supplierPayments.map((supplier, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-slate-700">{supplier.name}</span>
                  <span className="text-[13px] font-bold text-slate-900">
                    ₹{supplier.total.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
