import { useState, useEffect } from "react";
import { getGameTypes, syncGameTypes } from "../api/game_types";
import { syncGenres, type Genre } from "../api/genres";
import { listPlatforms, syncPlatforms, type Platform } from "../api/platforms";
import { PageShell } from "../components/ui";
import type { GameType } from "../types/game_type";

interface SectionState<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  success: string | null;
}

function initSection<T>(): SectionState<T> {
  return { items: [], loading: false, error: null, success: null };
}

export function AdminPage() {
  const [gameTypes, setGameTypes] = useState<SectionState<GameType>>(initSection());
  const [genres, setGenres] = useState<SectionState<Genre>>(initSection());
  const [platforms, setPlatforms] = useState<SectionState<Platform>>(initSection());

  useEffect(() => {
    getGameTypes()
      .then((items) => setGameTypes((s) => ({ ...s, items })))
      .catch(() => setGameTypes((s) => ({ ...s, error: "Failed to load game types." })));

    listPlatforms()
      .then((items) => setPlatforms((s) => ({ ...s, items })))
      .catch(() => setPlatforms((s) => ({ ...s, error: "Failed to load platforms." })));
  }, []);

  async function handleSyncGameTypes() {
    setGameTypes((s) => ({ ...s, loading: true, error: null, success: null }));
    try {
      const items = await syncGameTypes();
      setGameTypes({ items, loading: false, error: null, success: "Game types updated." });
    } catch {
      setGameTypes((s) => ({ ...s, loading: false, error: "Failed to sync game types." }));
    }
  }

  async function handleSyncGenres() {
    setGenres((s) => ({ ...s, loading: true, error: null, success: null }));
    try {
      const items = await syncGenres();
      setGenres({ items, loading: false, error: null, success: "Genres updated." });
    } catch {
      setGenres((s) => ({ ...s, loading: false, error: "Failed to sync genres." }));
    }
  }

  async function handleSyncPlatforms() {
    setPlatforms((s) => ({ ...s, loading: true, error: null, success: null }));
    try {
      const items = await syncPlatforms();
      setPlatforms({ items, loading: false, error: null, success: "Platforms updated." });
    } catch {
      setPlatforms((s) => ({ ...s, loading: false, error: "Failed to sync platforms." }));
    }
  }

  return (
    <PageShell>
      <h1 className="text-2xl font-bold mb-8 mt-8">Admin</h1>

      {/* Game Types */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2">Game Types</h2>
        <button
          onClick={handleSyncGameTypes}
          disabled={gameTypes.loading}
          className="border border-gray-300 rounded px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {gameTypes.loading ? "Updating…" : "Update Game Types"}
        </button>
        {gameTypes.error && <p className="mt-2 text-red-500 text-sm">{gameTypes.error}</p>}
        {gameTypes.success && <p className="mt-2 text-green-600 text-sm">{gameTypes.success}</p>}
        {gameTypes.items.length > 0 && (
          <table className="mt-4 w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b border-gray-200">
                <th className="pb-2 pr-4 font-semibold">ID</th>
                <th className="pb-2 font-semibold">Type</th>
              </tr>
            </thead>
            <tbody>
              {gameTypes.items.map((gt) => (
                <tr key={gt.id} className="border-b border-gray-100">
                  <td className="py-2 pr-4 text-gray-500">{gt.id}</td>
                  <td className="py-2">{gt.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Genres */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2">Genres</h2>
        <button
          onClick={handleSyncGenres}
          disabled={genres.loading}
          className="border border-gray-300 rounded px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {genres.loading ? "Updating…" : "Update Genres"}
        </button>
        {genres.error && <p className="mt-2 text-red-500 text-sm">{genres.error}</p>}
        {genres.success && <p className="mt-2 text-green-600 text-sm">{genres.success}</p>}
        {genres.items.length > 0 && (
          <table className="mt-4 w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b border-gray-200">
                <th className="pb-2 pr-4 font-semibold">ID</th>
                <th className="pb-2 font-semibold">Name</th>
              </tr>
            </thead>
            <tbody>
              {genres.items.map((g) => (
                <tr key={g.id} className="border-b border-gray-100">
                  <td className="py-2 pr-4 text-gray-500">{g.id}</td>
                  <td className="py-2">{g.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Platforms */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2">Platforms</h2>
        <button
          onClick={handleSyncPlatforms}
          disabled={platforms.loading}
          className="border border-gray-300 rounded px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {platforms.loading ? "Updating…" : "Update Platforms"}
        </button>
        {platforms.error && <p className="mt-2 text-red-500 text-sm">{platforms.error}</p>}
        {platforms.success && <p className="mt-2 text-green-600 text-sm">{platforms.success}</p>}
        {platforms.items.length > 0 && (
          <table className="mt-4 w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b border-gray-200">
                <th className="pb-2 pr-4 font-semibold">ID</th>
                <th className="pb-2 font-semibold">Name</th>
              </tr>
            </thead>
            <tbody>
              {platforms.items.map((p) => (
                <tr key={p.id} className="border-b border-gray-100">
                  <td className="py-2 pr-4 text-gray-500">{p.id}</td>
                  <td className="py-2">{p.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </PageShell>
  );
}
