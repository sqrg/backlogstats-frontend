interface PaginationProps {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}

export function Pagination({ page, totalPages, onPage }: PaginationProps) {
  if (totalPages <= 1) return null;
  const visible: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) visible.push(i);
  }

  const navBtn =
    "bg-surface border border-border-hi font-ui text-[0.8rem] px-3.5 py-[7px] rounded transition-colors text-text-primary hover:border-accent disabled:text-text-muted disabled:cursor-not-allowed disabled:hover:border-border-hi";

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10 pb-4">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className={navBtn}
      >
        ← Prev
      </button>

      <div className="flex gap-1 items-center">
        {visible.map((p, i) => {
          const prev = visible[i - 1];
          const showEllipsis = prev !== undefined && p - prev > 1;
          const isActive = p === page;
          return (
            <span key={p} className="flex items-center gap-1">
              {showEllipsis && (
                <span className="text-text-muted text-[0.8rem] px-0.5">…</span>
              )}
              <button
                onClick={() => onPage(p)}
                className={[
                  "w-[34px] h-[34px] flex items-center justify-center font-mono font-medium text-[0.78rem] rounded transition-colors",
                  isActive
                    ? "border border-accent text-accent bg-accent/10"
                    : "border border-border-hi text-text-secondary bg-surface hover:border-accent",
                ].join(" ")}
              >
                {p}
              </button>
            </span>
          );
        })}
      </div>

      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className={navBtn}
      >
        Next →
      </button>

      <span className="ml-2 font-mono text-[0.72rem] text-text-muted">
        Page {page} of {totalPages}
      </span>
    </div>
  );
}
