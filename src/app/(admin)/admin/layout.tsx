import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/shell";

export const metadata: Metadata = {
  title: "Admin Console | Career Avsar",
  description: "Internal operations console for Career Avsar – Teacher Recruitment & Career Opportunities.",
};
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";

  // Allow unauthenticated access to the dedicated admin login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const auth = await requireAdmin();
  if (!auth.ok) {
    redirect("/admin/login?next=/admin/dashboard");
  }

  return <AdminShell>{children}</AdminShell>;
}
