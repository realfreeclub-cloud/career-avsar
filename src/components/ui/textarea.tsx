"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    return (
      <div className="w-full min-w-0">
        {label ? (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-primary">
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          className={cn(
            "w-full min-w-0 rounded-lg border border-border bg-white px-3.5 py-2.5 text-base text-text shadow-[0_1px_2px_rgba(20,35,59,0.03)] placeholder:text-muted/70 transition-all duration-150 focus:border-accent focus:ring-2 focus:ring-accent/20",
            error && "border-danger focus:border-danger focus:ring-danger/20",
            className,
          )}
          {...props}
        />
        {error ? <p className="mt-1.5 text-sm font-medium text-danger">{error}</p> : hint ? <p className="mt-1.5 text-xs text-muted">{hint}</p> : null}
      </div>
    );
  },
);
TextArea.displayName = "TextArea";

export const Textarea = TextArea;
export type TextareaProps = TextAreaProps;
