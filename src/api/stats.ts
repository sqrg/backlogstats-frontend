import { apiFetch, BASE_URL } from "./client";
import type {
  StatsSummary,
  HoursByYear,
  HoursByMonth,
  AvgCompletionTime,
  AvgHoursPerDay,
  CompletedByPlatformEntry,
  CompletedByPlatformPeriod,
  CompletionRate,
  PlatformStat,
  GenreStat,
} from "../types/stats";

export async function getStatsSummary(): Promise<StatsSummary> {
  const res = await apiFetch(`${BASE_URL}/api/v1/stats/summary`);
  if (!res.ok) throw new Error("Failed to fetch stats summary");
  return res.json();
}

export async function getHoursByYear(): Promise<HoursByYear[]> {
  const res = await apiFetch(`${BASE_URL}/api/v1/stats/hours-by-year`);
  if (!res.ok) throw new Error("Failed to fetch hours by year");
  return res.json();
}

export async function getHoursByMonth(): Promise<HoursByMonth[]> {
  const res = await apiFetch(`${BASE_URL}/api/v1/stats/hours-by-month`);
  if (!res.ok) throw new Error("Failed to fetch hours by month");
  return res.json();
}

export async function getAvgCompletionTime(): Promise<AvgCompletionTime> {
  const res = await apiFetch(`${BASE_URL}/api/v1/stats/avg-completion-time`);
  if (!res.ok) throw new Error("Failed to fetch avg completion time");
  return res.json();
}

export async function getCompletionRate(): Promise<CompletionRate> {
  const res = await apiFetch(`${BASE_URL}/api/v1/stats/completion-rate`);
  if (!res.ok) throw new Error("Failed to fetch completion rate");
  return res.json();
}

export async function getPlatformBreakdown(): Promise<PlatformStat[]> {
  const res = await apiFetch(`${BASE_URL}/api/v1/stats/platform-breakdown`);
  if (!res.ok) throw new Error("Failed to fetch platform breakdown");
  return res.json();
}

export async function getGenreBreakdown(): Promise<GenreStat[]> {
  const res = await apiFetch(`${BASE_URL}/api/v1/stats/genre-breakdown`);
  if (!res.ok) throw new Error("Failed to fetch genre breakdown");
  return res.json();
}

export async function getAvgHoursPerDay(): Promise<AvgHoursPerDay> {
  const res = await apiFetch(`${BASE_URL}/api/v1/stats/avg-hours-per-day`);
  if (!res.ok) throw new Error("Failed to fetch avg hours per day");
  return res.json();
}

export async function getCompletedByPlatform(
  period: CompletedByPlatformPeriod = "all",
): Promise<CompletedByPlatformEntry[]> {
  const res = await apiFetch(
    `${BASE_URL}/api/v1/stats/completed-by-platform?period=${period}`,
  );
  if (!res.ok) throw new Error("Failed to fetch completed by platform");
  return res.json();
}
