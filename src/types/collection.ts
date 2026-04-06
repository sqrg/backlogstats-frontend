export interface GameSummary {
  id: number;
  name: string;
  cover_image_id: string | null;
}

export interface PlatformSummary {
  id: number;
  name: string;
}

export interface CollectionEntry {
  id: number;
  game: GameSummary;
  platform: PlatformSummary;
  created_at: string;
  updated_at: string;
}
