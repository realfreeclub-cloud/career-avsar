import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo/metadata";
import { LoginForm } from "@/components/teacher/login-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = buildMetadata({ title: "Teacher Login", description: "Sign in to your teacher account.", path: "/teacher/login" });

export default function TeacherLoginPage() {
  return (
    <div className="container-safe py-10 sm:py-14">
      <Suspense fallback={<div className="mx-auto max-w-md"><Skeleton className="h-80 w-full rounded-2xl" /></div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
