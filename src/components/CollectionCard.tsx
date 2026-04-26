import { Link } from "react-router-dom";
import type { CollectionEntry } from "../types/collection";
import { CoverArt } from "./CoverArt";
import { StatusPill } from "./StatusPill";
import { PlatformChip, DlcChip } from "./PlatformChip";

interface CollectionCardProps {
  entry: CollectionEntry;
  onRemove?: (id: number) => void;
}

export function CollectionCard({ entry, onRemove }: CollectionCardProps) {
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
      className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-surface no-underline shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all duration-150 hover:-translate-y-0.5 hover:border-border-hi hover:bg-[#f4faf8] hover:shadow-[0_4px_20px_rgba(2,128,144,0.12)]"
    >
      {onRemove && (
        <button
          onClick={handleRemove}
          aria-label={`Remove ${entry.game.name}`}
          className="absolute top-2 right-2 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-surface/90 border border-border-hi text-text-muted opacity-0 group-hover:opacity-100 transition-opacity hover:text-text-primary hover:border-accent"
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

      <CoverArt coverImageId={entry.game.cover_image_id} name={entry.game.name} />

      <div className="flex-1 flex flex-col gap-1.5 p-[10px_11px_11px]">
        <span className="font-ui font-semibold text-[0.78rem] text-text-primary leading-tight line-clamp-2">
          {entry.game.name}
        </span>

        <div className="flex items-center gap-1.5 flex-wrap mt-auto">
          <PlatformChip name={entry.platform.name} />
          {isDLC && <DlcChip />}
        </div>

        <StatusPill status={status} />
      </div>
    </Link>
  );
}
