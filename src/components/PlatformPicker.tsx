import { useState } from "react";
import type { Platform } from "../api/platforms";
import { Button } from "./ui/Button";

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
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (sorted.length === 0) {
    return (
      <p className="text-[0.7rem] text-text-muted">No platforms available.</p>
    );
  }

  return (
    <div className="flex flex-col gap-1 mt-1">
      <div className="flex gap-1 min-w-0">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(Number(e.target.value))}
          disabled={isLoading}
          className="flex-1 min-w-0 font-ui text-[0.7rem] bg-surface border border-border-hi rounded px-1.5 py-1 text-text-primary disabled:opacity-50 focus:outline-none focus:border-accent"
        >
          {sorted.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <Button
          onClick={handleAdd}
          disabled={isLoading}
          className="!text-[0.7rem] !px-2 !py-1"
        >
          {isLoading ? "Adding…" : "Add"}
        </Button>
      </div>
      {error && <p className="text-[0.7rem] text-[#e06c75]">{error}</p>}
    </div>
  );
}
