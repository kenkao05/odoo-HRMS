export const COLORS = {
  cream: "#F5EFE0",
  card: "#FAF6EC",
  brown: "#6B4226",
  darkBrown: "#3E2723",
  green: "#2E7D32",
  red: "#C62828",
  amber: "#F9A825",
  terracotta: "#C1652F",
  olive: "#7A8450",
  gold: "#C9A227",
} as const;

export function statusColor(status: string): string {
  switch (status) {
    case "active":
    case "approved":
    case "paid":
    case "present":
    case "validated":
      return COLORS.green;
    case "inactive":
    case "refused":
    case "absent":
    case "missing_checkout":
      return COLORS.red;
    case "pending":
    case "late":
    case "draft":
    case "computed":
      return COLORS.amber;
    default:
      return COLORS.brown;
  }
}
