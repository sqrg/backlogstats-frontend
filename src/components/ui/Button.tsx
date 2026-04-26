import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
}

const BASE =
  "inline-flex items-center gap-1.5 font-ui font-semibold text-[0.8rem] rounded transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const VARIANTS: Record<Variant, string> = {
  primary:
    "text-white bg-accent px-4 py-2 hover:opacity-85 disabled:hover:opacity-60",
  secondary:
    "text-text-primary bg-surface border border-border-hi px-3.5 py-2 hover:border-accent disabled:hover:border-border-hi",
  ghost:
    "text-text-secondary hover:text-text-primary px-2 py-1 font-medium text-[0.82rem]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", icon, className = "", children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={[BASE, VARIANTS[variant], className].filter(Boolean).join(" ")}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
});
