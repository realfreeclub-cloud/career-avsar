import {
  GraduationCap,
  UserPlus,
  FileText,
  Search,
  Send,
  BadgeCheck,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Award,
} from "lucide-react";
import { buildMetadata } from "@/lib/seo/metadata";
import { Button } from "@/components/ui";
import { CAREER_AVSAR_BRAND } from "@/lib/brand/config";

export const metadata = buildMetadata({
  title: `For Teachers – Career Opportunities & Growth | ${CAREER_AVSAR_BRAND.brandName}`,
  description:
    "Register your educator profile with Career Avsar. Discover verified teaching opportunities across Pratapgarh, Amethi, Jaunpur, Prayagraj, Raebareli, and Sultanpur.",
  path: "/for-teachers",
});

const teacherSteps = [
  {
    num: "01",
    title: "Register on Our Portal",
    text: "Create your free verified account with your mobile and email to unlock access to top regional schools.",
    icon: UserPlus,
  },
  {
    num: "02",
    title: "Create Your Professional Profile",
    text: "Add academic credentials (B.Ed, BTC, D.El.Ed, CTET, UPTET), subject competencies, past school experience, and preferred districts.",
    icon: FileText,
  },
  {
    num: "03",
    title: "Discover Teaching Opportunities",
    text: "Filter genuine teaching vacancies across Pratapgarh, Amethi, Jaunpur, Prayagraj, Raebareli, and Sultanpur.",
    icon: Search,
  },
  {
    num: "04",
    title: "Get Connected with Schools",
    text: "Your verified dossier is reviewed directly by school principals and hiring panels for demo lectures and interviews.",
    icon: Send,
  },
  {
    num: "05",
    title: "Explore Better Career Opportunities",
    text: "Receive official institutional selections and advance your teaching vocation with clear, transparent appointment terms.",
    icon: BadgeCheck,
  },
];

export default function ForTeachersPage() {
  return (
    <div className="bg-[#F6F8FC] py-12 sm:py-16">
      <div className="container-safe">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3.5 py-1 text-xs font-semibold text-[#1266C5]">
            <GraduationCap className="size-3.5 text-[#F28B19]" />
            <span>Dedicated Educator Placement Network</span>
          </div>
          <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-[#14264D] sm:text-4xl lg:text-5xl">
            Advance Your Teaching Career with Career Avsar
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[#687487] sm:text-lg">
            We connect qualified teachers with accredited CBSE, ICSE, and state board institutions across Uttar Pradesh. Build your professional profile once, and let vetted schools discover your teaching excellence.
          </p>

          <div className="mt-7 flex flex-wrap gap-3.5">
            <Button asChildLink href="/teacher/register" size="lg" className="bg-[#1266C5] font-semibold text-white hover:bg-[#087FE8]">
              <span>Create Your Profile &amp; Explore Opportunities</span>
              <ArrowRight className="size-4 text-[#F28B19]" />
            </Button>
            <Button asChildLink href="/teacher/login" variant="outline" size="lg" className="border-slate-300 bg-white font-semibold text-[#14264D] hover:bg-slate-50">
              <span>Teacher Login</span>
            </Button>
          </div>
        </div>

        {/* 5 Steps */}
        <div className="mt-16">
          <h2 className="font-serif text-2xl font-bold tracking-tight text-[#14264D] sm:text-3xl text-center">
            How Career Avsar Works for Teachers
          </h2>
          <p className="mt-2 text-sm text-[#687487] text-center max-w-xl mx-auto">
            A simple, dignified, and professional placement workflow designed specifically for educators.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {teacherSteps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-xs font-bold text-[#F28B19]">STEP {s.num}</span>
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
        </div>

        {/* Educator Guarantees & Transparency Notice */}
        <div className="mt-16 rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="flex items-start gap-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1266C5]">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <h4 className="font-serif text-sm font-bold text-[#14264D]">100% Verified Openings</h4>
                <p className="mt-1 text-xs text-[#687487] leading-relaxed">Every school opening is vetted by our team to guarantee authentic hiring and honest remuneration.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#F28B19]">
                <Award className="size-5" />
              </span>
              <div>
                <h4 className="font-serif text-sm font-bold text-[#14264D]">No Registration Fee</h4>
                <p className="mt-1 text-xs text-[#687487] leading-relaxed">Creating your educator profile, uploading credentials, and applying to vacancies is 100% free for teachers.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-success">
                <CheckCircle2 className="size-5" />
              </span>
              <div>
                <h4 className="font-serif text-sm font-bold text-[#14264D]">Confidential Profile</h4>
                <p className="mt-1 text-xs text-[#687487] leading-relaxed">Your personal phone number and sensitive documents remain protected and shared only upon mutual interest.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
