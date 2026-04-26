import { useState } from "react";
import { Link } from "react-router-dom";
import { importGame } from "../api/games";
import { addToCollection, importDlc } from "../api/collection";
import { PlatformPicker } from "./PlatformPicker";
import { CoverArt } from "./CoverArt";
import { Button } from "./ui/Button";
import type { IGDBGameResult } from "../types/igdb";

interface GameCardProps {
  game: IGDBGameResult;
}

export function GameCard({ game }: GameCardProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [addDlc, setAddDlc] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const year = game.first_release_date
    ? new Date(game.first_release_date * 1000).getFullYear()
    : null;

  const rating = game.total_rating != null ? game.total_rating.toFixed(1) : null;

  async function handleAdd(platformId: number) {
    setIsAdding(true);
    try {
      const imported = await importGame(game.igdb_id);
      const entry = await addToCollection(imported.id, platformId);
      setIsPickerOpen(false);
      let dlcCount = 0;
      if (addDlc && game.dlcs.length > 0) {
        const dlcEntries = await importDlc(entry.id, game.dlcs);
        dlcCount = dlcEntries.length;
      }
      setSuccessMessage(
        dlcCount > 0
          ? `Game added · ${dlcCount} DLC also added`
          : "Game added to collection",
      );
      setAddSuccess(true);
    } finally {
      setIsAdding(false);
      setAddDlc(false);
    }
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all duration-150 hover:border-border-hi hover:shadow-[0_4px_20px_rgba(2,128,144,0.12)]">
      <CoverArt
        coverImageId={game.cover?.image_id ?? null}
        name={game.name}
      />

      <div className="flex-1 flex flex-col gap-1.5 p-[10px_11px_11px] text-[0.72rem]">
        <p className="font-ui font-semibold text-[0.78rem] text-text-primary leading-tight line-clamp-2">
          {game.name}
        </p>

        <div className="flex items-center gap-2 text-text-secondary font-body">
          {year && <span className="font-mono">{year}</span>}
          {rating && (
            <>
              <span className="text-text-muted">·</span>
              <span className="font-mono">{rating}</span>
            </>
          )}
          {game.game_type && year === null && rating === null && (
            <span>{game.game_type}</span>
          )}
        </div>

        {game.game_type && (year || rating) && (
          <p className="text-text-muted text-[0.65rem]">{game.game_type}</p>
        )}

        {game.genres.length > 0 && (
          <p
            className="text-text-muted truncate"
            title={game.genres.join(", ")}
          >
            {game.genres.join(", ")}
          </p>
        )}

        {game.series.length > 0 && (
          <p className="text-text-muted truncate text-[0.65rem]">
            {game.series.map((s, i) => (
              <span key={s.igdb_id}>
                {i > 0 && ", "}
                <Link
                  to={`/series/${s.igdb_id}`}
                  className="underline hover:text-text-secondary"
                >
                  {s.name}
                </Link>
              </span>
            ))}
          </p>
        )}

        <div className="mt-auto pt-1">
          {addSuccess ? (
            <p className="text-accent text-[0.7rem] font-medium">
              {successMessage}
            </p>
          ) : (
            <>
              <Button
                onClick={() => setIsPickerOpen((o) => !o)}
                disabled={isAdding}
                className="w-full justify-center !text-[0.7rem] !py-1"
              >
                Add to collection
              </Button>
              {game.dlcs.length > 0 && (
                <label className="flex items-center gap-1.5 text-[0.65rem] mt-1.5 cursor-pointer text-text-secondary">
                  <input
                    type="checkbox"
                    checked={addDlc}
                    onChange={(e) => setAddDlc(e.target.checked)}
                    className="accent-accent"
                  />
                  Also add {game.dlcs.length} DLC
                </label>
              )}
              {isPickerOpen && (
                <PlatformPicker
                  platforms={game.platforms.map((p) => ({
                    id: p.db_id,
                    name: p.name,
                  }))}
                  onAdd={handleAdd}
                  isLoading={isAdding}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
