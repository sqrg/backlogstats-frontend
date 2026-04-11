import type { GameSummary } from "./collection";

export interface UserListEntry {
  id: number;
  list_id: number;
  game_id: number;
  game: GameSummary;
  position: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserList {
  id: number;
  name: string;
  is_public: boolean;
  entries: UserListEntry[];
  created_at: string;
  updated_at: string;
}
