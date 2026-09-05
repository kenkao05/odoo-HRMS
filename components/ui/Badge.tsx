import { statusVariant } from "@/lib/utils/colors";

export function Badge({ status, label }: { status: string; label?: string }) {
  const variant = statusVariant(status);
  return (
    <span className={`pill ${variant}`}>
      <span className="pill-dot" />
      {label ?? status}
    </span>
  );
}
