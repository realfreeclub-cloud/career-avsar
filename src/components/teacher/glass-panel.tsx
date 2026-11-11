"use client";
import * as React from "react";
import { cn } from "@/lib/utils/cn";

export function GlassPanel({ title, description, children, className }: { title?: string; description?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5 lg:p-6", className)}>
      {title || description ? (
        <header className="mb-4 sm:mb-5">
          {title ? <h2 className="font-serif text-lg font-semibold text-primary sm:text-xl">{title}</h2> : null}
          {description ? <p className="mt-1 text-sm text-muted leading-relaxed">{description}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function FieldHelp({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-xs text-muted sm:text-sm">{children}</p>;
}
