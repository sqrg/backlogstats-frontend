import { useState } from "react";
import { searchGames } from "../api/games";
import { SearchBar } from "../components/SearchBar";
import { GameCard } from "../components/GameCard";
import { PageShell, PageHeader, EmptyState } from "../components/ui";
import type { IGDBGameResult } from "../types/igdb";

export function SearchPage() {
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
    <PageShell>
      <PageHeader
        title="Search games"
        subtitle="Find a game on IGDB and add it to your collection."
      />

      <div className="pt-6 max-w-2xl">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </div>

      <div className="pt-8">
        {isLoading && (
          <p className="font-body text-text-secondary">Searching…</p>
        )}
        {!isLoading && error && (
          <p className="font-body text-[#e06c75]">{error}</p>
        )}
        {!isLoading && !error && hasSearched && results.length === 0 && (
          <EmptyState
            title={`No games found for "${lastQuery}"`}
            description="Try a different title or check your spelling."
          />
        )}
        {!isLoading && !error && results.length > 0 && (
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {results.map((game) => (
              <GameCard key={game.igdb_id} game={game} />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
