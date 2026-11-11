"use client";

import * as React from "react";
import Link from "next/link";
import { BadgeCheck, Bell, Briefcase, CalendarClock, CheckCircle2, Clock3, FileCheck2, FileText, MapPin, Star } from "lucide-react";
import { Button, Card, CardHeader, CardTitle, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { apiFetch } from "@/lib/api/client";
import { StatCard } from "@/components/teacher/dashboard/ui";
import type { TeacherDashboardData } from "@/types/dashboard";

export function DashboardOverviewClient() {
  const [data, setData] = React.useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await apiFetch<TeacherDashboardData>("/api/teacher/dashboard");
    if (!res.ok) setError(res.error.message);
    else setData(res.data);
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  if (loading) return <OverviewSkeleton />;
  if (error) return <ErrorState title="Unable to load dashboard" message={error} onRetry={load} />;
  if (!data) return <EmptyState title="No dashboard data" description="We couldn't load your dashboard." action={<Button variant="secondary" onClick={load}>Retry</Button>} />;

  const { stats } = data;
  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-gold">Educator Portal</p>
        <h1 className="mt-1.5 font-serif text-2xl font-bold text-primary sm:text-3xl">Welcome back, {data.user.name || "Teacher"}</h1>
        <p className="mt-1 text-sm text-muted">Review your verified application activity, interview invitations, and real-time school vacancies.</p>
        <div className="mt-5 flex flex-wrap gap-2.5">
          <Button asChildLink href="/teacher/dashboard/jobs" size="sm" className="bg-primary hover:bg-secondary text-white font-medium">Find Jobs</Button>
          <Button asChildLink href="/teacher/dashboard/profile" variant="secondary" size="sm">Update Profile Dossier</Button>
        </div>
      </header>

      <section aria-label="Dashboard statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard label="Profile completion" value={`${stats.profileCompletion}%`} icon={CheckCircle2} tone={stats.profileCompletion >= 80 ? "success" : "warning"} hint={stats.profileCompletion >= 80 ? "Comprehensive" : "Complete details"} />
        <StatCard label="Verification status" value={<span className="capitalize text-xl sm:text-2xl">{stats.verificationStatus}</span>} icon={BadgeCheck} tone={stats.verificationStatus === "verified" ? "success" : "default"} />
        <StatCard label="Total applications" value={stats.totalApplications} icon={FileText} tone="accent" />
        <StatCard label="Pending review" value={stats.pendingApplications} icon={Clock3} tone="warning" />
        <StatCard label="Shortlisted" value={stats.shortlistedApplications} icon={Star} tone="success" />
        <StatCard label="Scheduled interviews" value={stats.interviewsScheduled} icon={CalendarClock} tone="accent" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="p-6">
          <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-border/60 pb-3">
            <CardTitle>Latest Verified Vacancies</CardTitle>
            <Button asChildLink href="/teacher/dashboard/jobs" variant="ghost" size="sm" className="text-secondary font-medium">View all</Button>
          </CardHeader>
          {data.latestJobs.length === 0 ? (
            <EmptyState title="No job vacancies yet" description="Published teaching jobs matching your criteria will appear here." action={<Button asChildLink href="/teacher/dashboard/jobs" variant="secondary" fullWidth>Browse all jobs</Button>} />
          ) : (
            <ul className="mt-4 space-y-3">
              {data.latestJobs.map((job) => (
                <li key={job.id} className="rounded-xl border border-border bg-[#FAF9F5] p-4 transition hover:border-[#D0C9B8]">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-serif font-bold text-base text-primary">{job.title}</p>
                      <p className="text-sm font-medium text-secondary">{job.schoolName}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                        <MapPin className="size-3.5 shrink-0" aria-hidden />
                        <span>{job.location.city}, {job.location.state}{job.subject ? ` · ${job.subject}` : ""}</span>
                      </p>
                    </div>
                    <Button asChildLink href={`/jobs/${job.id}`} variant="outline" size="sm" className="shrink-0 border-border font-medium text-primary hover:border-accent">
                      Details
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-border/60 pb-3">
            <CardTitle>Recent Alerts</CardTitle>
            <Button asChildLink href="/teacher/dashboard/notifications" variant="ghost" size="sm" className="text-secondary font-medium">Open</Button>
          </CardHeader>
          {data.recentNotifications.length === 0 ? (
            <EmptyState title="No notifications" description="Alerts about applications, interviews, and verified records will appear here." />
          ) : (
            <ul className="mt-4 space-y-2.5">
              {data.recentNotifications.map((n) => (
                <li key={n.id} className={`rounded-xl border p-3.5 transition ${n.read ? "border-border bg-[#FAF9F5]" : "border-accent/40 bg-[#FAF5EB]"}`}>
                  <div className="flex items-start gap-2.5">
                    <Bell className={`mt-0.5 size-4 shrink-0 ${n.read ? "text-muted" : "text-accent-gold"}`} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${n.read ? "font-normal text-muted" : "font-bold text-primary"}`}>{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted leading-relaxed">{n.body}</p>
                      <p className="mt-1 text-[11px] text-muted">{new Date(n.createdAt).toLocaleString("en-IN")}</p>
                    </div>
                    {!n.read ? <span className="mt-1 size-2 shrink-0 rounded-full bg-accent-gold" aria-label="Unread" /> : null}
                  </div>
                  {n.href ? <Link href={n.href} className="mt-2 inline-flex text-xs font-semibold text-secondary hover:underline">View</Link> : null}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <CardHeader className="border-b border-border/60 pb-3">
          <CardTitle>Activity Summary</CardTitle>
        </CardHeader>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <SummaryRow icon={FileCheck2} label="Applications in progress" value={stats.pendingApplications + stats.shortlistedApplications} href="/teacher/dashboard/applications" />
          <SummaryRow icon={CalendarClock} label="Upcoming interviews" value={stats.interviewsScheduled} href="/teacher/dashboard/interviews" />
          <SummaryRow icon={Briefcase} label="Active jobs loaded" value={data.latestJobs.length} href="/teacher/dashboard/jobs" />
        </div>
      </Card>
    </div>
  );
}

function SummaryRow({ icon: Icon, label, value, href }: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; label: string; value: number; href: string }) {
  return (
    <Link href={href} className="flex items-center gap-3.5 rounded-xl border border-border bg-[#FAF9F5] p-4 transition-all hover:border-[#D0C9B8] hover:shadow-sm">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-soft-blue text-secondary border border-[#D5DFEB]">
        <Icon className="size-5" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="font-serif text-2xl font-bold text-primary">{value}</p>
        <p className="text-xs font-medium text-muted">{label}</p>
      </div>
    </Link>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-5" aria-label="Loading dashboard">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}
