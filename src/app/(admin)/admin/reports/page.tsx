"use client";

import * as React from "react";
import {
  AdminPage,
  Card,
  Button,
  ErrorState,
  Skeleton,
} from "@/components/admin/ui";
import {
  Calendar,
  Download,
  Users,
  Building2,
  Briefcase,
  FileText,
  CalendarDays,
  Award,
  TrendingUp,
  MapPin,
  GraduationCap,
  Clock,
  CheckCircle2,
  Layers,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ComprehensiveReports = {
  totals: {
    teachers: number;
    schools: number;
    jobs: number;
    applications: number;
    interviews: number;
    placements: number;
  };
  registrationsTimeline: Array<{ date: string; count: number }>;
  stateWise: Array<{ state: string; count: number; verifiedCount: number }>;
  districtWise: Array<{ district: string; state: string; count: number }>;
  qualificationDistribution: Array<{ label: string; count: number; percentage: number }>;
  subjectDistribution: Array<{ subject: string; count: number }>;
  experienceDistribution: Array<{ bracket: string; count: number; percentage: number }>;
  vacancyPerformance: Array<{
    id: string;
    title: string;
    schoolName: string;
    category: string;
    applicantsCount: number;
    viewsCount: number;
    status: string;
    deadline?: string;
  }>;
  applicationsByVacancy: Array<{
    vacancyTitle: string;
    schoolName: string;
    total: number;
    shortlisted: number;
    selected: number;
    rejected: number;
  }>;
  applicationStatuses: Array<{ status: string; count: number }>;
  interviewsBreakdown: {
    byStatus: Array<{ status: string; count: number }>;
    byMode: Array<{ mode: string; count: number }>;
    byResult: Array<{ result: string; count: number }>;
  };
  selections: Array<{
    candidateName: string;
    jobTitle: string;
    schoolName: string;
    selectedAt: string;
  }>;
  placements: Array<{ status: string; count: number }>;
};

type PresetKey = "7d" | "30d" | "90d" | "1y" | "all";

export default function AdminReportsPage() {
  const [data, setData] = React.useState<ComprehensiveReports | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [preset, setPreset] = React.useState<PresetKey>("all");
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");

  const loadReports = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();

      if (preset !== "all") {
        const now = new Date();
        const f = new Date();
        if (preset === "7d") f.setDate(now.getDate() - 7);
        else if (preset === "30d") f.setDate(now.getDate() - 30);
        else if (preset === "90d") f.setDate(now.getDate() - 90);
        else if (preset === "1y") f.setFullYear(now.getFullYear() - 1);
        params.set("from", f.toISOString().split("T")[0]);
        params.set("to", now.toISOString().split("T")[0]);
      } else if (fromDate || toDate) {
        if (fromDate) params.set("from", fromDate);
        if (toDate) params.set("to", toDate);
      }

      const res = await fetch(`/api/admin/reports?${params.toString()}`, { credentials: "same-origin" });
      if (!res.ok) throw new Error("Failed to load reports and analytics data");
      const json = await res.json();
      setData(json.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to generate analytics reports");
    } finally {
      setLoading(false);
    }
  }, [preset, fromDate, toDate]);

  React.useEffect(() => {
    loadReports();
  }, [loadReports]);

  function handlePresetChange(p: PresetKey) {
    setPreset(p);
    setFromDate("");
    setToDate("");
  }

  function downloadCsv(category: string) {
    const params = new URLSearchParams();
    params.set("format", "csv");
    params.set("report", category);

    if (preset !== "all") {
      const now = new Date();
      const f = new Date();
      if (preset === "7d") f.setDate(now.getDate() - 7);
      else if (preset === "30d") f.setDate(now.getDate() - 30);
      else if (preset === "90d") f.setDate(now.getDate() - 90);
      else if (preset === "1y") f.setFullYear(now.getFullYear() - 1);
      params.set("from", f.toISOString().split("T")[0]);
      params.set("to", now.toISOString().split("T")[0]);
    } else {
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
    }

    // Direct window trigger for clean download
    window.location.href = `/api/admin/reports?${params.toString()}`;
  }

  return (
    <AdminPage
      title="Analytics & Institutional Reports"
      subtitle="Real-time operational metrics, talent distribution, vacancy performance, and institutional recruitment velocity."
      actions={
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadCsv("summary")}
            className="gap-1.5 border-border bg-white text-secondary hover:bg-soft-blue"
          >
            <Download className="size-4 text-accent-gold" />
            <span>Export Platform Summary (CSV)</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={loadReports}
            title="Refresh analytics"
            className="text-muted hover:bg-soft-blue hover:text-primary"
          >
            <RefreshCw className={cn("size-4", loading && "animate-spin text-secondary")} />
          </Button>
        </div>
      }
    >
      {/* Date Range & Presets Filter Panel */}
      <Card className="p-4 bg-white border-border/80 shadow-2xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-muted mr-1.5 flex items-center gap-1">
              <Calendar className="size-3.5 text-accent-gold" /> Time Window:
            </span>
            {[
              { id: "all", label: "All Time" },
              { id: "7d", label: "Last 7 Days" },
              { id: "30d", label: "Last 30 Days" },
              { id: "90d", label: "Last 90 Days" },
              { id: "1y", label: "Past Year" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePresetChange(p.id as PresetKey)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                  preset === p.id && !fromDate
                    ? "bg-primary text-white shadow-xs"
                    : "bg-[#FAF9F5] text-muted hover:bg-soft-blue hover:text-primary border border-border/70",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted">Custom:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPreset("all");
              }}
              className="rounded-lg border border-border bg-[#FAF9F5] px-2.5 py-1 text-xs text-text focus:border-secondary focus:bg-white focus:outline-none"
            />
            <span className="text-xs text-muted">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPreset("all");
              }}
              className="rounded-lg border border-border bg-[#FAF9F5] px-2.5 py-1 text-xs text-text focus:border-secondary focus:bg-white focus:outline-none"
            />
            {(fromDate || toDate) ? (
              <button
                type="button"
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                  setPreset("all");
                }}
                className="text-xs text-danger hover:underline"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>
      </Card>

      {/* KPI Highlight Tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-border bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Teachers</span>
            <Users className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-primary">{data?.totals.teachers ?? 0}</p>
          <span className="text-[10px] text-muted">Registered educators</span>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Schools</span>
            <Building2 className="size-4 text-secondary" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-secondary">{data?.totals.schools ?? 0}</p>
          <span className="text-[10px] text-muted">Affiliated institutions</span>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Vacancies</span>
            <Briefcase className="size-4 text-accent-gold" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-primary">{data?.totals.jobs ?? 0}</p>
          <span className="text-[10px] text-muted">Teaching positions</span>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Applications</span>
            <FileText className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-primary">{data?.totals.applications ?? 0}</p>
          <span className="text-[10px] text-muted">Submitted dossiers</span>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Interviews</span>
            <CalendarDays className="size-4 text-secondary" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-secondary">{data?.totals.interviews ?? 0}</p>
          <span className="text-[10px] text-muted">Conducted rounds</span>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Placements</span>
            <Award className="size-4 text-emerald-600" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-emerald-800">{data?.totals.placements ?? 0}</p>
          <span className="text-[10px] text-emerald-700 font-medium">Joined faculty</span>
        </div>
      </div>

      {loading && !data ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-64 rounded-2xl bg-white border border-border" />
          <Skeleton className="h-64 rounded-2xl bg-white border border-border" />
          <Skeleton className="h-64 rounded-2xl bg-white border border-border" />
          <Skeleton className="h-64 rounded-2xl bg-white border border-border" />
        </div>
      ) : null}

      {error ? (
        <ErrorState title="Unable to load reports" message={error} onRetry={loadReports} />
      ) : null}

      {data ? (
        <div className="space-y-6">
          {/* Section 1: Teacher Registrations Timeline & State Distribution */}
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Timeline */}
            <Card className="p-5 bg-white border-border/80 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="size-4 text-secondary" />
                    <h3 className="font-serif text-base font-bold text-primary">
                      Teacher Registrations Trend
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadCsv("registrations")}
                    className="flex items-center gap-1 text-xs font-semibold text-secondary hover:text-primary"
                  >
                    <Download className="size-3.5" /> CSV
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted">Daily candidate onboarding volume across active districts.</p>

                {data.registrationsTimeline.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted">No registration data in selected period</div>
                ) : (
                  <div className="mt-4">
                    {/* SVG Trend Bar Chart */}
                    <div className="h-44 w-full flex items-end gap-1.5 pt-4 pb-2 border-b border-border/60">
                      {(() => {
                        const maxCount = Math.max(1, ...data.registrationsTimeline.map((d) => d.count));
                        return data.registrationsTimeline.slice(-15).map((point) => {
                          const heightPct = Math.max(10, Math.round((point.count / maxCount) * 100));
                          return (
                            <div key={point.date} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                              <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition">
                                {point.count}
                              </span>
                              <div
                                style={{ height: `${heightPct}%` }}
                                className="w-full max-w-[28px] rounded-t-md bg-gradient-to-t from-secondary to-primary group-hover:from-accent-gold group-hover:to-accent transition-all duration-200"
                              />
                              <span className="text-[9px] text-muted truncate max-w-full">
                                {point.date.slice(5)}
                              </span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* State-wise Distribution */}
            <Card className="p-5 bg-white border-border/80 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-accent-gold" />
                    <h3 className="font-serif text-base font-bold text-primary">
                      State-Wise Candidate Pool
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadCsv("state_wise")}
                    className="flex items-center gap-1 text-xs font-semibold text-secondary hover:text-primary"
                  >
                    <Download className="size-3.5" /> CSV
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted">Top states by candidate volume & credential verification.</p>

                {data.stateWise.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted">No state records registered</div>
                ) : (
                  <div className="mt-4 space-y-2.5 max-h-52 overflow-y-auto pr-1">
                    {(() => {
                      const maxStateCount = Math.max(1, ...data.stateWise.map((s) => s.count));
                      return data.stateWise.slice(0, 7).map((s) => {
                        const pct = Math.round((s.count / maxStateCount) * 100);
                        return (
                          <div key={s.state} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-primary">{s.state}</span>
                              <span className="text-muted">
                                <strong>{s.count}</strong> candidates ({s.verifiedCount} verified)
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-[#FAF9F5] border border-border/60 overflow-hidden">
                              <div
                                style={{ width: `${pct}%` }}
                                className="h-full rounded-full bg-gradient-to-r from-secondary to-accent-gold"
                              />
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Section 2: Qualifications & Experience Distribution */}
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Qualification Distribution */}
            <Card className="p-5 bg-white border-border/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="size-4 text-primary" />
                  <h3 className="font-serif text-base font-bold text-primary">
                    Teacher Credentials & Certifications
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => downloadCsv("qualifications")}
                  className="flex items-center gap-1 text-xs font-semibold text-secondary hover:text-primary"
                >
                  <Download className="size-3.5" /> CSV
                </button>
              </div>
              <p className="mt-1 text-xs text-muted">Statutory NCTE credentials held by registered educators.</p>

              <div className="mt-4 space-y-3">
                {data.qualificationDistribution.map((q) => (
                  <div key={q.label} className="flex items-center justify-between rounded-xl border border-border/70 bg-[#FAF9F5] p-3 text-xs">
                    <div>
                      <span className="font-bold text-primary block">{q.label}</span>
                      <span className="text-[11px] text-muted">{q.count} verified educators</span>
                    </div>
                    <span className="rounded-full bg-soft-blue border border-[#D5DFEB] px-2.5 py-1 font-bold text-primary">
                      {q.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Experience Distribution */}
            <Card className="p-5 bg-white border-border/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-secondary" />
                  <h3 className="font-serif text-base font-bold text-primary">
                    Experience Level Brackets
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => downloadCsv("experience")}
                  className="flex items-center gap-1 text-xs font-semibold text-secondary hover:text-primary"
                >
                  <Download className="size-3.5" /> CSV
                </button>
              </div>
              <p className="mt-1 text-xs text-muted">Classroom teaching seniority across the talent pool.</p>

              <div className="mt-4 space-y-3">
                {data.experienceDistribution.map((exp) => (
                  <div key={exp.bracket} className="flex items-center justify-between rounded-xl border border-border/70 bg-[#FAF9F5] p-3 text-xs">
                    <div>
                      <span className="font-bold text-primary block">{exp.bracket}</span>
                      <span className="text-[11px] text-muted">{exp.count} educators</span>
                    </div>
                    <span className="rounded-full bg-soft-blue border border-[#D5DFEB] px-2.5 py-1 font-bold text-secondary">
                      {exp.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Section 3: Vacancy Performance & Application Pipeline */}
          <div className="grid gap-5 lg:grid-cols-3">
            {/* Vacancy Performance */}
            <Card className="lg:col-span-2 p-5 bg-white border-border/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="size-4 text-accent-gold" />
                  <h3 className="font-serif text-base font-bold text-primary">
                    Vacancy Engagement & Conversion
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => downloadCsv("vacancies")}
                  className="flex items-center gap-1 text-xs font-semibold text-secondary hover:text-primary"
                >
                  <Download className="size-3.5" /> CSV
                </button>
              </div>
              <p className="mt-1 text-xs text-muted">Views, applications, and current status of teaching vacancies.</p>

              {data.vacancyPerformance.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted">No vacancies registered</div>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/80 text-[11px] font-semibold text-muted uppercase">
                        <th className="pb-2.5 font-bold">Position & School</th>
                        <th className="pb-2.5 font-bold">Category</th>
                        <th className="pb-2.5 font-bold text-center">Applicants</th>
                        <th className="pb-2.5 font-bold text-center">Views</th>
                        <th className="pb-2.5 font-bold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {data.vacancyPerformance.slice(0, 6).map((v) => (
                        <tr key={v.id} className="hover:bg-soft-blue/30 transition">
                          <td className="py-2.5">
                            <p className="font-semibold text-primary">{v.title}</p>
                            <p className="text-[11px] text-muted">{v.schoolName}</p>
                          </td>
                          <td className="py-2.5 text-muted">{v.category}</td>
                          <td className="py-2.5 text-center font-bold text-primary">{v.applicantsCount}</td>
                          <td className="py-2.5 text-center text-muted">{v.viewsCount}</td>
                          <td className="py-2.5 text-right">
                            <span className="rounded-md bg-[#FAF9F5] border border-border px-2 py-0.5 text-[10px] font-bold uppercase text-muted capitalize">
                              {v.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Application Funnel Statuses */}
            <Card className="p-5 bg-white border-border/80 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="size-4 text-primary" />
                    <h3 className="font-serif text-base font-bold text-primary">
                      Application Funnel
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadCsv("applications")}
                    className="flex items-center gap-1 text-xs font-semibold text-secondary hover:text-primary"
                  >
                    <Download className="size-3.5" /> CSV
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted">Applications across hiring lifecycle stages.</p>

                <div className="mt-4 space-y-2 max-h-64 overflow-y-auto pr-1">
                  {data.applicationStatuses.map((st) => (
                    <div key={st.status} className="flex items-center justify-between rounded-lg border border-border/60 bg-[#FAF9F5] px-3 py-2 text-xs">
                      <span className="capitalize font-medium text-text">{st.status.replace(/_/g, " ")}</span>
                      <span className="font-bold text-primary">{st.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Section 4: Interviews, Selections & Final Placements */}
          <div className="grid gap-5 lg:grid-cols-3">
            {/* Interviews */}
            <Card className="p-5 bg-white border-border/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-secondary" />
                  <h3 className="font-serif text-base font-bold text-primary">
                    Interview Rounds
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => downloadCsv("interviews")}
                  className="flex items-center gap-1 text-xs font-semibold text-secondary hover:text-primary"
                >
                  <Download className="size-3.5" /> CSV
                </button>
              </div>
              <p className="mt-1 text-xs text-muted">Demonstrations & formal interviews conducted.</p>

              <div className="mt-4 space-y-2">
                {data.interviewsBreakdown.byStatus.map((st) => (
                  <div key={st.status} className="flex items-center justify-between rounded-lg border border-border/60 bg-[#FAF9F5] px-3 py-2 text-xs">
                    <span className="capitalize font-medium text-text">{st.status}</span>
                    <span className="font-bold text-secondary">{st.count}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Selections */}
            <Card className="p-5 bg-white border-border/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <h3 className="font-serif text-base font-bold text-primary">
                    Recent Selections
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => downloadCsv("selections")}
                  className="flex items-center gap-1 text-xs font-semibold text-secondary hover:text-primary"
                >
                  <Download className="size-3.5" /> CSV
                </button>
              </div>
              <p className="mt-1 text-xs text-muted">Candidates marked selected following interview demo.</p>

              <div className="mt-4 space-y-2 max-h-52 overflow-y-auto">
                {data.selections.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted">No selections recorded yet</div>
                ) : (
                  data.selections.slice(0, 5).map((sel, idx) => (
                    <div key={idx} className="rounded-lg border border-border/60 bg-[#FAF9F5] p-2.5 text-xs">
                      <p className="font-bold text-primary">{sel.candidateName}</p>
                      <p className="text-[11px] text-muted">{sel.jobTitle} • {sel.schoolName}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Placements */}
            <Card className="p-5 bg-white border-border/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="size-4 text-emerald-700" />
                  <h3 className="font-serif text-base font-bold text-primary">
                    Placement Pipeline
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => downloadCsv("placements")}
                  className="flex items-center gap-1 text-xs font-semibold text-secondary hover:text-primary"
                >
                  <Download className="size-3.5" /> CSV
                </button>
              </div>
              <p className="mt-1 text-xs text-muted">Official offers accepted & joined faculty.</p>

              <div className="mt-4 space-y-2">
                {data.placements.map((p) => (
                  <div key={p.status} className="flex items-center justify-between rounded-lg border border-border/60 bg-[#FAF9F5] px-3 py-2 text-xs">
                    <span className="capitalize font-medium text-text">{p.status.replace(/_/g, " ")}</span>
                    <span className="font-bold text-emerald-800">{p.count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </AdminPage>
  );
}
