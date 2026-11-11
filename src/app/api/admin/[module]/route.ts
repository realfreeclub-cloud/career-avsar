import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import { listAuditLogsAdmin, getSettingsAdmin, upsertSettingAdmin, createAdminNotification } from "@/server/services/admin/misc";
import { getAdminReports } from "@/server/services/admin/reports";
import { logAdminAction } from "@/server/services/admin/audit";
export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: Promise<{ module: string }> }) {
  try {
    const auth = await requireAdmin(); if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);
    const { module } = await ctx.params; const sp = new URL(req.url).searchParams;
    if (module === "audit-logs") return ok(await listAuditLogsAdmin({ entityType: sp.get("entityType")||undefined, action: sp.get("action")||undefined, page: Number(sp.get("page")||1), limit: Number(sp.get("limit")||30) }));
    if (module === "reports") return ok(await getAdminReports());
    if (module === "settings") return ok({ items: await getSettingsAdmin() });
    if (module === "shortlisted") { const { listApplicationsAdmin } = await import("@/server/services/admin/applications"); return ok(await listApplicationsAdmin({ status: "shortlisted", q: sp.get("q")||undefined, page: Number(sp.get("page")||1), limit: Number(sp.get("limit")||20) })); }
    if (module === "recruiters") return ok({ items: [], page: { page: 1, limit: 20, total: 0, totalPages: 1 }, note: "Recruiter contacts are managed via recruiter contact records; UI supports adding records when schools/jobs are linked." });
    if (module === "notifications") return ok({ sent: true, note: "Use POST to send notifications to a teacher." });
    if (module === "messages") return ok({ items: [], page: { page: 1, limit: 20, total: 0, totalPages: 1 } });
    return fail("NOT_FOUND", "Unknown admin module", 404);
  } catch (err) { return handleApiError(err); }
}

export async function POST(req: Request, ctx: { params: Promise<{ module: string }> }) {
  try {
    const auth = await requireAdmin(); if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);
    const { module } = await ctx.params; const body = await req.json().catch(()=>({}));
    if (module === "settings" && body?.key) { await upsertSettingAdmin(body.key, body.value); await logAdminAction({ actorUserId: auth.userId, action: "setting.upsert", entityType: "setting", summary: `Updated setting ${body.key}` }); return ok({ updated: true }); }
    if (module === "notifications" && body?.teacherUserId && body?.title) { const id = await createAdminNotification(body); await logAdminAction({ actorUserId: auth.userId, action: "notification.send", entityType: "notification", entityId: id, summary: `Sent notification to teacher` }); return ok({ id }, 201); }
    return fail("BAD_REQUEST", "Unsupported admin module action", 400);
  } catch (err) { return handleApiError(err); }
}
