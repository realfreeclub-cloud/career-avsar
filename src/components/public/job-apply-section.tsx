"use client";

import * as React from "react";
import { CheckCircle2, Send, AlertCircle, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import type { PublicJob } from "@/server/services/public";

export function JobApplySection({ job }: { job: PublicJob }) {
  const { push } = useToast();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [coverNote, setCoverNote] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [applied, setApplied] = React.useState(false);
  const [authRole, setAuthRole] = React.useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = React.useState(true);

  React.useEffect(() => {
    async function checkMe() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const json = await res.json();
          if (json?.data?.role) setAuthRole(json.data.role);
        }
      } catch {
        // Unauthenticated
      } finally {
        setCheckingAuth(false);
      }
    }
    checkMe();
  }, []);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/teacher/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id, coverNote }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setApplied(true);
          setModalOpen(false);
          push({ tone: "info", title: "Already Applied", message: "You have already submitted an application for this vacancy." });
          return;
        }
        throw new Error(data?.error?.message || "Failed to submit application");
      }
      setApplied(true);
      setModalOpen(false);
      push({
        tone: "success",
        title: "Application Recorded",
        message: `Your dossier has been delivered to ${job.schoolName}. Track progress in your Teacher Dashboard.`,
      });
    } catch (err) {
      push({ tone: "error", title: "Submission Failed", message: (err as Error).message });
    } finally {
      setSubmitting(false);
    }
  }

  const isClosed = job.isExpired || job.status === "closed" || job.status === "paused";

  return (
    <>
      {/* Desktop / In-Page CTA Container */}
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
        {isClosed ? (
          <div className="inline-flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-700">
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            <span>
              {job.status === "paused"
                ? "Application intake is temporarily paused by the institution."
                : "Applications are closed for this position."}
            </span>
          </div>
        ) : applied ? (
          <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-3 text-sm font-bold text-emerald-800">
            <CheckCircle2 className="size-5 text-emerald-600" aria-hidden />
            <span>Application Submitted via Dossier</span>
          </div>
        ) : !checkingAuth && authRole === "teacher" ? (
          <Button
            size="lg"
            onClick={() => setModalOpen(true)}
            className="bg-primary hover:bg-secondary text-white font-medium shadow-sm"
          >
            <Send className="size-4" aria-hidden />
            <span>Apply with Teacher Dossier</span>
          </Button>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChildLink
              href={`/teacher/login?redirect=/jobs/${job.id}`}
              size="lg"
              className="bg-primary hover:bg-secondary text-white font-medium"
            >
              <span>Sign In to Apply</span>
              <ArrowRight className="size-4" aria-hidden />
            </Button>
            <Button
              asChildLink
              href={`/teacher/register?redirect=/jobs/${job.id}`}
              variant="secondary"
              size="lg"
            >
              <span>Register Teacher Profile</span>
            </Button>
          </div>
        )}

        <Button asChildLink href="/contact" variant="outline" size="lg" className="border-border text-primary hover:bg-soft-blue">
          Inquire with Platform
        </Button>
      </div>

      {/* Sticky Mobile Apply Bar */}
      {!isClosed && !applied ? (
        <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-white/95 backdrop-blur-md p-3.5 shadow-xl sm:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-serif text-sm font-bold text-primary">{job.title}</p>
              <p className="truncate text-xs text-secondary-text">{job.schoolName}</p>
            </div>
            {authRole === "teacher" ? (
              <Button
                size="sm"
                onClick={() => setModalOpen(true)}
                className="bg-primary hover:bg-secondary text-white shrink-0 font-medium px-4"
              >
                Apply Now
              </Button>
            ) : (
              <Button
                asChildLink
                href={`/teacher/login?redirect=/jobs/${job.id}`}
                size="sm"
                className="bg-primary hover:bg-secondary text-white shrink-0 font-medium px-4"
              >
                Sign In to Apply
              </Button>
            )}
          </div>
        </div>
      ) : null}

      {/* Apply Modal with Cover Note */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Apply: ${job.title}`}>
        <form onSubmit={handleApply} className="space-y-4 pt-2">
          <div className="rounded-xl border border-border bg-[#FAF9F5] p-3.5 text-xs text-secondary-text space-y-1">
            <p className="font-semibold text-primary">{job.schoolName}</p>
            <p>
              Your verified academic credentials, B.Ed/TET verification records, and candidate profile will be shared directly with hiring officers.
            </p>
          </div>

          <Textarea
            label="Personal Cover Note (Optional)"
            placeholder="Introduce your teaching philosophy, relevant board experience, or specific classroom achievements..."
            rows={4}
            value={coverNote}
            onChange={(e) => setCoverNote(e.target.value)}
            hint="A concise, professional note increases shortlist consideration."
          />

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-primary hover:bg-secondary text-white">
              <FileText className="size-4" aria-hidden />
              <span>{submitting ? "Submitting Dossier…" : "Confirm & Submit Application"}</span>
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
