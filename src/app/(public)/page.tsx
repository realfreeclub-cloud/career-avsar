import Link from "next/link";
import {
  BookOpen,
  Calculator,
  FlaskConical,
  Laptop,
  Languages,
  GraduationCap,
  School,
  Baby,
  Shapes,
  ArrowRight,
  CheckCircle2,
  UserPlus,
  FileText,
  Search,
  Send,
  BadgeCheck,
  ShieldCheck,
  Award,
  MapPin,
  Building2,
  Compass,
  Users,
  Target,
} from "lucide-react";
import { buildMetadata } from "@/lib/seo/metadata";
import { Button } from "@/components/ui";
import { HeroJobSearch } from "@/components/public/hero-job-search";
import { JobsExplorer } from "@/components/public/jobs-explorer";
import { getActiveLocations } from "@/server/services/locations";
import { CAREER_AVSAR_BRAND } from "@/lib/brand/config";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: `${CAREER_AVSAR_BRAND.brandName} – ${CAREER_AVSAR_BRAND.tagline}`,
  description:
    "Career Avsar is the premier teacher recruitment and placement platform connecting accredited schools with exceptional educators across Pratapgarh, Amethi, Jaunpur, Prayagraj, Raebareli, and Sultanpur in Uttar Pradesh.",
  path: "/",
});

const categories = [
  { label: "PGT Teacher", icon: GraduationCap, wing: "Senior Secondary (11–12)", queryKey: "category", queryVal: "PGT" },
  { label: "TGT Teacher", icon: School, wing: "Secondary Wing (9–10)", queryKey: "category", queryVal: "TGT" },
  { label: "PRT Teacher", icon: BookOpen, wing: "Primary Wing (1–5)", queryKey: "category", queryVal: "PRT" },
  { label: "Nursery Teacher", icon: Baby, wing: "Early Childhood & Pre-K", queryKey: "category", queryVal: "Nursery" },
  { label: "Primary Teacher", icon: BookOpen, wing: "Foundational Literacy", queryKey: "category", queryVal: "PRT" },
  { label: "Computer Teacher", icon: Laptop, wing: "IT & STEM Education", queryKey: "subject", queryVal: "Computer Science" },
  { label: "Mathematics Teacher", icon: Calculator, wing: "Middle & High School", queryKey: "subject", queryVal: "Mathematics" },
  { label: "Science Teacher", icon: FlaskConical, wing: "Physics, Chem & Bio", queryKey: "subject", queryVal: "Science" },
  { label: "English Teacher", icon: Languages, wing: "Language & Literature", queryKey: "subject", queryVal: "English" },
  { label: "Social Studies Teacher", icon: Shapes, wing: "History, Civics & Geo", queryKey: "subject", queryVal: "Social Studies" },
];

const teacherSteps = [
  {
    num: "01",
    title: "Register on Our Portal",
    text: "Create your free verified account with your mobile number and email to access regional school opportunities.",
    icon: UserPlus,
  },
  {
    num: "02",
    title: "Create Your Professional Profile",
    text: "Add academic qualifications (B.Ed, BTC, D.El.Ed, CTET, UPTET), past school tenures, and district preferences.",
    icon: FileText,
  },
  {
    num: "03",
    title: "Discover Teaching Opportunities",
    text: "Explore authenticated teaching vacancies across Pratapgarh, Amethi, Jaunpur, Prayagraj, Raebareli, and Sultanpur.",
    icon: Search,
  },
  {
    num: "04",
    title: "Get Connected with Schools",
    text: "Your verified profile is reviewed by institutional hiring managers for demonstration lectures and interview rounds.",
    icon: Send,
  },
  {
    num: "05",
    title: "Explore Better Career Opportunities",
    text: "Progress your teaching career with reputed CBSE, ICSE, and state board institutions with transparent terms.",
    icon: BadgeCheck,
  },
];

const schoolPillars = [
  {
    title: "Hire Qualified Teachers Online",
    desc: "Access a curated registry of certified educators with verified B.Ed, BTC, and CTET/UPTET qualifications.",
    icon: Users,
  },
  {
    title: "Submit Teacher Requirements",
    desc: "Share your subject, wing, experience, and board specifications directly with our recruitment desk.",
    icon: FileText,
  },
  {
    title: "Receive Verified Teacher Profiles",
    desc: "Review thoroughly pre-screened candidate dossiers tailored to your institution's specific culture and curriculum.",
    icon: ShieldCheck,
  },
  {
    title: "Shortlist and Recruit with Ease",
    desc: "Coordinate demonstration lectures and schedule interview rounds with end-to-end recruitment support.",
    icon: Target,
  },
];

export default async function HomePage() {
  const activeLocations = await getActiveLocations();

  return (
    <>
      {/* =========================================================================
          HERO SECTION: Official Career Avsar Brand & Tagline
         ========================================================================= */}
      <section className="relative overflow-hidden border-b border-border bg-[#F6F8FC] py-12 sm:py-16 lg:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_500px_at_15%_10%,rgba(18,102,197,0.08),transparent_60%),radial-gradient(900px_450px_at_85%_20%,rgba(242,139,25,0.07),transparent_50%)]"
        />

        <div className="container-safe relative">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left Column: Official Headline & Brand Messaging */}
            <div className="min-w-0 lg:col-span-7">
              {/* Regional Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3.5 py-1 text-xs font-semibold tracking-wide text-[#1266C5] shadow-xs">
                <MapPin aria-hidden className="size-3.5 text-[#F28B19]" />
                <span>Regional Recruitment &bull; Six Target Districts in Uttar Pradesh</span>
              </div>

              {/* Exact Official Primary Heading */}
              <h1 className="mt-4 font-serif text-3xl font-bold leading-[1.16] tracking-tight text-[#14264D] sm:text-4xl lg:text-5xl xl:text-[3.25rem]">
                Connecting Schools with Exceptional Educators
              </h1>

              {/* Exact Official Supporting Description */}
              <p className="mt-4.5 max-w-2xl text-base leading-relaxed text-[#687487] sm:text-lg">
                Making teacher recruitment and career opportunities simpler, faster and more reliable.
                Connecting reputed schools and certified educators across Pratapgarh, Amethi, Jaunpur, Prayagraj, Raebareli, and Sultanpur.
              </p>

              {/* Hero Action Buttons */}
              <div className="mt-7 flex flex-col gap-3.5 sm:flex-row sm:items-center">
                <Button
                  asChildLink
                  href="/teacher/register"
                  size="lg"
                  className="bg-[#1266C5] font-semibold text-white shadow-md hover:bg-[#087FE8]"
                >
                  <span>Create Your Profile &amp; Explore Opportunities</span>
                  <ArrowRight aria-hidden className="size-4 text-[#F28B19]" />
                </Button>
                <Button
                  asChildLink
                  href="/for-schools"
                  variant="outline"
                  size="lg"
                  className="border-slate-300 bg-white font-semibold text-[#14264D] hover:bg-slate-50"
                >
                  <Building2 className="mr-1.5 size-4 text-[#1266C5]" />
                  <span>Post Your Requirement</span>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border/80 pt-6 text-xs font-medium text-[#687487]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 aria-hidden className="size-4 text-success" />
                  <span className="text-[#172334]">Verified School Openings</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck aria-hidden className="size-4 text-[#1266C5]" />
                  <span className="text-[#172334]">Admin-Vetted Institutions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award aria-hidden className="size-4 text-[#F28B19]" />
                  <span className="text-[#172334]">Transparent Direct Placement</span>
                </div>
              </div>
            </div>

            {/* Right Column: Imagery & Regional Highlights */}
            <div className="relative min-w-0 lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="overflow-hidden rounded-2xl border-2 border-white bg-white p-2 shadow-lg">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl sm:aspect-[5/4]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80"
                      alt="Dedicated Indian teacher mentoring students in a modern classroom"
                      className="size-full object-cover object-center transition-transform duration-500 hover:scale-105"
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#14264D]/60 via-transparent to-transparent" />
                  </div>
                </div>

                {/* Floating Glass Badges */}
                <div className="absolute -bottom-5 -left-3 sm:-left-5 rounded-xl border border-white/80 bg-white/95 p-3.5 shadow-md backdrop-blur-md sm:p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1266C5] border border-blue-200">
                      <Compass className="size-5" />
                    </span>
                    <div>
                      <p className="font-serif text-lg font-bold text-[#14264D] leading-none sm:text-xl">6 Districts</p>
                      <p className="text-[11px] font-medium text-[#687487]">Uttar Pradesh Launch</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-4 -right-3 sm:-right-4 rounded-xl border border-white/80 bg-white/95 p-3.5 shadow-md backdrop-blur-md sm:p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#F28B19] border border-orange-200">
                      <Building2 className="size-5" />
                    </span>
                    <div>
                      <p className="font-serif text-lg font-bold text-[#14264D] leading-none sm:text-xl">Direct Hiring</p>
                      <p className="text-[11px] font-medium text-[#687487]">Admin-Vetted Schools</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Regional District-Based Job Search Panel */}
          <div className="mt-12 lg:mt-16">
            <HeroJobSearch />
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: APPROVED SERVICE DISTRICTS (Six Districts of Uttar Pradesh)
         ========================================================================= */}
      <section id="service-districts" aria-labelledby="service-locations-heading" className="container-safe py-12 sm:py-16">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-semibold text-[#1266C5]">
              <MapPin className="size-3.5" />
              <span>Target Operational Region</span>
            </div>
            <h2 id="service-locations-heading" className="mt-2.5 font-serif text-2xl font-bold tracking-tight text-[#14264D] sm:text-3xl">
              Our Approved Service Districts
            </h2>
            <p className="mt-1.5 text-sm text-[#687487]">
              Career Avsar focuses initially on six strategic districts in Uttar Pradesh, connecting localized teaching talent with accredited educational institutions.
            </p>
          </div>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1266C5] hover:underline"
          >
            <span>View All Regional Vacancies</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {activeLocations.map((loc) => (
            <Link
              key={loc.slug}
              href={`/teaching-jobs-in-${loc.slug}`}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#1266C5] hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#1266C5]">
                    <MapPin className="size-3.5" />
                    <span>{loc.state}</span>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-[#14264D]">
                    {loc.activeJobsCount} Active Vacanc{loc.activeJobsCount === 1 ? "y" : "ies"}
                  </span>
                </div>

                <h3 className="mt-4 font-serif text-xl font-bold tracking-tight text-[#14264D] group-hover:text-[#1266C5]">
                  {loc.district}
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-[#687487] line-clamp-2">
                  {loc.description || `Verified teaching positions in ${loc.district} across premier CBSE, ICSE, and state board schools.`}
                </p>

                {loc.majorTowns && loc.majorTowns.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {loc.majorTowns.slice(0, 3).map((town, idx) => (
                      <span key={idx} className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600 border border-slate-100">
                        {town}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-[#1266C5]">
                <span>Explore Teaching Jobs</span>
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================================================
          AUDIENCE SECTION 1: FOR SCHOOLS
         ========================================================================= */}
      <section id="for-schools" className="border-y border-border bg-[#F0F4FA]/60 py-16">
        <div className="container-safe">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3.5 py-1 text-xs font-semibold text-[#1266C5]">
                <Building2 className="size-3.5 text-[#F28B19]" />
                <span>For Schools &amp; Educational Institutions</span>
              </div>
              <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-[#14264D] sm:text-4xl">
                Hire Qualified Teachers with Confidence
              </h2>
              <p className="mt-3 text-base text-[#687487] leading-relaxed">
                Finding dependable, certified teachers should not be a slow or uncertain process. Career Avsar simplifies school staffing through structured candidate dossiers and administrator-managed screening.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChildLink href="/for-schools" size="lg" className="bg-[#1266C5] font-semibold text-white hover:bg-[#087FE8]">
                  <span>Post Your Requirement</span>
                  <ArrowRight className="size-4 text-[#F28B19]" />
                </Button>
                <Button asChildLink href="/school/login" variant="outline" size="lg" className="border-slate-300 bg-white font-semibold text-[#14264D]">
                  <span>School Portal Login</span>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
              {schoolPillars.map((p, i) => {
                const Icon = p.icon;
                return (
                  <div key={i} className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-[#1266C5] border border-blue-200">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-3.5 font-serif text-base font-bold text-[#14264D]">
                      {p.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-[#687487] leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          AUDIENCE SECTION 2: FOR TEACHERS
         ========================================================================= */}
      <section id="for-teachers" className="container-safe py-16">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-[#1266C5]">
            <GraduationCap className="size-3.5" />
            <span>For Teachers &amp; Educators</span>
          </div>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-[#14264D] sm:text-4xl">
            How Teachers Discover Career Opportunities
          </h2>
          <p className="mt-2 text-base text-[#687487]">
            Build your confidential professional profile and connect with verified schools in your preferred districts.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {teacherSteps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-xs font-bold text-[#F28B19]">
                      STEP {s.num}
                    </span>
                    <span className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-[#1266C5]">
                      <Icon className="size-4" />
                    </span>
                  </div>
                  <h3 className="mt-3 font-serif text-sm font-bold text-[#14264D]">
                    {s.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-[#687487] leading-relaxed">
                    {s.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Button asChildLink href="/teacher/register" size="lg" className="bg-[#1266C5] font-semibold text-white hover:bg-[#087FE8]">
            <span>Create Your Profile &amp; Explore Opportunities</span>
            <ArrowRight className="size-4 text-[#F28B19]" />
          </Button>
        </div>
      </section>

      {/* =========================================================================
          SECTION: EXPLORE VACANCIES BY TEACHING ROLE
         ========================================================================= */}
      <section className="border-t border-border bg-[#F6F8FC] py-14">
        <div className="container-safe">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="font-serif text-2xl font-bold tracking-tight text-[#14264D]">
              Explore Vacancies by Role &amp; Subject
            </h2>
            <p className="mt-1 text-xs text-[#687487]">
              Openings categorized across Senior Secondary, Secondary, Primary, and Foundational wings.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {categories.map((c, i) => {
              const Icon = c.icon;
              return (
                <Link
                  key={i}
                  href={`/jobs?${c.queryKey}=${encodeURIComponent(c.queryVal)}`}
                  className="group flex flex-col items-center rounded-xl border border-slate-200 bg-white p-4 text-center transition-all hover:border-[#1266C5] hover:shadow-xs"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-[#1266C5] group-hover:bg-[#1266C5] group-hover:text-white transition-colors">
                    <Icon className="size-5" />
                  </span>
                  <span className="mt-2.5 font-serif text-xs font-bold text-[#14264D]">
                    {c.label}
                  </span>
                  <span className="mt-0.5 text-[10px] text-[#687487]">
                    {c.wing}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: LIVE VACANCY EXPLORER
         ========================================================================= */}
      <section id="vacancies-explorer" className="container-safe py-14">
        <div className="mb-8">
          <h2 className="font-serif text-2xl font-bold tracking-tight text-[#14264D]">
            All Verified School Vacancies
          </h2>
          <p className="mt-1 text-xs text-[#687487]">
            Updated daily by {CAREER_AVSAR_BRAND.brandName} recruitment coordinators across active Uttar Pradesh institutions.
          </p>
        </div>
        <JobsExplorer />
      </section>
    </>
  );
}
