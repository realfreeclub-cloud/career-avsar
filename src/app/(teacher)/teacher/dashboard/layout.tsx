import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireTeacher } from "@/lib/auth";
import { getTeacherProfile } from "@/server/services/teacher/profile";
import { TeacherDashboardShell } from "@/components/teacher/dashboard/shell";

export const metadata: Metadata = {
  title: "Teacher Dashboard",
  description: "Manage your teacher profile, jobs, applications, interviews, notifications, and account settings.",
};

export const dynamic = "force-dynamic";

export default async function TeacherDashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireTeacher();
  if (!auth.ok) redirect("/teacher/login?next=/teacher/dashboard");

  const profile = await getTeacherProfile(auth.userId).catch(() => null);
  const user = {
    name: profile?.personal.fullName || "Teacher",
    email: profile?.personal.email || "",
    verificationStatus: profile?.verification.status || "unverified",
  };

  return <TeacherDashboardShell user={user}>{children}</TeacherDashboardShell>;
}
