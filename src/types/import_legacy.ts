export interface ParsedLegacyRow {
  row_id: string;
  title_raw: string;
  platform_raw: string | null;
  platform_normalized: string;
  platform_note: string | null;
  hours: number;
  completed_at: string | null; // YYYY-MM-DD
  is_dlc: boolean;
  is_handheld: boolean;
  year_sheet: number;
}
