"use client";
import * as React from "react";
import { cn } from "@/lib/utils/cn";

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement> & { "aria-hidden"?: boolean | "true" | "false" }>;

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon: IconComponent;
  hint?: string;
  tone?: "default" | "accent" | "success" | "warning";
  className?: string;
}) {
  const iconColor =
    tone === "accent"
      ? "bg-[#FAF5EB] text-[#8F7032] border-[#E9DCBF]"
      : tone === "success"
        ? "bg-green-50 text-success border-green-200"
        : tone === "warning"
          ? "bg-amber-50 text-amber-800 border-amber-200"
          : "bg-soft-blue text-secondary border-[#D5DFEB]";

  return (
    <article className={cn("relative overflow-hidden rounded-xl border border-border bg-white p-5 shadow-sm transition-all duration-200 hover:border-[#D0C9B8] sm:p-6", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
          <p className="mt-2 font-serif text-3xl font-bold tracking-tight text-primary sm:text-4xl">{value}</p>
          {hint ? <p className="mt-1 text-xs text-muted sm:text-sm">{hint}</p> : null}
        </div>
        <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl border", iconColor)}>
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
    </article>
  );
}

export function StatusPill({ status }: { status: string }) {
  const s = status.toLowerCase();
  let cls = "bg-soft-blue text-secondary border-[#D5DFEB]";

  if (
    s === "selected" ||
    s === "offered" ||
    s === "offer_accepted" ||
    s === "confirmed" ||
    s === "published" ||
    s === "active" ||
    s.includes("shortlist") ||
    s === "verified" ||
    s === "completed" ||
    s === "joined"
  ) {
    cls = "bg-emerald-50 text-emerald-800 border-emerald-200";
  } else if (s === "under_review") {
    cls = "bg-sky-50 text-sky-800 border-sky-200";
  } else if (s === "interview_scheduled" || s === "scheduled" || s === "interview") {
    cls = "bg-indigo-50 text-indigo-800 border-indigo-200";
  } else if (s === "interview_completed") {
    cls = "bg-teal-50 text-teal-800 border-teal-200";
  } else if (s === "draft") {
    cls = "bg-[#FAF9F5] text-slate-700 border-slate-300";
  } else if (s === "rescheduled") {
    cls = "bg-orange-50 text-orange-800 border-orange-200";
  } else if (s === "on_hold" || s === "paused" || s.includes("pend") || s === "applied" || s === "submitted" || s === "deferred") {
    cls = "bg-amber-50 text-amber-800 border-amber-200";
  } else if (s === "withdrawn") {
    cls = "bg-slate-100 text-slate-700 border-slate-300";
  } else if (s === "no_show" || s === "no show") {
    cls = "bg-purple-50 text-purple-800 border-purple-200";
  } else if (s === "expired" || s.includes("reject") || s.includes("cancel") || s === "declined" || s === "backed_out") {
    cls = "bg-rose-50 text-rose-700 border-rose-200";
  } else if (s === "closed" || s === "archived") {
    cls = "bg-slate-100 text-slate-700 border-slate-300";
  }

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize", cls)}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
