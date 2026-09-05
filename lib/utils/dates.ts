import { differenceInCalendarDays, parseISO } from "date-fns";

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
