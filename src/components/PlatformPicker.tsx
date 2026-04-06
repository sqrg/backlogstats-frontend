import { useState } from "react";
import type { Platform } from "../api/platforms";

interface PlatformPickerProps {
  platforms: Platform[];
  onAdd: (platformId: number) => Promise<void>;
  isLoading: boolean;
}

export function PlatformPicker({
  platforms,
  onAdd,
  isLoading,
}: PlatformPickerProps) {
  const sorted = [...platforms].sort((a, b) => a.name.localeCompare(b.name));
  const [selectedId, setSelectedId] = useState<number>(
    sorted.length > 0 ? sorted[0].id : 0,
  );
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    setError(null);
    try {
      await onAdd(selectedId);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    }
  }

  if (sorted.length === 0) {
    return <p className="text-xs text-gray-400">No platforms available.</p>;
  }

  return (
    <div className="flex flex-col gap-1 mt-1">
      <div className="flex gap-1 min-w-0">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(Number(e.target.value))}
          disabled={isLoading}
          className="flex-1 min-w-0 text-xs border border-gray-300 rounded px-1 py-1 disabled:opacity-50"
        >
          {sorted.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          disabled={isLoading}
          className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Adding…" : "Add"}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
