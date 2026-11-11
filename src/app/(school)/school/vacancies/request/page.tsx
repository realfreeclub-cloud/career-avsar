"use client";

import * as React from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { Card, Input, Button, useToast } from "@/components/ui";

export default function VacancyRequestPage() {
  const { push } = useToast();
  const [jobTitle, setJobTitle] = React.useState("");
  const [category, setCategory] = React.useState("TGT");
  const [subject, setSubject] = React.useState("Mathematics");
  const [vacanciesCount, setVacanciesCount] = React.useState("1");
  const [minExp, setMinExp] = React.useState("2");
  const [qualification, setQualification] = React.useState("B.Ed with relevant graduation/post-graduation");
  const [salaryRange, setSalaryRange] = React.useState("₹25,000 - ₹35,000 / month");
  const [description, setDescription] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      push({
        tone: "success",
        title: "Requirement Submitted",
        message: "Your vacancy request has been dispatched to the Career Avsar recruitment desk.",
      });
    }, 700);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h1 className="font-serif text-2xl font-bold text-[#14264D]">Submit Faculty Requirement</h1>
        <p className="mt-1 text-xs text-[#687487]">
          Share your hiring requirements with Career Avsar administrators. Our coordinators will review, authenticate, and publish the opening to source verified educators.
        </p>
      </div>

      {submitted ? (
        <Card className="p-8 text-center border-slate-200 space-y-4">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-green-50 text-success">
            <CheckCircle2 className="size-8" />
          </span>
          <h2 className="font-serif text-xl font-bold text-[#14264D]">Vacancy Request Received</h2>
          <p className="text-xs text-[#687487] max-w-md mx-auto">
            Your request for <strong>{jobTitle}</strong> ({category} {subject}) has been logged. Our academic coordinator will contact you to confirm candidate screening criteria and begin forwarding pre-vetted dossiers.
          </p>
          <div className="pt-2">
            <Button size="md" className="bg-[#1266C5] text-white" onClick={() => setSubmitted(false)}>
              Submit Another Request
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-6 sm:p-8 border-slate-200">
          <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Position Title *"
              required
              placeholder="e.g. Senior Secondary PGT Mathematics Teacher"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold text-[#14264D] mb-1.5">Grade Wing / Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#14264D] focus:border-[#1266C5] focus:outline-none"
              >
                <option value="PGT">PGT (Class 11–12)</option>
                <option value="TGT">TGT (Class 9–10)</option>
                <option value="PRT">PRT (Class 1–5)</option>
                <option value="Pre-Primary">Pre-Primary / Nursery</option>
                <option value="Principal">Principal / Vice-Principal</option>
                <option value="Special Educator">Special Educator</option>
                <option value="Other">Other Faculty</option>
              </select>
            </div>

            <Input
              label="Subject Specialization *"
              required
              placeholder="e.g. Mathematics, Physics, English"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />

            <Input
              label="Number of Vacancies *"
              type="number"
              min="1"
              required
              value={vacanciesCount}
              onChange={(e) => setVacanciesCount(e.target.value)}
            />

            <Input
              label="Minimum Experience (Years)"
              type="number"
              min="0"
              value={minExp}
              onChange={(e) => setMinExp(e.target.value)}
            />

            <Input
              label="Offered Monthly Salary Range (₹)"
              placeholder="e.g. ₹25,000 - ₹35,000"
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
            />

            <div className="sm:col-span-2">
              <Input
                label="Required Qualifications"
                placeholder="e.g. M.Sc (Mathematics), B.Ed, CTET Paper 2 qualified"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#14264D] mb-1.5">Job Responsibilities &amp; Preferences</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe curriculum expectations, communication proficiency, or campus accommodation details..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#14264D] focus:border-[#1266C5] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 flex items-center justify-between border-t border-slate-100 pt-4">
              <p className="text-xs text-muted">
                Admin will review and authenticate vacancy before publishing publicly.
              </p>
              <Button type="submit" size="lg" disabled={submitting} className="bg-[#1266C5] text-white hover:bg-[#087FE8]">
                <Send className="mr-2 size-4 text-[#F28B19]" />
                <span>{submitting ? "Submitting…" : "Submit Vacancy Request"}</span>
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
