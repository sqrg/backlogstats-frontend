import { apiFetch, BASE_URL } from "./client";
import type { UserRead } from "../types/user";

export async function fetchMe(): Promise<UserRead> {
  const res = await apiFetch(`${BASE_URL}/api/v1/users/me`);
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function updateMe(patch: { username?: string }): Promise<UserRead> {
  const res = await apiFetch(`${BASE_URL}/api/v1/users/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? `Update failed: ${res.status}`);
  }
  return res.json();
}

export async function changePassword(
  current_password: string,
  new_password: string,
): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/api/v1/users/me/password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ current_password, new_password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? `Password change failed: ${res.status}`);
  }
}
