"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type SearchableSelectProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
};

export function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Search...",
  error,
  hint,
  disabled,
  name,
  required,
}: SearchableSelectProps) {
  const id = React.useId();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const ref = React.useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, 80);
    return options.filter((o) => o.label.toLowerCase().includes(q)).slice(0, 80);
  }, [options, query]);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="w-full min-w-0" ref={ref}>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      {label ? (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-primary">
          {label} {required ? <span className="text-danger">*</span> : null}
        </label>
      ) : null}
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "touch-target flex w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-border bg-white px-3.5 py-2.5 text-left text-base text-text shadow-[0_1px_2px_rgba(20,35,59,0.03)] transition-all duration-150 focus:border-accent focus:ring-2 focus:ring-accent/20",
          error && "border-danger focus:border-danger focus:ring-danger/20",
          disabled && "opacity-60",
        )}
        onClick={() => {
          if (disabled) return;
          setOpen((v) => !v);
          setQuery("");
        }}
      >
        <span className={cn("truncate", !selected && "text-muted/80")}>{selected?.label || placeholder}</span>
        <ChevronDown aria-hidden className={cn("size-4 shrink-0 text-muted transition", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="relative z-30 mt-1 rounded-xl border border-border bg-white p-2 shadow-xl">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search..."
            className="touch-target mb-2 w-full rounded-md border border-border bg-warm-ivory px-3 py-2 text-sm text-text focus:border-accent focus:ring-1 focus:ring-accent"
            aria-label={`Search ${label || "options"}`}
          />
          <ul role="listbox" className="max-h-56 overflow-auto">
            {filtered.length === 0 ? <li className="px-3 py-2 text-sm text-muted">No matches found</li> : null}
            {filtered.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={o.value === value}
                  className={cn(
                    "touch-target flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition hover:bg-soft-blue",
                    o.value === value && "bg-soft-blue font-medium text-primary",
                  )}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <span className="truncate">{o.label}</span>
                  {o.value === value ? <Check aria-hidden className="size-4 shrink-0 text-accent" /> : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {error ? <p className="mt-1.5 text-sm font-medium text-danger">{error}</p> : hint ? <p className="mt-1.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
