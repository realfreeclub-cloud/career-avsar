"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { Card, Button } from "@/components/ui";

const DUMMY_VACANCIES = [
  {
    id: "vac_1",
    title: "Senior PGT Mathematics Teacher",
    category: "PGT",
    subject: "Mathematics",
    board: "CBSE",
    salary: "₹30,000 - ₹45,000 / month",
    status: "Published",
    applicantsCount: 4,
    deadline: "30 Nov 2026",
  },
  {
    id: "vac_2",
    title: "TGT Science Specialist (Physics & Chemistry)",
    category: "TGT",
    subject: "Science",
    board: "ICSE",
    salary: "₹25,000 - ₹35,000 / month",
    status: "Published",
    applicantsCount: 5,
    deadline: "25 Nov 2026",
  },
  {
    id: "vac_3",
    title: "PRT Primary English Educator",
    category: "PRT",
    subject: "English",
    board: "CBSE",
    salary: "₹20,000 - ₹28,000 / month",
    status: "Under Review",
    applicantsCount: 0,
    deadline: "Pending Approval",
  },
];

export default function SchoolVacanciesPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#14264D]">My Institutional Vacancies</h1>
          <p className="mt-1 text-xs text-[#687487]">
            Monitor active openings, review candidate counts, and submit new teacher requirements.
          </p>
        </div>
        <Button asChildLink href="/school/vacancies/request" size="md" className="bg-[#1266C5] text-white hover:bg-[#087FE8]">
          <Plus className="mr-1.5 size-4" />
          <span>New Vacancy Request</span>
        </Button>
      </div>

      <div className="space-y-4">
        {DUMMY_VACANCIES.map((v) => (
          <Card key={v.id} className="p-5 border-slate-200 hover:border-[#1266C5] transition">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-base text-[#14264D]">{v.title}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      v.status === "Published"
                        ? "bg-green-50 text-success"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {v.status}
                  </span>
                </div>
                <p className="text-xs text-[#687487] mt-1">
                  {v.category} &bull; {v.subject} &bull; {v.board} Board &bull; {v.salary}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/school/candidates?vacancy=${v.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#1266C5] hover:bg-blue-100 transition"
                >
                  <Users className="size-3.5" />
                  <span>{v.applicantsCount} Shared Candidates</span>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
