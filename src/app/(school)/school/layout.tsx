import type { Metadata } from "next";
import { headers } from "next/headers";
import { SchoolShell } from "@/components/school/school-shell";
import { CAREER_AVSAR_BRAND } from "@/lib/brand/config";

export const metadata: Metadata = {
  title: `School Recruitment Portal | ${CAREER_AVSAR_BRAND.brandName}`,
  description: `Institutional recruitment dashboard for ${CAREER_AVSAR_BRAND.brandName} – ${CAREER_AVSAR_BRAND.tagline}.`,
};

export const dynamic = "force-dynamic";

export default async function SchoolLayout({ children }: { children: React.ReactNode }) {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";

  // Allow unauthenticated access to login and activation pages
  if (pathname === "/school/login" || pathname === "/school/activate") {
    return <>{children}</>;
  }

  return <SchoolShell>{children}</SchoolShell>;
}
