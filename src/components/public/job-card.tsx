import Link from "next/link";
import { MapPin, Briefcase, GraduationCap, IndianRupee, CalendarClock, Building2, ArrowRight, BookOpen, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, formatInrRange } from "@/lib/utils/format";
import type { PublicJob } from "@/server/services/public";

export function JobCard({ job, viewMode = "grid" }: { job: PublicJob; viewMode?: "grid" | "list" }) {
  const salary = formatInrRange(job.salaryMinInr, job.salaryMaxInr);
  const deadline = formatDate(job.applicationDeadline);
  const isList = viewMode === "list";

  return (
    <article
      className={`group relative flex min-w-0 rounded-2xl border border-border bg-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D0C9B8] hover:shadow-md ${
        isList ? "flex-col p-5 md:flex-row md:items-center md:justify-between md:gap-6 md:p-6" : "h-full flex-col p-5 sm:p-6"
      }`}
    >
      <div className="min-w-0 flex-1">
        {/* Category, Subject, Board & Status Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-[#FAF5EB] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-[#8F7032] border border-[#E9DCBF]">
            {job.category}
          </span>
          {job.subject ? (
            <span className="inline-flex items-center rounded-full bg-soft-blue px-2.5 py-0.5 text-xs font-semibold text-secondary border border-[#D5DFEB]">
              {job.subject}
            </span>
          ) : null}
          {job.board ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs font-medium text-secondary-text border border-border">
              <BookOpen className="size-3 text-secondary" aria-hidden />
              <span>{job.board}</span>
            </span>
          ) : null}
          {job.vacanciesCount && job.vacanciesCount > 1 ? (
            <span className="inline-flex items-center rounded-full bg-[#F4F1EA] px-2 py-0.5 text-xs font-medium text-primary">
              {job.vacanciesCount} Vacancies
            </span>
          ) : null}
          {job.isExpired ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700 border border-red-200">
              <AlertCircle className="size-3" aria-hidden />
              <span>Expired</span>
            </span>
          ) : null}
        </div>

        {/* Job Title */}
        <h3 className="mt-2.5 font-serif text-lg font-bold leading-snug text-primary transition-colors group-hover:text-secondary sm:text-xl">
          <Link href={`/jobs/${job.id}`} className="rounded-sm focus-visible:outline-none">
            {job.title}
          </Link>
        </h3>

        {/* Institution Name */}
        <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-secondary">
          <Building2 aria-hidden className="size-4 shrink-0 text-secondary-text" />
          <span className="truncate">{job.schoolName}</span>
        </p>

        {/* Meta Specifications */}
        <dl className={`mt-3.5 text-sm text-secondary-text ${isList ? "flex flex-wrap gap-x-5 gap-y-1.5" : "space-y-1.5"}`}>
          <div className="flex items-center gap-1.5">
            <MapPin aria-hidden="true" className="size-3.5 shrink-0 text-secondary" />
            <dt className="sr-only">Location</dt>
            <dd className="font-medium text-main-text">
              {[job.location.city, job.location.district, job.location.state].filter(Boolean).join(", ")}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <GraduationCap aria-hidden="true" className="size-3.5 shrink-0 text-secondary" />
            <dt className="sr-only">Qualification</dt>
            <dd className="break-words text-main-text/90 truncate max-w-[280px]">{job.qualification}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Briefcase aria-hidden="true" className="size-3.5 shrink-0 text-secondary" />
            <dt className="sr-only">Experience</dt>
            <dd className="text-main-text/90">{job.experience}</dd>
          </div>
        </dl>

        {/* Salary & Deadline Pill */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
          {salary ? (
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6E2D9] bg-[#FAF9F5] px-2.5 py-1 text-xs sm:text-sm font-semibold text-primary">
              <IndianRupee aria-hidden className="size-3.5 text-accent-gold shrink-0" />
              <span>{salary} {job.salaryPeriod === "yearly" ? "/ yr" : "/ mo"}</span>
            </div>
          ) : null}
          {deadline ? (
            <div className="flex items-center gap-1 text-xs text-secondary-text">
              <CalendarClock aria-hidden className="size-3.5 shrink-0" />
              <span>Deadline: {deadline}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Action CTA */}
      <div className={`mt-5 pt-3.5 border-t border-border/60 ${isList ? "md:mt-0 md:pt-0 md:border-t-0 md:shrink-0" : ""}`}>
        <Button
          asChildLink
          href={`/jobs/${job.id}`}
          variant={job.isExpired ? "outline" : "secondary"}
          fullWidth={!isList}
          className="group/btn justify-between md:justify-center md:px-5"
        >
          <span>{job.isExpired ? "View Archive" : "View Details & Apply"}</span>
          <ArrowRight aria-hidden className="size-4 text-secondary transition-transform group-hover/btn:translate-x-1" />
        </Button>
      </div>
    </article>
  );
}
