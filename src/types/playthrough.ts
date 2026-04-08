export type PlaythroughStatus =
  | "NOT_STARTED"
  | "PLAYING"
  | "COMPLETED"
  | "ABANDONED"
  | "ON_HOLD";

export const STATUS_LABELS: Record<PlaythroughStatus, string> = {
  NOT_STARTED: "Not started",
  PLAYING: "Playing",
  COMPLETED: "Completed",
  ABANDONED: "Abandoned",
  ON_HOLD: "On hold",
};

export const ALL_STATUSES: PlaythroughStatus[] = [
  "NOT_STARTED",
  "PLAYING",
  "COMPLETED",
  "ABANDONED",
  "ON_HOLD",
];

export interface Playthrough {
  id: number;
  game_in_collection_id: number;
  status: PlaythroughStatus;
  started_at: string | null; // YYYY-MM-DD
  completed_at: string | null; // YYYY-MM-DD
  completion_time: number | null; // hours
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlaythroughCreate {
  status: PlaythroughStatus;
  started_at: string | null;
  completed_at: string | null;
  completion_time: number | null;
  notes: string | null;
}

export interface PlaythroughUpdate {
  status?: PlaythroughStatus;
  started_at?: string | null;
  completed_at?: string | null;
  completion_time?: number | null;
  notes?: string | null;
}
