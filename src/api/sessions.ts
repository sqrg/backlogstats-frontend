import { apiFetch, BASE_URL } from "./client";
import type {
  Session,
  SessionCreate,
  SessionUpdate,
} from "../types/session";

export async function listSessions(
  params: {
    game_in_collection_id?: number;
    limit?: number;
    offset?: number;
  } = {},
): Promise<Session[]> {
  const qs = new URLSearchParams();
  if (params.game_in_collection_id != null)
    qs.set("game_in_collection_id", String(params.game_in_collection_id));
  if (params.limit != null) qs.set("limit", String(params.limit));
  if (params.offset != null) qs.set("offset", String(params.offset));
  const res = await apiFetch(`${BASE_URL}/api/v1/sessions/?${qs}`);
  if (!res.ok) throw new Error("Failed to fetch sessions");
  return res.json();
}

export async function createSession(
  collectionEntryId: number,
  data: SessionCreate,
): Promise<Session> {
  const res = await apiFetch(
    `${BASE_URL}/api/v1/collection/${collectionEntryId}/sessions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );
  if (!res.ok) throw new Error("Failed to create session");
  return res.json();
}

export async function updateSession(
  id: number,
  data: SessionUpdate,
): Promise<Session> {
  const res = await apiFetch(`${BASE_URL}/api/v1/sessions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update session");
  return res.json();
}

export async function deleteSession(id: number): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/api/v1/sessions/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete session");
}
