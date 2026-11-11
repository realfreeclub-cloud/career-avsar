"use client";

import * as React from "react";
import {
  Search,
  RotateCcw,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { JobCard } from "@/components/public/job-card";
import { JobCardSkeleton } from "@/components/public/job-card-skeleton";
import type { PublicJob } from "@/server/services/public";
import { ACTIVE_REGIONAL_DISTRICTS } from "@/data/india-locations";

type JobsResponse = {
  ok: boolean;
  data?: { items: PublicJob[]; total: number; page: number; limit: number; hasMore: boolean };
  error?: { message: string };
};

const DEFAULT_DISTRICT_OPTIONS = ACTIVE_REGIONAL_DISTRICTS.map((d) => ({ value: d, label: d }));

const states = [{ value: "Uttar Pradesh", label: "Uttar Pradesh" }];

const subjects = [
  "Mathematics", "Science", "English", "Social Science", "Hindi", "Computer Science",
  "Physics", "Chemistry", "Biology", "Commerce", "Economics", "Physical Education",
  "Art & Craft", "Music", "Sanskrit", "Psychology",
].map((s) => ({ value: s, label: s }));

const categories = [
  "PGT (Post Graduate Teacher)",
  "TGT (Trained Graduate Teacher)",
  "PRT (Primary Teacher)",
  "Pre-Primary / Nursery Teacher",
  "Principal / Vice-Principal",
  "Professor / Lecturer",
  "Special Educator",
  "Activity / Sports Coach",
  "Other",
].map((s) => ({ value: s.split(" ")[0], label: s }));

const boards = ["CBSE", "ICSE", "State Board", "IB", "Cambridge / IGCSE"].map((s) => ({ value: s, label: s }));

const employmentTypes = ["Full-time", "Part-time", "Contractual", "Visiting"].map((s) => ({ value: s, label: s }));

export type JobsExplorerProps = {
  initialQuery?: {
    q?: string;
    subject?: string;
    district?: string;
    city?: string;
    state?: string;
    qualification?: string;
    category?: string;
    board?: string;
    employmentType?: string;
    interviewMode?: string;
    minExp?: number;
    sort?: "latest" | "deadline" | "salary";
  };
  compact?: boolean;
  pageSize?: number;
  showLoadMore?: boolean;
  headingId?: string;
};

export function JobsExplorer({
  initialQuery = {},
  compact = false,
  pageSize = 9,
  showLoadMore = true,
  headingId,
}: JobsExplorerProps) {
  // Filters
  const [q, setQ] = React.useState(initialQuery.q ?? "");
  const [subject, setSubject] = React.useState(initialQuery.subject ?? "");
  const [district, setDistrict] = React.useState(initialQuery.district ?? "");
  const [city, setCity] = React.useState(initialQuery.city ?? "");
  const [state, setState] = React.useState(initialQuery.state ?? "");
  const [qualification, setQualification] = React.useState(initialQuery.qualification ?? "");
  const [category, setCategory] = React.useState(initialQuery.category ?? "");
  const [board, setBoard] = React.useState(initialQuery.board ?? "");
  const [employmentType, setEmploymentType] = React.useState(initialQuery.employmentType ?? "");
  const [interviewMode, setInterviewMode] = React.useState(initialQuery.interviewMode ?? "");
  const [minExp, setMinExp] = React.useState<string>(initialQuery.minExp !== undefined ? String(initialQuery.minExp) : "");
  const [sort, setSort] = React.useState<"latest" | "deadline" | "salary">(initialQuery.sort ?? "latest");
  const [districtOptions, setDistrictOptions] = React.useState(DEFAULT_DISTRICT_OPTIONS);

  React.useEffect(() => {
    fetch("/api/public/locations")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok && Array.isArray(j.data?.items) && j.data.items.length > 0) {
          setDistrictOptions(
            j.data.items.map((loc: { district: string }) => ({
              value: loc.district,
              label: loc.district,
            })),
          );
        }
      })
      .catch(() => {});
  }, []);

  // View mode
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);

  // Active query applied to API
  const [applied, setApplied] = React.useState({
    ...initialQuery,
    sort: initialQuery.sort ?? "latest",
  });

  const [page, setPage] = React.useState(1);
  const [items, setItems] = React.useState<PublicJob[]>([]);
  const [total, setTotal] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const activeFiltersCount = [
    applied.subject,
    applied.district,
    applied.city,
    applied.state,
    applied.qualification,
    applied.category,
    applied.board,
    applied.employmentType,
    applied.interviewMode,
    typeof applied.minExp === "number",
  ].filter(Boolean).length;

  const load = React.useCallback(
    async (nextPage: number, replace: boolean, query: typeof applied) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (query?.q) params.set("q", query.q);
        if (query?.subject) params.set("subject", query.subject);
        if (query?.district) params.set("district", query.district);
        if (query?.city) params.set("city", query.city);
        if (query?.state) params.set("state", query.state);
        if (query?.qualification) params.set("qualification", query.qualification);
        if (query?.category) params.set("category", query.category);
        if (query?.board) params.set("board", query.board);
        if (query?.employmentType) params.set("employmentType", query.employmentType);
        if (query?.interviewMode) params.set("interviewMode", query.interviewMode);
        if (typeof query?.minExp === "number") params.set("minExp", String(query.minExp));
        if (query?.sort) params.set("sort", query.sort);
        params.set("page", String(nextPage));
        params.set("limit", String(pageSize));

        const res = await fetch(`/api/public/jobs?${params.toString()}`, { cache: "no-store" });
        const json = (await res.json()) as JobsResponse;
        if (!res.ok || !json.ok || !json.data) {
          throw new Error(json.error?.message || "Unable to load verified jobs");
        }
        setItems((prev) => (replace ? json.data!.items : [...prev, ...json.data!.items]));
        setTotal(json.data.total);
        setHasMore(json.data.hasMore);
        setPage(nextPage);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load jobs");
        if (replace) {
          setItems([]);
          setTotal(0);
          setHasMore(false);
        }
      } finally {
        setLoading(false);
      }
    },
    [pageSize],
  );

  React.useEffect(() => {
    load(1, true, applied);
  }, [applied, load]);

  function applyFilters() {
    setApplied({
      q: q.trim() || undefined,
      subject: subject || undefined,
      district: district || undefined,
      city: city.trim() || undefined,
      state: state || undefined,
      qualification: qualification.trim() || undefined,
      category: category || undefined,
      board: board || undefined,
      employmentType: employmentType || undefined,
      interviewMode: interviewMode || undefined,
      minExp: minExp !== "" ? Number(minExp) : undefined,
      sort,
    });
    setMobileDrawerOpen(false);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    applyFilters();
  }

  function onReset() {
    setQ("");
    setSubject("");
    setDistrict("");
    setCity("");
    setState("");
    setQualification("");
    setCategory("");
    setBoard("");
    setEmploymentType("");
    setInterviewMode("");
    setMinExp("");
    setSort("latest");
    setApplied({ sort: "latest" });
    setMobileDrawerOpen(false);
  }

  const FilterFormControls = (
    <div className="space-y-4">
      <Select
        label="Service District (Uttar Pradesh)"
        value={district}
        onChange={(e) => setDistrict(e.target.value)}
        options={[{ value: "", label: "All Service Districts" }, ...districtOptions]}
      />
      <Select
        label="Specialization / Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        options={[{ value: "", label: "All Subjects" }, ...subjects]}
      />
      <Select
        label="Teaching Wing / Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        options={[{ value: "", label: "All Categories" }, ...categories]}
      />
      <Select
        label="School Board Affiliation"
        value={board}
        onChange={(e) => setBoard(e.target.value)}
        options={[{ value: "", label: "All Boards" }, ...boards]}
      />
      <Select
        label="State / Region"
        value={state}
        onChange={(e) => setState(e.target.value)}
        options={[{ value: "", label: "All States" }, ...states]}
      />
      <Input
        label="City / Town"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="e.g. New Delhi, Pune, Bengaluru"
      />
      <Input
        label="Required Degree / Qualification"
        value={qualification}
        onChange={(e) => setQualification(e.target.value)}
        placeholder="e.g. B.Ed, M.Sc, M.A"
      />
      <Select
        label="Employment Type"
        value={employmentType}
        onChange={(e) => setEmploymentType(e.target.value)}
        options={[{ value: "", label: "All Types" }, ...employmentTypes]}
      />
      <Select
        label="Interview Format"
        value={interviewMode}
        onChange={(e) => setInterviewMode(e.target.value)}
        options={[
          { value: "", label: "All Formats" },
          { value: "Online", label: "Online Interview" },
          { value: "In-person", label: "In-Person Demo" },
          { value: "Hybrid", label: "Hybrid" },
        ]}
      />
      <Select
        label="Minimum Experience"
        value={minExp}
        onChange={(e) => setMinExp(e.target.value)}
        options={[
          { value: "", label: "Any Experience Level" },
          { value: "0", label: "Fresher Eligible (0+ Yrs)" },
          { value: "1", label: "1+ Years Experience" },
          { value: "2", label: "2+ Years Experience" },
          { value: "3", label: "3+ Years Experience" },
          { value: "5", label: "5+ Years Experience" },
        ]}
      />

      <div className="flex items-center gap-2.5 pt-3">
        <Button onClick={applyFilters} fullWidth className="bg-primary hover:bg-secondary text-white font-medium">
          Apply Filters
        </Button>
        <Button variant="outline" size="icon" onClick={onReset} title="Reset all filters" aria-label="Reset all filters">
          <RotateCcw className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6" id={headingId}>
      {/* Top Search & Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="rounded-2xl border border-border bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-secondary-text" aria-hidden />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by position title, school name, subject, or keyword..."
              className="pl-10"
              aria-label="Search job vacancies"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" className="bg-primary hover:bg-secondary text-white font-medium px-5">
              <Search className="size-4" aria-hidden />
              <span>Search</span>
            </Button>
            {/* Mobile Filter Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden flex items-center gap-1.5 border-border"
            >
              <SlidersHorizontal className="size-4 text-secondary" aria-hidden />
              <span>Filters</span>
              {activeFiltersCount > 0 ? (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
                  {activeFiltersCount}
                </span>
              ) : null}
            </Button>
            {activeFiltersCount > 0 ? (
              <Button type="button" variant="ghost" size="sm" onClick={onReset} className="hidden sm:inline-flex text-xs text-secondary-text">
                Reset
              </Button>
            ) : null}
          </div>
        </div>
      </form>

      {/* Main Content Layout with Desktop Sidebar Filters */}
      <div className={compact ? "" : "lg:grid lg:grid-cols-[280px_1fr] lg:gap-8 lg:items-start"}>
        {/* Desktop Sidebar Filters */}
        {!compact ? (
          <aside className="hidden lg:block sticky top-24 rounded-2xl border border-border bg-white p-5 shadow-xs">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-secondary" aria-hidden />
                <span className="font-serif text-base font-bold text-primary">Filter Vacancies</span>
              </div>
              {activeFiltersCount > 0 ? (
                <span className="rounded-full bg-soft-blue px-2.5 py-0.5 text-xs font-bold text-primary border border-[#D5DFEB]">
                  {activeFiltersCount} active
                </span>
              ) : null}
            </div>
            {FilterFormControls}
          </aside>
        ) : null}

        {/* Results Stream Area */}
        <div className="min-w-0 space-y-5">
          {/* Controls Bar: Count, Sort, and Grid/List toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white px-4 py-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-accent-gold" aria-hidden />
              <p className="text-sm font-medium text-main-text" aria-live="polite">
                Showing <span className="font-bold text-primary">{items.length}</span> of{" "}
                <span className="font-bold text-primary">{total}</span> verified position{total === 1 ? "" : "s"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort selector */}
              <div className="flex items-center gap-1.5 text-xs text-secondary-text">
                <span className="hidden sm:inline">Sort by:</span>
                <select
                  value={sort}
                  onChange={(e) => {
                    const nextSort = e.target.value as "latest" | "deadline" | "salary";
                    setSort(nextSort);
                    setApplied((prev) => ({ ...prev, sort: nextSort }));
                  }}
                  className="rounded-lg border border-border bg-[#FAF9F5] px-2.5 py-1 text-xs font-semibold text-primary focus:border-secondary focus:outline-none"
                >
                  <option value="latest">Latest Published</option>
                  <option value="deadline">Deadline Soonest</option>
                  <option value="salary">Highest Remuneration</option>
                </select>
              </div>

              {/* Grid / List toggle on Desktop */}
              <div className="hidden sm:flex items-center rounded-lg border border-border p-0.5 bg-[#FAF9F5]">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid layout view"
                  className={`flex size-7 items-center justify-center rounded-md text-xs transition-colors ${
                    viewMode === "grid" ? "bg-white text-primary shadow-xs font-bold" : "text-secondary-text hover:text-primary"
                  }`}
                >
                  <LayoutGrid className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  aria-label="List layout view"
                  className={`flex size-7 items-center justify-center rounded-md text-xs transition-colors ${
                    viewMode === "list" ? "bg-white text-primary shadow-xs font-bold" : "text-secondary-text hover:text-primary"
                  }`}
                >
                  <List className="size-4" aria-hidden />
                </button>
              </div>
            </div>
          </div>

          {error ? <ErrorState message={error} onRetry={() => load(1, true, applied)} /> : null}

          {!error && loading && items.length === 0 ? (
            <div className={`grid gap-5 ${viewMode === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`} aria-label="Loading verified jobs">
              {Array.from({ length: pageSize > 6 ? 6 : pageSize }).map((_, i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          ) : null}

          {!error && !loading && items.length === 0 ? (
            <EmptyState
              title="No vacancies matching these parameters"
              description="There are currently no published teaching opportunities that match all your selected filters. Adjust your subjects, location, or reset filters to discover other positions."
              action={
                <Button variant="secondary" onClick={onReset}>
                  Reset All Filters
                </Button>
              }
            />
          ) : null}

          {!error && items.length > 0 ? (
            <>
              <div className={`grid gap-5 ${viewMode === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                {items.map((job) => (
                  <JobCard key={job.id} job={job} viewMode={viewMode} />
                ))}
              </div>

              {showLoadMore && hasMore ? (
                <div className="flex justify-center pt-6">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => load(page + 1, false, applied)}
                    disabled={loading}
                    className="min-w-[220px] shadow-xs"
                  >
                    {loading ? "Retrieving more listings…" : "Load More Openings"}
                  </Button>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      {/* Mobile & Tablet Full-Screen Filter Drawer */}
      <Drawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        title="Refine Vacancies"
        side="right"
      >
        <div className="p-4 sm:p-5">
          <p className="mb-4 text-xs text-secondary-text">
            Filter institutional teaching opportunities across subjects, grades, qualifications, and locations.
          </p>
          {FilterFormControls}
        </div>
      </Drawer>
    </div>
  );
}
