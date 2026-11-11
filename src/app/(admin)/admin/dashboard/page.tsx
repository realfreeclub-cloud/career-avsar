"use client";

import * as React from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api/client";
import {
  AdminPage,
  KpiCard,
  Card,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  Skeleton,
  StatusPill,
  Button,
} from "@/components/admin/ui";
import type { AdminDashboardStats } from "@/types/admin";
import {
  Building2,
  Users,
  Briefcase,
  FileCheck,
  PhoneCall,
  Clock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [data, setData] = React.useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await apiFetch<AdminDashboardStats>("/api/admin/dashboard");
    if (!res.ok) setError(res.error.message);
    else setData(res.data);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <AdminPage title="Admin Operations Dashboard" subtitle="Loading real-time recruitment metrics...">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </AdminPage>
    );
  }

  if (error) {
    return (
      <AdminPage title="Admin Operations Dashboard">
        <ErrorState title="Unable to load dashboard metrics" message={error} onRetry={load} />
      </AdminPage>
    );
  }

  if (!data) {
    return (
      <AdminPage title="Admin Operations Dashboard">
        <EmptyState title="No data available" description="Operational metrics could not be loaded." />
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Admin Operations Dashboard"
      subtitle="Complete operational control over schools, teachers, vacancies, and interview workflows across Uttar Pradesh."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button asChildLink href="/admin/schools" variant="secondary" size="sm">
            <Building2 className="mr-1.5 h-4 w-4 text-accent" /> Partner Schools
          </Button>
          <Button asChildLink href="/admin/jobs" variant="secondary" size="sm">
            <Briefcase className="mr-1.5 h-4 w-4 text-accent" /> Vacancies
          </Button>
          <Button asChildLink href="/admin/applications" variant="secondary" size="sm">
            <FileCheck className="mr-1.5 h-4 w-4 text-accent" /> Applications
          </Button>
          <Button asChildLink href="/admin/messages" variant="secondary" size="sm">
            <PhoneCall className="mr-1.5 h-4 w-4 text-accent" /> Communications
          </Button>
        </div>
      }
    >
      {/* Actionable Notice for Pending Tasks */}
      {(data.pendingDocumentVerification > 0 || data.pendingFollowUps > 0 || data.pendingApplications > 0) && (
        <div className="rounded-2xl border border-accent/25 bg-surface-raised p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-serif font-bold text-navy text-sm md:text-base">
                Operational Attention Required
              </p>
              <p className="text-xs md:text-sm text-text-subtle mt-0.5">
                {[
                  data.pendingDocumentVerification > 0 ? `${data.pendingDocumentVerification} teacher document verifications pending` : null,
                  data.pendingFollowUps > 0 ? `${data.pendingFollowUps} school CRM follow-ups scheduled` : null,
                  data.pendingApplications > 0 ? `${data.pendingApplications} candidate applications awaiting review` : null,
                ]
                  .filter(Boolean)
                  .join(" • ")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {data.pendingDocumentVerification > 0 && (
              <Button asChildLink href="/admin/teachers?verification=pending" variant="secondary" size="sm">
                Verify Teachers
              </Button>
            )}
            {data.pendingFollowUps > 0 && (
              <Button asChildLink href="/admin/messages" variant="primary" size="sm">
                View Follow-ups
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Group 1: Partner Schools & CRM */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-serif text-base font-semibold text-navy flex items-center gap-2">
            <Building2 className="h-4 w-4 text-accent" /> School CRM & Partnerships
          </h2>
          <Link href="/admin/schools" className="text-xs font-medium text-accent hover:underline flex items-center gap-1">
            Manage all schools <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Total Partner Schools" value={data.totalSchools} hint="Registered in CRM" />
          <KpiCard label="Verified Institutions" value={data.verifiedSchools} hint="Verified for hiring" />
          <KpiCard
            label="Pending Follow-Ups"
            value={data.pendingFollowUps}
            hint="Scheduled recruiter outreach"
          />
          <KpiCard
            label="Active Vacancies"
            value={data.activeVacancies}
            hint="Currently accepting candidates"
          />
        </div>
      </div>

      {/* Group 2: Teachers & Verification */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-serif text-base font-semibold text-navy flex items-center gap-2">
            <Users className="h-4 w-4 text-accent" /> Teacher Talent Pool
          </h2>
          <Link href="/admin/teachers" className="text-xs font-medium text-accent hover:underline flex items-center gap-1">
            View teacher directory <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard label="Total Teachers Registered" value={data.totalTeachers} hint="Registered candidates" />
          <KpiCard label="Verified Profiles" value={data.verifiedTeachers} hint="Identity & qualifications vetted" />
          <KpiCard
            label="Pending Document Verification"
            value={data.pendingDocumentVerification}
            hint="Awaiting admin approval"
          />
        </div>
      </div>

      {/* Group 3: Recruitment Workflow Pipeline */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-serif text-base font-semibold text-navy flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-accent" /> Recruitment & Placement Pipeline
          </h2>
          <Link href="/admin/applications" className="text-xs font-medium text-accent hover:underline flex items-center gap-1">
            Application pipeline <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <KpiCard label="Total Applications" value={data.totalApplications} hint="Submitted to date" />
          <KpiCard label="Pending Review" value={data.pendingApplications} hint="Awaiting screening" />
          <KpiCard label="Shortlisted" value={data.shortlistedCandidates} hint="Ready for school sharing" />
          <KpiCard label="Scheduled Interviews" value={data.scheduledInterviews} hint="Active rounds" />
          <KpiCard label="Successful Placements" value={data.successfulPlacements} hint="Finalized selections" />
        </div>
      </div>

      {/* Tables / Lists Section */}
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        {/* Recent Teacher Registrations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4 text-accent" /> Recent Teacher Registrations
              </CardTitle>
              <Link href="/admin/teachers" className="text-xs text-accent hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          {!data.recentRegistrations.length ? (
            <EmptyState
              title="No registrations yet"
              description="New teacher registrations will appear here."
            />
          ) : (
            <ul className="divide-y divide-border/10">
              {data.recentRegistrations.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link href={`/admin/teachers/${t.id}`} className="font-medium text-navy hover:text-accent truncate block">
                      {t.fullName}
                    </Link>
                    <p className="text-xs text-text-subtle">
                      {t.mobile || t.email} • {[t.district, t.state].filter(Boolean).join(", ") || "Location not set"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusPill status={t.verificationStatus} />
                    <Link
                      href={`/admin/teachers/${t.id}`}
                      className="p-1 rounded-lg text-text-subtle hover:text-navy hover:bg-black/5"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recent Admin & CRM Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent" /> Recent Activity & Audit Trail
              </CardTitle>
              <Link href="/admin/settings" className="text-xs text-accent hover:underline">
                System logs
              </Link>
            </div>
          </CardHeader>
          {!data.recentActivities.length ? (
            <EmptyState
              title="No activity recorded"
              description="Admin actions and recruitment events will appear in the audit trail."
            />
          ) : (
            <ul className="space-y-2">
              {data.recentActivities.map((a) => (
                <li
                  key={a.id}
                  className="rounded-xl border border-border bg-surface-raised/50 p-3.5 hover:bg-surface-raised transition-colors"
                >
                  <p className="text-sm font-medium text-navy">{a.summary}</p>
                  <p className="mt-0.5 text-xs text-text-subtle flex items-center justify-between">
                    <span className="capitalize">{a.entityType.replace(/_/g, " ")}</span>
                    <span>{new Date(a.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AdminPage>
  );
}
