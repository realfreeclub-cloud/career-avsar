import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  IndianRupee,
  CalendarClock,
  Building2,
  CheckCircle2,
  Award,
  BookOpen,
  Users,
  Video,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { buildMetadata } from "@/lib/seo/metadata";
import { getPublicJob } from "@/server/services/public";
import { formatDate, formatInrRange } from "@/lib/utils/format";
import { Card, CardHeader, CardTitle, EmptyState } from "@/components/ui";
import { JobApplySection } from "@/components/public/job-apply-section";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const job = await getPublicJob(id);
  if (!job) return buildMetadata({ title: "Job Details", path: `/jobs/${id}` });
  return buildMetadata({
    title: `${job.title} at ${job.schoolName}`,
    description: `Teaching vacancy: ${job.title} in ${job.location.city}, ${job.location.state}. ${job.qualification}.`,
    path: `/jobs/${id}`,
  });
}

export default async function JobDetailsPage({ params }: Props) {
  const { id } = await params;
  if (!/^[a-fA-F0-9]{24}$/.test(id)) notFound();
  const job = await getPublicJob(id);

  if (!job) {
    return (
      <div className="container-safe py-12 sm:py-16">
        <EmptyState
          title="Vacancy Not Found"
          description="This teaching listing may have been closed, archived, or the URL might be invalid."
          action={<Link href="/jobs" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white">Browse All Jobs</Link>}
        />
      </div>
    );
  }

  const salary = formatInrRange(job.salaryMinInr, job.salaryMaxInr);
  const deadline = formatDate(job.applicationDeadline);

  const baseUrl = process.env.APP_URL || "http://localhost:3000";
  const districtSlug = job.location.district ? job.location.district.toLowerCase().replace(/\s+/g, "-") : "";

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Teaching Jobs", item: `${baseUrl}/jobs` },
      ...(job.location.district
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: `Teaching Jobs in ${job.location.district}`,
              item: `${baseUrl}/teaching-jobs-in-${districtSlug}`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: job.title,
              item: `${baseUrl}/jobs/${job.id}`,
            },
          ]
        : [
            {
              "@type": "ListItem",
              position: 3,
              name: job.title,
              item: `${baseUrl}/jobs/${job.id}`,
            },
          ]),
    ],
  };

  const jobPostingSchema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description || `${job.title} at ${job.schoolName}`,
    datePosted: job.publishedAt ? new Date(job.publishedAt).toISOString() : new Date().toISOString(),
    validThrough: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString() : undefined,
    employmentType: job.employmentType ? job.employmentType.toUpperCase().replace(/\s+/g, "_") : "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: job.schoolName,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location.city || job.location.district,
        addressRegion: job.location.state || "Uttar Pradesh",
        addressCountry: "IN",
      },
    },
    ...(job.salaryMinInr && job.salaryMaxInr
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: "INR",
            value: {
              "@type": "QuantitativeValue",
              minValue: job.salaryMinInr,
              maxValue: job.salaryMaxInr,
              unitText: job.salaryPeriod === "yearly" ? "YEAR" : "MONTH",
            },
          },
        }
      : {}),
  };

  return (
    <article className="container-safe py-8 sm:py-12 lg:py-14 pb-24 sm:pb-14">
      {/* Structured Data: JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
      />
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-secondary-text">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <Link href="/jobs" className="hover:text-primary transition-colors">Vacancies</Link>
        {job.location.district ? (
          <>
            <span>/</span>
            <Link
              href={`/teaching-jobs-in-${job.location.district.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-secondary hover:underline font-medium"
            >
              Jobs in {job.location.district}
            </Link>
          </>
        ) : null}
        <span>/</span>
        <span className="text-primary font-semibold truncate max-w-[200px] sm:max-w-xs">{job.title}</span>
      </nav>

      {/* Back link */}
      <div className="mb-6">
        <Link href="/jobs" className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:underline">
          <ArrowLeft aria-hidden className="size-4" /> Back to Verified Vacancies
        </Link>
      </div>

      {/* Expired / Paused Warning Banner */}
      {job.isExpired ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/80 p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
          <AlertTriangle className="size-5 text-red-600 shrink-0 mt-0.5" aria-hidden />
          <div>
            <h2 className="font-serif text-base font-bold text-red-900">Application Deadline Passed</h2>
            <p className="mt-0.5 text-xs sm:text-sm text-red-800 leading-relaxed">
              This teaching position expired on {deadline || "recently"} and is no longer accepting candidate submissions. You can review the requirements for reference or browse active openings.
            </p>
          </div>
        </div>
      ) : job.status === "paused" ? (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
          <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" aria-hidden />
          <div>
            <h2 className="font-serif text-base font-bold text-amber-900">Application Review in Progress</h2>
            <p className="mt-0.5 text-xs sm:text-sm text-amber-800 leading-relaxed">
              New submissions for this vacancy are temporarily paused while the panel reviews active candidate dossiers.
            </p>
          </div>
        </div>
      ) : null}

      {/* Main Header Banner */}
      <header className="rounded-3xl border border-border bg-white p-6 sm:p-8 lg:p-10 shadow-sm relative overflow-hidden">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center rounded-full bg-[#FAF5EB] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#8F7032] border border-[#E9DCBF]">
            {job.category}
          </span>
          {job.subject ? (
            <span className="inline-flex items-center rounded-full bg-soft-blue px-3 py-1 text-xs font-semibold text-secondary border border-[#D5DFEB]">
              {job.subject}
            </span>
          ) : null}
          {job.board ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary border border-border">
              <BookOpen className="size-3.5 text-secondary" aria-hidden />
              <span>{job.board} Board</span>
            </span>
          ) : null}
          {job.employmentType ? (
            <span className="inline-flex items-center rounded-full bg-[#FAF9F5] px-3 py-1 text-xs font-medium text-secondary-text border border-border">
              {job.employmentType}
            </span>
          ) : null}
        </div>

        <h1 className="mt-4 font-serif text-2xl font-bold tracking-tight text-primary sm:text-3xl lg:text-4xl">
          {job.title}
        </h1>

        <p className="mt-2.5 flex items-center gap-2 text-base font-bold text-secondary sm:text-lg">
          <Building2 aria-hidden className="size-5 shrink-0 text-secondary-text" />
          <span>{job.schoolName}</span>
        </p>

        {/* Specifications Grid */}
        <dl className="mt-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border/80 bg-[#FAF9F5] p-4">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary-text">
              <MapPin aria-hidden className="size-4 text-secondary" /> Location
            </dt>
            <dd className="mt-1.5 text-sm font-bold text-primary">
              {[job.location.city, job.location.district, job.location.state].filter(Boolean).join(", ")}
            </dd>
          </div>

          <div className="rounded-2xl border border-border/80 bg-[#FAF9F5] p-4">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary-text">
              <Briefcase aria-hidden className="size-4 text-secondary" /> Experience Required
            </dt>
            <dd className="mt-1.5 text-sm font-bold text-primary">{job.experience}</dd>
          </div>

          <div className="rounded-2xl border border-border/80 bg-[#FAF9F5] p-4">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary-text">
              <IndianRupee aria-hidden className="size-4 text-accent-gold" /> Remuneration
            </dt>
            <dd className="mt-1.5 text-sm font-bold text-primary">
              {salary ? `${salary} ${job.salaryPeriod === "yearly" ? "/ yr" : "/ mo"}` : "As per Institution Norms"}
            </dd>
          </div>

          <div className="rounded-2xl border border-border/80 bg-[#FAF9F5] p-4">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary-text">
              <CalendarClock aria-hidden className="size-4 text-secondary" /> Application Deadline
            </dt>
            <dd className="mt-1.5 text-sm font-bold text-primary">
              {deadline || "Rolling Consideration"}
            </dd>
          </div>
        </dl>

        {/* Application CTA Container */}
        <JobApplySection job={job} />
      </header>

      {/* Main Details and Sidebar */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          {/* Eligibility & Qualifications Card */}
          <Card className="border border-border p-6 sm:p-7 shadow-xs">
            <CardHeader className="px-0 pt-0 pb-4 border-b border-border mb-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-secondary" aria-hidden />
                <CardTitle className="font-serif text-xl font-bold text-primary">Eligibility & Mandatory Criteria</CardTitle>
              </div>
            </CardHeader>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border/60 bg-[#FAF9F5] p-3.5">
                <dt className="text-xs font-semibold uppercase tracking-wider text-secondary-text">Academic Degree</dt>
                <dd className="mt-1 text-sm font-bold text-primary break-words">{job.qualification}</dd>
              </div>

              <div className="rounded-xl border border-border/60 bg-[#FAF9F5] p-3.5">
                <dt className="text-xs font-semibold uppercase tracking-wider text-secondary-text">Professional Training (B.Ed / D.El.Ed)</dt>
                <dd className="mt-1 text-sm font-bold text-primary">
                  {job.trainingRequirements || "B.Ed or equivalent teacher training recognized by NCTE"}
                </dd>
              </div>

              <div className="rounded-xl border border-border/60 bg-[#FAF9F5] p-3.5">
                <dt className="text-xs font-semibold uppercase tracking-wider text-secondary-text">CTET / TET Eligibility</dt>
                <dd className="mt-1 text-sm font-bold text-primary">
                  {job.ctetRequired || "CTET / State TET preferred as per applicable norms"}
                </dd>
              </div>

              <div className="rounded-xl border border-border/60 bg-[#FAF9F5] p-3.5">
                <dt className="text-xs font-semibold uppercase tracking-wider text-secondary-text">Interview Format</dt>
                <dd className="mt-1 text-sm font-bold text-primary flex items-center gap-1.5">
                  <Video className="size-4 text-secondary shrink-0" aria-hidden />
                  <span>{job.interviewMode || "Online Video Evaluation"}</span>
                </dd>
              </div>
            </dl>
          </Card>

          {/* Role Description */}
          {job.description ? (
            <Card className="border border-border p-6 sm:p-7 shadow-xs">
              <CardHeader className="px-0 pt-0 pb-4 border-b border-border mb-4">
                <CardTitle className="font-serif text-xl font-bold text-primary">Role Overview & Institutional Context</CardTitle>
              </CardHeader>
              <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed text-main-text">{job.description}</p>
            </Card>
          ) : null}

          {/* Responsibilities */}
          {job.responsibilities?.length ? (
            <Card className="border border-border p-6 sm:p-7 shadow-xs">
              <CardHeader className="px-0 pt-0 pb-4 border-b border-border mb-4">
                <CardTitle className="font-serif text-xl font-bold text-primary">Academic Responsibilities</CardTitle>
              </CardHeader>
              <ul className="space-y-3 text-sm sm:text-base text-main-text">
                {job.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 aria-hidden className="size-5 shrink-0 text-accent-gold mt-0.5" />
                    <span className="leading-relaxed">{r}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {/* Requirements */}
          {job.requirements?.length ? (
            <Card className="border border-border p-6 sm:p-7 shadow-xs">
              <CardHeader className="px-0 pt-0 pb-4 border-b border-border mb-4">
                <CardTitle className="font-serif text-xl font-bold text-primary">Specific Candidate Requirements</CardTitle>
              </CardHeader>
              <ul className="space-y-3 text-sm sm:text-base text-main-text">
                {job.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 aria-hidden className="size-5 shrink-0 text-secondary mt-0.5" />
                    <span className="leading-relaxed">{r}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>

        {/* Sidebar Summary */}
        <aside className="space-y-6">
          <Card className="border border-border p-6 shadow-xs sticky top-24">
            <CardHeader className="px-0 pt-0 pb-3 border-b border-border mb-4">
              <CardTitle className="font-serif text-lg font-bold text-primary">Institutional Vacancy Snapshot</CardTitle>
            </CardHeader>
            <dl className="space-y-3.5 text-sm">
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <dt className="text-secondary-text">Subject Specialization</dt>
                <dd className="font-bold text-primary">{job.subject}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <dt className="text-secondary-text">Teaching Wing</dt>
                <dd className="font-bold text-primary">{job.category}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <dt className="text-secondary-text">School Board</dt>
                <dd className="font-bold text-primary">{job.board || "CBSE / State"}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <dt className="text-secondary-text">Open Positions</dt>
                <dd className="font-bold text-primary flex items-center gap-1">
                  <Users className="size-3.5 text-secondary" aria-hidden />
                  <span>{job.vacanciesCount || 1} Openings</span>
                </dd>
              </div>
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <dt className="text-secondary-text">Employment Type</dt>
                <dd className="font-bold text-primary">{job.employmentType || "Full-time"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-secondary-text">Institutional Status</dt>
                <dd className="font-semibold text-emerald-700 flex items-center gap-1">
                  <Award className="size-3.5" aria-hidden />
                  <span>Verified Partner</span>
                </dd>
              </div>
            </dl>
          </Card>
        </aside>
      </div>
    </article>
  );
}
