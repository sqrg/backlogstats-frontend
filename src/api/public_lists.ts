import { apiFetch, BASE_URL } from "./client";
import type { PublicUserList } from "../types/user_list";

export async function fetchPublicLists(username: string): Promise<PublicUserList[]> {
  const res = await apiFetch(
    `${BASE_URL}/api/v1/users/${encodeURIComponent(username)}/lists`,
  );
  if (!res.ok) throw new Error("Failed to fetch lists");
  return res.json();
}

export async function fetchPublicList(
  username: string,
  id: number,
): Promise<PublicUserList | null> {
  const res = await apiFetch(
    `${BASE_URL}/api/v1/users/${encodeURIComponent(username)}/lists/${id}`,
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch list");
  return res.json();
}
