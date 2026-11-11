import { buildMetadata } from "@/lib/seo/metadata";
import { TeacherProfileClient } from "@/components/teacher/teacher-profile-client";

export const metadata = buildMetadata({
  title: "My Profile",
  description: "Manage your teacher registration, qualifications, experience, and documents.",
  path: "/teacher/dashboard/profile",
});

export const dynamic = "force-dynamic";

export default function TeacherDashboardProfilePage() {
  return <TeacherProfileClient />;
}
