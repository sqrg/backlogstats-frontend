export interface GameInSeries {
  id: number;
  igdb_id: number | null;
  name: string;
  cover_image_id: string | null;
}

export interface SeriesDetail {
  id: number;
  igdb_id: number;
  name: string;
  slug: string | null;
  created_at: string;
  updated_at: string;
  games: GameInSeries[];
}
