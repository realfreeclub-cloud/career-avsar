"use client";

import * as React from "react";
import {
  CalendarDays,
  MapPin,
  Video,
  Phone,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Briefcase,
  Building2,
  FileText,
  UserCheck,
} from "lucide-react";
import { Button, Card, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { apiFetch } from "@/lib/api/client";
import { StatusPill } from "@/components/teacher/dashboard/ui";
import type { DashboardInterview } from "@/types/dashboard";

const FILTERS = [
  { key: "", label: "All Rounds" },
  { key: "upcoming", label: "Upcoming" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "past", label: "Past / Cancelled" },
];

export default function TeacherInterviewsPage() {
  const [items, setItems] = React.useState<DashboardInterview[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState("");
  const [confirmingId, setConfirmingId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await apiFetch<{ items: DashboardInterview[] }>("/api/teacher/interviews");
    if (!res.ok) {
      setError(res.error.message);
    } else {
      setItems(res.data.items);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const stats = React.useMemo(() => {
    const now = new Date().getTime();
    const upcoming = items.filter(
      (i) => new Date(i.scheduledAt).getTime() >= now && i.status !== "cancelled",
    ).length;
    const confirmed = items.filter((i) => i.status === "confirmed").length;
    const completed = items.filter((i) => i.status === "completed").length;
    return { upcoming, confirmed, completed, total: items.length };
  }, [items]);

  const filtered = React.useMemo(() => {
    const now = new Date().getTime();
    if (!filter) return items;
    return items.filter((iv) => {
      const isPast = new Date(iv.scheduledAt).getTime() < now || iv.status === "completed" || iv.status === "cancelled";
      if (filter === "upcoming") return !isPast && (iv.status === "scheduled" || iv.status === "rescheduled" || iv.status === "confirmed");
      if (filter === "confirmed") return iv.status === "confirmed";
      if (filter === "completed") return iv.status === "completed";
      if (filter === "past") return isPast;
      return true;
    });
  }, [items, filter]);

  const handleConfirmAttendance = async (id: string) => {
    setConfirmingId(id);
    const res = await apiFetch("/api/teacher/interviews", {
      method: "PATCH",
      body: JSON.stringify({ id, action: "confirm" }),
    });
    setConfirmingId(null);
    if (res.ok) {
      load();
    }
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <header className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/70 px-3 py-1 text-xs font-semibold text-indigo-900">
            Evaluation & Demonstration Desk
          </span>
          <h1 className="mt-2 font-serif text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            My Interviews
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-secondary">
            View scheduled rounds, confirm attendance for panel discussions, access meeting links or campus directions, and review preparation guidelines.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Button asChildLink href="/teacher/dashboard/applications" variant="secondary" size="md">
            <Briefcase className="mr-2 size-4" />
            Track Applications
          </Button>
        </div>
      </header>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Total Scheduled</p>
          <p className="mt-1 font-serif text-2xl font-bold text-primary">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Upcoming Rounds</p>
          <p className="mt-1 font-serif text-2xl font-bold text-indigo-900">{stats.upcoming}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Confirmed</p>
          <p className="mt-1 font-serif text-2xl font-bold text-emerald-900">{stats.confirmed}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">Completed</p>
          <p className="mt-1 font-serif text-2xl font-bold text-teal-900">{stats.completed}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="overflow-x-auto pb-1" aria-label="Interview filters">
        <div className="flex min-w-max gap-2 border-b border-border pb-2">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`touch-target rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "border-accent bg-[#FAF5EB] text-[#8F7032] shadow-sm"
                    : "border-border bg-white text-secondary hover:bg-[#FAF9F5]"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading & Error States */}
      {loading ? <LoadingInterviews /> : null}
      {error ? <ErrorState title="Unable to load interviews" message={error} onRetry={load} /> : null}

      {!loading && !error && filtered.length === 0 ? (
        <EmptyState
          title="No interview rounds found"
          description={
            items.length
              ? "No interviews match your filter selection."
              : "When a school shortlisted your application and schedules an interview or demonstration class, details will appear here."
          }
          action={
            <Button asChildLink href="/teacher/dashboard/applications" variant="primary">
              View My Applications
            </Button>
          }
        />
      ) : null}

      {/* Interviews Grid */}
      {!loading && !error && filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((iv) => {
            const isConfirmed = iv.status === "confirmed";
            const isRescheduled = iv.status === "rescheduled";
            const isCancelled = iv.status === "cancelled";
            const canConfirm = (iv.status === "scheduled" || iv.status === "rescheduled") && !isCancelled;

            return (
              <Card
                key={iv.id}
                className="overflow-hidden border-border transition-all duration-200 hover:border-[#D0C9B8] hover:shadow-md flex flex-col justify-between"
              >
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill status={iv.status} />
                        {iv.result && iv.result !== "pending" ? (
                          <span className="rounded-md border border-accent/40 bg-[#FAF5EB] px-2 py-0.5 text-[11px] font-bold capitalize text-[#8F7032]">
                            Outcome: {iv.result.replace(/_/g, " ")}
                          </span>
                        ) : null}
                      </div>
                      <h2 className="font-serif text-lg font-bold text-primary sm:text-xl">
                        {iv.jobTitle}
                      </h2>
                      <p className="flex items-center gap-1.5 text-xs text-secondary font-medium">
                        <Building2 className="size-3.5 text-accent" />
                        {iv.schoolName}
                      </p>
                    </div>
                  </div>

                  {/* Rescheduled Notice */}
                  {isRescheduled ? (
                    <div className="flex items-start gap-2.5 rounded-lg border border-orange-200 bg-orange-50/70 p-3 text-xs text-orange-950">
                      <AlertCircle className="size-4 shrink-0 text-orange-700 mt-0.5" />
                      <div>
                        <span className="font-bold">Schedule Updated:</span> The institution adjusted this interview timing. Please note the new date and time below.
                      </div>
                    </div>
                  ) : null}

                  {/* Cancelled Notice */}
                  {isCancelled ? (
                    <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50/70 p-3 text-xs text-rose-950">
                      <AlertCircle className="size-4 shrink-0 text-rose-700 mt-0.5" />
                      <div>
                        <span className="font-bold">Round Cancelled:</span> {iv.cancellationReason || "Cancelled by school administration."}
                      </div>
                    </div>
                  ) : null}

                  {/* Schedule & Mode Information Box */}
                  <div className="divide-y divide-border/60 rounded-xl border border-border bg-[#FAF9F5] text-xs">
                    <div className="flex items-center justify-between p-3">
                      <span className="text-muted flex items-center gap-1.5 font-medium">
                        <CalendarDays className="size-3.5 text-accent" /> Date & Time
                      </span>
                      <span className="font-semibold text-primary">
                        {formatDateTime(iv.scheduledAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3">
                      <span className="text-muted flex items-center gap-1.5 font-medium">
                        {iv.mode === "online" ? (
                          <Video className="size-3.5 text-indigo-700" />
                        ) : iv.mode === "phone" ? (
                          <Phone className="size-3.5 text-emerald-700" />
                        ) : (
                          <MapPin className="size-3.5 text-amber-700" />
                        )}
                        Delivery Format
                      </span>
                      <span className="font-semibold text-primary capitalize">
                        {iv.mode.replace(/_/g, " ")} Round
                      </span>
                    </div>

                    {iv.locationOrLink ? (
                      <div className="p-3">
                        <span className="text-muted block mb-1 font-medium">
                          {iv.mode === "online" ? "Virtual Meeting Room" : "Venue Address / Room"}
                        </span>
                        {iv.mode === "online" && iv.locationOrLink.startsWith("http") ? (
                          <a
                            href={iv.locationOrLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-indigo-900 hover:underline break-all"
                          >
                            <ExternalLink className="size-3 shrink-0" />
                            {iv.locationOrLink}
                          </a>
                        ) : (
                          <span className="font-medium text-primary break-all">
                            {iv.locationOrLink}
                          </span>
                        )}
                      </div>
                    ) : null}
                  </div>

                  {/* Instructions Box */}
                  {iv.instructions ? (
                    <div className="rounded-xl border border-border bg-white p-3.5 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
                        <FileText className="size-3.5 text-accent" />
                        Preparation Instructions & Topics
                      </div>
                      <p className="text-xs text-secondary leading-relaxed bg-[#FAF9F5] p-2.5 rounded-lg border border-border/50">
                        {iv.instructions}
                      </p>
                    </div>
                  ) : null}

                  {/* Attendance Confirmation Badge if already confirmed */}
                  {isConfirmed ? (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-900 font-medium">
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                      <span>
                        Attendance Confirmed
                        {iv.candidateConfirmedAt
                          ? ` on ${formatDateTime(iv.candidateConfirmedAt)}`
                          : " by candidate"}
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Footer Action Card */}
                <div className="border-t border-border/60 bg-[#FAF9F5]/60 p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-muted">
                    Reference ID: <span className="font-mono text-primary">{iv.id.slice(-8)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {canConfirm ? (
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => handleConfirmAttendance(iv.id)}
                        disabled={confirmingId === iv.id}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs"
                      >
                        <UserCheck className="mr-1.5 size-3.5" />
                        {confirmingId === iv.id ? "Confirming..." : "Confirm Attendance"}
                      </Button>
                    ) : null}

                    {iv.mode === "online" && iv.locationOrLink && iv.locationOrLink.startsWith("http") && !isCancelled ? (
                      <Button
                        asChildLink
                        href={iv.locationOrLink}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        <ExternalLink className="mr-1.5 size-3.5" />
                        Join Room
                      </Button>
                    ) : null}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function formatDateTime(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function LoadingInterviews() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="p-5 space-y-3">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-6 w-3/4 rounded" />
          <Skeleton className="h-4 w-1/2 rounded" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </Card>
      ))}
    </div>
  );
}
