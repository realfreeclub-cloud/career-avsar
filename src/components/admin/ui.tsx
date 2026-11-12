"use client";
import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Button, Input, Card, CardHeader, CardTitle, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { StatusPill } from "@/components/teacher/dashboard/ui";
import { apiFetch } from "@/lib/api/client";

export { StatusPill };

export function AdminPage({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="min-w-0">
          <h1 className="font-serif text-xl font-bold text-primary sm:text-2xl lg:text-3xl break-words">{title}</h1>
          {subtitle ? <p className="mt-1 text-xs sm:text-sm text-muted leading-relaxed">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2 sm:shrink-0 w-full sm:w-auto">{actions}</div> : null}
      </header>
      {children}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm transition-all hover:border-[#D0C9B8]">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-2 font-serif text-3xl font-bold text-primary">{value}</p>
      {hint ? <p className="mt-1 text-xs text-text-subtle">{hint}</p> : null}
    </div>
  );
}

export function Pager({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 pt-3 text-sm">
      <span className="text-muted font-medium">Page {page} of {totalPages}</span>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Previous
        </Button>
        <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}

export function DataTable<T>({
  cols,
  rows,
  rowKey,
  loading,
  error,
  onRetry,
  emptyTitle,
  emptyDesc,
  renderMobile,
}: {
  cols: { key: string; label: string; className?: string; render: (row: T) => React.ReactNode }[];
  rows: T[];
  rowKey: (r: T) => string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyTitle: string;
  emptyDesc: string;
  renderMobile?: (row: T) => React.ReactNode;
}) {
  if (loading) {
    return (
      <Card className="p-4">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }
  if (error) return <ErrorState title="Unable to load data" message={error} onRetry={onRetry} />;
  if (!rows.length) return <EmptyState title={emptyTitle} description={emptyDesc} />;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      {renderMobile ? (
        <ul className="divide-y divide-border/60 md:hidden">
          {rows.map((r) => (
            <li key={rowKey(r)} className="p-4">
              {renderMobile(r)}
            </li>
          ))}
        </ul>
      ) : null}
      <div className={cn("overflow-x-auto", renderMobile && "hidden md:block")}>
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-soft-blue/70 text-xs font-semibold uppercase tracking-wider text-primary">
            <tr>
              {cols.map((c) => (
                <th key={c.key} className={cn("whitespace-nowrap px-4 py-3.5", c.className)}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rows.map((r) => (
              <tr key={rowKey(r)} className="align-top hover:bg-[#FAF9F5] transition-colors">
                {cols.map((c) => (
                  <td key={c.key} className={cn("px-4 py-3.5 text-text", c.className)}>
                    {c.render(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function usePaged<T>(url: string, deps: unknown[]) {
  const [data, setData] = React.useState<{ items: T[]; page: { page: number; limit: number; total: number; totalPages: number } } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await apiFetch<typeof data extends infer D ? D : never>(url);
    if (!res.ok) setError(res.error.message);
    else setData(res.data as { items: T[]; page: { page: number; limit: number; total: number; totalPages: number } });
    setLoading(false);
  }, [url]);
  React.useEffect(() => {
    load();
  }, [load, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps
  return { data, loading, error, reload: load };
}

export { Card, CardHeader, CardTitle, Button, Input, EmptyState, ErrorState, Skeleton, cn };
