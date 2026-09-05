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
    <div className="field">
      <label>{label}</label>
      {children}
      {error && (
        <p className="mt-1 text-xs" style={{ color: "var(--brick)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
