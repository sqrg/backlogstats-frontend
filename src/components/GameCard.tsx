import { useState } from "react";
import { Link } from "react-router-dom";
import { importGame } from "../api/games";
import { addToCollection, importDlc } from "../api/collection";
import { PlatformPicker } from "./PlatformPicker";
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
    : "—";

  const rating = game.total_rating != null ? game.total_rating.toFixed(1) : "—";

  const genres = game.genres.length > 0 ? game.genres.join(", ") : "—";
  const gamePlatforms =
    game.platforms.length > 0
      ? game.platforms.map((p) => p.name).join(", ")
      : "—";

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
    <div className="border border-gray-200 rounded p-3 flex flex-col gap-2 text-sm">
      {game.cover ? (
        <img
          src={game.cover.url_cover_big}
          alt={game.name}
          className="w-full object-cover rounded"
        />
      ) : (
        <div className="w-full aspect-[227/320] bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
          No cover
        </div>
      )}
      <p className="font-semibold leading-tight">{game.name}</p>
      <p className="text-gray-500">{year}</p>
      {game.game_type && (
        <p className="text-gray-500 text-xs">{game.game_type}</p>
      )}
      <p className="text-gray-500 truncate" title={genres}>
        {genres}
      </p>
      <p className="text-gray-500 truncate" title={gamePlatforms}>
        {gamePlatforms}
      </p>
      <p className="text-gray-500">Rating: {rating}</p>
      {game.series.length > 0 && (
        <p className="text-gray-500 truncate text-xs">
          {game.series.map((s, i) => (
            <span key={s.igdb_id}>
              {i > 0 && ", "}
              <Link
                to={`/series/${s.igdb_id}`}
                className="underline hover:text-gray-700"
              >
                {s.name}
              </Link>
            </span>
          ))}
        </p>
      )}
      {addSuccess ? (
        <p className="text-green-600 text-xs font-medium">{successMessage}</p>
      ) : (
        <>
          <button
            onClick={() => setIsPickerOpen((o) => !o)}
            disabled={isAdding}
            className="mt-auto w-full py-1 px-2 rounded border border-gray-300 text-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to collection
          </button>
          {game.dlcs.length > 0 && (
            <label className="flex items-center gap-2 text-xs mt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={addDlc}
                onChange={(e) => setAddDlc(e.target.checked)}
              />
              Also add {game.dlcs.length} DLC to collection
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
  );
}
