"use client";

import * as React from "react";
import { Mail } from "lucide-react";
import { Card, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { apiFetch } from "@/lib/api/client";
import type { DashboardMessage } from "@/types/dashboard";

export default function MessagesPage() {
  const [items, setItems] = React.useState<DashboardMessage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await apiFetch<{ items: DashboardMessage[] }>("/api/teacher/messages");
    if (!res.ok) setError(res.error.message);
    else setItems(res.data.items);
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-4">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-primary sm:text-3xl">Communications & Messages</h1>
        <p className="mt-1 text-sm text-secondary-text sm:text-base">
          Direct recruitment queries, school correspondence, and interview notifications.
        </p>
      </header>
      {loading ? <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div> : null}
      {error ? <ErrorState title="Unable to load messages" message={error} onRetry={load} /> : null}
      {!loading && !error && items.length === 0 ? (
        <EmptyState
          title="No messages yet"
          description="Direct communications from verified schools or recruitment officers will appear here."
        />
      ) : null}
      {!loading && !error && items.length > 0 ? (
        <ul className="space-y-3.5">
          {items.map((m) => (
            <li key={m.id}>
              <Card className="border border-border p-4 sm:p-5 transition-shadow hover:shadow-md">
                <div className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-soft-blue text-primary border border-[#D5DFEB]">
                    <Mail className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="text-sm font-bold text-primary">{m.fromName}</p>
                      {m.fromRole ? <span className="text-xs font-medium text-secondary-text">({m.fromRole})</span> : null}
                      <span className="text-xs text-secondary-text">· {new Date(m.createdAt).toLocaleString("en-IN")}</span>
                    </div>
                    {m.subject ? <p className="mt-1 font-serif text-sm font-semibold text-primary">{m.subject}</p> : null}
                    <p className="mt-1.5 whitespace-pre-wrap text-sm text-secondary-text leading-relaxed">{m.body}</p>
                  </div>
                  {!m.read ? (
                    <span className="flex size-2.5 shrink-0 rounded-full bg-accent-gold ring-4 ring-accent-gold/20" title="Unread message" />
                  ) : null}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
