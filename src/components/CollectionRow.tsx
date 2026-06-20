import { Link } from "react-router-dom";
import type { CollectionEntry } from "../types/collection";
import { StatusPill } from "./StatusPill";
import { PlatformChip, DlcChip } from "./PlatformChip";

interface CollectionRowProps {
  entry: CollectionEntry;
  onRemove?: (id: number) => void;
}

export function CollectionRow({ entry, onRemove }: CollectionRowProps) {
  const status = entry.current_status ?? "NOT_STARTED";
  const isDLC = entry.base_game !== null;

  function handleRemove(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    onRemove?.(entry.id);
  }

  return (
    <Link
      to={`/collection/${entry.id}`}
      className="group relative flex items-center gap-3 rounded-md border border-border bg-surface px-3 py-2 no-underline transition-colors duration-150 hover:border-border-hi hover:bg-[#f4faf8]"
    >
      <span className="flex-1 min-w-0 truncate font-ui font-semibold text-[0.82rem] text-text-primary">
        {entry.game.name}
      </span>

      <div className="flex items-center gap-1.5 shrink-0">
        <PlatformChip name={entry.platform.name} />
        {isDLC && <DlcChip />}
      </div>

      <div className="shrink-0">
        <StatusPill status={status} />
      </div>

      {onRemove && (
        <button
          onClick={handleRemove}
          aria-label={`Remove ${entry.game.name}`}
          className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-surface/90 border border-border-hi text-text-muted opacity-0 group-hover:opacity-100 transition-opacity hover:text-text-primary hover:border-accent"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M1 1L9 9M9 1L1 9" />
          </svg>
        </button>
      )}
    </Link>
  );
}
