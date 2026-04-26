import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

const DEFAULT_ICON = (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#02c39a"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
    <path d="M7 7h.01M12 7h5M7 11h.01M12 11h5" />
  </svg>
);

export function EmptyState({
  icon = DEFAULT_ICON,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-accent/10 border border-accent/25">
        {icon}
      </div>
      <div>
        <p className="font-ui font-semibold text-[1rem] text-text-primary">
          {title}
        </p>
        {description && (
          <p className="font-body text-[0.85rem] text-text-secondary mt-1.5">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
