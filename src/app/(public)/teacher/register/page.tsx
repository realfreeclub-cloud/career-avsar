import { buildMetadata } from "@/lib/seo/metadata";
import { RegisterForm } from "@/components/teacher/register-form";

export const metadata = buildMetadata({ title: "Register as Teacher", description: "Create your teacher account and complete your profile.", path: "/teacher/register" });

export default function TeacherRegisterPage() {
  return (
    <div className="container-safe py-8 sm:py-10 lg:py-12">
      <RegisterForm />
    </div>
  );
}
