/**
 * @module server/products
 * @description Perfume product catalog with HSN codes for GST classification.
 * Each product has a raw material breakdown for supplier distribution.
 */

import type { Product, ProductCategory, GSTBreakdown, DistributionBreakdown } from "@/types";

// ──────────────────────────────────────────────
//  Product Catalog — Perfumes
// ──────────────────────────────────────────────

export const PRODUCT_CATALOG: Product[] = [
  {
    id: "prf-001",
    name: "Royal Oud Intense",
    description: "A luxurious blend of aged oud, sandalwood, and amber. Premium long-lasting fragrance for special occasions.",
    price: 2500,
    category: "perfume",
    hsnCode: "3303",
    rawMaterialBreakdown: { fragranceOil: 50, bottles: 30, packaging: 20 },
  },
  {
    id: "prf-002",
    name: "Jasmine Dream EDP",
    description: "Elegant jasmine and white floral notes with a musky base. A signature everyday perfume.",
    price: 1800,
    category: "perfume",
    hsnCode: "3303",
    rawMaterialBreakdown: { fragranceOil: 55, bottles: 25, packaging: 20 },
  },
  {
    id: "prf-003",
    name: "Citrus Splash",
    description: "Fresh bergamot, lemon zest, and grapefruit. A vibrant daytime fragrance for active lifestyles.",
    price: 1200,
    category: "perfume",
    hsnCode: "3303",
    rawMaterialBreakdown: { fragranceOil: 45, bottles: 30, packaging: 25 },
  },
  {
    id: "prf-004",
    name: "Mystic Rose Attar",
    description: "Pure Damascus rose attar blended with vetiver. Traditional Indian perfumery at its finest.",
    price: 3200,
    category: "perfume",
    hsnCode: "3303",
    rawMaterialBreakdown: { fragranceOil: 60, bottles: 20, packaging: 20 },
  },
  {
    id: "ess-001",
    name: "Lavender Essential Oil",
    description: "100% pure lavender essential oil. Calming aromatherapy for relaxation and sleep support.",
    price: 650,
    category: "essential_oil",
    hsnCode: "3301",
    rawMaterialBreakdown: { fragranceOil: 70, bottles: 15, packaging: 15 },
  },
  {
    id: "ess-002",
    name: "Tea Tree Oil Blend",
    description: "Therapeutic-grade tea tree oil with eucalyptus. Natural antiseptic and skin care solution.",
    price: 450,
    category: "essential_oil",
    hsnCode: "3301",
    rawMaterialBreakdown: { fragranceOil: 65, bottles: 20, packaging: 15 },
  },
  {
    id: "deo-001",
    name: "Arctic Fresh Deodorant",
    description: "Long-lasting freshness with mint and marine notes. 48-hour protection, alcohol-free formula.",
    price: 350,
    category: "deodorant",
    hsnCode: "3307",
    rawMaterialBreakdown: { fragranceOil: 35, bottles: 35, packaging: 30 },
  },
  {
    id: "deo-002",
    name: "Sandalwood Mist Deo",
    description: "Premium sandalwood-based deodorant spray. Subtle, sophisticated, all-day confidence.",
    price: 500,
    category: "deodorant",
    hsnCode: "3307",
    rawMaterialBreakdown: { fragranceOil: 40, bottles: 30, packaging: 30 },
  },
];

// ──────────────────────────────────────────────
//  GST Rates by HSN Code (Indian Tax Guidelines)
// ──────────────────────────────────────────────

/**
 * Indian GST rates for perfume-related product categories.
 * Source: CBIC (Central Board of Indirect Taxes and Customs)
 * 
 * HSN 3303 (Perfumes & Eau de Toilette): 28% (14% CGST + 14% SGST)
 * HSN 3301 (Essential Oils): 18% (9% CGST + 9% SGST)
 * HSN 3307 (Deodorants & Preparations): 18% (9% CGST + 9% SGST)
 */
export const GST_RATES: Record<string, { cgst: number; sgst: number; total: number; description: string }> = {
  "3303": { cgst: 14, sgst: 14, total: 28, description: "Perfumes & Eau de Toilette (Luxury)" },
  "3301": { cgst: 9, sgst: 9, total: 18, description: "Essential Oils (Standard)" },
  "3307": { cgst: 9, sgst: 9, total: 18, description: "Deodorants & Body Preparations (Standard)" },
};

/** Platform fee in percentage. */
export const PLATFORM_FEE_PERCENT = 1;

/** Raw material cost as percentage of base price. */
export const RAW_MATERIAL_COST_PERCENT = 40;

// ──────────────────────────────────────────────
//  Calculation Functions
// ──────────────────────────────────────────────

/** Calculates GST breakdown for a given price and HSN code. */
export function calculateGST(price: number, hsnCode: string): GSTBreakdown {
  const rate = GST_RATES[hsnCode];
  if (!rate) {
    throw new Error(`Unknown HSN code: ${hsnCode}`);
  }

  // Price is GST-inclusive
  const totalGSTRate = rate.total / 100;
  const basePrice = price / (1 + totalGSTRate);
  const cgstAmount = basePrice * (rate.cgst / 100);
  const sgstAmount = basePrice * (rate.sgst / 100);

  return {
    basePrice: Math.round(basePrice * 100) / 100,
    cgstRate: rate.cgst,
    sgstRate: rate.sgst,
    cgstAmount: Math.round(cgstAmount * 100) / 100,
    sgstAmount: Math.round(sgstAmount * 100) / 100,
    totalGST: Math.round((cgstAmount + sgstAmount) * 100) / 100,
    totalPrice: price,
  };
}

/** Calculates the full 5-way distribution breakdown for a sale. */
export function calculateDistribution(
  price: number,
  hsnCode: string,
  rawMaterialBreakdown: Product["rawMaterialBreakdown"]
): DistributionBreakdown {
  const gst = calculateGST(price, hsnCode);
  const basePrice = gst.basePrice;

  const platformFee = Math.round(basePrice * (PLATFORM_FEE_PERCENT / 100) * 100) / 100;
  const rawMaterialTotal = Math.round(basePrice * (RAW_MATERIAL_COST_PERCENT / 100) * 100) / 100;
  const sellerMargin = Math.round((basePrice - platformFee - rawMaterialTotal) * 100) / 100;

  const supplierPayments = [
    {
      name: "Fragrance Oil Supplier",
      amount: Math.round(rawMaterialTotal * (rawMaterialBreakdown.fragranceOil / 100) * 100) / 100,
      percentage: rawMaterialBreakdown.fragranceOil,
    },
    {
      name: "Bottle Supplier",
      amount: Math.round(rawMaterialTotal * (rawMaterialBreakdown.bottles / 100) * 100) / 100,
      percentage: rawMaterialBreakdown.bottles,
    },
    {
      name: "Packaging Supplier",
      amount: Math.round(rawMaterialTotal * (rawMaterialBreakdown.packaging / 100) * 100) / 100,
      percentage: rawMaterialBreakdown.packaging,
    },
  ];

  return {
    totalAmount: price,
    basePrice,
    cgst: gst.cgstAmount,
    sgst: gst.sgstAmount,
    platformFee,
    sellerMargin,
    rawMaterialTotal,
    supplierPayments,
  };
}

/** Gets a product by its ID. */
export function getProductById(id: string): Product | undefined {
  return PRODUCT_CATALOG.find((p) => p.id === id);
}

/** Gets all products in a category. */
export function getProductsByCategory(category: ProductCategory): Product[] {
  return PRODUCT_CATALOG.filter((p) => p.category === category);
}
