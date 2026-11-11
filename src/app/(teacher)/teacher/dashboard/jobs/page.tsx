import { JobsExplorer } from "@/components/public/jobs-explorer";
import { GlassPanel } from "@/components/teacher/glass-panel";

export default function TeacherDashboardJobsPage() {
  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-4">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-primary sm:text-3xl">Find Teaching Opportunities</h1>
        <p className="mt-1 text-sm text-secondary-text sm:text-base">
          Browse verified teaching vacancies matching your specialization, location, and board preference.
        </p>
      </header>
      <GlassPanel>
        <JobsExplorer pageSize={9} showLoadMore />
      </GlassPanel>
    </div>
  );
}
