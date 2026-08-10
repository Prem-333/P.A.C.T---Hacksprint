/**
 * @module api/products
 * @description Returns the perfume product catalog with GST information.
 * GET /api/products
 */

import { NextResponse } from "next/server";
import { PRODUCT_CATALOG, calculateGST, calculateDistribution, GST_RATES } from "@/lib/server/products";
import { getTaxWarnings } from "@/lib/server/taxEngine";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const warnings = getTaxWarnings();

    const productsWithTax = PRODUCT_CATALOG.map((product) => {
      const gst = calculateGST(product.price, product.hsnCode);
      const distribution = calculateDistribution(product.price, product.hsnCode, product.rawMaterialBreakdown);
      const gstRate = GST_RATES[product.hsnCode];

      // Check if there's a tax warning for this product's HSN code
      const productWarning = warnings.find((w) => w.hsnCode === product.hsnCode);

      return {
        ...product,
        gstBreakdown: gst,
        distribution,
        gstRateInfo: gstRate,
        hasWarning: !!productWarning,
        warning: productWarning || null,
      };
    });

    return NextResponse.json({
      products: productsWithTax,
      totalProducts: productsWithTax.length,
      activeWarnings: warnings.length,
    });
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
