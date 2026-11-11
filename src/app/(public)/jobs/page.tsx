import { buildMetadata } from "@/lib/seo/metadata";
import { JobsExplorer } from "@/components/public/jobs-explorer";
import { MapPin } from "lucide-react";
import { CAREER_AVSAR_BRAND } from "@/lib/brand/config";

export const metadata = buildMetadata({
  title: `Teaching Jobs in Uttar Pradesh | ${CAREER_AVSAR_BRAND.brandName}`,
  description:
    "Search verified school teaching jobs across Pratapgarh, Amethi, Jaunpur, Prayagraj, Raebareli, and Sultanpur. Connect directly with approved academic institutions.",
  path: "/jobs",
});

type Props = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

export default async function FindJobsPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const pick = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const initialQuery = {
    q: pick("q"),
    subject: pick("subject"),
    district: pick("district"),
    city: pick("city"),
    state: pick("state"),
    qualification: pick("qualification"),
    category: pick("category"),
  };

  return (
    <div className="container-safe py-10 sm:py-14 lg:py-16">
      <header className="mb-8 max-w-3xl sm:mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold tracking-wide text-[#1266C5]">
          <MapPin aria-hidden className="size-3.5 text-[#F28B19]" />
          <span>Uttar Pradesh Regional Recruitment Network</span>
        </div>
        <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-[#14264D] sm:text-4xl">
          Find Verified Teaching Opportunities in UP
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#687487] sm:text-base">
          Explore genuine, published teaching vacancies across Pratapgarh, Amethi, Jaunpur, Prayagraj, Raebareli, and Sultanpur.
          Filter by district, specialization, qualification, and wing. All postings originate from verified database records.
        </p>
      </header>

      <JobsExplorer initialQuery={initialQuery} pageSize={9} showLoadMore headingId="jobs-directory" />
    </div>
  );
}
