import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { listUserLists, createUserList, deleteUserList } from "../api/user_lists";
import type { UserList } from "../types/user_list";

export function ListsPage() {
  const [lists, setLists] = useState<UserList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIsPublic, setNewIsPublic] = useState(false);

  useEffect(() => {
    listUserLists()
      .then(setLists)
      .catch(() => setError("Failed to load your lists."))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleCreate() {
    if (!newName.trim()) return;
    try {
      const list = await createUserList(newName.trim(), newIsPublic);
      setLists((prev) => [list, ...prev]);
      setIsCreating(false);
      setNewName("");
      setNewIsPublic(false);
    } catch {
      setError("Failed to create list.");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteUserList(id);
      setLists((prev) => prev.filter((l) => l.id !== id));
    } catch {
      setError("Failed to delete list.");
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Lists</h1>
        <Link
          to="/collection"
          className="border border-gray-300 rounded px-3 py-1 text-sm hover:bg-gray-50"
        >
          My Collection
        </Link>
      </div>

      {/* New list button / inline form */}
      {!isCreating ? (
        <button
          onClick={() => setIsCreating(true)}
          className="mb-6 border border-gray-300 rounded px-3 py-1 text-sm hover:bg-gray-50"
        >
          + New list
        </button>
      ) : (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="List name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
            className="border border-gray-300 rounded px-3 py-1 text-sm flex-1 min-w-40"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") setIsCreating(false);
            }}
          />
          <label className="flex items-center gap-1 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={newIsPublic}
              onChange={(e) => setNewIsPublic(e.target.checked)}
              className="rounded"
            />
            Public
          </label>
          <button
            onClick={handleCreate}
            disabled={!newName.trim()}
            className="px-3 py-1 rounded bg-gray-800 text-white text-sm hover:bg-gray-700 disabled:opacity-40"
          >
            Save
          </button>
          <button
            onClick={() => {
              setIsCreating(false);
              setNewName("");
              setNewIsPublic(false);
            }}
            className="px-3 py-1 rounded border border-gray-300 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      )}

      {/* States */}
      {isLoading && <p className="text-gray-500">Loading your lists…</p>}
      {!isLoading && error && <p className="text-red-500">{error}</p>}
      {!isLoading && !error && lists.length === 0 && (
        <p className="text-gray-500">No lists yet. Create one to get started.</p>
      )}

      {/* List cards */}
      {!isLoading && !error && lists.length > 0 && (
        <div className="flex flex-col gap-3">
          {lists.map((list) => (
            <div
              key={list.id}
              className="border border-gray-200 rounded p-4 flex items-center justify-between gap-4"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <Link
                  to={`/lists/${list.id}`}
                  className="font-semibold hover:underline truncate"
                >
                  {list.name}
                </Link>
                <p className="text-sm text-gray-500">
                  {list.entries.length} {list.entries.length === 1 ? "game" : "games"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-xs px-2 py-0.5 rounded font-medium ${
                    list.is_public
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {list.is_public ? "Public" : "Private"}
                </span>
                <button
                  onClick={() => handleDelete(list.id)}
                  className="py-1 px-2 rounded border border-gray-300 text-xs hover:bg-gray-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
