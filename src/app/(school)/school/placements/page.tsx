"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui";

const DUMMY_PLACEMENTS = [
  {
    id: "plc_1",
    candidateName: "Pooja Pandey",
    role: "PGT English Faculty",
    joinedDate: "15 Jul 2026",
    status: "Active on Campus",
    wing: "Senior Secondary",
  },
  {
    id: "plc_2",
    candidateName: "Amitabh Srivastava",
    role: "TGT Mathematics",
    joinedDate: "01 Aug 2026",
    status: "Active on Campus",
    wing: "Secondary",
  },
  {
    id: "plc_3",
    candidateName: "Kavita Singh",
    role: "PRT Primary Foundational",
    joinedDate: "20 Aug 2026",
    status: "Active on Campus",
    wing: "Primary",
  },
];

export default function SchoolPlacementsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h1 className="font-serif text-2xl font-bold text-[#14264D]">Institution Placement History</h1>
        <p className="mt-1 text-xs text-[#687487]">
          Verified record of teachers successfully recruited and appointed through the Career Avsar platform.
        </p>
      </div>

      <div className="grid gap-4">
        {DUMMY_PLACEMENTS.map((p) => (
          <Card key={p.id} className="p-5 border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-[#14264D]">{p.candidateName}</span>
                  <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-bold text-success flex items-center gap-1">
                    <CheckCircle2 className="size-3" />
                    {p.status}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#1266C5] mt-0.5">{p.role}</p>
                <p className="text-xs text-[#687487] mt-1">Wing: {p.wing} &bull; Joining Date: {p.joinedDate}</p>
              </div>

              <div className="text-xs font-semibold text-muted bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                Official Placement Record Verified
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
