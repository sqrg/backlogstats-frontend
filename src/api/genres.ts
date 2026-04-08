import { apiFetch } from "./client";

export interface Genre {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export async function syncGenres(): Promise<Genre[]> {
  const res = await apiFetch("/api/v1/admin/genres/sync", { method: "POST" });
  if (!res.ok) throw new Error("Failed to sync genres");
  return res.json();
}
