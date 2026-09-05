import { statusColor } from "@/lib/utils/colors";

export function Badge({ status, label }: { status: string; label?: string }) {
  const color = statusColor(status);
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
      style={{ backgroundColor: color }}
    >
      {label ?? status}
    </span>
  );
}
