import { buildMetadata } from "@/lib/seo/metadata";
import { Card, CardHeader, CardTitle } from "@/components/ui";
import { MapPin, ShieldCheck, Target, Award, Compass, Users } from "lucide-react";
import { CAREER_AVSAR_BRAND } from "@/lib/brand/config";

export const metadata = buildMetadata({
  title: `About Us – ${CAREER_AVSAR_BRAND.brandName} | ${CAREER_AVSAR_BRAND.brandDescriptor}`,
  description:
    "Learn about Career Avsar and our mission connecting schools with exceptional educators across Pratapgarh, Amethi, Jaunpur, Prayagraj, Raebareli, and Sultanpur in Uttar Pradesh.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="container-safe py-10 sm:py-14 lg:py-16">
      <header className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold tracking-wide text-[#1266C5]">
          <MapPin aria-hidden className="size-3.5 text-[#F28B19]" />
          <span>Regional Mission &bull; Uttar Pradesh</span>
        </div>
        <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-[#14264D] sm:text-4xl lg:text-5xl">
          Connecting Schools with Exceptional Educators
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[#687487] sm:text-lg">
          <strong>{CAREER_AVSAR_BRAND.brandName} – {CAREER_AVSAR_BRAND.brandDescriptor}</strong> (<em>&ldquo;{CAREER_AVSAR_BRAND.tagline}&rdquo;</em>)
          was founded to make teacher recruitment and career opportunities simpler, faster, and more reliable. We operate across six initial target districts of Uttar Pradesh: <strong>Pratapgarh, Amethi, Jaunpur, Prayagraj, Raebareli, and Sultanpur</strong>.
        </p>
      </header>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 sm:p-7 border-slate-200">
          <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-[#1266C5] border border-blue-200">
            <Target className="size-5" />
          </div>
          <CardHeader className="mt-4">
            <CardTitle>Regional Deep Focus</CardTitle>
          </CardHeader>
          <p className="text-sm leading-relaxed text-[#687487]">
            Rather than a superficial nationwide directory, we build dedicated, on-the-ground institutional relationships across our six Uttar Pradesh districts to connect educators with trusted local schools.
          </p>
        </Card>

        <Card className="p-6 sm:p-7 border-slate-200">
          <div className="flex size-11 items-center justify-center rounded-xl bg-orange-50 text-[#F28B19] border border-orange-200">
            <ShieldCheck className="size-5" />
          </div>
          <CardHeader className="mt-4">
            <CardTitle>Strict Authentication</CardTitle>
          </CardHeader>
          <p className="text-sm leading-relaxed text-[#687487]">
            No phantom listings or generic aggregations. Every participating school and vacancy is verified by Career Avsar coordinators to protect teacher dignity and privacy.
          </p>
        </Card>

        <Card className="p-6 sm:p-7 border-slate-200">
          <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-[#1266C5] border border-blue-200">
            <Award className="size-5" />
          </div>
          <CardHeader className="mt-4">
            <CardTitle>Transparent Placement</CardTitle>
          </CardHeader>
          <p className="text-sm leading-relaxed text-[#687487]">
            We ensure candid clarity on school boards, required teaching hours, class wings, and salary scales in Indian Rupees (₹), completely free of placement cuts for candidates.
          </p>
        </Card>

        <Card className="p-6 sm:p-7 border-slate-200">
          <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-[#1266C5] border border-blue-200">
            <Users className="size-5" />
          </div>
          <CardHeader className="mt-4">
            <CardTitle>Verified Teacher Registry</CardTitle>
          </CardHeader>
          <p className="text-sm leading-relaxed text-[#687487]">
            Educator qualifications including B.Ed, BTC, D.El.Ed, CTET, and UPTET are securely authenticated, presenting schools with genuine dossiers ready for demonstration lectures.
          </p>
        </Card>

        <Card className="p-6 sm:p-7 border-slate-200">
          <div className="flex size-11 items-center justify-center rounded-xl bg-orange-50 text-[#F28B19] border border-orange-200">
            <Compass className="size-5" />
          </div>
          <CardHeader className="mt-4">
            <CardTitle>Streamlined Interviewing</CardTitle>
          </CardHeader>
          <p className="text-sm leading-relaxed text-[#687487]">
            Direct calendar demonstration lectures and structured interview coordination minimize hiring delays and administrative burden for both schools and educators.
          </p>
        </Card>

        <Card className="p-6 sm:p-7 border-slate-200">
          <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-[#1266C5] border border-blue-200">
            <MapPin className="size-5" />
          </div>
          <CardHeader className="mt-4">
            <CardTitle>Localized School Commute</CardTitle>
          </CardHeader>
          <p className="text-sm leading-relaxed text-[#687487]">
            Teachers can discover academic positions tailored to their immediate residential neighborhood or preferred relocation districts within Uttar Pradesh.
          </p>
        </Card>
      </div>
    </div>
  );
}
