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
import {
  Search,
  CheckCircle2,
  Calendar,
  MessageSquare,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  ExternalLink,
  Lock,
  Send,
  CalendarPlus,
  CheckSquare,
  Square,
} from "lucide-react";

export type AdminAppItem = {
  id: string;
  teacherUserId: string;
  teacherName?: string;
  candidateEmail?: string;
  candidateMobile?: string;
  candidateCity?: string;
  candidateState?: string;
  qualification?: string;
  bed?: boolean;
  ctet?: boolean;
  experienceYears?: number;
  resumeUrl?: string;
  resumeOriginalName?: string;
  jobId: string;
  jobTitle: string;
  schoolName: string;
  status: string;
  coverNote?: string;
  withdrawalReason?: string;
  appliedAt: string;
  createdAt: string;
  statusHistory?: Array<{
    status: string;
    changedByRole?: string;
    note?: string;
    createdAt: string;
  }>;
  internalNotes?: Array<{
    id: string;
    authorName: string;
    note: string;
    createdAt: string;
  }>;
  candidateMessages?: Array<{
    id: string;
    senderName: string;
    message: string;
    createdAt: string;
  }>;
  interviewScheduledAt?: string;
  interviewMode?: string;
  sharedWithSchools?: Array<{
    schoolId?: string;
    schoolName: string;
    contactPerson?: string;
    channel: string;
    sharedAt: string;
    includedFields?: string[];
    authorizationNote?: string;
  }>;
};

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "on_hold", label: "On Hold" },
  { value: "interview_scheduled", label: "Interview Scheduled" },
  { value: "interview_completed", label: "Interview Completed" },
  { value: "selected", label: "Selected" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
];

export default function AdminApplicationsPage() {
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<Paged<AdminAppItem> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Multi-selection state
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Active side panel candidate
  const [activeApp, setActiveApp] = React.useState<AdminAppItem | null>(null);
  const [activeTab, setActiveTab] = React.useState<"notes" | "messages" | "interview">("notes");

  // Note form state
  const [newNote, setNewNote] = React.useState("");
  const [noteAuthor, setNoteAuthor] = React.useState("Admin Reviewer");
  const [savingNote, setSavingNote] = React.useState(false);

  // Message form state
  const [newMessage, setNewMessage] = React.useState("");
  const [msgSender, setMsgSender] = React.useState("Hiring Committee");
  const [sendingMsg, setSendingMsg] = React.useState(false);

  // Interview form state
  const [interviewDate, setInterviewDate] = React.useState("");
  const [interviewMode, setInterviewMode] = React.useState<"online" | "in_person" | "phone">("online");
  const [interviewLocation, setInterviewLocation] = React.useState("");
  const [interviewNotes, setInterviewNotes] = React.useState("");
  const [schedulingInterview, setSchedulingInterview] = React.useState(false);

  // Bulk confirmation modal
  const [bulkAction, setBulkAction] = React.useState<string | null>(null);
  const [bulkNote, setBulkNote] = React.useState("");
  const [processingBulk, setProcessingBulk] = React.useState(false);

  // Single status change note modal
  const [singleStatusTarget, setSingleStatusTarget] = React.useState<{ id: string; status: string } | null>(null);
  const [singleInternalReason, setSingleInternalReason] = React.useState("");
  const [singleCandidateExplanation, setSingleCandidateExplanation] = React.useState("");
  const [processingSingleStatus, setProcessingSingleStatus] = React.useState(false);

  // Candidate dossier sharing modal state
  const [shareModalOpen, setShareModalOpen] = React.useState(false);
  const [shareSchools, setShareSchools] = React.useState<Array<{ id: string; name: string }>>([]);
  const [shareTargetSchoolId, setShareTargetSchoolId] = React.useState("");
  const [shareContactPerson, setShareContactPerson] = React.useState("");
  const [shareContactChannel, setShareContactChannel] = React.useState<"email" | "whatsapp" | "in_person">("email");
  const [shareDestination, setShareDestination] = React.useState("");
  const [shareAuthorizationNote, setShareAuthorizationNote] = React.useState("");
  const [shareFields, setShareFields] = React.useState({
    fullName: true,
    qualification: true,
    experienceYears: true,
    resumeUrl: true,
    contactInfo: false,
  });
  const [sharingDossier, setSharingDossier] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", "15");
    if (q.trim()) query.set("q", q.trim());
    if (status) query.set("status", status);

    const res = await apiFetch<Paged<AdminAppItem>>(`/api/admin/applications?${query.toString()}`);
    if (!res.ok) {
      setError(res.error.message);
    } else {
      setData(res.data);
      // If active candidate is open, refresh their data from items
      if (activeApp) {
        const found = res.data.items.find((i) => i.id === activeApp.id);
        if (found) setActiveApp(found);
      }
    }
    setLoading(false);
  }, [page, q, status, activeApp]);

  React.useEffect(() => {
    load();
  }, [page, q, status]); // eslint-disable-line react-hooks/exhaustive-deps

  // Selection helpers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleSelectAll = () => {
    if (!data?.items.length) return;
    const allIds = data.items.map((i) => i.id);
    const allSelected = allIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allIds);
    }
  };

  const isAllSelected = Boolean(
    data?.items.length && data.items.every((i) => selectedIds.includes(i.id)),
  );

  // Status update helpers
  const handleApplySingleStatus = async () => {
    if (!singleStatusTarget) return;
    setProcessingSingleStatus(true);
    const res = await apiFetch("/api/admin/applications", {
      method: "PATCH",
      body: JSON.stringify({
        id: singleStatusTarget.id,
        status: singleStatusTarget.status,
        internalReason: singleInternalReason.trim() || undefined,
        candidateVisibleExplanation: singleCandidateExplanation.trim() || undefined,
      }),
    });
    setProcessingSingleStatus(false);
    if (res.ok) {
      setSingleStatusTarget(null);
      setSingleInternalReason("");
      setSingleCandidateExplanation("");
      if (activeApp && activeApp.id === singleStatusTarget.id) {
        const fresh = await apiFetch<AdminAppItem>(`/api/admin/applications/${activeApp.id}`);
        if (fresh.ok) setActiveApp(fresh.data);
      }
      load();
    }
  };

  const openShareModal = async (app: AdminAppItem) => {
    if (!shareSchools.length) {
      const res = await apiFetch<{ items: Array<{ id: string; name: string }> }>("/api/admin/schools?limit=100");
      if (res.ok && res.data?.items) {
        setShareSchools(res.data.items);
        const match = res.data.items.find((s) => s.name.toLowerCase() === app.schoolName.toLowerCase());
        setShareTargetSchoolId(match?.id || res.data.items[0]?.id || "");
      }
    }
    setShareContactPerson("");
    setShareDestination("");
    setShareAuthorizationNote("");
    setShareModalOpen(true);
  };

  const handleShareDossier = async () => {
    if (!activeApp || !shareTargetSchoolId) return;
    setSharingDossier(true);

    const activeIncludedFields: string[] = [];
    if (shareFields.fullName) activeIncludedFields.push("fullName");
    if (shareFields.qualification) activeIncludedFields.push("qualification");
    if (shareFields.experienceYears) activeIncludedFields.push("experienceYears");
    if (shareFields.resumeUrl) activeIncludedFields.push("resumeUrl");
    if (shareFields.contactInfo) activeIncludedFields.push("contactInfo");

    const res = await apiFetch(`/api/admin/applications/${activeApp.id}/share`, {
      method: "POST",
      body: JSON.stringify({
        schoolId: shareTargetSchoolId,
        contactPerson: shareContactPerson.trim() || undefined,
        contactChannel: shareContactChannel,
        contactDestination: shareDestination.trim() || undefined,
        authorizationNote: shareAuthorizationNote.trim() || undefined,
        includedFields: activeIncludedFields,
      }),
    });

    setSharingDossier(false);
    if (res.ok) {
      setShareModalOpen(false);
      alert("Candidate dossier shared and recorded in CRM communication logs!");
      const fresh = await apiFetch<AdminAppItem>(`/api/admin/applications/${activeApp.id}`);
      if (fresh.ok) setActiveApp(fresh.data);
      load();
    } else {
      alert(res.error.message);
    }
  };

  const handleApplyBulkStatus = async () => {
    if (!bulkAction || !selectedIds.length) return;
    setProcessingBulk(true);
    const res = await apiFetch("/api/admin/applications", {
      method: "PATCH",
      body: JSON.stringify({
        ids: selectedIds,
        status: bulkAction,
        note: bulkNote.trim() || undefined,
      }),
    });
    setProcessingBulk(false);
    if (res.ok) {
      setBulkAction(null);
      setBulkNote("");
      setSelectedIds([]);
      load();
    }
  };

  // Submitting internal CRM note
  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApp || !newNote.trim()) return;
    setSavingNote(true);
    const res = await apiFetch(`/api/admin/applications/${activeApp.id}/notes`, {
      method: "POST",
      body: JSON.stringify({
        note: newNote.trim(),
        authorName: noteAuthor.trim() || "Admin Reviewer",
      }),
    });
    setSavingNote(false);
    if (res.ok) {
      setNewNote("");
      // Fetch fresh details for active app
      const freshRes = await apiFetch<AdminAppItem>(`/api/admin/applications/${activeApp.id}`);
      if (freshRes.ok) setActiveApp(freshRes.data);
      load();
    }
  };

  // Submitting candidate message
  const handleSendCandidateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApp || !newMessage.trim()) return;
    setSendingMsg(true);
    const res = await apiFetch(`/api/admin/applications/${activeApp.id}/messages`, {
      method: "POST",
      body: JSON.stringify({
        message: newMessage.trim(),
        senderName: msgSender.trim() || "Hiring Committee",
      }),
    });
    setSendingMsg(false);
    if (res.ok) {
      setNewMessage("");
      const freshRes = await apiFetch<AdminAppItem>(`/api/admin/applications/${activeApp.id}`);
      if (freshRes.ok) setActiveApp(freshRes.data);
      load();
    }
  };

  // Scheduling interview
  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApp || !interviewDate) return;
    setSchedulingInterview(true);
    const res = await apiFetch(`/api/admin/applications/${activeApp.id}/interview`, {
      method: "POST",
      body: JSON.stringify({
        scheduledAt: new Date(interviewDate).toISOString(),
        mode: interviewMode,
        locationOrLink: interviewLocation.trim() || undefined,
        notes: interviewNotes.trim() || undefined,
      }),
    });
    setSchedulingInterview(false);
    if (res.ok) {
      setInterviewDate("");
      setInterviewLocation("");
      setInterviewNotes("");
      const freshRes = await apiFetch<AdminAppItem>(`/api/admin/applications/${activeApp.id}`);
      if (freshRes.ok) setActiveApp(freshRes.data);
      load();
    }
  };

  return (
    <AdminPage
      title="Application & Recruitment CRM"
      subtitle="Screen candidate qualifications, review dossiers, conduct bulk stage updates, schedule interviews, and log private evaluation notes."
    >
      {/* Search & Filter Toolbar */}
      <Card className="p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-12 sm:items-end">
          <div className="sm:col-span-6">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted mb-1 block">
              Search Candidates & Vacancies
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-muted" />
              <Input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by candidate name, email, phone, job, or institution..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="sm:col-span-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted mb-1 block">
              Hiring Stage
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="touch-target w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-primary shadow-sm focus:border-accent focus:outline-none"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
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
                setPage(1);
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Floating / Sticky Bulk Action Bar */}
      {selectedIds.length > 0 ? (
        <div className="sticky top-2 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/40 bg-[#FAF5EB] p-3 shadow-md sm:p-4">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-[#14233B] text-xs font-bold text-white">
              {selectedIds.length}
            </span>
            <span className="text-sm font-semibold text-primary">
              Candidate{selectedIds.length > 1 ? "s" : ""} Selected
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setBulkAction("shortlisted");
                setBulkNote("");
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              Bulk Shortlist
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setBulkAction("on_hold");
                setBulkNote("");
              }}
            >
              Put On Hold
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setBulkAction("under_review");
                setBulkNote("");
              }}
            >
              Mark Under Review
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setBulkAction("rejected");
                setBulkNote("");
              }}
              className="text-rose-700 border-rose-300 hover:bg-rose-50"
            >
              Bulk Reject
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedIds([])}
              className="text-muted"
            >
              Deselect All
            </Button>
          </div>
        </div>
      ) : null}

      {/* Loading & Error States */}
      {loading ? (
        <Card className="p-5">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </Card>
      ) : null}

      {error ? (
        <ErrorState title="Unable to load applications" message={error} onRetry={load} />
      ) : null}

      {!loading && !error && (!data || data.items.length === 0) ? (
        <EmptyState
          title="No applications found"
          description="There are currently no candidate applications matching your search or filter criteria."
        />
      ) : null}

      {/* Main List & Table */}
      {!loading && !error && data && data.items.length > 0 ? (
        <div className="space-y-4">
          {/* Mobile Candidate Cards */}
          <div className="space-y-3 md:hidden">
            <div className="flex items-center justify-between px-1 text-xs text-muted">
              <span>{data.page.total} Total Applications</span>
              <button
                type="button"
                onClick={handleSelectAll}
                className="font-medium text-accent hover:underline"
              >
                {isAllSelected ? "Deselect All" : "Select All on Page"}
              </button>
            </div>

            {data.items.map((app) => {
              const isSelected = selectedIds.includes(app.id);
              const isActive = activeApp?.id === app.id;

              return (
                <Card
                  key={app.id}
                  className={`p-4 transition-all ${
                    isActive ? "border-accent ring-2 ring-accent/20" : "border-border"
                  } ${isSelected ? "bg-[#FAF5EB]/30" : "bg-white"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(app.id)}
                        className="mt-0.5 text-primary"
                        aria-label="Select application"
                      >
                        {isSelected ? (
                          <CheckSquare className="size-5 text-accent" />
                        ) : (
                          <Square className="size-5 text-muted" />
                        )}
                      </button>
                      <div>
                        <h3 className="font-serif font-bold text-primary">{app.teacherName}</h3>
                        <p className="text-xs text-secondary font-medium">{app.jobTitle}</p>
                        <p className="text-[11px] text-muted">{app.schoolName}</p>
                      </div>
                    </div>
                    <StatusPill status={app.status} />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                    <span className="rounded-md border border-border bg-[#FAF9F5] px-2 py-0.5 font-medium text-primary">
                      {app.qualification || "Graduate"}
                    </span>
                    {app.bed ? (
                      <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-medium text-emerald-800">
                        B.Ed ✓
                      </span>
                    ) : null}
                    {app.ctet ? (
                      <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-medium text-emerald-800">
                        CTET ✓
                      </span>
                    ) : null}
                    <span className="rounded-md border border-border bg-[#FAF9F5] px-2 py-0.5 text-muted">
                      {app.experienceYears || 0} Yrs Exp
                    </span>
                    {app.candidateCity ? (
                      <span className="rounded-md border border-border bg-[#FAF9F5] px-2 py-0.5 text-muted">
                        {app.candidateCity}, {app.candidateState}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                    <span className="text-[11px] text-muted">
                      Applied {formatDate(app.appliedAt)}
                    </span>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setActiveApp(app)}
                      className="text-xs"
                    >
                      Review Dossier
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Desktop Advanced Table */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-border bg-soft-blue/70 text-xs font-semibold uppercase tracking-wider text-primary">
                  <tr>
                    <th className="w-10 px-4 py-3.5">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="flex items-center text-primary"
                        aria-label="Select all applications"
                      >
                        {isAllSelected ? (
                          <CheckSquare className="size-4 text-accent" />
                        ) : (
                          <Square className="size-4 text-muted" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3.5">Candidate Dossier</th>
                    <th className="px-4 py-3.5">Target Vacancy</th>
                    <th className="px-4 py-3.5">Qualifications & Exp</th>
                    <th className="px-4 py-3.5">Current Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {data.items.map((app) => {
                    const isSelected = selectedIds.includes(app.id);
                    const isActive = activeApp?.id === app.id;

                    return (
                      <tr
                        key={app.id}
                        className={`transition-colors hover:bg-[#FAF9F5] ${
                          isActive ? "bg-[#FAF5EB]/50" : isSelected ? "bg-[#FAF5EB]/20" : ""
                        }`}
                      >
                        <td className="px-4 py-3.5 align-middle">
                          <button
                            type="button"
                            onClick={() => handleToggleSelect(app.id)}
                            className="flex items-center"
                            aria-label="Select application"
                          >
                            {isSelected ? (
                              <CheckSquare className="size-4 text-accent" />
                            ) : (
                              <Square className="size-4 text-muted" />
                            )}
                          </button>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-serif font-bold text-primary">
                            {app.teacherName || "Candidate Educator"}
                          </div>
                          <div className="text-xs text-muted">
                            {app.candidateEmail || "—"} • {app.candidateMobile || "—"}
                          </div>
                          {app.candidateCity ? (
                            <div className="text-[11px] text-secondary flex items-center gap-1 mt-0.5">
                              <MapPin className="size-3 text-muted" />
                              {app.candidateCity}, {app.candidateState}
                            </div>
                          ) : null}
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-medium text-primary text-xs">{app.jobTitle}</div>
                          <div className="text-xs text-muted">{app.schoolName}</div>
                          <div className="text-[11px] text-muted mt-0.5">
                            Applied {formatDate(app.appliedAt)}
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            <span className="rounded border border-border bg-[#FAF9F5] px-1.5 py-0.5 text-[11px] font-medium text-primary">
                              {app.qualification || "Graduate"}
                            </span>
                            {app.bed ? (
                              <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-800">
                                B.Ed
                              </span>
                            ) : null}
                            {app.ctet ? (
                              <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-800">
                                CTET
                              </span>
                            ) : null}
                            <span className="rounded border border-border bg-[#FAF9F5] px-1.5 py-0.5 text-[11px] text-muted">
                              {app.experienceYears || 0} Yrs
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <StatusPill status={app.status} />
                          {app.interviewScheduledAt ? (
                            <div className="mt-1 text-[11px] text-indigo-800 flex items-center gap-1 font-medium">
                              <Calendar className="size-3" />
                              {formatDate(app.interviewScheduledAt)}
                            </div>
                          ) : null}
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant={isActive ? "primary" : "secondary"}
                              onClick={() => setActiveApp(app)}
                              className="text-xs"
                            >
                              Review Dossier
                            </Button>
                            <button
                              type="button"
                              onClick={() =>
                                setSingleStatusTarget({
                                  id: app.id,
                                  status: app.status === "shortlisted" ? "on_hold" : "shortlisted",
                                })
                              }
                              className="rounded-lg border border-border bg-white px-2.5 py-1 text-xs font-semibold text-secondary hover:bg-[#FAF9F5]"
                            >
                              {app.status === "shortlisted" ? "Hold" : "Shortlist"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pager */}
          <Pager
            page={data.page.page}
            totalPages={data.page.totalPages}
            onPage={(p) => setPage(p)}
          />
        </div>
      ) : null}

      {/* Candidate Review Side Panel / Slide-Over */}
      {activeApp ? (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-primary/30 backdrop-blur-[3px] transition-opacity"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Candidate Dossier Review"
            className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl overflow-hidden border-l border-border"
          >
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-border/80 bg-[#FAF9F5] p-5 sm:p-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <StatusPill status={activeApp.status} />
                  <span className="text-xs text-muted">ID: {activeApp.id.slice(-8)}</span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-primary">
                  {activeApp.teacherName}
                </h2>
                <p className="text-xs text-secondary font-medium">
                  Applying for <span className="font-bold text-primary">{activeApp.jobTitle}</span> at{" "}
                  <span className="text-primary">{activeApp.schoolName}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveApp(null)}
                className="rounded-lg p-2 text-muted transition hover:bg-border/40 hover:text-primary"
                aria-label="Close side panel"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-white px-5 py-3 sm:px-6">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted mr-1">
                  Stage:
                </span>
                {["under_review", "shortlisted", "on_hold", "selected", "rejected"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    disabled={activeApp.status === st}
                    onClick={() => setSingleStatusTarget({ id: activeApp.id, status: st })}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize transition ${
                      activeApp.status === st
                        ? "border-accent bg-[#FAF5EB] text-[#8F7032] opacity-70"
                        : "border-border bg-white text-secondary hover:bg-[#FAF9F5]"
                    }`}
                  >
                    {st.replace(/_/g, " ")}
                  </button>
                ))}
              </div>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => openShareModal(activeApp)}
                className="flex items-center gap-1.5 bg-accent/20 text-navy font-semibold hover:bg-accent/30 text-xs py-1 h-8"
              >
                <Send className="h-3.5 w-3.5 text-accent" />
                <span>Share Dossier with School</span>
              </Button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Snapshot Dossier Details */}
              <div className="rounded-xl border border-border bg-[#FAF9F5]/60 p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <User className="size-4 text-accent" /> Verified Candidate Profile Snapshot
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                  <div>
                    <span className="text-muted block">Email Address</span>
                    <a
                      href={`mailto:${activeApp.candidateEmail}`}
                      className="font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      <Mail className="size-3 text-muted" />
                      {activeApp.candidateEmail || "—"}
                    </a>
                  </div>
                  <div>
                    <span className="text-muted block">Phone Number</span>
                    <a
                      href={`tel:${activeApp.candidateMobile}`}
                      className="font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      <Phone className="size-3 text-muted" />
                      {activeApp.candidateMobile || "—"}
                    </a>
                  </div>
                  <div>
                    <span className="text-muted block">Location</span>
                    <span className="font-medium text-primary flex items-center gap-1">
                      <MapPin className="size-3 text-muted" />
                      {activeApp.candidateCity ? `${activeApp.candidateCity}, ${activeApp.candidateState}` : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block">Academic Degree</span>
                    <span className="font-medium text-primary flex items-center gap-1">
                      <GraduationCap className="size-3 text-muted" />
                      {activeApp.qualification || "Graduate"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block">Teacher Training</span>
                    <span
                      className={`font-semibold ${
                        activeApp.bed ? "text-emerald-700" : "text-amber-800"
                      }`}
                    >
                      {activeApp.bed ? "B.Ed Qualified ✓" : "No B.Ed"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block">CTET / State TET</span>
                    <span
                      className={`font-semibold ${
                        activeApp.ctet ? "text-emerald-700" : "text-amber-800"
                      }`}
                    >
                      {activeApp.ctet ? "CTET Qualified ✓" : "Not Qualified"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block">Experience</span>
                    <span className="font-medium text-primary flex items-center gap-1">
                      <Briefcase className="size-3 text-muted" />
                      {activeApp.experienceYears || 0} Years Experience
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block">Curriculum Vitae</span>
                    {activeApp.resumeUrl ? (
                      <a
                        href={activeApp.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-accent hover:underline"
                      >
                        <ExternalLink className="size-3" />
                        Download CV
                      </a>
                    ) : (
                      <span className="text-muted italic">No file attached</span>
                    )}
                  </div>
                </div>

                {activeApp.coverNote ? (
                  <div className="mt-2 border-t border-border/60 pt-2 text-xs">
                    <span className="text-muted block font-semibold">Candidate Cover Statement:</span>
                    <p className="mt-1 italic text-secondary bg-white p-2.5 rounded-lg border border-border/50">
                      “{activeApp.coverNote}”
                    </p>
                  </div>
                ) : null}

                {activeApp.withdrawalReason ? (
                  <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800">
                    <span className="font-bold">Candidate Withdrawn:</span> {activeApp.withdrawalReason}
                  </div>
                ) : null}
              </div>

              {/* Dossiers Shared with Schools */}
              {activeApp.sharedWithSchools && activeApp.sharedWithSchools.length > 0 && (
                <div className="rounded-xl border border-accent/30 bg-[#FAF9F5] p-4 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-emerald-600" /> Institution Dossier Sharing Trail (Step 6)
                  </h3>
                  <ul className="divide-y divide-border/60 text-xs">
                    {activeApp.sharedWithSchools.map((s, idx) => (
                      <li key={idx} className="py-2 flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-primary">{s.schoolName}</p>
                          <p className="text-muted text-[11px]">
                            Recipient: {s.contactPerson || "Authorized Recruiter"} • via {s.channel.toUpperCase()}
                          </p>
                          {s.authorizationNote && (
                            <p className="text-primary text-[11px] italic mt-0.5">“{s.authorizationNote}”</p>
                          )}
                        </div>
                        <span className="text-[10px] text-muted shrink-0 ml-2">
                          {formatDateTime(s.sharedAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Status Timeline History */}
              {activeApp.statusHistory && activeApp.statusHistory.length > 0 ? (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
                    Recruitment Stage Trail
                  </h3>
                  <div className="divide-y divide-border/60 rounded-xl border border-border bg-white text-xs">
                    {activeApp.statusHistory.map((h, i) => (
                      <div key={i} className="flex items-start justify-between p-3">
                        <div>
                          <span className="font-semibold text-primary capitalize">
                            {h.status.replace(/_/g, " ")}
                          </span>
                          <span className="ml-2 text-[10px] uppercase font-bold text-muted bg-[#FAF9F5] px-1.5 py-0.5 rounded">
                            {h.changedByRole || "admin"}
                          </span>
                          {h.note ? <p className="mt-0.5 text-secondary">{h.note}</p> : null}
                        </div>
                        <span className="text-[11px] text-muted shrink-0 ml-3">
                          {formatDateTime(h.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Interactive Tabs: Notes / Messages / Interview */}
              <div className="rounded-xl border border-border bg-white overflow-hidden shadow-sm">
                <div className="flex border-b border-border bg-[#FAF9F5]">
                  <button
                    type="button"
                    onClick={() => setActiveTab("notes")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition border-b-2 ${
                      activeTab === "notes"
                        ? "border-accent bg-white text-primary"
                        : "border-transparent text-secondary hover:text-primary"
                    }`}
                  >
                    <Lock className="size-3.5 text-amber-700" />
                    Internal Notes ({activeApp.internalNotes?.length || 0})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("messages")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition border-b-2 ${
                      activeTab === "messages"
                        ? "border-accent bg-white text-primary"
                        : "border-transparent text-secondary hover:text-primary"
                    }`}
                  >
                    <MessageSquare className="size-3.5 text-indigo-700" />
                    Candidate Messages ({activeApp.candidateMessages?.length || 0})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("interview")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition border-b-2 ${
                      activeTab === "interview"
                        ? "border-accent bg-white text-primary"
                        : "border-transparent text-secondary hover:text-primary"
                    }`}
                  >
                    <CalendarPlus className="size-3.5 text-emerald-700" />
                    Schedule Interview
                  </button>
                </div>

                {/* Tab 1: Internal CRM Notes */}
                {activeTab === "notes" ? (
                  <div className="p-4 space-y-4">
                    <div className="flex items-center gap-2 rounded-lg bg-amber-50/70 border border-amber-200/60 p-2.5 text-xs text-amber-900">
                      <Lock className="size-4 shrink-0 text-amber-700" />
                      <span>
                        Internal notes are strictly confidential to the hiring panel and are never disclosed to the candidate.
                      </span>
                    </div>

                    {activeApp.internalNotes && activeApp.internalNotes.length > 0 ? (
                      <div className="space-y-2">
                        {activeApp.internalNotes.map((n) => (
                          <div
                            key={n.id}
                            className="rounded-lg border border-border bg-[#FAF9F5] p-3 text-xs"
                          >
                            <div className="flex items-center justify-between font-semibold text-primary">
                              <span>{n.authorName}</span>
                              <span className="text-[10px] text-muted font-normal">
                                {formatDateTime(n.createdAt)}
                              </span>
                            </div>
                            <p className="mt-1 text-secondary whitespace-pre-wrap">{n.note}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted italic">No internal review notes added yet.</p>
                    )}

                    <form onSubmit={handleAddInternalNote} className="space-y-2.5 pt-2 border-t border-border/60">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
                        Add Review Note
                      </label>
                      <TextArea
                        rows={2}
                        placeholder="Log screening feedback, interview impressions, or verification checks..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        disabled={savingNote}
                      />
                      <div className="flex items-center justify-between gap-3">
                        <Input
                          placeholder="Author Name"
                          value={noteAuthor}
                          onChange={(e) => setNoteAuthor(e.target.value)}
                          className="max-w-[160px] text-xs h-8"
                          disabled={savingNote}
                        />
                        <Button
                          type="submit"
                          size="sm"
                          variant="primary"
                          disabled={savingNote || !newNote.trim()}
                        >
                          {savingNote ? "Saving..." : "Save Private Note"}
                        </Button>
                      </div>
                    </form>
                  </div>
                ) : null}

                {/* Tab 2: Candidate Messaging */}
                {activeTab === "messages" ? (
                  <div className="p-4 space-y-4">
                    <div className="flex items-center gap-2 rounded-lg bg-sky-50/70 border border-sky-200/60 p-2.5 text-xs text-sky-900">
                      <MessageSquare className="size-4 shrink-0 text-sky-700" />
                      <span>
                        Messages posted here appear directly in the candidate’s application tracking portal and trigger a notification.
                      </span>
                    </div>

                    {activeApp.candidateMessages && activeApp.candidateMessages.length > 0 ? (
                      <div className="space-y-2">
                        {activeApp.candidateMessages.map((m) => (
                          <div
                            key={m.id}
                            className="rounded-lg border border-indigo-200 bg-indigo-50/40 p-3 text-xs"
                          >
                            <div className="flex items-center justify-between font-semibold text-primary">
                              <span>{m.senderName}</span>
                              <span className="text-[10px] text-muted font-normal">
                                {formatDateTime(m.createdAt)}
                              </span>
                            </div>
                            <p className="mt-1 text-secondary whitespace-pre-wrap">{m.message}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted italic">No candidate messages sent yet.</p>
                    )}

                    <form onSubmit={handleSendCandidateMessage} className="space-y-2.5 pt-2 border-t border-border/60">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
                        Compose Candidate Message
                      </label>
                      <TextArea
                        rows={2}
                        placeholder="Request additional documents, clarify experience, or provide next steps..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={sendingMsg}
                      />
                      <div className="flex items-center justify-between gap-3">
                        <Input
                          placeholder="Sender Title"
                          value={msgSender}
                          onChange={(e) => setMsgSender(e.target.value)}
                          className="max-w-[160px] text-xs h-8"
                          disabled={sendingMsg}
                        />
                        <Button
                          type="submit"
                          size="sm"
                          variant="primary"
                          disabled={sendingMsg || !newMessage.trim()}
                        >
                          <Send className="mr-1.5 size-3.5" />
                          {sendingMsg ? "Sending..." : "Dispatch Message"}
                        </Button>
                      </div>
                    </form>
                  </div>
                ) : null}

                {/* Tab 3: Schedule Interview */}
                {activeTab === "interview" ? (
                  <div className="p-4 space-y-4">
                    {activeApp.interviewScheduledAt ? (
                      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3.5 text-xs text-indigo-950">
                        <p className="font-bold flex items-center gap-1.5 text-indigo-900">
                          <CheckCircle2 className="size-4 text-emerald-600" />
                          Interview Currently Scheduled
                        </p>
                        <p className="mt-1">
                          Date & Time: <span className="font-bold">{formatDateTime(activeApp.interviewScheduledAt)}</span>
                        </p>
                        <p className="capitalize">
                          Mode: <span className="font-semibold">{activeApp.interviewMode || "Online"}</span>
                        </p>
                      </div>
                    ) : null}

                    <form onSubmit={handleScheduleInterview} className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-1">
                          Interview Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          value={interviewDate}
                          onChange={(e) => setInterviewDate(e.target.value)}
                          required
                          className="touch-target w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-primary shadow-sm focus:border-accent focus:outline-none"
                          disabled={schedulingInterview}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-1">
                            Mode
                          </label>
                          <select
                            value={interviewMode}
                            onChange={(e) =>
                              setInterviewMode(e.target.value as "online" | "in_person" | "phone")
                            }
                            className="touch-target w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-primary shadow-sm focus:border-accent focus:outline-none"
                            disabled={schedulingInterview}
                          >
                            <option value="online">Online (Video Meet / Zoom)</option>
                            <option value="in_person">In-Person Campus Round</option>
                            <option value="phone">Telephonic Discussion</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-1">
                            Link / Venue
                          </label>
                          <Input
                            placeholder="e.g. meet.google.com/xyz or Main Campus Room 102"
                            value={interviewLocation}
                            onChange={(e) => setInterviewLocation(e.target.value)}
                            className="text-xs"
                            disabled={schedulingInterview}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-1">
                          Instructions for Candidate
                        </label>
                        <TextArea
                          rows={2}
                          placeholder="e.g. Please bring original certificates and prepare a 10-minute demo on CBSE Grade 10 Science..."
                          value={interviewNotes}
                          onChange={(e) => setInterviewNotes(e.target.value)}
                          disabled={schedulingInterview}
                        />
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        disabled={schedulingInterview || !interviewDate}
                        className="bg-indigo-900 hover:bg-indigo-950 text-white"
                      >
                        <CalendarPlus className="mr-1.5 size-4" />
                        {schedulingInterview ? "Scheduling..." : "Confirm & Schedule Interview"}
                      </Button>
                    </form>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Single Status Confirmation Modal */}
      <Modal
        open={!!singleStatusTarget}
        onClose={() => !processingSingleStatus && setSingleStatusTarget(null)}
        title="Update Candidate Stage"
        description="Transition this application to the selected recruitment stage with segregated internal and candidate-facing notes."
      >
        {singleStatusTarget ? (
          <div className="space-y-4">
            <p className="text-sm text-primary">
              Are you sure you want to change the status to{" "}
              <span className="font-bold capitalize text-accent">
                {singleStatusTarget.status.replace(/_/g, " ")}
              </span>
              ?
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-primary block">
                Internal Admin Reason (Private to Admin Staff)
              </label>
              <TextArea
                rows={2}
                placeholder="Internal evaluation notes (never visible to candidate)..."
                value={singleInternalReason}
                onChange={(e) => setSingleInternalReason(e.target.value)}
                disabled={processingSingleStatus}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-primary block">
                Candidate Explanation (Visible to Teacher in portal & notification)
              </label>
              <TextArea
                rows={2}
                placeholder="Polite message explaining this status update to the candidate..."
                value={singleCandidateExplanation}
                onChange={(e) => setSingleCandidateExplanation(e.target.value)}
                disabled={processingSingleStatus}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSingleStatusTarget(null)}
                disabled={processingSingleStatus}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleApplySingleStatus}
                disabled={processingSingleStatus}
              >
                {processingSingleStatus ? "Updating..." : "Confirm Update"}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Share Candidate Dossier with School Modal */}
      <Modal
        open={shareModalOpen}
        onClose={() => !sharingDossier && setShareModalOpen(false)}
        title="Share Candidate Dossier with Educational Institution (Step 6)"
        description="Share screened educator credentials with the authorized school contact in a logged, privacy-preserving manner."
        className="sm:max-w-xl"
      >
        <div className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-primary mb-1">Target Institution *</label>
            <select
              value={shareTargetSchoolId}
              onChange={(e) => setShareTargetSchoolId(e.target.value)}
              className="w-full h-10 rounded-xl border border-border bg-white px-3 text-xs font-medium text-primary focus:border-accent focus:outline-none"
            >
              <option value="">-- Select Partner School --</option>
              {shareSchools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-primary mb-1">Recipient / Contact Person</label>
              <Input
                placeholder="e.g. Principal / HR Head"
                value={shareContactPerson}
                onChange={(e) => setShareContactPerson(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary mb-1">Transmission Channel</label>
              <select
                value={shareContactChannel}
                onChange={(e) =>
                  setShareContactChannel(e.target.value as "email" | "whatsapp" | "in_person")
                }
                className="w-full h-10 rounded-xl border border-border bg-white px-3 text-xs font-medium text-primary focus:border-accent focus:outline-none"
              >
                <option value="email">Email Dossier</option>
                <option value="whatsapp">WhatsApp Summary</option>
                <option value="in_person">In-Person Meeting Dossier</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-primary mb-1">
              Destination ({shareContactChannel === "email" ? "Email Address" : "Phone / Mobile"})
            </label>
            <Input
              placeholder={shareContactChannel === "email" ? "principal@school.edu" : "+91 9876543210"}
              value={shareDestination}
              onChange={(e) => setShareDestination(e.target.value)}
            />
          </div>

          <div className="rounded-xl border border-border bg-[#FAF9F5] p-3 text-xs space-y-2">
            <p className="font-semibold text-primary">Included Candidate Information</p>
            <div className="grid grid-cols-2 gap-2 text-secondary">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shareFields.fullName}
                  onChange={(e) => setShareFields({ ...shareFields, fullName: e.target.checked })}
                />
                Full Name & Headline
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shareFields.qualification}
                  onChange={(e) => setShareFields({ ...shareFields, qualification: e.target.checked })}
                />
                Degrees & B.Ed / TET
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shareFields.experienceYears}
                  onChange={(e) => setShareFields({ ...shareFields, experienceYears: e.target.checked })}
                />
                Teaching Experience
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shareFields.resumeUrl}
                  onChange={(e) => setShareFields({ ...shareFields, resumeUrl: e.target.checked })}
                />
                Vetted Resume Link
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer col-span-2">
                <input
                  type="checkbox"
                  checked={shareFields.contactInfo}
                  onChange={(e) => setShareFields({ ...shareFields, contactInfo: e.target.checked })}
                />
                Direct Candidate Contact (Phone & Email)
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-primary mb-1">Admin Authorization Note</label>
            <TextArea
              rows={2}
              placeholder="e.g. Recommended candidate for Senior Mathematics vacancy. Profile meets all CBSE criteria."
              value={shareAuthorizationNote}
              onChange={(e) => setShareAuthorizationNote(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareModalOpen(false)}
              disabled={sharingDossier}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleShareDossier}
              disabled={sharingDossier || !shareTargetSchoolId}
              className="bg-accent text-navy font-semibold hover:bg-accent/90"
            >
              {sharingDossier ? "Recording & Sharing..." : "Authorize & Log Share"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Status Confirmation Modal */}
      <Modal
        open={!!bulkAction}
        onClose={() => !processingBulk && setBulkAction(null)}
        title="Confirm Bulk Status Update"
        description="Apply a bulk hiring stage transition to all selected candidates."
      >
        {bulkAction ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-accent/40 bg-[#FAF5EB] p-3 text-xs text-[#8F7032]">
              You are updating <span className="font-bold">{selectedIds.length} candidate(s)</span> to{" "}
              <span className="font-bold capitalize">{bulkAction.replace(/_/g, " ")}</span>.
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
                Bulk Reason / Audit Note
              </label>
              <TextArea
                rows={2}
                placeholder="e.g. Batch evaluation completed, qualified for round 2..."
                value={bulkNote}
                onChange={(e) => setBulkNote(e.target.value)}
                disabled={processingBulk}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkAction(null)}
                disabled={processingBulk}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleApplyBulkStatus}
                disabled={processingBulk}
              >
                {processingBulk ? "Processing..." : `Confirm for ${selectedIds.length} Candidate(s)`}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </AdminPage>
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
