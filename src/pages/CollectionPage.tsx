import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { listCollection, removeFromCollection } from "../api/collection";
import type { CollectionEntry } from "../types/collection";

export function CollectionPage() {
  const [entries, setEntries] = useState<CollectionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listCollection()
      .then(setEntries)
      .catch(() => setError("Failed to load your collection."))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleRemove(id: number) {
    try {
      await removeFromCollection(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch {
      setError("Failed to remove entry.");
    }
  }

  const coverUrl = (coverImageId: string) =>
    `https://images.igdb.com/igdb/image/upload/t_cover_big/${coverImageId}.jpg`;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Collection</h1>
        <Link
          to="/"
          className="border border-gray-300 rounded px-3 py-1 text-sm hover:bg-gray-50"
        >
          Search games
        </Link>
      </div>
      {isLoading && <p className="text-gray-500">Loading your collection…</p>}
      {!isLoading && error && <p className="text-red-500">{error}</p>}
      {!isLoading && !error && entries.length === 0 && (
        <p className="text-gray-500">
          Your collection is empty. Search for games to add some.
        </p>
      )}
      {!isLoading && !error && entries.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="border border-gray-200 rounded p-3 flex flex-col gap-2 text-sm"
            >
              {entry.game.cover_image_id ? (
                <img
                  src={coverUrl(entry.game.cover_image_id)}
                  alt={entry.game.name}
                  className="w-full object-cover rounded"
                />
              ) : (
                <div className="w-full aspect-[227/320] bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                  No cover
                </div>
              )}
              <p className="font-semibold leading-tight">{entry.game.name}</p>
              <p className="text-gray-500">{entry.platform.name}</p>
              <button
                onClick={() => handleRemove(entry.id)}
                className="mt-auto w-full py-1 px-2 rounded border border-gray-300 text-xs hover:bg-gray-50"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
