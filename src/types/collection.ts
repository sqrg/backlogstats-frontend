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
  created_at: string;
  updated_at: string;
}

export interface CollectionEntryDetail extends CollectionEntry {
  playthroughs: Playthrough[];
  children: BaseGameSummary[];
}
