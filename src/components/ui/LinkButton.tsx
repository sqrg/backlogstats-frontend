import type { ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";

type Variant = "primary" | "secondary" | "ghost";

interface LinkButtonProps extends Omit<LinkProps, "className"> {
  variant?: Variant;
  icon?: ReactNode;
  className?: string;
}

const BASE =
  "inline-flex items-center gap-1.5 font-ui font-semibold text-[0.8rem] rounded no-underline transition-colors";

const VARIANTS: Record<Variant, string> = {
  primary: "text-white bg-accent px-4 py-2 hover:opacity-85",
  secondary:
    "text-text-primary bg-surface border border-border-hi px-3.5 py-2 hover:border-accent",
  ghost:
    "text-text-secondary hover:text-text-primary px-2 py-1 font-medium text-[0.82rem]",
};

export function LinkButton({
  variant = "secondary",
  icon,
  className = "",
  children,
  ...rest
}: LinkButtonProps) {
  return (
    <Link
      className={[BASE, VARIANTS[variant], className].filter(Boolean).join(" ")}
      {...rest}
    >
      {icon}
      {children}
    </Link>
  );
}
