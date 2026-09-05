import { ReactNode } from "react";

export function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="mb-1 block text-sm font-medium text-[#3E2723]">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-[#C62828]">{error}</p>}
    </div>
  );
}
