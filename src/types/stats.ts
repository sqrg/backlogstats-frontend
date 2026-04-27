export interface StatsSummary {
  total_games: number;
  completed: number;
  playing: number;
  abandoned: number;
  on_hold: number;
  not_started: number;
  no_playthroughs: number;
}

export interface HoursByYear {
  year: number;
  hours: number;
}

export interface HoursByMonth {
  year: number;
  month: number;
  hours: number;
}

export interface GenreAvg {
  genre_name: string;
  avg_hours: number;
  count: number;
}

export interface PlatformAvg {
  platform_name: string;
  avg_hours: number;
  count: number;
}

export interface AvgCompletionTime {
  overall_avg: number | null;
  by_genre: GenreAvg[];
  by_platform: PlatformAvg[];
}

export interface CompletionRate {
  total_games: number;
  completed_pct: number;
  playing_pct: number;
  abandoned_pct: number;
  on_hold_pct: number;
  not_started_pct: number;
  no_playthrough_pct: number;
}

export interface PlatformStat {
  platform_name: string;
  total_games: number;
  completed_games: number;
}

export interface GenreStat {
  genre_name: string;
  total_games: number;
  completed_games: number;
}

export interface AvgHoursPerDay {
  last_7_days: number;
  last_30_days: number;
  last_365_days: number;
}

export interface CompletedByPlatformEntry {
  platform_name: string;
  completed_games: number;
}

export type CompletedByPlatformPeriod = "all" | "last_12_months";
