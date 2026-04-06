import type { SeriesDetail } from "../types/series";
import { apiFetch, BASE_URL } from "./client";

export async function getSeriesByIgdbId(igdbId: number): Promise<SeriesDetail> {
  const url = `${BASE_URL}/api/v1/series/igdb/${igdbId}`;
  const res = await apiFetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Request failed: ${res.status}`);
  }
  return res.json();
}
