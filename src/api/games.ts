import type { IGDBGameResult } from "../types/igdb";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export async function searchGames(
  query: string,
  limit = 10,
): Promise<IGDBGameResult[]> {
  const url = `${BASE_URL}/api/v1/games/search?q=${encodeURIComponent(query)}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Request failed: ${res.status}`);
  }
  return res.json();
}
