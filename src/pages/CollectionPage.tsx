import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { listCollection, removeFromCollection } from "../api/collection";
import type { CollectionEntry } from "../types/collection";
import type { PlaythroughStatus } from "../types/playthrough";
import { STATUS_LABELS } from "../types/playthrough";

const STATUS_BADGE: Partial<Record<PlaythroughStatus, string>> = {
  PLAYING: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  ON_HOLD: "bg-amber-100 text-amber-700",
  ABANDONED: "bg-gray-200 text-gray-600",
};

const STATUS_ORDER: Record<string, number> = {
  PLAYING: 0,
  ON_HOLD: 1,
  NOT_STARTED: 2,
  COMPLETED: 3,
  ABANDONED: 4,
};

type SortKey = "date_desc" | "name_asc" | "platform_asc" | "status";
type StatusFilter = PlaythroughStatus | "ALL";

function StatusBadge({ status }: { status: PlaythroughStatus | null }) {
  if (!status || status === "NOT_STARTED") return null;
  const cls = STATUS_BADGE[status];
  if (!cls) return null;
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${cls}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PLAYING", label: "Playing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "ABANDONED", label: "Abandoned" },
  { value: "NOT_STARTED", label: "Not Started" },
];

const coverUrl = (coverImageId: string) =>
  `https://images.igdb.com/igdb/image/upload/t_cover_big/${coverImageId}.jpg`;

export function CollectionPage() {
  const [entries, setEntries] = useState<CollectionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [platformFilter, setPlatformFilter] = useState<number | "ALL">("ALL");
  const [sort, setSort] = useState<SortKey>("date_desc");
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 20;

  useEffect(() => {
    listCollection()
      .then(setEntries)
      .catch(() => setError("Failed to load your collection."))
      .finally(() => setIsLoading(false));
  }, []);

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, platformFilter]);

  async function handleRemove(id: number) {
    try {
      await removeFromCollection(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch {
      setError("Failed to remove entry.");
    }
  }

  const platforms = useMemo(() => {
    const seen = new Map<number, string>();
    for (const e of entries) {
      if (!seen.has(e.platform.id)) seen.set(e.platform.id, e.platform.name);
    }
    return [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [entries]);

  const filtered = useMemo(() => {
    let result = entries;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((e) => e.game.name.toLowerCase().includes(q));
    }
    if (statusFilter !== "ALL") {
      result = result.filter(
        (e) => (e.current_status ?? "NOT_STARTED") === statusFilter,
      );
    }
    if (platformFilter !== "ALL") {
      result = result.filter((e) => e.platform.id === platformFilter);
    }

    return [...result].sort((a, b) => {
      if (sort === "name_asc") return a.game.name.localeCompare(b.game.name);
      if (sort === "platform_asc")
        return a.platform.name.localeCompare(b.platform.name);
      if (sort === "status") {
        const sa = STATUS_ORDER[a.current_status ?? "NOT_STARTED"] ?? 2;
        const sb = STATUS_ORDER[b.current_status ?? "NOT_STARTED"] ?? 2;
        return sa - sb;
      }
      // date_desc
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }, [entries, search, statusFilter, platformFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">My Collection</h1>
        <Link
          to="/"
          className="border border-gray-300 rounded px-3 py-1 text-sm hover:bg-gray-50"
        >
          Search games
        </Link>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-3">
        <input
          type="text"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 text-sm flex-1 min-w-40"
        />
        <select
          value={platformFilter === "ALL" ? "ALL" : platformFilter}
          onChange={(e) =>
            setPlatformFilter(
              e.target.value === "ALL" ? "ALL" : Number(e.target.value),
            )
          }
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        >
          <option value="ALL">All platforms</option>
          {platforms.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        >
          <option value="date_desc">Date Added ↓</option>
          <option value="name_asc">Name A–Z</option>
          <option value="platform_asc">Platform</option>
          <option value="status">Status</option>
        </select>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-1 mb-5">
        {STATUS_TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`px-3 py-1 rounded text-sm border transition-colors ${
              statusFilter === value
                ? "bg-gray-800 text-white border-gray-800"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* States */}
      {isLoading && <p className="text-gray-500">Loading your collection…</p>}
      {!isLoading && error && <p className="text-red-500">{error}</p>}
      {!isLoading && !error && entries.length === 0 && (
        <p className="text-gray-500">
          Your collection is empty. Search for games to add some.
        </p>
      )}
      {!isLoading && !error && entries.length > 0 && filtered.length === 0 && (
        <p className="text-gray-500">No games match your filters.</p>
      )}

      {/* Grid */}
      {!isLoading && !error && visible.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {visible.map((entry) => (
            <div
              key={entry.id}
              className="border border-gray-200 rounded p-3 flex flex-col gap-2 text-sm"
            >
              <Link to={`/collection/${entry.id}`} className="block">
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
                <p className="font-semibold leading-tight mt-2">
                  {entry.game.name}
                </p>
              </Link>
              <p className="text-gray-500">{entry.platform.name}</p>
              {entry.base_game && (
                <p className="text-xs text-gray-400">
                  Base: {entry.base_game.game.name}
                </p>
              )}
              <StatusBadge status={entry.current_status} />
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

      {/* Pagination */}
      {!isLoading && !error && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50"
          >
            Prev
          </button>
          <span className="text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
