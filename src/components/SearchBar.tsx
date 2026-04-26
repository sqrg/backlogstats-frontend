import { useState } from "react";
import { SearchInput } from "./ui/SearchInput";
import { Button } from "./ui/Button";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function SearchBar({
  onSearch,
  isLoading,
  placeholder = "Search games…",
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <SearchInput
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
      />
      <Button type="submit" variant="primary" disabled={isLoading}>
        {isLoading ? "Searching…" : "Search"}
      </Button>
    </form>
  );
}
