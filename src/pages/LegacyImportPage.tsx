import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { parseLegacyXlsx } from "../api/import_legacy";
import { searchGames, importGame } from "../api/games";
import { addToCollection } from "../api/collection";
import { createPlaythrough } from "../api/playthroughs";
import { listPlatforms } from "../api/platforms";
import type { Platform } from "../api/platforms";
import { PageShell, PageHeader, Button } from "../components/ui";
import { CoverArt } from "../components/CoverArt";
import type { ParsedLegacyRow } from "../types/import_legacy";
import type { IGDBGameResult } from "../types/igdb";

interface ImportedRecord {
  row: ParsedLegacyRow;
  collection_entry_id: number;
  game_name: string;
}

type Phase =
  | { kind: "idle" }
  | { kind: "parsing" }
  | { kind: "error"; message: string }
  | {
      kind: "reviewing";
      rows: ParsedLegacyRow[];
      index: number;
      imported: ImportedRecord[];
      skipped: ParsedLegacyRow[];
    }
  | {
      kind: "done";
      imported: ImportedRecord[];
      skipped: ParsedLegacyRow[];
    };

const ACCEPT = ".xlsx";

export function LegacyImportPage() {
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [platformsLoaded, setPlatformsLoaded] = useState(false);

  useEffect(() => {
    listPlatforms()
      .then((p) => {
        setPlatforms(p);
        setPlatformsLoaded(true);
      })
      .catch(() => setPlatformsLoaded(true));
  }, []);

  async function handleFile(file: File) {
    setPhase({ kind: "parsing" });
    try {
      const rows = await parseLegacyXlsx(file);
      if (rows.length === 0) {
        setPhase({
          kind: "error",
          message: "The file parsed but contained no rows.",
        });
        return;
      }
      setPhase({
        kind: "reviewing",
        rows,
        index: 0,
        imported: [],
        skipped: [],
      });
    } catch (err) {
      setPhase({
        kind: "error",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  function advance(
    next: Partial<Extract<Phase, { kind: "reviewing" }>>,
  ): void {
    setPhase((current) => {
      if (current.kind !== "reviewing") return current;
      const merged = { ...current, ...next };
      if (merged.index >= merged.rows.length) {
        return {
          kind: "done",
          imported: merged.imported,
          skipped: merged.skipped,
        };
      }
      return merged;
    });
  }

  async function handleCommit(
    candidate: IGDBGameResult,
    overrides: { platformId: number; hours: number },
  ) {
    if (phase.kind !== "reviewing") return;
    const row = phase.rows[phase.index];
    const game = await importGame(candidate.igdb_id);
    const entry = await addToCollection(game.id, overrides.platformId, {
      skipDefaultPlaythrough: true,
    });
    await createPlaythrough(entry.id, {
      status: "COMPLETED",
      started_at: null,
      completed_at: row.completed_at ?? null,
      completion_time: overrides.hours > 0 ? overrides.hours : null,
      notes: row.is_handheld
        ? "Imported from legacy backlog (handheld)"
        : "Imported from legacy backlog",
    });
    advance({
      index: phase.index + 1,
      imported: [
        ...phase.imported,
        {
          row,
          collection_entry_id: entry.id,
          game_name: candidate.name,
        },
      ],
    });
  }

  function handleSkip() {
    if (phase.kind !== "reviewing") return;
    const row = phase.rows[phase.index];
    advance({
      index: phase.index + 1,
      skipped: [...phase.skipped, row],
    });
  }

  function reset() {
    setPhase({ kind: "idle" });
  }

  return (
    <PageShell>
      <PageHeader
        title="Import legacy backlog"
        subtitle="Upload your old backlog spreadsheet and walk through each game one at a time."
      />

      <div className="pt-6">
        {phase.kind === "idle" && (
          <Dropzone onFile={handleFile} />
        )}
        {phase.kind === "parsing" && (
          <p className="font-body text-text-secondary">Parsing spreadsheet…</p>
        )}
        {phase.kind === "error" && (
          <div className="space-y-3">
            <p className="font-body text-[#e06c75]">{phase.message}</p>
            <Button onClick={reset}>Try again</Button>
          </div>
        )}
        {phase.kind === "reviewing" && (
          <ReviewRow
            row={phase.rows[phase.index]}
            index={phase.index}
            total={phase.rows.length}
            imported={phase.imported.length}
            skipped={phase.skipped.length}
            platforms={platforms}
            platformsLoaded={platformsLoaded}
            onCommit={handleCommit}
            onSkip={handleSkip}
          />
        )}
        {phase.kind === "done" && (
          <Summary
            imported={phase.imported}
            skipped={phase.skipped}
            onReset={reset}
          />
        )}
      </div>
    </PageShell>
  );
}

interface DropzoneProps {
  onFile: (file: File) => void;
}

function Dropzone({ onFile }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={[
        "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
        dragging
          ? "border-accent bg-accent/5"
          : "border-border bg-surface/50",
      ].join(" ")}
    >
      <p className="font-body text-text-primary mb-2">
        Drop your <code className="font-mono text-sm">.xlsx</code> file here
      </p>
      <p className="font-body text-sm text-text-secondary mb-4">
        or click to browse
      </p>
      <Button onClick={() => inputRef.current?.click()}>Choose file</Button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />
      <p className="font-body text-xs text-text-secondary mt-6">
        Each row in the spreadsheet becomes one prompt. You'll search IGDB for
        the matching game, pick a result, or skip if you can't find one.
        Refreshing the page will reset progress.
      </p>
    </div>
  );
}

interface ReviewRowProps {
  row: ParsedLegacyRow;
  index: number;
  total: number;
  imported: number;
  skipped: number;
  platforms: Platform[];
  platformsLoaded: boolean;
  onCommit: (
    candidate: IGDBGameResult,
    overrides: { platformId: number; hours: number },
  ) => Promise<void>;
  onSkip: () => void;
}

function ReviewRow({
  row,
  index,
  total,
  imported,
  skipped,
  platforms,
  platformsLoaded,
  onCommit,
  onSkip,
}: ReviewRowProps) {
  const [query, setQuery] = useState(row.title_raw);
  const [results, setResults] = useState<IGDBGameResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [committing, setCommitting] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);
  const [hoursStr, setHoursStr] = useState(String(row.hours));
  const [platformOverrideId, setPlatformOverrideId] = useState<number | null>(
    null,
  );

  // Reset per-row state when we move to a new row.
  useEffect(() => {
    setQuery(row.title_raw);
    setResults([]);
    setSearching(false);
    setSearchError(null);
    setCommitError(null);
    setHoursStr(String(row.hours));
    setPlatformOverrideId(null);
  }, [row.row_id, row.title_raw, row.hours]);

  // Auto-search whenever the query stabilizes.
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const handle = setTimeout(async () => {
      setSearching(true);
      setSearchError(null);
      try {
        const data = await searchGames(trimmed, 8);
        if (!cancelled) setResults(data);
      } catch (err) {
        if (!cancelled)
          setSearchError(
            err instanceof Error ? err.message : "Search failed",
          );
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query]);

  const matchedPlatform = useMemo(
    () =>
      platforms.find((p) => p.name === row.platform_normalized) ?? null,
    [platforms, row.platform_normalized],
  );

  // If the canonical platform is missing from the DB list, the user must pick
  // one from the override dropdown before committing.
  const effectivePlatformId =
    platformOverrideId ?? matchedPlatform?.id ?? null;

  async function commit(candidate: IGDBGameResult) {
    if (effectivePlatformId === null) {
      setCommitError(
        `Platform "${row.platform_normalized}" is not in the database. Pick one to override.`,
      );
      return;
    }
    setCommitting(true);
    setCommitError(null);
    try {
      const hours = Number(hoursStr) || 0;
      await onCommit(candidate, {
        platformId: effectivePlatformId,
        hours,
      });
    } catch (err) {
      setCommitError(err instanceof Error ? err.message : "Commit failed");
    } finally {
      setCommitting(false);
    }
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between text-sm font-body text-text-secondary">
        <span>
          Row {index + 1} of {total}
        </span>
        <span>
          {imported} imported · {skipped} skipped
        </span>
      </div>

      <div className="border border-border rounded-lg p-5 bg-surface space-y-4">
        <div>
          <h3 className="font-ui font-bold text-lg text-text-primary">
            {row.title_raw}
          </h3>
          <div className="flex flex-wrap gap-2 mt-2 text-xs font-body">
            <span className="px-2 py-0.5 rounded bg-black/5 text-text-secondary">
              Year sheet: {row.year_sheet}
            </span>
            {row.completed_at && (
              <span className="px-2 py-0.5 rounded bg-black/5 text-text-secondary">
                Finished: {row.completed_at}
              </span>
            )}
            {row.is_dlc && (
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                DLC
              </span>
            )}
            {row.is_handheld && (
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                Played handheld
              </span>
            )}
            {row.platform_note && (
              <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-900">
                {row.platform_note}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm font-body">
          <div className="flex flex-col gap-1">
            <label className="font-medium text-text-primary">Platform</label>
            <select
              value={effectivePlatformId ?? ""}
              onChange={(e) =>
                setPlatformOverrideId(
                  e.target.value ? Number(e.target.value) : null,
                )
              }
              className="border border-gray-300 rounded px-2 py-1 bg-white"
              disabled={!platformsLoaded}
            >
              {!matchedPlatform && (
                <option value="">— select a platform —</option>
              )}
              {platforms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.name === row.platform_normalized ? " (matched)" : ""}
                </option>
              ))}
            </select>
            <span className="text-xs text-text-secondary">
              Source: {row.platform_raw ?? "—"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-text-primary">
              Completion time (hours)
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={hoursStr}
              onChange={(e) => setHoursStr(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="font-body text-sm font-medium text-text-primary">
          IGDB search
        </label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 font-body"
          placeholder="Search IGDB…"
        />
        {searching && (
          <p className="font-body text-xs text-text-secondary">Searching…</p>
        )}
        {searchError && (
          <p className="font-body text-xs text-[#e06c75]">{searchError}</p>
        )}
      </div>

      {results.length > 0 && (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
          {results.map((r) => (
            <CandidateCard
              key={r.igdb_id}
              candidate={r}
              disabled={committing}
              onPick={() => commit(r)}
            />
          ))}
        </div>
      )}

      {commitError && (
        <p className="font-body text-sm text-[#e06c75]">{commitError}</p>
      )}

      <div className="flex gap-2 pt-2">
        <Button onClick={onSkip} disabled={committing} variant="secondary">
          Skip this game
        </Button>
      </div>
    </div>
  );
}

interface CandidateCardProps {
  candidate: IGDBGameResult;
  disabled: boolean;
  onPick: () => void;
}

function CandidateCard({ candidate, disabled, onPick }: CandidateCardProps) {
  const year = candidate.first_release_date
    ? new Date(candidate.first_release_date * 1000).getFullYear()
    : null;
  return (
    <button
      type="button"
      onClick={onPick}
      disabled={disabled}
      className="text-left border border-border rounded-lg overflow-hidden hover:border-accent transition-colors bg-surface disabled:opacity-50"
    >
      <CoverArt
        coverImageId={candidate.cover?.image_id ?? null}
        name={candidate.name}
      />
      <div className="p-2">
        <p className="font-ui font-medium text-sm text-text-primary line-clamp-2">
          {candidate.name}
        </p>
        {year && (
          <p className="font-body text-xs text-text-secondary mt-0.5">
            {year}
          </p>
        )}
      </div>
    </button>
  );
}

interface SummaryProps {
  imported: ImportedRecord[];
  skipped: ParsedLegacyRow[];
  onReset: () => void;
}

function Summary({ imported, skipped, onReset }: SummaryProps) {
  function copySkipped() {
    const text = skipped
      .map(
        (r) =>
          `${r.title_raw}\t${r.platform_normalized}\t${r.completed_at ?? ""}\t${r.hours}h${r.is_dlc ? "\tDLC" : ""}`,
      )
      .join("\n");
    navigator.clipboard?.writeText(text);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border border-border rounded-lg p-5 bg-surface">
        <h2 className="font-ui font-bold text-lg text-text-primary">
          Import complete
        </h2>
        <p className="font-body text-text-secondary mt-1">
          {imported.length} imported · {skipped.length} skipped
        </p>
      </div>

      {skipped.length > 0 && (
        <div className="border border-border rounded-lg p-5 bg-surface">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-ui font-bold text-text-primary">
              Skipped — add manually later
            </h3>
            <button
              onClick={copySkipped}
              className="font-body text-xs px-2 py-1 rounded border border-border hover:bg-black/5"
            >
              Copy as TSV
            </button>
          </div>
          <ul className="font-body text-sm space-y-1.5">
            {skipped.map((r) => (
              <li
                key={r.row_id}
                className="flex justify-between gap-2 border-b border-border/50 pb-1"
              >
                <span className="text-text-primary">{r.title_raw}</span>
                <span className="text-text-secondary text-xs whitespace-nowrap">
                  {r.platform_normalized} · {r.completed_at ?? "?"} · {r.hours}h
                  {r.is_dlc ? " · DLC" : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {imported.length > 0 && (
        <details className="border border-border rounded-lg p-5 bg-surface">
          <summary className="font-ui font-bold text-text-primary cursor-pointer">
            Imported games ({imported.length})
          </summary>
          <ul className="font-body text-sm space-y-1.5 mt-3">
            {imported.map((rec) => (
              <li
                key={rec.row.row_id}
                className="flex justify-between gap-2 border-b border-border/50 pb-1"
              >
                <Link
                  to={`/collection/${rec.collection_entry_id}`}
                  className="text-text-primary hover:underline"
                >
                  {rec.game_name}
                </Link>
                <span className="text-text-secondary text-xs whitespace-nowrap">
                  {rec.row.platform_normalized} · {rec.row.completed_at}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}

      <Button onClick={onReset}>Import another file</Button>
    </div>
  );
}
