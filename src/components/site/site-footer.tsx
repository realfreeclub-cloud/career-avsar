import Link from "next/link";
import { ShieldCheck, Mail, MapPin } from "lucide-react";
import { BrandLogo } from "@/components/brand/logo";
import { CAREER_AVSAR_BRAND } from "@/lib/brand/config";

const cols = [
  {
    title: "Service Districts (UP)",
    links: [
      { href: "/teaching-jobs-in-pratapgarh", label: "Jobs in Pratapgarh" },
      { href: "/teaching-jobs-in-amethi", label: "Jobs in Amethi" },
      { href: "/teaching-jobs-in-jaunpur", label: "Jobs in Jaunpur" },
      { href: "/teaching-jobs-in-prayagraj", label: "Jobs in Prayagraj" },
      { href: "/teaching-jobs-in-raebareli", label: "Jobs in Raebareli" },
      { href: "/teaching-jobs-in-sultanpur", label: "Jobs in Sultanpur" },
    ],
  },
  {
    title: "For Teachers",
    links: [
      { href: "/teacher/register", label: "Teacher Registration" },
      { href: "/teacher/login", label: "Teacher Portal Login" },
      { href: "/jobs", label: "Find Teaching Jobs" },
      { href: "/for-teachers", label: "Educator Benefits" },
      { href: "/how-it-works", label: "How Recruitment Works" },
      { href: "/faq", label: "Frequently Asked Questions" },
    ],
  },
  {
    title: "For Schools",
    links: [
      { href: "/for-schools", label: "Hire Qualified Teachers" },
      { href: "/school/login", label: "School Portal Login" },
      { href: "/contact", label: "Post Teacher Requirement" },
      { href: "/about", label: "Recruitment Methodology" },
    ],
  },
  {
    title: "Platform & Trust",
    links: [
      { href: "/about", label: "About Career Avsar" },
      { href: "/contact", label: "Contact Recruitment Team" },
      { href: "/admin/login", label: "Administrator Login" },
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-[#F6F8FC] text-text">
      <div className="container-safe py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand Column */}
          <div className="min-w-0 sm:col-span-2">
            <BrandLogo size="lg" showTagline={true} />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
              {CAREER_AVSAR_BRAND.brandPositioning}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#1266C5]">
              <ShieldCheck className="size-4 shrink-0 text-[#1266C5]" />
              <span>Admin-Verified Institutions &bull; Transparent Placement</span>
            </div>
            <div className="mt-5 space-y-2 text-xs text-muted">
              <p className="flex items-center gap-2">
                <MapPin className="size-3.5 text-[#1266C5]" />
                <span>Active Target Districts: Pratapgarh, Amethi, Jaunpur, Prayagraj, Raebareli, Sultanpur</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="size-3.5 text-[#1266C5]" />
                <span>{CAREER_AVSAR_BRAND.supportEmail}</span>
              </p>
            </div>
          </div>

          {/* Navigation Columns */}
          {cols.map((col) => (
            <nav key={col.title} aria-label={col.title} className="min-w-0">
              <h2 className="font-serif text-sm font-bold uppercase tracking-wider text-[#14264D]">
                {col.title}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={`${col.title}-${link.href}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="touch-target inline-flex items-center text-xs font-medium text-muted transition hover:text-[#1266C5] hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {CAREER_AVSAR_BRAND.brandName}. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span className="inline-block size-2 rounded-full bg-success" />
            <span>Connecting Schools with Exceptional Educators</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
