"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { Card, Button, useToast } from "@/components/ui";

export default function SchoolFeedbackPage() {
  const { push } = useToast();
  const [candidate, setCandidate] = React.useState("Rajesh Tiwari (TGT Science)");
  const [rating, setRating] = React.useState("5");
  const [recommendation, setRecommendation] = React.useState("strongly_recommend");
  const [comments, setComments] = React.useState("Excellent grasp of Physics pedagogy. Engaged students actively during demo class. Recommended for final appointment.");
  const [submitting, setSubmitting] = React.useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      push({
        tone: "success",
        title: "Feedback Recorded",
        message: "Your evaluation has been forwarded to the Career Avsar placement desk.",
      });
    }, 600);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h1 className="font-serif text-2xl font-bold text-[#14264D]">Candidate Demonstration Feedback</h1>
        <p className="mt-1 text-xs text-[#687487]">
          Submit post-demonstration evaluation scores and hiring recommendations for interviewed educators.
        </p>
      </div>

      <Card className="max-w-2xl p-6 sm:p-8 border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#14264D] mb-1">Evaluated Candidate *</label>
            <input
              type="text"
              value={candidate}
              onChange={(e) => setCandidate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#14264D]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#14264D] mb-1">Pedagogy Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#14264D]"
              >
                <option value="5">⭐⭐⭐⭐⭐ Excellent (5/5)</option>
                <option value="4">⭐⭐⭐⭐ Very Good (4/5)</option>
                <option value="3">⭐⭐⭐ Satisfactory (3/5)</option>
                <option value="2">⭐⭐ Needs Improvement (2/5)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14264D] mb-1">Hiring Recommendation</label>
              <select
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#14264D]"
              >
                <option value="strongly_recommend">Strongly Recommend for Appointment</option>
                <option value="consider">Consider as Backup</option>
                <option value="not_recommended">Not Suitable for Current Role</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#14264D] mb-1">Detailed Committee Feedback &amp; Observations</label>
            <textarea
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#14264D]"
              placeholder="Highlight subject clarity, classroom management, student rapport, and language fluency..."
              required
            />
          </div>

          <Button type="submit" size="md" disabled={submitting} className="bg-[#1266C5] text-white hover:bg-[#087FE8]">
            <Send className="mr-2 size-4 text-[#F28B19]" />
            <span>{submitting ? "Submitting…" : "Submit Evaluation"}</span>
          </Button>
        </form>
      </Card>
    </div>
  );
}
