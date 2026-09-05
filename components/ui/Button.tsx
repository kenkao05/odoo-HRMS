import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-ghost",
  danger: "btn-danger",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button className={`btn ${VARIANT_CLASS[variant]} ${className}`} {...props} />
  );
}
