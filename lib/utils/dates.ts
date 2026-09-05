import {
  differenceInCalendarDays,
  parseISO,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
} from "date-fns";

export function daysUntil(dateStr: string): number {
  return differenceInCalendarDays(parseISO(dateStr), new Date());
}

export function isContractNeedingAttention(
  endDate: string | null,
  status: string,
): boolean {
  if (status !== "active" || !endDate) return false;
  const days = daysUntil(endDate);
  return days >= 0 && days <= 30;
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export type DashboardPeriod =
  | "this_month"
  | "last_month"
  | "this_quarter"
  | "this_year";

/** Maps a dashboard period selector to a concrete date range.
 *  Returns null for "all time" (no period selected). */
export function periodToRange(
  period: DashboardPeriod | undefined,
  now: Date = new Date(),
): { from: Date; to: Date } | null {
  switch (period) {
    case "this_month":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "last_month": {
      const lastMonth = subMonths(now, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    }
    case "this_quarter":
      return { from: startOfQuarter(now), to: endOfQuarter(now) };
    case "this_year":
      return { from: startOfYear(now), to: endOfYear(now) };
    default:
      return null;
  }
}