import type { IGDBGameResult } from "../types/igdb";

interface GameCardProps {
  game: IGDBGameResult;
}

export function GameCard({ game }: GameCardProps) {
  const year = game.first_release_date
    ? new Date(game.first_release_date * 1000).getFullYear()
    : "—";

  const rating = game.total_rating != null ? game.total_rating.toFixed(1) : "—";

  const genres = game.genres.length > 0 ? game.genres.join(", ") : "—";
  const platforms = game.platforms.length > 0 ? game.platforms.join(", ") : "—";

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
      <p className="text-gray-500 truncate" title={genres}>
        {genres}
      </p>
      <p className="text-gray-500 truncate" title={platforms}>
        {platforms}
      </p>
      <p className="text-gray-500">Rating: {rating}</p>
    </div>
  );
}
