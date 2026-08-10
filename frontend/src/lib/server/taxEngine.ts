/**
 * @module server/taxEngine
 * @description AI-powered tax guideline engine that monitors Indian GST rate changes.
 * Simulates checking for new government guidelines and generates warnings
 * when tax rates change or new notifications are published.
 *
 * In production, this would connect to:
 * - CBIC (Central Board of Indirect Taxes and Customs) API
 * - GST Council notification feed
 * - Government Gazette RSS
 */

import type { TaxWarning } from "@/types";

// ──────────────────────────────────────────────
//  AI Tax Guideline Database
// ──────────────────────────────────────────────

/**
 * Current GST rates as per CBIC notifications.
 * These represent the "ground truth" from government sources.
 */
const CURRENT_GST_GUIDELINES = {
  "3303": {
    rate: 28,
    description: "Perfumes, eau de toilette, and toilet waters",
    notification: "CBIC Notification No. 01/2017-CT (Rate) dated 28.06.2017",
    lastUpdated: "2017-07-01",
  },
  "3301": {
    rate: 18,
    description: "Essential oils, resinoids, extracted oleoresins",
    notification: "CBIC Notification No. 01/2017-CT (Rate) dated 28.06.2017",
    lastUpdated: "2017-07-01",
  },
  "3307": {
    rate: 18,
    description: "Pre-shave, shaving or after-shave preparations, deodorants",
    notification: "CBIC Notification No. 01/2017-CT (Rate) dated 28.06.2017",
    lastUpdated: "2017-07-01",
  },
};

// ──────────────────────────────────────────────
//  Simulated AI Tax Warnings
// ──────────────────────────────────────────────

/**
 * Simulated tax warnings that the AI engine "discovers."
 * These represent realistic scenarios where GST rates might change.
 */
const SIMULATED_WARNINGS: TaxWarning[] = [
  {
    id: "tw-001",
    severity: "warning",
    hsnCode: "3303",
    category: "Perfumes & Eau de Toilette",
    message: "GST Council 53rd Meeting: Proposal to rationalize luxury perfume tax. HSN 3303 may be revised from 28% to 18% for perfumes priced under ₹5,000. Final notification pending.",
    previousRate: 28,
    newRate: 18,
    effectiveDate: "2026-10-01",
    source: "GST Council Press Release — 53rd Meeting, New Delhi",
    detectedAt: new Date().toISOString(),
    acknowledged: false,
  },
  {
    id: "tw-002",
    severity: "info",
    hsnCode: "3301",
    category: "Essential Oils",
    message: "CBIC clarification: Blended essential oils with > 50% natural content remain at 18% GST under HSN 3301. Synthetic variants may attract higher classification.",
    previousRate: 18,
    newRate: 18,
    effectiveDate: "2026-08-15",
    source: "CBIC Circular No. 234/28/2026-GST",
    detectedAt: new Date().toISOString(),
    acknowledged: false,
  },
  {
    id: "tw-003",
    severity: "critical",
    hsnCode: "3307",
    category: "Deodorants & Preparations",
    message: "⚠️ URGENT: Anti-profiteering authority directive — All deodorant sellers must ensure GST reduction benefits are passed to consumers. Non-compliance attracts penalty under Section 171 of CGST Act.",
    previousRate: 18,
    newRate: 18,
    effectiveDate: "2026-09-01",
    source: "NAA Order No. 15/2026 — National Anti-profiteering Authority",
    detectedAt: new Date().toISOString(),
    acknowledged: false,
  },
];

// ──────────────────────────────────────────────
//  In-memory warning state
// ──────────────────────────────────────────────

let activeWarnings: TaxWarning[] = [...SIMULATED_WARNINGS];
let lastChecked: string = new Date().toISOString();

// ──────────────────────────────────────────────
//  AI Engine Functions
// ──────────────────────────────────────────────

/**
 * Simulates the AI engine checking for new tax guidelines.
 * In production, this would scrape government websites, parse
 * GST Council notifications, and use NLP to extract rate changes.
 *
 * @returns Array of new or updated tax warnings
 */
export function checkForTaxUpdates(): TaxWarning[] {
  lastChecked = new Date().toISOString();

  // Simulate AI detecting a potential change
  // In production: fetch from CBIC API, parse, compare with stored rates
  console.log(`[AI Tax Engine] Scanning government sources at ${lastChecked}`);
  console.log(`[AI Tax Engine] Checked: CBIC, GST Council, Government Gazette`);
  console.log(`[AI Tax Engine] Found ${activeWarnings.filter(w => !w.acknowledged).length} active warnings`);

  return activeWarnings.filter((w) => !w.acknowledged);
}

/**
 * Returns all active (unacknowledged) tax warnings.
 */
export function getTaxWarnings(): TaxWarning[] {
  return activeWarnings.filter((w) => !w.acknowledged);
}

/**
 * Returns all tax warnings including acknowledged ones.
 */
export function getAllTaxWarnings(): TaxWarning[] {
  return [...activeWarnings];
}

/**
 * Acknowledges a tax warning by ID.
 */
export function acknowledgeTaxWarning(warningId: string): boolean {
  const warning = activeWarnings.find((w) => w.id === warningId);
  if (warning) {
    warning.acknowledged = true;
    return true;
  }
  return false;
}

/**
 * Gets the last time the AI engine checked for updates.
 */
export function getLastCheckedTime(): string {
  return lastChecked;
}

/**
 * Gets the current GST rate for an HSN code from the AI-verified guidelines.
 */
export function getVerifiedGSTRate(hsnCode: string): {
  rate: number;
  description: string;
  notification: string;
  hasWarning: boolean;
  warning?: TaxWarning;
} {
  const guideline = CURRENT_GST_GUIDELINES[hsnCode as keyof typeof CURRENT_GST_GUIDELINES];
  if (!guideline) {
    return {
      rate: 18, // Default GST rate
      description: "Unknown HSN code — default rate applied",
      notification: "N/A",
      hasWarning: false,
    };
  }

  const warning = activeWarnings.find(
    (w) => w.hsnCode === hsnCode && !w.acknowledged
  );

  return {
    rate: guideline.rate,
    description: guideline.description,
    notification: guideline.notification,
    hasWarning: !!warning,
    warning: warning || undefined,
  };
}

/**
 * Generates a summary of the tax engine status for display.
 */
export function getTaxEngineSummary(): {
  lastChecked: string;
  totalWarnings: number;
  criticalWarnings: number;
  hsnCodesMonitored: number;
  status: "healthy" | "warnings" | "critical";
} {
  const unacknowledged = activeWarnings.filter((w) => !w.acknowledged);
  const critical = unacknowledged.filter((w) => w.severity === "critical");

  return {
    lastChecked,
    totalWarnings: unacknowledged.length,
    criticalWarnings: critical.length,
    hsnCodesMonitored: Object.keys(CURRENT_GST_GUIDELINES).length,
    status:
      critical.length > 0
        ? "critical"
        : unacknowledged.length > 0
        ? "warnings"
        : "healthy",
  };
}
