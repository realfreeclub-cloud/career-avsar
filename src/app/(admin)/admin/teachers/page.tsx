"use client";
import * as React from "react";
import Link from "next/link";
import { AdminPage, DataTable, Pager, Button, Input, StatusPill, Card, CardHeader, CardTitle } from "@/components/admin/ui";
import { Drawer } from "@/components/ui/drawer";
import { apiFetch } from "@/lib/api/client";
import type { Paged, TeacherListItem } from "@/types/admin";

export default function AdminTeachersPage() {
  const [q, setQ] = React.useState(""); const [state, setState] = React.useState(""); const [verificationStatus, setVerificationStatus] = React.useState(""); const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<Paged<TeacherListItem> | null>(null); const [loading, setLoading] = React.useState(true); const [error, setError] = React.useState<string | null>(null);
  const [detail, setDetail] = React.useState<Record<string, unknown> | null>(null); const [detailOpen, setDetailOpen] = React.useState(false); const [note, setNote] = React.useState("");
  const url = `/api/admin/teachers?page=${page}&limit=20${q?`&q=${encodeURIComponent(q)}`:""}${state?`&state=${encodeURIComponent(state)}`:""}${verificationStatus?`&verificationStatus=${encodeURIComponent(verificationStatus)}`:""}`;
  const load = React.useCallback(async () => { setLoading(true); setError(null); const res = await apiFetch<Paged<TeacherListItem>>(url); if (!res.ok) setError(res.error.message); else setData(res.data); setLoading(false); }, [url]);
  React.useEffect(() => { load(); }, [load]);
  async function openDetail(id: string) { setDetailOpen(true); setDetail(null); const res = await apiFetch<Record<string, unknown>>(`/api/admin/teachers/${id}`); if (res.ok) setDetail(res.data); }
  async function doAction(action: string, payload: Record<string, unknown>) { if (!detail?.id) return; const res = await apiFetch(`/api/admin/teachers/${detail.id}`, { method: "PATCH", body: JSON.stringify({ action, ...payload }) }); if (res.ok) { openDetail(String(detail.id)); load(); } }
  return (
    <AdminPage title="Teachers" subtitle="Search, verify, review, and manage teacher profiles. Private documents and notes remain admin-only." actions={<Button asChildLink href={`/api/admin/teachers?format=csv${q?`&q=${encodeURIComponent(q)}`:""}`} variant="secondary" size="sm">Export CSV</Button>}>
      <Card><div className="grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-4">
        <Input label="Search" placeholder="Name, email, mobile" value={q} onChange={(e)=>{setQ(e.target.value); setPage(1);}} />
        <Input label="State" placeholder="e.g. Uttar Pradesh" value={state} onChange={(e)=>{setState(e.target.value); setPage(1);}} />
        <label className="grid gap-1.5"><span className="text-sm font-medium text-primary">Verification</span><select className="touch-target w-full rounded-lg border border-border bg-white px-3 text-text shadow-sm focus:border-accent" value={verificationStatus} onChange={(e)=>{setVerificationStatus(e.target.value); setPage(1);}}><option value="">All</option><option value="unverified">Unverified</option><option value="pending">Pending</option><option value="verified">Verified</option><option value="rejected">Rejected</option></select></label>
        <div className="flex items-end"><Button variant="secondary" fullWidth onClick={()=>{setQ("");setState("");setVerificationStatus("");setPage(1);}}>Clear filters</Button></div>
      </div></Card>
      <DataTable<TeacherListItem> loading={loading} error={error} onRetry={load} rows={data?.items || []} rowKey={(r)=>r.id} emptyTitle="No teachers found" emptyDesc="Try adjusting filters or wait for teacher registrations." renderMobile={(r)=><button className="w-full text-left" onClick={()=>openDetail(r.id)}><p className="font-medium text-text">{r.fullName}</p><p className="text-xs text-muted">{r.mobile} · {[r.district,r.state].filter(Boolean).join(", ")}</p><div className="mt-2 flex items-center justify-between"><span className="text-xs text-muted">{r.subjects.slice(0,2).join(", ") || "No subjects"}</span><StatusPill status={r.verificationStatus} /></div></button>} cols={[
        { key:"name", label:"Teacher", render:(r)=><button className="text-left" onClick={()=>openDetail(r.id)}><span className="font-medium text-accent hover:underline">{r.fullName}</span><span className="block text-xs text-muted">{r.email}</span></button> },
        { key:"contact", label:"Contact", render:(r)=><span className="text-xs">{r.mobile}<span className="block text-muted">{[r.district,r.state].filter(Boolean).join(", ")}</span></span> },
        { key:"qual", label:"Qualification/Exp", render:(r)=><span className="text-xs">{r.highestQualification || "—"}<span className="block text-muted">{r.experienceYears != null ? `${r.experienceYears} yrs` : "—"}</span></span> },
        { key:"tags", label:"CTET/UPTET", render:(r)=><span className="text-xs">{r.ctet?"CTET ":""}{r.uptet?"UPTET":""}{!r.ctet&&!r.uptet?"—":""}</span> },
        { key:"ver", label:"Verification", render:(r)=><StatusPill status={r.verificationStatus} /> },
      ]} />
      {data ? <Pager page={data.page.page} totalPages={data.page.totalPages} onPage={setPage} /> : null}
      <Drawer open={detailOpen} onClose={()=>setDetailOpen(false)} title={String(detail?.fullName || "Teacher details")} side="right">
        {!detail ? <p className="text-sm text-muted">Loading...</p> : <div className="space-y-4 pb-6 text-sm">
          <div className="flex flex-wrap gap-2"><StatusPill status={String(detail.verificationStatus||"unverified")} /><Button size="sm" onClick={()=>doAction("verify",{status:"verified"})}>Verify</Button><Button size="sm" variant="secondary" onClick={()=>doAction("verify",{status:"rejected"})}>Reject</Button><Button size="sm" variant="ghost" onClick={()=>doAction("verify",{status:"pending"})}>Mark pending</Button></div>
          <Card className="p-3"><p><span className="text-muted">Email:</span> {String(detail.email||"—")}</p><p><span className="text-muted">Mobile:</span> {String(detail.mobile||"—")}</p><p><span className="text-muted">Location:</span> {[detail.city,detail.district,detail.state].filter(Boolean).join(", ") || "—"}</p><p><span className="text-muted">Subjects:</span> {Array.isArray(detail.subjects)?detail.subjects.join(", "):"—"}</p><p><span className="text-muted">Expected salary:</span> {detail.expectedSalaryInr ? `₹${detail.expectedSalaryInr}` : "—"}</p></Card>
          <Card className="p-3"><CardHeader className="mb-2 p-0"><CardTitle className="text-base">Documents (admin-only)</CardTitle></CardHeader>{Array.isArray(detail.documents) && detail.documents.length ? <ul className="space-y-1">{(detail.documents as Array<Record<string,unknown>>).map((d)=><li key={String(d.id)} className="flex items-center justify-between gap-2"><span className="truncate">{String(d.originalName||d.kind)}</span><Link className="text-xs text-accent hover:underline" href={`/api/teacher/documents/${String(d.id)}/download`} target="_blank">Owner link</Link></li>)}</ul> : <p className="text-muted">No documents uploaded.</p>}</Card>
          <Card className="p-4"><CardHeader className="mb-2 p-0"><CardTitle className="text-base">Internal notes</CardTitle></CardHeader><label className="grid gap-1.5"><span className="text-muted">Add note</span><textarea className="min-h-20 w-full rounded-lg border border-border bg-white p-3 text-text shadow-sm focus:border-accent" value={note} onChange={(e)=>setNote(e.target.value)} /></label><div className="mt-2"><Button size="sm" onClick={()=>{ if(note.trim()) { doAction("note",{note}); setNote(""); } }}>Save note</Button></div>{Array.isArray(detail.adminNotes) && detail.adminNotes.length ? <ul className="mt-3 space-y-2">{(detail.adminNotes as Array<Record<string,unknown>>).map((n)=><li key={String(n.id)} className="rounded-lg border border-border bg-[#FAF9F5] p-2.5"><p className="text-text">{String(n.body)}</p><p className="mt-1 text-[11px] text-muted">{n.createdAt ? new Date(String(n.createdAt)).toLocaleString("en-IN") : ""}</p></li>)}</ul> : null}</Card>
        </div>}
      </Drawer>
    </AdminPage>
  );
}
