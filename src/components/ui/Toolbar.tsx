import type { ReactNode } from "react";

interface ToolbarProps {
  children: ReactNode;
  trailing?: ReactNode;
}

export function Toolbar({ children, trailing }: ToolbarProps) {
  return (
    <div className="flex gap-2.5 items-center flex-wrap pt-4 pb-5">
      {children}
      {trailing && (
        <span className="ml-auto font-mono text-[0.72rem] text-text-muted shrink-0">
          {trailing}
        </span>
      )}
    </div>
  );
}
