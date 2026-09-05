export function Spinner({ className = "" }: { className?: string }) {
  return <span className={`ledger-spinner ${className}`} role="status" aria-label="Loading" />;
}
