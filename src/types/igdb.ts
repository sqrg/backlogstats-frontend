export interface IGDBCover {
  image_id: string;
  url_thumb: string;
  url_cover_small: string;
  url_cover_big: string;
  url_720p: string;
  url_1080p: string;
}

export interface IGDBPlatform {
  igdb_id: number;
  name: string;
  db_id: number;
}

export interface IGDBGameResult {
  igdb_id: number;
  name: string;
  slug: string | null;
  summary: string | null;
  cover: IGDBCover | null;
  genres: string[];
  themes: string[];
  platforms: IGDBPlatform[];
  first_release_date: number | null;
  total_rating: number | null;
  total_rating_count: number | null;
  category: number | null;
  status: number | null;
}
