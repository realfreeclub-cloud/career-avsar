"use client";

import * as React from "react";
import { CalendarDays, MapPin, Video } from "lucide-react";
import { Card, Button, useToast } from "@/components/ui";

const DUMMY_INTERVIEWS = [
  {
    id: "int_1",
    candidateName: "Rajesh Tiwari",
    vacancy: "TGT Science Specialist",
    date: "14 Nov 2026",
    time: "10:30 AM",
    mode: "In-Person Campus Demo",
    venue: "Main Science Laboratory, Block B",
    status: "Confirmed",
  },
  {
    id: "int_2",
    candidateName: "Ananya Verma",
    vacancy: "Senior PGT Mathematics Teacher",
    date: "17 Nov 2026",
    time: "02:00 PM",
    mode: "Virtual Interview & Presentation",
    venue: "Google Meet Link (Coordinates shared with Admin)",
    status: "Scheduled",
  },
];

export default function SchoolInterviewsPage() {
  const { push } = useToast();
  const [candidate, setCandidate] = React.useState("Ananya Verma");
  const [date, setDate] = React.useState("2026-11-20");
  const [time, setTime] = React.useState("11:00");
  const [mode, setMode] = React.useState("in_person");
  const [instructions, setInstructions] = React.useState("Demo lecture on Calculus: Limits & Continuity (Class 11). Duration: 25 minutes.");

  function handleSchedule(e: React.FormEvent) {
    e.preventDefault();
    push({
      tone: "success",
      title: "Interview Slot Suggested",
      message: "Your suggested demonstration schedule has been submitted to the Admin coordinator.",
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h1 className="font-serif text-2xl font-bold text-[#14264D]">Interview &amp; Demonstration Management</h1>
        <p className="mt-1 text-xs text-[#687487]">
          Coordinate demonstration lectures, suggest preferred interview slots, and review upcoming educator evaluations.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Upcoming List */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="font-serif text-lg font-bold text-[#14264D]">Scheduled Demonstrations</h2>
          {DUMMY_INTERVIEWS.map((it) => (
            <Card key={it.id} className="p-5 border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <span className="font-bold text-sm text-[#14264D]">{it.candidateName}</span>
                  <p className="text-xs text-[#1266C5]">{it.vacancy}</p>
                </div>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-[#1266C5]">
                  {it.status}
                </span>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-[#687487] sm:grid-cols-2">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="size-3.5 text-[#F28B19]" />
                  <span>{it.date} at {it.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {it.mode.includes("Virtual") ? <Video className="size-3.5 text-[#1266C5]" /> : <MapPin className="size-3.5 text-success" />}
                  <span>{it.mode}</span>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-muted border-t border-slate-50 pt-2">
                Venue / Details: {it.venue}
              </p>
            </Card>
          ))}
        </div>

        {/* Suggest Interview Slot Form */}
        <div className="lg:col-span-5">
          <Card className="p-5 border-slate-200">
            <h3 className="font-serif text-base font-bold text-[#14264D]">Suggest Interview Slot</h3>
            <p className="mt-1 text-xs text-muted">Submit available dates for candidate demonstration</p>

            <form onSubmit={handleSchedule} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#14264D] mb-1">Candidate</label>
                <input
                  type="text"
                  value={candidate}
                  onChange={(e) => setCandidate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-[#14264D]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#14264D] mb-1">Proposed Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-[#14264D]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#14264D] mb-1">Proposed Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-[#14264D]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#14264D] mb-1">Demonstration Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-[#14264D]"
                >
                  <option value="in_person">In-Person Campus Demonstration</option>
                  <option value="virtual">Virtual Online Demonstration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#14264D] mb-1">Demonstration Topic &amp; Instructions</label>
                <textarea
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-[#14264D]"
                />
              </div>

              <Button type="submit" size="md" className="w-full bg-[#1266C5] text-white">
                Submit Proposed Schedule
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
