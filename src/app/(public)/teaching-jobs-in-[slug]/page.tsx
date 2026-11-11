import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { MapPin, Building2 } from "lucide-react";
import { buildMetadata } from "@/lib/seo/metadata";
import { Button } from "@/components/ui";
import { JobCard } from "@/components/public/job-card";
import { getLocationBySlug } from "@/server/services/locations";
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
};

export default async function DistrictLandingPageAlias({ params }: Props) {
  const resolvedParams = await Promise.resolve(params);
  const rawSlug = resolvedParams.slug.toLowerCase().trim();

  // Alias redirection: Allahabad -> Prayagraj
  if (rawSlug === "allahabad" || rawSlug === "prayag") {
    redirect("/teaching-jobs-in-prayagraj");
  }

  const location = await getLocationBySlug(rawSlug);

  if (!location) {
    notFound();
  }

  const jobsResult = await listPublicJobs({
    district: location.district,
    limit: 12,
  });

  const insights = DISTRICT_INSIGHTS[location.slug] || {
    intro: `Explore verified school teacher recruitment opportunities across ${location.district}, Uttar Pradesh with ${CAREER_AVSAR_BRAND.brandName}. Connect with accredited institutions hiring qualified PGT, TGT, PRT, and specialist faculty.`,
    highlights: [
      `Active school vacancies across ${location.district} and nearby tehsils`,
      "Verified direct applications to school principals and hiring committees",
      "Structured teacher profiles with confidential credential verification",
    ],
    educationHubs: location.headquarterCity || location.district,
  };

  return (
    <section className="container-safe py-12 sm:py-16">
      <div className="mb-6 flex items-center gap-2 text-xs text-muted">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <span>/</span>
        <Link href="/jobs" className="hover:text-primary">
          Teaching Jobs
        </Link>
        <span>/</span>
        <span className="font-medium text-text">{location.district}</span>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-[#1266C5]">
          <MapPin className="size-3.5 text-[#1266C5]" />
          <span>Verified Regional Openings &bull; {location.district}, {location.state}</span>
        </div>

        <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-[#14264D] sm:text-4xl">
          Teaching Jobs in {location.district}
        </h1>

        <p className="mt-3 max-w-2xl text-base text-muted">
          {insights.intro}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChildLink href="/teacher/register" size="md" className="bg-[#1266C5] text-white">
            Register as Teacher in {location.district}
          </Button>
          <Button asChildLink href={`/jobs?district=${encodeURIComponent(location.district)}`} variant="outline" size="md">
            Filter All Openings ({jobsResult.total})
          </Button>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-serif text-2xl font-bold text-[#14264D]">
          Active Vacancies in {location.district}
        </h2>
        {jobsResult.items.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-muted">
            <Building2 className="mx-auto size-10 text-muted/60" />
            <p className="mt-2 text-sm font-medium">No published vacancies currently in {location.district}.</p>
            <p className="mt-1 text-xs text-muted">Register today to receive immediate notification when schools post vacancies.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {jobsResult.items.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
