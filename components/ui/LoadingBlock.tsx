import { Spinner } from "./Spinner";

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex items-center justify-center gap-2 py-12 text-sm"
      style={{ color: "var(--ink-faint)" }}
    >
      <Spinner />
      <span>{label}</span>
    </div>
  );
}
