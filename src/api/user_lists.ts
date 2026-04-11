import { apiFetch, BASE_URL } from "./client";
import type { UserList, UserListEntry } from "../types/user_list";

export async function listUserLists(): Promise<UserList[]> {
  const res = await apiFetch(`${BASE_URL}/api/v1/lists/`);
  if (!res.ok) throw new Error("Failed to fetch lists");
  return res.json();
}

export async function getUserList(id: number): Promise<UserList> {
  const res = await apiFetch(`${BASE_URL}/api/v1/lists/${id}`);
  if (!res.ok) throw new Error("Failed to fetch list");
  return res.json();
}

export async function createUserList(
  name: string,
  is_public: boolean,
): Promise<UserList> {
  const res = await apiFetch(`${BASE_URL}/api/v1/lists/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, is_public }),
  });
  if (!res.ok) throw new Error("Failed to create list");
  return res.json();
}

export async function updateUserList(
  id: number,
  patch: { name?: string; is_public?: boolean },
): Promise<UserList> {
  const res = await apiFetch(`${BASE_URL}/api/v1/lists/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Failed to update list");
  return res.json();
}

export async function deleteUserList(id: number): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/api/v1/lists/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete list");
}

export async function createListEntry(
  list_id: number,
  game_id: number,
): Promise<UserListEntry> {
  const res = await apiFetch(`${BASE_URL}/api/v1/list-entries/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ list_id, game_id }),
  });
  if (res.status === 409) throw Object.assign(new Error("Already in list"), { status: 409 });
  if (!res.ok) throw new Error("Failed to add entry");
  return res.json();
}

export async function deleteListEntry(id: number): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/api/v1/list-entries/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to remove entry");
}
