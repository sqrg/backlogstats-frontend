import { forwardRef, type InputHTMLAttributes } from "react";

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  shortcut?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    { shortcut, className = "", placeholder = "Search…", ...rest },
    ref,
  ) {
    return (
      <div className={`relative ${className}`}>
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
          width="13"
          height="13"
          viewBox="0 0 16 16"
          fill="none"
          stroke="#8ab8b0"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <circle cx="7" cy="7" r="5" />
          <path d="m12 12 2.5 2.5" />
        </svg>
        <input
          ref={ref}
          type="text"
          placeholder={placeholder}
          className={[
            "w-full bg-surface border border-border-hi text-text-primary font-body text-[0.82rem] pl-[30px] py-2 rounded outline-none transition-colors focus:border-accent placeholder:text-text-muted",
            shortcut ? "pr-[22px]" : "pr-2.5",
          ].join(" ")}
          {...rest}
        />
        {shortcut && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[0.62rem] text-text-muted pointer-events-none">
            {shortcut}
          </span>
        )}
      </div>
    );
  },
);
