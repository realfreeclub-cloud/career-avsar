import {
  Building2,
  Users,
  ShieldCheck,
  FileText,
  CalendarCheck,
  ArrowRight,
  Mail,
} from "lucide-react";
import { buildMetadata } from "@/lib/seo/metadata";
import { Button } from "@/components/ui";
import { CAREER_AVSAR_BRAND } from "@/lib/brand/config";

export const metadata = buildMetadata({
  title: `For Schools – Hire Qualified Teachers | ${CAREER_AVSAR_BRAND.brandName}`,
  description:
    "Hire verified, certified educators for your institution in Pratapgarh, Amethi, Jaunpur, Prayagraj, Raebareli, and Sultanpur. Submit your teacher requirements online with Career Avsar.",
  path: "/for-schools",
});

const schoolPillars = [
  {
    title: "Hire Qualified Teachers Online",
    desc: "Access an authenticated pool of passionate educators with verified B.Ed, BTC, D.El.Ed, and CTET/UPTET credentials across all wings.",
    icon: Users,
  },
  {
    title: "Submit Teacher Requirements",
    desc: "Post your detailed hiring criteria including subject, wing, board curriculum (CBSE/ICSE/State), experience expectations, and remuneration.",
    icon: FileText,
  },
  {
    title: "Receive Verified Teacher Profiles",
    desc: "Every candidate dossier is pre-screened by Career Avsar coordinators to match your academic standards and school culture.",
    icon: ShieldCheck,
  },
  {
    title: "Shortlist and Recruit with Ease",
    desc: "Review candidate profiles, schedule demonstration lectures, and conduct interviews through an organized, admin-mediated process.",
    icon: CalendarCheck,
  },
];

export default function ForSchoolsPage() {
  return (
    <div className="bg-[#F6F8FC] py-12 sm:py-16">
      <div className="container-safe">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3.5 py-1 text-xs font-semibold text-[#1266C5]">
            <Building2 className="size-3.5 text-[#F28B19]" />
            <span>Institutional Recruitment Solutions</span>
          </div>
          <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-[#14264D] sm:text-4xl lg:text-5xl">
            Connecting Your School with Exceptional Educators
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[#687487] sm:text-lg">
            Career Avsar partners with accredited educational institutions across Pratapgarh, Amethi, Jaunpur, Prayagraj, Raebareli, and Sultanpur to fulfill faculty requirements efficiently and reliably.
          </p>

          <div className="mt-7 flex flex-wrap gap-3.5">
            <Button asChildLink href="/contact?subject=School+Requirement" size="lg" className="bg-[#1266C5] font-semibold text-white hover:bg-[#087FE8]">
              <span>Post Your Requirement</span>
              <ArrowRight className="size-4 text-[#F28B19]" />
            </Button>
            <Button asChildLink href="/school/login" variant="outline" size="lg" className="border-slate-300 bg-white font-semibold text-[#14264D] hover:bg-slate-50">
              <Building2 className="mr-1.5 size-4 text-[#1266C5]" />
              <span>School Portal Login</span>
            </Button>
          </div>
        </div>

        {/* 4 Core Pillars */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {schoolPillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-[#1266C5] border border-blue-200">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-serif text-base font-bold text-[#14264D]">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#687487]">
                    {p.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* How It Works for Schools */}
        <div className="mt-16 rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm">
          <div className="max-w-2xl">
            <h2 className="font-serif text-2xl font-bold tracking-tight text-[#14264D] sm:text-3xl">
              Our 4-Step Institutional Recruitment Process
            </h2>
            <p className="mt-2 text-sm text-[#687487]">
              We preserve strict quality control and confidentiality at every stage of the educator placement cycle.
            </p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-100 bg-[#F6F8FC] p-4">
              <span className="font-serif text-xs font-bold text-[#F28B19]">01</span>
              <h4 className="mt-2 font-serif text-sm font-bold text-[#14264D]">Requirement Submission</h4>
              <p className="mt-1 text-xs text-[#687487]">Submit subject, wing, board, and minimum experience criteria through our form or direct manager contact.</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-[#F6F8FC] p-4">
              <span className="font-serif text-xs font-bold text-[#F28B19]">02</span>
              <h4 className="mt-2 font-serif text-sm font-bold text-[#14264D]">Candidate Sourcing &amp; Screening</h4>
              <p className="mt-1 text-xs text-[#687487]">We filter verified candidates from our regional educator pool and verify qualifications and track records.</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-[#F6F8FC] p-4">
              <span className="font-serif text-xs font-bold text-[#F28B19]">03</span>
              <h4 className="mt-2 font-serif text-sm font-bold text-[#14264D]">Dossier Sharing &amp; Demos</h4>
              <p className="mt-1 text-xs text-[#687487]">Shortlisted educator dossiers are shared for your committee&apos;s review, followed by scheduled demonstration lectures.</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-[#F6F8FC] p-4">
              <span className="font-serif text-xs font-bold text-[#F28B19]">04</span>
              <h4 className="mt-2 font-serif text-sm font-bold text-[#14264D]">Appointment &amp; Joining</h4>
              <p className="mt-1 text-xs text-[#687487]">Finalize selection terms and complete faculty onboarding with transparent joining documentation.</p>
            </div>
          </div>
        </div>

        {/* Quick Requirement Form CTA */}
        <div className="mt-16 rounded-2xl bg-gradient-to-r from-[#14264D] to-[#1266C5] p-8 sm:p-12 text-white">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <h3 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">
                Ready to Staff Your Institution?
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-blue-100">
                Contact our recruitment desk today or submit your vacancy details online. Our academic coordinators will reach out within 24 hours.
              </p>
              <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium text-blue-200">
                <span className="flex items-center gap-1.5">
                  <Mail className="size-4 text-[#F28B19]" />
                  {CAREER_AVSAR_BRAND.supportEmail}
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-success" />
                  No Upfront Posting Charges
                </span>
              </div>
            </div>
            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <Button asChildLink href="/contact" size="lg" className="bg-[#F28B19] font-bold text-white hover:bg-[#d97910] shadow-md">
                <span>Contact Recruitment Team</span>
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
