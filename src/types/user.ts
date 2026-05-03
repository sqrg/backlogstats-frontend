export interface UserRead {
  id: number;
  username: string | null;
  email: string | null;
  google_id: string | null;
  apple_id: string | null;
  discord_id: string | null;
  steam_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
