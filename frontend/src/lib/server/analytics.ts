/**
 * @module server/analytics
 * @description Sales analytics and cash flow aggregation engine.
 * Provides day/week/month views of revenue, profit, product performance.
 * In production, this would query a time-series database.
 */

import type {
  AnalyticsData,
  AnalyticsPeriod,
  DataPoint,
  ProductPerformance,
  CashFlowEntry,
} from "@/types";
import { PRODUCT_CATALOG, calculateGST, RAW_MATERIAL_COST_PERCENT, PLATFORM_FEE_PERCENT } from "./products";

// ──────────────────────────────────────────────
//  In-memory Sales Records
// ──────────────────────────────────────────────

export interface SaleRecord {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  basePrice: number;
  cgst: number;
  sgst: number;
  platformFee: number;
  sellerMargin: number;
  rawMaterialCost: number;
  supplierPayments: { name: string; amount: number }[];
  paymentMethod: "gpay" | "cash";
  timestamp: number;
}

const salesRecords: SaleRecord[] = [];

// ──────────────────────────────────────────────
//  Seed Demo Data
// ──────────────────────────────────────────────

function seedDemoData() {
  if (salesRecords.length > 0) return;

  const now = Date.now();
  const DAY = 86400000;

  // Generate 30 days of demo sales data
  const demoSales: Omit<SaleRecord, "id" | "basePrice" | "cgst" | "sgst" | "platformFee" | "sellerMargin" | "rawMaterialCost" | "supplierPayments">[] = [];

  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const dayTimestamp = now - dayOffset * DAY;
    // Random 1-5 sales per day
    const salesCount = Math.floor(Math.random() * 5) + 1;

    for (let s = 0; s < salesCount; s++) {
      const product = PRODUCT_CATALOG[Math.floor(Math.random() * PRODUCT_CATALOG.length)];
      const qty = Math.floor(Math.random() * 3) + 1;
      const hourOffset = Math.floor(Math.random() * 12) * 3600000;

      demoSales.push({
        productId: product.id,
        productName: product.name,
        quantity: qty,
        totalAmount: product.price * qty,
        paymentMethod: Math.random() > 0.3 ? "gpay" : "cash",
        timestamp: dayTimestamp + hourOffset,
      });
    }
  }

  // Calculate financial breakdowns and push to store
  demoSales.forEach((sale, idx) => {
    const product = PRODUCT_CATALOG.find((p) => p.id === sale.productId)!;
    const gst = calculateGST(sale.totalAmount, product.hsnCode);
    const basePrice = gst.basePrice;
    const platformFee = Math.round(basePrice * (PLATFORM_FEE_PERCENT / 100) * 100) / 100;
    const rawMaterialCost = Math.round(basePrice * (RAW_MATERIAL_COST_PERCENT / 100) * 100) / 100;
    const sellerMargin = Math.round((basePrice - platformFee - rawMaterialCost) * 100) / 100;

    salesRecords.push({
      id: `sale-${idx.toString().padStart(4, "0")}`,
      ...sale,
      basePrice,
      cgst: gst.cgstAmount,
      sgst: gst.sgstAmount,
      platformFee,
      sellerMargin,
      rawMaterialCost,
      supplierPayments: [
        { name: "Fragrance Oil Supplier", amount: Math.round(rawMaterialCost * (product.rawMaterialBreakdown.fragranceOil / 100) * 100) / 100 },
        { name: "Bottle Supplier", amount: Math.round(rawMaterialCost * (product.rawMaterialBreakdown.bottles / 100) * 100) / 100 },
        { name: "Packaging Supplier", amount: Math.round(rawMaterialCost * (product.rawMaterialBreakdown.packaging / 100) * 100) / 100 },
      ],
    });
  });
}

// ──────────────────────────────────────────────
//  Record a new sale
// ──────────────────────────────────────────────

export function recordSale(sale: SaleRecord): void {
  salesRecords.unshift(sale);
}

export function getSalesRecords(): SaleRecord[] {
  return [...salesRecords];
}

// ──────────────────────────────────────────────
//  Analytics Aggregation
// ──────────────────────────────────────────────

function filterByPeriod(period: AnalyticsPeriod): SaleRecord[] {
  const now = Date.now();
  const DAY = 86400000;
  let cutoff: number;

  switch (period) {
    case "day":
      cutoff = now - DAY;
      break;
    case "week":
      cutoff = now - 7 * DAY;
      break;
    case "month":
      cutoff = now - 30 * DAY;
      break;
  }

  return salesRecords.filter((s) => s.timestamp >= cutoff);
}

function getTimeBuckets(period: AnalyticsPeriod): { label: string; start: number; end: number }[] {
  const now = Date.now();
  const DAY = 86400000;
  const buckets: { label: string; start: number; end: number }[] = [];

  switch (period) {
    case "day": {
      // 24 hours, one bucket per 4 hours
      for (let i = 5; i >= 0; i--) {
        const start = now - (i + 1) * 4 * 3600000;
        const end = now - i * 4 * 3600000;
        const h = new Date(end).getHours();
        buckets.push({ label: `${h}:00`, start, end });
      }
      break;
    }
    case "week": {
      // 7 days
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      for (let i = 6; i >= 0; i--) {
        const start = now - (i + 1) * DAY;
        const end = now - i * DAY;
        const d = new Date(end);
        buckets.push({ label: days[d.getDay()], start, end });
      }
      break;
    }
    case "month": {
      // 4 weeks
      for (let i = 3; i >= 0; i--) {
        const start = now - (i + 1) * 7 * DAY;
        const end = now - i * 7 * DAY;
        const d = new Date(end);
        buckets.push({ label: `Week ${4 - i}`, start, end });
      }
      break;
    }
  }

  return buckets;
}

export function getAnalytics(period: AnalyticsPeriod): AnalyticsData {
  // Ensure demo data exists
  seedDemoData();

  const filtered = filterByPeriod(period);
  const buckets = getTimeBuckets(period);

  // Aggregate totals
  const totalRevenue = filtered.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalProfit = filtered.reduce((sum, s) => sum + s.sellerMargin, 0);
  const totalOrders = filtered.length;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Revenue data by time bucket
  const revenueData: DataPoint[] = buckets.map((b) => {
    const bucketSales = filtered.filter((s) => s.timestamp >= b.start && s.timestamp < b.end);
    return {
      label: b.label,
      value: Math.round(bucketSales.reduce((sum, s) => sum + s.totalAmount, 0)),
      timestamp: b.end,
    };
  });

  // Profit data by time bucket
  const profitData: DataPoint[] = buckets.map((b) => {
    const bucketSales = filtered.filter((s) => s.timestamp >= b.start && s.timestamp < b.end);
    return {
      label: b.label,
      value: Math.round(bucketSales.reduce((sum, s) => sum + s.sellerMargin, 0)),
      timestamp: b.end,
    };
  });

  // Product performance
  const productMap = new Map<string, { name: string; units: number; revenue: number; profit: number }>();
  filtered.forEach((s) => {
    const existing = productMap.get(s.productId) || { name: s.productName, units: 0, revenue: 0, profit: 0 };
    existing.units += s.quantity;
    existing.revenue += s.totalAmount;
    existing.profit += s.sellerMargin;
    productMap.set(s.productId, existing);
  });

  const productPerformance: ProductPerformance[] = Array.from(productMap.entries()).map(([id, data]) => {
    // Simulate trend based on random seed
    const trendRoll = Math.random();
    return {
      productId: id,
      productName: data.name,
      unitsSold: data.units,
      revenue: Math.round(data.revenue),
      profit: Math.round(data.profit),
      trend: (trendRoll > 0.6 ? "rising" : trendRoll > 0.3 ? "stable" : "declining") as "rising" | "stable" | "declining",
      trendPercent: Math.round((Math.random() * 25 + 1) * 10) / 10,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Cash flow
  const cashFlow: CashFlowEntry[] = buckets.map((b) => {
    const bucketSales = filtered.filter((s) => s.timestamp >= b.start && s.timestamp < b.end);
    const inflow = Math.round(bucketSales.reduce((sum, s) => sum + s.totalAmount, 0));
    const outflow = Math.round(bucketSales.reduce((sum, s) => sum + s.rawMaterialCost + s.cgst + s.sgst + s.platformFee, 0));
    return {
      label: b.label,
      inflow,
      outflow,
      net: inflow - outflow,
      timestamp: b.end,
    };
  });

  // Top products
  const topProducts = productPerformance.slice(0, 5).map((p) => ({
    name: p.productName,
    revenue: p.revenue,
    units: p.unitsSold,
  }));

  // GST collected
  const gstCollected = {
    cgst: Math.round(filtered.reduce((sum, s) => sum + s.cgst, 0) * 100) / 100,
    sgst: Math.round(filtered.reduce((sum, s) => sum + s.sgst, 0) * 100) / 100,
    total: Math.round(filtered.reduce((sum, s) => sum + s.cgst + s.sgst, 0) * 100) / 100,
  };

  // Supplier payments
  const supplierMap = new Map<string, number>();
  filtered.forEach((s) => {
    s.supplierPayments.forEach((sp) => {
      supplierMap.set(sp.name, (supplierMap.get(sp.name) || 0) + sp.amount);
    });
  });
  const supplierPayments = Array.from(supplierMap.entries()).map(([name, total]) => ({
    name,
    total: Math.round(total * 100) / 100,
  }));

  return {
    period,
    totalRevenue: Math.round(totalRevenue),
    totalProfit: Math.round(totalProfit),
    totalOrders,
    profitMargin: Math.round(profitMargin * 10) / 10,
    revenueData,
    profitData,
    productPerformance,
    cashFlow,
    topProducts,
    gstCollected,
    supplierPayments,
  };
}
