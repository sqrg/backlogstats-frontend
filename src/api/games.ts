import type { IGDBGameResult } from "../types/igdb";
import { apiFetch, BASE_URL } from "./client";

export async function searchGames(
  query: string,
  limit = 10,
): Promise<IGDBGameResult[]> {
  const url = `${BASE_URL}/api/v1/games/search?q=${encodeURIComponent(query)}&limit=${limit}`;
  const res = await apiFetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function importGame(igdbId: number): Promise<void> {
  const url = `${BASE_URL}/api/v1/games/from-igdb`;
  const res = await apiFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ igdb_id: igdbId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Request failed: ${res.status}`);
  }
}
