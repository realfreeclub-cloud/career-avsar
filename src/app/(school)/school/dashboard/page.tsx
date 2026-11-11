"use client";

import * as React from "react";
import Link from "next/link";
import {
  Briefcase,
  Users,
  CalendarDays,
  FilePlus,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Card, Button } from "@/components/ui";

export default function SchoolDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-blue-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#1266C5]">
              <ShieldCheck className="size-3.5" />
              <span>Verified Institution Dashboard</span>
            </div>
            <h1 className="mt-2.5 font-serif text-2xl font-bold tracking-tight text-[#14264D] sm:text-3xl">
              School Recruitment Overview
            </h1>
            <p className="mt-1 text-xs text-[#687487]">
              Manage teaching vacancies, review admin-shared educator profiles, and schedule demonstration lectures.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Button asChildLink href="/school/vacancies/request" size="md" className="bg-[#1266C5] text-white hover:bg-[#087FE8]">
              <FilePlus className="mr-1.5 size-4" />
              <span>Submit Vacancy Request</span>
            </Button>
            <Button asChildLink href="/school/candidates" variant="outline" size="md" className="border-slate-300">
              <Users className="mr-1.5 size-4 text-[#1266C5]" />
              <span>Review Candidates</span>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#687487]">Active Vacancies</span>
            <span className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-[#1266C5]">
              <Briefcase className="size-4" />
            </span>
          </div>
          <p className="mt-3 font-serif text-2xl font-bold text-[#14264D]">3</p>
          <p className="mt-1 text-[11px] text-[#687487]">Approved and hiring across wings</p>
        </Card>

        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#687487]">Shared Candidates</span>
            <span className="flex size-8 items-center justify-center rounded-lg bg-purple-50 text-[#7024BD]">
              <Users className="size-4" />
            </span>
          </div>
          <p className="mt-3 font-serif text-2xl font-bold text-[#14264D]">8</p>
          <p className="mt-1 text-[11px] text-[#687487]">Pre-screened educator dossiers</p>
        </Card>

        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#687487]">Interviews Scheduled</span>
            <span className="flex size-8 items-center justify-center rounded-lg bg-orange-50 text-[#F28B19]">
              <CalendarDays className="size-4" />
            </span>
          </div>
          <p className="mt-3 font-serif text-2xl font-bold text-[#14264D]">2</p>
          <p className="mt-1 text-[11px] text-[#687487]">Demonstration lectures this week</p>
        </Card>

        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#687487]">Total Placements</span>
            <span className="flex size-8 items-center justify-center rounded-lg bg-green-50 text-success">
              <CheckCircle2 className="size-4" />
            </span>
          </div>
          <p className="mt-3 font-serif text-2xl font-bold text-[#14264D]">5</p>
          <p className="mt-1 text-[11px] text-[#687487]">Confirmed faculty onboardings</p>
        </Card>
      </div>

      {/* Main Grid: Shared Candidates & Vacancy Requests */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Candidates Shared by Admin */}
        <Card className="p-6 border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-serif text-base font-bold text-[#14264D]">Recently Shared Candidates</h2>
              <p className="text-xs text-[#687487]">Vetted educator dossiers forwarded by Career Avsar</p>
            </div>
            <Link href="/school/candidates" className="text-xs font-semibold text-[#1266C5] hover:underline">
              View All
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50 transition">
              <div>
                <p className="font-semibold text-sm text-[#14264D]">Ananya Verma</p>
                <p className="text-xs text-[#687487]">PGT Mathematics &bull; M.Sc, B.Ed, CTET &bull; 4 Yrs Exp</p>
              </div>
              <Button asChildLink href="/school/candidates" size="sm" variant="outline" className="text-xs">
                Review Dossier
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50 transition">
              <div>
                <p className="font-semibold text-sm text-[#14264D]">Rajesh Tiwari</p>
                <p className="text-xs text-[#687487]">TGT Science &bull; B.Sc, B.Ed, UPTET &bull; 6 Yrs Exp</p>
              </div>
              <Button asChildLink href="/school/candidates" size="sm" variant="outline" className="text-xs">
                Review Dossier
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50 transition">
              <div>
                <p className="font-semibold text-sm text-[#14264D]">Sunita Mishra</p>
                <p className="text-xs text-[#687487]">PRT English &bull; B.A. (Hons), B.Ed &bull; 3 Yrs Exp</p>
              </div>
              <Button asChildLink href="/school/candidates" size="sm" variant="outline" className="text-xs">
                Review Dossier
              </Button>
            </div>
          </div>
        </Card>

        {/* Current Vacancies & Requests */}
        <Card className="p-6 border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-serif text-base font-bold text-[#14264D]">Active Institutional Vacancies</h2>
              <p className="text-xs text-[#687487]">Published vacancies managed under Career Avsar</p>
            </div>
            <Link href="/school/vacancies" className="text-xs font-semibold text-[#1266C5] hover:underline">
              Manage
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-slate-100 p-3 hover:bg-slate-50 transition">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-[#14264D]">PGT Mathematics Faculty</span>
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-success">
                  Published
                </span>
              </div>
              <p className="text-xs text-[#687487] mt-1">Senior Secondary Wing (11–12) &bull; CBSE Board</p>
              <div className="mt-2 flex items-center justify-between text-xs text-muted">
                <span>3 Shared Applicants</span>
                <Link href="/school/candidates" className="text-[#1266C5] font-semibold hover:underline">
                  View Dossiers →
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 p-3 hover:bg-slate-50 transition">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-[#14264D]">TGT Science Specialist</span>
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-success">
                  Published
                </span>
              </div>
              <p className="text-xs text-[#687487] mt-1">Secondary Wing (9–10) &bull; ICSE Board</p>
              <div className="mt-2 flex items-center justify-between text-xs text-muted">
                <span>4 Shared Applicants</span>
                <Link href="/school/candidates" className="text-[#1266C5] font-semibold hover:underline">
                  View Dossiers →
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
