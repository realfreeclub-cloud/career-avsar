"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Building2,
  ShieldCheck,
  Clock,
  Phone,
  Mail,
  MessageSquare,
  ExternalLink,
  Trash2,
  UserPlus,
  Briefcase,
  Filter,
} from "lucide-react";
import {
  AdminPage,
  DataTable,
  Pager,
  Button,
  Input,
  Card,
  Skeleton,
} from "@/components/admin/ui";
import { apiFetch } from "@/lib/api/client";
import type { Paged, SchoolListItem, SchoolDetail } from "@/types/admin";
import { Modal } from "@/components/ui/modal";
import { ACTIVE_REGIONAL_DISTRICTS } from "@/data/india-locations";

const UP_DISTRICTS = [...ACTIVE_REGIONAL_DISTRICTS];
const BOARDS = ["CBSE", "ICSE", "UP Board", "IB", "Cambridge", "State Board", "Other"];
const SCHOOL_TYPES = [
  "Private Unaided",
  "Convent / Missionary",
  "Day-Cum-Boarding",
  "CBSE Affiliated Senior Secondary",
  "Government Aided",
  "International School",
  "Preschool / Play School",
  "Other",
];

export default function AdminSchoolsPage() {
  const [q, setQ] = React.useState("");
  const [districtFilter, setDistrictFilter] = React.useState("all");
  const [verificationFilter, setVerificationFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<Paged<SchoolListItem> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Create modal state
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createSubmitting, setCreateSubmitting] = React.useState(false);
  const [newSchool, setNewSchool] = React.useState({
    name: "",
    board: "CBSE",
    type: "Private Unaided",
    state: "Uttar Pradesh",
    district: "Prayagraj",
    city: "Prayagraj",
    address: "",
    pincode: "",
    email: "",
    phone: "",
    hiringRequirements: "",
    verificationStatus: "verified" as "verified" | "pending_verification" | "unverified",
    primaryContact: {
      name: "",
      designation: "Principal",
      phone: "",
      email: "",
      whatsapp: "",
    },
  });

  // Selected school drawer / detail modal
  const [selectedSchoolId, setSelectedSchoolId] = React.useState<string | null>(null);
  const [schoolDetail, setSchoolDetail] = React.useState<SchoolDetail | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"overview" | "contacts" | "hiring" | "comms" | "notes">("overview");

  // Interaction logging form in detail
  const [logChannel, setLogChannel] = React.useState<"phone" | "whatsapp" | "meeting" | "email">("phone");
  const [logNotes, setLogNotes] = React.useState("");
  const [logFollowUp, setLogFollowUp] = React.useState("");
  const [logSubmitting, setLogSubmitting] = React.useState(false);

  // New contact form
  const [newContact, setNewContact] = React.useState({
    name: "",
    designation: "HR Manager",
    phone: "",
    email: "",
    whatsapp: "",
    isPrimary: false,
  });
  const [contactSubmitting, setContactSubmitting] = React.useState(false);

  // New note form
  const [newNoteBody, setNewNoteBody] = React.useState("");
  const [noteSubmitting, setNoteSubmitting] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
    });
    if (q) params.set("q", q);
    if (districtFilter !== "all") params.set("district", districtFilter);
    if (verificationFilter !== "all") params.set("verification", verificationFilter);

    const res = await apiFetch<Paged<SchoolListItem>>(`/api/admin/schools?${params.toString()}`);
    if (!res.ok) setError(res.error.message);
    else setData(res.data);
    setLoading(false);
  }, [page, q, districtFilter, verificationFilter]);

  React.useEffect(() => {
    load();
  }, [load]);

  // Load detailed school when selected
  const loadSchoolDetail = React.useCallback(async (id: string) => {
    setDetailLoading(true);
    const res = await apiFetch<SchoolDetail>(`/api/admin/schools/${id}`);
    if (res.ok) {
      setSchoolDetail(res.data);
    }
    setDetailLoading(false);
  }, []);

  React.useEffect(() => {
    if (selectedSchoolId) {
      loadSchoolDetail(selectedSchoolId);
      setActiveTab("overview");
    } else {
      setSchoolDetail(null);
    }
  }, [selectedSchoolId, loadSchoolDetail]);

  async function handleCreateSchool(e: React.FormEvent) {
    e.preventDefault();
    if (!newSchool.name.trim()) return;
    setCreateSubmitting(true);

    const payload = {
      name: newSchool.name.trim(),
      board: newSchool.board,
      type: newSchool.type,
      state: "Uttar Pradesh",
      district: newSchool.district,
      city: newSchool.city.trim() || newSchool.district,
      address: newSchool.address.trim(),
      pincode: newSchool.pincode.trim(),
      email: newSchool.email.trim(),
      phone: newSchool.phone.trim(),
      hiringRequirements: newSchool.hiringRequirements.trim(),
      verificationStatus: newSchool.verificationStatus,
      status: "active",
      primaryContact: newSchool.primaryContact.name.trim()
        ? {
            name: newSchool.primaryContact.name.trim(),
            designation: newSchool.primaryContact.designation.trim() || "Principal",
            phone: newSchool.primaryContact.phone.trim(),
            email: newSchool.primaryContact.email.trim(),
            whatsapp: newSchool.primaryContact.whatsapp.trim() || newSchool.primaryContact.phone.trim(),
          }
        : undefined,
    };

    const res = await apiFetch("/api/admin/schools", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setCreateSubmitting(false);
    if (res.ok) {
      setCreateOpen(false);
      setNewSchool({
        name: "",
        board: "CBSE",
        type: "Private Unaided",
        state: "Uttar Pradesh",
        district: "Prayagraj",
        city: "Prayagraj",
        address: "",
        pincode: "",
        email: "",
        phone: "",
        hiringRequirements: "",
        verificationStatus: "verified",
        primaryContact: { name: "", designation: "Principal", phone: "", email: "", whatsapp: "" },
      });
      load();
    } else {
      alert(res.error.message);
    }
  }

  async function updateVerification(status: "verified" | "pending_verification" | "unverified") {
    if (!selectedSchoolId) return;
    const res = await apiFetch(`/api/admin/schools/${selectedSchoolId}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "verify", verificationStatus: status }),
    });
    if (res.ok) {
      loadSchoolDetail(selectedSchoolId);
      load();
    }
  }

  async function updateSchoolStatus(status: "active" | "inactive") {
    if (!selectedSchoolId) return;
    const res = await apiFetch(`/api/admin/schools/${selectedSchoolId}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "status", status }),
    });
    if (res.ok) {
      loadSchoolDetail(selectedSchoolId);
      load();
    }
  }

  async function handleAddContact(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSchoolId || !newContact.name.trim()) return;
    setContactSubmitting(true);
    const res = await apiFetch(`/api/admin/schools/${selectedSchoolId}`, {
      method: "PATCH",
      body: JSON.stringify({
        action: "add_contact",
        ...newContact,
        role: newContact.designation,
      }),
    });
    setContactSubmitting(false);
    if (res.ok) {
      setNewContact({ name: "", designation: "HR Manager", phone: "", email: "", whatsapp: "", isPrimary: false });
      loadSchoolDetail(selectedSchoolId);
      load();
    }
  }

  async function handleDeleteContact(contactId: string) {
    if (!selectedSchoolId || !confirm("Remove this authorized contact?")) return;
    const res = await apiFetch(`/api/admin/schools/${selectedSchoolId}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "delete_contact", contactId }),
    });
    if (res.ok) {
      loadSchoolDetail(selectedSchoolId);
      load();
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSchoolId || !newNoteBody.trim()) return;
    setNoteSubmitting(true);
    const res = await apiFetch(`/api/admin/schools/${selectedSchoolId}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "add_note", body: newNoteBody.trim() }),
    });
    setNoteSubmitting(false);
    if (res.ok) {
      setNewNoteBody("");
      loadSchoolDetail(selectedSchoolId);
    }
  }

  async function handleLogInteraction(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSchoolId || !schoolDetail || !logNotes.trim()) return;
    setLogSubmitting(true);

    const primary = schoolDetail.contacts.find((c) => c.isPrimary) || schoolDetail.contacts[0];

    const res = await apiFetch("/api/admin/communications", {
      method: "POST",
      body: JSON.stringify({
        recipientType: "school",
        schoolId: schoolDetail.id,
        schoolName: schoolDetail.name,
        contactPerson: primary?.name || "School Administrator",
        contactRole: primary?.designation || primary?.role || "Staff",
        channel: logChannel,
        subject: `Recruitment Discussion via ${logChannel.toUpperCase()}`,
        message: logNotes.trim(),
        followUpDate: logFollowUp ? new Date(logFollowUp).toISOString() : undefined,
      }),
    });

    setLogSubmitting(false);
    if (res.ok) {
      setLogNotes("");
      setLogFollowUp("");
      alert("Interaction logged and follow-up scheduled successfully!");
      loadSchoolDetail(selectedSchoolId);
      load();
    } else {
      alert(res.error.message);
    }
  }

  return (
    <AdminPage
      title="Schools & Institutions CRM"
      subtitle="Complete database of verified hiring partner schools across Uttar Pradesh. Private contacts, hiring needs, and recruiter follow-ups."
      actions={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 shadow-sm bg-accent hover:bg-accent/90 text-navy font-semibold"
          >
            <Plus className="size-4" />
            <span>Register Partner Institution</span>
          </Button>
        </div>
      }
    >
      {/* Search and Filters Bar */}
      <Card className="border border-border p-4 shadow-sm bg-surface">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-text-subtle" />
            <Input
              placeholder="Search institutions by school name, city, district, board or contact person..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-text-subtle font-medium">
              <Filter className="h-3.5 w-3.5 text-accent" /> Filter:
            </div>
            <select
              value={districtFilter}
              onChange={(e) => {
                setDistrictFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-border bg-surface px-3 text-xs font-medium text-navy focus:border-accent focus:outline-none"
            >
              <option value="all">All Districts (UP)</option>
              {UP_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={verificationFilter}
              onChange={(e) => {
                setVerificationFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-border bg-surface px-3 text-xs font-medium text-navy focus:border-accent focus:outline-none"
            >
              <option value="all">All Verification Statuses</option>
              <option value="verified">Verified Only</option>
              <option value="pending_verification">Pending Verification</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Schools Table */}
      <DataTable<SchoolListItem>
        loading={loading}
        error={error}
        onRetry={load}
        rows={data?.items || []}
        rowKey={(r) => r.id}
        emptyTitle="No educational institutions found"
        emptyDesc="No schools match your search or filter criteria. Register partner institutions to associate verified job listings."
        cols={[
          {
            key: "name",
            label: "School & Location",
            render: (r) => (
              <div className="min-w-[180px]">
                <button
                  type="button"
                  onClick={() => setSelectedSchoolId(r.id)}
                  className="font-semibold text-navy hover:text-accent text-left transition-colors font-serif block truncate max-w-xs"
                >
                  {r.name}
                </button>
                <span className="block text-xs text-text-subtle">
                  {[r.city, r.district, r.state].filter(Boolean).join(", ") || "Location unassigned"}
                </span>
                {r.followUpDate && r.followUpStatus === "pending" && (
                  <span className="inline-flex items-center gap-1 mt-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">
                    <Clock className="h-3 w-3" /> Follow-up: {new Date(r.followUpDate).toLocaleDateString("en-IN")}
                  </span>
                )}
              </div>
            ),
          },
          {
            key: "type",
            label: "Board & Type",
            render: (r) => (
              <div className="space-y-1">
                <span className="inline-flex items-center rounded-md bg-soft-blue px-2 py-0.5 text-xs font-semibold text-navy border border-[#D5DFEB]">
                  {r.board || "CBSE"}
                </span>
                <span className="block text-[11px] text-text-subtle truncate max-w-[140px]">
                  {r.type || "Private School"}
                </span>
              </div>
            ),
          },
          {
            key: "verification",
            label: "Verification",
            render: (r) => (
              <div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                    r.verificationStatus === "verified"
                      ? "bg-emerald-500/15 text-emerald-700 border border-emerald-500/20"
                      : r.verificationStatus === "pending_verification"
                      ? "bg-amber-500/15 text-amber-700 border border-amber-500/20"
                      : "bg-slate-500/15 text-slate-700 border border-slate-500/20"
                  }`}
                >
                  {r.verificationStatus === "verified" ? (
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                  )}
                  {r.verificationStatus === "verified"
                    ? "Verified"
                    : r.verificationStatus === "pending_verification"
                    ? "Pending Verification"
                    : "Unverified"}
                </span>
              </div>
            ),
          },
          {
            key: "contacts",
            label: "Private Contacts",
            render: (r) => (
              <span className="text-xs font-medium text-text-subtle flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-accent" />
                {r.contactsCount} authorized recruiter{r.contactsCount === 1 ? "" : "s"}
              </span>
            ),
          },
          {
            key: "vacancies",
            label: "Active Jobs",
            render: (r) => (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-navy bg-navy/5 px-2.5 py-1 rounded-lg">
                <Briefcase className="h-3.5 w-3.5 text-accent" />
                {r.activeVacanciesCount || 0} active
              </span>
            ),
          },
          {
            key: "actions",
            label: "Actions",
            render: (r) => (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelectedSchoolId(r.id)}
                  className="text-xs py-1 px-2.5 h-8"
                >
                  Manage CRM
                </Button>
                <Link
                  href={`/admin/jobs?schoolId=${r.id}`}
                  className="p-1.5 rounded-lg border border-border bg-surface text-text-subtle hover:text-navy hover:border-accent text-xs"
                  title="View Vacancies"
                >
                  <Briefcase className="h-3.5 w-3.5" />
                </Link>
              </div>
            ),
          },
        ]}
      />

      {data ? <Pager page={data.page.page} totalPages={data.page.totalPages} onPage={setPage} /> : null}

      {/* CREATE SCHOOL MODAL */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Register Partner Institution in CRM"
        description="Add a verified educational institution for teacher placement and vacancy publishing in Uttar Pradesh."
        className="sm:max-w-2xl"
      >
        <form onSubmit={handleCreateSchool} className="space-y-4 pt-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-navy mb-1">
                Official School / Institution Name *
              </label>
              <Input
                placeholder="e.g. Saint Joseph's College, Prayagraj"
                value={newSchool.name}
                onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Affiliation / Board *</label>
              <select
                value={newSchool.board}
                onChange={(e) => setNewSchool({ ...newSchool, board: e.target.value })}
                className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-xs font-medium text-navy focus:border-accent focus:outline-none"
              >
                {BOARDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Institution Type *</label>
              <select
                value={newSchool.type}
                onChange={(e) => setNewSchool({ ...newSchool, type: e.target.value })}
                className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-xs font-medium text-navy focus:border-accent focus:outline-none"
              >
                {SCHOOL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy mb-1">District (Uttar Pradesh) *</label>
              <select
                value={newSchool.district}
                onChange={(e) =>
                  setNewSchool({ ...newSchool, district: e.target.value, city: e.target.value })
                }
                className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-xs font-medium text-navy focus:border-accent focus:outline-none"
              >
                {UP_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy mb-1">City / Town *</label>
              <Input
                placeholder="e.g. Civil Lines, Prayagraj"
                value={newSchool.city}
                onChange={(e) => setNewSchool({ ...newSchool, city: e.target.value })}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-navy mb-1">Campus Address & Pincode</label>
              <Input
                placeholder="Full campus street address and 6-digit PIN"
                value={newSchool.address}
                onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
              />
            </div>
          </div>

          {/* Primary Contact Person Box */}
          <div className="rounded-xl border border-accent/25 bg-surface-raised p-3.5 space-y-3">
            <p className="text-xs font-semibold text-navy uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus className="h-4 w-4 text-accent" /> Primary Authorized Recruiter / Contact
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs text-text-subtle mb-1">Contact Person Name</label>
                <Input
                  placeholder="e.g. Dr. Anand Sharma"
                  value={newSchool.primaryContact.name}
                  onChange={(e) =>
                    setNewSchool({
                      ...newSchool,
                      primaryContact: { ...newSchool.primaryContact, name: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-xs text-text-subtle mb-1">Designation / Role</label>
                <Input
                  placeholder="e.g. Principal / Director / HR Head"
                  value={newSchool.primaryContact.designation}
                  onChange={(e) =>
                    setNewSchool({
                      ...newSchool,
                      primaryContact: { ...newSchool.primaryContact, designation: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-xs text-text-subtle mb-1">Mobile / WhatsApp Number</label>
                <Input
                  placeholder="e.g. +91 9876543210"
                  value={newSchool.primaryContact.phone}
                  onChange={(e) =>
                    setNewSchool({
                      ...newSchool,
                      primaryContact: {
                        ...newSchool.primaryContact,
                        phone: e.target.value,
                        whatsapp: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-xs text-text-subtle mb-1">Official Email</label>
                <Input
                  type="email"
                  placeholder="e.g. principal@institution.edu"
                  value={newSchool.primaryContact.email}
                  onChange={(e) =>
                    setNewSchool({
                      ...newSchool,
                      primaryContact: { ...newSchool.primaryContact, email: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">Initial Hiring Needs / Requirements</label>
            <textarea
              rows={2}
              placeholder="e.g. Urgent requirement for PGT Physics (CBSE), TGT Mathematics, and PRT Mother Teacher for session 2026-27."
              value={newSchool.hiringRequirements}
              onChange={(e) => setNewSchool({ ...newSchool, hiringRequirements: e.target.value })}
              className="w-full rounded-xl border border-border bg-surface p-2.5 text-xs text-navy focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">Initial Verification Status</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 text-xs text-navy font-medium cursor-pointer">
                <input
                  type="radio"
                  name="verificationStatus"
                  checked={newSchool.verificationStatus === "verified"}
                  onChange={() => setNewSchool({ ...newSchool, verificationStatus: "verified" })}
                />
                Verified Institution
              </label>
              <label className="flex items-center gap-1.5 text-xs text-navy font-medium cursor-pointer">
                <input
                  type="radio"
                  name="verificationStatus"
                  checked={newSchool.verificationStatus === "pending_verification"}
                  onChange={() => setNewSchool({ ...newSchool, verificationStatus: "pending_verification" })}
                />
                Pending Verification
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createSubmitting || !newSchool.name.trim()}
              className="bg-accent hover:bg-accent/90 text-navy font-semibold"
            >
              {createSubmitting ? "Registering..." : "Save Partner School"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DETAILED SCHOOL MANAGEMENT DRAWER / MODAL */}
      <Modal
        open={Boolean(selectedSchoolId)}
        onClose={() => setSelectedSchoolId(null)}
        title={schoolDetail ? schoolDetail.name : "Institution Details"}
        description={
          schoolDetail
            ? `${schoolDetail.board || "CBSE"} • ${schoolDetail.city || ""}, ${schoolDetail.district || ""} (Uttar Pradesh)`
            : "Loading institutional CRM records..."
        }
        className="sm:max-w-3xl"
      >
        {detailLoading || !schoolDetail ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Tab Navigation */}
            <div className="flex border-b border-border overflow-x-auto gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "overview"
                    ? "border-accent text-navy"
                    : "border-transparent text-text-subtle hover:text-navy"
                }`}
              >
                Overview & Status
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("contacts")}
                className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "contacts"
                    ? "border-accent text-navy"
                    : "border-transparent text-text-subtle hover:text-navy"
                }`}
              >
                Authorized Contacts ({schoolDetail.contacts?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("hiring")}
                className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "hiring"
                    ? "border-accent text-navy"
                    : "border-transparent text-text-subtle hover:text-navy"
                }`}
              >
                Hiring Requirements
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("comms")}
                className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "comms"
                    ? "border-accent text-navy"
                    : "border-transparent text-text-subtle hover:text-navy"
                }`}
              >
                Log Contact & Follow-up
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("notes")}
                className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "notes"
                    ? "border-accent text-navy"
                    : "border-transparent text-text-subtle hover:text-navy"
                }`}
              >
                Internal Notes ({schoolDetail.internalNotes?.length || 0})
              </button>
            </div>

            {/* TAB 1: OVERVIEW & STATUS */}
            {activeTab === "overview" && (
              <div className="space-y-4 pt-1">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border p-3.5 bg-surface-raised">
                    <p className="text-[11px] font-semibold uppercase text-text-subtle">Verification Status</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-serif font-bold text-navy text-base capitalize">
                        {schoolDetail.verificationStatus?.replace(/_/g, " ") || "Verified"}
                      </span>
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => updateVerification("verified")}
                          className="h-7 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        >
                          Mark Verified
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => updateVerification("pending_verification")}
                          className="h-7 text-xs bg-amber-50 text-amber-700 hover:bg-amber-100"
                        >
                          Pending
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border p-3.5 bg-surface-raised">
                    <p className="text-[11px] font-semibold uppercase text-text-subtle">Operational Status</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-serif font-bold text-navy text-base capitalize">
                        {schoolDetail.status}
                      </span>
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => updateSchoolStatus(schoolDetail.status === "active" ? "inactive" : "active")}
                          className="h-7 text-xs"
                        >
                          {schoolDetail.status === "active" ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border p-3.5 space-y-2 text-xs">
                  <p className="font-semibold text-navy">Location & Details</p>
                  <p className="text-text-subtle">
                    <strong className="text-navy">District:</strong> {schoolDetail.district || "Prayagraj"},{" "}
                    {schoolDetail.state || "Uttar Pradesh"}
                  </p>
                  <p className="text-text-subtle">
                    <strong className="text-navy">City / Address:</strong> {schoolDetail.city || "N/A"} •{" "}
                    {schoolDetail.address || "No detailed address on file"}
                  </p>
                  <p className="text-text-subtle">
                    <strong className="text-navy">Affiliation:</strong> {schoolDetail.board} ({schoolDetail.type})
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <Link
                    href={`/admin/jobs?schoolId=${schoolDetail.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
                  >
                    <Briefcase className="h-4 w-4" /> View or Publish Vacancies for this School
                  </Link>
                </div>
              </div>
            )}

            {/* TAB 2: AUTHORIZED CONTACTS */}
            {activeTab === "contacts" && (
              <div className="space-y-4 pt-1">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-navy">Registered Institutional Contacts</p>
                  {!schoolDetail.contacts?.length ? (
                    <p className="text-xs text-text-subtle italic">No private contacts registered yet.</p>
                  ) : (
                    <ul className="divide-y divide-border/60 rounded-xl border border-border bg-surface">
                      {schoolDetail.contacts.map((c, i) => (
                        <li key={c.id || i} className="p-3 flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-navy text-xs">{c.name}</span>
                              {c.isPrimary && (
                                <span className="bg-accent/20 text-navy text-[10px] font-bold px-1.5 py-0.5 rounded">
                                  PRIMARY
                                </span>
                              )}
                              <span className="text-text-subtle text-xs">({c.designation || c.role || "Recruiter"})</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-text-subtle">
                              {c.phone && (
                                <a
                                  href={`tel:${c.phone}`}
                                  className="flex items-center gap-1 text-navy hover:text-accent font-medium"
                                >
                                  <Phone className="h-3 w-3" /> {c.phone}
                                </a>
                              )}
                              {c.whatsapp && (
                                <a
                                  href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-emerald-700 hover:underline font-medium"
                                >
                                  <MessageSquare className="h-3 w-3" /> WhatsApp
                                </a>
                              )}
                              {c.email && (
                                <a
                                  href={`mailto:${c.email}`}
                                  className="flex items-center gap-1 text-navy hover:underline"
                                >
                                  <Mail className="h-3 w-3" /> {c.email}
                                </a>
                              )}
                            </div>
                          </div>
                          {c.id && (
                            <button
                              type="button"
                              onClick={() => handleDeleteContact(c.id!)}
                              className="text-text-subtle hover:text-rose-600 p-1"
                              title="Remove Contact"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Form to add a new contact */}
                <form
                  onSubmit={handleAddContact}
                  className="rounded-xl border border-accent/25 bg-surface-raised p-3.5 space-y-3"
                >
                  <p className="text-xs font-semibold text-navy flex items-center gap-1">
                    <UserPlus className="h-3.5 w-3.5 text-accent" /> Add Authorized School Contact
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input
                      placeholder="Contact Full Name *"
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Designation (e.g. Principal, HR Head)"
                      value={newContact.designation}
                      onChange={(e) => setNewContact({ ...newContact, designation: e.target.value })}
                    />
                    <Input
                      placeholder="Mobile / Phone Number"
                      value={newContact.phone}
                      onChange={(e) =>
                        setNewContact({
                          ...newContact,
                          phone: e.target.value,
                          whatsapp: newContact.whatsapp || e.target.value,
                        })
                      }
                    />
                    <Input
                      placeholder="WhatsApp Number"
                      value={newContact.whatsapp}
                      onChange={(e) => setNewContact({ ...newContact, whatsapp: e.target.value })}
                    />
                    <div className="sm:col-span-2">
                      <Input
                        type="email"
                        placeholder="Official Email Address"
                        value={newContact.email}
                        onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <label className="flex items-center gap-1.5 text-xs text-navy cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newContact.isPrimary}
                        onChange={(e) => setNewContact({ ...newContact, isPrimary: e.target.checked })}
                      />
                      Set as Primary Institutional Contact
                    </label>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={contactSubmitting || !newContact.name.trim()}
                      className="bg-accent text-navy font-semibold hover:bg-accent/90"
                    >
                      {contactSubmitting ? "Adding..." : "Add Contact"}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: HIRING REQUIREMENTS */}
            {activeTab === "hiring" && (
              <div className="space-y-4 pt-1">
                <div className="rounded-xl border border-border p-4 bg-surface">
                  <p className="text-xs font-semibold text-navy mb-2">Institutional Hiring Requirements</p>
                  {schoolDetail.hiringRequirements ? (
                    <p className="text-xs text-navy whitespace-pre-wrap leading-relaxed bg-surface-raised p-3 rounded-lg border border-border">
                      {schoolDetail.hiringRequirements}
                    </p>
                  ) : (
                    <p className="text-xs text-text-subtle italic">No specific hiring requirements logged yet.</p>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <p className="text-xs text-text-subtle">
                    Publish verified teacher vacancies tied directly to this institution.
                  </p>
                  <Button asChildLink href={`/admin/jobs?schoolId=${schoolDetail.id}`} size="sm" variant="primary">
                    <Briefcase className="mr-1.5 h-3.5 w-3.5" /> Post Vacancy for this School
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 4: CRM COMMUNICATION & FOLLOW-UP */}
            {activeTab === "comms" && (
              <div className="space-y-4 pt-1">
                <form
                  onSubmit={handleLogInteraction}
                  className="rounded-xl border border-accent/25 bg-surface-raised p-4 space-y-3"
                >
                  <p className="text-xs font-semibold text-navy flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-accent" /> Log School Interaction & Schedule Follow-up
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-navy mb-1">Interaction Channel</label>
                      <select
                        value={logChannel}
                        onChange={(e) =>
                          setLogChannel(e.target.value as "phone" | "whatsapp" | "meeting" | "email")
                        }
                        className="w-full h-9 rounded-xl border border-border bg-surface px-3 text-xs font-medium text-navy focus:border-accent focus:outline-none"
                      >
                        <option value="phone">Phone Call</option>
                        <option value="whatsapp">WhatsApp Conversation</option>
                        <option value="meeting">In-Person Meeting</option>
                        <option value="email">Email</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-navy mb-1">Next Follow-up Date (Optional)</label>
                      <input
                        type="date"
                        value={logFollowUp}
                        onChange={(e) => setLogFollowUp(e.target.value)}
                        className="w-full h-9 rounded-xl border border-border bg-surface px-3 text-xs font-medium text-navy focus:border-accent focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-navy mb-1">Discussion Summary / Action Items *</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Spoke with Principal Dr. Anand Sharma regarding PGT Physics vacancy. They requested 3 shortlisted profiles by Thursday."
                      value={logNotes}
                      onChange={(e) => setLogNotes(e.target.value)}
                      required
                      className="w-full rounded-xl border border-border bg-surface p-2.5 text-xs text-navy focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={logSubmitting || !logNotes.trim()}
                      className="bg-accent text-navy font-semibold hover:bg-accent/90"
                    >
                      {logSubmitting ? "Logging..." : "Log Interaction"}
                    </Button>
                  </div>
                </form>

                <div className="flex justify-end">
                  <Link
                    href={`/admin/messages?schoolId=${schoolDetail.id}`}
                    className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                  >
                    View All Communication Logs <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}

            {/* TAB 5: INTERNAL PRIVATE NOTES */}
            {activeTab === "notes" && (
              <div className="space-y-4 pt-1">
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {!schoolDetail.internalNotes?.length ? (
                    <p className="text-xs text-text-subtle italic">No internal admin notes recorded yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {schoolDetail.internalNotes.map((n, i) => (
                        <li key={n.id || i} className="rounded-xl border border-border bg-surface-raised p-3 text-xs">
                          <p className="text-navy">{n.body}</p>
                          <p className="text-[10px] text-text-subtle mt-1 flex justify-between">
                            <span>By: {n.authorName || "Administrator"}</span>
                            <span>{n.createdAt ? new Date(n.createdAt).toLocaleString("en-IN") : ""}</span>
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <form onSubmit={handleAddNote} className="space-y-2 pt-2 border-t border-border">
                  <textarea
                    rows={2}
                    placeholder="Add a confidential internal admin note (private to Career Avsar recruitment staff)..."
                    value={newNoteBody}
                    onChange={(e) => setNewNoteBody(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface p-2.5 text-xs text-navy focus:border-accent focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={noteSubmitting || !newNoteBody.trim()}
                      className="bg-accent text-navy font-semibold"
                    >
                      {noteSubmitting ? "Saving..." : "Add Private Note"}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </Modal>
    </AdminPage>
  );
}
