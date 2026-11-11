"use client";

import * as React from "react";
import { Building2, Quote, ShieldCheck, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { PublicInstitution, PublicTestimonial } from "@/server/services/public";

type ListResponse<T> = { ok: boolean; data?: { items: T[] }; error?: { message: string } };

export function FeaturedInstitutionsSection() {
  const [items, setItems] = React.useState<PublicInstitution[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/public/institutions?limit=12", { cache: "no-store" });
      const json = (await res.json()) as ListResponse<PublicInstitution>;
      if (!res.ok || !json.ok) throw new Error(json.error?.message || "Unable to load institutions");
      setItems(json.data?.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load institutions");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <section aria-labelledby="institutions-heading" className="container-safe py-12 sm:py-16">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-gold">
            Verified Academic Partners
          </p>
          <h2 id="institutions-heading" className="mt-1 font-serif text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            Approved Institutions &amp; Schools
          </h2>
          <p className="mt-2 text-sm text-muted sm:text-base leading-relaxed">
            Leading schools, junior colleges, and international academies hiring verified teachers through the national platform.
          </p>
        </div>
        <div className="shrink-0 text-xs font-semibold text-muted">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-soft-blue px-3 py-1 text-secondary border border-[#D5DFEB]">
            <ShieldCheck className="size-3.5 text-accent-gold" /> Admin-Vetted Records
          </span>
        </div>
      </div>

      {error ? <ErrorState message={error} onRetry={load} /> : null}

      {!error && loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} aria-hidden className="p-6">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-4/5" />
            </Card>
          ))}
        </div>
      ) : null}

      {!error && !loading && items.length === 0 ? (
        <EmptyState
          title="No featured institutions yet"
          description="Admin-approved institutions will be displayed here once verified. We only present authenticated schools."
        />
      ) : null}

      {!error && !loading && items.length > 0 ? (
        <ul className="grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((inst) => (
            <li key={inst.id} className="min-w-0">
              <article className="group flex h-full min-w-0 flex-col rounded-xl border border-border bg-white p-5 shadow-[0_2px_8px_-2px_rgba(20,35,59,0.05)] transition-all duration-200 hover:-translate-y-1 hover:border-[#D0C9B8] hover:shadow-[0_12px_24px_-6px_rgba(20,35,59,0.08)] sm:p-6">
                <div className="flex items-start gap-3.5">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-soft-blue text-secondary border border-[#D5DFEB]">
                    <Building2 aria-hidden className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-serif text-base font-bold text-primary group-hover:text-secondary sm:text-lg truncate">
                        {inst.name}
                      </h3>
                      <span title="Admin Verified"><ShieldCheck aria-hidden className="size-4 shrink-0 text-accent-gold" /></span>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-muted">
                      <MapPin className="size-3.5 shrink-0" />
                      <span className="truncate">{[inst.type, inst.city, inst.state].filter(Boolean).join(" · ") || "Verified institution"}</span>
                    </p>
                  </div>
                </div>
                {inst.description ? (
                  <p className="mt-3.5 line-clamp-3 text-xs leading-relaxed text-muted sm:text-sm">
                    {inst.description}
                  </p>
                ) : null}
              </article>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function TestimonialsSection() {
  const [items, setItems] = React.useState<PublicTestimonial[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/public/testimonials?limit=12", { cache: "no-store" });
      const json = (await res.json()) as ListResponse<PublicTestimonial>;
      if (!res.ok || !json.ok) throw new Error(json.error?.message || "Unable to load testimonials");
      setItems(json.data?.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load testimonials");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <section aria-labelledby="testimonials-heading" className="border-y border-border bg-[#F4F1EA]/60 py-12 sm:py-16">
      <div className="container-safe">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-gold">
            Real Stories, Real Placements
          </p>
          <h2 id="testimonials-heading" className="mt-1 font-serif text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            Voices of Teachers &amp; Academic Heads
          </h2>
          <p className="mt-2 text-sm text-muted sm:text-base leading-relaxed">
            Authentic experiences from educators who advanced their teaching careers and institutions that found verified talent.
          </p>
        </div>

        {error ? <ErrorState message={error} onRetry={load} /> : null}

        {!error && loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} aria-hidden className="p-6">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-5/6" />
                <Skeleton className="mt-4 h-4 w-1/3" />
              </Card>
            ))}
          </div>
        ) : null}

        {!error && !loading && items.length === 0 ? (
          <EmptyState
            title="No approved testimonials yet"
            description="Verified testimonials from educators and institutions will appear here once approved by our moderation team."
          />
        ) : null}

        {!error && !loading && items.length > 0 ? (
          <ul className="grid list-none gap-5 p-0 md:grid-cols-2 xl:grid-cols-3">
            {items.map((t) => (
              <li key={t.id} className="min-w-0">
                <figure className="flex h-full flex-col justify-between rounded-xl border border-border bg-white p-6 shadow-[0_2px_8px_-2px_rgba(20,35,59,0.05)] transition-all duration-200 hover:border-[#D0C9B8] hover:shadow-[0_12px_24px_-6px_rgba(20,35,59,0.08)]">
                  <div>
                    <Quote aria-hidden className="size-6 text-accent-gold" />
                    <blockquote className="mt-3 font-serif text-base font-normal italic leading-relaxed text-text">
                      &ldquo;{t.content}&rdquo;
                    </blockquote>
                  </div>
                  <figcaption className="mt-6 border-t border-border/60 pt-4 text-sm">
                    <span className="font-serif font-bold text-primary">{t.authorName}</span>
                    {t.role || t.organization ? (
                      <span className="block text-xs font-medium text-muted">
                        {[t.role, t.organization].filter(Boolean).join(" · ")}
                      </span>
                    ) : null}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
