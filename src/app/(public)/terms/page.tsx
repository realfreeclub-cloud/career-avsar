import { buildMetadata } from "@/lib/seo/metadata";
import { Card } from "@/components/ui/card";

export const metadata = buildMetadata({
  title: "Terms and Conditions - Indian Teacher Recruitment Platform",
  description: "Terms and conditions governing the use of the Indian Teacher Recruitment & Placement Platform.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="container-safe py-10 sm:py-14 lg:py-16">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-gold">Platform Agreement</p>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          Terms &amp; Conditions
        </h1>
        <p className="mt-2 text-sm text-muted">Effective as of: November 2026</p>
      </header>

      <Card as="article" className="mt-8 space-y-6 p-6 sm:p-10 text-sm leading-relaxed text-muted sm:text-base">
        <section aria-labelledby="t1">
          <h2 id="t1" className="font-serif text-lg font-bold text-primary">1. Acceptance of Terms</h2>
          <p className="mt-1.5">
            By registering as an educator or school representative on the Indian Teacher Recruitment Platform, you agree to abide by these terms, all applicable Indian laws, and statutory standards issued by NCTE and respective state education departments.
          </p>
        </section>

        <section aria-labelledby="t2">
          <h2 id="t2" className="font-serif text-lg font-bold text-primary">2. Candidate Representations</h2>
          <p className="mt-1.5">
            Educators warrant that all stated qualifications, degree certificates, experience records, and eligibility exam results submitted on their profile are authentic, current, and issued by recognized boards or universities.
          </p>
        </section>

        <section aria-labelledby="t3">
          <h2 id="t3" className="font-serif text-lg font-bold text-primary">3. Institutional Obligations</h2>
          <p className="mt-1.5">
            Hiring schools warrant that all published vacancies represent genuine teaching positions with clear compensation terms. Schools agree not to charge any application processing or registration fees to candidates.
          </p>
        </section>

        <section aria-labelledby="t4">
          <h2 id="t4" className="font-serif text-lg font-bold text-primary">4. Fair Hiring Standards</h2>
          <p className="mt-1.5">
            The platform upholds equal opportunity recruitment practices without discrimination on grounds of religion, race, caste, sex, or place of birth.
          </p>
        </section>
      </Card>
    </div>
  );
}
