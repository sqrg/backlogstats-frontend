import { platformVisual } from "../lib/visuals";

interface PlatformChipProps {
  name: string;
  abbr?: boolean;
}

export function PlatformChip({ name, abbr = true }: PlatformChipProps) {
  const v = platformVisual(name);
  return (
    <span
      className="font-mono font-medium text-[0.6rem] tracking-wider px-1.5 py-[2px] rounded-[4px]"
      style={{
        color: v.color,
        background: `${v.color}18`,
        border: `1px solid ${v.color}40`,
      }}
    >
      {abbr ? v.abbr : name}
    </span>
  );
}

export function DlcChip() {
  return (
    <span className="font-mono font-medium text-[0.6rem] tracking-wider px-1.5 py-[2px] rounded-[4px] text-text-secondary bg-teal/[0.07] border border-border-hi">
      DLC
    </span>
  );
}
