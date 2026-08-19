"use client";

/**
 * @module AnalyticsChart
 * @description Pure CSS/SVG charts for revenue, profit, and cash flow visualization.
 * No external charting library needed.
 */

interface BarChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  formatValue?: (v: number) => string;
}

export function BarChart({ data, color = "var(--color-primary)", height = 160, formatValue }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const fmt = formatValue || ((v: number) => `₹${v.toLocaleString()}`);

  return (
    <div className="w-full" style={{ height }}>
      <div className="flex items-end justify-between gap-1 h-full">
        {data.map((d, i) => {
          const barHeight = (d.value / maxValue) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
              {/* Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-medium text-[var(--color-text-primary)] bg-white shadow-sm border border-[var(--color-border)] rounded px-1.5 py-0.5 whitespace-nowrap">
                {fmt(d.value)}
              </div>
              {/* Bar */}
              <div
                className="w-full rounded-t-md transition-all duration-500 group-hover:opacity-80"
                style={{
                  height: `${Math.max(barHeight, 2)}%`,
                  backgroundColor: color,
                  animationDelay: `${i * 50}ms`,
                }}
              />
              {/* Label */}
              <span className="text-[9px] text-[var(--color-text-muted)] truncate w-full text-center">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface CashFlowChartProps {
  data: { label: string; inflow: number; outflow: number; net: number }[];
  height?: number;
}

export function CashFlowChart({ data, height = 160 }: CashFlowChartProps) {
  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.inflow, d.outflow)),
    1
  );

  return (
    <div className="w-full overflow-visible" style={{ height }}>
      <div className="flex items-end justify-between gap-2 h-full overflow-visible">
        {data.map((d, i) => {
          const inflowH = (d.inflow / maxValue) * 100;
          const outflowH = (d.outflow / maxValue) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group overflow-visible">
              {/* Tooltip — in normal flow, sits right above bars */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-medium bg-white shadow-sm border border-[var(--color-border)] rounded px-1.5 py-0.5 whitespace-nowrap flex flex-col items-center">
                <span className="text-emerald-600">In: ₹{d.inflow.toLocaleString()}</span>
                <span className="text-rose-600">Out: ₹{d.outflow.toLocaleString()}</span>
              </div>
              {/* Bar pair */}
              <div className="flex gap-0.5 items-end w-full" style={{ height: `${Math.max(inflowH, outflowH, 2)}%` }}>
                <div
                  className="flex-1 rounded-t-sm bg-emerald-400 transition-all duration-500 group-hover:opacity-80"
                  style={{ height: `${(Math.max(inflowH, 2) / Math.max(inflowH, outflowH, 2)) * 100}%` }}
                />
                <div
                  className="flex-1 rounded-t-sm bg-rose-400 transition-all duration-500 group-hover:opacity-80"
                  style={{ height: `${(Math.max(outflowH, 2) / Math.max(inflowH, outflowH, 2)) * 100}%` }}
                />
              </div>
              {/* Label */}
              <span className="text-[9px] text-[var(--color-text-muted)] truncate w-full text-center">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-4 justify-center mt-2">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
          <span className="text-[10px] text-[var(--color-text-muted)]">Inflow</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-rose-400" />
          <span className="text-[10px] text-[var(--color-text-muted)]">Outflow</span>
        </div>
      </div>
    </div>
  );
}

interface GaugeProps {
  value: number;
  max?: number;
  label: string;
  color?: string;
  suffix?: string;
}

export function Gauge({ value, max = 100, label, color = "var(--color-primary)", suffix = "%" }: GaugeProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
        {/* Background circle */}
        <circle
          cx="50" cy="50" r="40"
          fill="none"
          stroke="var(--color-surface-subtle)"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <circle
          cx="50" cy="50" r="40"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ marginTop: '25px' }}>
        <span className="text-lg font-bold text-[var(--color-text-primary)]">
          {value.toFixed(1)}{suffix}
        </span>
      </div>
      <span className="text-xs text-[var(--color-text-muted)] mt-1">{label}</span>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: string;
}

export function MetricCard({ label, value, subValue, icon, trend, trendValue, color }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] p-4 hover:shadow-sm transition-shadow flex flex-col h-full">
      <div className="flex items-start justify-between mb-2 min-h-[24px]">
        <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5 mt-0.5">
          {icon && <span className="text-base leading-none">{icon}</span>}
          {label}
        </p>
        {trend && trendValue && (
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
            trend === "up" ? "bg-emerald-50 text-emerald-600" :
            trend === "down" ? "bg-rose-50 text-rose-600" :
            "bg-gray-50 text-gray-600"
          }`}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
          </span>
        )}
      </div>
      <p className={`text-xl font-bold ${color || "text-[var(--color-text-primary)]"}`}>
        {value}
      </p>
      {subValue && (
        <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{subValue}</p>
      )}
    </div>
  );
}
