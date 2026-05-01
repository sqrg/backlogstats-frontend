import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { TopNav } from "../components/TopNav";
import { PlatformChip } from "../components/PlatformChip";
import { getCollectionEntry } from "../api/collection";
import { getGameById } from "../api/games";
import { listUserLists, createListEntry } from "../api/user_lists";
import { createPlaythrough, updatePlaythrough, deletePlaythrough } from "../api/playthroughs";
import { STATUS_VISUALS, coverUrl } from "../lib/visuals";
import type { CollectionEntryDetail } from "../types/collection";
import type { GameDetail } from "../types/game";
import type { UserList } from "../types/user_list";
import type { Playthrough, PlaythroughStatus } from "../types/playthrough";
import { ALL_STATUSES } from "../types/playthrough";

// ── Helpers ───────────────────────────────────────────────────────────────────

function gameHue(gameId: number): number {
  return (gameId * 137) % 360;
}

function formatReleaseDate(ts: number | null | undefined): string {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "present";
  return iso;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status, small = false }: { status: PlaythroughStatus; small?: boolean }) {
  const cfg = STATUS_VISUALS[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontFamily: '"Space Grotesk", sans-serif',
        fontWeight: 500,
        fontSize: small ? "0.65rem" : "0.72rem",
        color: cfg.color,
        background: cfg.bg,
        padding: small ? "2px 7px" : "3px 9px",
        borderRadius: 99,
        border: `1px solid ${cfg.color}33`,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: cfg.color,
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
}

function Stars({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (n: number) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const active = (hover ?? value ?? 0) >= n;
        return (
          <svg
            key={n}
            width="18"
            height="18"
            viewBox="0 0 16 16"
            style={{ cursor: "pointer", flexShrink: 0 }}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onChange(n)}
          >
            <path
              d="M8 1.2l1.8 3.65 4.03.59-2.92 2.84.69 4.01L8 10.3l-3.6 1.89.69-4.01L2.17 5.44l4.03-.59z"
              fill={active ? "#02c39a" : "none"}
              stroke={active ? "#02c39a" : "#b0d4ca"}
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        );
      })}
    </div>
  );
}

function CoverArtHero({
  coverImageId,
  name,
  hue,
}: {
  coverImageId: string | null;
  name: string;
  hue: number;
}) {
  const sat = 0.14;
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      style={{
        width: 148,
        height: 197,
        borderRadius: 10,
        overflow: "hidden",
        flexShrink: 0,
        position: "relative",
        boxShadow:
          "0 6px 28px rgba(2,128,144,0.22), 0 1px 4px rgba(0,0,0,0.08)",
      }}
    >
      {coverImageId ? (
        <img
          src={coverUrl(coverImageId)}
          alt={name}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(160deg, oklch(72% ${sat} ${hue}) 0%, oklch(58% ${sat * 0.7} ${hue + 30}) 100%)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(ellipse at 30% 20%, oklch(82% ${sat * 1.1} ${hue}) 0%, transparent 60%)`,
              opacity: 0.6,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 700,
                fontSize: 148 * 0.18,
                color: `oklch(30% ${sat * 0.8} ${hue})`,
                opacity: 0.4,
                userSelect: "none",
              }}
            >
              {initials}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: '"Space Grotesk", sans-serif',
        fontWeight: 700,
        fontSize: "0.65rem",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "#8ab8b0",
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "baseline",
        padding: "7px 0",
        borderBottom: "1px solid #cce3db",
      }}
    >
      <span
        style={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: 500,
          fontSize: "0.7rem",
          textTransform: "uppercase",
          color: "#8ab8b0",
          minWidth: 82,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: "0.82rem",
          color: "#2d7870",
          lineHeight: 1.4,
        }}
      >
        {children}
      </span>
    </div>
  );
}

// ── Playthrough log form ──────────────────────────────────────────────────────

interface PlaythroughFormState {
  status: PlaythroughStatus;
  started_at: string;
  completed_at: string;
  notes: string;
}

const EMPTY_PT_FORM: PlaythroughFormState = {
  status: "NOT_STARTED",
  started_at: "",
  completed_at: "",
  notes: "",
};

function PlaythroughLogForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: PlaythroughFormState;
  onSave: (f: PlaythroughFormState) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof PlaythroughFormState>(
    k: K,
    v: PlaythroughFormState[K],
  ) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  }

  const inputCls = {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: "0.8rem",
    color: "#062924",
    background: "#fff",
    border: "1px solid #b0d4ca",
    borderRadius: 6,
    padding: "6px 10px",
    outline: "none",
    width: "100%",
  } as React.CSSProperties;

  const labelCls = {
    fontFamily: '"Space Grotesk", sans-serif',
    fontWeight: 500,
    fontSize: "0.72rem",
    textTransform: "uppercase" as const,
    color: "#8ab8b0",
    letterSpacing: "0.06em",
    marginBottom: 4,
    display: "block",
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #cce3db",
        borderRadius: 10,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div>
        <label style={labelCls}>Status</label>
        <select
          value={form.status}
          onChange={(e) => set("status", e.target.value as PlaythroughStatus)}
          style={{ ...inputCls, cursor: "pointer" }}
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_VISUALS[s].label}
            </option>
          ))}
        </select>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <label style={labelCls}>Started</label>
          <input
            type="date"
            value={form.started_at}
            onChange={(e) => set("started_at", e.target.value)}
            style={inputCls}
          />
        </div>
        {form.status === "COMPLETED" && (
          <div style={{ flex: 1 }}>
            <label style={labelCls}>Completed</label>
            <input
              type="date"
              value={form.completed_at}
              onChange={(e) => set("completed_at", e.target.value)}
              style={inputCls}
            />
          </div>
        )}
      </div>
      <div>
        <label style={labelCls}>Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={2}
          style={{ ...inputCls, resize: "vertical" }}
          placeholder="Optional notes about this run…"
        />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 600,
            fontSize: "0.75rem",
            color: "#fff",
            background: "#02c39a",
            border: "none",
            borderRadius: 6,
            padding: "7px 14px",
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 500,
            fontSize: "0.75rem",
            color: "#2d7870",
            background: "#fff",
            border: "1px solid #b0d4ca",
            borderRadius: 6,
            padding: "7px 14px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Tab bar ───────────────────────────────────────────────────────────────────

type TabId = "playthroughs" | "dlc" | "lists";

const TABS: { id: TabId; label: string }[] = [
  { id: "playthroughs", label: "Playthroughs" },
  { id: "dlc", label: "DLC & Expansions" },
  { id: "lists", label: "My Lists" },
];

function TabBar({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (t: TabId) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        borderBottom: "1px solid #cce3db",
        marginBottom: 16,
      }}
    >
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 500,
            fontSize: "0.8rem",
            color: active === t.id ? "#062924" : "#8ab8b0",
            background: "none",
            border: "none",
            borderBottom:
              active === t.id ? "2px solid #02c39a" : "2px solid transparent",
            padding: "8px 16px",
            marginBottom: -1,
            cursor: "pointer",
            transition: "color 0.15s",
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function GameDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [entry, setEntry] = useState<CollectionEntryDetail | null>(null);
  const [game, setGame] = useState<GameDetail | null>(null);
  const [lists, setLists] = useState<UserList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<PlaythroughStatus>("NOT_STARTED");
  const [rating, setRating] = useState<number | null>(null);
  const [tab, setTab] = useState<TabId>("playthroughs");
  const [isAddingPT, setIsAddingPT] = useState(false);
  const [editingPTId, setEditingPTId] = useState<number | null>(null);
  const [isAddingToList, setIsAddingToList] = useState(false);

  useEffect(() => {
    if (!id) return;
    const entryId = Number(id);

    async function load() {
      try {
        const [entryData, listsData] = await Promise.all([
          getCollectionEntry(entryId),
          listUserLists(),
        ]);
        setEntry(entryData);
        setStatus(entryData.current_status ?? "NOT_STARTED");
        setLists(listsData);
        try {
          const gameData = await getGameById(entryData.game.id);
          setGame(gameData);
        } catch {
          // Proceed without full game detail
        }
      } catch {
        setError("Failed to load game.");
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [id]);

  // Handlers

  async function handleStatusChange(s: PlaythroughStatus) {
    if (!entry) return;
    const prev = status;
    setStatus(s);
    try {
      const pt = await createPlaythrough(entry.id, {
        status: s,
        started_at: new Date().toISOString().split("T")[0],
        completed_at: s === "COMPLETED" ? new Date().toISOString().split("T")[0] : null,
        completion_time: null,
        notes: null,
      });
      setEntry((e) => e ? { ...e, playthroughs: [...e.playthroughs, pt], current_status: s } : e);
    } catch {
      setStatus(prev);
    }
  }

  async function handleCreatePT(form: PlaythroughFormState) {
    if (!entry) return;
    const pt = await createPlaythrough(entry.id, {
      status: form.status,
      started_at: form.started_at || null,
      completed_at: form.status === "COMPLETED" ? form.completed_at || null : null,
      completion_time: null,
      notes: form.notes || null,
    });
    setEntry((e) => e ? { ...e, playthroughs: [...e.playthroughs, pt] } : e);
    setIsAddingPT(false);
  }

  async function handleUpdatePT(ptId: number, form: PlaythroughFormState) {
    const pt = await updatePlaythrough(ptId, {
      status: form.status,
      started_at: form.started_at || null,
      completed_at: form.status === "COMPLETED" ? form.completed_at || null : null,
      notes: form.notes || null,
    });
    setEntry((e) =>
      e ? { ...e, playthroughs: e.playthroughs.map((p) => (p.id === ptId ? pt : p)) } : e,
    );
    setEditingPTId(null);
  }

  async function handleDeletePT(ptId: number) {
    await deletePlaythrough(ptId);
    setEntry((e) =>
      e ? { ...e, playthroughs: e.playthroughs.filter((p) => p.id !== ptId) } : e,
    );
  }

  async function handleAddToList(listId: number) {
    if (!entry) return;
    try {
      await createListEntry(listId, entry.game.id);
      const updated = await listUserLists();
      setLists(updated);
    } catch {
      // already in list or other error
    }
    setIsAddingToList(false);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg">
        <TopNav />
        <div className="max-w-[1100px] mx-auto px-6 pt-16">
          <p className="font-body text-text-secondary">Loading…</p>
        </div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="min-h-screen bg-bg">
        <TopNav />
        <div className="max-w-[1100px] mx-auto px-6 pt-16">
          <p className="font-body text-[#e06c75]">{error ?? "Game not found."}</p>
        </div>
      </div>
    );
  }

  const hue = gameHue(entry.game.id);
  const genres = game?.genres ?? [];
  const summary = game?.summary ?? null;
  const releaseDate = formatReleaseDate(game?.first_release_date);
  const addedDate = new Date(entry.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const gameLists = lists.filter((l) =>
    l.entries.some((e) => e.game_id === entry.game.id),
  );
  const availableLists = lists.filter(
    (l) => !l.entries.some((e) => e.game_id === entry.game.id),
  );

  return (
    <div className="min-h-screen bg-bg">
      <TopNav />

      {/* ── Hero band ── */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(175deg, oklch(90% 0.06 ${hue}) 0%, #edf4f1 100%)`,
          borderBottom: "1px solid #cce3db",
        }}
      >
        {/* Radial bloom */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `radial-gradient(ellipse 55% 100% at 8% 0%, oklch(80% 0.09 ${hue}) 0%, transparent 70%)`,
            opacity: 0.45,
          }}
        />

        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "16px 24px 0",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Breadcrumb */}
          <div style={{ paddingBottom: 16 }}>
            <Link
              to="/collection"
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "0.78rem",
                color: "#8ab8b0",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "#2d7870")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "#8ab8b0")
              }
            >
              ← My Collection
            </Link>
          </div>

          {/* Content row */}
          <div
            style={{
              display: "flex",
              gap: 28,
              alignItems: "flex-end",
              paddingBottom: 24,
            }}
          >
            <CoverArtHero
              coverImageId={entry.game.cover_image_id}
              name={entry.game.name}
              hue={hue}
            />

            {/* Title block */}
            <div style={{ flex: 1, minWidth: 0, paddingBottom: 6 }}>
              <div
                style={{
                  display: "flex",
                  gap: 7,
                  alignItems: "center",
                  marginBottom: 8,
                  flexWrap: "wrap",
                }}
              >
                <StatusBadge status={status} />
                {genres.map((g) => (
                  <span
                    key={g}
                    style={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: "0.72rem",
                      color: "#2d7870",
                      background: "rgba(255,255,255,0.65)",
                      border: "1px solid #cce3db",
                      padding: "1px 8px",
                      borderRadius: 99,
                    }}
                  >
                    {g}
                  </span>
                ))}
              </div>

              <h1
                style={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontWeight: 700,
                  fontSize: "2rem",
                  color: "#062924",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  marginBottom: 6,
                }}
              >
                {entry.game.name}
              </h1>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  flexWrap: "wrap",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.72rem",
                    color: "#8ab8b0",
                  }}
                >
                  {releaseDate}
                </span>
              </div>

              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                <PlatformChip name={entry.platform.name} abbr={false} />
              </div>
            </div>

            {/* Rating + status toggles */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                alignItems: "flex-end",
                paddingBottom: 8,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 4,
                }}
              >
                <Stars value={rating} onChange={setRating} />
                <span
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.68rem",
                    color: "#8ab8b0",
                  }}
                >
                  {rating ? `${rating} / 5` : "Not rated"}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 4,
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                  maxWidth: 300,
                }}
              >
                {ALL_STATUSES.map((s) => {
                  const active = s === status;
                  const cfg = STATUS_VISUALS[s];
                  return (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      style={{
                        fontFamily: '"Space Grotesk", sans-serif',
                        fontWeight: active ? 600 : 400,
                        fontSize: "0.7rem",
                        color: active ? cfg.color : "#8ab8b0",
                        background: active
                          ? cfg.bg
                          : "rgba(255,255,255,0.55)",
                        border: `1px solid ${active ? cfg.color + "44" : "#cce3db"}`,
                        padding: "3px 10px",
                        borderRadius: 99,
                        cursor: "pointer",
                        transition: "all 0.12s",
                      }}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "28px 24px 60px",
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: 28,
        }}
      >
        {/* Left: summary + tabs */}
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          {summary && (
            <p
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "0.88rem",
                color: "#2d7870",
                lineHeight: 1.7,
                maxWidth: 640,
              }}
            >
              {summary}
            </p>
          )}

          <div>
            <TabBar active={tab} onChange={setTab} />

            {/* Playthroughs tab */}
            {tab === "playthroughs" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {entry.playthroughs.map((pt) =>
                  editingPTId === pt.id ? (
                    <PlaythroughLogForm
                      key={pt.id}
                      initial={{
                        status: pt.status,
                        started_at: pt.started_at ?? "",
                        completed_at: pt.completed_at ?? "",
                        notes: pt.notes ?? "",
                      }}
                      onSave={(form) => handleUpdatePT(pt.id, form)}
                      onCancel={() => setEditingPTId(null)}
                    />
                  ) : (
                    <PlaythroughCard
                      key={pt.id}
                      pt={pt}
                      platformName={entry.platform.name}
                      onEdit={() => setEditingPTId(pt.id)}
                      onDelete={() => handleDeletePT(pt.id)}
                    />
                  ),
                )}

                {isAddingPT ? (
                  <PlaythroughLogForm
                    initial={EMPTY_PT_FORM}
                    onSave={handleCreatePT}
                    onCancel={() => setIsAddingPT(false)}
                  />
                ) : (
                  <button
                    onClick={() => setIsAddingPT(true)}
                    style={{
                      alignSelf: "flex-start",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontFamily: '"Space Grotesk", sans-serif',
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      color: "#02c39a",
                      background: "rgba(2,195,154,0.10)",
                      border: "1px solid rgba(2,195,154,0.25)",
                      borderRadius: 6,
                      padding: "6px 12px",
                      cursor: "pointer",
                      marginTop: entry.playthroughs.length > 0 ? 2 : 0,
                    }}
                  >
                    + Log new run
                  </button>
                )}
              </div>
            )}

            {/* DLC tab */}
            {tab === "dlc" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {entry.children.length === 0 ? (
                  <p
                    style={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: "0.82rem",
                      color: "#8ab8b0",
                      padding: "20px 0",
                    }}
                  >
                    No DLC tracked yet.
                  </p>
                ) : (
                  entry.children.map((child) => (
                    <Link
                      key={child.id}
                      to={`/games/${child.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <div
                        style={{
                          background: "#fff",
                          border: "1px solid #cce3db",
                          borderRadius: 10,
                          padding: "11px 14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                          cursor: "pointer",
                          transition: "border-color 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.borderColor = "#b0d4ca")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.borderColor = "#cce3db")
                        }
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 5,
                          }}
                        >
                          <p
                            style={{
                              fontFamily: '"Space Grotesk", sans-serif',
                              fontWeight: 600,
                              fontSize: "0.82rem",
                              color: "#062924",
                            }}
                          >
                            {child.game.name}
                          </p>
                          <PlatformChip name={child.platform.name} abbr={false} />
                        </div>
                        <StatusBadge status="NOT_STARTED" small />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}

            {/* My Lists tab */}
            {tab === "lists" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {gameLists.length === 0 && (
                  <p
                    style={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: "0.82rem",
                      color: "#8ab8b0",
                      padding: "12px 0 4px",
                    }}
                  >
                    Not in any lists yet.
                  </p>
                )}
                {gameLists.map((l) => (
                  <div
                    key={l.id}
                    style={{
                      background: "#fff",
                      border: "1px solid #cce3db",
                      borderRadius: 10,
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: '"Space Grotesk", sans-serif',
                        fontWeight: 500,
                        fontSize: "0.82rem",
                        color: "#062924",
                      }}
                    >
                      {l.name}
                    </span>
                    <span
                      style={{
                        fontFamily: '"DM Sans", sans-serif',
                        fontSize: "0.72rem",
                        color: "#8ab8b0",
                      }}
                    >
                      In list
                    </span>
                  </div>
                ))}

                {isAddingToList ? (
                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #cce3db",
                      borderRadius: 10,
                      padding: "12px 14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    {availableLists.length === 0 ? (
                      <p
                        style={{
                          fontFamily: '"DM Sans", sans-serif',
                          fontSize: "0.82rem",
                          color: "#8ab8b0",
                        }}
                      >
                        No other lists available.
                      </p>
                    ) : (
                      availableLists.map((l) => (
                        <button
                          key={l.id}
                          onClick={() => handleAddToList(l.id)}
                          style={{
                            fontFamily: '"Space Grotesk", sans-serif',
                            fontWeight: 500,
                            fontSize: "0.82rem",
                            color: "#062924",
                            background: "none",
                            border: "none",
                            padding: "4px 0",
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "color 0.12s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "#02c39a")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#062924")
                          }
                        >
                          + {l.name}
                        </button>
                      ))
                    )}
                    <button
                      onClick={() => setIsAddingToList(false)}
                      style={{
                        fontFamily: '"Space Grotesk", sans-serif',
                        fontWeight: 500,
                        fontSize: "0.72rem",
                        color: "#8ab8b0",
                        background: "none",
                        border: "none",
                        padding: "2px 0",
                        cursor: "pointer",
                        textAlign: "left",
                        marginTop: 2,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingToList(true)}
                    style={{
                      alignSelf: "flex-start",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontFamily: '"Space Grotesk", sans-serif',
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      color: "#2d7870",
                      background: "#fff",
                      border: "1px solid #b0d4ca",
                      borderRadius: 6,
                      padding: "6px 12px",
                      cursor: "pointer",
                      marginTop: gameLists.length > 0 ? 2 : 0,
                    }}
                  >
                    + Add to list
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: metadata sidebar */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #cce3db",
            borderRadius: 10,
            padding: "16px 18px",
            height: "fit-content",
          }}
        >
          <SectionLabel>Game Details</SectionLabel>
          <MetaRow label="Released">{releaseDate}</MetaRow>
          <MetaRow label="Platform">
            <PlatformChip name={entry.platform.name} abbr={false} />
          </MetaRow>
          {genres.length > 0 && (
            <MetaRow label="Genres">
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {genres.map((g) => (
                  <span
                    key={g}
                    style={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: "0.75rem",
                      color: "#2d7870",
                      background: "rgba(2,195,154,0.08)",
                      border: "1px solid rgba(2,195,154,0.2)",
                      padding: "1px 7px",
                      borderRadius: 99,
                    }}
                  >
                    {g}
                  </span>
                ))}
              </div>
            </MetaRow>
          )}
          <MetaRow label="Added">{addedDate}</MetaRow>
          <MetaRow label="My copy">
            <PlatformChip name={entry.platform.name} abbr={false} />
          </MetaRow>
        </div>
      </div>
    </div>
  );
}

// ── Playthrough card ──────────────────────────────────────────────────────────

function PlaythroughCard({
  pt,
  platformName,
  onEdit,
  onDelete,
}: {
  pt: Playthrough;
  platformName: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #cce3db",
        borderRadius: 10,
        padding: "12px 14px",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
      }}
    >
      <StatusBadge status={pt.status} small />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 5,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <PlatformChip name={platformName} abbr={false} />
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.67rem",
              color: "#8ab8b0",
            }}
          >
            {formatDate(pt.started_at)} → {formatDate(pt.completed_at)}
          </span>
        </div>
        {pt.notes && (
          <p
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.8rem",
              color: "#2d7870",
              lineHeight: 1.5,
            }}
          >
            {pt.notes}
          </p>
        )}
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button
          onClick={onEdit}
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: "0.67rem",
            color: "#8ab8b0",
            background: "none",
            border: "1px solid #cce3db",
            borderRadius: 4,
            padding: "2px 7px",
            cursor: "pointer",
            transition: "color 0.12s, border-color 0.12s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#2d7870";
            e.currentTarget.style.borderColor = "#b0d4ca";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#8ab8b0";
            e.currentTarget.style.borderColor = "#cce3db";
          }}
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: "0.67rem",
            color: "#e06c75",
            background: "none",
            border: "1px solid rgba(224,108,117,0.3)",
            borderRadius: 4,
            padding: "2px 7px",
            cursor: "pointer",
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
