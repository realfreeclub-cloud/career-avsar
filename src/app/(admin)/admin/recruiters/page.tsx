"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Phone,
  Mail,
  MessageSquare,
  Building2,
  ShieldCheck,
  Briefcase,
} from "lucide-react";
import {
  AdminPage,
  DataTable,
  Button,
  Input,
  Card,
  KpiCard,
} from "@/components/admin/ui";
import { apiFetch } from "@/lib/api/client";
import type { SchoolContact } from "@/types/admin";

export default function AdminRecruitersPage() {
  const [q, setQ] = React.useState("");
  const [contacts, setContacts] = React.useState<SchoolContact[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await apiFetch<{ items: SchoolContact[] }>("/api/admin/recruiters");
    if (!res.ok) {
      setError(res.error.message);
    } else {
      setContacts(res.data.items || []);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const filteredContacts = React.useMemo(() => {
    if (!q.trim()) return contacts;
    const term = q.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.schoolName?.toLowerCase().includes(term) ||
        c.designation?.toLowerCase().includes(term) ||
        c.phone?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term),
    );
  }, [contacts, q]);

  const primaryCount = contacts.filter((c) => c.isPrimary).length;

  return (
    <AdminPage
      title="Authorized School Recruiters & Coordinators"
      subtitle="Confidential directory of verified institutional principals, HR directors, and hiring coordinators across Uttar Pradesh."
      actions={
        <Button asChildLink href="/admin/schools" variant="secondary" size="sm">
          <Building2 className="mr-1.5 h-4 w-4 text-accent" />
          <span>Manage School Records</span>
        </Button>
      }
    >
      {/* Notice Card */}
      <Card className="border border-border p-4 bg-surface-raised text-xs text-navy shadow-xs flex items-center gap-3">
        <ShieldCheck className="size-5 text-accent shrink-0" aria-hidden />
        <p>
          Recruiter contacts are strictly confidential to Career Avsar administrators. Contact numbers and email
          addresses are never revealed on the public job directory to protect institutional privacy.
        </p>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard label="Total Authorized Contacts" value={contacts.length} hint="Across all UP partner schools" />
        <KpiCard label="Primary Institutional Contacts" value={primaryCount} hint="Key hiring decision makers" />
        <KpiCard
          label="Partner Schools Represented"
          value={new Set(contacts.map((c) => c.schoolId).filter(Boolean)).size}
          hint="Institutions with active contacts"
        />
      </div>

      {/* Search Input */}
      <Card className="border border-border p-4 shadow-sm bg-surface">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-text-subtle" />
          <Input
            placeholder="Search by recruiter name, institution, designation, mobile number, or email..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Contacts Table */}
      <DataTable<SchoolContact>
        loading={loading}
        error={error}
        onRetry={load}
        rows={filteredContacts}
        rowKey={(r) => `${r.schoolId || ""}-${r.id || r.name}-${r.phone || ""}`}
        emptyTitle="No recruiter contacts recorded"
        emptyDesc="Register schools and add institutional contacts in the Schools CRM to populate this directory."
        cols={[
          {
            key: "name",
            label: "Contact Person & Role",
            render: (r) => (
              <div className="min-w-[180px]">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-navy text-sm font-serif">{r.name}</span>
                  {r.isPrimary && (
                    <span className="bg-accent/20 text-navy text-[10px] font-bold px-1.5 py-0.5 rounded">
                      PRIMARY
                    </span>
                  )}
                </div>
                <span className="text-xs text-text-subtle block">
                  {r.designation || r.role || "Recruiter / Staff"}
                </span>
              </div>
            ),
          },
          {
            key: "school",
            label: "Associated School",
            render: (r) => (
              <div>
                <span className="font-medium text-navy text-xs block">{r.schoolName || "Institution"}</span>
                {r.schoolId && (
                  <Link
                    href={`/admin/jobs?schoolId=${r.schoolId}`}
                    className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline mt-0.5"
                  >
                    <Briefcase className="h-3 w-3" /> View Vacancies
                  </Link>
                )}
              </div>
            ),
          },
          {
            key: "phone",
            label: "Phone / WhatsApp",
            render: (r) => (
              <div className="space-y-1 text-xs">
                {r.phone ? (
                  <a
                    href={`tel:${r.phone}`}
                    className="flex items-center gap-1 text-navy hover:text-accent font-medium"
                  >
                    <Phone className="h-3 w-3 text-accent" />
                    <span>{r.phone}</span>
                  </a>
                ) : (
                  <span className="text-text-subtle italic">No phone</span>
                )}
                {r.whatsapp && (
                  <a
                    href={`https://wa.me/${r.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-emerald-700 hover:underline font-medium text-[11px]"
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>WhatsApp Chat</span>
                  </a>
                )}
              </div>
            ),
          },
          {
            key: "email",
            label: "Email Address",
            render: (r) => (
              <div className="text-xs">
                {r.email ? (
                  <a
                    href={`mailto:${r.email}`}
                    className="flex items-center gap-1 text-navy hover:underline truncate max-w-[200px]"
                  >
                    <Mail className="h-3 w-3 text-text-subtle shrink-0" />
                    <span className="truncate">{r.email}</span>
                  </a>
                ) : (
                  <span className="text-text-subtle italic">No email</span>
                )}
              </div>
            ),
          },
          {
            key: "actions",
            label: "Actions",
            render: () => (
              <div className="flex items-center gap-2">
                <Button
                  asChildLink
                  href="/admin/schools"
                  size="sm"
                  variant="secondary"
                  className="text-xs py-1 px-2.5 h-8"
                >
                  Manage in CRM
                </Button>
              </div>
            ),
          },
        ]}
      />
    </AdminPage>
  );
}
