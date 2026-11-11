import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  MapPin,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  ExternalLink,
  Building2,
} from "lucide-react";
import { buildMetadata } from "@/lib/seo/metadata";
import { Button } from "@/components/ui";
import { JobCard } from "@/components/public/job-card";
import { getLocationBySlug, getActiveLocations } from "@/server/services/locations";
import { listPublicJobs } from "@/server/services/public";
import { CAREER_AVSAR_BRAND } from "@/lib/brand/config";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }> | { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const rawSlug = resolvedParams.slug.toLowerCase().trim();

  // Alias redirection handling for Allahabad
  if (rawSlug === "allahabad" || rawSlug === "prayag") {
    return buildMetadata({
      title: `Teaching Jobs in Prayagraj (Allahabad), Uttar Pradesh | ${CAREER_AVSAR_BRAND.brandName}`,
      description: "Explore verified teaching vacancies in Prayagraj across premier schools.",
      path: "/teaching-jobs-in-prayagraj",
    });
  }

  const location = await getLocationBySlug(rawSlug);
  if (!location) return { title: "Location Not Found" };

  const title = location.seoTitle || `Teaching Jobs in ${location.district}, Uttar Pradesh | ${CAREER_AVSAR_BRAND.brandName}`;
  const description =
    location.seoDescription ||
    `Explore verified school teaching vacancies in ${location.district}, Uttar Pradesh with ${CAREER_AVSAR_BRAND.brandName}. Connect with accredited schools for PGT, TGT, PRT, and primary teacher positions.`;

  return buildMetadata({
    title,
    description,
    path: `/teaching-jobs-in-${location.slug}`,
  });
}

const DISTRICT_INSIGHTS: Record<
  string,
  { intro: string; highlights: string[]; educationHubs: string }
> = {
  pratapgarh: {
    intro:
      "Pratapgarh's rapidly expanding schooling ecosystem encompasses established inter colleges, progressive private CBSE academies, and foundational centers. Schools across Pratapgarh seek dedicated educators who combine strong subject proficiency with empathetic student mentorship.",
    highlights: [
      "Bela Pratapgarh, Kunda, Patti, and Lalganj educational institutions",
      "High demand for TGT Mathematics, Science, and English educators",
      "Direct recruiter communication with transparent institutional benefits",
    ],
    educationHubs: "Bela Pratapgarh, Kunda, Patti, Lalganj, and Raniganj",
  },
  amethi: {
    intro:
      "Amethi is experiencing major educational expansion with modern residential academies, government-aided institutions, and technology-driven private schools. Institutions in Gauriganj, Musafirkhana, and Tiloi are actively recruiting certified educators.",
    highlights: [
      "Gauriganj administrative headquarters and Jagdishpur industrial educational zones",
      "Growing opportunities for PGT Science, Commerce, and Computer faculty",
      "Focus on CTET / UPTET qualified teachers with strong pedagogical command",
    ],
    educationHubs: "Gauriganj, Musafirkhana, Tiloi, Jagdishpur, and Amethi Town",
  },
  jaunpur: {
    intro:
      "Renowned as Shiraz-e-Hind, Jaunpur holds an illustrious tradition of scholarly excellence and high-achieving academic institutions. Schools across Jaunpur actively hire experienced educators and fresh B.Ed graduates for primary through senior secondary sections.",
    highlights: [
      "Jaunpur City, Shahganj, Machhlishahr, and Badlapur schooling clusters",
      "Substantial requirement for PGT Hindi, Sanskrit, Mathematics, and Physics",
      "Verified direct applications to school principals without intermediary fees",
    ],
    educationHubs: "Jaunpur City, Shahganj, Machhlishahr, Badlapur, Kerakat, and Mariahu",
  },
  prayagraj: {
    intro:
      "Prayagraj (historically Allahabad) is the foremost educational and judicial hub of eastern Uttar Pradesh. With a celebrated legacy of heritage convent academies, top-tier CBSE campuses, and renowned state-affiliated institutions, schools in Prayagraj recruit top-caliber PGT, TGT, PRT, and foundational educators.",
    highlights: [
      "Civil Lines, Tagore Town, Georgetown, and Naini premier school corridors",
      "Extensive demand across Senior Secondary subject specialists and language masters",
      "Structured dossiers shared directly with verified school recruitment managers",
    ],
    educationHubs: "Civil Lines, Tagore Town, Georgetown, Naini, Phulpur, and Jhunsi",
  },
  raebareli: {
    intro:
      "Raebareli serves as a vital educational nexus in central Uttar Pradesh, featuring esteemed central schools, CBSE institutions, and dedicated inter colleges. Schools across Raebareli recruit passionate educators dedicated to holistic student development.",
    highlights: [
      "Raebareli City, Lalganj, Salon, and Unchahar academic networks",
      "Regular vacancies for PRT foundational, TGT English, and Senior Secondary STEM faculty",
      "Transparent recruitment timelines with scheduled demonstration classes",
    ],
    educationHubs: "Raebareli City, Lalganj, Salon, Dalmau, and Bachhrawan",
  },
  sultanpur: {
    intro:
      "Sultanpur provides high-standard academic opportunities along the Gomti basin, connecting ambitious students with reputed schools. Educational institutions across Sultanpur recruit experienced school teachers and certified graduates.",
    highlights: [
      "Central Sultanpur, Kadipur, and Lambhua schooling corridors",
      "Strong demand for primary foundational and middle-school TGT teachers",
      "Direct interviews and selection through the Career Avsar recruitment desk",
    ],
    educationHubs: "Civil Lines Sultanpur, Kadipur, Lambhua, and Jaisinghpur",
  },
  lucknow: {
    intro:
      "As the capital city of Uttar Pradesh, Lucknow hosts prominent school chains, heritage convent academies, and private schools.",
    highlights: [
      "Gomti Nagar, Aliganj, Hazratganj, and Indira Nagar school networks",
      "Demand across PGT, TGT, PRT, Nursery, and STEM coaching wings",
      "Advanced school facilities and professional educator positions",
    ],
    educationHubs: "Gomti Nagar, Aliganj, Hazratganj, and Indira Nagar",
  },
  barabanki: {
    intro:
      "Barabanki combines educational infrastructure growth with dedicated community schools across Nawabganj and Haidergarh.",
    highlights: [
      "Nawabganj, Haidergarh, and Fatehpur progressive school campuses",
      "Balanced demand for primary foundational and secondary curriculum specialists",
      "Proximity to state capital offering good educator connectivity",
    ],
    educationHubs: "Nawabganj, Fatehpur, Haidergarh, and Ramsanehi Ghat",
  },
};

export default async function DistrictLandingPage({ params }: Props) {
  const resolvedParams = await Promise.resolve(params);
  const rawSlug = resolvedParams.slug.toLowerCase().trim();

  // Alias redirection: Allahabad -> Prayagraj (HTTP 301)
  if (rawSlug === "allahabad" || rawSlug === "prayag") {
    redirect("/teaching-jobs-in-prayagraj");
  }

  const location = await getLocationBySlug(rawSlug);

  if (!location) {
    notFound();
  }

  // Fetch real published jobs for this district
  const jobsResult = await listPublicJobs({
    district: location.district,
    limit: 12,
  });

  const allActiveLocations = await getActiveLocations();
  const otherLocations = allActiveLocations.filter((l) => l.slug !== location.slug);

  const insights = DISTRICT_INSIGHTS[location.slug] || {
    intro: `Explore verified school teacher recruitment opportunities across ${location.district}, Uttar Pradesh with ${CAREER_AVSAR_BRAND.brandName}. Connect with accredited institutions hiring qualified PGT, TGT, PRT, and specialist faculty.`,
    highlights: [
      `Active school vacancies across ${location.district} and nearby tehsils`,
      "Verified direct applications to school principals and hiring committees",
      "Structured teacher profiles with confidential credential verification",
    ],
    educationHubs: location.headquarterCity || location.district,
  };

  const appUrl = CAREER_AVSAR_BRAND.appUrl;

  // Structured Data: Breadcrumb
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: appUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Teaching Jobs",
        item: `${appUrl}/jobs`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `Teaching Jobs in ${location.district}`,
        item: `${appUrl}/teaching-jobs-in-${location.slug}`,
      },
    ],
  };

  // Structured Data: JobPosting Collection (ItemPage)
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Teaching Jobs in ${location.district}, Uttar Pradesh`,
    description: insights.intro,
    url: `${appUrl}/teaching-jobs-in-${location.slug}`,
    about: {
      "@type": "Place",
      name: `${location.district}, Uttar Pradesh, India`,
    },
    publisher: {
      "@type": "Organization",
      name: CAREER_AVSAR_BRAND.brandName,
      url: appUrl,
      logo: `${appUrl}/brand/career-avsar-logo.png`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-border bg-[#F6F8FC] py-12 sm:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_400px_at_10%_10%,rgba(18,102,197,0.08),transparent_60%),radial-gradient(800px_400px_at_90%_20%,rgba(242,139,25,0.08),transparent_50%)]"
        />

        <div className="container-safe relative">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-muted">
            <Link href="/" className="transition hover:text-primary">
              Home
            </Link>
            <span>/</span>
            <Link href="/jobs" className="transition hover:text-primary">
              Teaching Jobs
            </Link>
            <span>/</span>
            <span className="font-medium text-text">{location.district}</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="min-w-0 lg:col-span-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1 text-xs font-semibold text-[#1266C5]">
                <MapPin className="size-3.5 text-[#1266C5]" />
                <span>Verified District Vacancies &bull; {location.state}</span>
              </div>

              <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-[#14264D] sm:text-4xl lg:text-5xl">
                Teaching Jobs in {location.district}
              </h1>

              <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
                {insights.intro}
              </p>

              {/* District Highlights */}
              <div className="mt-6 space-y-2 text-sm text-text">
                {insights.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 shrink-0 text-success mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Button
                  asChildLink
                  href="/teacher/register"
                  size="lg"
                  className="bg-[#1266C5] font-medium text-white shadow-md hover:bg-[#087FE8]"
                >
                  <span>Register &amp; Apply in {location.district}</span>
                  <ArrowRight className="size-4 text-[#F28B19]" />
                </Button>
                <Button
                  asChildLink
                  href="#vacancies"
                  variant="outline"
                  size="lg"
                  className="border-slate-300 bg-white font-medium text-[#14264D] hover:bg-slate-50"
                >
                  <Briefcase className="size-4 text-[#1266C5]" />
                  <span>View All Openings ({jobsResult.total})</span>
                </Button>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="min-w-0 lg:col-span-4">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <h2 className="font-serif text-base font-bold text-[#14264D]">
                  District Hiring Snapshot
                </h2>
                <div className="mt-4 space-y-3.5 border-t border-border pt-4 text-xs">
                  <div className="flex justify-between py-1">
                    <span className="text-muted">District HQ</span>
                    <span className="font-semibold text-text">{location.headquarterCity || location.district}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted">Active Vacancies</span>
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#1266C5]">
                      {jobsResult.total} Open
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted">Key School Clusters</span>
                    <span className="font-semibold text-text text-right max-w-[180px] truncate">
                      {insights.educationHubs}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted">Recruitment Status</span>
                    <span className="font-semibold text-success flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-success inline-block" />
                      Active Hiring
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Vacancies Section */}
      <section id="vacancies" className="container-safe py-12 sm:py-16">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-[#14264D] sm:text-3xl">
              Current Openings in {location.district}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Showing verified openings authenticated by {CAREER_AVSAR_BRAND.brandName} recruitment coordinators.
            </p>
          </div>
          <Link
            href={`/jobs?district=${encodeURIComponent(location.district)}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#1266C5] hover:underline"
          >
            <span>Advanced Filters</span>
            <ExternalLink className="size-3.5" />
          </Link>
        </div>

        {jobsResult.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center sm:p-14">
            <Building2 className="mx-auto size-12 text-muted/60" />
            <h3 className="mt-4 font-serif text-xl font-bold text-[#14264D]">
              New Vacancies Being Onboarded in {location.district}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Institutions across {location.district} are currently finalizing their teaching requirements. Register your educator profile now to be first in line when positions publish.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button asChildLink href="/teacher/register" size="md" className="bg-[#1266C5] text-white">
                Register as Teacher in {location.district}
              </Button>
              <Button asChildLink href="/jobs" variant="outline" size="md">
                Browse Other Districts
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {jobsResult.items.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        {/* Other Active Districts */}
        {otherLocations.length > 0 && (
          <div className="mt-16 border-t border-border pt-10">
            <h3 className="font-serif text-lg font-bold text-[#14264D]">
              Explore Teaching Jobs in Nearby UP Districts
            </h3>
            <p className="mt-1 text-xs text-muted">
              {CAREER_AVSAR_BRAND.brandName} is also actively recruiting across these neighboring districts:
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {otherLocations.map((other) => (
                <Link
                  key={other.slug}
                  href={`/teaching-jobs-in-${other.slug}`}
                  className="group flex flex-col rounded-xl border border-slate-200 bg-white p-3.5 transition-all hover:border-[#1266C5] hover:shadow-sm"
                >
                  <span className="font-serif text-sm font-bold text-[#14264D] group-hover:text-[#1266C5]">
                    {other.district}
                  </span>
                  <span className="text-xs text-muted mt-1">
                    {other.activeJobsCount} Vacanc{other.activeJobsCount === 1 ? "y" : "ies"}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
