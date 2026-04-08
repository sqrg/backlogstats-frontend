import { apiFetch } from "./client";
import type { GameType } from "../types/game_type";

export async function getGameTypes(): Promise<GameType[]> {
  const res = await apiFetch("/api/v1/game-types");
  if (!res.ok) throw new Error("Failed to fetch game types");
  return res.json();
}

export async function syncGameTypes(): Promise<GameType[]> {
  const res = await apiFetch("/api/v1/admin/game-types/sync", { method: "POST" });
  if (!res.ok) throw new Error("Failed to sync game types");
  return res.json();
}
