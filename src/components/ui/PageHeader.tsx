import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  divider?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  divider = true,
}: PageHeaderProps) {
  return (
    <div
      className={[
        "flex items-end justify-between gap-4 pt-8 pb-5",
        divider ? "border-b border-border" : "",
      ].join(" ")}
    >
      <div>
        <h1 className="font-ui font-bold text-2xl text-text-primary tracking-[-0.03em] leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="font-body text-[0.82rem] text-text-secondary mt-1.5">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex gap-2 items-center shrink-0">{actions}</div>
      )}
    </div>
  );
}
