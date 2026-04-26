import type { PlaythroughStatus } from "../types/playthrough";
import { STATUS_VISUALS } from "../lib/visuals";

export function StatusPill({ status }: { status: PlaythroughStatus }) {
  const cfg = STATUS_VISUALS[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 self-start font-ui font-medium text-[0.68rem] px-2 py-[3px] rounded-full tracking-[0.01em]"
      style={{
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
      }}
    >
      <span
        className="w-[5px] h-[5px] rounded-full shrink-0"
        style={{ background: cfg.color }}
      />
      {cfg.label}
    </span>
  );
}
