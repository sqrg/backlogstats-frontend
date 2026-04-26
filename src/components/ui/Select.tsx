interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: SelectOption<T>[];
  prefix?: string;
  ariaLabel?: string;
}

export function Select<T extends string>({
  value,
  onChange,
  options,
  prefix,
  ariaLabel,
}: SelectProps<T>) {
  return (
    <div className="relative">
      <select
        aria-label={ariaLabel ?? prefix}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="appearance-none cursor-pointer bg-surface border border-border-hi text-text-primary font-ui text-[0.8rem] pl-2.5 pr-8 py-[7px] rounded outline-none transition-colors focus:border-accent"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {prefix ? `${prefix} ${o.label}` : o.label}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
        width="10"
        height="6"
        viewBox="0 0 10 6"
        fill="none"
      >
        <path
          d="M1 1L5 5L9 1"
          stroke="#8ab8b0"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
