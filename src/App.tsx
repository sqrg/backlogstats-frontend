import { useState } from "react";
import { searchGames } from "./api/games";
import { SearchBar } from "./components/SearchBar";
import { GameCard } from "./components/GameCard";
import type { IGDBGameResult } from "./types/igdb";

function App() {
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
      <h1 className="text-2xl font-bold mb-6">Backlogstats</h1>
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

export default App;
