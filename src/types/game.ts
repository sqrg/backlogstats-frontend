export interface GameDetail {
  id: number;
  name: string;
  igdb_id: number | null;
  summary: string | null;
  cover_image_id: string | null;
  first_release_date: number | null;
  rating: number | null;
  genres: string[];
  created_at: string;
  updated_at: string;
}
