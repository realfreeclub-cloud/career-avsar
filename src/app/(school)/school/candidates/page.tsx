"use client";

import * as React from "react";
import { FileText, MessageSquare, CalendarDays, ShieldCheck } from "lucide-react";
import { Card, Button } from "@/components/ui";

const DUMMY_CANDIDATES = [
  {
    id: "cand_1",
    name: "Ananya Verma",
    vacancy: "Senior PGT Mathematics Teacher",
    qualifications: "M.Sc Mathematics, B.Ed, CTET Paper 2",
    experience: "4 Years (2 yrs at St. Joseph's Convent)",
    district: "Prayagraj",
    sharedDate: "10 Nov 2026",
    status: "Shortlisted for Demo",
  },
  {
    id: "cand_2",
    name: "Rajesh Tiwari",
    vacancy: "TGT Science Specialist",
    qualifications: "B.Sc (PCM), B.Ed, UPTET Paper 2",
    experience: "6 Years (CBSE Affiliated Senior Secondary)",
    district: "Pratapgarh",
    sharedDate: "08 Nov 2026",
    status: "Demo Scheduled",
  },
  {
    id: "cand_3",
    name: "Sunita Mishra",
    vacancy: "PRT Primary English Educator",
    qualifications: "B.A. English (Hons), B.Ed, CTET Paper 1",
    experience: "3 Years Primary Teaching",
    district: "Sultanpur",
    sharedDate: "07 Nov 2026",
    status: "Under Review",
  },
];

export default function SchoolCandidatesPage() {
  const [selectedCandidate, setSelectedCandidate] = React.useState<typeof DUMMY_CANDIDATES[0] | null>(null);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#1266C5] w-fit">
          <ShieldCheck className="size-3.5" />
          <span>Admin-Curated Educator Dossiers</span>
        </div>
        <h1 className="mt-3 font-serif text-2xl font-bold text-[#14264D]">Shortlisted Candidates</h1>
        <p className="mt-1 text-xs text-[#687487]">
          Review qualified educator profiles pre-screened and forwarded by Career Avsar administrators for your active vacancies.
        </p>
      </div>

      <div className="grid gap-4">
        {DUMMY_CANDIDATES.map((c) => (
          <Card key={c.id} className="p-5 border-slate-200 hover:border-[#1266C5] transition">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-base text-[#14264D]">{c.name}</span>
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-[#1266C5]">
                    {c.status}
                  </span>
                </div>
                <p className="text-xs font-medium text-[#1266C5] mt-0.5">{c.vacancy}</p>
                <p className="text-xs text-[#687487] mt-1">
                  <strong>Credentials:</strong> {c.qualifications} &bull; <strong>Experience:</strong> {c.experience}
                </p>
                <p className="text-[11px] text-muted mt-1">
                  Location: {c.district}, UP &bull; Shared on: {c.sharedDate}
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedCandidate(c)}
                  className="border-slate-300 text-xs"
                >
                  <FileText className="mr-1 size-3.5 text-[#1266C5]" />
                  <span>View Dossier</span>
                </Button>
                <Button
                  asChildLink
                  href={`/school/interviews?candidate=${c.id}`}
                  size="sm"
                  className="bg-[#1266C5] text-white hover:bg-[#087FE8] text-xs"
                >
                  <CalendarDays className="mr-1 size-3.5" />
                  <span>Schedule Demo</span>
                </Button>
                <Button
                  asChildLink
                  href={`/school/feedback?candidate=${c.id}`}
                  size="sm"
                  variant="ghost"
                  className="text-xs text-[#14264D] hover:bg-slate-100"
                >
                  <MessageSquare className="size-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Dossier Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#14264D]">{selectedCandidate.name}</h3>
                <p className="text-xs text-[#1266C5]">{selectedCandidate.vacancy}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-[#172334]">
              <div>
                <span className="font-semibold text-muted block">Academic Degrees &amp; Certifications</span>
                <p className="mt-0.5">{selectedCandidate.qualifications}</p>
              </div>
              <div>
                <span className="font-semibold text-muted block">Verified School Experience</span>
                <p className="mt-0.5">{selectedCandidate.experience}</p>
              </div>
              <div>
                <span className="font-semibold text-muted block">Preferred District &amp; Commute</span>
                <p className="mt-0.5">{selectedCandidate.district}, Uttar Pradesh</p>
              </div>
              <div>
                <span className="font-semibold text-muted block">Admin Screening Note</span>
                <p className="mt-0.5 rounded-lg bg-blue-50/70 p-2 text-slate-700 italic">
                  &ldquo;Candidate verified by platform coordinators. Strong classroom presence, conceptual clarity in CBSE curriculum, ready for in-person demonstration lecture.&rdquo;
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-3">
              <Button size="sm" variant="outline" onClick={() => setSelectedCandidate(null)}>
                Close
              </Button>
              <Button asChildLink href={`/school/interviews?candidate=${selectedCandidate.id}`} size="sm" className="bg-[#1266C5] text-white">
                Request Interview Slot
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
