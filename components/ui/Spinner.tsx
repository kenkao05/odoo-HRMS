export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#6B4226] border-t-transparent ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}