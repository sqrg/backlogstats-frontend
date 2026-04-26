import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getCollectionEntry, setBaseGame } from "../api/collection";
import {
  createPlaythrough,
  updatePlaythrough,
  deletePlaythrough,
} from "../api/playthroughs";
import { BaseGamePicker } from "../components/BaseGamePicker";
import { PageShell } from "../components/ui";
import type { CollectionEntry, CollectionEntryDetail } from "../types/collection";
import type { Playthrough, PlaythroughStatus } from "../types/playthrough";
import { STATUS_LABELS, ALL_STATUSES } from "../types/playthrough";

const coverUrl = (coverImageId: string) =>
  `https://images.igdb.com/igdb/image/upload/t_cover_big/${coverImageId}.jpg`;

interface FormState {
  status: PlaythroughStatus;
  started_at: string;
  completed_at: string;
  completion_time: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  status: "NOT_STARTED",
  started_at: "",
  completed_at: "",
  completion_time: "",
  notes: "",
};

function formToPayload(form: FormState) {
  return {
    status: form.status,
    started_at: form.started_at || null,
    completed_at:
      form.status === "COMPLETED" ? form.completed_at || null : null,
    completion_time:
      form.status === "COMPLETED" && form.completion_time
        ? Number(form.completion_time)
        : null,
    notes: form.notes || null,
  };
}

function playthroughToForm(p: Playthrough): FormState {
  return {
    status: p.status,
    started_at: p.started_at ?? "",
    completed_at: p.completed_at ?? "",
    completion_time: p.completion_time != null ? String(p.completion_time) : "",
    notes: p.notes ?? "",
  };
}

interface PlaythroughFormProps {
  initial: FormState;
  onSave: (form: FormState) => Promise<void>;
  onCancel: () => void;
}

function PlaythroughForm({ initial, onSave, onCancel }: PlaythroughFormProps) {
  const [form, setForm] = useState<FormState>(initial);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleStatusChange(newStatus: PlaythroughStatus) {
    setForm((prev) => {
      const updates: Partial<FormState> = { status: newStatus };
      if (newStatus === "COMPLETED" && !prev.completed_at) {
        updates.completed_at = new Date().toISOString().split("T")[0];
      }
      return { ...prev, ...updates };
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-gray-200 rounded p-4 flex flex-col gap-3 text-sm">
      <div className="flex flex-col gap-1">
        <label className="font-medium">Status</label>
        <select
          value={form.status}
          onChange={(e) => handleStatusChange(e.target.value as PlaythroughStatus)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="font-medium">Started</label>
        <input
          type="date"
          value={form.started_at}
          onChange={(e) => set("started_at", e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        />
      </div>
      {form.status === "COMPLETED" && (
        <>
          <div className="flex flex-col gap-1">
            <label className="font-medium">Completed</label>
            <input
              type="date"
              value={form.completed_at}
              onChange={(e) => set("completed_at", e.target.value)}
              className="border border-gray-300 rounded px-2 py-1"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium">Completion time (hours)</label>
            <input
              type="number"
              min="0"
              value={form.completion_time}
              onChange={(e) => set("completion_time", e.target.value)}
              className="border border-gray-300 rounded px-2 py-1"
            />
          </div>
        </>
      )}
      <div className="flex flex-col gap-1">
        <label className="font-medium">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={2}
          className="border border-gray-300 rounded px-2 py-1"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-3 py-1 rounded bg-gray-900 text-white text-xs hover:bg-gray-700 disabled:opacity-50"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-3 py-1 rounded border border-gray-300 text-xs hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function CollectionEntryPage() {
  const { id } = useParams<{ id: string }>();
  const [entry, setEntry] = useState<CollectionEntryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [baseGameLoading, setBaseGameLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    getCollectionEntry(Number(id))
      .then(setEntry)
      .catch(() => setError("Failed to load entry."))
      .finally(() => setIsLoading(false));
  }, [id]);

  async function handleCreate(form: FormState) {
    if (!entry) return;
    const p = await createPlaythrough(entry.id, formToPayload(form));
    setEntry((prev) =>
      prev ? { ...prev, playthroughs: [...prev.playthroughs, p] } : prev,
    );
    setIsAdding(false);
  }

  async function handleUpdate(playthroughId: number, form: FormState) {
    const p = await updatePlaythrough(playthroughId, formToPayload(form));
    setEntry((prev) =>
      prev
        ? {
            ...prev,
            playthroughs: prev.playthroughs.map((x) =>
              x.id === playthroughId ? p : x,
            ),
          }
        : prev,
    );
    setEditingId(null);
  }

  async function handleSetBaseGame(picked: CollectionEntry) {
    if (!entry) return;
    setBaseGameLoading(true);
    setIsPickerOpen(false);
    try {
      const updated = await setBaseGame(entry.id, picked.id);
      setEntry((prev) => (prev ? { ...prev, base_game: updated.base_game } : prev));
    } catch {
      // ignore
    } finally {
      setBaseGameLoading(false);
    }
  }

  async function handleClearBaseGame() {
    if (!entry) return;
    setBaseGameLoading(true);
    try {
      const updated = await setBaseGame(entry.id, null);
      setEntry((prev) => (prev ? { ...prev, base_game: updated.base_game } : prev));
    } catch {
      // ignore
    } finally {
      setBaseGameLoading(false);
    }
  }

  async function handleDelete(playthroughId: number) {
    await deletePlaythrough(playthroughId);
    setEntry((prev) =>
      prev
        ? {
            ...prev,
            playthroughs: prev.playthroughs.filter(
              (x) => x.id !== playthroughId,
            ),
          }
        : prev,
    );
  }

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto pt-8">
      {isLoading && <p className="text-gray-500">Loading…</p>}
      {!isLoading && error && <p className="text-red-500">{error}</p>}
      {!isLoading && !error && entry && (
        <>
          <div className="flex gap-6 mb-8">
            {entry.game.cover_image_id ? (
              <img
                src={coverUrl(entry.game.cover_image_id)}
                alt={entry.game.name}
                className="w-24 rounded shrink-0"
              />
            ) : (
              <div className="w-24 aspect-[227/320] bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs shrink-0">
                No cover
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{entry.game.name}</h1>
              <p className="text-gray-500 mt-1">{entry.platform.name}</p>
              <p className="text-gray-400 text-sm mt-1">
                Added: {new Date(entry.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <section className="mt-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Base Game
            </h2>
            {entry.base_game ? (
              <div className="flex items-center gap-3">
                {entry.base_game.game.cover_image_id ? (
                  <img
                    src={coverUrl(entry.base_game.game.cover_image_id)}
                    className="w-8 h-10 object-cover rounded"
                  />
                ) : (
                  <div className="w-8 h-10 bg-gray-100 rounded" />
                )}
                <div>
                  <p className="text-sm font-medium">{entry.base_game.game.name}</p>
                  <p className="text-xs text-gray-500">{entry.base_game.platform.name}</p>
                </div>
                <button
                  onClick={handleClearBaseGame}
                  disabled={baseGameLoading}
                  className="ml-auto text-xs text-red-500 hover:underline disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Not set</p>
            )}
            {!entry.base_game && !isPickerOpen && (
              <button
                onClick={() => setIsPickerOpen(true)}
                disabled={baseGameLoading}
                className="mt-2 text-sm text-blue-600 hover:underline disabled:opacity-50"
              >
                Set base game
              </button>
            )}
            {isPickerOpen && (
              <BaseGamePicker
                excludeEntryId={entry.id}
                onSelect={handleSetBaseGame}
                onCancel={() => setIsPickerOpen(false)}
              />
            )}
          </section>

          {entry.children.length > 0 && (
            <section className="mt-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                DLC &amp; Expansions
              </h2>
              <div className="flex flex-col gap-2">
                {entry.children.map((child) => (
                  <Link
                    key={child.id}
                    to={`/collection/${child.id}`}
                    className="flex items-center gap-3 p-2 rounded border border-gray-200 hover:bg-gray-50"
                  >
                    {child.game.cover_image_id ? (
                      <img
                        src={coverUrl(child.game.cover_image_id)}
                        alt={child.game.name}
                        className="w-8 h-10 object-cover rounded shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-10 bg-gray-100 rounded shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium leading-tight">{child.game.name}</p>
                      <p className="text-xs text-gray-500">{child.platform.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Playthroughs</h2>
              {!isAdding && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm hover:bg-gray-50"
                >
                  Log playthrough
                </button>
              )}
            </div>

            {entry.playthroughs.length === 0 && !isAdding && (
              <p className="text-gray-500 text-sm">
                No playthroughs logged yet.
              </p>
            )}

            <div className="flex flex-col gap-3">
              {entry.playthroughs.map((p) =>
                editingId === p.id ? (
                  <PlaythroughForm
                    key={p.id}
                    initial={playthroughToForm(p)}
                    onSave={(form) => handleUpdate(p.id, form)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div
                    key={p.id}
                    className="border border-gray-200 rounded p-4 text-sm flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {STATUS_LABELS[p.status]}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingId(p.id)}
                          className="border border-gray-300 rounded px-2 py-0.5 text-xs hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="border border-red-300 text-red-600 rounded px-2 py-0.5 text-xs hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {p.started_at && (
                      <p className="text-gray-500">Started: {p.started_at}</p>
                    )}
                    {p.status === "COMPLETED" && p.completed_at && (
                      <p className="text-gray-500">
                        Completed: {p.completed_at}
                      </p>
                    )}
                    {p.status === "COMPLETED" && p.completion_time != null && (
                      <p className="text-gray-500">
                        {p.completion_time}h to complete
                      </p>
                    )}
                    {p.notes && <p className="text-gray-600 mt-1">{p.notes}</p>}
                  </div>
                ),
              )}

              {isAdding && (
                <PlaythroughForm
                  initial={EMPTY_FORM}
                  onSave={handleCreate}
                  onCancel={() => setIsAdding(false)}
                />
              )}
            </div>
          </div>
        </>
      )}
      </div>
    </PageShell>
  );
}
