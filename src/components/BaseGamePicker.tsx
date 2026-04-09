import { useState, useEffect } from "react";
import { listCollection } from "../api/collection";
import type { CollectionEntry } from "../types/collection";

const coverUrl = (coverImageId: string) =>
  `https://images.igdb.com/igdb/image/upload/t_thumb/${coverImageId}.jpg`;

interface BaseGamePickerProps {
  excludeEntryId: number;
  onSelect: (entry: CollectionEntry) => void;
  onCancel: () => void;
}

export function BaseGamePicker({
  excludeEntryId,
  onSelect,
  onCancel,
}: BaseGamePickerProps) {
  const [entries, setEntries] = useState<CollectionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    listCollection()
      .then((data) => setEntries(data.filter((e) => e.id !== excludeEntryId)))
      .finally(() => setIsLoading(false));
  }, [excludeEntryId]);

  const filtered = filter
    ? entries.filter((e) =>
        e.game.name.toLowerCase().includes(filter.toLowerCase()),
      )
    : entries;

  return (
    <div className="border rounded p-3 mt-2 bg-white shadow-sm">
      <input
        type="text"
        placeholder="Filter by name…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full border rounded px-2 py-1 mb-2 text-sm"
      />
      {isLoading ? (
        <p className="text-sm text-gray-400 py-2">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-400 py-2">No games in your collection</p>
      ) : (
        <ul className="max-h-64 overflow-y-auto divide-y">
          {filtered.map((entry) => (
            <li
              key={entry.id}
              onClick={() => onSelect(entry)}
              className="flex items-center gap-2 py-2 cursor-pointer hover:bg-gray-50 px-1"
            >
              {entry.game.cover_image_id ? (
                <img
                  src={coverUrl(entry.game.cover_image_id)}
                  className="w-8 h-10 object-cover rounded"
                />
              ) : (
                <div className="w-8 h-10 bg-gray-100 rounded" />
              )}
              <div>
                <p className="text-sm font-medium leading-tight">
                  {entry.game.name}
                </p>
                <p className="text-xs text-gray-500">{entry.platform.name}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={onCancel}
        className="text-xs text-gray-400 mt-2 underline"
      >
        Cancel
      </button>
    </div>
  );
}
