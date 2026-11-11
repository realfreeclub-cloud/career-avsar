"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function StepProgress({ steps, current, className }: { steps: { title: string; short?: string }[]; current: number; className?: string }) {
  const pct = Math.round(((Math.max(1, current) - 1) / Math.max(1, steps.length - 1)) * 100);
  return (
    <div className={cn("w-full min-w-0", className)}>
      <div className="mb-2.5 flex items-center justify-between gap-2 lg:hidden">
        <p className="text-sm font-semibold text-primary">Step {current} of {steps.length}</p>
        <p className="truncate text-sm text-muted">{steps[current - 1]?.title}</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#E8E4DA] lg:hidden" aria-hidden>
        <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
      <ol className="hidden gap-2 lg:grid" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0,1fr))` }} aria-label="Registration progress">
        {steps.map((s, i) => {
          const n = i + 1;
          const state = n < current ? "done" : n === current ? "active" : "todo";
          return (
            <li key={s.title} className="min-w-0">
              <div
                className={cn(
                  "flex min-h-[56px] items-center gap-3 rounded-xl border border-border bg-white px-3.5 py-2 transition-all shadow-sm",
                  state === "active" && "border-accent ring-2 ring-accent/20 bg-[#FAF9F5]",
                  state === "done" && "border-green-200 bg-green-50/30",
                )}
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    state === "done" ? "bg-success text-white" : state === "active" ? "bg-primary text-white" : "bg-[#EAE6DD] text-muted",
                  )}
                >
                  {state === "done" ? <Check className="size-4" aria-hidden /> : n}
                </span>
                <span
                  className={cn(
                    "truncate text-xs font-medium sm:text-sm",
                    state === "active" ? "font-semibold text-primary" : state === "done" ? "text-primary" : "text-muted",
                  )}
                >
                  {s.short || s.title}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
