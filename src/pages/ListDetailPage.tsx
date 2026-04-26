import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { listCollection } from "../api/collection";
import { PageShell } from "../components/ui";
import { searchGames, importGame } from "../api/games";
import {
  getUserList,
  updateUserList,
  createListEntry,
  deleteListEntry,
} from "../api/user_lists";
import type { UserList } from "../types/user_list";
import type { CollectionEntry } from "../types/collection";
import type { IGDBGameResult } from "../types/igdb";

const coverUrl = (coverImageId: string) =>
  `https://images.igdb.com/igdb/image/upload/t_cover_big/${coverImageId}.jpg`;

const thumbUrl = (coverImageId: string) =>
  `https://images.igdb.com/igdb/image/upload/t_thumb/${coverImageId}.jpg`;

type PickerTab = "collection" | "igdb";

export function ListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [list, setList] = useState<UserList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  // Picker
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTab, setPickerTab] = useState<PickerTab>("collection");

  // Collection tab
  const [collectionEntries, setCollectionEntries] = useState<CollectionEntry[]>([]);
  const [collectionLoading, setCollectionLoading] = useState(false);
  const [pickerFilter, setPickerFilter] = useState("");

  // IGDB tab
  const [igdbQuery, setIgdbQuery] = useState("");
  const [igdbResults, setIgdbResults] = useState<IGDBGameResult[]>([]);
  const [igdbSearching, setIgdbSearching] = useState(false);
  const [addingIgdbId, setAddingIgdbId] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    getUserList(Number(id))
      .then(setList)
      .catch(() => setError("Failed to load list."))
      .finally(() => setIsLoading(false));
  }, [id]);

  async function handleRename() {
    if (!list || !renameValue.trim()) return;
    try {
      const updated = await updateUserList(list.id, { name: renameValue.trim() });
      setList((prev) => (prev ? { ...prev, name: updated.name } : prev));
      setIsRenaming(false);
    } catch {
      setError("Failed to rename list.");
    }
  }

  async function handleTogglePublic() {
    if (!list) return;
    try {
      const updated = await updateUserList(list.id, { is_public: !list.is_public });
      setList((prev) => (prev ? { ...prev, is_public: updated.is_public } : prev));
    } catch {
      setError("Failed to update list.");
    }
  }

  async function handleOpenPicker() {
    setIsPickerOpen(true);
    setPickerTab("collection");
    if (collectionEntries.length === 0) {
      setCollectionLoading(true);
      try {
        const entries = await listCollection();
        setCollectionEntries(entries);
      } finally {
        setCollectionLoading(false);
      }
    }
  }

  function closePicker() {
    setIsPickerOpen(false);
    setPickerFilter("");
    setIgdbQuery("");
    setIgdbResults([]);
  }

  async function handleAddFromCollection(collectionEntry: CollectionEntry) {
    if (!list) return;
    try {
      const newEntry = await createListEntry(list.id, collectionEntry.game.id);
      setList((prev) =>
        prev ? { ...prev, entries: [...prev.entries, newEntry] } : prev,
      );
      closePicker();
    } catch (err: unknown) {
      if ((err as { status?: number }).status === 409) {
        setError("That game is already in this list.");
      } else {
        setError("Failed to add game.");
      }
    }
  }

  async function handleIgdbSearch() {
    if (!igdbQuery.trim()) return;
    setIgdbSearching(true);
    setIgdbResults([]);
    try {
      const results = await searchGames(igdbQuery.trim());
      setIgdbResults(results);
    } catch {
      setError("Search failed.");
    } finally {
      setIgdbSearching(false);
    }
  }

  async function handleAddFromIgdb(game: IGDBGameResult) {
    if (!list) return;
    setAddingIgdbId(game.igdb_id);
    try {
      const { id: gameDbId } = await importGame(game.igdb_id);
      const newEntry = await createListEntry(list.id, gameDbId);
      setList((prev) =>
        prev ? { ...prev, entries: [...prev.entries, newEntry] } : prev,
      );
      closePicker();
    } catch (err: unknown) {
      if ((err as { status?: number }).status === 409) {
        setError("That game is already in this list.");
      } else {
        setError("Failed to add game.");
      }
    } finally {
      setAddingIgdbId(null);
    }
  }

  async function handleRemoveEntry(entryId: number) {
    try {
      await deleteListEntry(entryId);
      setList((prev) =>
        prev
          ? { ...prev, entries: prev.entries.filter((e) => e.id !== entryId) }
          : prev,
      );
    } catch {
      setError("Failed to remove entry.");
    }
  }

  const alreadyInList = new Set(list?.entries.map((e) => e.game_id) ?? []);
  const collectionFiltered = collectionEntries
    .filter((e) => !alreadyInList.has(e.game.id))
    .filter(
      (e) =>
        !pickerFilter ||
        e.game.name.toLowerCase().includes(pickerFilter.toLowerCase()),
    );

  return (
    <PageShell>
      <div className="pt-8">
      {isLoading && <p className="text-gray-500">Loading…</p>}
      {!isLoading && error && <p className="text-red-500 mb-4">{error}</p>}

      {!isLoading && list && (
        <>
          {/* Header */}
          <div className="flex items-start justify-between mb-6 gap-4">
            <div className="flex-1 min-w-0">
              {isRenaming ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    autoFocus
                    className="border border-gray-300 rounded px-3 py-1 text-sm flex-1 min-w-40"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename();
                      if (e.key === "Escape") setIsRenaming(false);
                    }}
                  />
                  <button
                    onClick={handleRename}
                    disabled={!renameValue.trim()}
                    className="px-3 py-1 rounded bg-gray-800 text-white text-sm hover:bg-gray-700 disabled:opacity-40"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsRenaming(false)}
                    className="px-3 py-1 rounded border border-gray-300 text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <h1
                  className="text-2xl font-bold cursor-pointer hover:text-gray-600 truncate"
                  title="Click to rename"
                  onClick={() => {
                    setRenameValue(list.name);
                    setIsRenaming(true);
                  }}
                >
                  {list.name}
                </h1>
              )}
            </div>
            <button
              onClick={handleTogglePublic}
              className={`shrink-0 text-xs px-2 py-1 rounded font-medium border ${
                list.is_public
                  ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-50"
                  : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {list.is_public ? "Public" : "Private"}
            </button>
          </div>

          {/* Add game button */}
          {!isPickerOpen && (
            <button
              onClick={handleOpenPicker}
              className="mb-6 border border-gray-300 rounded px-3 py-1 text-sm hover:bg-gray-50"
            >
              + Add game
            </button>
          )}

          {/* Picker */}
          {isPickerOpen && (
            <div className="mb-6 border rounded bg-white shadow-sm">
              {/* Tabs */}
              <div className="flex border-b">
                {(["collection", "igdb"] as PickerTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setPickerTab(tab)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                      pickerTab === tab
                        ? "border-gray-800 text-gray-900"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab === "collection" ? "My Collection" : "Search IGDB"}
                  </button>
                ))}
              </div>

              <div className="p-3">
                {/* Collection tab */}
                {pickerTab === "collection" && (
                  <>
                    <input
                      type="text"
                      placeholder="Filter by name…"
                      value={pickerFilter}
                      onChange={(e) => setPickerFilter(e.target.value)}
                      autoFocus
                      className="w-full border rounded px-2 py-1 mb-2 text-sm"
                    />
                    {collectionLoading ? (
                      <p className="text-sm text-gray-400 py-2">Loading collection…</p>
                    ) : collectionFiltered.length === 0 ? (
                      <p className="text-sm text-gray-400 py-2">No games to add.</p>
                    ) : (
                      <ul className="max-h-64 overflow-y-auto divide-y">
                        {collectionFiltered.map((entry) => (
                          <li
                            key={entry.id}
                            onClick={() => handleAddFromCollection(entry)}
                            className="flex items-center gap-2 py-2 cursor-pointer hover:bg-gray-50 px-1"
                          >
                            {entry.game.cover_image_id ? (
                              <img
                                src={thumbUrl(entry.game.cover_image_id)}
                                alt={entry.game.name}
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
                  </>
                )}

                {/* IGDB search tab */}
                {pickerTab === "igdb" && (
                  <>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Search for a game…"
                        value={igdbQuery}
                        onChange={(e) => setIgdbQuery(e.target.value)}
                        autoFocus
                        className="flex-1 border rounded px-2 py-1 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleIgdbSearch();
                        }}
                      />
                      <button
                        onClick={handleIgdbSearch}
                        disabled={!igdbQuery.trim() || igdbSearching}
                        className="px-3 py-1 rounded border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-40"
                      >
                        Search
                      </button>
                    </div>
                    {igdbSearching ? (
                      <p className="text-sm text-gray-400 py-2">Searching…</p>
                    ) : igdbResults.length === 0 && igdbQuery ? (
                      <p className="text-sm text-gray-400 py-2">No results.</p>
                    ) : (
                      <ul className="max-h-64 overflow-y-auto divide-y">
                        {igdbResults.map((game) => (
                          <li
                            key={game.igdb_id}
                            onClick={() => !addingIgdbId && handleAddFromIgdb(game)}
                            className={`flex items-center gap-2 py-2 px-1 ${
                              addingIgdbId
                                ? "opacity-50 cursor-default"
                                : "cursor-pointer hover:bg-gray-50"
                            }`}
                          >
                            {game.cover?.image_id ? (
                              <img
                                src={thumbUrl(game.cover.image_id)}
                                alt={game.name}
                                className="w-8 h-10 object-cover rounded"
                              />
                            ) : (
                              <div className="w-8 h-10 bg-gray-100 rounded" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium leading-tight truncate">
                                {game.name}
                              </p>
                              {game.first_release_date && (
                                <p className="text-xs text-gray-500">
                                  {new Date(game.first_release_date * 1000).getFullYear()}
                                </p>
                              )}
                            </div>
                            {addingIgdbId === game.igdb_id && (
                              <span className="text-xs text-gray-400 shrink-0">Adding…</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}

                <button
                  onClick={closePicker}
                  className="text-xs text-gray-400 mt-3 underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Empty state */}
          {list.entries.length === 0 && (
            <p className="text-gray-500 text-sm">
              No games in this list yet. Add some from your collection or search IGDB.
            </p>
          )}

          {/* Entry grid */}
          {list.entries.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {list.entries.map((entry) => (
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
                  <button
                    onClick={() => handleRemoveEntry(entry.id)}
                    className="mt-auto w-full py-1 px-2 rounded border border-gray-300 text-xs hover:bg-gray-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      </div>
    </PageShell>
  );
}
