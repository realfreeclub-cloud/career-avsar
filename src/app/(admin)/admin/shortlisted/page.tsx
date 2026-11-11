"use client";

import * as React from "react";
import { AdminPage, DataTable, Pager, Button, StatusPill } from "@/components/admin/ui";
import { apiFetch } from "@/lib/api/client";
import type { Paged } from "@/types/admin";

type AppRow = {
  id: string;
  teacherName?: string;
  jobTitle: string;
  schoolName: string;
  status: string;
  appliedAt: string;
};

export default function AdminShortlistedPage() {
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<Paged<AppRow> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await apiFetch<Paged<AppRow>>(`/api/admin/shortlisted?page=${page}&limit=20`);
    if (!res.ok) setError(res.error.message);
    else setData(res.data);
    setLoading(false);
  }, [page]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function move(id: string, status: string) {
    await apiFetch("/api/admin/applications", {
      method: "PATCH",
      body: JSON.stringify({ id, status }),
    });
    load();
  }

  return (
    <AdminPage
      title="Shortlisted Candidates"
      subtitle="Review vetted candidates shortlisted for institutional vacancies, coordinate interview scheduling, or extend formal offers."
    >
      <DataTable<AppRow>
        loading={loading}
        error={error}
        onRetry={load}
        rows={data?.items || []}
        rowKey={(r) => r.id}
        emptyTitle="No shortlisted candidates"
        emptyDesc="Evaluate incoming candidate submissions in the Applications module to shortlist prospective educators."
        cols={[
          {
            key: "teacher",
            label: "Candidate Name",
            render: (r) => <span className="font-semibold text-primary">{r.teacherName || "Unassigned Name"}</span>,
          },
          {
            key: "job",
            label: "Target Position & Institution",
            render: (r) => (
              <div>
                <span className="font-medium text-primary">{r.jobTitle}</span>
                <span className="block text-xs text-secondary-text">{r.schoolName}</span>
              </div>
            ),
          },
          {
            key: "status",
            label: "Pipeline Stage",
            render: (r) => <StatusPill status={r.status} />,
          },
          {
            key: "actions",
            label: "Actions",
            render: (r) => (
              <span className="flex items-center gap-1.5">
                <Button size="sm" variant="secondary" onClick={() => move(r.id, "interview")} className="text-xs">
                  Schedule Interview
                </Button>
                <Button size="sm" variant="ghost" onClick={() => move(r.id, "offered")} className="text-xs text-secondary-text hover:text-primary">
                  Extend Offer
                </Button>
              </span>
            ),
          },
        ]}
      />
      {data ? <Pager page={data.page.page} totalPages={data.page.totalPages} onPage={setPage} /> : null}
    </AdminPage>
  );
}
