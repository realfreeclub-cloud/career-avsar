"use client";

import * as React from "react";
import { ShieldAlert } from "lucide-react";
import { AdminPage, DataTable, Pager, Card } from "@/components/admin/ui";
import { apiFetch } from "@/lib/api/client";
import type { Paged } from "@/types/admin";

type Row = {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  summary: string;
  createdAt: string;
};

export default function AdminAuditLogsPage() {
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<Paged<Row> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await apiFetch<Paged<Row>>(`/api/admin/audit-logs?page=${page}&limit=30`);
    if (!res.ok) setError(res.error.message);
    else setData(res.data);
    setLoading(false);
  }, [page]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <AdminPage
      title="System Audit Logs"
      subtitle="Immutable trail of administrative operations, document verification reviews, sensitive exports, and status transitions."
    >
      <Card className="border border-border p-4 bg-soft-blue/30 text-sm text-secondary-text shadow-xs flex items-center gap-3">
        <ShieldAlert className="size-5 text-secondary shrink-0" aria-hidden />
        <p>
          Audit logs provide enterprise security and compliance tracking. Sensitive record modifications are automatically timestamped and attributed.
        </p>
      </Card>

      <DataTable<Row>
        loading={loading}
        error={error}
        onRetry={load}
        rows={data?.items || []}
        rowKey={(r) => r.id}
        emptyTitle="No audit records"
        emptyDesc="Administrative actions such as credential verification, status transitions, and data exports are logged in real time."
        cols={[
          {
            key: "time",
            label: "Timestamp (IST)",
            render: (r) => (
              <span className="text-xs font-mono text-secondary-text">
                {new Date(r.createdAt).toLocaleString("en-IN")}
              </span>
            ),
          },
          {
            key: "action",
            label: "Operation",
            render: (r) => (
              <span className="inline-flex items-center rounded-md bg-white border border-border px-2 py-0.5 text-xs font-semibold text-primary shadow-xs">
                {r.action}
              </span>
            ),
          },
          {
            key: "entity",
            label: "Target Entity",
            render: (r) => (
              <span className="text-xs font-medium text-primary">
                {r.entityType}
                {r.entityId ? <span className="text-secondary-text font-mono"> · {r.entityId.slice(-6)}</span> : null}
              </span>
            ),
          },
          {
            key: "summary",
            label: "Audit Details",
            render: (r) => <span className="text-xs text-secondary-text leading-relaxed">{r.summary}</span>,
          },
        ]}
      />
      {data ? <Pager page={data.page.page} totalPages={data.page.totalPages} onPage={setPage} /> : null}
    </AdminPage>
  );
}
