import { apiFetch } from "./client";
import { BASE_URL } from "./client";

export interface Platform {
  id: number;
  name: string;
}

export async function listPlatforms(): Promise<Platform[]> {
  const res = await apiFetch(`${BASE_URL}/api/v1/platforms/`);
  if (!res.ok) throw new Error("Failed to fetch platforms");
  return res.json();
}
