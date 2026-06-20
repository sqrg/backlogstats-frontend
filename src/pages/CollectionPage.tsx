import { useEffect, useMemo, useRef, useState } from "react";
import { listCollection, removeFromCollection } from "../api/collection";
import type { CollectionEntry } from "../types/collection";
import type { PlaythroughStatus } from "../types/playthrough";
import {
  STATUS_VISUALS,
  STATUS_FILTER_ORDER,
  STATUS_SORT_ORDER,
} from "../lib/visuals";
import {
  PageShell,
  PageHeader,
  LinkButton,
  Select,
  SearchInput,
  Pagination,
  EmptyState,
  Toolbar,
} from "../components/ui";
import { CollectionCard } from "../components/CollectionCard";
import { CollectionRow } from "../components/CollectionRow";

type SortKey =
  | "completed_asc"
  | "completed_desc"
  | "name_asc"
  | "platform_asc"
  | "status";
type StatusFilter = PlaythroughStatus | "ALL";
type ViewMode = "grid" | "compact";

const PAGE_SIZE_OPTIONS = [25, 50, 100, 500] as const;
const VIEW_STORAGE_KEY = "collection-view-mode";

function StatsBar({ entries }: { entries: CollectionEntry[] }) {
  const total = entries.length;
  if (total === 0) return <div className="h-[3px] rounded bg-border" />;
  return (
    <div className="flex gap-px overflow-hidden rounded h-[3px] bg-border">
      {STATUS_FILTER_ORDER.map((s) => {
        const count = entries.filter(
          (e) => (e.current_status ?? "NOT_STARTED") === s,
        ).length;
        if (count === 0) return null;
        const pct = (count / total) * 100;
        return (
          <div
            key={s}
            title={`${STATUS_VISUALS[s].label}: ${count}`}
            className="h-full transition-[width] duration-300"
            style={{
              width: `${pct}%`,
              background: STATUS_VISUALS[s].color,
              opacity: 0.7,
            }}
          />
        );
      })}
    </div>
  );
}

export function CollectionPage() {
  const [entries, setEntries] = useState<CollectionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [platformFilter, setPlatformFilter] = useState<number | "ALL">("ALL");
  const [yearFilter, setYearFilter] = useState<number | "ALL">("ALL");
  const [sort, setSort] = useState<SortKey>("completed_asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [view, setView] = useState<ViewMode>(() =>
    localStorage.getItem(VIEW_STORAGE_KEY) === "compact" ? "compact" : "grid",
  );

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(VIEW_STORAGE_KEY, view);
  }, [view]);

  useEffect(() => {
    listCollection()
      .then(setEntries)
      .catch(() => setError("Failed to load your collection."))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, platformFilter, yearFilter, sort, pageSize]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement !== searchRef.current) {
        const tag = (document.activeElement?.tagName ?? "").toLowerCase();
        if (tag === "input" || tag === "textarea" || tag === "select") return;
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  async function handleRemove(id: number) {
    try {
      await removeFromCollection(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch {
      setError("Failed to remove entry.");
    }
  }

  const platforms = useMemo(() => {
    const seen = new Map<number, string>();
    for (const e of entries) {
      if (!seen.has(e.platform.id)) seen.set(e.platform.id, e.platform.name);
    }
    return [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [entries]);

  const completionYears = useMemo(() => {
    const set = new Set<number>();
    for (const e of entries) {
      for (const y of e.completed_years) set.add(y);
    }
    return [...set].sort((a, b) => b - a);
  }, [entries]);

  const counts = useMemo(() => {
    const c: Record<PlaythroughStatus, number> = {
      NOT_STARTED: 0,
      PLAYING: 0,
      COMPLETED: 0,
      ABANDONED: 0,
      ON_HOLD: 0,
    };
    for (const e of entries) c[e.current_status ?? "NOT_STARTED"] += 1;
    return c;
  }, [entries]);

  const filtered = useMemo(() => {
    let result = entries;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((e) => e.game.name.toLowerCase().includes(q));
    }
    if (statusFilter !== "ALL") {
      result = result.filter(
        (e) => (e.current_status ?? "NOT_STARTED") === statusFilter,
      );
    }
    if (platformFilter !== "ALL") {
      result = result.filter((e) => e.platform.id === platformFilter);
    }
    if (yearFilter !== "ALL") {
      result = result.filter((e) => e.completed_years.includes(yearFilter));
    }
    return [...result].sort((a, b) => {
      if (sort === "name_asc") return a.game.name.localeCompare(b.game.name);
      if (sort === "platform_asc")
        return a.platform.name.localeCompare(b.platform.name);
      if (sort === "status") {
        const sa = STATUS_SORT_ORDER[a.current_status ?? "NOT_STARTED"];
        const sb = STATUS_SORT_ORDER[b.current_status ?? "NOT_STARTED"];
        return sa - sb;
      }
      // Uncompleted entries always fall to the end, regardless of direction.
      if (a.last_completed_at && b.last_completed_at) {
        return sort === "completed_desc"
          ? b.last_completed_at.localeCompare(a.last_completed_at)
          : a.last_completed_at.localeCompare(b.last_completed_at);
      }
      if (a.last_completed_at) return -1;
      if (b.last_completed_at) return 1;
      return 0;
    });
  }, [entries, search, statusFilter, platformFilter, yearFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const hasFilters =
    search.trim() !== "" ||
    statusFilter !== "ALL" ||
    platformFilter !== "ALL" ||
    yearFilter !== "ALL";

  return (
    <PageShell>
      <PageHeader
        title="My Collection"
        subtitle={
          <>
            <span className="font-mono text-text-primary">{entries.length}</span>{" "}
            game{entries.length !== 1 ? "s" : ""} across{" "}
            <span className="font-mono text-text-primary">
              {platforms.length}
            </span>{" "}
            platform{platforms.length !== 1 ? "s" : ""}
          </>
        }
        actions={
          <LinkButton
            to="/"
            icon={
              <svg
                width="13"
                height="13"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <circle cx="7" cy="7" r="5" />
                <path d="m12 12 2.5 2.5" />
              </svg>
            }
          >
            Add game
          </LinkButton>
        }
      />

      <div className="pt-3 pb-1">
        <StatsBar entries={entries} />
        <div className="flex gap-3.5 mt-2 flex-wrap">
          {STATUS_FILTER_ORDER.map((s) => {
            const cfg = STATUS_VISUALS[s];
            const isDim = statusFilter !== "ALL" && statusFilter !== s;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? "ALL" : s)}
                className="flex items-center gap-1.5 p-0 bg-transparent border-none cursor-pointer transition-opacity"
                style={{ opacity: isDim ? 0.35 : 1 }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: cfg.color }}
                />
                <span className="font-body text-[0.75rem] text-text-secondary">
                  {cfg.label}
                </span>
                <span className="font-mono text-[0.72rem] text-text-muted">
                  {counts[s]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Toolbar
        trailing={`${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}
      >
        <SearchInput
          ref={searchRef}
          placeholder="Search collection…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          shortcut="/"
          className="flex-1 basis-[200px] min-w-40 max-w-xs"
        />
        <Select<StatusFilter>
          value={statusFilter}
          onChange={setStatusFilter}
          prefix="Status:"
          options={[
            { value: "ALL", label: "All" },
            ...STATUS_FILTER_ORDER.map((s) => ({
              value: s as StatusFilter,
              label: STATUS_VISUALS[s].label,
            })),
          ]}
        />
        <Select<string>
          value={platformFilter === "ALL" ? "ALL" : String(platformFilter)}
          onChange={(v) => setPlatformFilter(v === "ALL" ? "ALL" : Number(v))}
          prefix="Platform:"
          options={[
            { value: "ALL", label: "All" },
            ...platforms.map(([id, name]) => ({
              value: String(id),
              label: name,
            })),
          ]}
        />
        <Select<string>
          value={yearFilter === "ALL" ? "ALL" : String(yearFilter)}
          onChange={(v) => setYearFilter(v === "ALL" ? "ALL" : Number(v))}
          prefix="Completed:"
          options={[
            { value: "ALL", label: "Any year" },
            ...completionYears.map((y) => ({
              value: String(y),
              label: String(y),
            })),
          ]}
        />
        <Select<SortKey>
          value={sort}
          onChange={setSort}
          prefix="Sort:"
          options={[
            { value: "completed_asc", label: "Completion date (oldest)" },
            { value: "completed_desc", label: "Completion date (newest)" },
            { value: "name_asc", label: "Name" },
            { value: "platform_asc", label: "Platform" },
            { value: "status", label: "Status" },
          ]}
        />
        <Select<string>
          value={String(pageSize)}
          onChange={(v) => setPageSize(Number(v))}
          prefix="Per page:"
          options={PAGE_SIZE_OPTIONS.map((n) => ({
            value: String(n),
            label: String(n),
          }))}
        />
        <div className="inline-flex rounded border border-border-hi bg-surface p-0.5">
          {(
            [
              {
                value: "grid",
                label: "Grid view",
                icon: (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                    <rect x="1" y="1" width="5" height="5" rx="1" />
                    <rect x="8" y="1" width="5" height="5" rx="1" />
                    <rect x="1" y="8" width="5" height="5" rx="1" />
                    <rect x="8" y="8" width="5" height="5" rx="1" />
                  </svg>
                ),
              },
              {
                value: "compact",
                label: "Compact view",
                icon: (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                    <rect x="1" y="2" width="12" height="2" rx="1" />
                    <rect x="1" y="6" width="12" height="2" rx="1" />
                    <rect x="1" y="10" width="12" height="2" rx="1" />
                  </svg>
                ),
              },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setView(opt.value)}
              aria-label={opt.label}
              aria-pressed={view === opt.value}
              title={opt.label}
              className={`flex items-center justify-center w-7 h-7 rounded-[3px] transition-colors ${
                view === opt.value
                  ? "bg-accent text-white"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {opt.icon}
            </button>
          ))}
        </div>
      </Toolbar>

      {isLoading && (
        <p className="font-body text-text-secondary">
          Loading your collection…
        </p>
      )}
      {!isLoading && error && <p className="font-body text-[#e06c75]">{error}</p>}

      {!isLoading && !error && visible.length === 0 && (
        <EmptyState
          title={
            hasFilters ? "No games match your filters" : "Your collection is empty"
          }
          description={
            hasFilters
              ? "Try adjusting your search or status filter."
              : "Start building your backlog by searching for games."
          }
          action={
            !hasFilters && (
              <LinkButton to="/" variant="primary">
                Search games →
              </LinkButton>
            )
          }
        />
      )}

      {!isLoading && !error && visible.length > 0 && view === "grid" && (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {visible.map((entry) => (
            <CollectionCard
              key={entry.id}
              entry={entry}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      {!isLoading && !error && visible.length > 0 && view === "compact" && (
        <div className="flex flex-col gap-1.5">
          {visible.map((entry) => (
            <CollectionRow
              key={entry.id}
              entry={entry}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      <Pagination
        page={safePage}
        totalPages={totalPages}
        onPage={(p) => {
          setPage(p);
          window.scrollTo({ top: 0 });
        }}
      />
    </PageShell>
  );
}
