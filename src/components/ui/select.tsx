import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, id, options, placeholder, ...props }, ref) => {
    const reactId = React.useId();
    const selectId = id ?? reactId;
    const describedBy = error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined;
    return (
      <div className="w-full min-w-0">
        {label ? (
          <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-primary">
            {label}
          </label>
        ) : null}
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "touch-target w-full min-w-0 appearance-none rounded-lg border border-border bg-white px-3.5 py-2.5 pr-10 text-base text-text shadow-[0_1px_2px_rgba(20,35,59,0.03)] transition-all duration-150 focus:border-accent focus:ring-2 focus:ring-accent/20",
            "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%23687487%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.6rem_center] bg-no-repeat",
            error && "border-danger focus:border-danger focus:ring-danger/20",
            className,
          )}
          {...props}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        {error ? (
          <p id={`${selectId}-error`} className="mt-1.5 text-sm font-medium text-danger">
            {error}
          </p>
        ) : hint ? (
          <p id={`${selectId}-hint`} className="mt-1.5 text-xs text-muted">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
Select.displayName = "Select";
