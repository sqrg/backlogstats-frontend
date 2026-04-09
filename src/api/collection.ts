import { apiFetch } from "./client";
import { BASE_URL } from "./client";
import type {
  CollectionEntry,
  CollectionEntryDetail,
} from "../types/collection";

export async function getCollectionEntry(
  id: number,
): Promise<CollectionEntryDetail> {
  const res = await apiFetch(`${BASE_URL}/api/v1/collection/${id}`);
  if (!res.ok) throw new Error("Failed to fetch collection entry");
  return res.json();
}

export async function listCollection(): Promise<CollectionEntry[]> {
  const res = await apiFetch(`${BASE_URL}/api/v1/collection/`);
  if (!res.ok) throw new Error("Failed to fetch collection");
  return res.json();
}

export async function addToCollection(
  gameId: number,
  platformId: number,
): Promise<CollectionEntry> {
  const res = await apiFetch(`${BASE_URL}/api/v1/collection/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ game_id: gameId, platform_id: platformId }),
  });
  if (res.status === 409) {
    const err = new Error(
      "Already in your collection on this platform",
    ) as Error & { status: number };
    err.status = 409;
    throw err;
  }
  if (!res.ok) throw new Error("Failed to add to collection");
  return res.json();
}

export async function setBaseGame(
  entryId: number,
  baseGameEntryId: number | null,
): Promise<CollectionEntry> {
  const res = await apiFetch(
    `${BASE_URL}/api/v1/collection/${entryId}/base-game`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base_game_entry_id: baseGameEntryId }),
    },
  );
  if (!res.ok) throw new Error("Failed to update base game");
  return res.json();
}

export async function importDlc(
  baseEntryId: number,
  igdbIds: number[],
): Promise<CollectionEntry[]> {
  const res = await apiFetch(
    `${BASE_URL}/api/v1/collection/${baseEntryId}/import-dlc`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ igdb_ids: igdbIds }),
    },
  );
  if (!res.ok) throw new Error("Failed to import DLC");
  return res.json();
}

export async function removeFromCollection(id: number): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/api/v1/collection/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to remove from collection");
}
