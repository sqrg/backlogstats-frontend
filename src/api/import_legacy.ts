import { apiFetch, BASE_URL } from "./client";
import type { ParsedLegacyRow } from "../types/import_legacy";

export async function parseLegacyXlsx(
  file: File,
): Promise<ParsedLegacyRow[]> {
  const body = new FormData();
  body.append("file", file);
  const res = await apiFetch(`${BASE_URL}/api/v1/import/legacy/parse`, {
    method: "POST",
    body,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Failed to parse xlsx (${res.status})`);
  }
  return res.json();
}
