"use client";

/**
 * @module LogisticsView
 * @description Logistics & Analytics dashboard — Revenue/profit charts,
 * product performance, cash flow visualization, day/week/month toggle.
 */

import { useState, useEffect, useCallback } from "react";
import { BarChart, CashFlowChart, MetricCard } from "@/components/shared/AnalyticsChart";
import type { AnalyticsData, AnalyticsPeriod } from "@/types";

export function LogisticsView() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("week");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch(`/api/analytics?period=${period}`);
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    setLoading(true);
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading || !analytics) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-3 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin mb-4" />
        <p className="text-sm text-[var(--color-text-muted)]">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Period Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">📊 Logistics & Analytics</h2>
          <p className="text-xs text-[var(--color-text-muted)]">Sales performance, profitability, and cash flow analysis</p>
        </div>
        <div className="flex gap-1 bg-[var(--color-surface-subtle)] rounded-lg p-1 border border-[var(--color-border)]">
          {(["day", "week", "month"] as AnalyticsPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                period === p
                  ? "bg-[var(--color-primary)] text-white shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {p === "day" ? "Today" : p === "week" ? "This Week" : "This Month"}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Revenue"
          value={`₹${analytics.totalRevenue.toLocaleString()}`}
          icon="💰"
          trend="up"
          trendValue="vs last period"
          color="text-[var(--color-primary)]"
        />
        <MetricCard
          label="Total Profit"
          value={`₹${analytics.totalProfit.toLocaleString()}`}
          icon="📈"
          trend={analytics.profitMargin > 40 ? "up" : "down"}
          trendValue={`${analytics.profitMargin}% margin`}
          color="text-emerald-600"
        />
        <MetricCard
          label="Orders"
          value={analytics.totalOrders.toString()}
          icon="🛒"
          subValue={`${period === "day" ? "today" : period === "week" ? "this week" : "this month"}`}
        />
        <MetricCard
          label="GST Collected"
          value={`₹${analytics.gstCollected.total.toLocaleString()}`}
          icon="🏛️"
          subValue={`CGST: ₹${analytics.gstCollected.cgst.toFixed(0)} · SGST: ₹${analytics.gstCollected.sgst.toFixed(0)}`}
          color="text-amber-600"
        />
      </div>

      {/* Revenue & Profit Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">💰 Revenue Trend</h3>
          <BarChart
            data={analytics.revenueData}
            color="var(--color-primary)"
            height={180}
          />
        </div>
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">📈 Profit Trend</h3>
          <BarChart
            data={analytics.profitData}
            color="var(--color-accent-emerald)"
            height={180}
          />
        </div>
      </div>

      {/* Cash Flow */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">💸 Cash Flow (Inflow vs Outflow)</h3>
        <CashFlowChart data={analytics.cashFlow} height={200} />
      </div>

      {/* Product Performance */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">🏆 Product Performance</h3>
        {analytics.productPerformance.length === 0 ? (
          <p className="text-xs text-[var(--color-text-muted)] text-center py-6">No product data available for this period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Units Sold</th>
                  <th>Revenue</th>
                  <th>Profit</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {analytics.productPerformance.map((pp) => (
                  <tr key={pp.productId}>
                    <td className="font-medium text-sm">{pp.productName}</td>
                    <td>{pp.unitsSold}</td>
                    <td className="font-semibold">₹{pp.revenue.toLocaleString()}</td>
                    <td className="text-emerald-600 font-medium">₹{pp.profit.toLocaleString()}</td>
                    <td>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        pp.trend === "rising"
                          ? "bg-emerald-50 text-emerald-600"
                          : pp.trend === "declining"
                          ? "bg-rose-50 text-rose-600"
                          : "bg-gray-50 text-gray-600"
                      }`}>
                        {pp.trend === "rising" ? "↑" : pp.trend === "declining" ? "↓" : "→"}
                        {pp.trendPercent}%
                        <span className="text-[10px] font-normal ml-0.5">
                          {pp.trend === "rising" ? "Growing" : pp.trend === "declining" ? "Declining" : "Stable"}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Supplier Payments & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Supplier Payments */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">📦 Supplier Payments</h3>
          <div className="space-y-3">
            {analytics.supplierPayments.map((sp) => {
              const maxPay = Math.max(...analytics.supplierPayments.map((s) => s.total), 1);
              const widthPct = (sp.total / maxPay) * 100;
              return (
                <div key={sp.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--color-text-secondary)] font-medium">{sp.name}</span>
                    <span className="font-semibold text-[var(--color-text-primary)]">₹{sp.total.toLocaleString()}</span>
                  </div>
                  <div className="h-2.5 bg-[var(--color-surface-subtle)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full transition-all duration-1000"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">⭐ Top Products</h3>
          <div className="space-y-3">
            {analytics.topProducts.map((tp, idx) => (
              <div key={tp.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-surface-subtle)] transition-colors">
                <span className="text-lg font-bold text-[var(--color-text-muted)] w-6 text-center">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">{tp.name}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">{tp.units} units sold</p>
                </div>
                <span className="text-sm font-semibold text-[var(--color-primary)]">
                  ₹{tp.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
