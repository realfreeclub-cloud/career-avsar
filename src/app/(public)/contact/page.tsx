import { buildMetadata } from "@/lib/seo/metadata";
import { Card, CardHeader, CardTitle, Input, Button } from "@/components/ui";
import { Mail, MapPin, Sparkles, Send } from "lucide-react";
import { CAREER_AVSAR_BRAND } from "@/lib/brand/config";

export const metadata = buildMetadata({
  title: `Contact & Support | ${CAREER_AVSAR_BRAND.brandName} (Uttar Pradesh)`,
  description:
    "Contact Career Avsar for educator assistance or school recruitment inquiries across Pratapgarh, Amethi, Jaunpur, Prayagraj, Raebareli, and Sultanpur.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="container-safe py-10 sm:py-14 lg:py-16">
      <header className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold tracking-wide text-[#1266C5]">
          <Sparkles aria-hidden className="size-3.5 text-[#F28B19]" />
          <span>Support &bull; Institutional Partnerships</span>
        </div>
        <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-[#14264D] sm:text-4xl lg:text-5xl">
          Connect with Our Recruitment Team
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[#687487] sm:text-lg">
          Have inquiries regarding teacher registration, school requirement posting, credential verification, or interview scheduling? Reach out to our regional desk.
        </p>
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6 sm:p-8 border-slate-200">
          <CardHeader>
            <CardTitle>Send an Inquiry or Teacher Requirement</CardTitle>
          </CardHeader>
          <form action="#" method="post" className="grid gap-4 sm:grid-cols-2">
            <Input label="Your Full Name" name="name" autoComplete="name" required placeholder="e.g. Dr. Rajesh Sharma" />
            <Input label="Email Address" name="email" type="email" autoComplete="email" required placeholder="name@domain.com" />
            <Input label="Contact Mobile" name="mobile" type="tel" autoComplete="tel" required placeholder="e.g. +91 98765 43210" />
            <Input label="Institution Name (Optional)" name="institution" placeholder="e.g. Delhi Public School" />
            <div className="sm:col-span-2">
              <Input label="Subject / Purpose" name="subject" required placeholder="e.g. School Vacancy Requirement or Teacher Application Query" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-[#14264D]">Detailed Message</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                placeholder="Please describe your requirements, subject needs, or specific questions..."
                className="w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base text-text shadow-xs placeholder:text-muted/70 transition-all focus:border-[#1266C5] focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" size="lg" className="w-full sm:w-auto bg-[#1266C5] text-white hover:bg-[#087FE8]">
                <Send className="mr-2 size-4 text-[#F28B19]" />
                Submit Inquiry
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="p-6 sm:p-7 border-slate-200">
            <CardTitle className="text-base font-serif">Central Recruitment Desk</CardTitle>
            <div className="mt-4 space-y-3 text-sm text-[#687487]">
              <div className="flex items-start gap-3">
                <MapPin className="size-4 shrink-0 text-[#1266C5] mt-1" />
                <div>
                  <p className="font-semibold text-[#14264D]">Active Service Districts (Uttar Pradesh)</p>
                  <p className="text-xs">Pratapgarh, Amethi, Jaunpur, Prayagraj, Raebareli, Sultanpur</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="size-4 text-[#1266C5]" />
                <a href={`mailto:${CAREER_AVSAR_BRAND.supportEmail}`} className="text-xs font-semibold text-[#1266C5] hover:underline">
                  {CAREER_AVSAR_BRAND.supportEmail}
                </a>
              </div>
            </div>
          </Card>

          <Card className="p-6 sm:p-7 border-slate-200 bg-blue-50/50">
            <CardTitle className="text-base font-serif text-[#14264D]">Are You Hiring for a School?</CardTitle>
            <p className="mt-2 text-xs text-[#687487] leading-relaxed">
              Schools in our six districts can submit faculty requirements directly. Our coordinators pre-screen and share verified teacher dossiers tailored to your board curriculum.
            </p>
            <div className="mt-4">
              <Button asChildLink href="/for-schools" size="sm" className="bg-[#1266C5] text-white hover:bg-[#087FE8]">
                <span>Explore School Solutions</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
