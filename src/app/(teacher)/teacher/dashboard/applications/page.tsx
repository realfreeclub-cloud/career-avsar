"use client";

import * as React from "react";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileText,
  ChevronDown,
  ChevronUp,
  XCircle,
  ExternalLink,
  RotateCcw,
  Building2,
  MapPin,
  IndianRupee,
} from "lucide-react";
import { Button, Card, EmptyState, ErrorState, Modal, Skeleton, TextArea } from "@/components/ui";
import { apiFetch } from "@/lib/api/client";
import { StatusPill } from "@/components/teacher/dashboard/ui";
import type { DashboardApplication } from "@/types/dashboard";

const STATUS_FILTERS = [
  { key: "", label: "All Applications" },
  { key: "review", label: "Under Review" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "interview", label: "Interviews" },
  { key: "selected", label: "Selected / Offered" },
  { key: "withdrawn", label: "Withdrawn / Inactive" },
];

export default function TeacherApplicationsPage() {
  const [items, setItems] = React.useState<DashboardApplication[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState("");
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  // Withdraw modal state
  const [withdrawTarget, setWithdrawTarget] = React.useState<DashboardApplication | null>(null);
  const [withdrawReason, setWithdrawReason] = React.useState("");
  const [withdrawing, setWithdrawing] = React.useState(false);
  const [withdrawError, setWithdrawError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await apiFetch<{ items: DashboardApplication[] }>("/api/teacher/applications");
    if (!res.ok) {
      setError(res.error.message);
    } else {
      setItems(res.data.items);
      if (res.data.items.length > 0 && !expandedId) {
        setExpandedId(res.data.items[0].id);
      }
    }
    setLoading(false);
  }, [expandedId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const stats = React.useMemo(() => {
    const total = items.length;
    const underReview = items.filter((i) =>
      ["submitted", "applied", "pending", "under_review"].includes(i.status.toLowerCase()),
    ).length;
    const shortlisted = items.filter((i) =>
      ["shortlisted", "on_hold"].includes(i.status.toLowerCase()),
    ).length;
    const interviews = items.filter((i) =>
      ["interview_scheduled", "interview_completed", "interview"].includes(i.status.toLowerCase()),
    ).length;
    return { total, underReview, shortlisted, interviews };
  }, [items]);

  const filtered = React.useMemo(() => {
    if (!filter) return items;
    return items.filter((app) => {
      const s = app.status.toLowerCase();
      if (filter === "review") return ["submitted", "applied", "pending", "under_review"].includes(s);
      if (filter === "shortlisted") return s === "shortlisted" || s === "on_hold";
      if (filter === "interview") return s.includes("interview");
      if (filter === "selected") return s === "selected" || s === "offered";
      if (filter === "withdrawn") return s === "withdrawn" || s.includes("reject");
      return s === filter;
    });
  }, [items, filter]);

  const handleWithdrawConfirm = async () => {
    if (!withdrawTarget) return;
    setWithdrawing(true);
    setWithdrawError(null);
    const res = await apiFetch<{ updated: boolean }>("/api/teacher/applications", {
      method: "PATCH",
      body: JSON.stringify({
        id: withdrawTarget.id,
        action: "withdraw",
        reason: withdrawReason.trim() || "Withdrawn by candidate",
      }),
    });

    if (!res.ok) {
      setWithdrawError(res.error.message || "Failed to withdraw application.");
      setWithdrawing(false);
    } else {
      setWithdrawing(false);
      setWithdrawTarget(null);
      setWithdrawReason("");
      load();
    }
  };

  const isWithdrawAllowed = (status: string) => {
    const s = status.toLowerCase();
    return ["submitted", "applied", "pending", "under_review", "on_hold"].includes(s);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-[#FAF5EB] px-3 py-1 text-xs font-semibold text-[#8F7032]">
            Recruitment Tracker
          </span>
          <h1 className="mt-2 font-serif text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            My Applications
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-secondary">
            Monitor real-time progress of your applications, track hiring review stages, read recruiter notes, and prepare for scheduled interviews.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Button asChildLink href="/jobs" variant="primary" size="md">
            <Briefcase className="mr-2 size-4" />
            Explore More Vacancies
          </Button>
        </div>
      </header>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Total Applied</p>
          <p className="mt-1 font-serif text-2xl font-bold text-primary">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">Under Review</p>
          <p className="mt-1 font-serif text-2xl font-bold text-sky-900">{stats.underReview}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Shortlisted</p>
          <p className="mt-1 font-serif text-2xl font-bold text-emerald-900">{stats.shortlisted}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Interviews</p>
          <p className="mt-1 font-serif text-2xl font-bold text-indigo-900">{stats.interviews}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="overflow-x-auto pb-1" aria-label="Application status filters">
        <div className="flex min-w-max gap-2 border-b border-border pb-2">
          {STATUS_FILTERS.map((f) => {
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
      {loading ? <LoadingApplications /> : null}
      {error ? <ErrorState title="Unable to load applications" message={error} onRetry={load} /> : null}

      {!loading && !error && filtered.length === 0 ? (
        <EmptyState
          title="No applications found"
          description={
            items.length
              ? "None of your applications match this filter criteria."
              : "You have not submitted any job applications yet. Discover verified teaching openings across Uttar Pradesh and apply with your verified profile."
          }
          action={
            <Button asChildLink href="/jobs" variant="primary">
              Discover Vacancies
            </Button>
          }
        />
      ) : null}

      {/* Applications List */}
      {!loading && !error && filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((app) => {
            const isExpanded = expandedId === app.id;
            const canWithdraw = isWithdrawAllowed(app.status);

            return (
              <Card
                key={app.id}
                className="overflow-hidden border-border transition-all duration-200 hover:border-[#D0C9B8] hover:shadow-md"
              >
                {/* Main Card Header Bar */}
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill status={app.status} />
                        <span className="text-xs text-muted">
                          Applied {formatDate(app.appliedAt)}
                        </span>
                      </div>
                      <h2 className="font-serif text-lg font-bold text-primary sm:text-xl">
                        {app.jobTitle}
                      </h2>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-secondary sm:text-sm">
                        <span className="inline-flex items-center gap-1 font-medium text-primary">
                          <Building2 className="size-3.5 text-accent" />
                          {app.schoolName}
                        </span>
                        {app.location ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3.5 text-muted" />
                            {app.location}
                          </span>
                        ) : null}
                        {app.salary ? (
                          <span className="inline-flex items-center gap-1">
                            <IndianRupee className="size-3.5 text-muted" />
                            {app.salary}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 sm:pt-0">
                      <Button
                        asChildLink
                        href={`/jobs/${app.jobId}`}
                        variant="outline"
                        size="sm"
                        className="touch-target"
                      >
                        <ExternalLink className="mr-1.5 size-3.5" />
                        View Job
                      </Button>
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : app.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-[#FAF9F5] px-3 py-1.5 text-xs font-semibold text-secondary transition hover:bg-[#F0EBE0]"
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? (
                          <>
                            Hide Details <ChevronUp className="size-3.5" />
                          </>
                        ) : (
                          <>
                            Tracking Details <ChevronDown className="size-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Interview Alert Banner if Scheduled */}
                  {app.interviewScheduledAt && app.status.toLowerCase().includes("interview") ? (
                    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <Calendar className="mt-0.5 size-5 shrink-0 text-indigo-700" />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                            Interview Scheduled
                          </p>
                          <p className="text-sm font-medium text-indigo-950">
                            {formatDateTime(app.interviewScheduledAt)} •{" "}
                            <span className="capitalize">{app.interviewMode || "Online"} Interview</span>
                          </p>
                        </div>
                      </div>
                      <Button
                        asChildLink
                        href="/teacher/dashboard/interviews"
                        variant="primary"
                        size="sm"
                        className="bg-indigo-900 hover:bg-indigo-950 text-white"
                      >
                        Interview Details
                      </Button>
                    </div>
                  ) : null}

                  {/* Withdrawn Notice */}
                  {app.status === "withdrawn" ? (
                    <div className="mt-4 flex items-start gap-3 rounded-xl border border-border bg-[#FAF9F5] p-3 text-xs text-secondary">
                      <XCircle className="mt-0.5 size-4 shrink-0 text-rose-600" />
                      <div>
                        <span className="font-semibold text-primary">Application Withdrawn:</span>{" "}
                        {app.withdrawalReason || "You withdrew your candidature for this vacancy."}
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Expanded Details Section */}
                {isExpanded ? (
                  <div className="border-t border-border/60 bg-[#FAF9F5]/50 p-5 sm:p-6 space-y-6">
                    {/* Visual Application Stepper */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
                        Application Progression Timeline
                      </h3>
                      <div className="mt-3">
                        <ApplicationTimeline
                          status={app.status}
                          appliedAt={app.appliedAt}
                          updatedAt={app.updatedAt}
                          interviewScheduledAt={app.interviewScheduledAt}
                          statusHistory={app.statusHistory}
                        />
                      </div>
                    </div>

                    {/* Recruiter Messages / Updates */}
                    {app.candidateMessages && app.candidateMessages.length > 0 ? (
                      <div className="rounded-xl border border-accent/40 bg-[#FAF5EB]/50 p-4">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="size-4 text-[#8F7032]" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#8F7032]">
                            Messages from School Hiring Team ({app.candidateMessages.length})
                          </h4>
                        </div>
                        <div className="mt-3 space-y-2.5">
                          {app.candidateMessages.map((msg, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg border border-[#E9DCBF] bg-white p-3 text-xs shadow-xs"
                            >
                              <div className="flex items-center justify-between font-semibold text-primary">
                                <span>{msg.senderName}</span>
                                <span className="text-[10px] text-muted font-normal">
                                  {formatDateTime(msg.createdAt)}
                                </span>
                              </div>
                              <p className="mt-1 text-secondary whitespace-pre-wrap">{msg.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {/* Cover Note Snapshot */}
                    {app.coverNote ? (
                      <div className="rounded-xl border border-border bg-white p-4">
                        <div className="flex items-center gap-2">
                          <FileText className="size-4 text-muted" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                            Submitted Cover Note
                          </h4>
                        </div>
                        <p className="mt-2 text-xs italic text-secondary leading-relaxed bg-[#FAF9F5] p-3 rounded-lg border border-border/50">
                          “{app.coverNote}”
                        </p>
                      </div>
                    ) : null}

                    {/* Status History Audit Trail */}
                    {app.statusHistory && app.statusHistory.length > 0 ? (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
                          Activity Log
                        </h4>
                        <div className="divide-y divide-border/60 rounded-xl border border-border bg-white text-xs">
                          {app.statusHistory.map((hist, i) => (
                            <div key={i} className="flex items-start justify-between p-3">
                              <div>
                                <span className="font-semibold text-primary capitalize">
                                  {hist.status.replace(/_/g, " ")}
                                </span>
                                {hist.note ? (
                                  <p className="mt-0.5 text-secondary">{hist.note}</p>
                                ) : null}
                              </div>
                              <span className="text-[11px] text-muted shrink-0 ml-3">
                                {formatDateTime(hist.createdAt)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {/* Footer Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="text-xs text-muted">
                        Application Reference ID: <span className="font-mono text-primary">{app.id}</span>
                      </div>
                      {canWithdraw ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setWithdrawTarget(app);
                            setWithdrawReason("");
                            setWithdrawError(null);
                          }}
                          className="text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                        >
                          <RotateCcw className="mr-1.5 size-3.5" />
                          Withdraw Candidature
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      ) : null}

      {/* Candidate Withdrawal Modal */}
      <Modal
        open={!!withdrawTarget}
        onClose={() => !withdrawing && setWithdrawTarget(null)}
        title="Withdraw Candidature"
        description="Are you sure you wish to withdraw your application for this position?"
      >
        {withdrawTarget ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900">
              <p className="font-semibold">Important Consideration:</p>
              <p className="mt-1">
                Withdrawing is irreversible. The hiring team for{" "}
                <span className="font-bold">{withdrawTarget.jobTitle}</span> at{" "}
                <span className="font-bold">{withdrawTarget.schoolName}</span> will be notified that your profile is no longer under consideration.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="withdraw-reason" className="text-xs font-semibold uppercase tracking-wider text-muted">
                Reason for Withdrawal (Optional)
              </label>
              <TextArea
                id="withdraw-reason"
                rows={3}
                placeholder="e.g. Accepted another offer, relocation, personal circumstances..."
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value)}
                disabled={withdrawing}
              />
            </div>

            {withdrawError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                {withdrawError}
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setWithdrawTarget(null)}
                disabled={withdrawing}
              >
                Keep Application
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleWithdrawConfirm}
                disabled={withdrawing}
                className="bg-rose-700 hover:bg-rose-800 text-white"
              >
                {withdrawing ? "Processing..." : "Confirm Withdrawal"}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

// Visual Application Timeline Component
function ApplicationTimeline({
  status,
  appliedAt,
  interviewScheduledAt,
}: {
  status: string;
  appliedAt: string;
  updatedAt: string;
  interviewScheduledAt?: string;
  statusHistory?: Array<{ status: string; createdAt: string; note?: string }>;
}) {
  const s = status.toLowerCase();

  let currentStep = 1;
  if (s === "under_review") currentStep = 2;
  else if (s === "shortlisted" || s === "on_hold") currentStep = 3;
  else if (s.includes("interview")) currentStep = 4;
  else if (s === "selected" || s === "offered" || s === "rejected") currentStep = 5;

  const isTerminalNegative = s === "rejected" || s === "withdrawn";

  const steps = [
    {
      num: 1,
      title: "Submitted",
      desc: "Profile snapshot recorded",
      date: formatDate(appliedAt),
    },
    {
      num: 2,
      title: "Under Review",
      desc: "Hiring desk qualification check",
      date: currentStep >= 2 ? "In Progress" : undefined,
    },
    {
      num: 3,
      title: s === "on_hold" ? "On Hold" : "Shortlisted",
      desc: s === "on_hold" ? "Held for future batch" : "Profile approved for next round",
      date: currentStep >= 3 ? "Evaluated" : undefined,
    },
    {
      num: 4,
      title: "Interview",
      desc: interviewScheduledAt ? "Scheduled" : "Demonstration / Panel round",
      date: interviewScheduledAt ? formatDate(interviewScheduledAt) : undefined,
    },
    {
      num: 5,
      title: s === "selected" || s === "offered" ? "Selected" : s === "rejected" ? "Not Selected" : "Final Outcome",
      desc: s === "selected" || s === "offered" ? "Offer extended" : "Final institutional decision",
      date: currentStep === 5 ? "Completed" : undefined,
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-white p-4">
      {/* Mobile Vertical Stepper */}
      <div className="space-y-4 md:hidden">
        {steps.map((st, idx) => {
          const isDone = currentStep > st.num;
          const isCurrent = currentStep === st.num;

          return (
            <div key={st.num} className="relative flex items-start gap-3">
              {idx < steps.length - 1 ? (
                <div
                  className={`absolute left-3.5 top-7 bottom-0 w-0.5 -ml-px ${
                    isDone ? "bg-emerald-500" : "bg-border"
                  }`}
                />
              ) : null}

              <div className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                {isDone ? (
                  <span className="flex size-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="size-4" />
                  </span>
                ) : isCurrent ? (
                  <span
                    className={`flex size-7 items-center justify-center rounded-full border ${
                      isTerminalNegative
                        ? "bg-rose-100 text-rose-800 border-rose-300"
                        : "bg-[#FAF5EB] text-[#8F7032] border-[#E9DCBF] ring-2 ring-accent/30"
                    }`}
                  >
                    <Clock className="size-3.5" />
                  </span>
                ) : (
                  <span className="flex size-7 items-center justify-center rounded-full border border-border bg-[#FAF9F5] text-muted">
                    {st.num}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`font-semibold ${
                      isCurrent
                        ? isTerminalNegative
                          ? "text-rose-700 font-bold"
                          : "text-primary font-bold"
                        : isDone
                          ? "text-emerald-800 font-medium"
                          : "text-muted"
                    }`}
                  >
                    {st.title}
                  </span>
                  {st.date ? <span className="text-[10px] text-muted">{st.date}</span> : null}
                </div>
                <p className="text-[11px] text-secondary">{st.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Horizontal Stepper */}
      <div className="hidden md:grid md:grid-cols-5 md:gap-2">
        {steps.map((st, idx) => {
          const isDone = currentStep > st.num;
          const isCurrent = currentStep === st.num;

          return (
            <div key={st.num} className="relative flex flex-col items-center text-center">
              {idx < steps.length - 1 ? (
                <div
                  className={`absolute left-1/2 right-[-50%] top-3.5 h-0.5 -z-0 ${
                    isDone ? "bg-emerald-500" : "bg-border"
                  }`}
                />
              ) : null}

              <div className="relative z-10 flex size-7 items-center justify-center rounded-full text-xs font-semibold">
                {isDone ? (
                  <span className="flex size-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="size-4" />
                  </span>
                ) : isCurrent ? (
                  <span
                    className={`flex size-7 items-center justify-center rounded-full border ${
                      isTerminalNegative
                        ? "bg-rose-100 text-rose-800 border-rose-300"
                        : "bg-[#FAF5EB] text-[#8F7032] border-[#E9DCBF] ring-2 ring-accent/30"
                    }`}
                  >
                    <Clock className="size-3.5" />
                  </span>
                ) : (
                  <span className="flex size-7 items-center justify-center rounded-full border border-border bg-[#FAF9F5] text-muted">
                    {st.num}
                  </span>
                )}
              </div>

              <div className="mt-2 min-w-0">
                <p
                  className={`text-xs font-semibold ${
                    isCurrent
                      ? isTerminalNegative
                        ? "text-rose-700"
                        : "text-primary font-bold"
                      : isDone
                        ? "text-emerald-800"
                        : "text-muted"
                  }`}
                >
                  {st.title}
                </p>
                <p className="text-[10px] text-secondary line-clamp-1">{st.desc}</p>
                {st.date ? <p className="text-[10px] text-muted mt-0.5">{st.date}</p> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
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

function LoadingApplications() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-5">
          <div className="space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-lg" />
            </div>
            <Skeleton className="h-6 w-1/2 rounded" />
            <Skeleton className="h-4 w-1/3 rounded" />
          </div>
        </Card>
      ))}
    </div>
  );
}
