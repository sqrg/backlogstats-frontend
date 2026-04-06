import { useState } from "react";
import { Link } from "react-router-dom";
import { searchGames } from "../api/games";
import { SearchBar } from "../components/SearchBar";
import { GameCard } from "../components/GameCard";
import { useAuth } from "../auth/AuthContext";
import type { IGDBGameResult } from "../types/igdb";

export function SearchPage() {
  const { user, logout } = useAuth();
  const [results, setResults] = useState<IGDBGameResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastQuery, setLastQuery] = useState("");

  async function handleSearch(query: string) {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setLastQuery(query);
    try {
      const data = await searchGames(query);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Backlogstats</h1>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>{user?.email}</span>
          <Link
            to="/collection"
            className="border border-gray-300 rounded px-3 py-1 text-sm hover:bg-gray-50"
          >
            My Collection
          </Link>
          <button
            onClick={logout}
            className="border border-gray-300 rounded px-3 py-1 text-sm hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      </div>
      <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      <div className="mt-6">
        {isLoading && <p className="text-gray-500">Searching…</p>}
        {!isLoading && error && <p className="text-red-500">{error}</p>}
        {!isLoading && !error && hasSearched && results.length === 0 && (
          <p className="text-gray-500">No games found for '{lastQuery}'</p>
        )}
        {!isLoading && !error && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {results.map((game) => (
              <GameCard key={game.igdb_id} game={game} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
