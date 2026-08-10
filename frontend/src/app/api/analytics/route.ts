/**
 * @module api/analytics
 * @description Returns sales analytics aggregated by period (day/week/month).
 * GET /api/analytics?period=day|week|month
 */

import { NextRequest, NextResponse } from "next/server";
import { getAnalytics } from "@/lib/server/analytics";
import type { AnalyticsPeriod } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") || "week") as AnalyticsPeriod;

    if (!["day", "week", "month"].includes(period)) {
      return NextResponse.json(
        { error: "Invalid period. Use: day, week, or month" },
        { status: 400 }
      );
    }

    const analytics = getAnalytics(period);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
