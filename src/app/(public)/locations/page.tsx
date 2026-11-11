import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { buildMetadata } from "@/lib/seo/metadata";
import { getActiveLocations } from "@/server/services/locations";
import { CAREER_AVSAR_BRAND } from "@/lib/brand/config";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: `Our Service Locations – Six Districts in Uttar Pradesh | ${CAREER_AVSAR_BRAND.brandName}`,
  description:
    "Career Avsar operates across six strategic districts of Uttar Pradesh: Pratapgarh, Amethi, Jaunpur, Prayagraj, Raebareli, and Sultanpur. Find local teaching opportunities near you.",
  path: "/locations",
});

export default async function ServiceLocationsPage() {
  const activeLocations = await getActiveLocations();

  return (
    <div className="bg-[#F6F8FC] py-12 sm:py-16">
      <div className="container-safe">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3.5 py-1 text-xs font-semibold text-[#1266C5]">
            <MapPin className="size-3.5 text-[#F28B19]" />
            <span>Regional Uttar Pradesh Operations</span>
          </div>
          <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-[#14264D] sm:text-4xl lg:text-5xl">
            Our Approved Service Districts
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[#687487] sm:text-lg">
            Career Avsar focuses deeply on regional educational corridors in Uttar Pradesh. We connect certified teachers with accredited institutions across six designated districts.
          </p>
        </div>

        {/* 6 Districts Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {activeLocations.map((loc) => (
            <div
              key={loc.slug}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-[#1266C5] transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#1266C5]">
                    <MapPin className="size-3.5" />
                    {loc.state}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-[#14264D]">
                    {loc.activeJobsCount} Vacanc{loc.activeJobsCount === 1 ? "y" : "ies"}
                  </span>
                </div>

                <h2 className="mt-4 font-serif text-2xl font-bold text-[#14264D]">
                  {loc.district}
                </h2>

                <p className="mt-2 text-xs text-[#687487] leading-relaxed">
                  {loc.description || `Verified teaching positions in ${loc.district} across premier CBSE, ICSE, and state board schools.`}
                </p>

                {loc.majorTowns && loc.majorTowns.length > 0 && (
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">Key Educational Hubs:</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {loc.majorTowns.map((town, idx) => (
                        <span key={idx} className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600 border border-slate-100">
                          {town}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between">
                <Link
                  href={`/teaching-jobs-in-${loc.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1266C5] hover:underline"
                >
                  <span>Explore Jobs in {loc.district}</span>
                  <ArrowRight className="size-3.5 text-[#F28B19]" />
                </Link>
                <Link
                  href={`/teacher/register`}
                  className="text-xs font-medium text-muted hover:text-primary"
                >
                  Register
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Alias / Canonical Note */}
        <div className="mt-12 rounded-xl border border-blue-100 bg-blue-50/60 p-5 text-xs text-[#14264D] leading-relaxed">
          <p className="font-semibold text-[#1266C5]">Note on Regional Terminology:</p>
          <p className="mt-1 text-[#687487]">
            <strong>Prayagraj</strong> is the canonical district name for the historic Allahabad region. All institutional vacancies and applications for Allahabad are integrated seamlessly under Prayagraj. Similarly, <strong>Raebareli</strong> is maintained under a single canonical district spelling to ensure comprehensive job matching.
          </p>
        </div>
      </div>
    </div>
  );
}
