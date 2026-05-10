export interface Session {
  id: number;
  game_in_collection_id: number;
  started_at: string | null;
  ended_at: string | null;
  completion_time: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionCreate {
  completion_time: number;
  started_at: string | null;
  ended_at: string | null;
  notes: string | null;
}

export interface SessionUpdate {
  completion_time?: number;
  started_at?: string | null;
  ended_at?: string | null;
  notes?: string | null;
}
