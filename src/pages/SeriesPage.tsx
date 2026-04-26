import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getSeriesByIgdbId } from "../api/series";
import { PageShell } from "../components/ui";
import type { SeriesDetail } from "../types/series";

export function SeriesPage() {
  const { igdbId } = useParams<{ igdbId: string }>();
  const [series, setSeries] = useState<SeriesDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!igdbId) return;
    getSeriesByIgdbId(Number(igdbId))
      .then(setSeries)
      .catch(() => setError("Series not found."))
      .finally(() => setIsLoading(false));
  }, [igdbId]);

  const coverUrl = (coverImageId: string) =>
    `https://images.igdb.com/igdb/image/upload/t_cover_big/${coverImageId}.jpg`;

  return (
    <PageShell>
      <h1 className="text-2xl font-bold mb-6 mt-8">
        {series ? series.name : "Series"}
      </h1>

      {isLoading && <p className="text-gray-500">Loading…</p>}
      {!isLoading && error && <p className="text-red-500">{error}</p>}
      {!isLoading && !error && series && series.games.length === 0 && (
        <p className="text-gray-500">No imported games in this series yet.</p>
      )}
      {!isLoading && !error && series && series.games.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {series.games.map((game) => (
            <div
              key={game.id}
              className="border border-gray-200 rounded p-3 flex flex-col gap-2 text-sm"
            >
              {game.cover_image_id ? (
                <img
                  src={coverUrl(game.cover_image_id)}
                  alt={game.name}
                  className="w-full object-cover rounded"
                />
              ) : (
                <div className="w-full aspect-[227/320] bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                  No cover
                </div>
              )}
              <p className="font-semibold leading-tight">{game.name}</p>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
