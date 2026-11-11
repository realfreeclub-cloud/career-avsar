"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { ACTIVE_REGIONAL_DISTRICTS } from "@/data/india-locations";

const DEFAULT_DISTRICTS: string[] = [...ACTIVE_REGIONAL_DISTRICTS];

const subjects = [
  "Mathematics",
  "Science",
  "English",
  "Social Studies",
  "Hindi",
  "Computer Teacher",
  "Physics",
  "Chemistry",
  "Biology",
  "Commerce",
  "Economics",
  "Physical Education",
  "Art",
  "Music",
].map((s) => ({ value: s, label: s }));

export function HeroJobSearch() {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const [district, setDistrict] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [districtOptions, setDistrictOptions] = React.useState<Array<{ value: string; label: string }>>(
    DEFAULT_DISTRICTS.map((d) => ({ value: d, label: `Teaching in ${d}` })),
  );

  React.useEffect(() => {
    fetch("/api/public/locations")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok && Array.isArray(j.data?.items) && j.data.items.length > 0) {
          setDistrictOptions(
            j.data.items.map((loc: { district: string }) => ({
              value: loc.district,
              label: `Teaching in ${loc.district}`,
            })),
          );
        }
      })
      .catch(() => {});
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (district) params.set("district", district);
    if (subject) params.set("subject", subject);
    const qs = params.toString();
    router.push(qs ? `/jobs?${qs}` : "/jobs");
  }

  return (
    <div className="relative rounded-2xl border border-border bg-white/92 p-5 shadow-[0_12px_36px_-8px_rgba(20,35,59,0.08),0_2px_6px_rgba(20,35,59,0.03)] backdrop-blur-md sm:p-6 lg:p-7">
      <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
        <div>
          <h2 className="font-serif text-base font-semibold text-primary sm:text-lg">
            Find Regional Teaching Opportunities
          </h2>
          <p className="text-xs text-muted">
            Search verified positions across CBSE, ICSE, UP Board &amp; private institutions in Uttar Pradesh
          </p>
        </div>
        <span className="hidden items-center gap-1 rounded-full bg-soft-blue px-2.5 py-1 text-xs font-semibold text-secondary sm:inline-flex border border-[#D5DFEB]">
          UP Launch Network
        </span>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-1">
            <Input
              name="q"
              label="Job Title or Keyword"
              placeholder="e.g. PGT English, TGT Maths, PRT"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div>
            <Select
              name="district"
              label="Select District"
              placeholder="All Service Districts"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              options={[{ value: "", label: "All Service Districts" }, ...districtOptions]}
            />
          </div>
          <div>
            <Select
              name="subject"
              label="Select Subject"
              placeholder="All Subjects"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              options={[{ value: "", label: "All Subjects" }, ...subjects]}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="font-medium text-primary">Popular searches:</span>
            {["PGT Maths", "TGT English", "Prayagraj", "Jaunpur", "Pratapgarh", "Science"].map((keyword) => (
              <button
                key={keyword}
                type="button"
                onClick={() => {
                  if (DEFAULT_DISTRICTS.includes(keyword)) {
                    setDistrict(keyword);
                  } else {
                    setQ(keyword);
                  }
                }}
                className="rounded-md bg-warm-ivory px-2 py-0.5 text-xs text-muted border border-border hover:border-accent hover:text-primary transition"
              >
                {keyword}
              </button>
            ))}
          </div>

          <Button
            type="submit"
            className="w-full bg-primary font-medium text-white shadow-sm hover:bg-secondary sm:w-auto"
          >
            <Search className="size-4 text-accent-gold" />
            <span>Search Jobs</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
