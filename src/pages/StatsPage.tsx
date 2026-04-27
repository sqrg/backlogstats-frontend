import { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getAvgCompletionTime,
  getAvgHoursPerDay,
  getCompletedByPlatform,
  getCompletionRate,
  getHoursByMonth,
  getHoursByYear,
  getGenreBreakdown,
  getPlatformBreakdown,
  getStatsSummary,
} from "../api/stats";
import { EmptyState, PageShell } from "../components/ui";
import type {
  AvgCompletionTime,
  AvgHoursPerDay,
  CompletedByPlatformEntry,
  CompletionRate,
  HoursByMonth,
  HoursByYear,
  GenreStat,
  PlatformStat,
  StatsSummary,
} from "../types/stats";

const PIE_COLORS = [
  "#2dd4bf",
  "#0ea5e9",
  "#a78bfa",
  "#f97316",
  "#facc15",
  "#ef4444",
  "#22c55e",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
];

interface SummaryCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

function SummaryCard({ label, value, sub }: SummaryCardProps) {
  return (
    <div className="border border-gray-200 rounded p-4">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export function StatsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [avgTime, setAvgTime] = useState<AvgCompletionTime | null>(null);
  const [avgPerDay, setAvgPerDay] = useState<AvgHoursPerDay | null>(null);
  const [completionRate, setCompletionRate] = useState<CompletionRate | null>(null);
  const [byYear, setByYear] = useState<HoursByYear[]>([]);
  const [byMonth, setByMonth] = useState<HoursByMonth[] | null>(null);
  const [completedByPlatformAll, setCompletedByPlatformAll] = useState<
    CompletedByPlatformEntry[]
  >([]);
  const [completedByPlatformLast12, setCompletedByPlatformLast12] = useState<
    CompletedByPlatformEntry[] | null
  >(null);
  const [platforms, setPlatforms] = useState<PlatformStat[]>([]);
  const [genres, setGenres] = useState<GenreStat[]>([]);
  const [timeView, setTimeView] = useState<"year" | "month">("year");

  useEffect(() => {
    Promise.all([
      getStatsSummary(),
      getAvgCompletionTime(),
      getAvgHoursPerDay(),
      getCompletionRate(),
      getHoursByYear(),
      getPlatformBreakdown(),
      getGenreBreakdown(),
      getCompletedByPlatform("all"),
    ])
      .then(([s, avg, perDay, rate, years, plats, genrs, cbpAll]) => {
        setSummary(s);
        setAvgTime(avg);
        setAvgPerDay(perDay);
        setCompletionRate(rate);
        setByYear(years);
        setPlatforms(plats);
        setGenres(genrs);
        setCompletedByPlatformAll(cbpAll);
      })
      .catch(() => setError("Failed to load stats."))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSwitchToMonth() {
    setTimeView("month");
    try {
      if (byMonth === null) {
        const data = await getHoursByMonth();
        setByMonth(data);
      }
      if (completedByPlatformLast12 === null) {
        const cbp = await getCompletedByPlatform("last_12_months");
        setCompletedByPlatformLast12(cbp);
      }
    } catch {
      setError("Failed to load monthly data.");
    }
  }

  const yearData: { label: string; hours: number }[] = byYear.map((d) => ({
    label: String(d.year),
    hours: d.hours,
  }));

  const monthData: { label: string; hours: number }[] = (byMonth ?? []).map(
    (d) => ({
      label: new Date(d.year, d.month - 1).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      hours: d.hours,
    }),
  );

  const completedPieData = (
    timeView === "year"
      ? completedByPlatformAll
      : (completedByPlatformLast12 ?? [])
  ).map((e) => ({
    name: e.platform_name,
    value: e.completed_games,
  }));

  const platformData = platforms.slice(0, 10).map((p) => ({
    name: p.platform_name,
    total: p.total_games,
    completed: p.completed_games,
  }));

  const genreData = genres.slice(0, 10).map((g) => ({
    name: g.genre_name,
    total: g.total_games,
    completed: g.completed_games,
  }));

  const toggleBtnCls = (active: boolean) =>
    [
      "px-3 py-1 rounded text-sm border transition-colors",
      active
        ? "bg-black/5 border-gray-300 text-text-primary"
        : "border-gray-200 text-text-secondary hover:bg-black/5",
    ].join(" ");

  return (
    <PageShell>
      <h1 className="text-2xl font-bold mb-6 mt-8">Stats</h1>

      {isLoading && <p className="text-gray-500">Loading…</p>}
      {!isLoading && error && <p className="text-red-500">{error}</p>}

      {!isLoading && !error && summary && summary.total_games === 0 && (
        <EmptyState
          title="No stats yet"
          description="Add games to your collection and log some playthroughs to see your stats."
        />
      )}

      {!isLoading && !error && summary && summary.total_games > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <SummaryCard label="Total games" value={summary.total_games} />
            <SummaryCard
              label="Completed"
              value={summary.completed}
              sub={
                completionRate
                  ? `${completionRate.completed_pct}%`
                  : undefined
              }
            />
            <SummaryCard label="Playing now" value={summary.playing} />
            <SummaryCard
              label="Avg completion"
              value={
                avgTime?.overall_avg
                  ? `${avgTime.overall_avg.toFixed(1)}h`
                  : "—"
              }
              sub="to complete"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <SummaryCard
              label="Avg per day (last 7 days)"
              value={avgPerDay ? `${avgPerDay.last_7_days.toFixed(2)}h` : "—"}
            />
            <SummaryCard
              label="Avg per day (last 30 days)"
              value={avgPerDay ? `${avgPerDay.last_30_days.toFixed(2)}h` : "—"}
            />
            <SummaryCard
              label="Avg per day (last 365 days)"
              value={avgPerDay ? `${avgPerDay.last_365_days.toFixed(2)}h` : "—"}
            />
          </div>

          <section className="mb-10">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setTimeView("year")}
                className={toggleBtnCls(timeView === "year")}
              >
                By year
              </button>
              <button
                onClick={handleSwitchToMonth}
                className={toggleBtnCls(timeView === "month")}
              >
                Last 12 months
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-3">Hours over time</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={timeView === "year" ? yearData : monthData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar
                      dataKey="hours"
                      name="Hours"
                      fill="#2dd4bf"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-3">
                  Completed games by platform
                </h2>
                {completedPieData.length === 0 ? (
                  <div className="flex items-center justify-center h-[280px] text-sm text-gray-500">
                    No completed games in this period.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={completedPieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={2}
                      >
                        {completedPieData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        wrapperStyle={{ fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section>
              <h2 className="text-lg font-semibold mb-3">By platform</h2>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart layout="vertical" data={platformData} margin={{ left: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="total"
                    name="Total"
                    fill="#e2e8f0"
                    radius={[0, 4, 4, 0]}
                  />
                  <Bar
                    dataKey="completed"
                    name="Completed"
                    fill="#2dd4bf"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">By genre</h2>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart layout="vertical" data={genreData} margin={{ left: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="total"
                    name="Total"
                    fill="#e2e8f0"
                    radius={[0, 4, 4, 0]}
                  />
                  <Bar
                    dataKey="completed"
                    name="Completed"
                    fill="#2dd4bf"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </section>
          </div>
        </>
      )}
    </PageShell>
  );
}
