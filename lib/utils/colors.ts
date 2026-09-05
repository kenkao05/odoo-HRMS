export type PillVariant = "green" | "amber" | "brick" | "slate";

/**
 * Maps a domain status string to a ledger pill variant.
 * Same status -> color mapping as before, just expressed as the
 * design system's pill variants instead of raw hex values.
 */
export function statusVariant(status: string): PillVariant {
  switch (status) {
    case "active":
    case "approved":
    case "paid":
    case "present":
    case "validated":
      return "green";
    case "inactive":
    case "refused":
    case "absent":
    case "missing_checkout":
      return "brick";
    case "pending":
    case "late":
    case "draft":
    case "computed":
      return "amber";
    default:
      return "slate";
  }
}

// Kept for any legacy callers expecting a hex value (e.g. chart series).
export const CHART_COLORS = {
  green: "#2B6E52",
  amber: "#B9812C",
  brick: "#A9432C",
  slate: "#445064",
} as const;
