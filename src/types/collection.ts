import type { Playthrough, PlaythroughStatus } from "./playthrough";

export interface GameSummary {
  id: number;
  name: string;
  cover_image_id: string | null;
}

export interface PlatformSummary {
  id: number;
  name: string;
}

export interface BaseGameSummary {
  id: number;
  game: GameSummary;
  platform: PlatformSummary;
}

export interface CollectionEntry {
  id: number;
  game: GameSummary;
  platform: PlatformSummary;
  base_game: BaseGameSummary | null;
  current_status: PlaythroughStatus | null;
  completed_years: number[];
  last_completed_at: string | null; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

export interface CollectionEntryDetail extends CollectionEntry {
  playthroughs: Playthrough[];
  children: BaseGameSummary[];
}
