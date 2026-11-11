"use client";

import * as React from "react";
import { Save, ShieldCheck } from "lucide-react";
import { Card, Input, Button, useToast } from "@/components/ui";
import { ACTIVE_REGIONAL_DISTRICTS } from "@/data/india-locations";

export default function SchoolProfilePage() {
  const { push } = useToast();
  const [name, setName] = React.useState("Delhi Public School");
  const [board, setBoard] = React.useState("CBSE");
  const [district, setDistrict] = React.useState("Prayagraj");
  const [city, setCity] = React.useState("Civil Lines");
  const [email, setEmail] = React.useState("principal@dpsprayagraj.edu.in");
  const [phone, setPhone] = React.useState("+91 94150 12345");
  const [website, setWebsite] = React.useState("https://dpsprayagraj.edu.in");
  const [saving, setSaving] = React.useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      push({ tone: "success", title: "Profile Saved", message: "Institution profile updated successfully." });
    }, 600);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#1266C5] w-fit">
          <ShieldCheck className="size-3.5" />
          <span>Verified School Profile</span>
        </div>
        <h1 className="mt-3 font-serif text-2xl font-bold text-[#14264D]">Institution Details</h1>
        <p className="mt-1 text-xs text-[#687487]">
          Keep your campus information, accreditation board, and administrative contact channels current.
        </p>
      </div>

      <Card className="p-6 sm:p-8 border-slate-200">
        <form onSubmit={handleSave} className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Institution / School Name *"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-[#14264D] mb-1.5">Affiliation Board *</label>
            <select
              value={board}
              onChange={(e) => setBoard(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#14264D] focus:border-[#1266C5] focus:outline-none"
            >
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="UP Board">UP State Board</option>
              <option value="IB">IB</option>
              <option value="Cambridge">Cambridge / IGCSE</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#14264D] mb-1.5">District (Active UP Regions) *</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#14264D] focus:border-[#1266C5] focus:outline-none"
            >
              {ACTIVE_REGIONAL_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <Input
            label="City / Town *"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <Input
            label="Official School Email *"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Contact Phone / WhatsApp *"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <div className="sm:col-span-2">
            <Input
              label="Website URL"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourschool.edu.in"
            />
          </div>

          <div className="sm:col-span-2 pt-2">
            <Button type="submit" size="md" disabled={saving} className="bg-[#1266C5] text-white hover:bg-[#087FE8]">
              <Save className="mr-1.5 size-4" />
              <span>{saving ? "Saving…" : "Save Changes"}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
