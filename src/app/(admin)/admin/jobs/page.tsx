"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Copy,
  Pencil,
  Pause,
  Play,
  XCircle,
  CalendarPlus,
  Users,
  Download,
  ExternalLink,
  Eye,
} from "lucide-react";
import { AdminPage, DataTable, Pager, Button, Input, StatusPill, Card, KpiCard } from "@/components/admin/ui";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api/client";
import { JobCard } from "@/components/public/job-card";
import { formatInrRange } from "@/lib/utils/format";
import type { Paged } from "@/types/admin";
import type { AdminJob, JobApplicantItem } from "@/server/services/admin/jobs";
import type { PublicJob } from "@/server/services/public";
import { ACTIVE_REGIONAL_DISTRICTS } from "@/data/india-locations";

const categories = [
  "PGT", "TGT", "PRT", "Pre-Primary / Nursery", "Principal / Vice-Principal",
  "Professor / Lecturer", "Special Educator", "Activity / Sports", "Other",
];

const boards = ["CBSE", "ICSE", "State Board", "IB", "Cambridge / IGCSE"];

const subjects = [
  "Mathematics", "Physics", "Chemistry", "Biology", "English", "Computer Science",
  "Social Science", "Hindi", "Commerce", "Economics", "Physical Education", "Art & Craft", "Music", "General",
];

export default function AdminJobsPage() {
  const { push } = useToast();

  // Filters & Pagination
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [board, setBoard] = React.useState("");
  const [filterDistrict, setFilterDistrict] = React.useState("");
  const [page, setPage] = React.useState(1);

  // Active Locations from Database
  const [activeLocations, setActiveLocations] = React.useState<
    Array<{ district: string; slug: string; isActive: boolean }>
  >([]);

  // Data
  const [data, setData] = React.useState<Paged<AdminJob> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Schools for dropdown
  const [schoolOptions, setSchoolOptions] = React.useState<
    Array<{ id: string; name: string; district?: string; city?: string; board?: string; verificationStatus?: string }>
  >([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = React.useState<string>("");
  const [isConfidential, setIsConfidential] = React.useState<boolean>(false);
  const [confidentialAlias, setConfidentialAlias] = React.useState<string>("");

  // Editor Modal State
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editorMode, setEditorMode] = React.useState<"create" | "edit">("create");
  const [editingJobId, setEditingJobId] = React.useState<string | null>(null);
  const [editorTab, setEditorTab] = React.useState<"form" | "preview">("form");
  const [saving, setSaving] = React.useState(false);

  // Form Fields
  const [title, setTitle] = React.useState("");
  const [schoolName, setSchoolName] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("PGT");
  const [selectedSubject, setSelectedSubject] = React.useState("Mathematics");
  const [selectedBoard, setSelectedBoard] = React.useState("CBSE");
  const [qualification, setQualification] = React.useState("M.Sc, B.Ed");
  const [trainingRequirements, setTrainingRequirements] = React.useState("B.Ed Required");
  const [ctetRequired, setCtetRequired] = React.useState("CTET Paper 2 Required");
  const [minExp, setMinExp] = React.useState<number>(2);
  const [maxExp, setMaxExp] = React.useState<number>(6);
  const [city, setCity] = React.useState("Prayagraj");
  const [district, setDistrict] = React.useState("Prayagraj");
  const [state, setState] = React.useState("Uttar Pradesh");
  const [locality, setLocality] = React.useState("");
  const [salaryMin, setSalaryMin] = React.useState<number>(45000);
  const [salaryMax, setSalaryMax] = React.useState<number>(65000);
  const [salaryPeriod, setSalaryPeriod] = React.useState<"monthly" | "yearly">("monthly");
  const [vacanciesCount, setVacanciesCount] = React.useState<number>(1);
  const [employmentType, setEmploymentType] = React.useState("Full-time");
  const [applicationDeadline, setApplicationDeadline] = React.useState("");
  const [interviewMode, setInterviewMode] = React.useState("Online");
  const [description, setDescription] = React.useState("");
  const [responsibilitiesText, setResponsibilitiesText] = React.useState("");
  const [requirementsText, setRequirementsText] = React.useState("");
  const [targetStatus, setTargetStatus] = React.useState<"draft" | "published">("published");

  // Extend Deadline Modal State
  const [extendModalOpen, setExtendModalOpen] = React.useState(false);
  const [extendJobId, setExtendJobId] = React.useState<string | null>(null);
  const [newDeadline, setNewDeadline] = React.useState("");
  const [extending, setExtending] = React.useState(false);

  // View Applicants Modal State
  const [applicantsModalOpen, setApplicantsModalOpen] = React.useState(false);
  const [viewingJob, setViewingJob] = React.useState<AdminJob | null>(null);
  const [applicants, setApplicants] = React.useState<JobApplicantItem[]>([]);
  const [loadingApplicants, setLoadingApplicants] = React.useState(false);

  // Load jobs list
  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "20");
    if (q.trim()) params.set("q", q.trim());
    if (status) params.set("status", status);
    if (category) params.set("category", category);
    if (board) params.set("board", board);
    if (filterDistrict) params.set("district", filterDistrict);

    const res = await apiFetch<Paged<AdminJob>>(`/api/admin/jobs?${params.toString()}`);
    if (!res.ok) setError(res.error.message);
    else setData(res.data);
    setLoading(false);
  }, [page, q, status, category, board, filterDistrict]);

  React.useEffect(() => {
    load();
  }, [load]);

  // Load schools and active locations once
  React.useEffect(() => {
    apiFetch<{ items: Array<{ id: string; name: string; district?: string; city?: string; board?: string; verificationStatus?: string }> }>(
      "/api/admin/schools?limit=100",
    ).then((res) => {
      if (res.ok && res.data?.items) {
        setSchoolOptions(res.data.items);
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const sId = params.get("schoolId");
          if (sId) {
            const found = res.data.items.find((x) => x.id === sId);
            if (found) {
              openCreateForm(sId, found);
            }
          }
        }
      }
    });
    apiFetch<{ items: Array<{ district: string; slug: string; isActive: boolean }> }>("/api/public/locations").then((res) => {
      if (res.ok && res.data?.items) {
        setActiveLocations(res.data.items);
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Open Create Form
  function openCreateForm(preSelectedSchoolId?: string, preLoadedSchool?: { id: string; name: string; district?: string; city?: string; board?: string }) {
    setEditorMode("create");
    setEditingJobId(null);
    setTitle("");
    const targetSchool = preLoadedSchool || (preSelectedSchoolId
      ? schoolOptions.find((s) => s.id === preSelectedSchoolId)
      : schoolOptions[0]);

    setSelectedInstitutionId(targetSchool?.id || "");
    setSchoolName(targetSchool?.name || "Delhi Public School");
    setIsConfidential(false);
    setConfidentialAlias("");
    setSelectedCategory("PGT");
    setSelectedSubject("Mathematics");
    setSelectedBoard(targetSchool?.board || "CBSE");
    setQualification("M.Sc, B.Ed");
    setTrainingRequirements("B.Ed Required");
    setCtetRequired("CTET Paper 2 Required");
    setMinExp(2);
    setMaxExp(6);
    const targetDist = targetSchool?.district || activeLocations[0]?.district || "Prayagraj";
    setDistrict(targetDist);
    setCity(targetSchool?.city || targetDist);
    setState("Uttar Pradesh");
    setLocality("");
    setSalaryMin(45000);
    setSalaryMax(65000);
    setSalaryPeriod("monthly");
    setVacanciesCount(1);
    setEmploymentType("Full-time");
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setApplicationDeadline(d.toISOString().slice(0, 10));
    setInterviewMode("Online");
    setDescription("We are seeking an enthusiastic, qualified educator to inspire high school students and deliver exceptional curriculum outcomes.");
    setResponsibilitiesText("Deliver structured classroom instruction in accordance with the curriculum syllabus.\nAssess and document student academic progress and conduct regular parent-teacher interactions.\nParticipate actively in departmental academic planning and school co-curricular activities.");
    setRequirementsText("Master's degree in the subject with recognized B.Ed from NCTE.\nMinimum 2 years teaching experience in senior secondary classes.\nExcellent English communication skills and familiarity with digital classroom tools.");
    setTargetStatus("published");
    setEditorTab("form");
    setEditorOpen(true);
  }

  // Open Edit Form
  function openEditForm(job: AdminJob) {
    setEditorMode("edit");
    setEditingJobId(job.id);
    setTitle(job.title);
    setSchoolName(job.schoolName);
    setSelectedInstitutionId(job.institutionId || "");
    setIsConfidential(false);
    setConfidentialAlias("");
    setSelectedCategory(job.category || "PGT");
    setSelectedSubject(job.subject || "Mathematics");
    setSelectedBoard(job.board || "CBSE");
    setQualification(job.qualification || "");
    setTrainingRequirements(job.trainingRequirements || "");
    setCtetRequired(job.ctetRequired || "");
    setMinExp(job.minExperience ?? 0);
    setMaxExp(job.maxExperience ?? 5);
    setCity(job.city || "");
    setDistrict(job.district || "Prayagraj");
    setState(job.state || "Uttar Pradesh");
    setLocality("");
    setSalaryMin(job.salaryMinInr ?? 35000);
    setSalaryMax(job.salaryMaxInr ?? 55000);
    setSalaryPeriod((job.salaryPeriod as "monthly" | "yearly") || "monthly");
    setVacanciesCount(job.vacanciesCount || 1);
    setEmploymentType(job.employmentType || "Full-time");
    setApplicationDeadline(job.applicationDeadline ? job.applicationDeadline.slice(0, 10) : "");
    setInterviewMode(job.interviewMode || "Online");
    setDescription(job.description || "");
    setResponsibilitiesText((job.responsibilities || []).join("\n"));
    setRequirementsText((job.requirements || []).join("\n"));
    setTargetStatus(job.status === "published" ? "published" : "draft");
    setEditorTab("form");
    setEditorOpen(true);
  }

  // Submit Job Save (Create or Update)
  async function handleSaveJob(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !schoolName.trim()) {
      push({ tone: "error", title: "Validation Error", message: "Job title and school name are required." });
      return;
    }
    setSaving(true);
    const responsibilities = responsibilitiesText.split("\n").map((s) => s.trim()).filter(Boolean);
    const requirements = requirementsText.split("\n").map((s) => s.trim()).filter(Boolean);

    const publicDisplayName = isConfidential && confidentialAlias.trim()
      ? confidentialAlias.trim()
      : schoolName.trim();

    const payload = {
      title: title.trim(),
      schoolName: publicDisplayName,
      institutionId: selectedInstitutionId || undefined,
      category: selectedCategory,
      subject: selectedSubject,
      board: selectedBoard,
      qualification: qualification.trim(),
      trainingRequirements: trainingRequirements.trim(),
      ctetRequired: ctetRequired.trim(),
      minExperience: Number(minExp) || 0,
      maxExperience: Number(maxExp) || undefined,
      city: city.trim(),
      district: district.trim(),
      state: state.trim() || "Uttar Pradesh",
      locality: locality.trim() || undefined,
      salaryMinInr: Number(salaryMin) || undefined,
      salaryMaxInr: Number(salaryMax) || undefined,
      salaryPeriod,
      vacanciesCount: Number(vacanciesCount) || 1,
      employmentType,
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline).toISOString() : undefined,
      interviewMode,
      description: description.trim(),
      responsibilities,
      requirements,
      status: targetStatus,
    };

    try {
      if (editorMode === "create") {
        const res = await apiFetch<{ id: string }>("/api/admin/jobs", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(res.error.message);
        push({ tone: "success", title: "Vacancy Created", message: `"${title}" has been saved with status: ${targetStatus}.` });
      } else {
        const res = await apiFetch(`/api/admin/jobs/${editingJobId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(res.error.message);
        push({ tone: "success", title: "Vacancy Updated", message: `Changes saved for "${title}".` });
      }
      setEditorOpen(false);
      load();
    } catch (err) {
      push({ tone: "error", title: "Operation Failed", message: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  // Duplicate Job
  async function handleDuplicate(job: AdminJob) {
    const res = await apiFetch<{ id: string }>(`/api/admin/jobs/${job.id}/duplicate`, { method: "POST" });
    if (res.ok) {
      push({ tone: "success", title: "Job Duplicated", message: `Created draft copy of "${job.title}".` });
      load();
    } else {
      push({ tone: "error", title: "Duplicate Failed", message: res.error.message });
    }
  }

  // Status Change (Publish / Unpublish / Pause / Close)
  async function handleStatusChange(id: string, newStatus: string) {
    const res = await apiFetch(`/api/admin/jobs/${id}/status`, {
      method: "POST",
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      push({ tone: "success", title: "Status Updated", message: `Vacancy status changed to "${newStatus}".` });
      load();
    } else {
      push({ tone: "error", title: "Update Failed", message: res.error.message });
    }
  }

  // Open Extend Deadline Modal
  function openExtendDeadline(job: AdminJob) {
    setExtendJobId(job.id);
    const curr = job.applicationDeadline ? job.applicationDeadline.slice(0, 10) : "";
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 15);
    setNewDeadline(curr || nextDate.toISOString().slice(0, 10));
    setExtendModalOpen(true);
  }

  // Submit Extend Deadline
  async function submitExtendDeadline(e: React.FormEvent) {
    e.preventDefault();
    if (!newDeadline || !extendJobId) return;
    setExtending(true);
    const res = await apiFetch(`/api/admin/jobs/${extendJobId}/extend-deadline`, {
      method: "POST",
      body: JSON.stringify({ deadline: new Date(newDeadline).toISOString() }),
    });
    setExtending(false);
    if (res.ok) {
      push({ tone: "success", title: "Deadline Extended", message: `Application deadline updated to ${newDeadline}.` });
      setExtendModalOpen(false);
      load();
    } else {
      push({ tone: "error", title: "Extension Failed", message: res.error.message });
    }
  }

  // View Applicants
  async function openApplicants(job: AdminJob) {
    setViewingJob(job);
    setApplicantsModalOpen(true);
    setLoadingApplicants(true);
    const res = await apiFetch<{ items: JobApplicantItem[] }>(`/api/admin/jobs/${job.id}/applicants`);
    if (res.ok) {
      setApplicants(res.data.items);
    } else {
      push({ tone: "error", title: "Failed to Load Applicants", message: res.error.message });
    }
    setLoadingApplicants(false);
  }

  // Export Applicants CSV
  function downloadApplicantsCsv(jobId: string) {
    window.open(`/api/admin/jobs/${jobId}/applicants/export`, "_blank");
  }

  // Generate live preview object from form state
  const livePreviewJob: PublicJob = {
    id: editingJobId || "preview",
    title: title || "Senior PGT Mathematics Educator",
    schoolName: schoolName || "Delhi Public School",
    location: { city: city || "New Delhi", state: state || "Delhi", district: district || undefined },
    subject: selectedSubject,
    category: selectedCategory,
    board: selectedBoard,
    qualification: qualification || "Master's with B.Ed",
    trainingRequirements,
    ctetRequired,
    minExperience: minExp,
    maxExperience: maxExp,
    experience: maxExp ? `${minExp} - ${maxExp} Years` : `${minExp}+ Years`,
    salaryMinInr: salaryMin,
    salaryMaxInr: salaryMax,
    salaryPeriod,
    vacanciesCount,
    employmentType,
    applicationDeadline: applicationDeadline ? new Date(applicationDeadline).toISOString() : undefined,
    interviewMode,
    status: targetStatus,
    isExpired: false,
    description,
    responsibilities: responsibilitiesText.split("\n").map((s) => s.trim()).filter(Boolean),
    requirements: requirementsText.split("\n").map((s) => s.trim()).filter(Boolean),
    publishedAt: new Date().toISOString(),
  };

  // Summary counts
  const totalCount = data?.page.total || 0;
  const publishedCount = data?.items.filter((j) => j.status === "published").length || 0;
  const draftCount = data?.items.filter((j) => j.status === "draft" || j.status === "paused").length || 0;
  const totalApplicants = data?.items.reduce((acc, j) => acc + (j.applicantsCount || 0), 0) || 0;

  return (
    <AdminPage
      title="Job Vacancy Management"
      subtitle="Create, publish, pause, duplicate, and monitor institutional teaching openings across Uttar Pradesh districts."
      actions={
        <Button onClick={() => openCreateForm()} className="flex items-center gap-1.5 shadow-sm">
          <Plus className="size-4" aria-hidden />
          <span>Post New Vacancy</span>
        </Button>
      }
    >
      {/* KPI Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Registered Vacancies" value={totalCount} />
        <KpiCard label="Published & Active Openings" value={publishedCount} />
        <KpiCard label="Drafts & In-Review" value={draftCount} />
        <KpiCard label="Candidate Applications Received" value={totalApplicants} />
      </div>

      {/* Filter Bar Card */}
      <Card className="border border-border p-4 shadow-xs">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-secondary-text" aria-hidden />
            <Input
              placeholder="Search by title, school, subject, or location..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>

          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-primary focus:border-secondary focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
              <option value="expired">Expired</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-primary focus:border-secondary focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterDistrict}
              onChange={(e) => {
                setFilterDistrict(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-primary focus:border-secondary focus:outline-none"
            >
              <option value="">All Service Districts</option>
              {(activeLocations.length
                ? activeLocations.map((l) => l.district)
                : [...ACTIVE_REGIONAL_DISTRICTS]
              ).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setQ("");
                setStatus("");
                setCategory("");
                setBoard("");
                setFilterDistrict("");
                setPage(1);
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Jobs Data Table */}
      <DataTable<AdminJob>
        loading={loading}
        error={error}
        onRetry={load}
        rows={data?.items || []}
        rowKey={(r) => r.id}
        emptyTitle="No job vacancies found"
        emptyDesc="Create a new vacancy or adjust search filters to view institutional postings."
        cols={[
          {
            key: "title",
            label: "Position & School",
            render: (r) => (
              <div className="max-w-[260px]">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-primary truncate">{r.title}</span>
                  <Link
                    href={`/jobs/${r.id}`}
                    target="_blank"
                    title="View Public Page"
                    className="text-secondary-text hover:text-secondary"
                  >
                    <ExternalLink className="size-3.5" aria-hidden />
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-secondary-text font-medium">{r.schoolName}</span>
                  <span className="inline-flex items-center rounded-sm bg-[#FAF5EB] px-1.5 py-0.2 text-[10px] font-bold uppercase text-[#8F7032]">
                    {r.category}
                  </span>
                  {r.board ? (
                    <span className="text-[10px] font-semibold text-secondary-text">· {r.board}</span>
                  ) : null}
                </div>
              </div>
            ),
          },
          {
            key: "meta",
            label: "Subject & Location",
            render: (r) => (
              <div>
                <span className="text-xs font-semibold text-primary">{r.subject}</span>
                <span className="block text-xs text-secondary-text">
                  {[r.district, r.city, r.state].filter(Boolean).join(", ") || "Uttar Pradesh"}
                </span>
              </div>
            ),
          },
          {
            key: "remuneration",
            label: "Remuneration & Openings",
            render: (r) => {
              const sal = formatInrRange(r.salaryMinInr, r.salaryMaxInr);
              return (
                <div>
                  <span className="text-xs font-bold text-primary">
                    {sal ? `${sal} ${r.salaryPeriod === "yearly" ? "/ yr" : "/ mo"}` : "As per Norms"}
                  </span>
                  <span className="block text-[11px] text-secondary-text">
                    {r.vacanciesCount} Vacanc{r.vacanciesCount === 1 ? "y" : "ies"} · {r.employmentType}
                  </span>
                </div>
              );
            },
          },
          {
            key: "deadline",
            label: "Deadline",
            render: (r) => {
              if (!r.applicationDeadline) return <span className="text-xs text-secondary-text">Rolling</span>;
              const d = new Date(r.applicationDeadline);
              const isPast = d.getTime() < Date.now();
              return (
                <div className="text-xs">
                  <span className={isPast ? "text-red-600 font-bold" : "text-primary font-medium"}>
                    {d.toLocaleDateString("en-IN")}
                  </span>
                  {isPast ? <span className="block text-[10px] text-red-500 font-semibold">Expired</span> : null}
                </div>
              );
            },
          },
          {
            key: "applicants",
            label: "Applicants",
            render: (r) => (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openApplicants(r)}
                  className="inline-flex items-center gap-1 rounded-lg bg-soft-blue px-2.5 py-1 text-xs font-bold text-primary border border-[#D5DFEB] hover:bg-soft-blue/80"
                >
                  <Users className="size-3.5 text-secondary" aria-hidden />
                  <span>{r.applicantsCount || 0}</span>
                </button>
                {r.applicantsCount ? (
                  <button
                    type="button"
                    onClick={() => downloadApplicantsCsv(r.id)}
                    title="Export Applicants CSV"
                    className="p-1 text-secondary-text hover:text-primary rounded-md hover:bg-soft-blue/50"
                  >
                    <Download className="size-3.5" aria-hidden />
                  </button>
                ) : null}
              </div>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (r) => <StatusPill status={r.status} />,
          },
          {
            key: "actions",
            label: "Actions",
            render: (r) => (
              <div className="flex items-center gap-1">
                {/* Edit */}
                <button
                  type="button"
                  onClick={() => openEditForm(r)}
                  title="Edit Vacancy"
                  className="rounded-lg p-1.5 text-secondary-text hover:bg-soft-blue hover:text-primary transition-colors"
                >
                  <Pencil className="size-3.5" aria-hidden />
                </button>

                {/* Duplicate */}
                <button
                  type="button"
                  onClick={() => handleDuplicate(r)}
                  title="Duplicate as Draft"
                  className="rounded-lg p-1.5 text-secondary-text hover:bg-soft-blue hover:text-primary transition-colors"
                >
                  <Copy className="size-3.5" aria-hidden />
                </button>

                {/* Publish / Unpublish Toggle */}
                {r.status === "published" ? (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(r.id, "draft")}
                    title="Unpublish (Convert to Draft)"
                    className="rounded-lg p-1.5 text-secondary-text hover:bg-amber-50 hover:text-amber-700 transition-colors"
                  >
                    <Eye className="size-3.5" aria-hidden />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(r.id, "published")}
                    title="Publish Immediately"
                    className="rounded-lg p-1.5 text-secondary-text hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                  >
                    <Play className="size-3.5" aria-hidden />
                  </button>
                )}

                {/* Pause / Resume */}
                {r.status === "paused" ? (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(r.id, "published")}
                    title="Resume Intake"
                    className="rounded-lg p-1.5 text-amber-700 hover:bg-amber-100 transition-colors"
                  >
                    <Play className="size-3.5" aria-hidden />
                  </button>
                ) : r.status === "published" ? (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(r.id, "paused")}
                    title="Pause Applications"
                    className="rounded-lg p-1.5 text-secondary-text hover:bg-amber-50 hover:text-amber-700 transition-colors"
                  >
                    <Pause className="size-3.5" aria-hidden />
                  </button>
                ) : null}

                {/* Extend Deadline */}
                <button
                  type="button"
                  onClick={() => openExtendDeadline(r)}
                  title="Extend Application Deadline"
                  className="rounded-lg p-1.5 text-secondary-text hover:bg-soft-blue hover:text-primary transition-colors"
                >
                  <CalendarPlus className="size-3.5" aria-hidden />
                </button>

                {/* Close Vacancy */}
                {r.status !== "closed" ? (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(r.id, "closed")}
                    title="Close Vacancy"
                    className="rounded-lg p-1.5 text-secondary-text hover:bg-red-50 hover:text-red-700 transition-colors"
                  >
                    <XCircle className="size-3.5" aria-hidden />
                  </button>
                ) : null}
              </div>
            ),
          },
        ]}
      />

      {data ? <Pager page={data.page.page} totalPages={data.page.totalPages} onPage={setPage} /> : null}

      {/* Glossy Vacancy Creation & Editing Modal with Live Preview Tab */}
      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editorMode === "create" ? "Create Institutional Job Vacancy" : `Edit Vacancy: ${title}`}
        size="3xl"
      >
        <div className="space-y-4">
          {/* Tab Selector: Form Editor vs Live Preview */}
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditorTab("form")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  editorTab === "form" ? "bg-primary text-white" : "bg-soft-blue text-primary hover:bg-soft-blue/80"
                }`}
              >
                Form Editor
              </button>
              <button
                type="button"
                onClick={() => setEditorTab("preview")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  editorTab === "preview" ? "bg-primary text-white" : "bg-soft-blue text-primary hover:bg-soft-blue/80"
                }`}
              >
                <Eye className="size-3.5" aria-hidden />
                <span>Live Preview</span>
              </button>
            </div>
            <span className="text-xs text-secondary-text font-medium">
              Mode: <span className="font-bold uppercase text-primary">{editorMode}</span>
            </span>
          </div>

          {editorTab === "form" ? (
            <form onSubmit={handleSaveJob} className="space-y-4 max-h-[72dvh] overflow-y-auto pr-1">
              {/* Basic Position Details */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Vacancy / Position Title"
                  placeholder="e.g. Senior PGT Mathematics"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-primary mb-1">Partner School / Institution (CRM)</label>
                  <select
                    value={selectedInstitutionId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedInstitutionId(id);
                      const matched = schoolOptions.find((s) => s.id === id);
                      if (matched) {
                        setSchoolName(matched.name);
                        if (matched.board) setSelectedBoard(matched.board);
                        if (matched.district) {
                          setDistrict(matched.district);
                          setCity(matched.city || matched.district);
                        }
                      }
                    }}
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-primary focus:border-secondary focus:outline-none truncate"
                  >
                    <option value="">-- Select Verified School from CRM --</option>
                    {schoolOptions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({[s.district, s.board].filter(Boolean).join(" • ")})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-2 rounded-xl border border-border/80 bg-surface-raised p-3">
                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1">Official School Name</label>
                    <Input
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="e.g. Saint Joseph's College"
                      required
                    />
                  </div>

                  <label className="flex items-center gap-2 pt-1 text-xs text-secondary-text cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isConfidential}
                      onChange={(e) => {
                        setIsConfidential(e.target.checked);
                        if (e.target.checked && !confidentialAlias) {
                          setConfidentialAlias(`Premier ${selectedBoard} Senior Secondary School, ${district}`);
                        }
                      }}
                    />
                    <span className="font-medium text-navy">
                      Confidential Listing (Hide school name from public job seekers)
                    </span>
                  </label>

                  {isConfidential && (
                    <Input
                      label="Candidate-Facing Generic Alias"
                      placeholder={`e.g. Premier ${selectedBoard} Senior Secondary School, ${district}`}
                      value={confidentialAlias}
                      onChange={(e) => setConfidentialAlias(e.target.value)}
                      hint="Public candidates see this alias; administrators retain full school CRM link."
                    />
                  )}
                </div>
              </div>

              {/* Categorization & Affiliation */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-primary mb-1">Job Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-primary focus:border-secondary focus:outline-none truncate"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-primary mb-1">Subject Specialization</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-primary focus:border-secondary focus:outline-none truncate"
                  >
                    {subjects.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-primary mb-1">School Board</label>
                  <select
                    value={selectedBoard}
                    onChange={(e) => setSelectedBoard(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-primary focus:border-secondary focus:outline-none truncate"
                  >
                    {boards.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Qualifications & Mandatory Criteria */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Input
                  label="Required Academic Degree"
                  placeholder="e.g. M.Sc, M.Ed"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  required
                />
                <Input
                  label="Teacher Training (B.Ed/NTT)"
                  placeholder="e.g. B.Ed Required"
                  value={trainingRequirements}
                  onChange={(e) => setTrainingRequirements(e.target.value)}
                />
                <Input
                  label="CTET / TET Criteria"
                  placeholder="e.g. CTET Paper 2 Required"
                  value={ctetRequired}
                  onChange={(e) => setCtetRequired(e.target.value)}
                />
              </div>

              {/* Experience Range & Openings */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Input
                  label="Min Exp (Yrs)"
                  type="number"
                  min="0"
                  value={String(minExp)}
                  onChange={(e) => setMinExp(Number(e.target.value))}
                  required
                />
                <Input
                  label="Max Exp (Yrs)"
                  type="number"
                  min="0"
                  value={String(maxExp)}
                  onChange={(e) => setMaxExp(Number(e.target.value))}
                />
                <Input
                  label="Vacancies"
                  type="number"
                  min="1"
                  value={String(vacanciesCount)}
                  onChange={(e) => setVacanciesCount(Number(e.target.value))}
                  required
                />
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-primary mb-1">Employment Type</label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-primary focus:border-secondary focus:outline-none truncate"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contractual">Contractual</option>
                    <option value="Visiting">Visiting</option>
                  </select>
                </div>
              </div>

              {/* Location Fields */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">State *</label>
                  <input
                    type="text"
                    readOnly
                    value="Uttar Pradesh"
                    className="w-full rounded-xl border border-border bg-[#F5F2EB] px-3 py-2 text-sm font-medium text-primary cursor-not-allowed"
                  />
                </div>
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-primary mb-1">District *</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-primary focus:border-secondary focus:outline-none truncate"
                    required
                  >
                    <option value="">Select Active District</option>
                    {(activeLocations.length
                      ? activeLocations.filter((l) => l.isActive).map((l) => l.district)
                      : [...ACTIVE_REGIONAL_DISTRICTS]
                    ).map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="City / Town *"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Civil Lines, Gomti Nagar"
                  required
                />
                <Input
                  label="Locality (Optional)"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="e.g. Near Anand Bhawan"
                />
              </div>

              {/* Remuneration & Deadline */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Input
                  label="Min Salary (INR)"
                  type="number"
                  min="0"
                  value={String(salaryMin)}
                  onChange={(e) => setSalaryMin(Number(e.target.value))}
                />
                <Input
                  label="Max Salary (INR)"
                  type="number"
                  min="0"
                  value={String(salaryMax)}
                  onChange={(e) => setSalaryMax(Number(e.target.value))}
                />
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-primary mb-1">Salary Frequency</label>
                  <select
                    value={salaryPeriod}
                    onChange={(e) => setSalaryPeriod(e.target.value as "monthly" | "yearly")}
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-primary focus:border-secondary focus:outline-none truncate"
                  >
                    <option value="monthly">Monthly (₹ / mo)</option>
                    <option value="yearly">Yearly (₹ / yr)</option>
                  </select>
                </div>
                <Input
                  label="Deadline"
                  type="date"
                  value={applicationDeadline}
                  onChange={(e) => setApplicationDeadline(e.target.value)}
                />
              </div>

              {/* Interview Mode & Description */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-primary mb-1">Interview Mode</label>
                  <select
                    value={interviewMode}
                    onChange={(e) => setInterviewMode(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-primary focus:border-secondary focus:outline-none truncate"
                  >
                    <option value="Online">Online Video Evaluation</option>
                    <option value="In-person">In-Person Campus Demo</option>
                    <option value="Hybrid">Hybrid (Online + Demo)</option>
                  </select>
                </div>
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-primary mb-1">Publication Status</label>
                  <select
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value as "draft" | "published")}
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-primary focus:border-secondary focus:outline-none truncate"
                  >
                    <option value="published">Publish Immediately (Public)</option>
                    <option value="draft">Save as Draft (Private)</option>
                  </select>
                </div>
              </div>

              <Textarea
                label="Role Overview & Institutional Context"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the department, classroom culture, and expectations..."
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Textarea
                  label="Key Responsibilities (1 item per line)"
                  rows={3}
                  value={responsibilitiesText}
                  onChange={(e) => setResponsibilitiesText(e.target.value)}
                  placeholder="Lesson planning&#10;Conduct assessments&#10;Parent interaction"
                />
                <Textarea
                  label="Candidate Requirements (1 item per line)"
                  rows={3}
                  value={requirementsText}
                  onChange={(e) => setRequirementsText(e.target.value)}
                  placeholder="Master's in Mathematics&#10;B.Ed certified&#10;2+ years experience"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-border">
                <Button variant="secondary" type="button" onClick={() => setEditorOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="bg-primary hover:bg-secondary text-white font-medium">
                  {saving ? "Saving Vacancy…" : editorMode === "create" ? "Save & Create Vacancy" : "Save Changes"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 max-h-[72dvh] overflow-y-auto pr-1">
              <div className="rounded-xl border border-border bg-[#FAF9F5] p-3 text-xs text-secondary-text">
                This live preview reflects how candidate educators will view this vacancy on the public portal and mobile interfaces.
              </div>
              <div className="max-w-md mx-auto">
                <JobCard job={livePreviewJob} />
              </div>
              <div className="flex justify-end pt-3 border-t border-border">
                <Button variant="secondary" type="button" onClick={() => setEditorTab("form")}>
                  Return to Form Editor
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Extend Deadline Modal */}
      <Modal open={extendModalOpen} onClose={() => setExtendModalOpen(false)} title="Extend Application Deadline">
        <form onSubmit={submitExtendDeadline} className="space-y-4 pt-2">
          <p className="text-xs text-secondary-text">
            Selecting a future deadline will automatically reactivate the vacancy if it was previously marked as expired.
          </p>
          <Input
            label="New Application Deadline Date"
            type="date"
            value={newDeadline}
            onChange={(e) => setNewDeadline(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setExtendModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={extending || !newDeadline}>
              {extending ? "Extending…" : "Confirm New Deadline"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Applicants Modal */}
      <Modal
        open={applicantsModalOpen}
        onClose={() => setApplicantsModalOpen(false)}
        title={viewingJob ? `Applicants: ${viewingJob.title}` : "Candidate Applicants"}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-xs font-medium text-secondary-text">
              Total Dossiers Received: <span className="font-bold text-primary">{applicants.length}</span>
            </span>
            {viewingJob && applicants.length ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadApplicantsCsv(viewingJob.id)}
                className="flex items-center gap-1.5 text-xs"
              >
                <Download className="size-3.5 text-secondary" aria-hidden />
                <span>Export to CSV</span>
              </Button>
            ) : null}
          </div>

          {loadingApplicants ? (
            <div className="py-8 text-center text-sm text-secondary-text">Loading candidate records…</div>
          ) : !applicants.length ? (
            <div className="py-8 text-center text-sm text-secondary-text">
              No candidate educators have applied for this vacancy yet.
            </div>
          ) : (
            <div className="max-h-[60dvh] overflow-y-auto space-y-3 pr-1">
              {applicants.map((a) => (
                <div key={a.id} className="rounded-xl border border-border bg-[#FAF9F5] p-3.5 shadow-xs space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-primary text-sm">{a.fullName}</span>
                      <span className="block text-xs text-secondary-text">
                        {[a.city, a.state].filter(Boolean).join(", ") || "Location unassigned"}
                      </span>
                    </div>
                    <StatusPill status={a.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-secondary-text pt-1">
                    {a.highestQualification ? (
                      <span className="rounded-md bg-white border border-border px-2 py-0.5 font-medium text-primary">
                        {a.highestQualification}
                      </span>
                    ) : null}
                    {a.hasBed ? (
                      <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-bold text-emerald-800">
                        B.Ed Verified
                      </span>
                    ) : null}
                    {a.ctetDetails ? (
                      <span className="rounded-md bg-soft-blue border border-[#D5DFEB] px-2 py-0.5 font-bold text-primary">
                        {a.ctetDetails}
                      </span>
                    ) : null}
                    <span className="font-medium text-primary">
                      Experience: {a.totalYearsExperience ?? 0} Yrs
                    </span>
                    <span className="text-secondary-text">
                      · Applied: {new Date(a.appliedAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>

                  {a.coverNote ? (
                    <div className="rounded-lg bg-white border border-border/80 p-2.5 text-xs text-main-text italic">
                      &ldquo;{a.coverNote}&rdquo;
                    </div>
                  ) : null}

                  <div className="flex items-center gap-3 text-xs text-secondary-text pt-1 border-t border-border/60">
                    {a.email ? <span>Email: <strong className="text-primary">{a.email}</strong></span> : null}
                    {a.mobile ? <span>Phone: <strong className="text-primary">{a.mobile}</strong></span> : null}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setApplicantsModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </AdminPage>
  );
}
