"use client";

/**
 * @module TaxWarningBanner
 * @description Animated warning banner displayed when the AI tax engine
 * detects changes in Indian GST guidelines. Shows severity-coded alerts
 * with dismiss functionality.
 */

import { useState } from "react";
import type { TaxWarning } from "@/types";

interface TaxWarningBannerProps {
  warnings: TaxWarning[];
  onAcknowledge?: (warningId: string) => void;
}

export function TaxWarningBanner({ warnings, onAcknowledge }: TaxWarningBannerProps) {
  return null;
}
