"use client";

import * as React from "react";
import Link from "next/link";
import {
  MapPin,
  Plus,
  ExternalLink,
  Edit2,
  CheckCircle2,
  XCircle,
  Star,
  RefreshCw,
  Loader2,
  ShieldAlert,
  Building,
} from "lucide-react";
import { Card, Button, Input, Skeleton, ErrorState } from "@/components/admin/ui";
import { cn } from "@/lib/utils/cn";
import type { LocationDto } from "@/server/services/locations";

export function ServiceAreaManager() {
  const [locations, setLocations] = React.useState<LocationDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"create" | "edit">("create");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  // Form State
  const [district, setDistrict] = React.useState("");
  const [state, setState] = React.useState("Uttar Pradesh");
  const [slug, setSlug] = React.useState("");
  const [headquarterCity, setHeadquarterCity] = React.useState("");
  const [displayOrder, setDisplayOrder] = React.useState<number>(1);
  const [isActive, setIsActive] = React.useState(true);
  const [isFeatured, setIsFeatured] = React.useState(false);
  const [seoTitle, setSeoTitle] = React.useState("");
  const [seoDescription, setSeoDescription] = React.useState("");
  const [majorTownsText, setMajorTownsText] = React.useState("");

  const loadLocations = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/locations");
      if (!res.ok) throw new Error("Failed to load service locations");
      const json = await res.json();
      setLocations(json.data?.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load locations");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  function openCreateModal() {
    setModalMode("create");
    setEditingId(null);
    setDistrict("");
    setState("Uttar Pradesh");
    setSlug("");
    setHeadquarterCity("");
    setDisplayOrder(locations.length + 1);
    setIsActive(true);
    setIsFeatured(false);
    setSeoTitle("");
    setSeoDescription("");
    setMajorTownsText("");
    setModalOpen(true);
  }

  function openEditModal(loc: LocationDto) {
    setModalMode("edit");
    setEditingId(loc.id);
    setDistrict(loc.district);
    setState(loc.state);
    setSlug(loc.slug);
    setHeadquarterCity(loc.headquarterCity || loc.district);
    setDisplayOrder(loc.displayOrder);
    setIsActive(loc.isActive);
    setIsFeatured(loc.isFeatured);
    setSeoTitle(loc.seoTitle || "");
    setSeoDescription(loc.seoDescription || "");
    setMajorTownsText((loc.majorTowns || []).join(", "));
    setModalOpen(true);
  }

  async function handleToggleActive(loc: LocationDto) {
    try {
      setTogglingId(loc.id);
      const res = await fetch(`/api/admin/locations/${loc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !loc.isActive }),
      });
      if (!res.ok) throw new Error("Failed to toggle status");
      const json = await res.json();
      if (json.data?.location) {
        setLocations((prev) =>
          prev.map((l) => (l.id === loc.id ? { ...l, isActive: !loc.isActive } : l)),
        );
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action failed");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleToggleFeatured(loc: LocationDto) {
    try {
      setTogglingId(loc.id);
      const res = await fetch(`/api/admin/locations/${loc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !loc.isFeatured }),
      });
      if (!res.ok) throw new Error("Failed to toggle featured state");
      setLocations((prev) =>
        prev.map((l) => (l.id === loc.id ? { ...l, isFeatured: !loc.isFeatured } : l)),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action failed");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!district.trim()) {
      alert("District name is required.");
      return;
    }

    setSaving(true);
    const towns = majorTownsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      district: district.trim(),
      state: state.trim() || "Uttar Pradesh",
      slug: slug.trim() || undefined,
      headquarterCity: headquarterCity.trim() || district.trim(),
      displayOrder: Number(displayOrder) || 0,
      isActive,
      isFeatured,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
      majorTowns: towns,
    };

    try {
      if (modalMode === "create") {
        const res = await fetch("/api/admin/locations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok || !json.ok) throw new Error(json.error?.message || "Failed to create location");
      } else {
        const res = await fetch(`/api/admin/locations/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok || !json.ok) throw new Error(json.error?.message || "Failed to update location");
      }
      setModalOpen(false);
      await loadLocations();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const activeCount = locations.filter((l) => l.isActive).length;
  const totalJobs = locations.reduce((sum, l) => sum + (l.activeJobsCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Metric Highlights */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4 border-border/80 bg-white">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-muted">Active Launch Districts</p>
              <p className="font-serif text-xl font-bold text-primary">{activeCount} of {locations.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border/80 bg-white">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-soft-blue text-secondary border border-[#D5DFEB]">
              <MapPin className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-muted">Initial Target State</p>
              <p className="font-serif text-xl font-bold text-primary">Uttar Pradesh</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border/80 bg-white">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#FAF5EB] text-[#8F7032] border border-[#E9DCBF]">
              <Building className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-muted">Published Vacancies</p>
              <p className="font-serif text-xl font-bold text-primary">{totalJobs} Active Openings</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Safety & Compliance Policy Note */}
      <div className="rounded-2xl border border-[#DCD5C5] bg-[#F9F7F1] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <ShieldAlert className="size-5 shrink-0 text-accent-gold mt-0.5" />
          <div className="text-xs text-text leading-relaxed">
            <p className="font-bold text-primary text-sm">Service Area Deactivation Rules</p>
            <p className="mt-1 text-muted">
              When a district is deactivated: it is hidden from new public job searches and new teacher preference selection. 
              <strong> All existing teacher profiles, submitted applications, and historical vacancy records are permanently preserved without data loss.</strong> Admin can continue to review candidates and manage past vacancies.
            </p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-serif text-base font-bold text-primary sm:text-lg">District Service Locations</h3>
          <p className="text-xs text-muted">Manage active regional districts, display priority, and custom SEO landing configurations.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={loadLocations} disabled={loading} size="sm">
            <RefreshCw className={cn("size-3.5", loading && "animate-spin text-secondary")} />
            <span>Refresh</span>
          </Button>
          <Button onClick={openCreateModal} size="sm" className="bg-primary hover:bg-secondary text-white font-medium">
            <Plus className="size-4 text-accent-gold" />
            <span>Add District</span>
          </Button>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && !locations.length && (
        <div className="space-y-3">
          <Skeleton className="h-20 rounded-xl bg-white border border-border" />
          <Skeleton className="h-20 rounded-xl bg-white border border-border" />
          <Skeleton className="h-20 rounded-xl bg-white border border-border" />
        </div>
      )}

      {error && <ErrorState title="Failed to load locations" message={error} onRetry={loadLocations} />}

      {/* District Cards Grid */}
      {!loading && locations.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((loc) => {
            const isToggling = togglingId === loc.id;
            return (
              <Card
                key={loc.id}
                className={cn(
                  "relative flex flex-col justify-between p-5 transition duration-200",
                  loc.isActive ? "border-border/80 bg-white shadow-2xs" : "border-border/40 bg-gray-50/80 opacity-75",
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-soft-blue text-xs font-bold text-secondary">
                        #{loc.displayOrder}
                      </span>
                      <div>
                        <h4 className="font-serif text-base font-bold text-primary">{loc.district}</h4>
                        <p className="text-xs text-muted">{loc.state}, {loc.country}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        title={loc.isFeatured ? "Featured District (Click to remove)" : "Click to mark Featured"}
                        onClick={() => handleToggleFeatured(loc)}
                        disabled={isToggling}
                        className={cn(
                          "rounded-lg p-1.5 transition",
                          loc.isFeatured ? "text-accent-gold bg-amber-50" : "text-gray-300 hover:text-gray-400",
                        )}
                      >
                        <Star className="size-4 fill-current" />
                      </button>

                      <button
                        type="button"
                        title="Edit district details"
                        onClick={() => openEditModal(loc)}
                        className="rounded-lg p-1.5 text-muted hover:bg-soft-blue hover:text-primary transition"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Slug & Public Link */}
                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/50 pt-2.5 text-xs">
                    <span className="font-mono text-[11px] text-muted">/{loc.slug}</span>
                    <Link
                      href={`/teaching-jobs-in-${loc.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary hover:underline"
                    >
                      <span>Public Landing</span>
                      <ExternalLink className="size-3" />
                    </Link>
                  </div>

                  {/* SEO Details summary */}
                  {loc.seoTitle && (
                    <p className="mt-2 text-[11px] text-muted line-clamp-1 italic">
                      Title: {loc.seoTitle}
                    </p>
                  )}
                  {loc.majorTowns && loc.majorTowns.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-muted">
                      {loc.majorTowns.slice(0, 3).map((t) => (
                        <span key={t} className="rounded bg-warm-ivory px-1.5 py-0.5 border border-border/60">
                          {t}
                        </span>
                      ))}
                      {loc.majorTowns.length > 3 && (
                        <span className="text-muted/80">+{loc.majorTowns.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Status Toggle & Job Count */}
                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="text-xs font-semibold text-primary">
                    {loc.activeJobsCount} published vacancy{loc.activeJobsCount === 1 ? "" : "ies"}
                  </span>

                  <button
                    type="button"
                    disabled={isToggling}
                    onClick={() => handleToggleActive(loc)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider transition",
                      loc.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200",
                    )}
                  >
                    {isToggling ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : loc.isActive ? (
                      <CheckCircle2 className="size-3 text-emerald-600" />
                    ) : (
                      <XCircle className="size-3 text-gray-500" />
                    )}
                    <span>{loc.isActive ? "ACTIVE" : "INACTIVE"}</span>
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal: Create / Edit District */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-lg font-bold text-primary">
              {modalMode === "create" ? "Add New Service District" : `Edit District: ${district}`}
            </h3>
            <p className="mt-1 text-xs text-muted">
              Configure this district for regional teacher registration, job vacancies, and SEO landing indexation.
            </p>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-3.5">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="District Name *"
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    if (modalMode === "create" && !slug) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                    }
                  }}
                  placeholder="e.g. Varanasi, Gorakhpur"
                  required
                />
                <Input
                  label="State *"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Uttar Pradesh"
                  required
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="URL Slug *"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}
                  placeholder="e.g. varanasi"
                  hint="Used in /teaching-jobs-in-[slug]"
                  required
                />
                <Input
                  label="Headquarter City"
                  value={headquarterCity}
                  onChange={(e) => setHeadquarterCity(e.target.value)}
                  placeholder="e.g. Varanasi"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Input
                  label="Display Order"
                  type="number"
                  min="0"
                  value={String(displayOrder)}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                />
                <div className="flex flex-col justify-end pb-1.5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-primary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="size-4 rounded text-primary focus:ring-accent"
                    />
                    <span>Active in Service Area</span>
                  </label>
                </div>
                <div className="flex flex-col justify-end pb-1.5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-primary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="size-4 rounded text-primary focus:ring-accent"
                    />
                    <span>Featured on Home</span>
                  </label>
                </div>
              </div>

              <Input
                label="Major Towns / Localities (Comma separated)"
                value={majorTownsText}
                onChange={(e) => setMajorTownsText(e.target.value)}
                placeholder="e.g. Kashi, Sigra, Lanka, Shivpur"
                hint="Provides helpful quick-select suggestions for teacher registration in this district"
              />

              <Input
                label="Custom SEO Page Title"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={`Teaching Jobs in ${district || "District"}, Uttar Pradesh | Teacher Recruitment`}
              />

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">SEO Meta Description</label>
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs text-primary focus:border-secondary focus:outline-none"
                  placeholder={`Explore verified school teacher vacancies in ${district || "District"}, UP...`}
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-border pt-4">
                <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="bg-primary hover:bg-secondary text-white font-medium">
                  {saving ? <><Loader2 className="size-4 animate-spin" /> Saving...</> : modalMode === "create" ? "Add District" : "Update District"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
