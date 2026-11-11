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
import type { AdminPlacement, PlacementStats } from "@/server/services/admin/placements";
import {
  Plus,
  Search,
  CheckCircle2,
  Building2,
  IndianRupee,
  TrendingUp,
} from "lucide-react";

const PLACEMENT_STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "offered", label: "Offer Extended" },
  { value: "offer_accepted", label: "Offer Accepted" },
  { value: "joined", label: "Formally Joined" },
  { value: "declined", label: "Offer Declined" },
  { value: "deferred", label: "Joining Deferred" },
  { value: "backed_out", label: "Backed Out" },
];

export default function AdminPlacementsPage() {
  const [page, setPage] = React.useState(1);
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [data, setData] = React.useState<(Paged<AdminPlacement> & { stats: PlacementStats }) | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Modals
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [updateModalOpen, setUpdateModalOpen] = React.useState(false);
  const [activePlacement, setActivePlacement] = React.useState<AdminPlacement | null>(null);

  // Create Form State
  const [newTeacherId, setNewTeacherId] = React.useState("");
  const [newTeacherName, setNewTeacherName] = React.useState("");
  const [newEmail, setNewEmail] = React.useState("");
  const [newMobile, setNewMobile] = React.useState("");
  const [newJobId, setNewJobId] = React.useState("");
  const [newJobTitle, setNewJobTitle] = React.useState("");
  const [newSchoolName, setNewSchoolName] = React.useState("");
  const [newJoiningDate, setNewJoiningDate] = React.useState("");
  const [newSalary, setNewSalary] = React.useState("");
  const [newStatus, setNewStatus] = React.useState<AdminPlacement["status"]>("offered");
  const [newNotes, setNewNotes] = React.useState("");
  const [submittingCreate, setSubmittingCreate] = React.useState(false);

  // Update Status Form State
  const [upStatus, setUpStatus] = React.useState<AdminPlacement["status"]>("joined");
  const [upActualJoiningDate, setUpActualJoiningDate] = React.useState("");
  const [upSalary, setUpSalary] = React.useState("");
  const [upRemarks, setUpRemarks] = React.useState("");
  const [upNotes, setUpNotes] = React.useState("");
  const [submittingUpdate, setSubmittingUpdate] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const sp = new URLSearchParams();
    sp.set("page", String(page));
    sp.set("limit", "15");
    if (q.trim()) sp.set("q", q.trim());
    if (status) sp.set("status", status);

    const res = await apiFetch<Paged<AdminPlacement> & { stats: PlacementStats }>(
      `/api/admin/placements?${sp.toString()}`,
    );
    if (!res.ok) {
      setError(res.error.message);
    } else {
      setData(res.data);
    }
    setLoading(false);
  }, [page, q, status]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherId.trim() || !newTeacherName.trim() || !newJobTitle.trim() || !newSchoolName.trim() || !newJoiningDate) {
      return;
    }
    setSubmittingCreate(true);
    const res = await apiFetch("/api/admin/placements", {
      method: "POST",
      body: JSON.stringify({
        teacherUserId: newTeacherId.trim(),
        teacherName: newTeacherName.trim(),
        candidateEmail: newEmail.trim() || undefined,
        candidateMobile: newMobile.trim() || undefined,
        jobId: newJobId.trim() || "000000000000000000000000",
        jobTitle: newJobTitle.trim(),
        schoolName: newSchoolName.trim(),
        joiningDate: new Date(newJoiningDate).toISOString(),
        salaryOfferedInr: newSalary ? Number(newSalary) : undefined,
        status: newStatus,
        adminNotes: newNotes.trim() || undefined,
      }),
    });
    setSubmittingCreate(false);
    if (res.ok) {
      setCreateModalOpen(false);
      resetCreateForm();
      load();
    }
  };

  const resetCreateForm = () => {
    setNewTeacherId("");
    setNewTeacherName("");
    setNewEmail("");
    setNewMobile("");
    setNewJobId("");
    setNewJobTitle("");
    setNewSchoolName("");
    setNewJoiningDate("");
    setNewSalary("");
    setNewStatus("offered");
    setNewNotes("");
  };

  const handleOpenUpdate = (p: AdminPlacement) => {
    setActivePlacement(p);
    setUpStatus(p.status === "offered" ? "offer_accepted" : p.status === "offer_accepted" ? "joined" : p.status);
    setUpActualJoiningDate(p.actualJoiningDate ? p.actualJoiningDate.slice(0, 10) : new Date().toISOString().slice(0, 10));
    setUpSalary(p.salaryOfferedInr ? String(p.salaryOfferedInr) : "");
    setUpRemarks(p.joiningStatusRemarks || "");
    setUpNotes(p.adminNotes || "");
    setUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlacement) return;
    setSubmittingUpdate(true);
    const res = await apiFetch("/api/admin/placements", {
      method: "PATCH",
      body: JSON.stringify({
        id: activePlacement.id,
        status: upStatus,
        actualJoiningDate: upStatus === "joined" && upActualJoiningDate ? new Date(upActualJoiningDate).toISOString() : undefined,
        salaryOfferedInr: upSalary ? Number(upSalary) : undefined,
        joiningStatusRemarks: upRemarks.trim() || undefined,
        adminNotes: upNotes.trim() || undefined,
      }),
    });
    setSubmittingUpdate(false);
    if (res.ok) {
      setUpdateModalOpen(false);
      load();
    }
  };

  const stats = data?.stats || {
    total: 0,
    offered: 0,
    accepted: 0,
    joined: 0,
    declined: 0,
    placementRate: 0,
    averageSalaryInr: 0,
  };

  return (
    <AdminPage
      title="Placement & Joining Management"
      subtitle="Track final institutional selections, verify onboarding dates, record confidential salary agreements, and monitor placement ratios."
      actions={
        <Button
          size="md"
          variant="primary"
          onClick={() => {
            resetCreateForm();
            setCreateModalOpen(true);
          }}
        >
          <Plus className="mr-1.5 size-4" />
          Record Placement
        </Button>
      }
    >
      {/* Placement Pipeline KPI Dashboard */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Total Placements</p>
          <p className="mt-1 font-serif text-2xl font-bold text-primary">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Offers Extended</p>
          <p className="mt-1 font-serif text-2xl font-bold text-amber-900">{stats.offered}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Offers Accepted</p>
          <p className="mt-1 font-serif text-2xl font-bold text-indigo-900">{stats.accepted}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Verified Joinings</p>
          <p className="mt-1 font-serif text-2xl font-bold text-emerald-900">{stats.joined}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm col-span-2 sm:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent flex items-center gap-1">
            <TrendingUp className="size-3.5" /> Success Rate
          </p>
          <p className="mt-1 font-serif text-2xl font-bold text-primary">{stats.placementRate}%</p>
        </div>
      </div>

      {/* Search & Filters */}
      <Card className="p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-12 sm:items-end">
          <div className="sm:col-span-6">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted mb-1 block">
              Search Placements
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-muted" />
              <Input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="Search teacher, school, job title, email..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="sm:col-span-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted mb-1 block">
              Placement Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="touch-target w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-primary shadow-sm focus:border-accent"
            >
              {PLACEMENT_STATUSES.map((o) => (
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
                setPage(1);
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Loading & Error States */}
      {loading ? (
        <Card className="p-5 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </Card>
      ) : null}

      {error ? <ErrorState title="Unable to load placements" message={error} onRetry={load} /> : null}

      {!loading && !error && (!data || data.items.length === 0) ? (
        <EmptyState
          title="No placement records found"
          description="Placement records generated following interview selections or manual additions will appear here."
        />
      ) : null}

      {/* Desktop Placements Table */}
      {!loading && !error && data && data.items.length > 0 ? (
        <div className="space-y-4">
          <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-soft-blue/70 text-xs font-semibold uppercase tracking-wider text-primary">
                <tr>
                  <th className="px-4 py-3.5">Selected Teacher</th>
                  <th className="px-4 py-3.5">Institution & Vacancy</th>
                  <th className="px-4 py-3.5">Joining Timeline</th>
                  <th className="px-4 py-3.5">Salary Package (INR)</th>
                  <th className="px-4 py-3.5">Placement Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {data.items.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-[#FAF9F5]">
                    <td className="px-4 py-3.5">
                      <div className="font-serif font-bold text-primary">{p.teacherName}</div>
                      <div className="text-xs text-muted">
                        {p.candidateEmail || "—"} • {p.candidateMobile || "—"}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-medium text-primary text-xs">{p.jobTitle}</div>
                      <div className="text-xs text-muted flex items-center gap-1 mt-0.5">
                        <Building2 className="size-3 text-accent" />
                        {p.schoolName}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="text-xs font-bold text-primary">
                        Scheduled: {formatDate(p.joiningDate)}
                      </div>
                      {p.actualJoiningDate ? (
                        <div className="text-[11px] text-emerald-800 font-medium flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="size-3" />
                          Joined on {formatDate(p.actualJoiningDate)}
                        </div>
                      ) : (
                        <div className="text-[11px] text-muted mt-0.5">
                          Selected {formatDate(p.selectionDate)}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      {p.salaryOfferedInr ? (
                        <div className="flex items-center gap-1 text-xs font-bold text-primary">
                          <IndianRupee className="size-3 text-accent" />
                          <span>₹{p.salaryOfferedInr.toLocaleString("en-IN")} / mo</span>
                          <span className="text-[10px] text-muted font-normal block">
                            (₹{(p.salaryOfferedInr * 12).toLocaleString("en-IN")} LPA)
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted italic">Undisclosed</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <StatusPill status={p.status} />
                      {p.joiningStatusRemarks ? (
                        <p className="text-[11px] text-secondary mt-1 line-clamp-1">
                          {p.joiningStatusRemarks}
                        </p>
                      ) : null}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenUpdate(p)}
                        className="text-xs"
                      >
                        Update Joining
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {data.items.map((p) => (
              <Card key={p.id} className="p-4 space-y-3 border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-primary">{p.teacherName}</h3>
                    <p className="text-xs text-secondary">{p.jobTitle}</p>
                    <p className="text-[11px] text-muted">{p.schoolName}</p>
                  </div>
                  <StatusPill status={p.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border/60">
                  <div>
                    <span className="text-muted block">Expected Joining</span>
                    <span className="font-bold text-primary">{formatDate(p.joiningDate)}</span>
                  </div>
                  <div>
                    <span className="text-muted block">Salary Package</span>
                    <span className="font-bold text-primary">
                      {p.salaryOfferedInr ? `₹${p.salaryOfferedInr.toLocaleString("en-IN")}` : "—"}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    fullWidth
                    onClick={() => handleOpenUpdate(p)}
                    className="text-xs"
                  >
                    Update Status & Joining
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

      {/* Record New Placement Modal */}
      <Modal
        open={createModalOpen}
        onClose={() => !submittingCreate && setCreateModalOpen(false)}
        title="Record Final Placement"
        description="Formalize candidate selection and record institutional onboarding terms."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
                Teacher User ID
              </label>
              <Input
                required
                placeholder="e.g. 6aee445188d8346f06f03306"
                value={newTeacherId}
                onChange={(e) => setNewTeacherId(e.target.value)}
                disabled={submittingCreate}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
                Candidate Full Name
              </label>
              <Input
                required
                placeholder="e.g. Ananya Sharma"
                value={newTeacherName}
                onChange={(e) => setNewTeacherName(e.target.value)}
                disabled={submittingCreate}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
                Position / Vacancy Title
              </label>
              <Input
                required
                placeholder="e.g. PGT Mathematics"
                value={newJobTitle}
                onChange={(e) => setNewJobTitle(e.target.value)}
                disabled={submittingCreate}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
                Hiring School / Institution
              </label>
              <Input
                required
                placeholder="e.g. Delhi Public School RK Puram"
                value={newSchoolName}
                onChange={(e) => setNewSchoolName(e.target.value)}
                disabled={submittingCreate}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
                Scheduled Joining Date
              </label>
              <input
                type="date"
                required
                value={newJoiningDate}
                onChange={(e) => setNewJoiningDate(e.target.value)}
                className="touch-target w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-primary shadow-sm focus:border-accent"
                disabled={submittingCreate}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
                Salary Offered (INR / Month)
              </label>
              <Input
                type="number"
                placeholder="e.g. 75000"
                value={newSalary}
                onChange={(e) => setNewSalary(e.target.value)}
                disabled={submittingCreate}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
              Initial Placement Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as AdminPlacement["status"])}
              className="touch-target w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-primary shadow-sm focus:border-accent"
              disabled={submittingCreate}
            >
              <option value="offered">Offer Extended</option>
              <option value="offer_accepted">Offer Accepted by Candidate</option>
              <option value="joined">Candidate Formally Joined</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
              Confidential Admin Notes
            </label>
            <TextArea
              rows={2}
              placeholder="e.g. Probation period 1 year, relocation allowance ₹25,000 agreed..."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              disabled={submittingCreate}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCreateModalOpen(false)}
              disabled={submittingCreate}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submittingCreate || !newTeacherName || !newJobTitle || !newJoiningDate}
            >
              {submittingCreate ? "Recording..." : "Save Placement Record"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Update Joining Status Modal */}
      <Modal
        open={updateModalOpen}
        onClose={() => !submittingUpdate && setUpdateModalOpen(false)}
        title="Update Joining Status & Terms"
        description="Verify candidate reporting date, joining remarks, and confidential compensation."
      >
        {activePlacement ? (
          <form onSubmit={handleUpdateSubmit} className="space-y-3.5">
            <div className="rounded-xl border border-border bg-[#FAF9F5] p-3 text-xs space-y-1">
              <p className="font-bold text-primary">{activePlacement.teacherName}</p>
              <p className="text-secondary">
                {activePlacement.jobTitle} • {activePlacement.schoolName}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
                Placement Stage / Joining Status
              </label>
              <select
                value={upStatus}
                onChange={(e) => setUpStatus(e.target.value as AdminPlacement["status"])}
                className="touch-target w-full rounded-lg border border-border bg-white px-3 py-2 text-xs font-bold text-primary shadow-sm focus:border-accent"
                disabled={submittingUpdate}
              >
                <option value="offer_accepted">Offer Accepted</option>
                <option value="joined">Formally Joined Institution</option>
                <option value="deferred">Joining Deferred / Delayed</option>
                <option value="declined">Offer Declined by Candidate</option>
                <option value="backed_out">Candidate Backed Out</option>
                <option value="completed">Probation Successfully Completed</option>
              </select>
            </div>

            {upStatus === "joined" ? (
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-emerald-900 block">
                  Actual Reporting / Joining Date
                </label>
                <input
                  type="date"
                  required
                  value={upActualJoiningDate}
                  onChange={(e) => setUpActualJoiningDate(e.target.value)}
                  className="touch-target w-full rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs text-primary shadow-sm"
                  disabled={submittingUpdate}
                />
              </div>
            ) : null}

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
                Confidential Salary Package (INR / Month)
              </label>
              <Input
                type="number"
                placeholder="e.g. 70000"
                value={upSalary}
                onChange={(e) => setUpSalary(e.target.value)}
                disabled={submittingUpdate}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
                Joining Status Remarks
              </label>
              <Input
                placeholder="e.g. Reported to Principal Office on Day 1, ID card issued"
                value={upRemarks}
                onChange={(e) => setUpRemarks(e.target.value)}
                disabled={submittingUpdate}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
                Private Administrative Notes
              </label>
              <TextArea
                rows={2}
                placeholder="Internal verification notes..."
                value={upNotes}
                onChange={(e) => setUpNotes(e.target.value)}
                disabled={submittingUpdate}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setUpdateModalOpen(false)}
                disabled={submittingUpdate}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={submittingUpdate}
              >
                {submittingUpdate ? "Saving..." : "Confirm Status Update"}
              </Button>
            </div>
          </form>
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
