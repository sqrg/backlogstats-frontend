import { apiFetch, BASE_URL } from "./client";
import type {
  Playthrough,
  PlaythroughCreate,
  PlaythroughUpdate,
} from "../types/playthrough";

export async function createPlaythrough(
  collectionEntryId: number,
  data: PlaythroughCreate,
): Promise<Playthrough> {
  const res = await apiFetch(
    `${BASE_URL}/api/v1/collection/${collectionEntryId}/playthroughs`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );
  if (!res.ok) throw new Error("Failed to create playthrough");
  return res.json();
}

export async function updatePlaythrough(
  id: number,
  data: PlaythroughUpdate,
): Promise<Playthrough> {
  const res = await apiFetch(`${BASE_URL}/api/v1/playthroughs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update playthrough");
  return res.json();
}

export async function deletePlaythrough(id: number): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/api/v1/playthroughs/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete playthrough");
}
