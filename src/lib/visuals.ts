import type { PlaythroughStatus } from "../types/playthrough";

export interface StatusVisual {
  label: string;
  color: string;
  bg: string;
  border: string;
}

export const STATUS_VISUALS: Record<PlaythroughStatus, StatusVisual> = {
  NOT_STARTED: {
    label: "Not Started",
    color: "#3d8080",
    bg: "rgba(61,128,128,0.16)",
    border: "rgba(61,128,128,0.2)",
  },
  PLAYING: {
    label: "Playing",
    color: "#028090",
    bg: "rgba(2,128,144,0.16)",
    border: "rgba(2,128,144,0.2)",
  },
  COMPLETED: {
    label: "Completed",
    color: "#02c39a",
    bg: "rgba(2,195,154,0.14)",
    border: "rgba(2,195,154,0.2)",
  },
  ABANDONED: {
    label: "Abandoned",
    color: "#e06c75",
    bg: "rgba(224,108,117,0.14)",
    border: "rgba(224,108,117,0.2)",
  },
  ON_HOLD: {
    label: "On Hold",
    color: "#05668d",
    bg: "rgba(5,102,141,0.18)",
    border: "rgba(5,102,141,0.2)",
  },
};

export const STATUS_FILTER_ORDER: PlaythroughStatus[] = [
  "NOT_STARTED",
  "PLAYING",
  "COMPLETED",
  "ABANDONED",
  "ON_HOLD",
];

export const STATUS_SORT_ORDER: Record<PlaythroughStatus, number> = {
  PLAYING: 0,
  ON_HOLD: 1,
  NOT_STARTED: 2,
  COMPLETED: 3,
  ABANDONED: 4,
};

export interface PlatformVisual {
  abbr: string;
  color: string;
}

const PLATFORM_STYLE: Record<string, PlatformVisual> = {
  "PlayStation 5": { abbr: "PS5", color: "#00a896" },
  "PlayStation 4": { abbr: "PS4", color: "#3d9eb0" },
  "Nintendo Switch": { abbr: "NSW", color: "#02c39a" },
  "PC (Microsoft Windows)": { abbr: "PC", color: "#028090" },
  "Xbox Series X|S": { abbr: "XBX", color: "#05668d" },
  "Xbox One": { abbr: "XB1", color: "#05668d" },
  "Steam Deck": { abbr: "DECK", color: "#7acfbe" },
};

export function platformVisual(name: string): PlatformVisual {
  const hit = PLATFORM_STYLE[name];
  if (hit) return hit;
  const abbr =
    name
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 4)
      .toUpperCase() || name.slice(0, 3).toUpperCase();
  return { abbr, color: "#2d7870" };
}

export function coverUrl(coverImageId: string): string {
  return `https://images.igdb.com/igdb/image/upload/t_cover_big/${coverImageId}.jpg`;
}

export function gameInitials(name: string): string {
  return (
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "??"
  );
}
