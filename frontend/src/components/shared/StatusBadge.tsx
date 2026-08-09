"use client";

/**
 * @module StatusBadge
 * @description Reusable status indicator badge with animated dot and label.
 * Used across dashboard views for escrow status, role indicators, and connection state.
 */

import type { EscrowStatus } from "@/types";

type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";

interface StatusBadgeProps {
  /** Text label for the badge. */
  label: string;
  /** Visual variant determining color scheme. */
  variant: BadgeVariant;
  /** Whether to show the animated status dot. */
  showDot?: boolean;
  /** Optional icon to show before the label. */
  icon?: string;
}

/** Maps escrow status to badge variant. */
export function getEscrowBadgeVariant(status: EscrowStatus): BadgeVariant {
  const mapping: Record<EscrowStatus, BadgeVariant> = {
    PENDING: "warning",
    COMPLETED: "success",
    REFUNDED: "error",
    EXPIRING_SOON: "info",
  };
  return mapping[status];
}

const variantStyles: Record<BadgeVariant, string> = {
  success:
    "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning:
    "bg-amber-50 text-amber-700 border-amber-200",
  error:
    "bg-rose-50 text-rose-700 border-rose-200",
  info:
    "bg-blue-50 text-blue-700 border-blue-200",
  neutral:
    "bg-slate-50 text-slate-600 border-slate-200",
};

const dotStyles: Record<BadgeVariant, string> = {
  success: "status-dot-success",
  warning: "status-dot-warning",
  error: "status-dot-error",
  info: "status-dot-info",
  neutral: "status-dot-info",
};

export function StatusBadge({
  label,
  variant,
  showDot = true,
  icon,
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${variantStyles[variant]}`}
    >
      {showDot && <span className={`status-dot ${dotStyles[variant]}`} />}
      {icon && <span className="text-xs">{icon}</span>}
      {label}
    </span>
  );
}
