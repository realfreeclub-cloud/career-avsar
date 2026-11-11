import { buildMetadata } from "@/lib/seo/metadata";
import { Card } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
import { CAREER_AVSAR_BRAND } from "@/lib/brand/config";

export const metadata = buildMetadata({
  title: `Frequently Asked Questions – ${CAREER_AVSAR_BRAND.brandName}`,
  description:
    "Frequently asked questions regarding educator registration, verified school vacancies, application workflows, and recruitment guidelines across Uttar Pradesh.",
  path: "/faq",
});

const faqs = [
  {
    q: "How are job vacancies verified on Career Avsar?",
    a: "Every vacancy is verified directly by Career Avsar academic coordinators in partnership with accredited schools. We validate institutional accreditation, salary ranges, and hiring terms prior to publication.",
  },
  {
    q: "Is there any fee charged to teachers for registration or placement?",
    a: "No. Teacher registration, profile creation, document verification, job searches, and direct applications are 100% free for educators. We do not charge placement cuts or commission from candidates.",
  },
  {
    q: "Which districts are currently active on Career Avsar?",
    a: "Career Avsar initially operates in six target districts of Uttar Pradesh: Pratapgarh, Amethi, Jaunpur, Prayagraj, Raebareli, and Sultanpur. Vacancies listed on our platform belong to verified schools within these districts.",
  },
  {
    q: "What certifications are required to register as a teacher?",
    a: "Requirements depend on the grade wing: PRT/TGT positions typically require a B.Ed, D.El.Ed, or relevant graduation along with CTET or UPTET certification. PGT roles require a Master's degree in the subject plus B.Ed.",
  },
  {
    q: "How are Prayagraj and Allahabad handled?",
    a: "Prayagraj is our canonical district name. If you search for Allahabad or historical Allahabad locations, our platform automatically maps and shows all matching vacancies in Prayagraj without duplicate listings.",
  },
  {
    q: "Can schools directly contact teachers for interview demonstrations?",
    a: "Yes. Once an educator submits an application or an administrator shares a curated dossier with a school, the school hiring committee coordinates demo lectures and interviews through our structured schedule.",
  },
  {
    q: "How are my private documents and resumes protected?",
    a: "Uploaded resumes, degree certificates, and identification documents are stored in secure, private repositories. They are never indexed publicly or made accessible to unauthorized third parties.",
  },
  {
    q: "How can educational institutions post their teaching requirements?",
    a: "Schools can post their requirements directly through our 'For Schools' portal or by contacting our central recruitment desk at support@careeravsar.in.",
  },
];

export default function FaqPage() {
  return (
    <div className="container-safe py-10 sm:py-14 lg:py-16">
      <header className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold tracking-wide text-[#1266C5]">
          <HelpCircle aria-hidden className="size-3.5 text-[#F28B19]" />
          <span>Frequently Asked Questions</span>
        </div>
        <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-[#14264D] sm:text-4xl lg:text-5xl">
          Clear Answers for Teachers and Schools
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[#687487] sm:text-lg">
          Learn how {CAREER_AVSAR_BRAND.brandName} simplifies school recruitment, safeguards educator privacy, and facilitates transparent academic placements.
        </p>
      </header>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {faqs.map((f, i) => (
          <Card key={i} className="p-6 border-slate-200">
            <h3 className="font-serif text-base font-bold text-[#14264D]">
              {f.q}
            </h3>
            <p className="mt-2.5 text-xs text-[#687487] leading-relaxed">
              {f.a}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
