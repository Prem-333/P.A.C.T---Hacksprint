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
    "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  warning:
    "bg-amber-500/10 text-amber-400 border-amber-500/30",
  error:
    "bg-rose-500/10 text-rose-400 border-rose-500/30",
  info:
    "bg-blue-500/10 text-blue-400 border-blue-500/30",
  neutral:
    "bg-slate-500/10 text-slate-400 border-slate-500/30",
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
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${variantStyles[variant]}`}
    >
      {showDot && <span className={`status-dot ${dotStyles[variant]}`} />}
      {icon && <span className="text-sm">{icon}</span>}
      {label}
    </span>
  );
}
