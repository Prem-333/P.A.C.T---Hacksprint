/**
 * @module api/tax-warnings
 * @description Returns active tax guideline warnings from the AI engine.
 * GET /api/tax-warnings — Get active warnings
 * POST /api/tax-warnings — Acknowledge a warning
 */

import { NextRequest, NextResponse } from "next/server";
import {
  checkForTaxUpdates,
  getTaxWarnings,
  acknowledgeTaxWarning,
  getTaxEngineSummary,
} from "@/lib/server/taxEngine";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Trigger AI check for new guidelines
    checkForTaxUpdates();

    const warnings = getTaxWarnings();
    const summary = getTaxEngineSummary();

    return NextResponse.json({
      warnings,
      summary,
    });
  } catch (error) {
    console.error("Tax warnings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tax warnings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { warningId } = body;

    if (!warningId) {
      return NextResponse.json(
        { error: "warningId is required" },
        { status: 400 }
      );
    }

    const acknowledged = acknowledgeTaxWarning(warningId);

    if (!acknowledged) {
      return NextResponse.json(
        { error: "Warning not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Tax warning acknowledged",
    });
  } catch (error) {
    console.error("Tax warning acknowledge error:", error);
    return NextResponse.json(
      { error: "Failed to acknowledge warning" },
      { status: 500 }
    );
  }
}
