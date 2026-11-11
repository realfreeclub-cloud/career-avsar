"use client";

import * as React from "react";
import {
  AdminPage,
  Button,
  Card,
  Input,
  Pager,
  StatusPill,
  EmptyState,
  ErrorState,
  Skeleton,
} from "@/components/admin/ui";
import { Modal, TextArea } from "@/components/ui";
import { apiFetch } from "@/lib/api/client";
import type { Paged } from "@/types/admin";
import type { AdminInterview } from "@/server/services/admin/interviews";
import {
  Calendar as CalendarIcon,
  CalendarDays,
  List,
  Plus,
  Search,
  Video,
  MapPin,
  CheckCircle2,
  ExternalLink,
  Star,
  Award,
  Send,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  RotateCcw,
  FileText,
  X,
  XCircle,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "scheduled", label: "Scheduled" },
  { value: "confirmed", label: "Confirmed" },
  { value: "rescheduled", label: "Rescheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No Show" },
];

const MODE_OPTIONS = [
  { value: "", label: "All Modes" },
  { value: "online", label: "Online Video" },
  { value: "in_person", label: "In-Person Campus" },
  { value: "phone", label: "Telephonic" },
  { value: "hybrid", label: "Hybrid" },
];

const RESULT_OPTIONS = [
  { value: "", label: "All Outcomes" },
  { value: "pending", label: "Pending Decision" },
  { value: "selected", label: "Selected" },
  { value: "rejected", label: "Not Selected" },
  { value: "on_hold", label: "On Hold" },
  { value: "reschedule_needed", label: "Reschedule Needed" },
];

export default function AdminInterviewsPage() {
  const [viewMode, setViewMode] = React.useState<"calendar" | "list">("calendar");

  // Filters
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [mode, setMode] = React.useState("");
  const [result, setResult] = React.useState("");
  const [dateRange, setDateRange] = React.useState("");
  const [page, setPage] = React.useState(1);

  // Calendar month state
  const [currentDate, setCurrentDate] = React.useState(new Date());

  // Data state
  const [data, setData] = React.useState<Paged<AdminInterview> | null>(null);
  const [calendarItems, setCalendarItems] = React.useState<AdminInterview[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Active side panel
  const [activeInterview, setActiveInterview] = React.useState<AdminInterview | null>(null);

  // Modals state
  const [scheduleModalOpen, setScheduleModalOpen] = React.useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = React.useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = React.useState(false);
  const [cancelModalOpen, setCancelModalOpen] = React.useState(false);

  // Schedule form state
  const [schedCandidateId, setSchedCandidateId] = React.useState("");
  const [schedCandidateName, setSchedCandidateName] = React.useState("");
  const [schedCandidateEmail, setSchedCandidateEmail] = React.useState("");
  const [schedCandidateMobile, setSchedCandidateMobile] = React.useState("");
  const [schedJobTitle, setSchedJobTitle] = React.useState("");
  const [schedSchoolName, setSchedSchoolName] = React.useState("");
  const [schedDateTime, setSchedDateTime] = React.useState("");
  const [schedMode, setSchedMode] = React.useState<"online" | "in_person" | "phone" | "hybrid">("online");
  const [schedLinkOrVenue, setSchedLinkOrVenue] = React.useState("");
  const [schedInstructions, setSchedInstructions] = React.useState("");
  const [schedNotes, setSchedNotes] = React.useState("");
  const [submittingSchedule, setSubmittingSchedule] = React.useState(false);

  // Feedback form state
  const [fbRating, setFbRating] = React.useState(4);
  const [fbRecommendation, setFbRecommendation] = React.useState<"hire" | "strong_hire" | "consider" | "reject" | "re_evaluate">("hire");
  const [fbStrengths, setFbStrengths] = React.useState("");
  const [fbImprovements, setFbImprovements] = React.useState("");
  const [fbNotes, setFbNotes] = React.useState("");
  const [fbInterviewer, setFbInterviewer] = React.useState("Academic Panel Reviewer");
  const [fbResult, setFbResult] = React.useState<"pending" | "selected" | "rejected" | "on_hold" | "reschedule_needed">("selected");
  const [fbAutoPlacement, setFbAutoPlacement] = React.useState(true);
  const [fbJoiningDate, setFbJoiningDate] = React.useState("");
  const [fbSalaryOffered, setFbSalaryOffered] = React.useState("");
  const [submittingFeedback, setSubmittingFeedback] = React.useState(false);

  // Reschedule form state
  const [reschedDateTime, setReschedDateTime] = React.useState("");
  const [reschedMode, setReschedMode] = React.useState<"online" | "in_person" | "phone" | "hybrid">("online");
  const [reschedLink, setReschedLink] = React.useState("");
  const [reschedReason, setReschedReason] = React.useState("");
  const [submittingReschedule, setSubmittingReschedule] = React.useState(false);

  // Cancel form state
  const [cancelReason, setCancelReason] = React.useState("");
  const [submittingCancel, setSubmittingCancel] = React.useState(false);

  // Load List View Data
  const loadList = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const sp = new URLSearchParams();
    sp.set("page", String(page));
    sp.set("limit", "15");
    if (q.trim()) sp.set("q", q.trim());
    if (status) sp.set("status", status);
    if (mode) sp.set("mode", mode);
    if (result) sp.set("result", result);
    if (dateRange) sp.set("dateRange", dateRange);

    const res = await apiFetch<Paged<AdminInterview>>(`/api/admin/interviews?${sp.toString()}`);
    if (!res.ok) {
      setError(res.error.message);
    } else {
      setData(res.data);
      if (activeInterview) {
        const found = res.data.items.find((i) => i.id === activeInterview.id);
        if (found) setActiveInterview(found);
      }
    }
    setLoading(false);
  }, [page, q, status, mode, result, dateRange, activeInterview]);

  // Load Calendar View Data
  const loadCalendar = React.useCallback(async () => {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    const res = await apiFetch<Paged<AdminInterview>>(
      `/api/admin/interviews?month=${month}&year=${year}&limit=200`,
    );
    if (res.ok) {
      setCalendarItems(res.data.items);
      if (activeInterview) {
        const found = res.data.items.find((i) => i.id === activeInterview.id);
        if (found) setActiveInterview(found);
      }
    }
  }, [currentDate, activeInterview]);

  React.useEffect(() => {
    if (viewMode === "list") {
      loadList();
    } else {
      loadCalendar();
    }
  }, [viewMode, loadList, loadCalendar]);

  // Calendar date navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Schedule Interview Submission
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedCandidateId.trim() || !schedJobTitle.trim() || !schedDateTime) return;
    setSubmittingSchedule(true);
    const res = await apiFetch("/api/admin/interviews", {
      method: "POST",
      body: JSON.stringify({
        teacherUserId: schedCandidateId.trim(),
        candidateName: schedCandidateName.trim() || undefined,
        candidateEmail: schedCandidateEmail.trim() || undefined,
        candidateMobile: schedCandidateMobile.trim() || undefined,
        jobTitle: schedJobTitle.trim(),
        schoolName: schedSchoolName.trim() || "Partner Institution",
        scheduledAt: new Date(schedDateTime).toISOString(),
        mode: schedMode,
        locationOrLink: schedLinkOrVenue.trim() || undefined,
        instructions: schedInstructions.trim() || undefined,
        notes: schedNotes.trim() || undefined,
      }),
    });
    setSubmittingSchedule(false);
    if (res.ok) {
      setScheduleModalOpen(false);
      resetScheduleForm();
      loadList();
      loadCalendar();
    }
  };

  const resetScheduleForm = () => {
    setSchedCandidateId("");
    setSchedCandidateName("");
    setSchedCandidateEmail("");
    setSchedCandidateMobile("");
    setSchedJobTitle("");
    setSchedSchoolName("");
    setSchedDateTime("");
    setSchedLinkOrVenue("");
    setSchedInstructions("");
    setSchedNotes("");
  };

  // Feedback & Selection Submission
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInterview) return;
    setSubmittingFeedback(true);
    const res = await apiFetch(`/api/admin/interviews/${activeInterview.id}/feedback`, {
      method: "POST",
      body: JSON.stringify({
        rating: fbRating,
        recommendation: fbRecommendation,
        strengths: fbStrengths,
        improvements: fbImprovements,
        notes: fbNotes,
        interviewerName: fbInterviewer,
        result: fbResult,
        autoCreatePlacement: fbAutoPlacement && fbResult === "selected",
        joiningDate: fbJoiningDate || undefined,
        salaryOfferedInr: fbSalaryOffered ? Number(fbSalaryOffered) : undefined,
      }),
    });
    setSubmittingFeedback(false);
    if (res.ok) {
      setFeedbackModalOpen(false);
      // Refresh active interview
      const fresh = await apiFetch<AdminInterview>(`/api/admin/interviews/${activeInterview.id}`);
      if (fresh.ok) setActiveInterview(fresh.data);
      loadList();
      loadCalendar();
    }
  };

  // Reschedule Submission
  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInterview || !reschedDateTime) return;
    setSubmittingReschedule(true);
    const res = await apiFetch(`/api/admin/interviews/${activeInterview.id}/reschedule`, {
      method: "POST",
      body: JSON.stringify({
        scheduledAt: new Date(reschedDateTime).toISOString(),
        mode: reschedMode,
        locationOrLink: reschedLink.trim() || undefined,
        reason: reschedReason.trim() || "Operational rescheduling",
      }),
    });
    setSubmittingReschedule(false);
    if (res.ok) {
      setRescheduleModalOpen(false);
      const fresh = await apiFetch<AdminInterview>(`/api/admin/interviews/${activeInterview.id}`);
      if (fresh.ok) setActiveInterview(fresh.data);
      loadList();
      loadCalendar();
    }
  };

  // Cancel Submission
  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInterview) return;
    setSubmittingCancel(true);
    const res = await apiFetch(`/api/admin/interviews/${activeInterview.id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason: cancelReason.trim() || "Cancelled by administration" }),
    });
    setSubmittingCancel(false);
    if (res.ok) {
      setCancelModalOpen(false);
      const fresh = await apiFetch<AdminInterview>(`/api/admin/interviews/${activeInterview.id}`);
      if (fresh.ok) setActiveInterview(fresh.data);
      loadList();
      loadCalendar();
    }
  };

  // Resend invitation
  const handleResendInvitation = async () => {
    if (!activeInterview) return;
    await apiFetch(`/api/admin/interviews/${activeInterview.id}/invite`, { method: "POST" });
    alert("Invitation notification resent to candidate.");
  };

  // Calendar grid calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString("en-IN", { month: "long", year: "numeric" });

  const getDayInterviews = (dayNumber: number) => {
    return calendarItems.filter((iv) => {
      const d = new Date(iv.scheduledAt);
      return d.getDate() === dayNumber && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  return (
    <AdminPage
      title="Interview Coordination & Panel Scheduling"
      subtitle="Coordinate evaluation rounds, schedule video or campus demonstrations, review attendance, and record selection outcomes."
      actions={
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl border border-border bg-[#FAF9F5] p-1">
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "calendar"
                  ? "bg-white text-primary shadow-xs border border-border/80"
                  : "text-secondary hover:text-primary"
              }`}
            >
              <CalendarIcon className="size-3.5" />
              Calendar
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "list"
                  ? "bg-white text-primary shadow-xs border border-border/80"
                  : "text-secondary hover:text-primary"
              }`}
            >
              <List className="size-3.5" />
              List
            </button>
          </div>

          <Button
            size="md"
            variant="primary"
            onClick={() => {
              resetScheduleForm();
              setScheduleModalOpen(true);
            }}
          >
            <Plus className="mr-1.5 size-4" />
            Schedule Round
          </Button>
        </div>
      }
    >
      {/* View Mode: CALENDAR VIEW */}
      {viewMode === "calendar" ? (
        <div className="space-y-4">
          {/* Calendar Month Navigation Header */}
          <Card className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary">
                {monthName}
              </h2>
              <span className="rounded-full border border-accent/40 bg-[#FAF5EB] px-2.5 py-0.5 text-xs font-bold text-[#8F7032]">
                {calendarItems.length} Round{calendarItems.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={goToToday}>
                Today
              </Button>
              <div className="flex items-center rounded-lg border border-border bg-white">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-1.5 text-secondary hover:text-primary transition"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="w-px h-4 bg-border" />
                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-1.5 text-secondary hover:text-primary transition"
                  aria-label="Next month"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </Card>

          {/* Desktop & Tablet Monthly Grid */}
          <div className="hidden sm:block overflow-hidden rounded-xl border border-border bg-white shadow-sm">
            {/* Day of Week Labels */}
            <div className="grid grid-cols-7 border-b border-border bg-soft-blue/70 text-center text-xs font-semibold uppercase tracking-wider text-primary py-2.5">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 divide-x divide-y divide-border/60">
              {/* Empty leading padding cells */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[110px] bg-[#FAF9F5]/40 p-2" />
              ))}

              {/* Month Day Cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dayInterviews = getDayInterviews(dayNum);
                const isToday =
                  dayNum === new Date().getDate() &&
                  month === new Date().getMonth() &&
                  year === new Date().getFullYear();

                return (
                  <div
                    key={`day-${dayNum}`}
                    className={`min-h-[110px] p-2 transition-colors hover:bg-[#FAF9F5]/80 flex flex-col justify-between ${
                      isToday ? "bg-[#FAF5EB]/40 ring-1 ring-inset ring-accent/40" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`size-6 flex items-center justify-center rounded-full text-xs font-bold ${
                          isToday
                            ? "bg-[#14233B] text-white"
                            : "text-primary"
                        }`}
                      >
                        {dayNum}
                      </span>
                      {dayInterviews.length > 0 ? (
                        <span className="text-[10px] font-semibold text-muted">
                          {dayInterviews.length}
                        </span>
                      ) : null}
                    </div>

                    {/* Interview event badges */}
                    <div className="mt-1 space-y-1 flex-1">
                      {dayInterviews.slice(0, 3).map((iv) => {
                        const isConfirmed = iv.status === "confirmed";
                        const isCompleted = iv.status === "completed";
                        const isCancelled = iv.status === "cancelled";

                        return (
                          <button
                            key={iv.id}
                            type="button"
                            onClick={() => setActiveInterview(iv)}
                            className={`w-full text-left rounded-md px-1.5 py-0.5 text-[11px] leading-tight transition truncate flex items-center gap-1 border ${
                              isCancelled
                                ? "bg-rose-50 text-rose-800 border-rose-200"
                                : isCompleted
                                  ? "bg-teal-50 text-teal-800 border-teal-200"
                                  : isConfirmed
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold"
                                    : "bg-indigo-50 text-indigo-900 border-indigo-200"
                            }`}
                          >
                            <span className="shrink-0 text-[10px]">
                              {formatTimeOnly(iv.scheduledAt)}
                            </span>
                            <span className="truncate">{iv.candidateName}</span>
                          </button>
                        );
                      })}
                      {dayInterviews.length > 3 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setDateRange("today");
                            setViewMode("list");
                          }}
                          className="text-[10px] text-accent font-semibold hover:underline block"
                        >
                          +{dayInterviews.length - 3} more
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Agenda / List Mode */}
          <div className="sm:hidden space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted px-1">
              Monthly Agenda Feed ({monthName})
            </p>
            {calendarItems.length === 0 ? (
              <Card className="p-6 text-center text-sm text-muted">
                No interviews scheduled in {monthName}.
              </Card>
            ) : (
              calendarItems.map((iv) => (
                <Card
                  key={iv.id}
                  className="p-4 space-y-2 border-border cursor-pointer hover:border-accent"
                  onClick={() => setActiveInterview(iv)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-accent">
                        {formatDateTime(iv.scheduledAt)}
                      </span>
                      <h3 className="font-serif font-bold text-primary">{iv.candidateName}</h3>
                      <p className="text-xs text-secondary">{iv.jobTitle}</p>
                    </div>
                    <StatusPill status={iv.status} />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted pt-1 border-t border-border/50">
                    <span className="capitalize">{iv.mode} round</span> •
                    <span>{iv.schoolName}</span>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      ) : (
        /* View Mode: ADVANCED LIST VIEW */
        <div className="space-y-4">
          {/* Filters Bar */}
          <Card className="p-4 sm:p-5">
            <div className="grid gap-3 sm:grid-cols-12 sm:items-end">
              <div className="sm:col-span-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted mb-1 block">
                  Search Candidate or Institution
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 size-4 text-muted" />
                  <Input
                    value={q}
                    onChange={(e) => {
                      setQ(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Candidate, school, position..."
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted mb-1 block">
                  Interview Status
                </label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                  className="touch-target w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-primary shadow-sm focus:border-accent"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted mb-1 block">
                  Delivery Mode
                </label>
                <select
                  value={mode}
                  onChange={(e) => {
                    setMode(e.target.value);
                    setPage(1);
                  }}
                  className="touch-target w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-primary shadow-sm focus:border-accent"
                >
                  {MODE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted mb-1 block">
                  Evaluation Outcome
                </label>
                <select
                  value={result}
                  onChange={(e) => {
                    setResult(e.target.value);
                    setPage(1);
                  }}
                  className="touch-target w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-primary shadow-sm focus:border-accent"
                >
                  {RESULT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setQ("");
                    setStatus("");
                    setMode("");
                    setResult("");
                    setDateRange("");
                    setPage(1);
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </Card>

          {/* Loading / Error States */}
          {loading ? (
            <Card className="p-5 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </Card>
          ) : null}

          {error ? <ErrorState title="Unable to load interviews" message={error} onRetry={loadList} /> : null}

          {!loading && !error && (!data || data.items.length === 0) ? (
            <EmptyState
              title="No interviews match filters"
              description="Adjust your search query or schedule a new interview round."
            />
          ) : null}

          {/* Desktop Table View */}
          {!loading && !error && data && data.items.length > 0 ? (
            <div className="space-y-4">
              <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-white shadow-sm">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-border bg-soft-blue/70 text-xs font-semibold uppercase tracking-wider text-primary">
                    <tr>
                      <th className="px-4 py-3.5">Candidate Educator</th>
                      <th className="px-4 py-3.5">Target Vacancy & School</th>
                      <th className="px-4 py-3.5">Date & Format</th>
                      <th className="px-4 py-3.5">Status & Attendance</th>
                      <th className="px-4 py-3.5">Evaluation Outcome</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {data.items.map((iv) => (
                      <tr
                        key={iv.id}
                        className="transition-colors hover:bg-[#FAF9F5]"
                      >
                        <td className="px-4 py-3.5">
                          <div className="font-serif font-bold text-primary">
                            {iv.candidateName}
                          </div>
                          <div className="text-xs text-muted">
                            {iv.candidateEmail || "—"} • {iv.candidateMobile || "—"}
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-medium text-primary text-xs">{iv.jobTitle}</div>
                          <div className="text-xs text-muted">{iv.schoolName}</div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="text-xs font-bold text-primary">
                            {formatDateTime(iv.scheduledAt)}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-secondary capitalize mt-0.5">
                            {iv.mode === "online" ? (
                              <Video className="size-3 text-indigo-700" />
                            ) : (
                              <MapPin className="size-3 text-amber-700" />
                            )}
                            {iv.mode.replace(/_/g, " ")}
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <StatusPill status={iv.status} />
                          {iv.candidateConfirmedAt ? (
                            <div className="flex items-center gap-1 text-[10px] text-emerald-800 font-semibold mt-1">
                              <CheckCircle2 className="size-3" />
                              Confirmed
                            </div>
                          ) : null}
                        </td>

                        <td className="px-4 py-3.5">
                          {iv.result && iv.result !== "pending" ? (
                            <span className="rounded-md border border-accent/40 bg-[#FAF5EB] px-2 py-0.5 text-xs font-bold capitalize text-[#8F7032]">
                              {iv.result.replace(/_/g, " ")}
                            </span>
                          ) : (
                            <span className="text-xs text-muted italic">Pending Review</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setActiveInterview(iv)}
                              className="text-xs"
                            >
                              Review Round
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="space-y-3 md:hidden">
                {data.items.map((iv) => (
                  <Card
                    key={iv.id}
                    className="p-4 space-y-3 border-border"
                    onClick={() => setActiveInterview(iv)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-serif font-bold text-primary">{iv.candidateName}</h3>
                        <p className="text-xs text-secondary">{iv.jobTitle}</p>
                        <p className="text-[11px] text-muted">{iv.schoolName}</p>
                      </div>
                      <StatusPill status={iv.status} />
                    </div>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-border/60">
                      <span className="font-semibold text-primary">
                        {formatDateTime(iv.scheduledAt)}
                      </span>
                      <Button size="sm" variant="outline" className="text-xs">
                        Review
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pager */}
              <Pager
                page={data.page.page}
                totalPages={data.page.totalPages}
                onPage={(p) => setPage(p)}
              />
            </div>
          ) : null}
        </div>
      )}

      {/* Interview Detail Slide-Over Drawer */}
      {activeInterview ? (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-primary/30 backdrop-blur-[3px] transition-opacity"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Interview Round Details"
            className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl overflow-hidden border-l border-border"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border/80 bg-[#FAF9F5] p-5 sm:p-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <StatusPill status={activeInterview.status} />
                  {activeInterview.result && activeInterview.result !== "pending" ? (
                    <span className="rounded-md border border-accent/40 bg-[#FAF5EB] px-2 py-0.5 text-xs font-bold text-[#8F7032] capitalize">
                      {activeInterview.result.replace(/_/g, " ")}
                    </span>
                  ) : null}
                </div>
                <h2 className="font-serif text-2xl font-bold text-primary">
                  {activeInterview.candidateName}
                </h2>
                <p className="text-xs text-secondary font-medium">
                  Round for <span className="font-bold text-primary">{activeInterview.jobTitle}</span> at{" "}
                  <span className="text-primary">{activeInterview.schoolName}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveInterview(null)}
                className="rounded-lg p-2 text-muted transition hover:bg-border/40 hover:text-primary"
                aria-label="Close panel"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Timing & Delivery Box */}
              <div className="divide-y divide-border/60 rounded-xl border border-border bg-[#FAF9F5] text-xs">
                <div className="flex items-center justify-between p-3.5">
                  <span className="text-muted font-medium flex items-center gap-1.5">
                    <CalendarDays className="size-4 text-accent" /> Scheduled Date & Time
                  </span>
                  <span className="font-bold text-primary">
                    {formatDateTime(activeInterview.scheduledAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5">
                  <span className="text-muted font-medium flex items-center gap-1.5">
                    <Video className="size-4 text-indigo-700" /> Delivery Format
                  </span>
                  <span className="font-bold text-primary capitalize">
                    {activeInterview.mode.replace(/_/g, " ")} Round
                  </span>
                </div>

                {activeInterview.locationOrLink ? (
                  <div className="p-3.5">
                    <span className="text-muted block mb-1 font-medium">
                      {activeInterview.mode === "online" ? "Meeting URL" : "Physical Venue / Classroom"}
                    </span>
                    {activeInterview.locationOrLink.startsWith("http") ? (
                      <a
                        href={activeInterview.locationOrLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-indigo-900 hover:underline break-all"
                      >
                        <ExternalLink className="size-3.5 shrink-0" />
                        {activeInterview.locationOrLink}
                      </a>
                    ) : (
                      <span className="font-semibold text-primary break-all">
                        {activeInterview.locationOrLink}
                      </span>
                    )}
                  </div>
                ) : null}

                <div className="flex items-center justify-between p-3.5">
                  <span className="text-muted font-medium flex items-center gap-1.5">
                    <UserCheck className="size-4 text-emerald-700" /> Candidate Attendance
                  </span>
                  {activeInterview.candidateConfirmedAt ? (
                    <span className="font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="size-3.5" />
                      Confirmed ({formatDateTime(activeInterview.candidateConfirmedAt)})
                    </span>
                  ) : (
                    <span className="text-amber-800 font-medium">Pending Candidate Confirmation</span>
                  )}
                </div>
              </div>

              {/* Instructions Box */}
              {activeInterview.instructions ? (
                <div className="rounded-xl border border-border bg-white p-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
                    <FileText className="size-3.5 text-accent" />
                    Instructions / Demonstration Topics
                  </div>
                  <p className="text-xs text-secondary leading-relaxed bg-[#FAF9F5] p-3 rounded-lg border border-border/50">
                    {activeInterview.instructions}
                  </p>
                </div>
              ) : null}

              {/* Recorded Feedback Display */}
              {activeInterview.feedback ? (
                <div className="rounded-xl border border-accent/40 bg-[#FAF5EB]/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#8F7032] flex items-center gap-1.5">
                      <Star className="size-4 fill-accent text-accent" />
                      Evaluation & Feedback
                    </h3>
                    {activeInterview.feedback.rating ? (
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`size-3.5 ${
                              idx < (activeInterview.feedback?.rating || 0)
                                ? "fill-accent text-accent"
                                : "text-border"
                            }`}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted block">Recommendation</span>
                      <span className="font-bold text-primary capitalize">
                        {activeInterview.feedback.recommendation?.replace(/_/g, " ") || "Not Specified"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted block">Evaluator</span>
                      <span className="font-medium text-primary">
                        {activeInterview.feedback.interviewerName || "Hiring Panel"}
                      </span>
                    </div>
                  </div>

                  {activeInterview.feedback.strengths ? (
                    <div className="text-xs">
                      <span className="text-muted block font-semibold">Strengths Observed:</span>
                      <p className="mt-0.5 text-secondary">{activeInterview.feedback.strengths}</p>
                    </div>
                  ) : null}

                  {activeInterview.feedback.improvements ? (
                    <div className="text-xs">
                      <span className="text-muted block font-semibold">Areas for Development:</span>
                      <p className="mt-0.5 text-secondary">{activeInterview.feedback.improvements}</p>
                    </div>
                  ) : null}

                  {activeInterview.feedback.notes ? (
                    <div className="text-xs border-t border-accent/20 pt-2">
                      <span className="text-muted block font-semibold">Additional Remarks:</span>
                      <p className="mt-0.5 text-secondary italic">{activeInterview.feedback.notes}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* Reschedule History */}
              {activeInterview.rescheduleHistory && activeInterview.rescheduleHistory.length > 0 ? (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
                    Reschedule History
                  </h3>
                  <div className="divide-y divide-border/60 rounded-xl border border-border bg-white text-xs">
                    {activeInterview.rescheduleHistory.map((rh) => (
                      <div key={rh.id} className="p-3">
                        <div className="flex items-center justify-between font-semibold text-primary">
                          <span>Moved to {formatDateTime(rh.newScheduledAt)}</span>
                          <span className="text-[10px] text-muted">
                            {formatDateTime(rh.createdAt)}
                          </span>
                        </div>
                        <p className="text-[11px] text-secondary mt-0.5">Reason: {rh.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Action Buttons Bar */}
              <div className="space-y-2.5 pt-2">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => {
                    setFbResult(activeInterview.result !== "pending" ? activeInterview.result : "selected");
                    setFbRating(activeInterview.feedback?.rating || 4);
                    setFbRecommendation(
                      (activeInterview.feedback?.recommendation as typeof fbRecommendation) || "hire",
                    );
                    setFbStrengths(activeInterview.feedback?.strengths || "");
                    setFbImprovements(activeInterview.feedback?.improvements || "");
                    setFbNotes(activeInterview.feedback?.notes || "");
                    setFeedbackModalOpen(true);
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  <Award className="mr-1.5 size-4" />
                  Record Evaluation & Selection
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setReschedDateTime(activeInterview.scheduledAt.slice(0, 16));
                      setReschedMode(
                        activeInterview.mode === "other" ? "online" : activeInterview.mode,
                      );
                      setReschedLink(activeInterview.locationOrLink || "");
                      setRescheduleModalOpen(true);
                    }}
                  >
                    <RotateCcw className="mr-1.5 size-3.5" />
                    Reschedule Round
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleResendInvitation}
                  >
                    <Send className="mr-1.5 size-3.5" />
                    Resend Invitation
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => {
                    setCancelReason("");
                    setCancelModalOpen(true);
                  }}
                  className="text-rose-700 hover:bg-rose-50 hover:text-rose-800 text-xs"
                >
                  <XCircle className="mr-1.5 size-3.5" />
                  Cancel Interview Round
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Schedule Interview Modal */}
      <Modal
        open={scheduleModalOpen}
        onClose={() => !submittingSchedule && setScheduleModalOpen(false)}
        title="Schedule Interview Round"
        description="Assign a formal evaluation or demonstration slot for a candidate educator."
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
              Candidate User ID / Reference
            </label>
            <Input
              required
              placeholder="e.g. 6aee445188d8346f06f03306"
              value={schedCandidateId}
              onChange={(e) => setSchedCandidateId(e.target.value)}
              disabled={submittingSchedule}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
                Candidate Full Name
              </label>
              <Input
                placeholder="e.g. Dr. Raghavendra Rao"
                value={schedCandidateName}
                onChange={(e) => setSchedCandidateName(e.target.value)}
                disabled={submittingSchedule}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
                Candidate Email
              </label>
              <Input
                type="email"
                placeholder="e.g. raghav@example.in"
                value={schedCandidateEmail}
                onChange={(e) => setSchedCandidateEmail(e.target.value)}
                disabled={submittingSchedule}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
                Job Position Title
              </label>
              <Input
                required
                placeholder="e.g. PGT Physics Senior Faculty"
                value={schedJobTitle}
                onChange={(e) => setSchedJobTitle(e.target.value)}
                disabled={submittingSchedule}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
                School / Institution
              </label>
              <Input
                required
                placeholder="e.g. DPS RK Puram"
                value={schedSchoolName}
                onChange={(e) => setSchedSchoolName(e.target.value)}
                disabled={submittingSchedule}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
                Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={schedDateTime}
                onChange={(e) => setSchedDateTime(e.target.value)}
                className="touch-target w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-primary shadow-sm focus:border-accent"
                disabled={submittingSchedule}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
                Delivery Mode
              </label>
              <select
                value={schedMode}
                onChange={(e) =>
                  setSchedMode(e.target.value as "online" | "in_person" | "phone" | "hybrid")
                }
                className="touch-target w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-primary shadow-sm focus:border-accent"
                disabled={submittingSchedule}
              >
                <option value="online">Online Video Meet</option>
                <option value="in_person">In-Person Campus</option>
                <option value="phone">Telephonic</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
              Meeting URL or Campus Venue
            </label>
            <Input
              placeholder="e.g. https://meet.google.com/abc-xyz or Conference Room 102"
              value={schedLinkOrVenue}
              onChange={(e) => setSchedLinkOrVenue(e.target.value)}
              disabled={submittingSchedule}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
              Candidate Preparation Instructions
            </label>
            <TextArea
              rows={2}
              placeholder="e.g. Please prepare a 10-minute demonstration on Grade 11 Kinematics..."
              value={schedInstructions}
              onChange={(e) => setSchedInstructions(e.target.value)}
              disabled={submittingSchedule}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setScheduleModalOpen(false)}
              disabled={submittingSchedule}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submittingSchedule || !schedDateTime || !schedJobTitle}
            >
              {submittingSchedule ? "Scheduling..." : "Confirm & Dispatch Invitation"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Record Feedback & Selection Modal */}
      <Modal
        open={feedbackModalOpen}
        onClose={() => !submittingFeedback && setFeedbackModalOpen(false)}
        title="Record Interview Feedback & Selection"
        description="Submit panel evaluation, score competencies, and optionally generate an official placement record."
      >
        <form onSubmit={handleFeedbackSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
                Performance Rating (1 to 5)
              </label>
              <select
                value={fbRating}
                onChange={(e) => setFbRating(Number(e.target.value))}
                className="touch-target w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-primary shadow-sm focus:border-accent"
                disabled={submittingFeedback}
              >
                <option value={5}>5 Stars - Outstanding</option>
                <option value={4}>4 Stars - Exceeds Expectations</option>
                <option value={3}>3 Stars - Meets Requirements</option>
                <option value={2}>2 Stars - Needs Improvement</option>
                <option value={1}>1 Star - Unsatisfactory</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
                Panel Recommendation
              </label>
              <select
                value={fbRecommendation}
                onChange={(e) =>
                  setFbRecommendation(
                    e.target.value as "hire" | "strong_hire" | "consider" | "reject" | "re_evaluate",
                  )
                }
                className="touch-target w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-primary shadow-sm focus:border-accent"
                disabled={submittingFeedback}
              >
                <option value="strong_hire">Strong Hire</option>
                <option value="hire">Hire</option>
                <option value="consider">Consider / On Hold</option>
                <option value="re_evaluate">Re-evaluate</option>
                <option value="reject">Do Not Hire</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
              Evaluator / Panel Member Name
            </label>
            <Input
              placeholder="e.g. Dr. K. Sharma (HoD Mathematics)"
              value={fbInterviewer}
              onChange={(e) => setFbInterviewer(e.target.value)}
              disabled={submittingFeedback}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
                Demonstrated Strengths
              </label>
              <TextArea
                rows={2}
                placeholder="Pedagogical clarity, classroom control, subject depth..."
                value={fbStrengths}
                onChange={(e) => setFbStrengths(e.target.value)}
                disabled={submittingFeedback}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
                Areas for Development
              </label>
              <TextArea
                rows={2}
                placeholder="EdTech proficiency, student engagement techniques..."
                value={fbImprovements}
                onChange={(e) => setFbImprovements(e.target.value)}
                disabled={submittingFeedback}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
              Official Round Result
            </label>
            <select
              value={fbResult}
              onChange={(e) =>
                setFbResult(
                  e.target.value as "pending" | "selected" | "rejected" | "on_hold" | "reschedule_needed",
                )
              }
              className="touch-target w-full rounded-lg border border-border bg-white px-3 py-2 text-xs font-bold text-primary shadow-sm focus:border-accent"
              disabled={submittingFeedback}
            >
              <option value="selected">Mark Candidate as SELECTED</option>
              <option value="rejected">Mark as NOT SELECTED</option>
              <option value="on_hold">Put on HOLD</option>
              <option value="reschedule_needed">Reschedule Round Needed</option>
            </select>
          </div>

          {/* Auto Placement Creation Toggle */}
          {fbResult === "selected" ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-950">
                <input
                  type="checkbox"
                  checked={fbAutoPlacement}
                  onChange={(e) => setFbAutoPlacement(e.target.checked)}
                  className="size-4 rounded text-emerald-700"
                />
                Automatically create Placement Record for this selection
              </label>

              {fbAutoPlacement ? (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-emerald-900 block">
                      Expected Joining Date
                    </label>
                    <input
                      type="date"
                      required
                      value={fbJoiningDate}
                      onChange={(e) => setFbJoiningDate(e.target.value)}
                      className="touch-target w-full rounded-lg border border-emerald-300 bg-white px-2.5 py-1.5 text-xs text-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-emerald-900 block">
                      Salary Offered (INR / Month)
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g. 65000"
                      value={fbSalaryOffered}
                      onChange={(e) => setFbSalaryOffered(e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFeedbackModalOpen(false)}
              disabled={submittingFeedback}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submittingFeedback || (fbResult === "selected" && fbAutoPlacement && !fbJoiningDate)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              {submittingFeedback ? "Saving..." : "Confirm Evaluation & Outcome"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        open={rescheduleModalOpen}
        onClose={() => !submittingReschedule && setRescheduleModalOpen(false)}
        title="Reschedule Interview Round"
        description="Update interview date, delivery mode, or meeting venue. Candidate will receive notification."
      >
        <form onSubmit={handleRescheduleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
                New Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={reschedDateTime}
                onChange={(e) => setReschedDateTime(e.target.value)}
                className="touch-target w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-primary shadow-sm focus:border-accent"
                disabled={submittingReschedule}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
                Delivery Format
              </label>
              <select
                value={reschedMode}
                onChange={(e) =>
                  setReschedMode(e.target.value as "online" | "in_person" | "phone" | "hybrid")
                }
                className="touch-target w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-primary shadow-sm focus:border-accent"
                disabled={submittingReschedule}
              >
                <option value="online">Online Video Meet</option>
                <option value="in_person">In-Person Campus</option>
                <option value="phone">Telephonic</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
              Meeting URL or Campus Location
            </label>
            <Input
              placeholder="e.g. meet.google.com/xyz"
              value={reschedLink}
              onChange={(e) => setReschedLink(e.target.value)}
              disabled={submittingReschedule}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
              Reason for Rescheduling
            </label>
            <Input
              required
              placeholder="e.g. School panel schedule conflict / Candidate request"
              value={reschedReason}
              onChange={(e) => setReschedReason(e.target.value)}
              disabled={submittingReschedule}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRescheduleModalOpen(false)}
              disabled={submittingReschedule}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submittingReschedule || !reschedDateTime || !reschedReason}
            >
              {submittingReschedule ? "Updating..." : "Confirm Reschedule"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        open={cancelModalOpen}
        onClose={() => !submittingCancel && setCancelModalOpen(false)}
        title="Cancel Interview Round"
        description="Mark this round as cancelled. Candidate will be notified."
      >
        <form onSubmit={handleCancelSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
              Cancellation Reason
            </label>
            <TextArea
              required
              rows={3}
              placeholder="e.g. Vacancy filled by internal transfer / Candidate withdrew / Position cancelled"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              disabled={submittingCancel}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCancelModalOpen(false)}
              disabled={submittingCancel}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submittingCancel || !cancelReason.trim()}
              className="bg-rose-700 hover:bg-rose-800 text-white"
            >
              {submittingCancel ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminPage>
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

function formatTimeOnly(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}
