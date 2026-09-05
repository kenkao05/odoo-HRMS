import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base =
    "px-4 py-2 rounded-md text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: Record<Variant, string> = {
    primary: "bg-[#6B4226] text-[#F5EFE0] hover:bg-[#3E2723]",
    secondary:
      "bg-transparent border border-[#6B4226] text-[#6B4226] hover:bg-[#F5EFE0]",
    danger: "bg-[#C62828] text-white hover:bg-[#a32020]",
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
