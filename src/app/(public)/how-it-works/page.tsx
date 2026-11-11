import { buildMetadata } from "@/lib/seo/metadata";
import { UserPlus, FileText, Search, Send, CalendarCheck, BadgeCheck, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import { CAREER_AVSAR_BRAND } from "@/lib/brand/config";

export const metadata = buildMetadata({
  title: `How It Works | ${CAREER_AVSAR_BRAND.brandName} – ${CAREER_AVSAR_BRAND.brandDescriptor}`,
  description:
    "Learn how Career Avsar connects qualified educators with verified schools across Pratapgarh, Amethi, Jaunpur, Prayagraj, Raebareli, and Sultanpur.",
  path: "/how-it-works",
});

const steps = [
  {
    num: "01",
    title: "Register on Our Portal",
    text: "Create your free verified account with your mobile number and email. No agency charges or placement cuts are ever taken from educators.",
    icon: UserPlus,
  },
  {
    num: "02",
    title: "Create Your Professional Profile",
    text: "Document your academic degrees, teacher training certifications (B.Ed, BTC, D.El.Ed, CTET, UPTET), past school tenures, and regional preferences.",
    icon: FileText,
  },
  {
    num: "03",
    title: "Discover Teaching Opportunities",
    text: "Filter genuine institutional job postings across Pratapgarh, Amethi, Jaunpur, Prayagraj, Raebareli, and Sultanpur by district, curriculum board, and subject.",
    icon: Search,
  },
  {
    num: "04",
    title: "Get Connected with Schools",
    text: "Your verified dossier is reviewed directly by school principals and hiring committees for demonstration lectures and interview rounds.",
    icon: Send,
  },
  {
    num: "05",
    title: "Attend Interviews & Demo Lectures",
    text: "Receive interview dates, meeting links or campus addresses, and demo lecture guidelines coordinated through our platform.",
    icon: CalendarCheck,
  },
  {
    num: "06",
    title: "Explore Better Career Opportunities",
    text: "Finalize your institutional selection and appointment terms with clear compensation in INR and commence your new classroom leadership.",
    icon: BadgeCheck,
  },
];

export default function HowItWorksPage() {
  return (
    <div className="container-safe py-10 sm:py-14 lg:py-16">
      <header className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold tracking-wide text-[#1266C5]">
          <MapPin aria-hidden className="size-3.5 text-[#F28B19]" />
          <span>Regional Recruitment Workflow &bull; Uttar Pradesh</span>
        </div>
        <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-[#14264D] sm:text-4xl lg:text-5xl">
          How {CAREER_AVSAR_BRAND.brandName} Works
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[#687487] sm:text-lg">
          {CAREER_AVSAR_BRAND.tagline}. A transparent, structured journey that connects certified teachers with accredited institutions across six target districts in Uttar Pradesh.
        </p>
      </header>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-serif text-xs font-bold text-[#F28B19]">STEP {s.num}</span>
                  <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-[#1266C5]">
                    <Icon className="size-5" />
                  </span>
                </div>
                <h3 className="mt-4 font-serif text-lg font-bold text-[#14264D]">
                  {s.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#687487]">
                  {s.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-14 rounded-2xl bg-blue-50/70 border border-blue-200 p-8 text-center sm:p-10">
        <h2 className="font-serif text-2xl font-bold text-[#14264D]">
          Ready to Start Your Teaching Career in Uttar Pradesh?
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-[#687487]">
          Join thousands of verified educators who trust Career Avsar for genuine school vacancies.
        </p>
        <div className="mt-6 flex justify-center gap-3.5">
          <Button asChildLink href="/teacher/register" size="lg" className="bg-[#1266C5] font-semibold text-white hover:bg-[#087FE8]">
            <span>Register as a Teacher</span>
            <ArrowRight className="size-4 text-[#F28B19]" />
          </Button>
          <Button asChildLink href="/jobs" variant="outline" size="lg" className="border-slate-300 bg-white text-[#14264D]">
            <span>Explore Jobs</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
