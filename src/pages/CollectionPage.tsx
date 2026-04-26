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

type SortKey = "date_desc" | "name_asc" | "platform_asc" | "status";
type StatusFilter = PlaythroughStatus | "ALL";

const PAGE_SIZE = 20;

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
  const [sort, setSort] = useState<SortKey>("date_desc");
  const [page, setPage] = useState(1);

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listCollection()
      .then(setEntries)
      .catch(() => setError("Failed to load your collection."))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, platformFilter, sort]);

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
    return [...result].sort((a, b) => {
      if (sort === "name_asc") return a.game.name.localeCompare(b.game.name);
      if (sort === "platform_asc")
        return a.platform.name.localeCompare(b.platform.name);
      if (sort === "status") {
        const sa = STATUS_SORT_ORDER[a.current_status ?? "NOT_STARTED"];
        const sb = STATUS_SORT_ORDER[b.current_status ?? "NOT_STARTED"];
        return sa - sb;
      }
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }, [entries, search, statusFilter, platformFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const hasFilters =
    search.trim() !== "" || statusFilter !== "ALL" || platformFilter !== "ALL";

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
        <Select<SortKey>
          value={sort}
          onChange={setSort}
          prefix="Sort:"
          options={[
            { value: "date_desc", label: "Date added" },
            { value: "name_asc", label: "Name" },
            { value: "platform_asc", label: "Platform" },
            { value: "status", label: "Status" },
          ]}
        />
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

      {!isLoading && !error && visible.length > 0 && (
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
