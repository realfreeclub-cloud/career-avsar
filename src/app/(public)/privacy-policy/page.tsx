import { buildMetadata } from "@/lib/seo/metadata";
import { Card } from "@/components/ui/card";

export const metadata = buildMetadata({
  title: "Privacy Policy - Indian Teacher Recruitment Platform",
  description: "Privacy policy and data governance practices for educators and academic institutions on the Indian Teacher Recruitment Platform.",
  path: "/privacy-policy",
});

export default function PrivacyPage() {
  return (
    <div className="container-safe py-10 sm:py-14 lg:py-16">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-gold">Legal Governance</p>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted">Last revised: November 2026</p>
      </header>

      <Card as="article" className="mt-8 space-y-6 p-6 sm:p-10 text-sm leading-relaxed text-muted sm:text-base">
        <section aria-labelledby="p1">
          <h2 id="p1" className="font-serif text-lg font-bold text-primary">1. Information We Collect</h2>
          <p className="mt-1.5">
            We collect personal identity, academic qualifications, teaching experience, eligibility examination scores (CTET/TET), and verified documentation submitted during educator onboarding. Institutional recruiters provide school accreditation details and vacancy parameters.
          </p>
        </section>

        <section aria-labelledby="p2">
          <h2 id="p2" className="font-serif text-lg font-bold text-primary">2. Purpose of Processing</h2>
          <p className="mt-1.5">
            Information is used solely to facilitate lawful teacher recruitment, authenticate institutional legitimacy, enable direct school applications, coordinate interviews, and maintain compliance with Indian educational regulations.
          </p>
        </section>

        <section aria-labelledby="p3">
          <h2 id="p3" className="font-serif text-lg font-bold text-primary">3. Data Confidentiality &amp; Access Controls</h2>
          <p className="mt-1.5">
            Teacher resumes and private credentials are never sold to third-party advertisers. Dossiers are shared exclusively with institutions that the teacher has actively applied to or authorized to review their profile.
          </p>
        </section>

        <section aria-labelledby="p4">
          <h2 id="p4" className="font-serif text-lg font-bold text-primary">4. Security Measures</h2>
          <p className="mt-1.5">
            We employ encrypted database storage, secure HTTPS transport, and role-based access management to safeguard educator records against unauthorized access.
          </p>
        </section>
      </Card>
    </div>
  );
}
